import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"
import typography from "@tailwindcss/typography"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "120px",
            screens: {
                "2xl": "1440px",
            },
        },
        extend: {
            colors: {
                navy: "var(--navy)",
                white: "var(--white)",
                "off-white": "var(--off-white)",
                teal: "var(--teal)",
                "teal-dark": "var(--teal-dark)",
                "cool-gray": "var(--cool-gray)",
                "light-gray": "var(--light-gray)",
                purple: "var(--purple)",
                gold: "var(--gold)",
                green: "var(--green)",
                red: "var(--red)",
                amber: "var(--amber)",
                "amber-light": "#FEF3C7",
                "light-green": "#D1FAE5",
            },
            fontFamily: {
                sans: ["var(--font-rethink-sans)", "sans-serif"],
                serif: ["var(--font-merriweather)", "serif"],
                heading: ["var(--font-rethink-sans)", "sans-serif"],
                body: ["var(--font-merriweather)", "serif"],
            },
            borderRadius: {
                sharp: "var(--radius-sharp)",
                pill: "var(--radius-pill)",
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
                button: "var(--shadow-button)",
                footer: "var(--shadow-footer)",
                card: "var(--shadow-sm)",
                popup: "var(--shadow-lg)",
                hover: "var(--shadow-md)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate, typography],
} satisfies Config

export default config
