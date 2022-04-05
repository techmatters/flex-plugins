/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormCheckbox, FormLabel } from '../../../styles/HrmStyles';

type Values = {
  [name: string]: boolean;
};

type OwnProps = {
  name: string;
  text: string;
  defaultValues: Values;
  withSearch?: boolean;
  openedFilter: string;
  applyFilter: (values: Values) => void;
  setOpenedFilter: (name: string) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const MultiSelectFilter: React.FC<Props> = ({
  name,
  text,
  defaultValues,
  openedFilter,
  applyFilter,
  setOpenedFilter,
}) => {
  const { register, handleSubmit, reset, getValues, setValue } = useForm({ defaultValues });
  const [selectedCount, setSelectedCount] = useState(0);

  const updateSelectedCount = data => {
    const countSelected = (count: number, value: boolean) => count + (value ? 1 : 0);
    const count = Object.values(data).reduce<number>(countSelected, 0);
    setSelectedCount(count);
  };

  const onSubmit = (data: Values) => {
    setOpenedFilter(null);
    updateSelectedCount(data);
    applyFilter(data);
  };

  const isOpened = name === openedFilter;

  const handleClick = () => {
    // Need to call reset so that React Hook Forms renders the new defaultValues
    reset(defaultValues);

    if (isOpened) {
      setOpenedFilter(null);
    } else {
      setOpenedFilter(name);
    }
  };

  const handleClear = () => {
    const values = getValues();
    const assignFalse = (acc: object, key: string) => ({ ...acc, [key]: false });
    const clearedValues: Values = Object.keys(values).reduce(assignFalse, {});
    reset(clearedValues);
  };

  const drawCount = () => (selectedCount === 0 ? '' : ` (${selectedCount})`);

  return (
    <div style={{ position: 'relative' }}>
      <div
        role="button"
        tabIndex={0}
        style={{
          display: 'inline-block',
          background: isOpened ? 'lightgray' : 'white',
          cursor: 'pointer',
          margin: '0 15px',
        }}
        onClick={handleClick}
      >
        {text}
        {drawCount()}
      </div>
      {isOpened && (
        <div
          style={{
            position: 'absolute',
            background: 'white',
            top: 30,
            left: -20,
            minWidth: 200,
            padding: '15px 5px',
            border: '1px solid lightgray',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <ul>
              {Object.keys(defaultValues).map((option, i) => {
                console.log(`${option}: ${defaultValues[option]}`);
                return (
                  <li key={i}>
                    <FormLabel htmlFor={option} style={{ flexDirection: 'row' }}>
                      <FormCheckbox
                        id={option}
                        name={option}
                        type="checkbox"
                        defaultChecked={defaultValues[option]}
                        innerRef={register}
                      />
                      {option}
                    </FormLabel>
                  </li>
                );
              })}
            </ul>
            <br />
            <button type="button" onClick={handleClear}>
              Clear
            </button>
            <button type="submit">Apply</button>
          </form>
        </div>
      )}
    </div>
  );
};

MultiSelectFilter.displayName = 'MultiSelectFilter';

export default MultiSelectFilter;
