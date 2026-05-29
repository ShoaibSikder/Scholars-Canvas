import { Clock, CheckCircle2, FolderOpen, MapPin, TrendingUp, Video, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { fetchDashboard } from "../../services/appService";
import { useApiData } from "../../hooks/useApiData";

const fallbackDashboard = {
  studyData: [
    { day: "Mon", hours: 4 },
    { day: "Tue", hours: 6 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 7 },
    { day: "Fri", hours: 5 },
    { day: "Sat", hours: 8 },
    { day: "Sun", hours: 4 },
  ],
  currentClass: {
    name: "Data Structures",
    room: "Room 301",
    isLive: true,
    endTime: "10:30 AM",
    zoomLink: "#",
  },
  nextClass: {
    name: "Database Management",
    room: "Room 205",
    startTime: "11:00 AM",
  },
  topTasks: [
    { id: 1, title: "Complete ML Assignment", priority: "high", due: "Today 5:00 PM" },
    { id: 2, title: "Read Chapter 7 - Algorithms", priority: "medium", due: "Tomorrow" },
    { id: 3, title: "Prepare presentation slides", priority: "high", due: "Today 8:00 PM" },
  ],
  recentFiles: [
    { name: "Neural_Networks.pdf", course: "AI", accessed: "2h ago" },
    { name: "Database_Notes.pptx", course: "DBMS", accessed: "5h ago" },
    { name: "Algorithms_Cheat_Sheet.pdf", course: "DSA", accessed: "1d ago" },
  ],
};

function buildLinePath(points, width, height) {
  if (!points.length) return "";
  const max = Math.max(...points.map((point) => point.hours), 1);
  const stepX = width / (points.length - 1 || 1);
  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.hours / max) * (height - 10) - 5;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function DashboardPage() {
  const { data } = useApiData(fetchDashboard, fallbackDashboard);
  const path = buildLinePath(data.studyData ?? [], 560, 180);
  const maxHours = Math.max(...(data.studyData ?? []).map((entry) => entry.hours), 1);

  return (
    <div className="sa-page">
      <div className="sa-page__grid sa-page__grid--dashboard">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card sa-card--large">
          <div className="sa-card__header">
            <h2>Class Schedule</h2>
            <Clock className="sa-card__headerIcon" />
          </div>

          <div className="sa-liveClass">
            {data.currentClass?.isLive ? (
              <div className="sa-liveClass__badge">
                <span className="sa-liveDot" />
                <span>Live Now</span>
              </div>
            ) : null}

            <div className="sa-liveClass__content">
              <h3>{data.currentClass?.name}</h3>
              <div className="sa-liveClass__meta">
                <span>
                  <MapPin size={16} />
                  {data.currentClass?.room}
                </span>
                <span>
                  <Clock size={16} />
                  Ends at {data.currentClass?.endTime}
                </span>
              </div>
              <button type="button" className="sa-primaryBtn sa-primaryBtn--small">
                <Video size={16} />
                <span>Join Zoom</span>
              </button>
            </div>
          </div>

          <div className="sa-nextClass">
            <p>UP NEXT</p>
            <h3>{data.nextClass?.name}</h3>
            <div className="sa-nextClass__meta">
              <span>
                <MapPin size={16} />
                {data.nextClass?.room}
              </span>
              <span>
                <Clock size={16} />
                {data.nextClass?.startTime}
              </span>
            </div>
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card sa-card--compact">
          <div className="sa-card__header">
            <h2>Today's Tasks</h2>
            <CheckCircle2 className="sa-card__headerIcon" />
          </div>

          <div className="sa-taskList">
            {(data.topTasks ?? []).map((task) => (
              <div key={task.id} className={`sa-taskItem sa-taskItem--${task.priority}`}>
                <div className="sa-taskItem__body">
                  <input type="checkbox" />
                  <div>
                    <p>{task.title}</p>
                    <span>
                      <AlertCircle size={12} />
                      {task.due}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="sa-linkBtn">
            View all tasks →
          </button>
        </motion.aside>
      </div>

      <div className="sa-page__grid sa-page__grid--secondary">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card sa-chartCard">
          <div className="sa-card__header">
            <h2>Study Consistency</h2>
            <TrendingUp className="sa-card__headerIcon sa-card__headerIcon--green" />
          </div>

          <div className="sa-chart">
            <svg viewBox="0 0 560 180" className="sa-chart__svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="saLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <line x1="0" y1="179" x2="560" y2="179" className="sa-chart__axis" />
              <path d={path} className="sa-chart__line" />
              {(data.studyData ?? []).map((point, index) => {
                const stepX = 560 / ((data.studyData ?? []).length - 1 || 1);
                const x = index * stepX;
                const y = 180 - (point.hours / maxHours) * 170 - 5;
                return <circle key={point.day} cx={x} cy={y} r="4" className="sa-chart__dot" />;
              })}
            </svg>
            <div className="sa-chart__labels">
              {(data.studyData ?? []).map((point) => (
                <span key={point.day}>{point.day}</span>
              ))}
            </div>
          </div>

          <div className="sa-chartStats">
            <div>
              <p>Weekly Average</p>
              <strong>5.3 hrs</strong>
            </div>
            <div>
              <p>Best Day</p>
              <strong>8 hrs</strong>
            </div>
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card">
          <div className="sa-card__header">
            <h2>Recent Files</h2>
            <FolderOpen className="sa-card__headerIcon" />
          </div>

          <div className="sa-fileList">
            {(data.recentFiles ?? []).map((file) => (
              <div key={file.name} className="sa-fileList__item">
                <div>
                  <p>{file.name}</p>
                  <div>
                    <span>{file.course}</span>
                    <span>{file.accessed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="sa-linkBtn">
            Open Vault →
          </button>
        </motion.aside>
      </div>
    </div>
  );
}
