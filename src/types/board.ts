/**
 * Board-related type definitions.
 *
 * These describe the visual layout we create on the Miro board
 * and the references we store so we can update items later.
 */

/** Unique keys we use to store board item IDs in game state */
export type BoardRefKey =
  | 'frame_crimeScene'
  | 'frame_suspects'
  | 'frame_evidence'
  | 'frame_timeline'
  | `suspect_${number}`
  | `evidence_${number}`
  | `connector_${number}`
  | `timeline_${number}`
  | 'title_text';

/** Coordinate pair */
export interface Point {
  x: number;
  y: number;
}

/** Rectangle on the board */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
