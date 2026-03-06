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

import React, { CSSProperties } from 'react';
import type { StyledProps } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { useExpandableOnOverflow } from '../../hooks/useExpandableOnOverflow';
import { StyledLink } from './styles';
import HrmTheme from '../../styles/HrmTheme';
import { Column } from '../../styles/layout';

export type ExpandableTextBlockProps = {
  expandLinkText: string;
  collapseLinkText: string;
  collapsedOverrides?: Partial<{
    linesPreview: number;
    whiteSpace: string;
    backgroundColor: string;
  }>;
  fontSize?: number;
  style?: CSSProperties;
};

const defaultCollapsedStyles = {
  linesPreview: 1,
  whiteSpace: 'nowrap',
  backgroundColor: HrmTheme.colors.base1,
};

const LINE_HEIGHT = 18;
const ExpandableTextBlock: React.FC<ExpandableTextBlockProps & Partial<StyledProps>> = ({
  children,
  expandLinkText,
  collapseLinkText,
  className,
  collapsedOverrides = {},
  style = {},
}) => {
  const {
    collapseButtonElementRef,
    expandButtonElementRef,
    handleCollapse,
    handleExpand,
    isExpanded,
    isOverflowing,
    overflowingRef,
  } = useExpandableOnOverflow({});
  const classes = [];
  if (className) {
    classes.push(className);
  }
  if (isExpanded) {
    classes.push('expanded');
  }

  const collapsedStyles = { ...defaultCollapsedStyles, ...collapsedOverrides };

  return (
    <div
      className={`${classes.join(' ')}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'stretch',
        textOverflow: 'ellipsis',
        ...style,
      }}
      ref={overflowingRef}
    >
      <div
        style={{
          textOverflow: 'inherit',
          whiteSpace: isOverflowing && !isExpanded ? collapsedStyles.whiteSpace : 'inherit',
          overflow: isOverflowing && !isExpanded ? 'hidden' : 'inherit',
          height: isExpanded ? 'inherit' : `${collapsedStyles.linesPreview * LINE_HEIGHT}px`,
          fontSize: `13px`,
          lineHeight: `${LINE_HEIGHT}px`,
          wordBreak: isExpanded ? 'break-word' : 'inherit',
        }}
      >
        <Column>
          {children}
          <StyledLink
            underline={true}
            type="button"
            onClick={handleCollapse}
            ref={collapseButtonElementRef}
            style={{
              display: isExpanded ? 'inline' : 'none',
              lineHeight: `${LINE_HEIGHT}px`,
              fontSize: `13px`,
              marginRight: 'auto',
            }}
          >
            <Template code={collapseLinkText} />
          </StyledLink>
        </Column>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: collapsedStyles.backgroundColor,
          opacity: 1,
          whiteSpace: 'nowrap',
          display: isOverflowing && !isExpanded ? 'inherit' : 'none',
          lineHeight: `${LINE_HEIGHT}px`,
          paddingLeft: '8px',
        }}
      >
        <StyledLink underline={true} onClick={handleExpand} ref={expandButtonElementRef} style={{ fontSize: `13px` }}>
          ...
          <Template code={expandLinkText} />
        </StyledLink>
      </div>
    </div>
  );
};

ExpandableTextBlock.displayName = 'ExpandableTextBlock';

export default ExpandableTextBlock;
