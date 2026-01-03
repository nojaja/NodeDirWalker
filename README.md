# dir-walker

A lightweight, flexible directory walker utility for Node.js with pattern matching support.

## Overview

**dir-walker** is a TypeScript-based utility for recursively walking through file systems with built-in pattern matching capabilities. It provides a simple, efficient, and safe API for traversing directories while filtering out unwanted files and directories using regular expressions.

## Features

- 🚀 **Fast & Efficient**: Asynchronous recursive directory traversal with proper error handling
- 🎯 **Pattern Matching**: Built-in support for excluding directories and file extensions using RegExp patterns
- 🔒 **Safe**: Automatically skips symbolic links to prevent infinite loops and circular references
- 📦 **Zero Dependencies**: No external runtime dependencies - fully self-contained
- 🎨 **TypeScript**: Full TypeScript support with comprehensive type definitions and JSDoc annotations
- ⚡ **ESM Ready**: Native ES Module support with proper bundling for both CommonJS and UMD environments
- 🐛 **Debug Mode**: Optional debug logging to track directory traversal and pattern matching
- 📊 **Async-first**: Supports both synchronous and asynchronous file processing callbacks

## Installation

```bash
npm install @nojaja/dirwalker
```

Or with yarn:

```bash
yarn add @nojaja/dirwalker
```

### Requirements

- Node.js 18.0.0 or higher
- npm 6.0.0 or higher (or yarn equivalent)

## Quick Start

```typescript
import { DirWalker } from '@nojaja/dirwalker';

const walker = new DirWalker();

const fileCount = await walker.walk(
  './my-directory',
  {
    excludeDirs: [/node_modules/, /\.git/],
    excludeExt: [/\.log$/]
  },
  (relativePath, settings) => {
    console.log('Found file:', relativePath);
  },
  (error) => {
    console.error('Error:', error);
  }
);

console.log(`Processed ${fileCount} files`);
```

## Project Structure

```
dir-walker/
├── src/
│   ├── DirWalker.ts       # Main directory walker class (247 lines)
│   ├── PatternMatcher.ts  # Pattern matching utility (48 lines)
│   └── index.ts           # Public API exports
├── test/
│   ├── unit/
│   │   ├── DirWalker.test.ts      # DirWalker unit tests (336 cases)
│   │   └── PatternMatcher.test.ts # PatternMatcher unit tests
│   └── fixtures/                  # Test fixtures and sample data
├── dist/                  # Compiled output (generated at build time)
├── docs/                  # Generated API documentation (TypeDoc)
├── package.json           # NPM configuration and scripts
├── tsconfig.json          # TypeScript configuration (strict mode)
├── webpack.config.js      # Webpack bundling configuration
├── jest.unit.config.js    # Jest test configuration
├── CHANGELOG.md           # Version history and release notes
└── README.md              # This file
```

## Technology Stack

- **Language**: TypeScript 5.3.3 (strict mode enabled)
- **Runtime**: Node.js 18.0.0+
- **Bundler**: Webpack 5.99.8 (UMD + CommonJS bundling)
- **Test Framework**: Jest 29.6.1 with ts-jest
- **Type Checking**: TypeScript with strict mode
- **Linting**: ESLint 8.45.0 with TypeScript support
- **Code Style**: Prettier 3.0.0
- **Documentation**: TypeDoc 0.28.15

## API Reference

### Class: `DirWalker`

The main class for directory walking operations. Exports a default instance and named export.

#### Constructor

```typescript
constructor(debug?: boolean)
```

**Parameters:**
- `debug` (optional, boolean): Enable debug logging for traversal operations. Default: `false`

**Example:**
```typescript
const walker = new DirWalker();           // Default, no debug
const walkerDebug = new DirWalker(true);  // With debug logging enabled
```

#### Methods

##### `walk(targetPath, settings, fileCallback, errCallback): Promise<number>`

Recursively walks through a directory and processes files matching the specified criteria.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `targetPath` | `string` | Root directory path (absolute or relative). The callback receives relative paths from this base. |
| `settings` | `WalkSettings` | Configuration object with exclude patterns. Both fields are optional and default to empty arrays. |
| `fileCallback` | `FileCallback` | Called for each matched file. Supports async operations. |
| `errCallback` | `ErrorCallback` (optional) | Called when errors occur during traversal. If omitted, errors are logged. |

**Returns:** `Promise<number>` - Total count of files processed (matched)

