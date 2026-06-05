export function normalizeTasks(payload) {
  return {
    todo: payload?.todo ?? [],
    inProgress: payload?.inProgress ?? [],
    done: payload?.done ?? [],
  };
}

export function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return offsetDate.toISOString().slice(0, 16);
}

export function todayInputDate() {
  const date = new Date();
  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return offsetDate.toISOString().slice(0, 10);
}

export function taskToForm(task) {
  return {
    title: task.title ?? "",
    course: task.course ?? "",
    priority: task.priority ?? "medium",
    status: task.status ?? "todo",
    due_at: toInputDateTime(task.due_at),
    notes: task.notes ?? "",
  };
}

export function formToPayload(form) {
  return {
    ...form,
    due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
  };
}


