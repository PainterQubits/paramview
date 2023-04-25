import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
    "^test-utils": "<rootDir>/test-utils",
  },
  setupFilesAfterEnv: ["<rootDir>/setup-tests.ts"],
};

export default config;
