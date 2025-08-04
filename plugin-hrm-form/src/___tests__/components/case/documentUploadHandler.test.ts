/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import each from 'jest-each';
import { bindFileUploadCustomHandlers } from '../../../components/case/documentUploadHandler';
import { fetchHrmApi } from '../../../services/fetchHrmApi';
import { getHrmConfig } from '../../../hrmConfig';

jest.mock('../../../services/fetchHrmApi');
jest.mock('../../../hrmConfig');

const mockFetchHrmApi = fetchHrmApi as jest.MockedFunction<typeof fetchHrmApi>;
const mockGetHrmConfig = getHrmConfig as jest.MockedFunction<typeof getHrmConfig>;

// Mock global alert
const mockAlert = jest.fn();
global.alert = mockAlert;

// Mock File constructor and FileReader
global.File = class MockFile {
  name: string;

  size: number;

  type: string;

  constructor(chunks: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.size = options.size || 1024;
    this.type = options.type || 'application/octet-stream';
  }
} as any;

describe('documentUploadHandler', () => {
  const caseId = 'test-case-id';
  const mockPreSignedUrl = 'https://example.com/upload';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHrmConfig.mockReturnValue({
      docsBucket: 'test-bucket',
    } as any);
    mockFetchHrmApi.mockResolvedValue({
      media_url: mockPreSignedUrl,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    });
  });

  describe('File Extension Validation', () => {
    const handlers = bindFileUploadCustomHandlers(caseId);
    const { onFileChange } = handlers;

    each([
      ['PNG', 'test.png', 'image/png'],
      ['JPG', 'test.jpg', 'image/jpeg'],
      ['JPEG', 'test.jpeg', 'image/jpeg'],
      ['PDF', 'test.pdf', 'application/pdf'],
      ['DOC', 'test.doc', 'application/msword'],
      ['DOCX', 'test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ]).it('should accept valid %s files', async (fileType, fileName, mimeType) => {
      const file = new File(['fake content'], fileName, { type: mimeType, size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBeTruthy();
      expect(mockAlert).not.toHaveBeenCalledWith(
        'Invalid file type. Only PNG, JPG, JPEG, PDF, DOC, and DOCX files are allowed.',
      );
    });

    it('should reject files with invalid extensions', async () => {
      const file = new File(['fake content'], 'test.txt', { type: 'text/plain', size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith(
        'Invalid file type. Only PNG, JPG, JPEG, PDF, DOC, and DOCX files are allowed.',
      );
    });

    it('should reject executable files', async () => {
      const file = new File(['fake content'], 'malicious.exe', { type: 'application/x-msdownload', size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith(
        'Invalid file type. Only PNG, JPG, JPEG, PDF, DOC, and DOCX files are allowed.',
      );
    });

    it('should reject script files', async () => {
      const file = new File(['fake content'], 'script.js', { type: 'application/javascript', size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith(
        'Invalid file type. Only PNG, JPG, JPEG, PDF, DOC, and DOCX files are allowed.',
      );
    });
  });

  describe('MIME Type Validation', () => {
    const handlers = bindFileUploadCustomHandlers(caseId);
    const { onFileChange } = handlers;

    each([
      ['PNG', 'test.png', 'image/png'],
      ['PDF', 'test.pdf', 'application/pdf'],
      ['DOC', 'test.doc', 'application/msword'],
      ['JPG', 'test.jpg', 'image/jpg'],
      ['JPEG', 'test.jpg', 'image/jpeg'],
      ['DOCX', 'test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ]).it('should accept valid %s MIME type', async (fileType, fileName, mimeType) => {
      const file = new File(['fake content'], fileName, { type: mimeType, size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBeTruthy();
      expect(mockAlert).not.toHaveBeenCalledWith('Invalid file type. File content does not match the expected format.');
    });

    it('should reject files with invalid MIME types', async () => {
      const file = new File(['fake content'], 'test.png', { type: 'text/plain', size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith('Invalid file type. File content does not match the expected format.');
    });

    it('should reject files with executable MIME types', async () => {
      const file = new File(['fake content'], 'malicious.pdf', { type: 'application/x-msdownload', size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith('Invalid file type. File content does not match the expected format.');
    });
  });

  describe('File Extension and MIME Type Mismatch', () => {
    const handlers = bindFileUploadCustomHandlers(caseId);
    const { onFileChange } = handlers;

    it('should detect when file extension does not match MIME type', async () => {
      const file = new File(['fake content'], 'test.pdf', { type: 'text/plain', size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith('Invalid file type. File content does not match the expected format.');
    });

    it('should detect potential spoofing attempts', async () => {
      const file = new File(['fake content'], 'script.exe.pdf', { type: 'application/x-msdownload', size: 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith('Invalid file type. File content does not match the expected format.');
    });
  });

  describe('File Size Validation', () => {
    const handlers = bindFileUploadCustomHandlers(caseId);
    const { onFileChange } = handlers;

    it('should reject files exceeding 5MB limit', async () => {
      const file = new File(['fake content'], 'large.pdf', { type: 'application/pdf', size: 6 * 1024 * 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith('File exceeds max size.');
    });

    it('should accept files under 5MB limit', async () => {
      const file = new File(['fake content'], 'small.pdf', { type: 'application/pdf', size: 4 * 1024 * 1024 });
      const event = { target: { files: [file] } };

      const result = await onFileChange(event);

      expect(result).toBeTruthy();
      expect(mockAlert).not.toHaveBeenCalledWith('File exceeds max size.');
    });
  });
});
