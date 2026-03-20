import { Chip } from "@/ui/components/Chip";
import { REGIONS } from "@/features/performance/domain/model/region";

interface RegionChipsProps {
  selectedRegion: string;
  onSelect: (region: string) => void;
}

export function RegionChips({ selectedRegion, onSelect }: RegionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 lg:flex-wrap">
      {REGIONS.map((r) => (
        <Chip
          key={r.code}
          label={r.label}
          active={selectedRegion === r.code}
          onClick={() => onSelect(r.code)}
        />
      ))}
    </div>
  );
}
