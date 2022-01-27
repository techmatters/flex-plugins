import twilio from 'twilio';
import { logWarning } from '../../helpers/log';

type FieldValueRegexCaptures = {
  resourceName: string;
  assistantSid: string;
  fieldTypeSid: string;
  fieldValues: string;
};

export async function findFieldValueSids(
  client: twilio.Twilio,
  rawCaptures: Record<string, string>,
): Promise<string[]> {
  const captures: FieldValueRegexCaptures = <FieldValueRegexCaptures>rawCaptures;
  const assistant = await client.autopilot.assistants(captures.assistantSid);
  // eslint-disable-next-line no-await-in-loop
  const assistantInstance = await assistant.fetch();
  // eslint-disable-next-line no-await-in-loop
  const fieldTypeInstance = await assistant.fieldTypes(captures.fieldTypeSid).fetch();
  const values: string[] = JSON.parse(captures.fieldValues);

  // eslint-disable-next-line no-await-in-loop
  const fieldValueList = await fieldTypeInstance.fieldValues().list();
  return values
    .map((val) => {
      const valueInstance = fieldValueList.find((fv) => fv.value === val);
      if (valueInstance) {
        return `${assistantInstance.sid}/${fieldTypeInstance.sid}/${valueInstance}`;
      }
      logWarning(
        `Field value '${val}' not currently present in field type '${fieldTypeInstance.uniqueName}' for assistant '${assistantInstance.uniqueName}', skipping import`,
      );
      return '';
    })
    .filter((v) => v.length);
}

type FieldTypeRegexCaptures = {
  resourceName: string;
  assistantSid: string;
  uniqueName: string;
};

export async function findFieldTypeSids(
  client: twilio.Twilio,
  rawCaptures: Record<string, string>,
): Promise<string[]> {
  const captures: FieldTypeRegexCaptures = <FieldTypeRegexCaptures>rawCaptures;
  const assistant = await client.autopilot.assistants(captures.assistantSid);
  // eslint-disable-next-line no-await-in-loop
  const assistantInstance = await assistant.fetch();
  // eslint-disable-next-line no-await-in-loop
  const fieldTypeListInstance = await assistantInstance.fieldTypes().list();

  return fieldTypeListInstance
    .filter((ft) => ft.uniqueName === captures.uniqueName)
    .map((ft) => `${assistantInstance.sid}/${ft.sid}`);
}
