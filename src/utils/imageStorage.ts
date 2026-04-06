import { Paths, File, Directory } from 'expo-file-system';

function getPortraitDir(): Directory {
  return new Directory(Paths.document, 'character-portraits');
}

function ensureDir(): void {
  const dir = getPortraitDir();
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
}

/** Save a base64-encoded image and return its local file URI */
export function saveCharacterImage(characterId: string, base64Data: string): string {
  ensureDir();
  const file = new File(getPortraitDir(), `${characterId}.png`);
  file.write(base64Data, { encoding: 'base64' });
  return file.uri;
}

/** Delete the portrait image for a character */
export function deleteCharacterImage(characterId: string): void {
  const file = new File(getPortraitDir(), `${characterId}.png`);
  if (file.exists) {
    file.delete();
  }
}
