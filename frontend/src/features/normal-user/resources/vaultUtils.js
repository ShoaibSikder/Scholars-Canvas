import { File as GenericFile, FileImage, FileSpreadsheet, FileText, Link as LinkIcon, Presentation } from "lucide-react";

export function flattenCourses(groups) {
  return groups.flatMap((group) => group.courses ?? []);
}

export function groupCourses(courses) {
  return courses
    .reduce((groups, course) => {
      const group = groups.find((item) => item.semester === course.semester);
      if (group) {
        group.courses.push(course);
      } else {
        groups.push({ semester: course.semester, courses: [course] });
      }
      return groups;
    }, [])
    .sort((a, b) => b.semester - a.semester);
}

export function formatDate(value) {
  if (!value) {
    return "Recently";
  }
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function getGenerationIndicator(source, hasContent) {
  if (!hasContent) return null;

  if (source === "ai") {
    return {
      label: "AI generated",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200",
    };
  }

  if (source) {
    return {
      label: "Fallback response",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200",
    };
  }

  return {
    label: "Generated",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
}

export function normalizeExternalUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function getFileExtensionFromResource(item) {
  const source = `${item?.file || item?.file_url || item?.title || ""}`.split("?")[0].toLowerCase();
  return source.includes(".") ? source.split(".").pop() : "";
}

export function getOfficeViewerUrl(fileUrl, extension) {
  if (!fileUrl) return "";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(extension)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  }
  if (["csv", "odt", "ods", "odp", "rtf"].includes(extension)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  }
  return "";
}

export function getResourceViewerUrl(item) {
  return getOfficeViewerUrl(item?.file_url, getFileExtensionFromResource(item));
}

export function getResourceTarget(item) {
  return getResourceViewerUrl(item) || item.preview_url || item.file_url || normalizeExternalUrl(item.url) || "";
}

export function getAuthToken() {
  return localStorage.getItem("scholars_canvas_token") || sessionStorage.getItem("scholars_canvas_token") || localStorage.getItem("studentassistant_token") || sessionStorage.getItem("studentassistant_token") || "";
}

export function getUrlInfo(url) {
  try {
    const parsed = new URL(normalizeExternalUrl(url));
    const hostname = parsed.hostname.replace(/^www\./, "");
    return {
      hostname,
      origin: parsed.origin,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
    };
  } catch {
    return { hostname: "Website", origin: "", favicon: "" };
  }
}

export function getYoutubeId(url) {
  try {
    const parsed = new URL(normalizeExternalUrl(url));
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
  return "";
}

export function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

export function getResourceVisual(item) {
  const source = `${item.resource_type ?? ""} ${item.title ?? ""} ${item.file ?? ""} ${item.file_url ?? ""} ${item.url ?? ""}`.toLowerCase();

  if (source.includes(".pdf") || item.resource_type === "pdf") {
    return { Icon: FileText, className: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300", label: "PDF" };
  }
  if (source.includes(".doc") || source.includes("document") || item.resource_type === "doc") {
    return { Icon: FileText, className: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300", label: "DOC" };
  }
  if (source.includes(".ppt") || source.includes("slide") || item.resource_type === "slide") {
    return { Icon: Presentation, className: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300", label: "SLIDE" };
  }
  if (source.includes(".xls") || source.includes("spreadsheet")) {
    return { Icon: FileSpreadsheet, className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", label: "SHEET" };
  }
  if (source.includes(".png") || source.includes(".jpg") || source.includes(".jpeg") || source.includes("image")) {
    return { Icon: FileImage, className: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300", label: "IMG" };
  }
  if (item.resource_type === "link" || (!item.file_url && item.url)) {
    return { Icon: LinkIcon, className: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300", label: "LINK" };
  }

  return { Icon: GenericFile, className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", label: "FILE" };
}


