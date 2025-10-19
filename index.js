#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const open = require('open');
const ignore = require('ignore');

// Read and parse .gitignore file
function loadGitignorePatterns(directory) {
  const gitignorePath = path.join(directory, '.gitignore');
  const patterns = [];

  try {
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      const lines = gitignoreContent.split('\n');

      lines.forEach(line => {
        // Remove comments and trim whitespace
        const trimmedLine = line.trim();
        // Skip empty lines and comments
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          patterns.push(trimmedLine);
        }
      });
    }
  } catch (err) {
    // If .gitignore can't be read, just continue without it
    console.log(chalk.yellow(`Warning: Could not read .gitignore: ${err.message}`));
  }

  return patterns;
}

// History management functions
const os = require('os');
const HISTORY_DIR = path.join(os.homedir(), 'Search_Code_Pro_Data');
const HISTORY_FILE = path.join(HISTORY_DIR, 'folder_history.json');
const MAX_HISTORY_ITEMS = 10;

// Ensure history directory exists
function ensureHistoryDir() {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

// Load folder history
function loadFolderHistory() {
  ensureHistoryDir();

  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.log(chalk.yellow(`Warning: Could not read history: ${err.message}`));
  }

  return [];
}

// Save folder to history
function saveFolderToHistory(folderPath) {
  ensureHistoryDir();

  try {
    let history = loadFolderHistory();

    // Remove the folder if it already exists in history
    history = history.filter(item => item.path !== folderPath);

    // Add to the beginning of the list
    history.unshift({
      path: folderPath,
      lastUsed: new Date().toISOString()
    });

    // Keep only the last MAX_HISTORY_ITEMS
    history = history.slice(0, MAX_HISTORY_ITEMS);

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.log(chalk.yellow(`Warning: Could not save history: ${err.message}`));
  }
}

// Get relative time string
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Search for code in files
// searchTerm can be a string or an array of strings (multiple keywords)
async function searchCode(directory, searchTerm, filePattern = '**/*', excludePatterns = []) {
  const results = [];

  // Convert searchTerm to array if it's a string
  const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];
  const isMultiKeywordSearch = searchTerms.length > 1;

  // Default exclude patterns
  const defaultExcludes = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.min.css',
    '**/openapi-spec.json'
  ];

  // Load .gitignore patterns
  const gitignorePatterns = loadGitignorePatterns(directory);

  // Convert gitignore patterns to glob patterns (add **/ prefix if needed)
  const gitignoreGlobPatterns = gitignorePatterns.map(pattern => {
    // If pattern doesn't start with *, /, or **, add **/ prefix to match anywhere in tree
    if (!pattern.startsWith('*') && !pattern.startsWith('/') && !pattern.startsWith('**')) {
      return `**/${pattern}`;
    }
    // If pattern starts with /, remove it and don't add **/ prefix (root-relative)
    if (pattern.startsWith('/')) {
      return pattern.substring(1);
    }
    return pattern;
  });

  const allExcludes = [...defaultExcludes, ...gitignoreGlobPatterns, ...excludePatterns];

  if (gitignorePatterns.length > 0) {
    console.log(chalk.gray(`Loaded ${gitignorePatterns.length} patterns from .gitignore`));
  }

  if (isMultiKeywordSearch) {
    console.log(chalk.cyan(`\nSearching for files containing ALL keywords: ${searchTerms.map(t => `"${t}"`).join(', ')}\n`));
  }

  try {
    // Find all files matching the pattern
    const files = await glob(filePattern, {
      cwd: directory,
      absolute: true,
      ignore: allExcludes,
      nodir: true
    });

    console.log(chalk.blue(`\nSearching in ${files.length} files...\n`));

    // Search through each file
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        if (isMultiKeywordSearch) {
          // For multiple keywords, check if the file contains ALL keywords
          const contentLower = content.toLowerCase();
          const hasAllKeywords = searchTerms.every(term =>
            contentLower.includes(term.toLowerCase())
          );

          if (hasAllKeywords) {
            // Find lines that contain any of the keywords
            lines.forEach((line, index) => {
              const lineLower = line.toLowerCase();
              const matchedKeywords = searchTerms.filter(term =>
                lineLower.includes(term.toLowerCase())
              );

              if (matchedKeywords.length > 0) {
                results.push({
                  file: path.relative(directory, file),
                  line: index + 1,
                  content: line.trim(),
                  absolutePath: file,
                  matchedKeywords: matchedKeywords
                });
              }
            });
          }
        } else {
          // Single keyword search (original behavior)
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(searchTerms[0].toLowerCase())) {
              results.push({
                file: path.relative(directory, file),
                line: index + 1,
                content: line.trim(),
                absolutePath: file
              });
            }
          });
        }
      } catch (err) {
        // Skip binary files or files that can't be read
      }
    }
  } catch (err) {
    console.error(chalk.red(`Error searching files: ${err.message}`));
  }

  return results;
}

