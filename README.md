# Quick Search - Code and File Search Tool

A powerful terminal tool to search code and files across repositories with export and open capabilities. Unlike IDE-based search tools, this works across multiple repositories and supports exporting results and opening files in your default editor.

## Features

- **Fast Code Search**: Search for code across any directory or workspace
- **Multiple File Format Support**: Search in all text files with customizable patterns
- **Export Results**: Export search results to Markdown or Text files
- **Open Files**: Open files containing search results in your default code editor
- **Interactive Mode**: User-friendly interactive CLI interface
- **Command-Line Mode**: Direct command-line usage for automation
- **Smart Filtering**: Automatically excludes common directories (node_modules, .git, dist, etc.)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quick-search-code-and-file.git
cd quick-search-code-and-file
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Install globally to use from anywhere:
```bash
npm link
```

## Usage

### Interactive Mode (Recommended)

Simply run without arguments:
```bash
node index.js
```

Or if installed globally:
```bash
quick-search
```

The interactive mode will guide you through:
1. Selecting directory to search
2. Entering search term
3. Specifying file patterns
4. Choosing actions (export, open files, etc.)

### Command-Line Mode

Search in current directory:
```bash
node index.js -s "searchTerm"
```

Search in specific directory:
```bash
node index.js -d /path/to/directory -s "searchTerm"
```

Search with file pattern:
```bash
node index.js -s "searchTerm" -p "**/*.js"
```

Search and export to Markdown:
```bash
node index.js -s "searchTerm" -e md
```

Search and export to Text file:
```bash
node index.js -s "searchTerm" -e txt -o results.txt
```

## Command-Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--interactive` | `-i` | Run in interactive mode | - |
| `--directory <path>` | `-d` | Directory to search | Current directory |
| `--search <term>` | `-s` | Search term | - |
| `--pattern <pattern>` | `-p` | File pattern (e.g., `**/*.js`, `**/*.{ts,tsx}`) | `**/*` |
| `--export <format>` | `-e` | Export results (txt or md) | - |
| `--output <path>` | `-o` | Output file path for export | Auto-generated |

## Examples

### Example 1: Search for a function name
```bash
node index.js -s "searchCode" -p "**/*.js"
```

### Example 2: Search in specific project and export
```bash
node index.js -d ~/projects/myapp -s "TODO" -e md
```

### Example 3: Search for React components
```bash
node index.js -s "useState" -p "**/*.{jsx,tsx}"
```

### Example 4: Interactive mode with guided workflow
```bash
node index.js -i
```

## Export Formats

### Markdown (.md)
- Organized by file
- Formatted code blocks
- Easy to read in GitHub/editors
- Includes metadata (search term, directory, date)

### Text (.txt)
- Simple plain text format
- Line-by-line results
- Perfect for parsing or basic viewing

## Excluded Directories

The tool automatically excludes these common directories:
- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `.next/`
- `coverage/`
- Minified files (`*.min.js`, `*.min.css`)

## Use Cases

- **Cross-Repository Search**: Search across multiple projects simultaneously
- **Code Review**: Find all instances of deprecated code or patterns
- **Documentation**: Export search results for documentation or bug reports
- **Refactoring**: Locate all uses of a function or variable across projects
- **Learning**: Study how specific patterns are used in your codebase
- **Audit**: Find security issues or code smells

## Advantages over IDE Search

1. **Multi-Repository**: Search across multiple repositories at once
2. **Export Capability**: Save and share search results
3. **Automation**: Integrate into scripts and workflows
4. **Universal**: Works independently of your IDE or editor
5. **Fast**: Optimized for large codebases
6. **Portable**: Results can be shared with team members

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this tool in your projects!

## Troubleshooting

**Issue**: "Permission denied" when opening files
- **Solution**: Check file permissions or try running with appropriate access

**Issue**: Too many results
- **Solution**: Use more specific search terms or refine file patterns

**Issue**: Binary files causing errors
- **Solution**: The tool automatically skips binary files, but you can exclude specific patterns

## Future Enhancements

- [ ] Regular expression support
- [ ] Case-sensitive search option
- [ ] Search and replace functionality
- [ ] Multi-term search
- [ ] Syntax highlighting in exports
- [ ] Search history
- [ ] Configuration file support

---

Made with ❤️ for developers who need powerful code search
