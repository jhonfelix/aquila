import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Mesma fonte usada pelo Django Admin (tema Unfold, que carrega Inter via
// @font-face próprio) — padroniza a tipografia entre os dois front-ends.
// next/font faz o self-host em build time, sem requisição externa em runtime.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Só para dado tabular (números de processo, timestamps, códigos) — todo o
// resto do app (headings, labels, nav) usa a sans-serif padrão acima.
const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbmono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ÁQUILA',
  description: 'Sistema de Gestão de Ocorrências Espaciais',
};

// Aplica o tema salvo antes do primeiro paint (evita flash claro→escuro).
// Roda fora do React de propósito: precisa executar antes da hidratação.
const themeInitScript = `(function(){try{var t=localStorage.getItem('aquila-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${jbMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
