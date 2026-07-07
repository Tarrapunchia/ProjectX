import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from '../../utilities/WebSocketContext';
import CONSTS from '../../data/consts';

export interface ExtraProfileData 
{
    jobQualifier: string;
    phone: string;
    city: string;
    address: string;
    cap: string;
    state: string;
    avatarFile?: File | null;
}

interface Props 
{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ExtraProfileData) => void;
}

const STEPS = 
[
    { id: "avatarFile", type: "avatar" },
    { id: "jobQualifier", type: "text" },
    { id: "phone", type: "tel" },
    { id: "city", type: "text" },
    { id: "address", type: "text" },
    { id: "cap", type: "text" },
    { id: "state", type: "text" },
];

export default function ProfileCompletionModal({ isOpen, onClose, onSave }: Props) 
{
	const { activeUser } = useWebSocket();
    const { t } = useTranslation();
    const [shouldRender, setShouldRender] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    
    const [formData, setFormData] = useState<ExtraProfileData>({
        jobQualifier: "",
        phone: "",
        city: "",
        address: "",
        cap: "",
        state: "",
        avatarFile: null,
    });

    const fileRef = useRef<HTMLInputElement | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
	const avatarUrl = activeUser 
			? `${CONSTS.BE}/api/v1/users/${activeUser.id}/avatar?t=${new Date().getTime()}`
			: '/placeholder-avatar.png';

    useEffect(() => 
    {
        let timer: any;
        if (isOpen) {
            timer = setTimeout(() => {
                setShouldRender(true);
            }, 1000);
        } else {
            setShouldRender(false);
            setIsExiting(false);
            setCurrentStep(0);
            setAvatarPreview(undefined);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    const startCloseAnimation = () => 
    {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onSave(formData);
            startCloseAnimation();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleAvatarFile = (f?: File | null) => 
    {
        if (!f) return;
        const url = URL.createObjectURL(f);
        setAvatarPreview(url);
        setFormData(prev => ({ ...prev, avatarFile: f }));
    };

    if (!isOpen || !shouldRender) return null;

    const currentStepData = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500
        ${isExiting ? "opacity-0" : "opacity-100"}
        `}>
        
        <div 
            className={`absolute inset-0 bg-overlay-bg-color/80 backdrop-blur-sm transition-opacity duration-500
            ${isExiting ? "opacity-0" : "opacity-100"}
            `}
        />

        <style>{`
            @keyframes customFadeIn {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes customFadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
            }
            .animate-in { animation: customFadeIn 0.5s ease-out forwards; }
            .animate-out { animation: customFadeOut 0.3s ease-in forwards; }
            .step-transition { transition: all 0.3s ease-in-out; }
        `}</style>

        <div 
            className={`relative bg-overlay-bg-color border border-overlay-border-color w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden
            ${isExiting ? "animate-out" : "animate-in"}
            `}
        >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-bg-color to-category-bg-color p-4 text-white text-center border-b border-overlay-border-color">
                <div className="flex justify-end items-up">
                    <button
                        onClick={startCloseAnimation}
                        className="border border-category-bg-color bg-side-bg-color 
                                rounded-full w-8 h-8 flex items-center justify-center
                                text-text-main cursor-pointer hover:scale-105 hover:border-text-main">
                        ✕
                    </button>
                </div>
                <div className="flex items-center justify-center mb-1">
                    <h1 className="bg-gradient-to-r from-pink-400 via-sky-400 to-purple-500 text-3xl font-bold tracking-tight text-text-main bg-clip-text text-transparent">{t("profile_completion.welcome")}</h1>
                </div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight">
                    {t("profile_completion.title")}
                </h2>
                <p className="text-zinc-500 text-sm mt-1 italic">
                    {t("profile_completion.subtitle")}
                </p>
                <p className="text-zinc-500 text-sm mt-1 italic">
                    {t("profile_completion.step_counter", { current: currentStep + 1, total: STEPS.length })}
                </p>
            </div>

            <div className="p-8">
                {/* Progress Bar */}
                <div className="w-full bg-zinc-500 h-1 mb-8 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-owner-color transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                <div className="flex flex-col gap-4 min-h-[140px] step-transition">
                    <label className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                        {t(`profile_completion.labels.${currentStepData.id}`)}
                    </label>
                    
                    {currentStepData.type === "avatar" ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-2">
                            <div className="relative w-24 h-24 group">
                                <img 
                                    src={avatarPreview || avatarUrl}
                                    alt="avatar" 
                                    className="w-24 h-24 rounded-full object-cover border-2 border-overlay-border-color" 
                                />
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-xs font-bold text-white">Upload</span>
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                                />
                            </div>
                            <p className="text-xs text-zinc-400 italic">{t("profile_completion.avatar_click_info")}</p>
                        </div>
                    ) : currentStepData.type === "textarea" ? (
                        <textarea 
                            rows={4}
                            autoFocus
                            placeholder={t(`profile_completion.placeholders.${currentStepData.id}`)}
                            className="text-white p-3 rounded-lg bg-transparent border border-overlay-border-color focus:border-owner-color focus:ring-1 focus:ring-owner-color outline-none transition-all resize-none placeholder:text-zinc-400"
                            value={formData[currentStepData.id as keyof ExtraProfileData] as string}
                            onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                        />
                    ) : (
                        <input 
                            type={currentStepData.type}
                            autoFocus
                            placeholder={t(`profile_completion.placeholders.${currentStepData.id}`)}
                            className="text-white p-3 rounded-lg bg-transparent border border-overlay-border-color focus:border-owner-color focus:ring-1 focus:ring-owner-color outline-none transition-all placeholder:text-zinc-400"
                            value={formData[currentStepData.id as keyof ExtraProfileData] as string}
                            onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                    )}
                </div>

                <div className="flex items-center justify-between mt-10 gap-4">
                    {currentStep === 0 ? (
                        <> </>
                    ) : (
                        <button 
                            onClick={handleBack} 
                            className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main"
                        >
                            {t("profile_completion.btn_back")}
                        </button>
                    )}
                    
                    <button 
                        onClick={handleNext}
                        className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main shadow-lg ml-auto"
                    >
                        {isLastStep ? t("profile_completion.btn_save") : (currentStepData.type === "avatar" && !avatarPreview ? t("profile_completion.btn_skip") : t("profile_completion.btn_next"))}
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
}