# dir-walker

A lightweight, flexible directory walker utility for Node.js with pattern matching support.

## Features

- 🚀 **Fast & Efficient**: Asynchronous recursive directory traversal
- 🎯 **Pattern Matching**: Built-in support for excluding directories and file extensions
- 🔒 **Safe**: Automatically skips symbolic links to prevent infinite loops
- 📦 **Zero Dependencies**: No external runtime dependencies
- 🎨 **TypeScript**: Full TypeScript support with comprehensive type definitions
- ⚡ **ESM Ready**: Native ES Module support

## Installation

```bash
npm install dir-walker
```

## Quick Start

```typescript
import { DirWalker } from 'dir-walker';

const walker = new DirWalker();

await walker.walk(
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
```

## API Reference

### Class: `DirWalker`

#### Constructor

```typescript
new DirWalker(debug?: boolean)
```

- `debug` (optional): Enable debug logging. Default: `false`

#### Methods

##### `walk(targetPath, settings, fileCallback, errCallback): Promise<number>`

Recursively walks through a directory and processes files matching the specified criteria.

**Parameters:**

- `targetPath` (string): The root directory path to start walking from
- `settings` (WalkSettings): Configuration object
  - `excludeDirs` (RegExp[]): Array of regex patterns for directories to exclude
  - `excludeExt` (RegExp[]): Array of regex patterns for file extensions to exclude
- `fileCallback` (FileCallback): Called for each matching file
  - Signature: `(relativePath: string, settings: WalkSettings) => void | Promise<void>`
- `errCallback` (ErrorCallback): Called when an error occurs
  - Signature: `(error: Error) => void`

**Returns:** `Promise<number>` - The total count of processed files

## Usage Examples

### Basic Usage

```typescript
import { DirWalker } from 'dir-walker';

const walker = new DirWalker();
const count = await walker.walk(
  './src',
  {},
  (file) => console.log(file),
  (err) => console.error(err)
);

console.log(`Processed ${count} files`);
```

### Excluding Directories

```typescript
const walker = new DirWalker();

await walker.walk(
  './project',
  {
    excludeDirs: [
      /node_modules/,
      /\.git/,
      /dist/,
      /coverage/
    ]
  },
  (file) => {
    // Process only files outside excluded directories
    console.log(file);
  }
);
```

### Filtering by File Extension

```typescript
const walker = new DirWalker();

await walker.walk(
  './src',
  {
    excludeExt: [
      /\.test\.ts$/,
      /\.spec\.ts$/,
      /\.d\.ts$/
    ]
  },
  (file) => {
    // Process only non-test TypeScript files
    console.log(file);
  }
);
```

### Processing Files with Async Operations

```typescript
import { DirWalker } from 'dir-walker';
import { readFile } from 'fs/promises';

const walker = new DirWalker();

await walker.walk(
  './docs',
  {
    excludeExt: [/\.md$/i]  // Only markdown files
  },
  async (file) => {
    const content = await readFile(file, 'utf-8');
    // Process file content
  },
  (error) => {
    console.error('Failed to read file:', error);
  }
);
```

### Debug Mode

```typescript
const walker = new DirWalker(true); // Enable debug mode

await walker.walk(
  './src',
  {},
  (file) => console.log('Processing:', file)
);
// Debug logs will show:
// - Skipped symbolic links
// - Discovered files
```

## Error Handling

The library provides two ways to handle errors:

1. **Error Callback**: Pass an error callback function as the 4th parameter
2. **Default Logging**: If no error callback is provided, errors are logged internally

```typescript
// With error callback
await walker.walk(
  './src',
  {},
  (file) => { /* ... */ },
  (error) => {
    // Custom error handling
    logToFile(error);
    notifyAdmin(error);
  }
);

// Without error callback (errors logged to console)
await walker.walk(
  './src',
  {},
  (file) => { /* ... */ }
);
```

## Advanced Usage

### Collecting File Statistics

```typescript
const stats = {
  totalFiles: 0,
  totalSize: 0,
  byExtension: new Map<string, number>()
};

const walker = new DirWalker();

await walker.walk(
  './project',
  { excludeDirs: [/node_modules/] },
  async (file) => {
    const stat = await fs.stat(file);
    const ext = path.extname(file);
    
    stats.totalFiles++;
    stats.totalSize += stat.size;
    stats.byExtension.set(
      ext,
      (stats.byExtension.get(ext) || 0) + 1
    );
  }
);

console.log('Statistics:', stats);
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { DirWalker, WalkSettings, FileCallback, ErrorCallback } from 'dir-walker';

const settings: WalkSettings = {
  excludeDirs: [/node_modules/],
  excludeExt: [/\.log$/]
};

const fileCallback: FileCallback = async (relativePath, settings) => {
  // Type-safe callback
};

const errorCallback: ErrorCallback = (error) => {
  // Type-safe error handling
};
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
