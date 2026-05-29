async function request(url, options = {}) {
  const token =
    localStorage.getItem("studentassistant_token") ||
    sessionStorage.getItem("studentassistant_token");

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.non_field_errors?.[0] ||
      payload?.message ||
      "Something went wrong.";
    throw new Error(message);
  }

  return payload;
}

export { request };
