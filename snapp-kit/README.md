# Snapp Kit

> **A simple build tool for Snapp Framework**
> ---
>[![npm version](https://badge.fury.io/js/snapp-kit.svg)](https://www.npmjs.com/package/snapp-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with esbuild](https://img.shields.io/badge/Powered%20by-esbuild-orange)](https://esbuild.github.io/)
>
> Live server powered by [@compodoc/live-server](https://github.com/compodoc/live-server)

---

## Table of Contents

- [What is Snapp Kit?](#what-is-snapp-kit)
- [Installation](#installation)
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
- Works globally or as a dev dependency

**What is Snapp?** - A lightweight JavaScript framework. [Learn more →](https://github.com/kigemmanuel/Snapp)

---

## Installation

### Option 1: Global (Recommended)

Install once, use anywhere:

```bash
npm install -g snapp-kit

# for macOs or linux use sudo
sudo npm install -g snapp-kit
```

Verify:
```bash
snapp --version
```

### Option 2: As Dev Dependency
If you do not want to install globally,
Install per project as a Dev Dependency:

```bash
mkdir MyProject
cd MyProject
npm init -y
npm install -D snapp-kit
```

Use with `npx`:
```bash
npx snapp --version
npx snapp create MyApp
npx snapp build -W -E MyApp
```

**Note:** The rest of this guide uses global syntax. If using dev dependency, add `npx` before each command.

---

## Quick Start

**Global Installation:**
```bash
snapp create my-app
cd my-app
snapp build -W
```

**Dev Dependency:**
```bash
mkdir my-app
cd my-app
npm init -y
npm install -D snapp-kit

npx snapp create my-app
npx snapp build -W -E my-app
```

That's it! Open http://localhost:9000

---

## Commands

### `snapp create <name>`

Creates a new project with starter files.

```bash
snapp create my-project
```

**Creates:**
```
my-project/
├── views/
│   └── index.jsx      # Your JSX files
├── src/
|   ├── index.js       
│   └── snapp.js       # Snapp runtime
└── index.html         # HTML
```

---

### `snapp page <name>`

Generates a new page (HTML + JSX).

```bash
snapp page contact
```

**Creates:**
- `contact.html` - HTML template
- `views/contact.jsx` - JSX component

**Generated JSX:**
```jsx
import snapp from "../src/snapp.js"

const Contact = () => {
  return (
    <div className="contact-page">
      <h1>Contact</h1>
      <p>Welcome to the Contact page!</p>
    </div>
  )
}

const snappBody = document.querySelector("#snapp-app");
snapp.render(snappBody, Contact());
```

---

### `snapp build [options]`

Compiles JSX/TSX files from `views/` to `src/`.

**Basic usage:**
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

**When to use `-E` or `--entry`:**

If you're **inside** your project folder, just run the command directly:
```
my-project/
├── views/
├── src/
└── index.html
```
```bash
cd my-project
snapp build -W    # No -E needed!
```

If you're **outside** your project folder, use `-E` to specify which folder:
```
my-top-folder/
└── my-project/
    ├── views/
    ├── src/
    └── index.html
```
```bash
cd my-top-folder
snapp build -W -E my-project    # Use -E to point to project
```

---

### `snapp --help` | `snapp --version`

```bash
snapp --help      # Show help
snapp --version   # Show version
```

**What happens:**
- You write JSX in `views/`
- Snapp Kit compiles to `src/`
- HTML files load from `src/`

---

## How It Works

Snapp Kit compiles your files using **esbuild**:

```
views/index.jsx   →  src/index.js
views/about.tsx   →  src/about.js
views/home.ts     →  src/home.js
```

**Supported files:**
- `.jsx` → JavaScript with JSX
- `.tsx` → TypeScript with JSX
- `.ts` → TypeScript
- `.js` → Modern JavaScript

**Watch mode:**
- Starts live server on port 9000
- Rebuilds when files change
- Refreshes browser automatically

---

## Troubleshooting

### Command not found

**Global:**
```bash
npm install -g snapp-kit
snapp --version
```

**Dev dependency:**
```bash
npx snapp --version
```

---

### Files not compiling

Check your folder structure:
```bash
ls views/        # Should have .jsx files
ls views/*.jsx   # Verify files exist
```

Then build:
```bash
snapp build -W
```

---

### Port already in use

Use a different port:
```bash
snapp build -W -P 8080
```

---

### Page command not working

Make sure you're in a project folder:
```bash
cd my-project
snapp page home
```

Or specify folder:
```bash
snapp page home -E my-project
```

---

### Permission errors (Linux/Mac)

```bash
sudo npm install -g snapp-kit
```

Or use dev dependency (no sudo):
```bash
mkdir myApp
cd myApp

npm install -D snapp-kit
npx snapp --version
```

---

## Why Use Snapp Kit?

**Simple**
- One command to build
- No complex config files

**Fast**
- Powered by esbuild
- Live reload included

**Flexible**
- Global or per-project
- Build once or watch

---

## What's New in snapp-kit v3

- **Entry points** - Build any folder with `-E`
- **Live server** - Auto-refresh in watch mode
- **Custom ports** - Choose your port with `-P`
- **Better errors** - Clearer error messages

---

<div align="center">

**Snapp Kit v3**

[Install Now](#installation) • [Snapp Framework](https://github.com/kigemmanuel/Snapp) • [GitHub](https://github.com/kigemmanuel/snapp-kit)

</div>