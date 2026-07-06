import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type DocCard = {
  slug: string;
  title: string;
  text: string;
};

function DocsPage() {
  const { t } = useTranslation();

  const mainDoc = t("docsPage.mainDoc", {
    returnObjects: true,
  }) as DocCard;

  const techDocs = t("docsPage.techDocs", {
    returnObjects: true,
  }) as DocCard[];

  return (
    <div className="min-h-screen bg-bg-color text-text-main">
      <header className="min-h-[72px] px-[7vw] max-[760px]:px-[18px] flex items-center justify-between bg-side-bg-color border-b border-overlay-border-color">
        <Link
          to="/"
          className="text-owner-color font-black tracking-[0.22em] no-underline"
        >
          {t("docsPage.navbar.logo")}
        </Link>
        <nav className="flex items-center gap-[18px]">
          <Link
            to="/how-to-use"
            className="text-text-main no-underline hover:text-owner-color"
          >
            {t("docsPage.navbar.howToUse")}
          </Link>
          <Link
            to="/login"
            className="text-text-main no-underline hover:text-owner-color"
          >
            {t("docsPage.navbar.login")}
          </Link>
        </nav>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 pt-14 pb-20">
        <section className="mb-8">
          <p className="text-owner-color font-black uppercase tracking-[0.16em] text-[0.78rem] mb-3">
            {t("docsPage.hero.eyebrow")}
          </p>
          <h1 className="m-0 mb-[14px] text-[clamp(2.2rem,5vw,4.4rem)] tracking-[-0.05em] leading-[1.05]">
            {t("docsPage.hero.projectReadmeTitle")}
          </h1>
        </section>

        <section className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
          <Link
            key={mainDoc.slug}
            to={`/docs/${mainDoc.slug}`}
            className="min-h-[220px] flex flex-col justify-end p-6 rounded-[18px] border border-overlay-border-color bg-[radial-gradient(circle_at_15%_10%,color-mix(in_srgb,var(--color-owner)_22%,transparent),transparent_35%),var(--color-side-bg)] text-text-main no-underline transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
          >
            <span className="text-owner-color text-[0.72rem] font-black tracking-[0.18em] uppercase">
              {t("docsPage.labels.readme")}
            </span>
            <h2 className="mt-[10px] mb-[10px] text-[1.6rem] text-text-main">
              {mainDoc.title}
            </h2>
            <p className="m-0 text-text-main/72 leading-[1.55]">
              {mainDoc.text}
            </p>
          </Link>
        </section>
        <br />

        <section className="mb-8">
          <h1 className="m-0 mb-[14px] text-[clamp(2.2rem,5vw,4.4rem)] tracking-[-0.05em] leading-[1.05]">
            {t("docsPage.hero.technicalReadmeTitle")}
          </h1>
          <p className="max-w-[760px] text-text-main/72 leading-[1.6]">
            {t("docsPage.hero.description")}
          </p>
        </section>

        <section className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
          {techDocs.map((doc) => (
            <Link
              key={doc.slug}
              to={`/docs/${doc.slug}`}
              className="min-h-[220px] flex flex-col justify-end p-6 rounded-[18px] border border-overlay-border-color bg-[radial-gradient(circle_at_15%_10%,color-mix(in_srgb,var(--color-owner)_22%,transparent),transparent_35%),var(--color-side-bg)] text-text-main no-underline transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
            >
              <span className="text-owner-color text-[0.72rem] font-black tracking-[0.18em] uppercase">
                {t("docsPage.labels.readme")}
              </span>
              <h2 className="mt-[10px] mb-[10px] text-[1.6rem] text-text-main">
                {doc.title}
              </h2>
              <p className="m-0 text-text-main/72 leading-[1.55]">
                {doc.text}
              </p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

export default DocsPage;
