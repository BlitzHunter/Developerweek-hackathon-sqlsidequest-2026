/**
 * Mystery Generator — AI-powered mystery creation
 *
 * Calls the /api/generate endpoint to create new mysteries using an LLM.
 * Falls back to the sample mystery if the API call fails.
 *
 * The generator:
 *   1. Sends a structured prompt to the LLM
 *   2. Parses the JSON response
 *   3. Validates the structure matches MysteryData
 *   4. Returns the mystery or throws with a meaningful error
 */

import type { MysteryData } from '../types/mystery';
import { buildMysteryGenerationPrompt } from './prompts';

/** Configuration for mystery generation */
export interface GenerateOptions {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme?: string;
}

const GENERATE_TIMEOUT_MS = 30_000;

/**
 * Generate a new mystery via the API.
 * Returns parsed MysteryData on success.
 * Throws on failure (caller should handle fallback).
 */
export async function generateMystery(options: GenerateOptions): Promise<MysteryData> {
  const prompt = buildMysteryGenerationPrompt(options.difficulty, options.theme);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS);

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, difficulty: options.difficulty }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // The API should return { mystery: MysteryData } or the MysteryData directly
  const mystery: MysteryData = data.mystery ?? data;

  // Basic structural validation
  validateMysteryStructure(mystery);

  return mystery;
}

/**
 * Validate that the mystery JSON has the required structure.
 * Throws descriptive errors if something is missing.
 */
function validateMysteryStructure(mystery: any): asserts mystery is MysteryData {
  if (!mystery || typeof mystery !== 'object') {
    throw new Error('Mystery data is not an object');
  }

  const required = ['title', 'briefing', 'difficulty', 'tables', 'clues', 'solution'];
  for (const key of required) {
    if (!(key in mystery)) {
      throw new Error(`Mystery is missing required field: "${key}"`);
    }
  }

  if (!Array.isArray(mystery.tables) || mystery.tables.length === 0) {
    throw new Error('Mystery must have at least one table');
  }

  for (const table of mystery.tables) {
    if (!table.name || !table.ddl || !Array.isArray(table.inserts)) {
      throw new Error(`Table "${table.name || '?'}" is missing name, ddl, or inserts`);
    }
  }

  if (!Array.isArray(mystery.clues) || mystery.clues.length === 0) {
    throw new Error('Mystery must have at least one clue');
  }

  for (const clue of mystery.clues) {
    const clueReqs = ['id', 'order', 'narrative', 'hint', 'validation', 'reveal_text'];
    for (const key of clueReqs) {
      if (!(key in clue)) {
        throw new Error(`Clue #${clue.id ?? '?'} is missing "${key}"`);
      }
    }
    if (!clue.validation?.type) {
      throw new Error(`Clue #${clue.id} has no validation type`);
    }
    // Ensure evidence_summary and timeline_entry have defaults
    if (!clue.evidence_summary) clue.evidence_summary = clue.reveal_text?.substring(0, 60) ?? 'Evidence';
    if (!clue.timeline_entry) clue.timeline_entry = `Clue #${clue.order} solved`;
  }

  if (!mystery.solution?.culprit) {
    throw new Error('Mystery solution must specify a culprit');
  }
  if (!mystery.solution.motive) {
    mystery.solution.motive = 'Unknown motive';
  }
  if (!mystery.solution.final_narrative) {
    mystery.solution.final_narrative = `Case closed. ${mystery.solution.culprit} was the culprit.`;
  }
}
