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

test("Form renders but can't be submitted empty", async () => {
  const alertSpy = jest.spyOn(window, 'alert');

  const updateFormAction = jest.fn();
  const updateStatusAction = jest.fn();
  const clearCSAMReportAction = jest.fn();
  const changeRoute = jest.fn();
  const addCSAMReportEntry = jest.fn();
  const csamReportState = { form: initialValues };
  const routing = { route: 'csam-report', subroute: 'form' };
  const counselorsHash = { workerSid };

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

  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  fireEvent.click(submitButton);

  expect(await screen.findAllByText('RequiredFieldError')).not.toHaveLength(0);
  expect(alertSpy).toHaveBeenCalled();
});

test('Form can be submitted if valid (anonymous)', async () => {
  const updateFormAction = jest.fn();
  const updateStatusAction = jest.fn();
  const clearCSAMReportAction = jest.fn();
  const changeRoute = jest.fn();
  const addCSAMReportEntry = jest.fn();
  const csamReportState = { form: initialValues };
  const routing = { route: 'csam-report', subroute: 'form' };
  const counselorsHash = { workerSid };

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

  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  const webAddressInput = screen.getByTestId('webAddress');
  expect(webAddressInput).toBeInTheDocument();

  fireEvent.change(webAddressInput, {
    target: {
      value: 'some-url',
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

test('Form can be submitted if valid (non-anonymous)', async () => {
  const updateFormAction = jest.fn();
  const updateStatusAction = jest.fn();
  const clearCSAMReportAction = jest.fn();
  const changeRoute = jest.fn();
  const addCSAMReportEntry = jest.fn();
  const csamReportState = { form: initialValues };
  const routing = { route: 'csam-report', subroute: 'form' };
  const counselorsHash = { workerSid };

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

  expect(screen.getByTestId('CSAMReport-FormScreen')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-Loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();

  const submitButton = screen.getByTestId('CSAMReport-SubmitButton');
  expect(submitButton).toBeInTheDocument();

  const webAddressInput = screen.getByTestId('webAddress');
  expect(webAddressInput).toBeInTheDocument();

  fireEvent.change(webAddressInput, {
    target: {
      value: 'some-url',
    },
  });

  const anonymousInput = screen.getByTestId('anonymous');
  expect(anonymousInput).toBeInTheDocument();

  fireEvent.click(anonymousInput);

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
  const updateFormAction = jest.fn();
  const updateStatusAction = jest.fn();
  const clearCSAMReportAction = jest.fn();
  const changeRoute = jest.fn();
  const addCSAMReportEntry = jest.fn();
  const csamReportState = { form: initialValues };
  const routing = { route: 'csam-report', subroute: 'loading' };
  const counselorsHash = { workerSid };

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

  expect(screen.getByTestId('CSAMReport-Loading')).toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-FormScreen')).not.toBeInTheDocument();
  expect(screen.queryByTestId('CSAMReport-StatusScreen')).not.toBeInTheDocument();
});

test('Report Status screen renders + copy button works', async () => {
  const updateFormAction = jest.fn();
  const updateStatusAction = jest.fn();
  const clearCSAMReportAction = jest.fn();
  const changeRoute = jest.fn();
  const addCSAMReportEntry = jest.fn();
  const csamReportState = {
    form: initialValues,
    reportStatus: {
      responseCode: 'responseCode',
      responseData: 'responseData',
      responseDescription: 'responseDescription',
    },
  };
  const routing = { route: 'csam-report', subroute: 'status' };
  const counselorsHash = { workerSid };

  Object.assign(navigator, {
    clipboard: {
      writeText: async () => undefined,
    },
  });

  const copySpy = jest.spyOn(navigator.clipboard, 'writeText');

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
