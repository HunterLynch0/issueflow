import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function VerifyEmailPage({ onNavigateToLogin }) {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verify() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }

      try {
        const response = await apiFetch(
          `/api/auth/verify-email?token=${token}`,
          {
            method: "GET",
            auth: false,
          }
        );

        setStatus("success");
        setMessage(response?.message || response || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      }
    }

    verify();
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-hero">
          <div className="logo-mark auth-logo">IF</div>
          <h1>Email Verification</h1>
          <p>{message}</p>
        </div>

        {status !== "loading" && (
          <button
            className="btn btn-primary btn-full"
            onClick={onNavigateToLogin}
          >
            Go to Login
          </button>
        )}
      </section>
    </main>
  );
}