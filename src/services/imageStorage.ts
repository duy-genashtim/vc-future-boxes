/**
 * Image Storage Service
 * Handles image file management: copy to permanent storage, resize, delete
 *
 * @module services/imageStorage
 * @requires expo-file-system/legacy
 */

import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Constants
const IMAGES_DIR = `${FileSystem.documentDirectory}images/`;
const MAX_IMAGE_WIDTH = 1024;

/**
 * Initialize images directory
 * Creates the directory if it doesn't exist
 */
export async function initializeImageStorage(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
      console.log('Images directory created:', IMAGES_DIR);
    }
  } catch (error) {
    console.error('Failed to initialize image storage:', error);
    throw new Error('Image storage initialization failed');
  }
}

/**
 * Get permanent path for capsule image
 *
 * @param capsuleId - Capsule ID
 * @param imageIndex - Image index (0, 1, or 2)
 * @returns Full file path for the image
 */
export function getImagePath(capsuleId: string, imageIndex: number): string {
  return `${IMAGES_DIR}capsule_${capsuleId}_image_${imageIndex}.jpg`;
}

/**
 * Resize image if it exceeds maximum width
 * Maintains aspect ratio
 *
 * @param uri - Source image URI
 * @param maxWidth - Maximum width in pixels
 * @returns URI of resized image (or original if no resize needed)
 */
export async function resizeImage(
  uri: string,
  maxWidth: number = MAX_IMAGE_WIDTH
): Promise<string> {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    return result.uri;
  } catch (error) {
    console.error('Failed to resize image:', error);
    // Return original URI if resize fails
    return uri;
  }
}

/**
 * Copy image from temporary location to permanent storage
 * Automatically resizes if image is too large
 *
 * @param uri - Source image URI (from ImagePicker)
 * @param capsuleId - Capsule ID for naming
 * @param imageIndex - Image index (0, 1, or 2)
 * @returns Permanent URI of the copied image
 * @throws {Error} If copy operation fails
 */
export async function copyImageToPermanentStorage(
  uri: string,
  capsuleId: string,
  imageIndex: number
): Promise<string> {
  try {
    // Ensure images directory exists
    await initializeImageStorage();

    // Resize image if needed
    const resizedUri = await resizeImage(uri);

    // Get permanent path
    const permanentPath = getImagePath(capsuleId, imageIndex);

    // Copy to permanent storage
    await FileSystem.copyAsync({
      from: resizedUri,
      to: permanentPath,
    });

    console.log(`Image copied to: ${permanentPath}`);
    return permanentPath;
  } catch (error) {
    console.error('Failed to copy image to permanent storage:', error);
    throw new Error('Failed to save image');
  }
}

/**
 * Delete an image from storage
 *
 * @param uri - Image URI to delete
 * @throws {Error} If deletion fails
 */
export async function deleteImage(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      console.log(`Image deleted: ${uri}`);
    }
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Delete all images for a capsule
 *
 * @param capsuleId - Capsule ID
 */
export async function deleteCapsuleImages(capsuleId: string): Promise<void> {
  try {
    // Try to delete all 3 possible images
    for (let i = 0; i < 3; i++) {
      const imagePath = getImagePath(capsuleId, i);

      try {
        const fileInfo = await FileSystem.getInfoAsync(imagePath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(imagePath, { idempotent: true });
        }
      } catch (error) {
        // Continue even if one image fails
        console.warn(`Failed to delete image ${i} for capsule ${capsuleId}:`, error);
      }
    }

    console.log(`All images deleted for capsule: ${capsuleId}`);
  } catch (error) {
    console.error('Failed to delete capsule images:', error);
    throw error;
  }
}

/**
 * Clean up orphaned images
 * Deletes images that don't belong to any capsule in the database
 *
 * @param validCapsuleIds - Array of valid capsule IDs from database
 * @returns Number of orphaned images deleted
 */
export async function cleanupOrphanedImages(
  validCapsuleIds: string[]
): Promise<number> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);

    if (!dirInfo.exists) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(IMAGES_DIR);
    let deletedCount = 0;

    for (const file of files) {
      // Extract capsule ID from filename: capsule_[ID]_image_[N].jpg
      const match = file.match(/capsule_(.+?)_image_\d+\.jpg/);

      if (match) {
        const capsuleId = match[1];

        // If capsule ID is not in valid list, delete the image
        if (!validCapsuleIds.includes(capsuleId)) {
          const filePath = `${IMAGES_DIR}${file}`;
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          deletedCount++;
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} orphaned images`);
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup orphaned images:', error);
    return 0;
  }
}

/**
 * Get total storage size used by images
 *
 * @returns Total size in bytes
 */
export async function getImagesStorageSize(): Promise<number> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);

    if (!dirInfo.exists) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(IMAGES_DIR);
    let totalSize = 0;

    for (const file of files) {
      const filePath = `${IMAGES_DIR}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (fileInfo.exists && 'size' in fileInfo) {
        totalSize += fileInfo.size || 0;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to get images storage size:', error);
    return 0;
  }
}
