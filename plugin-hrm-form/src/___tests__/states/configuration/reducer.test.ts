import { reduce } from '../../../states/configuration/reducer';
import * as types from '../../../states/configuration/types';
import * as actions from '../../../states/configuration/actions';
import { defaultLanguage } from '../../../utils/pluginHelpers';

describe('test reducer', () => {
  let state = undefined;

  test('should return initial state', async () => {
    const expected = { language: defaultLanguage, counselors: { list: [], hash: {} } };

    const result = reduce(state, {});
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle CHANGE_LANGUAGE', async () => {
    const language = 'es';
    const expected = { ...state, language };

    const result = reduce(state, actions.changeLanguage(language));
    expect(result).toStrictEqual(expected);
  });

  test('should handle CHANGE_LANGUAGE', async () => {
    const counselorsList: types.CounselorsList = [
      { sid: '1', fullName: '1' },
      { sid: '2', fullName: '2' },
      { sid: '3', fullName: '3' },
    ];
    const counselors = {
      list: counselorsList,
      hash: { '1': '1', '2': '2', '3': '3' },
    };
    const expected = { ...state, counselors };

    const result = reduce(state, actions.populateCounselorsState(counselorsList));
    expect(result).toStrictEqual(expected);

    state = result;
  });
});
