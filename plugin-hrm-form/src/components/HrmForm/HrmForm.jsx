import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { HrmFormComponentStyles } from './HrmForm.Styles';

const renderSelect = ({
  input,
  label,
  type,
  options,
  meta: { touched, error, warning }
}) => (
  <div>
    <label>{label}</label>
    <div>
      <select {...input} >
        <option value="" disabled selected>{label}</option>
        {options.map(val => {
          return (<option value={val}>{val}</option>)
        })}
      </select>
      {touched && error && <span>{error}</span>}
    </div>
  </div>
)

const nonEmpty = value => (value ? undefined : 'Required')

let HrmForm = props => {
  const { handleSubmit } = props;
  return (
    <HrmFormComponentStyles>
      <form onSubmit={handleSubmit}>
        <div>
          <Field
            name="ageBracket"
            component={renderSelect}
            label="AgeBracket"
            validate={nonEmpty}
            options={["0-3", "4-6", "7-9", "10-12", "13-15", "16-17", "18-25"]}
          />
          <Field
            name="subcategory"
            component={renderSelect}
            label="Subcategory"
            validate={nonEmpty}
            options={[
              "Emotional abuse",
              "Gang violence",
              "Emotional Bullying",
              "Physical Bullying",
              "Alcohol addiction",
              "Alcohol experimentation",
              "Access to HIV/AIDS Medication and Healthcare",
              "Child living with HIV/AIDS"
            ]}
          />
        </div>
        <button type="submit" disabled={!props.valid}>COMPLETE</button>
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
