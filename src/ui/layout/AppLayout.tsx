"use client";

import { Footer } from "./Footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-light text-text-main relative min-h-screen flex flex-col">
      <div className="stars-overlay" />
      <div className="flex-1" style={{ zoom: 0.85 }}>{children}</div>
      <Footer />
    </div>
  );
}
