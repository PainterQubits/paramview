import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: { "@/(.*)": "<rootDir>/src/$1" },
  setupFiles: ["<rootDir>/setupTests.ts"],
};

export default config;
