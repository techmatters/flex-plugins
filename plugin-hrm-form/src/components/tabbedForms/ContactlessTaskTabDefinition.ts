import { channelTypes } from '../../states/DomainConstants';
import type { FormDefinition } from '../common/forms/types';

const channelOptions = ['', ...Object.values(channelTypes)].map(s => ({ label: s, value: s }));

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
