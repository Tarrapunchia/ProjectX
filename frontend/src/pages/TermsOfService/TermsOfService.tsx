import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, BookOpen, Database, AlertTriangle } from 'lucide-react';

const TermsOfService: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-screen w-full bg-main-bg-color text-text-main overflow-y-auto custom-scrollbar p-8 md:p-16">
            <div className="max-w-4xl mx-auto space-y-10 w-full bg-side-bg-color p-8 md:p-12 rounded-xl border border-overlay-border-color shadow-lg">
                
                <div className="border-b border-overlay-border-color pb-6">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {t("terms.title")}
                    </h1>
                    <p className="text-zinc-400">
                        {t("terms.last_updated")}: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-owner-color mb-2">
                        <BookOpen size={24} />
                        <h2 className="text-2xl font-semibold">{t("terms.educational.title")}</h2>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-light">
                        {t("terms.educational.content")}
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-owner-color mb-2">
                        <Database size={24} />
                        <h2 className="text-2xl font-semibold">{t("terms.data_usage.title")}</h2>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-light">
                        {t("terms.data_usage.content")}
                    </p>
                </section>

                <section className="space-y-4 bg-red-500/10 border border-red-500/20 p-6 rounded-lg">
                    <div className="flex items-center gap-3 text-red-500 mb-2">
                        <AlertTriangle size={24} />
                        <h2 className="text-2xl font-semibold">{t("terms.warning.title")}</h2>
                    </div>
                    <p className="text-red-400/90 leading-relaxed font-light">
                        {t("terms.warning.content")}
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-owner-color mb-2">
                        <ShieldAlert size={24} />
                        <h2 className="text-2xl font-semibold">{t("terms.privacy.title")}</h2>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-light">
                        {t("terms.privacy.content")}
                    </p>
                </section>

            </div>
        </div>
    );
};

export default TermsOfService;