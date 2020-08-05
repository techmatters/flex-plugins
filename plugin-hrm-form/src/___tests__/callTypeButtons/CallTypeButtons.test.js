import React from 'react';
import renderer from 'react-test-renderer';
import { Template } from '@twilio/flex-ui';

import '../mockStyled';
import '../mockGetConfig';
import CallTypeButtons from '../../components/callTypeButtons';
import { DataCallTypeButton, NonDataCallTypeButton, ConfirmButton, CancelButton } from '../../styles/callTypeButtons';
import LocalizationContext from '../../contexts/LocalizationContext';
import callTypes from '../../states/DomainConstants';

const task = {
  taskSid: 'task-sid',
};

const strings = {
  TaskHeaderEndCall: 'HANG UP',
  TaskHeaderEndChat: 'END CHAT',
};

const withEndCall = <Template code="TaskHeaderEndCall" />;
const withEndChat = <Template code="TaskHeaderEndChat" />;

jest.mock('../../services/ContactService', () => ({
  saveToHrm: () => Promise.resolve(),
}));

afterEach(() => {
  jest.resetAllMocks();
});

test('<CallTypeButtons> inital render (no dialog)', () => {
  const form = {
    callType: {
      value: '',
    },
  };
  const isCallTask = () => false;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={jest.fn()}
        changeRoute={jest.fn()}
        handleCompleteTask={jest.fn()}
      />
    </LocalizationContext.Provider>,
  ).root;

  expect(() => component.findByType(CloseTaskDialogText)).toThrow();
  expect(() => component.findAllByType(DataCallTypeButton)).not.toThrow();
  expect(() => component.findAllByType(NonDataCallTypeButton)).not.toThrow();
});

const getConfirmButtonText = component => component.findByType(ConfirmButton).props.children;

test('<CallTypeButtons> renders dialog with END CHAT button', () => {
  const form = {
    callType: {
      value: callTypes.child,
    },
  };
  const isCallTask = () => false;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={jest.fn()}
        changeRoute={jest.fn()}
        handleCompleteTask={jest.fn()}
      />
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText.props).toStrictEqual(withEndChat.props);
  expect(confirmButtonText.type).toStrictEqual(withEndChat.type);
});

test('<CallTypeButtons> renders dialog with HANG UP button', () => {
  const form = {
    callType: {
      value: callTypes.child,
    },
  };
  const isCallTask = () => true;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={jest.fn()}
        changeRoute={jest.fn()}
        handleCompleteTask={jest.fn()}
      />
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText.props).toStrictEqual(withEndCall.props);
  expect(confirmButtonText.type).toStrictEqual(withEndCall.type);
});

test('<CallTypeButtons> click on CallType button', () => {
  const form = {
    callType: {
      value: callTypes.child,
    },
  };
  const isCallTask = () => false;

  const handleCallTypeButtonClick = jest.fn();
  const changeRoute = jest.fn();

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={handleCallTypeButtonClick}
        changeRoute={changeRoute}
        handleCompleteTask={jest.fn()}
      />
    </LocalizationContext.Provider>,
  ).root;

  component.findAllByType(DataCallTypeButton)[0].props.onClick();

  expect(handleCallTypeButtonClick).toHaveBeenCalledWith(task.taskSid, callTypes.child);
  expect(changeRoute).toHaveBeenCalledWith({ route: 'tabbed-forms' }, task.taskSid);
});

test('<CallTypeButtons> click on END CHAT button', async () => {
  const form = {
    callType: {
      value: '',
    },
  };
  const isCallTask = () => false;

  const handleCallTypeButtonClick = jest.fn();
  const changeRoute = jest.fn();
  const handleCompleteTask = jest.fn();

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={handleCallTypeButtonClick}
        changeRoute={changeRoute}
        handleCompleteTask={handleCompleteTask}
      />
    </LocalizationContext.Provider>,
  ).root;

  await component.findByType(ConfirmButton).props.onClick();

  expect(handleCallTypeButtonClick).not.toHaveBeenCalled();
  expect(changeRoute).not.toHaveBeenCalled();
  expect(handleCompleteTask).toHaveBeenCalledWith(task.taskSid, task);
});

test('<CallTypeButtons> click on CANCEL button', () => {
  const form = {
    callType: {
      value: '',
    },
  };
  const isCallTask = () => false;

  const handleCallTypeButtonClick = jest.fn();
  const changeRoute = jest.fn();
  const handleCompleteTask = jest.fn();

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={handleCallTypeButtonClick}
        changeRoute={changeRoute}
        handleCompleteTask={handleCompleteTask}
      />
    </LocalizationContext.Provider>,
  ).root;

  component.findByType(CancelButton).props.onClick();

  expect(handleCallTypeButtonClick).toHaveBeenCalledWith(task.taskSid, '');
  expect(changeRoute).not.toHaveBeenCalled();
  expect(handleCompleteTask).not.toHaveBeenCalled();
});
