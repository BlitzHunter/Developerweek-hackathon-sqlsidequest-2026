# SQL Side Quest

An interactive detective game for [Miro](https://miro.com) that teaches SQL through mystery solving. Players write SQL queries against an in-browser SQLite database to uncover clues, reveal suspects, and close the case. Players write SQL queries against an in-browser SQLite database to uncover clues, reveal suspects, and close the case.

## Features

- **In-browser SQL engine** powered by [sql.js](https://github.com/sql-js/sql.js) (SQLite compiled to WebAssembly)
- **Interactive Miro board** with cinematic reveal sequences — camera pans, evidence webs, red string connectors, and suspect card flips
- **AI-generated mysteries** using Google Gemini for infinite replayability
- **AI detective partner** that provides contextual, escalating hints
- **AI image generation** using Gemini Imagen to visualize clues and evidence
- **Text-to-speech** narration via ElevenLabs API
- **Anti-tampering system** that detects destructive SQL and tracks integrity strikes
- **Multiple difficulty levels** from beginner JOINs to advanced CTEs and window functions
- **Game state persistence** via localStorage for resuming investigations
- **Fallback mysteries** so the game works even without an API key

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- A [Miro developer account](https://developers.miro.com/) with a registered app
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) *(optional — fallback mysteries are built-in)*

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd sql-side-quest
npm install
```

### 2. Copy the WebAssembly file

```bash
cp node_modules/sql.js/dist/sql-wasm.wasm public/
```

> On Windows (PowerShell):
> ```powershell
> Copy-Item node_modules/sql.js/dist/sql-wasm.wasm public/
> ```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

| Variable | Required | Description |
|---|---|---|
| `VITE_MIRO_APP_ID` | Yes | Your Miro app ID |
| `GEMINI_API_KEY` | Optional | Enables AI mystery generation and hints |
| `ELEVENLABS_API_KEY` | Optional | Enables text-to-speech narration |
| `VITE_RAIN_BG_URL` | Optional | Public URL for rain background GIF |
| `VITE_CORK_IMAGE_URL` | Optional | Public URL for cork board image |

### 4. Configure your Miro app

1. Go to the [Miro Developer Portal](https://miro.com/app/settings/user-profile/apps)
2. Set **App URL** to `http://localhost:3000`
3. Set **SDK URI** to `/app.html`
4. Enable `boards:read` and `boards:write` permissions

### 5. Start the development server

```bash
# Frontend only (uses built-in fallback mysteries)
npm run dev

# Frontend + AI API server (enables Gemini mystery generation and hints)
npm run dev:full
```

### 6. Open a Miro board

Open any Miro board and launch the **SQL Side Quest** app from the toolbar.

## Project Structure

```
src/
  app.tsx              # Root React component
  components/          # React UI components
  engine/              # SQL engine, game state, validation, tamper detection
  board/               # Miro board layout, choreography, item helpers
  ai/                  # LLM integration (mystery generation, hints, prompts)
  data/                # Sample and fallback mystery data
  types/               # TypeScript type definitions
  utils/               # Helpers (sleep, storage, imageLoader)
api/
  generate.ts          # Mystery generation endpoint
  hint.ts              # Hint generation endpoint
  dev-server.ts        # Local dev API server
public/
  image/               # Images loaded onto the board
  gif/                 # Animated GIFs for ambient effects
```

## License

MIT
