import * as React from 'react';

interface TutorialStep {
  title: string;
  icon: string;
  content: string;
  highlight?: string; // optional label for the highlighted UI zone
}

const STEPS: TutorialStep[] = [
  {
    icon: '🕵️',
    title: 'Welcome, Detective',
    content:
      'SQL Mystery is a detective game where you solve crimes by writing SQL queries. A crime has been committed — and the evidence is buried in a database. Your job is to find it.',
  },
  {
    icon: '📋',
    title: 'Read the Case Briefing',
    content:
      'The case briefing at the top of the panel describes the crime. Read it carefully — it tells you who the suspects are, where the crime happened, and what you\'re looking for.',
    highlight: 'Case Briefing',
  },
  {
    icon: '🔍',
    title: 'Follow the Clues',
    content:
      'Each case has 5 clues to solve in order. The current active clue is shown in the briefing. Each clue hints at a specific SQL query you need to write to uncover the evidence.',
    highlight: 'Current Clue',
  },
  {
    icon: '💻',
    title: 'Write SQL Queries',
    content:
      'Use the SQL editor to query the database. Write a SELECT statement that matches what the clue is asking for. Hit Run — if your result matches the expected evidence, the clue is solved and the board updates!',
    highlight: 'SQL Editor',
  },
  {
    icon: '🗺️',
    title: 'The Investigation Board',
    content:
      'The Miro board visualises your investigation. As you solve clues, connections, evidence nodes, and suspect cards are revealed on the board. Keep an eye on it — it tells the story.',
    highlight: 'Miro Board',
  },
  {
    icon: '⚠️',
    title: 'Rules of the Investigation',
    content:
      'Only SELECT queries are allowed. Attempting INSERT, UPDATE, DELETE, or DROP is considered tampering with evidence and earns a strike. Three strikes and the database is automatically restored. Stay clean, Detective.',
  },
  {
    icon: '💡',
    title: 'Need a Hand?',
    content:
      'Stuck? Hit the Hint button in the SQL editor — your AI detective partner will guide you without giving the answer away. The more hints you ask for, the more specific the guidance gets. Good luck.',
  },
];

const TUTORIAL_SEEN_KEY = 'sql_mystery_tutorial_seen';

export function hasTutorialBeenSeen(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markTutorialSeen(): void {
  try {
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
  } catch {
    // localStorage unavailable
  }
}

interface TutorialProps {
  onClose: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [step, setStep] = React.useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    markTutorialSeen();
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  // Close on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft' && step > 0) handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return (
    <div className="tutorial-overlay" onClick={handleClose}>
      <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="tutorial-header">
          <span className="tutorial-badge">HOW TO PLAY</span>
          <button className="tutorial-skip" onClick={handleClose}>
            Skip
          </button>
        </div>

        {/* Step icon + title */}
        <div className="tutorial-icon">{current.icon}</div>
        <h2 className="tutorial-title">{current.title}</h2>

        {/* Highlight tag */}
        {current.highlight && (
          <div className="tutorial-highlight">
            <span className="tutorial-highlight-arrow">▶</span> {current.highlight}
          </div>
        )}

        {/* Content */}
        <p className="tutorial-content">{current.content}</p>

        {/* Progress dots */}
        <div className="tutorial-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`tutorial-dot${i === step ? ' active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="tutorial-nav">
          <button
            className="tutorial-btn-back"
            onClick={handleBack}
            disabled={step === 0}
          >
            ← Back
          </button>
          <span className="tutorial-step-count">
            {step + 1} / {STEPS.length}
          </span>
          <button className="tutorial-btn-next" onClick={handleNext}>
            {isLast ? 'Start Investigating →' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  );
};
