/**
 * Board Choreography
 *
 * Cinematic reveal sequences when clues are solved.
 * Camera pans, evidence pins appear, red string connects the dots,
 * timeline builds up, suspect cards flip from locked to revealed.
 */

import type { Clue } from '../types/mystery';
import * as Game from '../engine/gameState';
import * as Pos from './positions';
import * as Items from './boardItems';
import { sleep } from '../utils/sleep';
import { getSuspectNames } from './layoutEngine';

// ---- Helper ----

async function addToFrame(frameId: string, itemId: string): Promise<void> {
  try {
    const frame = await miro.board.getById(frameId);
    if (frame.type === 'frame') {
      const item = await miro.board.getById(itemId);
      await frame.add(item);
    }
  } catch {
    // frame.add failed — non-critical
  }
}

async function removePlaceholder(key: string): Promise<void> {
  const refs = Game.getState().boardItemRefs;
  const id = refs[key];
  if (id) {
    await Items.safeRemoveItem(id);
    // Clear the ref so we don't try again
    Game.setBoardItemRef(key, '');
  }
}

// ---- Main Clue Reveal ----

export async function performClueReveal(
  clue: Clue,
  clueIndex: number
): Promise<void> {
  const refs = Game.getState().boardItemRefs;

  // ---- Step 1: Mark the clue sticky as solved ----
  try {
    const stickyId = refs[`clue_sticky_${clue.id}`];
    if (stickyId) {
      await Items.markClueStickyAsSolved(stickyId, clue.order, clue.reveal_text);
      await sleep(300);
    }
  } catch {
    // Non-critical
  }

  // ---- Step 2: Pan to evidence frame & create evidence node ----
  try {
    await miro.board.viewport.set({
      viewport: Pos.frameViewport('evidence'),
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      animationDurationInMs: 800,
    });
    await sleep(900);

    // Remove placeholder on first evidence item
    if (clueIndex === 0) {
      await removePlaceholder('placeholder_evidence');
      await sleep(200);
    }

    // Create the evidence node
    const nodePos = Pos.evidenceNodePosition(clueIndex);
    const evidenceNode = await Items.createEvidenceNode(
      clue.evidence_summary,
      nodePos.x,
      nodePos.y
    );
    Game.setBoardItemRef(`evidence_${clue.id}`, evidenceNode.id);
    if (refs['frame_evidence']) {
      await addToFrame(refs['frame_evidence'], evidenceNode.id);
    }
    await sleep(500);

    // Connect to the central anchor
    const anchorId = Game.getState().boardItemRefs['evidence_anchor'];
    if (anchorId) {
      const anchorConn = await Items.createAnchorConnector(anchorId, evidenceNode.id);
      Game.setBoardItemRef(`anchor_conn_${clue.id}`, anchorConn.id);
      await sleep(300);
    }

    // Connect to previous evidence node with red string
    if (clue.connects_to_clue !== undefined) {
      const prevNodeId = Game.getState().boardItemRefs[`evidence_${clue.connects_to_clue}`];
      if (prevNodeId) {
        const conn = await Items.createEvidenceConnector(
          prevNodeId,
          evidenceNode.id,
          `Clue #${clue.order - 1} → #${clue.order}`
        );
        Game.setBoardItemRef(`connector_${clue.id}`, conn.id);
        await sleep(400);
      }
    }
  } catch {
    // Evidence reveal failed — non-critical
  }

  // ---- Step 3: Pan to timeline & add entry ----
  try {
    await miro.board.viewport.set({
      viewport: Pos.frameViewport('timeline'),
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      animationDurationInMs: 700,
    });
    await sleep(800);

    // Remove placeholder on first timeline item
    if (clueIndex === 0) {
      await removePlaceholder('placeholder_timeline');
      await sleep(200);
    }

    const tlPos = Pos.timelineEntryPosition(clueIndex);
    const entry = await Items.createTimelineEntry(
      clue.timeline_entry,
      tlPos.x,
      tlPos.y,
      clueIndex
    );
    Game.setBoardItemRef(`timeline_${clue.id}`, entry.id);
    if (refs['frame_timeline']) {
      await addToFrame(refs['frame_timeline'], entry.id);
    }
    await sleep(400);

    // Connect to previous timeline entry
    if (clueIndex > 0) {
      const prevClue = findPreviousClue(clueIndex);
      const prevTimelineId = prevClue
        ? Game.getState().boardItemRefs[`timeline_${prevClue.id}`]
        : null;
      if (prevTimelineId) {
        const tlConn = await Items.createTimelineConnector(prevTimelineId, entry.id);
        Game.setBoardItemRef(`timeline_conn_${clue.id}`, tlConn.id);
        await sleep(300);
      }
    }
  } catch {
    // Timeline reveal failed — non-critical
  }

  // ---- Step 4: Reveal a suspect card ----
  try {
    const cardId = Game.getState().boardItemRefs[`suspect_${clueIndex}`];
    if (cardId) {
      await miro.board.viewport.set({
        viewport: Pos.frameViewport('suspects'),
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        animationDurationInMs: 700,
      });
      await sleep(800);

      // Use real suspect name if available
      const suspectNames = getSuspectNames();
      const suspectName = suspectNames[clueIndex] || `Suspect #${clueIndex + 1}`;
      const mystery = Game.getState().mysteryData;
      const isCulprit = mystery
        ? suspectName.toLowerCase() === mystery.solution.culprit.toLowerCase()
        : false;

      const isLastClue = mystery
        ? clueIndex === mystery.clues.length - 1
        : false;

      await Items.revealSuspectCard(
        cardId,
        suspectName,
        clue.evidence_summary,
        clue.reveal_text,
        !isCulprit && !isLastClue
      );
      await sleep(500);
    }
  } catch {
    // Suspect reveal failed — non-critical
  }

  // Show notification without zooming out
  try {
    await Items.showNotification(
      `Clue #${clue.order} solved! ${clue.evidence_summary}`
    );
  } catch {
    // Notification failed — non-critical
  }
}

