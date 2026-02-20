/**
 * Table Schema Generator — AI-powered database schema generation
 * 
 * Generates realistic table schemas and sample data for all 18 tables
 * (3 tables per location × 6 locations) based on the mystery theme and location context.
 */

import type { MysteryTable } from '../types/mystery';

export interface TableGenerationContext {
  theme: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  locationNames: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  };
}

const GENERATION_TIMEOUT_MS = 120_000; // 120 seconds for all 18 tables

/**
 * Generate all 18 table schemas based on theme and locations.
 */
export async function generateTableSchemas(
  context: TableGenerationContext
): Promise<MysteryTable[]> {
  console.log('📊 Generating table schemas for theme:', context.theme);

  const prompt = buildTableSchemaPrompt(context);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    console.log('📡 Sending request to /api/generate...');
    const startTime = Date.now();
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        difficulty: context.difficulty,
        generationType: 'tables',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ API response received in ${elapsed}s`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Table schema generation failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    console.log('📦 API response received');
    
    // Parse the response
    let result;
    
    if (data.tables && Array.isArray(data.tables)) {
      result = parseTableSchemaResponse(data.tables, context);
    } else if (data.text) {
      result = parseTableSchemaResponse(data.text, context);
    } else if (data.mystery) {
      result = parseTableSchemaResponse(data.mystery.text || data.mystery, context);
    } else {
      result = parseTableSchemaResponse(data, context);
    }
    
    console.log('✅ Table schemas generated:', result.length, 'tables');
    return result;

  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Table schema generation timed out after 120 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build the prompt for table schema generation
 */
function buildTableSchemaPrompt(context: TableGenerationContext): string {
  return `Generate SQL tables for detective mystery. Theme: ${context.theme}

Create 2-3 tables for EACH location below. Tables must be thematically appropriate and fit the location:

1. ${context.locationNames.box1}
2. ${context.locationNames.box2}
3. ${context.locationNames.box3}
4. ${context.locationNames.box4}
5. ${context.locationNames.box5}
6. ${context.locationNames.box6}

Requirements:
- Table names should match location context (e.g., "Emergency Room" → patient_records, staff_shifts, equipment_log)
- 3-5 columns per table (always include id INTEGER PRIMARY KEY)
- 2-4 sample data rows with realistic values
- Data should support a detective investigation
- Tables can reference each other with FOREIGN KEY

Return ONLY JSON:
{
  "tables": [
    {
      "boxNumber": 1,
      "tableName": "table_name",
      "description": "brief description",
      "columns": [
        {"name": "id", "type": "INTEGER", "constraints": "PRIMARY KEY"},
        {"name": "column_name", "type": "TEXT", "constraints": "NOT NULL"}
      ],
      "foreignKeys": [],
      "sampleData": [
        {"id": 1, "column_name": "value1"}
      ]
    }
  ]
}

Generate 12-18 total tables (2-3 per location).`;
}

/**
 * Parse the LLM response into structured table data
 */
function parseTableSchemaResponse(
  response: string | any,
  context: TableGenerationContext
): MysteryTable[] {
  console.log('📝 Parsing table schema response...');

  let parsed: any;

  // If response is already an object, use it directly
  if (typeof response === 'object' && response !== null) {
    console.log('Response is already an object');
    parsed = response;
  } else if (typeof response === 'string') {
    let jsonText = response.trim();

    // Extract from markdown if needed
    if (jsonText.includes('```json')) {
      const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) jsonText = match[1];
    } else if (jsonText.includes('```')) {
      const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (match) jsonText = match[1];
    }

    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      console.error('❌ Failed to parse JSON:', err);
      throw new Error(`Failed to parse JSON: ${err.message}`);
    }
  } else {
    throw new Error(`Invalid response type: ${typeof response}`);
  }

  try {
    const tables = parsed.tables || parsed;
    
    if (!Array.isArray(tables)) {
      throw new Error('Tables must be an array');
    }

    // Convert to MysteryTable format
    const mysteryTables: MysteryTable[] = tables.map((table: any, index: number) => {
      console.log(`🔄 Processing table ${index + 1}/${tables.length}: ${table.tableName}`);
      
      const boxNum = table.boxNumber || 1;
      const location = getLocationKey(boxNum);
      
      try {
        // Build DDL
        const ddl = buildDDL(table);
        
        // Build INSERT statements
        const inserts = buildInserts(table.tableName, table.sampleData || []);
        
        console.log(`✅ Table ${table.tableName} created successfully`);
        
        return {
          name: table.tableName,
          description: table.description || '',
          location,
          ddl,
          inserts,
        };
      } catch (err: any) {
        console.error(`❌ Failed to build table ${table.tableName}:`, err);
        throw new Error(`Failed to build table ${table.tableName}: ${err.message}`);
      }
    });

    // Validate we have sufficient tables (12-18)
    if (mysteryTables.length < 12) {
      console.warn(`⚠️ Only ${mysteryTables.length} tables generated, expected 12-18`);
    }
    
    console.log(`📊 Generated ${mysteryTables.length} tables across 6 locations`);
    
    // Log all DDL statements for debugging
    console.log('📋 Generated DDL statements:');
    mysteryTables.forEach((table, idx) => {
      console.log(`\n--- Table ${idx + 1}: ${table.name} (${table.location}) ---`);
      console.log(table.ddl);
      console.log('Sample inserts:', table.inserts.length);
    });

    return mysteryTables;

  } catch (err: any) {
    console.error('❌ Failed to parse table schema response:', err);
    console.error('Response data:', response);
    throw new Error(`Failed to parse table schema response: ${err.message}`);
  }
}

