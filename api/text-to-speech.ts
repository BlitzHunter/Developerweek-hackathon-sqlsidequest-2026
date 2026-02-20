/**
 * Text-to-Speech API — Serverless Function
 *
 * POST /api/text-to-speech
 * Body: { text: string }
 * Returns: { audioUrl: string }
 *
 * Converts text to speech using ElevenLabs API with Rachel voice.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ELEVENLABS_TIMEOUT_MS = 30_000;
const VOICE_ID = 'CVP7d0EDsPO8YR2fweYp'; // Custom voice

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[text-to-speech] Handler called');
  
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('[text-to-speech] OPTIONS request');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('[text-to-speech] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    console.log('[text-to-speech] Missing API key');
    return res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY in environment.' });
  }

  const text = req.body?.text;
  
  if (!text || typeof text !== 'string' || !text.trim()) {
    console.log('[text-to-speech] Missing or invalid text');
    return res.status(400).json({ error: 'Text is required' });
  }
  
  console.log('[text-to-speech] Text:', text.substring(0, 50));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ELEVENLABS_TIMEOUT_MS);

  try {
    console.log('[text-to-speech] Calling ElevenLabs API...');
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 0.8, // Range: 0.25 (slowest) to 4.0 (fastest), default: 1.0
          },
        }),
        signal: controller.signal,
      }
    );

    console.log('[text-to-speech] Response status:', response.status);
    
    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.log('[text-to-speech] API error:', errBody.substring(0, 200));
      return res.status(response.status).json({
        error: `ElevenLabs API error (${response.status})`,
        details: errBody,
      });
    }

    // Get the audio buffer
    const audioBuffer = await response.arrayBuffer();
    console.log('[text-to-speech] Audio generated, size:', audioBuffer.byteLength, 'bytes');

    // Convert to base64 data URL
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('[text-to-speech] Success!');
    return res.status(200).json({ audioUrl });
  } catch (err: any) {
    console.log('[text-to-speech] Error:', err?.message);
    if (err?.name === 'AbortError') {
      return res.status(504).json({ error: 'Text-to-speech request timed out.' });
    }
    return res.status(500).json({ error: err?.message ?? 'Text-to-speech failed.' });
  } finally {
    clearTimeout(timeoutId);
  }
}
