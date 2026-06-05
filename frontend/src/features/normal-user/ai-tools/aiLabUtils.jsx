import { emptyDocument } from "./aiLabConstants";

export function normalizeDocument(document) {
  if (!document) return null;

  return {
    ...emptyDocument,
    ...document,
    summary_data: Array.isArray(document.summary_data)
      ? document.summary_data
      : [],
    flashcards: Array.isArray(document.flashcards) ? document.flashcards : [],
    quiz_data: Array.isArray(document.quiz_data) ? document.quiz_data : [],
    chat_history: Array.isArray(document.chat_history)
      ? document.chat_history
      : [],
  };
}

export function flattenVaultResources(groups) {
  return groups.flatMap((group) =>
    (group.courses ?? []).flatMap((course) =>
      (course.resources ?? [])
        .filter((resource) => resource.file_url)
        .map((resource) => ({
          ...resource,
          courseLabel: `${course.code} - ${course.title}`,
          courseId: course.id,
          semester: group.semester,
        })),
    ),
  );
}

export function isPdf(document) {
  const source =
    `${document?.file_name ?? ""} ${document?.file_url ?? ""}`.toLowerCase();
  return source.includes(".pdf");
}

export function isImage(document) {
  const source =
    `${document?.file_name ?? ""} ${document?.file_url ?? ""}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(source);
}

export function isTextLike(document) {
  const source =
    `${document?.file_name ?? ""} ${document?.file_url ?? ""}`.toLowerCase();
  return /\.(txt|md|csv|json|xml|html|css|js|py)(\?|$)/.test(source);
}

export function isOfficeLike(document) {
  const source =
    `${document?.file_name ?? ""} ${document?.file_url ?? ""}`.toLowerCase();
  return /\.(docx?|pptx?|xlsx?|odt|ods|odp|rtf)(\?|$)/.test(source);
}

export function getFileExtension(document) {
  const source = `${document?.file_name || document?.file_url || ""}`
    .split("?")[0]
    .toLowerCase();
  return source.includes(".") ? source.split(".").pop() : "";
}

export function getAbsoluteFileUrl(document) {
  const sourceUrl = document?.file_url || document?.preview_url || "";
  if (!sourceUrl) return "";

  try {
    return new URL(sourceUrl, window.location.origin).href;
  } catch {
    return "";
  }
}

export function isPrivatePreviewUrl(url) {
  if (!url) return true;

  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local") ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return true;
  }
}

export function getExternalViewerUrl(document) {
  const fileUrl = getAbsoluteFileUrl(document);
  if (!fileUrl || isPrivatePreviewUrl(fileUrl)) return "";

  const extension = getFileExtension(document);
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(extension)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  }

  if (["csv", "odt", "ods", "odp", "rtf"].includes(extension)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  }

  return "";
}

export function getGenerationIndicator({
  source,
  hasContent,
  loading,
  loadingText,
  awaitingText,
}) {
  if (loading) {
    return {
      label: loadingText,
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
    };
  }

  if (!hasContent) {
    return {
      label: awaitingText,
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  if (source === "ai") {
    return {
      label: "AI generated",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200",
    };
  }

  if (source) {
    return {
      label: "Fallback response",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200",
    };
  }

  return {
    label: "Generated",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
}

export function getGenerationStatusMessage(label, source) {
  return source === "ai"
    ? `${label} generated successfully.`
    : `${label} generated with fallback response.`;
}

export function normalizeChatMarkdown(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+---\s+/g, "\n\n")
    .replace(/\s+(#{2,6})\s+/g, "\n\n$1 ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderInlineMarkdown(text, keyPrefix) {
  const parts = String(text || "").split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-strong-${index}`} className="font-black text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${keyPrefix}-code-${index}`} className="rounded bg-white px-1 py-0.5 text-[0.7rem] font-bold text-blue-700 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-blue-300 dark:ring-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
  });
}

