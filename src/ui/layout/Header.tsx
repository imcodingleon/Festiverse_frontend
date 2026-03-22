"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/ui/components/Icon";
import { SearchBar } from "@/ui/components/SearchBar";
import { useFilter } from "@/features/performance/application/hooks/useFilter";
import { useSearchPageTracking } from "@/infrastructure/tracking/useSearchPageTracking";

export function Header() {
  const { filters, setKeyword } = useFilter();
  const { trackSearchQuerySubmitted } = useSearchPageTracking();
  const [searchInput, setSearchInput] = useState(filters.keyword);

  // filters.keyword가 외부에서 변경되면 (초기화 등) 로컬 input도 동기화
  /* eslint-disable react-hooks/set-state-in-effect -- controlled sync from global filter atom */
  useEffect(() => {
    setSearchInput(filters.keyword);
  }, [filters.keyword]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleClear = () => {
    setSearchInput("");
    setKeyword("");
  };

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md px-4 lg:px-8 pt-4 pb-2 border-b border-card-border">
      <div className="flex items-center justify-between mb-2 lg:max-w-[1600px] lg:mx-auto lg:px-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 lg:hidden">
            <Icon name="person" className="text-primary text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display leading-tight text-text-main">
              Festiverse
            </h2>
            <p className="text-xs text-accent-green font-bold">공연을 발견하자</p>
          </div>
        </div>

        <div className="hidden lg:block w-80">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => {
              trackSearchQuerySubmitted(searchInput, null, "header");
              setKeyword(searchInput);
            }}
            onClear={handleClear}
            placeholder="공연 정보 검색하세요"
          />
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-card-light text-primary border border-card-border shadow-sm lg:hidden" type="button">
          <Icon name="notifications" />
        </button>
      </div>
    </header>
  );
}
