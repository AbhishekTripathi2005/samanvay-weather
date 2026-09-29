import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "SAMANVAY Design System — Aurora Weather-Ops",
  description: "Operational Weather Command Center Design System for MoES / NCMRWF (PS 26081)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC Inline Theme Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('samanvay-theme');
                  if (storedTheme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
