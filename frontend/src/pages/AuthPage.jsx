import { useState } from "react";
import { apiFetch, saveAuth } from "../api/api";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });
      }

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveAuth(data.token, data.email);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-block">
          <div className="logo-mark">IF</div>
          <div>
            <h1>IssueFlow</h1>
            <p>Track repositories, issues, and comments in one clean workspace.</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {isRegister && (
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="hunter" required />
            </label>
          )}

          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hunter@test.com" type="email" required />
          </label>

          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" required />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button className="primary-btn" disabled={loading} type="submit">
            {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
