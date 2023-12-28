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
import React from 'react';
import { Button, Popover } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { Row } from '../../styles';
import { ConfirmContainer, ConfirmText, CancelButton } from '../search/styles';
import TabPressWrapper from '../TabPressWrapper';

type Props = {
  toolkitUrl: string;
  anchorEl: Element;
  handleCloseDialog: () => void;
  helplineName: string;
};

const CounselorToolkitDialog: React.FC<Props> = ({ anchorEl, handleCloseDialog, toolkitUrl, helplineName }) => {
  const isOpen = Boolean(anchorEl);
  const id = isOpen ? 'simple-popover' : undefined;

  return (
    <Popover
      id={id}
      open={isOpen}
      anchorReference="anchorPosition"
      anchorPosition={{ top: 200, left: 400 }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <TabPressWrapper>
        <ConfirmContainer>
          <ConfirmText>
            <Template code="Toolkit-ConfirmTextOne" helpline={helplineName} />
          </ConfirmText>
          <ConfirmText>
            <Template code="Toolkit-ConfirmTextTwo" />
          </ConfirmText>
          <Row>
            <CancelButton tabIndex={2} variant="text" size="medium" onClick={handleCloseDialog}>
              <Template code="SectionEntry-No" />
            </CancelButton>
            <Button
              href={toolkitUrl}
              onClick={handleCloseDialog}
              target="_blank"
              rel="noreferrer"
              tabIndex={1}
              variant="contained"
              size="medium"
              style={{ backgroundColor: '#000', color: '#fff', marginLeft: 20 }}
            >
              <Template code="SectionEntry-Yes" />
            </Button>
          </Row>
        </ConfirmContainer>
      </TabPressWrapper>
    </Popover>
  );
};

CounselorToolkitDialog.displayName = 'CounselorToolkitDialog';

// eslint-disable-next-line import/no-unused-modules
export default CounselorToolkitDialog;
