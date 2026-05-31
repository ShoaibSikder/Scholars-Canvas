import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  CreditCard,
  FileQuestion,
  FileText,
  FileUp,
  FolderOpen,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  chatAILabDocument,
  createAILabDocument,
  createAILabDocumentFromVault,
  fetchAILab,
  fetchResources,
  generateAILabMcqQuiz,
  generateAILabQuiz,
  summarizeAILabDocument,
} from "../../services/appService";

const emptyDocument = {
  id: null,
  title: "",
  course: "",
  file_url: "",
  file_name: "",
  preview_url: "",
  summary_data: [],
  flashcards: [],
  quiz_data: [],
  chat_history: [],
  text_preview: "",
};

const supportedFileTypes = ".pdf,.docx,.pptx,.txt,.md,.csv";
const panel = "rounded-xl border border-slate-200/80 bg-white/95 shadow-md shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90";
const primaryBtn =
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 text-xs font-black text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60";
const ghostIconBtn =
  "grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:text-blue-300";
const field =
  "min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

function normalizeDocument(document) {
  if (!document) return null;

  return {
    ...emptyDocument,
    ...document,
    summary_data: Array.isArray(document.summary_data) ? document.summary_data : [],
    flashcards: Array.isArray(document.flashcards) ? document.flashcards : [],
    quiz_data: Array.isArray(document.quiz_data) ? document.quiz_data : [],
    chat_history: Array.isArray(document.chat_history) ? document.chat_history : [],
  };
}

function flattenVaultResources(groups) {
  return groups.flatMap((group) =>
    (group.courses ?? []).flatMap((course) =>
      (course.resources ?? [])
        .filter((resource) => resource.file_url)
        .map((resource) => ({
          ...resource,
          courseLabel: `${course.code} - ${course.title}`,
          courseId: course.id,
          semester: group.semester,
        }))
    )
  );
}

function isPdf(document) {
  const source = `${document?.file_name ?? ""} ${document?.file_url ?? ""}`.toLowerCase();
  return source.includes(".pdf");
}

