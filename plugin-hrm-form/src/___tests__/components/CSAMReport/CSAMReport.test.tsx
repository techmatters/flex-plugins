/* eslint-disable sonarjs/no-identical-functions */
import * as React from 'react';
import { toHaveNoViolations } from 'jest-axe';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import '@testing-library/jest-dom/extend-expect';

import { CSAMReportTypes, isCounsellorTaskEntry, CSAMReportStateEntry } from '../../../states/csam-report/types';
import '../../mockGetConfig';
import { CSAMReportScreen, Props } from '../../../components/CSAMReport/CSAMReport';
import { childInitialValues, initialValues } from '../../../components/CSAMReport/CSAMReportFormDefinition';
import { CSAMPage, CSAMReportApi } from '../../../components/CSAMReport/csamReportApi';

console.error = () => undefined;
expect.extend(toHaveNoViolations);

const taskSid = 'task-sid';
const workerSid = 'worker-sid';

let mockCSAMReportApi: CSAMReportApi;
let dispatcherMocks;

const setupProps = (
  currentPage: CSAMPage,
  csamReportState: CSAMReportStateEntry,
): Props & { alertSpy: jest.SpyInstance } => {
  (mockCSAMReportApi.currentPage as jest.Mock).mockReturnValue(currentPage);
  (mockCSAMReportApi.reportState as jest.Mock).mockReturnValue(csamReportState);
  return {
    alertSpy: jest.spyOn(window, 'alert'),
    updateChildFormAction: dispatcherMocks.updateChildReportDispatcher,
    updateCounsellorFormAction: dispatcherMocks.updateCounsellorReportDispatcher,
    updateStatusAction: dispatcherMocks.updateStatusDispatcher,
    navigate: dispatcherMocks.navigationActionDispatcher,
    addCSAMReportEntry: dispatcherMocks.addReportDispatcher,
    exit: dispatcherMocks.exitActionDispatcher,
    csamReportState,
    currentPage,
    setEditPageOpen: jest.fn(),
    setEditPageClosed: jest.fn(),
    counselorsHash: { workerSid },
    api: mockCSAMReportApi,
  };
};

const renderCSAMReportScreen = (
  subrouteParam = CSAMPage.CounsellorForm,
  csamReportStateParam: CSAMReportStateEntry = { form: initialValues, reportType: CSAMReportTypes.COUNSELLOR },
) => {
  const {
    alertSpy,
    updateChildFormAction,
    updateCounsellorFormAction,
    updateStatusAction,
    addCSAMReportEntry,
    csamReportState,
    currentPage,
    counselorsHash,
    setEditPageClosed,
    setEditPageOpen,
    navigate,
    exit,
    api,
  } = setupProps(subrouteParam, csamReportStateParam);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <CSAMReportScreen
        taskSid={taskSid}
        updateChildFormAction={updateChildFormAction}
        updateCounsellorFormAction={updateCounsellorFormAction}
        updateStatusAction={updateStatusAction}
        addCSAMReportEntry={addCSAMReportEntry}
        csamReportState={csamReportState}
        counselorsHash={counselorsHash}
        navigate={navigate}
        exit={exit}
        api={api}
        setEditPageOpen={setEditPageOpen}
        setEditPageClosed={setEditPageClosed}
        currentPage={currentPage}
      />
    </StorelessThemeProvider>,
  );

  return {
    alertSpy,
    updateStatusAction,
    addCSAMReportEntry,
    csamReportState,
    counselorsHash,
    navigate,
    api,
  };
};

beforeEach(() => {
  dispatcherMocks = {
    addReportDispatcher: jest.fn(),
    exitActionDispatcher: jest.fn(),
    navigationActionDispatcher: jest.fn(),
    updateChildReportDispatcher: jest.fn(),
    updateCounsellorReportDispatcher: jest.fn(),
    updateStatusDispatcher: jest.fn(),
  };

  mockCSAMReportApi = {
    addReportDispatcher: () => dispatcherMocks.addReportDispatcher,
    exitActionDispatcher: () => dispatcherMocks.exitActionDispatcher,
    navigationActionDispatcher: () => dispatcherMocks.navigationActionDispatcher,
    updateChildReportDispatcher: () => dispatcherMocks.updateChildReportDispatcher,
    updateCounsellorReportDispatcher: () => dispatcherMocks.updateCounsellorReportDispatcher,
    updateStatusDispatcher: () => dispatcherMocks.updateCounsellorReportDispatcher,
    saveReport: jest.fn(),
    currentPage: jest.fn(),
    reportState: jest.fn(),
  };
});

test("Form renders but can't be submitted empty", async () => {
  const { alertSpy } = renderCSAMReportScreen();

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
  const { alertSpy } = renderCSAMReportScreen();
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
  const { alertSpy } = renderCSAMReportScreen();

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
  (mockCSAMReportApi.saveReport as jest.Mock).mockResolvedValue({
    hrmReport: {
      csamReportId: 'report-sid',
      reportType: 'counsellor-generated',
      id: 0,
      acknowledged: true,
      twilioWorkerId: 'WORKER_SID',
      createdAt: 'JUST NOW',
    },
    iwfReport: {
      'IWFReportService1.0': { responseData: {} },
    },
  });

  const { updateStatusAction, navigate, addCSAMReportEntry } = renderCSAMReportScreen();

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

  expect(navigate).toHaveBeenCalled();
  expect(mockCSAMReportApi.saveReport).toHaveBeenCalled();
  expect(updateStatusAction).toHaveBeenCalled();
  expect(addCSAMReportEntry).toHaveBeenCalled();
});

test('Form can be submitted if valid (non-anonymous)', async () => {
  (mockCSAMReportApi.saveReport as jest.Mock).mockResolvedValue({
    hrmReport: {
      csamReportId: 'report-sid',
      reportType: 'counsellor-generated',
      id: 0,
      acknowledged: true,
      twilioWorkerId: 'WORKER_SID',
      createdAt: 'JUST NOW',
    },
    iwfReport: {
      'IWFReportService1.0': { responseData: {} },
    },
  });

  const { updateStatusAction, navigate, addCSAMReportEntry } = renderCSAMReportScreen(CSAMPage.CounsellorForm, {
    form: {
      ...initialValues,
      anonymous: 'non-anonymous',
    },
    reportType: CSAMReportTypes.COUNSELLOR,
  });

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

  expect(navigate).toHaveBeenCalled();
  expect(mockCSAMReportApi.saveReport).toHaveBeenCalled();
  expect(updateStatusAction).toHaveBeenCalled();
  expect(addCSAMReportEntry).toHaveBeenCalled();
});

test('Loading screen renders', async () => {
  renderCSAMReportScreen(CSAMPage.Loading);

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

  const { csamReportState } = renderCSAMReportScreen(CSAMPage.CounsellorStatus, {
    reportType: CSAMReportTypes.COUNSELLOR,
    form: { initialValues, childInitialValues },
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
  // TS will not narrow the type for the last check if we use jest assertions :-(
  if (!isCounsellorTaskEntry(csamReportState)) {
    throw new Error('CSAM state should be for a counsellor report');
  }
  expect(copySpy).toHaveBeenCalledWith(csamReportState.reportStatus.responseData);
});
