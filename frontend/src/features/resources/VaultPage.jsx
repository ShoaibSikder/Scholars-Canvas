import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, ExternalLink, File as GenericFile, FileImage, FileQuestion, FileSpreadsheet, FileText, Folder, FolderOpen, Link as LinkIcon, Loader2, Pencil, Plus, Presentation, Share2, Sparkles, Trash2, X } from "lucide-react";

import { createAILabDocumentFromVault, createVaultCourse, createVaultResource, deleteVaultCourse, deleteVaultResource, fetchResources, generateAILabMcqQuiz, summarizeAILabDocument, updateVaultCourse, updateVaultResource } from "../../services/appService";
import { useAlert } from "../../components/common/AlertProvider";

const emptyCourse = { semester: 1, code: "", title: "" };
const emptyResource = { category: "mid_term", title: "", resource_type: "pdf", url: "", notes: "", file: null };
const SELECTED_COURSE_KEY = "studentassistant_vault_selected_course";
const sections = [
  { key: "mid_term", label: "Mid Term", icon: FileText },
  { key: "final", label: "Final", icon: BookOpen },
  { key: "assignment", label: "Assignment / Presentation", icon: FolderOpen },
  { key: "link", label: "Links", icon: LinkIcon },
];
const resourceTypes = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "slide", label: "Slide" },
  { value: "image", label: "Image" },
  { value: "link", label: "Link" },
  { value: "other", label: "Other" },
];

const primaryBtn = "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 text-xs font-black text-white shadow-md shadow-blue-500/20";
const secondaryBtn = "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const iconBtn = "grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
const card = "rounded-lg border border-white/80 bg-white/90 p-3 shadow-md shadow-blue-950/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90";
const input = "min-h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white";
const field = "grid gap-2";
const label = "text-xs font-bold text-slate-700 dark:text-slate-200";

function flattenCourses(groups) {
  return groups.flatMap((group) => group.courses ?? []);
}

function groupCourses(courses) {
  return courses
    .reduce((groups, course) => {
      const group = groups.find((item) => item.semester === course.semester);
      if (group) {
        group.courses.push(course);
      } else {
        groups.push({ semester: course.semester, courses: [course] });
      }
      return groups;
    }, [])
    .sort((a, b) => b.semester - a.semester);
}

