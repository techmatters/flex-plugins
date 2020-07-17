import { cancelCase } from '../../services/CaseService';
import fetchHrmApi from '../../services/fetchHrmApi';

jest.mock('../../services/fetchHrmApi');

describe('cancelCase()', () => {
  test('cancelCase calls "DELETE /cases/id', async () => {
    const caseId = 1;

    await cancelCase(caseId);

    const expectedUrl = `/cases/${caseId}`;
    const exptectedOptions = { method: 'DELETE' };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, exptectedOptions);
  });
});
