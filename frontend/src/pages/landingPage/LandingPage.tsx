import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(172,134,0,0.16),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(100,108,255,0.14),transparent_35%),var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-20 min-h-[72px] px-[7vw] max-[680px]:px-[18px] flex items-center justify-between bg-[color-mix(in_srgb,var(--color-side-bg)_92%,transparent)] backdrop-blur-[14px] border-b border-[var(--color-overlay-border)]">
        <div className="font-black tracking-[0.25em] text-[0.9rem] text-[var(--color-owner)]">
          {t("landingPage.navbar.logo")}
        </div>

        <nav className="flex items-center gap-[24px] max-[680px]:gap-[12px]">
          <Link to="/docs" className="!text-text-main text-[0.95rem] max-[680px]:hidden">
            {t("landingPage.navbar.readme")}
          </Link>
          <Link to="/how-to-use" className="!text-text-main  text-[0.95rem] max-[680px]:hidden">
            {t("landingPage.navbar.howToUse")}
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-[10px] font-bold transition-[transform,box-shadow] duration-200 ease-in-out py-[9px] px-[16px] bg-[var(--color-text)] !text-[var(--color-bg)] hover:-translate-y-[2px] text-[0.95rem]"
          >
            {t("landingPage.navbar.login")}
          </Link>
        </nav>
      </header>

      <main>
        <section className="pt-[90px] px-[7vw] pb-[70px] max-[980px]:grid-cols-1 max-[680px]:py-[56px] max-[680px]:px-[18px] grid grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-[54px] items-center">
          <div>
            <p className="m-0 mb-[12px] text-[var(--color-owner)] text-[0.78rem] font-extrabold tracking-[0.18em] uppercase">
              {t("landingPage.hero.eyebrow")}
            </p>

            <h1 className="m-0 max-w-[900px] text-[clamp(2.7rem,6vw,5.6rem)] leading-[0.95] tracking-[-0.06em]">
              {t("landingPage.hero.title.line1")}
              <span className="text-[var(--color-owner)]">
                {t("landingPage.hero.title.highlight")}
              </span>
              <br />
              {t("landingPage.hero.title.line2")}
            </h1>

            <p className="mt-[28px] max-w-[720px] text-[color-mix(in_srgb,var(--color-text)_78%,transparent)] text-[1.05rem]">
              {t("landingPage.hero.text")}
            </p>

            <div className="mt-[34px] flex flex-wrap gap-[14px]">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-[10px] font-bold transition-[transform,box-shadow] duration-200 ease-in-out py-[13px] px-[20px] bg-[var(--color-owner)] !text-[#101010] shadow-[0_0_24px_color-mix(in_srgb,var(--color-owner)_35%,transparent)] hover:-translate-y-[2px]"
              >
                {t("landingPage.hero.actions.primary")}
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center justify-center rounded-[10px] font-bold transition-[transform,box-shadow] duration-200 ease-in-out py-[13px] px-[20px] border border-[var(--color-overlay-border)] !text-[var(--color-text)] bg-[color-mix(in_srgb,var(--color-side-bg)_80%,transparent)] hover:-translate-y-[2px]"
              >
                {t("landingPage.hero.actions.secondary")}
              </Link>
            </div>
          </div>

          <div className="border border-[var(--color-overlay-border)] rounded-[22px] bg-[color-mix(in_srgb,var(--color-side-bg)_88%,transparent)] shadow-[0_22px_80px_rgba(0,0,0,0.22)] overflow-hidden">
            <div className="h-[44px] flex items-center gap-[8px] px-[16px] border-b border-[var(--color-overlay-border)]">
              <span className="w-[11px] h-[11px] rounded-full bg-[var(--color-owner)] opacity-80"></span>
              <span className="w-[11px] h-[11px] rounded-full bg-[var(--color-owner)] opacity-80"></span>
              <span className="w-[11px] h-[11px] rounded-full bg-[var(--color-owner)] opacity-80"></span>
            </div>

            <div className="p-[18px] grid grid-cols-[repeat(4,minmax(150px,1fr))] gap-[14px] overflow-x-auto">
              {previewColumns.map((column, index) => {
                const columnClass =
                  index === 1
                    ? "border-l-4 border-l-[#3b82f6]"
                    : index === 2
                    ? "border-l-4 border-l-[#f59e0b]"
                    : index === 3
                    ? "border-l-4 border-l-[#10b981]"
                    : "";

                return (
                  <div
                    key={column.title}
                    className="min-h-[260px] rounded-[14px] p-[12px] bg-[var(--color-category-bg)]"
                  >
                    <h3 className="m-0 mb-[12px] text-[0.78rem] tracking-[0.12em]">
                      {column.title}
                    </h3>
                    {column.tasks.map((task) => (
                      <div
                        key={task}
                        className={`mb-[10px] p-[12px] rounded-[12px] bg-[var(--color-overlay-bg)] border border-[var(--color-overlay-border)] text-[0.9rem] ${columnClass}`}
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

        <section className="mx-[7vw] mb-[70px] max-[680px]:mx-[18px]">
          <div className="max-w-[760px] mb-[24px]">
            <p className="m-0 mb-[12px] text-[var(--color-owner)] text-[0.78rem] font-extrabold tracking-[0.18em] uppercase">
              {t("landingPage.featuresSection.eyebrow")}
            </p>
            <h2 className="m-0 mb-[12px] text-[clamp(2rem,4vw,3.4rem)] tracking-[-0.04em]">
              {t("landingPage.featuresSection.title")}
            </h2>
            <p className="text-[color-mix(in_srgb,var(--color-text)_72%,transparent)]">
              {t("landingPage.featuresSection.description")}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] max-[980px]:grid-cols-2 max-[680px]:grid-cols-1 gap-[18px]">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="border border-[var(--color-overlay-border)] rounded-[18px] p-[22px] bg-[color-mix(in_srgb,var(--color-side-bg)_88%,transparent)]"
              >
                <h3 className="m-0 mb-[8px]">{feature.title}</h3>
                <p className="m-0 text-[color-mix(in_srgb,var(--color-text)_72%,transparent)]">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-[7vw] mb-[70px] max-[680px]:mx-[18px]">
          <div className="max-w-[760px] mb-[24px]">
            <p className="m-0 mb-[12px] text-[var(--color-owner)] text-[0.78rem] font-extrabold tracking-[0.18em] uppercase">
              {t("landingPage.workflowSection.eyebrow")}
            </p>
            <h2 className="m-0 mb-[12px] text-[clamp(2rem,4vw,3.4rem)] tracking-[-0.04em]">
              {t("landingPage.workflowSection.title")}
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] max-[980px]:grid-cols-2 max-[680px]:grid-cols-1 gap-[16px]">
            {workflow.map((step) => (
              <div
                key={step.number}
                className="border border-[var(--color-overlay-border)] rounded-[18px] p-[22px] bg-[color-mix(in_srgb,var(--color-side-bg)_88%,transparent)]"
              >
                <span className="inline-block mb-[18px] text-[var(--color-owner)] font-black text-[1.3rem]">
                  {step.number}
                </span>
                <h3 className="m-0 mb-[8px]">{step.title}</h3>
                <p className="m-0 text-[color-mix(in_srgb,var(--color-text)_72%,transparent)]">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center mx-[7vw] mb-[70px] max-[680px]:mx-[18px] border border-[var(--color-overlay-border)] rounded-[18px] p-[22px] bg-[color-mix(in_srgb,var(--color-side-bg)_88%,transparent)]">
          <h2 className="m-0 mb-[12px] text-[clamp(2rem,4vw,3.4rem)] tracking-[-0.04em]">
            {t("landingPage.cta.title")}
          </h2>
          <p className="text-[color-mix(in_srgb,var(--color-text)_72%,transparent)]">
            {t("landingPage.cta.text")}
          </p>
          <Link
            to="/docs"
            className="inline-flex items-center justify-center rounded-[10px] font-bold transition-[transform,box-shadow] duration-200 ease-in-out py-[13px] px-[20px] bg-[var(--color-owner)] !text-[#101010] shadow-[0_0_24px_color-mix(in_srgb,var(--color-owner)_35%,transparent)] hover:-translate-y-[2px] mt-[16px]"
          >
            {t("landingPage.cta.button")}
          </Link>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;