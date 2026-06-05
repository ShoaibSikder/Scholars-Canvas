import { useEffect, useMemo, useState } from "react";

import { useAlert } from "../../../components/common/AlertProvider";
import InPageStatus from "../../../components/common/InPageStatus";
import useAutoClearStatus from "../../../hooks/useAutoClearStatus";
import {
  createRoutineSlot,
  deleteRoutineSlot,
  fetchRoutine,
  updateRoutineSlot,
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
  const [clockNow, setClockNow] = useState(() => new Date());

  useAutoClearStatus(status, setStatus);

  const todayIndex = getTodayIndex(clockNow);
  const visibleDays =
    view === "week" ? routineDayOrder : [selectedDay];
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

  const loadRoutine = async () => {
    setLoading(true);
    setStatus("");
    try {
      const payload = await fetchRoutine();
      const loadedSlots = payload?.slots ?? [];
      setSlots(loadedSlots);
      setTimeRows((current) =>
        normalizeRows([
          ...current,
          ...loadedSlots.flatMap((slot) => [
            toInputTime(slot.start_time),
            toInputTime(slot.end_time),
          ]),
        ]),
      );
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
      setTimeRows((current) =>
        normalizeRows([...current, payload.start_time, payload.end_time]),
      );
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

  const handleTimeChange = (index, value) => {
    if (!isEditingRoutine) return;

    const nextRows = [...timeRows];
    nextRows[index] = value;
    setTimeRows(normalizeRows(nextRows));
  };

  const addTimeRow = () => {
    if (!isEditingRoutine) return;

    const last = timeRows[timeRows.length - 1] ?? "07:00";
    setTimeRows((current) =>
      normalizeRows([...current, fromMinutes(toMinutes(last) + 60)]),
    );
  };

  const removeTimeRow = (time) => {
    if (!isEditingRoutine || timeRows.length <= 1) return;

    setTimeRows((current) => current.filter((row) => row !== time));
    setStatus("");
  };

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

      <CurrentClassBanner currentSlot={currentSlot} />

      {formOpen ? (
        <RoutineFormModal
          editingSlot={editingSlot}
          form={form}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          saving={saving}
          setForm={setForm}
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
    </div>
  );
}


