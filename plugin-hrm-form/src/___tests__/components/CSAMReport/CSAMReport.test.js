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
import { CSAMReportScreen } from '../../../components/CSAMReport/CSAMReport';
import { initialValues } from '../../../components/CSAMReport/CSAMReportFormDefinition';
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

const setupProps = (subroute, csamReportState) => ({
  alertSpy: jest.spyOn(window, 'alert'),
  updateFormAction: jest.fn(),
  updateStatusAction: jest.fn(),
  clearCSAMReportAction: jest.fn(),
  changeRoute: jest.fn(),
  addCSAMReportEntry: jest.fn(),
  csamReportState,
  routing: { route: 'csam-report', subroute },
  counselorsHash: { workerSid },
});

/**
 * @param {: 'form' | 'loading' | 'status'} subroute
 */
const renderCSAMReportScreen = (subrouteParam = 'form', csamReportStateParam = { form: initialValues }) => {
  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = setupProps(subrouteParam, csamReportStateParam);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <CSAMReportScreen
        taskSid={taskSid}
        updateFormAction={updateFormAction}
        updateStatusAction={updateStatusAction}
        clearCSAMReportAction={clearCSAMReportAction}
        changeRoute={changeRoute}
        addCSAMReportEntry={addCSAMReportEntry}
        csamReportState={csamReportState}
        routing={routing}
        counselorsHash={counselorsHash}
      />
    </StorelessThemeProvider>,
  );

  return {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  };
};

test("Form renders but can't be submitted empty", async () => {
  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = renderCSAMReportScreen();

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
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = renderCSAMReportScreen();
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
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = renderCSAMReportScreen();

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
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = renderCSAMReportScreen();

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

  expect(changeRoute).toHaveBeenCalled();
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
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = renderCSAMReportScreen();

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

  expect(changeRoute).toHaveBeenCalled();
  expect(reportToIWFSpy).toHaveBeenCalled();
  expect(createCSAMReportSpy).toHaveBeenCalled();
  expect(updateStatusAction).toHaveBeenCalled();
  expect(addCSAMReportEntry).toHaveBeenCalled();
});

test('Loading screen renders', async () => {
  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = renderCSAMReportScreen('loading');

  expect(screen.getByTestId('CSAMReport-Loading')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-FormScreen')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();
});

test('Report Status screen renders + copy button works', async () => {
  Object.assign(navigator, {
    clipboard: {
      writeText: async () => undefined,
    },
  });

  const copySpy = jest.spyOn(navigator.clipboard, 'writeText');

  const {
    alertSpy,
    updateFormAction,
    updateStatusAction,
    clearCSAMReportAction,
    changeRoute,
    addCSAMReportEntry,
    csamReportState,
    routing,
    counselorsHash,
  } = renderCSAMReportScreen('status', {
    form: initialValues,
    reportStatus: {
      responseCode: 'responseCode',
      responseData: 'responseData',
      responseDescription: 'responseDescription',
    },
  });

  expect(screen.getByTestId('CSAMReport-StatusScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-FormScreen')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();

  const copyCodeButton = screen.getByTestId('CSAMReport-CopyCodeButton');
  expect(copyCodeButton).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(copyCodeButton);
  });

  expect(copySpy).toHaveBeenCalledWith(csamReportState.reportStatus.responseData);
});
