import { FormValues, isFormFieldType } from './types';
import { isNotCategory } from '../../../states/ContactFormStateFactory';

export const getFormValues = <T>(formInformation: T): FormValues<T> => {
  const values = Object.keys(formInformation).reduce((accum, key) => {
    // do not iterate over metadata
    if (isNotCategory(key)) return accum;

    if (isFormFieldType(formInformation[key])) return { ...accum, [key]: formInformation[key].value };

    return { ...accum, [key]: getFormValues(formInformation[key]) };
  }, {} as FormValues<T>);

  return values;
};

/*
 * TODO: clean up this function (if getFormValues is working as expected after some time testing)
 *
 * export function getCallerFormValues(callerFormInformation: CallerFormInformation): CallerFormValues {
 *   const { age, ethnicity, gender, language, location, name, nationality, relationshipToChild } = callerFormInformation;
 *   const { city, phone1, phone2, postalCode, stateOrCounty, streetAddress } = location;
 *   const { firstName, lastName } = name;
 */

/*
 *   return {
 *     name: { firstName: firstName.value, lastName: lastName.value },
 *     location: {
 *       city: city.value,
 *       phone1: phone1.value,
 *       phone2: phone2.value,
 *       postalCode: postalCode.value,
 *       stateOrCounty: stateOrCounty.value,
 *       streetAddress: streetAddress.value,
 *     },
 *     age: age.value,
 *     ethnicity: ethnicity.value,
 *     gender: gender.value,
 *     language: language.value,
 *     nationality: nationality.value,
 *     relationshipToChild: relationshipToChild.value,
 *   };
 * }
 */
