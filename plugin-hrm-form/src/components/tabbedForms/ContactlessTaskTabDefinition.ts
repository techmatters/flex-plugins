import { isFuture } from 'date-fns';

import { channelTypes, otherContactChannels } from '../../states/DomainConstants';
import type { FormDefinition, HelplineDefinitions } from '../common/forms/types';
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

export const createContactlessTaskTabDefinition = (
  counselorsList: CounselorsList,
  helplineDefinitions: HelplineDefinitions,
): FormDefinition => {
  const { workerSid } = getConfig();
  const counsellorOptions = [
    { label: '', value: '' },
    ...counselorsList.map(c => ({ label: c.fullName, value: c.sid })),
  ];

  const helplineLabel = helplineDefinitions.label;
  const mapHelplineEntriesToOptions = ({ value, label }) => ({ value, label });
  const helplineOptions = helplineDefinitions.helplines.map(mapHelplineEntriesToOptions);
  const defaultHelplineOption = (
    helplineDefinitions.helplines.find(helpline => helpline.default) || helplineDefinitions.helplines[0]
  ).value;

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
    {
      name: 'helpline',
      label: helplineLabel,
      type: 'select',
      defaultOption: defaultHelplineOption,
      options: helplineOptions,
      required: { value: true, message: 'RequiredFieldError' },
    },
  ];
};
