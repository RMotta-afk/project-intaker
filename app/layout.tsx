import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Intaker",
  description: "Review inbound project requests and AI-assisted triage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
