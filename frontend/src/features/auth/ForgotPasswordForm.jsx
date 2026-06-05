import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Send } from "lucide-react";

import Button from "../../components/common/Button";
import InPageStatus from "../../components/common/InPageStatus";
import Input from "../../components/common/Input";
import { requestPasswordReset } from "./authService";

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setStatusType("success");
    setLoading(true);
    try {
      const response = await requestPasswordReset({ email });
      setStatus(response.message || "Password reset link has been sent to your email.");
      setStatusType("success");
    } catch (error) {
      setStatus(error.message || "Unable to send reset link.");
      setStatusType("error");
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
          Reset Password
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Enter your account email and we will send a secure reset link.
        </p>
      </div>

      {status ? <div className="mt-5"><InPageStatus message={status} type={statusType} /></div> : null}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <Input
          id="reset-email"
          type="email"
          label="Email Address"
          leftIcon={<Mail size={20} />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="student@university.edu"
          required
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 font-black text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          <Send size={18} />
          <span>{loading ? "Sending..." : "Send Reset Link"}</span>
        </motion.button>
      </form>

      <Button type="button" variant="ghost" className="mt-4 w-full" onClick={onBackToLogin}>
        I remember my password
      </Button>
    </motion.div>
  );
}

