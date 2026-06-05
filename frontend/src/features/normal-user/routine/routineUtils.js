import { rowHeight } from "./routineConstants";

export function toInputTime(value) {
  return value ? value.slice(0, 5) : "";
}

export function toMinutes(value) {
  const [hours, minutes] = toInputTime(value).split(":").map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.min(1439, totalMinutes));
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function formatTime(value) {
  const [hours, minutes] = toInputTime(value).split(":").map(Number);
  return `${String(hours).padStart(2, "0")}.${String(minutes).padStart(2, "0")}`;
}

export function getTodayIndex(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function getCurrentMinutes(date = new Date()) {
  const now = date;
  return now.getHours() * 60 + now.getMinutes();
}

export function isSlotLiveAt(slot, date = new Date()) {
  const start = toMinutes(slot.start_time);
  const end = toMinutes(slot.end_time);
  const current = getCurrentMinutes(date);

  return (
    Number(slot.day) === getTodayIndex(date) &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    current >= start &&
    current < end
  );
}

export function normalizeRows(rows) {
  return [...new Set(rows.filter(Boolean).map(toInputTime))].sort(
    (a, b) => toMinutes(a) - toMinutes(b),
  );
}

export function nextTimeForRow(rows, index) {
  if (rows[index + 1]) {
    return rows[index + 1];
  }
  return fromMinutes(toMinutes(rows[index]) + 60);
}

export function buildTimeIntervals(rows) {
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

export function findSlotForCell(slots, dayIndex, time) {
  const rowMinute = toMinutes(time);
  return slots.find((slot) => {
    const start = toMinutes(slot.start_time);
    const end = toMinutes(slot.end_time);
    return (
      Number(slot.day) === dayIndex && rowMinute >= start && rowMinute < end
    );
  });
}


