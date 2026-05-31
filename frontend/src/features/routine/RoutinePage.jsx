import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Edit3, MapPin, Plus, Trash2, UserRound, X } from "lucide-react";

import { createRoutineSlot, deleteRoutineSlot, fetchRoutine, updateRoutineSlot } from "../../services/appService";
import { useAlert } from "../../components/common/AlertProvider";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const colors = ["blue", "purple", "green", "orange"];
const defaultTimeRows = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];
const rowHeight = 76;
const blankForm = {
  day: "0",
  start_time: "07:00",
  end_time: "08:00",
  course_code: "",
  course_title: "",
  room_number: "",
  faculty_initial: "",
  color: "blue",
};

const primaryBtn = "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/35 active:scale-[0.98]";
const secondaryBtn = "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const card = "rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-xl shadow-blue-500/5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90";
const input = "min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white";
const field = "grid gap-2";
const label = "text-sm font-bold text-slate-700 dark:text-slate-200";
const classColors = {
  blue: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-100",
  purple: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-100",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100",
  orange: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-100",
};
const slotColors = {
  blue: "border border-blue-300 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 text-slate-950 shadow-lg shadow-blue-500/15 transition-all hover:shadow-xl hover:shadow-blue-500/25 dark:border-blue-400/40 dark:from-blue-500/20 dark:via-blue-500/15 dark:to-cyan-500/10 dark:text-blue-50",
  purple: "border border-purple-300 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 text-slate-950 shadow-lg shadow-purple-500/15 transition-all hover:shadow-xl hover:shadow-purple-500/25 dark:border-purple-400/40 dark:from-purple-500/20 dark:via-purple-500/15 dark:to-pink-500/10 dark:text-purple-50",
  green: "border border-green-300 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 text-slate-950 shadow-lg shadow-green-500/15 transition-all hover:shadow-xl hover:shadow-green-500/25 dark:border-green-400/40 dark:from-green-500/20 dark:via-green-500/15 dark:to-emerald-500/10 dark:text-green-50",
  orange: "border border-orange-300 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 text-slate-950 shadow-lg shadow-orange-500/15 transition-all hover:shadow-xl hover:shadow-orange-500/25 dark:border-orange-400/40 dark:from-orange-500/20 dark:via-orange-500/15 dark:to-amber-500/10 dark:text-orange-50",
};

function toInputTime(value) {
  return value ? value.slice(0, 5) : "";
}

function toMinutes(value) {
  const [hours, minutes] = toInputTime(value).split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.min(1439, totalMinutes));
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function formatTime(value) {
  const [hours, minutes] = toInputTime(value).split(":").map(Number);
  return `${String(hours).padStart(2, "0")}.${String(minutes).padStart(2, "0")}`;
}

function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function normalizeRows(rows) {
  return [...new Set(rows.filter(Boolean).map(toInputTime))]
    .sort((a, b) => toMinutes(a) - toMinutes(b));
}

function nextTimeForRow(rows, index) {
  if (rows[index + 1]) {
    return rows[index + 1];
  }
  return fromMinutes(toMinutes(rows[index]) + 60);
}

function buildTimeIntervals(rows) {
  return rows.map((time, index) => {
    const endTime = nextTimeForRow(rows, index);
    const duration = Math.max(15, toMinutes(endTime) - toMinutes(time));
    return {
      time,
      endTime,
      height: (duration / 60) * rowHeight,
    };
  });
}

function findSlotForCell(slots, dayIndex, time) {
  const rowMinute = toMinutes(time);
  return slots.find((slot) => {
    const start = toMinutes(slot.start_time);
    const end = toMinutes(slot.end_time);
    return Number(slot.day) === dayIndex && rowMinute >= start && rowMinute < end;
  });
}

