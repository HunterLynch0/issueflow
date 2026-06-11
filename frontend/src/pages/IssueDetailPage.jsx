import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function IssueDetailPage({ issueId, onBack, onRepoLink }) {
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [editingIssue, setEditingIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingComment, setSavingComment] = useState(false);
  const [error, setError] = useState("");

  async function loadIssue() {
    try {
      setError("");
      setLoading(true);
      const [issueData, commentsData] = await Promise.all([
        apiFetch(`/api/issues/${issueId}`),
        apiFetch(`/api/issues/${issueId}/comments`),
      ]);
      setIssue(issueData);
      setIssueTitle(issueData.title || "");
      setIssueDescription(issueData.description || "");
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (err) {
      setError(err.message || "Could not load issue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadIssue();
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  async function saveIssueEdit() {
    if (!issueTitle.trim()) return;

    try {
      await apiFetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        body: { title: issueTitle.trim(), description: issueDescription.trim() },
      });
      setEditingIssue(false);
      await loadIssue();
    } catch (err) {
      setError(err.message || "Could not save issue.");
    }
  }

  async function deleteIssue() {
    if (!confirm("Delete this issue?")) return;

    try {
      await apiFetch(`/api/issues/${issueId}`, { method: "DELETE" });
      if (issue?.repo?.id) onRepoLink(issue.repo.id);
      else onBack();
    } catch (err) {
      setError(err.message || "Could not delete issue.");
    }
  }

  async function toggleStatus() {
    if (!issue) return;
    const action = issue.status === "CLOSED" ? "reopen" : "close";

    try {
      await apiFetch(`/api/issues/${issue.id}/${action}`, { method: "PATCH" });
      await loadIssue();
    } catch (err) {
      setError(err.message || "Could not update issue status.");
    }
  }

  async function createComment(event) {
    event.preventDefault();
    if (!content.trim()) return;

    try {
      setSavingComment(true);
      await apiFetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        body: { content: content.trim() },
      });
      setContent("");
      await loadIssue();
    } catch (err) {
      setError(err.message || "Could not create comment.");
    } finally {
      setSavingComment(false);
    }
  }

  function startCommentEdit(comment) {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content || "");
  }

  async function saveCommentEdit(commentId) {
    if (!editCommentContent.trim()) return;

    try {
      await apiFetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        body: { content: editCommentContent.trim() },
      });
      setEditingCommentId(null);
      await loadIssue();
    } catch (err) {
      setError(err.message || "Could not save comment.");
    }
  }

  async function deleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;

    try {
      await apiFetch(`/api/comments/${commentId}`, { method: "DELETE" });
      await loadIssue();
    } catch (err) {
      setError(err.message || "Could not delete comment.");
    }
  }

  if (loading) {
    return (
      <section className="page-panel">
        <p className="empty-state">Loading issue...</p>
      </section>
    );
  }

  if (!issue) {
    return (
      <section className="page-panel">
        <button type="button" className="text-link" onClick={onBack}>← Back</button>
        <p className="page-alert page-alert-error">Issue not found.</p>
      </section>
    );
  }

  return (
    <section className="page-panel">
      <button type="button" className="text-link" onClick={onBack}>← Back</button>

      {error && <p className="page-alert page-alert-error">{error}</p>}

      <article className="data-card issue-detail-card">
        {editingIssue ? (
          <div className="form-stack compact">
            <label className="field">
              <span>Title</span>
              <input value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} />
            </label>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={saveIssueEdit}>Save issue</button>
              <button type="button" className="btn btn-soft" onClick={() => setEditingIssue(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="issue-top-row detail">
              <div>
                <p className="eyebrow">Issue #{issue.id}</p>
                <h1>{issue.title}</h1>
                <p>{issue.description || "No description yet."}</p>
              </div>
              <StatusPill status={issue.status} />
            </div>

            <div className="meta-panel two-col">
              <div>
                <span className="meta-label">Repository</span>
                <strong>{issue.repo?.name || "Unknown"}</strong>
              </div>
              <div>
                <span className="meta-label">Assignee</span>
                <strong>{issue.assignee?.username || issue.assignee?.email || "Unassigned"}</strong>
              </div>
            </div>

            <div className="button-row wrap">
              <button type="button" className="btn btn-soft" onClick={() => setEditingIssue(true)}>Edit issue</button>
              <button type="button" className="btn btn-soft" onClick={toggleStatus}>
                {issue.status === "CLOSED" ? "Reopen" : "Close"}
              </button>
              <button type="button" className="btn btn-danger" onClick={deleteIssue}>Delete issue</button>
            </div>
          </>
        )}
      </article>

      <section className="comments-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Discussion</p>
            <h2>Comments</h2>
          </div>
          <span className="count-badge">{comments.length}</span>
        </div>

        <form className="comment-compose" onSubmit={createComment}>
          <label className="field">
            <span>Add a comment</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment..."
              required
            />
          </label>
          <button className="btn btn-primary align-start" type="submit" disabled={savingComment}>
            {savingComment ? "Posting..." : "Post comment"}
          </button>
        </form>

        <div className="list-stack comments-list">
          {comments.map((comment) => (
            <article className="comment-card" key={comment.id}>
              {editingCommentId === comment.id ? (
                <div className="form-stack compact">
                  <label className="field">
                    <span>Edit comment</span>
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                    />
                  </label>
                  <div className="button-row">
                    <button type="button" className="btn btn-primary btn-small" onClick={() => saveCommentEdit(comment.id)}>
                      Save
                    </button>
                    <button type="button" className="btn btn-soft btn-small" onClick={() => setEditingCommentId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-body">{comment.content}</p>
                  <div className="comment-footer">
                    <span>{formatDate(comment.createdAt)}</span>
                    <div className="button-row compact-actions">
                      <button type="button" className="btn btn-soft btn-small" onClick={() => startCommentEdit(comment)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger-soft btn-small" onClick={() => deleteComment(comment.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}

          {comments.length === 0 && <p className="empty-state">No comments yet. Start the discussion above.</p>}
        </div>
      </section>
    </section>
  );
}

function StatusPill({ status }) {
  const safeStatus = status || "OPEN";
  return <span className={`status-pill ${safeStatus === "CLOSED" ? "closed" : "open"}`}>{safeStatus}</span>;
}

function formatDate(value) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString();
}
