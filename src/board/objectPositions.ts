/**
 * Object Positions for Miro Board
 * 
 * Centralizes all board object paths, positions, and dimensions for cleaner code.
 * Includes images, GIFs, and other visual elements.
 */

import * as Pos from './positions';

// ============================================
// IMAGE & GIF PATHS
// ============================================

/**
 * Cork board texture image path (loaded as base64)
 */
export const CORK_BOARD_IMAGE_PATH = '/image/1-cork-board.jpg';

/**
 * Rain GIF path for Downtown Bistro (loaded as base64)
 */
export const BISTRO_RAIN_GIF_PATH = '/gif/rain_bg.gif';

/**
 * Rain background GIF URL (requires public hosting)
 * Set via environment variable: VITE_RAIN_BG_URL
 */
export const RAIN_BG_URL = import.meta.env.VITE_RAIN_BG_URL || '';

// ============================================
// OBJECT POSITIONS & DIMENSIONS
// ============================================

/**
 * Main board background (covers entire board, behind all objects)
 */
export const MAIN_BACKGROUND = {
  path: '/image/background.png',
  x: Pos.BOARD_CENTER_X,
  y: 2000,
  width: 20000,
  title: 'main-board-background',
  refKey: 'main_board_bg',
} as const;

/**
 * Rain background (ambient effect covering entire board)
 */
export const RAIN_BACKGROUND = {
  x: Pos.BOARD_CENTER_X,
  y: 2000,
  width: 10000,
  title: 'rain-background',
  refKey: 'ambient_rain_bg',
} as const;

/**
 * Cork board texture background
 */
export const CORK_BOARD_BACKGROUND = {
  x: Pos.FRAMES.corkBoard.cx,
  y: Pos.FRAMES.corkBoard.cy + 450, // Offset down for better visual balance
  width: Pos.CORK_BOARD_WIDTH,
  title: 'cork-board-background',
  refKey: 'bg_corkBoard',
} as const;

/**
 * Downtown Bistro rain GIF overlay
 */
export const BISTRO_RAIN_GIF = {
  x: Pos.FRAMES.cityRestaurant.cx - 700, // Left side of restaurant box
  y: Pos.FRAMES.cityRestaurant.cy, // Middle height
  width: Pos.CITY_BOX_WIDTH / 2, // 50% size reduction
  title: 'bistro-rain-effect',
  refKey: 'bistro_rain_gif',
} as const;

/**
 * Downtown Bistro image
 */
export const BISTRO_IMAGE = {
  path: '/image/downtown/bistro.png',
  x: Pos.FRAMES.cityRestaurant.cx + 700, // Right side of restaurant box
  y: Pos.FRAMES.cityRestaurant.cy, // Middle height
  width: 1200, // 50% size reduction
  title: 'bistro-image',
  refKey: 'bistro_image',
} as const;

/**
 * Office area images (side by side)
 */
export const OFFICE_IMAGE_LEFT = {
  path: '/image/office_area/main-workplace.png',
  x: Pos.FRAMES.cityOffice.cx - 650, // Left side of office box
  y: Pos.FRAMES.cityOffice.cy + 200, // Below the title
  width: 1200,
  title: 'office-main-workplace',
  refKey: 'office_image_left',
} as const;

export const OFFICE_IMAGE_RIGHT = {
  path: '/image/office_area/office.png',
  x: Pos.FRAMES.cityOffice.cx + 650, // Right side of office box
  y: Pos.FRAMES.cityOffice.cy + 200, // Below the title
  width: 1200,
  title: 'office-image-right',
  refKey: 'office_image_right',
} as const;

/**
 * Police station images (side by side)
 */
export const POLICE_IMAGE_LEFT = {
  path: '/image/police/police_station.png',
  x: Pos.FRAMES.cityPolice.cx - 650, // Left side of police box
  y: Pos.FRAMES.cityPolice.cy + 200, // Below the title
  width: 1200,
  title: 'police-station',
  refKey: 'police_image_left',
} as const;

export const POLICE_IMAGE_RIGHT = {
  path: '/image/police/police-1.png',
  x: Pos.FRAMES.cityPolice.cx + 650, // Right side of police box
  y: Pos.FRAMES.cityPolice.cy + 200, // Below the title
  width: 1200,
  title: 'police-image-right',
  refKey: 'police_image_right',
} as const;

/**
 * Bank images (side by side)
 */
export const BANK_IMAGE = {
  path: '/image/bank/bank-reception.png',
  x: Pos.FRAMES.cityBank.cx - 700, // Left side of bank box
  y: Pos.FRAMES.cityBank.cy, // Middle height
  width: 1200, // 50% size reduction
  title: 'bank-reception',
  refKey: 'bank_image',
} as const;

export const BANK_IMAGE_RIGHT = {
  path: '/image/bank/bank-1.png',
  x: Pos.FRAMES.cityBank.cx + 700, // Right side of bank box
  y: Pos.FRAMES.cityBank.cy, // Middle height
  width: 1200, // 50% size reduction
  title: 'bank-image-right',
  refKey: 'bank_image_right',
} as const;

/**
 * Night bar images (side by side)
 */
export const NIGHT_BAR_IMAGE = {
  path: '/image/bar/bar-1.png',
  x: Pos.FRAMES.cityNightBar.cx - 700, // Left side of night bar box
  y: Pos.FRAMES.cityNightBar.cy, // Middle height
  width: 1200, // 50% size reduction
  title: 'night-bar',
  refKey: 'nightbar_image',
} as const;

export const NIGHT_BAR_IMAGE_RIGHT = {
  path: '/image/bar/bar-2.png',
  x: Pos.FRAMES.cityNightBar.cx + 700, // Right side of night bar box
  y: Pos.FRAMES.cityNightBar.cy, // Middle height
  width: 1200, // 50% size reduction
  title: 'night-bar-right',
  refKey: 'nightbar_image_right',
} as const;

/**
 * High rise condo images (side by side)
 */
export const CONDO_IMAGE_LEFT = {
  path: '/image/condo/condo-front-desk.png',
  x: Pos.FRAMES.cityHighRiseCondo.cx - 700, // Left side of condo box
  y: Pos.FRAMES.cityHighRiseCondo.cy, // Middle height
  width: 1200, // 50% size reduction
  title: 'condo-front-desk',
  refKey: 'condo_image_left',
} as const;

export const CONDO_IMAGE_RIGHT = {
  path: '/image/condo/condo-view.png',
  x: Pos.FRAMES.cityHighRiseCondo.cx + 700, // Right side of condo box
  y: Pos.FRAMES.cityHighRiseCondo.cy, // Middle height
  width: 1200, // 50% size reduction
  title: 'condo-view',
  refKey: 'condo_image_right',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all image title patterns used for cleanup/scanning
 */
export function getImageTitlePatterns(): string[] {
  return [
    'rain-background',
    'cork-board-background',
    'bistro-rain-effect',
    'bistro-image',
    'office-main-workplace',
    'office-image-right',
    'bank-reception',
    'bank-image-right',
    'night-bar',
    'night-bar-right',
    'condo-front-desk',
    'condo-view',
    'background',
    'ambient',
  ];
}

/**
 * Check if an image title matches any of our app's image patterns
 */
export function isAppImage(title: string): boolean {
  return getImageTitlePatterns().some(pattern => title.includes(pattern));
}
