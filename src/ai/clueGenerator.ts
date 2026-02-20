/**
 * Clue Generator — AI-powered mystery clue generation
 *
 * Generates 6 investigation clues (one per city location) that reference
 * actual tables and data values from the generated table schemas.
 * Each clue includes a `location` field ('box1'–'box6') so it can be
 * placed as a sticky note inside the matching city box on the board.
 */

import type { Clue, MysteryTable } from '../types/mystery';

export interface ClueGenerationContext {
  theme: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  locationNames: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  };
  tables: MysteryTable[];
}

const GENERATION_TIMEOUT_MS = 90_000;

// Maps the static location keys (assigned by tableSchemaGenerator) to box keys
const LOCATION_KEY_TO_BOX: Record<string, string> = {
  OFFICE: 'box1',
  POLICE: 'box2',
  CITY_BANK: 'box3',
  NIGHT_BAR: 'box4',
  DOWNTOWN_BISTRO: 'box5',
  HIGH_RISE_CONDO: 'box6',
};

/**
 * Generate 6 investigation clues tied to specific city locations.
 * Each clue references tables that exist at that location.
 */
export async function generateClues(context: ClueGenerationContext): Promise<Clue[]> {
  console.log('🔍 Generating mystery clues for theme:', context.theme);

  const prompt = buildCluePrompt(context);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        difficulty: context.difficulty,
        generationType: 'clues',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Clue generation failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const clues = parseClueResponse(data);
    console.log('✅ Generated', clues.length, 'clues');
    return clues;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Clue generation timed out after 90 seconds');
    throw err;
  }
}

// ---- Prompt builder ----

function buildCluePrompt(context: ClueGenerationContext): string {
  const { theme, difficulty, locationNames, tables } = context;

  // Group tables by box key
  const tablesByBox: Record<string, MysteryTable[]> = {
    box1: [], box2: [], box3: [], box4: [], box5: [], box6: [],
  };
  for (const table of tables) {
    const boxKey = LOCATION_KEY_TO_BOX[table.location || 'OFFICE'] || 'box1';
    tablesByBox[boxKey].push(table);
  }

  const difficultyGuide = {
    beginner: 'simple SELECT with WHERE filter or COUNT — single table',
    intermediate: 'JOIN across 2 tables, GROUP BY, or HAVING',
    advanced: 'subquery, CTE, or window function across multiple tables',
  }[difficulty];

  // Build per-location context — concise: column names from DDL + 2 INSERT rows per table
  const locationContext = (Object.keys(locationNames) as Array<keyof typeof locationNames>)
    .map((boxKey) => {
      const locName = locationNames[boxKey];
      const locTables = tablesByBox[boxKey] || [];
      if (locTables.length === 0) return `${boxKey.toUpperCase()}: ${locName}\n(no tables)`;
      const tableInfo = locTables.map((t) => {
        // Extract column list from DDL (avoid sending the full CREATE TABLE text)
        const colLines = t.ddl
          .split('\n')
          .filter((l) => /^\s+\w+\s+(TEXT|INTEGER|REAL|NUMERIC|BLOB|VARCHAR|FLOAT|DATE|DATETIME)/.test(l))
          .map((l) => l.trim().split(/\s+/).slice(0, 2).join(' ')) // "col_name TYPE" only
          .join(', ');
        // Include 2 INSERT rows so the AI knows real values for validation
        const sampleRows = t.inserts.slice(0, 2).join('\n');
        return `${t.name} (${colLines})\n${sampleRows}`;
      }).join('\n');
      return `${boxKey.toUpperCase()}: ${locName}\n${tableInfo}`;
    })
    .join('\n\n');

  return `You are designing an SQL detective mystery. Theme: "${theme}"

## DATABASE TABLES BY LOCATION
${locationContext}

## TASK
Generate exactly 6 investigation clues — one per location (box1 through box6).
Each clue should direct the player to query a specific table at that location.
Together the 6 clues form a chain that leads to identifying the culprit.

## SQL DIFFICULTY: ${difficulty}
Each clue's required SQL: ${difficultyGuide}

## OUTPUT FORMAT
Return ONLY a valid JSON array — no markdown, no explanation:
[
  {
    "id": 1,
    "order": 1,
    "location": "box1",
    "narrative": "2–3 sentence detective narration of what to investigate at this location",
    "hint": "which table(s) to query and what column to look for",
    "stronger_hint": "near-complete SQL query showing structure without exact values",
    "validation": {
      "type": "contains_rows",
      "required_values": [{"column": "exact_column_name", "value": "exact_value_from_inserts"}],
      "min_rows": 1,
      "max_rows": 10
    },
    "reveal_text": "1–2 sentence revelation of what this evidence proves",
    "evidence_summary": "3–5 word label",
    "timeline_entry": "5–8 word timeline label",
    "connects_to_clue": null
  },
  ...clue 2 with connects_to_clue: 1, clue 3 with connects_to_clue: 2, etc.
]

## RULES
1. "location" must be exactly one of: "box1", "box2", "box3", "box4", "box5", "box6"
2. "required_values" — column names MUST match actual DDL column names; values MUST exist in the INSERT statements
3. clue #1: connects_to_clue = null; clue #2: connects_to_clue = 1; and so on
4. Use "contains_rows" type for all clues — it is the most reliable validation
5. The narrative of each clue should make sense at that specific location`;
}

// ---- Response parser ----

function parseClueResponse(data: any): Clue[] {
  let raw: any;

  if (Array.isArray(data)) {
    raw = data;
  } else if (Array.isArray(data.mystery)) {
    raw = data.mystery;
  } else if (data.clues && Array.isArray(data.clues)) {
    raw = data.clues;
  } else if (typeof data.text === 'string') {
    let text = data.text.trim();
    // Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) text = fenceMatch[1];
    raw = JSON.parse(text);
    if (!Array.isArray(raw) && Array.isArray(raw?.clues)) raw = raw.clues;
  } else if (typeof data === 'object') {
    // Some API wrappers return the array nested
    const arr = data.result || data.data || data.output;
    if (Array.isArray(arr)) raw = arr;
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    console.error('❌ Unexpected clue response structure:', JSON.stringify(data).substring(0, 300));
    throw new Error('No clues returned from generation API');
  }

  return raw.map((c: any, i: number): Clue => ({
    id: typeof c.id === 'number' ? c.id : i + 1,
    order: typeof c.order === 'number' ? c.order : i + 1,
    location: typeof c.location === 'string' ? c.location : undefined,
    narrative: c.narrative || '{}',
    hint: c.hint || '{}',
    stronger_hint: c.stronger_hint || undefined,
    validation: c.validation || { type: 'row_count', expected_count: 1 },
    reveal_text: c.reveal_text || '{}',
    evidence_summary: c.evidence_summary || '{}',
    timeline_entry: c.timeline_entry || '{}',
    connects_to_clue: typeof c.connects_to_clue === 'number' ? c.connects_to_clue : undefined,
  }));
}
