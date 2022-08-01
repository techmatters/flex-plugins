import { DefinitionVersionId, loadDefinition } from '../../formDefinition';

describe('loadDefiniton', () => {
  test.each(Object.values(DefinitionVersionId))(
    '%p - successfully loads basic structure',
    async () => {
      const definitions = await loadDefinition(DefinitionVersionId.v1);
      expect(definitions.cannedResponses).toContainEqual(expect.anything());
      expect(definitions.callTypeButtons).toContainEqual(expect.anything());

      expect(definitions.caseForms).toMatchObject({
        DocumentForm: expect.anything(),
        HouseholdForm: expect.anything(),
        IncidentForm: expect.anything(),
        NoteForm: expect.anything(),
        PerpetratorForm: expect.anything(),
        ReferralForm: expect.anything(),
        CaseSummaryForm: expect.anything(),
      });
      expect(definitions.tabbedForms).toMatchObject({
        CallerInformationTab: expect.anything(),
        CaseInformationTab: expect.anything(),
        ChildInformationTab: expect.anything(),
        IssueCategorizationTab: expect.any(Function),
      });
      expect(definitions.caseStatus).toEqual(expect.anything());
      expect(definitions.layoutVersion).toMatchObject({
        contact: expect.anything(),
        case: expect.anything(),
      });
      expect(definitions.helplineInformation).toMatchObject({
        helplines: expect.arrayContaining([expect.anything()]),
        label: expect.any(String),
      });
    },
  );
});
