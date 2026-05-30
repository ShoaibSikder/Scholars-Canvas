import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, ExternalLink, File as GenericFile, FileImage, FileSpreadsheet, FileText, Folder, FolderOpen, Link as LinkIcon, MessageSquare, Pencil, Plus, Presentation, Share2, Sparkles, Trash2, X } from "lucide-react";

import { createVaultCourse, createVaultResource, deleteVaultCourse, deleteVaultResource, fetchResources, updateVaultCourse, updateVaultResource } from "../../services/appService";
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

const primaryBtn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 font-bold text-white shadow-lg shadow-blue-500/25";
const secondaryBtn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const iconBtn = "grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
const card = "rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-blue-950/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90";
const input = "min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white";
const field = "grid gap-2";
const label = "text-sm font-bold text-slate-700 dark:text-slate-200";

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

export default function VaultPage() {
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

  const renderCourseForm = () => courseFormOpen ? (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">{editingCourse ? "Edit Course Folder" : "Add Course Folder"}</h2>
        <button type="button" className={iconBtn} onClick={() => setCourseFormOpen(false)} aria-label="Close course form"><X size={17} /></button>
      </div>
      <form className="grid gap-4 md:grid-cols-[160px_180px_1fr_auto]" onSubmit={handleCourseSubmit}>
        <label className={field}><span className={label}>Semester</span><select value={courseForm.semester} onChange={(event) => setCourseForm({ ...courseForm, semester: event.target.value })} className={input}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Semester {index + 1}</option>)}</select></label>
        <label className={field}><span className={label}>Course Code</span><input value={courseForm.code} onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })} className={input} placeholder="CSE-221" required maxLength="40" /></label>
        <label className={field}><span className={label}>Course Title</span><input value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} className={input} placeholder="Data Structures" required maxLength="160" /></label>
        <button type="submit" className={`${primaryBtn} self-end`} disabled={saving}><Plus size={17} /><span>{saving ? "Saving..." : "Save"}</span></button>
      </form>
    </motion.section>
  ) : null;

  const renderResourceForm = () => resourceFormOpen && selectedCourse ? (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">{editingResource ? "Edit Resource" : "Add Resource"}</h2>
        <button type="button" className={iconBtn} onClick={() => setResourceFormOpen(false)} aria-label="Close resource form"><X size={17} /></button>
      </div>
      <form className="grid gap-4" onSubmit={handleResourceSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <label className={field}><span className={label}>Section</span><select value={resourceForm.category} onChange={(event) => setResourceForm({ ...resourceForm, category: event.target.value })} className={input}>{sections.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}</select></label>
          <label className={field}><span className={label}>Type</span><select value={resourceForm.resource_type} onChange={(event) => setResourceForm({ ...resourceForm, resource_type: event.target.value })} className={input}>{resourceTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
          <label className={field}><span className={label}>Title</span><input value={resourceForm.title} onChange={(event) => setResourceForm({ ...resourceForm, title: event.target.value })} className={input} placeholder="Chapter 1 notes" required maxLength="180" /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
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
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className={iconBtn} onClick={() => setSelectedCourseId(null)} aria-label="Back to vault"><ArrowLeft size={18} /></button>
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-black tracking-tight text-slate-950 dark:text-white">{selectedCourse.title}</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Semester {selectedCourse.semester} / {selectedCourse.code}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondaryBtn} onClick={() => openCourseForm(selectedCourse)}><Pencil size={16} /><span>Edit Course</span></button>
            <button type="button" className={primaryBtn} onClick={() => openResourceForm()}><Plus size={18} /><span>Add Resource</span></button>
          </div>
        </div>

        {status ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{status}</div> : null}
        {renderCourseForm()}
        {renderResourceForm()}

        <div className="grid gap-5">
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
                    className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-black transition-colors ${
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
                    <div className="grid size-11 place-items-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"><Icon size={20} /></div>
                    <div><h2 className="font-black text-slate-950 dark:text-white">{section.label}</h2><p className="text-xs font-bold text-slate-500">{items.length} item{items.length === 1 ? "" : "s"}</p></div>
                  </div>
                  <button type="button" className={secondaryBtn} onClick={() => openResourceForm(null, section.key)}><Plus size={15} /><span>Add</span></button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/30">
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-sm font-bold text-slate-500">No resources yet.</div>
                  ) : items.map((item) => {
                    const visual = getResourceVisual(item);
                    const ResourceIcon = visual.Icon;
                    const isHovered = hoveredResource === item.id;
                    return (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer border-b border-slate-200 px-5 py-4 transition-all duration-200 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70 ${item.is_done ? "bg-emerald-50/60 dark:bg-emerald-500/5" : ""}`}
                      onMouseEnter={() => setHoveredResource(item.id)}
                      onMouseLeave={() => setHoveredResource(null)}
                      style={{ transform: isHovered ? "translateX(5px)" : "translateX(0)" }}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <a
                            className={`grid size-10 shrink-0 place-items-center rounded-xl transition hover:scale-105 ${visual.className} ${getResourceTarget(item) ? "" : "pointer-events-none"}`}
                            href={getResourceTarget(item) || undefined}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${item.title}`}
                          >
                            <ResourceIcon size={20} />
                          </a>
                          <div className="min-w-0">
                            {getResourceTarget(item) ? (
                              <a href={getResourceTarget(item)} target="_blank" rel="noreferrer" className="block truncate font-bold text-slate-800 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-300">
                                {item.title}
                              </a>
                            ) : (
                              <p className="truncate font-bold text-slate-800 dark:text-white">{item.title}</p>
                            )}
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <span>{visual.label}</span>
                              <span className="text-slate-300 dark:text-slate-600">/</span>
                              <span>{formatDate(item.created_at)}</span>
                              {item.is_done ? <span className="text-emerald-600 dark:text-emerald-300">Done</span> : null}
                              {item.file_url ? <span className="text-blue-600 dark:text-blue-300">Uploaded file</span> : null}
                              {item.url ? <span className="text-emerald-600 dark:text-emerald-300">External link</span> : null}
                            </div>
                            {item.notes ? <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.notes}</p> : null}
                          </div>
                        </div>
                        {isHovered ? (
                          <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                            <button type="button" className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${item.is_done ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300"}`} onClick={() => handleToggleResourceDone(item)}><CheckCircle2 size={14} /><span>{item.is_done ? "Done" : "Mark Done"}</span></button>
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-300"><Sparkles size={14} /><span>Summarize</span></button>
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-violet-100 px-3 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-300"><MessageSquare size={14} /><span>Quiz</span></button>
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300"><Share2 size={14} /><span>Share</span></button>
                            {item.file_url ? <a className={iconBtn} href={item.file_url} target="_blank" rel="noreferrer" aria-label="Open uploaded file"><FileText size={16} /></a> : null}
                            {item.url ? <a className={iconBtn} href={item.url} target="_blank" rel="noreferrer" aria-label="Open resource"><ExternalLink size={16} /></a> : null}
                            <button type="button" className={iconBtn} onClick={() => openResourceForm(item)} aria-label="Edit resource"><Pencil size={16} /></button>
                            <button type="button" className={iconBtn} onClick={() => handleDeleteResource(item)} aria-label="Delete resource"><Trash2 size={16} /></button>
                          </div>
                        ) : null}
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
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Resource Vault</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Course folders by semester, latest semester first</p>
        </div>
        <button type="button" className={primaryBtn} onClick={() => openCourseForm()}><Plus size={18} /><span>Add Course</span></button>
      </div>

      {status ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{status}</div> : null}
      {renderCourseForm()}

      {loading ? (
        <div className={card}>Loading vault...</div>
      ) : semesterGroups.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/70 py-16 text-center dark:border-slate-700 dark:bg-slate-900/70">
          <Folder className="size-12 text-slate-400" />
          <div><h2 className="text-xl font-black text-slate-950 dark:text-white">No course folders yet</h2><p className="mt-1 text-sm font-semibold text-slate-500">Add your first course folder to start organizing resources.</p></div>
          <button type="button" className={primaryBtn} onClick={() => openCourseForm()}><Plus size={18} /><span>Add Course</span></button>
        </div>
      ) : (
        <div className="grid gap-8">
          {semesterGroups.map((group) => (
            <section key={group.semester} className="grid gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-950">Semester {group.semester}</span>
                <span className="text-sm font-bold text-slate-500">{group.courses.length} course{group.courses.length === 1 ? "" : "s"}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.courses.map((course) => (
                  <motion.article key={course.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-blue-950/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900/90">
                    <button type="button" className="block w-full text-left" onClick={() => setSelectedCourseId(course.id)}>
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 dark:from-blue-500/20 dark:to-violet-500/20 dark:text-blue-300"><Folder size={26} /></div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">{course.resource_count ?? course.resources.length} items</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">{course.code}</h3>
                      <p className="mt-1 min-h-10 text-sm font-bold text-slate-500 dark:text-slate-400">{course.title}</p>
                    </button>
                    <div className="mt-5 flex gap-2">
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
