const API_BASE_URL = "http://localhost:8080";

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path, options = {}) {
  const { auth = true, body, headers = {}, ...rest } = options;
  const token = localStorage.getItem("token");

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  let requestBody = body;

  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
    if (typeof body !== "string") {
      requestBody = JSON.stringify(body);
    }
  }

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers: requestHeaders,
      body: requestBody,
    });
  } catch (error) {
    throw new Error("Could not reach backend. Make sure Spring Boot is running and CORS allows the frontend.");
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const rawPayload = await response.text();

  let payload = rawPayload;
  if (contentType.includes("application/json") && rawPayload) {
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      payload = rawPayload;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export function saveAuth(token, email) {
  localStorage.setItem("token", token);
  localStorage.setItem("email", email || "");
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}
