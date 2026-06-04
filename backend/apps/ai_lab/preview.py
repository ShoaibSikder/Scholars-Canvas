import base64
import hashlib
import html
import mimetypes
import shutil
import subprocess
import zipfile
from pathlib import Path
from xml.etree import ElementTree

from django.conf import settings


WORD_NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
OFFICE_CONVERTIBLE_EXTENSIONS = {".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".odt", ".ods", ".odp", ".rtf"}


def get_office_pdf_preview_path(file_path):
    source_path = Path(file_path)
    if source_path.suffix.lower() not in OFFICE_CONVERTIBLE_EXTENSIONS or not source_path.exists():
        return None

    soffice = _find_soffice()
    if not soffice:
        return None

    preview_dir = Path(settings.MEDIA_ROOT) / "generated_previews"
    preview_dir.mkdir(parents=True, exist_ok=True)
    cache_key = hashlib.sha256(f"{source_path.resolve()}:{source_path.stat().st_mtime_ns}".encode("utf-8")).hexdigest()[:24]
    cached_pdf = preview_dir / f"{cache_key}.pdf"
    if cached_pdf.exists() and cached_pdf.stat().st_size > 0:
        return cached_pdf

    temp_dir = preview_dir / f"{cache_key}_tmp"
    if temp_dir.exists():
        shutil.rmtree(temp_dir, ignore_errors=True)
    temp_dir.mkdir(parents=True, exist_ok=True)

    try:
        subprocess.run(
            [
                soffice,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(temp_dir),
                str(source_path),
            ],
            check=True,
            capture_output=True,
            timeout=60,
        )

        converted_files = list(temp_dir.glob("*.pdf"))
        if not converted_files:
            return None

        converted_files[0].replace(cached_pdf)
        return cached_pdf if cached_pdf.exists() else None
    except Exception:
        return None
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def _find_soffice():
    executable = shutil.which("soffice") or shutil.which("libreoffice")
    if executable:
        return executable

    windows_candidates = [
        Path("C:/Program Files/LibreOffice/program/soffice.exe"),
        Path("C:/Program Files (x86)/LibreOffice/program/soffice.exe"),
    ]

    for candidate in windows_candidates:
        if candidate.exists():
            return str(candidate)

    return ""


def can_render_html_preview(file_path):
    return Path(file_path).suffix.lower() in {".docx", ".pptx", ".txt", ".md", ".csv"}


def render_html_preview(file_path, title="Document"):
    extension = Path(file_path).suffix.lower()

    if extension == ".docx":
        body = _render_docx(file_path)
    elif extension == ".pptx":
        body = _render_pptx(file_path)
    elif extension in {".txt", ".md", ".csv"}:
        body = _render_plain_text(file_path)
    else:
        body = "<p>This file type cannot be rendered as an HTML preview.</p>"

    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(title)}</title>
  <style>
    :root {{ color-scheme: light; }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background: #252525;
      color: #172033;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}
    .page {{
      width: min(920px, calc(100vw - 40px));
      min-height: calc(100vh - 56px);
      margin: 28px auto;
      padding: clamp(24px, 5vw, 56px);
      background: #fff;
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
    }}
    .docx-preview p {{
      margin: 0 0 12px;
      font-size: 15px;
      line-height: 1.7;
      white-space: pre-wrap;
    }}
    .docx-preview img {{
      max-width: 240px;
      max-height: 240px;
      object-fit: contain;
      border-radius: 12px;
      margin: 8px 18px 12px 0;
      vertical-align: top;
    }}
    .docx-preview table {{
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
    }}
    .docx-preview td {{
      border: 1px solid #d9e2f1;
      padding: 8px 10px;
      vertical-align: top;
      font-size: 14px;
      line-height: 1.6;
    }}
    .slide {{
      min-height: 430px;
      margin-bottom: 28px;
      padding: 34px;
      border: 1px solid #dbe5f5;
      border-radius: 18px;
      background: linear-gradient(135deg, #ffffff, #f8fbff);
      box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
    }}
    .slide h2 {{
      margin: 0 0 18px;
      color: #0f2e5f;
      font-size: 22px;
    }}
    .slide p {{
      font-size: 16px;
      line-height: 1.7;
    }}
    .slide img {{
      max-width: 100%;
      max-height: 320px;
      object-fit: contain;
      border-radius: 12px;
      margin-top: 14px;
    }}
    pre {{
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font: 14px/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }}
  </style>
</head>
<body>
  <main class="page">{body}</main>
</body>
</html>"""


def _read_relationships(archive, rels_path):
    relationships = {}
    try:
        root = ElementTree.fromstring(archive.read(rels_path))
    except Exception:
        return relationships

    for rel in root.findall("rel:Relationship", WORD_NS):
        rel_id = rel.attrib.get("Id")
        target = rel.attrib.get("Target", "")
        if rel_id and target:
            relationships[rel_id] = target
    return relationships


def _image_data_uri(archive, path):
    try:
        data = archive.read(path)
    except Exception:
        return ""

    content_type = mimetypes.guess_type(path)[0] or "image/png"
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:{content_type};base64,{encoded}"


def _paragraph_html(paragraph, archive=None, relationships=None, media_root="word"):
    parts = []

    for node in paragraph.iter():
        if node.tag.endswith("}t") and node.text:
            parts.append(html.escape(node.text))
        elif node.tag.endswith("}tab"):
            parts.append("&emsp;")
        elif node.tag.endswith("}br"):
            parts.append("<br />")
        elif archive and node.tag.endswith("}blip"):
            rel_id = node.attrib.get(f"{{{WORD_NS['r']}}}embed")
            target = (relationships or {}).get(rel_id)
            if target:
                image_path = f"{media_root}/{target}" if not target.startswith("/") else target.lstrip("/")
                data_uri = _image_data_uri(archive, image_path)
                if data_uri:
                    parts.append(f'<img src="{data_uri}" alt="" />')

    return "".join(parts).strip()


def _render_docx(file_path):
    blocks = []

    with zipfile.ZipFile(file_path) as archive:
        relationships = _read_relationships(archive, "word/_rels/document.xml.rels")
        root = ElementTree.fromstring(archive.read("word/document.xml"))
        body = root.find("w:body", WORD_NS)

        for child in list(body or []):
            if child.tag.endswith("}p"):
                content = _paragraph_html(child, archive=archive, relationships=relationships)
                if content:
                    blocks.append(f"<p>{content}</p>")
            elif child.tag.endswith("}tbl"):
                rows = []
                for row in child.findall("w:tr", WORD_NS):
                    cells = []
                    for cell in row.findall("w:tc", WORD_NS):
                        cell_text = " ".join(
                            _paragraph_html(paragraph, archive=archive, relationships=relationships)
                            for paragraph in cell.findall("w:p", WORD_NS)
                        ).strip()
                        cells.append(f"<td>{cell_text}</td>")
                    if cells:
                        rows.append(f"<tr>{''.join(cells)}</tr>")
                if rows:
                    blocks.append(f"<table>{''.join(rows)}</table>")

    if not blocks:
        blocks.append("<p>No previewable content was found in this DOCX file.</p>")

    return f'<article class="docx-preview">{"".join(blocks)}</article>'


def _render_pptx(file_path):
    slides = []

    with zipfile.ZipFile(file_path) as archive:
        slide_names = sorted(name for name in archive.namelist() if name.startswith("ppt/slides/slide") and name.endswith(".xml"))

        for index, slide_name in enumerate(slide_names, start=1):
            rels_path = slide_name.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels"
            relationships = _read_relationships(archive, rels_path)
            root = ElementTree.fromstring(archive.read(slide_name))
            text = " ".join(html.escape(node.text.strip()) for node in root.iter() if node.tag.endswith("}t") and node.text and node.text.strip())
            images = []

            for node in root.iter():
                if node.tag.endswith("}blip"):
                    rel_id = node.attrib.get(f"{{{WORD_NS['r']}}}embed")
                    target = relationships.get(rel_id)
                    if target:
                        image_path = f"ppt/{target.replace('../', '')}"
                        data_uri = _image_data_uri(archive, image_path)
                        if data_uri:
                            images.append(f'<img src="{data_uri}" alt="" />')

            slides.append(f'<section class="slide"><h2>Slide {index}</h2><p>{text or "No text on this slide."}</p>{"".join(images)}</section>')

    return "".join(slides) or "<p>No previewable content was found in this PPTX file.</p>"


def _render_plain_text(file_path):
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            text = Path(file_path).read_text(encoding=encoding)
            return f"<pre>{html.escape(text)}</pre>"
        except UnicodeDecodeError:
            continue

    return "<p>This text file could not be decoded.</p>"
