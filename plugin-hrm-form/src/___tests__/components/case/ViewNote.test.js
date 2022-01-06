import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { UnconnectedViewNote } from '../../../components/case/ViewNote';
import HrmTheme from '../../../styles/HrmTheme';
import { DefinitionVersionId, loadDefinition } from '../../../formDefinitions';
import { getDefinitionVersions } from '../../../HrmFormPlugin';

expect.extend(toHaveNoViolations);

const themeConf = {
  colorTheme: HrmTheme,
};

let mockV1;

beforeAll(async () => {
  mockV1 = loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

test('displays counselor, date and note', () => {
  const counselor = 'John Doe';
  const date = '8/12/2020';
  const note = 'lorem ipsum';

  const counselorsHash = {
    'counselor-hash-1': counselor,
  };

  const tempInfo = {
    screen: 'view-note',
    info: {
      counselor: 'counselor-hash-1',
      date,
      note,
    },
  };

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewNote
        taskSid="taskSid"
        tempInfo={tempInfo}
        onClickClose={jest.fn()}
        counselorsHash={counselorsHash}
        definitionVersion={mockV1}
      />
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('Case-ActionHeaderCounselor')).toHaveTextContent(counselor);
  expect(screen.getByTestId('Case-ActionHeaderAdded')).toHaveTextContent(date);
  expect(screen.getByTestId('Case-ViewNoteScreen-Note')).toHaveTextContent(note);
});

test('click on x button', () => {
  const onClickClose = jest.fn();
  const taskSid = 'task-id';
  const route = 'new-case';
  const counselor = 'John Doe';
  const date = '8/12/2020';
  const note = 'lorem ipsum';

  const counselorsHash = {
    'counselor-hash-1': counselor,
  };

  const tempInfo = {
    screen: 'view-note',
    info: {
      counselor: 'counselor-hash-1',
      date,
      note,
    },
  };

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewNote
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
  const taskSid = 'task-id';
  const route = 'new-case';
  const counselor = 'John Doe';
  const date = '8/12/2020';
  const note = 'lorem ipsum';

  const counselorsHash = {
    'counselor-hash-1': counselor,
  };

  const tempInfo = {
    screen: 'view-note',
    info: {
      counselor: 'counselor-hash-1',
      date,
      note,
    },
  };

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewNote
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
  const counselor = 'John Doe';
  const date = '8/12/2020';
  const note = 'lorem ipsum';

  const counselorsHash = {
    'counselor-hash-1': counselor,
  };

  const tempInfo = {
    screen: 'view-note',
    info: {
      counselor: 'counselor-hash-1',
      date,
      note,
    },
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedViewNote
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
