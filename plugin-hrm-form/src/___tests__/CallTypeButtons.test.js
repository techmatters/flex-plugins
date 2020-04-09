import React from 'react';
import renderer from 'react-test-renderer';

import './mockStyled';
import CallTypeButtons from '../components/CallTypeButtons';
import { DataCallTypeButton, NonDataCallTypeButton, ConfirmButton, CancelButton } from '../Styles/callTypeButtons';
import LocalizationContext from '../contexts/LocalizationContext';
import callTypes from '../states/DomainConstants';

const task = {
  taskSid: 'task-sid',
};

const strings = {
  TaskHeaderEndCall: 'HANG UP',
  TaskHeaderEndChat: 'END CHAT',
};

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
      <CallTypeButtons form={form} task={task} handleCallTypeButtonClick={jest.fn()} handleSubmit={jest.fn()} />
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
      <CallTypeButtons form={form} task={task} handleCallTypeButtonClick={jest.fn()} handleSubmit={jest.fn()} />
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText).toEqual(strings.TaskHeaderEndChat);
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
      <CallTypeButtons form={form} task={task} handleCallTypeButtonClick={jest.fn()} handleSubmit={jest.fn()} />
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText).toEqual(strings.TaskHeaderEndCall);
});

test('<CallTypeButtons> click on CallType button', () => {
  const form = {
    callType: {
      value: callTypes.child,
    },
  };
  const isCallTask = () => false;

  const handleCallTypeButtonClick = jest.fn();
  const handleSubmit = jest.fn();

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={handleCallTypeButtonClick}
        handleSubmit={jest.fn()}
      />
    </LocalizationContext.Provider>,
  ).root;

  component.findAllByType(DataCallTypeButton)[0].props.onClick();

  expect(handleCallTypeButtonClick).toHaveBeenCalledWith(task.taskSid, callTypes.child);
  expect(handleSubmit).not.toHaveBeenCalled();
});

test('<CallTypeButtons> click on END CHAT button', () => {
  const form = {
    callType: {
      value: '',
    },
  };
  const isCallTask = () => false;

  const handleCallTypeButtonClick = jest.fn();
  const handleSubmit = jest.fn();

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={handleCallTypeButtonClick}
        handleSubmit={handleSubmit}
      />
    </LocalizationContext.Provider>,
  ).root;

  component.findByType(ConfirmButton).props.onClick();

  expect(handleCallTypeButtonClick).not.toHaveBeenCalled();
  expect(handleSubmit).toHaveBeenCalled();
});

test('<CallTypeButtons> click on CANCEL button', () => {
  const form = {
    callType: {
      value: '',
    },
  };
  const isCallTask = () => false;

  const handleCallTypeButtonClick = jest.fn();
  const handleSubmit = jest.fn();

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <CallTypeButtons
        form={form}
        task={task}
        handleCallTypeButtonClick={handleCallTypeButtonClick}
        handleSubmit={handleSubmit}
      />
    </LocalizationContext.Provider>,
  ).root;

  component.findByType(CancelButton).props.onClick();

  expect(handleCallTypeButtonClick).toHaveBeenCalledWith(task.taskSid, '');
  expect(handleSubmit).not.toHaveBeenCalled();
});
