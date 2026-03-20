interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 lg:px-[18px] lg:py-[9px] rounded-full text-xs lg:text-[13px] font-medium shrink-0 transition-colors ${
        active
          ? "bg-primary text-white font-black shadow-md shadow-primary/20"
          : "bg-card-light text-subtext border border-card-border"
      }`}
    >
      {label}
    </button>
  );
}
