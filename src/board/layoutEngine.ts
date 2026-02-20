/**
 * Layout Engine
 *
 * Creates the detective investigation board on Miro.
 * Uses frame.add() to parent all items to their frames.
 */

import type { MysteryData } from '../types/mystery';
import * as Game from '../engine/gameState';
import * as Pos from './positions';
import * as Items from './boardItems';
import * as ObjPos from './objectPositions';
import {
  caseFileBackground,
  evidenceWebBackground,
  timelineBackground,
  corkBoardBackground,
} from './backgroundImages';
import { sleep } from '../utils/sleep';
import { loadImageAsDataUrl } from '../utils/imageLoader';

// Flag to prevent double creation during the same generation
let isCreating = false;

export async function createBoardLayout(mystery: MysteryData): Promise<void> {
  console.log('🎨 createBoardLayout called for:', mystery.title);
  
  // Prevent concurrent creation
  if (isCreating) {
    console.warn('⚠️ Board layout creation already in progress. Skipping duplicate call.');
    return;
  }

  // Check if board already exists (prevent duplicates)
  const state = Game.getState();
  if (state.boardItemRefs.frame_caseBoard) {
    console.warn('⚠️ Board layout already exists. Clear it first before creating a new one.');
    return;
  }

  // Set creation lock
  isCreating = true;
  console.log('🔒 Board creation lock acquired');

  try {
    await createBoardLayoutInternal(mystery);
    console.log('✅ Board layout created successfully');
  } catch (err) {
    console.error('❌ Board layout creation failed:', err);
    throw err;
  } finally {
    // Always release the lock
    isCreating = false;
    console.log('🔓 Board creation lock released');
  }
}

