/**
 * Database Engine - Wrapper around sql.js for mystery game
 *
 * This module handles:
 * - Initializing the SQLite database in the browser
 * - Loading mystery schemas and data
 * - Executing user queries safely
 * - Resetting the database
 * - Getting schema information for the UI
 */

import initSqlJs, { Database } from 'sql.js';
import type { MysteryData, QueryResult } from '../types/mystery';

// Singleton database instance
let db: Database | null = null;
let currentMystery: MysteryData | null = null;

/**
 * Initialize sql.js and create an empty database.
 * Call this once when the app loads.
 */
export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `/sql-wasm.wasm`
  });

  db = new SQL.Database();
}

/**
 * Load a mystery into the database.
 * Executes all CREATE TABLE and INSERT statements.
 */
export async function loadMystery(mystery: MysteryData): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  currentMystery = mystery;

  for (const table of mystery.tables) {
    try {
      console.log(`🔄 Creating table: ${table.name}`);
      console.log('DDL:', table.ddl);
      db.run(table.ddl);
      console.log(`✅ Table ${table.name} created successfully`);
    } catch (err: any) {
      console.error(`❌ Failed to create table ${table.name}:`, err);
      console.error('Failed DDL:', table.ddl);
      throw new Error(`Failed to create table ${table.name}: ${err.message}`);
    }

    for (const insertStmt of table.inserts) {
      try {
        db.run(insertStmt);
      } catch (err: any) {
        console.error(`❌ Failed to insert data into ${table.name}:`, err);
        console.error('Failed INSERT:', insertStmt);
        throw new Error(`Failed to insert into ${table.name}: ${err.message}`);
      }
    }
  }
}

/**
 * Execute a SQL query.
 * Returns results or error message.
 */
export function executeQuery(sql: string): QueryResult {
  if (!db) {
    return {
      columns: [],
      rows: [],
      error: 'Database not initialized'
    };
  }

  try {
    const trimmedSql = sql.trim();

    if (!trimmedSql) {
      return {
        columns: [],
        rows: [],
        error: 'Empty query'
      };
    }

    const results = db.exec(trimmedSql);

    if (results.length === 0) {
      return {
        columns: [],
        rows: [],
        empty: true
      };
    }

    const result = results[0];

    return {
      columns: result.columns,
      rows: result.values
    };
  } catch (error: any) {
    return {
      columns: [],
      rows: [],
      error: error.message
    };
  }
}

/**
 * Reset the database to its original state.
 * Useful when player tampers with evidence.
 */
export function resetDatabase(): void {
  if (!db || !currentMystery) {
    throw new Error('No mystery loaded');
  }

  for (const table of currentMystery.tables) {
    try {
      db.run(`DROP TABLE IF EXISTS ${table.name}`);
    } catch {
      // Ignore errors if table doesn't exist
    }
  }

  for (const table of currentMystery.tables) {
    try {
      db.run(table.ddl);
    } catch (err: any) {
      console.error(`❌ Failed to recreate table ${table.name}:`, err);
      throw new Error(`Failed to recreate table ${table.name}: ${err.message}`);
    }
    
    for (const insertStmt of table.inserts) {
      try {
        db.run(insertStmt);
      } catch (err: any) {
        console.error(`❌ Failed to reinsert data into ${table.name}:`, err);
        throw new Error(`Failed to reinsert into ${table.name}: ${err.message}`);
      }
    }
  }
}

/**
 * Clear all tables from the database.
 * Called when starting a new case to clean up the previous mystery's data.
 */
export function clearDatabase(): void {
  if (!db) return;

  // If we have a current mystery, drop its tables
  if (currentMystery) {
    for (const table of currentMystery.tables) {
      try {
        db.run(`DROP TABLE IF EXISTS ${table.name}`);
      } catch {
        // Ignore errors if table doesn't exist
      }
    }
  }

  // Also get all tables from sqlite_master and drop them
  // (in case there are orphaned tables from previous sessions)
  try {
    const results = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (results.length > 0) {
      const tables = results[0].values;
      for (const [tableName] of tables) {
        try {
          db.run(`DROP TABLE IF EXISTS ${tableName}`);
        } catch {
          // Ignore errors
        }
      }
    }
  } catch {
    // Ignore errors querying sqlite_master
  }

  currentMystery = null;
}

/**
 * Get schema information for all tables.
 * Used by the SchemaViewer component.
 */
export function getTableSchema(): Array<{
  name: string;
  description: string;
  location?: string;
  columns: Array<{
    name: string;
    type: string;
  }>;
}> {
  if (!db || !currentMystery) {
    return [];
  }

  const schema = [];

  for (const table of currentMystery.tables) {
    const results = db.exec(`PRAGMA table_info(${table.name})`);

    if (results.length === 0) continue;

    const columns = results[0].values.map((row: any) => ({
      name: row[1],
      type: row[2]
    }));

    schema.push({
      name: table.name,
      description: table.description,
      location: table.location,
      columns
    });
  }

  return schema;
}

/**
 * Get the current mystery data.
 */
export function getCurrentMystery(): MysteryData | null {
  return currentMystery;
}

/**
 * Close the database (cleanup).
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    currentMystery = null;
  }
}
