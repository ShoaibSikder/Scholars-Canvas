import json
import logging
import os
import re
import zipfile
from pathlib import Path
from urllib import error as urllib_error
from urllib import request as urllib_request
from xml.etree import ElementTree

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
SUPPORTED_TEXT_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt", ".md", ".csv"}


def extract_document_text(file_path):
    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)
    if extension == ".docx":
        return extract_docx_text(file_path)
    if extension == ".pptx":
        return extract_pptx_text(file_path)
    if extension in {".txt", ".md", ".csv"}:
        return extract_plain_text(file_path)

    return ""


def extract_pdf_text(file_path):
    text_parts = []

    try:
        from pypdf import PdfReader

        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text.strip())
    except Exception as exc:
        logger.warning("Unable to extract PDF text from %s: %s", file_path, exc)

    return "\n\n".join(text_parts).strip()


def extract_plain_text(file_path):
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return Path(file_path).read_text(encoding=encoding).strip()
        except UnicodeDecodeError:
            continue
        except Exception as exc:
            logger.warning("Unable to extract plain text from %s: %s", file_path, exc)
            return ""

    return ""


def extract_docx_text(file_path):
    try:
        with zipfile.ZipFile(file_path) as archive:
            xml = archive.read("word/document.xml")
    except Exception as exc:
        logger.warning("Unable to read DOCX file %s: %s", file_path, exc)
        return ""

    return extract_openxml_text(xml)


def extract_pptx_text(file_path):
    text_parts = []

    try:
        with zipfile.ZipFile(file_path) as archive:
            slide_names = sorted(name for name in archive.namelist() if name.startswith("ppt/slides/slide") and name.endswith(".xml"))
            for slide_name in slide_names:
                text = extract_openxml_text(archive.read(slide_name))
                if text:
                    text_parts.append(text)
    except Exception as exc:
        logger.warning("Unable to read PPTX file %s: %s", file_path, exc)
        return ""

    return "\n\n".join(text_parts).strip()


def extract_openxml_text(xml_bytes):
    try:
        root = ElementTree.fromstring(xml_bytes)
    except ElementTree.ParseError:
        return ""

    text_parts = []
    for element in root.iter():
        if element.tag.endswith("}t") and element.text:
            text_parts.append(element.text.strip())

    return " ".join(part for part in text_parts if part).strip()


def split_text(text, chunk_size=1400, overlap=180):
    cleaned = (text or "").strip()
    if not cleaned:
        return []

    chunks = []
    start = 0
    text_length = len(cleaned)

    while start < text_length:
        end = min(text_length, start + chunk_size)
        chunks.append(cleaned[start:end])
        if end >= text_length:
            break
        start = max(0, end - overlap)

    return chunks


def select_relevant_chunks(chunks, query, limit=4):
    if not chunks:
        return []

    query_terms = {term for term in re.findall(r"[a-z0-9]+", (query or "").lower()) if len(term) > 2}
    scored_chunks = []

    for index, chunk in enumerate(chunks):
        lower_chunk = chunk.lower()
        score = sum(1 for term in query_terms if term in lower_chunk)
        scored_chunks.append((score, index, chunk))

    scored_chunks.sort(key=lambda item: (item[0], -item[1]), reverse=True)
    selected = [chunk for score, _, chunk in scored_chunks if score > 0][:limit]

    if selected:
        return selected

    return chunks[:limit]


