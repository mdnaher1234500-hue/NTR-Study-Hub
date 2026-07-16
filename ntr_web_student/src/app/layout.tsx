import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/ParticleBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NTR Study Hub",
  description: "A modern student website for learning, resources, and support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col mesh-bg relative">
        <ParticleBackground />
        
        {/* Futuristic Glassmorphism Navbar */}
        <nav className="sticky top-0 z-50 glass-panel border-b-0 border-t-0 border-x-0 border-b-primary/30 py-4 px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
            <span className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              NTR Study Hub
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-sm font-bold text-gray-300 hover:text-white transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
            </a>
            <a href="/courses" className="text-sm font-bold text-gray-300 hover:text-white transition-colors relative group">
              Curriculum
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </a>
          </div>
        </nav>

        <main className="flex-1 relative z-10">{children}</main>
      </body>
    </html>
  );
}