function formatDate(value) {
  if (!value) {
    return "Recently";
  }
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function getResourceTarget(item) {
  return item.file_url || item.url || "";
}

function getResourceVisual(item) {
  const source = `${item.resource_type ?? ""} ${item.title ?? ""} ${item.file ?? ""} ${item.file_url ?? ""} ${item.url ?? ""}`.toLowerCase();

  if (source.includes("link") || /^https?:/.test(item.url ?? "")) {
    return { Icon: LinkIcon, className: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300", label: "LINK" };
  }
  if (source.includes(".pdf") || item.resource_type === "pdf") {
    return { Icon: FileText, className: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300", label: "PDF" };
  }
  if (source.includes(".doc") || source.includes("document") || item.resource_type === "doc") {
    return { Icon: FileText, className: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300", label: "DOC" };
  }
  if (source.includes(".ppt") || source.includes("slide") || item.resource_type === "slide") {
    return { Icon: Presentation, className: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300", label: "SLIDE" };
  }
  if (source.includes(".xls") || source.includes("spreadsheet")) {
    return { Icon: FileSpreadsheet, className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", label: "SHEET" };
  }
  if (source.includes(".png") || source.includes(".jpg") || source.includes(".jpeg") || source.includes("image")) {
    return { Icon: FileImage, className: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300", label: "IMG" };
  }

  return { Icon: GenericFile, className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", label: "FILE" };
}

export default function VaultPage({ openRequest = null } = {}) {
  const { confirm } = useAlert();
  const [semesterGroups, setSemesterGroups] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(() => {
    const stored = localStorage.getItem(SELECTED_COURSE_KEY);
    return stored ? Number(stored) : null;
  });
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [activeSection, setActiveSection] = useState("mid_term");
  const [hoveredResource, setHoveredResource] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
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
  });

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
    setEditingResource(resource);
    setResourceForm(resource ? {
      category: resource.category,
      title: resource.title,
      resource_type: resource.resource_type,
      url: resource.url ?? "",
      notes: resource.notes ?? "",
      file: null,
    } : { ...emptyResource, category });
    setResourceFormOpen(true);
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
    const payload = new FormData();
    payload.append("category", resourceForm.category);
    payload.append("title", resourceForm.title.trim());
    payload.append("resource_type", resourceForm.resource_type);
    payload.append("url", resourceForm.url.trim());
    payload.append("notes", resourceForm.notes.trim());
    if (resourceForm.file) {
      payload.append("file", resourceForm.file);
    }

    try {
      if (editingResource) {
        const updated = await updateVaultResource(selectedCourse.id, editingResource.id, payload);
        replaceCourse({
          ...selectedCourse,
          resources: selectedCourse.resources.map((item) => (item.id === updated.id ? updated : item)),
        });
        setStatus("Resource updated.");
      } else {
        const created = await createVaultResource(selectedCourse.id, payload);
        replaceCourse({
          ...selectedCourse,
          resource_count: (selectedCourse.resource_count ?? selectedCourse.resources.length) + 1,
          resources: [...selectedCourse.resources, created],
        });
        setStatus("Resource added.");
      }
      setResourceFormOpen(false);
      setEditingResource(null);
    } catch (error) {
      setStatus(error.message || "Unable to save resource.");
    } finally {
      setSaving(false);
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
        }));
      } else {
        const response = await generateAILabMcqQuiz(documentId);
        setAiDrawer((current) => ({
          ...current,
          loading: false,
          summary: [],
          quiz: response.quiz ?? [],
        }));
      }
    } catch (error) {
      setAiDrawer((current) => ({
        ...current,
        loading: false,
        error: error.message || "Unable to process this file with AI.",
      }));
    }
  };

  const renderAiDrawer = () =>
    aiDrawer.open ? (
      <div className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-[1px]" onClick={() => setAiDrawer((current) => ({ ...current, open: false }))}>
        <motion.aside
          initial={{ x: 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`${card} fixed bottom-20 right-3 top-16 z-50 w-[min(420px,calc(100vw-1.5rem))] min-w-0 overflow-hidden p-0 lg:bottom-4 lg:top-16`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">{aiDrawer.type === "summary" ? "AI Summary" : "AI Quiz"}</p>
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
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{item.content}</p>
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
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
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
  const renderCourseForm = () => courseFormOpen ? (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-950 dark:text-white">{editingCourse ? "Edit Course Folder" : "Add Course Folder"}</h2>
        <button type="button" className={iconBtn} onClick={() => setCourseFormOpen(false)} aria-label="Close course form"><X size={17} /></button>
      </div>
      <form className="grid gap-3 md:grid-cols-[160px_180px_1fr_auto]" onSubmit={handleCourseSubmit}>
        <label className={field}><span className={label}>Semester</span><select value={courseForm.semester} onChange={(event) => setCourseForm({ ...courseForm, semester: event.target.value })} className={input}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Semester {index + 1}</option>)}</select></label>
        <label className={field}><span className={label}>Course Code</span><input value={courseForm.code} onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })} className={input} placeholder="CSE-221" required maxLength="40" /></label>
        <label className={field}><span className={label}>Course Title</span><input value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} className={input} placeholder="Data Structures" required maxLength="160" /></label>
        <button type="submit" className={`${primaryBtn} self-end`} disabled={saving}><Plus size={17} /><span>{saving ? "Saving..." : "Save"}</span></button>
      </form>
    </motion.section>
  ) : null;

  const renderResourceForm = () => resourceFormOpen && selectedCourse ? (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-950 dark:text-white">{editingResource ? "Edit Resource" : "Add Resource"}</h2>
        <button type="button" className={iconBtn} onClick={() => setResourceFormOpen(false)} aria-label="Close resource form"><X size={17} /></button>
      </div>
      <form className="grid gap-3" onSubmit={handleResourceSubmit}>
        <div className="grid gap-3 md:grid-cols-3">
          <label className={field}><span className={label}>Section</span><select value={resourceForm.category} onChange={(event) => setResourceForm({ ...resourceForm, category: event.target.value })} className={input}>{sections.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}</select></label>
          <label className={field}><span className={label}>Type</span><select value={resourceForm.resource_type} onChange={(event) => setResourceForm({ ...resourceForm, resource_type: event.target.value })} className={input}>{resourceTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
          <label className={field}><span className={label}>Title</span><input value={resourceForm.title} onChange={(event) => setResourceForm({ ...resourceForm, title: event.target.value })} className={input} placeholder="Chapter 1 notes" required maxLength="180" /></label>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className={field}><span className={label}>Upload File</span><input type="file" onChange={(event) => setResourceForm({ ...resourceForm, file: event.target.files?.[0] ?? null })} className={`${input} py-2`} /></label>
          <label className={field}><span className={label}>Link or File URL</span><input type="url" value={resourceForm.url} onChange={(event) => setResourceForm({ ...resourceForm, url: event.target.value })} className={input} placeholder="https://..." /></label>
          <label className={field}><span className={label}>Notes</span><input value={resourceForm.notes} onChange={(event) => setResourceForm({ ...resourceForm, notes: event.target.value })} className={input} placeholder="Short description" /></label>
        </div>
        <div><button type="submit" className={primaryBtn} disabled={saving}><Plus size={17} /><span>{saving ? "Saving..." : "Save Resource"}</span></button></div>
      </form>
    </motion.section>
  ) : null;

  if (selectedCourse) {
    return (
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className={iconBtn} onClick={() => setSelectedCourseId(null)} aria-label="Back to vault"><ArrowLeft size={18} /></button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black tracking-tight text-slate-950 dark:text-white">{selectedCourse.title}</h1>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Semester {selectedCourse.semester} / {selectedCourse.code}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondaryBtn} onClick={() => openCourseForm(selectedCourse)}><Pencil size={16} /><span>Edit Course</span></button>
            <button type="button" className={primaryBtn} onClick={() => openResourceForm()}><Plus size={18} /><span>Add Resource</span></button>
          </div>
        </div>

        {status ? <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{status}</div> : null}
        {renderCourseForm()}
        {renderResourceForm()}

        <div className="grid gap-3">
          <div className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const count = selectedCourse.resources.filter((item) => item.category === section.key).length;
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    className={`inline-flex items-center gap-2 border-b-2 px-3 py-1.5 text-sm font-black transition-colors ${
                      activeSection === section.key
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{section.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeSection === section.key ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid items-start gap-3">
            <div className="min-w-0">
          {sections.map((section) => {
            if (activeSection !== section.key) {
              return null;
            }

            const Icon = section.icon;
            const items = selectedCourse.resources.filter((item) => item.category === section.key);
            return (
              <motion.section key={section.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"><Icon size={20} /></div>
                    <div><h2 className="font-black text-slate-950 dark:text-white">{section.label}</h2><p className="text-xs font-bold text-slate-500">{items.length} item{items.length === 1 ? "" : "s"}</p></div>
                  </div>
                  <button type="button" className={secondaryBtn} onClick={() => openResourceForm(null, section.key)}><Plus size={15} /><span>Add</span></button>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/30">
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-xs font-bold text-slate-500">No resources yet.</div>
                  ) : items.map((item) => {
                    const visual = getResourceVisual(item);
                    const ResourceIcon = visual.Icon;
                    const isHovered = hoveredResource === item.id;
                    return (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer border-b border-slate-200 px-3 py-2.5 transition-all duration-200 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70 ${item.is_done ? "bg-emerald-50/60 dark:bg-emerald-500/5" : ""}`}
                      onMouseEnter={() => setHoveredResource(item.id)}
                      onMouseLeave={() => setHoveredResource(null)}
                      style={{ transform: isHovered ? "translateX(5px)" : "translateX(0)" }}
                    >
                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <a
                            className={`grid size-8 shrink-0 place-items-center rounded-lg transition hover:scale-105 ${visual.className} ${getResourceTarget(item) ? "" : "pointer-events-none"}`}
                            href={getResourceTarget(item) || undefined}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${item.title}`}
                          >
                            <ResourceIcon size={20} />
                          </a>
                          <div className="min-w-0">
                            {getResourceTarget(item) ? (
                              <a href={getResourceTarget(item)} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold text-slate-800 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-300">
                                {item.title}
                              </a>
                            ) : (
                              <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{item.title}</p>
                            )}
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <span>{visual.label}</span>
                              <span className="text-slate-300 dark:text-slate-600">/</span>
                              <span>{formatDate(item.created_at)}</span>
                              {item.is_done ? <span className="text-emerald-600 dark:text-emerald-300">Done</span> : null}
                              {item.file_url ? <span className="text-blue-600 dark:text-blue-300">Uploaded file</span> : null}
                              {item.url ? <span className="text-emerald-600 dark:text-emerald-300">External link</span> : null}
                            </div>
                            {item.notes ? <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{item.notes}</p> : null}
                          </div>
                        </div>
                        <div className={`flex flex-wrap items-center gap-2 ${isHovered ? "lg:flex lg:animate-in lg:fade-in lg:slide-in-from-right-5 lg:duration-200" : "lg:hidden"}`}>
                          <button type="button" className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-black transition active:scale-95 sm:px-3 sm:text-sm ${item.is_done ? "bg-emerald-600 text-white lg:hover:bg-emerald-700" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 lg:hover:bg-emerald-200"}`} onClick={() => handleToggleResourceDone(item)}><CheckCircle2 size={14} /><span>{item.is_done ? "Done" : "Done"}</span></button>
                          <button type="button" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-blue-100 px-2 py-1.5 text-xs font-black text-blue-700 transition active:scale-95 dark:bg-blue-500/15 dark:text-blue-300 sm:px-3 sm:text-sm lg:hover:bg-blue-200" onClick={() => handleVaultAiAction(item, "summary")}><Sparkles size={14} /><span className="hidden sm:inline">Summarize</span></button>
                          <button type="button" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-violet-100 px-2 py-1.5 text-xs font-black text-violet-700 transition active:scale-95 dark:bg-violet-500/15 dark:text-violet-300 sm:px-3 sm:text-sm lg:hover:bg-violet-200" onClick={() => handleVaultAiAction(item, "quiz")}><FileQuestion size={14} /><span className="hidden sm:inline">Quiz</span></button>
                          <button type="button" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-100 px-2 py-1.5 text-xs font-black text-emerald-700 transition active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-300 sm:px-3 sm:text-sm lg:hover:bg-emerald-200"><Share2 size={14} /><span className="hidden sm:inline">Share</span></button>
                          {item.file_url ? <a className={iconBtn} href={item.file_url} target="_blank" rel="noreferrer" aria-label="Open uploaded file"><FileText size={16} /></a> : null}
                          {item.url ? <a className={iconBtn} href={item.url} target="_blank" rel="noreferrer" aria-label="Open resource"><ExternalLink size={16} /></a> : null}
                          <button type="button" className={iconBtn} onClick={() => openResourceForm(item)} aria-label="Edit resource"><Pencil size={16} /></button>
                          <button type="button" className={iconBtn} onClick={() => handleDeleteResource(item)} aria-label="Delete resource"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </motion.section>
            );
          })}
            </div>
          </div>
          {renderAiDrawer()}
          </div>
        </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-black tracking-tight text-slate-950 dark:text-white">Resource Vault</h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Course folders by semester, latest semester first</p>
        </div>
        <button type="button" className={primaryBtn} onClick={() => openCourseForm()}><Plus size={18} /><span>Add Course</span></button>
      </div>

      {status ? <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{status}</div> : null}
      {renderCourseForm()}

      {loading ? (
        <div className={card}>Loading vault...</div>
      ) : semesterGroups.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white/70 py-7 text-center dark:border-slate-700 dark:bg-slate-900/70">
          <Folder className="size-6 text-slate-400" />
          <div><h2 className="text-sm font-black text-slate-950 dark:text-white">No course folders yet</h2><p className="mt-1 text-xs font-semibold text-slate-500">Add your first course folder to start organizing resources.</p></div>
          <button type="button" className={primaryBtn} onClick={() => openCourseForm()}><Plus size={18} /><span>Add Course</span></button>
        </div>
      ) : (
        <div className="grid gap-3">
          {semesterGroups.map((group) => (
            <section key={group.semester} className="grid gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-slate-900/10 dark:bg-white dark:text-slate-950">Semester {group.semester}</span>
                <span className="text-xs font-bold text-slate-500">{group.courses.length} course{group.courses.length === 1 ? "" : "s"}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {group.courses.map((course) => (
                  <motion.article key={course.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="group relative overflow-hidden rounded-lg border border-white/80 bg-white/90 p-3 shadow-md shadow-blue-950/5 transition hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900/90">
                    <button type="button" className="block w-full text-left" onClick={() => setSelectedCourseId(course.id)}>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 dark:from-blue-500/20 dark:to-violet-500/20 dark:text-blue-300"><Folder size={20} /></div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">{course.resource_count ?? course.resources.length} items</span>
                      </div>
                      <h3 className="text-sm font-black text-slate-950 dark:text-white">{course.code}</h3>
                      <p className="mt-1 min-h-6 text-xs font-bold text-slate-500 dark:text-slate-400">{course.title}</p>
                    </button>
                    <div className="mt-3 flex gap-1.5">
                      <button type="button" className={iconBtn} onClick={() => openCourseForm(course)} aria-label="Edit course"><Pencil size={16} /></button>
                      <button type="button" className={iconBtn} onClick={() => handleDeleteCourse(course)} aria-label="Delete course"><Trash2 size={16} /></button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}











