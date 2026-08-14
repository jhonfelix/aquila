/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azul Fluido — identidade primária, retintada a partir do design
        // system de referência (base 600 = #2469B0). 600 é o azul de botão
        // primário; 100/900 formam o par claro/escuro de badge e nav ativo.
        accent: {
          50: '#EEF5FC',
          100: '#D7E8F7',
          200: '#B0D0F0',
          300: '#7FB0E4',
          400: '#4E8ED2',
          500: '#2F76BE',
          600: '#2469B0',
          700: '#1B5389',
          800: '#133D65',
          900: '#0C2A47',
        },
        // Mint — acento secundário, para estados de confirmação/sucesso
        // (badge "Autenticado", ações de Confirmar/Autenticar). Base 500 =
        // #25CFAF, igual ao design system de referência.
        mint: {
          50: '#ECFDF9',
          100: '#D2F8EF',
          200: '#A6F0DF',
          300: '#6FE2CB',
          400: '#3ED0B5',
          500: '#25CFAF',
          600: '#14A98E',
          700: '#0F8571',
          800: '#0C6B5C',
          900: '#0A544A',
          950: '#062E29',
        },
        // Fundo/superfície/borda no modo claro ("atmosfera") — distintos da
        // escala neutra `slate` (mais frios/azulados que um cinza puro).
        // 50 = fundo de página, 100 = superfície secundária, 200 = borda.
        mist: {
          50: '#F4F7FB',
          100: '#EEF4FA',
          200: '#DCE5EF',
        },
        // Contraparte escura de `mist` ("espaço profundo") — fundo/superfície/
        // borda no modo escuro. 950 = fundo de página, 900 = superfície
        // (cards/popovers), 800 = superfície secundária, 700 = borda.
        space: {
          950: '#050B14',
          900: '#0A1422',
          800: '#0F1D2E',
          700: '#1B3048',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Números de processo, timestamps, tags de usuário — dado tabular.
        mono: ['var(--font-jbmono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 25, 23, 0.04), 0 1px 8px rgba(28, 25, 23, 0.04)',
        popover: '0 8px 24px rgba(28, 25, 23, 0.12)',
      },
      keyframes: {
        // Cintilar das estrelas do fundo da tela de login (Starfield) —
        // cada estrela usa duração/atraso próprios via style inline, então
        // fica fora de sincronia com as vizinhas.
        twinkle: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        // Deriva muito lenta do campo de estrelas inteiro — o "movimento
        // suave" pedido, não um parallax chamativo.
        'drift-slow': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-3%, -2%, 0)' },
        },
        // Estrela cadente: risca cruzando o céu e sumindo, depois uma pausa
        // longa até repetir. --shoot-angle/--shoot-dist são definidos por
        // elemento (ver Starfield.tsx), o keyframe é compartilhado.
        shoot: {
          '0%': { transform: 'rotate(var(--shoot-angle, -25deg)) translateX(0) scaleX(0.4)', opacity: '0' },
          '4%': { opacity: '1' },
          '16%': { transform: 'rotate(var(--shoot-angle, -25deg)) translateX(var(--shoot-dist, 260px)) scaleX(1)', opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        'drift-slow': 'drift-slow 150s ease-in-out infinite alternate',
        shoot: 'shoot 9s linear infinite',
      },
    },
  },
  plugins: [],
};
