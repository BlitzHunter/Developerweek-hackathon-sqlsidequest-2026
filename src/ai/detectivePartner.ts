/**
 * Detective Partner — AI-powered contextual hints
 *
 * Sends the current game context to an LLM and returns a detective-flavored
 * hint. Falls back to the static hint text from the mystery data if the
 * API is unavailable.
 */

import type { MysteryData, Clue, QueryResult } from '../types/mystery';
import { buildHintPrompt } from './prompts';

export interface HintContext {
  mystery: MysteryData;
  clue: Clue;
  userQuery: string | null;
  queryResult: QueryResult | null;
  hintLevel: number; // 1 = subtle, 2 = moderate, 3 = strong
}

const HINT_TIMEOUT_MS = 15_000;

/**
 * Request an AI-generated hint from the detective partner.
 * Falls back to the clue's static hint on failure.
 */
export async function requestHint(ctx: HintContext): Promise<string> {
  try {
    const prompt = buildHintPrompt(
      ctx.mystery,
      ctx.clue,
      ctx.userQuery,
      ctx.queryResult,
      ctx.hintLevel
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HINT_TIMEOUT_MS);

    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }

    const data = await response.json();
    const hint = data.hint ?? data.message ?? data.text;

    if (typeof hint === 'string' && hint.trim().length > 0) {
      return hint.trim();
    }

    throw new Error('Empty hint response');
  } catch {
    return fallbackHint(ctx);
  }
}

/**
 * Static fallback when the API is unavailable.
 * Uses the hint text embedded in the mystery data.
 */
function fallbackHint(ctx: HintContext): string {
  if (ctx.hintLevel >= 3 && ctx.clue.stronger_hint) {
    return ctx.clue.stronger_hint;
  }
  return ctx.clue.hint;
}
