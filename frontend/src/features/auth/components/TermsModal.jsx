import { X } from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

const sections = {
  terms: {
    title: "Terms of Service",
    intro:
      "These terms explain how you may use StudentAssistant, an academic productivity app for routines, tasks, resources, AI study tools, and student communication.",
    sections: [
      {
        heading: "Account Responsibilities",
        body: "You are responsible for keeping your email, password, and account access secure. Profile and academic information should be accurate enough to support discovery, communication, routines, and study planning.",
      },
      {
        heading: "Acceptable Use",
        body: "Use the app for lawful academic purposes only. Do not upload, send, or share harmful content, abusive messages, malware, spam, impersonation, or material you do not have permission to use.",
      },
      {
        heading: "Academic Content",
        body: "You remain responsible for files, links, notes, tasks, messages, and other content you add. StudentAssistant helps organize and process that content but does not replace your university rules, instructor instructions, or academic judgment.",
      },
      {
        heading: "AI Study Tools",
        body: "AI summaries, flashcards, quizzes, and chat responses may be incomplete or incorrect. Treat AI output as study assistance, verify important details, and do not submit AI output as your own work where your institution prohibits it.",
      },
      {
        heading: "Communication Features",
        body: "Friend requests, messages, shared resources, and profile discovery are intended for respectful student collaboration. You may not harass users, misuse attachments, or share private conversations without permission.",
      },
      {
        heading: "Service Changes",
        body: "Features may be updated, limited, or removed as the project evolves. We may restrict accounts that abuse the service, violate these terms, or create security risks for other users.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "This policy describes the information StudentAssistant uses to provide your academic dashboard, account recovery, reminders, resources, AI study tools, and communication features.",
    sections: [
      {
        heading: "Information We Store",
        body: "We store account details such as name, email, university, department, semester, avatar, preferences, routines, tasks, study sessions, vault resources, AI study documents, friend requests, messages, and notification records.",
      },
      {
        heading: "How We Use Information",
        body: "Your data is used to authenticate your account, organize your dashboard, show reminders, manage tasks and routines, preview or summarize study materials, support chat and friend features, and send password reset emails.",
      },
      {
        heading: "Email and Account Recovery",
        body: "Your email address is used for login, account identification, important account messages, and password reset links. Reset emails are sent through Resend using the email address you enter.",
      },
      {
        heading: "Visibility and Sharing",
        body: "Some profile details may be visible in discovery, friend, and communication features depending on your settings and relationship with other users. Files, links, and messages are shared only through actions you choose.",
      },
      {
        heading: "Files and AI Processing",
        body: "Uploaded resources and AI Lab documents may be processed to create previews, summaries, flashcards, quizzes, and chat responses. Avoid uploading sensitive personal information unless it is necessary for your study workflow.",
      },
      {
        heading: "Security and Retention",
        body: "We use authentication tokens and password reset tokens to protect account access. Data is kept while your account or related feature records exist, unless removed by app functionality or maintenance.",
      },
    ],
  },
};

export default function TermsModal({ type = "terms", onClose }) {
  const content = sections[type] ?? sections.terms;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[999] grid min-h-dvh place-items-center bg-slate-950/70 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-h-[min(34rem,calc(100dvh-2rem))] w-[min(560px,100%)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/30 dark:border-slate-700 dark:bg-slate-900 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              {content.title}
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              StudentAssistant
            </p>
          </div>
          <button
            type="button"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 grid gap-4 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          <p>{content.intro}</p>
          {content.sections.map((section) => (
            <section key={section.heading} className="grid gap-1">
              <h3 className="text-sm font-black text-slate-950 dark:text-white">
                {section.heading}
              </h3>
              <p>{section.body}</p>
            </section>
          ))}
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            Last updated: June 2026. These terms are intended for this StudentAssistant project and should be reviewed before production or institutional use.
          </p>
        </div>
      </motion.section>
    </motion.div>,
    document.body,
  );
}

