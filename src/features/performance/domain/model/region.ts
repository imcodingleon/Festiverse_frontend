export interface Region {
  code: string;
  label: string;
}

export const REGIONS: Region[] = [
  { code: "", label: "전체" },
  { code: "서울", label: "서울" },
  { code: "경기", label: "경기" },
  { code: "인천", label: "인천" },
  { code: "부산", label: "부산" },
  { code: "대구", label: "대구" },
  { code: "광주", label: "광주" },
  { code: "대전", label: "대전" },
  { code: "울산", label: "울산" },
  { code: "세종", label: "세종" },
  { code: "충북", label: "충북" },
  { code: "충남", label: "충남" },
  { code: "전북", label: "전북" },
  { code: "전남", label: "전남" },
  { code: "경북", label: "경북" },
  { code: "경남", label: "경남" },
  { code: "제주", label: "제주" },
  { code: "강원", label: "강원" },
];
