/**
 * EvidenceTampering Component
 *
 * Warning overlay that appears when the player runs a destructive SQL query.
 * Shows the tampering type, a detective reaction, and a "Restore Evidence"
 * button when strikes reach 3.
 *
 * This component is rendered conditionally in app.tsx — it slides in as
 * an overlay when a tamper event occurs and fades out after a few seconds
 * or when dismissed.
 */

import * as React from 'react';
import type { TamperType } from '../engine/tamperDetector';

interface EvidenceTamperingProps {
  /** The type of tampering detected */
  tamperType: TamperType;
  /** The detective warning message */
  message: string;
  /** The detective's reaction based on strike count */
  reaction: string;
  /** Current number of integrity strikes */
  strikes: number;
  /** Max strikes allowed */
  maxStrikes: number;
  /** Called when user clicks "Restore Evidence" */
  onRestore: () => void;
  /** Called when user dismisses the warning */
  onDismiss: () => void;
}

export const EvidenceTampering: React.FC<EvidenceTamperingProps> = ({
  tamperType,
  message,
  reaction,
  strikes,
  maxStrikes,
  onRestore,
  onDismiss,
}) => {
  const isMaxStrikes = strikes >= maxStrikes;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Warning header */}
        <div style={styles.header}>
          <span style={styles.icon}>⚠️</span>
          <span style={styles.headerText}>EVIDENCE TAMPERING DETECTED</span>
        </div>

        {/* What they tried to do */}
        <div style={styles.tamperBadge}>
          {tamperType} operation blocked
        </div>

        {/* Warning message */}
        <p style={styles.message}>{message}</p>

        {/* Detective reaction */}
        <div style={styles.reaction}>{reaction}</div>

        {/* Strike indicator */}
        <div style={styles.strikeRow}>
          <span style={styles.strikeLabel}>Integrity Strikes:</span>
          <span style={styles.strikeIcons}>
            {Array.from({ length: maxStrikes }).map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.strikeDot,
                  background: i < strikes ? '#e74c3c' : '#333',
                }}
              >
                ⚡
              </span>
            ))}
          </span>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {isMaxStrikes ? (
            <button
              className="button button-primary"
              onClick={onRestore}
              style={styles.restoreBtn}
            >
              🔄 Restore Evidence (Reset Database)
            </button>
          ) : (
            <button
              className="button button-secondary"
              onClick={onDismiss}
            >
              Got it — I'll stick to SELECT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 0, 0, 0.94)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  card: {
    background: '#181818',
    borderRadius: 10,
    padding: 24,
    maxWidth: 360,
    width: '100%',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
    border: '2px solid #e74c3c',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e74c3c',
    letterSpacing: '0.5px',
  },
  tamperBadge: {
    display: 'inline-block',
    background: 'rgba(192, 57, 43, 0.15)',
    color: '#e74c3c',
    padding: '3px 10px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  message: {
    fontSize: 13,
    lineHeight: 1.5,
    color: '#e8dcc8',
    margin: '0 0 12px',
  },
  reaction: {
    background: 'rgba(41, 128, 185, 0.08)',
    padding: 12,
    borderRadius: 6,
    borderLeft: '4px solid #2980b9',
    fontSize: 13,
    lineHeight: 1.5,
    color: '#85c1e9',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  strikeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  strikeLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#a89880',
  },
  strikeIcons: {
    display: 'flex',
    gap: 4,
  },
  strikeDot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    fontSize: 12,
  },
  actions: {
    textAlign: 'center' as const,
  },
  restoreBtn: {
    width: '100%',
    background: '#e74c3c',
    borderColor: '#e74c3c',
  },
};