async function createBoardLayoutInternal(mystery: MysteryData): Promise<void> {
  // Detect if this is a generated mystery (uses placeholders for content)
  // vs. sample mystery (uses real content)
  const hasLocationNames = !!mystery.locationNames;
  const isPlaceholderTitle = mystery.title === '{}';
  
  // If locationNames exist OR title is '{}', we're in generated mode
  const isPlaceholderMode = hasLocationNames || isPlaceholderTitle;
  
  if (isPlaceholderMode) {
    console.log('🎨 Generated mystery mode - using placeholders for images and descriptions');
  }
  
  if (hasLocationNames) {
    console.log('📍 Using AI-generated location names:', mystery.locationNames);
  }
  
  // ---- 0. Create main board background (first, so it's behind everything) ----
  
  try {
    console.log('🖼️ Creating main board background...');
    
    const mainBgDataUrl = await loadImageAsDataUrl(ObjPos.MAIN_BACKGROUND.path);
    const mainBg = await miro.board.createImage({
      url: mainBgDataUrl,
      x: ObjPos.MAIN_BACKGROUND.x,
      y: ObjPos.MAIN_BACKGROUND.y,
      width: ObjPos.MAIN_BACKGROUND.width,
      title: ObjPos.MAIN_BACKGROUND.title,
    });
    Game.setBoardItemRef(ObjPos.MAIN_BACKGROUND.refKey, mainBg.id);
    console.log('✅ Main board background created:', mainBg.id);
  } catch (err) {
    console.error('⚠️ Failed to create main board background:', err);
    // Non-critical - continue without main background
  }

  // ---- 0b. Create ambient rain background ----
  
  try {
    console.log('🌧️ Creating rain background...');
    
    if (ObjPos.RAIN_BG_URL) {
      console.log('Attempting to load rain GIF from:', ObjPos.RAIN_BG_URL);
      
      const rainBg = await miro.board.createImage({
        url: ObjPos.RAIN_BG_URL,
        x: ObjPos.RAIN_BACKGROUND.x,
        y: ObjPos.RAIN_BACKGROUND.y,
        width: ObjPos.RAIN_BACKGROUND.width,
        title: ObjPos.RAIN_BACKGROUND.title,
      });
      Game.setBoardItemRef(ObjPos.RAIN_BACKGROUND.refKey, rainBg.id);
      console.log('✅ Rain background created:', rainBg.id);
    } else {
      console.log('ℹ️ Rain background disabled - add VITE_RAIN_BG_URL to .env to enable');
    }
  } catch (err) {
    console.error('⚠️ Failed to create rain background:', err);
    console.log('💡 Tip: Upload gif/rain_bg.gif to imgur.com and add the URL to .env as VITE_RAIN_BG_URL=https://...');
    // Non-critical - continue without background
  }

  // ---- 1. Create frames ----

  const caseFrame = await Items.createFrame(
    'CASE FILE — ' + mystery.title.toUpperCase(),
    Pos.FRAMES.caseBoard.cx,
    Pos.FRAMES.caseBoard.cy,
    Pos.FRAMES.caseBoard.width,
    Pos.FRAMES.caseBoard.height,
    Items.COLORS.corkBoard
  );
  Game.setBoardItemRef('frame_caseBoard', caseFrame.id);
  await sleep(100);

  const evidenceFrame = await Items.createFrame(
    'EVIDENCE WEB',
    Pos.FRAMES.evidence.cx,
    Pos.FRAMES.evidence.cy,
    Pos.FRAMES.evidence.width,
    Pos.FRAMES.evidence.height,
    Items.COLORS.evidenceFrame
  );
  Game.setBoardItemRef('frame_evidence', evidenceFrame.id);
  await sleep(100);

  const timelineFrame = await Items.createFrame(
    'TIMELINE',
    Pos.FRAMES.timeline.cx,
    Pos.FRAMES.timeline.cy,
    Pos.FRAMES.timeline.width,
    Pos.FRAMES.timeline.height,
    Items.COLORS.timelineFrame
  );
  Game.setBoardItemRef('frame_timeline', timelineFrame.id);
  await sleep(100);

  // ---- 1b. Background images ----

  try {
    const caseBg = await Items.createBackgroundImage(
      caseFileBackground(Pos.CASE_FRAME_WIDTH, Pos.CASE_FRAME_HEIGHT),
      Pos.FRAMES.caseBoard.cx,
      Pos.FRAMES.caseBoard.cy,
      Pos.CASE_FRAME_WIDTH
    );
    await addToFrame(caseFrame.id, caseBg.id);
    Game.setBoardItemRef('bg_caseBoard', caseBg.id);

    const evidenceBg = await Items.createBackgroundImage(
      evidenceWebBackground(Pos.BOTTOM_FRAME_WIDTH, Pos.BOTTOM_FRAME_HEIGHT),
      Pos.FRAMES.evidence.cx,
      Pos.FRAMES.evidence.cy,
      Pos.BOTTOM_FRAME_WIDTH
    );
    await addToFrame(evidenceFrame.id, evidenceBg.id);
    Game.setBoardItemRef('bg_evidence', evidenceBg.id);

    const timelineBg = await Items.createBackgroundImage(
      timelineBackground(Pos.BOTTOM_FRAME_WIDTH, Pos.BOTTOM_FRAME_HEIGHT),
      Pos.FRAMES.timeline.cx,
      Pos.FRAMES.timeline.cy,
      Pos.BOTTOM_FRAME_WIDTH
    );
    await addToFrame(timelineFrame.id, timelineBg.id);
    Game.setBoardItemRef('bg_timeline', timelineBg.id);
  } catch {
    // Background images are non-critical
  }

  // ---- 2. Case briefing text ----

  const bp = Pos.caseBriefingPosition();
  const briefingText = await Items.createCaseBriefingText(
    mystery.title,
    mystery.briefing,
    bp.x,
    bp.y
  );
  await addToFrame(caseFrame.id, briefingText.id);
  Game.setBoardItemRef('case_briefing_text', briefingText.id);
  console.log('✅ Case briefing text created:', briefingText.id);

  // ---- 4. Store suspect names (used by choreography to reveal later) ----

  const suspectNames = extractSuspectNames(mystery);
  for (let i = 0; i < suspectNames.length; i++) {
    Game.setBoardItemRef(`suspect_name_${i}`, suspectNames[i]);
  }

  // ---- 5. Evidence anchor (center of web) ----

  const anchorPos = Pos.evidenceCenterPosition();
  const anchor = await Items.createEvidenceAnchor(
    mystery.title,
    anchorPos.x,
    anchorPos.y
  );
  Game.setBoardItemRef('evidence_anchor', anchor.id);
  await addToFrame(evidenceFrame.id, anchor.id);

  // ---- 6. Timeline header ----

  const tlHeaderPos = Pos.timelineHeaderPosition();
  const tlHeader = await Items.createTimelineHeader(
    tlHeaderPos.x,
    tlHeaderPos.y
  );
  Game.setBoardItemRef('timeline_header', tlHeader.id);
  await addToFrame(timelineFrame.id, tlHeader.id);

  // ---- 7. Cork Board (user notes area) ----

  try {
    const corkBoardFrame = await Items.createFrame(
      '📌 DETECTIVE NOTES — Pin your thoughts here',
      Pos.FRAMES.corkBoard.cx,
      Pos.FRAMES.corkBoard.cy,
      Pos.FRAMES.corkBoard.width,
      Pos.FRAMES.corkBoard.height,
      Items.COLORS.corkBoardFrame
    );
    Game.setBoardItemRef('frame_corkBoard', corkBoardFrame.id);
    await sleep(100);

    // Cork board background - load local image as base64
    try {
      // Load cork board image from public folder as base64 data URL
      const corkImageDataUrl = await loadImageAsDataUrl(ObjPos.CORK_BOARD_IMAGE_PATH);
      
      console.log('🖼️ Creating cork board image from local file...');
      const corkImg = await miro.board.createImage({
        url: corkImageDataUrl, // Base64 data URL - works without external hosting!
        x: ObjPos.CORK_BOARD_BACKGROUND.x,
        y: ObjPos.CORK_BOARD_BACKGROUND.y,
        width: ObjPos.CORK_BOARD_BACKGROUND.width,
        title: ObjPos.CORK_BOARD_BACKGROUND.title,
      });
      await addToFrame(corkBoardFrame.id, corkImg.id);
      Game.setBoardItemRef(ObjPos.CORK_BOARD_BACKGROUND.refKey, corkImg.id);
      console.log('✅ Cork board image added successfully');
    } catch (err) {
      // Fallback to SVG background if image loading fails
      console.warn('⚠️ Cork board image failed, using SVG fallback:', err);
      try {
        const corkBg = await Items.createBackgroundImage(
          corkBoardBackground(Pos.CORK_BOARD_WIDTH, Pos.CORK_BOARD_HEIGHT),
          Pos.FRAMES.corkBoard.cx,
          Pos.FRAMES.corkBoard.cy,
          Pos.CORK_BOARD_WIDTH
        );
        await addToFrame(corkBoardFrame.id, corkBg.id);
        Game.setBoardItemRef('bg_corkBoard', corkBg.id);
      } catch {
        // Background is non-critical
      }
    }

    // Header text
    try {
      const corkHeaderPos = Pos.corkBoardHeaderPosition();
      const corkHeader = await Items.createFrameTitle(
        '📌 PIN YOUR NOTES HERE',
        corkHeaderPos.x,
        corkHeaderPos.y,
        16
      );
      await addToFrame(corkBoardFrame.id, corkHeader.id);
      Game.setBoardItemRef('corkBoard_header', corkHeader.id);
    } catch {
      // Header is non-critical
    }

    // Starter sticky notes
    const starterNotes = [
      { text: 'Suspects:\n\n•\n•\n•', x: -600, colorIdx: 0, key: 'cork_note_suspects' },
      { text: 'Key Evidence:\n\n•\n•\n•', x: -200, colorIdx: 1, key: 'cork_note_evidence' },
      { text: 'SQL Queries to try:\n\n•\n•', x: 200, colorIdx: 2, key: 'cork_note_queries' },
      { text: 'Connections:\n\n•\n•', x: 600, colorIdx: 3, key: 'cork_note_connections' },
    ];

    for (const note of starterNotes) {
      try {
        const sticky = await Items.createCorkBoardNote(
          note.text,
          Pos.FRAMES.corkBoard.cx + note.x,
          Pos.FRAMES.corkBoard.cy + 80,
          note.colorIdx
        );
        await addToFrame(corkBoardFrame.id, sticky.id);
        // Save sticky note ref so it can be cleaned up later
        Game.setBoardItemRef(note.key, sticky.id);
        console.log(`✅ Cork board note created: ${note.key}`, sticky.id);
      } catch (err) {
        // Individual sticky is non-critical
        console.warn('Failed to create cork board note:', note.text.substring(0, 20), err);
      }
    }
  } catch {
    // Cork board section is non-critical — board works without it
  }

  // ---- 9. Placeholder text (will be removed when first items appear) ----

  const evidencePlaceholder = await Items.createSubtitle(
    'Solve clues to reveal connections...',
    Pos.FRAMES.evidence.cx,
    Pos.FRAMES.evidence.cy + 60
  );
  await addToFrame(evidenceFrame.id, evidencePlaceholder.id);
  Game.setBoardItemRef('placeholder_evidence', evidencePlaceholder.id);

  const timelinePlaceholder = await Items.createSubtitle(
    'Events appear as you investigate...',
    Pos.FRAMES.timeline.cx,
    Pos.FRAMES.timeline.cy + 20
  );
  await addToFrame(timelineFrame.id, timelinePlaceholder.id);
  Game.setBoardItemRef('placeholder_timeline', timelinePlaceholder.id);

  // ---- 10. City Landscape ----
  // NOTE: City boxes are created as standalone items, not in frames
  // We save their IDs so they can be properly cleaned up later

  try {
    console.log('🏙️ Creating city landscape boxes...');
    
    // Office Building (BOX1)
    const box1Title = mystery.locationNames?.box1 || (isPlaceholderMode ? 'BOX1' : 'Office');
    const box1Description = mystery.locationDescriptions?.box1 || 
      (isPlaceholderMode ? '{BOX1_DESCRIPTION}' : 'Main workplace - Interview suspects, check records, and gather evidence');
    const officeBox = await Items.createCityBox(
      box1Title,
      box1Description,
      Pos.FRAMES.cityOffice.cx,
      Pos.FRAMES.cityOffice.cy,
      Pos.FRAMES.cityOffice.width,
      Pos.FRAMES.cityOffice.height,
      '#0d0d0d',
      isPlaceholderMode ? '' : '🏢'
    );
    Game.setBoardItemRef('city_office', officeBox.id);
    console.log('✅ Office box created:', officeBox.id);
    
    // Add office area images side by side
    if (mystery.locationImages?.box1?.left) {
      try {
        console.log('🎨 Adding AI-generated office images...');
        
        // Left office image (AI-generated)
        const officeImageLeft = await miro.board.createImage({
          url: mystery.locationImages.box1.left,
          x: ObjPos.OFFICE_IMAGE_LEFT.x,
          y: ObjPos.OFFICE_IMAGE_LEFT.y,
          width: ObjPos.OFFICE_IMAGE_LEFT.width,
          title: 'AI-generated location image',
        });
        Game.setBoardItemRef(ObjPos.OFFICE_IMAGE_LEFT.refKey, officeImageLeft.id);
        console.log('✅ Office left AI image added:', officeImageLeft.id);
        
        // Right office image (AI-generated, optional)
        if (mystery.locationImages.box1.right) {
          const officeImageRight = await miro.board.createImage({
            url: mystery.locationImages.box1.right,
            x: ObjPos.OFFICE_IMAGE_RIGHT.x,
            y: ObjPos.OFFICE_IMAGE_RIGHT.y,
            width: ObjPos.OFFICE_IMAGE_RIGHT.width,
            title: 'AI-generated location image',
          });
          Game.setBoardItemRef(ObjPos.OFFICE_IMAGE_RIGHT.refKey, officeImageRight.id);
          console.log('✅ Office right AI image added:', officeImageRight.id);
        }
      } catch (err) {
        console.warn('⚠️ Failed to add AI-generated office images:', err);
      }
    } else if (isPlaceholderMode) {
      try {
        console.log('📝 Creating office image placeholder...');
        
        // Left office placeholder only
        const officeLeftPlaceholder = await miro.board.createShape({
          shape: 'rectangle',
          x: ObjPos.OFFICE_IMAGE_LEFT.x,
          y: ObjPos.OFFICE_IMAGE_LEFT.y,
          width: ObjPos.OFFICE_IMAGE_LEFT.width,
          height: 300,
          content: '<p style="text-align:center;font-size:14px;color:#666">{BOX1_LEFT_IMAGE}</p>',
          style: {
            fillColor: '#f0f0f0',
            borderColor: '#999',
            borderWidth: 2,
            borderStyle: 'dashed',
          },
        });
        Game.setBoardItemRef(ObjPos.OFFICE_IMAGE_LEFT.refKey, officeLeftPlaceholder.id);
        console.log('✅ Office image placeholder created');
      } catch (err) {
        console.warn('⚠️ Failed to create office placeholder:', err);
      }
    } else {
      try {
        console.log('🖼️ Adding office area images...');
        
        const officeImageLeftDataUrl = await loadImageAsDataUrl(ObjPos.OFFICE_IMAGE_LEFT.path);
        const officeImageLeft = await miro.board.createImage({
          url: officeImageLeftDataUrl,
          x: ObjPos.OFFICE_IMAGE_LEFT.x,
          y: ObjPos.OFFICE_IMAGE_LEFT.y,
          width: ObjPos.OFFICE_IMAGE_LEFT.width,
          title: ObjPos.OFFICE_IMAGE_LEFT.title,
        });
        Game.setBoardItemRef(ObjPos.OFFICE_IMAGE_LEFT.refKey, officeImageLeft.id);
        console.log('✅ Office left image added:', officeImageLeft.id);
        
        const officeImageRightDataUrl = await loadImageAsDataUrl(ObjPos.OFFICE_IMAGE_RIGHT.path);
        const officeImageRight = await miro.board.createImage({
          url: officeImageRightDataUrl,
          x: ObjPos.OFFICE_IMAGE_RIGHT.x,
          y: ObjPos.OFFICE_IMAGE_RIGHT.y,
          width: ObjPos.OFFICE_IMAGE_RIGHT.width,
          title: ObjPos.OFFICE_IMAGE_RIGHT.title,
        });
        Game.setBoardItemRef(ObjPos.OFFICE_IMAGE_RIGHT.refKey, officeImageRight.id);
        console.log('✅ Office right image added:', officeImageRight.id);
      } catch (err) {
        console.warn('⚠️ Failed to add office area images:', err);
        // Non-critical - continue without office images
      }
    }
    await sleep(80);

    // Police Station (BOX2)
    const box2Title = mystery.locationNames?.box2 || (isPlaceholderMode ? 'BOX2' : 'Police');
    const box2Description = mystery.locationDescriptions?.box2 || 
      (isPlaceholderMode ? '{BOX2_DESCRIPTION}' : 'Investigation headquarters - Evidence logs, incident reports, and forensics');
    const policeBox = await Items.createCityBox(
      box2Title,
      box2Description,
      Pos.FRAMES.cityPolice.cx,
      Pos.FRAMES.cityPolice.cy,
      Pos.FRAMES.cityPolice.width,
      Pos.FRAMES.cityPolice.height,
      '#0d0d0d',
      isPlaceholderMode ? '' : '🚓'
    );
    Game.setBoardItemRef('city_police', policeBox.id);
    console.log('✅ Police station created:', policeBox.id);
    
    // Add police station images side by side
    if (mystery.locationImages?.box2?.left) {
      try {
        console.log('🎨 Adding AI-generated police images...');
        
        // Left police image (AI-generated)
        const policeImageLeft = await miro.board.createImage({
          url: mystery.locationImages.box2.left,
          x: ObjPos.POLICE_IMAGE_LEFT.x,
          y: ObjPos.POLICE_IMAGE_LEFT.y,
          width: ObjPos.POLICE_IMAGE_LEFT.width,
          title: 'AI-generated location image',
        });
        Game.setBoardItemRef(ObjPos.POLICE_IMAGE_LEFT.refKey, policeImageLeft.id);
        console.log('✅ Police left AI image added:', policeImageLeft.id);
        
        // Right police image (AI-generated, optional)
        if (mystery.locationImages.box2.right) {
          const policeImageRight = await miro.board.createImage({
            url: mystery.locationImages.box2.right,
            x: ObjPos.POLICE_IMAGE_RIGHT.x,
            y: ObjPos.POLICE_IMAGE_RIGHT.y,
            width: ObjPos.POLICE_IMAGE_RIGHT.width,
            title: 'AI-generated location image',
          });
          Game.setBoardItemRef(ObjPos.POLICE_IMAGE_RIGHT.refKey, policeImageRight.id);
          console.log('✅ Police right AI image added:', policeImageRight.id);
        }
      } catch (err) {
        console.warn('⚠️ Failed to add AI-generated police images:', err);
      }
    } else if (isPlaceholderMode) {
      try {
        console.log('📝 Creating police image placeholder...');
        
        // Left police placeholder only
        const policeLeftPlaceholder = await miro.board.createShape({
          shape: 'rectangle',
          x: ObjPos.POLICE_IMAGE_LEFT.x,
          y: ObjPos.POLICE_IMAGE_LEFT.y,
          width: ObjPos.POLICE_IMAGE_LEFT.width,
          height: 300,
          content: '<p style="text-align:center;font-size:14px;color:#666">{BOX2_LEFT_IMAGE}</p>',
          style: {
            fillColor: '#f0f0f0',
            borderColor: '#999',
            borderWidth: 2,
            borderStyle: 'dashed',
          },
        });
        Game.setBoardItemRef(ObjPos.POLICE_IMAGE_LEFT.refKey, policeLeftPlaceholder.id);
        console.log('✅ Police image placeholder created');
      } catch (err) {
        console.warn('⚠️ Failed to create police placeholder:', err);
      }
    } else {
      try {
        console.log('🖼️ Adding police station images...');
        
        const policeImageLeftDataUrl = await loadImageAsDataUrl(ObjPos.POLICE_IMAGE_LEFT.path);
        const policeImageLeft = await miro.board.createImage({
          url: policeImageLeftDataUrl,
          x: ObjPos.POLICE_IMAGE_LEFT.x,
          y: ObjPos.POLICE_IMAGE_LEFT.y,
          width: ObjPos.POLICE_IMAGE_LEFT.width,
          title: ObjPos.POLICE_IMAGE_LEFT.title,
        });
        Game.setBoardItemRef(ObjPos.POLICE_IMAGE_LEFT.refKey, policeImageLeft.id);
        console.log('✅ Police left image added:', policeImageLeft.id);
        
        const policeImageRightDataUrl = await loadImageAsDataUrl(ObjPos.POLICE_IMAGE_RIGHT.path);
        const policeImageRight = await miro.board.createImage({
          url: policeImageRightDataUrl,
          x: ObjPos.POLICE_IMAGE_RIGHT.x,
          y: ObjPos.POLICE_IMAGE_RIGHT.y,
          width: ObjPos.POLICE_IMAGE_RIGHT.width,
          title: ObjPos.POLICE_IMAGE_RIGHT.title,
        });
        Game.setBoardItemRef(ObjPos.POLICE_IMAGE_RIGHT.refKey, policeImageRight.id);
        console.log('✅ Police right image added:', policeImageRight.id);
      } catch (err) {
        console.warn('⚠️ Failed to add police station images:', err);
        // Non-critical - continue without police images
      }
    }
    await sleep(80);

    // Bank (BOX3)
    const box3Title = mystery.locationNames?.box3 || (isPlaceholderMode ? 'BOX3' : 'City Bank');
    const box3Description = mystery.locationDescriptions?.box3 || 
      (isPlaceholderMode ? '{BOX3_DESCRIPTION}' : 'Financial records, transactions, and suspicious money trails');
    const bankBox = await Items.createCityBox(
      box3Title,
      box3Description,
      Pos.FRAMES.cityBank.cx,
      Pos.FRAMES.cityBank.cy,
      Pos.FRAMES.cityBank.width,
      Pos.FRAMES.cityBank.height,
      '#0d0d0d',
      isPlaceholderMode ? '' : '🏦'
    );
    Game.setBoardItemRef('city_bank', bankBox.id);
    console.log('✅ Bank box created:', bankBox.id);
    
    // Add bank images (side by side)
    if (mystery.locationImages?.box3?.left) {
      try {
        console.log('🎨 Adding AI-generated bank images...');
        
        const bankImageLeft = await miro.board.createImage({
          url: mystery.locationImages.box3.left,
          x: ObjPos.BANK_IMAGE.x,
          y: ObjPos.BANK_IMAGE.y,
          width: ObjPos.BANK_IMAGE.width,
          title: 'AI-generated location image',
        });
        Game.setBoardItemRef(ObjPos.BANK_IMAGE.refKey, bankImageLeft.id);
        console.log('✅ Bank AI left image added:', bankImageLeft.id);

        if (mystery.locationImages.box3.right) {
          const bankImageRight = await miro.board.createImage({
            url: mystery.locationImages.box3.right,
            x: ObjPos.BANK_IMAGE_RIGHT.x,
            y: ObjPos.BANK_IMAGE_RIGHT.y,
            width: ObjPos.BANK_IMAGE_RIGHT.width,
            title: 'AI-generated location image',
          });
          Game.setBoardItemRef(ObjPos.BANK_IMAGE_RIGHT.refKey, bankImageRight.id);
          console.log('✅ Bank AI right image added:', bankImageRight.id);
        }
      } catch (err) {
        console.warn('⚠️ Failed to add AI-generated bank images:', err);
      }
    } else if (isPlaceholderMode) {
      try {
        console.log('📝 Creating bank image placeholder...');
        
        const bankPlaceholder = await miro.board.createShape({
          shape: 'rectangle',
          x: ObjPos.BANK_IMAGE.x,
          y: ObjPos.BANK_IMAGE.y,
          width: ObjPos.BANK_IMAGE.width,
          height: 300,
          content: '<p style="text-align:center;font-size:14px;color:#666">{BOX3_LEFT_IMAGE}</p>',
          style: {
            fillColor: '#f0f0f0',
            borderColor: '#999',
            borderWidth: 2,
            borderStyle: 'dashed',
          },
        });
        Game.setBoardItemRef(ObjPos.BANK_IMAGE.refKey, bankPlaceholder.id);
        console.log('✅ Bank image placeholder created');
      } catch (err) {
        console.warn('⚠️ Failed to create bank placeholder:', err);
      }
    } else {
      try {
        console.log('🖼️ Adding bank reception image (left)...');
        
        const bankImageDataUrl = await loadImageAsDataUrl(ObjPos.BANK_IMAGE.path);
        const bankImage = await miro.board.createImage({
          url: bankImageDataUrl,
          x: ObjPos.BANK_IMAGE.x,
          y: ObjPos.BANK_IMAGE.y,
          width: ObjPos.BANK_IMAGE.width,
          title: ObjPos.BANK_IMAGE.title,
        });
        Game.setBoardItemRef(ObjPos.BANK_IMAGE.refKey, bankImage.id);
        console.log('✅ Bank reception image added:', bankImage.id);
      } catch (err) {
        console.warn('⚠️ Failed to add bank reception image:', err);
        // Non-critical - continue without bank image
      }

      try {
        console.log('🖼️ Adding bank right image...');
        
        const bankImageRightDataUrl = await loadImageAsDataUrl(ObjPos.BANK_IMAGE_RIGHT.path);
        const bankImageRight = await miro.board.createImage({
          url: bankImageRightDataUrl,
          x: ObjPos.BANK_IMAGE_RIGHT.x,
          y: ObjPos.BANK_IMAGE_RIGHT.y,
          width: ObjPos.BANK_IMAGE_RIGHT.width,
          title: ObjPos.BANK_IMAGE_RIGHT.title,
        });
        Game.setBoardItemRef(ObjPos.BANK_IMAGE_RIGHT.refKey, bankImageRight.id);
        console.log('✅ Bank right image added:', bankImageRight.id);
      } catch (err) {
        console.warn('⚠️ Failed to add bank right image:', err);
        // Non-critical - continue without bank right image
      }
    }
    await sleep(80);

    // Night Bar (BOX4)
    const box4Title = mystery.locationNames?.box4 || (isPlaceholderMode ? 'BOX4' : 'Night Bar');
    const box4Description = mystery.locationDescriptions?.box4 || 
      (isPlaceholderMode ? '{BOX4_DESCRIPTION}' : 'Late night meetings, secret conversations, and suspicious encounters');
    const nightBarBox = await Items.createCityBox(
      box4Title,
      box4Description,
      Pos.FRAMES.cityNightBar.cx,
      Pos.FRAMES.cityNightBar.cy,
      Pos.FRAMES.cityNightBar.width,
      Pos.FRAMES.cityNightBar.height,
      '#0d0d0d',
      isPlaceholderMode ? '' : '🍸'
    );
    Game.setBoardItemRef('city_nightbar', nightBarBox.id);
    console.log('✅ Night bar created:', nightBarBox.id);
    
    // Add night bar image
    if (mystery.locationImages?.box4?.left) {
      try {
        console.log('🎨 Adding AI-generated night bar images...');
        
        const nightBarImageLeft = await miro.board.createImage({
          url: mystery.locationImages.box4.left,
          x: ObjPos.NIGHT_BAR_IMAGE.x,
          y: ObjPos.NIGHT_BAR_IMAGE.y,
          width: ObjPos.NIGHT_BAR_IMAGE.width,
          title: 'AI-generated location image',
        });
        Game.setBoardItemRef(ObjPos.NIGHT_BAR_IMAGE.refKey, nightBarImageLeft.id);
        console.log('✅ Night bar AI left image added:', nightBarImageLeft.id);

        if (mystery.locationImages.box4.right) {
          const nightBarImageRight = await miro.board.createImage({
            url: mystery.locationImages.box4.right,
            x: ObjPos.NIGHT_BAR_IMAGE_RIGHT.x,
            y: ObjPos.NIGHT_BAR_IMAGE_RIGHT.y,
            width: ObjPos.NIGHT_BAR_IMAGE_RIGHT.width,
            title: 'AI-generated location image',
          });
          Game.setBoardItemRef(ObjPos.NIGHT_BAR_IMAGE_RIGHT.refKey, nightBarImageRight.id);
          console.log('✅ Night bar AI right image added:', nightBarImageRight.id);
        }
      } catch (err) {
        console.warn('⚠️ Failed to add AI-generated night bar images:', err);
      }
    } else if (isPlaceholderMode) {
      try {
        console.log('📝 Creating night bar image placeholder...');
        
        const nightBarPlaceholder = await miro.board.createShape({
          shape: 'rectangle',
          x: ObjPos.NIGHT_BAR_IMAGE.x,
          y: ObjPos.NIGHT_BAR_IMAGE.y,
          width: ObjPos.NIGHT_BAR_IMAGE.width,
          height: 300,
          content: '<p style="text-align:center;font-size:14px;color:#666">{BOX4_LEFT_IMAGE}</p>',
          style: {
            fillColor: '#f0f0f0',
            borderColor: '#999',
            borderWidth: 2,
            borderStyle: 'dashed',
          },
        });
        Game.setBoardItemRef(ObjPos.NIGHT_BAR_IMAGE.refKey, nightBarPlaceholder.id);
        console.log('✅ Night bar image placeholder created');
      } catch (err) {
        console.warn('⚠️ Failed to create night bar placeholder:', err);
      }
    } else {
      try {
        console.log('🖼️ Adding night bar left image...');
        
        const nightBarImageDataUrl = await loadImageAsDataUrl(ObjPos.NIGHT_BAR_IMAGE.path);
        const nightBarImage = await miro.board.createImage({
          url: nightBarImageDataUrl,
          x: ObjPos.NIGHT_BAR_IMAGE.x,
          y: ObjPos.NIGHT_BAR_IMAGE.y,
          width: ObjPos.NIGHT_BAR_IMAGE.width,
          title: ObjPos.NIGHT_BAR_IMAGE.title,
        });
        Game.setBoardItemRef(ObjPos.NIGHT_BAR_IMAGE.refKey, nightBarImage.id);
        console.log('✅ Night bar left image added:', nightBarImage.id);
      } catch (err) {
        console.warn('⚠️ Failed to add night bar left image:', err);
        // Non-critical - continue without night bar image
      }

      try {
        console.log('🖼️ Adding night bar right image...');
        
        const nightBarImageRightDataUrl = await loadImageAsDataUrl(ObjPos.NIGHT_BAR_IMAGE_RIGHT.path);
        const nightBarImageRight = await miro.board.createImage({
          url: nightBarImageRightDataUrl,
          x: ObjPos.NIGHT_BAR_IMAGE_RIGHT.x,
          y: ObjPos.NIGHT_BAR_IMAGE_RIGHT.y,
          width: ObjPos.NIGHT_BAR_IMAGE_RIGHT.width,
          title: ObjPos.NIGHT_BAR_IMAGE_RIGHT.title,
        });
        Game.setBoardItemRef(ObjPos.NIGHT_BAR_IMAGE_RIGHT.refKey, nightBarImageRight.id);
        console.log('✅ Night bar right image added:', nightBarImageRight.id);
      } catch (err) {
        console.warn('⚠️ Failed to add night bar right image:', err);
        // Non-critical - continue without night bar right image
      }
    }
    await sleep(80);

    // Restaurant (BOX5)
    const box5Title = mystery.locationNames?.box5 || (isPlaceholderMode ? 'BOX5' : 'Downtown Bistro');
    const box5Description = mystery.locationDescriptions?.box5 || 
      (isPlaceholderMode ? '{BOX5_DESCRIPTION}' : 'Last known meeting place - check reservations and witness accounts');
    const restaurantBox = await Items.createCityBox(
      box5Title,
      box5Description,
      Pos.FRAMES.cityRestaurant.cx,
      Pos.FRAMES.cityRestaurant.cy,
      Pos.FRAMES.cityRestaurant.width,
      Pos.FRAMES.cityRestaurant.height,
      '#0d0d0d',
      isPlaceholderMode ? '' : '🍽️'
    );
    Game.setBoardItemRef('city_restaurant', restaurantBox.id);
    console.log('✅ Restaurant created:', restaurantBox.id);
    
    // Add rain GIF effect over the bistro
    if (mystery.locationImages?.box5?.left) {
      try {
        console.log('🎨 Adding AI-generated bistro images...');
        
        // Left bistro image (AI-generated)
        const bistroImageLeft = await miro.board.createImage({
          url: mystery.locationImages.box5.left,
          x: ObjPos.BISTRO_RAIN_GIF.x,
          y: ObjPos.BISTRO_RAIN_GIF.y,
          width: ObjPos.BISTRO_RAIN_GIF.width,
          title: 'AI-generated location image',
        });
        Game.setBoardItemRef(ObjPos.BISTRO_RAIN_GIF.refKey, bistroImageLeft.id);
        console.log('✅ Bistro left AI image added:', bistroImageLeft.id);
        
        // Right bistro image (AI-generated, optional)
        if (mystery.locationImages.box5.right) {
          const bistroImageRight = await miro.board.createImage({
            url: mystery.locationImages.box5.right,
            x: ObjPos.BISTRO_IMAGE.x,
            y: ObjPos.BISTRO_IMAGE.y,
            width: ObjPos.BISTRO_IMAGE.width,
            title: 'AI-generated location image',
          });
          Game.setBoardItemRef(ObjPos.BISTRO_IMAGE.refKey, bistroImageRight.id);
          console.log('✅ Bistro right AI image added:', bistroImageRight.id);
        }
      } catch (err) {
        console.warn('⚠️ Failed to add AI-generated bistro images:', err);
      }
    } else if (isPlaceholderMode) {
      try {
        console.log('📝 Creating bistro image placeholder...');
        
        // Bistro left placeholder only
        const bistroLeftPlaceholder = await miro.board.createShape({
          shape: 'rectangle',
          x: ObjPos.BISTRO_RAIN_GIF.x,
          y: ObjPos.BISTRO_RAIN_GIF.y,
          width: ObjPos.BISTRO_RAIN_GIF.width,
          height: 300,
          content: '<p style="text-align:center;font-size:14px;color:#666">{BOX5_LEFT_IMAGE}</p>',
          style: {
            fillColor: '#f0f0f0',
            borderColor: '#999',
            borderWidth: 2,
            borderStyle: 'dashed',
          },
        });
        Game.setBoardItemRef(ObjPos.BISTRO_RAIN_GIF.refKey, bistroLeftPlaceholder.id);
        console.log('✅ Bistro image placeholder created');
      } catch (err) {
        console.warn('⚠️ Failed to create bistro placeholder:', err);
      }
    } else {
      try {
        console.log('🌧️ Adding rain effect to Downtown Bistro...');
        const bistroRainDataUrl = await loadImageAsDataUrl(ObjPos.BISTRO_RAIN_GIF_PATH);
        
        const bistroRain = await miro.board.createImage({
          url: bistroRainDataUrl,
          x: ObjPos.BISTRO_RAIN_GIF.x,
          y: ObjPos.BISTRO_RAIN_GIF.y,
          width: ObjPos.BISTRO_RAIN_GIF.width,
          title: ObjPos.BISTRO_RAIN_GIF.title,
        });
        Game.setBoardItemRef(ObjPos.BISTRO_RAIN_GIF.refKey, bistroRain.id);
        console.log('✅ Bistro rain effect added:', bistroRain.id);
      } catch (err) {
        console.warn('⚠️ Failed to add bistro rain effect:', err);
        // Non-critical - continue without the rain effect
      }

      // Add bistro image beside the rain GIF
      try {
        console.log('🍽️ Adding bistro image...');
        const bistroImageDataUrl = await loadImageAsDataUrl(ObjPos.BISTRO_IMAGE.path);
        
        const bistroImage = await miro.board.createImage({
          url: bistroImageDataUrl,
          x: ObjPos.BISTRO_IMAGE.x,
          y: ObjPos.BISTRO_IMAGE.y,
          width: ObjPos.BISTRO_IMAGE.width,
          title: ObjPos.BISTRO_IMAGE.title,
        });
        Game.setBoardItemRef(ObjPos.BISTRO_IMAGE.refKey, bistroImage.id);
        console.log('✅ Bistro image added:', bistroImage.id);
      } catch (err) {
        console.warn('⚠️ Failed to add bistro image:', err);
        // Non-critical - continue without the bistro image
      }
    }
    await sleep(80);

    // High Rise Condo (BOX6)
    const box6Title = mystery.locationNames?.box6 || (isPlaceholderMode ? 'BOX6' : 'High Rise Condo');
    const box6Description = mystery.locationDescriptions?.box6 || 
      (isPlaceholderMode ? '{BOX6_DESCRIPTION}' : 'Luxury penthouses, exclusive residents, and panoramic city views');
    const highRiseCondoBox = await Items.createCityBox(
      box6Title,
      box6Description,
      Pos.FRAMES.cityHighRiseCondo.cx,
      Pos.FRAMES.cityHighRiseCondo.cy,
      Pos.FRAMES.cityHighRiseCondo.width,
      Pos.FRAMES.cityHighRiseCondo.height,
      '#0d0d0d',
      isPlaceholderMode ? '' : '🏢'
    );
    Game.setBoardItemRef('city_highrisecondo', highRiseCondoBox.id);
    console.log('✅ High rise condo created:', highRiseCondoBox.id);
    
    // Add condo images (side by side)
    if (mystery.locationImages?.box6?.left) {
      try {
        console.log('🎨 Adding AI-generated condo images...');
        
        // Left condo image (AI-generated)
        const condoImageLeft = await miro.board.createImage({
          url: mystery.locationImages.box6.left,
          x: ObjPos.CONDO_IMAGE_LEFT.x,
          y: ObjPos.CONDO_IMAGE_LEFT.y,
          width: ObjPos.CONDO_IMAGE_LEFT.width,
          title: 'AI-generated location image',
        });
        Game.setBoardItemRef(ObjPos.CONDO_IMAGE_LEFT.refKey, condoImageLeft.id);
        console.log('✅ Condo left AI image added:', condoImageLeft.id);
        
        // Right condo image (AI-generated, optional)
        if (mystery.locationImages.box6.right) {
          const condoImageRight = await miro.board.createImage({
            url: mystery.locationImages.box6.right,
            x: ObjPos.CONDO_IMAGE_RIGHT.x,
            y: ObjPos.CONDO_IMAGE_RIGHT.y,
            width: ObjPos.CONDO_IMAGE_RIGHT.width,
            title: 'AI-generated location image',
          });
          Game.setBoardItemRef(ObjPos.CONDO_IMAGE_RIGHT.refKey, condoImageRight.id);
          console.log('✅ Condo right AI image added:', condoImageRight.id);
        }
      } catch (err) {
        console.warn('⚠️ Failed to add AI-generated condo images:', err);
      }
    } else if (isPlaceholderMode) {
      try {
        console.log('📝 Creating condo image placeholder...');
        
        // Left condo placeholder only
        const condoLeftPlaceholder = await miro.board.createShape({
          shape: 'rectangle',
          x: ObjPos.CONDO_IMAGE_LEFT.x,
          y: ObjPos.CONDO_IMAGE_LEFT.y,
          width: ObjPos.CONDO_IMAGE_LEFT.width,
          height: 300,
          content: '<p style="text-align:center;font-size:14px;color:#666">{BOX6_LEFT_IMAGE}</p>',
          style: {
            fillColor: '#f0f0f0',
            borderColor: '#999',
            borderWidth: 2,
            borderStyle: 'dashed',
          },
        });
        Game.setBoardItemRef(ObjPos.CONDO_IMAGE_LEFT.refKey, condoLeftPlaceholder.id);
        console.log('✅ Condo image placeholder created');
      } catch (err) {
        console.warn('⚠️ Failed to create condo placeholder:', err);
      }
    } else {
      try {
        console.log('🖼️ Adding condo front desk image (left)...');
        
        const condoImageLeftDataUrl = await loadImageAsDataUrl(ObjPos.CONDO_IMAGE_LEFT.path);
        const condoImageLeft = await miro.board.createImage({
          url: condoImageLeftDataUrl,
          x: ObjPos.CONDO_IMAGE_LEFT.x,
          y: ObjPos.CONDO_IMAGE_LEFT.y,
          width: ObjPos.CONDO_IMAGE_LEFT.width,
          title: ObjPos.CONDO_IMAGE_LEFT.title,
        });
        Game.setBoardItemRef(ObjPos.CONDO_IMAGE_LEFT.refKey, condoImageLeft.id);
        console.log('✅ Condo front desk image added:', condoImageLeft.id);
      } catch (err) {
        console.warn('⚠️ Failed to add condo front desk image:', err);
        // Non-critical - continue without condo image
      }

      try {
        console.log('🖼️ Adding condo view image (right)...');
        
        const condoImageRightDataUrl = await loadImageAsDataUrl(ObjPos.CONDO_IMAGE_RIGHT.path);
        const condoImageRight = await miro.board.createImage({
          url: condoImageRightDataUrl,
          x: ObjPos.CONDO_IMAGE_RIGHT.x,
          y: ObjPos.CONDO_IMAGE_RIGHT.y,
          width: ObjPos.CONDO_IMAGE_RIGHT.width,
          title: ObjPos.CONDO_IMAGE_RIGHT.title,
        });
        Game.setBoardItemRef(ObjPos.CONDO_IMAGE_RIGHT.refKey, condoImageRight.id);
        console.log('✅ Condo view image added:', condoImageRight.id);
      } catch (err) {
        console.warn('⚠️ Failed to add condo view image:', err);
        // Non-critical - continue without condo view image
      }
    }
    await sleep(80);

    // ---- Add evidence folder schemas inside each location box ----
    console.log('📋 Adding table schemas to city locations...');
    await addTableSchemasToLocations(mystery);
    
    console.log('✅ City landscape complete');
  } catch (err) {
    // City landscape is non-critical
    console.error('❌ City landscape creation failed:', err);
  }

  // ---- 11. Clue stickies ----
  // Clues with a `location` field go inside their city box.
  // Clues without a location (e.g. sample mystery) go in the Case Board.

  // Map box keys → frame positions
  const BOX_FRAME_MAP: Record<string, keyof typeof Pos.FRAMES> = {
    box1: 'cityOffice',
    box2: 'cityPolice',
    box3: 'cityBank',
    box4: 'cityNightBar',
    box5: 'cityRestaurant',
    box6: 'cityHighRiseCondo',
  };

  const caseBoardClues = mystery.clues.filter((c) => !c.location);
  const locationClues = mystery.clues.filter((c) => !!c.location);

  // Case board clues (existing behaviour, max 5)
  const caseBoardCount = Math.min(5, caseBoardClues.length);
  for (let i = 0; i < caseBoardCount; i++) {
    const clue = caseBoardClues[i];
    const pos = Pos.caseStickyPosition(i);
    const sticky = await Items.createClueSticky(
      `CLUE #${clue.order}\n\n${clue.narrative}`,
      pos.x,
      pos.y,
      i
    );
    await addToFrame(caseFrame.id, sticky.id);
    Game.setBoardItemRef(`clue_sticky_${clue.id}`, sticky.id);
  }

  // Location-bound clues — placed inside their city box
  // Group by box so we can offset multiple clues per box horizontally
  const cluesByBox: Record<string, typeof locationClues> = {};
  for (const clue of locationClues) {
    const box = clue.location!;
    if (!cluesByBox[box]) cluesByBox[box] = [];
    cluesByBox[box].push(clue);
  }

  for (const [boxKey, boxClues] of Object.entries(cluesByBox)) {
    const frameKey = BOX_FRAME_MAP[boxKey];
    if (!frameKey) continue;
    const frame = Pos.FRAMES[frameKey];

    // Position stickies in the upper portion of the city box, centred
    // Multiple clues per box are spread horizontally
    const STICKY_WIDTH = 700;
    const SPACING = 760;
    const totalWidth = boxClues.length * STICKY_WIDTH + (boxClues.length - 1) * (SPACING - STICKY_WIDTH);
    const startX = frame.cx - totalWidth / 2 + STICKY_WIDTH / 2;
    // Vertical: place below the large title text / above the images (~25% from top)
    const stickyY = frame.top + Math.round(frame.height * 0.28);

    for (let i = 0; i < boxClues.length; i++) {
      const clue = boxClues[i];
      const x = startX + i * SPACING;
      try {
        const sticky = await Items.createClueSticky(
          `📌 CLUE #${clue.order}\n\n${clue.narrative}`,
          x,
          stickyY,
          (clue.order - 1) % 5,
          STICKY_WIDTH
        );
        Game.setBoardItemRef(`clue_sticky_${clue.id}`, sticky.id);
        await sleep(50);
      } catch (err) {
        console.warn(`⚠️ Failed to place clue sticky for ${boxKey}:`, err);
      }
    }
  }

  // ---- 12. Zoom to show everything ----

  await sleep(400);
  const vp = Pos.fullBoardViewport();
  await miro.board.viewport.set({
    viewport: vp,
    padding: { top: 80, bottom: 80, left: 80, right: 80 },
    animationDurationInMs: 1200,
  });
}

