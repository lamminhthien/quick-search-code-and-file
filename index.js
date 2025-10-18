#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const open = require('open');

// Search for code in files
async function searchCode(directory, searchTerm, filePattern = '**/*', excludePatterns = []) {
  const results = [];

  // Default exclude patterns
  const defaultExcludes = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.min.css'
  ];

  const allExcludes = [...defaultExcludes, ...excludePatterns];

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

        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              file: path.relative(directory, file),
              line: index + 1,
              content: line.trim(),
              absolutePath: file
            });
          }
        });
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
  const fileName = outputPath || `search-results-${timestamp}.${format}`;

  let content = '';

  if (format === 'md') {
    content = `# Search Results\n\n`;
    content += `**Search Term:** \`${searchTerm}\`\n`;
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
        content += `**Line ${result.line}:**\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
      });
    });
  } else {
    // txt format
    content = `Search Results\n`;
    content += `${'='.repeat(50)}\n`;
    content += `Search Term: ${searchTerm}\n`;
    content += `Directory: ${directory}\n`;
    content += `Date: ${new Date().toLocaleString()}\n`;
    content += `Total Results: ${results.length}\n`;
    content += `${'='.repeat(50)}\n\n`;

    results.forEach(result => {
      content += `File: ${result.file}\n`;
      content += `Line: ${result.line}\n`;
      content += `Content: ${result.content}\n`;
      content += `${'-'.repeat(50)}\n`;
    });
  }

  fs.writeFileSync(fileName, content, 'utf-8');
  return fileName;
}

// Display results in terminal
function displayResults(results, searchTerm) {
  if (results.length === 0) {
    console.log(chalk.yellow(`\nNo results found for "${searchTerm}"\n`));
    return;
  }

  console.log(chalk.green(`\nFound ${results.length} matches:\n`));

  results.forEach((result, index) => {
    console.log(chalk.cyan(`[${index + 1}] ${result.file}:${result.line}`));
    console.log(chalk.gray(`    ${result.content}`));
    console.log('');
  });
}

// Interactive mode
async function interactiveMode() {
  console.log(chalk.bold.blue('\n🔍 Quick Search - Interactive Mode\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'directory',
      message: 'Enter directory to search (or press Enter for current directory):',
      default: process.cwd()
    },
    {
      type: 'input',
      name: 'searchTerm',
      message: 'Enter search term:',
      validate: (input) => input.length > 0 || 'Search term cannot be empty'
    },
    {
      type: 'input',
      name: 'filePattern',
      message: 'Enter file pattern (e.g., **/*.js, **/*.{ts,tsx}):',
      default: '**/*'
    }
  ]);

  const results = await searchCode(answers.directory, answers.searchTerm, answers.filePattern);
  displayResults(results, answers.searchTerm);

  if (results.length > 0) {
    const actions = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Export to Markdown', value: 'export-md' },
          { name: 'Export to Text', value: 'export-txt' },
          { name: 'Open a file', value: 'open' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (actions.action) {
      case 'export-md':
        const mdFile = exportResults(results, 'md', null, answers.searchTerm, answers.directory);
        console.log(chalk.green(`\n✓ Results exported to ${mdFile}\n`));
        break;

      case 'export-txt':
        const txtFile = exportResults(results, 'txt', null, answers.searchTerm, answers.directory);
        console.log(chalk.green(`\n✓ Results exported to ${txtFile}\n`));
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
      displayResults(results, options.search);

      if (options.export && results.length > 0) {
        const format = options.export === 'md' ? 'md' : 'txt';
        const fileName = exportResults(results, format, options.output, options.search, options.directory);
        console.log(chalk.green(`\n✓ Results exported to ${fileName}\n`));
      }
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
