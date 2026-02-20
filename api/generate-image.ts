/**
 * Image Generation API — Serverless Function
 *
 * POST /api/generate-image
 * Body: { prompt: string }
 * Returns: { imageUrl: string, imageData: string, mimeType: string }
 *
 * Uses gemini-2.5-flash-image via generateContent with responseModalities: ["IMAGE"].
 * Response image is extracted from candidates[0].content.parts[].inlineData.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_PROMPT_LENGTH = 2000;
const GEMINI_TIMEOUT_MS = 30_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[generate-image] Handler called');

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

  if (!process.env.GEMINI_API_KEY) {
    console.error('[generate-image] Missing GEMINI_API_KEY');
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment.' });
  }

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" in request body' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'Prompt exceeds maximum length' });
  }

  console.log('[generate-image] Prompt:', prompt.substring(0, 100));

  const model = 'gemini-2.5-flash-image';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    console.log('[generate-image] Calling Gemini image generation API...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('[generate-image] Response status:', response.status);

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('[generate-image] API error:', errBody.substring(0, 300));
      return res.status(response.status).json({
        error: `Imagen API error (${response.status})`,
        details: errBody,
      });
    }

    const data = await response.json();

    // Extract base64 image from candidates[0].content.parts[].inlineData
    const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData);
    const imageData: string | undefined = imagePart?.inlineData?.data;
    const mimeType: string = imagePart?.inlineData?.mimeType || 'image/png';

    if (!imageData) {
      console.error('[generate-image] No image in response:', JSON.stringify(data).substring(0, 300));
      return res.status(500).json({ error: 'No image returned from API' });
    }

    console.log('[generate-image] Image generated, size:', imageData.length, 'chars');

    return res.status(200).json({
      imageData,
      imageUrl: `data:${mimeType};base64,${imageData}`,
      mimeType,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('[generate-image] Error:', err?.message);
    if (err?.name === 'AbortError') {
      return res.status(504).json({ error: 'Image generation timed out.' });
    }
    return res.status(500).json({ error: err?.message ?? 'Image generation failed.' });
  }
}
