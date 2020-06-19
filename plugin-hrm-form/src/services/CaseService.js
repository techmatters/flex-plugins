import secret from '../private/secret';

export async function createCase(hrmBaseUrl, caseRecord) {
  const response = await fetch(`${hrmBaseUrl}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(caseRecord),
  });

  if (!response.ok) {
    const error = response.error();
    console.log(JSON.stringify(error));
    throw error;
  }

  return response.json();
}
