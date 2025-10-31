import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Confidential Legal Fee Allocation - FHEVM SDK Demo',
  description: 'Next.js example demonstrating FHEVM SDK with confidential legal fee allocation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-primary-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">
              Confidential Legal Fee Allocation
            </h1>
            <p className="text-primary-100 text-sm">
              Powered by FHEVM SDK & Zama
            </p>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-100 mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Built with FHEVM SDK - Framework-agnostic confidential computing</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
