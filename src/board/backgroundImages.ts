/**
 * Background Images — SVG-based backgrounds for Miro board frames.
 *
 * Uses inline SVG → base64 data URLs so no external hosting is needed.
 * Each background is sized to match the frame it sits behind.
 */

// ---- Helper: SVG string → base64 data URL ----

function svgToDataUrl(svg: string): string {
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

// ---- Case File Background ----
// Dark corkboard with pinned-paper texture, coffee stain, red string lines

export function caseFileBackground(width: number, height: number): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Cork texture pattern -->
      <pattern id="cork" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#1a1510"/>
        <circle cx="10" cy="10" r="1" fill="#2a2218" opacity="0.5"/>
        <circle cx="35" cy="5" r="1.5" fill="#221c12" opacity="0.4"/>
        <circle cx="50" cy="30" r="1" fill="#2a2218" opacity="0.3"/>
        <circle cx="15" cy="45" r="1.2" fill="#221c12" opacity="0.5"/>
        <circle cx="40" cy="50" r="0.8" fill="#2a2218" opacity="0.4"/>
        <circle cx="5" cy="25" r="1" fill="#1e1810" opacity="0.6"/>
      </pattern>

      <!-- Paper texture -->
      <filter id="paper-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.08" intercept="0"/>
          <feFuncG type="linear" slope="0.06" intercept="0"/>
          <feFuncB type="linear" slope="0.04" intercept="0"/>
        </feComponentTransfer>
        <feComposite in2="SourceGraphic" operator="in"/>
      </filter>

      <!-- Vignette gradient -->
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="transparent"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.4)"/>
      </radialGradient>
    </defs>

    <!-- Base cork background -->
    <rect width="100%" height="100%" fill="url(#cork)"/>

    <!-- Paper-like document area (centered) -->
    <rect x="${width * 0.08}" y="${height * 0.12}" width="${width * 0.84}" height="${height * 0.76}"
          rx="4" fill="#f5f0e6" opacity="0.06"/>

    <!-- Red string lines (detective board feel) -->
    <line x1="${width * 0.1}" y1="${height * 0.3}" x2="${width * 0.45}" y2="${height * 0.15}"
          stroke="#b03030" stroke-width="1.5" opacity="0.25" stroke-dasharray="8,6"/>
    <line x1="${width * 0.55}" y1="${height * 0.85}" x2="${width * 0.9}" y2="${height * 0.7}"
          stroke="#b03030" stroke-width="1.5" opacity="0.2" stroke-dasharray="8,6"/>
    <line x1="${width * 0.3}" y1="${height * 0.9}" x2="${width * 0.7}" y2="${height * 0.1}"
          stroke="#b03030" stroke-width="1" opacity="0.12" stroke-dasharray="12,8"/>

    <!-- Push pins -->
    <circle cx="${width * 0.1}" cy="${height * 0.12}" r="8" fill="#cc3333" opacity="0.7"/>
    <circle cx="${width * 0.1}" cy="${height * 0.12}" r="3" fill="#ff6666" opacity="0.9"/>
    <circle cx="${width * 0.9}" cy="${height * 0.12}" r="8" fill="#cc3333" opacity="0.7"/>
    <circle cx="${width * 0.9}" cy="${height * 0.12}" r="3" fill="#ff6666" opacity="0.9"/>

    <!-- Coffee stain (subtle) -->
    <ellipse cx="${width * 0.82}" cy="${height * 0.75}" rx="45" ry="42"
             fill="none" stroke="#3a2a18" stroke-width="3" opacity="0.15"/>
    <ellipse cx="${width * 0.82}" cy="${height * 0.75}" rx="40" ry="37"
             fill="none" stroke="#3a2a18" stroke-width="1" opacity="0.1"/>

    <!-- CLASSIFIED watermark -->
    <text x="${width * 0.5}" y="${height * 0.55}" text-anchor="middle"
          font-family="Impact, Arial Black, sans-serif" font-size="120"
          fill="#b03030" opacity="0.04" transform="rotate(-15, ${width * 0.5}, ${height * 0.55})"
          letter-spacing="20">CLASSIFIED</text>

    <!-- Vignette overlay -->
    <rect width="100%" height="100%" fill="url(#vignette)"/>

    <!-- Subtle top border line -->
    <line x1="0" y1="2" x2="${width}" y2="2" stroke="#b03030" stroke-width="3" opacity="0.5"/>
  </svg>`;

  return svgToDataUrl(svg);
}

// ---- Suspects Background ----
// Dark interrogation room feel with spotlight effect

export function suspectsBackground(width: number, height: number): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="spotlight" cx="50%" cy="20%" r="70%">
        <stop offset="0%" stop-color="#2a2018" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#0a0806" stop-opacity="1"/>
      </radialGradient>
      <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none"/>
        <line x1="40" y1="0" x2="40" y2="40" stroke="#1a1610" stroke-width="0.5" opacity="0.3"/>
        <line x1="0" y1="40" x2="40" y2="40" stroke="#1a1610" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>

    <!-- Base -->
    <rect width="100%" height="100%" fill="#0d0a08"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <rect width="100%" height="100%" fill="url(#spotlight)"/>

    <!-- Mugshot height lines -->
    <line x1="0" y1="${height * 0.3}" x2="${width}" y2="${height * 0.3}"
          stroke="#333" stroke-width="0.5" opacity="0.3"/>
    <line x1="0" y1="${height * 0.5}" x2="${width}" y2="${height * 0.5}"
          stroke="#333" stroke-width="0.5" opacity="0.3"/>
    <line x1="0" y1="${height * 0.7}" x2="${width}" y2="${height * 0.7}"
          stroke="#333" stroke-width="0.5" opacity="0.3"/>

    <!-- "SUSPECTS" watermark -->
    <text x="${width * 0.5}" y="${height * 0.55}" text-anchor="middle"
          font-family="Impact, Arial Black, sans-serif" font-size="80"
          fill="#b03030" opacity="0.03" letter-spacing="30">SUSPECTS</text>

    <!-- Top accent -->
    <line x1="0" y1="2" x2="${width}" y2="2" stroke="#b03030" stroke-width="2" opacity="0.4"/>
  </svg>`;

  return svgToDataUrl(svg);
}

