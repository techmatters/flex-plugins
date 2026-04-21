/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { validateUser } from './recaptchaValidation';

type Props = {
  siteKey: string;
  recaptchaVerifyUrl: string;
  onRecaptchaChange: (verified: boolean) => void;
};

const ReCaptcha: React.FC<Props> = ({ siteKey, recaptchaVerifyUrl, onRecaptchaChange }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const onChange = async (token: string | null) => {
    if (token === null) {
      onRecaptchaChange(false);
      return;
    }

    try {
      const verified = await validateUser(token, recaptchaVerifyUrl);
      onRecaptchaChange(verified);
    } catch (error) {
      console.log(error);
      onRecaptchaChange(false);
    }
  };

  return <ReCAPTCHA sitekey={siteKey} size="normal" ref={recaptchaRef} onChange={onChange} />;
};

export default ReCaptcha;
