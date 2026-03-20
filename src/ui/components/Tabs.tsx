"use client";

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  activeValue: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, activeValue, onChange }: TabsProps) {
  return (
    <div className="flex p-1 bg-surface rounded-lg border border-border-light">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeValue === tab.value
              ? "bg-secondary text-white rounded-lg shadow-sm font-bold"
              : "text-subtext"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
