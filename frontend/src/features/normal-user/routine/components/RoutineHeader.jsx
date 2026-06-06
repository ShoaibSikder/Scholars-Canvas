import { Edit3 } from "lucide-react";

import { input, primaryBtn, routineDayOptions, secondaryBtn } from "../routineConstants";

export default function RoutineHeader({
  isEditingRoutine,
  selectedDay,
  setEditingRoutine,
  setEditingSlot,
  setFormOpen,
  setSelectedDay,
  setView,
  view,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
          Class Routine
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
          {["week", "day"].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`rounded-lg px-3 py-1.5 text-sm font-black capitalize ${view === mode ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
              onClick={() => setView(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
        {view === "day" ? (
          <select
            value={selectedDay}
            onChange={(event) => setSelectedDay(Number(event.target.value))}
            className={input}
            aria-label="Select routine day"
          >
            {routineDayOptions.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        ) : null}
        <button
          type="button"
          className={isEditingRoutine ? secondaryBtn : primaryBtn}
          onClick={() => {
            setEditingRoutine((current) => {
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
  );
}


