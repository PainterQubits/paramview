import { promisify } from "util";
import { exec as exec_original } from "child_process";
import { defineConfig } from "cypress";

const BACKEND_COMMAND = "python cypress/backend.py";
const exec = promisify(exec_original);

export default defineConfig({
  // screenshotOnRunFailure: false,
  // video: false,
  e2e: {
    baseUrl: "http://localhost:4173",
    setupNodeEvents(on) {
      on("task", {
        "db:reset": ({ single = false, long = false } = { single: false, long: false }) =>
          exec(
            `${BACKEND_COMMAND} reset` +
              (single ? " --single" : "") +
              (long ? " --long" : ""),
          ),
        "db:clear": () => exec(`${BACKEND_COMMAND} clear`),
        "db:commit": () => exec(`${BACKEND_COMMAND} commit`),
      });
    },
  },
});
