import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function IssuesPage({ repoId, onBack, onOpenIssue }) {
  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPage() {
    try {
      setError("");
      setLoading(true);

      const suffix = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const [repoData, issuesData, usersData] = await Promise.all([
        apiFetch(`/api/repositories/${repoId}`),
        apiFetch(`/api/repositories/${repoId}/issues${suffix}`),
        apiFetch("/api/users"),
      ]);

      setRepo(repoData);
      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError(err.message || "Could not load issues.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId, statusFilter]);

  async function createIssue(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      await apiFetch(`/api/repositories/${repoId}/issues`, {
        method: "POST",
        body: { title: title.trim(), description: description.trim(), status: "OPEN" },
      });
      setTitle("");
      setDescription("");
      await loadPage();
    } catch (err) {
      setError(err.message || "Could not create issue.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(issue) {
    setEditingId(issue.id);
    setEditTitle(issue.title || "");
    setEditDescription(issue.description || "");
  }

  async function saveEdit(issueId) {
    if (!editTitle.trim()) return;

    try {
      setSaving(true);
      await apiFetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        body: { title: editTitle.trim(), description: editDescription.trim() },
      });
      setEditingId(null);
      await loadPage();
    } catch (err) {
      setError(err.message || "Could not save issue.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteIssue(issue) {
    if (!confirm(`Delete issue "${issue.title}"?`)) return;

    try {
      await apiFetch(`/api/issues/${issue.id}`, { method: "DELETE" });
      await loadPage();
    } catch (err) {
      setError(err.message || "Could not delete issue.");
    }
  }

  async function toggleStatus(issue) {
    const action = issue.status === "CLOSED" ? "reopen" : "close";

    try {
      await apiFetch(`/api/issues/${issue.id}/${action}`, { method: "PATCH" });
      await loadPage();
    } catch (err) {
      setError(err.message || "Could not update issue status.");
    }
  }

  async function assignUser(issueId, userId) {
    if (!userId) return;

    try {
      await apiFetch(`/api/issues/${issueId}/assign/${userId}`, { method: "PATCH" });
      await loadPage();
    } catch (err) {
      setError(err.message || "Could not assign user.");
    }
  }

  return (
    <section className="page-panel">
      <button type="button" className="text-link" onClick={onBack}>
        ← Back to repositories
      </button>

      <div className="page-title-row with-control">
        <div>
          <p className="eyebrow">Repository</p>
          <h1>{repo ? repo.name : "Issues"}</h1>
          <p className="muted">{repo?.description || "Create and manage issues for this repository."}</p>
        </div>

        <label className="field filter-field">
          <span>Status filter</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </label>
      </div>

      <form className="create-card" onSubmit={createIssue}>
        <div className="create-card-header">
          <h2>Create issue</h2>
          <p>Add a new issue to this repository.</p>
        </div>

        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Issue title" required />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
          />
        </label>

        <button className="btn btn-primary align-start" disabled={saving} type="submit">
          {saving ? "Saving..." : "Create issue"}
        </button>
      </form>

      {error && <p className="page-alert page-alert-error">{error}</p>}
      {loading && <p className="empty-state">Loading issues...</p>}

      {!loading && issues.length === 0 && <div className="empty-state">No issues found for this filter.</div>}

      <div className="list-stack">
        {issues.map((issue) => (
          <article className="data-card issue-card" key={issue.id}>
            {editingId === issue.id ? (
              <div className="form-stack compact">
                <label className="field">
                  <span>Title</span>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </label>
                <div className="button-row">
                  <button type="button" className="btn btn-primary" onClick={() => saveEdit(issue.id)}>
                    Save
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="issue-top-row">
                  <div>
                    <div className="inline-meta">Issue #{issue.id}</div>
                    <h2>{issue.title}</h2>
                    <p>{issue.description || "No description yet."}</p>
                  </div>
                  <StatusPill status={issue.status} />
                </div>

                <div className="meta-panel">
                  <div>
                    <span className="meta-label">Assignee</span>
                    <strong>{issue.assignee?.username || issue.assignee?.email || "Unassigned"}</strong>
                  </div>

                  <label className="field compact-field">
                    <span>Assign</span>
                    <select defaultValue="" onChange={(e) => assignUser(issue.id, e.target.value)}>
                      <option value="">Assign user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username || user.email}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="button-row wrap">
                  <button type="button" className="btn btn-primary" onClick={() => onOpenIssue(issue)}>
                    Open
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => startEdit(issue)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => toggleStatus(issue)}>
                    {issue.status === "CLOSED" ? "Reopen" : "Close"}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => deleteIssue(issue)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusPill({ status }) {
  const safeStatus = status || "OPEN";
  return <span className={`status-pill ${safeStatus === "CLOSED" ? "closed" : "open"}`}>{safeStatus}</span>;
}
