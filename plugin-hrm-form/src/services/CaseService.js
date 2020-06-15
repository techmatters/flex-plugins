import secret from '../private/secret';

export async function createCase(hrmBaseUrl, caseRecord) {
  try {
    const response = await fetch(`${hrmBaseUrl}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
      body: JSON.stringify(caseRecord),
    });

    if (!response.ok) {
      throw response.error();
    }

    return await response.json();
  } catch (e) {
    console.log('Error creating a case: ', e);
    return [];
  }
}