export function isMarkdownTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
  return String(line || "")
    .trim()
    .replace(/^\|+/, "")
    .replace(/\|+$/, "")
    .split(/(?<!\\)\|/g)
    .map((cell) => cell.replace(/\\\|/g, "|").trim());
}

function isTableLikeLine(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed || isMarkdownTableSeparator(trimmed)) return false;
  if (/^\|+\s*$/.test(trimmed)) return false;
  if (/^\s*[-*]\s+/.test(trimmed) || /^\s*\d+[.)]\s+/.test(trimmed)) return false;
  return splitTableRow(trimmed).length >= 2;
}

function isPipeOnlyLine(line) {
  return /^\s*\|+\s*$/.test(String(line || ""));
}

function expandInlineTableRows(lines) {
  return lines.flatMap((rawLine) => {
    const line = String(rawLine || "");
    if (isPipeOnlyLine(line)) {
      return [];
    }

    const firstPipeIndex = line.indexOf("|");

    if (firstPipeIndex <= 0) {
      return [line];
    }

    const beforeTable = line.slice(0, firstPipeIndex).trim();
    const possibleTable = line.slice(firstPipeIndex).trim();

    if (!beforeTable || !isTableLikeLine(possibleTable)) {
      return [line];
    }

    return [beforeTable, possibleTable];
  });
}

function normalizeTableRows(rows) {
  const columnCount = Math.max(...rows.map((row) => row.length), 0);
  return rows
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => [...row, ...Array(Math.max(0, columnCount - row.length)).fill("")]);
}

export function parseMarkdownTable(lines, startIndex) {
  const tableLines = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    if (isTableLikeLine(line) || isMarkdownTableSeparator(line)) {
      tableLines.push(line);
      index += 1;
      continue;
    }

    if ((isPipeOnlyLine(line) || !String(line || "").trim()) && tableLines.length > 0) {
      let nextContentIndex = index + 1;
      while (
        nextContentIndex < lines.length &&
        (isPipeOnlyLine(lines[nextContentIndex]) || !String(lines[nextContentIndex] || "").trim())
      ) {
        nextContentIndex += 1;
      }

      if (
        nextContentIndex < lines.length &&
        (isTableLikeLine(lines[nextContentIndex]) || isMarkdownTableSeparator(lines[nextContentIndex]))
      ) {
        index = nextContentIndex;
        continue;
      }
    }

    break;
  }

  const hasSeparator = tableLines.length >= 2 && isMarkdownTableSeparator(lines[startIndex + 1]);

  if (!hasSeparator && tableLines.length < 2) {
    return null;
  }

  const rows = normalizeTableRows(
    tableLines
      .filter((line, lineIndex) => !hasSeparator || lineIndex !== 1)
      .map(splitTableRow),
  );

  return rows.length >= 2 ? { rows, nextIndex: index } : null;
}