def _split_sentences(text):
    return [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", text or "") if sentence.strip()]


def _clean_study_sentence(sentence):
    cleaned = re.sub(r"\s+", " ", sentence or "").strip(" -:;,.")
    cleaned = re.sub(r"https?://\S+|www\.\S+|[\w.+-]+@[\w-]+\.[\w.-]+", "", cleaned)
    cleaned = re.sub(r"\b\+?\d[\d\s-]{7,}\d\b", "", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip(" -:;,.")


def _candidate_study_sentences(text, limit=8):
    ignored_terms = {
        "github",
        "linkedin",
        "email",
        "phone",
        "contact",
        "resume",
        "curriculum vitae",
        "mobile",
        "address",
    }
    candidates = []

    for sentence in _split_sentences(text):
        cleaned = _clean_study_sentence(sentence)
        lower = cleaned.lower()
        words = re.findall(r"[A-Za-z][A-Za-z+-]*", cleaned)
        if len(words) < 8 or len(cleaned) < 55:
            continue
        if any(term in lower for term in ignored_terms):
            continue

        score = len(set(word.lower() for word in words))
        if any(term in lower for term in ("because", "therefore", "used", "system", "process", "method", "feature", "develop", "technology", "database", "api")):
            score += 10
        candidates.append((score, cleaned))

    candidates.sort(key=lambda item: item[0], reverse=True)
    unique = []
    seen = set()
    for _, sentence in candidates:
        key = sentence[:80].lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(sentence)
        if len(unique) >= limit:
            break

    if unique:
        return unique

    return [_clean_study_sentence(sentence) for sentence in _split_sentences(text)[:limit] if _clean_study_sentence(sentence)]


def _question_from_sentence(sentence, index, mode="short"):
    lower = sentence.lower()
    if "advantage" in lower or "benefit" in lower:
        return "Which benefit is most directly supported by the document?"
    if "database" in lower or "sql" in lower or "mongodb" in lower:
        return "Which database-related concept is emphasized in the document?"
    if "api" in lower or "backend" in lower or "frontend" in lower:
        return "Which statement best explains the system architecture described in the document?"
    if "feature" in lower or "functionality" in lower:
        return "Which feature is presented as important in the document?"
    if "problem" in lower or "challenge" in lower:
        return "Which problem or challenge is identified in the document?"
    if "project" in lower or "system" in lower:
        return "Which exam-style statement best summarizes the described system?"
    if mode == "mcq":
        return f"Which statement is best supported by the document excerpt in question {index + 1}?"
    return f"What key concept should be remembered from this section?"


def _distractors_for_sentence(sentence):
    return [
        "The document states that this topic is outside the project scope.",
        "The document argues that this idea is unnecessary for the system.",
        "The document presents this as an unrelated personal detail.",
    ]


def _fallback_summary(document):
    text = document.extracted_text or ""
    sentences = _split_sentences(text)
    if not sentences:
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    chunks = split_text(text, chunk_size=1800, overlap=0)[:5]
    return [
        {
            "section": f"Key point {index + 1}",
            "content": " ".join(_split_sentences(chunk)[:3])[:700] or chunk[:700],
        }
        for index, chunk in enumerate(chunks)
        if chunk.strip()
    ]


def _fallback_flashcards(document):
    text = document.extracted_text or ""
    sentences = _candidate_study_sentences(text, limit=5)
    if not sentences:
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    cards = []
    for index, sentence in enumerate(sentences[:5]):
        cards.append(
            {
                "id": index + 1,
                "question": _question_from_sentence(sentence, index),
                "answer": sentence[:320],
                "explanation": "This question was generated from a high-signal sentence in the document.",
            }
        )
    return cards


def _fallback_multiple_choice_quiz(document):
    text = document.extracted_text or ""
    sentences = _candidate_study_sentences(text, limit=5)
    if not sentences:
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    quiz_items = []
    for index, sentence in enumerate(sentences[:5]):
        correct = sentence[:180]
        options = [correct, *_distractors_for_sentence(sentence)]
        quiz_items.append(
            {
                "id": index + 1,
                "question": _question_from_sentence(sentence, index, mode="mcq"),
                "options": options,
                "answer": correct,
                "explanation": "The correct option is directly supported by the selected document text.",
            }
        )
    return quiz_items


def _fallback_answer(document, question, history=None):
    text = document.extracted_text or ""
    sentences = _split_sentences(text)
    if not sentences:
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    normalized_question = (question or "").lower()
    overview_terms = ("what does", "what is this", "what this", "about", "shows", "summarize", "summary", "overview")
    is_overview_question = any(term in normalized_question for term in overview_terms)

    if is_overview_question:
        name_match = re.search(r"\b(MD\.?\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,3}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b", text)
        email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
        phone_match = re.search(r"(?:\+?\d[\d\s-]{8,}\d)", text)
        education_match = re.search(r"(education.*?)(?=skills|projects|experience|$)", text, flags=re.IGNORECASE | re.DOTALL)
        skills_match = re.search(r"(skills.*?)(?=projects|experience|education|about me|$)", text, flags=re.IGNORECASE | re.DOTALL)

        bullets = []
        if name_match:
            bullets.append(f"It appears to be a resume/CV for {name_match.group(0).strip()}.")
        else:
            bullets.append(f"It appears to be a document titled “{document.title}”.")
        if education_match:
            bullets.append(f"Education: {' '.join(education_match.group(1).split())[:220]}.")
        if skills_match:
            bullets.append(f"Skills/keywords: {' '.join(skills_match.group(1).split())[:220]}.")
        if email_match or phone_match:
            contact = ", ".join(value for value in [email_match.group(0) if email_match else "", phone_match.group(0).strip() if phone_match else ""] if value)
            bullets.append(f"Contact info found: {contact}.")

        return "I can answer locally from the extracted text. Quick overview:\n\n" + "\n".join(f"- {bullet}" for bullet in bullets[:5])

    chunks = split_text(text)
    context_chunks = select_relevant_chunks(chunks, question, limit=3)
    context_sentences = []
    for chunk in context_chunks:
      context_sentences.extend(_split_sentences(chunk))

    concise_context = " ".join(context_sentences[:5]).strip()
    if not concise_context:
        concise_context = " ".join(sentences[:5]).strip()

    return (
        "I can answer locally from the extracted document text. Based on the closest matching content:\n\n"
        f"{concise_context[:900]}"
    )


def _clean_json_text(text):
    if not text:
        return text

    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

    start = cleaned.find("[")
    start_object = cleaned.find("{")
    if start == -1 or (start_object != -1 and start_object < start):
        start = start_object

    if start != -1:
        end = cleaned.rfind("]") if cleaned[start] == "[" else cleaned.rfind("}")
        if end != -1 and end > start:
            cleaned = cleaned[start : end + 1]

    return cleaned


class CloudAIService:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.groq_key = os.getenv("GROQ_API_KEY", "").strip()

    def _post_json(self, url, payload, headers=None, timeout=90):
        data = json.dumps(payload).encode("utf-8")
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)

        req = urllib_request.Request(url, data=data, headers=request_headers, method="POST")

        try:
            with urllib_request.urlopen(req, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib_error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"AI provider returned HTTP {exc.code}: {error_body[:400]}") from exc
        except urllib_error.URLError as exc:
            raise RuntimeError(f"Unable to reach AI provider: {exc.reason}") from exc

    def _call_gemini(self, prompt, system_prompt=None, json_mode=False, temperature=0.2):
        if not self.gemini_key:
            raise RuntimeError("Gemini API key is not configured.")

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": {
                "temperature": temperature,
            },
        }

        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.gemini_key}"
        response = self._post_json(endpoint, payload)

        candidates = response.get("candidates") or []
        if not candidates:
            raise RuntimeError("Gemini returned an empty response.")

        content = candidates[0].get("content", {})
        parts = content.get("parts") or []
        text = "".join(part.get("text", "") for part in parts)
        if not text:
            raise RuntimeError("Gemini response did not contain text.")

        return text.strip()

    def _call_groq(self, prompt, system_prompt=None, json_mode=False, temperature=0.2):
        if not self.groq_key:
            raise RuntimeError("Groq API key is not configured.")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": GROQ_MODEL,
            "messages": messages,
            "temperature": temperature,
        }

        endpoint = "https://api.groq.com/openai/v1/chat/completions"
        response = self._post_json(endpoint, payload, headers={"Authorization": f"Bearer {self.groq_key}"})

        choices = response.get("choices") or []
        if not choices:
            raise RuntimeError("Groq returned an empty response.")

        message = choices[0].get("message", {})
        text = message.get("content", "")
        if not text:
            raise RuntimeError("Groq response did not contain text.")

        return text.strip()

    def generate(self, prompt, system_prompt=None, json_mode=False, temperature=0.2):
        try:
            return self._call_gemini(prompt, system_prompt=system_prompt, json_mode=json_mode, temperature=temperature)
        except Exception as gemini_error:
            logger.warning("Gemini failed, falling back to Groq: %s", gemini_error)
            return self._call_groq(prompt, system_prompt=system_prompt, json_mode=json_mode, temperature=temperature)


