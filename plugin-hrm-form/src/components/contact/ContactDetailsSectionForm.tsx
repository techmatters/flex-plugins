/* eslint-disable react/prop-types */
import React, { Dispatch, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import type { FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import * as actions from '../../states/contacts/actions';
import { ColumnarBlock, Container, TwoColumnLayout, Box, BottomButtonBarHeight } from '../../styles/HrmStyles';
import { createFormFromDefinition, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import type { TaskEntry } from '../../states/contacts/reducer';
import useFocus from '../../utils/useFocus';

type OwnProps = {
  display?: boolean;
  definition?: FormDefinition;
  layoutDefinition?: LayoutDefinition;
  tabPath?: keyof TaskEntry;
  initialValues?:
    | TaskEntry['callerInformation']
    | TaskEntry['childInformation']
    | TaskEntry['caseInformation']
    | TaskEntry['externalReport']
    | FormDefinition;
  autoFocus?: boolean;
  externalReport?: string;
  extraChildrenRight?: React.ReactNode;
  updateFormActionDispatcher?: (dispatch: Dispatch<any>) => (values: any) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactDetailsSectionForm: React.FC<Props> = ({
  display,
  definition,
  layoutDefinition,
  tabPath,
  initialValues,
  autoFocus,
  updateForm,
  extraChildrenRight,
  externalReport,
}) => {
  const shouldFocusFirstElement = display && autoFocus;
  const firstElementRef = useFocus(shouldFocusFirstElement);

  const [initialForm] = React.useState(initialValues); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const { getValues } = useFormContext();

  const [l, r] = React.useMemo(() => {
    const updateCallback = () => {
      updateForm(getValues());
    };

    const generatedForm = createFormFromDefinition(definition)([tabPath])(initialForm, firstElementRef)(updateCallback);

    const margin = 12;

    if (layoutDefinition && layoutDefinition.splitFormAt)
      return splitAt(layoutDefinition.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(margin)(generatedForm));
  }, [definition, getValues, initialForm, firstElementRef, layoutDefinition, tabPath, updateForm]);

  /*
   * const externalReportDefinition: FormDefinition = useMemo(() => {
   *   // eslint-disable-next-line react-hooks/exhaustive-deps
   */

  /*
   *   try {
   *     return [
   *       {
   *         name: 'reportType',
   *         label: 'Select CSAM report type',
   *         type: 'radio-input',
   *         options: [
   *           { value: 'childReport', label: 'Create link for child' },
   *           { value: 'counselorReport', label: 'Report as counselor' },
   *         ],
   *       },
   *     ];
   *   } catch (e) {
   *     console.error('Failed to render edit case summary form', e);
   *     return [];
   *   }
   * }, []);
   */

  // eslint-disable-next-line multiline-comment-style
  // // eslint-disable-next-line sonarjs/no-identical-functions
  // const [c, b] = React.useMemo(() => {
  //   const updateCallback = () => {
  //     updateForm(getValues());
  //   };

  /*
   *   const generatedForm = createFormFromDefinition(externalReportDefinition)([tabPath])(initialForm, firstElementRef)(
   *     updateCallback,
   *   );
   *   return splitAt(2)(disperseInputs(7)(generatedForm));
   * }, [externalReportDefinition, tabPath, initialForm, firstElementRef, updateForm, getValues]);
   */

  // console.log('externalReport here', externalReport);

  /*
   * if (externalReport === 'externalReport') {
   *   return (
   *     <Container>
   *       <Box paddingBottom={`${BottomButtonBarHeight}px`}>
   *         <TwoColumnLayout>
   *           <ColumnarBlock>{c}</ColumnarBlock>
   *           <ColumnarBlock>{b}</ColumnarBlock>
   *         </TwoColumnLayout>
   *       </Box>
   *     </Container>
   *   );
   * }
   */
  /*
   * if (externalReport === 'externalReport') {
   *   return <div>Test here too</div>;
   * }
   */
  return (
    <Container>
      <Box paddingBottom={`${BottomButtonBarHeight}px`}>
        <TwoColumnLayout>
          <ColumnarBlock>{l}</ColumnarBlock>
          <ColumnarBlock>
            {r}
            {extraChildrenRight}
          </ColumnarBlock>
        </TwoColumnLayout>
      </Box>
    </Container>
  );
};

ContactDetailsSectionForm.displayName = 'TabbedFormTab';

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  updateForm: ownProps.updateFormActionDispatcher(dispatch),
});

const connector = connect(null, mapDispatchToProps);
const connected = connector(ContactDetailsSectionForm);

export default connected;
