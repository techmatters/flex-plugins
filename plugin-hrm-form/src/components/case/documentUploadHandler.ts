import { deleteFile, getFileUploadUrl } from '../../services/ServerlessService';
import { CustomHandlers } from '../common/forms/formGenerators';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
/**
 * This function calls an HTTP PUT to upload the document
 * @param file Document
 * @param preSignedUrl URL
 * @param mimeType MIME Type
 */
const uploadDocument = async (file: File, preSignedUrl: string, mimeType: string) => {
  const headers = new Headers();
  headers.append('Content-Type', mimeType);

  const options = {
    method: 'PUT',
    body: file,
    headers,
  };
  await fetch(preSignedUrl, options);
};

/**
 * This function uploads the file in two steps:
 * 1) Generates a preSingedUrl for uploading the document
 * 2) Calls the generated preSignedUrl
 *
 * It returns the file name at AWS
 */
const onFileChange = async event => {
  const file = event.target.files[0];

  if (file.size > MAX_FILE_SIZE) {
    alert('File exceeds max size.');
    return '';
  }

  const mimeType = file.type;
  const response = await getFileUploadUrl(file.name, mimeType);
  await uploadDocument(file, response.uploadUrl, mimeType);

  return response.fileNameAtAws;
};

const onDeleteFile = async (fileName: string) => {
  await deleteFile(fileName);
};

const fileUploadCustomHandlers: CustomHandlers = {
  onFileChange,
  onDeleteFile,
};

export default fileUploadCustomHandlers;
