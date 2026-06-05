import { CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

import { card } from "../taskConstants";
import TaskCard from "./TaskCard";

export default function KanbanBoard({
  columns,
  onDelete,
  onEdit,
  onStatusChange,
  saving,
}) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
      {columns.map((column) => (
        <motion.section
          key={column.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex max-h-[calc(100vh-13rem)] min-h-0 flex-col overflow-hidden ${card}`}
        >
          <div
            className={`flex items-center justify-between bg-gradient-to-r ${column.head} px-2.5 py-2 text-white`}
          >
            <h2 className="text-sm font-black">{column.title}</h2>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-black">
              {column.tasks.length}
            </span>
          </div>

          <div className="grid min-h-0 flex-1 content-start gap-2.5 overflow-y-auto p-2.5 pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(37,99,235,0.35)_transparent]">
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                columnId={column.id}
                index={index}
                onDelete={onDelete}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                saving={saving}
                task={task}
              />
            ))}
            {column.tasks.length === 0 ? (
              <div className="grid min-h-36 place-items-center text-center text-slate-400">
                <div>
                  <CheckSquare size={32} className="mx-auto" />
                  <p className="mt-2 text-sm font-bold">No tasks here</p>
                </div>
              </div>
            ) : null}
          </div>
        </motion.section>
      ))}
    </div>
  );
}


