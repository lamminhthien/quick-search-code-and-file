# Quick Start Guide

## Installation

```bash
npm install
```

## Try it out!

### 1. Interactive Mode (Easiest)
```bash
node index.js
```
Then follow the prompts to search for any term!

### 2. Quick Command-Line Search
```bash
# Search for "function" in all JavaScript files
node index.js -s "function" -p "**/*.js"

# Search and export to markdown
node index.js -s "console.log" -e md

# Search in a specific directory
node index.js -d /path/to/project -s "TODO"
```

### 3. Real-World Examples

**Find all TODO comments:**
```bash
node index.js -s "TODO" -e md -o todos.md
```

**Find all console.log statements in JS files:**
```bash
node index.js -s "console.log" -p "**/*.js" -e txt
```

**Search for imports in TypeScript files:**
```bash
node index.js -s "import" -p "**/*.{ts,tsx}"
```

## What makes this tool special?

- Works across **any directory**, not just single repositories
- **Exports results** to share with your team
- **Opens files** in your default editor
- Automatically excludes node_modules, .git, and other noise
- Clean, colorful terminal output

## Install Globally (Optional)

To use `quick-search` command from anywhere:
```bash
npm link
```

Then you can use:
```bash
quick-search -s "searchTerm"
```

Enjoy searching! 🔍
