import { useCallback, useEffect, useState } from "react";
import { apiFetch, clearAuth, isLoggedIn } from "./api/api";
import AuthPage from "./pages/AuthPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import RepositoriesPage from "./pages/RepositoriesPage";
import IssuesPage from "./pages/IssuesPage";
import IssueDetailPage from "./pages/IssueDetailPage";

function parseRoute() {
  const path = window.location.pathname;

  if (path === "/verify-email") {
    return { page: "verifyEmail" };
  }

  if (path === "/" || path === "/login" || path === "/repositories") {
    return { page: "repositories" };
  }

  const repoIssuesMatch = path.match(/^\/repositories\/(\d+)\/issues$/);
  if (repoIssuesMatch) {
    return { page: "issues", repoId: Number(repoIssuesMatch[1]) };
  }

  const issueMatch = path.match(/^\/issues\/(\d+)$/);
  if (issueMatch) {
    return { page: "issueDetail", issueId: Number(issueMatch[1]) };
  }

  return { page: "repositories" };
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState(null);
  const [route, setRoute] = useState(parseRoute());
  const [appError, setAppError] = useState("");

  const navigate = useCallback((path) => {
    window.history.pushState({}, "", path);
    setRoute(parseRoute());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const replace = useCallback((path) => {
    window.history.replaceState({}, "", path);
    setRoute(parseRoute());
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const loadMe = useCallback(async () => {
    if (!isLoggedIn()) return;

    try {
      setAppError("");
      const user = await apiFetch("/api/me");
      setCurrentUser(user);
    } catch (err) {
      clearAuth();
      setAuthenticated(false);
      setCurrentUser(null);
      setAppError(err.message || "Your session expired. Please log in again.");
      replace("/login");
    }
  }, [replace]);

  useEffect(() => {
    if (!authenticated) return;

    loadMe();

    if (window.location.pathname === "/" || window.location.pathname === "/login") {
      replace("/repositories");
    }
  }, [authenticated, loadMe, replace]);

  function handleLogin() {
    setAuthenticated(true);
    replace("/repositories");
  }

  function handleLogout() {
    clearAuth();
    setAuthenticated(false);
    setCurrentUser(null);
    replace("/login");
  }

  if (!authenticated) {
    if (route.page === "verifyEmail") {
      return <VerifyEmailPage onNavigateToLogin={() => navigate("/login")} />;
    }

    return <AuthPage onLogin={handleLogin} initialError={appError} />;
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <button
          type="button"
          className="brand-button"
          onClick={() => navigate("/repositories")}
          aria-label="Go to repositories"
        >
          <span className="logo-mark">IF</span>
          <span className="brand-copy">
            <strong>IssueFlow</strong>
            <small>{currentUser ? currentUser.email : "Loading account..."}</small>
          </span>
        </button>

        <button type="button" className="btn btn-soft" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {appError && <div className="page-alert page-alert-error">{appError}</div>}

      <main className="content-wrap">
        {route.page === "repositories" && (
          <RepositoriesPage onOpenRepo={(repo) => navigate(`/repositories/${repo.id}/issues`)} />
        )}

        {route.page === "issues" && route.repoId && (
          <IssuesPage
            repoId={route.repoId}
            onBack={() => navigate("/repositories")}
            onOpenIssue={(issue) => navigate(`/issues/${issue.id}`)}
          />
        )}

        {route.page === "issueDetail" && route.issueId && (
          <IssueDetailPage
            issueId={route.issueId}
            onBack={() => window.history.back()}
            onRepoLink={(repoId) => navigate(`/repositories/${repoId}/issues`)}
          />
        )}
      </main>
    </div>
  );
}