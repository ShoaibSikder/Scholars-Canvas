import { CalendarDays, Clock, Edit3, MapPin, Trash2, UserRound } from "lucide-react";
import { motion } from "framer-motion";

import { classColors, fullDays } from "../routineConstants";
import { formatTime, isSlotLiveAt } from "../routineUtils";

export default function RoutineSlotList({
  clockNow,
  isEditingRoutine,
  listedSlots,
  onDelete,
  onEdit,
}) {
  if (!listedSlots.length) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {listedSlots.map((slot) => {
        const isLive = isSlotLiveAt(slot, clockNow);

        return (
          <motion.article
            key={slot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border p-3 shadow-md ${classColors[slot.color] ?? classColors.blue}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black">{slot.course_code}</h3>
                <p className="text-sm font-bold">{slot.course_title}</p>
              </div>
              {isLive ? (
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-black text-white">
                  Live Now
                </span>
              ) : null}
            </div>
            <div className="mt-4 grid gap-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} />
                {fullDays[slot.day]}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={14} />
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} />
                {slot.room_number}
              </span>
              {slot.faculty_initial ? (
                <span className="inline-flex items-center gap-2">
                  <UserRound size={14} />
                  {slot.faculty_initial}
                </span>
              ) : null}
            </div>
            {isEditingRoutine ? (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm font-black dark:bg-slate-950/40"
                  onClick={() => onEdit(slot)}
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm font-black dark:bg-slate-950/40"
                  onClick={() => onDelete(slot)}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
}


