import { FileText, FileUp } from "lucide-react";

import { ghostIconBtn, pillTabActive, pillTabInactive, primaryBtn } from "../aiLabConstants";
import { getAbsoluteFileUrl, isPrivatePreviewUrl } from "../aiLabUtils";

export function ActionTab({
  active,
  disabled = false,
  icon: Icon,
  label,
  loading = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-black transition sm:text-xs ${
        active ? pillTabActive : pillTabInactive
      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-950`}
    >
      <Icon size={16} className={loading ? "animate-spin" : ""} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function CenteredState({ icon, text }) {
  return (
    <div className="grid h-full place-items-center p-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
      <div className="grid max-w-sm gap-3">
        {icon}
        <p>{text}</p>
      </div>
    </div>
  );
}

export function EmptyPanel({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-400">
      {text}
    </div>
  );
}

export function UnsupportedFilePreview({ document, previewObjectUrl, isOffice }) {
  const textPreview = (document?.text_preview || "").trim();
  const fileName = document?.file_name || document?.title || "Selected file";
  const fileUrl = getAbsoluteFileUrl(document);
  const isPrivateFile = isPrivatePreviewUrl(fileUrl);

  return (
    <div className="p-4">
      <div className="mx-auto grid max-w-4xl gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-black text-slate-950 dark:text-white">
                  {fileName}
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {textPreview
                    ? isOffice
                      ? isPrivateFile
                        ? "Office visual preview needs a public file URL, so this local preview uses extracted document text."
                        : "Office file preview generated from extracted document text."
                      : "Preview generated from extracted file text."
                    : "Exact browser preview is not available for this file type, but you can open or download the original file."}
                </p>
              </div>
            </div>
            {previewObjectUrl ? (
              <div className="flex flex-wrap gap-2">
                <a
                  href={previewObjectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={primaryBtn}
                >
                  Open file
                </a>
                <a
                  href={previewObjectUrl}
                  download={fileName}
                  className={ghostIconBtn}
                  aria-label="Download file"
                >
                  <FileUp size={16} />
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {textPreview ? (
          <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-black text-slate-950 dark:text-white">
                Readable Preview
              </h4>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                AI-readable
              </span>
            </div>
            <p className="whitespace-pre-wrap">{textPreview}</p>
          </article>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            This file was uploaded successfully. The browser cannot visually
            preview this format, and no readable text could be extracted yet.
            You can still keep it in the lab and open/download the original
            file.
          </div>
        )}
      </div>
    </div>
  );
}


