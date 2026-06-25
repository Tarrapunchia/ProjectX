import { Link } from "react-router-dom";
import "./docsPage.css";

const techDocs = [
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
    slug: "containers",
    title: "Containers README",
    text: "How the project was containerized.",
  },
  {
    slug: "database",
    title: "Database README",
    text: "Prisma models, relations, organizations, projects, tasks, chat, and files.",
  },
  {
    slug: "main",
    title: "Project README",
    text: "All in one.",
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
          {techDocs.map((doc) => (
            <Link key={doc.slug} to={`/docs/${doc.slug}`} className="docs-card">
              <span>README</span>
              <h2>{doc.title}</h2>
              <p>{doc.text}</p>
            </Link>
          ))}
        </section>
        <section className="docs-hero">
            <br></br>
            <h1>Sections README files</h1>
            <p>
                Here you can access the documentation pages rendered from Markdown files
                stored inside the <code>public/docs</code> folder.
            </p>
        </section>
      </main>
    </div>
  );
}

export default DocsPage;