/**
 * Board Positions & Layout Constants — Centered Layout
 *
 * Miro frame x,y = CENTER of the frame.
 *
 * Layout: Case file and detective notes centered, city boxes spread far around
 *    
 *    ┌────────┐                        ┌────────┐
 *    │  BANK  │                        │ OFFICE │
 *    └────────┘                        └────────┘
 *
 *         ┌──────────────────────────────────┐
 *         │      📋 CASE BRIEFING (wide)     │
 *         └──────────────────────────────────┘
 *    ┌──────────┐  ┌──────────┐  ┌──────────┐
 *    │ SUSPECTS │  │ EVIDENCE │  │ TIMELINE │
 *    └──────────┘  └──────────┘  └──────────┘
 *
 *         ┌──────────────────────────────────┐
 *         │    📌 DETECTIVE NOTES (wide)     │
 *         └──────────────────────────────────┘
 *
 *           ↓ MORE SPACE BELOW ↓
 *
 *    ┌────────┐      ┌────────────┐      ┌──────────┐
 *    │ POLICE │      │ RESTAURANT │      │APARTMENT │
 *    └────────┘      └────────────┘      └──────────┘
 */

// ---- Dimensions ----
export const CASE_FRAME_WIDTH = 3200;
export const CASE_FRAME_HEIGHT = 1400; // Increased for better visibility

export const BOTTOM_FRAME_WIDTH = 750;
export const BOTTOM_FRAME_HEIGHT = 1000;

export const CORK_BOARD_WIDTH = 2400;
export const CORK_BOARD_HEIGHT = 600;

// City Landscape dimensions - MUCH larger boxes (4x original)
export const CITY_BOX_WIDTH = 2800;
export const CITY_BOX_HEIGHT = 2320;

export const FRAME_GAP = 80;

// ---- Frame centers (x,y = center for Miro) ----
// New layout: Case file and Cork board centered, other elements spread around

// Center X position for the entire board
export const BOARD_CENTER_X = 1200;

// Case frame centered
const CASE_CX = BOARD_CENTER_X;
const CASE_CY = 800; // Moved down to make room for city boxes above

// Bottom row Y center (suspects, evidence, timeline)
const BOTTOM_CY = CASE_CY + CASE_FRAME_HEIGHT / 2 + FRAME_GAP + BOTTOM_FRAME_HEIGHT / 2;

