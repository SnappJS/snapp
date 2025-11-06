import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get app name from arguments
const appName = process.argv[2];

if (!appName) {
  console.log(`
❌ App name is required!

Usage:
  snapp create <app-name>

Example:
  snapp create my-awesome-app
`);
  process.exit(1);
}

// Validate app name
if (!/^[a-zA-Z0-9-_]+$/.test(appName)) {
  console.error('❌ App name can only contain letters, numbers, hyphens, and underscores');
  process.exit(1);
}

// Check if directory already exists
if (existsSync(appName)) {
  console.error(`❌ Directory '${appName}' already exists!`);
  process.exit(1);
}

console.log(`Creating Snapp app: ${appName}`);

// Template directory path
const templateDir = join(__dirname, 'template');

if (!existsSync(templateDir)) {
  console.error('❌ Template directory not found!');
  console.error('Make sure the template folder exists in your CLI directory, or reinstall snapp-cli');
  process.exit(1);
}

// File extensions that should be treated as text files for template replacement
const textFileExtensions = ['.html', '.js', '.jsx', '.ts', '.tsx', '.css'];

// Check if file should be processed as text
const isTextFile = (filePath) => {
  const ext = extname(filePath).toLowerCase();
  return textFileExtensions.includes(ext);
};

// Copy template recursively
const copyTemplate = (src, dest) => {
  const stats = statSync(src);
  
  if (stats.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    const files = readdirSync(src);
    for (const file of files) {
      copyTemplate(join(src, file), join(dest, file));
    }
  } else {
    if (isTextFile(src)) {
      // Process text files with template replacement
      let content = readFileSync(src, 'utf8');
      
      // Replace template variables
      content = content.replace(/{{APP_NAME}}/g, appName)
      
      writeFileSync(dest, content);
    } else {
      // Copy binary files (images, fonts, etc.) directly without processing
      copyFileSync(src, dest);
    }
    
    console.log(`📄 Created: ${dest}`);
  }
};

// Convert kebab-case to camelCase
const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

try {
  // Create app directory
  mkdirSync(appName);
  console.log(`📁 Created directory: ${appName}`);
  
  // Copy all template files
  copyTemplate(templateDir, appName);
  
  console.log(`
Successfully created ${appName}!

Next steps:
  cd ${appName}
  snapp build -W
  -- or --
  npx snapp build -W (dev dependency)
`);
  
} catch (error) {
  console.error('❌ Failed to create app:', error.message);
  process.exit(1);
}