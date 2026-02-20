/**
 * SchemaViewer Component — Dark Detective Theme
 *
 * Displays database tables grouped by location (6 city boxes with 3 tables each)
 * styled to match the dark investigation panel.
 */

import * as React from 'react';
import { getTableSchema } from '../engine/database';

interface TableInfo {
  name: string;
  description: string;
  location?: string;
  columns: Array<{ name: string; type: string }>;
}

// Define the 6 locations in order
const LOCATIONS = [
  { id: 'OFFICE', name: 'Office', icon: '🏢' },
  { id: 'POLICE', name: 'Police', icon: '🚓' },
  { id: 'HIGH_RISE_CONDO', name: 'High Rise Condo', icon: '🏢' },
  { id: 'DOWNTOWN_BISTRO', name: 'Downtown Bistro', icon: '🍽️' },
  { id: 'NIGHT_BAR', name: 'Night Bar', icon: '🍸' },
  { id: 'CITY_BANK', name: 'City Bank', icon: '🏦' },
];

export const SchemaViewer: React.FC = () => {
  const [tables, setTables] = React.useState<TableInfo[]>([]);
  const [expandedLocations, setExpandedLocations] = React.useState<Record<string, boolean>>({});
  const [expandedTables, setExpandedTables] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const schema = getTableSchema();
    setTables(schema);
    // Expand first location by default
    const initialLocations: Record<string, boolean> = {};
    LOCATIONS.forEach((loc, i) => (initialLocations[loc.id] = i === 0));
    setExpandedLocations(initialLocations);
    // Collapse all tables by default
    const initialTables: Record<string, boolean> = {};
    schema.forEach((t) => (initialTables[t.name] = false));
    setExpandedTables(initialTables);
  }, []);

  const toggleLocation = (locationId: string) => {
    setExpandedLocations((prev) => ({ ...prev, [locationId]: !prev[locationId] }));
  };

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  // Group tables by location
  const tablesByLocation = React.useMemo(() => {
    const grouped: Record<string, TableInfo[]> = {};
    LOCATIONS.forEach((loc) => {
      grouped[loc.id] = tables.filter((t) => t.location === loc.id);
    });
    return grouped;
  }, [tables]);

  if (tables.length === 0) {
    return null;
  }

  return (
    <div className="schema-section">
      <details open>
        <summary>📍 Investigation Locations ({LOCATIONS.length} places)</summary>
        <div className="schema-locations">
          {LOCATIONS.map((location) => {
            const locationTables = tablesByLocation[location.id] || [];
            return (
              <div key={location.id} className="location-block">
                <div 
                  className="location-header" 
                  onClick={() => toggleLocation(location.id)}
                >
                  <span className="schema-arrow">
                    {expandedLocations[location.id] ? '▾' : '▸'}
                  </span>
                  <span className="location-icon">{location.icon}</span>
                  <span className="location-name">{location.name}</span>
                  <span className="table-count">({locationTables.length} tables)</span>
                </div>
                
                {expandedLocations[location.id] && (
                  <div className="location-tables">
                    {locationTables.length === 0 ? (
                      <div className="no-tables">No tables available</div>
                    ) : (
                      locationTables.map((table, idx) => (
                        <div key={table.name} className="schema-table-block">
                          <div className="table-name-row" onClick={() => toggleTable(table.name)}>
                            <span className="schema-arrow">
                              {expandedTables[table.name] ? '▾' : '▸'}
                            </span>
                            <span className="exhibit-tag">
                              {location.id.charAt(0)}{idx + 1}
                            </span>
                            <span className="table-name">{table.name}</span>
                            <span className="col-count">({table.columns.length} cols)</span>
                          </div>
                          {table.description && (
                            <div className="table-desc">{table.description}</div>
                          )}
                          {expandedTables[table.name] && (
                            <div className="column-list">
                              {table.columns.map((col) => (
                                <div key={col.name} className="column-row">
                                  <span className="col-name">{col.name}</span>
                                  <span className="col-type">{col.type}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
};
