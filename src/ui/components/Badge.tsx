interface BadgeProps {
  label: string;
  variant?: "default" | "muted";
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <div
      className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
        variant === "muted"
          ? "bg-subtext/20 text-subtext"
          : "bg-secondary text-white"
      }`}
    >
      {label}
    </div>
  );
}
