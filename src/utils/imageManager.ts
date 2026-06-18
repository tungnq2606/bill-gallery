import { File, Directory, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const BILLS_DIR = new Directory(Paths.document, 'bills');

interface SavedImage {
  originalUri: string;
  thumbnailUri: string;
}

/**
 * Save an image to persistent storage under bills/{billId}/.
 * Generates a 300px-wide thumbnail for gallery tiles.
 */
export const saveImage = async (sourceUri: string, billId: string): Promise<SavedImage> => {
  const billDir = new Directory(BILLS_DIR, billId);
  if (!billDir.exists) {
    billDir.create();
  }

  const original = new File(billDir, 'original.jpg');
  const source = new File(sourceUri);
  source.copy(original);

  // Generate thumbnail
  const thumb = await manipulateAsync(
    original.uri,
    [{ resize: { width: 300 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );
  const thumbnail = new File(billDir, 'thumb.jpg');
  const thumbSource = new File(thumb.uri);
  thumbSource.move(thumbnail);

  return { originalUri: original.uri, thumbnailUri: thumbnail.uri };
};

/**
 * Delete all images for a bill.
 */
export const deleteImages = async (billId: string): Promise<void> => {
  const billDir = new Directory(BILLS_DIR, billId);
  if (billDir.exists) {
    billDir.delete();
  }
};
