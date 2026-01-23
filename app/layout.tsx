import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { validateEnv } from '@/lib/env';

// const inter = Inter({ subsets: ['latin'] });

// Validate environment variables on server startup
if (typeof window === 'undefined') {
  validateEnv();
}

export const metadata: Metadata = {
  title: 'Tixa Logger Dashboard',
  description: 'Observability dashboard for centralized workflow logging',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