/**
 * Remove all board items created by this app.
 */
export async function clearBoardLayout(): Promise<void> {
  console.log('🧹 clearBoardLayout called - REMOVING ALL BOARD ITEMS');
  
  // Reset the creation lock when clearing
  isCreating = false;
  
  let totalRemoved = 0;
  
  try {
    // Get ALL items from the board (no filtering)
    console.log('🔍 Getting all board items...');
    const allItems = await miro.board.get();
    
    console.log(`📋 Found ${allItems.length} total items on the board`);
    
    // Remove everything - app items AND user-added items
    for (const item of allItems) {
      try {
        await Items.safeRemoveItem(item.id);
        totalRemoved++;
        
        // Log what we're removing for debugging
        if (item.type === 'frame') {
          console.log(`🗑️ Removed frame: ${(item as any).title || 'untitled'}`);
        } else if (item.type === 'sticky_note') {
          const content = (item as any).content || '';
          console.log(`🗑️ Removed sticky note: ${content.substring(0, 30)}...`);
        } else if (item.type === 'shape') {
          const content = (item as any).content || '';
          console.log(`🗑️ Removed shape: ${content.substring(0, 30)}...`);
        } else if (item.type === 'text') {
          const content = (item as any).content || '';
          console.log(`🗑️ Removed text: ${content.substring(0, 30)}...`);
        } else if (item.type === 'image') {
          console.log(`🗑️ Removed image: ${(item as any).title || 'untitled'}`);
        } else {
          console.log(`🗑️ Removed ${item.type}`);
        }
      } catch (err) {
        // Item might already be deleted or in a parent frame that was deleted
        console.warn(`⚠️ Could not remove item ${item.id}:`, err);
      }
    }
    
    console.log(`✅ Successfully removed ${totalRemoved} items from the board`);
    
  } catch (err) {
    console.error('❌ Error clearing board:', err);
  }
  
  // Clear the board item refs from game state after cleanup
  Game.clearBoardRefs();
  
  console.log('✅ clearBoardLayout complete - Board is now empty');
}

