/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';

const defaultValue = {
  state: { queuesStatus: null, error: 'No context provider suplied' },
  setState: undefined,
};

const { Provider, Consumer } = React.createContext(defaultValue);

const QueuesContextConsumer = Consumer;

export const withQueuesContext = Component => {
  const WithQueuesComponent = props => (
    <QueuesContextConsumer>{context => <Component {...props} queuesContext={context} />}</QueuesContextConsumer>
  );
  WithQueuesComponent.displayName = `WithQueues-${Component.displayName}`;
  return WithQueuesComponent;
};

export class QueuesContextProvider extends React.Component {
  static displayName = 'QueuesContextProvider';

  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  };

  state = {
    queuesStatus: null,
    error: null,
  };

  render() {
    return (
      <Provider
        value={{
          state: this.state,
          setState: this.setState.bind(this),
        }}
      >
        {this.props.children}
      </Provider>
    );
  }
}
