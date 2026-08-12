import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ÁQUILA',
  description: 'Sistema de Gestão de Ocorrências Espaciais',
};

// Aplica o tema salvo antes do primeiro paint (evita flash claro→escuro).
// Roda fora do React de propósito: precisa executar antes da hidratação.
const themeInitScript = `(function(){try{var t=localStorage.getItem('aquila-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
