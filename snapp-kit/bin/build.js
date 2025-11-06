import { build } from 'esbuild';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import liveServer from '@compodoc/live-server';
import chalk from "chalk";

// Parse command line arguments WITHOUT = syntax (space-separated)
const getArgValue = (shortFlag, longFlag) => {
  const args = process.argv;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === shortFlag || args[i] === longFlag) {
      return args[i + 1];
    }
  }
  return null;
};

const shouldMinify = process.argv.includes('-M') || process.argv.includes('--minify');
const shouldWatch = process.argv.includes('-W') || process.argv.includes('--watch');
const entry = getArgValue('-E', '--entry') || process.cwd();
const portArg = getArgValue('-P', '--port') || '9000';

// Validate port is a number
const port = parseInt(portArg);
if (isNaN(port) || port < 1 || port > 65535) {
  console.error(chalk.red(`Invalid port: "${portArg}"`));
  console.log('Port must be a number between 1 and 65535');
  process.exit(1);
}

// Find views folder inside entry directory
const viewsDir = join(entry, 'views');
const outputDir = join(entry, 'src');

// Check if views folder exists
if (!existsSync(viewsDir)) {
  console.error(chalk.red(`Views folder not found at: ${viewsDir}`));
  console.log('Make sure your project has a views/ folder');
  process.exit(1);
}

// Get all JS/TS files from views directory
const getEntryPoints = () => {
  const entries = [];

  try {
    const files = readdirSync(viewsDir);
    for (const file of files) {
      const fullPath = join(viewsDir, file);
      if (statSync(fullPath).isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
        entries.push(fullPath);
        console.log(chalk.green(`Found entry: ${file}`));
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error reading views/ directory:`), error.message);
    process.exit(1);
  }

  if (entries.length === 0) {
    console.log(chalk.red(`No entry files found in views/`));
    process.exit(1);
  }

  return entries;
};

const buildOptions = {
  entryPoints: getEntryPoints(),
  bundle: true,
  outdir: outputDir,
  format: 'esm',
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.ts': 'ts',
    '.tsx': 'tsx'
  },
  jsx: 'transform',
  jsxFactory: 'snapp.create',
  jsxFragment: '"<>"',
  treeShaking: true,
  minify: shouldMinify,
  banner: {
    js: 'import snapp from "./snapp.js";'
  },
  external: ['./snapp.js', 'snapp'],
  plugins: [
    {
      name: 'snapp-processor',
      setup(build) {
        build.onLoad({ filter: /\.(js|jsx|ts|tsx)$/ }, async (args) => {
          const fs = await import('fs/promises');
          let contents = await fs.readFile(args.path, 'utf8');

          // Remove any import with "snapp" as the imported name (case-insensitive)
          contents = contents.replace(/import\s+snapp\s+from\s+['"][^'"]+['"];?\s*\n?/gi, '');
          contents = contents.replace(/import\s*\*\s*as\s+snapp\s+from\s+['"][^'"]+['"];?\s*\n?/gi, '');

          console.log(`Processed: ${args.path.replace(process.cwd() + '/', '')}`);

          let loader = 'js';
          if (args.path.endsWith('.tsx')) loader = 'tsx';
          else if (args.path.endsWith('.ts')) loader = 'ts';
          else if (args.path.endsWith('.jsx')) loader = 'jsx';
          else if (args.path.endsWith('.js')) loader = 'jsx';

          return { contents, loader };
        });
      }
    },
    {
      name: 'build-logger',
      setup(build) {
        build.onStart(() => console.log(chalk.blue('Building...')));
        build.onEnd((result) => {
          if (result.errors.length > 0) {
            console.error(chalk.red('Build failed!'));
            result.errors.forEach(error => console.error(error));
          } else {
            console.log(chalk.green('Build complete!'));
            console.log(`Views: ${viewsDir} → Output: ${outputDir}`);
          }
        });
      }
    }
  ]
};

console.log(`Building Snapp project... ${shouldMinify ? '(minified)' : ''}`);
console.log(`Entry: ${entry}`);
console.log(`Views: ${viewsDir} → Output: ${outputDir}`);

try {
  if (shouldWatch) {
    // Watch mode - esbuild rebuilds + live-server serves
    const { context } = await import('esbuild');
    const ctx = await context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');

    // Start live-server
    console.log(`\nStarting live-server on port ${port}...`);
    liveServer.start({
      port: port,
      host: '0.0.0.0',
      root: entry,
      open: true,
      wait: 100,
      logLevel: 2
    });

    // Get local network IP address
    const getLocalIP = async () => {
      const { networkInterfaces } = await import('os');
      const nets = networkInterfaces();

      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // Skip internal (loopback) and non-IPv4 addresses
          if (net.family === 'IPv4' && !net.internal) {
            return net.address;
          }
        }
      }
      return 'Unable to detect';
    };

    const localIP = await getLocalIP();

    // To make this show last
    setTimeout(() => {
      console.log(`\n${chalk.green("Server running on:")}\n`);
      console.log(`${chalk.blue("Localhost on =>")} http://127.0.0.1:${chalk.white(port)}`);
      console.log(`${chalk.blue("Same Network =>")} http://${chalk.white(localIP)}:${chalk.white(port)}\n`);
      console.log(chalk.white("Press Ctrl+C to stop"));
    }, 2000);


    process.on('SIGINT', async () => {
      console.log(chalk.red('\nStopping...'));
      await ctx.dispose();
      process.exit(0);
    });
  } else {
    // One-time build - no server
    await build(buildOptions);
    console.log(chalk.green('Done!'));
    process.exit(0);
  }
} catch (error) {
  console.error(chalk.red('Build failed:'), error.message);
  process.exit(1);
}
