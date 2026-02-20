/**
 * Clue Validator
 *
 * Checks whether query results satisfy a clue's validation requirements.
 * Returns pass/fail with feedback message.
 * Includes anti-cheat checks to prevent solving clues by dumping entire tables.
 */

import type { Clue, QueryResult, ValidationResult } from '../types/mystery';

/**
 * Maximum rows allowed for a result to "count" as a targeted query.
 * If the user just dumps an entire table, their result likely has many
 * more rows than needed and we should nudge them to be more specific.
 */
const MAX_ROWS_TOLERANCE_FACTOR = 3; // allow up to 3× the expected result size

export function validateQueryResult(
  result: QueryResult,
  clue: Clue
): ValidationResult {
  // Can't validate if there was an error
  if (result.error) {
    return { passed: false, feedback: `Query error: ${result.error}` };
  }

  // Can't validate empty results for most validation types
  if (result.empty || result.rows.length === 0) {
    return {
      passed: false,
      feedback: 'Your query returned no results. Try adjusting your WHERE clause.',
    };
  }

  const v = clue.validation;

  switch (v.type) {
    case 'contains_rows':
      return validateContainsRows(result, v, clue);

    case 'exact_value':
      return validateExactValue(result, v);

    case 'row_count':
      return validateRowCount(result, v);

    case 'has_columns':
      return validateHasColumns(result, v);

    case 'exact_match':
      return validateExactMatch(result, v);

    default:
      return { passed: false, feedback: 'Unknown validation type.' };
  }
}

// ---- Validators ----

function validateContainsRows(
  result: QueryResult,
  v: any,
  clue: Clue
): ValidationResult {
  // ---- Anti-cheat: reject overly broad results ----
  // If min_rows is specified, the result shouldn't be vastly larger than needed.
  // This prevents "SELECT * FROM table" from solving clues.
  if (v.min_rows !== undefined) {
    const maxAllowed = v.min_rows * MAX_ROWS_TOLERANCE_FACTOR;
    if (result.rows.length > maxAllowed) {
      return {
        passed: false,
        feedback: `Your query returned ${result.rows.length} rows — that's too broad. ` +
          `Try narrowing your search with a WHERE clause to focus on the relevant evidence.`,
      };
    }
  }

  // Even without min_rows, reject results with too many rows (likely a table dump)
  // A targeted query should usually return fewer than 15 rows for our mysteries.
  if (!v.min_rows && result.rows.length > 20) {
    return {
      passed: false,
      feedback: `Your query returned ${result.rows.length} rows. ` +
        `That's a lot of data — try using a WHERE clause to narrow down to the specific evidence.`,
    };
  }

  // Check min rows if specified
  if (v.min_rows !== undefined && result.rows.length < v.min_rows) {
    return {
      passed: false,
      feedback: `Your query returned ${result.rows.length} row(s), but we need at least ${v.min_rows}. Try broadening your search.`,
    };
  }

  // Check required values
  if (v.required_values && v.required_values.length > 0) {
    for (const req of v.required_values) {
      const colIndex = result.columns.indexOf(req.column);
      if (colIndex === -1) {
        // Check if the column exists with different casing
        const lowerCols = result.columns.map(c => c.toLowerCase());
        const lowerReq = req.column.toLowerCase();
        if (!lowerCols.includes(lowerReq)) {
          return {
            passed: false,
            feedback: `Your results are missing the "${req.column}" column. Make sure it's included in your SELECT.`,
          };
        }
        // Use the case-insensitive match
        const actualIndex = lowerCols.indexOf(lowerReq);
        const found = result.rows.some(
          (row) => String(row[actualIndex]).toLowerCase() === String(req.value).toLowerCase()
        );
        if (!found) {
          return {
            passed: false,
            feedback: `Hmm, your results don't seem to contain the key evidence. Look more carefully at the data.`,
          };
        }
        continue;
      }
      const found = result.rows.some(
        (row) => String(row[colIndex]).toLowerCase() === String(req.value).toLowerCase()
      );
      if (!found) {
        return {
          passed: false,
          feedback: `Hmm, your results don't seem to contain the key evidence. Look more carefully at the data.`,
        };
      }
    }
  }

  // Check required columns
  if (v.required_columns) {
    const lowerCols = result.columns.map((c) => c.toLowerCase());
    for (const reqCol of v.required_columns) {
      if (!lowerCols.includes(reqCol.toLowerCase())) {
        return {
          passed: false,
          feedback: `Your query is missing the "${reqCol}" column. Make sure to include it in your SELECT.`,
        };
      }
    }
  }

  return {
    passed: true,
    feedback: clue.reveal_text,
    clue_solved: clue.id,
  };
}

function validateExactValue(result: QueryResult, v: any): ValidationResult {
  if (!v.required_values) {
    return { passed: false, feedback: 'No validation criteria set.' };
  }

  // Anti-cheat: exact_value should have very few rows
  if (result.rows.length > 10) {
    return {
      passed: false,
      feedback: `Too many rows (${result.rows.length}). Narrow your query to find the specific value.`,
    };
  }

  for (const req of v.required_values) {
    const colIndex = result.columns.indexOf(req.column);
    if (colIndex === -1) {
      return {
        passed: false,
        feedback: `Column "${req.column}" not found in your results.`,
      };
    }
    const match = result.rows.some(
      (row) => String(row[colIndex]) === String(req.value)
    );
    if (!match) {
      return {
        passed: false,
        feedback: `The expected value was not found. Keep digging.`,
      };
    }
  }

  return { passed: true, feedback: 'Correct!' };
}

function validateRowCount(result: QueryResult, v: any): ValidationResult {
  if (v.expected_count !== undefined && result.rows.length !== v.expected_count) {
    return {
      passed: false,
      feedback: `Expected ${v.expected_count} rows but got ${result.rows.length}.`,
    };
  }
  if (v.min_rows !== undefined && result.rows.length < v.min_rows) {
    return {
      passed: false,
      feedback: `Need at least ${v.min_rows} rows, got ${result.rows.length}.`,
    };
  }
  if (v.max_rows !== undefined && result.rows.length > v.max_rows) {
    return {
      passed: false,
      feedback: `Too many rows. Expected at most ${v.max_rows}, got ${result.rows.length}.`,
    };
  }
  return { passed: true, feedback: 'Correct!' };
}

function validateHasColumns(result: QueryResult, v: any): ValidationResult {
  if (!v.required_columns) {
    return { passed: true, feedback: 'Correct!' };
  }
  const lowerCols = result.columns.map((c) => c.toLowerCase());
  for (const col of v.required_columns) {
    if (!lowerCols.includes(col.toLowerCase())) {
      return {
        passed: false,
        feedback: `Missing column "${col}" in your query results.`,
      };
    }
  }
  return { passed: true, feedback: 'Correct!' };
}

function validateExactMatch(result: QueryResult, v: any): ValidationResult {
  const minimalClue: Pick<Clue, 'reveal_text' | 'id' | 'order'> = {
    reveal_text: 'Correct!',
    id: 0,
    order: 0,
  };
  return validateContainsRows(result, v, minimalClue as Clue);
}
