'use client';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full font-sans antialiased text-slate-900">
        <div className="min-h-full flex flex-col">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}