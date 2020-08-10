import { CallerFormInformation, CallerFormValues } from './CallerForm';

export function getCallerFormValues(callerFormInformation: CallerFormInformation): CallerFormValues {
  const { age, ethnicity, gender, language, location, name, nationality, relationshipToChild } = callerFormInformation;
  const { city, phone1, phone2, postalCode, stateOrCounty, streetAddress } = location;
  const { firstName, lastName } = name;

  return {
    name: { firstName: firstName.value, lastName: lastName.value },
    location: {
      city: city.value,
      phone1: phone1.value,
      phone2: phone2.value,
      postalCode: postalCode.value,
      stateOrCounty: stateOrCounty.value,
      streetAddress: streetAddress.value,
    },
    age: age.value,
    ethnicity: ethnicity.value,
    gender: gender.value,
    language: language.value,
    nationality: nationality.value,
    relationshipToChild: relationshipToChild.value,
  };
  /*
   * const values = Object.keys(formInformation).reduce((accum, key) => {
   *   if (isFormFieldType(formInformation[key])) return { ...accum, [key]: formInformation[key].value };
   */
  /*
   *   return { ...accum, [key]: getFormValues(formInformation[key] as FormInformation) };
   * }, {} as FormValues<FormInformation>);
   */
  // return values;
}
