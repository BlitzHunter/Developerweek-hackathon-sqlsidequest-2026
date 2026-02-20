/**
 * App.tsx — Root component for SQL Mystery
 */

import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '../src/assets/style.css';

// Engine
import { initDatabase, loadMystery, resetDatabase, clearDatabase } from './engine/database';
import { validateQueryResult } from './engine/validator';
import { detectTampering, getStrikeReaction } from './engine/tamperDetector';
import type { TamperType } from './engine/tamperDetector';
import * as Game from './engine/gameState';

// Board
import { createBoardLayout, clearBoardLayout } from './board/layoutEngine';
import { performClueReveal, performCaseSolvedReveal } from './board/choreography';

// Components
import { CaseBriefing } from './components/CaseBriefing';
import { CaseSelector } from './components/CaseSelector';
import { SQLEditor } from './components/SQLEditor';
import { ResultsTable } from './components/ResultsTable';
import { DetectiveChat, type ChatMessage } from './components/DetectiveChat';
import { EvidenceTampering } from './components/EvidenceTampering';
import { Tutorial, hasTutorialBeenSeen } from './components/Tutorial';

// AI
import { generateMystery } from './ai/mysteryGenerator';
import { generateTemplateMystery, type LocationData } from './ai/templateGenerator';
import { generateLocations } from './ai/locationGenerator';
import { generateDescriptions } from './ai/descriptionGenerator';
import { generateTableSchemas } from './ai/tableSchemaGenerator';
import { generateClues } from './ai/clueGenerator';
import { generateLocationImages } from './ai/imageGenerator';
import { requestHint } from './ai/detectivePartner';

// Data
import { SAMPLE_MYSTERY } from './data/sampleMystery';

import type { MysteryData, QueryResult } from './types/mystery';

const MAX_STRIKES = 3;


