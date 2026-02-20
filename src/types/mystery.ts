// Type definitions for SQL Mystery game

/**
 * Represents a single database table in the mystery
 */
export interface MysteryTable {
  name: string;           // Table name (e.g., "employees")
  description: string;    // What this table represents
  location?: string;      // Location tag (e.g., "OFFICE", "POLICE", "CITY BANK")
  ddl: string;           // CREATE TABLE statement
  inserts: string[];     // Array of INSERT statements
}

/**
 * Validation rules for checking if a query solves a clue
 */
export interface ClueValidation {
  type: 'contains_rows' | 'exact_value' | 'exact_match' | 'row_count' | 'has_columns';
  
  // For 'contains_rows' and 'exact_value' - specific values that must appear
  required_values?: Array<{
    column: string;
    value: string | number;
  }>;
  
  // For 'has_columns' - columns that must be in the result
  required_columns?: string[];
  
  // For 'row_count' - expected number of rows
  expected_count?: number;
  min_rows?: number;
  max_rows?: number;
}

/**
 * A single clue in the mystery investigation
 */
export interface Clue {
  id: number;
  order: number;                    // Sequence in the investigation (1, 2, 3...)
  location?: string;                // City box this clue belongs to: 'box1'-'box6' (optional; omit for Case Board placement)
  narrative: string;                // Story text introducing the clue
  hint: string;                     // What the player should investigate
  stronger_hint?: string;           // More specific guidance if stuck
  validation: ClueValidation;       // How to check if query is correct
  reveal_text: string;              // Narrative shown after solving
  evidence_summary: string;         // Short label for evidence web
  timeline_entry: string;           // Short label for timeline
  connects_to_clue?: number;        // Which clue this connects to (for board)
}

/**
 * The solution to the mystery
 */
export interface Solution {
  culprit: string;
  motive: string;
  final_narrative: string;
}

/**
 * Complete mystery data structure
 */
export interface MysteryData {
  title: string;
  briefing: string;                 // Case introduction
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tables: MysteryTable[];
  clues: Clue[];
  solution: Solution;
  locationNames?: {                 // Optional AI-generated location names
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  };
  locationDescriptions?: {          // Optional AI-generated location descriptions
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  };
  locationImages?: {                // Optional AI-generated location images
    box1: { left: string; right: string };
    box2: { left: string; right: string };
    box3: { left: string; right: string };
    box4: { left: string; right: string };
    box5: { left: string; right: string };
    box6: { left: string; right: string };
  };
}

/**
 * Result from executing a SQL query
 */
export interface QueryResult {
  columns: string[];
  rows: any[][];
  error?: string;
  empty?: boolean;
}

/**
 * Validation result after checking a query
 */
export interface ValidationResult {
  passed: boolean;
  feedback: string;
  clue_solved?: number;  // Which clue was solved (if any)
}
