import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  { name: "user-service", script: "packages/user-service/index.js" },
  { name: "bot-service", script: "packages/bot-service/index.js" },
  { name: "game-service", script: "packages/game-service/index.js" },
  { name: "reporting-service", script: "packages/reporting-service/index.js" },
  { name: "api-gateway", script: "packages/api-gateway/index.js" }
];

console.log("🚀 Starting English Learning Bot monorepo backend services...");

const children = [];

// Clean up all child processes if the parent process exits
function cleanup() {
  console.log("Stopping all child processes...");
  children.forEach(({ child, name }) => {
    if (!child.killed) {
      console.log(`Killing ${name}...`);
      child.kill("SIGTERM");
    }
  });
}

process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in production launcher:", err);
  process.exit(1);
});

services.forEach(({ name, script }) => {
  const absolutePath = path.resolve(__dirname, script);
  console.log(`Starting ${name} (${script})...`);

  const child = spawn("node", [absolutePath], {
    env: { ...process.env },
    shell: false
  });

  children.push({ child, name });

  // Custom log formatting with service prefixes
  child.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      console.log(`[${name}] ${line}`);
    });
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      console.error(`[${name}] [ERROR] ${line}`);
    });
  });

  child.on("error", (err) => {
    console.error(`Failed to start ${name}:`, err);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    console.log(`${name} exited with code ${code} (signal: ${signal})`);
    // If any service exits in production, fail the launcher so Render restarts it
    process.exit(code || 1);
  });
});
