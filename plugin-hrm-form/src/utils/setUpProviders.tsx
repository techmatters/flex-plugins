import React from 'react';
import { setProviders } from '@twilio/flex-ui';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';

export const setMUIProvider = () => {
  setProviders({
    CustomProvider: RootComponent => props => {
      return (
        <StylesProvider
          generateClassName={createGenerateClassName({
            productionPrefix: 'plugin-hrm-form',
            seed: 'plugin-hrm-form',
            // disableGlobal: true
          })}
        >
          <RootComponent {...props} />
        </StylesProvider>
      );
    },
  });
};
