/* eslint-disable react/prop-types */
import React from 'react';

import { CallerForm, CallerFormProps } from '../common/forms';

const CallerInformationTab: React.FC<CallerFormProps> = ({ callerInformation, defaultEventHandlers }) => {
  // append callerInformation to the parents array (as caller form is used inside of the wider "contact form")
  const callerEventHandlers: CallerFormProps['defaultEventHandlers'] = (parents, name) =>
    defaultEventHandlers(['callerInformation', ...parents], name);

  return <CallerForm callerInformation={callerInformation} defaultEventHandlers={callerEventHandlers} />;
};

CallerInformationTab.displayName = 'CallerInformationTab';

export default CallerInformationTab;