// ---- Helpers ----

/**
 * Add table schema sticky notes to each city location
 */
async function addTableSchemasToLocations(mystery: MysteryData): Promise<void> {
  // Define location mappings with their positions
  const locationMap: Record<string, { name: string; frame: keyof typeof Pos.FRAMES }> = {
    'OFFICE': { name: 'Office', frame: 'cityOffice' },
    'POLICE': { name: 'Police', frame: 'cityPolice' },
    'HIGH_RISE_CONDO': { name: 'High Rise Condo', frame: 'cityHighRiseCondo' },
    'DOWNTOWN_BISTRO': { name: 'Downtown Bistro', frame: 'cityRestaurant' },
    'NIGHT_BAR': { name: 'Night Bar', frame: 'cityNightBar' },
    'CITY_BANK': { name: 'City Bank', frame: 'cityBank' },
  };

  // Group tables by location
  const tablesByLocation: Record<string, typeof mystery.tables> = {};
  for (const table of mystery.tables) {
    const loc = table.location || 'OFFICE';
    if (!tablesByLocation[loc]) {
      tablesByLocation[loc] = [];
    }
    tablesByLocation[loc].push(table);
  }

  // Track evidence counter for numbering
  let evidenceCounter = 0;

  // Create all evidence folders
  for (const [locationId, locationInfo] of Object.entries(locationMap)) {
    const tables = tablesByLocation[locationId] || [];
    if (tables.length === 0) continue;

    const frame = Pos.FRAMES[locationInfo.frame];
    if (!frame) continue;

    // Position folders at BOTTOM LEFT of the city box (3 folders in a row)
    const folderWidth = 320;
    const folderHeight = 260;
    const spacing = 360; // Horizontal spacing between folders
    const marginLeft = 200; // Left margin from box edge
    const marginBottom = 150; // Bottom margin from box edge
    
    // Start from left side of the box
    const startX = frame.cx - frame.width / 2 + marginLeft + folderWidth / 2;
    const startY = frame.cy + frame.height / 2 - folderHeight / 2 - marginBottom;

    for (let i = 0; i < Math.min(3, tables.length); i++) {
      const table = tables[i];
      const x = startX + i * spacing;
      const y = startY;

      try {
        // Get column info and foreign keys from DDL
        const columns = extractColumnsFromDDL(table.ddl);
        const foreignKeys = extractForeignKeys(table.ddl);
        
        const folder = await Items.createEvidenceFolderSchema(
          table.name,
          columns,
          foreignKeys,
          x,
          y,
          evidenceCounter
        );
        
        Game.setBoardItemRef(`schema_${locationId}_${table.name}`, folder.id);
        console.log(`✅ Added evidence folder for ${table.name} to ${locationInfo.name}`);
        evidenceCounter++;
        await sleep(50);
      } catch (err) {
        console.warn(`⚠️ Failed to add evidence folder for ${table.name}:`, err);
      }
    }
  }

  // PHASE 2: Red string connections DISABLED per user request
  // No connections drawn - folders are standalone
  
  console.log('✅ Evidence folders complete (connections disabled)');
}

