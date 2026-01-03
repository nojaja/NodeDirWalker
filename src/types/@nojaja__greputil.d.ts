declare module '@nojaja/greputil' {
  /**
   * Type alias for pattern input to RegExpArray static methods
   */
  type PatternInput = string | RegExp | (string | RegExp)[] | null;

  /**
   * RegExpArray class for managing multiple regular expression patterns
   */
  export class RegExpArray {
    /**
     * Creates a new RegExpArray instance
     * @param patterns - Array of regex patterns (string, RegExp, or [pattern, flags] format)
     */
    constructor(patterns: (string | RegExp | [string, string])[]);
    
    /**
     * Executes all patterns against a string and returns all matches
     * @param str - String to test
     * @returns Array of match results or null
     */
    exec(str: string): string[] | null;
    
    /**
     * Tests if any pattern matches the string
     * @param str - String to test
     * @returns true if any pattern matches, false otherwise
     */
    test(str: string): boolean;
    
    /**
     * Returns the first match result
     * @param str - String to test
     * @returns First match result or null
     */
    firstMatch(str: string): RegExpExecArray | null;
    
    /**
     * Returns array of RegExp objects
     * @returns Array of RegExp objects
     */
    toArray(): RegExp[];
    
    /**
     * Static method: returns all match results
     * @param str - String to test
     * @param patterns - Patterns to test (string, RegExp, array, or null)
     * @returns Two-dimensional array of matches or null
     */
    static matchAll(str: string, patterns: PatternInput): string[][] | null;
    
    /**
     * Static method: returns first match result
     * @param str - String to test
     * @param patterns - Patterns to test (string, RegExp, array, or null)
     * @returns First match result or null
     */
    static firstMatch(str: string, patterns: PatternInput): RegExpExecArray | null;
    
    /**
     * Static method: tests if any pattern matches
     * @param str - String to test
     * @param patterns - Patterns to test (string, RegExp, array, or null)
     * @returns true if any pattern matches, false otherwise
     */
    static test(str: string, patterns: PatternInput): boolean;
  }

  /**
   * BufferPatternMatcher class for binary data pattern matching
   */
  export class BufferPatternMatcher {
    /**
     * Creates a new BufferPatternMatcher instance
     */
    constructor();
    
    /**
     * Compares buffer against multiple patterns
     * @param buffer - Buffer to compare
     * @param patterns - Array of buffer patterns or null
     * @returns true if matches, false if no match, null if patterns is null
     */
    compareBuf(buffer: Buffer, patterns: Buffer[] | null): boolean | null;
  }
}
