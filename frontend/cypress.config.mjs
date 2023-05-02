import { promisify } from "util";
import { exec as exec_original } from "child_process";
import { defineConfig } from "cypress";

const exec = promisify(exec_original);

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    supportFile: false,
    baseUrl: "http://localhost:4173",
    setupNodeEvents(on) {
      on("task", {
        resetDatabase: () => exec("python cypress/backend.py reset"),
        clearDatabase: () => exec("python cypress/backend.py clear"),
      });
    },
  },
});