/**
 * Extract column information from CREATE TABLE DDL
 */
function extractColumnsFromDDL(ddl: string): Array<{ name: string; type: string }> {
  const columns: Array<{ name: string; type: string }> = [];
  
  // Match lines like: "  name TEXT NOT NULL," or "  id INTEGER PRIMARY KEY,"
  const columnRegex = /^\s+(\w+)\s+(\w+(?:\s+\w+)?)/gm;
  let match;
  
  while ((match = columnRegex.exec(ddl)) !== null) {
    const [, name, type] = match;
    // Skip FOREIGN KEY lines
    if (name.toUpperCase() !== 'FOREIGN') {
      columns.push({ 
        name, 
        type: type.split(/\s+/)[0] // Take first word (INTEGER, TEXT, etc.)
      });
    }
  }
  
  return columns;
}

/**
 * Extract foreign key relationships from CREATE TABLE DDL
 * Returns array of {column, refTable} objects
 */
function extractForeignKeys(ddl: string): Array<{ column: string; refTable: string }> {
  const foreignKeys: Array<{ column: string; refTable: string }> = [];
  
  // Match FOREIGN KEY constraints like: "FOREIGN KEY (approved_by) REFERENCES employees(id)"
  const fkRegex = /FOREIGN\s+KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)/gi;
  let match;
  
  while ((match = fkRegex.exec(ddl)) !== null) {
    const [, column, refTable] = match;
    foreignKeys.push({ column, refTable });
  }
  
  return foreignKeys;
}

