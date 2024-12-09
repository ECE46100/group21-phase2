import axios from 'axios';
import uploadUrlHandler from '../../src/utils/packageURLUtils';

jest.mock('axios');

describe('uploadUrlHandler', () => {

  // Mocked response for NPM package
  const mockNpmResponse = {
    status: 200,
    data: {
      name: 'package-name',
      version: '1.0.0',
      dist: {
        tarball: 'https://example.com/package-name-1.0.0.tgz'
      }
    }
  };

  const mockGitHubResponse = {
    status: 200,
    data: {
      content: 'file content'
    },
    config: {
      headers: {}
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle NPM URLs', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce(mockNpmResponse);
    (axios.get as jest.Mock).mockResolvedValueOnce({ status: 200, data: 'file content' });
    const url = 'https://npmjs.com/package-name/1.0.0';
    const result = await uploadUrlHandler(url);
    expect(result).toEqual({
      name: 'package-name',
      version: '1.0.0',
      content: 'file content'
    });
  });

  it('should handle GitHub URLs', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ status: 200, data: [{name: '1.0.0'}],  length: 1 });
    (axios.get as jest.Mock).mockResolvedValueOnce(
      { status: 200, 
        data: { 
          content: Buffer.from(JSON.stringify({ name: 'package-name', version: '1.0.0' })).toString('base64') 
    }});
    (axios.get as jest.Mock).mockResolvedValueOnce({ status: 200, data: 'file content' });
    const url = 'https://github.com/owner/repo';
    const result = await uploadUrlHandler(url);
    expect(result).toEqual({
      name: 'package-name',
      version: '1.0.0',
      content: 'file content'
    });
  });
});