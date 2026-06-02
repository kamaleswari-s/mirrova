/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#EFE9E0',
        dutch: '#EEFFBB',
        'olive-dark': '#1A2118',
        'olive-mid': '#313B2F',
        teal: '#0F9E99',
        orange: '#FBA002',
        wine: '#722F37',
        purple: '#615091',
        forest: '#38683D',
        coral: '#F66435',
        'text-dark': '#1A2118',
        'text-light': '#F2E8D1',
        beige: '#F2E8D1',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lora: ['Lora', 'serif'],
      },
      borderRadius: {
        btn: '12px',
        card: '16px',
      }
    }
  },
  plugins: []
}