export const FRAMES = {
  caseBoard: {
    cx: CASE_CX,
    cy: CASE_CY,
    width: CASE_FRAME_WIDTH,
    height: CASE_FRAME_HEIGHT,
    left: CASE_CX - CASE_FRAME_WIDTH / 2,
    top: CASE_CY - CASE_FRAME_HEIGHT / 2,
  },
  suspects: {
    cx: BOARD_CENTER_X - BOTTOM_FRAME_WIDTH - FRAME_GAP,
    cy: BOTTOM_CY,
    width: BOTTOM_FRAME_WIDTH,
    height: BOTTOM_FRAME_HEIGHT,
    left: BOARD_CENTER_X - BOTTOM_FRAME_WIDTH - FRAME_GAP - BOTTOM_FRAME_WIDTH / 2,
    top: CASE_CY + CASE_FRAME_HEIGHT / 2 + FRAME_GAP,
  },
  evidence: {
    cx: BOARD_CENTER_X - (BOTTOM_FRAME_WIDTH + FRAME_GAP) / 2,
    cy: BOTTOM_CY,
    width: BOTTOM_FRAME_WIDTH,
    height: BOTTOM_FRAME_HEIGHT,
    left: BOARD_CENTER_X - (BOTTOM_FRAME_WIDTH + FRAME_GAP) / 2 - BOTTOM_FRAME_WIDTH / 2,
    top: CASE_CY + CASE_FRAME_HEIGHT / 2 + FRAME_GAP,
  },
  timeline: {
    cx: BOARD_CENTER_X + (BOTTOM_FRAME_WIDTH + FRAME_GAP) / 2,
    cy: BOTTOM_CY,
    width: BOTTOM_FRAME_WIDTH,
    height: BOTTOM_FRAME_HEIGHT,
    left: BOARD_CENTER_X + (BOTTOM_FRAME_WIDTH + FRAME_GAP) / 2 - BOTTOM_FRAME_WIDTH / 2,
    top: CASE_CY + CASE_FRAME_HEIGHT / 2 + FRAME_GAP,
  },
  corkBoard: {
    cx: BOARD_CENTER_X,
    cy: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 150 + CORK_BOARD_HEIGHT / 2,
    width: CORK_BOARD_WIDTH,
    height: CORK_BOARD_HEIGHT,
    left: BOARD_CENTER_X - CORK_BOARD_WIDTH / 2,
    top: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 100,
  },
  
  // City Landscape - EXTREMELY spread out (9x original spacing)
  // Top left: Bank (extremely far away)
  cityBank: {
    cx: BOARD_CENTER_X - CASE_FRAME_WIDTH / 2 - FRAME_GAP - 1200 - CITY_BOX_WIDTH / 2,
    cy: CASE_CY - CASE_FRAME_HEIGHT / 2 - FRAME_GAP - 900 - CITY_BOX_HEIGHT / 2,
    width: CITY_BOX_WIDTH,
    height: CITY_BOX_HEIGHT,
    left: BOARD_CENTER_X - CASE_FRAME_WIDTH / 2 - FRAME_GAP - 1200 - CITY_BOX_WIDTH,
    top: CASE_CY - CASE_FRAME_HEIGHT / 2 - FRAME_GAP - 900 - CITY_BOX_HEIGHT,
  },
  // Top right: Office (extremely far away)
  cityOffice: {
    cx: BOARD_CENTER_X + CASE_FRAME_WIDTH / 2 + FRAME_GAP + 1200 + CITY_BOX_WIDTH / 2,
    cy: CASE_CY - CASE_FRAME_HEIGHT / 2 - FRAME_GAP - 900 - CITY_BOX_HEIGHT / 2,
    width: CITY_BOX_WIDTH,
    height: CITY_BOX_HEIGHT,
    left: BOARD_CENTER_X + CASE_FRAME_WIDTH / 2 + FRAME_GAP + 1200,
    top: CASE_CY - CASE_FRAME_HEIGHT / 2 - FRAME_GAP - 900 - CITY_BOX_HEIGHT,
  },
  // Top center: Police Station (between Bank and Office)
  cityPolice: {
    cx: BOARD_CENTER_X,
    cy: CASE_CY - CASE_FRAME_HEIGHT / 2 - FRAME_GAP - 900 - CITY_BOX_HEIGHT / 2,
    width: CITY_BOX_WIDTH,
    height: CITY_BOX_HEIGHT,
    left: BOARD_CENTER_X - CITY_BOX_WIDTH / 2,
    top: CASE_CY - CASE_FRAME_HEIGHT / 2 - FRAME_GAP - 900 - CITY_BOX_HEIGHT,
  },
  // Bottom boxes - positioned EXTREMELY far below detective notes
  // Bottom left: Night Bar (massively spread out)
  cityNightBar: {
    cx: BOARD_CENTER_X - CITY_BOX_WIDTH - FRAME_GAP - 1800,
    cy: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 100 + CORK_BOARD_HEIGHT + FRAME_GAP + 1500 + CITY_BOX_HEIGHT / 2,
    width: CITY_BOX_WIDTH,
    height: CITY_BOX_HEIGHT,
    left: BOARD_CENTER_X - CITY_BOX_WIDTH - FRAME_GAP - 1800 - CITY_BOX_WIDTH / 2,
    top: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 100 + CORK_BOARD_HEIGHT + FRAME_GAP + 1500,
  },
  // Bottom center: Restaurant (extremely far below cork board)
  cityRestaurant: {
    cx: BOARD_CENTER_X,
    cy: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 100 + CORK_BOARD_HEIGHT + FRAME_GAP + 1500 + CITY_BOX_HEIGHT / 2,
    width: CITY_BOX_WIDTH,
    height: CITY_BOX_HEIGHT,
    left: BOARD_CENTER_X - CITY_BOX_WIDTH / 2,
    top: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 100 + CORK_BOARD_HEIGHT + FRAME_GAP + 1500,
  },
  // Bottom right: High Rise Condo (massively spread out)
  cityHighRiseCondo: {
    cx: BOARD_CENTER_X + CITY_BOX_WIDTH + FRAME_GAP + 1800,
    cy: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 100 + CORK_BOARD_HEIGHT + FRAME_GAP + 1500 + CITY_BOX_HEIGHT / 2,
    width: CITY_BOX_WIDTH,
    height: CITY_BOX_HEIGHT,
    left: BOARD_CENTER_X + CITY_BOX_WIDTH + FRAME_GAP + 1800 - CITY_BOX_WIDTH / 2,
    top: BOTTOM_CY + BOTTOM_FRAME_HEIGHT / 2 + FRAME_GAP + 100 + CORK_BOARD_HEIGHT + FRAME_GAP + 1500,
  },
} as const;

