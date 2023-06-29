import presets from "ts-jest/presets/index.js";

export default {
  ...presets.defaultsESM,
  setupFiles: ["./test/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.test.json",
        babelConfig: {
          plugins: ["babel-plugin-transform-vite-meta-env"],
        },
      },
    ],
  },
};
