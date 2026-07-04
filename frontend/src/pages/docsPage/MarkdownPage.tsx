import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./docsPage.css";

function MarkdownDocPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

const allowedDocs = useMemo(() => {
    return t("markdownDocPage.allowedDocs", {
      returnObjects: true,
    }) as Record<string, string>;
  }, [t]);

  const title = useMemo(() => {
    if (!slug) return t("markdownDocPage.fallbackTitle");
    return allowedDocs[slug] ?? t("markdownDocPage.invalidTitle");
  }, [allowedDocs, slug, t]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarkdown() {
      if (!slug || !allowedDocs[slug]) {
        setError(t("markdownDocPage.messages.invalidDocument"));
        setContent("");
        return;
      }

      try {
        setError(null);

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
          setError(`${t("markdownDocPage.messages.unableToLoad")} ${String(err)}`);
        }
      }
    }

    loadMarkdown();

    return () => {
      cancelled = true;
    };
  }, [slug, allowedDocs, t]);

  return (
    <div className="markdown-page">
      <header className="markdown-navbar">
        <Link to="/" className="markdown-logo">
          {t("markdownDocPage.navbar.logo")}
        </Link>
        <nav>
          <Link to="/docs">{t("markdownDocPage.navbar.docs")}</Link>
          <Link to="/how-to-use">{t("markdownDocPage.navbar.howToUse")}</Link>
          <Link to="/login">{t("markdownDocPage.navbar.login")}</Link>
        </nav>
      </header>

      <main className="markdown-main">
        <section className="markdown-header">
          <p className="markdown-eyebrow">{t("markdownDocPage.header.eyebrow")}</p>
          <h1>{title}</h1>
          <p>{t("markdownDocPage.header.description")}</p>
        </section>

        <article className="markdown-body">
          {error && <div className="markdown-error">{error}</div>}

          {!error && !content && (
            <div className="markdown-loading">{t("markdownDocPage.messages.loading")}</div>
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
