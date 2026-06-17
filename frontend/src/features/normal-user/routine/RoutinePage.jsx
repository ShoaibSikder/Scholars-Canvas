import { useCallback, useEffect, useMemo, useState } from "react";

import { useAlert } from "../../../components/common/AlertProvider";
import InPageStatus from "../../../components/common/InPageStatus";
import PageFallback from "../../../components/common/PageFallback";
import SectionTransition from "../../../components/common/SectionTransition";
import { useSectionCache } from "../../../context/SectionCacheContext";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import {
  createRoutineSlot,
  deleteRoutineSlot,
  fetchRoutine,
  updateRoutineSlot,
  updateRoutineTimeRows,
} from "../../../api";
import CurrentClassBanner from "./components/CurrentClassBanner";
import RoutineFormModal from "./components/RoutineFormModal";
import RoutineGrid from "./components/RoutineGrid";
import RoutineHeader from "./components/RoutineHeader";
import RoutineSlotList from "./components/RoutineSlotList";
import {
  blankForm,
  days,
  defaultTimeRows,
  routineDayOrder,
  rowHeight,
} from "./routineConstants";
import {
  buildTimeIntervals,
  fromMinutes,
  getTodayIndex,
  isSlotLiveAt,
  nextTimeForRow,
  normalizeRows,
  toInputTime,
  toMinutes,
} from "./routineUtils";

