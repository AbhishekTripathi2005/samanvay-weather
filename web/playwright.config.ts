import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: "msedge",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "edge",
      use: { channel: "msedge" },
    },
  ],
});
