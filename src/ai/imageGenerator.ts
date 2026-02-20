/**
 * Image Generator - AI Image Generation Integration
 *
 * Provides a client-side interface for calling the /api/generate-image endpoint.
 * Uses Gemini's Imagen model to generate images based on text prompts.
 */

export interface ImageGenerationResult {
  imageData: string; // Base64 encoded image
  imageUrl: string; // Data URL (data:image/png;base64,...)
  mimeType: string; // image/png
}

export interface LocationImages {
  box1: {
    left: string;  // Data URL for left image
    right: string; // Data URL for right image
  };
  box2: {
    left: string;
    right: string;
  };
  box3: {
    left: string;
    right: string;
  };
  box4: {
    left: string;
    right: string;
  };
  box5: {
    left: string;
    right: string;
  };
  box6: {
    left: string;
    right: string;
  };
}

export interface ImageGenerationError {
  error: string;
  details?: string;
}

/**
 * Generate an image based on a text prompt using Gemini Imagen API.
 *
 * @param prompt - The text description to generate an image from
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to image data or throwing an error
 */
export async function generateImage(
  prompt: string,
  signal?: AbortSignal
): Promise<ImageGenerationResult> {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required for image generation');
  }

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: prompt.trim() }),
    signal,
  });

  if (!response.ok) {
    const errorData: ImageGenerationError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error || 'Image generation failed');
  }

  const result: ImageGenerationResult = await response.json();

  if (!result.imageUrl || !result.imageData) {
    throw new Error('Invalid response from image generation API');
  }

  return result;
}

/**
 * Generate an enhanced prompt for image generation based on the original text.
 * Adds artistic style and quality modifiers for better results.
 *
 * @param originalText - The original text to base the prompt on
 * @returns Enhanced prompt optimized for image generation
 */
export function enhancePromptForImage(originalText: string): string {
  // Remove common prefixes that don't translate well to images
  let cleanText = originalText
    .replace(/^(write|tell me|give me|share|describe|explain|name)/i, '')
    .trim();

  // If the text is a fact or statement, convert it to a visual scene
  if (cleanText.toLowerCase().includes('fact about') || 
      cleanText.toLowerCase().includes('historical event') ||
      cleanText.toLowerCase().includes('scientific concept')) {
    return `A beautiful illustrated scene depicting: ${cleanText}. Digital art, vibrant colors, detailed illustration.`;
  }

  // If it's a haiku or poem, create an artistic representation
  if (originalText.toLowerCase().includes('haiku')) {
    return `An artistic visual representation of this concept: ${cleanText}. Minimalist style, zen aesthetic, peaceful atmosphere.`;
  }

  // For cooking tips, create a food photography scene
  if (originalText.toLowerCase().includes('cooking') || 
      originalText.toLowerCase().includes('recipe')) {
    return `A professional food photography scene: ${cleanText}. High quality, appetizing, well-lit composition.`;
  }

  // For animal descriptions, create a nature scene
  if (originalText.toLowerCase().includes('animal')) {
    return `A beautiful nature photograph featuring: ${cleanText}. Wildlife photography, natural habitat, detailed.`;
  }

  // Default enhancement: add artistic direction
  return `${cleanText}. High quality digital art, vibrant colors, professional illustration, detailed and visually appealing.`;
}

/**
 * Generate images for all 6 location boxes based on their descriptions.
 * Creates 1 image per location (left only).
 *
 * @param theme - The mystery theme
 * @param locationNames - Object containing names for each box location
 * @param locationDescriptions - Object containing descriptions for each box location
 * @returns Promise resolving to LocationImages with data URLs for all images
 */
export async function generateLocationImages(
  theme: string,
  locationNames: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  },
  locationDescriptions: {
    box1: string;
    box2: string;
    box3: string;
    box4: string;
    box5: string;
    box6: string;
  }
): Promise<LocationImages> {
  console.log('🎨 Starting image generation for all locations...');

  const locationImages: LocationImages = {
    box1: { left: '', right: '' },
    box2: { left: '', right: '' },
    box3: { left: '', right: '' },
    box4: { left: '', right: '' },
    box5: { left: '', right: '' },
    box6: { left: '', right: '' },
  };

  // Generate images for each box (1 image per box = 6 total)
  const boxes = ['box1', 'box2', 'box3', 'box4', 'box5', 'box6'] as const;
  
  let successCount = 0;

  for (const boxKey of boxes) {
    const locationName = locationNames[boxKey];
    const description = locationDescriptions[boxKey];
    
    console.log(`🎨 Generating image for ${boxKey}: ${locationName}`);
    
    try {
      const prompt = buildLocationImagePrompt(locationName, description, theme);
      const result = await generateImage(prompt);
      locationImages[boxKey].left = result.imageUrl;
      successCount++;
      console.log(`✅ Image for ${boxKey} complete`);
    } catch (err: any) {
      // Non-fatal: log the failure and continue with an empty image for this box.
      // The board layout handles missing images gracefully (skips the createImage call).
      console.warn(`⚠️ Image generation failed for ${boxKey} ("${locationName}") — skipping:`, err.message);
    }
  }

  console.log(`✅ Location images done: ${successCount}/6 generated`);
  return locationImages;
}

/**
 * Build an optimized prompt for generating location images.
 *
 * @param locationName - Name of the location
 * @param description - Description of the location
 * @param theme - Overall mystery theme
 * @returns Optimized prompt for image generation
 */
function buildLocationImagePrompt(
  locationName: string,
  description: string,
  theme: string
): string {
  return `A cinematic view of ${locationName}. ${description}. Mystery theme: ${theme}. Professional digital art, atmospheric lighting, detailed scene showing the location's character and mood, mysterious and engaging.`;
}