// ---- Case Solved Grand Finale ----

export async function performCaseSolvedReveal(
  culprit: string,
  motive: string
): Promise<void> {
  try {
    // Dramatic pause
    await sleep(800);

    // Zoom to full board
    await miro.board.viewport.set({
      viewport: Pos.fullBoardViewport(),
      padding: { top: 80, bottom: 80, left: 80, right: 80 },
      animationDurationInMs: 1200,
    });
    await sleep(1400);

    // Mark the culprit's suspect card if we can find it
    const suspectNames = getSuspectNames();
    for (let i = 0; i < suspectNames.length; i++) {
      if (suspectNames[i].toLowerCase() === culprit.toLowerCase()) {
        const cardId = Game.getState().boardItemRefs[`suspect_${i}`];
        if (cardId) {
          await Items.revealSuspectCard(
            cardId,
            culprit,
            'PRIMARY SUSPECT — GUILTY',
            motive,
            false
          );
          await sleep(400);
        }
        break;
      }
    }

    // Create the case closed banner
    const bannerPos = Pos.caseClosedPosition();
    const banner = await Items.createCaseClosedBanner(
      bannerPos.x,
      bannerPos.y,
      culprit,
      motive
    );
    Game.setBoardItemRef('case_closed_banner', banner.id);
    await sleep(600);

    // Final notification
    await Items.showNotification('CASE CLOSED — Excellent detective work!');
  } catch {
    // Case solved sequence failed — non-critical
  }
}

// ---- Helpers ----

/**
 * Find the clue object at a given index (for looking up previous clue IDs).
 */
function findPreviousClue(currentIndex: number): Clue | null {
  const mystery = Game.getState().mysteryData;
  if (!mystery || currentIndex <= 0) return null;
  return mystery.clues[currentIndex - 1] ?? null;
}
