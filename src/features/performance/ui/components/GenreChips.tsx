import { Chip } from "@/ui/components/Chip";
import { GENRES } from "@/features/performance/domain/model/genre";

interface GenreChipsProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
}

export function GenreChips({ selectedGenre, onSelect }: GenreChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-wrap">
      {GENRES.map((g) => (
        <Chip
          key={g.code}
          label={g.label}
          active={selectedGenre === g.code}
          onClick={() => onSelect(g.code)}
        />
      ))}
    </div>
  );
}
