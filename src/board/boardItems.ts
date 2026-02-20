/**
 * Board Items — Styled Miro items for the detective investigation board.
 */

// ---- Color Palette ----
export const COLORS = {
  // Frame backgrounds
  corkBoard: '#1a1510',
  suspectsFrame: '#171210',
  evidenceFrame: '#101714',
  timelineFrame: '#101218',

  // Red string / accent
  redString: '#b03030',
  redStringLight: '#cc4444',

  // Text
  textCream: '#e8dcc8',
  textMuted: '#887766',
  textDark: '#1a1a1a',

  // Evidence nodes
  evidenceNodeBg: '#151520',
  evidenceNodeBorder: '#b03030',

  // Timeline
  timelineBg: '#141822',
  timelineBorder: '#d4a017',
  timelineText: '#e8dcc8',

  // Suspect cards
  lockedCard: '#3a3a3a',
  revealedCard: '#b03030',
  clearedCard: '#1a6b3a',

  // Cork board
  corkBoardFrame: '#3d2b1f',

  // City Landscape
  cityOffice: '#2a3f5f',
  cityBuilding: '#3a4f6f',
  cityStreet: '#404040',

  // Sticky note colors - Miro enum values (not hex)
  stickyYellow: 'yellow' as const,
  stickyOrange: 'orange' as const,
  stickyBlue: 'light_blue' as const,
  stickyPink: 'light_pink' as const,
  stickyRed: 'red' as const,
  stickyGreen: 'green' as const,
} as const;

// ---- Frames ----

export async function createFrame(
  title: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: string = COLORS.corkBoard
) {
  return miro.board.createFrame({
    title,
    x,
    y,
    width,
    height,
    style: { fillColor },
  });
}

// ---- Sticky Notes ----

const STICKY_COLORS = [
  COLORS.stickyYellow,
  COLORS.stickyOrange,
  COLORS.stickyBlue,
  COLORS.stickyPink,
  COLORS.stickyRed,
];

export async function createClueSticky(
  content: string,
  x: number,
  y: number,
  colorIndex: number = 0,
  width: number = 450
) {
  const fontSize = width >= 700 ? 32 : 24;
  const sticky = await miro.board.createStickyNote({
    content: `<p style="font-size:${fontSize}px;line-height:1.4;word-wrap:break-word;overflow-wrap:break-word">${content}</p>`,
    x,
    y,
    width,
    style: {
      fillColor: STICKY_COLORS[colorIndex % STICKY_COLORS.length],
      textAlign: 'left',
    },
  });
  try {
    await sticky.bringToFront();
  } catch {
    // bringToFront is non-critical
  }
  return sticky;
}

/**
 * Mark a solved clue sticky — change to green and prefix with ✅
 */
export async function markClueStickyAsSolved(
  stickyId: string,
  clueOrder: number,
  revealText: string
) {
  try {
    const item = await miro.board.getById(stickyId);
    if (item.type === 'sticky_note') {
      item.content = `✅ CLUE #${clueOrder} — SOLVED\n\n${revealText.substring(0, 120)}...`;
      item.style.fillColor = COLORS.stickyGreen;
      await item.sync();
    }
  } catch {
    // Non-critical
  }
}

// ---- Case Briefing Text ----

export async function createCaseBriefingText(
  title: string,
  briefing: string,
  x: number,
  y: number
) {
  return miro.board.createText({
    content: `<p><strong style="font-size:80px">📋 ${title.toUpperCase()}</strong></p><p style="font-size:52px;line-height:1.6;margin-top:30px">${briefing}</p>`,
    x,
    y,
    width: 2800,
    style: {
      fontSize: 60,
      color: COLORS.textCream,
      textAlign: 'center',
      fontFamily: 'pt_sans',
    },
  });
}

// ---- Evidence Anchor Node (center of web) ----

export async function createEvidenceAnchor(
  title: string,
  x: number,
  y: number
) {
  return miro.board.createShape({
    content: `<p><strong style="font-size:36px">🕸️ ${title.toUpperCase()}</strong></p>`,
    shape: 'round_rectangle',
    x,
    y,
    width: 500,
    height: 120,
    style: {
      fillColor: '#1a0a0a',
      fontFamily: 'pt_sans',
      fontSize: 32,
      textAlign: 'center',
      textAlignVertical: 'middle',
      color: COLORS.redStringLight,
      borderColor: COLORS.redString,
      borderWidth: 6,
    },
  });
}

