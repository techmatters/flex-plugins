import fetchHrmApi from './fetchHrmApi';

export async function createCase(caseRecord) {
  const options = {
    method: 'POST',
    body: JSON.stringify(caseRecord),
  };

  const responseJson = await fetchHrmApi('/cases', options);

  return responseJson;
}

export async function getCases(limit, offset) {
  if (limit !== undefined && offset !== undefined) {
    const responseJson = await fetchHrmApi(`/cases?limit=${limit}&offset=${offset}`);
    return responseJson;
  }

  const responseJson = await fetchHrmApi('/cases');

  return responseJson;
}

export async function cancelCase(caseId) {
  const options = {
    method: 'DELETE',
  };

  const responseJson = await fetchHrmApi(`/cases/${caseId}`, options);

  return responseJson;
}
