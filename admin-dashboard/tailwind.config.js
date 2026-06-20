/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#C62828',
                    primaryLight: '#FFEBEE',
                    primaryDark: '#B71C1C',
                    accent: '#000000',
                    background: '#FFFFFF',
                    surface: '#FBFBFB',
                    textPrimary: '#1A1A1A',
                    textSecondary: '#757575',
                },
                primary: {
                    50: '#FFEBEE',
                    100: '#FFCDD2',
                    200: '#EF9A9A',
                    300: '#E57373',
                    400: '#EF5350',
                    500: '#C62828',
                    600: '#E53935',
                    700: '#D32F2F',
                    800: '#C62828',
                    900: '#B71C1C',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'bounce-slow': 'bounce 3s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}
