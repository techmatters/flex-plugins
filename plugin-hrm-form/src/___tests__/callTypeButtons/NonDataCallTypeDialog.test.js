import React from 'react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider as MaterialStorelessThemeProvider } from '@twilio/flex-ui';

import HrmTheme from '../../styles/HrmTheme';
import NonDataCallTypeDialog from '../../components/callTypeButtons/NonDataCallTypeDialog';

expect.extend(toHaveNoViolations);

test('a11y', async () => {
  const themeConf = {
    colorTheme: HrmTheme,
  };

  const wrapper = mount(
    <MaterialStorelessThemeProvider themeConf={themeConf}>
      <NonDataCallTypeDialog
        isOpen={true}
        confirmLabel="End Chat"
        handleConfirm={() => null}
        handleCancel={() => null}
      />
    </MaterialStorelessThemeProvider>,
  );

  const rules = {
    tabindex: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
