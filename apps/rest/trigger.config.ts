import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  dirs: ["./src/trigger"],
  project: "proj_mpzjhemzhuovxmpaeytq",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600, // 1 hour
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000, // 1 second
      maxTimeoutInMs: 10000, // 10 seconds
      factor: 2,
      randomize: true,
    },
  },
});
