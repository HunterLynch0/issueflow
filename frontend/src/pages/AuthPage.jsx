import { useState } from "react";
import { apiFetch, saveAuth } from "../api/api";

export default function AuthPage({ onLogin, initialMode = "login", initialError = "" }) {
  const [mode, setMode] = useState(initialMode === "register" ? "register" : "login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  function clearMessages() {
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (isRegister) {
        await apiFetch("/api/auth/register", {
          method: "POST",
          auth: false,
          body: { username: username.trim(), email: email.trim(), password },
        });

        setMode("login");
        setPassword("");
        setMessage("Account created. Check your email for a verification link before logging in.");
        return;
      }

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { email: email.trim(), password },
      });

      saveAuth(data.token, data.email);
      onLogin();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-hero">
          <div className="logo-mark auth-logo">IF</div>
          <h1>IssueFlow</h1>
          <p>Track repositories, issues, assignments, statuses, and comments in one clean place.</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              clearMessages();
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              clearMessages();
            }}
          >
            Register
          </button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="field">
              <span>Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="person username"
                required
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {message && <p className="page-alert page-alert-success">{message}</p>}
          {error && <p className="page-alert page-alert-error">{error}</p>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
