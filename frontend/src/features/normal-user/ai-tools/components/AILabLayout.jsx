import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileQuestion,
  FileText,
  FileUp,
  FolderOpen,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion } from "framer-motion";

import InPageStatus from "../../../../components/common/InPageStatus";
import UploadProgressBar from "../../../../components/common/UploadProgressBar";
import {
  field,
  generationBadge,
  ghostIconBtn,
  panel,
  pillTabActive,
  pillTabInactive,
  primaryBtn,
  supportedFileTypes,
} from "../aiLabConstants";
import {
  FormattedChatMessage,
  StructuredAIText,
  isImage,
  isOfficeLike,
  isPdf,
  isTextLike,
} from "../aiLabUtils";
import { ActionTab, CenteredState, EmptyPanel, UnsupportedFilePreview } from "./AILabShared";

export default function AILabLayout({
  activeDocument,
  activeTab,
  actionLoading,
  chatIndicatorStatus,
  chatInput,
  chatMessagesRef,
  displayedChatHistory,
  externalViewerUrl,
  fileInputRef,
  filteredVaultResources,
  flashcards,
  flashcardsStatus,
  flippedCards,
  handleChatScroll,
  handleMcqQuiz,
  handleOpenVaultResource,
  handleQuiz,
  handleSendMessage,
  handleSummarize,
  handleUpload,
  hasActiveDocument,
  loading,
  previewContentType,
  previewLoading,
  previewObjectUrl,
  previewScale,
  quizAnswers,
  quizItems,
  quizStatus,
  revealedQuizAnswers,
  scrollChatToBottom,
  selectedVaultResourceId,
  setActiveTab,
  setChatInput,
  setPreviewScale,
  setQuizAnswers,
  setRevealedQuizAnswers,
  setSelectedVaultResourceId,
  setSourceMode,
  setVaultPickerOpen,
  setVaultSearch,
  showChatScrollButton,
  sourceMode,
  status,
  summaryData,
  summaryStatus,
  toggleCard,
  uploadProgress,
  vaultLoading,
  vaultPickerOpen,
  vaultSearch,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid gap-3 xl:h-[calc(100dvh-5rem)] xl:min-h-0 xl:overflow-hidden ${status ? "xl:grid-rows-[auto_auto_minmax(0,1fr)]" : "xl:grid-rows-[auto_minmax(0,1fr)]"}`}
    >
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
          AI Study Lab
        </h1>
      </div>

      <InPageStatus message={status} />

      <div className="grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <section
          className={`${panel} grid h-[calc(100dvh-7rem)] min-h-[520px] min-w-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3 overflow-hidden p-3 xl:h-full xl:min-h-0 xl:self-start`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-slate-950 dark:text-white sm:text-base">
                {activeDocument?.title || "Choose a study file"}
              </h2>
              <p className="mt-1 truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                {activeDocument?.course ||
                  "PDF, DOCX, PPTX, XLSX, TXT, MD, CSV, JSON, XML, HTML supported"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className={ghostIconBtn}
                onClick={() =>
                  setPreviewScale((current) =>
                    Math.max(0.75, Number((current - 0.1).toFixed(2))),
                  )
                }
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                className={ghostIconBtn}
                onClick={() =>
                  setPreviewScale((current) =>
                    Math.min(1.5, Number((current + 0.1).toFixed(2))),
                  )
                }
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className={ghostIconBtn}
                onClick={() => setPreviewScale(1)}
                aria-label="Reset zoom"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100/70 p-1 dark:bg-slate-950/70">
              <button
                type="button"
                onClick={() => setSourceMode("device")}
                className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-black transition ${sourceMode === "device" ? pillTabActive : pillTabInactive}`}
              >
                <FileUp size={17} />
                <span>Device</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("vault")}
                className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-black transition ${sourceMode === "vault" ? pillTabActive : pillTabInactive}`}
              >
                <FolderOpen size={17} />
                <span>Vault</span>
              </button>
            </div>

            {sourceMode === "device" ? (
              <div className="grid gap-2">
                <button
                  type="button"
                  className={primaryBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={actionLoading === "upload"}
                >
                  {actionLoading === "upload" ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <FileUp size={18} />
                  )}
                  <span>
                    {actionLoading === "upload"
                      ? "Uploading..."
                      : "Upload File"}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={supportedFileTypes}
                  className="hidden"
                  onChange={handleUpload}
                />
                {uploadProgress > 0 ? (
                  <UploadProgressBar progress={uploadProgress} label="Uploading study file" />
                ) : null}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative min-w-0">
                  <input
                    type="search"
                    value={vaultSearch}
                    onChange={(event) => {
                      setVaultSearch(event.target.value);
                      setSelectedVaultResourceId("");
                      setVaultPickerOpen(true);
                    }}
                    onFocus={() => setVaultPickerOpen(true)}
                    onBlur={() =>
                      window.setTimeout(() => setVaultPickerOpen(false), 120)
                    }
                    placeholder={
                      vaultLoading
                        ? "Loading Vault files..."
                        : "Search Vault files by name, course, or semester"
                    }
                    className={`${field} pr-10`}
                    disabled={vaultLoading}
                    autoComplete="off"
                  />
                  <FolderOpen
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  {vaultPickerOpen && !vaultLoading ? (
                    <div className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-950 sm:max-h-72">
                      {filteredVaultResources.length > 0 ? (
                        filteredVaultResources.map((resource) => (
                          <button
                            type="button"
                            key={resource.id}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setSelectedVaultResourceId(String(resource.id));
                              setVaultSearch(resource.title);
                              setVaultPickerOpen(false);
                            }}
                            className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-blue-50 dark:hover:bg-blue-500/10 ${
                              String(resource.id) ===
                              String(selectedVaultResourceId)
                                ? "bg-blue-50 dark:bg-blue-500/10"
                                : ""
                            }`}
                          >
                            <span className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                              <FileText size={17} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-black text-slate-900 dark:text-white">
                                {resource.title}
                              </span>
                              <span className="mt-0.5 block truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                                {resource.courseLabel}
                                {resource.semester
                                  ? ` / Semester ${resource.semester}`
                                  : ""}
                              </span>
                            </span>
                            <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-black uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300 sm:inline">
                              {resource.resource_type_label ||
                                resource.resource_type ||
                                "File"}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          No Vault files match your search.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={primaryBtn}
                  onClick={handleOpenVaultResource}
                  disabled={
                    !selectedVaultResourceId || actionLoading === "vault"
                  }
                >
                  {actionLoading === "vault" ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <FolderOpen size={18} />
                  )}
                  <span>Open in AI Lab</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-indigo-50 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
            {loading ? (
              <CenteredState
                icon={<Loader2 className="mx-auto animate-spin" size={26} />}
                text="Loading AI Lab..."
              />
            ) : previewLoading ? (
              <CenteredState
                icon={<Loader2 className="mx-auto animate-spin" size={26} />}
                text="Loading file preview..."
              />
            ) : previewObjectUrl &&
              (previewContentType.startsWith("image/") ||
                isImage(activeDocument)) ? (
              <div className="grid h-full place-items-center p-4">
                <img
                  src={previewObjectUrl}
                  alt={activeDocument.title}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-lg"
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "center",
                  }}
                />
              </div>
            ) : previewObjectUrl &&
              (previewContentType.includes("pdf") ||
                previewContentType.includes("html") ||
                previewContentType.startsWith("text/") ||
                isPdf(activeDocument) ||
                isTextLike(activeDocument) ||
                isOfficeLike(activeDocument)) ? (
              <iframe
                title={activeDocument.title}
                src={previewObjectUrl}
                className="h-full border-0"
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  width: `${100 / previewScale}%`,
                  height: `${100 / previewScale}%`,
                }}
              />
            ) : externalViewerUrl ? (
              <iframe
                title={activeDocument.title}
                src={externalViewerUrl}
                className="h-full border-0 bg-white"
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  width: `${100 / previewScale}%`,
                  height: `${100 / previewScale}%`,
                }}
              />
            ) : previewObjectUrl && activeDocument ? (
              <UnsupportedFilePreview
                document={activeDocument}
                previewObjectUrl={previewObjectUrl}
                isOffice={isOfficeLike(activeDocument)}
              />
            ) : activeDocument ? (
              <UnsupportedFilePreview
                document={activeDocument}
                previewObjectUrl=""
                isOffice={isOfficeLike(activeDocument)}
              />
            ) : (
              <CenteredState
                icon={<FileText className="mx-auto" size={28} />}
                text="Upload a file or open an uploaded Vault file to start."
              />
            )}
          </div>
        </section>

        <section
          className={`${panel} flex h-[calc(100dvh-7rem)] min-h-[520px] min-w-0 flex-col overflow-hidden xl:sticky xl:top-4 xl:h-full xl:min-h-0 xl:self-start`}
        >
          <div className="grid grid-cols-4 gap-1.5 border-b border-slate-200 bg-slate-100/70 p-2.5 dark:border-slate-800 dark:bg-slate-950/70">
            <ActionTab
              active={activeTab === "summary"}
              icon={actionLoading === "summary" ? Loader2 : Sparkles}
              label={actionLoading === "summary" ? "Working" : "Summarize"}
              loading={actionLoading === "summary"}
              disabled={!hasActiveDocument || actionLoading === "summary"}
              onClick={handleSummarize}
            />
            <ActionTab
              active={activeTab === "chat"}
              icon={MessageSquare}
              label="Chat"
              disabled={!hasActiveDocument}
              onClick={() => setActiveTab("chat")}
            />
            <ActionTab
              active={activeTab === "flashcards" || actionLoading === "quiz"}
              icon={actionLoading === "quiz" ? Loader2 : CreditCard}
              label={actionLoading === "quiz" ? "Working" : "Flashcards"}
              loading={actionLoading === "quiz"}
              disabled={!hasActiveDocument || actionLoading === "quiz"}
              onClick={() => {
                if (flashcards.length > 0) {
                  setActiveTab("flashcards");
                  return;
                }
                handleQuiz();
              }}
            />
            <ActionTab
              active={activeTab === "quiz" || actionLoading === "mcq"}
              icon={actionLoading === "mcq" ? Loader2 : FileQuestion}
              label={actionLoading === "mcq" ? "Working" : "Quiz"}
              loading={actionLoading === "mcq"}
              disabled={!hasActiveDocument || actionLoading === "mcq"}
              onClick={() => {
                if (quizItems.length > 0) {
                  setActiveTab("quiz");
                  return;
                }
                handleMcqQuiz();
              }}
            />
          </div>

          <div className="thin-scrollbar grid min-h-0 flex-1 gap-3 overflow-y-auto p-3">
            {activeTab === "summary" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300">
                    <Sparkles size={16} />
                    <span>Summary</span>
                  </div>
                  <span
                    className={`${generationBadge} ${summaryStatus.className}`}
                  >
                    {summaryStatus.label}
                  </span>
                </div>

                {summaryData.length > 0 ? (
                  summaryData.map((item, index) => (
                    <article
                      key={`${item.section}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
                        <span className="size-2 rounded-full bg-blue-500" />
                        {item.section}
                      </h3>
                      <StructuredAIText text={item.content} variant="summary" />
                    </article>
                  ))
                ) : (
                  <EmptyPanel text="Click Summarize to generate study notes from the selected document." />
                )}
              </div>
            ) : null}

            {activeTab === "chat" ? (
              <div className="grid min-h-0 grid-rows-[1fr_auto] gap-3">
                <div
                  ref={chatMessagesRef}
                  className="thin-scrollbar grid min-h-0 content-start gap-3 overflow-y-auto pr-1 relative"
                  onScroll={handleChatScroll}
                >
                  {displayedChatHistory.length > 0 ? (
                    displayedChatHistory.map((message, index) => (
                      <div
                        key={`${message.role}-${message.pending ? "pending" : index}`}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex flex-col max-w-[88%] gap-1">
                          <div
                            className={`rounded-xl px-3 py-2 text-xs leading-5 shadow-sm ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                                : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <FormattedChatMessage text={message.message} />
                            ) : (
                              message.message
                            )}
                          </div>
                          {message.role === "assistant" && (
                            <div
                              className={`flex items-center gap-1 text-xs font-semibold ${
                                message.is_ai_generated
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {message.is_ai_generated ? (
                                <span>AI Response</span>
                              ) : (
                                <span>Document Excerpt (AI offline)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel text="Ask a question about the file and the AI will answer from the selected document. The AI can also provide examples and explanations beyond the document to help you understand better." />
                  )}
                  {actionLoading === "chat" ? (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        <Loader2 size={14} className="animate-spin" />
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  ) : null}

                  {showChatScrollButton && displayedChatHistory.length > 0 ? (
                    <div className="sticky bottom-0 flex justify-center pt-2 pb-1">
                      <button
                        type="button"
                        onClick={scrollChatToBottom}
                        className="rounded-full bg-blue-600 p-2 text-white shadow-md transition hover:scale-110 hover:bg-blue-700 active:scale-95"
                        aria-label="Scroll to latest message"
                        title="Jump to latest message"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <form
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/60"
                  onSubmit={handleSendMessage}
                >
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <textarea
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                          }
                        }}
                        rows={2}
                        placeholder="Ask about this document..."
                        className="max-h-24 min-h-[2.75rem] w-full resize-none bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                      />
                      <div className="mt-1 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-[0.7rem] font-semibold leading-5 text-slate-500 dark:text-slate-400">
                          Answers use the selected file as context.
                        </p>
                        {chatIndicatorStatus && (
                          <span
                            className={`${generationBadge} ${
                              chatIndicatorStatus === "ai"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200"
                            }`}
                          >
                            {chatIndicatorStatus === "ai"
                              ? "AI response"
                              : "Fallback response"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20 transition hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={
                        !hasActiveDocument ||
                        !chatInput.trim() ||
                        actionLoading === "chat"
                      }
                      aria-label="Send message"
                    >
                      {actionLoading === "chat" ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Send size={17} />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {activeTab === "flashcards" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300">
                    <CreditCard size={16} />
                    <span>Flashcards</span>
                  </div>
                  <span
                    className={`${generationBadge} ${flashcardsStatus.className}`}
                  >
                    {flashcardsStatus.label}
                  </span>
                </div>

                {flashcards.length > 0 ? (
                  flashcards.map((card, index) => {
                    const cardId = card.id ?? index;
                    const isFlipped = flippedCards.includes(cardId);
                    return (
                      <button
                        key={cardId}
                        type="button"
                        className="h-36 cursor-pointer text-left [perspective:1000px]"
                        onClick={() => toggleCard(cardId)}
                      >
                        <div
                          className={`relative h-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                        >
                          <div className="absolute inset-0 grid place-items-center rounded-xl border border-blue-200 bg-blue-50 p-3 text-center [backface-visibility:hidden] dark:border-blue-500/30 dark:bg-blue-500/15">
                            <div>
                              <p className="font-black leading-6 text-blue-950 dark:text-blue-100">
                                {card.question}
                              </p>
                              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-300">
                                Click to reveal <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>
                          <div className="absolute inset-0 grid place-items-center rounded-xl border border-violet-200 bg-violet-50 p-3 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-violet-500/30 dark:bg-violet-500/15">
                            <div>
                              <p className="font-bold leading-6 text-violet-950 dark:text-violet-100">
                                {card.answer}
                              </p>
                              {card.explanation ? (
                                <span className="mt-3 block text-xs font-semibold leading-5 text-violet-700 dark:text-violet-200">
                                  {card.explanation}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <EmptyPanel text="Click Flashcards to generate study cards from the selected document." />
                )}
              </div>
            ) : null}

            {activeTab === "quiz" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300">
                    <FileQuestion size={16} />
                    <span>Multiple choice quiz</span>
                  </div>
                  <span
                    className={`${generationBadge} ${quizStatus.className}`}
                  >
                    {quizStatus.label}
                  </span>
                </div>

                {quizItems.length > 0 ? (
                  quizItems.map((item, index) => {
                    const itemId = item.id ?? index;
                    const selectedAnswer = quizAnswers[itemId];
                    const isRevealed = Boolean(revealedQuizAnswers[itemId]);

                    return (
                      <article
                        key={itemId}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xs font-black leading-5 text-slate-950 dark:text-white">
                            {index + 1}. {item.question}
                          </h3>
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedQuizAnswers((current) => ({
                                ...current,
                                [itemId]: !current[itemId],
                              }))
                            }
                            className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-300 dark:ring-slate-700"
                          >
                            {isRevealed ? "Hide" : "Show answer"}
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2">
                          {(item.options ?? []).map((option) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === item.answer;
                            const showCorrect = isRevealed || selectedAnswer;
                            return (
                              <button
                                type="button"
                                key={option}
                                onClick={() =>
                                  setQuizAnswers((current) => ({
                                    ...current,
                                    [itemId]: option,
                                  }))
                                }
                                className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                                  showCorrect && isCorrect
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100"
                                    : showCorrect && isSelected && !isCorrect
                                      ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100"
                                      : isSelected
                                        ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {isRevealed || selectedAnswer ? (
                          <div className="mt-3 rounded-lg bg-white p-3 text-xs font-semibold leading-6 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                            <p>
                              Correct answer:{" "}
                              <span className="font-black text-emerald-600 dark:text-emerald-300">
                                {item.answer}
                              </span>
                            </p>
                            {item.explanation ? (
                              <p className="mt-1">{item.explanation}</p>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <EmptyPanel text="Click Quiz to generate multiple choice questions from the selected document." />
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </motion.div>
  );
}


