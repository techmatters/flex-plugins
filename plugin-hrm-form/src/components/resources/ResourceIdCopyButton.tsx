import * as React from 'react';
import { Button } from '@twilio/flex-ui';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';
import CheckIcon from '@material-ui/icons/CheckCircle';
import { useState } from 'react';

type OwnProps = {
  resourceId: string;
};

const ResourceIdCopyButton: React.FC<OwnProps> = ({ resourceId }) => {
  const [justCopied, setJustCopied] = useState(false);

  const copyClicked = () => {
    navigator.clipboard.writeText(resourceId);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  return justCopied ? (
    <Button type="button">
      <CheckIcon /> Copied!
    </Button>
  ) : (
    <Button type="button" onClick={copyClicked}>
      <CopyIcon /> Copy ID #{resourceId}
    </Button>
  );
};

ResourceIdCopyButton.displayName = 'ResourceIdCopyButton';

export default ResourceIdCopyButton;
