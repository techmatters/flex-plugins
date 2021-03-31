enum InsightsObject {
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
type InsightsSubFormSpec = InsightsFieldSpec[];
export type InsightsFormSpec = { [key: string]: InsightsSubFormSpec };
// Each of this ConfigSpec maps one form field to one insights attribute
export type OneToOneConfigSpec = {
  contactForm?: InsightsFormSpec;
  caseForm?: InsightsFormSpec;
};

// Each of this ConfigSpec maps (possibly) many form field to one insights attribute
export type OneToManyConfigSpec = {
  insightsObject: InsightsObject; // In which attributes object this goes
  attributeName: string; // Which name the property receives in above object
  paths: string[]; // Array of paths to grab and concatenate to drop in above property
};
export type OneToManyConfigSpecs = OneToManyConfigSpec[];