// Export results to file
function exportResults(results, format, outputPath, searchTerm, directory) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const os = require('os');

  // Define the output directory
  const outputDir = path.join(os.homedir(), 'Desktop', 'Search_Code_Pro_Result');

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Handle searchTerm as string or array
  const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];
  const isMultiKeywordSearch = searchTerms.length > 1;

  // Create a filename that includes search keyword and root folder name
  let fileName;
  if (outputPath) {
    fileName = path.join(outputDir, path.basename(outputPath));
  } else {
    // Get the base name of the directory (last part of the path)
    const folderName = path.basename(directory);
    // Sanitize search term for filename (remove special characters)
    const sanitizedSearchTerm = isMultiKeywordSearch
      ? searchTerms.map(t => t.replace(/[^a-zA-Z0-9-_]/g, '-')).join('-and-')
      : searchTerms[0].replace(/[^a-zA-Z0-9-_]/g, '-');
    fileName = path.join(outputDir, `search-${sanitizedSearchTerm}-in-${folderName}-${timestamp}.${format}`);
  }

  let content = '';

  if (format === 'md') {
    content = `# Search Results\n\n`;
    if (isMultiKeywordSearch) {
      content += `**Search Keywords (ALL must be present):**\n`;
      searchTerms.forEach(term => {
        content += `- \`${term}\`\n`;
      });
      content += `\n`;
    } else {
      content += `**Search Term:** \`${searchTerms[0]}\`\n`;
    }
    content += `**Directory:** \`${directory}\`\n`;
    content += `**Date:** ${new Date().toLocaleString()}\n`;
    content += `**Total Results:** ${results.length}\n\n`;
    content += `---\n\n`;

    // Group by file
    const groupedResults = {};
    results.forEach(result => {
      if (!groupedResults[result.file]) {
        groupedResults[result.file] = [];
      }
      groupedResults[result.file].push(result);
    });

    Object.keys(groupedResults).forEach(file => {
      content += `## ${file}\n\n`;
      groupedResults[file].forEach(result => {
        content += `**Line ${result.line}:**`;
        if (result.matchedKeywords && result.matchedKeywords.length > 0) {
          content += ` _(matched: ${result.matchedKeywords.map(k => `\`${k}\``).join(', ')})_`;
        }
        content += `\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
      });
    });
  } else {
    // txt format
    content = `Search Results\n`;
    content += `${'='.repeat(50)}\n`;
    if (isMultiKeywordSearch) {
      content += `Search Keywords (ALL must be present):\n`;
      searchTerms.forEach(term => {
        content += `  - ${term}\n`;
      });
    } else {
      content += `Search Term: ${searchTerms[0]}\n`;
    }
    content += `Directory: ${directory}\n`;
    content += `Date: ${new Date().toLocaleString()}\n`;
    content += `Total Results: ${results.length}\n`;
    content += `${'='.repeat(50)}\n\n`;

    results.forEach(result => {
      content += `File: ${result.file}\n`;
      content += `Line: ${result.line}\n`;
      if (result.matchedKeywords && result.matchedKeywords.length > 0) {
        content += `Matched Keywords: ${result.matchedKeywords.join(', ')}\n`;
      }
      content += `Content: ${result.content}\n`;
      content += `${'-'.repeat(50)}\n`;
    });
  }

  fs.writeFileSync(fileName, content, 'utf-8');
  return path.resolve(fileName);
}

// Folder picker - browse directories interactively
async function folderPicker(startPath = process.cwd()) {
  let currentPath = path.resolve(startPath);

  while (true) {
    // Read directories in current path
    let dirs = [];
    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      dirs = items
        .filter(item => item.isDirectory() && !item.name.startsWith('.'))
        .map(item => item.name)
        .sort();
    } catch (err) {
      console.log(chalk.red(`Cannot read directory: ${err.message}`));
      currentPath = path.dirname(currentPath);
      continue;
    }

    const choices = [
      { name: chalk.green(`✓ Select this folder: ${currentPath}`), value: '__select__' },
      { name: chalk.blue('.. (Parent directory)'), value: '..' },
      new inquirer.Separator(),
      ...dirs.map(dir => ({ name: `📁 ${dir}`, value: dir })),
      new inquirer.Separator(),
      { name: chalk.yellow('← Go back to folder selection'), value: '__back__' }
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: `Current location: ${chalk.cyan(currentPath)}`,
        choices: choices,
        pageSize: 15
      }
    ]);

    if (answer.selection === '__select__') {
      return currentPath;
    } else if (answer.selection === '__back__') {
      return '__back__';
    } else if (answer.selection === '..') {
      currentPath = path.dirname(currentPath);
    } else {
      currentPath = path.join(currentPath, answer.selection);
    }
  }
}

