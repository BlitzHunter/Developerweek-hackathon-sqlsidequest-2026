/**
 * Description Generator — AI-powered location description generation
 * 
 * Generates detailed descriptions for each of the 6 investigation locations
 * based on the mystery theme and location names.
 */

export interface LocationDescriptions {
  box1: string;
  box2: string;
  box3: string;
  box4: string;
  box5: string;
  box6: string;
}

const GENERATION_TIMEOUT_MS = 30_000;

/**
 * Generate descriptions for all 6 locations based on theme and location names.
 * 
 * @param theme - User's custom theme
 * @param locationNames - Previously generated location names
 * @param difficulty - Difficulty level for context
 * @returns Promise with 6 location descriptions
 */
export async function generateDescriptions(
  theme: string,
  locationNames: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  },
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<LocationDescriptions> {
  console.log('📝 Generating location descriptions for theme:', theme);

  const prompt = buildDescriptionPrompt(theme, locationNames, difficulty);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        difficulty,
        generationType: 'descriptions',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Description generation failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    console.log('📦 API response received:', data);
    
    // Parse the response - handle different response formats
    let result;
    
    if (data.descriptions) {
      result = parseDescriptionResponse(data.descriptions);
    } else if (data.text) {
      result = parseDescriptionResponse(data.text);
    } else if (data.mystery) {
      result = parseDescriptionResponse(data.mystery.text || data.mystery);
    } else {
      result = parseDescriptionResponse(data);
    }
    
    console.log('✅ Descriptions generated:', result);
    return result;

  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Description generation timed out after 30 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build the prompt for description generation
 */
function buildDescriptionPrompt(
  theme: string,
  locationNames: any,
  difficulty: string
): string {
  return `You are a creative mystery writer. Generate detailed descriptions for 6 investigation locations in a SQL detective mystery.

THEME: ${theme}
DIFFICULTY: ${difficulty}

LOCATIONS:
1. ${locationNames.box1}
2. ${locationNames.box2}
3. ${locationNames.box3}
4. ${locationNames.box4}
5. ${locationNames.box5}
6. ${locationNames.box6}

For each location, write a compelling 1-2 sentence description that:
- Explains what evidence or records might be found there
- Fits the theme and atmosphere
- Makes sense for a SQL investigation game (databases, records, logs)
- Creates intrigue and detective atmosphere

IMPORTANT: Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "descriptions": {
    "box1": "Description for ${locationNames.box1}",
    "box2": "Description for ${locationNames.box2}",
    "box3": "Description for ${locationNames.box3}",
    "box4": "Description for ${locationNames.box4}",
    "box5": "Description for ${locationNames.box5}",
    "box6": "Description for ${locationNames.box6}"
  }
}`;
}

/**
 * Parse the LLM response into structured description data
 */
function parseDescriptionResponse(response: string | any): LocationDescriptions {
  console.log('📝 Parsing description response...');

  let parsed: any;

  // If response is already an object, use it directly
  if (typeof response === 'object' && response !== null) {
    console.log('Response is already an object');
    parsed = response;
  } else if (typeof response === 'string') {
    // Try to extract JSON from string response
    let jsonText = response.trim();

    // If wrapped in markdown code blocks, extract
    if (jsonText.includes('```json')) {
      const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    } else if (jsonText.includes('```')) {
      const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }

    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      console.error('❌ Failed to parse JSON from string:', err);
      console.error('String content:', jsonText);
      throw new Error(`Failed to parse JSON: ${err.message}`);
    }
  } else {
    throw new Error(`Invalid response type: ${typeof response}`);
  }

  // Now validate the parsed object
  try {
    // Check if descriptions are nested or at top level
    const descriptions = parsed.descriptions || parsed;

    if (!descriptions || typeof descriptions !== 'object') {
      throw new Error('Missing or invalid descriptions object');
    }

    // Validate all 6 descriptions exist
    const requiredBoxes = ['box1', 'box2', 'box3', 'box4', 'box5', 'box6'];
    for (const box of requiredBoxes) {
      if (!descriptions[box] || typeof descriptions[box] !== 'string') {
        throw new Error(`Missing or invalid description for ${box}`);
      }
    }

    return {
      box1: descriptions.box1.trim(),
      box2: descriptions.box2.trim(),
      box3: descriptions.box3.trim(),
      box4: descriptions.box4.trim(),
      box5: descriptions.box5.trim(),
      box6: descriptions.box6.trim(),
    };

  } catch (err: any) {
    console.error('❌ Failed to parse description response:', err);
    console.error('Response data:', response);
    throw new Error(`Failed to parse description response: ${err.message}`);
  }
}