export default function RoutinePage() {
  const { confirm } = useAlert();
  const [slots, setSlots] = useState([]);
  const [timeRows, setTimeRows] = useState(defaultTimeRows);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [view, setView] = useState("week");
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState(blankForm);

  const todayIndex = getTodayIndex();
  const currentMinutes = getCurrentMinutes();
  const visibleDays = view === "week" ? days.map((_, index) => index) : [selectedDay];
  const visibleSlots = useMemo(() => slots.filter((slot) => visibleDays.includes(Number(slot.day))), [slots, visibleDays]);
  const listedSlots = view === "week" ? slots : visibleSlots;
  const currentSlot = slots.find((slot) => Number(slot.day) === todayIndex && toMinutes(slot.start_time) <= currentMinutes && toMinutes(slot.end_time) > currentMinutes);
  const timeIntervals = useMemo(() => buildTimeIntervals(timeRows), [timeRows]);
  const scheduleStart = Math.min(
    toMinutes(timeRows[0] ?? "07:00"),
    ...visibleSlots.map((slot) => toMinutes(slot.start_time))
  );
  const intervalEnd = toMinutes(nextTimeForRow(timeRows, timeRows.length - 1));
  const scheduleEnd = Math.max(intervalEnd, ...visibleSlots.map((slot) => toMinutes(slot.end_time)), scheduleStart + 60);
  const leadingOffset = Math.max(0, ((toMinutes(timeRows[0] ?? "07:00") - scheduleStart) / 60) * rowHeight);
  const intervalHeight = timeIntervals.reduce((total, interval) => total + interval.height, 0);
  const scheduleHeight = Math.max(intervalHeight + leadingOffset, ((scheduleEnd - scheduleStart) / 60) * rowHeight);

  const loadRoutine = async () => {
    setLoading(true);
    setStatus("");
    try {
      const payload = await fetchRoutine();
      const loadedSlots = payload?.slots ?? [];
      setSlots(loadedSlots);
      setTimeRows((current) => normalizeRows([
        ...current,
        ...loadedSlots.flatMap((slot) => [toInputTime(slot.start_time), toInputTime(slot.end_time)]),
      ]));
    } catch (error) {
      setStatus(error.message || "Unable to load routine.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutine();
  }, []);

  const openCreateForm = (dayIndex = selectedDay, startTime = timeRows[0], rowIndex = 0) => {
    if (!isEditingRoutine) {
      return;
    }

    setEditingSlot(null);
    setForm({
      ...blankForm,
      day: String(dayIndex),
      start_time: startTime,
      end_time: nextTimeForRow(timeRows, rowIndex),
    });
    setFormOpen(true);
    setStatus("");
  };

  const openEditForm = (slot) => {
    if (!isEditingRoutine) {
      return;
    }

    setEditingSlot(slot);
    setForm({
      day: String(slot.day),
      start_time: toInputTime(slot.start_time),
      end_time: toInputTime(slot.end_time),
      course_code: slot.course_code ?? "",
      course_title: slot.course_title ?? "",
      room_number: slot.room_number ?? "",
      faculty_initial: slot.faculty_initial ?? "",
      color: slot.color ?? "blue",
    });
    setFormOpen(true);
    setStatus("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    const payload = {
      ...form,
      day: Number(form.day),
      course_code: form.course_code.trim(),
      course_title: form.course_title.trim(),
      room_number: form.room_number.trim(),
      faculty_initial: form.faculty_initial.trim(),
    };

    try {
      if (editingSlot) {
        const updated = await updateRoutineSlot(editingSlot.id, payload);
        setSlots((current) => current.map((slot) => (slot.id === updated.id ? updated : slot)));
        setStatus("Routine slot updated.");
      } else {
        const created = await createRoutineSlot(payload);
        setSlots((current) => [...current, created].sort((a, b) => a.day - b.day || toMinutes(a.start_time) - toMinutes(b.start_time)));
        setStatus("Course added to routine.");
      }
      setTimeRows((current) => normalizeRows([...current, payload.start_time, payload.end_time]));
      setFormOpen(false);
      setEditingSlot(null);
    } catch (error) {
      setStatus(error.message || "Unable to save routine slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slot) => {
    if (!isEditingRoutine) {
      return;
    }

    const confirmed = await confirm({
      title: "Delete Routine Slot?",
      message: `Delete ${slot.course_code} from your routine? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    setStatus("");
    try {
      await deleteRoutineSlot(slot.id);
      setSlots((current) => current.filter((item) => item.id !== slot.id));
      setStatus("Routine slot deleted.");
    } catch (error) {
      setStatus(error.message || "Unable to delete routine slot.");
    }
  };

  const handleTimeChange = (index, value) => {
    if (!isEditingRoutine) {
      return;
    }

    const nextRows = [...timeRows];
    nextRows[index] = value;
    setTimeRows(normalizeRows(nextRows));
  };

  const addTimeRow = () => {
    if (!isEditingRoutine) {
      return;
    }

    const last = timeRows[timeRows.length - 1] ?? "07:00";
    setTimeRows((current) => normalizeRows([...current, fromMinutes(toMinutes(last) + 60)]));
  };

  const removeTimeRow = (time) => {
    if (!isEditingRoutine || timeRows.length <= 1) {
      return;
    }

    setTimeRows((current) => current.filter((row) => row !== time));
    setStatus("");
  };

  const renderEmptyCell = (dayIndex, interval, rowIndex) => {
    const { time, height } = interval;
    const slot = findSlotForCell(slots, dayIndex, time);
    const emptyCellClass = `group relative block w-full border-t border-slate-200/80 bg-white/45 p-2 text-left transition-all hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:border-slate-800/80 dark:bg-slate-950/20 ${
      isEditingRoutine && !slot ? "cursor-pointer hover:shadow-inner hover:ring-2 hover:ring-inset hover:ring-blue-300 dark:hover:bg-blue-500/10" : ""
    }`;

    if (!isEditingRoutine || slot) {
      return <div key={`${dayIndex}-${time}`} className={emptyCellClass} style={{ height }} />;
    }

    return (
      <button
        key={`${dayIndex}-${time}`}
        type="button"
        className={emptyCellClass}
        style={{ height }}
        onClick={() => openCreateForm(dayIndex, time, rowIndex)}
        aria-label={`Add course on ${fullDays[dayIndex]} at ${formatTime(time)}`}
      >
        <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg opacity-0 transition group-hover:opacity-100"><span className="grid size-7 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/25"><Plus size={14} /></span></span>
      </button>
    );
  };

  const renderSlotBlock = (slot) => {
    const top = ((toMinutes(slot.start_time) - scheduleStart) / 60) * rowHeight;
    const height = Math.max(72, ((toMinutes(slot.end_time) - toMinutes(slot.start_time)) / 60) * rowHeight - 8);

    return (
      <div
        key={slot.id}
        className={`absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-lg border p-2.5 shadow-md backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg ${slotColors[slot.color] ?? slotColors.blue} ${slot.live ? "ring-2 ring-emerald-400" : ""}`}
        style={{ top: top + 4, height }}
      >
        <button type="button" className={`flex h-full w-full flex-col justify-between text-left ${isEditingRoutine ? "" : "cursor-default"}`} onClick={() => openEditForm(slot)}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black tracking-tight">{slot.course_code}</h3>
              <p className="truncate text-xs font-bold opacity-85">{slot.course_title}</p>
            </div>
            {slot.live ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg shadow-green-500/25">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] font-black">
            <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-white/60 px-1.5 py-0.5 shadow-sm dark:bg-slate-950/35"><MapPin size={10} /><span className="truncate">{slot.room_number || "Room"}</span></span>
            <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-white/60 px-1.5 py-0.5 shadow-sm dark:bg-slate-950/35"><UserRound size={10} /><span className="truncate">{slot.faculty_initial || "TBA"}</span></span>
          </div>
        </button>
        {isEditingRoutine ? (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button type="button" className="grid size-7 place-items-center rounded-lg bg-white/80 text-slate-700 shadow-sm dark:bg-slate-950/60 dark:text-slate-100" onClick={() => openEditForm(slot)} aria-label="Edit course"><Edit3 size={12} /></button>
            <button type="button" className="grid size-7 place-items-center rounded-lg bg-white/80 text-rose-500 shadow-sm dark:bg-slate-950/60" onClick={() => handleDelete(slot)} aria-label="Delete course"><Trash2 size={12} /></button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderDayColumn = (dayIndex) => {
    const daySlots = slots.filter((slot) => Number(slot.day) === dayIndex);

    return (
      <div key={dayIndex} className="relative border-l border-slate-200/80 dark:border-slate-800/80" style={{ height: scheduleHeight }}>
        {leadingOffset > 0 ? <div className="border-t border-slate-200/80 bg-white/45 dark:border-slate-800/80 dark:bg-slate-950/20" style={{ height: leadingOffset }} /> : null}
        {timeIntervals.map((interval, rowIndex) => renderEmptyCell(dayIndex, interval, rowIndex))}
        {daySlots.map(renderSlotBlock)}
      </div>
    );
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Class Routine</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{isEditingRoutine ? "Click any empty slot to add a course" : "View your weekly schedule"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
            {["week", "day"].map((mode) => (
              <button key={mode} type="button" className={`rounded-lg px-3 py-1.5 text-sm font-black capitalize ${view === mode ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`} onClick={() => setView(mode)}>
                {mode}
              </button>
            ))}
          </div>
          {view === "day" ? (
            <select value={selectedDay} onChange={(event) => setSelectedDay(Number(event.target.value))} className={input} aria-label="Select routine day">
              {fullDays.map((day, index) => <option key={day} value={index}>{day}</option>)}
            </select>
          ) : null}
          <button
            type="button"
            className={isEditingRoutine ? secondaryBtn : primaryBtn}
            onClick={() => {
              setIsEditingRoutine((current) => {
                const next = !current;
                if (!next) {
                  setFormOpen(false);
                  setEditingSlot(null);
                }
                return next;
              });
            }}
          >
            <Edit3 size={18} />
            <span>{isEditingRoutine ? "Done Editing" : "Edit Routine"}</span>
          </button>
        </div>
      </div>

      {status ? <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-500/10 dark:border-blue-500/30 dark:from-blue-500/10 dark:to-indigo-500/10 dark:text-blue-300">{status}</div> : null}

      {currentSlot ? (
        <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 text-green-800 shadow-xl shadow-green-500/10 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-green-500/10 dark:text-emerald-200">
          <strong className="block">Current class: {currentSlot.course_code} - {currentSlot.course_title}</strong>
          <span className="text-sm font-semibold">{formatTime(currentSlot.start_time)} - {formatTime(currentSlot.end_time)} in {currentSlot.room_number}</span>
        </div>
      ) : null}

      {formOpen ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-slate-950 dark:text-white">{editingSlot ? "Edit Course" : "Add Course"}</h2>
            <button type="button" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setFormOpen(false)} aria-label="Close form"><X size={18} /></button>
          </div>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-3">
              <label className={field}><span className={label}>Day</span><select value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })} className={input}>{fullDays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
              <label className={field}><span className={label}>Start Time</span><input type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} className={input} required /></label>
              <label className={field}><span className={label}>End Time</span><input type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} className={input} required /></label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={field}><span className={label}>Course Code</span><input value={form.course_code} onChange={(event) => setForm({ ...form, course_code: event.target.value })} className={input} placeholder="CSE-221" required maxLength="40" /></label>
              <label className={field}><span className={label}>Course Title</span><input value={form.course_title} onChange={(event) => setForm({ ...form, course_title: event.target.value })} className={input} placeholder="Data Structures" required maxLength="160" /></label>
              <label className={field}><span className={label}>Room Number</span><input value={form.room_number} onChange={(event) => setForm({ ...form, room_number: event.target.value })} className={input} placeholder="Room 301" required maxLength="80" /></label>
              <label className={field}><span className={label}>Faculty Initial</span><input value={form.faculty_initial} onChange={(event) => setForm({ ...form, faculty_initial: event.target.value })} className={input} placeholder="ABC" maxLength="20" /></label>
            </div>
            <label className={field}>
              <span className={label}>Color</span>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button key={color} type="button" className={`rounded-lg border px-3 py-1.5 text-sm font-black capitalize ${classColors[color]} ${form.color === color ? "ring-2 ring-blue-400" : ""}`} onClick={() => setForm({ ...form, color })}>{color}</button>
                ))}
              </div>
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className={primaryBtn} disabled={saving}><CalendarDays size={18} /><span>{saving ? "Saving..." : editingSlot ? "Save Changes" : "Add Course"}</span></button>
              <button type="button" className={secondaryBtn} onClick={() => setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        </motion.section>
      ) : null}

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-xl shadow-blue-500/5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        {loading ? (
          <div className="py-12 text-center text-sm font-bold text-slate-500">Loading routine...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className={view === "week" ? "min-w-[1040px]" : "min-w-[460px]"}>
              <div className={`grid overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:to-blue-950/30 ${view === "week" ? "grid-cols-[120px_repeat(7,minmax(120px,1fr))]" : "grid-cols-[120px_1fr]"}`}>
                <div className="border-b border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 p-2.5 text-center text-xs font-black uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 dark:text-slate-300">Time</div>
                {visibleDays.map((dayIndex) => (
                  <div key={dayIndex} className="border-b border-l border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 p-2.5 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    <span className={`inline-flex min-h-8 min-w-16 items-center justify-center rounded-lg px-3 text-sm font-black ${dayIndex === todayIndex ? "scale-105 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-700 dark:text-slate-200"}`}>
                      {days[dayIndex]}
                    </span>
                  </div>
                ))}

                <div className="bg-[linear-gradient(90deg,rgba(255,255,255,0.65),rgba(239,246,255,0.45))] dark:bg-slate-950/55" style={{ height: scheduleHeight }}>
                  {leadingOffset > 0 ? <div className="border-t border-slate-200/80 dark:border-slate-800/80" style={{ height: leadingOffset }} /> : null}
                  {timeIntervals.map((interval, rowIndex) => (
                    <div key={`${interval.time}-${rowIndex}`} className="grid place-items-center border-t border-slate-200/80 p-2 dark:border-slate-800/80" style={{ height: interval.height }}>
                      <div className="relative flex w-full items-center gap-2">
                        <input
                          type="time"
                          value={interval.time}
                          onChange={(event) => handleTimeChange(rowIndex, event.target.value)}
                          disabled={!isEditingRoutine}
                          className={`min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 text-center text-sm font-black text-slate-700 outline-none dark:text-slate-200 ${isEditingRoutine ? "focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950" : "cursor-default"}`}
                          aria-label={`Edit time row ${rowIndex + 1}`}
                        />
                        {isEditingRoutine ? (
                          <button
                            type="button"
                            className="relative z-20 grid size-8 shrink-0 place-items-center rounded-lg bg-white text-rose-500 shadow-sm transition hover:bg-rose-50 dark:bg-slate-950/80 dark:hover:bg-rose-500/10"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeTimeRow(interval.time);
                            }}
                            aria-label={`Remove ${formatTime(interval.time)} time slot`}
                          >
                            <X size={14} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {visibleDays.map(renderDayColumn)}
              </div>
            </div>
            {isEditingRoutine ? (
              <button type="button" className="mt-4 inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 text-sm font-black text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300" onClick={addTimeRow}>
                <Plus size={16} />
                <span>Add Time Slot</span>
              </button>
            ) : null}
          </div>
        )}
      </motion.section>

      {listedSlots.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {listedSlots.map((slot) => (
            <motion.article key={slot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border p-3 shadow-md ${classColors[slot.color] ?? classColors.blue}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">{slot.course_code}</h3>
                  <p className="text-sm font-bold">{slot.course_title}</p>
                </div>
                {slot.live ? <span className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-black text-white">Live Now</span> : null}
              </div>
              <div className="mt-4 grid gap-2 text-sm font-semibold">
                <span className="inline-flex items-center gap-2"><CalendarDays size={14} />{fullDays[slot.day]}</span>
                <span className="inline-flex items-center gap-2"><Clock size={14} />{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                <span className="inline-flex items-center gap-2"><MapPin size={14} />{slot.room_number}</span>
                {slot.faculty_initial ? <span className="inline-flex items-center gap-2"><UserRound size={14} />{slot.faculty_initial}</span> : null}
              </div>
              {isEditingRoutine ? (
                <div className="mt-4 flex gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm font-black dark:bg-slate-950/40" onClick={() => openEditForm(slot)}><Edit3 size={16} /><span>Edit</span></button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm font-black dark:bg-slate-950/40" onClick={() => handleDelete(slot)}><Trash2 size={16} /><span>Delete</span></button>
                </div>
              ) : null}
            </motion.article>
          ))}
        </div>
      ) : null}
    </div>
  );
}