// ---- Evidence Web Background ----
// Dark web/network pattern with connecting dots

export function evidenceWebBackground(width: number, height: number): string {
  // Generate some random-looking but deterministic node positions
  const nodes: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 0.25 + (i % 3) * 0.1;
    nodes.push({
      x: width * 0.5 + Math.cos(angle) * width * radius,
      y: height * 0.5 + Math.sin(angle) * height * radius,
    });
  }

  const lines = nodes
    .map((n, i) => {
      const next = nodes[(i + 3) % nodes.length];
      return `<line x1="${n.x}" y1="${n.y}" x2="${next.x}" y2="${next.y}"
              stroke="#1a3a2a" stroke-width="1" opacity="0.3"/>`;
    })
    .join('\n');

  const dots = nodes
    .map(
      (n) =>
        `<circle cx="${n.x}" cy="${n.y}" r="4" fill="#1a4a2a" opacity="0.3"/>
         <circle cx="${n.x}" cy="${n.y}" r="2" fill="#2a6a3a" opacity="0.4"/>`
    )
    .join('\n');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="web-glow" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#0a1a10" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#050a08" stop-opacity="1"/>
      </radialGradient>
    </defs>

    <!-- Base -->
    <rect width="100%" height="100%" fill="#080d0a"/>
    <rect width="100%" height="100%" fill="url(#web-glow)"/>

    <!-- Network lines -->
    ${lines}

    <!-- Network nodes -->
    ${dots}

    <!-- Center glow -->
    <circle cx="${width * 0.5}" cy="${height * 0.5}" r="80" fill="#b03030" opacity="0.03"/>

    <!-- Top accent -->
    <line x1="0" y1="2" x2="${width}" y2="2" stroke="#27ae60" stroke-width="2" opacity="0.3"/>
  </svg>`;

  return svgToDataUrl(svg);
}

// ---- Timeline Background ----
// Dark with vertical timeline line and tick marks

export function timelineBackground(width: number, height: number): string {
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const y = height * 0.1 + (height * 0.8 / 7) * i;
    return `<line x1="${width * 0.5 - 15}" y1="${y}" x2="${width * 0.5 + 15}" y2="${y}"
            stroke="#d4a017" stroke-width="1.5" opacity="0.2"/>`;
  }).join('\n');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="tl-glow" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stop-color="#1a1820" stop-opacity="1"/>
        <stop offset="50%" stop-color="#0d0b14" stop-opacity="1"/>
        <stop offset="100%" stop-color="#1a1820" stop-opacity="1"/>
      </linearGradient>
    </defs>

    <!-- Base -->
    <rect width="100%" height="100%" fill="url(#tl-glow)"/>

    <!-- Central timeline line -->
    <line x1="${width * 0.5}" y1="${height * 0.05}" x2="${width * 0.5}" y2="${height * 0.95}"
          stroke="#d4a017" stroke-width="2" opacity="0.15"/>

    <!-- Tick marks -->
    ${ticks}

    <!-- Top accent -->
    <line x1="0" y1="2" x2="${width}" y2="2" stroke="#d4a017" stroke-width="2" opacity="0.3"/>
  </svg>`;

  return svgToDataUrl(svg);
}