// ---- Timeline Header ----

export async function createTimelineHeader(
  x: number,
  y: number
) {
  return miro.board.createText({
    content: `<p><strong style="font-size:48px">⏱️ EVENT TIMELINE</strong></p>`,
    x,
    y,
    width: 700,
    style: {
      fontSize: 42,
      color: COLORS.timelineText,
      textAlign: 'center',
      fontFamily: 'pt_sans',
    },
  });
}

// ---- Locked Suspect Cards ----

export async function createLockedSuspectCard(
  x: number,
  y: number,
  suspectNumber: number
) {
  return miro.board.createAppCard({
    title: `SUSPECT #${suspectNumber}`,
    description: '🔒 CLASSIFIED — Solve clues to reveal',
    status: 'disconnected',
    x,
    y,
    style: {
      cardTheme: COLORS.lockedCard,
    },
    fields: [
      { value: '[ REDACTED ]', tooltip: 'Name' },
      { value: '[ REDACTED ]', tooltip: 'Role' },
      { value: '[ REDACTED ]', tooltip: 'Evidence' },
    ],
  });
}

/**
 * Reveal a suspect card with real data.
 * @param isCleared — true if this suspect is cleared (innocent), false if implicated
 */
export async function revealSuspectCard(
  cardId: string,
  name: string,
  role: string,
  evidence: string,
  isCleared: boolean = false
) {
  try {
    const card = await miro.board.getById(cardId);
    if (card.type === 'app_card') {
      card.title = isCleared ? `✅ ${name}` : `🔴 ${name}`;
      card.description = role;
      card.status = isCleared ? 'connected' : 'warning';
      card.style.cardTheme = isCleared ? COLORS.clearedCard : COLORS.revealedCard;
      card.fields = [
        { value: name, tooltip: 'Name' },
        { value: role, tooltip: 'Role' },
        { value: evidence.substring(0, 80), tooltip: 'Evidence' },
      ];
      await card.sync();
    }
  } catch {
    // Non-critical
  }
}

// ---- Evidence Nodes ----

export async function createEvidenceNode(
  content: string,
  x: number,
  y: number
) {
  return miro.board.createShape({
    content: `<p><strong style="font-size:36px">📌</strong> <span style="font-size:32px">${content}</span></p>`,
    shape: 'round_rectangle',
    x,
    y,
    width: 680,
    height: 120,
    style: {
      fillColor: COLORS.evidenceNodeBg,
      fontFamily: 'pt_sans',
      fontSize: 28,
      textAlign: 'center',
      textAlignVertical: 'middle',
      color: COLORS.textCream,
      borderColor: COLORS.evidenceNodeBorder,
      borderWidth: 4,
    },
  });
}

// ---- Red String Connectors ----

export async function createEvidenceConnector(
  startItemId: string,
  endItemId: string,
  label?: string
) {
  return miro.board.createConnector({
    start: { item: startItemId, position: { x: 0.5, y: 1.0 } },
    end: { item: endItemId, position: { x: 0.5, y: 0.0 } },
    shape: 'curved',
    style: {
      strokeColor: COLORS.redString,
      strokeWidth: 6,
      strokeStyle: 'dashed',
      startStrokeCap: 'filled_circle',
      endStrokeCap: 'filled_diamond',
    },
    captions: label
      ? [{ content: label, position: 0.5, textOrientation: 'horizontal' }]
      : undefined,
  });
}

/** Connector from the central anchor to an evidence node */
export async function createAnchorConnector(
  anchorId: string,
  nodeId: string
) {
  return miro.board.createConnector({
    start: { item: anchorId, position: { x: 0.5, y: 1.0 } },
    end: { item: nodeId, position: { x: 0.5, y: 0.0 } },
    shape: 'curved',
    style: {
      strokeColor: COLORS.redStringLight,
      strokeWidth: 4,
      strokeStyle: 'dotted',
      startStrokeCap: 'none',
      endStrokeCap: 'filled_circle',
    },
  });
}

