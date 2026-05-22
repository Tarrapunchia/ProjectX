import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

function ThemeToggle() {
	const [isDark, setIsDark] = useState(() => 
		document.documentElement.classList.contains('dark')	
	);

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		}
		else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}, [isDark]);

	return (
		<button	
			onClick={() => setIsDark(!isDark)}
			className="p-2 w-full h-11 rounded-full bg-category-bg-color shadow-lg hover:scale-105 transition-all duration-300 border border-overlay-border-color cursor-pointer focus:outline-none hover:border-owner-color"
			aria-label="Toggle Theme"
		>
			<div className="relative w-full h-full">
				<div 
					className={`absolute flex items-center justify-center w-7 h-7 rounded-full transition-all duration-500 ease-in-out
						${isDark 
							? 'left-0 translate-x-0' 
							: 'left-full -translate-x-full'
						}`}
				>
					{isDark ? (
						<FiSun size={20} className="text-yellow-400" />
					) : (
						<FiMoon size={20} className="text-slate-700" />
					)}
				</div>
			</div>
		</button>
	);
}

export default ThemeToggle;