import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "./_components/nav";
import { TEAM, TEAM_DATALIST_ID } from "./lib/team";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Framework · Team Hub",
  description: "Internal team hub — pipeline, EOD, SOPs, suggestions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        {/* Global team-member autocomplete — any input with list="team-members" gets it */}
        <datalist id={TEAM_DATALIST_ID}>
          {TEAM.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </body>
    </html>
  );
}
