/**
 * Template Generator — Create mystery layout without AI
 * 
 * Generates a complete mystery structure (tables, clues, locations)
 * WITHOUT making any LLM API calls. Perfect for testing board layout.
 * 
 * This creates:
 * - 6 city locations (Office, Police, Bank, etc.)
 * - 18 database tables (3 per location)
 * - 5 clues with validation rules
 * - All the visual elements (boxes, folders, sticky notes)
 */

import type { MysteryData, MysteryTable, Clue } from '../types/mystery';

export interface LocationData {
  title: string;
  locations: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  };
  descriptions?: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  };
  images?: {
    box1: { left: string; right: string };
    box2: { left: string; right: string };
    box3: { left: string; right: string };
    box4: { left: string; right: string };
    box5: { left: string; right: string };
    box6: { left: string; right: string };
  };
  clues?: Clue[];
}

/**
 * Generate a template mystery with AI-generated title, locations, descriptions, tables, and clues.
 * Fields not provided by AI remain as `{}` placeholders.
 */
export async function generateTemplateMystery(
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  locationData?: LocationData,
  aiGeneratedTables?: MysteryTable[],
  aiGeneratedClues?: Clue[]
): Promise<MysteryData> {
  console.log('🎨 Generating template mystery...');
  
  if (locationData) {
    console.log('📍 Using AI-generated locations:', locationData);
    if (locationData.descriptions) {
      console.log('📝 Using AI-generated descriptions:', locationData.descriptions);
    }
  } else {
    console.log('📝 Using placeholder mode (no locations yet)');
  }
  
  if (aiGeneratedTables) {
    console.log('📊 Using AI-generated tables:', aiGeneratedTables.length, 'tables');
  }
  
  // Return a template mystery structure
  // Title, locations, descriptions, images, and tables from AI if provided, otherwise placeholders
  const mystery: MysteryData = {
    title: locationData?.title || '{}',
    briefing: '{}',
    difficulty,
    locationNames: locationData?.locations, // Include AI-generated location names
    locationDescriptions: locationData?.descriptions, // Include AI-generated descriptions
    locationImages: locationData?.images, // Include AI-generated images

    tables: aiGeneratedTables || [
      // ===== OFFICE / BOX1 (3 tables) =====
      {
        name: 'table1_box1',
        description: '{}',
        location: 'OFFICE',
        ddl: `CREATE TABLE table1_box1 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table1_box1 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table2_box1',
        description: '{}',
        location: 'OFFICE',
        ddl: `CREATE TABLE table2_box1 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table2_box1 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table3_box1',
        description: '{}',
        location: 'OFFICE',
        ddl: `CREATE TABLE table3_box1 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table3_box1 VALUES (1, '{}', '{}');`,
        ],
      },

      // ===== POLICE / BOX2 (3 tables) =====
      {
        name: 'table1_box2',
        description: '{}',
        location: 'POLICE',
        ddl: `CREATE TABLE table1_box2 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table1_box2 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table2_box2',
        description: '{}',
        location: 'POLICE',
        ddl: `CREATE TABLE table2_box2 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table2_box2 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table3_box2',
        description: '{}',
        location: 'POLICE',
        ddl: `CREATE TABLE table3_box2 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table3_box2 VALUES (1, '{}', '{}');`,
        ],
      },

      // ===== CITY_BANK / BOX3 (3 tables) =====
      {
        name: 'table1_box3',
        description: '{}',
        location: 'CITY_BANK',
        ddl: `CREATE TABLE table1_box3 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table1_box3 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table2_box3',
        description: '{}',
        location: 'CITY_BANK',
        ddl: `CREATE TABLE table2_box3 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table2_box3 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table3_box3',
        description: '{}',
        location: 'CITY_BANK',
        ddl: `CREATE TABLE table3_box3 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table3_box3 VALUES (1, '{}', '{}');`,
        ],
      },

      // ===== HIGH_RISE_CONDO / BOX6 (3 tables) =====
      {
        name: 'table1_box6',
        description: '{}',
        location: 'HIGH_RISE_CONDO',
        ddl: `CREATE TABLE table1_box6 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table1_box6 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table2_box6',
        description: '{}',
        location: 'HIGH_RISE_CONDO',
        ddl: `CREATE TABLE table2_box6 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table2_box6 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table3_box6',
        description: '{}',
        location: 'HIGH_RISE_CONDO',
        ddl: `CREATE TABLE table3_box6 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table3_box6 VALUES (1, '{}', '{}');`,
        ],
      },

      // ===== DOWNTOWN_BISTRO / BOX5 (3 tables) =====
      {
        name: 'table1_box5',
        description: '{}',
        location: 'DOWNTOWN_BISTRO',
        ddl: `CREATE TABLE table1_box5 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table1_box5 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table2_box5',
        description: '{}',
        location: 'DOWNTOWN_BISTRO',
        ddl: `CREATE TABLE table2_box5 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table2_box5 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table3_box5',
        description: '{}',
        location: 'DOWNTOWN_BISTRO',
        ddl: `CREATE TABLE table3_box5 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table3_box5 VALUES (1, '{}', '{}');`,
        ],
      },

      // ===== NIGHT_BAR / BOX4 (3 tables) =====
      {
        name: 'table1_box4',
        description: '{}',
        location: 'NIGHT_BAR',
        ddl: `CREATE TABLE table1_box4 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table1_box4 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table2_box4',
        description: '{}',
        location: 'NIGHT_BAR',
        ddl: `CREATE TABLE table2_box4 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table2_box4 VALUES (1, '{}', '{}');`,
        ],
      },
      {
        name: 'table3_box4',
        description: '{}',
        location: 'NIGHT_BAR',
        ddl: `CREATE TABLE table3_box4 (
  id INTEGER PRIMARY KEY,
  column_1 TEXT,
  column_2 TEXT
);`,
        inserts: [
          `INSERT INTO table3_box4 VALUES (1, '{}', '{}');`,
        ],
      },
    ],

    clues: aiGeneratedClues || [
      {
        id: 1,
        order: 1,
        narrative: '{}',
        hint: '{}',
        stronger_hint: '{}',
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'column_1', value: '{}' },
          ],
          min_rows: 1,
        },
        reveal_text: '{}',
        evidence_summary: '{}',
        timeline_entry: '{}',
      },
      {
        id: 2,
        order: 2,
        narrative: '{}',
        hint: '{}',
        stronger_hint: '{}',
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'column_1', value: '{}' },
          ],
        },
        reveal_text: '{}',
        evidence_summary: '{}',
        timeline_entry: '{}',
        connects_to_clue: 1,
      },
      {
        id: 3,
        order: 3,
        narrative: '{}',
        hint: '{}',
        stronger_hint: '{}',
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'column_1', value: '{}' },
          ],
        },
        reveal_text: '{}',
        evidence_summary: '{}',
        timeline_entry: '{}',
        connects_to_clue: 2,
      },
      {
        id: 4,
        order: 4,
        narrative: '{}',
        hint: '{}',
        stronger_hint: '{}',
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'column_1', value: '{}' },
          ],
        },
        reveal_text: '{}',
        evidence_summary: '{}',
        timeline_entry: '{}',
        connects_to_clue: 3,
      },
      {
        id: 5,
        order: 5,
        narrative: '{}',
        hint: '{}',
        stronger_hint: '{}',
        validation: {
          type: 'contains_rows',
          required_values: [
            { column: 'column_1', value: '{}' },
          ],
          required_columns: ['column_1'],
        },
        reveal_text: '{}',
        evidence_summary: '{}',
        timeline_entry: '{}',
        connects_to_clue: 4,
      },
    ],

    solution: {
      culprit: '{}',
      motive: '{}',
      final_narrative: '{}',
    },
  };

  console.log('✅ Placeholder template created - ready for AI content');
  return mystery;
}
