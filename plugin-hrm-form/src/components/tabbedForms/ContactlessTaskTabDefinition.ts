import { isFuture } from 'date-fns';

import { channelTypes, otherContactChannels } from '../../states/DomainConstants';
import type { FormDefinition } from '../common/forms/types';
import { mapChannelForInsights } from '../../utils/mappers';
import { splitDate } from '../../utils/helpers';
import type { CounselorsList } from '../../states/configuration/types';
import { getConfig } from '../../HrmFormPlugin';

const channelOptions = [{ value: '', label: '' }].concat(
  [...Object.values(channelTypes), ...Object.values(otherContactChannels)].map(s => ({
    label: mapChannelForInsights(s),
    value: s,
  })),
);

export const createFormDefinition = (counselorsList: CounselorsList): FormDefinition => {
  const { workerSid } = getConfig();
  const counsellorOptions = [
    { label: '', value: '' },
    ...counselorsList.map(c => ({ label: c.fullName, value: c.sid })),
  ];

  return [
    {
      name: 'channel',
      type: 'select',
      label: 'Channel',
      options: channelOptions,
      required: { value: true, message: 'RequiredFieldError' },
    },
    {
      name: 'createdOnBehalfOf',
      type: 'select',
      label: 'Counsellor',
      options: counsellorOptions,
      defaultOption: workerSid,
      required: { value: true, message: 'RequiredFieldError' },
    },
    {
      name: 'date',
      type: 'date-input',
      label: 'Date of Contact',
      required: { value: true, message: 'RequiredFieldError' },
      validate: date => {
        const [y, m, d] = splitDate(date);
        return isFuture(new Date(y, m - 1, d)) ? 'DateCantBeGreaterThanToday' : null;
      },
    },
    {
      name: 'time',
      type: 'time-input',
      label: 'Time of Contact',
      required: { value: true, message: 'RequiredFieldError' },
    },
  ];
};
