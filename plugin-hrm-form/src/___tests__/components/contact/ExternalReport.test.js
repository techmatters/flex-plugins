/* eslint-disable sonarjs/no-identical-functions */
import React from 'react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import '@testing-library/jest-dom/extend-expect';

import '../../mockGetConfig';

import * as ServerlessService from '../../../services/ServerlessService';
import * as CSAMReportService from '../../../services/CSAMReportService';
import { ExternalReportScreen } from '../../../components/contact/ExternalReport';
import { initialValues, childInitialValues } from '../../../components/CSAMReport/CSAMReportFormDefinition';
import HrmTheme from '../../../styles/HrmTheme';

jest.mock('../../../services/ServerlessService');
jest.mock('../../../services/CSAMReportService');

console.error = () => undefined;
expect.extend(toHaveNoViolations);

const themeConf = {
  colorTheme: HrmTheme,
};

const taskSid = 'task-sid';
const workerSid = 'worker-sid';
const csamType = 'counsellor-form';

const setupProps = (externalReport, csamReportState) => ({
  alertSpy: jest.spyOn(window, 'alert'),
  updateFormAction: jest.fn(),
  updateStatusAction: jest.fn(),
  clearCSAMReportAction: jest.fn(),
  addCSAMReportEntry: jest.fn(),
  taskSid,
  csamReportState,
  counselorsHash: { workerSid },
  externalReport: 'counsellor-form',
  setExternalReport: jest.fn(),
  contactId: '234',
  setEditContactPageOpen: jest.fn(),
  setEditContactPageClosed: jest.fn(),
  routing: { route: 'csam-report' },
  csamType,
});

/**
 * @param {: 'child-form' | 'counsellor-form' | 'loading' | 'child-status' | 'counsellor-status'} externalReport
 */
const renderExternalReportScreen = (
  externalReport = 'counsellor-form',
  csamReportStateParam = { webAddress: '', description: '', anonymous: '', firstName: '', lastName: '', email: '' },
) => {
  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  } = setupProps(csamReportStateParam);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <ExternalReportScreen
        taskSid={taskSid}
        updateFormAction={updateFormAction}
        updateStatusAction={updateStatusAction}
        clearCSAMReportAction={clearCSAMReportAction}
        addCSAMReportEntry={addCSAMReportEntry}
        csamReportState={csamReportState}
        externalReport={externalReport}
        routing={routing}
        counselorsHash={counselorsHash}
        setExternalReport={setExternalReport}
        contactId={contactId}
        setEditContactPageOpen={setEditContactPageOpen}
        setEditContactPageClosed={setEditContactPageClosed}
      />
    </StorelessThemeProvider>,
  );

  return {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    externalReport,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  };
};

test("Form renders but can't be submitted empty", async () => {
  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    externalReport,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  } = renderExternalReportScreen();

  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  fireEvent.click(submitButton);

  expect(await screen.findAllByText('RequiredFieldError')).not.toHaveLength(0);
  expect(alertSpy).toHaveBeenCalled();
});

test("Form renders but can't be submitted on invalid url", async () => {
  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    externalReport,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  } = renderExternalReportScreen();
  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const webAddressInput = screen.getByTestId('webAddress');
  expect(webAddressInput).toBeInTheDocument();

  fireEvent.change(webAddressInput, {
    target: {
      value: 'this is not a valid url',
    },
  });

  expect(setEditContactPageOpen).toHaveBeenCalled();
  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  fireEvent.click(submitButton);

  expect(await screen.findAllByText('NotURLFieldError')).not.toHaveLength(0);
  expect(alertSpy).toHaveBeenCalled();
});

test("Form can't be submitted if anonymous value is undefined", async () => {
  const reportToIWFSpy = jest.spyOn(ServerlessService, 'reportToIWF').mockImplementationOnce(() =>
    Promise.resolve({
      'IWFReportService1.0': { responseData: {} },
    }),
  );
  const createCSAMReportSpy = jest.spyOn(CSAMReportService, 'createCSAMReport').mockImplementationOnce(() =>
    Promise.resolve({
      csamReportId: 'report-sid',
    }),
  );

  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    externalReport,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  } = renderExternalReportScreen();

  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  const webAddressInput = screen.getByTestId('webAddress');
  expect(webAddressInput).toBeInTheDocument();

  fireEvent.change(webAddressInput, {
    target: {
      value: 'validurl.com',
    },
  });

  fireEvent.click(submitButton);

  expect(await screen.findAllByText('RequiredFieldError')).not.toHaveLength(0);
  expect(alertSpy).toHaveBeenCalled();
});

