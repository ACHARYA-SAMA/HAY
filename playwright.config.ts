import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: {
    baseURL: process.env.E2E_URL ?? "http://127.0.0.1:5174",
    headless: true,
    launchOptions:
      process.platform === "win32"
        ? {
            executablePath:
              process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
          }
        : {},
  },
});