def _build_summary_prompt(document):
    text = document.extracted_text or ""
    if not text.strip():
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    excerpt = text[:12000]
    return (
        "You are an academic study assistant.\n"
        "Summarize the document into 4 to 6 compact sections.\n"
        "Return only valid JSON as an array of objects with keys: section, content.\n\n"
        f"Document title: {document.title}\n"
        f"Course: {document.course or 'General'}\n\n"
        f"Document text:\n{excerpt}"
    )


def _build_quiz_prompt(document):
    text = document.extracted_text or ""
    if not text.strip():
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    excerpt = text[:12000]
    return (
        "You are generating study flashcards from a course document.\n"
        "Create exam-focused questions that test understanding, application, definitions, causes, comparisons, or important mechanisms.\n"
        "Do not ask generic questions like 'What is an important idea from this document?'.\n"
        "Do not use contact details, names, emails, links, phone numbers, or resume metadata as questions.\n"
        "Return only valid JSON as an array of objects with keys: id, question, answer, explanation.\n"
        "Create 5 items.\n\n"
        f"Document title: {document.title}\n"
        f"Course: {document.course or 'General'}\n\n"
        f"Document text:\n{excerpt}"
    )


def _build_multiple_choice_prompt(document):
    text = document.extracted_text or ""
    if not text.strip():
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    excerpt = text[:12000]
    return (
        "You are generating multiple choice quiz questions from a course document.\n"
        "Create exam-style questions that test understanding, application, definitions, causes, comparisons, or important mechanisms.\n"
        "Every question must be specific to the document content and must not be generic.\n"
        "Do not use contact details, names, emails, links, phone numbers, or resume metadata as quiz content.\n"
        "Write plausible distractors, not silly choices like 'unrelated background information'.\n"
        "Return only valid JSON as an array of objects with keys: id, question, options, answer, explanation.\n"
        "Create 5 questions. Each options value must be an array of exactly 4 short answer choices.\n"
        "The answer value must exactly match one of the options.\n\n"
        f"Document title: {document.title}\n"
        f"Course: {document.course or 'General'}\n\n"
        f"Document text:\n{excerpt}"
    )


