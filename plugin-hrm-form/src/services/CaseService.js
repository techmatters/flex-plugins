import fetchHrmApi from './fetchHrmApi';

export async function createCase(caseRecord) {
  const options = {
    method: 'POST',
    body: JSON.stringify(caseRecord),
  };

  const responseJson = await fetchHrmApi('/cases', options);

  return responseJson;
}

export async function getCases() {
  const responseJson = await fetchHrmApi('/cases');

  return responseJson;
}
