export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
			extend: {
			keyframes: 
			{
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				zoomIn: {
					'0%': { transform: 'scale(0.85)' },
					'100%': { transform: 'scale(1)' },
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				zoomOut: {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(0.85)' },
				},
			},
			animation: {
				fadeZoomIn: 'fadeIn 0.25s ease-out, zoomIn 0.25s ease-out',
				fadeZoomOut: 'fadeOut 0.25s ease-out, zoomOut 0.25s ease-out',
			},
			colors: {
				'bg-color': '#242424',
				'category-bg-color': '#414141',
				'overlay-bg-color': '#1a1a1a',
				'overlay-border-color': '#606060',
				'owner-color': 'rgb(172, 134, 0)',
			},
		},
	},
	plugins: [],
}