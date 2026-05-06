import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function IssueDetailPage({ issueId, onBack }) {
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function loadIssue() {
    try {
      const data = await apiFetch(`/api/issues/${issueId}`);
      setIssue(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadComments() {
    try {
      const data = await apiFetch(`/api/issues/${issueId}/comments`);
      setComments(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadIssue();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  async function addComment(event) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setContent("");
      loadComments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(action) {
    try {
      const updated = await apiFetch(`/api/issues/${issueId}/${action}`, { method: "PATCH" });
      setIssue(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!issue) {
    return (
      <section className="panel">
        <button className="link-btn" onClick={onBack}>← Back to issues</button>
        <p>Loading issue...</p>
      </section>
    );
  }

  return (
    <div className="detail-layout">
      <section className="panel">
        <button className="link-btn" onClick={onBack}>← Back to issues</button>

        <div className="issue-detail-header">
          <div>
            <p className="eyebrow">Issue #{issue.id}</p>
            <h2>{issue.title}</h2>
            <p>{issue.description}</p>
          </div>
          <span className={issue.status === "OPEN" ? "status open" : "status closed"}>{issue.status}</span>
        </div>

        <div className="action-row">
          <button className="secondary-btn" onClick={() => updateStatus("close")}>Close issue</button>
          <button className="secondary-btn" onClick={() => updateStatus("reopen")}>Reopen issue</button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Discussion</p>
            <h2>Comments</h2>
          </div>
          <span className="count-pill">{comments.length}</span>
        </div>

        <form onSubmit={addComment} className="comment-form">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a comment..." required />
          <button className="primary-btn" type="submit">Add comment</button>
        </form>

        <div className="comments-list">
          {comments.map((comment) => (
            <article key={comment.id} className="comment-card">
              <p>{comment.content}</p>
              {comment.createdAt && <span>{new Date(comment.createdAt).toLocaleString()}</span>}
            </article>
          ))}

          {comments.length === 0 && <p className="empty-state">No comments yet.</p>}
        </div>
      </section>
    </div>
  );
}
