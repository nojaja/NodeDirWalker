yarn add @nojaja/dirwalker
# @nojaja/dirwalker

Lightweight, callback-first directory walker for Node.js. Provides recursive traversal with RegExp-based exclusion for directories and extensions, returns relative file paths, and ships with TypeScript types out of the box.

## Project Overview

- Purpose: walk a directory tree asynchronously and execute your callback for each file while skipping symlinks and unwanted paths.
- Package: `@nojaja/dirwalker` (`type: commonjs`, main: `dist/dirwalker.bundle.js`).
- Current version: 1.0.1.

## Project Structure

```
.
├── src/
│   ├── DirWalker.ts          # Core implementation and exported types
│   └── index.ts              # Public export surface
├── test/
│   ├── unit/DirWalker.test.ts# Jest unit tests (mocked fs/promises)
│   └── fixtures/             # Fixture roots for tests
├── dist/                     # Build artifacts (generated)
├── docs/                     # Generated API docs (typedoc)
├── dependency-extractor/     # Separate dependency extraction tool (see its README)
├── webpack.config.js         # Webpack bundle settings
├── jest.unit.config.js       # Jest config for unit tests
├── tsconfig.json             # TypeScript config (strict)
├── package.json              # Scripts and metadata
└── README.md
```

## Technology Stack

- TypeScript 5.3.3 (strict) on Node.js >=18
- Webpack 5.99.8 for production and development bundles
- Jest 29.6.1 with ts-jest for unit tests
- ESLint 8.45.0 + TypeScript ESLint, Prettier 3.0.0
- Runtime deps: `@nojaja/greputil` (RegExpArray helper), `@nojaja/pathutil`

## Features

### Completed
- Async recursive traversal using `fs/promises`
- Exclude directories and extensions with RegExp arrays
- Skips symbolic links to avoid cycles
- Passes relative paths to your callback
- Optional debug logging (console.debug)
- Error handling via callback or default console.error
- Bundled output (`dist/dirwalker.bundle.js`) plus `.d.ts` types

### Limitations / Not Included
- Only exclusion filters are supported (no include/allowlist API)
- No synchronous API; traversal is async-only
- No built-in CLI; use the library programmatically

## Installation

```bash
npm install @nojaja/dirwalker
# or
yarn add @nojaja/dirwalker
```

Requirements: Node.js 18+ and npm 10.8.2+.

## Usage (Library)

### Basic example

```typescript
import { DirWalker } from '@nojaja/dirwalker';

const walker = new DirWalker();

const count = await walker.walk(
  './my-directory',
  {},
  (relativePath) => {
    console.log(relativePath);
  }
);

console.log(`Processed ${count} files`);
```

### Excluding directories and extensions

```typescript
const walker = new DirWalker();

await walker.walk(
  './project',
  {
    excludeDirs: [/node_modules/, /\.git/, /dist/],
    excludeExt: [/\.log$/, /\.map$/]
  },
  (relativePath) => {
    console.log('source file:', relativePath);
  }
);
```

### Handling errors explicitly

```typescript
const walker = new DirWalker(true); // enable debug logs

await walker.walk(
  './src',
  {},
  async (file) => {
    // async work per file is allowed
  },
  (error) => {
    // custom error handling
    console.error('walk error:', error.message);
  }
);
```

### API reference

| Export | Description |
|--------|-------------|
| `class DirWalker` | `constructor(debug?: boolean)` creates a walker instance. |
| `walk(targetPath: string, settings: WalkSettings, fileCallback: FileCallback, errCallback?: ErrorCallback): Promise<number>` | Recursively traverses `targetPath`, executes `fileCallback` for each file, and returns the processed file count. |
| `WalkSettings` | `{ excludeDirs?: RegExp[]; excludeExt?: RegExp[]; }` exclusion patterns. |
| `FileCallback` | `(relativePath: string, settings: WalkSettings) => void | Promise<void>` receives the path relative to `targetPath`. |
| `ErrorCallback` | `(error: Error) => void` invoked on errors; defaults to console.error when omitted. |

## Development Setup

### Local setup

```bash
git clone https://github.com/nojaja/NodeDirWalker.git
cd NodeDirWalker
npm install
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build production bundle (webpack, outputs to dist/). |
| `npm run build:dev` | Build development bundle with source maps. |
| `npm run test` | Run Jest unit tests (uses jest.unit.config.js). |
| `npm run test:ci` | Run tests with coverage. |
| `npm run test:coverage` | Run Jest with coverage via `--experimental-vm-modules`. |
| `npm run lint` | ESLint TypeScript linting. |
| `npm run type-check` | TypeScript type checking with `tsc --noEmit`. |
| `npm run depcruise` | Dependency cruiser analysis. |
| `npm run docs` | Generate typedoc output into docs/. |
| `npm run clean` | Remove dist/. |

## Technical Details

- Uses `fs.promises.readdir` + `fs.promises.stat` for traversal; symlinks are skipped intentionally.
- Pattern matching relies on `RegExpArray` from `@nojaja/greputil` for both directory and extension filters.
- Callbacks receive file paths relative to the root you pass to `walk`.
- Errors are surfaced via `ErrorCallback`; when omitted they are logged with Japanese messages for clarity.

## Current Status

- Package version: 1.0.1.
- Scope: library-only; no CLI or web UI components.
- Tests: unit coverage for traversal, exclusions, symlink skipping, debug logging, and error handling (see test/unit/DirWalker.test.ts).

## Performance / Goals

- Traversal is I/O bound; memory scales with directory depth (O(depth)).
- Designed for thousands of files while keeping callbacks async to avoid blocking the event loop.

## License & Author

- License: MIT
- Author: nojaja <free.riccia@gmail.com> (https://github.com/nojaja)

## Related Projects

- `dependency-extractor/`: companion tool (same repo) to detect project manifests and export dependency lists. See its README for usage.
