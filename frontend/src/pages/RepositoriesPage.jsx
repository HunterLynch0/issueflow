import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function RepositoriesPage({ onOpenRepo }) {
  const [repos, setRepos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadRepos() {
    try {
      setError("");
      setLoading(true);
      const data = await apiFetch("/api/repositories");
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load repositories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRepos();
  }, []);

  async function createRepo(event) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      await apiFetch("/api/repositories", {
        method: "POST",
        body: { name: name.trim(), description: description.trim() },
      });
      setName("");
      setDescription("");
      await loadRepos();
    } catch (err) {
      setError(err.message || "Could not create repository.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(repo) {
    setEditingId(repo.id);
    setEditName(repo.name || "");
    setEditDescription(repo.description || "");
  }

  async function saveEdit(repoId) {
    if (!editName.trim()) return;

    try {
      setSaving(true);
      await apiFetch(`/api/repositories/${repoId}`, {
        method: "PATCH",
        body: { name: editName.trim(), description: editDescription.trim() },
      });
      setEditingId(null);
      await loadRepos();
    } catch (err) {
      setError(err.message || "Could not save repository.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRepo(repo) {
    if (!confirm(`Delete repository "${repo.name}"? This may also delete its issues.`)) return;

    try {
      await apiFetch(`/api/repositories/${repo.id}`, { method: "DELETE" });
      await loadRepos();
    } catch (err) {
      setError(err.message || "Could not delete repository.");
    }
  }

  return (
    <section className="page-panel">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Repositories</h1>
          <p className="muted">Create a repository, then open it to add and manage issues.</p>
        </div>
      </div>

      <form className="create-card repo-create-grid" onSubmit={createRepo}>
        <label className="field">
          <span>Repository name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. issueflow"
            required
          />
        </label>

        <label className="field">
          <span>Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short project description"
          />
        </label>

        <button className="btn btn-primary" disabled={saving} type="submit">
          {saving ? "Creating..." : "Create repo"}
        </button>
      </form>

      {error && <p className="page-alert page-alert-error">{error}</p>}
      {loading && <p className="empty-state">Loading repositories...</p>}

      {!loading && repos.length === 0 && (
        <div className="empty-state">No repositories yet. Create your first one above.</div>
      )}

      <div className="card-grid">
        {repos.map((repo) => (
          <article className="data-card" key={repo.id}>
            {editingId === repo.id ? (
              <div className="form-stack compact">
                <label className="field">
                  <span>Name</span>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </label>
                <div className="button-row">
                  <button type="button" className="btn btn-primary" onClick={() => saveEdit(repo.id)}>
                    Save
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="card-main">
                  <div className="repo-icon">{(repo.name || "R").slice(0, 1).toUpperCase()}</div>
                  <div>
                    <h2>{repo.name}</h2>
                    <p>{repo.description || "No description yet."}</p>
                  </div>
                </div>

                <div className="button-row wrap">
                  <button type="button" className="btn btn-primary" onClick={() => onOpenRepo(repo)}>
                    Open issues
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => startEdit(repo)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => deleteRepo(repo)}>
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
