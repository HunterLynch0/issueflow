import { useEffect, useState } from "react";
import { apiFetch, clearAuth, isLoggedIn } from "./api/api";
import AuthPage from "./pages/AuthPage";
import RepositoriesPage from "./pages/RepositoriesPage";
import IssuesPage from "./pages/IssuesPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import "./App.css";

export default function App() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("repositories");
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  async function loadMe() {
    if (!isLoggedIn()) return;

    try {
      const user = await apiFetch("/api/me");
      setCurrentUser(user);
    } catch {
      clearAuth();
      setAuthenticated(false);
      setCurrentUser(null);
    }
  }

  useEffect(() => {
    loadMe();
  }, [authenticated]);

  function handleLogout() {
    clearAuth();
    setAuthenticated(false);
    setCurrentUser(null);
    setSelectedRepo(null);
    setSelectedIssueId(null);
    setView("repositories");
  }

  if (!authenticated) {
    return <AuthPage onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-row">
          <div className="logo-mark small">IF</div>
          <div>
            <h1>IssueFlow</h1>
            <p>{currentUser ? `Signed in as ${currentUser.email}` : "Loading user..."}</p>
          </div>
        </div>
        <button className="secondary-btn" onClick={handleLogout}>Logout</button>
      </header>

      <main className="content-wrap">
        {view === "repositories" && (
          <RepositoriesPage
            onOpenRepo={(repo) => {
              setSelectedRepo(repo);
              setView("issues");
            }}
          />
        )}

        {view === "issues" && selectedRepo && (
          <IssuesPage
            repo={selectedRepo}
            onBack={() => setView("repositories")}
            onOpenIssue={(issueId) => {
              setSelectedIssueId(issueId);
              setView("issueDetail");
            }}
          />
        )}

        {view === "issueDetail" && selectedIssueId && (
          <IssueDetailPage
            issueId={selectedIssueId}
            onBack={() => setView("issues")}
          />
        )}
      </main>
    </div>
  );
}
