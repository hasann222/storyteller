import { Directory, File } from 'expo-file-system';
import { saveCharacterImage, deleteCharacterImage } from '../../src/utils/imageStorage';

let mockDir: { exists: boolean; create: jest.Mock };
let mockFile: { uri: string; write: jest.Mock; delete: jest.Mock; exists: boolean };

beforeEach(() => {
  jest.clearAllMocks();
  mockDir = { exists: false, create: jest.fn() };
  mockFile = {
    uri: 'file:///test-documents/character-portraits/char-1.png',
    write: jest.fn(),
    delete: jest.fn(),
    exists: false,
  };
  // mockReturnValue covers all calls within a single test
  (Directory as unknown as jest.Mock).mockReturnValue(mockDir);
  (File as unknown as jest.Mock).mockReturnValue(mockFile);
});

describe('saveCharacterImage', () => {
  it('creates the portrait directory when it does not exist', () => {
    saveCharacterImage('char-1', 'b64data');
    expect(mockDir.create).toHaveBeenCalledWith({ intermediates: true });
  });

  it('skips directory creation when the directory already exists', () => {
    mockDir.exists = true;
    saveCharacterImage('char-1', 'b64data');
    expect(mockDir.create).not.toHaveBeenCalled();
  });

  it('writes Base64 data to the file', () => {
    saveCharacterImage('char-1', 'base64content');
    expect(mockFile.write).toHaveBeenCalledWith('base64content', { encoding: 'base64' });
  });

  it('returns the file URI', () => {
    const uri = saveCharacterImage('char-1', 'base64content');
    expect(uri).toBe('file:///test-documents/character-portraits/char-1.png');
  });
});

describe('deleteCharacterImage', () => {
  it('deletes the file when it exists', () => {
    mockFile.exists = true;
    deleteCharacterImage('char-1');
    expect(mockFile.delete).toHaveBeenCalled();
  });

  it('does not delete when the file does not exist', () => {
    mockFile.exists = false;
    deleteCharacterImage('char-1');
    expect(mockFile.delete).not.toHaveBeenCalled();
  });
});
