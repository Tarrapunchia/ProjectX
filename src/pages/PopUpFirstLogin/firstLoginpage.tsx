import { useState, useEffect } from "react";

export interface ExtraProfileData 
{
	jobQualifier: string;
	phone: string;
	city: string;
	address: string;
	cap: string;
	state: string;
}

interface Props 
{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExtraProfileData) => void;
}

const STEPS = 
[
	{ id: "jobQualifier", label: "Profession", placeholder: "e.g. Software Engineer, Designer...", type: "text" },
	{ id: "phone", label: "Phone Number", placeholder: "e.g. +39 333 1234567", type: "tel" },
	{ id: "city", label: "City", placeholder: "e.g. London", type: "text" },
	{ id: "address", label: "Residential Address", placeholder: "e.g. 123 Baker St", type: "text" },
	{ id: "cap", label: "Cap", placeholder: "e.g. 51234", type: "text" },
	{ id: "state", label: "Sate", placeholder: "e.g. Italy", type: "text" },
];

export default function ProfileCompletionModal({ isOpen, onClose, onSave }: Props) 
{
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
	});

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
				<h1 className="bg-gradient-to-r from-pink-400 via-sky-400 to-purple-500 text-3xl font-bold tracking-tight text-text-main bg-clip-text text-transparent">Welcome!</h1>
				</div>
				<h2 className="text-2xl font-bold text-text-main tracking-tight">
				Finalize your professional profile
				</h2>
				<p className="text-zinc-500 text-sm mt-1 italic">
				Please provide the following details to enhance your experience.
				</p>
				<p className="text-zinc-500 text-sm mt-1 italic">
				Step {currentStep + 1} of {STEPS.length}
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
				{currentStepData.label}
				</label>
				
				{currentStepData.type === "textarea" ? (
				<textarea 
					rows={4}
					autoFocus
					placeholder={currentStepData.placeholder}
					className="text-white p-3 rounded-lg bg-transparent border border-overlay-border-color focus:border-owner-color focus:ring-1 focus:ring-owner-color outline-none transition-all resize-none placeholder:text-zinc-400"
					value={formData[currentStepData.id as keyof ExtraProfileData]}
					onChange={(e) => setFormData({...formData, [currentStepData.id]: e.target.value})}
				/>
				) : (
				<input 
					type={currentStepData.type}
					autoFocus
					placeholder={currentStepData.placeholder}
					className="text-white p-3 rounded-lg bg-transparent border border-overlay-border-color focus:border-owner-color focus:ring-1 focus:ring-owner-color outline-none transition-all placeholder:text-zinc-400"
					value={formData[currentStepData.id as keyof ExtraProfileData]}
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
					Back
				</button>
				)}
				
				<button 
				onClick={handleNext}
				className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main shadow-lg ml-auto"
				>
				{isLastStep ? "Save and continue" : "Next step"}
				</button>
			</div>
			</div>
		</div>
		</div>
	);
	}