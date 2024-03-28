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

/* eslint-disable import/no-unused-modules */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import FolderIcon from '@material-ui/icons/CreateNewFolderOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

/**
 * Annoying Limitation:
 * - default import does not generate control options quite right
 * - so we have to use named import
 * - this might be fixed in future versions of storybook
 * - or we might be misusing storybook somehow?
 */
import { Button, Props } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj & { args: Omit<Props, 'onClick'> };

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    label: 'Button',
    disabled: false,
    isLoading: false,
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'medium',
    label: 'Button',
    disabled: false,
    isLoading: false,
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    size: 'medium',
    label: 'Button',
    disabled: false,
    isLoading: false,
  },
};

export const withIcons: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    label: 'Button',
    disabled: false,
    isLoading: false,
  },
  render: (args: Props) => 
    <Button
      {...args}
      iconLeft={
        <FolderIcon style={{ fontSize: '16px', marginRight: '15px', width: '16px', height: '16px' }}/>
      }
      iconRight={
        <KeyboardArrowDownIcon style={{ fontSize: '20px', marginLeft: '15px', width: '16px', height: '16px' }} />
      }
    />,
};
