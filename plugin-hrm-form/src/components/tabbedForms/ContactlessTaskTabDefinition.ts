/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { isFuture, parse } from 'date-fns';
import { DefinitionVersion, FormDefinition, FormInputType } from 'hrm-form-definitions';

import { coreChannelTypes } from '../../states/DomainConstants';
import { mapChannelForInsights } from '../../utils';
import type { CounselorsList } from '../../states/configuration/types';

const defaultChannelOptions = [{ value: '', label: '' }].concat(
  Object.values(coreChannelTypes).map(s => ({
    label: mapChannelForInsights(s),
    value: s,
  })),
);

export const createContactlessTaskTabDefinition = ({
  counselorsList,
  helplineInformation,
  definition,
}: {
  counselorsList: CounselorsList;
  helplineInformation: DefinitionVersion['helplineInformation'];
  definition: DefinitionVersion['tabbedForms']['ContactlessTaskTab'];
}): FormDefinition => {
  const counsellorOptions = [
    { label: '', value: '' },
    ...counselorsList.map(c => ({ label: c.fullName, value: c.sid })),
  ];

  const helplineLabel = helplineInformation.label;
  const mapHelplineEntriesToOptions = ({ value, label }) => ({ value, label });
  const helplineOptions = helplineInformation.helplines.map(mapHelplineEntriesToOptions);
  const defaultHelplineOption = (
    helplineInformation.helplines.find(helpline => helpline.default) || helplineInformation.helplines[0]
  ).value;

  const channelOptions = definition.offlineChannels
    ? defaultChannelOptions.concat(definition.offlineChannels.map(c => ({ value: c, label: c })))
    : defaultChannelOptions;

  return [
    {
      name: 'channel',
      type: FormInputType.Select,
      label: 'Channel',
      options: channelOptions,
      required: { value: true, message: 'RequiredFieldError' },
    },
    {
      name: 'createdOnBehalfOf',
      type: FormInputType.Select,
      label: 'Counsellor',
      options: counsellorOptions,
      // defaultOption: workerSid,
      required: { value: true, message: 'RequiredFieldError' },
    },
    {
      name: 'date',
      type: FormInputType.DateInput,
      label: 'Date of Contact',
      initializeWithCurrent: true,
      required: { value: true, message: 'RequiredFieldError' },
      validate: date => {
        const inputDate = parse(date, 'yyyy-MM-dd', new Date());

        // Date is lesser than Unix epoch (00:00:00 UTC on 1 January 1970)
        if (inputDate.getTime() < 0) return 'DateCantBeLesserThanEpoch';

        // Date is greater than "today"
        if (isFuture(inputDate)) return 'DateCantBeGreaterThanToday';

        return null;
      },
    },
    {
      name: 'time',
      type: FormInputType.TimeInput,
      label: 'Time of Contact',
      initializeWithCurrent: true,
      required: { value: true, message: 'RequiredFieldError' },
    },
    {
      name: 'helpline',
      label: helplineLabel,
      type: FormInputType.Select,
      defaultOption: defaultHelplineOption,
      options: helplineOptions,
      required: { value: true, message: 'RequiredFieldError' },
    },
  ];
};
