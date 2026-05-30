import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { loginUser } from "./authService";

export default function LoginForm({ onSwitchToRegister, onLoginSuccess, authNotice = "" }) {
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

      onLoginSuccess?.(response.user);
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
      className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-2xl shadow-blue-500/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"
    >
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-950 dark:text-white">Welcome Back!</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Sign in to access your academic dashboard</p>
      </div>

      {authNotice ? <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{authNotice}</div> : null}
      {status ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{status}</div> : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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

        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Password</span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Lock size={20} />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle password"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(event) => setFormData({ ...formData, rememberMe: event.target.checked })}
              className="size-4 accent-blue-600"
            />
            <span>Remember me</span>
          </label>

          <button type="button" className="text-sm font-bold text-blue-600 dark:text-blue-300">
            Forgot password?
          </button>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 font-black text-white shadow-lg shadow-blue-500/25"
          disabled={loading}
        >
          <LogIn size={20} />
          <span>{loading ? "Signing In..." : "Sign In"}</span>
        </motion.button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">New to StudentAssistant?</p>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button type="button" variant="ghost" className="w-full" onClick={onSwitchToRegister}>
        Create an Account
      </Button>
    </motion.div>
  );
}
