import React from 'react';
import { Button, Popover } from '@material-ui/core';
import GridIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/List';
import { Template } from '@twilio/flex-ui';
import { CategoriesDefinition } from 'hrm-form-definitions';

import { Row } from '../../styles/HrmStyles';
import { ConfirmContainer, ConfirmText, CancelButton } from '../../styles/search';
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
