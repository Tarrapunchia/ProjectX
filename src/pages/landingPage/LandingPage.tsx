import { Link } from "react-router-dom";
import "./landingPage.css";

const features = [
  {
    title: "Organizations",
    text: "Create and manage organizations, teams, and shared workspaces.",
  },
  {
    title: "Projects",
    text: "Each organization can contain multiple projects with status, description, tasks, and documents.",
  },
  {
    title: "Task board",
    text: "Manage work items in a Jira-like flow: TODO, ACTIVE, REVIEW, and COMPLETED.",
  },
  {
    title: "Realtime chat",
    text: "Communicate through direct messages and project rooms powered by WebSocket.",
  },
  {
    title: "Documents and files",
    text: "Upload and access files linked to organizations and projects.",
  },
  {
    title: "Personal dashboard",
    text: "View your profile, calendar, tasks, priorities, events, and activity status.",
  },
];

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="landing-logo">FT_TRANSCENDENCE</div>

        <nav className="landing-nav-links">
          <Link to="/docs">README</Link>
          <Link to="/how-to-use">How to use</Link>
          <Link to="/login" className="landing-login-btn">
            Login
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-content">
            <p className="landing-eyebrow">
            Project Management · Realtime · Collaboration
            </p>

            <h1>
            A collaborative webapp
            <span> inspired by Jira</span>
            <br />
            to organize projects, tasks, and teams.
            </h1>

            <p className="landing-hero-text">
            FT_TRANSCENDENCE is a platform designed to manage organizations,
            projects, tasks, documents, calendars, and realtime communication.
            Its goal is to provide a centralized dashboard where users can track
            their team’s work, collaborate on projects, and review activity history.
            </p>

            <div className="landing-hero-actions">
            <Link to="/login" className="landing-primary-btn">
                Enter the webapp
            </Link>
            <Link to="/docs" className="landing-secondary-btn">
                Read the README files
            </Link>
            </div>
          </div>

          <div className="landing-preview-card">
            <div className="preview-topbar">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="preview-board">
              <div className="preview-column">
                <h3>TODO</h3>
                <div className="preview-task">Setup organization</div>
                <div className="preview-task">Define project tasks</div>
              </div>

              <div className="preview-column">
                <h3>ACTIVE</h3>
                <div className="preview-task active">Build dashboard</div>
                <div className="preview-task active">WebSocket chat</div>
              </div>

              <div className="preview-column">
                <h3>REVIEW</h3>
                <div className="preview-task review">File upload</div>
              </div>

              <div className="preview-column">
                <h3>DONE</h3>
                <div className="preview-task done">Authentication</div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-header">
            <p className="landing-eyebrow">Core features</p>
            <h2>How the platform works</h2>
            <p>
            The webapp is divided into modules: authentication, user profile,
            organizations, projects, tasks, documents, calendar, and chat.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((feature) => (
              <article key={feature.title} className="landing-feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-flow-section">
          <div className="landing-section-header">
            <p className="landing-eyebrow">Workflow</p>
            <h2>Typical Pipeline</h2>
          </div>

          <div className="landing-flow">
            <div>
                <span>01</span>
                <h3>Login</h3>
                <p>The user signs in with email/password or Google OAuth.</p>
            </div>

            <div>
                <span>02</span>
                <h3>Dashboard</h3>
                <p>View calendar, events, tasks, priorities, and activity summaries.</p>
            </div>

            <div>
                <span>03</span>
                <h3>Projects</h3>
                <p>Select a project and view its tasks, documents, and details.</p>
            </div>

            <div>
                <span>04</span>
                <h3>Collaboration</h3>
                <p>Use realtime chat, notifications, and shared documents.</p>
            </div>
          </div>
        </section>

        <section className="landing-cta">
            <h2>Want to understand the project from a technical point of view?</h2>
            <p>
                Check the dedicated README files for the backend, frontend, WebSocket, and database.
            </p>
            <Link to="/docs" className="landing-primary-btn">
                Go to documentation
            </Link>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;