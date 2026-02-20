/**
 * Game State Manager
 *
 * Tracks the player's progress through a mystery:
 * - Which clues have been solved
 * - Total queries run
 * - Hints used
 * - Integrity strikes (evidence tampering)
 * - Board item references (for choreography later)
 */

import type { MysteryData } from '../types/mystery';

export type GameStatus = 'selecting' | 'generating' | 'playing' | 'solved';

export interface GameState {
  mysteryData: MysteryData | null;
  currentClueIndex: number;
  solvedClues: number[];
  totalQueries: number;
  hintsUsed: number;
  integrityStrikes: number;
  startTime: number;
  status: GameStatus;
  boardItemRefs: Record<string, string>;
}

const STORAGE_KEY = 'sql-side-quest-game-state';

function createInitialState(): GameState {
  return {
    mysteryData: null,
    currentClueIndex: 0,
    solvedClues: [],
    totalQueries: 0,
    hintsUsed: 0,
    integrityStrikes: 0,
    startTime: 0,
    status: 'selecting',
    boardItemRefs: {},
  };
}

let state: GameState = createInitialState();

// --- Subscribers for React re-renders ---
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// --- Getters ---

export function getState(): GameState {
  return state;
}

export function getCurrentClue() {
  if (!state.mysteryData) return null;
  return state.mysteryData.clues[state.currentClueIndex] ?? null;
}

export function isClueSolved(clueId: number): boolean {
  return state.solvedClues.includes(clueId);
}

export function isGameComplete(): boolean {
  if (!state.mysteryData) return false;
  return state.solvedClues.length >= state.mysteryData.clues.length;
}

// --- Mutators ---

export function startGame(mystery: MysteryData): void {
  state = {
    ...createInitialState(),
    mysteryData: mystery,
    startTime: Date.now(),
    status: 'playing',
  };
  save();
  notify();
}

export function markClueSolved(clueId: number): void {
  if (state.solvedClues.includes(clueId)) return;

  state = {
    ...state,
    solvedClues: [...state.solvedClues, clueId],
    currentClueIndex: state.currentClueIndex + 1,
  };

  if (isGameComplete()) {
    state.status = 'solved';
  }

  save();
  notify();
}

export function incrementQueries(): void {
  state = { ...state, totalQueries: state.totalQueries + 1 };
  save();
  notify();
}

export function incrementHints(): void {
  state = { ...state, hintsUsed: state.hintsUsed + 1 };
  save();
  notify();
}

export function addIntegrityStrike(): number {
  state = { ...state, integrityStrikes: state.integrityStrikes + 1 };
  save();
  notify();
  return state.integrityStrikes;
}

export function setBoardItemRef(key: string, id: string): void {
  state = {
    ...state,
    boardItemRefs: { ...state.boardItemRefs, [key]: id },
  };
  save();
}

export function setStatus(status: GameStatus): void {
  state = { ...state, status };
  save();
  notify();
}

// --- Persistence ---

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

export function loadSavedGame(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved: GameState = JSON.parse(raw);
    if (saved.mysteryData && saved.status === 'playing') {
      state = saved;
      notify();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  notify();
}

export function clearBoardRefs(): void {
  state = { ...state, boardItemRefs: {} };
  save();
}
