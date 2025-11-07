# Snapp Kit

> A simple build tool for Snapp Framework
> ---
>[![npm version](https://badge.fury.io/js/snapp-kit.svg)](https://www.npmjs.com/package/snapp-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with esbuild](https://img.shields.io/badge/Powered%20by-esbuild-orange)](https://esbuild.github.io/)
>
> Live server powered by [@compodoc/live-server](https://github.com/compodoc/live-server)

---

## Table of Contents

- [What is Snapp Kit?](#what-is-snapp-kit)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Troubleshooting](#troubleshooting)

---

## What is Snapp Kit?

Snapp Kit compiles your JSX/TSX files to vanilla JavaScript. Simple as that.

**What it does:**
- Compiles JSX/TSX to JavaScript (powered by esbuild)
- Live server with auto-refresh during development
- Creates page templates instantly

**What is Snapp?** - A lightweight JavaScript framework. [Learn more →](https://github.com/kigemmanuel/Snapp)

---

## Quick Start

### Recommended: Create New Project

```bash
npm create snapp-app my-app

cd my-app
npm run snapp
```

Open http://localhost:9000 - Done!

**Why use this?**
- No global installation needed
- Everything set up automatically
- Works on any machine
- Perfect for team projects

---

### Alternative: Global Installation

For personal projects or if you want the CLI everywhere:

```bash
npm install -g snapp-kit

# For macOS/Linux
sudo npm install -g snapp-kit
```

Then use:
```bash
snapp create my-app

cd my-app
snapp build -W
```

---

## Commands

> **Note:** If you used `npm create snapp-app`, add prefix commands with `npx` (e.g., `npx snapp build -W`)

---

### `npm create snapp-app <name>`

Creates a new project with everything configured.

```bash
npm create snapp-app my-project

cd my-project
npm run snapp
```

**Creates:**
```
my-project/
├── views/
│   └── index.jsx      # Your JSX files
├── src/
│   ├── index.js       
│   └── snapp.js       # Snapp runtime
└── index.html         # HTML
```

---

### `snapp create <name>`

Creates a new project

```bash
snapp create my-project

cd my-project
snapp build -W
```

---

### `snapp page <name>`

Generates a new page (HTML + JSX). Must be run inside project directory.

**With npm create snapp-app:**
```bash
cd my-project
npx snapp page contact
```

**With global installation:**
```bash
cd my-project
snapp page contact
```

**Creates:**
- `contact.html` - HTML template
- `views/contact.jsx` - JSX component

---

### `snapp build [options]`

Compiles JSX/TSX files from `views/` to `src/`.

```bash
snapp build          # Build once
snapp build -W       # Build + watch + live server
snapp build -M       # Build minified
snapp build -W -M    # Watch + live server + minify
```

**Options:**

| Flag | Long | Description |
|------|------|-------------|
| `-E` | `--entry` | Project folder (e.g., `-E MyApp`) |
| `-W` | `--watch` | Watch mode + live server |
| `-M` | `--minify` | Minify output |
| `-P` | `--port` | Server port (default: 9000) |

**When to use `-E`:**

Inside your project - no `-E` needed:
```bash
cd my-project
snapp build -W
```

Outside your project - use `-E`:
```bash
snapp build -W -E my-project
```

---

### `snapp --version` | `snapp -V`

Check installed version:

```bash
snapp --version
snapp -V
```

---

### `snapp --help`

Show all available commands:

```bash
snapp --help
```

---

## How It Works

Snapp Kit compiles your files using **esbuild**:

```
views/index.jsx   →  src/index.js
views/about.tsx   →  src/about.js
```

**Supported files:** `.jsx`, `.tsx`, `.ts`, `.js`

**Watch mode:**
- Starts live server on port 9000
- Rebuilds when files change
- Refreshes browser automatically

---

## Troubleshooting

### Command not found

**For npm create:**
```bash
npm --version  # Check npm version (need 6+)
```

**For global installation:**
```bash
npm install -g snapp-kit
snapp --version
```

**For npx commands:**
```bash
cd my-project
npx snapp --version
```

---

### Files not compiling

Check your folder structure:
```bash
ls views/*.jsx   # Verify files exist
```

Then build:
```bash
snapp build -W
```

---

### Port already in use

```bash
snapp build -W -P 8080
```

---

### Permission errors (Linux/Mac)

```bash
sudo npm install -g snapp-kit
```

Or use `npm create snapp-app` (no sudo needed!)

---

## Why Snapp Kit?

- **Simple** - One command to build
- **Fast** - Powered by esbuild
- **Flexible** - Global or per-project

---

<div align="center">

**Snapp Kit v3**

[Install Now](#quick-start) • [Snapp Framework](https://github.com/kigemmanuel/Snapp) • [GitHub](https://github.com/kigemmanuel/snapp-kit)

</div>