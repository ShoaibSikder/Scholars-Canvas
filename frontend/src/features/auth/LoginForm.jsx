import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { loginUser } from "./authService";

export default function LoginForm({ onSwitchToRegister }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
        remember_me: formData.rememberMe,
      });

      localStorage.removeItem("studentassistant_token");
      sessionStorage.removeItem("studentassistant_token");
      if (formData.rememberMe) {
        localStorage.setItem("studentassistant_token", response.token);
      } else {
        sessionStorage.setItem("studentassistant_token", response.token);
      }

      setStatus("Login successful.");
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
      className="auth-cardPanel auth-cardPanel--login"
    >
      <div className="auth-cardPanel__head">
        <h2>Welcome Back!</h2>
        <p>Sign in to access your academic dashboard</p>
      </div>

      {status ? <div className="auth-message">{status}</div> : null}

      <form onSubmit={handleSubmit} className="auth-formStack">
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
              placeholder="Enter your password"
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

        <div className="auth-row auth-row--spread">
          <label className="auth-row__check">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(event) => setFormData({ ...formData, rememberMe: event.target.checked })}
            />
            <span>Remember me</span>
          </label>

          <button type="button" className="auth-linkButton">
            Forgot password?
          </button>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="auth-primaryButton"
          disabled={loading}
        >
          <LogIn size={20} />
          <span>{loading ? "Signing In..." : "Sign In"}</span>
        </motion.button>
      </form>

      <div className="auth-divider">
        <span />
        <p>New to StudentAssistant?</p>
        <span />
      </div>

      <Button type="button" variant="ghost" className="auth-ghostButton" onClick={onSwitchToRegister}>
        Create an Account
      </Button>
    </motion.div>
  );
}


