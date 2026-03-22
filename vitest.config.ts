import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/infrastructure/tracking/__tests__/setup.ts"],
    include: ["src/infrastructure/tracking/__tests__/**/*.test.{ts,tsx}"],
    /** trackingState 모듈 공유 — 파일 간 병렬 실행 시 상태 경합 방지 */
    fileParallelism: false,
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
