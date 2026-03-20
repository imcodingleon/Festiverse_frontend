"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/ui/components/Icon";

const navItems = [
  { href: "/", icon: "home", label: "홈" },
  { href: "/favorites", icon: "favorite", label: "즐겨찾기" },
  { href: "/mypage", icon: "person", label: "마이페이지" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-card-border px-6 py-3 z-50 lg:hidden">
      <div className="max-w-[375px] mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                isActive ? "text-primary" : "text-subtext"
              }`}
            >
              <Icon name={item.icon} filled={isActive} />
              <span
                className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
