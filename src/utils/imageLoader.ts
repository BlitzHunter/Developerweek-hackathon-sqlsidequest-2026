/**
 * Image Loader - Load local images as base64 data URLs for Miro
 * 
 * Miro's image API requires publicly accessible URLs. For local images,
 * we load them from the public folder and convert to base64 data URLs.
 * 
 * This allows using images from your project without external hosting.
 */

/**
 * Load a local image and convert to base64 data URL for Miro.
 * 
 * @param path - Path relative to public folder (e.g., '/image/cork-board.jpg')
 * @returns Base64 data URL (e.g., 'data:image/jpeg;base64,...')
 * 
 * @example
 * const imageUrl = await loadImageAsDataUrl('/image/1-cork-board.jpg');
 * await miro.board.createImage({ url: imageUrl, x: 0, y: 0, width: 500 });
 */
export async function loadImageAsDataUrl(path: string): Promise<string> {
  try {
    console.log('📥 Loading image:', path);
    
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('✅ Image loaded, size:', (blob.size / 1024).toFixed(2), 'KB');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        console.log('✅ Image converted to base64 data URL');
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image as data URL'));
      };
      
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Failed to load image:', path, error);
    throw error;
  }
}

/**
 * Preload multiple images in parallel.
 * 
 * @param paths - Array of image paths to preload
 * @returns Object mapping paths to base64 data URLs
 */
export async function preloadImages(paths: string[]): Promise<Record<string, string>> {
  console.log('📥 Preloading', paths.length, 'images...');
  
  const results = await Promise.allSettled(
    paths.map(async (path) => ({
      path,
      dataUrl: await loadImageAsDataUrl(path),
    }))
  );
  
  const imageMap: Record<string, string> = {};
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      imageMap[result.value.path] = result.value.dataUrl;
    } else {
      console.warn('Failed to preload image:', result.reason);
    }
  }
  
  console.log('✅ Preloaded', Object.keys(imageMap).length, 'images');
  return imageMap;
}
