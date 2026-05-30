async function request(url, options = {}) {
  const token =
    localStorage.getItem("studentassistant_token") ||
    sessionStorage.getItem("studentassistant_token");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const fieldMessage =
      payload && typeof payload === "object"
        ? Object.entries(payload)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join(" ")
        : "";
    const message =
      payload?.detail ||
      payload?.non_field_errors?.[0] ||
      payload?.message ||
      fieldMessage ||
      "Something went wrong.";
    throw new Error(message);
  }

  return payload;
}

export { request };