// ---- Subtitle / Placeholder Text ----

export async function createSubtitle(
  content: string,
  x: number,
  y: number,
) {
  return miro.board.createText({
    content: `<p><em style="font-size:36px">${content}</em></p>`,
    x,
    y,
    width: 700,
    style: {
      fontSize: 32,
      color: COLORS.textMuted,
      textAlign: 'center',
      fontFamily: 'pt_sans',
    },
  });
}

// ---- Timeline Entries ----

export async function createTimelineEntry(
  content: string,
  x: number,
  y: number,
  index: number
) {
  return miro.board.createShape({
    content: `<p><strong style="font-size:36px">${index + 1}.</strong> <span style="font-size:32px">${content}</span></p>`,
    shape: 'round_rectangle',
    x,
    y,
    width: 650,
    height: 110,
    style: {
      fillColor: COLORS.timelineBg,
      fontFamily: 'pt_sans',
      fontSize: 28,
      textAlign: 'left',
      textAlignVertical: 'middle',
      color: COLORS.timelineText,
      borderColor: COLORS.timelineBorder,
      borderWidth: 3,
    },
  });
}

// ---- Timeline Connector (vertical link between entries) ----

export async function createTimelineConnector(
  topId: string,
  bottomId: string
) {
  return miro.board.createConnector({
    start: { item: topId, position: { x: 0.5, y: 1.0 } },
    end: { item: bottomId, position: { x: 0.5, y: 0.0 } },
    shape: 'straight',
    style: {
      strokeColor: COLORS.timelineBorder,
      strokeWidth: 4,
      strokeStyle: 'normal',
      startStrokeCap: 'none',
      endStrokeCap: 'stealth',
    },
  });
}

// ---- Case Closed Banner ----

export async function createCaseClosedBanner(
  x: number,
  y: number,
  culprit: string,
  motive: string
) {
  return miro.board.createShape({
    content: `<p><strong style="font-size:56px">🔴 CASE CLOSED 🔴</strong></p><p style="font-size:40px;margin-top:15px">Culprit: <strong>${culprit}</strong></p><p style="font-size:32px;margin-top:10px">${motive.substring(0, 120)}</p>`,
    shape: 'round_rectangle',
    x,
    y,
    width: 1000,
    height: 320,
    style: {
      fillColor: '#0d0a0a',
      fontFamily: 'pt_sans',
      fontSize: 36,
      textAlign: 'center',
      textAlignVertical: 'middle',
      color: COLORS.textCream,
      borderColor: COLORS.redString,
      borderWidth: 8,
    },
  });
}

// ---- Notifications ----

export async function showNotification(message: string) {
  await miro.board.notifications.showInfo(message);
}

// ---- Frame Header ----

export async function createFrameTitle(
  content: string,
  x: number,
  y: number,
  fontSize: number = 48
) {
  return miro.board.createText({
    content: `<p><strong style="font-size:${fontSize}px">${content}</strong></p>`,
    x,
    y,
    width: 800,
    style: {
      fontSize,
      color: COLORS.textCream,
      textAlign: 'center',
      fontFamily: 'pt_sans',
    },
  });
}

// ---- Background Images ----

/**
 * Create a background image inside a frame.
 * Uses a base64 data URL (from backgroundImages.ts SVG generators).
 */
export async function createBackgroundImage(
  dataUrl: string,
  x: number,
  y: number,
  width: number
) {
  return miro.board.createImage({
    url: dataUrl,
    x,
    y,
    width,
    title: 'background',
  });
}

// ---- Cork Board Note Stickies ----

/**
 * Create a blank sticky on the cork board for user notes.
 */
export async function createCorkBoardNote(
  content: string,
  x: number,
  y: number,
  colorIndex: number = 0
) {
  const noteColors = [
    COLORS.stickyYellow,
    COLORS.stickyOrange,
    COLORS.stickyBlue,
    COLORS.stickyPink,
  ];
  return miro.board.createStickyNote({
    content: `<p style="font-size:24px;line-height:1.4;word-wrap:break-word;overflow-wrap:break-word">${content}</p>`,
    x,
    y,
    width: 380,
    style: {
      fillColor: noteColors[colorIndex % noteColors.length],
      textAlign: 'left',
    },
  });
}