**WalkSettings Interface:**
```typescript
interface WalkSettings {
  excludeDirs?: RegExp[];    // Patterns to exclude directories
  excludeExt?: RegExp[];     // Patterns to exclude file extensions
}
```

**FileCallback Type:**
```typescript
type FileCallback = (
  relativePath: string,      // Relative path from targetPath
  settings: WalkSettings     // Settings object used
) => void | Promise<void>;   // Can be synchronous or async
```

**ErrorCallback Type:**
```typescript
type ErrorCallback = (error: Error) => void;
```

### Class: `PatternMatcher`

Utility class for pattern matching operations. Typically used internally by DirWalker.

#### Constructor

```typescript
constructor(debug?: boolean)
```

#### Methods

##### `match(text: string, patterns?: RegExp[]): boolean`

Tests if text matches any of the provided patterns.

**Parameters:**
- `text` - The string to test
- `patterns` - Array of RegExp patterns to match against

**Returns:** `true` if any pattern matches, `false` otherwise

##### `matchEx(text: string, patterns?: RegExp[]): RegExp | null`

Tests if text matches any patterns and returns the matching pattern.

**Parameters:**
- `text` - The string to test
- `patterns` - Array of RegExp patterns to match against

**Returns:** The matching RegExp object or `null` if no match found

## Usage Examples

### Basic Usage - Simple File Listing

```typescript
import { DirWalker } from '@nojaja/dirwalker';

const walker = new DirWalker();
const fileCount = await walker.walk(
  './src',
  {},
  (relativePath) => {
    console.log(relativePath);
  },
  (error) => {
    console.error('Error:', error);
  }
);

console.log(`Total files processed: ${fileCount}`);
```

### Excluding Directories

Common patterns to exclude:

```typescript
const walker = new DirWalker();

await walker.walk(
  './project',
  {
    excludeDirs: [
      /node_modules/,     // npm dependencies
      /\.git/,            // git repository
      /dist/,             // build output
      /coverage/,         // test coverage
      /__pycache__/,      // Python cache
      /\.next/,           // Next.js build
      /\.venv/            // Python virtual env
    ]
  },
  (relativePath) => {
    console.log('Source file:', relativePath);
  }
);
```

**Note:** Directory patterns match the full file path, so `node_modules` will match any "node_modules" directory at any level.

### Filtering by File Extension

```typescript
const walker = new DirWalker();

await walker.walk(
  './src',
  {
    excludeExt: [
      /\.test\.ts$/,      // Jest test files
      /\.spec\.ts$/,      // Jasmine spec files
      /\.d\.ts$/,         // TypeScript declarations
      /\.map$/,           // Source maps
      /\.log$/            // Log files
    ]
  },
  (relativePath) => {
    console.log('Production file:', relativePath);
  }
);
```

### Combining Directory and Extension Filters

```typescript
const walker = new DirWalker();

await walker.walk(
  './project',
  {
    excludeDirs: [/node_modules/, /\.git/, /dist/],
    excludeExt: [/\.test\.ts$/, /\.d\.ts$/, /\.log$/]
  },
  (relativePath) => {
    console.log('Production source:', relativePath);
  }
);
```

### Processing Files with Async Operations

```typescript
import { DirWalker } from '@nojaja/dirwalker';
import { readFile } from 'fs/promises';
import * as path from 'path';

const walker = new DirWalker();
const results = [];

await walker.walk(
  './docs',
  {
    excludeExt: [/^(?!.*\.md$)/]  // Only markdown files
  },
  async (filePath) => {
    try {
      const content = await readFile(filePath, 'utf-8');
      results.push({
        file: filePath,
        lines: content.split('\n').length,
        size: content.length
      });
    } catch (error) {
      console.error(`Failed to read ${filePath}:`, error);
    }
  },
  (error) => {
    console.error('Walk error:', error);
  }
);

console.log('Results:', results);
```

### Counting Files by Extension

```typescript
import * as path from 'path';

const walker = new DirWalker();
const stats = new Map<string, number>();

await walker.walk(
  './src',
  { excludeDirs: [/node_modules/] },
  (filePath) => {
    const ext = path.extname(filePath) || '(no extension)';
    stats.set(ext, (stats.get(ext) || 0) + 1);
  }
);

console.log('Files by extension:');
for (const [ext, count] of stats) {
  console.log(`  ${ext}: ${count}`);
}
```

### Debug Mode

Enable debug logging to track directory traversal:

```typescript
import { DirWalker } from '@nojaja/dirwalker';

const walker = new DirWalker(true);  // Enable debug logging

await walker.walk(
  './src',
  { excludeDirs: [/node_modules/] },
  (file) => {
    console.log('Processing:', file);
  }
);

// Debug output example:
// シンボリックリンクをスキップ: /path/to/symlink
// ファイル発見: /path/to/file.ts
// ディレクトリ読み取りエラー: ... (if any)
```

## Error Handling

The library provides flexible error handling through callbacks:

### Method 1: Error Callback

```typescript
await walker.walk(
  './src',
  {},
  (relativePath) => {
    console.log('Processing:', relativePath);
  },
  (error) => {
    // Custom error handling
    console.error('Walk error:', error.message);
    // Log to file, send alert, etc.
  }
);
```

### Method 2: Default Logging

If no error callback is provided, errors are logged automatically:

```typescript
await walker.walk(
  './src',
  {},
  (relativePath) => {
    console.log('Processing:', relativePath);
  }
  // Errors will be logged to console automatically
);
```

### Error Scenarios Handled

- **Directory not found** - Directory read error (ENOENT)
- **Permission denied** - File access errors (EACCES)
- **Invalid path** - Stat operation failures
- **Symbolic links** - Automatically skipped (not an error)
- **RegExp errors** - Caught and logged in debug mode

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm 10.8.2 or yarn equivalent

### Installation

```bash
# Clone repository
git clone https://github.com/nojaja/dir-walker.git
cd dir-walker

# Install dependencies
npm install
```

### Development Commands

```bash
# Run unit tests
npm run test

# Run tests with coverage report
npm run test:ci

# TypeScript type checking
npm run type-check

# Linting with ESLint
npm run lint

# Build production bundle
npm run build

# Build development bundle (with source maps)
npm run build:dev

# Generate API documentation
npm run docs

# Analyze dependency health
npm run depcruise

# Clean build artifacts
npm run clean
```

### Build Output

The build process generates:
- **dist/dirwalker.bundle.js** - UMD bundle for universal compatibility
- **dist/index.d.ts** - TypeScript type definitions
- **dist/** - Other compiled modules

### Project Scripts Reference

| Script | Purpose |
|--------|---------|
| `build` | Production-optimized Webpack bundle |
| `build:dev` | Development bundle with source maps |
| `test` | Run Jest unit tests |
| `test:ci` | Run tests with coverage reporting |
| `type-check` | TypeScript type checking |
| `lint` | ESLint code quality check |
| `clean` | Remove dist/ directory |
| `depcruise` | Dependency graph analysis |
| `docs` | Generate TypeDoc HTML documentation |

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { 
  DirWalker, 
  WalkSettings, 
  FileCallback, 
  ErrorCallback 
} from '@nojaja/dirwalker';

const settings: WalkSettings = {
  excludeDirs: [/node_modules/, /\.git/],
  excludeExt: [/\.log$/, /\.tmp$/]
};

const fileCallback: FileCallback = async (relativePath, settings) => {
  console.log(`Processing: ${relativePath}`);
};

const errorCallback: ErrorCallback = (error) => {
  console.error(`Error: ${error.message}`);
};

const walker = new DirWalker();
await walker.walk('./src', settings, fileCallback, errorCallback);
```

## Current Status

**Version**: 1.0.0 (Initial Release)

### ✅ Completed Features
- Recursive directory traversal with async/await support
- RegExp-based pattern matching for directories and file extensions
- Symbolic link detection and automatic skipping
- TypeScript with strict mode enabled
- Comprehensive type definitions and JSDoc annotations
- Debug mode for detailed logging
- Unit tests with >80% code coverage
- Zero external runtime dependencies
- UMD bundle for universal compatibility
- Webpack bundling configuration

### Performance Characteristics
- **Memory**: O(depth) - scales with directory tree depth
- **Speed**: I/O bound - depends on file system performance
- **Scalability**: Suitable for projects with thousands of files
- **Async**: Non-blocking using fs/promises

## License

MIT

## Author

**nojaja** <free.riccia@gmail.com> ([GitHub](https://github.com/nojaja))

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Repository

- **Repository**: [GitHub - nojaja/dir-walker](https://github.com/nojaja/dir-walker)
- **Issues**: [GitHub Issues](https://github.com/nojaja/dir-walker/issues)
- **NPM Package**: [@nojaja/dirwalker](https://www.npmjs.com/package/@nojaja/dirwalker)