test('Form can be submitted if valid (anonymous)', async () => {
  const reportToIWFSpy = jest.spyOn(ServerlessService, 'reportToIWF').mockImplementationOnce(() =>
    Promise.resolve({
      'IWFReportService1.0': { responseData: {} },
    }),
  );
  const createCSAMReportSpy = jest.spyOn(CSAMReportService, 'createCSAMReport').mockImplementationOnce(() =>
    Promise.resolve({
      csamReportId: 'report-sid',
    }),
  );

  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    externalReport,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  } = renderExternalReportScreen();

  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  const webAddressInput = screen.getByTestId('webAddress');
  expect(webAddressInput).toBeInTheDocument();

  fireEvent.change(webAddressInput, {
    target: {
      value: 'validurl.com',
    },
  });

  const anonymousInput = screen.getByTestId('anonymous-anonymous');
  expect(anonymousInput).toBeInTheDocument();
  const nonanonymousInput = screen.getByTestId('anonymous-non-anonymous');
  expect(nonanonymousInput).toBeInTheDocument();

  fireEvent.change(anonymousInput, { target: { checked: true } });

  fireEvent.click(submitButton);

  await waitFor(() => expect(screen.queryAllByText('RequiredFieldError')).toHaveLength(0));

  expect(setExternalReport).toHaveBeenCalled();
  expect(reportToIWFSpy).toHaveBeenCalled();
  expect(createCSAMReportSpy).toHaveBeenCalled();
  expect(updateStatusAction).toHaveBeenCalled();
  expect(addCSAMReportEntry).toHaveBeenCalled();
});

test('Form can be submitted if valid (non-anonymous)', async () => {
  const reportToIWFSpy = jest.spyOn(ServerlessService, 'reportToIWF').mockImplementationOnce(() =>
    Promise.resolve({
      'IWFReportService1.0': { responseData: {} },
    }),
  );
  const createCSAMReportSpy = jest.spyOn(CSAMReportService, 'createCSAMReport').mockImplementationOnce(() =>
    Promise.resolve({
      csamReportId: 'report-sid',
    }),
  );

  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    externalReport,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  } = renderExternalReportScreen();

  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  const webAddressInput = screen.getByTestId('webAddress');
  expect(webAddressInput).toBeInTheDocument();

  fireEvent.change(webAddressInput, {
    target: {
      value: 'validurl.com',
    },
  });

  const anonymousInput = screen.getByTestId('anonymous-anonymous');
  expect(anonymousInput).toBeInTheDocument();
  const nonanonymousInput = screen.getByTestId('anonymous-non-anonymous');
  expect(nonanonymousInput).toBeInTheDocument();

  fireEvent.change(nonanonymousInput, { target: { checked: true } });

  const firstNameInput = screen.getByTestId('firstName');
  expect(firstNameInput).toBeInTheDocument();
  const lastNameInput = screen.getByTestId('lastName');
  expect(lastNameInput).toBeInTheDocument();
  const emailInput = screen.getByTestId('email');
  expect(emailInput).toBeInTheDocument();

  fireEvent.change(emailInput, {
    target: {
      value: 'some@email.com',
    },
  });

  fireEvent.click(submitButton);
  await waitFor(() => expect(screen.queryAllByText('RequiredFieldError')).toHaveLength(0));

  expect(setExternalReport).toHaveBeenCalled();
  expect(reportToIWFSpy).toHaveBeenCalled();
  expect(createCSAMReportSpy).toHaveBeenCalled();
  expect(updateStatusAction).toHaveBeenCalled();
  expect(addCSAMReportEntry).toHaveBeenCalled();
  expect(setExternalReport).toHaveBeenCalled();
});

test('Loading screen renders', async () => {
  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    addCSAMReportEntry,
    taskSid,
    csamReportState,
    counselorsHash,
    externalReport,
    setExternalReport,
    contactId,
    setEditContactPageOpen,
    setEditContactPageClosed,
    routing,
  } = renderExternalReportScreen('loading');

  expect(screen.getByTestId('CSAMReport-Loading')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-FormScreen')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();
});
