import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, GraduationCap, Mail, MapPin, Pencil, Shield, Sparkles, User } from "lucide-react";

const defaultDraft = {
  full_name: "",
  email: "",
  university: "",
  major: "",
  current_semester: "",
};

export default function ProfilePage({ user, onSave }) {
  const [draft, setDraft] = useState(defaultDraft);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft({
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      university: user?.university ?? "",
      major: user?.major ?? "",
      current_semester: user?.current_semester ? String(user.current_semester) : "",
    });
  }, [user]);

  const stats = [
    { label: "Courses", value: "6" },
    { label: "Resources", value: "42" },
    { label: "Tasks Done", value: "18" },
    { label: "Study Streak", value: "12d" },
  ];

  const achievements = [
    "Top 10% in Data Structures",
    "Flashcard Master",
    "3-week consistency streak",
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      await onSave?.({
        full_name: draft.full_name.trim(),
        email: draft.email.trim(),
        university: draft.university.trim(),
        major: draft.major.trim(),
        current_semester: draft.current_semester ? Number(draft.current_semester) : 1,
      });
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sa-page">
      <div className="sa-page__topRow">
        <div>
          <h1 className="sa-page__title">Profile</h1>
          <p className="sa-page__subtitle">Update your academic identity and preferences</p>
        </div>

        <button type="submit" form="profile-form" className="sa-primaryBtn sa-primaryBtn--small" disabled={saving}>
          <Pencil size={18} />
          <span>{saving ? "Saving..." : "Save Profile"}</span>
        </button>
      </div>

      {status ? <div className="sa-page__notice">{status}</div> : null}

      <div className="sa-profileLayout">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card sa-profileCard">
          <div className="sa-profileCard__hero">
            <div className="sa-profileAvatar">
              <User size={34} />
            </div>
            <div>
              <h2>{draft.full_name || "Scholar"}</h2>
              <p>Student • {draft.major || "Major not set"}</p>
            </div>
          </div>

          <form id="profile-form" className="sa-profileForm" onSubmit={handleSubmit}>
            <div className="sa-profileForm__grid">
              <label className="sa-profileField">
                <span>Full Name</span>
                <input
                  type="text"
                  value={draft.full_name}
                  onChange={(event) => setDraft({ ...draft, full_name: event.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label className="sa-profileField">
                <span>Email Address</span>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  placeholder="student@university.edu"
                  required
                />
              </label>

              <label className="sa-profileField">
                <span>University</span>
                <input
                  type="text"
                  value={draft.university}
                  onChange={(event) => setDraft({ ...draft, university: event.target.value })}
                  placeholder="University name"
                />
              </label>

              <label className="sa-profileField">
                <span>Department / Major</span>
                <input
                  type="text"
                  value={draft.major}
                  onChange={(event) => setDraft({ ...draft, major: event.target.value })}
                  placeholder="Your department or major"
                  required
                />
              </label>

              <label className="sa-profileField">
                <span>Current Semester</span>
                <select
                  value={draft.current_semester}
                  onChange={(event) => setDraft({ ...draft, current_semester: event.target.value })}
                  required
                >
                  <option value="">Select semester</option>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Semester {index + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </form>

          <div className="sa-profileCard__infoGrid">
            <div className="sa-profileInfo">
              <Mail size={16} />
              <div>
                <span>Email</span>
                <strong>{draft.email || "student@university.edu"}</strong>
              </div>
            </div>
            <div className="sa-profileInfo">
              <GraduationCap size={16} />
              <div>
                <span>University</span>
                <strong>{draft.university || "Not set yet"}</strong>
              </div>
            </div>
            <div className="sa-profileInfo">
              <MapPin size={16} />
              <div>
                <span>Department / Major</span>
                <strong>{draft.major || "Not set yet"}</strong>
              </div>
            </div>
            <div className="sa-profileInfo">
              <Calendar size={16} />
              <div>
                <span>Current Semester</span>
                <strong>{draft.current_semester ? `Semester ${draft.current_semester}` : "Not set yet"}</strong>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="sa-profileSide">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card">
            <div className="sa-card__header">
              <h2>Progress Snapshot</h2>
              <Sparkles className="sa-card__headerIcon" />
            </div>

            <div className="sa-profileStats">
              {stats.map((stat) => (
                <div key={stat.label} className="sa-profileStat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-card">
            <div className="sa-card__header">
              <h2>Highlights</h2>
              <Shield className="sa-card__headerIcon" />
            </div>

            <ul className="sa-profileHighlights">
              {achievements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
