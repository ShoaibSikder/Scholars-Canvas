import { Calendar, Clock, Edit3, MapPin, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { fetchRoutine } from "../../services/appService";
import { useApiData } from "../../hooks/useApiData";

const fallbackRoutine = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  times: ["8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00"],
  classes: [
    { id: 1, day: 0, start: 0, duration: 2, name: "Calculus", room: "Room 204", color: "blue", live: true },
    { id: 2, day: 1, start: 2, duration: 2, name: "Data Structures", room: "Room 301", color: "purple" },
    { id: 3, day: 3, start: 4, duration: 2, name: "Database", room: "Room 205", color: "green" },
    { id: 4, day: 5, start: 5, duration: 2, name: "Machine Learning", room: "Lab 2", color: "orange" },
  ],
};

function getTop(startIndex) {
  return `${startIndex * 5}rem`;
}

export default function RoutinePage() {
  const { data } = useApiData(fetchRoutine, fallbackRoutine);

  return (
    <div className="sa-page">
      <div className="sa-page__topRow">
        <div>
          <h1 className="sa-page__title">Class Routine</h1>
          <p className="sa-page__subtitle">Your weekly schedule at a glance</p>
        </div>

        <div className="sa-toolbar">
          <button type="button" className="sa-toolbar__toggle is-active">
            Week
          </button>
          <button type="button" className="sa-toolbar__toggle">
            Month
          </button>
          <button type="button" className="sa-primaryBtn sa-primaryBtn--small">
            <Plus size={18} />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card sa-routine">
        <div className="sa-routine__header">
          <div className="sa-routine__timeCell">Time</div>
          {data.days.map((day) => (
            <div key={day} className="sa-routine__dayCell">
              {day}
            </div>
          ))}
        </div>

        <div className="sa-routine__grid">
          <div className="sa-routine__times">
            {data.times.map((time) => (
              <div key={time} className="sa-routine__timeSlot">
                {time}
              </div>
            ))}
          </div>

          <div className="sa-routine__columns">
            {data.days.map((_, dayIndex) => (
              <div key={dayIndex} className="sa-routine__column">
                {data.times.map((time) => (
                  <div key={time} className="sa-routine__cell" />
                ))}

                {data.classes
                  .filter((cls) => cls.day === dayIndex)
                  .map((cls) => (
                    <div
                      key={cls.id}
                      className={`sa-routine__class sa-routine__class--${cls.color} ${cls.live ? "is-live" : ""}`}
                      style={{ top: getTop(cls.start), height: `${cls.duration * 5}rem` }}
                    >
                      <div className="sa-routine__classContent">
                        <h3>{cls.name}</h3>
                        <p>
                          <Clock size={12} />
                          8:00 - 10:00
                        </p>
                        <p>
                          <MapPin size={12} />
                          {cls.room}
                        </p>
                      </div>

                      <div className="sa-routine__classActions">
                        <button type="button">
                          <Edit3 size={12} />
                        </button>
                        <button type="button">
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {cls.live ? <span className="sa-routine__liveBadge">LIVE</span> : null}
                    </div>
                  ))}
              </div>
            ))}

            <div className="sa-routine__nowLine" />
          </div>
        </div>
      </motion.section>

      <div className="sa-routine__list">
        {data.classes.map((cls) => (
          <motion.article
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`sa-routine__listItem sa-routine__listItem--${cls.color}`}
          >
            <div className="sa-routine__listItemHead">
              <h3>{cls.name}</h3>
              {cls.live ? <span>Live Now</span> : null}
            </div>
            <div className="sa-routine__listMeta">
              <span>
                <Clock size={14} />
                8:00 AM - 10:00 AM
              </span>
              <span>
                <MapPin size={14} />
                {cls.room}
              </span>
            </div>
            <div className="sa-routine__listActions">
              <button type="button">
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
              <button type="button">
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
