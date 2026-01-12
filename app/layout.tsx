import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { AppWrapper } from '@/components/navigation/AppWrapper';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'BookShelf v3 - Votre bibliothèque personnelle',
    template: '%s | BookShelf',
  },
  description: 'Gérez, notez et partagez vos lectures. Ajoutez des livres via leur code ISBN.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AppWrapper>{children}</AppWrapper>
        </Providers>
      </body>
    </html>
  );
}
