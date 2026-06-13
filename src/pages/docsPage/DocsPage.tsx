import { Link } from "react-router-dom";
import "./docsPage.css";

const docs = [
  {
    slug: "backend",
    title: "Backend README",
    text: "Fastify architecture, Prisma, authentication, REST APIs, and data management.",
  },
  {
    slug: "frontend",
    title: "Frontend README",
    text: "React structure, routing, dashboard, components, and API calls.",
  },
  {
    slug: "websocket",
    title: "WebSocket README",
    text: "Realtime chat, rooms, notifications, direct messages, and connection handling.",
  },
  {
    slug: "database",
    title: "Database README",
    text: "Prisma models, relations, organizations, projects, tasks, chat, and files.",
  },
];

function DocsPage() {
  return (
    <div className="docs-page">
      <header className="docs-navbar">
        <Link to="/" className="docs-logo">FT_TRANSCENDENCE</Link>
        <nav>
          <Link to="/how-to-use">How to use</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main className="docs-main">
        <section className="docs-hero">
            <p className="docs-eyebrow">Documentation</p>
            <h1>Technical README files</h1>
            <p>
                Here you can access the documentation pages rendered from Markdown files
                stored inside the <code>public/docs</code> folder.
            </p>
        </section>

        <section className="docs-grid">
          {docs.map((doc) => (
            <Link key={doc.slug} to={`/docs/${doc.slug}`} className="docs-card">
              <span>README</span>
              <h2>{doc.title}</h2>
              <p>{doc.text}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

export default DocsPage;