// ---- City Landscape Boxes ----

/**
 * Create a city landscape box (building/location)
 */
export async function createCityBox(
  title: string,
  description: string,
  x: number,
  y: number,
  width: number = 450,
  height: number = 380,
  color: string = COLORS.cityOffice,
  _icon: string = '🏢'
) {
  return miro.board.createShape({
    content: `<p><strong style="font-size:140px">${title.toUpperCase()}</strong></p><p style="font-size:48px;margin-top:40px;line-height:1.6">${description}</p>`,
    shape: 'rectangle',
    x,
    y,
    width,
    height,
    style: {
      fillColor: color,
      fontFamily: 'pt_sans',
      fontSize: 64,
      textAlign: 'center',
      textAlignVertical: 'top',
      color: COLORS.textCream,
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'normal',
    },
  });
}

/**
 * Add an item/marker inside a city box
 */
export async function createCityBoxItem(
  label: string,
  x: number,
  y: number,
  color: string = COLORS.stickyYellow
) {
  return miro.board.createStickyNote({
    content: `<p style="font-size:38px;word-wrap:break-word;overflow-wrap:break-word">${label}</p>`,
    x,
    y,
    width: 480,
    style: {
      fillColor: color,
      textAlign: 'center',
    },
  });
}

/**
 * Create an evidence file folder for table schema - Detective board style!
 * Shows table name on folder tab and key columns inside
 */
export async function createEvidenceFolderSchema(
  tableName: string,
  columns: Array<{ name: string; type: string }>,
  foreignKeys: Array<{ column: string; refTable: string }>,
  x: number,
  y: number,
  evidenceNumber: number
) {
  // Folder colors - manila/cream tones
  const folderColors = ['#F4E9CD', '#E8DCC8', '#DDD5B8', '#F0E5C8', '#EBE2CC'];
  const folderColor = folderColors[evidenceNumber % folderColors.length];
  
  // Build column list - show ALL columns with smaller font (no foreign key markers)
  const columnsList = columns.map(col => {
    return `• ${col.name}: ${col.type}`;
  }).join('<br>');
  
  // Create the folder shape - no evidence number, larger fonts
  const content = `<p style="font-size:24px;font-weight:bold;margin:0 0 12px 0;">📁 ${tableName.toUpperCase()}</p><p style="font-size:18px;line-height:1.4;margin:0;">${columnsList}</p>`;
  
  return miro.board.createShape({
    content,
    shape: 'rectangle',
    x,
    y,
    width: 320,
    height: 260,
    style: {
      fillColor: folderColor,
      fontFamily: 'pt_sans',
      fontSize: 18,
      textAlign: 'left',
      textAlignVertical: 'top',
      color: '#2a2a2a',
      borderColor: '#8b7355',
      borderWidth: 2,
      borderStyle: 'normal',
    },
  });
}

/**
 * Create red string connector between related evidence folders
 * Classic detective board style with push pins
 */
export async function createRedStringConnector(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  label?: string
) {
  const connector = await miro.board.createConnector({
    start: { 
      position: { x: fromX, y: fromY }
    },
    end: { 
      position: { x: toX, y: toY }
    },
    style: {
      strokeColor: COLORS.redString,
      strokeWidth: 3,
      strokeStyle: 'normal',
    },
    captions: label ? [{
      content: label,
      position: 0.5,
    }] : undefined,
  });
  
  return connector;
}

/**
 * Create push pin marker at connector endpoints
 */
export async function createPushPin(x: number, y: number) {
  return miro.board.createShape({
    content: '<p style="font-size:48px;">📍</p>',
    shape: 'circle',
    x,
    y,
    width: 80,
    height: 80,
    style: {
      fillColor: 'transparent',
      borderWidth: 0,
      fontSize: 48,
    },
  });
}

// ---- Helpers ----

/** Remove a board item by ID, silently ignoring errors */
export async function safeRemoveItem(id: string): Promise<void> {
  try {
    const item = await miro.board.getById(id);
    await miro.board.remove(item);
  } catch { /* already deleted or doesn't exist */ }
}
