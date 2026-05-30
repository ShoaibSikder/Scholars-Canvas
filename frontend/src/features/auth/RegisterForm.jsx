import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Calendar } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { registerUser } from "./authService";

const semesters = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "9th Semester",
  "10th Semester",
  "11th Semester",
  "12th Semester",
];

const fieldWrap = "grid gap-2";
const labelClass = "text-sm font-bold text-slate-700 dark:text-slate-200";
const inputClass =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100";

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    major: "",
    semester: "",
    terms: false,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const response = await registerUser({
        full_name: formData.fullName,
        email: formData.email,
        university: formData.university,
        major: formData.major,
        current_semester: semesters.indexOf(formData.semester) + 1,
        password: formData.password,
      });

      onRegisterSuccess?.(response.user);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({ id, label, show, setShow, value, onChange, placeholder }) => (
    <label className={fieldWrap}>
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <Lock size={20} />
        </span>
        <input id={id} type={show ? "text" : "password"} required value={value} onChange={onChange} className={inputClass} placeholder={placeholder} />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={`Toggle ${label}`}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </label>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:p-7"
    >
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-950 dark:text-white">Create Your Account</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Join thousands of students organizing their academic life</p>
      </div>

      {status ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{status}</div> : null}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3.5">
        <Input id="fullName" type="text" label="Full Name" leftIcon={<User size={20} />} value={formData.fullName} onChange={(event) => setFormData({ ...formData, fullName: event.target.value })} placeholder="John Doe" required />
        <Input id="email" type="email" label="Email Address" leftIcon={<Mail size={20} />} value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="student@university.edu" required />
        <Input id="university" type="text" label="University Name" leftIcon={<GraduationCap size={20} />} value={formData.university} onChange={(event) => setFormData({ ...formData, university: event.target.value })} placeholder="e.g., MIT, Stanford University" />
        <Input id="major" type="text" label="Department / Major" leftIcon={<BookOpen size={20} />} value={formData.major} onChange={(event) => setFormData({ ...formData, major: event.target.value })} placeholder="e.g., Computer Science, Psychology" required />

        <label className={fieldWrap}>
          <span className={labelClass}>Current Semester / Year</span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Calendar size={20} />
            </span>
            <select
              id="semester"
              required
              value={formData.semester}
              onChange={(event) => setFormData({ ...formData, semester: event.target.value })}
              className={inputClass}
            >
              <option value="">Select your current semester</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>
        </label>

        <PasswordField id="password" label="Password" show={showPassword} setShow={setShowPassword} value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Create a strong password" />
        <PasswordField id="confirmPassword" label="Confirm Password" show={showConfirmPassword} setShow={setShowConfirmPassword} value={formData.confirmPassword} onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })} placeholder="Re-enter your password" />

        <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
          <input type="checkbox" required checked={formData.terms} onChange={(event) => setFormData({ ...formData, terms: event.target.checked })} className="mt-1 size-4 shrink-0 accent-blue-600" />
          <label>
            I agree to the <span className="font-bold text-blue-600 dark:text-blue-300">Terms of Service</span> and <span className="font-bold text-blue-600 dark:text-blue-300">Privacy Policy</span>
          </label>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 font-black text-white shadow-lg shadow-blue-500/25"
          disabled={loading}
        >
          <GraduationCap size={20} />
          <span>{loading ? "Creating Account..." : "Create Account"}</span>
        </motion.button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Already have an account?</p>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button type="button" variant="ghost" className="w-full" onClick={onSwitchToLogin}>
        Sign In Instead
      </Button>
    </motion.div>
  );
}
