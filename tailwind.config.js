export default {
	darkMode: 'selector',
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
			extend: {
			keyframes: 
			{
				fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
				zoomIn: { '0%': { transform: 'scale(0.85)' }, '100%': { transform: 'scale(1)' }	},
				fadeOut: { '0%': { opacity: '1' }, '100%': { opacity: '0' }	},
				zoomOut: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(0.85)' } },
			},
			animation: {
				fadeZoomIn: 'fadeIn 0.25s ease-out, zoomIn 0.25s ease-out',
				fadeZoomOut: 'fadeOut 0.25s ease-out, zoomOut 0.25s ease-out',
			},
			colors: {
				'bg-color': 'var(--color-bg)',
				'side-bg-color': 'var(--color-side-bg)',
				'category-bg-color': 'var(--color-category-bg)',
				'overlay-bg-color': 'var(--color-overlay-bg)',
				'overlay-border-color': 'var(--color-overlay-border)',
				'border-focus': 'var(--color-focus-border)',
				'owner-color': 'var(--color-owner)',
				'text-main': 'var(--color-text)',
				'text-category': 'var(--color-category-text)',
				'progressbar-bg': 'var(--color-progressbar-bg)',
				'text-login': 'var(--color-text-login)'
			},
			backgroundImage: {
				'gradient-color': "linear-gradient(45deg, var(--color-category-gradient-start), var(--color-category-gradient-end))",
			}
		},
	},
	plugins: [],
}