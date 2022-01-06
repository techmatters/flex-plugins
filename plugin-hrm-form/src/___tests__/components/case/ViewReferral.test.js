import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { UnconnectedViewReferral } from '../../../components/case/ViewReferral';
import HrmTheme from '../../../styles/HrmTheme';
import { getDefinitionVersions } from '../../../HrmFormPlugin';

expect.extend(toHaveNoViolations);

const themeConf = {
  colorTheme: HrmTheme,
};

describe('ViewReferral screen', () => {
  const counselor = 'John Doe';
  const date = '8/12/2020';
  const referral = {
    date: '2020-12-22',
    referredTo: 'State Agency 1',
    comments: 'Comments',
  };

  const counselorsHash = {
    'counselor-hash-1': counselor,
  };

  const tempInfo = {
    screen: 'view-referral',
    info: {
      counselor: 'counselor-hash-1',
      date,
      referral,
    },
  };

  const taskSid = 'task-id';
  const route = 'new-case';

  let mockV1;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  test('displays counselor, activity date, referral date, referredTo and comments', () => {
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewReferral
          taskSid={taskSid}
          tempInfo={tempInfo}
          onClickClose={jest.fn()}
          route={route}
          counselorsHash={counselorsHash}
          definitionVersion={mockV1}
        />
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('Case-ActionHeaderCounselor')).toHaveTextContent(counselor);
    expect(screen.getByTestId('Case-ActionHeaderAdded')).toHaveTextContent(date);
    expect(() => screen.getByText('2020-12-22')).not.toThrow();
    expect(() => screen.getByText(referral.referredTo)).not.toThrow();
  });

  test('click on x button', () => {
    const onClickClose = jest.fn();

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewReferral
          taskSid={taskSid}
          tempInfo={tempInfo}
          onClickClose={onClickClose}
          route={route}
          counselorsHash={counselorsHash}
          definitionVersion={mockV1}
        />
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
    screen.getByTestId('Case-CloseCross').click();

    expect(onClickClose).toHaveBeenCalled();
  });

  test('click on close button', () => {
    const onClickClose = jest.fn();

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewReferral
          taskSid={taskSid}
          tempInfo={tempInfo}
          onClickClose={onClickClose}
          route={route}
          counselorsHash={counselorsHash}
          definitionVersion={mockV1}
        />
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('Case-ViewNoteScreen-CloseButton')).toBeInTheDocument();
    screen.getByTestId('Case-ViewNoteScreen-CloseButton').click();

    expect(onClickClose).toHaveBeenCalled();
  });

  test('a11y', async () => {
    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <UnconnectedViewReferral
          taskSid="taskSid"
          tempInfo={tempInfo}
          onClickClose={jest.fn()}
          counselorsHash={counselorsHash}
          definitionVersion={mockV1}
        />
      </StorelessThemeProvider>,
    );

    const rules = {
      region: { enabled: false },
    };

    const axe = configureAxe({ rules });
    const results = await axe(wrapper.getDOMNode());

    expect(results).toHaveNoViolations();
  });
});
