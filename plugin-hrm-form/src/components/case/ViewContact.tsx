/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { Container, Row, HiddenText, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { CaseContainer, CaseActionTitle, CaseActionDetailFont } from '../../styles/case';
import { namespace, connectedCaseBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import ContactDetails from '../ContactDetails';
import { ViewContact as ViewContactType } from '../../states/case/types';

type OwnProps = {
  task: ITask;
};

const contact = {
  contactId: 971,
  counselor: 'Murilo OKTA Machado',
  overview: {
    dateTime: '2020-04-09T18:54:58.497Z',
    name: 'James Bond',
    customerNumber: 'Anonymous',
    callType: 'Someone calling about a child',
    categories: {
      category1: ['sub1'],
      category2: ['sub2'],
      category3: ['sub3'],
    },
    counselor: 'WKd3d289370720216aab7e3db023e80f3e',
    notes: 'Lorem Ipsum Bond',
    channel: 'web',
    conversationDuration: null,
  },
  details: {
    childInformation: {
      name: {
        firstName: 'James',
        lastName: 'Bond',
      },
      gender: 'boy',
      age: '03-06',
      language: 'language1',
      nationality: 'nationality1',
      ethnicity: 'ethnicity1',
      location: {
        streetAddress: 'Orange St',
        city: 'San Francisco',
        stateOrCounty: 'CA',
        postalCode: '51011',
        phone1: '2025550134',
        phone2: '2025550134',
      },
      refugee: false,
      disabledOrSpecialNeeds: false,
      hiv: false,
      school: {
        name: 'Orange School',
        gradeLevel: 'Third Grade',
      },
    },
    caseInformation: {
      callSummary: 'Summary',
      referredTo: 'Referral 1',
      status: 'Oopen',
      keepConfidential: false,
      okForCaseWorkerToCall: true,
      howDidTheChildHearAboutUs: 'Media',
      didYouDiscussRightsWithTheChild: true,
      didTheChildFeelWeSolvedTheirProblem: false,
      wouldTheChildRecommendUsToAFriend: true,
    },
    callerInformation: {
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
      relationshipToChild: 'Neighbor',
      gender: 'boy',
      age: '16-18',
      language: 'language1',
      nationality: 'nationality1',
      ethnicity: 'ethnicity1',
      location: {
        streetAddress: 'Orange St',
        city: 'San Francisco',
        stateOrCounty: 'CA',
        postalCode: '51011',
        phone1: '2025550134',
        phone2: '2025550134',
      },
    },
  },
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({ task, changeRoute, detailsExpanded, updateTempInfo }) => {
  const handleClose = () => changeRoute({ route: 'new-case' }, task.taskSid);

  const handleExpandDetailsSection = section => {
    const updatedDetailsExpanded = {
      ...detailsExpanded,
      [section]: !detailsExpanded[section],
    };
    const tempInfo = { detailsExpanded: updatedDetailsExpanded };
    updateTempInfo(tempInfo, task.taskSid);
  };

  return (
    <CaseContainer>
      <Container>
        <Row>
          <CaseActionTitle style={{ marginTop: 'auto' }}>View Contact</CaseActionTitle>
          <ButtonBase onClick={handleClose} style={{ marginLeft: 'auto' }}>
            <HiddenText>
              <Template code="Case-CloseButton" />
            </HiddenText>
            <Close />
          </ButtonBase>
        </Row>
        <Row>
          <CaseActionDetailFont style={{ marginRight: 20 }}>
            <Template code="Case-AddNoteAdded" /> 01/01/01
          </CaseActionDetailFont>
          <CaseActionDetailFont style={{ marginRight: 20 }}>
            <Template code="Case-AddNoteCounselor" /> counselor-name
          </CaseActionDetailFont>
        </Row>
        <ContactDetails
          contact={contact}
          detailsExpanded={detailsExpanded}
          handleExpandDetailsSection={handleExpandDetailsSection}
        />
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={handleClose}>
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseContainer>
  );
};

ViewContact.displayName = 'ViewContact';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const { detailsExpanded } = caseState.tasks[ownProps.task.taskSid].temporaryCaseInfo as ViewContactType;

  return { detailsExpanded };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
