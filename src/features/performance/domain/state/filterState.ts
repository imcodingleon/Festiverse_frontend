export interface FilterState {
  keyword: string;
  region: string;
  startDate: string;
  endDate: string;
  genre: string;
  selectedDate: string;
  calendarYear: number;
  calendarMonth: number;
  page: number;
  size: number;
}

const now = new Date();

export const initialFilterState: FilterState = {
  keyword: "",
  region: "",
  startDate: "",
  endDate: "",
  genre: "",
  selectedDate: "",
  calendarYear: now.getFullYear(),
  calendarMonth: now.getMonth(),
  page: 1,
  size: 100,
};
