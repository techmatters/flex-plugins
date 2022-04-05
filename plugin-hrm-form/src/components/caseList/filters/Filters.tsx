/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import { FiltersContainer } from '../../../styles/caseList';
import MultiSelectFilter from './MultiSelectFilter';

type OwnProps = {
  statusOptions: string[];
  counsellorOptions: string[];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const Filters: React.FC<Props> = ({ statusOptions, counsellorOptions }) => {
  const reduceFieldsToFalse = (acc, field) => ({ ...acc, [field]: false });
  const getInitialValue = options => options.reduce(reduceFieldsToFalse, {});

  const [openedFilter, setOpenedFilter] = useState<string>();
  const [statusValues, setStatusValues] = useState(getInitialValue(statusOptions));
  const [counsellorValues, setCounsellorValues] = useState(getInitialValue(counsellorOptions));

  return (
    <FiltersContainer>
      <span style={{ fontWeight: 600 }}>Filters</span>
      <MultiSelectFilter
        name="status"
        text="Status"
        defaultValues={statusValues}
        openedFilter={openedFilter}
        applyFilter={setStatusValues}
        setOpenedFilter={setOpenedFilter}
      />
      <MultiSelectFilter
        name="counsellor"
        text="Counsellor"
        defaultValues={counsellorValues}
        openedFilter={openedFilter}
        applyFilter={setCounsellorValues}
        setOpenedFilter={setOpenedFilter}
      />
    </FiltersContainer>
  );
};

Filters.displayName = 'Filters';

export default Filters;