async function addToFrame(frameId: string, itemId: string): Promise<void> {
  try {
    const frame = await miro.board.getById(frameId);
    if (frame.type === 'frame') {
      const item = await miro.board.getById(itemId);
      await frame.add(item);
      await sleep(60);
    }
  } catch {
    // frame.add failed — non-critical
  }
}

/**
 * Extract suspect names from the mystery data.
 * Pulls names from the employees table inserts (or uses culprit as fallback).
 */
function extractSuspectNames(mystery: MysteryData): string[] {
  const names = new Set<string>();

  // Always include the culprit
  names.add(mystery.solution.culprit);

  // Try to pull from employees table
  for (const table of mystery.tables) {
    if (table.name.toLowerCase() === 'employees') {
      for (const insert of table.inserts) {
        const match = insert.match(/VALUES\s*\(\s*\d+\s*,\s*'([^']+)'/i);
        if (match) names.add(match[1]);
      }
    }
  }

  return Array.from(names);
}

/**
 * Get the stored suspect names (set during layout creation).
 */
export function getSuspectNames(): string[] {
  const refs = Game.getState().boardItemRefs;
  const names: string[] = [];
  for (let i = 0; i < 20; i++) {
    const name = refs[`suspect_name_${i}`];
    if (name) names.push(name);
    else break;
  }
  return names;
}
