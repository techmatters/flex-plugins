import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { HrmFormComponentStyles } from './HrmForm.Styles';

let HrmForm = props => {
  const { handleSubmit } = props;
  return (
    <HrmFormComponentStyles>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Age Bracket</label>
          <div>
            <Field name="ageBracket" component="select">
              <option></option>
              <option value="0-3">0-3</option>
              <option value="4-6">4-6</option>
              <option value="7-9">7-9</option>
              <option value="10-12">10-12</option>
              <option value="13-15">13-15</option>
              <option value="16-17">16-17</option>
              <option value="18-25">18-25</option>
              <option value=">25">>25</option>
              <option value="Unknown">Unknown</option>
            </Field>
          </div>
          <label>Subcategory</label>
          <div>
            <Field name="subcategory" component="select">
              <option></option>
              <option value="Emotional abuse">Emotional abuse</option>
              <option value="Gang violence">Gang violence</option>
              <option value="Emotional Bullying">Emotional Bullying</option>
              <option value="Physical Bullying">Physical Bullying</option>
              <option value="Alcohol addiction">Alcohol addiction</option>
              <option value="Alcohol experimentation">Alcohol experimentation</option>
              <option value="Access to HIV/AIDS Medication and Healthcare">Access to HIV/AIDS Medication and Healthcare</option>
              <option value="Child living with HIV/AIDS">Child living with HIV/AIDS</option>
            </Field>
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
    </HrmFormComponentStyles>
  );
}

const getFormState = state => {
  return state.hrmform.form;
}

HrmForm = reduxForm({
  form: "hrm",
  getFormState: getFormState
})(HrmForm);

export default HrmForm;
