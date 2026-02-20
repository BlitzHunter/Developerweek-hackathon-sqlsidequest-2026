/**
 * LLM Prompt Templates
 *
 * Centralized prompt definitions for mystery generation and detective hints.
 * Keeping prompts in one file makes them easy to iterate on and test.
 */

import type { MysteryData, Clue, QueryResult } from '../types/mystery';

// ---- Mystery Generation ----

export function buildMysteryGenerationPrompt(
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  theme?: string
): string {
  const difficultyGuide = {
    beginner: {
      tables: '3-4 tables',
      clues: '4-5 clues',
      joins: 'simple JOINs, basic WHERE filters, COUNT/SUM',
      description: 'Single-table queries progressing to simple JOINs',
    },
    intermediate: {
      tables: '4-5 tables',
      clues: '5-7 clues',
      joins: 'multi-table JOINs, GROUP BY, HAVING, subqueries',
      description: 'Multi-table JOINs, aggregations, and subqueries',
    },
    advanced: {
      tables: '5-7 tables',
      clues: '6-8 clues',
      joins: 'CTEs, window functions, correlated subqueries, self-joins',
      description: 'Advanced SQL including CTEs, window functions, and self-joins',
    },
  };

  const guide = difficultyGuide[difficulty];

  return `You are a mystery game designer creating an interactive SQL detective mystery.

## TASK
Generate a complete mystery case that players solve by writing SQL queries against an in-browser SQLite database.

## DIFFICULTY: ${difficulty.toUpperCase()}
- Tables: ${guide.tables}
- Clues: ${guide.clues}
- SQL concepts: ${guide.joins}
- Description: ${guide.description}

${theme ? `## THEME\n${theme}\n` : ''}
## REQUIREMENTS

### Story
- Create a compelling mystery with a clear crime, multiple suspects, and a satisfying reveal
- Each clue should logically lead to the next
- The narrative should feel like a real detective investigation
- Include red herrings in the data (innocent-looking records that aren't the answer)

### Database Schema
- Use realistic table and column names
- Include proper PRIMARY KEY and FOREIGN KEY constraints
- Add enough data to make queries non-trivial (15-30 rows per table)
- Plant evidence that can only be found with the right query
- Include some "normal" data alongside suspicious data

### Clues
- Each clue has a narrative (what the detective should investigate)
- Each clue has a hint and a stronger_hint for stuck players
- Each clue has validation rules to check if the query result is correct
- Clues should progress from simple to complex
- Each clue reveals new information that informs the next investigation step

### Validation Types
Use one of these for each clue:
- \`contains_rows\`: Result must contain specific values (use required_values array)
- \`exact_value\`: Result must have an exact value in a specific column
- \`row_count\`: Result must have a specific number of rows
- \`has_columns\`: Result must include specific columns

For \`contains_rows\`, also set \`min_rows\` and \`max_rows\` to prevent table dumps from solving clues.

## OUTPUT FORMAT
Return ONLY valid JSON matching this TypeScript interface (no markdown, no explanation):

{
  "title": "string — catchy case name",
  "briefing": "string — 2-3 sentence case introduction",
  "difficulty": "${difficulty}",
  "tables": [
    {
      "name": "string — lowercase_snake_case table name",
      "description": "string — what this table represents",
      "ddl": "string — full CREATE TABLE statement with types and constraints",
      "inserts": ["string — individual INSERT INTO statements"]
    }
  ],
  "clues": [
    {
      "id": "number — sequential starting at 1",
      "order": "number — same as id",
      "narrative": "string — what to investigate (shown to player)",
      "hint": "string — general guidance",
      "stronger_hint": "string — near-solution hint with example query structure",
      "validation": {
        "type": "contains_rows | exact_value | row_count | has_columns",
        "required_values": [{"column": "string", "value": "string|number"}],
        "required_columns": ["string"],
        "expected_count": "number (optional)",
        "min_rows": "number (optional)",
        "max_rows": "number (optional)"
      },
      "reveal_text": "string — what the evidence means (shown after solving)",
      "evidence_summary": "string — short label for evidence board",
      "timeline_entry": "string — short timeline label",
      "connects_to_clue": "number — id of the previous clue (omit for clue #1)"
    }
  ],
  "solution": {
    "culprit": "string — the guilty party's name",
    "motive": "string — why they did it",
    "final_narrative": "string — 2-3 sentence case wrap-up"
  }
}

## IMPORTANT RULES
1. Every INSERT must use valid SQLite syntax
2. All foreign keys must reference existing records
3. The culprit's name must appear in the employees/people table
4. Validation required_values columns must match actual column names in the expected query result
5. The stronger_hint should contain a near-complete SQL query
6. Do NOT use SQLite-incompatible features (no ENUM, no BOOLEAN — use INTEGER 0/1)
7. Dates should be TEXT in 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS' format
8. All table names and column names should be lowercase_snake_case`;
}

// ---- Detective Hint ----

export function buildHintPrompt(
  mystery: MysteryData,
  clue: Clue,
  userQuery: string | null,
  queryResult: QueryResult | null,
  hintLevel: number
): string {
  const schema = mystery.tables
    .map((t) => `Table: ${t.name}\n${t.ddl}`)
    .join('\n\n');

  const contextParts: string[] = [];

  if (userQuery) {
    contextParts.push(`The player's last query was:\n\`\`\`sql\n${userQuery}\n\`\`\``);
  }

  if (queryResult?.error) {
    contextParts.push(`Their query had an error: ${queryResult.error}`);
  } else if (queryResult && queryResult.rows.length > 0) {
    contextParts.push(
      `Their query returned ${queryResult.rows.length} rows with columns: ${queryResult.columns.join(', ')}`
    );
  } else if (queryResult?.empty) {
    contextParts.push('Their query returned no results.');
  }

  const hintIntensity =
    hintLevel <= 1
      ? 'Give a subtle hint — point them in the right direction without giving away the answer.'
      : hintLevel === 2
      ? 'Give a moderate hint — suggest which tables/columns to look at and what kind of SQL clause to use.'
      : 'Give a strong hint — describe the query structure they need, but let them write the exact SQL.';

  return `You are a grizzled detective partner in an interactive SQL side quest game.
You speak in a noir detective style — brief, atmospheric, with dry wit.
Keep responses to 1-3 sentences maximum.

## CASE: "${mystery.title}"

## DATABASE SCHEMA
${schema}

## CURRENT CLUE (#${clue.order})
Narrative: ${clue.narrative}
What they need to find: ${clue.hint}

${contextParts.length > 0 ? '## PLAYER CONTEXT\n' + contextParts.join('\n') : ''}

## HINT LEVEL
${hintIntensity}

## RULES
- Stay in character as a detective partner
- Never reveal the exact SQL query — let them figure it out
- Reference specific table/column names when giving moderate+ hints
- If they had an error, help them fix it
- If their query returned wrong results, explain what to look for
- Keep it to 1-3 sentences
- Use detective metaphors and noir language`;
}

// ---- AI Detective Chat (general commentary) ----

export function buildDetectiveCommentaryPrompt(
  context: 'wrong_answer' | 'multiple_failures' | 'tampering' | 'progress',
  details: string
): string {
  return `You are a grizzled detective partner. Give a brief 1-sentence reaction.
Context: ${context}
Details: ${details}
Rules: Stay in noir character. Be encouraging but not hand-holding. Max 1 sentence.`;
}
