"use client";

export type ABGroup = "A" | "B";

export function getABGroup(): ABGroup {
  if (typeof window === "undefined") return "A";
  const anonId = localStorage.getItem("festiverse_anon_id");
  if (!anonId) return "A";
  const lastChar = anonId.slice(-1);
  const num = parseInt(lastChar, 16);
  return isNaN(num) || num % 2 !== 0 ? "A" : "B";
}