export default function RoutinePage() {
  const { confirm } = useAlert();
  const { cached, setCached } = useSectionCache("user.routine");
  const [slots, setSlots] = useState(() => cached?.slots ?? []);
  const [timeRows, setTimeRows] = useState(
    () => cached?.timeRows ?? defaultTimeRows,
  );
  const [loading, setLoading] = useState(() => !cached?.loaded);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [view, setView] = useState("week");
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [clockNow, setClockNow] = useState(() => new Date());

  useAutoClearStatus(status, setStatus);

  const todayIndex = getTodayIndex(clockNow);
  const visibleDays = view === "week" ? routineDayOrder : [selectedDay];
  const visibleSlots = useMemo(
    () => slots.filter((slot) => visibleDays.includes(Number(slot.day))),
    [slots, visibleDays],
  );
  const listedSlots = view === "week" ? slots : visibleSlots;
  const currentSlot = slots.find((slot) => isSlotLiveAt(slot, clockNow));
  const timeIntervals = useMemo(() => buildTimeIntervals(timeRows), [timeRows]);
  const scheduleStart = Math.min(
    toMinutes(timeRows[0] ?? "07:00"),
    ...visibleSlots.map((slot) => toMinutes(slot.start_time)),
  );
  const intervalEnd = toMinutes(nextTimeForRow(timeRows, timeRows.length - 1));
  const scheduleEnd = Math.max(
    intervalEnd,
    ...visibleSlots.map((slot) => toMinutes(slot.end_time)),
    scheduleStart + 60,
  );
  const leadingOffset = Math.max(
    0,
    ((toMinutes(timeRows[0] ?? "07:00") - scheduleStart) / 60) * rowHeight,
  );
  const intervalHeight = timeIntervals.reduce(
    (total, interval) => total + interval.height,
    0,
  );
  const scheduleHeight = Math.max(
    intervalHeight + leadingOffset,
    ((scheduleEnd - scheduleStart) / 60) * rowHeight,
  );

  const loadRoutine = async ({ force = false } = {}) => {
    if (!force && cached?.loaded) return;
    setLoading(true);
    setStatus("");
    try {
      const payload = await fetchRoutine();
      const loadedSlots = payload?.slots ?? [];
      const slotTimes = loadedSlots.flatMap((slot) => [
        toInputTime(slot.start_time),
        toInputTime(slot.end_time),
      ]);
      const storedTimeRows = Array.isArray(payload?.time_rows)
        ? payload.time_rows
        : [];
      const timeRowsAreDefault =
        JSON.stringify(timeRows) === JSON.stringify(defaultTimeRows);
      const nextRows =
        storedTimeRows.length > 0
          ? normalizeRows(storedTimeRows)
          : timeRowsAreDefault
            ? normalizeRows([...timeRows, ...slotTimes])
            : normalizeRows(timeRows);
      setSlots(loadedSlots);
      setTimeRows(nextRows);
      setCached({ loaded: true, slots: loadedSlots, timeRows: nextRows });
    } catch (error) {
      setStatus(error.message || "Unable to load routine.");
      setSlots([]);
      setCached({ loaded: true, slots: [], timeRows: defaultTimeRows });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutine();
  }, []);

  useEffect(() => {
    if (!loading) {
      setCached({ loaded: true, slots, timeRows });
    }
  }, [loading, setCached, slots, timeRows]);

  useEffect(() => {
    const tick = () => setClockNow(new Date());
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const openCreateForm = (
    dayIndex = selectedDay,
    startTime = timeRows[0],
    rowIndex = 0,
  ) => {
    if (!isEditingRoutine) return;

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

  const autoFillCourseDetails = useCallback(
    (courseCode) => {
      const existingCourse = slots.find(
        (slot) =>
          slot.course_code?.trim().toUpperCase() ===
          courseCode.trim().toUpperCase(),
      );
      if (existingCourse) {
        return {
          course_title: existingCourse.course_title || "",
          room_number: existingCourse.room_number || "",
          faculty_initial: existingCourse.faculty_initial || "",
          color: existingCourse.color || "blue",
        };
      }
      return null;
    },
    [slots],
  );

  const openEditForm = (slot) => {
    if (!isEditingRoutine) return;

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
        setSlots((current) =>
          current.map((slot) => (slot.id === updated.id ? updated : slot)),
        );
        setStatus("Routine slot updated.");
      } else {
        const created = await createRoutineSlot(payload);
        setSlots((current) =>
          [...current, created].sort(
            (a, b) =>
              a.day - b.day ||
              toMinutes(a.start_time) - toMinutes(b.start_time),
          ),
        );
        setStatus("Course added to routine.");
      }
      const updatedRows = normalizeRows([
        ...timeRows,
        payload.start_time,
        payload.end_time,
      ]);
      setTimeRows(updatedRows);
      persistTimeRows(updatedRows);
      setFormOpen(false);
      setEditingSlot(null);
    } catch (error) {
      setStatus(error.message || "Unable to save routine slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slot) => {
    if (!isEditingRoutine) return;

    const confirmed = await confirm({
      title: "Delete Routine Slot?",
      message: `Delete ${slot.course_code} from your routine? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    setStatus("");
    try {
      await deleteRoutineSlot(slot.id);
      setSlots((current) => current.filter((item) => item.id !== slot.id));
      setStatus("Routine slot deleted.");
    } catch (error) {
      setStatus(error.message || "Unable to delete routine slot.");
    }
  };

  const persistTimeRows = async (rows) => {
    try {
      await updateRoutineTimeRows({ time_rows: rows });
    } catch (error) {
      setStatus(error.message || "Unable to save routine layout.");
    }
  };

  const handleTimeChange = (index, value) => {
    if (!isEditingRoutine) return;

    const nextRows = [...timeRows];
    nextRows[index] = value;
    const normalizedRows = normalizeRows(nextRows);
    setTimeRows(normalizedRows);
    persistTimeRows(normalizedRows);
  };

  const addTimeRow = () => {
    if (!isEditingRoutine) return;

    const last = timeRows[timeRows.length - 1] ?? "07:00";
    const nextRows = normalizeRows([
      ...timeRows,
      fromMinutes(toMinutes(last) + 60),
    ]);
    setTimeRows(nextRows);
    persistTimeRows(nextRows);
  };

  const removeTimeRow = (time) => {
    if (!isEditingRoutine || timeRows.length <= 1) return;

    const nextRows = timeRows.filter((row) => row !== time);
    setTimeRows(nextRows);
    setStatus("");
    persistTimeRows(nextRows);
  };

  if (loading) {
    return <PageFallback />;
  }

  return (
    <div className="grid gap-4">
      <RoutineHeader
        isEditingRoutine={isEditingRoutine}
        selectedDay={selectedDay}
        setEditingRoutine={setIsEditingRoutine}
        setEditingSlot={setEditingSlot}
        setFormOpen={setFormOpen}
        setSelectedDay={setSelectedDay}
        setView={setView}
        view={view}
      />

      <InPageStatus message={status} />

      <SectionTransition sectionKey={`routine-${view}`}>
        <CurrentClassBanner currentSlot={currentSlot} />

        {formOpen ? (
          <RoutineFormModal
            editingSlot={editingSlot}
            form={form}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
            saving={saving}
            setForm={setForm}
            autoFillCourseDetails={autoFillCourseDetails}
          />
        ) : null}

        <RoutineGrid
          addTimeRow={addTimeRow}
          clockNow={clockNow}
          handleDelete={handleDelete}
          handleTimeChange={handleTimeChange}
          isEditingRoutine={isEditingRoutine}
          leadingOffset={leadingOffset}
          loading={loading}
          openCreateForm={openCreateForm}
          openEditForm={openEditForm}
          removeTimeRow={removeTimeRow}
          scheduleHeight={scheduleHeight}
          scheduleStart={scheduleStart}
          slots={slots}
          timeIntervals={timeIntervals}
          todayIndex={todayIndex}
          view={view}
          visibleDays={visibleDays}
        />

        <RoutineSlotList
          clockNow={clockNow}
          isEditingRoutine={isEditingRoutine}
          listedSlots={listedSlots}
          onDelete={handleDelete}
          onEdit={openEditForm}
        />
      </SectionTransition>
    </div>
  );
}
