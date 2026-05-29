import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Calendar } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { registerUser } from "./authService";

const semesters = [
  "Freshman - 1st Semester",
  "Freshman - 2nd Semester",
  "Sophomore - 3rd Semester",
  "Sophomore - 4th Semester",
  "Junior - 5th Semester",
  "Junior - 6th Semester",
  "Senior - 7th Semester",
  "Senior - 8th Semester",
  "Graduate Student",
];

export default function RegisterForm({ onSwitchToLogin }) {
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

      localStorage.removeItem("studentassistant_token");
      sessionStorage.removeItem("studentassistant_token");
      localStorage.setItem("studentassistant_token", response.token);
      setStatus("Registration successful.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="auth-cardPanel auth-cardPanel--register"
    >
      <div className="auth-cardPanel__head">
        <h2>Create Your Account</h2>
        <p>Join thousands of students organizing their academic life</p>
      </div>

      {status ? <div className="auth-message">{status}</div> : null}

      <form onSubmit={handleSubmit} className="auth-formStack auth-formStack--register">
        <Input
          id="fullName"
          type="text"
          label="Full Name"
          leftIcon={<User size={20} />}
          value={formData.fullName}
          onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
          placeholder="John Doe"
          required
        />

        <Input
          id="email"
          type="email"
          label="Email Address"
          leftIcon={<Mail size={20} />}
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          placeholder="student@university.edu"
          required
        />

        <Input
          id="university"
          type="text"
          label="University Name"
          leftIcon={<GraduationCap size={20} />}
          value={formData.university}
          onChange={(event) => setFormData({ ...formData, university: event.target.value })}
          placeholder="e.g., MIT, Stanford University"
        />

        <Input
          id="major"
          type="text"
          label="Department / Major"
          leftIcon={<BookOpen size={20} />}
          value={formData.major}
          onChange={(event) => setFormData({ ...formData, major: event.target.value })}
          placeholder="e.g., Computer Science, Psychology"
          required
        />

        <label className="auth-field">
          <span className="auth-field__label">Current Semester / Year</span>
          <div className="auth-field__inputWrap">
            <span className="auth-field__icon">
              <Calendar size={20} />
            </span>
            <select
              id="semester"
              required
              value={formData.semester}
              onChange={(event) => setFormData({ ...formData, semester: event.target.value })}
              className="auth-input auth-input--withIcon auth-select"
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

        <label className="auth-field">
          <span className="auth-field__label">Password</span>
          <div className="auth-field__inputWrap">
            <span className="auth-field__icon">
              <Lock size={20} />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className="auth-input auth-input--withIcon"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="auth-field__toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>

        <label className="auth-field">
          <span className="auth-field__label">Confirm Password</span>
          <div className="auth-field__inputWrap">
            <span className="auth-field__icon">
              <Lock size={20} />
            </span>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
              className="auth-input auth-input--withIcon"
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="auth-field__toggle"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>

        <div className="auth-terms">
          <input
            type="checkbox"
            required
            checked={formData.terms}
            onChange={(event) => setFormData({ ...formData, terms: event.target.checked })}
          />
          <label>
            I agree to the <span>Terms of Service</span> and <span>Privacy Policy</span>
          </label>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="auth-primaryButton"
          disabled={loading}
        >
          <GraduationCap size={20} />
          <span>{loading ? "Creating Account..." : "Create Account"}</span>
        </motion.button>
      </form>

      <div className="auth-divider">
        <span />
        <p>Already have an account?</p>
        <span />
      </div>

      <Button type="button" variant="ghost" className="auth-ghostButton" onClick={onSwitchToLogin}>
        Sign In Instead
      </Button>
    </motion.div>
  );
}
