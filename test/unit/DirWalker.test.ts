import path from 'path';
import { DirWalker } from '../../src/DirWalker';

// Mock fs/promises module
jest.mock('fs/promises');

// Get the mocked module
import * as fsPromises from 'fs/promises';
const mockReaddir = (fsPromises.readdir as jest.Mock);
const mockStat = (fsPromises.stat as jest.Mock);

describe('DirWalker', () => {
  const mockTargetPath = path.normalize('/mock/target');
  let mockFileCallback: jest.Mock;
  let mockErrCallback: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockReaddir.mockReset();
    mockStat.mockReset();

    // Create fresh callback mocks
    mockFileCallback = jest.fn();
    mockErrCallback = jest.fn();
  });

  describe('constructor', () => {
    // Given（前提）: DirWalkerをインスタンス化
    // When（操作）: デバッグモードを指定せずにインスタンス化
    // Then（期待）: デフォルトでdebugはfalse、counterは0
    it('should initialize with default debug mode false', () => {
      const walker = new DirWalker();
      expect(walker['debug']).toBe(false);
      expect(walker['counter']).toBe(0);
    });

    // Given（前提）: DirWalkerをインスタンス化
    // When（操作）: デバッグモードをtrueで指定
    // Then（期待）: debugがtrueで初期化される
    it('should initialize with debug mode true when specified', () => {
      const walker = new DirWalker(true);
      expect(walker['debug']).toBe(true);
      expect(walker['counter']).toBe(0);
    });
  });

  describe('walk method', () => {
    // Given（前提）: 1つのファイルを含むディレクトリ
    // When（操作）: walkメソッドを実行
    // Then（期待）: 1ファイルが処理され、カウント1が返される
    it('should process single file in directory', async () => {
      mockReaddir.mockResolvedValue(['test.txt']);
      mockStat.mockResolvedValue({
        isDirectory: () => false,
        isSymbolicLink: () => false,
      });

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(1);
      expect(mockFileCallback).toHaveBeenCalledTimes(1);
      expect(mockFileCallback).toHaveBeenCalledWith('test.txt', {});
      expect(mockErrCallback).not.toHaveBeenCalled();
    });

    // Given（前提）: 複数のファイルを含むディレクトリ
    // When（操作）: walkメソッドを実行
    // Then（期待）: すべてのファイルが処理される
    it('should process multiple files in directory', async () => {
      mockReaddir.mockResolvedValue(['file1.txt', 'file2.js', 'file3.json']);
      mockStat.mockResolvedValue({
        isDirectory: () => false,
        isSymbolicLink: () => false,
      });

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(3);
      expect(mockFileCallback).toHaveBeenCalledTimes(3);
      expect(mockFileCallback).toHaveBeenCalledWith('file1.txt', {});
      expect(mockFileCallback).toHaveBeenCalledWith('file2.js', {});
      expect(mockFileCallback).toHaveBeenCalledWith('file3.json', {});
    });

    // Given（前提）: サブディレクトリを含むディレクトリ構造
    // When（操作）: walkメソッドを実行
    // Then（期待）: サブディレクトリ内のファイルも再帰的に処理される
    it('should recursively process subdirectories', async () => {
      mockReaddir
        .mockResolvedValueOnce(['subdir', 'root.txt'])
        .mockResolvedValueOnce(['nested.txt']);

      mockStat
        .mockResolvedValueOnce({
          isDirectory: () => true,
          isSymbolicLink: () => false,
        })
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => false,
        })
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => false,
        });

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(2);
      expect(mockFileCallback).toHaveBeenCalledTimes(2);
      expect(mockFileCallback).toHaveBeenCalledWith('root.txt', {});
      expect(mockFileCallback).toHaveBeenCalledWith(path.join('subdir', 'nested.txt'), {});
    });

    // Given（前提）: シンボリックリンクを含むディレクトリ
    // When（操作）: walkメソッドを実行
    // Then（期待）: シンボリックリンクはスキップされる
    it('should skip symbolic links', async () => {
      mockReaddir.mockResolvedValue(['symlink.txt', 'regular.txt']);
      mockStat
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => true,
        })
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => false,
        });

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(1);
      expect(mockFileCallback).toHaveBeenCalledTimes(1);
      expect(mockFileCallback).toHaveBeenCalledWith('regular.txt', {});
    });

    // Given（前提）: デバッグモードが有効
    // When（操作）: シンボリックリンクを含むディレクトリをwalk
    // Then（期待）: デバッグログが出力される
    it('should log debug information when debug mode is enabled', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      
      mockReaddir.mockResolvedValue(['symlink.txt', 'regular.txt']);
      mockStat
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => true,
        })
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => false,
        });

      const walker = new DirWalker(true);
      await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('シンボリックリンクをスキップ')
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('ファイル発見'));
      
      consoleDebugSpy.mockRestore();
    });

    // Given（前提）: ディレクトリ読み取りエラーが発生
    // When（操作）: walkメソッドを実行
    // Then（期待）: エラーコールバックが呼ばれる
    it('should handle directory read errors', async () => {
      const readError = new Error('Permission denied');
      mockReaddir.mockRejectedValue(readError);

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(0);
      expect(mockErrCallback).toHaveBeenCalledWith(readError);
      expect(mockFileCallback).not.toHaveBeenCalled();
    });

    // Given（前提）: ファイル情報取得エラーが発生
    // When（操作）: walkメソッドを実行
    // Then（期待）: エラーコールバックが呼ばれる
    it('should handle file stat errors', async () => {
      const statError = new Error('File access error');
      mockReaddir.mockResolvedValue(['problematic.txt']);
      mockStat.mockRejectedValue(statError);

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(0);
      expect(mockErrCallback).toHaveBeenCalledWith(statError);
      expect(mockFileCallback).not.toHaveBeenCalled();
    });

    // Given（前提）: ファイルコールバックでエラーが発生
    // When（操作）: walkメソッドを実行
    // Then（期待）: エラーコールバックが呼ばれるが、処理は継続
    it('should handle file callback errors', async () => {
      const callbackError = new Error('Callback processing error');
      mockReaddir.mockResolvedValue(['test.txt']);
      mockStat.mockResolvedValue({
        isDirectory: () => false,
        isSymbolicLink: () => false,
      });
      mockFileCallback.mockRejectedValue(callbackError);

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(1);
      expect(mockErrCallback).toHaveBeenCalledWith(callbackError);
    });

    // Given（前提）: エラーコールバックが指定されていない
    // When（操作）: エラーが発生するwalkを実行
    // Then（期待）: エラーがコンソールにログ出力される
    it('should log errors when no error callback provided', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const readError = new Error('Permission denied');
      mockReaddir.mockRejectedValue(readError);

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback);

      expect(result).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ディレクトリ読み取りエラー')
      );
      
      consoleErrorSpy.mockRestore();
    });

    // Given（前提）: 設定オブジェクトが渡される
    // When（操作）: walkメソッドを実行
    // Then（期待）: 設定がファイルコールバックに渡される
    it('should pass settings to file callback', async () => {
      const settings = { excludeDirs: [/node_modules/], excludeExt: [/\.log$/] };
      mockReaddir.mockResolvedValue(['test.txt']);
      mockStat.mockResolvedValue({
        isDirectory: () => false,
        isSymbolicLink: () => false,
      });

      const walker = new DirWalker();
      await walker.walk(mockTargetPath, settings, mockFileCallback, mockErrCallback);

      expect(mockFileCallback).toHaveBeenCalledWith('test.txt', settings);
    });

    // Given（前提）: 空のディレクトリ
    // When（操作）: walkメソッドを実行
    // Then（期待）: カウント0が返され、コールバックは呼ばれない
    it('should handle empty directory', async () => {
      mockReaddir.mockResolvedValue([]);

      const walker = new DirWalker();
      const result = await walker.walk(mockTargetPath, {}, mockFileCallback, mockErrCallback);

      expect(result).toBe(0);
      expect(mockFileCallback).not.toHaveBeenCalled();
      expect(mockErrCallback).not.toHaveBeenCalled();
    });

    // Given（前提）: excludeDirsパターンが指定されている
    // When（操作）: パターンにマッチするディレクトリを含むパスをwalk
    // Then（期待）: マッチするディレクトリはスキップされる
    it('should exclude directories matching excludeDirs patterns', async () => {
      mockReaddir
        .mockResolvedValueOnce(['node_modules', 'src', 'file.txt'])
        .mockResolvedValueOnce(['index.js']);

      mockStat
        .mockResolvedValueOnce({
          isDirectory: () => true,
          isSymbolicLink: () => false,
        })
        .mockResolvedValueOnce({
          isDirectory: () => true,
          isSymbolicLink: () => false,
        })
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => false,
        })
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isSymbolicLink: () => false,
        });

      const walker = new DirWalker();
      const settings = { excludeDirs: [/node_modules/] };
      const result = await walker.walk(
        mockTargetPath,
        settings,
        mockFileCallback,
        mockErrCallback
      );

      expect(result).toBe(2);
      expect(mockFileCallback).toHaveBeenCalledTimes(2);
    });

    // Given（前提）: excludeExtパターンが指定されている
    // When（操作）: パターンにマッチするファイルを含むディレクトリをwalk
    // Then（期待）: マッチするファイルはスキップされる
    it('should exclude files matching excludeExt patterns', async () => {
      mockReaddir.mockResolvedValue(['test.js', 'test.log', 'readme.md']);
      mockStat.mockResolvedValue({
        isDirectory: () => false,
        isSymbolicLink: () => false,
      });

      const walker = new DirWalker();
      const settings = { excludeExt: [/\.log$/] };
      const result = await walker.walk(
        mockTargetPath,
        settings,
        mockFileCallback,
        mockErrCallback
      );

      expect(result).toBe(2);
      expect(mockFileCallback).toHaveBeenCalledTimes(2);
      expect(mockFileCallback).toHaveBeenCalledWith('test.js', settings);
      expect(mockFileCallback).toHaveBeenCalledWith('readme.md', settings);
      expect(mockFileCallback).not.toHaveBeenCalledWith('test.log', expect.anything());
    });
  });
});
