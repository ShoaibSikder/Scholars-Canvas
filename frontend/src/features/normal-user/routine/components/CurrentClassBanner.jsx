import { formatTime } from "../routineUtils";

export default function CurrentClassBanner({ currentSlot }) {
  if (!currentSlot) return null;

  return (
    <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 text-green-800 shadow-xl shadow-green-500/10 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-green-500/10 dark:text-emerald-200">
      <div className="flex flex-wrap items-center gap-2">
        <strong>
          Current class: {currentSlot.course_code} - {currentSlot.course_title}
        </strong>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm shadow-green-500/20">
          <span className="size-1.5 rounded-full bg-white animate-pulse" />
          Live
        </span>
      </div>
      <span className="text-sm font-semibold">
        {formatTime(currentSlot.start_time)} - {formatTime(currentSlot.end_time)}{" "}
        in {currentSlot.room_number}
      </span>
    </div>
  );
}


