import { Folder, Pencil, Plus, Trash2 } from "lucide-react";

import InPageStatus from "../../../../components/common/InPageStatus";
import SectionTransition from "../../../../components/common/SectionTransition";
import { card, iconBtn, primaryBtn } from "../vaultConstants";

export default function VaultCourseList({
  handleDeleteCourse,
  loading,
  openCourseForm,
  semesterGroups,
  setSelectedCourseId,
  status,
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
            Resource Vault
          </h1>
        </div>
        <button type="button" className={primaryBtn} onClick={() => openCourseForm()}>
          <Plus size={18} />
          <span>Add Course</span>
        </button>
      </div>

      <InPageStatus message={status} />

      <SectionTransition sectionKey="vault-list">
        {loading ? (
          <div className={card}>Loading vault...</div>
        ) : semesterGroups.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white/70 py-7 text-center dark:border-slate-700 dark:bg-slate-900/70">
            <Folder className="size-6 text-slate-400" />
            <div>
              <h2 className="text-sm font-black text-slate-950 dark:text-white">
                No course folders yet
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Add your first course folder to start organizing resources.
              </p>
            </div>
            <button type="button" className={primaryBtn} onClick={() => openCourseForm()}>
              <Plus size={18} />
              <span>Add Course</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {semesterGroups.map((group) => (
              <section key={group.semester} className="grid gap-3">
                <div className="flex min-h-9 items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-100/65 px-3 py-1 shadow-sm shadow-blue-500/5 dark:border-blue-500/25 dark:bg-blue-500/10 sm:px-4">
                  <h2 className="text-sm font-black text-slate-800 dark:text-blue-50 md:text-base">
                    Semester {group.semester}
                  </h2>
                  <span className="hidden rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-black text-blue-700 shadow-sm ring-1 ring-blue-200/70 dark:bg-slate-950/45 dark:text-blue-200 dark:ring-blue-500/25 sm:inline-flex">
                    {group.courses.length} course{group.courses.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,190px))] gap-2">
                  {group.courses.map((course) => (
                    <article
                      key={course.id}
                      role="button"
                      tabIndex={0}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/80 bg-white/90 p-1.5 shadow-md shadow-blue-950/5 outline-none transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500/40"
                      onClick={() => setSelectedCourseId(course.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedCourseId(course.id);
                        }
                      }}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 dark:from-blue-500/20 dark:to-violet-500/20 dark:text-blue-300">
                          <Folder size={16} />
                        </div>
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          {course.resource_count ?? course.resources.length} items
                        </span>
                      </div>
                      <h3 className="truncate text-xs font-black text-slate-950 dark:text-white">
                        {course.code}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 min-h-0 text-[11px] font-bold leading-4 text-slate-500 dark:text-slate-400">
                        {course.title}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={(event) => {
                            event.stopPropagation();
                            openCourseForm(course);
                          }}
                          aria-label="Edit course"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteCourse(course);
                          }}
                          aria-label="Delete course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </SectionTransition>
    </div>
  );
}


