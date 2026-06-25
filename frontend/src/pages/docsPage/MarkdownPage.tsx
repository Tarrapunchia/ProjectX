import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./docsPage.css";

const allowedDocs: Record<string, string> = {
  main: "Main README",
  backend: "Backend README",
  frontend: "Frontend README",
  containers: "Containers README",
};

function MarkdownDocPage() {
  const { slug } = useParams();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!slug) return "README";
    return allowedDocs[slug] ?? "Invalid document.";
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarkdown() {
      if (!slug || !allowedDocs[slug]) {
        setError("Documento non valido.");
        return;
      }

      try {
        setError(null);
        setContent("");

        const res = await fetch(`/docs/${slug}.md`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const text = await res.text();

        if (!cancelled) {
          setContent(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Unable to load README file: ${String(err)}`);
        }
      }
    }

    loadMarkdown();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="markdown-page">
      <header className="markdown-navbar">
        <Link to="/" className="markdown-logo">FT_TRANSCENDENCE</Link>
        <nav>
          <Link to="/docs">Docs</Link>
          <Link to="/how-to-use">How to use</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main className="markdown-main">
        <section className="markdown-header">
            <p className="markdown-eyebrow">README</p>
            <h1>{title}</h1>
            <p>
                This document is dynamically rendered from a Markdown file stored inside
                the <code>public/docs</code> folder.
            </p>
        </section>

        <article className="markdown-body">
          {error && <div className="markdown-error">{error}</div>}

          {!error && !content && (
            <div className="markdown-loading">Loading...</div>
          )}

          {!error && content && (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          )}
        </article>
      </main>
    </div>
  );
}

export default MarkdownDocPage;