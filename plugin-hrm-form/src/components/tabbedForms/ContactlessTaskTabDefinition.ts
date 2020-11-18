import { channelTypes, otherContactChannels } from '../../states/DomainConstants';
import type { FormDefinition } from '../common/forms/types';
import { mapChannelForInsights } from '../../utils/mappers';

const channelOptions = [{ value: '', label: '' }].concat(
  [...Object.values(channelTypes), ...Object.values(otherContactChannels)].map(s => ({
    label: mapChannelForInsights(s),
    value: s,
  })),
);

export const formDefinition: FormDefinition = [
  {
    name: 'channel',
    type: 'select',
    label: 'Channel',
    options: channelOptions,
    required: { value: true, message: 'RequiredFieldError' },
  },
  {
    name: 'date',
    type: 'date-input',
    label: 'Date of Contact',
    required: { value: true, message: 'RequiredFieldError' },
  },
  {
    name: 'time',
    type: 'time-input',
    label: 'Time of Contact',
    required: { value: true, message: 'RequiredFieldError' },
  },
];
