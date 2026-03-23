"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/ui/components/SearchBar";
import { RegionChips } from "./RegionChips";
import { GenreChips } from "./GenreChips";
import { useFilter } from "@/features/performance/application/hooks/useFilter";
import { useSearchPageTracking } from "@/infrastructure/tracking/useSearchPageTracking";

export function FilterSection() {
  const { filters, setKeyword, applyFilters, resetAllFilters } = useFilter();
  const {
    trackFilterOptionToggled,
    trackFilterApplyButtonClicked,
    trackSearchQuerySubmitted,
  } = useSearchPageTracking();
  const [searchInput, setSearchInput] = useState(filters.keyword);
  const [localRegion, setLocalRegion] = useState(filters.region);
  const [localGenre, setLocalGenre] = useState(filters.genre);

  /* 외부 jotai 필터(리셋 등)와 칩·검색 입력 로컬 상태 동기화 */
  /* eslint-disable react-hooks/set-state-in-effect -- controlled sync from global filter atom */
  useEffect(() => {
    setLocalRegion(filters.region);
    setLocalGenre(filters.genre);
  }, [filters.region, filters.genre]);

  useEffect(() => {
    setSearchInput(filters.keyword);
  }, [filters.keyword]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleApply = () => {
    trackFilterApplyButtonClicked(localRegion, localGenre);
    applyFilters({
      keyword: searchInput,
      region: localRegion,
      genre: localGenre,
    });
  };

  const handleReset = () => {
    resetAllFilters();
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setKeyword("");
  };

  const handleRegionSelect = (code: string) => {
    trackFilterOptionToggled("region", code, localRegion !== code);
    setLocalRegion(code);
  };

  const handleGenreSelect = (code: string) => {
    trackFilterOptionToggled("genre", code, localGenre !== code);
    setLocalGenre(code);
  };

  return (
    <section className="space-y-4 pt-2">
      <h3 className="text-lg font-bold font-display text-primary">공연 필터</h3>

      <div className="lg:hidden">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => {
            trackSearchQuerySubmitted(searchInput, null, "filter_section");
            setKeyword(searchInput);
          }}
          onClear={handleSearchClear}
          placeholder="검색어 입력"
        />
      </div>

      <RegionChips selectedRegion={localRegion} onSelect={handleRegionSelect} />
      <GenreChips selectedGenre={localGenre} onSelect={handleGenreSelect} />

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleReset}
          className="flex-1 py-2 lg:py-2.5 text-sm lg:text-[15px] text-subtext border border-card-border rounded-lg hover:bg-surface transition-colors"
        >
          취소하기
        </button>
        <button
          onClick={handleApply}
          className="flex-1 py-2 lg:py-2.5 text-sm lg:text-[15px] text-white bg-primary rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          필터 적용하기
        </button>
      </div>
    </section>
  );
}
