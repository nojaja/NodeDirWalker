import * as fs from 'fs/promises';
import * as path from 'path';
import { PatternMatcher } from './PatternMatcher';

/**
 * Settings for directory walking
 */
export interface WalkSettings {
  /** Array of regex patterns for directories to exclude */
  excludeDirs?: RegExp[];
  /** Array of regex patterns for file extensions to exclude */
  excludeExt?: RegExp[];
}

/**
 * Callback function called for each file found
 * @param relativePath - The relative path of the file from the base directory
 * @param settings - The walk settings object
 */
export type FileCallback = (
  relativePath: string,
  settings: WalkSettings
) => void | Promise<void>;

/**
 * Callback function called when an error occurs
 * @param error - The error that occurred
 */
export type ErrorCallback = (error: Error) => void;

/**
 * A lightweight directory walker utility with pattern matching support
 */
export class DirWalker {
  private debug: boolean;
  private counter: number;
  private matcher: PatternMatcher;

  /**
   * Creates a new DirWalker instance
   * @param debug - Enable debug logging. Default: false
   */
  constructor(debug = false) {
    this.debug = debug;
    this.counter = 0;
    this.matcher = new PatternMatcher(debug);
  }

  /**
   * Recursively walks through a directory and processes files matching the specified criteria
   * @param targetPath - The root directory path to start walking from
   * @param settings - Configuration object with exclude patterns
   * @param fileCallback - Called for each matching file
   * @param errCallback - Called when an error occurs
   * @returns Promise that resolves to the total count of processed files
   */
  async walk(
    targetPath: string,
    settings: WalkSettings = { excludeDirs: [], excludeExt: [] },
    fileCallback: FileCallback,
    errCallback?: ErrorCallback
  ): Promise<number> {
    this.counter = 0;
    const _settings: WalkSettings = { ...settings };

    await this._walk(targetPath, targetPath, _settings, fileCallback, errCallback);

    return this.counter;
  }

  /**
   * Internal recursive method for directory traversal
   * @private
   */
  private async _walk(
    targetPath: string,
    basePath: string,
    settings: WalkSettings,
    fileCallback: FileCallback,
    errCallback?: ErrorCallback
  ): Promise<void> {
    try {
      // Get list of files in directory
      const files = await fs.readdir(targetPath);

      // Process each file
      for (const file of files) {
        const filePath = path.resolve(targetPath, file);

        try {
          // Get file information
          const stat = await fs.stat(filePath);

          // Skip symbolic links to prevent infinite loops
          if (stat.isSymbolicLink()) {
            if (this.debug) {
              console.debug(`シンボリックリンクをスキップ: ${filePath}`);
            }
            continue;
          }

          if (stat.isDirectory()) {
            // Skip if directory matches exclude pattern
            if (this.matcher.match(filePath, settings.excludeDirs)) {
              continue;
            }
            // Recursively process subdirectory
            await this._walk(filePath, basePath, settings, fileCallback, errCallback);
          } else {
            // Skip if file matches exclude pattern
            if (this.matcher.match(filePath, settings.excludeExt)) {
              continue;
            }

            // Increment counter and execute callback for file
            this.counter++;
            if (this.debug) {
              console.debug(`ファイル発見: ${filePath}`);
            }

            // Calculate relative path
            const relativePath = path.relative(basePath, filePath);

            try {
              await fileCallback(relativePath, settings);
            } catch (error) {
              this._handleError(
                `ファイル処理エラー: ${filePath}`,
                error as Error,
                errCallback
              );
            }
          }
        } catch (error) {
          // Handle file stat errors
          this._handleError(
            `ファイル情報取得エラー: ${filePath}`,
            error as Error,
            errCallback
          );
        }
      }
    } catch (error) {
      // Handle directory read errors
      this._handleError(
        `ディレクトリ読み取りエラー: ${targetPath}`,
        error as Error,
        errCallback
      );
    }
  }

  /**
   * Helper method to handle errors
   * @private
   */
  private _handleError(
    message: string,
    error: Error,
    errCallback?: ErrorCallback
  ): void {
    if (typeof errCallback === 'function') {
      errCallback(error);
    } else {
      console.error(`${message}: ${error.message}`);
    }
  }
}

export default DirWalker;
