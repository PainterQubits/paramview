import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.(t|j)sx?$": "@swc/jest" },
  moduleNameMapper: { "@/(.*)": "<rootDir>/src/$1" },
};

export default config;
