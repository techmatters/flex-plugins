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

import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { RECAPTCHA_KEY } from '../../../private/secret';
import { validateUser } from './recaptchaValidation';

type Props = {
  onRecaptchaChange: (verified: boolean) => void;
};

const ReCaptcha: React.FC<Props> = ({ onRecaptchaChange }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const onChange = async (token: string | null) => {
    const verified = token !== null;
    onRecaptchaChange(verified);

    if (verified) {
      try {
        await validateUser(token ?? '');
      } catch (error) {
        console.log(error);
      }
    }
  };

  return <ReCAPTCHA sitekey={RECAPTCHA_KEY} size="normal" ref={recaptchaRef} onChange={onChange} />;
};

export default ReCaptcha;
