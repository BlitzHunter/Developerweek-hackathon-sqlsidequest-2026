/**
 * CaseBriefing Component — dark detective theme
 */

import * as React from 'react';
import type { MysteryData, Clue } from '../types/mystery';

interface CaseBriefingProps {
  mystery: MysteryData;
  currentClue: Clue | null;
  solvedCount: number;
  totalClues: number;
  integrityStrikes: number;
  isSolved: boolean;
}

export const CaseBriefing: React.FC<CaseBriefingProps> = ({
  mystery,
  currentClue,
  solvedCount,
  totalClues,
  integrityStrikes,
  isSolved,
}) => {
  const progressPct = totalClues > 0 ? Math.round((solvedCount / totalClues) * 100) : 0;

  return (
    <div className="case-header">
      <h2>🕵️ SQL Side Quest</h2>
      <div className="case-title">{mystery.title}</div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: '#a89880' }}>
          {solvedCount}/{totalClues} clues solved
        </span>
        {integrityStrikes > 0 && (
          <span style={{ color: '#e74c3c' }}>
            {'⚡'.repeat(integrityStrikes)} {3 - integrityStrikes} left
          </span>
        )}
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Clue or completion */}
      {isSolved ? (
        <div style={{ marginTop: 10, color: '#7dcea0', fontSize: 12, lineHeight: 1.5 }}>
          <span className="case-closed-stamp">CASE CLOSED</span>
          <p style={{ margin: '4px 0 0' }}>{mystery.solution.final_narrative}</p>
        </div>
      ) : currentClue ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, color: '#c0392b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
            Clue #{currentClue.order}
          </div>
          <p className="clue-narrative">{currentClue.narrative}</p>
        </div>
      ) : (
        <p className="clue-narrative" style={{ marginTop: 10 }}>{mystery.briefing}</p>
      )}
    </div>
  );
};
