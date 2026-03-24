import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:4000",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },

  /* FE + BE 서버가 이미 실행 중인 상태에서 테스트 */
  webServer: [
    {
      command: "npm run dev",
      port: 4000,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
