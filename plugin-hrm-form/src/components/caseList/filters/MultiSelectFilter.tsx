/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormCheckbox, FormLabel } from '../../../styles/HrmStyles';

export type Item = {
  value: string;
  label: string;
  checked: boolean;
};

type ReactHookFormValues = {
  [name: string]: boolean;
};

type OwnProps = {
  name: string;
  text: string;
  defaultValues: Item[];
  withSearch?: boolean;
  openedFilter: string;
  searchable?: boolean;
  applyFilter: (values: Item[]) => void;
  setOpenedFilter: (name: string) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const MultiSelectFilter: React.FC<Props> = ({
  name,
  text,
  defaultValues,
  openedFilter,
  searchable,
  applyFilter,
  setOpenedFilter,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const transformToItems = (values: ReactHookFormValues): Item[] =>
    defaultValues.map(item => ({ ...item, checked: values[item.value] }));

  const transformToValues = (items: Item[]) =>
    items.reduce((acc, item) => ({ ...acc, [item.value]: item.checked }), {});

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: transformToValues(defaultValues),
  });

  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Force React Hook Forms to rerender whenever defaultValues changes
  useEffect(() => {
    const updateSelectedCount = () => {
      const count = defaultValues.reduce((acc, item) => (item.checked ? acc + 1 : acc), 0);
      setSelectedCount(count);
    };

    reset(defaultValues);
    updateSelectedCount();
  }, [reset, defaultValues]);

  const onSubmit = (values: ReactHookFormValues) => {
    setOpenedFilter(null);
    setSearchTerm('');

    const items = transformToItems(values);
    applyFilter(items);
  };

  const isOpened = name === openedFilter;

  const handleClick = () => {
    // Always reset to defaultValues whenever you open/close the component
    reset(defaultValues);
    setSearchTerm('');

    if (isOpened) {
      setOpenedFilter(null);
    } else {
      setOpenedFilter(name);
    }
  };

  const handleClear = () => {
    const values = getValues();
    const assignFalse = (acc: object, key: string) => ({ ...acc, [key]: false });
    const clearedValues = Object.keys(values).reduce(assignFalse, {});

    reset(clearedValues);
    setSearchTerm('');
  };

  const handleChangeSearch = event => {
    const { value } = event.target;
    setSearchTerm(value);
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
            zIndex: 100,
          }}
        >
          {searchable && (
            <input value={searchTerm} onChange={handleChangeSearch} type="string" style={{ marginBottom: '15px' }} />
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <ul>
              {defaultValues.map((item, i) => {
                const hidden = !item.label.toLowerCase().includes(searchTerm.toLowerCase());

                return (
                  <li key={i} style={{ visibility: hidden ? 'hidden' : 'visible', height: hidden ? '0' : 'auto' }}>
                    <FormLabel htmlFor={item.value} style={{ flexDirection: 'row' }}>
                      <FormCheckbox
                        id={item.value}
                        name={item.value}
                        type="checkbox"
                        defaultChecked={item.checked}
                        innerRef={register}
                      />
                      {item.label}
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
