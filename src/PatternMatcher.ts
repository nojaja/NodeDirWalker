/**
 * Pattern matcher utility for filtering files and directories
 */
export class PatternMatcher {
  private debug: boolean;

  /**
   * Creates a new PatternMatcher instance
   * @param {boolean} debug - Enable debug logging
   */
  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   * Tests if a text matches any of the provided patterns
   * @param {string} text - The text to test
   * @param {RegExp[]} patterns - Array of regular expressions to match against
   * @returns {boolean} True if any pattern matches, false otherwise
   */
  match(text: string, patterns?: RegExp[]): boolean {
    return this.matchEx(text, patterns) !== null;
  }

  /**
   * Tests if a text matches any of the provided patterns and returns the matching pattern
   * @param {string} text - The text to test
   * @param {RegExp[]} patterns - Array of regular expressions to match against
   * @returns {RegExp | null} The matching RegExp or null if no match
   */
  matchEx(text: string, patterns?: RegExp[]): RegExp | null {
    try {
      if (!patterns) return null;
      
      for (const pattern of patterns) {
        if (pattern && pattern.test && pattern.test(text)) {
          return pattern;
        }
      }
      return null;
    } catch (error) {
      if (this.debug) {
        console.error('正規表現マッチングエラー:', (error as Error).message);
      }
      return null;
    }
  }
}