function getStructuredBlocks(text) {
  const lines = expandInlineTableRows(normalizeChatMarkdown(text).split("\n"));
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const table = parseMarkdownTable(lines, index);
    if (table) {
      blocks.push({ type: "table", rows: table.rows });
      index = table.nextIndex;
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    const labelMatch = line.match(/^([A-Z][A-Za-z0-9 /&().-]{2,48}):\s*(.+)?$/);
    if (labelMatch) {
      blocks.push({
        type: "label",
        label: labelMatch[1],
        text: labelMatch[2] || "",
      });
      index += 1;
      continue;
    }

    const bulletItems = [];
    while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
      bulletItems.push(lines[index].replace(/^\s*[-*]\s+/, "").trim());
      index += 1;
    }
    if (bulletItems.length) {
      blocks.push({ type: "bullets", items: bulletItems });
      continue;
    }

    const numberedItems = [];
    while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
      numberedItems.push(lines[index].replace(/^\s*\d+[.)]\s+/, "").trim());
      index += 1;
    }
    if (numberedItems.length) {
      blocks.push({ type: "numbers", items: numberedItems });
      continue;
    }

    const paragraphLines = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{2,4})\s+/.test(lines[index].trim()) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !parseMarkdownTable(lines, index)
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export function StructuredAIText({ text, variant = "chat" }) {
  const blocks = getStructuredBlocks(text);
  const isSummary = variant === "summary";

  if (!blocks.length) {
    return null;
  }

  return (
    <div className={`grid gap-2.5 ${isSummary ? "text-sm leading-6" : "text-xs leading-5"}`}>
      {blocks.map((block, blockIndex) => {
        if (block.type === "heading") {
          const headingClass = block.level <= 2 || isSummary ? "text-sm" : "text-xs";
          return (
            <h4 key={`heading-${blockIndex}`} className={`${headingClass} border-l-4 border-blue-500 pl-2 font-black text-slate-950 dark:text-white`}>
              {renderInlineMarkdown(block.text, `heading-${blockIndex}`)}
            </h4>
          );
        }

        if (block.type === "label") {
          return (
            <div key={`label-${blockIndex}`} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[0.68rem] font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">
                {block.label}
              </p>
              {block.text ? (
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                  {renderInlineMarkdown(block.text, `label-${blockIndex}`)}
                </p>
              ) : null}
            </div>
          );
        }

        if (block.type === "bullets") {
          return (
            <ul key={`bullets-${blockIndex}`} className="grid gap-1.5">
              {block.items.map((item, itemIndex) => (
                <li key={`bullet-${blockIndex}-${itemIndex}`} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-lg bg-white px-2.5 py-2 text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
                  <span className="mt-2 size-1.5 rounded-full bg-blue-500" />
                  <span>{renderInlineMarkdown(item, `bullet-${blockIndex}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "numbers") {
          return (
            <ol key={`numbers-${blockIndex}`} className="grid gap-1.5">
              {block.items.map((item, itemIndex) => (
                <li key={`number-${blockIndex}-${itemIndex}`} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-lg bg-white px-2.5 py-2 text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[0.65rem] font-black text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                    {itemIndex + 1}
                  </span>
                  <span>{renderInlineMarkdown(item, `number-${blockIndex}-${itemIndex}`)}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "table") {
          const [head = [], ...body] = block.rows;
          return (
            <div key={`table-${blockIndex}`} className="thin-scrollbar max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
              <table className="w-max min-w-full table-auto border-separate border-spacing-0 text-left text-[0.72rem]">
                <thead className="bg-slate-100/90 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    {head.map((cell, cellIndex) => (
                      <th key={`table-head-${cellIndex}`} scope="col" className="max-w-[18rem] min-w-[8.5rem] whitespace-normal break-words border-b border-slate-200 px-3 py-2 align-top font-black leading-5 first:min-w-[7rem] last:min-w-[12rem] dark:border-slate-700">
                        {renderInlineMarkdown(cell, `table-head-${blockIndex}-${cellIndex}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, rowIndex) => (
                    <tr key={`table-row-${rowIndex}`} className="transition odd:bg-white even:bg-slate-50/70 hover:bg-blue-50/70 dark:odd:bg-slate-950 dark:even:bg-slate-900/55 dark:hover:bg-blue-500/10">
                      {row.map((cell, cellIndex) => (
                        <td key={`table-cell-${rowIndex}-${cellIndex}`} className="max-w-[18rem] min-w-[8.5rem] whitespace-normal break-words border-t border-slate-100 px-3 py-2 align-top leading-5 first:min-w-[7rem] last:min-w-[12rem] dark:border-slate-800">
                          {renderInlineMarkdown(cell, `table-cell-${blockIndex}-${rowIndex}-${cellIndex}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={`paragraph-${blockIndex}`} className="text-slate-700 dark:text-slate-200">
            {renderInlineMarkdown(block.text, `paragraph-${blockIndex}`)}
          </p>
        );
      })}
    </div>
  );
}

export function FormattedChatMessage({ text }) {
  return <StructuredAIText text={text} variant="chat" />;
}


