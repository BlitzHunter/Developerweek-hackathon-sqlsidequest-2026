/**
 * CaseSelector Component
 *
 * Start screen shown when no mystery is loaded.
 * Allows the player to:
 *   - Generate a new AI mystery (if API is available)
 *   - Start with the built-in sample mystery
 *   - Choose difficulty level
 *   - Optionally specify a theme
 *
 * Uses CSS classes from style.css for hover states and theme consistency.
 */

import * as React from 'react';

interface CaseSelectorProps {
  onStartSample: () => void;
  onGenerate: (difficulty: 'beginner' | 'intermediate' | 'advanced', theme?: string) => void;
  loading: boolean;
  error: string | null;
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  onStartSample,
  onGenerate,
  loading,
  error,
}) => {
  const [difficulty, setDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [theme, setTheme] = React.useState('');
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="case-selector">
      <div className="case-selector-header">
        <div className="case-selector-badge">🕵️ SQL MYSTERY</div>
        <h1 className="case-selector-title">Investigation Bureau</h1>
        <p className="case-selector-subtitle">
          Solve crimes with SQL. Query databases, follow the evidence,
          and unmask the culprit.
        </p>
      </div>

      {/* Quick Start */}
      <div className="case-selector-section">
        <button
          onClick={onStartSample}
          disabled={loading}
          className="btn-primary-case"
        >
          ▶ Start Case
        </button>
        <p className="case-selector-hint">
          "The Phantom Transaction" — A beginner embezzlement mystery
        </p>
      </div>

      {/* Divider */}
      <div className="case-divider">
        <span className="case-divider-text">or generate a new case</span>
      </div>

      {/* AI Generation */}
      <div className="case-selector-section">
        <label className="case-label">Difficulty</label>
        <div className="case-radio-group">
          {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
            <label key={d} className="case-radio-label">
              <input
                type="radio"
                name="difficulty"
                value={d}
                checked={difficulty === d}
                onChange={() => setDifficulty(d)}
                disabled={loading}
              />
              <span className="case-radio-text">
                {d === 'beginner' ? '🟢' : d === 'intermediate' ? '🟡' : '🔴'}{' '}
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </span>
            </label>
          ))}
        </div>

        {/* Optional theme */}
        <div
          className="case-advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▾' : '▸'} Custom theme (optional)
        </div>
        {showAdvanced && (
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Hospital data breach, Art gallery theft..."
            disabled={loading}
            className="case-theme-input"
          />
        )}

        <button
          onClick={() => onGenerate(difficulty, theme || undefined)}
          disabled={loading}
          className="btn-generate"
        >
          {loading ? '⏳ Generating mystery...' : '🎲 Generate New Mystery'}
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="case-error">
          <strong>⚠️ Generation failed:</strong> {error}
          <br />
          <span style={{ fontSize: 10 }}>
            Try the sample case, or check that your API key is configured.
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="case-loading-bar">
          <div className="case-loading-bar-inner" />
        </div>
      )}
    </div>
  );
};
