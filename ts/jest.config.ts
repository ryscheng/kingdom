import type { Config } from "jest";

const config: Config = {
  //verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/archive/", "/src/"],
};

export default config;
