import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
} from "lucide-react";

import Button from "../../components/common/Button";
import InPageStatus from "../../components/common/InPageStatus";
import Input from "../../components/common/Input";
import { registerUser } from "./authService";
import { fieldWrap, inputClass, labelClass, semesters } from "./authFormConstants";
import { PasswordField } from "./components/PasswordField";
import TermsModal from "./components/TermsModal";

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
  const [termsModal, setTermsModal] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    if (formData.password !== formData.confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
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
      setStatus(error.message || "Unable to create account. Please check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-h-none w-full max-w-lg overflow-visible rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md shadow-blue-500/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:rounded-[2rem] sm:p-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:p-7"
    >
      <div className="text-center">
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Join thousands of students organizing their academic life
        </p>
      </div>

      {status ? <div className="mt-5"><InPageStatus message={status} type="error" /></div> : null}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <Input
          id="fullName"
          type="text"
          label="Full Name"
          leftIcon={<User size={20} />}
          value={formData.fullName}
          onChange={(event) =>
            setFormData({ ...formData, fullName: event.target.value })
          }
          placeholder="John Doe"
          required
        />
        <Input
          id="email"
          type="email"
          label="Email Address"
          leftIcon={<Mail size={20} />}
          value={formData.email}
          onChange={(event) =>
            setFormData({ ...formData, email: event.target.value })
          }
          placeholder="student@university.edu"
          required
        />
        <Input
          id="university"
          type="text"
          label="University Name"
          leftIcon={<GraduationCap size={20} />}
          value={formData.university}
          onChange={(event) =>
            setFormData({ ...formData, university: event.target.value })
          }
          placeholder="e.g., MIT, Stanford University"
        />
        <Input
          id="major"
          type="text"
          label="Department / Major"
          leftIcon={<BookOpen size={20} />}
          value={formData.major}
          onChange={(event) =>
            setFormData({ ...formData, major: event.target.value })
          }
          placeholder="e.g., Computer Science, Psychology"
          required
        />

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
              onChange={(event) =>
                setFormData({ ...formData, semester: event.target.value })
              }
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

        <PasswordField
          id="password"
          label="Password"
          show={showPassword}
          setShow={setShowPassword}
          value={formData.password}
          onChange={(event) =>
            setFormData({ ...formData, password: event.target.value })
          }
          placeholder="Create a strong password"
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          show={showConfirmPassword}
          setShow={setShowConfirmPassword}
          value={formData.confirmPassword}
          onChange={(event) =>
            setFormData({ ...formData, confirmPassword: event.target.value })
          }
          placeholder="Re-enter your password"
        />

        <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
          <input
            type="checkbox"
            required
            checked={formData.terms}
            onChange={(event) =>
              setFormData({ ...formData, terms: event.target.checked })
            }
            className="mt-1 size-4 shrink-0 accent-blue-600"
          />
          <label className="min-w-0 leading-6">
            I agree to the{" "}
            <button
              type="button"
              className="font-bold text-blue-600 underline-offset-2 hover:underline dark:text-blue-300"
              onClick={() => setTermsModal("terms")}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="font-bold text-blue-600 underline-offset-2 hover:underline dark:text-blue-300"
              onClick={() => setTermsModal("privacy")}
            >
              Privacy Policy
            </button>
          </label>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 font-black text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          <GraduationCap size={20} />
          <span>{loading ? "Creating Account..." : "Create Account"}</span>
        </motion.button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Already have an account?
        </p>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onSwitchToLogin}
      >
        Sign In Instead
      </Button>

      {termsModal ? (
        <TermsModal type={termsModal} onClose={() => setTermsModal("")} />
      ) : null}
    </motion.div>
  );
}

