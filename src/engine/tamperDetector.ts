/**
 * Tamper Detector
 *
 * Intercepts SQL queries before execution and checks for destructive
 * operations (DROP, DELETE, UPDATE, INSERT). In the game fiction,
 * these represent "evidence tampering" — the detective is not supposed
 * to modify the crime scene data, only read it.
 */

export type TamperType =
  | 'DROP'
  | 'DELETE'
  | 'UPDATE'
  | 'INSERT'
  | 'ALTER'
  | 'TRUNCATE'
  | 'REPLACE';

export interface TamperResult {
  /** True if the query is safe (read-only) */
  safe: boolean;
  /** If not safe, what kind of tampering was detected */
  tamperType?: TamperType;
  /** A detective-flavored warning message */
  message?: string;
}

// Patterns that indicate destructive intent.
// We match at word boundaries to avoid false positives.
const TAMPER_PATTERNS: Array<{ regex: RegExp; type: TamperType; message: string }> = [
  {
    regex: /\bDROP\s+(TABLE|INDEX|VIEW|TRIGGER)\b/i,
    type: 'DROP',
    message: '🚨 Destroying evidence? Attempting to DROP database objects is evidence tampering!',
  },
  {
    regex: /\bDELETE\s+FROM\b/i,
    type: 'DELETE',
    message: '🚨 Trying to erase records? DELETE operations constitute evidence tampering!',
  },
  {
    // Match UPDATE ... SET but not column names like "last_updated"
    regex: /\bUPDATE\s+\w+\s+SET\b/i,
    type: 'UPDATE',
    message: '🚨 Falsifying records? UPDATE operations are evidence tampering!',
  },
  {
    regex: /\bINSERT\s+(OR\s+\w+\s+)?INTO\b/i,
    type: 'INSERT',
    message: '🚨 Planting false evidence? INSERT operations are evidence tampering!',
  },
  {
    regex: /\bREPLACE\s+INTO\b/i,
    type: 'REPLACE',
    message: '🚨 Swapping evidence? REPLACE operations are evidence tampering!',
  },
  {
    regex: /\bALTER\s+TABLE\b/i,
    type: 'ALTER',
    message: '🚨 Restructuring the crime scene? ALTER TABLE is evidence tampering!',
  },
  {
    regex: /\bTRUNCATE\b/i,
    type: 'TRUNCATE',
    message: '🚨 Wiping all records? TRUNCATE is evidence tampering!',
  },
];

/**
 * Check a SQL string for destructive operations.
 * Returns a TamperResult indicating whether the query is safe.
 */
export function detectTampering(sql: string): TamperResult {
  // Strip SQL comments and string literals to avoid false positives/negatives
  const cleaned = stripCommentsAndStrings(sql);

  for (const pattern of TAMPER_PATTERNS) {
    if (pattern.regex.test(cleaned)) {
      return {
        safe: false,
        tamperType: pattern.type,
        message: pattern.message,
      };
    }
  }

  return { safe: true };
}

/**
 * Get a detective reaction message based on the strike count.
 * Escalates from stern to furious as strikes accumulate.
 */
export function getStrikeReaction(strikeCount: number): string {
  switch (strikeCount) {
    case 1:
      return '🕵️ "Detective, I\'ll pretend I didn\'t see that. Stick to SELECT queries — we observe the evidence, we don\'t change it."';
    case 2:
      return '🕵️ "This is your second offense. One more and I\'m resetting the entire case file. You\'re on thin ice."';
    case 3:
      return '🕵️ "That\'s it. Three strikes — I\'m restoring the evidence to its original state. Don\'t make me do this again."';
    default:
      return strikeCount > 3
        ? '🕵️ "You keep tampering with evidence. The database has been restored. I\'m watching you."'
        : '🕵️ "Evidence tampering detected."';
  }
}

// ---- Helpers ----

/**
 * Strip SQL comments and string literals to prevent:
 *   1. Destructive keywords hidden after comments
 *   2. False positives from keywords inside string values
 *      (e.g., "This DELETE query" in a column value)
 */
function stripCommentsAndStrings(sql: string): string {
  let result = '';
  let i = 0;

  while (i < sql.length) {
    // Single-line comment
    if (sql[i] === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    // Multi-line comment
    if (sql[i] === '/' && sql[i + 1] === '*') {
      i += 2;
      while (i < sql.length - 1 && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i += 2; // skip */
      continue;
    }

    // Single-quoted string literal — replace with placeholder
    if (sql[i] === "'") {
      result += "'__STR__'";
      i++;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          i += 2; // escaped quote
          continue;
        }
        if (sql[i] === "'") {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // Double-quoted identifier — replace with placeholder
    if (sql[i] === '"') {
      result += '"__ID__"';
      i++;
      while (i < sql.length && sql[i] !== '"') i++;
      i++; // skip closing "
      continue;
    }

    result += sql[i];
    i++;
  }

  return result;
}
