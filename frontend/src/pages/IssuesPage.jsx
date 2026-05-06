import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function IssuesPage({ repo, onBack, onOpenIssue }) {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function loadIssues(filter = statusFilter) {
    try {
      const query = filter !== "ALL" ? `?status=${filter}` : "";
      const data = await apiFetch(`/api/repositories/${repo.id}/issues${query}`);
      setIssues(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo.id, statusFilter]);

  async function createIssue(event) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch(`/api/repositories/${repo.id}/issues`, {
        method: "POST",
        body: JSON.stringify({ title, description, status: "OPEN" }),
      });
      setTitle("");
      setDescription("");
      loadIssues();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="panel main-panel">
        <button className="link-btn" onClick={onBack}>← Back to repositories</button>

        <div className="section-heading">
          <div>
            <p className="eyebrow">Repository</p>
            <h2>{repo.name}</h2>
            <p>{repo.description}</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="card-list">
          {issues.map((issue) => (
            <button key={issue.id} className="issue-card" onClick={() => onOpenIssue(issue.id)}>
              <div>
                <div className="row-gap">
                  <h3>{issue.title}</h3>
                  <span className={issue.status === "OPEN" ? "status open" : "status closed"}>{issue.status}</span>
                </div>
                <p>{issue.description || "No description"}</p>
              </div>
              <span>View →</span>
            </button>
          ))}

          {issues.length === 0 && <p className="empty-state">No issues found.</p>}
        </div>
      </section>

      <aside className="panel side-panel">
        <h3>Create issue</h3>
        <form onSubmit={createIssue} className="form-stack">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add merge conflict handling" required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what needs to be done" />
          </label>
          <button className="primary-btn" type="submit">Create issue</button>
        </form>
      </aside>
    </div>
  );
}
