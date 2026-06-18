import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SorobanSplit Dashboard',
  description: 'Manage Soroban Split contributor weights and contract routing on Stellar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
