import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, Copy, Download, ExternalLink, File as GenericFile, FileImage, FileQuestion, FileSpreadsheet, FileText, Folder, FolderOpen, Link as LinkIcon, Loader2, Mail, MessageCircle, Pencil, Plus, Presentation, Send, Share2, Sparkles, Trash2, UploadCloud, X } from "lucide-react";

import { createAILabDocumentFromVault, createConversation, createVaultCourse, createVaultResource, deleteVaultCourse, deleteVaultResource, fetchCommunication, fetchResources, generateAILabMcqQuiz, sendConversationMessage, summarizeAILabDocument, updateVaultCourse, updateVaultResource } from "../../../api";
import { useAlert } from "../../../components/common/AlertProvider";
import UploadProgressBar from "../../../components/common/UploadProgressBar";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import {
  card,
  emptyCourse,
  emptyLink,
  emptyResource,
  field,
  generationBadge,
  iconBtn,
  input,
  label,
  pageReveal,
  primaryBtn,
  secondaryBtn,
  sections,
  SELECTED_COURSE_KEY,
} from "./vaultConstants";
import {
  flattenCourses,
  formatDate,
  getAuthToken,
  getGenerationIndicator,
  getResourceTarget,
  getResourceViewerUrl,
  getResourceVisual,
  getUrlInfo,
  groupCourses,
  normalizeExternalUrl,
} from "./vaultUtils";
import VaultCourseList from "./components/VaultCourseList";
import VaultCourseWorkspace from "./components/VaultCourseWorkspace";
import { LinkPreviewCard, ShareTile } from "./components/VaultShared";

