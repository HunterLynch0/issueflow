import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function RepositoriesPage({ onOpenRepo }) {
  const [repos, setRepos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function loadRepos() {
    try {
      const data = await apiFetch("/api/repositories");
      setRepos(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadRepos();
  }, []);

  async function createRepo(event) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch("/api/repositories", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      setName("");
      setDescription("");
      loadRepos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="panel main-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Repositories</p>
            <h2>Your repositories</h2>
          </div>
          <span className="count-pill">{repos.length}</span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="card-list">
          {repos.map((repo) => (
            <button key={repo.id} className="repo-card" onClick={() => onOpenRepo(repo)}>
              <div>
                <h3>{repo.name}</h3>
                <p>{repo.description || "No description"}</p>
              </div>
              <span>Open →</span>
            </button>
          ))}

          {repos.length === 0 && <p className="empty-state">No repositories yet. Create your first one.</p>}
        </div>
      </section>

      <aside className="panel side-panel">
        <h3>Create repository</h3>
        <form onSubmit={createRepo} className="form-stack">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="versionhandle" required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A lightweight Git-like VCS" />
          </label>
          <button className="primary-btn" type="submit">Create repo</button>
        </form>
      </aside>
    </div>
  );
}
