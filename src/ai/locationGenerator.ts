/**
 * Location Generator — AI-powered location and title generation
 * 
 * Generates mystery title and 6 location names based on user's custom theme.
 * This is the first step in AI mystery generation - creating the basic structure
 * before filling in detailed content.
 */

export interface LocationGenerationResult {
  title: string;
  locations: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  };
}

const GENERATION_TIMEOUT_MS = 30_000;

/**
 * Generate mystery title and location names based on a theme prompt.
 * 
 * @param themePrompt - User's custom theme (e.g., "hospital data breach", "art gallery theft")
 * @param difficulty - Difficulty level for context
 * @returns Promise with title and 6 location names
 */
export async function generateLocations(
  themePrompt: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<LocationGenerationResult> {
  console.log('🎯 Generating locations for theme:', themePrompt);

  const prompt = buildLocationPrompt(themePrompt, difficulty);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        difficulty,
        generationType: 'locations', // Flag to help API know what we're generating
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Location generation failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    console.log('📦 API response received:', data);
    
    // Parse the response - handle different response formats
    let result;
    
    // Case 1: Response is already a properly formatted object
    if (data.title && data.locations) {
      result = parseLocationResponse(data);
    }
    // Case 2: Response has a 'text' field containing JSON string
    else if (data.text) {
      result = parseLocationResponse(data.text);
    }
    // Case 3: Response has a nested 'mystery' object
    else if (data.mystery) {
      result = parseLocationResponse(data.mystery.text || data.mystery);
    }
    // Case 4: Treat entire response as the data
    else {
      result = parseLocationResponse(data);
    }
    
    console.log('✅ Locations generated:', result);
    return result;

  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Location generation timed out after 30 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build the prompt for location generation
 */
function buildLocationPrompt(theme: string, difficulty: string): string {
  return `You are a creative mystery writer. Generate a SQL detective mystery title and 6 investigation locations based on this theme:

THEME: ${theme}
DIFFICULTY: ${difficulty}

Generate a compelling mystery title and exactly 6 distinct locations where evidence can be found. Each location should be relevant to the theme and suitable for a detective investigation.

Requirements:
- Title should be intriguing and match the theme (e.g., "The Phantom Transaction", "The Digital Heist")
- 6 locations should be diverse and thematically appropriate
- Each location name should be 2-4 words (e.g., "Corporate Office", "City Bank", "Downtown Bistro")
- Locations should make sense for a SQL side quest game (places with databases/records)

IMPORTANT: Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "title": "Mystery Title Here",
  "locations": {
    "box1": "Location 1 Name",
    "box2": "Location 2 Name",
    "box3": "Location 3 Name",
    "box4": "Location 4 Name",
    "box5": "Location 5 Name",
    "box6": "Location 6 Name"
  }
}`;
}

/**
 * Parse the LLM response into structured location data
 */
function parseLocationResponse(response: string | any): LocationGenerationResult {
  console.log('📝 Parsing location response...');

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

    // Validate structure
    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('Missing or invalid title');
    }

    if (!parsed.locations || typeof parsed.locations !== 'object') {
      throw new Error('Missing or invalid locations object');
    }

    // Validate all 6 locations exist
    const requiredBoxes = ['box1', 'box2', 'box3', 'box4', 'box5', 'box6'];
    for (const box of requiredBoxes) {
      if (!parsed.locations[box] || typeof parsed.locations[box] !== 'string') {
        throw new Error(`Missing or invalid location for ${box}`);
      }
    }

    return {
      title: parsed.title.trim(),
      locations: {
        box1: parsed.locations.box1.trim(),
        box2: parsed.locations.box2.trim(),
        box3: parsed.locations.box3.trim(),
        box4: parsed.locations.box4.trim(),
        box5: parsed.locations.box5.trim(),
        box6: parsed.locations.box6.trim(),
      },
    };

  } catch (err: any) {
    console.error('❌ Failed to parse location response:', err);
    console.error('Response data:', response);
    throw new Error(`Failed to parse location response: ${err.message}`);
  }
}