export default function VaultPage({ openRequest = null } = {}) {
  const { confirm } = useAlert();
  const [semesterGroups, setSemesterGroups] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(() => {
    const stored = localStorage.getItem(SELECTED_COURSE_KEY);
    return stored ? Number(stored) : null;
  });
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [activeSection, setActiveSection] = useState("mid_term");
  const [hoveredResource, setHoveredResource] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [resourceFileInputKey, setResourceFileInputKey] = useState(0);
  const [linkForm, setLinkForm] = useState(emptyLink);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [resourceUploadProgress, setResourceUploadProgress] = useState(0);
  const [vaultQuizAnswers, setVaultQuizAnswers] = useState({});
  const [vaultRevealedAnswers, setVaultRevealedAnswers] = useState({});
  const [aiDrawer, setAiDrawer] = useState({
    open: false,
    type: "summary",
    title: "",
    loading: false,
    error: "",
    summary: [],
    quiz: [],
    source: "",
  });
  const [sharePanel, setSharePanel] = useState({ open: false, resource: null, friends: [], loading: false, message: "" });

  useAutoClearStatus(status, setStatus);

  const courses = useMemo(() => flattenCourses(semesterGroups), [semesterGroups]);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

  const loadVault = async () => {
    setLoading(true);
    setStatus("");
    try {
      const payload = await fetchResources();
      setSemesterGroups(payload?.courses ?? []);
    } catch (error) {
      setStatus(error.message || "Unable to load vault.");
      setSemesterGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVault();
  }, []);

  useEffect(() => {
    if (openRequest?.courseId) {
      setSelectedCourseId(Number(openRequest.courseId));
      localStorage.setItem(SELECTED_COURSE_KEY, String(openRequest.courseId));
    }
  }, [openRequest?.courseId, openRequest?.nonce]);


  useEffect(() => {
    if (loading) {
      return;
    }

    if (selectedCourseId && !courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(null);
      localStorage.removeItem(SELECTED_COURSE_KEY);
    }
  }, [courses, loading, selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem(SELECTED_COURSE_KEY, String(selectedCourseId));
      setActiveSection("mid_term");
    } else {
      localStorage.removeItem(SELECTED_COURSE_KEY);
    }
  }, [selectedCourseId]);

  const replaceCourse = (course) => {
    setSemesterGroups((current) => groupCourses(flattenCourses(current).map((item) => (item.id === course.id ? course : item))));
  };

  const addCourse = (course) => {
    setSemesterGroups((current) => groupCourses([...flattenCourses(current), course]));
  };

  const removeCourse = (courseId) => {
    setSemesterGroups((current) => groupCourses(flattenCourses(current).filter((course) => course.id !== courseId)));
  };

  const openCourseForm = (course = null) => {
    setEditingCourse(course);
    setCourseForm(course ? { semester: course.semester, code: course.code, title: course.title } : emptyCourse);
    setCourseFormOpen(true);
    setStatus("");
  };

  const openResourceForm = (resource = null, category = "mid_term") => {
    if ((resource?.category ?? category) === "link") {
      openLinkForm(resource);
      return;
    }
    setEditingResource(resource);
    setResourceForm(resource ? {
      category: resource.category,
      title: resource.title,
      url: resource.url ?? "",
      notes: resource.notes ?? "",
      files: [],
    } : { ...emptyResource, category });
    setResourceFormOpen(true);
    setStatus("");
  };

  const openLinkForm = (resource = null) => {
    setEditingResource(resource);
    setLinkForm(resource ? {
      category: "link",
      title: resource.title,
      url: resource.url ?? "",
      notes: resource.notes ?? "",
      files: [],
    } : emptyLink);
    setLinkFormOpen(true);
    setStatus("");
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const payload = {
      semester: Number(courseForm.semester),
      code: courseForm.code.trim(),
      title: courseForm.title.trim(),
    };

    try {
      if (editingCourse) {
        const updated = await updateVaultCourse(editingCourse.id, payload);
        replaceCourse({ ...editingCourse, ...updated });
        setStatus("Course folder updated.");
      } else {
        const created = await createVaultCourse(payload);
        addCourse({ ...created, resources: created.resources ?? [], resource_count: 0 });
        setStatus("Course folder added.");
      }
      setCourseFormOpen(false);
      setEditingCourse(null);
    } catch (error) {
      setStatus(error.message || "Unable to save course folder.");
    } finally {
      setSaving(false);
    }
  };

  const handleResourceSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCourse) {
      return;
    }

    setSaving(true);
    setStatus("");
    setResourceUploadProgress(resourceForm.files?.length ? 1 : 0);
    const payload = new FormData();
    payload.append("category", resourceForm.category);
    payload.append("title", resourceForm.title.trim());
    payload.append("url", normalizeExternalUrl(resourceForm.url));
    payload.append("notes", resourceForm.notes.trim());
    if (resourceForm.files?.length) {
      resourceForm.files.forEach((file) => payload.append("files", file));
    }

    try {
      if (editingResource) {
        const updated = await updateVaultResource(selectedCourse.id, editingResource.id, payload, {
          onUploadProgress: resourceForm.files?.length ? setResourceUploadProgress : undefined,
        });
        replaceCourse({
          ...selectedCourse,
          resources: selectedCourse.resources.map((item) => (item.id === updated.id ? updated : item)),
        });
        setStatus("Resource updated.");
      } else {
        const createdPayload = await createVaultResource(selectedCourse.id, payload, {
          onUploadProgress: resourceForm.files?.length ? setResourceUploadProgress : undefined,
        });
        const createdResources = Array.isArray(createdPayload) ? createdPayload : [createdPayload];
        replaceCourse({
          ...selectedCourse,
          resource_count: (selectedCourse.resource_count ?? selectedCourse.resources.length) + createdResources.length,
          resources: [...selectedCourse.resources, ...createdResources],
        });
        setStatus(createdResources.length > 1 ? `${createdResources.length} resources added.` : "Resource added.");
      }
      setResourceFormOpen(false);
      setEditingResource(null);
    } catch (error) {
      setStatus(error.message || "Unable to save resource.");
    } finally {
      setSaving(false);
      setResourceUploadProgress(0);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmed = await confirm({
      title: "Delete Course Folder?",
      message: `Delete ${course.code} and all its resources? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteVaultCourse(course.id);
      removeCourse(course.id);
      setSelectedCourseId(null);
      setStatus("Course folder deleted.");
    } catch (error) {
      setStatus(error.message || "Unable to delete course folder.");
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!selectedCourse) {
      return;
    }

    const confirmed = await confirm({
      title: "Delete Resource?",
      message: `Delete ${resource.title}? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteVaultResource(selectedCourse.id, resource.id);
      replaceCourse({
        ...selectedCourse,
        resource_count: Math.max(0, (selectedCourse.resource_count ?? selectedCourse.resources.length) - 1),
        resources: selectedCourse.resources.filter((item) => item.id !== resource.id),
      });
      setStatus("Resource deleted.");
    } catch (error) {
      setStatus(error.message || "Unable to delete resource.");
    }
  };

  const handleToggleResourceDone = async (resource) => {
    if (!selectedCourse) {
      return;
    }

    const nextDone = !resource.is_done;
    replaceCourse({
      ...selectedCourse,
      resources: selectedCourse.resources.map((item) => (item.id === resource.id ? { ...item, is_done: nextDone } : item)),
    });

    try {
      const updated = await updateVaultResource(selectedCourse.id, resource.id, { is_done: nextDone });
      replaceCourse({
        ...selectedCourse,
        resources: selectedCourse.resources.map((item) => (item.id === updated.id ? updated : item)),
      });
    } catch (error) {
      replaceCourse(selectedCourse);
      setStatus(error.message || "Unable to update progress.");
    }
  };

  const handleVaultAiAction = async (resource, type) => {
    if (!resource.file_url) {
      setAiDrawer({
        open: true,
        type,
        title: resource.title,
        loading: false,
        error: "AI actions need an uploaded file. Links are not supported yet.",
        summary: [],
        quiz: [],
        source: "",
      });
      return;
    }

    setAiDrawer({
      open: true,
      type,
      title: resource.title,
      loading: true,
      error: "",
      summary: [],
      quiz: [],
      source: "",
    });
    setVaultQuizAnswers({});
    setVaultRevealedAnswers({});

    try {
      const imported = await createAILabDocumentFromVault(resource.id);
      const documentId = imported.document?.id;
      if (!documentId) {
        throw new Error("Unable to prepare this file for AI processing.");
      }

      if (type === "summary") {
        const response = await summarizeAILabDocument(documentId);
        setAiDrawer((current) => ({
          ...current,
          loading: false,
          summary: response.summary ?? [],
          quiz: [],
          source: response.source ?? "",
        }));
      } else {
        const response = await generateAILabMcqQuiz(documentId);
        setAiDrawer((current) => ({
          ...current,
          loading: false,
          summary: [],
          quiz: response.quiz ?? [],
          source: response.source ?? "",
        }));
      }
    } catch (error) {
      setAiDrawer((current) => ({
        ...current,
        loading: false,
        error: error.message || "Unable to process this file with AI.",
        source: "",
      }));
    }
  };

  const handleLinkSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCourse) return;

    setSaving(true);
    setStatus("");

    const normalizedUrl = normalizeExternalUrl(linkForm.url);
    const payload = {
      category: "link",
      title: linkForm.title.trim() || getUrlInfo(normalizedUrl).hostname,
      url: normalizedUrl,
      notes: linkForm.notes.trim(),
    };

    try {
      if (editingResource) {
        const updated = await updateVaultResource(selectedCourse.id, editingResource.id, payload);
        replaceCourse({
          ...selectedCourse,
          resources: selectedCourse.resources.map((item) => (item.id === updated.id ? updated : item)),
        });
        setStatus("Link updated.");
      } else {
        const created = await createVaultResource(selectedCourse.id, payload);
        replaceCourse({
          ...selectedCourse,
          resource_count: (selectedCourse.resource_count ?? selectedCourse.resources.length) + 1,
          resources: [...selectedCourse.resources, created],
        });
        setStatus("Link added.");
      }
      setLinkFormOpen(false);
      setEditingResource(null);
    } catch (error) {
      setStatus(error.message || "Unable to save link.");
    } finally {
      setSaving(false);
    }
  };

  const openSharePanel = async (resource) => {
    setSharePanel({ open: true, resource, friends: [], loading: true, message: "" });
    try {
      const response = await fetchCommunication();
      setSharePanel({ open: true, resource, friends: response.friends?.map((item) => item.friend) ?? [], loading: false, message: "" });
    } catch (error) {
      setSharePanel({ open: true, resource, friends: [], loading: false, message: error.message || "Unable to load friends." });
    }
  };

  const shareUrlFor = (resource) => getResourceTarget(resource) || window.location.href;
  const shareTextFor = (resource) => `${resource.title}\n${shareUrlFor(resource)}`;

  const handleNativeShare = async () => {
    const resource = sharePanel.resource;
    if (!resource) return;

    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, text: resource.notes || "Shared from StudentAssistant", url: shareUrlFor(resource) });
        setSharePanel((current) => ({ ...current, message: "Shared successfully." }));
        return;
      }
      await navigator.clipboard.writeText(shareTextFor(resource));
      setSharePanel((current) => ({ ...current, message: "Share link copied." }));
    } catch (error) {
      setSharePanel((current) => ({ ...current, message: error.message || "Unable to share." }));
    }
  };

  const handleCopyShareLink = async () => {
    const resource = sharePanel.resource;
    if (!resource) return;
    await navigator.clipboard.writeText(shareTextFor(resource));
    setSharePanel((current) => ({ ...current, message: "Share link copied." }));
  };

  const handleShareToFriend = async (friend) => {
    const resource = sharePanel.resource;
    if (!resource) return;

    try {
      const response = await createConversation(friend.id);
      const payload = new FormData();
      payload.append("body", resource.notes ? `Shared from Vault: ${resource.notes}` : "Shared a Vault file.");
      if (resource.file_url || resource.preview_url) {
        const token = getAuthToken();
        const fileResponse = await fetch(resource.preview_url || resource.file_url, {
          headers: token ? { Authorization: `Token ${token}` } : {},
        });
        if (!fileResponse.ok) {
          throw new Error("Unable to attach this file.");
        }
        const blob = await fileResponse.blob();
        const extension = resource.file_url?.split(".").pop()?.split("?")[0] || "file";
        const fileName = `${resource.title || "vault-resource"}.${extension}`;
        payload.append("attachment", new File([blob], fileName, { type: blob.type || "application/octet-stream" }));
      } else if (resource.url) {
        payload.set("body", `Shared a Vault link: ${resource.title || resource.url}\n${resource.url}`);
      }
      await sendConversationMessage(response.conversation.id, payload);
      setSharePanel((current) => ({ ...current, message: `Shared with ${friend.name || friend.email}.` }));
    } catch (error) {
      setSharePanel((current) => ({ ...current, message: error.message || "Unable to share with this friend." }));
    }
  };

  const handleOpenResource = async (event, resource) => {
    const target = getResourceTarget(resource);
    if (!target) return;

    if (!resource.preview_url) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      const viewerUrl = getResourceViewerUrl(resource);
      if (viewerUrl) {
        window.open(viewerUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const token = getAuthToken();
      const response = await fetch(resource.preview_url, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Unable to open file preview.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
      setStatus(error.message || "Unable to open file preview.");
    }
  };

  const handleDownloadResource = async (resource) => {
    if (!resource.download_url) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(resource.download_url, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Unable to download original file.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = resource.file?.split("/").pop() || resource.title || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      setStatus(error.message || "Unable to download original file.");
    }
  };

  const renderAiDrawer = () =>
    aiDrawer.open ? (
      <div className="fixed inset-0 z-50 bg-slate-950/60 lg:static lg:inset-auto lg:z-auto lg:bg-transparent" onClick={() => setAiDrawer((current) => ({ ...current, open: false }))}>
        <motion.aside
          initial={{ x: 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`${card} fixed bottom-20 right-3 top-16 z-50 w-[min(420px,calc(100vw-1.5rem))] min-w-0 overflow-hidden p-0 lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-5rem)] lg:w-auto`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">{aiDrawer.type === "summary" ? "AI Summary" : "AI Quiz"}</p>
                {(() => {
                  const indicator = getGenerationIndicator(
                    aiDrawer.source,
                    aiDrawer.type === "summary" ? aiDrawer.summary.length > 0 : aiDrawer.quiz.length > 0,
                  );
                  return indicator ? <span className={`${generationBadge} ${indicator.className}`}>{indicator.label}</span> : null;
                })()}
              </div>
              <h2 className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">{aiDrawer.title}</h2>
            </div>
            <button type="button" className={iconBtn} onClick={() => setAiDrawer((current) => ({ ...current, open: false }))} aria-label="Close AI panel">
              <X size={17} />
            </button>
          </div>

          <div className="h-[calc(100%-57px)] overflow-y-auto p-3">
            {aiDrawer.loading ? (
              <div className="grid h-full place-items-center text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="grid gap-3">
                  <Loader2 className="mx-auto animate-spin text-blue-600" size={24} />
                  <p>{aiDrawer.type === "summary" ? "Generating summary..." : "Generating quiz questions..."}</p>
                </div>
              </div>
            ) : aiDrawer.error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{aiDrawer.error}</div>
            ) : aiDrawer.type === "summary" ? (
              <div className="grid gap-3">
                {aiDrawer.summary.length > 0 ? (
                  aiDrawer.summary.map((item, index) => (
                    <article key={`${item.section}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                      <h3 className="text-xs font-black text-slate-950 dark:text-white">{item.section || `Key point ${index + 1}`}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{item.content}</p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs font-bold text-slate-500 dark:border-slate-800">No summary was generated.</div>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {aiDrawer.quiz.length > 0 ? (
                  aiDrawer.quiz.map((item, index) => {
                    const itemId = item.id ?? index;
                    const selectedAnswer = vaultQuizAnswers[itemId];
                    const isRevealed = Boolean(vaultRevealedAnswers[itemId]);
                    const showAnswer = Boolean(selectedAnswer || isRevealed);

                    return (
                      <article key={itemId} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xs font-black leading-5 text-slate-950 dark:text-white">
                            {index + 1}. {item.question}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setVaultRevealedAnswers((current) => ({ ...current, [itemId]: !current[itemId] }))}
                            className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-black text-blue-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 dark:bg-slate-950 dark:text-blue-300 dark:ring-slate-700"
                          >
                            {isRevealed ? "Hide" : "Show"}
                          </button>
                        </div>
                        <div className="mt-3 grid gap-2">
                          {(item.options ?? []).map((option) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === item.answer;
                            return (
                              <button
                                type="button"
                                key={option}
                                onClick={() => setVaultQuizAnswers((current) => ({ ...current, [itemId]: option }))}
                                className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                                  showAnswer && isCorrect
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100"
                                    : showAnswer && isSelected && !isCorrect
                                      ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100"
                                      : isSelected
                                        ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {showAnswer ? (
                          <div className="mt-3 rounded-lg bg-white p-3 text-xs font-semibold leading-5 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-700">
                            Correct answer: <span className="font-black text-emerald-600 dark:text-emerald-300">{item.answer}</span>
                            {item.explanation ? <p className="mt-1">{item.explanation}</p> : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs font-bold text-slate-500 dark:border-slate-800">No quiz was generated.</div>
                )}
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    ) : null;

  const renderSharePanel = () =>
    sharePanel.open && sharePanel.resource ? (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) setSharePanel({ open: false, resource: null, friends: [], loading: false, message: "" }); }}>
        <div className="w-[min(620px,100%)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">Share Resource</p>
              <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{sharePanel.resource.title}</h2>
              <p className="mt-1 break-all text-xs font-semibold text-slate-500">{shareUrlFor(sharePanel.resource)}</p>
            </div>
            <button type="button" className={iconBtn} onClick={() => setSharePanel({ open: false, resource: null, friends: [], loading: false, message: "" })} aria-label="Close share panel"><X size={17} /></button>
          </div>

          {sharePanel.message ? <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{sharePanel.message}</div> : null}

          <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
            <ShareTile as="button" icon={Share2} label="Device" gradient="from-blue-500 via-indigo-500 to-violet-500" onClick={handleNativeShare} />
            <ShareTile as="button" icon={Copy} label="Copy Link" gradient="from-slate-600 to-slate-900" onClick={handleCopyShareLink} />
            <ShareTile as="a" icon={Mail} label="Email" gradient="from-blue-500 to-sky-600" href={`mailto:?subject=${encodeURIComponent(sharePanel.resource.title)}&body=${encodeURIComponent(shareTextFor(sharePanel.resource))}`} />
            <ShareTile as="a" icon={MessageCircle} label="WhatsApp" gradient="from-emerald-500 to-green-600" href={`https://wa.me/?text=${encodeURIComponent(shareTextFor(sharePanel.resource))}`} target="_blank" rel="noreferrer" />
            <ShareTile as="a" icon={ExternalLink} label="Messenger" gradient="from-blue-600 to-violet-600" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrlFor(sharePanel.resource))}`} target="_blank" rel="noreferrer" />
            <ShareTile as="a" icon={ExternalLink} label="Open File" gradient="from-cyan-500 to-blue-600" href={shareUrlFor(sharePanel.resource)} target="_blank" rel="noreferrer" />
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-black text-slate-950 dark:text-white">Share inside StudentAssistant</h3>
            {sharePanel.loading ? (
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading friends...</div>
            ) : sharePanel.friends.length ? (
              <div className="grid max-h-56 gap-2 overflow-y-auto pr-1">
                {sharePanel.friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950 dark:text-white">{friend.name || friend.email}</p>
                      <p className="truncate text-xs font-bold text-slate-500">{friend.email}</p>
                    </div>
                    <button type="button" className={primaryBtn} onClick={() => handleShareToFriend(friend)}><Send size={15} /> Send</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/60">No friends yet. Add friends in Communicate to share inside the app.</div>
            )}
          </div>
        </div>
      </div>
    ) : null;
  const renderCourseForm = () => courseFormOpen ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) setCourseFormOpen(false); }}>
      <motion.section initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`${card} max-h-[calc(100vh-32px)] w-[min(760px,100%)] overflow-y-auto bg-white backdrop-blur-none dark:bg-slate-900`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950 dark:text-white">{editingCourse ? "Edit Course Folder" : "Add Course Folder"}</h2>
          <button type="button" className={iconBtn} onClick={() => setCourseFormOpen(false)} aria-label="Close course form"><X size={17} /></button>
        </div>
        <form className="grid gap-3 md:grid-cols-[160px_180px_minmax(0,1fr)]" onSubmit={handleCourseSubmit}>
          <label className={field}><span className={label}>Semester</span><select value={courseForm.semester} onChange={(event) => setCourseForm({ ...courseForm, semester: event.target.value })} className={input}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Semester {index + 1}</option>)}</select></label>
          <label className={field}><span className={label}>Course Code</span><input value={courseForm.code} onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })} className={input} placeholder="CSE-221" required maxLength="40" /></label>
          <label className={field}><span className={label}>Course Title</span><input value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} className={input} placeholder="Data Structures" required maxLength="160" /></label>
          <div className="flex justify-end gap-2 md:col-span-3"><button type="button" className={secondaryBtn} onClick={() => setCourseFormOpen(false)}>Cancel</button><button type="submit" className={primaryBtn} disabled={saving}><Plus size={17} /><span>{saving ? "Saving..." : "Save"}</span></button></div>
        </form>
      </motion.section>
    </motion.div>
  ) : null;

  const renderResourceForm = () => resourceFormOpen && selectedCourse ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) setResourceFormOpen(false); }}>
      <motion.section initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`${card} max-h-[calc(100vh-32px)] w-[min(900px,100%)] overflow-y-auto bg-white backdrop-blur-none dark:bg-slate-900`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950 dark:text-white">{editingResource ? "Edit Resource" : "Add Resource"}</h2>
          <button type="button" className={iconBtn} onClick={() => setResourceFormOpen(false)} aria-label="Close resource form"><X size={17} /></button>
        </div>
        <form className="grid gap-3" onSubmit={handleResourceSubmit}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className={field}><span className={label}>Section</span><select value={resourceForm.category} onChange={(event) => setResourceForm({ ...resourceForm, category: event.target.value })} className={input}>{sections.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}</select></label>
            {resourceForm.files.length > 1 && !editingResource ? (
              <div className={`${field} md:col-span-2`}>
                <span className={label}>Title</span>
                <div className="grid min-h-11 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                  Multiple files will use their own file names automatically.
                </div>
              </div>
            ) : (
              <label className={`${field} md:col-span-2`}><span className={label}>Title <span className="text-xs font-bold text-slate-400">(optional)</span></span><input value={resourceForm.title} onChange={(event) => setResourceForm({ ...resourceForm, title: event.target.value })} className={input} placeholder="Leave blank to use the file name" maxLength="180" /></label>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className={field}><span className={label}>Link or File URL</span><input type="text" inputMode="url" value={resourceForm.url} onChange={(event) => setResourceForm({ ...resourceForm, url: event.target.value })} className={input} placeholder="example.com/file or https://..." /></label>
            <label className={field}><span className={label}>Notes</span><input value={resourceForm.notes} onChange={(event) => setResourceForm({ ...resourceForm, notes: event.target.value })} className={input} placeholder="Short description" /></label>
          </div>
          <div className={field}>
            <span className={label}>Upload File</span>
            <div className="grid gap-3">
              <input
                key={resourceFileInputKey}
                id="vault-resource-file-input"
                type="file"
                multiple={!editingResource}
                onChange={(event) => setResourceForm({ ...resourceForm, files: Array.from(event.target.files ?? []) })}
                className="sr-only"
              />
              <label
                htmlFor="vault-resource-file-input"
                className="group grid min-h-48 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-blue-500 bg-white p-5 text-center transition-all hover:border-blue-600 hover:bg-blue-50/70 dark:border-blue-400 dark:bg-slate-950 dark:hover:border-blue-300 dark:hover:bg-blue-500/10"
              >
                <span className="grid justify-items-center gap-3">
                  <span className="grid size-16 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition group-hover:-translate-y-1 group-hover:bg-blue-700 dark:bg-blue-500 dark:group-hover:bg-blue-400">
                    <UploadCloud size={34} />
                  </span>
                  <span className="text-base font-medium text-slate-950 dark:text-white">Browse Files to upload</span>
                </span>
              </label>
              <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 text-sm font-semibold text-slate-950 dark:bg-slate-800 dark:text-white">
                <FileText className="shrink-0 text-blue-600 dark:text-blue-300" size={18} />
                <span className="min-w-0 flex-1 truncate text-right">
                  {resourceForm.files.length
                    ? resourceForm.files.length === 1
                      ? resourceForm.files[0].name
                      : `${resourceForm.files.length} selected files`
                    : "No selected File -"}
                </span>
                <button
                  type="button"
                  className="grid size-7 shrink-0 place-items-center rounded-md text-slate-800 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  onClick={() => {
                    setResourceForm({ ...resourceForm, files: [] });
                    setResourceFileInputKey((current) => current + 1);
                  }}
                  aria-label="Clear selected files"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {editingResource ? "Choose one replacement file." : "Choose one or multiple files. Multiple uploads will create separate resource items using each file name."}
              </p>
              {resourceUploadProgress > 0 ? (
                <UploadProgressBar progress={resourceUploadProgress} label={resourceForm.files.length > 1 ? `Uploading ${resourceForm.files.length} files` : "Uploading file"} />
              ) : null}
            </div>
          </div>
          <div className="flex justify-end gap-2"><button type="button" className={secondaryBtn} onClick={() => setResourceFormOpen(false)}>Cancel</button><button type="submit" className={primaryBtn} disabled={saving || resourceUploadProgress > 0}><Plus size={17} /><span>{saving ? "Saving..." : "Save Resource"}</span></button></div>
        </form>
      </motion.section>
    </motion.div>
  ) : null;

  const renderLinkForm = () => linkFormOpen && selectedCourse ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) setLinkFormOpen(false); }}>
      <motion.section initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="max-h-[calc(100vh-32px)] w-[min(680px,100%)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/25 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-950 dark:text-white">{editingResource ? "Edit Link" : "Add Link"}</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">Links do not need files. Add a website, YouTube video, playlist, Drive link, or reference page.</p>
          </div>
          <button type="button" className={iconBtn} onClick={() => setLinkFormOpen(false)} aria-label="Close link form"><X size={17} /></button>
        </div>
        <form className="grid gap-3" onSubmit={handleLinkSubmit}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className={`${field} md:col-span-2`}><span className={label}>Website / Video URL</span><input type="text" inputMode="url" value={linkForm.url} onChange={(event) => setLinkForm({ ...linkForm, url: event.target.value })} className={input} placeholder="youtube.com/watch?v=... or https://..." required /></label>
            <label className={field}><span className={label}>Section</span><select value="link" disabled className={input}><option>Links</option></select></label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className={field}><span className={label}>Title</span><input value={linkForm.title} onChange={(event) => setLinkForm({ ...linkForm, title: event.target.value })} className={input} placeholder="Optional title" maxLength="180" /></label>
            <label className={field}><span className={label}>Notes</span><input value={linkForm.notes} onChange={(event) => setLinkForm({ ...linkForm, notes: event.target.value })} className={input} placeholder="Short description" /></label>
          </div>
          {linkForm.url ? <LinkPreviewCard resource={{ ...linkForm, title: linkForm.title || getUrlInfo(linkForm.url).hostname }} onOpenInApp={() => {}} compact /> : null}
          <div className="flex justify-end gap-2"><button type="button" className={secondaryBtn} onClick={() => setLinkFormOpen(false)}>Cancel</button><button type="submit" className={primaryBtn} disabled={saving}><Plus size={17} /><span>{saving ? "Saving..." : "Save Link"}</span></button></div>
        </form>
      </motion.section>
    </motion.div>
  ) : null;


  if (selectedCourse) {
    return (
      <VaultCourseWorkspace
        activeSection={activeSection}
        aiDrawerOpen={aiDrawer.open}
        handleDeleteResource={handleDeleteResource}
        handleDownloadResource={handleDownloadResource}
        handleOpenResource={handleOpenResource}
        handleToggleResourceDone={handleToggleResourceDone}
        handleVaultAiAction={handleVaultAiAction}
        hoveredResource={hoveredResource}
        openCourseForm={openCourseForm}
        openLinkForm={openLinkForm}
        openResourceForm={openResourceForm}
        openSharePanel={openSharePanel}
        renderAiDrawer={renderAiDrawer}
        renderCourseForm={renderCourseForm}
        renderLinkForm={renderLinkForm}
        renderResourceForm={renderResourceForm}
        renderSharePanel={renderSharePanel}
        selectedCourse={selectedCourse}
        setActiveSection={setActiveSection}
        setHoveredResource={setHoveredResource}
        setSelectedCourseId={setSelectedCourseId}
        status={status}
      />
    );
  }

  return (
    <>
      {renderCourseForm()}
      <VaultCourseList
        handleDeleteCourse={handleDeleteCourse}
        loading={loading}
        openCourseForm={openCourseForm}
        semesterGroups={semesterGroups}
        setSelectedCourseId={setSelectedCourseId}
        status={status}
      />
    </>
  );
}


