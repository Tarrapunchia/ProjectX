// import React, { useEffect, useState } from 'react';
// import { FiSun, FiMoon } from 'react-icons/fi';

// function ThemeToggle() {
// 	const [isDark, setIsDark] = useState(() => 
// 		document.documentElement.classList.contains('dark')	
// 	);

// 	useEffect(() => {
// 		if (isDark) {
// 			document.documentElement.classList.add('dark');
// 			localStorage.setItem('theme', 'dark');
// 		}
// 		else {
// 			document.documentElement.classList.remove('dark');
// 			localStorage.setItem('theme', 'light');
// 		}
// 	}, [isDark]);

// 	return (
// 		<button	
// 			onClick={() => setIsDark(!isDark)}
// 			className="fixed top-5 right-95 p-3 rounded-full bg-category-bg-color shadow-lg hover:scale-110 transition-all duration-300 border border-overlay-border-color cursor-pointer focus:outline-none hover:border-border-focus"
// 			aria-label="Toggle Theme"
// 		>
// 			{isDark ? (
// 				<FiSun size={20} className="text-yellow-400 animate-fadeZoomIn" />
// 			) : (
// 				<FiMoon size={20} className="text-slate-700 animate-fadeZoomIn" />
// 			)}
// 		</button>
// 	);
// }

// export default ThemeToggle;