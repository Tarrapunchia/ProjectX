import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="min-h-screen bg-bg-color text-text-main">
      <header className="min-h-[72px] px-[7vw] max-[760px]:px-[18px] flex items-center justify-between bg-side-bg-color border-b border-overlay-border-color">
        <Link
          to="/"
          className="text-owner-color font-black tracking-[0.22em] no-underline"
        >
          {t("markdownDocPage.navbar.logo")}
        </Link>
        <nav className="flex items-center gap-[18px]">
          <Link
            to="/docs"
            className="text-text-main no-underline hover:text-owner-color"
          >
            {t("markdownDocPage.navbar.docs")}
          </Link>
          <Link
            to="/how-to-use"
            className="text-text-main no-underline hover:text-owner-color"
          >
            {t("markdownDocPage.navbar.howToUse")}
          </Link>
          <Link
            to="/login"
            className="text-text-main no-underline hover:text-owner-color"
          >
            {t("markdownDocPage.navbar.login")}
          </Link>
        </nav>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 pt-14 pb-20">
        <section className="mb-8">
          <p className="text-owner-color font-black uppercase tracking-[0.16em] text-[0.78rem]">
            {t("markdownDocPage.header.eyebrow")}
          </p>
          <h1 className="m-0 mb-[14px] text-[clamp(2.2rem,5vw,4.4rem)] tracking-[-0.05em]">
            {title}
          </h1>
          <p className="max-w-[760px] text-text-main/72">
            {t("markdownDocPage.header.description")}
          </p>
        </section>

        <article
          className="
            p-8 rounded-[18px] border border-overlay-border-color
            bg-side-bg-color text-text-main leading-[1.7] overflow-x-auto

            [&_h1]:text-[3rem] [&_h1]:leading-[1.1] [&_h1]:m-0 [&_h1]:mb-8
            [&_h1]:font-extrabold [&_h1]:tracking-[-0.04em] [&_h1]:text-text-main

            [&_h2]:text-[2rem] [&_h2]:leading-[1.2] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:pb-2
            [&_h2]:border-b [&_h2]:border-overlay-border-color
            [&_h2]:font-bold [&_h2]:text-owner-color

            [&_h3]:text-[1.35rem] [&_h3]:mt-8 [&_h3]:mb-3
            [&_h3]:font-bold [&_h3]:text-text-main

            [&_p]:m-0 [&_p]:mb-[18px] [&_p]:text-text-main/78

            [&_ul]:list-disc [&_ul]:m-0 [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:pl-5
            [&_ol]:list-decimal [&_ol]:m-0 [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:pl-5

            [&_li]:my-2 [&_li]:pl-1 [&_li]:text-text-main/78
            [&_li::marker]:text-owner-color

            [&_code]:px-[7px] [&_code]:py-[2px] [&_code]:rounded-[6px]
            [&_code]:bg-text-main/12 [&_code]:text-owner-color [&_code]:text-[0.9em]

            [&_pre]:my-[22px] [&_pre]:px-5 [&_pre]:py-[18px] [&_pre]:rounded-[14px]
            [&_pre]:overflow-x-auto [&_pre]:bg-[#111827]
            [&_pre]:border [&_pre]:border-[rgba(255,255,255,0.08)]

            [&_pre_code]:p-0 [&_pre_code]:bg-transparent
            [&_pre_code]:text-[#f8fafc] [&_pre_code]:text-[0.9rem]

            [&_table]:w-full [&_table]:border-collapse [&_table]:my-6

            [&_th]:border [&_th]:border-overlay-border-color
            [&_th]:px-[14px] [&_th]:py-3 [&_th]:text-left
            [&_th]:bg-category-bg-color [&_th]:text-owner-color [&_th]:font-extrabold

            [&_td]:border [&_td]:border-overlay-border-color
            [&_td]:px-[14px] [&_td]:py-3 [&_td]:text-left [&_td]:text-text-main/78

            [&_a]:text-owner-color [&_a]:underline [&_a]:underline-offset-4

            [&_blockquote]:my-6 [&_blockquote]:px-5 [&_blockquote]:py-4
            [&_blockquote]:border-l-4 [&_blockquote]:border-owner-color
            [&_blockquote]:rounded-[10px] [&_blockquote]:bg-owner-color/10

            [&_hr]:my-9 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-overlay-border-color
          "
        >
          {error && <div className="text-text-main">{error}</div>}

          {!error && !content && (
            <div className="text-text-main">
              {t("markdownDocPage.messages.loading")}
            </div>
          )}

          {!error && content && (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
        </article>
      </main>
    </div>
  );
}

export default MarkdownDocPage;
