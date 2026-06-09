import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

import Button from "../../components/common/Button";
import InPageStatus from "../../components/common/InPageStatus";
import Input from "../../components/common/Input";
import { WARMUP_ENDPOINT } from "../../api/endpoints";
import { loginUser } from "./authService";

export default function LoginForm({
  onSwitchToRegister,
  onForgotPassword,
  onLoginSuccess,
  authNotice = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(WARMUP_ENDPOINT, {
      cache: "no-store",
      signal: controller.signal,
    }).catch(() => {
      // The login request will still handle any remaining wake-up delay.
    });

    return () => controller.abort();
  }, []);

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

      localStorage.removeItem("scholars_canvas_token");
      sessionStorage.removeItem("scholars_canvas_token");
      localStorage.removeItem("studentassistant_token");
      sessionStorage.removeItem("studentassistant_token");
      if (formData.rememberMe) {
        localStorage.setItem("scholars_canvas_token", response.token);
      } else {
        sessionStorage.setItem("scholars_canvas_token", response.token);
      }

      onLoginSuccess?.(response);
    } catch (error) {
      setStatus(error.message || "Unable to sign in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md shadow-blue-500/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:rounded-[2rem] sm:p-5 lg:p-3"
    >
      <div className="text-center">
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          Welcome Back!
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Sign in to access your academic dashboard
        </p>
      </div>

      {authNotice ? <div className="mt-5"><InPageStatus message={authNotice} type="success" /></div> : null}
      {status ? <div className="mt-5"><InPageStatus message={status} type="error" /></div> : null}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <Input
          id="email"
          type="email"
          label="Email Address"
          leftIcon={<Mail size={20} />}
          value={formData.email}
          onChange={(event) =>
            setFormData({ ...formData, email: event.target.value })
          }
          placeholder="Enter your email"
          required
        />

        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Password
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Lock size={20} />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              className="min-h-8 w-full rounded-lg border border-slate-200 bg-white/90 px-10 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-blue-500/70 dark:focus:bg-slate-950"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              aria-label="Toggle password"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(event) =>
                setFormData({ ...formData, rememberMe: event.target.checked })
              }
              className="size-4 accent-blue-600"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="ml-auto text-sm font-bold text-blue-600 dark:text-blue-300"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 font-black text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          <LogIn size={20} />
          <span>{loading ? "Signing In..." : "Sign In"}</span>
        </motion.button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          New to Scholars Canvas?
        </p>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onSwitchToRegister}
      >
        Create an Account
      </Button>
    </motion.div>
  );
}
