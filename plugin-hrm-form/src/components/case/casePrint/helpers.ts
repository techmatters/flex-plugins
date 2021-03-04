/**
 * Gets Image as a base64 encoded string (BLOB)
 * @param url Image URL
 */
export const getImageAsString = (url: string): Promise<any> =>
  fetch(url)
    .then(response => response.blob())
    .then(
      blob =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );

export type ImageSource = {
  url: string;
  setStateCallback: React.Dispatch<string>;
};
