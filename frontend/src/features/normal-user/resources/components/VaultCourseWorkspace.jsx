import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileQuestion,
  FileText,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";

import InPageStatus from "../../../../components/common/InPageStatus";
import SectionTransition from "../../../../components/common/SectionTransition";
import {
  card,
  iconBtn,
  primaryBtn,
  secondaryBtn,
  sections,
} from "../vaultConstants";
import { formatDate, getResourceTarget, getResourceVisual } from "../vaultUtils";
import { LinkPreviewCard } from "./VaultShared";

export default function VaultCourseWorkspace({
  activeSection,
  aiDrawerOpen,
  handleDeleteResource,
  handleDownloadResource,
  handleOpenResource,
  handleToggleResourceDone,
  handleVaultAiAction,
  hoveredResource,
  openCourseForm,
  openLinkForm,
  openResourceForm,
  openSharePanel,
  renderAiDrawer,
  renderCourseForm,
  renderLinkForm,
  renderResourceForm,
  renderSharePanel,
  selectedCourse,
  setActiveSection,
  setHoveredResource,
  setSelectedCourseId,
  status,
}) {
  return (
    <div className="grid h-[calc(100dvh-4.75rem)] min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden lg:h-[calc(100dvh-4.5rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className={iconBtn}
            onClick={() => setSelectedCourseId(null)}
            aria-label="Back to vault"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
              {selectedCourse.title}
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Semester {selectedCourse.semester} / {selectedCourse.code}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryBtn}
            onClick={() => openCourseForm(selectedCourse)}
          >
            <Pencil size={16} />
            <span>Edit Course</span>
          </button>
          <button type="button" className={primaryBtn} onClick={() => openResourceForm()}>
            <Plus size={18} />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      <div className={`grid min-h-0 gap-3 overflow-hidden ${status ? "grid-rows-[auto_auto_minmax(0,1fr)]" : "grid-rows-[auto_minmax(0,1fr)]"}`}>
        <InPageStatus message={status} />

        <div className="min-w-0 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div className="thin-scrollbar flex max-w-full gap-2 overflow-x-auto overscroll-x-contain whitespace-nowrap pb-0.5">
            {sections.map((section) => {
              const Icon = section.icon;
              const count = selectedCourse.resources.filter(
                (item) => item.category === section.key,
              ).length;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-1.5 text-sm font-black transition-colors ${
                    activeSection === section.key
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{section.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${activeSection === section.key ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <SectionTransition sectionKey={`vault-${activeSection}`}>
          <div
            className={`grid h-full min-h-0 items-stretch gap-3 ${aiDrawerOpen ? "lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]" : ""}`}
          >
          <div className="h-full min-h-0 min-w-0">
            {sections.map((section) => {
              if (activeSection !== section.key) return null;

              const Icon = section.icon;
              const items = selectedCourse.resources.filter(
                (item) => item.category === section.key,
              );
              return (
                <section
                  key={section.key}
                  className={`${card} flex h-full min-h-0 flex-col overflow-hidden`}
                >
                  <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h2 className="font-black text-slate-950 dark:text-white">
                          {section.label}
                        </h2>
                        <p className="text-xs font-bold text-slate-500">
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={secondaryBtn}
                      onClick={() =>
                        section.key === "link"
                          ? openLinkForm()
                          : openResourceForm(null, section.key)
                      }
                    >
                      <Plus size={15} />
                      <span>Add</span>
                    </button>
                  </div>
                  {section.key === "link" ? (
                    <div className="scroll-panel thin-scrollbar grid flex-1 grid-cols-[repeat(auto-fill,minmax(190px,260px))] content-start rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/30">
                      {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs font-bold text-slate-500 dark:border-slate-800">
                          No links yet.
                        </div>
                      ) : (
                        items.map((item) => (
                          <LinkPreviewCard
                            key={item.id}
                            resource={item}
                            onEdit={() => openLinkForm(item)}
                            onDelete={() => handleDeleteResource(item)}
                          />
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="scroll-panel thin-scrollbar flex-1 rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/30">
                      {items.length === 0 ? (
                        <div className="p-8 text-center text-xs font-bold text-slate-500">
                          No resources yet.
                        </div>
                      ) : (
                        items.map((item) => {
                          const visual = getResourceVisual(item);
                          const ResourceIcon = visual.Icon;
                          const isHovered = hoveredResource === item.id;
                          return (
                            <div
                              key={item.id}
                              className={`relative cursor-pointer border-b border-slate-200 px-3 py-2.5 transition-all duration-200 last:border-b-0 hover:bg-blue-50/70 dark:border-slate-800 dark:hover:bg-blue-500/10 ${item.is_done ? "bg-emerald-50/60 dark:bg-emerald-500/5" : ""}`}
                              onMouseEnter={() => setHoveredResource(item.id)}
                              onMouseLeave={() => setHoveredResource(null)}
                              style={{
                                transform: isHovered
                                  ? "translateX(5px)"
                                  : "translateX(0)",
                              }}
                            >
                              <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <a
                                    className={`grid size-8 shrink-0 place-items-center rounded-lg transition hover:scale-105 ${visual.className} ${getResourceTarget(item) ? "" : "pointer-events-none"}`}
                                    href={getResourceTarget(item) || undefined}
                                    onClick={(event) =>
                                      handleOpenResource(event, item)
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Open ${item.title}`}
                                  >
                                    <ResourceIcon size={20} />
                                  </a>
                                  <div className="min-w-0">
                                    {getResourceTarget(item) ? (
                                      <a
                                        href={getResourceTarget(item)}
                                        onClick={(event) =>
                                          handleOpenResource(event, item)
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block truncate text-sm font-bold text-slate-800 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-300"
                                      >
                                        {item.title}
                                      </a>
                                    ) : (
                                      <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                                        {item.title}
                                      </p>
                                    )}
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                      <span>{visual.label}</span>
                                      <span className="text-slate-300 dark:text-slate-600">
                                        /
                                      </span>
                                      <span>{formatDate(item.created_at)}</span>
                                      {item.is_done ? (
                                        <span className="text-emerald-600 dark:text-emerald-300">
                                          Done
                                        </span>
                                      ) : null}
                                      {item.file_url ? (
                                        <span className="text-blue-600 dark:text-blue-300">
                                          Uploaded file
                                        </span>
                                      ) : null}
                                      {item.url ? (
                                        <span className="text-emerald-600 dark:text-emerald-300">
                                          External link
                                        </span>
                                      ) : null}
                                    </div>
                                    {item.notes ? (
                                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {item.notes}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                                <div
                                  className={`flex flex-wrap items-center gap-2 ${isHovered ? "lg:flex lg:animate-in lg:fade-in lg:slide-in-from-right-5 lg:duration-200" : "lg:hidden"}`}
                                >
                                  <button
                                    type="button"
                                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-black transition active:scale-95 sm:px-3 sm:text-sm ${item.is_done ? "bg-emerald-600 text-white lg:hover:bg-emerald-700 dark:lg:hover:bg-emerald-500" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 lg:hover:bg-emerald-200 dark:lg:hover:bg-emerald-500/25"}`}
                                    onClick={() => handleToggleResourceDone(item)}
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>{item.is_done ? "Done" : "Done"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-blue-100 px-2 py-1.5 text-xs font-black text-blue-700 transition active:scale-95 dark:bg-blue-500/15 dark:text-blue-300 sm:px-3 sm:text-sm lg:hover:bg-blue-200 dark:lg:hover:bg-blue-500/25"
                                    onClick={() => handleVaultAiAction(item, "summary")}
                                  >
                                    <Sparkles size={14} />
                                    <span className="hidden sm:inline">Summarize</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-violet-100 px-2 py-1.5 text-xs font-black text-violet-700 transition active:scale-95 dark:bg-violet-500/15 dark:text-violet-300 sm:px-3 sm:text-sm lg:hover:bg-violet-200 dark:lg:hover:bg-violet-500/25"
                                    onClick={() => handleVaultAiAction(item, "quiz")}
                                  >
                                    <FileQuestion size={14} />
                                    <span className="hidden sm:inline">Quiz</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-100 px-2 py-1.5 text-xs font-black text-emerald-700 transition active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-300 sm:px-3 sm:text-sm lg:hover:bg-emerald-200 dark:lg:hover:bg-emerald-500/25"
                                    onClick={() => openSharePanel(item)}
                                  >
                                    <Share2 size={14} />
                                    <span className="hidden sm:inline">Share</span>
                                  </button>
                                  {item.file_url ? (
                                    <a
                                      className={iconBtn}
                                      href={getResourceTarget(item)}
                                      onClick={(event) =>
                                        handleOpenResource(event, item)
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      aria-label="Open uploaded file"
                                    >
                                      <FileText size={16} />
                                    </a>
                                  ) : null}
                                  {item.download_url ? (
                                    <button
                                      type="button"
                                      className={iconBtn}
                                      onClick={() => handleDownloadResource(item)}
                                      aria-label="Download original file"
                                    >
                                      <Download size={16} />
                                    </button>
                                  ) : null}
                                  {item.url ? (
                                    <a
                                      className={iconBtn}
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      aria-label="Open resource"
                                    >
                                      <ExternalLink size={16} />
                                    </a>
                                  ) : null}
                                  <button
                                    type="button"
                                    className={iconBtn}
                                    onClick={() => openResourceForm(item)}
                                    aria-label="Edit resource"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className={iconBtn}
                                    onClick={() => handleDeleteResource(item)}
                                    aria-label="Delete resource"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          {renderAiDrawer()}
          </div>
        </SectionTransition>
        {renderSharePanel()}
      </div>

      {renderCourseForm()}
      {renderResourceForm()}
      {renderLinkForm()}
    </div>
  );
}


