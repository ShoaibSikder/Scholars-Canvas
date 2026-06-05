import { Link as LinkIcon, Pencil, Trash2 } from "lucide-react";

import { iconBtn } from "../vaultConstants";
import { getUrlInfo, getYoutubeThumbnail, normalizeExternalUrl } from "../vaultUtils";

export function ShareTile({ as = "button", icon: Icon, label, gradient, ...props }) {
  const className = "group grid justify-items-center gap-2 rounded-2xl p-2 text-center transition hover:-translate-y-0.5";
  const content = (
    <>
      <span className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/30 transition group-hover:scale-105`}>
        <Icon size={25} />
      </span>
      <span className="text-xs font-black leading-tight text-slate-700 dark:text-slate-200">{label}</span>
    </>
  );

  if (as === "a") {
    return (
      <a className={className} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={className} {...props}>
      {content}
    </button>
  );
}

export function LinkPreviewCard({ resource, onEdit, onDelete, compact = false }) {
  const normalizedUrl = normalizeExternalUrl(resource.url);
  const urlInfo = getUrlInfo(normalizedUrl);
  const youtubeThumbnail = getYoutubeThumbnail(normalizedUrl);
  const isYoutube = Boolean(youtubeThumbnail) || urlInfo.hostname.includes("youtube.com") || urlInfo.hostname.includes("youtu.be");
  const title = resource.title || urlInfo.hostname;
  const iconNode = isYoutube ? (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500 shadow-sm dark:bg-red-500/10">
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" /></svg>
    </span>
  ) : (
    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-blue-50 shadow-sm dark:bg-blue-500/10">
      {urlInfo.favicon ? <img src={urlInfo.favicon} alt="" className="size-5" /> : <LinkIcon className="text-blue-500" size={19} />}
    </span>
  );

  return (
    <article className={`group relative flex min-h-14 w-full items-center gap-2.5 border-b border-r border-slate-200 bg-white px-3 py-2 transition-all duration-200 last:border-b-0 hover:translate-x-1 hover:bg-blue-50/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-blue-500/10 ${compact ? "max-w-[300px] rounded-xl border" : ""}`}>
      <a href={normalizedUrl} target="_blank" rel="noreferrer" className="absolute inset-0 z-0 rounded-xl" aria-label={`Open ${title}`} />
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-3">
        {iconNode}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-black text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300 sm:text-sm">{title}</span>
          <span className="block truncate text-xs font-bold text-slate-500 dark:text-slate-400">{urlInfo.hostname}</span>
          {resource.notes ? <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{resource.notes}</span> : null}
        </span>
      </div>
      {!compact ? (
        <div className="relative z-20 grid shrink-0 gap-1">
          {onEdit ? <button type="button" className={iconBtn} onClick={onEdit} aria-label="Edit link"><Pencil size={15} /></button> : null}
          {onDelete ? <button type="button" className={iconBtn} onClick={onDelete} aria-label="Delete link"><Trash2 size={15} /></button> : null}
        </div>
      ) : null}
    </article>
  );
}


