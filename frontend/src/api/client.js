const fieldLabels = {
  email: "Email",
  password: "Password",
  current_semester: "Current semester",
  full_name: "Full name",
  university: "University",
  major: "Department / major",
  non_field_errors: "",
  detail: "",
  message: "",
};

function humanizeField(field) {
  return fieldLabels[field] ?? field.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

function normalizeMessage(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(normalizeMessage).filter(Boolean).join(" ");
  if (typeof value === "object") return formatApiError(value);
  return String(value);
}

function formatApiError(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  if (payload.detail) return normalizeMessage(payload.detail);
  if (payload.message) return normalizeMessage(payload.message);
  if (payload.non_field_errors) return normalizeMessage(payload.non_field_errors);

  return Object.entries(payload)
    .map(([field, messages]) => {
      const message = normalizeMessage(messages);
      const label = humanizeField(field);
      return label ? `${label}: ${message}` : message;
    })
    .filter(Boolean)
    .join(" ");
}

function networkErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "The request took too long. Please try again.";
  }
  if (error instanceof TypeError && String(error.message || "").toLowerCase().includes("fetch")) {
    return "Cannot connect to the server. Please make sure the backend is running and try again.";
  }
  return "Network error. Please check your connection and try again.";
}

async function request(url, options = {}) {
  const token =
    localStorage.getItem("scholars_canvas_token") ||
    sessionStorage.getItem("scholars_canvas_token") ||
    localStorage.getItem("studentassistant_token") ||
    sessionStorage.getItem("studentassistant_token");
  const isFormData = options.body instanceof FormData;
  const { onUploadProgress, ...fetchOptions } = options;

  if (typeof onUploadProgress === "function" && isFormData) {
    return uploadRequest(url, fetchOptions, token, onUploadProgress);
  }

  let response;
  try {
    response = await fetch(url, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...(fetchOptions.headers ?? {}),
      },
      ...fetchOptions,
    });
  } catch (error) {
    throw new Error(networkErrorMessage(error));
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = formatApiError(payload) || `Request failed with status ${response.status}. Please try again.`;
    throw new Error(message);
  }

  return payload;
}

function uploadRequest(url, options, token, onUploadProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || "GET", url);

    if (token) {
      xhr.setRequestHeader("Authorization", `Token ${token}`);
    }
    Object.entries(options.headers ?? {}).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      if (xhr.status < 200 || xhr.status >= 300) {
        const message = formatApiError(payload) || `Request failed with status ${xhr.status}. Please try again.`;
        reject(new Error(message));
        return;
      }
      onUploadProgress(100);
      resolve(payload);
    };

    xhr.onerror = () => reject(new Error("Cannot connect to the server. Please make sure the backend is running and try again."));
    xhr.ontimeout = () => reject(new Error("The request took too long. Please try again."));
    xhr.send(options.body);
  });
}

export { request, formatApiError };

