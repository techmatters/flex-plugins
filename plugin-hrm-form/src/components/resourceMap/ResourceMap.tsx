/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React from 'react';

const ResourceMap: React.FC = () => {
  return (
    <div>
      <h1>Here's the map!</h1>
      <iframe src="https://fortress.maptive.com/ver4/f79ce850c44152c9c550ae021c525519" frameBorder="0" width="700" height="500" allow="geolocation"></iframe>	
    </div>
  );
};

ResourceMap.displayName = 'ResourceMap';

export default ResourceMap;