// ---- Position helpers ----

export function caseBriefingPosition() {
  return {
    x: FRAMES.caseBoard.cx,
    y: FRAMES.caseBoard.top + 220,
  };
}

export function caseStickyPosition(index: number) {
  const totalSlots = 5;
  const usableWidth = FRAMES.caseBoard.width - 200;
  const slotWidth = usableWidth / totalSlots;
  return {
    x: FRAMES.caseBoard.left + 100 + slotWidth * index + slotWidth / 2,
    y: FRAMES.caseBoard.top + 720, // Moved down further for better spacing
  };
}

export function suspectCardPosition(index: number) {
  const cols = 2;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const colWidth = (FRAMES.suspects.width - 100) / cols;
  return {
    x: FRAMES.suspects.left + 50 + col * colWidth + colWidth / 2,
    y: FRAMES.suspects.top + 160 + row * 200,
  };
}

export function evidenceNodePosition(index: number) {
  // Center all evidence nodes in the frame, starting lower to avoid title overlap
  return {
    x: FRAMES.evidence.cx,
    y: FRAMES.evidence.top + 280 + index * 200,
  };
}

/** Central anchor node at top of evidence web */
export function evidenceCenterPosition() {
  return {
    x: FRAMES.evidence.cx,
    y: FRAMES.evidence.top + 80,
  };
}

export function timelineEntryPosition(index: number) {
  return {
    x: FRAMES.timeline.cx,
    y: FRAMES.timeline.top + 220 + index * 180,
  };
}

/** Position for the timeline header line */
export function timelineHeaderPosition() {
  return {
    x: FRAMES.timeline.cx,
    y: FRAMES.timeline.top + 60,
  };
}

// ---- Viewport helpers ----

export function fullBoardViewport() {
  // Calculate exact bounds by finding min/max of all frames
  
  // Top-most point: top of Bank/Office boxes
  const topY = FRAMES.cityBank.top;
  
  // Bottom-most point: bottom of Night Bar/Restaurant/Condo boxes
  const bottomY = FRAMES.cityRestaurant.top + CITY_BOX_HEIGHT;
  
  // Left-most point: left of Bank/Night Bar boxes
  const leftX = Math.min(FRAMES.cityBank.left, FRAMES.cityNightBar.left);
  
  // Right-most point: right of Office/High Rise Condo boxes
  const rightX = Math.max(
    FRAMES.cityOffice.left + CITY_BOX_WIDTH,
    FRAMES.cityHighRiseCondo.left + CITY_BOX_WIDTH
  );
  
  // Calculate center point of all content
  const contentCenterX = (leftX + rightX) / 2;
  const contentCenterY = (topY + bottomY) / 2;
  
  // Calculate viewport dimensions with padding
  const padding = 400;
  const width = rightX - leftX + padding * 2;
  const height = bottomY - topY + padding * 2;
  
  // Center the viewport on the content with slight left shift
  const leftShift = 100; // Shift camera 300px to the left
  
  return {
    x: contentCenterX - width / 2 - leftShift,
    y: contentCenterY - height / 2,
    width: width,
    height: height,
  };
}

export function frameViewport(frame: keyof typeof FRAMES) {
  const f = FRAMES[frame];
  const w = f.width + 100;
  const h = f.height + 100;
  return {
    x: f.cx - w / 2,
    y: f.cy - h / 2,
    width: w,
    height: h,
  };
}

/** Viewport that focuses on just the case briefing and suspects */
export function topHalfViewport() {
  const w = CASE_FRAME_WIDTH + 400;
  const h = CASE_FRAME_HEIGHT + 600;
  return {
    x: BOARD_CENTER_X - w / 2,
    y: CASE_CY - h / 2,
    width: w,
    height: h,
  };
}

/** Position for the cork board header text */
export function corkBoardHeaderPosition() {
  return {
    x: FRAMES.corkBoard.cx,
    y: FRAMES.corkBoard.top + 50,
  };
}

/** Case closed banner position — centered between case frame and bottom row */
export function caseClosedPosition() {
  return {
    x: BOARD_CENTER_X,
    y: CASE_CY + CASE_FRAME_HEIGHT / 2 + FRAME_GAP / 2,
  };
}
