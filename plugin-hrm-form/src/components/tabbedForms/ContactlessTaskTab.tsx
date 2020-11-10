/* eslint-disable react/prop-types */
import React from 'react';
import { TextField } from '@material-ui/core';

import FieldText from '../FieldText';
import FieldSelect from '../FieldSelect';
import FieldDate from '../FieldDate';
import { channelTypes } from '../../states/DomainConstants';
import { DefaultEventHandlers } from '../common/forms/types';
import { Container, StyledNextStepButton, Row, BottomButtonBar, ColumnarBlock } from '../../styles/HrmStyles';

const channelsArray = Object.values(channelTypes);

type OwnProps = {
  defaultEventHandlers: DefaultEventHandlers;
  contactlessTask: any;
};

type Props = OwnProps;

const ContactlessTaskTab: React.FC<Props> = ({ defaultEventHandlers, contactlessTask }) => {
  return (
    <Container>
      <ColumnarBlock>
        <FieldSelect
          id="ContactlessTask_Channel"
          label="Channel"
          field={contactlessTask.channel}
          options={['', ...channelsArray]}
          {...defaultEventHandlers(['contactlessTask'], 'channel')}
        />
        <FieldDate
          id="ContactlessTask_Date"
          label="Date of Contact"
          field={contactlessTask.date}
          {...defaultEventHandlers(['contactlessTask'], 'date')}
        />
        <TextField
          id="ContactlessTask_Time"
          label="Time of Contact"
          type="time"
          defaultValue="07:30"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300, // 5 min
          }}
          onChange={defaultEventHandlers(['contactlessTask'], 'time').handleChange}
        />
      </ColumnarBlock>
    </Container>
  );
};

ContactlessTaskTab.displayName = 'ContactlessTaskTab';

export default ContactlessTaskTab;
