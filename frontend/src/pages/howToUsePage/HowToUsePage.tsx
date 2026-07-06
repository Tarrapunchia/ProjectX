import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    <div className="min-h-screen bg-bg-color text-text-main">
      <header className="min-h-[72px] px-[7vw] max-[760px]:px-[18px] flex items-center justify-between bg-side-bg-color border-b border-overlay-border-color">
        <Link to="/" className="text-owner-color font-black tracking-[0.22em] no-underline">
          {t("howToUse.navbar.logo")}
        </Link>
        <nav className="flex items-center gap-[18px] max-[760px]:gap-[12px]">
          <Link to="/docs" className="!text-text-main no-underline hover:!text-owner-color">
            {t("howToUse.navbar.readme")}
          </Link>
          <Link to="/login" className="!text-text-main no-underline hover:!text-owner-color">
            {t("howToUse.navbar.login")}
          </Link>
        </nav>
      </header>

      <main className="max-w-[1100px] mx-auto pt-[56px] px-[20px] pb-[80px] max-[760px]:pt-[40px] max-[760px]:px-[18px] max-[760px]:pb-[64px]">
        <section className="mb-[32px]">
          <p className="text-owner-color font-black uppercase tracking-[0.16em] text-[0.78rem] mb-[12px]">
            {t("howToUse.hero.eyebrow")}
          </p>
          <h1 className="m-0 mb-[14px] text-[clamp(2.2rem,5vw,4.4rem)] tracking-[-0.05em] leading-[1.05] text-text-main">
            {t("howToUse.hero.title")}
          </h1>
          <p className="max-w-[760px] text-[color-mix(in_srgb,var(--color-text)_72%,transparent)] leading-[1.6]">
            {t("howToUse.hero.description")}
          </p>
        </section>

        <section className="grid grid-cols-[repeat(2,minmax(0,1fr))] max-[760px]:grid-cols-1 gap-[18px]">
          {steps.map((step) => (
            <article key={step.title} className="p-[24px] rounded-[18px] border border-overlay-border-color bg-side-bg-color">
              <h2 className="m-0 mb-[10px] text-owner-color">{step.title}</h2>
              <p className="m-0 text-[color-mix(in_srgb,var(--color-text)_74%,transparent)] leading-[1.65]">{step.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-[24px] p-[24px] rounded-[18px] border border-overlay-border-color bg-side-bg-color">
          <h2 className="m-0 mb-[10px] text-owner-color">{t("howToUse.tip.title")}</h2>
          <p className="m-0 text-[color-mix(in_srgb,var(--color-text)_74%,transparent)] leading-[1.65]">{t("howToUse.tip.text")}</p>
        </section>
      </main>
    </div>
  );
}

export default HowToUsePage;