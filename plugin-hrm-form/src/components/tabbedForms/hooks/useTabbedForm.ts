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
import { FormProvider, useForm } from 'react-hook-form';

import { recordingErrorHandler } from '../../../fullStory';
import { getTemplateStrings } from '../../../hrmConfig';

const useTabbedForm = () => {
  const strings = getTemplateStrings();

  const methods = useForm({
    shouldFocusError: false,
    mode: 'onChange',
  });

  const onError = recordingErrorHandler('Tabbed HRM Form', () => {
    window.alert(strings['Error-Form']);
  });

  const newSubmitHandler = (successHandler: () => Promise<void>) => {
    return methods.handleSubmit(successHandler, onError);
  };

  return { methods, strings, FormProvider, onError, newSubmitHandler };
};

export default useTabbedForm;