def _build_chat_prompt(document, question, context_chunks, history=None):
    history_lines = []
    for item in (history or [])[-8:]:
        role = item.get("role", "user")
        message = item.get("message", "")
        if message:
            history_lines.append(f"{role.upper()}: {message}")

    context = "\n\n".join(context_chunks) if context_chunks else "No relevant context found in the uploaded document."
    history_text = "\n".join(history_lines) if history_lines else "No prior conversation."

    return (
        "You are an AI study companion inside StudentAssistant.\n"
        "Answer only from the provided context when possible. If the answer is not fully supported, say what is uncertain.\n"
        "Keep the answer concise but helpful.\n\n"
        f"Document title: {document.title}\n"
        f"Course: {document.course or 'General'}\n\n"
        f"Conversation history:\n{history_text}\n\n"
        f"Relevant document context:\n{context}\n\n"
        f"Student question: {question}"
    )


def generate_summary(document):
    prompt = _build_summary_prompt(document)
    try:
        raw = CloudAIService().generate(
            prompt,
            system_prompt="Return clean JSON only.",
            json_mode=True,
            temperature=0.2,
        )
        parsed = parse_json_array(raw, possible_keys=["summary", "sections", "items"])
        if not isinstance(parsed, list):
            raise ValueError("Summary response must be a JSON array.")
        return parsed
    except Exception as exc:
        logger.warning("Cloud summary failed, using local fallback: %s", exc)
        return _fallback_summary(document)


def generate_flashcards(document):
    prompt = _build_quiz_prompt(document)
    try:
        raw = CloudAIService().generate(
            prompt,
            system_prompt="Return clean JSON only.",
            json_mode=True,
            temperature=0.25,
        )
        parsed = parse_json_array(raw, possible_keys=["flashcards", "cards", "questions", "items"])
        if not isinstance(parsed, list):
            raise ValueError("Quiz response must be a JSON array.")
        return parsed
    except Exception as exc:
        logger.warning("Cloud flashcard generation failed, using local fallback: %s", exc)
        return _fallback_flashcards(document)


def generate_multiple_choice_quiz(document):
    prompt = _build_multiple_choice_prompt(document)
    try:
        raw = CloudAIService().generate(
            prompt,
            system_prompt="Return clean JSON only.",
            json_mode=True,
            temperature=0.25,
        )
        parsed = parse_json_array(raw, possible_keys=["quiz", "questions", "items"])
        if not isinstance(parsed, list):
            raise ValueError("Quiz response must be a JSON array.")
        return normalize_quiz_items(parsed)
    except Exception as exc:
        logger.warning("Cloud MCQ quiz generation failed, using local fallback: %s", exc)
        return _fallback_multiple_choice_quiz(document)


def answer_question(document, question, history=None):
    if not (document.extracted_text or "").strip():
        raise ValueError("This file does not contain extractable text. Try a text-based PDF, DOCX, PPTX, TXT, Markdown, or CSV file.")

    chunks = split_text(document.extracted_text)
    context_chunks = select_relevant_chunks(chunks, question, limit=4)
    prompt = _build_chat_prompt(document, question, context_chunks, history=history)
    try:
        return CloudAIService().generate(
            prompt,
            system_prompt="You are a precise study assistant.",
            json_mode=False,
            temperature=0.2,
        )
    except Exception as exc:
        logger.warning("Cloud chat failed, using local fallback: %s", exc)
        return _fallback_answer(document, question, history=history)


def parse_json_array(raw_text, possible_keys):
    parsed = json.loads(_clean_json_text(raw_text))

    if isinstance(parsed, list):
        return parsed

    if isinstance(parsed, dict):
        for key in possible_keys:
            value = parsed.get(key)
            if isinstance(value, list):
                return value

    raise ValueError("AI response did not match the expected JSON format.")


def normalize_quiz_items(items):
    normalized = []
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            continue

        options = item.get("options") or []
        if not isinstance(options, list):
            options = []
        options = [str(option).strip() for option in options if str(option).strip()][:4]

        answer = str(item.get("answer") or "").strip()
        if answer and answer not in options:
            options = [answer, *options][:4]

        if len(options) < 2 or not answer:
            continue

        normalized.append(
            {
                "id": item.get("id") or index + 1,
                "question": str(item.get("question") or f"Question {index + 1}").strip(),
                "options": options,
                "answer": answer,
                "explanation": str(item.get("explanation") or "").strip(),
            }
        )

    if not normalized:
        raise ValueError("Quiz response did not contain valid multiple choice questions.")

    return normalized
