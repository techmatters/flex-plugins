import React from 'react';

const initialState = { hrmBaseUrl: '', workerSid: '', helpline: '' };
const ConfigurationContext = React.createContext(initialState);
ConfigurationContext.displayName = 'ConfigurationContext';

export const withConfiguration = Component => {
  const WrappedComponent = props => (
    <ConfigurationContext.Consumer>
      {configValues => <Component {...props} {...configValues} />}
    </ConfigurationContext.Consumer>
  );
  WrappedComponent.displayName = 'WrappedComponent';
  return WrappedComponent;
};

export default ConfigurationContext;
