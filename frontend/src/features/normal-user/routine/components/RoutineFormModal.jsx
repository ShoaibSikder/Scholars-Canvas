import { useCallback } from "react";
import { CalendarDays, X } from "lucide-react";
import { motion } from "framer-motion";

import {
  card,
  classColors,
  colors,
  field,
  fullDays,
  input,
  label,
  primaryBtn,
  routineDayOptions,
  secondaryBtn,
} from "../routineConstants";

export default function RoutineFormModal({
  editingSlot,
  form,
  onClose,
  onSubmit,
  saving,
  setForm,
  autoFillCourseDetails,
}) {
  const handleCourseCodeChange = useCallback(
    (event) => {
      const courseCode = event.target.value;

      // Auto-fill course details if this course already exists
      if (autoFillCourseDetails && courseCode.trim()) {
        const filledDetails = autoFillCourseDetails(courseCode);
        if (filledDetails) {
          setForm({
            ...form,
            course_code: courseCode,
            course_title: filledDetails.course_title,
            room_number: filledDetails.room_number,
            faculty_initial: filledDetails.faculty_initial,
            color: filledDetails.color,
          });
          return;
        }
      }

      // If no auto-fill, just update the course code
      setForm({ ...form, course_code: courseCode });
    },
    [form, setForm, autoFillCourseDetails],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`${card} max-h-[calc(100vh-32px)] w-[min(820px,100%)] overflow-y-auto bg-white backdrop-blur-none dark:bg-slate-900`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-950 dark:text-white">
            {editingSlot ? "Edit Course" : "Add Course"}
          </h2>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className={field}>
              <span className={label}>Day</span>
              <select
                value={form.day}
                onChange={(event) =>
                  setForm({ ...form, day: event.target.value })
                }
                className={input}
              >
                {routineDayOptions.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              <span className={label}>Start Time</span>
              <input
                type="time"
                value={form.start_time}
                onChange={(event) =>
                  setForm({ ...form, start_time: event.target.value })
                }
                className={input}
                required
              />
            </label>
            <label className={field}>
              <span className={label}>End Time</span>
              <input
                type="time"
                value={form.end_time}
                onChange={(event) =>
                  setForm({ ...form, end_time: event.target.value })
                }
                className={input}
                required
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className={field}>
              <span className={label}>Course Code</span>
              <input
                value={form.course_code}
                onChange={handleCourseCodeChange}
                className={input}
                placeholder="CSE-221"
                required
                maxLength="40"
              />
            </label>
            <label className={field}>
              <span className={label}>Course Title</span>
              <input
                value={form.course_title}
                onChange={(event) =>
                  setForm({ ...form, course_title: event.target.value })
                }
                className={input}
                placeholder="Data Structures"
                required
                maxLength="160"
              />
            </label>
            <label className={field}>
              <span className={label}>Room Number</span>
              <input
                value={form.room_number}
                onChange={(event) =>
                  setForm({ ...form, room_number: event.target.value })
                }
                className={input}
                placeholder="Room 301"
                required
                maxLength="80"
              />
            </label>
            <label className={field}>
              <span className={label}>Faculty Initial</span>
              <input
                value={form.faculty_initial}
                onChange={(event) =>
                  setForm({ ...form, faculty_initial: event.target.value })
                }
                className={input}
                placeholder="ABC"
                maxLength="20"
              />
            </label>
          </div>
          <label className={field}>
            <span className={label}>Color</span>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`rounded-lg border px-3 py-1.5 text-sm font-black capitalize ${classColors[color]} ${form.color === color ? "ring-2 ring-blue-400" : ""}`}
                  onClick={() => setForm({ ...form, color })}
                >
                  {color}
                </button>
              ))}
            </div>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtn} disabled={saving}>
              <CalendarDays size={18} />
              <span>
                {saving
                  ? "Saving..."
                  : editingSlot
                    ? "Save Changes"
                    : "Add Course"}
              </span>
            </button>
            <button type="button" className={secondaryBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}
