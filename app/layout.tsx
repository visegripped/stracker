import type { Metadata } from 'next';
import Providers from './providers';
import { THEME_BOOTSTRAP_SCRIPT } from '@utilities/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stracker',
  description: 'Stock tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
