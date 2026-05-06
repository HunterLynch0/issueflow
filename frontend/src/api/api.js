const API_BASE_URL = "http://localhost:8080";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function saveAuth(token, email) {
  localStorage.setItem("token", token);
  localStorage.setItem("email", email);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}
