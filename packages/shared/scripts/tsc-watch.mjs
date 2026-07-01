import { execSync } from "node:child_process";

execSync("tsc", { stdio: "inherit" });
