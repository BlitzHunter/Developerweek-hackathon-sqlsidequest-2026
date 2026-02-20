/**
 * Local API Dev Server
 *
 * A minimal HTTP server that proxies the /api/generate, /api/hint, /api/gemini-test,
 * /api/generate-image, and /api/text-to-speech endpoints during local development. Run alongside `npm run dev`.
 *
 * Usage:
 *   1. Create a .env file with GEMINI_API_KEY and ELEVENLABS_API_KEY
 *   2. Run: npx tsx api/dev-server.ts
 *   3. The Vite dev server proxies /api/* to this server on port 3001
 *
 * In production, deploy the api/ functions to Vercel.
 */

import http from 'http';
import { config } from 'dotenv';

config(); // Load .env

const PORT = 3001;

async function loadHandler(name: string) {
  const mod = await import(`./${name}.ts`);
  return mod.default;
}

const server = http.createServer(async (req, res) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse body
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  let parsedBody: unknown = {};
  try {
    parsedBody = body ? JSON.parse(body) : {};
  } catch {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
    return;
  }

  // Build a minimal req/res adapter for the Vercel-style handlers
  const fakeReq: any = {
    method: req.method,
    body: parsedBody,
    headers: req.headers,
    url: req.url,
  };

  let statusCode = 200;
  const responseHeaders: Record<string, string> = {};
  let responseBody: any = null;

  const fakeRes: any = {
    setHeader: (k: string, v: string) => { responseHeaders[k] = v; },
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => { responseBody = data; },
        end: () => {},
      };
    },
    json: (data: any) => { responseBody = data; },
    end: () => {},
  };

  try {
    const url = req.url ?? '';
    // IMPORTANT: Check more specific routes BEFORE less specific ones
    // /api/generate-image must come before /api/generate
    if (url.startsWith('/api/generate-image')) {
      const handler = await loadHandler('generate-image');
      await handler(fakeReq, fakeRes);
    } else if (url.startsWith('/api/text-to-speech')) {
      const handler = await loadHandler('text-to-speech');
      await handler(fakeReq, fakeRes);
    } else if (url.startsWith('/api/gemini-test')) {
      const handler = await loadHandler('gemini-test');
      await handler(fakeReq, fakeRes);
    } else if (url.startsWith('/api/generate')) {
      const handler = await loadHandler('generate');
      await handler(fakeReq, fakeRes);
    } else if (url.startsWith('/api/hint')) {
      const handler = await loadHandler('hint');
      await handler(fakeReq, fakeRes);
    } else {
      statusCode = 404;
      responseBody = { error: 'Not found' };
    }
  } catch {
    statusCode = 500;
    responseBody = { error: 'Internal server error' };
  }

  for (const [k, v] of Object.entries(responseHeaders)) {
    res.setHeader(k, v);
  }
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(statusCode);
  res.end(JSON.stringify(responseBody));
});

server.listen(PORT, () => {
  console.log(`API dev server running on http://localhost:${PORT}`);
  console.log(`  Gemini key: ${process.env.GEMINI_API_KEY ? 'set ✓' : 'NOT SET ✗'}`);
  console.log(`  ElevenLabs key: ${process.env.ELEVENLABS_API_KEY ? 'set ✓' : 'NOT SET ✗'}`);
});
