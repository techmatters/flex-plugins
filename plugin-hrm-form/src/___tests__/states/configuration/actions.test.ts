import * as types from '../../../states/configuration/types';
import * as actions from '../../../states/configuration/actions';

describe('test action creators', () => {
  test('changeLanguage', async () => {
    const language = 'es';

    expect(actions.changeLanguage(language)).toStrictEqual({
      type: types.CHANGE_LANGUAGE,
      language,
    });
  });

  test('populateCounselorsState', async () => {
    const counselorsList: types.CounselorsList = [
      { sid: '1', fullName: '1' },
      { sid: '2', fullName: '2' },
      { sid: '3', fullName: '3' },
    ];

    expect(actions.populateCounselorsState(counselorsList)).toStrictEqual({
      type: types.POPULATE_COUNSELORS,
      counselorsList,
    });
  });
});
