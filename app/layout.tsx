import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LearnPathshala - Learn. Practice. Succeed.',
  description:
    'LearnPathshala is a modern learning platform for competitive exams, courses, mock tests, quizzes, and interactive learning.',
  keywords: [
    'LearnPathshala',
    'online learning',
    'competitive exams',
    'mock tests',
    'online courses',
    'quizzes',
    'SSC',
    'government exams',
    'exam preparation',
  ],
  authors: [{ name: 'LearnPathshala' }],
  creator: 'LearnPathshala',
  publisher: 'LearnPathshala',
  metadataBase: new URL('https://learnpathshala.com'),
  openGraph: {
    title: 'LearnPathshala - Learn. Practice. Succeed.',
    description:
      'Prepare for competitive exams with courses, mock tests, quizzes, and structured learning on LearnPathshala.',
    siteName: 'LearnPathshala',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}