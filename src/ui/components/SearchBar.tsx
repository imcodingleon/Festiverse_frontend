"use client";

import { Icon } from "./Icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "검색어 입력",
}: SearchBarProps) {
  return (
    <div className="relative">
      <Icon
        name="search"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        placeholder={placeholder}
        className={`w-full bg-card-light border border-card-border rounded-lg py-3 pl-10 ${value && onClear ? "pr-10" : "pr-4"} focus:ring-1 focus:ring-primary focus:border-primary text-sm text-text-main placeholder-subtext/60 shadow-sm`}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text-main transition-colors"
        >
          <Icon name="close" className="text-sm" />
        </button>
      )}
    </div>
  );
}
