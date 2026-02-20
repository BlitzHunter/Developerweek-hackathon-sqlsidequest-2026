/**
 * SQLEditor Component
 *
 * A text area for typing SQL queries with Execute, Hint, and Reset buttons.
 * Calls the database engine and passes results up to the parent.
 *
 * Uses CSS classes defined in style.css for consistent dark detective theme.
 */

import * as React from 'react';
import { executeQuery, resetDatabase } from '../engine/database';
import type { QueryResult } from '../types/mystery';

interface SQLEditorProps {
  onResult: (result: QueryResult) => void | Promise<void>;
  onQueryRun: () => void;
  onHintRequest: () => void;
  /** Pre-execution hook. Return false to block the query from running. */
  onPreExecute?: (sql: string) => boolean;
  disabled?: boolean;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  onResult,
  onQueryRun,
  onHintRequest,
  onPreExecute,
  disabled = false,
}) => {
  const [sql, setSql] = React.useState('');
  const [running, setRunning] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleExecute = async () => {
    if (!sql.trim() || disabled) return;

    // Pre-execution check (tamper detection)
    if (onPreExecute && !onPreExecute(sql)) {
      return;
    }

    setRunning(true);

    // Small timeout so the UI shows "running" state briefly
    await new Promise((r) => setTimeout(r, 50));
    const result = executeQuery(sql);
    onQueryRun();
    try {
      await onResult(result);
    } catch {
      // choreography errors are non-critical
    }
    setRunning(false);
  };

  const handleReset = () => {
    try {
      resetDatabase();
      setSql('');
      onResult({ columns: [], rows: [], empty: true });
    } catch (err: any) {
      onResult({ columns: [], rows: [], error: err.message });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (ta) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = sql.substring(0, start) + '  ' + sql.substring(end);
        setSql(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    }
  };

  return (
    <div className="sql-editor">
      <div className="sql-editor-label">🔍 SQL Editor</div>
      <textarea
        ref={textareaRef}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="SELECT * FROM employees WHERE ..."
        disabled={disabled}
        spellCheck={false}
        rows={5}
      />
      <div className="helper-text">Ctrl+Enter to execute</div>
      <div className="button-row">
        <button
          className="btn-execute"
          onClick={handleExecute}
          disabled={disabled || running || !sql.trim()}
        >
          {running ? '⏳ Running...' : '▶ Execute'}
        </button>
        <button
          className="btn-hint"
          onClick={onHintRequest}
          disabled={disabled}
        >
          💡 Hint
        </button>
        <button
          className="btn-reset"
          onClick={handleReset}
          disabled={disabled}
        >
          🔄 Reset DB
        </button>
      </div>
    </div>
  );
};
