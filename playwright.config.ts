import { defineConfig, devices } from "@playwright/test"
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:4173", trace: "retain-on-failure" },
  webServer: { command: "npm run preview -- --host 127.0.0.1", port: 4173, reuseExistingServer: !process.env.CI },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
})
