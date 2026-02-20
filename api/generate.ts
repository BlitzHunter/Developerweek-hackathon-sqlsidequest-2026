/**
 * Mystery Generation API — Serverless Function
 *
 * POST /api/generate
 * Body: { prompt: string, difficulty: string }
 * Returns: { mystery: MysteryData }
 *
 * Uses Google Gemini API for mystery generation.
 * Set GEMINI_API_KEY in environment variables.
 *
 * Deployment: Vercel Functions or Cloudflare Workers
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_PROMPT_LENGTH = 40_000; // Clue generation includes full DDL+data for 18 tables
const GEMINI_TIMEOUT_MS = 120_000; // 120 seconds for complex generations (18 tables)

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

    const mysteryJson = await callGemini(prompt);
    
    // For backward compatibility, wrap in mystery object
    // But also include the raw text for new generation types
    const parsedData = parseJsonFromLLM(mysteryJson);
    
    return res.status(200).json({
      mystery: parsedData,  // Legacy format
      ...parsedData,        // Also spread at top level for easier access
      text: mysteryJson,    // Include raw text for debugging
    });
  } catch (err: unknown) {
    console.error('Mystery generation failed:', err);
    return res.status(500).json({ error: 'Mystery generation failed. Please try again.' });
  }
}

// ---- LLM Providers ----

async function callGemini(prompt: string): Promise<string> {
  const primaryModel = process.env.GEMINI_GENERATE_MODEL || 'gemini-2.5-pro';
  const models = Array.from(new Set([primaryModel, 'gemini-2.5-flash', 'gemini-2.0-flash']));
  let lastError: unknown = null;

  for (const model of models) {
    try {
      return await callGeminiModel(model, prompt);
    } catch (err) {
      lastError = err;
      console.warn(`Gemini generate model "${model}" failed:`, err);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini generation failed.');
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
            temperature: 0.8,
            maxOutputTokens: 16000, // Increased for table schema generation
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
      throw new Error(`Gemini returned empty generation text [${model}]`);
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---- JSON Extraction ----

function parseJsonFromLLM(raw: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch {
    // not direct JSON
  }

  // Try extracting from markdown code fence
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // continue
    }
  }

  // Try finding the first { ... } block
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
    } catch {
      // continue
    }
  }

  throw new Error('Failed to parse JSON from LLM response');
}
