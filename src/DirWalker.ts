import * as fs from 'fs/promises';
import * as path from 'path';
import { RegExpArray } from '@nojaja/greputil';

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

  /**
   * Creates a new DirWalker instance
   * @param {boolean} debug - Enable debug logging. Default: false
   */
  constructor(debug = false) {
    this.debug = debug;
    this.counter = 0;
  }

  /**
   * Recursively walks through a directory and processes files matching the specified criteria
   * @param {string} targetPath - The root directory path to start walking from
   * @param {WalkSettings} settings - Configuration object with exclude patterns
   * @param {FileCallback} fileCallback - Called for each matching file
   * @param {ErrorCallback} errCallback - Called when an error occurs
   * @returns {Promise<number>} Promise that resolves to the total count of processed files
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
   * @param {string} targetPath - The current directory path being traversed
   * @param {string} basePath - The original base path for calculating relative paths
   * @param {WalkSettings} settings - Configuration object with exclude patterns
   * @param {FileCallback} fileCallback - Called for each matching file
   * @param {ErrorCallback} errCallback - Called when an error occurs
   * @returns {Promise<void>}
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
          await this._processEntry(
            filePath,
            basePath,
            settings,
            fileCallback,
            errCallback
          );
        } catch (error) {
          // Handle file stat errors
          this._handleError(
            `ファイル処理エラー: ${filePath}`,
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
   * Process a single file system entry (file or directory)
   * @private
   * @param {string} filePath - The path to the file system entry
   * @param {string} basePath - The original base path for calculating relative paths
   * @param {WalkSettings} settings - Configuration object with exclude patterns
   * @param {FileCallback} fileCallback - Called for each matching file
   * @param {ErrorCallback} errCallback - Called when an error occurs
   * @returns {Promise<void>}
   */
  private async _processEntry(
    filePath: string,
    basePath: string,
    settings: WalkSettings,
    fileCallback: FileCallback,
    errCallback?: ErrorCallback
  ): Promise<void> {
    // Get file information
    const stat = await fs.stat(filePath);

    // Skip symbolic links to prevent infinite loops
    if (stat.isSymbolicLink()) {
      if (this.debug) {
        console.debug(`シンボリックリンクをスキップ: ${filePath}`);
      }
      return;// シンボリックリンクは無視する
    }

    if (stat.isDirectory()) {
      await this._processDirectory(filePath, basePath, settings, fileCallback, errCallback);
    } else {
      await this._processFile(filePath, basePath, settings, fileCallback, errCallback);
    }
  }

  /**
   * Process a directory entry
   * @private
   * @param {string} filePath - The directory path
   * @param {string} basePath - The original base path for calculating relative paths
   * @param {WalkSettings} settings - Configuration object with exclude patterns
   * @param {FileCallback} fileCallback - Called for each matching file
   * @param {ErrorCallback} errCallback - Called when an error occurs
   * @returns {Promise<void>}
   */
  private async _processDirectory(
    filePath: string,
    basePath: string,
    settings: WalkSettings,
    fileCallback: FileCallback,
    errCallback?: ErrorCallback
  ): Promise<void> {
    // Skip if directory matches exclude pattern
    if (settings.excludeDirs && settings.excludeDirs.length > 0) {
      const matcher = new RegExpArray(settings.excludeDirs);
      if (matcher.test(filePath)) {
        return;
      }
    }
    // Recursively process subdirectory
    // ディレクトリの場合は再帰的に呼び出す
    await this._walk(filePath, basePath, settings, fileCallback, errCallback);
  }

  /**
   * Process a file entry
   * @private
   * @param {string} filePath - The file path
   * @param {string} basePath - The original base path for calculating relative paths
   * @param {WalkSettings} settings - Configuration object with exclude patterns
   * @param {FileCallback} fileCallback - Called for each matching file
   * @param {ErrorCallback} errCallback - Called when an error occurs
   * @returns {Promise<void>}
   */
  private async _processFile(
    filePath: string,
    basePath: string,
    settings: WalkSettings,
    fileCallback: FileCallback,
    errCallback?: ErrorCallback
  ): Promise<void> {
    // Skip if file matches exclude pattern
    if (settings.excludeExt && settings.excludeExt.length > 0) {
      const matcher = new RegExpArray(settings.excludeExt);
      if (matcher.test(filePath)) {
        return;
      }
    }

    // Increment counter and execute callback for file
    this.counter++;
    if (this.debug) {
      console.debug(`ファイル発見: ${filePath}`);
    }

    // Calculate relative path
    const relativePath = path.relative(basePath, filePath);

    try {
      await fileCallback(relativePath, settings);// ファイルならコールバックで通知
    } catch (error) {
      this._handleError(
        `ファイル処理エラー: ${filePath}`,
        error as Error,
        errCallback
      );
    }
  }

  /**
   * Helper method to handle errors
   * @private
   * @param {string} message - Error message context
   * @param {Error} error - The error object to handle
   * @param {ErrorCallback} errCallback - Callback to invoke with the error
   * @returns {void}
   */
  private _handleError(
    message: string,
    error: Error,
    errCallback?: ErrorCallback
  ): void {
    if (typeof errCallback === 'function') {
      errCallback(error);
    } else {
      console.error(`${message}: ${error.message}`);// エラーが発生した場合はエラーログを出力
    }
  }
}

export default DirWalker;
