import React from 'react';

const initialState = {
  hrmBaseUrl: '',
  serverlessBaseUrl: '',
  workerSid: '',
  helpline: '',
  currentWorkspace: '',

  /**
   * @return {string | null}
   * After plugin is initialized, returns valid JWT Twilio's token.
   */
  getSsoToken: () => null,
};

const ConfigurationContext = React.createContext(initialState);
ConfigurationContext.displayName = 'ConfigurationContext';

export const withConfiguration = Component => {
  const ConfiguredComponent = props => (
    <ConfigurationContext.Consumer>
      {context => <Component {...props} context={context} />}
    </ConfigurationContext.Consumer>
  );
  ConfiguredComponent.displayName = 'ConfiguredComponent';
  return ConfiguredComponent;
};

export default ConfigurationContext;
