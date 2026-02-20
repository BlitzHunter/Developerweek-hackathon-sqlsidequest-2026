/**
 * ResultsTable Component — dark detective theme
 */

import * as React from 'react';
import type { QueryResult } from '../types/mystery';

interface ResultsTableProps {
  result: QueryResult | null;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  if (!result) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#666', fontSize: 11, fontStyle: 'italic', padding: '6px 0' }}>
          Run a query to see results.
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="feedback error" style={{ fontFamily: 'monospace' }}>
        <strong>❌</strong> {result.error}
      </div>
    );
  }

  if (result.empty || result.columns.length === 0) {
    return (
      <div className="feedback info">
        Query executed. No rows returned.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="results-header">
        <span>📊 QUERY RESULTS</span>
        <span className="record-count">{result.rows.length} RECORD{result.rows.length !== 1 ? 'S' : ''}</span>
      </div>
      <div className="results-table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              {result.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>
                    {cell === null ? (
                      <span style={{ color: '#444', fontStyle: 'italic' }}>NULL</span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