function isImage(document) {
  const source = `${document?.file_name ?? ""} ${document?.file_url ?? ""}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(source);
}

function isTextLike(document) {
  const source = `${document?.file_name ?? ""} ${document?.file_url ?? ""}`.toLowerCase();
  return /\.(txt|md|csv|json|xml|html|css|js|py)(\?|$)/.test(source);
}

export default function AILabPage() {
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [vaultResources, setVaultResources] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [sourceMode, setSourceMode] = useState("device");
  const [selectedVaultResourceId, setSelectedVaultResourceId] = useState("");
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultPickerOpen, setVaultPickerOpen] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [chatInput, setChatInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [flippedCards, setFlippedCards] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [revealedQuizAnswers, setRevealedQuizAnswers] = useState({});

  const activeDocument = useMemo(
    () => normalizeDocument(documents.find((document) => document.id === activeDocumentId) ?? documents[0] ?? null),
    [activeDocumentId, documents]
  );

  const filteredVaultResources = useMemo(() => {
    const query = vaultSearch.trim().toLowerCase();
    if (!query) return vaultResources;

    return vaultResources.filter((resource) => {
      const searchableText = [
        resource.title,
        resource.courseLabel,
        resource.resource_type,
        resource.resource_type_label,
        resource.category_label,
        resource.semester ? `semester ${resource.semester}` : "",
        resource.semester ? `sem ${resource.semester}` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [vaultResources, vaultSearch]);

  useEffect(() => {
    let mounted = true;

    const loadLab = async () => {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetchAILab();
        if (!mounted) return;

        const nextDocuments = (response.documents ?? []).map(normalizeDocument);
        setDocuments(nextDocuments);
        setActiveDocumentId(response.active_document?.id ?? nextDocuments[0]?.id ?? null);
      } catch (error) {
        if (!mounted) return;
        setStatus(error.message || "Unable to load AI Lab documents.");
        setDocuments([]);
        setActiveDocumentId(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadVault = async () => {
      setVaultLoading(true);
      try {
        const response = await fetchResources();
        if (!mounted) return;

        setVaultResources(flattenVaultResources(response.courses ?? []));
      } catch {
        if (mounted) setVaultResources([]);
      } finally {
        if (mounted) setVaultLoading(false);
      }
    };

    loadLab();
    loadVault();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeDocument) {
      setFlippedCards([]);
      setQuizAnswers({});
      setRevealedQuizAnswers({});
      return;
    }

    setFlippedCards((current) => current.filter((cardId) => activeDocument.flashcards.some((card) => String(card.id) === String(cardId))));
    setQuizAnswers({});
    setRevealedQuizAnswers({});
  }, [activeDocument]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    const loadPreview = async () => {
      if (!activeDocument?.preview_url) {
        setPreviewObjectUrl("");
        setPreviewLoading(false);
        return;
      }

      const token = localStorage.getItem("studentassistant_token") || sessionStorage.getItem("studentassistant_token");
      setPreviewLoading(true);

      try {
        const response = await fetch(activeDocument.preview_url, {
          headers: token ? { Authorization: `Token ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Unable to load file preview.");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPreviewObjectUrl(objectUrl);
      } catch (error) {
        if (!cancelled) {
          setPreviewObjectUrl("");
          setStatus(error.message || "Unable to load file preview.");
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeDocument]);

  const addOrReplaceDocument = (document) => {
    const nextDocument = normalizeDocument(document);
    setDocuments((current) => [nextDocument, ...current.filter((item) => item.id !== nextDocument.id)]);
    setActiveDocumentId(nextDocument.id);
    setActiveTab("summary");
  };

  const updateDocument = (documentId, updater) => {
    setDocuments((current) =>
      current.map((document) => {
        if (document.id !== documentId) return document;

        const nextDocument = typeof updater === "function" ? updater(document) : updater;
        return normalizeDocument(nextDocument);
      })
    );
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(/\.[^.]+$/i, ""));
    formData.append("course", "");

    setActionLoading("upload");
    setStatus("");

    try {
      const response = await createAILabDocument(formData);
      addOrReplaceDocument(response.document);
      setStatus("File uploaded successfully.");
    } catch (error) {
      setStatus(error.message || "Upload failed.");
    } finally {
      setActionLoading("");
    }
  };

  const handleOpenVaultResource = async () => {
    if (!selectedVaultResourceId) return;

    setActionLoading("vault");
    setStatus("");

    try {
      const response = await createAILabDocumentFromVault(Number(selectedVaultResourceId));
      addOrReplaceDocument(response.document);
      setStatus("Vault file opened in AI Lab.");
      setVaultPickerOpen(false);
    } catch (error) {
      setStatus(error.message || "Unable to open Vault file.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSummarize = async () => {
    if (!activeDocument?.id) return;

    setActionLoading("summary");
    setStatus("");

    try {
      const response = await summarizeAILabDocument(activeDocument.id);
      updateDocument(activeDocument.id, (document) => ({ ...document, summary_data: response.summary ?? [] }));
      setActiveTab("summary");
      setStatus("Summary generated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to generate summary.");
    } finally {
      setActionLoading("");
    }
  };

  const handleQuiz = async () => {
    if (!activeDocument?.id) return;

    setActionLoading("quiz");
    setStatus("");

    try {
      const response = await generateAILabQuiz(activeDocument.id);
      updateDocument(activeDocument.id, (document) => ({ ...document, flashcards: response.flashcards ?? [] }));
      setActiveTab("flashcards");
      setStatus("Flashcards generated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to generate flashcards.");
    } finally {
      setActionLoading("");
    }
  };

  const handleMcqQuiz = async () => {
    if (!activeDocument?.id) return;

    setActionLoading("mcq");
    setStatus("");

    try {
      const response = await generateAILabMcqQuiz(activeDocument.id);
      updateDocument(activeDocument.id, (document) => ({ ...document, quiz_data: response.quiz ?? [] }));
      setActiveTab("quiz");
      setQuizAnswers({});
      setRevealedQuizAnswers({});
      setStatus("Quiz generated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to generate quiz.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!activeDocument?.id || !chatInput.trim()) return;

    const message = chatInput.trim();
    setChatInput("");
    setActionLoading("chat");
    setStatus("");

    try {
      const response = await chatAILabDocument(activeDocument.id, message);
      updateDocument(activeDocument.id, (document) => ({ ...document, chat_history: response.chat_history ?? document.chat_history }));
      setActiveTab("chat");
    } catch (error) {
      setStatus(error.message || "Unable to send message.");
    } finally {
      setActionLoading("");
    }
  };

  const toggleCard = (cardId) => {
    setFlippedCards((current) => (current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId]));
  };

  const summaryData = activeDocument?.summary_data ?? [];
  const flashcards = activeDocument?.flashcards ?? [];
  const quizItems = activeDocument?.quiz_data ?? [];
  const chatHistory = activeDocument?.chat_history ?? [];
  const hasActiveDocument = Boolean(activeDocument?.id);

  return (
    <div className="grid gap-3">
      <div>
        <h1 className="text-lg font-black text-slate-950 dark:text-white sm:text-xl">AI Study Lab</h1>
        <p className="mt-1 max-w-2xl text-xs font-semibold text-slate-500 dark:text-slate-400 sm:text-sm">
          Use a device file or an existing Vault file, then generate summaries, chat answers, and flashcards.
        </p>
      </div>

      {status ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100">
          {status}
        </div>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <section className={`${panel} grid min-w-0 self-start gap-3 p-3`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">Document Library</p>
              <h2 className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white sm:text-base">
                {activeDocument?.title || "Choose a study file"}
              </h2>
              <p className="mt-1 truncate text-xs font-bold text-slate-500 dark:text-slate-400">{activeDocument?.course || "PDF, DOCX, PPTX, TXT, MD, CSV supported"}</p>
            </div>

            <div className="flex gap-2">
              <button type="button" className={ghostIconBtn} onClick={() => setPreviewScale((current) => Math.max(0.75, Number((current - 0.1).toFixed(2))))} aria-label="Zoom out">
                <ZoomOut size={16} />
              </button>
              <button type="button" className={ghostIconBtn} onClick={() => setPreviewScale((current) => Math.min(1.5, Number((current + 0.1).toFixed(2))))} aria-label="Zoom in">
                <ZoomIn size={16} />
              </button>
              <button type="button" className={ghostIconBtn} onClick={() => setPreviewScale(1)} aria-label="Reset zoom">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceMode("device")}
                className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-black transition ${
                  sourceMode === "device" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <FileUp size={17} />
                <span>Device</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("vault")}
                className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-black transition ${
                  sourceMode === "vault" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <FolderOpen size={17} />
                <span>Vault</span>
              </button>
            </div>

            {sourceMode === "device" ? (
              <div className="grid gap-2">
                <button type="button" className={primaryBtn} onClick={() => fileInputRef.current?.click()} disabled={actionLoading === "upload"}>
                  {actionLoading === "upload" ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
                  <span>{actionLoading === "upload" ? "Uploading..." : "Upload File"}</span>
                </button>
                <input ref={fileInputRef} type="file" accept={supportedFileTypes} className="hidden" onChange={handleUpload} />
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative min-w-0">
                  <input
                    type="search"
                    value={vaultSearch}
                    onChange={(event) => {
                      setVaultSearch(event.target.value);
                      setSelectedVaultResourceId("");
                      setVaultPickerOpen(true);
                    }}
                    onFocus={() => setVaultPickerOpen(true)}
                    onBlur={() => window.setTimeout(() => setVaultPickerOpen(false), 120)}
                    placeholder={vaultLoading ? "Loading Vault files..." : "Search Vault files by name, course, or semester"}
                    className={`${field} pr-10`}
                    disabled={vaultLoading}
                    autoComplete="off"
                  />
                  <FolderOpen className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

                  {vaultPickerOpen && !vaultLoading ? (
                    <div className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-950 sm:max-h-72">
                      {filteredVaultResources.length > 0 ? (
                        filteredVaultResources.map((resource) => (
                          <button
                            type="button"
                            key={resource.id}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setSelectedVaultResourceId(String(resource.id));
                              setVaultSearch(resource.title);
                              setVaultPickerOpen(false);
                            }}
                            className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-blue-50 dark:hover:bg-blue-500/10 ${
                              String(resource.id) === String(selectedVaultResourceId) ? "bg-blue-50 dark:bg-blue-500/10" : ""
                            }`}
                          >
                            <span className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                              <FileText size={17} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-black text-slate-900 dark:text-white">{resource.title}</span>
                              <span className="mt-0.5 block truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                                {resource.courseLabel}
                                {resource.semester ? ` / Semester ${resource.semester}` : ""}
                              </span>
                            </span>
                            <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-black uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300 sm:inline">
                              {resource.resource_type_label || resource.resource_type || "File"}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          No Vault files match your search.
                        </div>
                      )}
                    </div>
                  ) : null}

                </div>
                <button type="button" className={primaryBtn} onClick={handleOpenVaultResource} disabled={!selectedVaultResourceId || actionLoading === "vault"}>
                  {actionLoading === "vault" ? <Loader2 size={18} className="animate-spin" /> : <FolderOpen size={18} />}
                  <span>Open in AI Lab</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative h-[52vh] min-h-[300px] overflow-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-indigo-50 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900 xl:h-[calc(100vh-330px)] xl:min-h-[340px] 2xl:h-[calc(100vh-285px)]">
            {loading ? (
              <CenteredState icon={<Loader2 className="mx-auto animate-spin" size={26} />} text="Loading AI Lab..." />
            ) : previewLoading ? (
              <CenteredState icon={<Loader2 className="mx-auto animate-spin" size={26} />} text="Loading PDF preview..." />
            ) : previewObjectUrl && isImage(activeDocument) ? (
              <div className="grid h-full place-items-center p-4">
                <img
                  src={previewObjectUrl}
                  alt={activeDocument.title}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-lg"
                  style={{ transform: `scale(${previewScale})`, transformOrigin: "center" }}
                />
              </div>
            ) : previewObjectUrl && (isPdf(activeDocument) || isTextLike(activeDocument)) ? (
              <iframe
                title={activeDocument.title}
                src={previewObjectUrl}
                className="h-full border-0"
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  width: `${100 / previewScale}%`,
                  height: `${100 / previewScale}%`,
                }}
              />
            ) : previewObjectUrl && activeDocument ? (
              <object data={previewObjectUrl} title={activeDocument.title} className="h-full w-full" type="application/octet-stream">
                <CenteredState
                  icon={<FileText className="mx-auto" size={28} />}
                  text="This file type cannot be rendered directly by the browser. Use the document button above to open or download the exact file."
                />
              </object>
            ) : activeDocument ? (
              <div className="p-4">
                <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-950 dark:text-white">{activeDocument.file_name || activeDocument.title}</h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Browser preview fallback for unsupported file viewers.</p>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{activeDocument.text_preview || "No text preview is available yet."}</p>
                </div>
              </div>
            ) : (
              <CenteredState icon={<FileText className="mx-auto" size={28} />} text="Upload a file or open an uploaded Vault file to start." />
            )}
          </div>
        </section>

        <section className={`${panel} flex min-w-0 flex-col overflow-hidden xl:sticky xl:top-4 xl:max-h-[calc(100vh-250px)] xl:self-start 2xl:max-h-[calc(100vh-225px)]`}>
          <div className="grid grid-cols-4 gap-1.5 border-b border-slate-200 p-2.5 dark:border-slate-800">
            <ActionTab
              active={activeTab === "summary"}
              icon={actionLoading === "summary" ? Loader2 : Sparkles}
              label={actionLoading === "summary" ? "Working" : "Summarize"}
              loading={actionLoading === "summary"}
              disabled={!hasActiveDocument || actionLoading === "summary"}
              onClick={handleSummarize}
            />
            <ActionTab active={activeTab === "chat"} icon={MessageSquare} label="Chat" disabled={!hasActiveDocument} onClick={() => setActiveTab("chat")} />
            <ActionTab
              active={activeTab === "flashcards" || actionLoading === "quiz"}
              icon={actionLoading === "quiz" ? Loader2 : CreditCard}
              label={actionLoading === "quiz" ? "Working" : "Flashcards"}
              loading={actionLoading === "quiz"}
              disabled={!hasActiveDocument || actionLoading === "quiz"}
              onClick={() => {
                if (flashcards.length > 0) {
                  setActiveTab("flashcards");
                  return;
                }
                handleQuiz();
              }}
            />
            <ActionTab
              active={activeTab === "quiz" || actionLoading === "mcq"}
              icon={actionLoading === "mcq" ? Loader2 : FileQuestion}
              label={actionLoading === "mcq" ? "Working" : "Quiz"}
              loading={actionLoading === "mcq"}
              disabled={!hasActiveDocument || actionLoading === "mcq"}
              onClick={() => {
                if (quizItems.length > 0) {
                  setActiveTab("quiz");
                  return;
                }
                handleMcqQuiz();
              }}
            />
          </div>

          <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3">
            {activeTab === "summary" ? (
              <div className="grid gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300">
                  <Sparkles size={16} />
                  <span>AI-generated summary</span>
                </div>

                {summaryData.length > 0 ? (
                  summaryData.map((item, index) => (
                    <article key={`${item.section}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                      <h3 className="text-sm font-black text-slate-950 dark:text-white">{item.section}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.content}</p>
                    </article>
                  ))
                ) : (
                  <EmptyPanel text="Click Summarize to generate study notes from the selected document." />
                )}
              </div>
            ) : null}

            {activeTab === "chat" ? (
              <div className="grid gap-3">
                <div className="grid max-h-[46vh] gap-3 overflow-auto pr-1">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-5 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {message.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel text="Ask a question about the file and the AI will answer from the selected document." />
                  )}
                  {actionLoading === "chat" ? (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        <Loader2 size={14} className="animate-spin" />
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <form className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/60" onSubmit={handleSendMessage}>
                  <textarea
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    rows={2}
                    placeholder="Ask about this document..."
                    className="w-full resize-none bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Answers use the selected file as context.</p>
                    <button type="submit" className="grid size-8 place-items-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-60" disabled={!chatInput.trim() || actionLoading === "chat"}>
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {activeTab === "flashcards" ? (
              <div className="grid gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300">
                  <CreditCard size={16} />
                  <span>Auto-generated flashcards</span>
                </div>

                {flashcards.length > 0 ? (
                  flashcards.map((card, index) => {
                    const cardId = card.id ?? index;
                    const isFlipped = flippedCards.includes(cardId);
                    return (
                      <button key={cardId} type="button" className="h-36 cursor-pointer text-left [perspective:1000px]" onClick={() => toggleCard(cardId)}>
                        <div className={`relative h-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                          <div className="absolute inset-0 grid place-items-center rounded-xl border border-blue-200 bg-blue-50 p-3 text-center [backface-visibility:hidden] dark:border-blue-500/30 dark:bg-blue-500/15">
                            <div>
                              <p className="font-black leading-6 text-blue-950 dark:text-blue-100">{card.question}</p>
                              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-300">
                                Click to reveal <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>
                          <div className="absolute inset-0 grid place-items-center rounded-xl border border-violet-200 bg-violet-50 p-3 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-violet-500/30 dark:bg-violet-500/15">
                            <div>
                              <p className="font-bold leading-6 text-violet-950 dark:text-violet-100">{card.answer}</p>
                              {card.explanation ? <span className="mt-3 block text-xs font-semibold leading-5 text-violet-700 dark:text-violet-200">{card.explanation}</span> : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <EmptyPanel text="Click Flashcards to generate study cards from the selected document." />
                )}
              </div>
            ) : null}

            {activeTab === "quiz" ? (
              <div className="grid gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300">
                  <FileQuestion size={16} />
                  <span>Multiple choice quiz</span>
                </div>

                {quizItems.length > 0 ? (
                  quizItems.map((item, index) => {
                    const itemId = item.id ?? index;
                    const selectedAnswer = quizAnswers[itemId];
                    const isRevealed = Boolean(revealedQuizAnswers[itemId]);

                    return (
                      <article key={itemId} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xs font-black leading-5 text-slate-950 dark:text-white">
                            {index + 1}. {item.question}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setRevealedQuizAnswers((current) => ({ ...current, [itemId]: !current[itemId] }))}
                            className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-300 dark:ring-slate-700"
                          >
                            {isRevealed ? "Hide" : "Show answer"}
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2">
                          {(item.options ?? []).map((option) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === item.answer;
                            const showCorrect = isRevealed || selectedAnswer;
                            return (
                              <button
                                type="button"
                                key={option}
                                onClick={() => setQuizAnswers((current) => ({ ...current, [itemId]: option }))}
                                className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                                  showCorrect && isCorrect
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100"
                                    : showCorrect && isSelected && !isCorrect
                                      ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100"
                                      : isSelected
                                        ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {isRevealed || selectedAnswer ? (
                          <div className="mt-3 rounded-lg bg-white p-3 text-xs font-semibold leading-6 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                            <p>
                              Correct answer: <span className="font-black text-emerald-600 dark:text-emerald-300">{item.answer}</span>
                            </p>
                            {item.explanation ? <p className="mt-1">{item.explanation}</p> : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <EmptyPanel text="Click Quiz to generate multiple choice questions from the selected document." />
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function ActionTab({ active, disabled = false, icon: Icon, label, loading = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-black transition sm:text-xs ${
        active
          ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20"
          : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800"
      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-950`}
    >
      <Icon size={16} className={loading ? "animate-spin" : ""} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function CenteredState({ icon, text }) {
  return (
    <div className="grid h-full place-items-center p-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
      <div className="grid max-w-sm gap-3">
        {icon}
        <p>{text}</p>
      </div>
    </div>
  );
}

function EmptyPanel({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-400">
      {text}
    </div>
  );
}


