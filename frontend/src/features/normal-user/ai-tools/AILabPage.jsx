import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
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
import { motion } from "framer-motion";

import {
  chatAILabDocument,
  createAILabDocument,
  createAILabDocumentFromVault,
  fetchAILab,
  fetchResources,
  generateAILabMcqQuiz,
  generateAILabQuiz,
  summarizeAILabDocument,
} from "../../../api";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import {
  emptyDocument,
  field,
  generationBadge,
  ghostIconBtn,
  panel,
  pillTabActive,
  pillTabInactive,
  primaryBtn,
  supportedFileTypes,
} from "./aiLabConstants";
import {
  flattenVaultResources,
  FormattedChatMessage,
  getExternalViewerUrl,
  getGenerationIndicator,
  getGenerationStatusMessage,
  isImage,
  isOfficeLike,
  isPdf,
  isTextLike,
  normalizeDocument,
} from "./aiLabUtils";
import AILabLayout from "./components/AILabLayout";

export default function AILabPage() {
  const fileInputRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const shouldStickToChatBottomRef = useRef(true);
  const forceChatScrollRef = useRef(false);
  const [documents, setDocuments] = useState([]);
  const [vaultResources, setVaultResources] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [sourceMode, setSourceMode] = useState("device");
  const [selectedVaultResourceId, setSelectedVaultResourceId] = useState("");
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultPickerOpen, setVaultPickerOpen] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState("");
  const [previewContentType, setPreviewContentType] = useState("");
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
  const [showChatScrollButton, setShowChatScrollButton] = useState(false);
  const [pendingChatMessages, setPendingChatMessages] = useState([]);

  useAutoClearStatus(status, setStatus);

  const activeDocument = useMemo(
    () =>
      normalizeDocument(
        documents.find((document) => document.id === activeDocumentId) ??
          documents[0] ??
          null,
      ),
    [activeDocumentId, documents],
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

  const summaryData = activeDocument?.summary_data ?? [];
  const flashcards = activeDocument?.flashcards ?? [];
  const quizItems = activeDocument?.quiz_data ?? [];
  const chatHistory = activeDocument?.chat_history ?? [];
  const displayedChatHistory = [...chatHistory, ...pendingChatMessages];
  const hasActiveDocument = Boolean(activeDocument?.id);
  const externalViewerUrl = getExternalViewerUrl(activeDocument);

  const latestAssistantReply = [...chatHistory]
    .reverse()
    .find((item) => item.role === "assistant");
  const chatIndicatorStatus = latestAssistantReply
    ? latestAssistantReply.is_ai_generated === false
      ? "fallback"
      : "ai"
    : null;

  const summaryStatus = getGenerationIndicator({
    source: activeDocument?.summary_source,
    hasContent: summaryData.length > 0,
    loading: actionLoading === "summary",
    loadingText: "Generating summary...",
    awaitingText: "Awaiting summary",
  });
  const flashcardsStatus = getGenerationIndicator({
    source: activeDocument?.flashcards_source,
    hasContent: flashcards.length > 0,
    loading: actionLoading === "quiz",
    loadingText: "Generating flashcards...",
    awaitingText: "Awaiting flashcards",
  });
  const quizStatus = getGenerationIndicator({
    source: activeDocument?.quiz_source,
    hasContent: quizItems.length > 0,
    loading: actionLoading === "mcq",
    loadingText: "Generating quiz...",
    awaitingText: "Awaiting quiz",
  });

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
        setActiveDocumentId(
          response.active_document?.id ?? nextDocuments[0]?.id ?? null,
        );
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
      setPendingChatMessages([]);
      return;
    }

    setFlippedCards((current) =>
      current.filter((cardId) =>
        activeDocument.flashcards.some(
          (card) => String(card.id) === String(cardId),
        ),
      ),
    );
    setQuizAnswers({});
    setRevealedQuizAnswers({});
    setPendingChatMessages([]);
  }, [activeDocument]);

  useEffect(() => {
    if (activeTab === "chat" && chatMessagesRef.current) {
      const scrollToBottom = () => {
        if (!chatMessagesRef.current) return;
        if (!forceChatScrollRef.current && !shouldStickToChatBottomRef.current) {
          setShowChatScrollButton(displayedChatHistory.length > 0);
          return;
        }

        chatMessagesRef.current.scrollTo({
          top: chatMessagesRef.current.scrollHeight,
          behavior: forceChatScrollRef.current ? "smooth" : "auto",
        });
        forceChatScrollRef.current = false;
        shouldStickToChatBottomRef.current = true;
        setShowChatScrollButton(false);
      };
      setTimeout(scrollToBottom, 100);
    }
  }, [displayedChatHistory, actionLoading, activeTab]);

  const handleChatScroll = () => {
    if (!chatMessagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    shouldStickToChatBottomRef.current = isAtBottom;
    setShowChatScrollButton(!isAtBottom);
  };

  const scrollChatToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
      shouldStickToChatBottomRef.current = true;
      setShowChatScrollButton(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    const loadPreview = async () => {
      if (!activeDocument?.preview_url) {
        setPreviewObjectUrl("");
        setPreviewContentType("");
        setPreviewLoading(false);
        return;
      }

      const token =
        localStorage.getItem("studentassistant_token") ||
        sessionStorage.getItem("studentassistant_token");
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
        if (!cancelled) {
          setPreviewContentType(blob.type || response.headers.get("Content-Type") || "");
          setPreviewObjectUrl(objectUrl);
        }
      } catch (error) {
        if (!cancelled) {
          setPreviewObjectUrl("");
          setPreviewContentType("");
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
    setDocuments((current) => [
      nextDocument,
      ...current.filter((item) => item.id !== nextDocument.id),
    ]);
    setActiveDocumentId(nextDocument.id);
    setActiveTab("summary");
  };

  const updateDocument = (documentId, updater) => {
    setDocuments((current) =>
      current.map((document) => {
        if (document.id !== documentId) return document;

        const nextDocument =
          typeof updater === "function" ? updater(document) : updater;
        return normalizeDocument(nextDocument);
      }),
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
      const response = await createAILabDocumentFromVault(
        Number(selectedVaultResourceId),
      );
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

    // Check if summary already exists (caching behavior like quiz/flashcards)
    if (activeDocument.summary_data && activeDocument.summary_data.length > 0) {
      setActiveTab("summary");
      return;
    }

    setActionLoading("summary");
    setStatus("");

    try {
      const response = await summarizeAILabDocument(activeDocument.id);
      updateDocument(activeDocument.id, (document) => ({
        ...document,
        summary_data: response.summary ?? [],
        summary_source: response.source ?? "",
      }));
      setActiveTab("summary");
      setStatus(getGenerationStatusMessage("Summary", response.source));
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
      updateDocument(activeDocument.id, (document) => ({
        ...document,
        flashcards: response.flashcards ?? [],
        flashcards_source: response.source ?? "",
      }));
      setActiveTab("flashcards");
      setStatus(getGenerationStatusMessage("Flashcards", response.source));
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
      updateDocument(activeDocument.id, (document) => ({
        ...document,
        quiz_data: response.quiz ?? [],
        quiz_source: response.source ?? "",
      }));
      setActiveTab("quiz");
      setQuizAnswers({});
      setRevealedQuizAnswers({});
      setStatus(getGenerationStatusMessage("Quiz", response.source));
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
    setActiveTab("chat");
    forceChatScrollRef.current = true;
    shouldStickToChatBottomRef.current = true;
    setPendingChatMessages([
      {
        role: "user",
        message,
        pending: true,
      },
    ]);

    try {
      const response = await chatAILabDocument(activeDocument.id, message);
      updateDocument(activeDocument.id, (document) => ({
        ...document,
        chat_history: response.chat_history ?? document.chat_history,
      }));
    } catch (error) {
      setStatus(error.message || "Unable to send message.");
    } finally {
      setPendingChatMessages([]);
      setActionLoading("");
    }
  };

  const toggleCard = (cardId) => {
    setFlippedCards((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId],
    );
  };

  return (
    <AILabLayout
      activeDocument={activeDocument}
      activeTab={activeTab}
      actionLoading={actionLoading}
      chatIndicatorStatus={chatIndicatorStatus}
      chatInput={chatInput}
      chatMessagesRef={chatMessagesRef}
      displayedChatHistory={displayedChatHistory}
      externalViewerUrl={externalViewerUrl}
      fileInputRef={fileInputRef}
      filteredVaultResources={filteredVaultResources}
      flashcards={flashcards}
      flashcardsStatus={flashcardsStatus}
      flippedCards={flippedCards}
      handleChatScroll={handleChatScroll}
      handleMcqQuiz={handleMcqQuiz}
      handleOpenVaultResource={handleOpenVaultResource}
      handleQuiz={handleQuiz}
      handleSendMessage={handleSendMessage}
      handleSummarize={handleSummarize}
      handleUpload={handleUpload}
      hasActiveDocument={hasActiveDocument}
      loading={loading}
      previewContentType={previewContentType}
      previewLoading={previewLoading}
      previewObjectUrl={previewObjectUrl}
      previewScale={previewScale}
      quizAnswers={quizAnswers}
      quizItems={quizItems}
      quizStatus={quizStatus}
      revealedQuizAnswers={revealedQuizAnswers}
      scrollChatToBottom={scrollChatToBottom}
      selectedVaultResourceId={selectedVaultResourceId}
      setActiveTab={setActiveTab}
      setChatInput={setChatInput}
      setPreviewScale={setPreviewScale}
      setQuizAnswers={setQuizAnswers}
      setRevealedQuizAnswers={setRevealedQuizAnswers}
      setSelectedVaultResourceId={setSelectedVaultResourceId}
      setSourceMode={setSourceMode}
      setVaultPickerOpen={setVaultPickerOpen}
      setVaultSearch={setVaultSearch}
      showChatScrollButton={showChatScrollButton}
      sourceMode={sourceMode}
      status={status}
      summaryData={summaryData}
      summaryStatus={summaryStatus}
      toggleCard={toggleCard}
      vaultLoading={vaultLoading}
      vaultPickerOpen={vaultPickerOpen}
      vaultSearch={vaultSearch}
    />
  );
}


