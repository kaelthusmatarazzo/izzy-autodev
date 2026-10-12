import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Izzy Auto-Dev | A IA que se constrói sozinha',
  description: 'Um chat de inteligência artificial autônomo com Gemini Pro que cria código e evolui seu próprio frontend e backend em tempo real.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-pink-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
