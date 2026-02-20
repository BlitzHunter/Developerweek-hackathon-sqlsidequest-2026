/**
 * Detective Hint API — Serverless Function
 *
 * POST /api/hint
 * Body: { prompt: string }
 * Returns: { hint: string }
 *
 * Uses Google Gemini API for hint generation.
 * Uses a smaller/cheaper model (flash) for quick responses.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_PROMPT_LENGTH = 5000;
const GEMINI_TIMEOUT_MS = 20_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body ?? {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing "prompt" in request body' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'Prompt exceeds maximum length' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY in environment variables.',
      });
    }

    const hintText = await callGemini(prompt);
    return res.status(200).json({ hint: hintText.trim() });
  } catch (err: unknown) {
    console.error('Hint generation failed:', err);
    return res.status(500).json({ error: 'Hint generation failed. Please try again.' });
  }
}

// ---- LLM Providers ----

async function callGemini(prompt: string): Promise<string> {
  const primaryModel = process.env.GEMINI_HINT_MODEL || 'gemini-2.5-flash';
  const models = Array.from(new Set([primaryModel, 'gemini-2.0-flash']));
  let lastError: unknown = null;

  for (const model of models) {
    try {
      return await callGeminiModel(model, prompt);
    } catch (err) {
      lastError = err;
      console.warn(`Gemini hint model "${model}" failed:`, err);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini hint call failed.');
}

async function callGeminiModel(model: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Gemini API error (${response.status}) [${model}]: ${errBody}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';

    if (!text.trim()) {
      throw new Error(`Gemini returned empty hint text [${model}]`);
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

