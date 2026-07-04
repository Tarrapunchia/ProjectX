import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./landingPage.css";

type LandingFeature = {
  title: string;
  text: string;
};

type LandingWorkflowStep = {
  number: string;
  title: string;
  text: string;
};

type LandingPreviewColumn = {
  title: string;
  tasks: string[];
};

function LandingPage() {
  const { t } = useTranslation();

  const features = t("landingPage.features", {
    returnObjects: true,
  }) as LandingFeature[];

  const workflow = t("landingPage.workflow", {
    returnObjects: true,
  }) as LandingWorkflowStep[];

  const previewColumns = t("landingPage.preview.columns", {
    returnObjects: true,
  }) as LandingPreviewColumn[];

  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="landing-logo">{t("landingPage.navbar.logo")}</div>

        <nav className="landing-nav-links">
          <Link to="/docs">{t("landingPage.navbar.readme")}</Link>
          <Link to="/how-to-use">{t("landingPage.navbar.howToUse")}</Link>
          <Link to="/login" className="landing-login-btn">
            {t("landingPage.navbar.login")}
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-content">
            <p className="landing-eyebrow">
              {t("landingPage.hero.eyebrow")}
            </p>

            <h1>
              {t("landingPage.hero.title.line1")}
              <span>{t("landingPage.hero.title.highlight")}</span>
              <br />
              {t("landingPage.hero.title.line2")}
            </h1>

            <p className="landing-hero-text">{t("landingPage.hero.text")}</p>

            <div className="landing-hero-actions">
              <Link to="/login" className="landing-primary-btn">
                {t("landingPage.hero.actions.primary")}
              </Link>
              <Link to="/docs" className="landing-secondary-btn">
                {t("landingPage.hero.actions.secondary")}
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
              {previewColumns.map((column, index) => {
                const columnClass =
                  index === 1 ? "active" : index === 2 ? "review" : index === 3 ? "done" : "";

                return (
                  <div key={column.title} className="preview-column">
                    <h3>{column.title}</h3>
                    {column.tasks.map((task) => (
                      <div
                        key={task}
                        className={`preview-task${columnClass ? ` ${columnClass}` : ""}`}
                      >
                        {task}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-header">
            <p className="landing-eyebrow">
              {t("landingPage.featuresSection.eyebrow")}
            </p>
            <h2>{t("landingPage.featuresSection.title")}</h2>
            <p>{t("landingPage.featuresSection.description")}</p>
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
            <p className="landing-eyebrow">
              {t("landingPage.workflowSection.eyebrow")}
            </p>
            <h2>{t("landingPage.workflowSection.title")}</h2>
          </div>

          <div className="landing-flow">
            {workflow.map((step) => (
              <div key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <h2>{t("landingPage.cta.title")}</h2>
          <p>{t("landingPage.cta.text")}</p>
          <Link to="/docs" className="landing-primary-btn">
            {t("landingPage.cta.button")}
          </Link>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
