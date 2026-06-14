const features = [
  {
    title: "Repository Management",
    copy: "Create and manage project repositories in one place.",
  },
  {
    title: "Issue Tracking",
    copy: "Open, update, assign, and organise issues across your projects.",
  },
  {
    title: "Team Collaboration",
    copy: "Control access and work with other users on shared repositories.",
  },
  {
    title: "Secure Authentication",
    copy: "JWT-based login keeps user sessions protected.",
  },
];

export default function LandingPage({ onNavigate }) {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <button
          type="button"
          className="brand-button landing-brand"
          onClick={() => onNavigate("/")}
          aria-label="Go to IssueFlow home"
        >
          <span className="logo-mark">IF</span>
          <span className="brand-copy">
            <strong>IssueFlow</strong>
            <small>Developer issue tracking</small>
          </span>
        </button>

        <nav className="landing-nav-actions" aria-label="Authentication">
          <LandingLink to="/login" className="btn btn-soft" onNavigate={onNavigate}>
            Login
          </LandingLink>
          <LandingLink to="/register" className="btn btn-primary" onNavigate={onNavigate}>
            Register
          </LandingLink>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-kicker">Lightweight GitHub-style issue tracking</p>
          <h1 id="landing-title">Track issues. Manage repositories. Ship faster.</h1>
          <p className="landing-subtitle">
            IssueFlow is a lightweight issue tracker for developers and teams, built for managing
            repositories, assigning issues, and keeping work organised.
          </p>

          <div className="button-row landing-cta">
            <LandingLink to="/register" className="btn btn-primary btn-large" onNavigate={onNavigate}>
              Get Started
            </LandingLink>
            <LandingLink to="/login" className="btn btn-soft btn-large" onNavigate={onNavigate}>
              Log In
            </LandingLink>
          </div>

          <div className="landing-highlights" aria-label="IssueFlow capabilities">
            <span>Repositories</span>
            <span>Assignments</span>
            <span>Comments</span>
            <span>Status tracking</span>
          </div>
        </div>

        <aside className="product-preview" aria-label="IssueFlow interface preview">
          <div className="preview-topline">
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-dot" />
          </div>

          <div className="preview-repo">
            <span className="meta-label">Repository</span>
            <strong>issueflow/frontend</strong>
            <p>Organise active work without losing the project context.</p>
          </div>

          <div className="preview-issue-list">
            <article className="preview-issue active">
              <div>
                <span className="preview-id">Issue #24</span>
                <strong>Invite collaborators to shared repos</strong>
              </div>
              <span className="status-pill open">Open</span>
            </article>

            <article className="preview-issue">
              <div>
                <span className="preview-id">Issue #18</span>
                <strong>Add assignee filters to issue boards</strong>
              </div>
              <span className="preview-assignee">HL</span>
            </article>

            <article className="preview-issue">
              <div>
                <span className="preview-id">Issue #11</span>
                <strong>Document JWT session handling</strong>
              </div>
              <span className="status-pill closed">Closed</span>
            </article>
          </div>
        </aside>
      </section>

      <section className="landing-features" aria-labelledby="features-title">
        <div className="section-title-row landing-section-title">
          <div>
            <p className="eyebrow">Product</p>
            <h2 id="features-title">Everything a small team needs to keep work moving</h2>
          </div>
          <p className="muted">
            Built around repositories, issues, owners, members, assignees, and comments.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-marker" aria-hidden="true" />
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function LandingLink({ to, className, onNavigate, children }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(to);
      }}
    >
      {children}
    </a>
  );
}
