import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get page name from arguments
const pageName = process.argv[2];

if (!pageName) {
  console.log(`
❌ Page name is required!

Usage:
  snapp page <page-name>

Example:
  snapp page about
  snapp page contact-us
`);
  process.exit(1);
}

// Validate page name
if (!/^[a-zA-Z0-9-_]+$/.test(pageName)) {
  console.error('❌ Page name can only contain letters, numbers, hyphens, and underscores');
  process.exit(1);
}

console.log(`📄 Creating page: ${pageName}`);

// Page template directory path
const pageTemplateDir = join(__dirname, 'page');

if (!existsSync(pageTemplateDir)) {
  console.error('❌ Page template directory not found!');
  console.error('Make sure the "page" folder exists in your CLI directory');
  process.exit(1);
}

// Ensure views directory exists
const viewsDir = 'views';
if (!existsSync(viewsDir)) {
  mkdirSync(viewsDir, { recursive: true });
  console.log(`📁 Created directory: ${viewsDir}`);
}

// Convert kebab-case to camelCase
const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

// Convert kebab-case to PascalCase
const toPascalCase = (str) => {
  return str.replace(/(^|-)([a-z])/g, (match, dash, letter) => letter.toUpperCase());
};

// Convert kebab-case to Title Case
const toTitleCase = (str) => {
  return str.replace(/(^|-)([a-z])/g, (match, dash, letter) => 
    (dash ? ' ' : '') + letter.toUpperCase()
  );
};

// Process and copy files from page template
const copyPageFiles = (src, pageName) => {
  const files = readdirSync(src);
  
  for (const file of files) {
    const srcPath = join(src, file);
    const stats = statSync(srcPath);
    
    if (stats.isFile()) {
      const ext = extname(file);
      let content = readFileSync(srcPath, 'utf8');
      
      // Replace template variables
      content = content.replace(/{{PAGE_NAME}}/g, pageName)
      
      let destPath;
      let destFileName;
      
      // Determine destination based on file extension
      if (ext === '.html') {
        // HTML files go to root directory
        destFileName = `${pageName}.html`;
        destPath = destFileName;
      } else if (ext === '.jsx' || ext === '.js') {
        // JavaScript/JSX files go to views directory
        destFileName = `${pageName}${ext}`;
        destPath = join(viewsDir, destFileName);
      } else {
        // Other files go to root directory
        destFileName = `${pageName}${ext}`;
        destPath = destFileName;
      }
      
      // Check if file already exists
      if (existsSync(destPath)) {
        console.error(`❌ File '${destPath}' already exists!`);
        continue;
      }
      
      writeFileSync(destPath, content);
      console.log(`📄 Created: ${destPath}`);
    }
  }
};

try {
  // Copy and process page files
  copyPageFiles(pageTemplateDir, pageName);
  
  console.log(`
Successfully created page '${pageName}'!

Files created:
  • ${pageName}.html (in root)
  • ${pageName}.jsx (in views/)

Next steps:
  cd ${appName}
  snapp build -W
  -- or --
  npx snapp build -W (dev dependency)
`);
  
} catch (error) {
  console.error('❌ Failed to create page:', error.message);
  process.exit(1);
}