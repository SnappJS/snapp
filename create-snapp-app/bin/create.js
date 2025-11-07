#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const appName = process.argv[2];

  if (!appName) {
    console.log(`
❌ App name is required!

Usage:
  npm create snapp-app <app-name>

Example:
  npm create snapp-app my-snapp-app
`);
    process.exit(1);
  }

  const targetPath = path.join(process.cwd(), appName);
  const templatePath = path.join(__dirname, "../template");

  if (fs.existsSync(targetPath)) {
    console.log("⚠️  Folder name already exists!");
    process.exit(1);
  }

  if (!fs.existsSync(templatePath)) {
    console.log("❌ Template folder not found!");
    process.exit(1);
  }

  fs.mkdirSync(targetPath, { recursive: true });
  fs.cpSync(templatePath, targetPath, { recursive: true });

  console.log(`
Successfully created Snapp app!

Next:
  cd ${appName}

  npm install
  npm run snapp
`);
} catch (error) {
  console.error("❌ Some error came up:", error.message);
  process.exit(1);
}
