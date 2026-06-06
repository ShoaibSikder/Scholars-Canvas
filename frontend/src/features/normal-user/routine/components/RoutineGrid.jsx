import { Edit3, Plus, Trash2, X } from "lucide-react";

import {
  days,
  rowHeight,
  slotColors,
} from "../routineConstants";
import {
  findSlotForCell,
  formatTime,
  isSlotLiveAt,
  toMinutes,
} from "../routineUtils";

const courseCodeColors = {
  blue: "text-blue-700 dark:text-blue-200",
  purple: "text-violet-700 dark:text-violet-200",
  green: "text-emerald-700 dark:text-emerald-200",
  orange: "text-orange-700 dark:text-orange-200",
};

const detailColors = [
  "text-emerald-700 dark:text-emerald-200",
  "text-orange-700 dark:text-orange-200",
  "text-violet-700 dark:text-violet-200",
];

function getSlotDetails(slot) {
  return [
    slot.faculty_initial || "TBA",
    slot.room_number || "Room",
    slot.section || slot.section_name || slot.batch || slot.group,
  ].filter(Boolean);
}

export default function RoutineGrid({
  addTimeRow,
  clockNow,
  handleDelete,
  handleTimeChange,
  isEditingRoutine,
  leadingOffset,
  loading,
  openCreateForm,
  openEditForm,
  removeTimeRow,
  scheduleHeight,
  scheduleStart,
  slots,
  timeIntervals,
  todayIndex,
  view,
  visibleDays,
}) {
  const oldTimeRowHeight = rowHeight;
  const dayRowHeight = oldTimeRowHeight;
  const dayAxisWidth = 110;
  const timeAxisMinWidth = Math.max(520, timeIntervals.length * 86);
  const widthPercent = (width) => `${Math.max(0, (width / scheduleHeight) * 100)}%`;

  const renderEmptyCell = (dayIndex, interval, rowIndex) => {
    const { time, height } = interval;
    const slot = findSlotForCell(slots, dayIndex, time);
    const emptyCellClass = `group relative block h-full shrink-0 border-l border-slate-200/80 bg-white/45 p-2 text-left transition-all hover:bg-gradient-to-br hover:from-blue-500/15 hover:to-indigo-500/15 dark:border-slate-800/80 dark:bg-slate-950/20 ${
      isEditingRoutine && !slot
        ? "cursor-pointer hover:shadow-inner hover:ring-2 hover:ring-inset hover:ring-blue-500 dark:hover:from-blue-500/35 dark:hover:to-indigo-500/35 dark:hover:ring-blue-500"
        : ""
    }`;

    if (!isEditingRoutine || slot) {
      return (
        <div
          key={`${dayIndex}-${time}`}
          className={emptyCellClass}
          style={{ width: widthPercent(height) }}
        />
      );
    }

    return (
      <button
        key={`${dayIndex}-${time}`}
        type="button"
        className={emptyCellClass}
        style={{ width: widthPercent(height) }}
        onClick={() => openCreateForm(dayIndex, time, rowIndex)}
        aria-label={`Add course on ${days[dayIndex]} at ${formatTime(time)}`}
      >
        <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg opacity-0 transition group-hover:opacity-100">
          <span className="grid size-7 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Plus size={14} />
          </span>
        </span>
      </button>
    );
  };

  const renderSlotBlock = (slot) => {
    const isLive = isSlotLiveAt(slot, clockNow);
    const slotDetails = getSlotDetails(slot);
    const left = ((toMinutes(slot.start_time) - scheduleStart) / 60) * rowHeight;
    const width =
      ((toMinutes(slot.end_time) - toMinutes(slot.start_time)) / 60) *
        rowHeight;

    return (
      <div
        key={slot.id}
        className={`absolute bottom-1.5 top-1.5 z-10 overflow-hidden rounded-lg border px-2 py-1.5 shadow-md backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg ${slotColors[slot.color] ?? slotColors.blue} ${isLive ? "ring-2 ring-emerald-400" : ""}`}
        style={{
          left: `calc(${widthPercent(left)} + 4px)`,
          width: `calc(${widthPercent(width)} - 8px)`,
        }}
      >
        <button
          type="button"
          className={`grid h-full w-full place-items-center text-center ${isEditingRoutine ? "" : "cursor-default"}`}
          onClick={() => openEditForm(slot)}
        >
          <span className="grid max-w-full justify-items-center gap-0.5 px-1">
            <span
              className={`max-w-full truncate text-[12px] font-black leading-4 sm:text-[13px] ${courseCodeColors[slot.color] ?? courseCodeColors.blue}`}
            >
              {slot.course_code}
            </span>
            <span className="max-w-full overflow-hidden text-ellipsis text-[10px] font-extrabold leading-3 text-slate-800 dark:text-slate-100 sm:text-[11px]">
              {slot.course_title}
            </span>
            <span className="mt-0.5 flex max-w-full items-center justify-center overflow-hidden whitespace-nowrap text-[10px] font-black leading-3">
              {slotDetails.map((detail, index) => (
                <span
                  key={`${slot.id}-${detail}-${index}`}
                  className={`min-w-0 ${detailColors[index] ?? "text-slate-700 dark:text-slate-300"} ${index === 0 ? "truncate" : "shrink-0"}`}
                >
                  {index > 0 ? (
                    <span className="mx-1 text-slate-400 dark:text-slate-500">
                      -
                    </span>
                  ) : null}
                  {detail}
                </span>
              ))}
            </span>
          </span>
        </button>
        {isLive ? (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg shadow-green-500/25">
            <span className="size-1 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        ) : null}
        {isEditingRoutine ? (
          <div className="absolute bottom-1.5 right-1.5 flex gap-1">
            <button
              type="button"
              className="grid size-6 place-items-center rounded-lg bg-white/85 text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-950/65 dark:text-slate-100 dark:hover:bg-blue-500/15 dark:hover:text-blue-200"
              onClick={() => openEditForm(slot)}
              aria-label="Edit course"
            >
              <Edit3 size={12} />
            </button>
            <button
              type="button"
              className="grid size-6 place-items-center rounded-lg bg-white/85 text-rose-500 shadow-sm transition hover:bg-rose-50 dark:bg-slate-950/65 dark:hover:bg-rose-500/15"
              onClick={() => handleDelete(slot)}
              aria-label="Delete course"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderDayRow = (dayIndex) => {
    const daySlots = slots.filter((slot) => Number(slot.day) === dayIndex);

    return (
      <div
        key={dayIndex}
        className="contents"
      >
        <div className="grid place-items-center border-t border-slate-200 bg-gradient-to-br from-slate-100 via-white to-blue-50 p-2 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/30">
          <span
            className={`inline-flex min-h-8 min-w-16 items-center justify-center rounded-lg px-3 text-sm font-black ${dayIndex === todayIndex ? "scale-105 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-700 dark:text-slate-200"}`}
          >
            {days[dayIndex]}
          </span>
        </div>
        <div
          className="relative flex overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80"
          style={{ minWidth: timeAxisMinWidth, height: dayRowHeight }}
        >
          {leadingOffset > 0 ? (
            <div
              className="h-full shrink-0 border-l border-slate-200/80 bg-white/45 dark:border-slate-800/80 dark:bg-slate-950/20"
              style={{ width: widthPercent(leadingOffset) }}
            />
          ) : null}
          {timeIntervals.map((interval, rowIndex) =>
            renderEmptyCell(dayIndex, interval, rowIndex),
          )}
          {daySlots.map(renderSlotBlock)}
        </div>
      </div>
    );
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-3 shadow-2xl shadow-blue-500/10 backdrop-blur-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/25"
    >
      {loading ? (
        <div className="py-12 text-center text-sm font-bold text-slate-500">
          Loading routine...
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div
              className="grid overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/50 shadow-inner shadow-blue-500/5 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:to-blue-950/30"
              style={{ gridTemplateColumns: `${dayAxisWidth}px minmax(${timeAxisMinWidth}px,1fr)` }}
            >
              <div className="border-b border-slate-200 bg-gradient-to-br from-slate-100 via-white to-blue-50 p-2.5 text-center text-xs font-black uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/30 dark:text-slate-300">
                DAY / TIME
              </div>
              <div
                className="flex border-b border-l border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(239,246,255,0.55))] dark:border-slate-800 dark:bg-slate-950/55"
                style={{ minWidth: timeAxisMinWidth }}
              >
                {leadingOffset > 0 ? (
                  <div
                    className="min-h-16 shrink-0 border-l border-slate-200/80 dark:border-slate-800/80"
                    style={{ width: widthPercent(leadingOffset) }}
                  />
                ) : null}
                {timeIntervals.map((interval, rowIndex) => (
                  <div
                    key={`${interval.time}-${rowIndex}`}
                    className="grid min-h-16 shrink-0 place-items-center border-l border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-blue-50 p-2 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/30"
                    style={{ width: widthPercent(interval.height) }}
                  >
                    <div className="relative grid w-full gap-1">
                      <input
                        type="time"
                        value={interval.time}
                        onChange={(event) =>
                          handleTimeChange(rowIndex, event.target.value)
                        }
                        disabled={!isEditingRoutine}
                        className={`min-w-0 rounded-lg border border-transparent bg-transparent px-1 text-center text-sm font-black text-slate-700 outline-none dark:text-slate-200 ${isEditingRoutine ? "focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950" : "cursor-default"}`}
                        aria-label={`Edit time row ${rowIndex + 1}`}
                      />
                      {isEditingRoutine ? (
                        <button
                          type="button"
                          className="relative z-20 mx-auto grid size-7 shrink-0 place-items-center rounded-lg bg-white text-rose-500 shadow-sm transition hover:bg-rose-50 dark:bg-slate-950/80 dark:hover:bg-rose-500/10"
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

              {visibleDays.map(renderDayRow)}
            </div>
          </div>
          </div>
          {isEditingRoutine ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300 xl:min-h-full xl:w-11 xl:flex-col xl:px-2 xl:[writing-mode:vertical-rl]"
              onClick={addTimeRow}
            >
              <Plus size={16} />
              <span>Add Time Slot</span>
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}