const App: React.FC = () => {
  // ---- Core state ----
  const [phase, setPhase] = React.useState<'init' | 'selecting' | 'loading' | 'playing'>('init');
  const [error, setError] = React.useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = React.useState('Initializing...');

  // ---- Game UI state ----
  const [queryResult, setQueryResult] = React.useState<QueryResult | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [feedbackType, setFeedbackType] = React.useState<'success' | 'error' | 'info'>('info');
  const [hintText, setHintText] = React.useState<string | null>(null);
  const [revealing, setRevealing] = React.useState(false);
  const [lastQuery, setLastQuery] = React.useState<string | null>(null);

  // ---- Detective Chat ----
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);

  // ---- Tampering overlay ----
  const [tamperOverlay, setTamperOverlay] = React.useState<{
    tamperType: TamperType;
    message: string;
    reaction: string;
    strikes: number;
  } | null>(null);

  // ---- Tutorial ----
  const [showTutorial, setShowTutorial] = React.useState(false);

  // ---- Generation state (for CaseSelector) ----
  const [genLoading, setGenLoading] = React.useState(false);
  const [genError, setGenError] = React.useState<string | null>(null);

  // ---- Mystery loading lock (prevent double loading) ----
  const loadingRef = React.useRef(false);

  // ---- Game state reactivity ----
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => Game.subscribe(forceUpdate), []);

  const state = Game.getState();
  const currentClue = Game.getCurrentClue();
  const mystery = state.mysteryData;

  // ---- Hint level tracking (escalates with repeated requests) ----
  const hintLevelRef = React.useRef(1);
  React.useEffect(() => {
    // Reset hint level when clue changes
    hintLevelRef.current = 1;
  }, [state.currentClueIndex]);

  // ---- Chat helper ----
  const addChatMessage = React.useCallback(
    (type: ChatMessage['type'], text: string) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          text,
          timestamp: Date.now(),
        },
      ]);
    },
    []
  );

  // ---- Boot: init database, check for saved game ----
  React.useEffect(() => {
    async function boot() {
      try {
        setLoadingMessage('Loading database engine...');
        await initDatabase();

        // Check for a saved game in progress
        const restored = Game.loadSavedGame();
        if (restored && Game.getState().mysteryData) {
          setLoadingMessage('Restoring case files...');
          await loadMystery(Game.getState().mysteryData!);
          setPhase('playing');
          addChatMessage('detective', 'Welcome back, Detective. Let\'s pick up where we left off.');
          return;
        }

        // No saved game — show case selector
        setPhase('selecting');
      } catch (err: any) {
        setError(err.message);
        setPhase('selecting'); // still let them try
      }
    }
    boot();
  }, [addChatMessage]);

  // ---- Start a mystery (shared logic for sample + generated) ----
  const startMystery = React.useCallback(
    async (mysteryData: MysteryData) => {
      console.log('🔍 startMystery called for:', mysteryData.title);
      
      // Prevent concurrent mystery loading
      if (loadingRef.current) {
        console.warn('⚠️ Mystery loading already in progress. Ignoring duplicate call.');
        return;
      }

      loadingRef.current = true;
      console.log('🔒 Mystery loading lock acquired');

      try {
        setPhase('loading');
        setLoadingMessage('Clearing previous case...');
        setGenError(null);

        // Clear old database tables before loading new mystery
        clearDatabase();
        
        // Clear old board layout
        try {
          await clearBoardLayout();
          // Small delay to ensure cleanup completes
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          // Board clear failed - non-critical
          console.warn('Board clear failed:', err);
        }

        setLoadingMessage('Loading case data...');
        await loadMystery(mysteryData);
        Game.startGame(mysteryData);

        setLoadingMessage('Setting up the investigation board...');
        try {
          await createBoardLayout(mysteryData);
        } catch (err) {
          // Board layout failed — panel-only mode
          console.warn('Board layout creation failed:', err);
        }

        setPhase('playing');
        setChatMessages([]);
        setQueryResult(null);
        setFeedback(null);
        setHintText(null);

        // Show tutorial on first ever game
        if (!hasTutorialBeenSeen()) {
          setShowTutorial(true);
        }

        addChatMessage('detective', `New case: "${mysteryData.title}". ${mysteryData.briefing}`);
        addChatMessage('detective', 'Examine the schema and start querying. Your first lead is waiting.');
      } catch (err: any) {
        setGenError(err.message);
        setPhase('selecting');
      } finally {
        // Always release the lock
        loadingRef.current = false;
      }
    },
    [addChatMessage]
  );

  // ---- CaseSelector handlers ----
  const handleStartSample = React.useCallback(() => {
    startMystery(SAMPLE_MYSTERY);
  }, [startMystery]);

  const handleGenerate = React.useCallback(
    async (difficulty: 'beginner' | 'intermediate' | 'advanced', theme?: string) => {
      setGenLoading(true);
      setGenError(null);

      try {
        let locationData: LocationData | undefined;
        let tableSchemas;
        
        // Step 1: Generate title and location names if theme is provided
        if (theme && theme.trim()) {
          console.log('🎯 Generating locations from theme:', theme);
          setLoadingMessage('Generating mystery locations...');
          locationData = await generateLocations(theme, difficulty);
          console.log('✅ Locations generated:', locationData);
          
          // Step 2: Generate descriptions for each location
          console.log('📝 Generating location descriptions...');
          setLoadingMessage('Generating location descriptions...');
          const descriptions = await generateDescriptions(theme, locationData.locations, difficulty);
          console.log('✅ Descriptions generated:', descriptions);
          
          // Merge descriptions into locationData
          locationData = {
            ...locationData,
            descriptions,
          };
          
          // Step 3: Generate images for each location (6 images total)
          console.log('🎨 Generating location images...');
          setLoadingMessage('Generating location images (this may take 1 minute)...');
          const locationImages = await generateLocationImages(
            theme,
            locationData.locations,
            descriptions
          );
          console.log('✅ Location images generated');
          
          // Merge images into locationData
          locationData = {
            ...locationData,
            images: locationImages,
          };
          
          // Step 4: Generate table schemas and data (this may take 60-120 seconds)
          console.log('📊 Generating table schemas (18 tables)...');
          setLoadingMessage('Generating database schemas (this may take up to 2 minutes)...');
          tableSchemas = await generateTableSchemas({
            theme,
            difficulty,
            locationNames: locationData.locations,
          });
          console.log('✅ Table schemas generated:', tableSchemas.length, 'tables');
          
          // Step 5: Generate clues tied to each location
          console.log('🔍 Generating mystery clues...');
          setLoadingMessage('Generating investigation clues...');
          try {
            const aiClues = await generateClues({
              theme,
              difficulty,
              locationNames: locationData.locations,
              tables: tableSchemas,
            });
            console.log('✅ Clues generated:', aiClues.length, 'clues');
            locationData = { ...locationData, clues: aiClues };
          } catch (clueErr: any) {
            // Clues are non-critical — fall back to placeholder clues
            console.error('⚠️ Clue generation failed, using placeholders:', clueErr.message);
            setLoadingMessage(`Note: clue generation failed (${clueErr.message}) — using placeholders`);
            await new Promise(r => setTimeout(r, 1500));
          }
        }
        
        // Step 6: Create template with AI-generated content
        setLoadingMessage('Creating board layout...');
        const generated = await generateTemplateMystery(
          difficulty,
          locationData,
          tableSchemas,
          locationData?.clues
        );
        
        // Step 7: Load the mystery
        await startMystery(generated);
        
      } catch (err: any) {
        console.error('❌ Generation failed:', err);
        setGenError(err.message);
      } finally {
        setGenLoading(false);
      }
    },
    [startMystery]
  );

  // ---- Query result handler ----
  const handleResult = React.useCallback(
    async (result: QueryResult) => {
      setQueryResult(result);
      setHintText(null);

      if (currentClue && !result.error && !result.empty) {
        const validation = validateQueryResult(result, currentClue);
        if (validation.passed) {
          setFeedback(validation.feedback);
          setFeedbackType('success');
          addChatMessage('success', `Clue #${currentClue.order} solved! ${currentClue.reveal_text}`);

          const clueIndex = state.currentClueIndex;
          Game.markClueSolved(currentClue.id);

          setRevealing(true);
          try {
            await performClueReveal(currentClue, clueIndex);

            if (Game.isGameComplete() && mystery) {
              await performCaseSolvedReveal(mystery.solution.culprit, mystery.solution.motive);
              addChatMessage('detective', `Case closed! ${mystery.solution.final_narrative}`);
            } else {
              const nextClue = Game.getCurrentClue();
              if (nextClue) {
                addChatMessage('detective', `Good work. Next lead: ${nextClue.narrative}`);
              }
            }
          } catch {
            // Board choreography failed — continue without visual feedback
          }
          setRevealing(false);
        } else {
          setFeedback(validation.feedback);
          setFeedbackType('error');

          if (state.totalQueries > 0 && state.totalQueries % 3 === 0) {
            addChatMessage('detective', 'Hmm, not quite. Re-read the clue — what specific data are we after?');
          }
        }
      } else if (result.error) {
        setFeedback(null);
        addChatMessage('system', `SQL Error: ${result.error}`);
      } else {
        setFeedback(null);
      }
    },
    [currentClue, state.currentClueIndex, state.totalQueries, mystery, addChatMessage]
  );

  // ---- Tamper detection (pre-execute hook) ----
  const handlePreExecute = React.useCallback(
    (sql: string): boolean => {
      setLastQuery(sql);
      const tamperResult = detectTampering(sql);

      if (!tamperResult.safe) {
        const newStrikeCount = Game.addIntegrityStrike();
        const reaction = getStrikeReaction(newStrikeCount);

        setTamperOverlay({
          tamperType: tamperResult.tamperType!,
          message: tamperResult.message!,
          reaction,
          strikes: newStrikeCount,
        });

        // Screen shake effect
        const root = document.getElementById('root');
        if (root) {
          root.classList.add('shaking');
          setTimeout(() => root.classList.remove('shaking'), 400);
        }

        addChatMessage('warning', tamperResult.message!);
        addChatMessage('detective', reaction);

        // Auto-restore on max strikes
        if (newStrikeCount >= MAX_STRIKES) {
          try {
            resetDatabase();
            addChatMessage('system', 'Database automatically restored after 3 strikes.');
          } catch {
            // Auto-restore failed
          }
        }

        return false;
      }
      return true;
    },
    [addChatMessage]
  );

  const handleQueryRun = React.useCallback(() => {
    Game.incrementQueries();
  }, []);

  // ---- Hint handler (AI-powered with static fallback) ----
  const handleHint = React.useCallback(async () => {
    if (!currentClue || !mystery) return;
    Game.incrementHints();

    const level = hintLevelRef.current;
    hintLevelRef.current = Math.min(level + 1, 3);

    addChatMessage('system', 'Consulting detective partner...');

    const hint = await requestHint({
      mystery,
      clue: currentClue,
      userQuery: lastQuery,
      queryResult,
      hintLevel: level,
    });

    setHintText(hint);
    addChatMessage('detective', hint);
  }, [currentClue, mystery, lastQuery, queryResult, addChatMessage]);

  // ---- Tampering overlay handlers ----
  const handleTamperDismiss = React.useCallback(() => setTamperOverlay(null), []);

  const handleTamperRestore = React.useCallback(() => {
    try {
      resetDatabase();
      setTamperOverlay(null);
      setQueryResult(null);
      setFeedback(null);
      addChatMessage('system', 'Database restored. All evidence recovered.');
      addChatMessage('detective', 'Evidence restored. Stick to SELECT queries, Detective.');
    } catch {
      // Restore failed
    }
  }, [addChatMessage]);

  // ---- Board rebuild ----
  const handleRebuildBoard = React.useCallback(async () => {
    if (!mystery) return;
    setRevealing(true);
    addChatMessage('system', 'Rebuilding the investigation board...');
    try {
      await clearBoardLayout();
      await createBoardLayout(mystery);
      addChatMessage('detective', 'Board restored. Your progress is intact — keep investigating.');
    } catch {
      addChatMessage('system', 'Board rebuild failed. The panel still works — carry on, Detective.');
    }
    setRevealing(false);
  }, [mystery, addChatMessage]);

  // ---- New Case handler ----
  const handleNewCase = React.useCallback(async () => {
    // IMPORTANT: Clear the board layout BEFORE clearing game state
    // (game state contains the board item references we need to delete items)
    try {
      await clearBoardLayout();
    } catch {
      // Board clear failed - non-critical
    }
    
    // Now clear game state from localStorage
    Game.clearSavedGame();
    
    // Clear database tables
    clearDatabase();
    
    // Reset UI state
    setChatMessages([]);
    setQueryResult(null);
    setFeedback(null);
    setHintText(null);
    setPhase('selecting');
  }, []);

  // =============== RENDER ===============

  // Init / loading database engine
  if (phase === 'init') {
    return (
      <div className="loading-screen">
        <h2>SQL MYSTERY</h2>
        <p>{loadingMessage}</p>
        <div className="spinner" />
      </div>
    );
  }

  // Case selector
  if (phase === 'selecting') {
    return (
      <CaseSelector
        onStartSample={handleStartSample}
        onGenerate={handleGenerate}
        loading={genLoading}
        error={genError || error}
      />
    );
  }

  // Loading mystery
  if (phase === 'loading') {
    return (
      <div className="loading-screen">
        <h2>SQL MYSTERY</h2>
        <p>{loadingMessage}</p>
        <div className="spinner" />
      </div>
    );
  }

  // Fatal: no mystery loaded
  if (!mystery) {
    return <div style={{ padding: 20, color: '#666' }}>No case loaded.</div>;
  }

  // Main game UI
  return (
    <div>
      {/* Tutorial Overlay (first-time only) */}
      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}

      {/* Tampering Overlay */}
      {tamperOverlay && (
        <EvidenceTampering
          tamperType={tamperOverlay.tamperType}
          message={tamperOverlay.message}
          reaction={tamperOverlay.reaction}
          strikes={tamperOverlay.strikes}
          maxStrikes={MAX_STRIKES}
          onRestore={handleTamperRestore}
          onDismiss={handleTamperDismiss}
        />
      )}

      {/* Case Header */}
      <CaseBriefing
        mystery={mystery}
        currentClue={currentClue}
        solvedCount={state.solvedClues.length}
        totalClues={mystery.clues.length}
        integrityStrikes={state.integrityStrikes}
        isSolved={Game.isGameComplete()}
      />

      {/* Schema - now displayed on board instead of panel */}
      {/* <SchemaViewer /> */}

      {/* SQL Editor */}
      <SQLEditor
        onResult={handleResult}
        onQueryRun={handleQueryRun}
        onHintRequest={handleHint}
        onPreExecute={handlePreExecute}
        disabled={Game.isGameComplete() || revealing}
      />

      {/* Revealing indicator */}
      {revealing && (
        <div className="revealing-indicator">
          Updating the investigation board...
        </div>
      )}

      {/* Hint */}
      {hintText && (
        <div className="feedback info">
          <strong>Hint:</strong> {hintText}
        </div>
      )}

      {/* Validation feedback */}
      {feedback && (
        <div className={`feedback ${feedbackType}`}>
          {feedback}
        </div>
      )}

      {/* Results */}
      <ResultsTable result={queryResult} />

      {/* Detective Chat */}
      <DetectiveChat messages={chatMessages} />

      {/* Footer */}
      <div className="footer-stats">
        Queries: {state.totalQueries} &nbsp;|&nbsp; Hints: {state.hintsUsed}
        {state.integrityStrikes > 0 && (
          <span className="strikes">
            &nbsp;|&nbsp; Strikes: {state.integrityStrikes}/{MAX_STRIKES}
          </span>
        )}
        <div className="footer-actions">
          <button
            onClick={() => setShowTutorial(true)}
            className="footer-action"
          >
            How to Play
          </button>
          <button
            onClick={handleRebuildBoard}
            disabled={revealing}
            className="footer-action"
          >
            Rebuild Board
          </button>
          <button
            onClick={handleNewCase}
            disabled={revealing}
            className="footer-action"
          >
            New Case
          </button>
        </div>
      </div>

    </div>
  );
};

// ---- Mount ----
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
