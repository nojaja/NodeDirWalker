import { jest } from '@jest/globals';
import { PatternMatcher } from '../../src/PatternMatcher.js';

describe('PatternMatcher', () => {
  describe('constructor', () => {
    // Given（前提）: PatternMatcherをインスタンス化
    // When（操作）: デバッグモードを指定せずにインスタンス化
    // Then（期待）: デフォルトでdebugはfalse
    it('should initialize with default debug mode false', () => {
      const matcher = new PatternMatcher();
      expect(matcher['debug']).toBe(false);
    });

    // Given（前提）: PatternMatcherをインスタンス化
    // When（操作）: デバッグモードをtrueで指定
    // Then（期待）: debugがtrueで初期化される
    it('should initialize with debug mode true when specified', () => {
      const matcher = new PatternMatcher(true);
      expect(matcher['debug']).toBe(true);
    });
  });

  describe('match method', () => {
    let matcher: PatternMatcher;

    beforeEach(() => {
      matcher = new PatternMatcher();
    });

    // Given（前提）: パターン配列が与えられている
    // When（操作）: マッチするテキストをテスト
    // Then（期待）: trueが返される
    it('should return true when text matches a pattern', () => {
      const patterns = [/\.js$/, /\.ts$/];
      expect(matcher.match('test.js', patterns)).toBe(true);
      expect(matcher.match('test.ts', patterns)).toBe(true);
    });

    // Given（前提）: パターン配列が与えられている
    // When（操作）: マッチしないテキストをテスト
    // Then（期待）: falseが返される
    it('should return false when text does not match any pattern', () => {
      const patterns = [/\.js$/, /\.ts$/];
      expect(matcher.match('test.txt', patterns)).toBe(false);
      expect(matcher.match('readme.md', patterns)).toBe(false);
    });

    // Given（前提）: パターンがundefined
    // When（操作）: テキストをテスト
    // Then（期待）: falseが返される
    it('should return false when patterns is undefined', () => {
      expect(matcher.match('test.js', undefined)).toBe(false);
    });

    // Given（前提）: パターン配列が空
    // When（操作）: テキストをテスト
    // Then（期待）: falseが返される
    it('should return false when patterns array is empty', () => {
      expect(matcher.match('test.js', [])).toBe(false);
    });

    // Given（前提）: 複数パターンのうち1つがマッチ
    // When（操作）: テキストをテスト
    // Then（期待）: trueが返される
    it('should return true when any pattern matches', () => {
      const patterns = [/node_modules/, /\.git/, /dist/];
      expect(matcher.match('/path/to/node_modules/lib', patterns)).toBe(true);
      expect(matcher.match('/path/to/.git/config', patterns)).toBe(true);
      expect(matcher.match('/path/to/dist/output.js', patterns)).toBe(true);
    });
  });

  describe('matchEx method', () => {
    let matcher: PatternMatcher;

    beforeEach(() => {
      matcher = new PatternMatcher();
    });

    // Given（前提）: パターン配列が与えられている
    // When（操作）: マッチするテキストをテスト
    // Then（期待）: マッチしたRegExpが返される
    it('should return the matching RegExp when text matches', () => {
      const pattern1 = /\.js$/;
      const pattern2 = /\.ts$/;
      const patterns = [pattern1, pattern2];

      expect(matcher.matchEx('test.js', patterns)).toBe(pattern1);
      expect(matcher.matchEx('test.ts', patterns)).toBe(pattern2);
    });

    // Given（前提）: パターン配列が与えられている
    // When（操作）: マッチしないテキストをテスト
    // Then（期待）: nullが返される
    it('should return null when text does not match any pattern', () => {
      const patterns = [/\.js$/, /\.ts$/];
      expect(matcher.matchEx('test.txt', patterns)).toBeNull();
    });

    // Given（前提）: パターンがundefined
    // When（操作）: テキストをテスト
    // Then（期待）: nullが返される
    it('should return null when patterns is undefined', () => {
      expect(matcher.matchEx('test.js', undefined)).toBeNull();
    });

    // Given（前提）: 複数パターンが与えられている
    // When（操作）: 最初にマッチするテキストをテスト
    // Then（期待）: 最初にマッチしたパターンが返される
    it('should return the first matching pattern', () => {
      const pattern1 = /test/;
      const pattern2 = /\.js$/;
      const patterns = [pattern1, pattern2];

      const result = matcher.matchEx('test.js', patterns);
      expect(result).toBe(pattern1);
    });

    // Given（前提）: デバッグモード有効
    // When（操作）: エラーが発生するパターンをテスト
    // Then（期待）: nullが返され、エラーがログ出力される
    it('should handle errors gracefully in debug mode', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const debugMatcher = new PatternMatcher(true);

      // Invalid pattern that might cause error
      const invalidPatterns = [null as unknown as RegExp];
      const result = debugMatcher.matchEx('test', invalidPatterns);

      expect(result).toBeNull();
      consoleErrorSpy.mockRestore();
    });
  });
});