/**
 * Build CREATE TABLE DDL from table definition
 */
function buildDDL(table: any): string {
  const columns = table.columns || [];
  
  // Validate table has columns
  if (columns.length === 0) {
    console.error('❌ Table has no columns:', table);
    throw new Error(`Table "${table.tableName}" has no columns defined`);
  }
  
  // Validate table name
  if (!table.tableName || typeof table.tableName !== 'string') {
    console.error('❌ Invalid table name:', table);
    throw new Error('Table has invalid or missing name');
  }
  
  let ddl = `CREATE TABLE ${table.tableName} (\n`;
  
  // Add columns
  const columnDefs = columns.map((col: any) => {
    if (!col.name || !col.type) {
      console.error('❌ Invalid column:', col);
      throw new Error(`Column missing name or type in table "${table.tableName}"`);
    }
    const constraints = col.constraints ? ` ${col.constraints}` : '';
    return `  ${col.name} ${col.type}${constraints}`;
  });
  
  // Add foreign keys if any
  const foreignKeys = table.foreignKeys || [];
  const fkDefs = foreignKeys
    .filter((fk: any) => fk.column && fk.references && fk.refColumn) // Validate FK structure
    .map((fk: any) => {
      return `  FOREIGN KEY (${fk.column}) REFERENCES ${fk.references}(${fk.refColumn})`;
    });
  
  const allDefs = [...columnDefs, ...fkDefs];
  
  if (allDefs.length === 0) {
    throw new Error(`Table "${table.tableName}" has no valid definitions`);
  }
  
  ddl += allDefs.join(',\n');
  ddl += '\n);';
  
  console.log(`✅ Built DDL for ${table.tableName}:`, ddl.substring(0, 100) + '...');
  
  return ddl;
}

/**
 * Build INSERT statements from sample data
 */
function buildInserts(tableName: string, sampleData: any[]): string[] {
  if (!Array.isArray(sampleData) || sampleData.length === 0) {
    console.warn(`⚠️ No sample data for table ${tableName}, creating minimal insert`);
    return [`INSERT INTO ${tableName} (id) VALUES (1);`];
  }
  
  return sampleData.map((row: any, idx: number) => {
    if (!row || typeof row !== 'object') {
      console.warn(`⚠️ Invalid row data at index ${idx} for ${tableName}`);
      return `INSERT INTO ${tableName} (id) VALUES (${idx + 1});`;
    }
    
    const columns = Object.keys(row);
    
    if (columns.length === 0) {
      console.warn(`⚠️ Empty row data at index ${idx} for ${tableName}`);
      return `INSERT INTO ${tableName} (id) VALUES (${idx + 1});`;
    }
    
    const values = columns.map(col => {
      const value = row[col];
      if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`; // Escape quotes
      }
      if (value === null || value === undefined) {
        return 'NULL';
      }
      if (typeof value === 'boolean') {
        return value ? '1' : '0';
      }
      return value;
    });
    
    return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
  });
}

/**
 * Get location key based on box number
 */
function getLocationKey(boxNum: number): string {
  const locationMap: Record<number, string> = {
    1: 'OFFICE',
    2: 'POLICE',
    3: 'CITY_BANK',
    4: 'NIGHT_BAR',
    5: 'DOWNTOWN_BISTRO',
    6: 'HIGH_RISE_CONDO',
  };
  
  return locationMap[boxNum] || 'OFFICE';
}
