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
  const [invitations, setInvitations] = useState([]);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [invitationBusyId, setInvitationBusyId] = useState(null);
  const [repositoriesRefreshKey, setRepositoriesRefreshKey] = useState(0);

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

  const loadInvitations = useCallback(async () => {
    if (!isLoggedIn()) return;

    try {
      setInvitationError("");
      setInvitationsLoading(true);
      const data = await apiFetch("/api/repositories/invitations");
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      setInvitationError(err.message || "Could not load invitations.");
    } finally {
      setInvitationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const timer = setTimeout(() => {
      loadMe();
      loadInvitations();

      if (window.location.pathname === "/" || window.location.pathname === "/login") {
        replace("/repositories");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [authenticated, loadInvitations, loadMe, replace]);

  function handleLogin() {
    setAuthenticated(true);
    replace("/repositories");
  }

  function handleLogout() {
    clearAuth();
    setAuthenticated(false);
    setCurrentUser(null);
    setInvitations([]);
    setInvitationsOpen(false);
    replace("/login");
  }

  async function respondToInvitation(invitation, action) {
    try {
      setInvitationBusyId(invitation.id);
      setInvitationError("");
      await apiFetch(`/api/repositories/invitations/${invitation.id}/${action}`, { method: "PATCH" });
      await loadInvitations();

      if (action === "accept") {
        setRepositoriesRefreshKey((value) => value + 1);
      }
    } catch (err) {
      setInvitationError(err.message || `Could not ${action} invitation.`);
    } finally {
      setInvitationBusyId(null);
    }
  }

  function handleRepoLeft() {
    setRepositoriesRefreshKey((value) => value + 1);
    navigate("/repositories");
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

        <div className="top-actions">
          <div className="inbox-wrap">
            <button
              type="button"
              className="icon-button inbox-button"
              onClick={() => {
                setInvitationsOpen((value) => !value);
                loadInvitations();
              }}
              aria-label="Repository invitations"
              aria-expanded={invitationsOpen}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mail-icon">
                <path d="M4 6.5h16v11H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              {invitations.length > 0 && <span className="notification-badge">{invitations.length}</span>}
            </button>

            {invitationsOpen && (
              <div className="inbox-menu">
                <div className="inbox-header">
                  <strong>Invitations</strong>
                  <span>{invitations.length} pending</span>
                </div>

                {invitationError && <p className="page-alert page-alert-error">{invitationError}</p>}
                {invitationsLoading && <p className="empty-state compact-empty">Loading invitations...</p>}

                {!invitationsLoading && invitations.length === 0 && (
                  <p className="empty-state compact-empty">No pending invitations.</p>
                )}

                <div className="inbox-list">
                  {invitations.map((invitation) => (
                    <article className="invitation-card" key={invitation.id}>
                      <div>
                        <strong>{invitation.repoName || "Repository"}</strong>
                        <span>
                          Invited by{" "}
                          {invitation.invitedByUsername || invitation.invitedByEmail || "repository owner"}
                        </span>
                      </div>
                      <div className="button-row compact-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          disabled={invitationBusyId === invitation.id}
                          onClick={() => respondToInvitation(invitation, "accept")}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger-soft btn-small"
                          disabled={invitationBusyId === invitation.id}
                          onClick={() => respondToInvitation(invitation, "decline")}
                        >
                          Decline
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="button" className="btn btn-soft" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {appError && <div className="page-alert page-alert-error">{appError}</div>}

      <main className="content-wrap">
        {route.page === "repositories" && (
          <RepositoriesPage
            refreshKey={repositoriesRefreshKey}
            onOpenRepo={(repo) => navigate(`/repositories/${repo.id}/issues`)}
          />
        )}

        {route.page === "issues" && route.repoId && (
          <IssuesPage
            repoId={route.repoId}
            onBack={() => navigate("/repositories")}
            onOpenIssue={(issue) => navigate(`/issues/${issue.id}`)}
            onRepoLeft={handleRepoLeft}
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

      <footer className="site-footer">Hunter Lynch 2026</footer>
    </div>
  );
}
