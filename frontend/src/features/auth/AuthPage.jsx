import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  HeartPulse,
  Lock,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
  User,
  UserPlus,
  LogIn,
} from "lucide-react";
import { motion } from "framer-motion";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { loginUser, registerUser } from "./authService";

const semesterOptions = [
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

const initialRegisterForm = {
  full_name: "",
  email: "",
  university: "",
  major: "",
  current_semester: "",
  password: "",
  confirm_password: "",
  terms: false,
};

const initialLoginForm = {
  email: "",
  password: "",
  remember_me: false,
};

function getStoredToken() {
  return localStorage.getItem("studentassistant_token") || sessionStorage.getItem("studentassistant_token") || "";
}

function FloatingIcon({ className = "", children, delay = 0, duration = 3 }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(getStoredToken());
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const isRegister = mode === "register";

  const registerErrors = useMemo(() => {
    const errors = {};
    if (!registerForm.full_name.trim()) errors.full_name = "Full name is required.";
    if (!registerForm.email.trim()) errors.email = "Email is required.";
    if (!registerForm.university.trim()) errors.university = "University is required.";
    if (!registerForm.major.trim()) errors.major = "Major is required.";
    if (!registerForm.current_semester) errors.current_semester = "Select your semester.";
    if (!registerForm.password || registerForm.password.length < 8) errors.password = "Use 8+ characters.";
    if (registerForm.password !== registerForm.confirm_password) {
      errors.confirm_password = "Passwords do not match.";
    }
    if (!registerForm.terms) errors.terms = "Please accept the terms.";
    return errors;
  }, [registerForm]);

  const loginErrors = useMemo(() => {
    const errors = {};
    if (!loginForm.email.trim()) errors.email = "Email is required.";
    if (!loginForm.password) errors.password = "Password is required.";
    return errors;
  }, [loginForm]);

  const saveSession = (nextToken, rememberMe) => {
    localStorage.removeItem("studentassistant_token");
    sessionStorage.removeItem("studentassistant_token");

    if (rememberMe) {
      localStorage.setItem("studentassistant_token", nextToken);
    } else {
      sessionStorage.setItem("studentassistant_token", nextToken);
    }

    setToken(nextToken);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setStatus({ type: "", message: "" });
    if (Object.keys(loginErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await loginUser(loginForm);
      saveSession(response.token, loginForm.remember_me);
      setStatus({ type: "success", message: "Login successful." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setTouched({
      full_name: true,
      email: true,
      university: true,
      major: true,
      current_semester: true,
      password: true,
      confirm_password: true,
      terms: true,
    });
    setStatus({ type: "", message: "" });
    if (Object.keys(registerErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await registerUser({
        full_name: registerForm.full_name.trim(),
        email: registerForm.email.trim(),
        university: registerForm.university.trim(),
        major: registerForm.major.trim(),
        current_semester: semesterOptions.indexOf(registerForm.current_semester) + 1,
        password: registerForm.password,
      });
      saveSession(response.token, true);
      setStatus({ type: "success", message: "Registration successful." });
      setMode("login");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual__glow auth-visual__glow--pink" />
        <div className="auth-visual__glow auth-visual__glow--purple" />
        <div className="auth-visual__glow auth-visual__glow--blue" />

        <div className="auth-visual__brand">
          <div className="auth-visual__logo">
            <GraduationCap size={34} />
          </div>
          <h1>StudentAssistant</h1>
          <p>Your Academic Command Center</p>
        </div>

        <div className="auth-visual__art">
          <FloatingIcon className="auth-visual__float auth-visual__float--book" delay={0.1} duration={3.2}>
            <BookOpen size={32} />
          </FloatingIcon>
          <FloatingIcon className="auth-visual__float auth-visual__float--clock" delay={1} duration={2.8}>
            <Clock size={26} />
          </FloatingIcon>
          <FloatingIcon className="auth-visual__float auth-visual__float--brain" delay={1.4} duration={3.4}>
            <Brain size={28} />
          </FloatingIcon>
          <FloatingIcon className="auth-visual__float auth-visual__float--spark" delay={0.7} duration={3.1}>
            <Sparkles size={28} />
          </FloatingIcon>

          <motion.div
            className="auth-visual__device"
            animate={{ rotate: [3, 1.5, 3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="auth-visual__deviceScreen">
              <div className="auth-visual__deviceTop">
                <div className="auth-visual__dot" />
                <div className="auth-visual__line auth-visual__line--long" />
                <div className="auth-visual__line auth-visual__line--short" />
              </div>
              <div className="auth-visual__panel auth-visual__panel--blue">
                <BookOpen size={28} />
              </div>
              <div className="auth-visual__panel auth-visual__panel--pink">
                <Target size={28} />
              </div>
              <div className="auth-visual__panel auth-visual__panel--blue2">
                <TrendingUp size={28} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="auth-visual__student"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="auth-visual__studentHead" />
            <div className="auth-visual__studentBody" />
          </motion.div>
        </div>

        <div className="auth-visual__tags">
          <span><Brain size={14} /> AI-Powered</span>
          <span><Target size={14} /> Smart Tracking</span>
          <span><Sparkles size={14} /> Auto Flashcards</span>
        </div>
      </section>

      <section className="auth-panel">
        <motion.div
          key={mode}
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="auth-toggle">
            <button className={isRegister ? "" : "active"} type="button" onClick={() => setMode("login")}>
              <LogIn size={16} />
              Login
            </button>
            <button className={isRegister ? "active" : ""} type="button" onClick={() => setMode("register")}>
              <UserPlus size={16} />
              Registration
            </button>
          </div>

          <div className="auth-head">
            <h2>{isRegister ? "Create Account" : "Welcome Back!"}</h2>
            <p>{isRegister ? "Sign up to access your academic dashboard" : "Sign in to access your academic dashboard"}</p>
          </div>

          {status.message ? <div className={`auth-alert auth-alert--${status.type}`}>{status.message}</div> : null}

          {isRegister ? (
            <form className="auth-form auth-form--register" onSubmit={handleRegisterSubmit}>
              <Input
                id="full_name"
                label="Full Name"
                leftIcon={<User size={18} />}
                placeholder="John Doe"
                value={registerForm.full_name}
                onChange={(event) => setRegisterForm({ ...registerForm, full_name: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, full_name: true }))}
                error={touched.full_name ? registerErrors.full_name : ""}
                hint="Used for a personalized dashboard greeting."
                required
              />

              <Input
                id="register_email"
                label="Email Address"
                type="email"
                leftIcon={<Mail size={18} />}
                placeholder="student@university.edu"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                error={touched.email ? registerErrors.email : ""}
                hint="Your primary login ID."
                required
              />

              <Input
                id="university"
                label="University Name"
                leftIcon={<GraduationCap size={18} />}
                placeholder="Daffodil International University"
                value={registerForm.university}
                onChange={(event) => setRegisterForm({ ...registerForm, university: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, university: true }))}
                error={touched.university ? registerErrors.university : ""}
                hint="Helps organize campus-specific features."
                required
              />

              <Input
                id="major"
                label="Department / Major"
                leftIcon={<BookOpen size={18} />}
                placeholder="Computer Science and Engineering"
                value={registerForm.major}
                onChange={(event) => setRegisterForm({ ...registerForm, major: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, major: true }))}
                error={touched.major ? registerErrors.major : ""}
                hint="Used to tailor AI support to your study context."
                required
              />

              <label className="sa-field">
                <span className="sa-field__label">Current Semester / Year</span>
                <div className="sa-inputWrap">
                  <span className="sa-inputWrap__icon">
                    <Calendar size={18} />
                  </span>
                  <select
                    className={`sa-input sa-input--withIcon sa-select ${touched.current_semester && registerErrors.current_semester ? "is-invalid" : ""}`}
                    value={registerForm.current_semester}
                    onChange={(event) => setRegisterForm({ ...registerForm, current_semester: event.target.value })}
                    onBlur={() => setTouched((current) => ({ ...current, current_semester: true }))}
                    required
                  >
                    <option value="">Select your current semester</option>
                    {semesterOptions.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </div>
                <span className={`sa-field__hint ${touched.current_semester ? "sa-field__hint--error" : ""}`}>
                  {touched.current_semester ? registerErrors.current_semester || "Looks good." : "Pick your current academic level."}
                </span>
              </label>

              <Input
                id="register_password"
                label="Password"
                type={showRegisterPassword ? "text" : "password"}
                leftIcon={<Lock size={18} />}
                rightSlot={
                  <button
                    type="button"
                    className="sa-passwordToggle"
                    onClick={() => setShowRegisterPassword((current) => !current)}
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                placeholder="Create a strong password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                error={touched.password ? registerErrors.password : ""}
                hint="Use at least 8 characters."
                required
              />

              <Input
                id="confirm_password"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                leftIcon={<Lock size={18} />}
                rightSlot={
                  <button
                    type="button"
                    className="sa-passwordToggle"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                placeholder="Re-enter your password"
                value={registerForm.confirm_password}
                onChange={(event) => setRegisterForm({ ...registerForm, confirm_password: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, confirm_password: true }))}
                error={touched.confirm_password ? registerErrors.confirm_password : ""}
                hint="Must match your password exactly."
                required
              />

              <label className="auth-check auth-check--register">
                <input
                  type="checkbox"
                  checked={registerForm.terms}
                  onChange={(event) => setRegisterForm({ ...registerForm, terms: event.target.checked })}
                  onBlur={() => setTouched((current) => ({ ...current, terms: true }))}
                />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
              {touched.terms ? <span className="sa-field__hint sa-field__hint--error">{registerErrors.terms}</span> : null}

              <Button type="submit" className="auth-submit" disabled={loading}>
                <GraduationCap size={18} />
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <button type="button" className="auth-switch" onClick={() => setMode("login")}>
                Already have an account? Sign In Instead
              </button>
            </form>
          ) : (
            <form className="auth-form auth-form--login" onSubmit={handleLoginSubmit}>
              <Input
                id="login_email"
                label="Email Address"
                leftIcon={<Mail size={18} />}
                type="email"
                placeholder="student@university.edu"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                error={touched.email ? loginErrors.email : ""}
                required
              />

              <Input
                id="login_password"
                label="Password"
                leftIcon={<Lock size={18} />}
                rightSlot={
                  <button
                    type="button"
                    className="sa-passwordToggle"
                    onClick={() => setShowLoginPassword((current) => !current)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                type={showLoginPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                error={touched.password ? loginErrors.password : ""}
                required
              />

              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={loginForm.remember_me}
                    onChange={(event) => setLoginForm({ ...loginForm, remember_me: event.target.checked })}
                  />
                  <span>Remember me</span>
                </label>

                <button type="button" className="auth-link">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="auth-submit" disabled={loading}>
                <LogIn size={18} />
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="auth-divider">
                <span />
                <p>New to StudentAssistant?</p>
                <span />
              </div>

              <Button type="button" variant="ghost" className="auth-secondary" onClick={() => setMode("register")}>
                Create an Account
              </Button>
            </form>
          )}

          <div className="auth-footnote">Secure session ready {token ? "· token stored" : "· no active token"}</div>
        </motion.div>
      </section>
    </main>
  );
}
