import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound } from "lucide-react";

import Button from "../../components/common/Button";
import InPageStatus from "../../components/common/InPageStatus";
import { confirmPasswordReset } from "./authService";
import { PasswordField } from "./components/PasswordField";

export default function ResetPasswordForm({ uid, token, onBackToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await confirmPasswordReset({ uid, token, password });
      setComplete(true);
      setStatus(response.message || "Password reset successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md shadow-blue-500/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:rounded-[2rem] sm:p-6 lg:p-5"
    >
      <button
        type="button"
        className="mb-4 inline-flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-300"
        onClick={onBackToLogin}
      >
        <ArrowLeft size={16} />
        Back to sign in
      </button>

      <div className="text-center">
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          Create New Password
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Choose a new password for your Scholars Canvas account.
        </p>
      </div>

      {status ? <div className="mt-5"><InPageStatus message={status} type={complete ? "success" : "error"} /></div> : null}

      {!uid || !token ? (
        <div className="mt-5">
          <InPageStatus message="Password reset link is missing required information." type="error" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
          <PasswordField
            id="new-password"
            label="New Password"
            show={showPassword}
            setShow={setShowPassword}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter a new password"
          />
          <PasswordField
            id="confirm-new-password"
            label="Confirm New Password"
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter the new password"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 font-black text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || complete}
          >
            <KeyRound size={18} />
            <span>{loading ? "Resetting..." : complete ? "Password Reset" : "Reset Password"}</span>
          </motion.button>
        </form>
      )}

      <Button type="button" variant="ghost" className="mt-4 w-full" onClick={onBackToLogin}>
        Sign In
      </Button>
    </motion.div>
  );
}

