import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./docsPage.css";

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
    <div className="docs-page">
      <header className="docs-navbar">
        <Link to="/" className="docs-logo">
          {t("docsPage.navbar.logo")}
        </Link>
        <nav>
          <Link to="/how-to-use">{t("docsPage.navbar.howToUse")}</Link>
          <Link to="/login">{t("docsPage.navbar.login")}</Link>
        </nav>
      </header>

      <main className="docs-main">
        <section className="docs-hero">
          <p className="docs-eyebrow">{t("docsPage.hero.eyebrow")}</p>
          <h1>{t("docsPage.hero.projectReadmeTitle")}</h1>
        </section>

        <section className="docs-grid">
          <Link key={mainDoc.slug} to={`/docs/${mainDoc.slug}`} className="docs-card">
            <span>{t("docsPage.labels.readme")}</span>
            <h2>{mainDoc.title}</h2>
            <p>{mainDoc.text}</p>
          </Link>
        </section>
        <br />

        <section className="docs-hero">
          <h1>{t("docsPage.hero.technicalReadmeTitle")}</h1>
          <p>
            {t("docsPage.hero.description")}
          </p>
        </section>

        <section className="docs-grid">
          {techDocs.map((doc) => (
            <Link key={doc.slug} to={`/docs/${doc.slug}`} className="docs-card">
              <span>{t("docsPage.labels.readme")}</span>
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