// Interactive mode
async function interactiveMode() {
  console.log(chalk.bold.blue('\n🔍 Quick Search - Interactive Mode\n'));

  // Load folder history
  const folderHistory = loadFolderHistory();

  // Build choices array
  const choices = [
    { name: 'Current directory', value: 'current' },
    { name: 'Browse and select folder (Interactive)', value: 'picker' },
    { name: 'Enter folder path manually', value: 'manual' }
  ];

  // Add recent folders option if history exists
  if (folderHistory.length > 0) {
    choices.unshift({ name: 'Select from recent folders', value: 'recent' });
  }

  // Ask user to choose between manual input, folder picker, or recent folders
  const methodChoice = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to select the folder?',
      choices: choices
    }
  ]);

  let directory;
  if (methodChoice.method === 'current') {
    // Use current directory
    directory = process.cwd();
    console.log(chalk.green(`\nSelected folder: ${directory}\n`));
  } else if (methodChoice.method === 'recent') {
    // Show recent folders with go back option
    const recentChoices = folderHistory.map((item, index) => {
      const lastUsedDate = new Date(item.lastUsed);
      const relativeTime = getRelativeTime(lastUsedDate);
      return {
        name: `${item.path} ${chalk.gray(`(${relativeTime})`)}`,
        value: item.path
      };
    });
    recentChoices.push(new inquirer.Separator());
    recentChoices.push({ name: chalk.yellow('← Go back'), value: '__back__' });

    const recentChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'folder',
        message: 'Select a recent folder:',
        choices: recentChoices,
        pageSize: 12
      }
    ]);

    if (recentChoice.folder === '__back__') {
      // Go back to folder selection method
      return await interactiveMode();
    }

    directory = recentChoice.folder;
    console.log(chalk.green(`\nSelected folder: ${directory}\n`));
  } else if (methodChoice.method === 'picker') {
    const os = require('os');
    directory = await folderPicker(os.homedir());
    if (directory === '__back__') {
      // Go back to folder selection method
      return await interactiveMode();
    }
    console.log(chalk.green(`\nSelected folder: ${directory}\n`));
  } else {
    const pathInput = await inquirer.prompt([
      {
        type: 'input',
        name: 'directory',
        message: 'Enter directory to search (or press Enter for current directory):',
        default: process.cwd()
      }
    ]);
    directory = pathInput.directory;
  }

  // Ask if user wants single or multiple keyword search
  const searchMode = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Search mode:',
      choices: [
        { name: 'Single keyword search', value: 'single' },
        { name: 'Multiple keywords search (find files containing ALL keywords)', value: 'multiple' },
        new inquirer.Separator(),
        { name: chalk.yellow('← Go back'), value: '__back__' }
      ]
    }
  ]);

  if (searchMode.mode === '__back__') {
    return await interactiveMode();
  }

  let searchTerms = [];

  if (searchMode.mode === 'single') {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'searchTerm',
        message: 'Enter search term:',
        validate: (input) => input.length > 0 || 'Search term cannot be empty'
      }
    ]);
    searchTerms = [answer.searchTerm];
  } else {
    // Multiple keywords mode
    console.log(chalk.cyan('\nEnter keywords one by one. Type "done" when finished.\n'));

    while (true) {
      const keywordPrompt = await inquirer.prompt([
        {
          type: 'input',
          name: 'keyword',
          message: `Enter keyword ${searchTerms.length + 1} (or "done" to finish):`,
          validate: (input) => {
            if (input.length === 0) {
              return 'Keyword cannot be empty';
            }
            return true;
          }
        }
      ]);

      if (keywordPrompt.keyword.toLowerCase() === 'done') {
        if (searchTerms.length === 0) {
          console.log(chalk.yellow('You must enter at least one keyword!\n'));
          continue;
        }
        break;
      }

      searchTerms.push(keywordPrompt.keyword);
      console.log(chalk.green(`✓ Added keyword: "${keywordPrompt.keyword}"`));
      console.log(chalk.gray(`Current keywords: ${searchTerms.map(t => `"${t}"`).join(', ')}\n`));
    }

    console.log(chalk.cyan(`\nSearching for files containing ALL ${searchTerms.length} keywords\n`));
  }

  const filePatternAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'filePattern',
      message: 'Enter file pattern (e.g., **/*.js, **/*.{ts,tsx}) or type "back" to go back:',
      default: '**/*'
    }
  ]);

  if (filePatternAnswer.filePattern.toLowerCase() === 'back') {
    return await interactiveMode();
  }

  const results = await searchCode(directory, searchTerms.length === 1 ? searchTerms[0] : searchTerms, filePatternAnswer.filePattern);

  const searchTermDisplay = searchTerms.length === 1 ? searchTerms[0] : searchTerms;

  if (results.length === 0) {
    const noResultMsg = Array.isArray(searchTermDisplay)
      ? `\nNo results found for keywords: ${searchTermDisplay.map(t => `"${t}"`).join(', ')}\n`
      : `\nNo results found for "${searchTermDisplay}"\n`;
    console.log(chalk.yellow(noResultMsg));
    return;
  }

  // Save folder to history
  saveFolderToHistory(directory);

  // Default: Export to Markdown
  const mdFile = exportResults(results, 'md', null, searchTermDisplay, directory);
  console.log(chalk.green(`\n✓ Found ${results.length} matches!`));
  console.log(chalk.green(`✓ Results exported to: ${chalk.cyan(mdFile)}\n`));

  // Ask if user wants to do more actions
  const actions = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do next?',
      choices: [
        { name: 'Open result folder in Finder', value: 'open-folder' },
        { name: 'Open a file', value: 'open' },
        { name: 'Export to Text format as well', value: 'export-txt' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  switch (actions.action) {
    case 'open-folder':
      const os = require('os');
      const resultFolderPath = path.join(os.homedir(), 'Desktop', 'Search_Code_Pro_Result');
      try {
        await open(resultFolderPath);
        console.log(chalk.green(`\n✓ Opening result folder in Finder\n`));
      } catch (err) {
        console.error(chalk.red(`\nError opening folder: ${err.message}\n`));
      }
      break;

    case 'export-txt':
      const txtFile = exportResults(results, 'txt', null, searchTermDisplay, directory);
      console.log(chalk.green(`\n✓ Results also exported to: ${chalk.cyan(txtFile)}\n`));
      break;

    case 'open':
      const fileChoices = [...new Set(results.map(r => r.file))].map((file, index) => ({
        name: `${file} (${results.filter(r => r.file === file).length} matches)`,
        value: index
      }));

      const fileSelection = await inquirer.prompt([
        {
          type: 'list',
          name: 'fileIndex',
          message: 'Select file to open:',
          choices: fileChoices,
          pageSize: 15
        }
      ]);

      const selectedFile = results.find(r => r.file === [...new Set(results.map(r => r.file))][fileSelection.fileIndex]);

      try {
        await open(selectedFile.absolutePath);
        console.log(chalk.green(`\n✓ Opening ${selectedFile.file}\n`));
      } catch (err) {
        console.error(chalk.red(`\nError opening file: ${err.message}\n`));
      }
      break;

    case 'exit':
      console.log(chalk.blue('\nGoodbye!\n'));
      break;
  }
}

// CLI mode
program
  .name('quick-search')
  .description('Search code and files across repositories')
  .version('1.0.0');

program
  .option('-i, --interactive', 'Run in interactive mode')
  .option('-d, --directory <path>', 'Directory to search', process.cwd())
  .option('-s, --search <term>', 'Search term')
  .option('-p, --pattern <pattern>', 'File pattern (e.g., **/*.js)', '**/*')
  .option('-e, --export <format>', 'Export results (txt or md)')
  .option('-o, --output <path>', 'Output file path for export')
  .action(async (options) => {
    if (options.interactive) {
      await interactiveMode();
    } else if (options.search) {
      const results = await searchCode(options.directory, options.search, options.pattern);

      if (results.length === 0) {
        console.log(chalk.yellow(`\nNo results found for "${options.search}"\n`));
        return;
      }

      // Save folder to history
      saveFolderToHistory(options.directory);

      // Default: Export to Markdown
      const format = options.export || 'md';
      const fileName = exportResults(results, format, options.output, options.search, options.directory);
      console.log(chalk.green(`\n✓ Found ${results.length} matches!`));
      console.log(chalk.green(`✓ Results exported to: ${chalk.cyan(fileName)}\n`));
    } else {
      console.log(chalk.yellow('Please provide a search term with -s or use -i for interactive mode'));
      program.help();
    }
  });

// If no arguments provided, show interactive mode
if (process.argv.length === 2) {
  interactiveMode();
} else {
  program.parse();
}
