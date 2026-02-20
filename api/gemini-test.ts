/**
 * Gemini Test API — Serverless Function
 *
 * POST /api/gemini-test
 * Body: { prompt?: string }
 * Returns: { text: string }
 *
 * Makes a direct Gemini generateContent call for quick connectivity testing.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_TIMEOUT_MS = 20_000;
const DEFAULT_PROMPT =
  'Write one interesting fact about science or nature. One sentence only.';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[gemini-test] Handler called');
  
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('[gemini-test] OPTIONS request');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('[gemini-test] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('[gemini-test] Missing API key');
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment.' });
  }

  const prompt = typeof req.body?.prompt === 'string' && req.body.prompt.trim()
    ? req.body.prompt.trim()
    : DEFAULT_PROMPT;
  
  console.log('[gemini-test] Prompt:', prompt.substring(0, 50));

  const model = process.env.GEMINI_HINT_MODEL || 'gemini-2.5-flash';
  console.log('[gemini-test] Using model:', model);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    console.log('[gemini-test] Calling Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
          },
        }),
        signal: controller.signal,
      }
    );

    console.log('[gemini-test] Response status:', response.status);
    
    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.log('[gemini-test] API error:', errBody.substring(0, 200));
      return res.status(response.status).json({
        error: `Gemini API error (${response.status})`,
        details: errBody,
      });
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('')
        .trim() ?? '';

    console.log('[gemini-test] Generated text:', text.substring(0, 50));

    if (!text) {
      console.log('[gemini-test] Empty response');
      return res.status(500).json({ error: 'Gemini returned empty text.' });
    }

    console.log('[gemini-test] Success!');
    return res.status(200).json({ text });
  } catch (err: any) {
    console.log('[gemini-test] Error:', err?.message);
    if (err?.name === 'AbortError') {
      return res.status(504).json({ error: 'Gemini test request timed out.' });
    }
    return res.status(500).json({ error: err?.message ?? 'Gemini test failed.' });
  } finally {
    clearTimeout(timeoutId);
  }
}

