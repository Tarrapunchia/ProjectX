import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./howToUsePage.css";

type HowToStep = {
  title: string;
  text: string;
};

function HowToUsePage() {
  const { t } = useTranslation();

  const steps = t("howToUse.steps", {
    returnObjects: true,
  }) as HowToStep[];

  return (
    <div className="howto-page">
      <header className="howto-navbar">
        <Link to="/" className="howto-logo">
          {t("howToUse.navbar.logo")}
        </Link>
        <nav>
          <Link to="/docs">{t("howToUse.navbar.readme")}</Link>
          <Link to="/login">{t("howToUse.navbar.login")}</Link>
        </nav>
      </header>

      <main className="howto-main">
        <section className="howto-hero">
          <p className="howto-eyebrow">{t("howToUse.hero.eyebrow")}</p>
          <h1>{t("howToUse.hero.title")}</h1>
          <p>{t("howToUse.hero.description")}</p>
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
          <h2>{t("howToUse.tip.title")}</h2>
          <p>{t("howToUse.tip.text")}</p>
        </section>
      </main>
    </div>
  );
}

export default HowToUsePage;
