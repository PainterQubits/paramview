import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
    "^test-utils": "<rootDir>/test-utils",
  },
  setupFilesAfterEnv: ["<rootDir>/setup-tests.ts"],
};

export default config;
