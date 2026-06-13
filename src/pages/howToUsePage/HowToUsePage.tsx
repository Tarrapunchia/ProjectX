import { Link } from "react-router-dom";
import "./howToUsePage.css";

const steps = [
  {
    title: "1. Sign in to the platform",
    text: "Log in with email/password or through Google OAuth. After authentication, you will access your personal dashboard.",
  },
  {
    title: "2. Check your dashboard",
    text: "The dashboard shows your calendar, events, tasks, priorities, and relevant activity summaries.",
  },
  {
    title: "3. Select a project",
    text: "From the Projects section, you can browse projects by status: TODO, ACTIVE, REVIEW, and COMPLETED.",
  },
  {
    title: "4. Manage tasks",
    text: "Each project can contain tasks with priority, due date, description, and progress status.",
  },
  {
    title: "5. Use documents and files",
    text: "The Files section lets you upload and access materials linked to a project or organization.",
  },
  {
    title: "6. Collaborate in real time",
    text: "The chat system uses WebSocket to support direct messages, project rooms, notifications, and live communication.",
  },
];

function HowToUsePage() {
  return (
    <div className="howto-page">
      <header className="howto-navbar">
        <Link to="/" className="howto-logo">FT_TRANSCENDENCE</Link>
        <nav>
          <Link to="/docs">README</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main className="howto-main">
        <section className="howto-hero">
            <p className="howto-eyebrow">User guide</p>
            <h1>How to use the webapp</h1>
            <p>
                This page explains the main workflow of the platform, from login to
                project management and realtime collaboration.
            </p>
        </section>

        <section className="howto-steps">
          {steps.map((step) => (
            <article key={step.title} className="howto-step">
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </article>
          ))}
        </section>

        <section className="howto-tip">
          <h2>Usage Tip</h2>
          <p>
            Use the dashboard as your starting point, then enter the active project
            to work on tasks, files, documents, and chat. In this way, the webapp
            works as a small Jira-like system integrated with live communication.
          </p>
        </section>
      </main>
    </div>
  );
}

export default HowToUsePage;