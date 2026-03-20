export interface Genre {
  code: string;
  label: string;
}

export const GENRES: Genre[] = [
  { code: "", label: "전체" },
  { code: "EDM", label: "EDM" },
  { code: "락/인디", label: "락/인디" },
  { code: "힙합", label: "힙합" },
  { code: "재즈", label: "재즈" },
  { code: "클래식", label: "클래식" },
];