// ---- Cork Board Background ----
// Warm cork texture with push pins for the notes area

export function corkBoardBackground(width: number, height: number): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <pattern id="cork-notes" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect width="80" height="80" fill="#8B6914"/>
        <circle cx="12" cy="15" r="2" fill="#7a5c10" opacity="0.5"/>
        <circle cx="45" cy="8" r="2.5" fill="#9a7520" opacity="0.4"/>
        <circle cx="68" cy="35" r="1.5" fill="#7a5c10" opacity="0.3"/>
        <circle cx="25" cy="55" r="2" fill="#6b5010" opacity="0.5"/>
        <circle cx="55" cy="60" r="1.8" fill="#9a7520" opacity="0.4"/>
        <circle cx="8" cy="40" r="1.2" fill="#6b5010" opacity="0.6"/>
        <circle cx="72" cy="72" r="2" fill="#7a5c10" opacity="0.3"/>
        <circle cx="35" cy="30" r="1" fill="#9a7520" opacity="0.5"/>
      </pattern>

      <radialGradient id="cork-vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="transparent"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.3)"/>
      </radialGradient>
    </defs>

    <!-- Base warm cork -->
    <rect width="100%" height="100%" fill="#8B6914"/>
    <rect width="100%" height="100%" fill="url(#cork-notes)"/>

    <!-- Push pins -->
    <circle cx="40" cy="40" r="12" fill="#cc3333" opacity="0.8"/>
    <circle cx="40" cy="40" r="5" fill="#ff6666" opacity="0.9"/>
    <circle cx="${width - 40}" cy="40" r="12" fill="#cc3333" opacity="0.8"/>
    <circle cx="${width - 40}" cy="40" r="5" fill="#ff6666" opacity="0.9"/>
    <circle cx="40" cy="${height - 40}" r="12" fill="#2266bb" opacity="0.8"/>
    <circle cx="40" cy="${height - 40}" r="5" fill="#4488dd" opacity="0.9"/>
    <circle cx="${width - 40}" cy="${height - 40}" r="12" fill="#2266bb" opacity="0.8"/>
    <circle cx="${width - 40}" cy="${height - 40}" r="5" fill="#4488dd" opacity="0.9"/>

    <!-- Faint grid -->
    <line x1="${width * 0.25}" y1="0" x2="${width * 0.25}" y2="${height}"
          stroke="#7a5c10" stroke-width="0.5" opacity="0.15"/>
    <line x1="${width * 0.5}" y1="0" x2="${width * 0.5}" y2="${height}"
          stroke="#7a5c10" stroke-width="0.5" opacity="0.15"/>
    <line x1="${width * 0.75}" y1="0" x2="${width * 0.75}" y2="${height}"
          stroke="#7a5c10" stroke-width="0.5" opacity="0.15"/>
    <line x1="0" y1="${height * 0.5}" x2="${width}" y2="${height * 0.5}"
          stroke="#7a5c10" stroke-width="0.5" opacity="0.15"/>

    <!-- NOTES watermark -->
    <text x="${width * 0.5}" y="${height * 0.55}" text-anchor="middle"
          font-family="Impact, Arial Black, sans-serif" font-size="100"
          fill="#6b5010" opacity="0.08" letter-spacing="40">NOTES</text>

    <!-- Vignette -->
    <rect width="100%" height="100%" fill="url(#cork-vignette)"/>

    <!-- Top border -->
    <line x1="0" y1="2" x2="${width}" y2="2" stroke="#5a4510" stroke-width="3" opacity="0.5"/>
  </svg>`;

  return svgToDataUrl(svg);
}
