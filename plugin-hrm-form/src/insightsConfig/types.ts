export enum InsightsObject {
  Customers = 'customers',
  Conversations = 'conversations',
}
export enum FieldType {
  MixedCheckbox = 'mixed-checkbox',
}
export type InsightsFieldSpec = {
  name: string;
  insights: [InsightsObject, string];
  type?: FieldType;
};
export type InsightsSubFormSpec = InsightsFieldSpec[];
export type InsightsFormSpec = { [key: string]: InsightsSubFormSpec };
export type InsightsConfigSpec = {
  contactForm?: InsightsFormSpec;
  caseForm?: InsightsFormSpec;
};
