import React from 'react';

const initialState = { hrmBaseUrl: '', workerSid: '', helpline: '' };
const ConfigurationContext = React.createContext(initialState);
ConfigurationContext.displayName = 'ConfigurationContext';

export const withConfiguration = Component => {
  const ConfiguredComponent = props => (
    <ConfigurationContext.Consumer>
      {configValues => <Component {...props} {...configValues} />}
    </ConfigurationContext.Consumer>
  );
  ConfiguredComponent.displayName = 'ConfiguredComponent';
  return ConfiguredComponent;
};

export default ConfigurationContext;
