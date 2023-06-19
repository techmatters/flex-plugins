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

// Temporary until we pull these options from the DB - we could pull them from S3 but not worth it for a temp workaround

export const provinceOptions = [
  {
    label: 'Alberta',
    value: 'CA/AB',
  },
  {
    label: 'British Columbia',
    value: 'CA/BC',
  },
  {
    label: 'Manitoba',
    value: 'CA/MB',
  },
  {
    label: 'New Brunswick',
    value: 'CA/NB',
  },
  {
    label: 'Newfoundland and Labrador',
    value: 'CA/NL',
  },
  {
    label: 'Northwest Territories',
    value: 'CA/NT',
  },
  {
    label: 'Nova Scotia',
    value: 'CA/NS',
  },
  {
    label: 'Nunavut',
    value: 'CA/NU',
  },
  {
    label: 'Ontario',
    value: 'CA/ON',
  },
  {
    label: 'Prince Edward Island',
    value: 'CA/PE',
  },
  {
    label: 'Quebec',
    value: 'CA/QC',
  },
  {
    label: 'Saskatchewan',
    value: 'CA/SK',
  },
  {
    label: 'Yukon',
    value: 'CA/YT',
  },
].sort((a, b) => a.label.localeCompare(b.label));

export const cityOptions = [
  {
    label: 'Portugal Cove South',
    value: 'CA/NL/Portugal Cove South',
  },
  {
    label: 'Trepassey',
    value: 'CA/NL/Trepassey',
  },
  {
    label: "St. Shott's",
    value: "CA/NL/St. Shott's",
  },
  {
    label: 'Cape Broyle',
    value: 'CA/NL/Cape Broyle',
  },
  {
    label: 'Renews-Cappahayden',
    value: 'CA/NL/Renews-Cappahayden',
  },
  {
    label: 'Fermeuse',
    value: 'CA/NL/Fermeuse',
  },
  {
    label: 'Port Kirwan',
    value: 'CA/NL/Port Kirwan',
  },
  {
    label: 'Aquaforte',
    value: 'CA/NL/Aquaforte',
  },
  {
    label: 'Ferryland',
    value: 'CA/NL/Ferryland',
  },
  {
    label: "St. Vincent's-St. Stephen's-Peter's River",
    value: "CA/NL/St. Vincent's-St. Stephen's-Peter's River",
  },
  {
    label: 'Gaskiers-Point La Haye',
    value: 'CA/NL/Gaskiers-Point La Haye',
  },
  {
    label: "St. Mary's",
    value: "CA/NL/St. Mary's",
  },
  {
    label: 'Riverhead',
    value: 'CA/NL/Riverhead',
  },
  {
    label: 'Admirals Beach',
    value: 'CA/NL/Admirals Beach',
  },
  {
    label: "St. Joseph's",
    value: "CA/NL/St. Joseph's",
  },
  {
    label: "Mount Carmel-Mitchells Brook-St. Catherine's",
    value: "CA/NL/Mount Carmel-Mitchells Brook-St. Catherine's",
  },
  {
    label: 'Colinet',
    value: 'CA/NL/Colinet',
  },
  {
    label: 'Branch',
    value: 'CA/NL/Branch',
  },
  {
    label: 'Point Lance',
    value: 'CA/NL/Point Lance',
  },
  {
    label: "St. Bride's",
    value: "CA/NL/St. Bride's",
  },
  {
    label: 'Placentia',
    value: 'CA/NL/Placentia',
  },
  {
    label: 'Fox Harbour',
    value: 'CA/NL/Fox Harbour',
  },
  {
    label: 'Long Harbour-Mount Arlington Heights',
    value: 'CA/NL/Long Harbour-Mount Arlington Heights',
  },
  {
    label: 'Southern Harbour',
    value: 'CA/NL/Southern Harbour',
  },
  {
    label: "Arnold's Cove",
    value: "CA/NL/Arnold's Cove",
  },
  {
    label: 'Come By Chance',
    value: 'CA/NL/Come By Chance',
  },
  {
    label: 'Sunnyside',
    value: 'CA/NL/Sunnyside',
  },
  {
    label: 'Chance Cove',
    value: 'CA/NL/Chance Cove',
  },
  {
    label: "Norman's Cove-Long Cove",
    value: "CA/NL/Norman's Cove-Long Cove",
  },
  {
    label: 'Chapel Arm',
    value: 'CA/NL/Chapel Arm',
  },
  {
    label: 'Whitbourne',
    value: 'CA/NL/Whitbourne',
  },
  {
    label: 'Whiteway',
    value: 'CA/NL/Whiteway',
  },
  {
    label: "Heart's Delight-Islington",
    value: "CA/NL/Heart's Delight-Islington",
  },
  {
    label: "Heart's Desire",
    value: "CA/NL/Heart's Desire",
  },
  {
    label: "Heart's Content",
    value: "CA/NL/Heart's Content",
  },
  {
    label: 'New Perlican',
    value: 'CA/NL/New Perlican',
  },
  {
    label: 'Winterton',
    value: 'CA/NL/Winterton',
  },
  {
    label: "Hant's Harbour",
    value: "CA/NL/Hant's Harbour",
  },
  {
    label: 'Old Perlican',
    value: 'CA/NL/Old Perlican',
  },
  {
    label: 'Bay de Verde',
    value: 'CA/NL/Bay de Verde',
  },
  {
    label: "Small Point-Adam's Cove-Blackhead-Broad Cove",
    value: "CA/NL/Small Point-Adam's Cove-Blackhead-Broad Cove",
  },
  {
    label: 'Salmon Cove',
    value: 'CA/NL/Salmon Cove',
  },
  {
    label: 'Victoria',
    value: 'CA/NL/Victoria',
  },
  {
    label: 'Carbonear',
    value: 'CA/NL/Carbonear',
  },
  {
    label: "Bryant's Cove",
    value: "CA/NL/Bryant's Cove",
  },
  {
    label: 'Harbour Grace',
    value: 'CA/NL/Harbour Grace',
  },
  {
    label: 'Upper Island Cove',
    value: 'CA/NL/Upper Island Cove',
  },
  {
    label: "Bishop's Cove",
    value: "CA/NL/Bishop's Cove",
  },
  {
    label: "Spaniard's Bay",
    value: "CA/NL/Spaniard's Bay",
  },
  {
    label: 'Bay Roberts',
    value: 'CA/NL/Bay Roberts',
  },
  {
    label: 'North River',
    value: 'CA/NL/North River',
  },
  {
    label: "Clarke's Beach",
    value: "CA/NL/Clarke's Beach",
  },
  {
    label: 'South River',
    value: 'CA/NL/South River',
  },
  {
    label: 'Cupids',
    value: 'CA/NL/Cupids',
  },
  {
    label: 'Brigus',
    value: 'CA/NL/Brigus',
  },
  {
    label: 'Colliers',
    value: 'CA/NL/Colliers',
  },
  {
    label: 'Conception Harbour',
    value: 'CA/NL/Conception Harbour',
  },
  {
    label: 'Avondale',
    value: 'CA/NL/Avondale',
  },
  {
    label: "Harbour Main-Chapel's Cove-Lakeview",
    value: "CA/NL/Harbour Main-Chapel's Cove-Lakeview",
  },
  {
    label: 'Holyrood',
    value: 'CA/NL/Holyrood',
  },
  {
    label: 'Conception Bay South',
    value: 'CA/NL/Conception Bay South',
  },
  {
    label: 'Wabana',
    value: 'CA/NL/Wabana',
  },
  {
    label: "Portugal Cove-St. Philip's",
    value: "CA/NL/Portugal Cove-St. Philip's",
  },
  {
    label: 'Pouch Cove',
    value: 'CA/NL/Pouch Cove',
  },
  {
    label: 'Flatrock',
    value: 'CA/NL/Flatrock',
  },
  {
    label: 'Torbay',
    value: 'CA/NL/Torbay',
  },
  {
    label: 'Logy Bay-Middle Cove-Outer Cove',
    value: 'CA/NL/Logy Bay-Middle Cove-Outer Cove',
  },
  {
    label: 'Bauline',
    value: 'CA/NL/Bauline',
  },
  {
    label: 'Paradise',
    value: 'CA/NL/Paradise',
  },
  {
    label: "St. John's",
    value: "CA/NL/St. John's",
  },
  {
    label: 'Mount Pearl',
    value: 'CA/NL/Mount Pearl',
  },
  {
    label: 'Petty Harbour-Maddox Cove',
    value: 'CA/NL/Petty Harbour-Maddox Cove',
  },
  {
    label: 'Bay Bulls',
    value: 'CA/NL/Bay Bulls',
  },
  {
    label: 'Witless Bay',
    value: 'CA/NL/Witless Bay',
  },
  {
    label: "Lewin's Cove",
    value: "CA/NL/Lewin's Cove",
  },
  {
    label: 'Burin',
    value: 'CA/NL/Burin',
  },
  {
    label: 'St. Lawrence',
    value: 'CA/NL/St. Lawrence',
  },
  {
    label: 'Lawn',
    value: 'CA/NL/Lawn',
  },
  {
    label: 'Lamaline',
    value: 'CA/NL/Lamaline',
  },
  {
    label: "Lord's Cove",
    value: "CA/NL/Lord's Cove",
  },
  {
    label: 'Point May',
    value: 'CA/NL/Point May',
  },
  {
    label: 'Point au Gaul',
    value: 'CA/NL/Point au Gaul',
  },
  {
    label: "Frenchman's Cove",
    value: "CA/NL/Frenchman's Cove",
  },
  {
    label: 'Fortune',
    value: 'CA/NL/Fortune',
  },
  {
    label: 'Grand Bank',
    value: 'CA/NL/Grand Bank',
  },
  {
    label: 'Garnish',
    value: 'CA/NL/Garnish',
  },
  {
    label: 'Winterland',
    value: 'CA/NL/Winterland',
  },
  {
    label: 'Marystown',
    value: 'CA/NL/Marystown',
  },
  {
    label: 'Fox Cove-Mortier',
    value: 'CA/NL/Fox Cove-Mortier',
  },
  {
    label: "Bay L'Argent",
    value: "CA/NL/Bay L'Argent",
  },
  {
    label: 'Grand le Pierre',
    value: 'CA/NL/Grand le Pierre',
  },
  {
    label: 'Rushoon',
    value: 'CA/NL/Rushoon',
  },
  {
    label: 'Parkers Cove',
    value: 'CA/NL/Parkers Cove',
  },
  {
    label: 'Terrenceville',
    value: 'CA/NL/Terrenceville',
  },
  {
    label: 'Red Harbour',
    value: 'CA/NL/Red Harbour',
  },
  {
    label: 'English Harbour East',
    value: 'CA/NL/English Harbour East',
  },
  {
    label: 'Baine Harbour',
    value: 'CA/NL/Baine Harbour',
  },
  {
    label: "St. Bernard's-Jacques Fontaine",
    value: "CA/NL/St. Bernard's-Jacques Fontaine",
  },
  {
    label: 'Little Bay East',
    value: 'CA/NL/Little Bay East',
  },
  {
    label: 'Rencontre East',
    value: 'CA/NL/Rencontre East',
  },
  {
    label: "St. Jacques-Coomb's Cove",
    value: "CA/NL/St. Jacques-Coomb's Cove",
  },
  {
    label: 'Belleoram',
    value: 'CA/NL/Belleoram',
  },
  {
    label: "Pool's Cove",
    value: "CA/NL/Pool's Cove",
  },
  {
    label: 'Harbour Breton',
    value: 'CA/NL/Harbour Breton',
  },
  {
    label: 'Seal Cove (Fortune Bay)',
    value: 'CA/NL/Seal Cove (Fortune Bay)',
  },
  {
    label: 'Hermitage-Sandyville',
    value: 'CA/NL/Hermitage-Sandyville',
  },
  {
    label: 'Gaultois',
    value: 'CA/NL/Gaultois',
  },
  {
    label: "Milltown-Head of Bay d'Espoir",
    value: "CA/NL/Milltown-Head of Bay d'Espoir",
  },
  {
    label: "St. Alban's",
    value: "CA/NL/St. Alban's",
  },
  {
    label: 'Morrisville',
    value: 'CA/NL/Morrisville',
  },
  {
    label: 'Ramea',
    value: 'CA/NL/Ramea',
  },
  {
    label: 'Burgeo',
    value: 'CA/NL/Burgeo',
  },
  {
    label: 'Isle aux Morts',
    value: 'CA/NL/Isle aux Morts',
  },
  {
    label: 'Burnt Islands',
    value: 'CA/NL/Burnt Islands',
  },
  {
    label: 'Channel-Port aux Basques',
    value: 'CA/NL/Channel-Port aux Basques',
  },
  {
    label: 'Rose Blanche-Harbour le Cou',
    value: 'CA/NL/Rose Blanche-Harbour le Cou',
  },
  {
    label: "St. George's",
    value: "CA/NL/St. George's",
  },
  {
    label: 'Gallants',
    value: 'CA/NL/Gallants',
  },
  {
    label: 'Stephenville Crossing',
    value: 'CA/NL/Stephenville Crossing',
  },
  {
    label: 'Stephenville',
    value: 'CA/NL/Stephenville',
  },
  {
    label: 'Kippens',
    value: 'CA/NL/Kippens',
  },
  {
    label: 'Port au Port East',
    value: 'CA/NL/Port au Port East',
  },
  {
    label: 'Cape St. George',
    value: 'CA/NL/Cape St. George',
  },
  {
    label: 'Lourdes',
    value: 'CA/NL/Lourdes',
  },
  {
    label: 'Port au Port West-Aguathuna-Felix Cove',
    value: 'CA/NL/Port au Port West-Aguathuna-Felix Cove',
  },
  {
    label: 'Deer Lake',
    value: 'CA/NL/Deer Lake',
  },
  {
    label: "Jackson's Arm",
    value: "CA/NL/Jackson's Arm",
  },
  {
    label: 'Howley',
    value: 'CA/NL/Howley',
  },
  {
    label: 'Hampden',
    value: 'CA/NL/Hampden',
  },
  {
    label: 'Reidville',
    value: 'CA/NL/Reidville',
  },
  {
    label: 'Steady Brook',
    value: 'CA/NL/Steady Brook',
  },
  {
    label: 'Pasadena',
    value: 'CA/NL/Pasadena',
  },
  {
    label: 'Cormack',
    value: 'CA/NL/Cormack',
  },
  {
    label: 'Gillams',
    value: 'CA/NL/Gillams',
  },
  {
    label: 'Massey Drive',
    value: 'CA/NL/Massey Drive',
  },
  {
    label: 'Corner Brook',
    value: 'CA/NL/Corner Brook',
  },
  {
    label: 'Humber Arm South',
    value: 'CA/NL/Humber Arm South',
  },
  {
    label: 'McIvers',
    value: 'CA/NL/McIvers',
  },
  {
    label: "Cox's Cove",
    value: "CA/NL/Cox's Cove",
  },
  {
    label: 'Lark Harbour',
    value: 'CA/NL/Lark Harbour',
  },
  {
    label: 'Meadows',
    value: 'CA/NL/Meadows',
  },
  {
    label: 'Hughes Brook',
    value: 'CA/NL/Hughes Brook',
  },
  {
    label: 'Irishtown-Summerside',
    value: 'CA/NL/Irishtown-Summerside',
  },
  {
    label: 'Mount Moriah',
    value: 'CA/NL/Mount Moriah',
  },
  {
    label: 'York Harbour',
    value: 'CA/NL/York Harbour',
  },
  {
    label: 'Norris Arm',
    value: 'CA/NL/Norris Arm',
  },
  {
    label: 'Gander',
    value: 'CA/NL/Gander',
  },
  {
    label: 'Appleton',
    value: 'CA/NL/Appleton',
  },
  {
    label: 'Glenwood',
    value: 'CA/NL/Glenwood',
  },
  {
    label: 'Northern Arm',
    value: 'CA/NL/Northern Arm',
  },
  {
    label: 'Grand Falls-Windsor',
    value: 'CA/NL/Grand Falls-Windsor',
  },
  {
    label: "Bishop's Falls",
    value: "CA/NL/Bishop's Falls",
  },
  {
    label: 'Peterview',
    value: 'CA/NL/Peterview',
  },
  {
    label: 'Botwood',
    value: 'CA/NL/Botwood',
  },
  {
    label: 'Badger',
    value: 'CA/NL/Badger',
  },
  {
    label: 'Millertown',
    value: 'CA/NL/Millertown',
  },
  {
    label: 'Buchans',
    value: 'CA/NL/Buchans',
  },
  {
    label: 'Clarenville',
    value: 'CA/NL/Clarenville',
  },
  {
    label: 'Trinity (Trinity Bay)',
    value: 'CA/NL/Trinity (Trinity Bay)',
  },
  {
    label: 'Port Rexton',
    value: 'CA/NL/Port Rexton',
  },
  {
    label: 'Elliston',
    value: 'CA/NL/Elliston',
  },
  {
    label: 'Trinity Bay North',
    value: 'CA/NL/Trinity Bay North',
  },
  {
    label: 'Bonavista',
    value: 'CA/NL/Bonavista',
  },
  {
    label: 'Keels',
    value: 'CA/NL/Keels',
  },
  {
    label: 'Duntara',
    value: 'CA/NL/Duntara',
  },
  {
    label: "King's Cove",
    value: "CA/NL/King's Cove",
  },
  {
    label: 'Musgravetown',
    value: 'CA/NL/Musgravetown',
  },
  {
    label: 'Port Blandford',
    value: 'CA/NL/Port Blandford',
  },
  {
    label: 'Traytown',
    value: 'CA/NL/Traytown',
  },
  {
    label: 'Sandy Cove',
    value: 'CA/NL/Sandy Cove',
  },
  {
    label: 'Terra Nova',
    value: 'CA/NL/Terra Nova',
  },
  {
    label: 'Happy Adventure',
    value: 'CA/NL/Happy Adventure',
  },
  {
    label: 'Eastport',
    value: 'CA/NL/Eastport',
  },
  {
    label: 'Sandringham',
    value: 'CA/NL/Sandringham',
  },
  {
    label: 'Glovertown',
    value: 'CA/NL/Glovertown',
  },
  {
    label: 'Salvage',
    value: 'CA/NL/Salvage',
  },
  {
    label: 'Gambo',
    value: 'CA/NL/Gambo',
  },
  {
    label: "St. Brendan's",
    value: "CA/NL/St. Brendan's",
  },
  {
    label: 'Hare Bay',
    value: 'CA/NL/Hare Bay',
  },
  {
    label: 'Centreville-Wareham-Trinity',
    value: 'CA/NL/Centreville-Wareham-Trinity',
  },
  {
    label: 'Greenspond',
    value: 'CA/NL/Greenspond',
  },
  {
    label: 'Dover',
    value: 'CA/NL/Dover',
  },
  {
    label: 'New-Wes-Valley',
    value: 'CA/NL/New-Wes-Valley',
  },
  {
    label: 'Indian Bay',
    value: 'CA/NL/Indian Bay',
  },
  {
    label: 'Lumsden',
    value: 'CA/NL/Lumsden',
  },
  {
    label: 'Musgrave Harbour',
    value: 'CA/NL/Musgrave Harbour',
  },
  {
    label: 'Carmanville',
    value: 'CA/NL/Carmanville',
  },
  {
    label: 'Change Islands',
    value: 'CA/NL/Change Islands',
  },
  {
    label: 'Crow Head',
    value: 'CA/NL/Crow Head',
  },
  {
    label: 'Cottlesville',
    value: 'CA/NL/Cottlesville',
  },
  {
    label: 'Summerford',
    value: 'CA/NL/Summerford',
  },
  {
    label: 'Twillingate',
    value: 'CA/NL/Twillingate',
  },
  {
    label: 'Campbellton',
    value: 'CA/NL/Campbellton',
  },
  {
    label: 'Birchy Bay',
    value: 'CA/NL/Birchy Bay',
  },
  {
    label: 'Comfort Cove-Newstead',
    value: 'CA/NL/Comfort Cove-Newstead',
  },
  {
    label: 'Baytona',
    value: 'CA/NL/Baytona',
  },
  {
    label: 'Embree',
    value: 'CA/NL/Embree',
  },
  {
    label: 'Lewisporte',
    value: 'CA/NL/Lewisporte',
  },
  {
    label: 'Little Burnt Bay',
    value: 'CA/NL/Little Burnt Bay',
  },
  {
    label: 'Point of Bay',
    value: 'CA/NL/Point of Bay',
  },
  {
    label: 'Leading Tickles',
    value: 'CA/NL/Leading Tickles',
  },
  {
    label: 'Point Leamington',
    value: 'CA/NL/Point Leamington',
  },
  {
    label: "Pilley's Island",
    value: "CA/NL/Pilley's Island",
  },
  {
    label: 'Triton',
    value: 'CA/NL/Triton',
  },
  {
    label: 'Brighton',
    value: 'CA/NL/Brighton',
  },
  {
    label: 'Lushes Bight-Beaumont-Beaumont North',
    value: 'CA/NL/Lushes Bight-Beaumont-Beaumont North',
  },
  {
    label: 'South Brook',
    value: 'CA/NL/South Brook',
  },
  {
    label: "Robert's Arm",
    value: "CA/NL/Robert's Arm",
  },
  {
    label: 'Springdale',
    value: 'CA/NL/Springdale',
  },
  {
    label: 'Port Anson',
    value: 'CA/NL/Port Anson',
  },
  {
    label: 'Little Bay',
    value: 'CA/NL/Little Bay',
  },
  {
    label: 'Little Bay Islands',
    value: 'CA/NL/Little Bay Islands',
  },
  {
    label: 'Beachside',
    value: 'CA/NL/Beachside',
  },
  {
    label: "King's Point",
    value: "CA/NL/King's Point",
  },
  {
    label: 'Nippers Harbour',
    value: 'CA/NL/Nippers Harbour',
  },
  {
    label: 'Burlington',
    value: 'CA/NL/Burlington',
  },
  {
    label: 'Middle Arm',
    value: 'CA/NL/Middle Arm',
  },
  {
    label: 'Tilt Cove',
    value: 'CA/NL/Tilt Cove',
  },
  {
    label: 'Fleur de Lys',
    value: 'CA/NL/Fleur de Lys',
  },
  {
    label: 'LaScie',
    value: 'CA/NL/LaScie',
  },
  {
    label: "Brent's Cove",
    value: "CA/NL/Brent's Cove",
  },
  {
    label: 'Pacquet',
    value: 'CA/NL/Pacquet',
  },
  {
    label: 'Baie Verte',
    value: 'CA/NL/Baie Verte',
  },
  {
    label: 'Seal Cove (White Bay)',
    value: 'CA/NL/Seal Cove (White Bay)',
  },
  {
    label: "Coachman's Cove",
    value: "CA/NL/Coachman's Cove",
  },
  {
    label: 'Westport',
    value: 'CA/NL/Westport',
  },
  {
    label: "Ming's Bight",
    value: "CA/NL/Ming's Bight",
  },
  {
    label: 'Woodstock',
    value: 'CA/NL/Woodstock',
  },
  {
    label: 'Miles Cove',
    value: 'CA/NL/Miles Cove',
  },
  {
    label: 'Fogo Island',
    value: 'CA/NL/Fogo Island',
  },
  {
    label: 'Englee',
    value: 'CA/NL/Englee',
  },
  {
    label: 'Roddickton-Bide Arm',
    value: 'CA/NL/Roddickton-Bide Arm',
  },
  {
    label: 'Conche',
    value: 'CA/NL/Conche',
  },
  {
    label: 'Trout River',
    value: 'CA/NL/Trout River',
  },
  {
    label: 'Woody Point, Bonne Bay',
    value: 'CA/NL/Woody Point, Bonne Bay',
  },
  {
    label: 'Norris Point',
    value: 'CA/NL/Norris Point',
  },
  {
    label: 'Rocky Harbour',
    value: 'CA/NL/Rocky Harbour',
  },
  {
    label: "Daniel's Harbour",
    value: "CA/NL/Daniel's Harbour",
  },
  {
    label: 'Cow Head',
    value: 'CA/NL/Cow Head',
  },
  {
    label: "Parson's Pond",
    value: "CA/NL/Parson's Pond",
  },
  {
    label: "Hawke's Bay",
    value: "CA/NL/Hawke's Bay",
  },
  {
    label: 'Port Saunders',
    value: 'CA/NL/Port Saunders',
  },
  {
    label: 'St. Pauls',
    value: 'CA/NL/St. Pauls',
  },
  {
    label: 'Port au Choix',
    value: 'CA/NL/Port au Choix',
  },
  {
    label: 'Anchor Point',
    value: 'CA/NL/Anchor Point',
  },
  {
    label: "Flower's Cove",
    value: "CA/NL/Flower's Cove",
  },
  {
    label: 'Bird Cove',
    value: 'CA/NL/Bird Cove',
  },
  {
    label: 'Main Brook',
    value: 'CA/NL/Main Brook',
  },
  {
    label: 'St. Anthony',
    value: 'CA/NL/St. Anthony',
  },
  {
    label: 'Glenburnie-Birchy Head-Shoal Brook',
    value: 'CA/NL/Glenburnie-Birchy Head-Shoal Brook',
  },
  {
    label: 'St. Lunaire-Griquet',
    value: 'CA/NL/St. Lunaire-Griquet',
  },
  {
    label: "Cook's Harbour",
    value: "CA/NL/Cook's Harbour",
  },
  {
    label: 'Raleigh',
    value: 'CA/NL/Raleigh',
  },
  {
    label: "Sally's Cove",
    value: "CA/NL/Sally's Cove",
  },
  {
    label: 'Goose Cove East',
    value: 'CA/NL/Goose Cove East',
  },
  {
    label: 'Bellburns',
    value: 'CA/NL/Bellburns',
  },
  {
    label: 'River of Ponds',
    value: 'CA/NL/River of Ponds',
  },
  {
    label: "L'Anse au Loup",
    value: "CA/NL/L'Anse au Loup",
  },
  {
    label: 'Red Bay',
    value: 'CA/NL/Red Bay',
  },
  {
    label: "L'Anse-au-Clair",
    value: "CA/NL/L'Anse-au-Clair",
  },
  {
    label: 'Forteau',
    value: 'CA/NL/Forteau',
  },
  {
    label: 'West St. Modeste',
    value: 'CA/NL/West St. Modeste',
  },
  {
    label: 'Pinware',
    value: 'CA/NL/Pinware',
  },
  {
    label: 'Port Hope Simpson',
    value: 'CA/NL/Port Hope Simpson',
  },
  {
    label: 'St. Lewis',
    value: 'CA/NL/St. Lewis',
  },
  {
    label: "Mary's Harbour",
    value: "CA/NL/Mary's Harbour",
  },
  {
    label: 'Cartwright, Labrador',
    value: 'CA/NL/Cartwright, Labrador',
  },
  {
    label: 'Charlottetown (Labrador)',
    value: 'CA/NL/Charlottetown (Labrador)',
  },
  {
    label: 'North West River',
    value: 'CA/NL/North West River',
  },
  {
    label: 'Happy Valley-Goose Bay',
    value: 'CA/NL/Happy Valley-Goose Bay',
  },
  {
    label: 'Labrador City',
    value: 'CA/NL/Labrador City',
  },
  {
    label: 'Wabush',
    value: 'CA/NL/Wabush',
  },
  {
    label: 'Rigolet',
    value: 'CA/NL/Rigolet',
  },
  {
    label: 'Postville',
    value: 'CA/NL/Postville',
  },
  {
    label: 'Makkovik',
    value: 'CA/NL/Makkovik',
  },
  {
    label: 'Hopedale',
    value: 'CA/NL/Hopedale',
  },
  {
    label: 'Nain',
    value: 'CA/NL/Nain',
  },
  {
    label: 'Montague',
    value: 'CA/PE/Montague',
  },
  {
    label: 'Georgetown',
    value: 'CA/PE/Georgetown',
  },
  {
    label: 'Souris',
    value: 'CA/PE/Souris',
  },
  {
    label: 'Charlottetown',
    value: 'CA/PE/Charlottetown',
  },
  {
    label: 'Stratford',
    value: 'CA/PE/Stratford',
  },
  {
    label: 'Cornwall',
    value: 'CA/PE/Cornwall',
  },
  {
    label: 'Borden-Carleton',
    value: 'CA/PE/Borden-Carleton',
  },
  {
    label: 'Kensington',
    value: 'CA/PE/Kensington',
  },
  {
    label: 'Summerside',
    value: 'CA/PE/Summerside',
  },
  {
    label: 'Alberton',
    value: 'CA/PE/Alberton',
  },
  {
    label: "Clark's Harbour",
    value: "CA/NS/Clark's Harbour",
  },
  {
    label: 'Shelburne',
    value: 'CA/NS/Shelburne',
  },
  {
    label: 'Lockeport',
    value: 'CA/NS/Lockeport',
  },
  {
    label: 'Yarmouth',
    value: 'CA/NS/Yarmouth',
  },
  {
    label: 'Digby',
    value: 'CA/NS/Digby',
  },
  {
    label: 'Annapolis Royal',
    value: 'CA/NS/Annapolis Royal',
  },
  {
    label: 'Middleton',
    value: 'CA/NS/Middleton',
  },
  {
    label: 'Bridgewater',
    value: 'CA/NS/Bridgewater',
  },
  {
    label: 'Lunenburg',
    value: 'CA/NS/Lunenburg',
  },
  {
    label: 'Mahone Bay',
    value: 'CA/NS/Mahone Bay',
  },
  {
    label: 'Berwick',
    value: 'CA/NS/Berwick',
  },
  {
    label: 'Kentville',
    value: 'CA/NS/Kentville',
  },
  {
    label: 'Wolfville',
    value: 'CA/NS/Wolfville',
  },
  {
    label: 'Windsor',
    value: 'CA/NS/Windsor',
  },
  {
    label: 'Stewiacke',
    value: 'CA/NS/Stewiacke',
  },
  {
    label: 'Truro',
    value: 'CA/NS/Truro',
  },
  {
    label: 'Parrsboro',
    value: 'CA/NS/Parrsboro',
  },
  {
    label: 'Amherst',
    value: 'CA/NS/Amherst',
  },
  {
    label: 'Oxford',
    value: 'CA/NS/Oxford',
  },
  {
    label: 'Pictou',
    value: 'CA/NS/Pictou',
  },
  {
    label: 'Westville',
    value: 'CA/NS/Westville',
  },
  {
    label: 'Stellarton',
    value: 'CA/NS/Stellarton',
  },
  {
    label: 'New Glasgow',
    value: 'CA/NS/New Glasgow',
  },
  {
    label: 'Trenton',
    value: 'CA/NS/Trenton',
  },
  {
    label: 'Mulgrave',
    value: 'CA/NS/Mulgrave',
  },
  {
    label: 'Antigonish',
    value: 'CA/NS/Antigonish',
  },
  {
    label: 'Port Hawkesbury',
    value: 'CA/NS/Port Hawkesbury',
  },
  {
    label: 'Saint John',
    value: 'CA/NB/Saint John',
  },
  {
    label: 'St. George',
    value: 'CA/NB/St. George',
  },
  {
    label: 'Saint Andrews',
    value: 'CA/NB/Saint Andrews',
  },
  {
    label: 'St. Stephen',
    value: 'CA/NB/St. Stephen',
  },
  {
    label: 'Oromocto',
    value: 'CA/NB/Oromocto',
  },
  {
    label: 'Hampton',
    value: 'CA/NB/Hampton',
  },
  {
    label: 'Grand Bay-Westfield',
    value: 'CA/NB/Grand Bay-Westfield',
  },
  {
    label: 'Sussex',
    value: 'CA/NB/Sussex',
  },
  {
    label: 'Rothesay',
    value: 'CA/NB/Rothesay',
  },
  {
    label: 'Quispamsis',
    value: 'CA/NB/Quispamsis',
  },
  {
    label: 'Riverview',
    value: 'CA/NB/Riverview',
  },
  {
    label: 'Sackville',
    value: 'CA/NB/Sackville',
  },
  {
    label: 'Moncton',
    value: 'CA/NB/Moncton',
  },
  {
    label: 'Dieppe',
    value: 'CA/NB/Dieppe',
  },
  {
    label: 'Shediac',
    value: 'CA/NB/Shediac',
  },
  {
    label: 'Bouctouche',
    value: 'CA/NB/Bouctouche',
  },
  {
    label: 'Richibucto',
    value: 'CA/NB/Richibucto',
  },
  {
    label: 'Miramichi',
    value: 'CA/NB/Miramichi',
  },
  {
    label: 'Fredericton',
    value: 'CA/NB/Fredericton',
  },
  {
    label: 'Nackawic',
    value: 'CA/NB/Nackawic',
  },
  {
    label: 'Woodstock',
    value: 'CA/NB/Woodstock',
  },
  {
    label: 'Hartland',
    value: 'CA/NB/Hartland',
  },
  {
    label: 'Florenceville-Bristol',
    value: 'CA/NB/Florenceville-Bristol',
  },
  {
    label: 'Grand Falls',
    value: 'CA/NB/Grand Falls',
  },
  {
    label: 'Saint-L�onard',
    value: 'CA/NB/Saint-L�onard',
  },
  {
    label: 'Edmundston',
    value: 'CA/NB/Edmundston',
  },
  {
    label: 'Campbellton',
    value: 'CA/NB/Campbellton',
  },
  {
    label: 'Dalhousie',
    value: 'CA/NB/Dalhousie',
  },
  {
    label: 'Saint-Quentin',
    value: 'CA/NB/Saint-Quentin',
  },
  {
    label: 'Bathurst',
    value: 'CA/NB/Bathurst',
  },
  {
    label: 'Beresford',
    value: 'CA/NB/Beresford',
  },
  {
    label: 'Caraquet',
    value: 'CA/NB/Caraquet',
  },
  {
    label: 'Shippagan',
    value: 'CA/NB/Shippagan',
  },
  {
    label: 'Lam�que',
    value: 'CA/NB/Lam�que',
  },
  {
    label: 'Cornwall',
    value: 'CA/ON/Cornwall',
  },
  {
    label: 'Hawkesbury',
    value: 'CA/ON/Hawkesbury',
  },
  {
    label: 'Clarence-Rockland',
    value: 'CA/ON/Clarence-Rockland',
  },
  {
    label: 'Ottawa',
    value: 'CA/ON/Ottawa',
  },
  {
    label: 'Prescott',
    value: 'CA/ON/Prescott',
  },
  {
    label: 'Brockville',
    value: 'CA/ON/Brockville',
  },
  {
    label: 'Gananoque',
    value: 'CA/ON/Gananoque',
  },
  {
    label: 'Smiths Falls',
    value: 'CA/ON/Smiths Falls',
  },
  {
    label: 'Perth',
    value: 'CA/ON/Perth',
  },
  {
    label: 'Carleton Place',
    value: 'CA/ON/Carleton Place',
  },
  {
    label: 'Mississippi Mills',
    value: 'CA/ON/Mississippi Mills',
  },
  {
    label: 'Kingston',
    value: 'CA/ON/Kingston',
  },
  {
    label: 'Greater Napanee',
    value: 'CA/ON/Greater Napanee',
  },
  {
    label: 'Deseronto',
    value: 'CA/ON/Deseronto',
  },
  {
    label: 'Belleville',
    value: 'CA/ON/Belleville',
  },
  {
    label: 'Quinte West',
    value: 'CA/ON/Quinte West',
  },
  {
    label: 'Bancroft',
    value: 'CA/ON/Bancroft',
  },
  {
    label: 'Prince Edward County',
    value: 'CA/ON/Prince Edward County',
  },
  {
    label: 'Cobourg',
    value: 'CA/ON/Cobourg',
  },
  {
    label: 'Peterborough',
    value: 'CA/ON/Peterborough',
  },
  {
    label: 'Kawartha Lakes',
    value: 'CA/ON/Kawartha Lakes',
  },
  {
    label: 'Pickering',
    value: 'CA/ON/Pickering',
  },
  {
    label: 'Ajax',
    value: 'CA/ON/Ajax',
  },
  {
    label: 'Whitby',
    value: 'CA/ON/Whitby',
  },
  {
    label: 'Oshawa',
    value: 'CA/ON/Oshawa',
  },
  {
    label: 'Vaughan',
    value: 'CA/ON/Vaughan',
  },
  {
    label: 'Markham',
    value: 'CA/ON/Markham',
  },
  {
    label: 'Richmond Hill',
    value: 'CA/ON/Richmond Hill',
  },
  {
    label: 'Whitchurch-Stouffville',
    value: 'CA/ON/Whitchurch-Stouffville',
  },
  {
    label: 'Aurora',
    value: 'CA/ON/Aurora',
  },
  {
    label: 'Newmarket',
    value: 'CA/ON/Newmarket',
  },
  {
    label: 'East Gwillimbury',
    value: 'CA/ON/East Gwillimbury',
  },
  {
    label: 'Georgina',
    value: 'CA/ON/Georgina',
  },
  {
    label: 'Toronto',
    value: 'CA/ON/Toronto',
  },
  {
    label: 'Mississauga',
    value: 'CA/ON/Mississauga',
  },
  {
    label: 'Brampton',
    value: 'CA/ON/Brampton',
  },
  {
    label: 'Caledon',
    value: 'CA/ON/Caledon',
  },
  {
    label: 'Grand Valley',
    value: 'CA/ON/Grand Valley',
  },
  {
    label: 'Mono',
    value: 'CA/ON/Mono',
  },
  {
    label: 'Orangeville',
    value: 'CA/ON/Orangeville',
  },
  {
    label: 'Shelburne',
    value: 'CA/ON/Shelburne',
  },
  {
    label: 'Guelph',
    value: 'CA/ON/Guelph',
  },
  {
    label: 'Erin',
    value: 'CA/ON/Erin',
  },
  {
    label: 'Minto',
    value: 'CA/ON/Minto',
  },
  {
    label: 'Oakville',
    value: 'CA/ON/Oakville',
  },
  {
    label: 'Burlington',
    value: 'CA/ON/Burlington',
  },
  {
    label: 'Milton',
    value: 'CA/ON/Milton',
  },
  {
    label: 'Halton Hills',
    value: 'CA/ON/Halton Hills',
  },
  {
    label: 'Hamilton',
    value: 'CA/ON/Hamilton',
  },
  {
    label: 'Fort Erie',
    value: 'CA/ON/Fort Erie',
  },
  {
    label: 'Port Colborne',
    value: 'CA/ON/Port Colborne',
  },
  {
    label: 'Pelham',
    value: 'CA/ON/Pelham',
  },
  {
    label: 'Welland',
    value: 'CA/ON/Welland',
  },
  {
    label: 'Thorold',
    value: 'CA/ON/Thorold',
  },
  {
    label: 'Niagara Falls',
    value: 'CA/ON/Niagara Falls',
  },
  {
    label: 'Niagara-on-the-Lake',
    value: 'CA/ON/Niagara-on-the-Lake',
  },
  {
    label: 'St. Catharines',
    value: 'CA/ON/St. Catharines',
  },
  {
    label: 'Lincoln',
    value: 'CA/ON/Lincoln',
  },
  {
    label: 'Grimsby',
    value: 'CA/ON/Grimsby',
  },
  {
    label: 'Haldimand County',
    value: 'CA/ON/Haldimand County',
  },
  {
    label: 'Norfolk County',
    value: 'CA/ON/Norfolk County',
  },
  {
    label: 'Brant',
    value: 'CA/ON/Brant',
  },
  {
    label: 'Brantford',
    value: 'CA/ON/Brantford',
  },
  {
    label: 'Cambridge',
    value: 'CA/ON/Cambridge',
  },
  {
    label: 'Kitchener',
    value: 'CA/ON/Kitchener',
  },
  {
    label: 'Waterloo',
    value: 'CA/ON/Waterloo',
  },
  {
    label: 'Stratford',
    value: 'CA/ON/Stratford',
  },
  {
    label: 'St. Marys',
    value: 'CA/ON/St. Marys',
  },
  {
    label: 'Tillsonburg',
    value: 'CA/ON/Tillsonburg',
  },
  {
    label: 'Ingersoll',
    value: 'CA/ON/Ingersoll',
  },
  {
    label: 'Woodstock',
    value: 'CA/ON/Woodstock',
  },
  {
    label: 'Aylmer',
    value: 'CA/ON/Aylmer',
  },
  {
    label: 'St. Thomas',
    value: 'CA/ON/St. Thomas',
  },
  {
    label: 'Kingsville',
    value: 'CA/ON/Kingsville',
  },
  {
    label: 'Essex',
    value: 'CA/ON/Essex',
  },
  {
    label: 'Amherstburg',
    value: 'CA/ON/Amherstburg',
  },
  {
    label: 'LaSalle',
    value: 'CA/ON/LaSalle',
  },
  {
    label: 'Windsor',
    value: 'CA/ON/Windsor',
  },
  {
    label: 'Tecumseh',
    value: 'CA/ON/Tecumseh',
  },
  {
    label: 'Lakeshore',
    value: 'CA/ON/Lakeshore',
  },
  {
    label: 'Petrolia',
    value: 'CA/ON/Petrolia',
  },
  {
    label: 'Sarnia',
    value: 'CA/ON/Sarnia',
  },
  {
    label: 'Plympton-Wyoming',
    value: 'CA/ON/Plympton-Wyoming',
  },
  {
    label: 'London',
    value: 'CA/ON/London',
  },
  {
    label: 'Goderich',
    value: 'CA/ON/Goderich',
  },
  {
    label: 'Saugeen Shores',
    value: 'CA/ON/Saugeen Shores',
  },
  {
    label: 'South Bruce Peninsula',
    value: 'CA/ON/South Bruce Peninsula',
  },
  {
    label: 'Hanover',
    value: 'CA/ON/Hanover',
  },
  {
    label: 'The Blue Mountains',
    value: 'CA/ON/The Blue Mountains',
  },
  {
    label: 'Owen Sound',
    value: 'CA/ON/Owen Sound',
  },
  {
    label: 'New Tecumseth',
    value: 'CA/ON/New Tecumseth',
  },
  {
    label: 'Bradford West Gwillimbury',
    value: 'CA/ON/Bradford West Gwillimbury',
  },
  {
    label: 'Innisfil',
    value: 'CA/ON/Innisfil',
  },
  {
    label: 'Collingwood',
    value: 'CA/ON/Collingwood',
  },
  {
    label: 'Barrie',
    value: 'CA/ON/Barrie',
  },
  {
    label: 'Orillia',
    value: 'CA/ON/Orillia',
  },
  {
    label: 'Wasaga Beach',
    value: 'CA/ON/Wasaga Beach',
  },
  {
    label: 'Penetanguishene',
    value: 'CA/ON/Penetanguishene',
  },
  {
    label: 'Midland',
    value: 'CA/ON/Midland',
  },
  {
    label: 'Gravenhurst',
    value: 'CA/ON/Gravenhurst',
  },
  {
    label: 'Bracebridge',
    value: 'CA/ON/Bracebridge',
  },
  {
    label: 'Huntsville',
    value: 'CA/ON/Huntsville',
  },
  {
    label: 'Arnprior',
    value: 'CA/ON/Arnprior',
  },
  {
    label: 'Renfrew',
    value: 'CA/ON/Renfrew',
  },
  {
    label: 'Pembroke',
    value: 'CA/ON/Pembroke',
  },
  {
    label: 'Petawawa',
    value: 'CA/ON/Petawawa',
  },
  {
    label: 'Laurentian Hills',
    value: 'CA/ON/Laurentian Hills',
  },
  {
    label: 'Deep River',
    value: 'CA/ON/Deep River',
  },
  {
    label: 'Mattawa',
    value: 'CA/ON/Mattawa',
  },
  {
    label: 'North Bay',
    value: 'CA/ON/North Bay',
  },
  {
    label: 'Kearney',
    value: 'CA/ON/Kearney',
  },
  {
    label: 'Parry Sound',
    value: 'CA/ON/Parry Sound',
  },
  {
    label: 'Gore Bay',
    value: 'CA/ON/Gore Bay',
  },
  {
    label: 'Espanola',
    value: 'CA/ON/Espanola',
  },
  {
    label: 'Greater Sudbury',
    value: 'CA/ON/Greater Sudbury',
  },
  {
    label: 'Latchford',
    value: 'CA/ON/Latchford',
  },
  {
    label: 'Cobalt',
    value: 'CA/ON/Cobalt',
  },
  {
    label: 'Temiskaming Shores',
    value: 'CA/ON/Temiskaming Shores',
  },
  {
    label: 'Englehart',
    value: 'CA/ON/Englehart',
  },
  {
    label: 'Kirkland Lake',
    value: 'CA/ON/Kirkland Lake',
  },
  {
    label: 'Timmins',
    value: 'CA/ON/Timmins',
  },
  {
    label: 'Iroquois Falls',
    value: 'CA/ON/Iroquois Falls',
  },
  {
    label: 'Cochrane',
    value: 'CA/ON/Cochrane',
  },
  {
    label: 'Smooth Rock Falls',
    value: 'CA/ON/Smooth Rock Falls',
  },
  {
    label: 'Kapuskasing',
    value: 'CA/ON/Kapuskasing',
  },
  {
    label: 'Hearst',
    value: 'CA/ON/Hearst',
  },
  {
    label: 'Moosonee',
    value: 'CA/ON/Moosonee',
  },
  {
    label: 'Bruce Mines',
    value: 'CA/ON/Bruce Mines',
  },
  {
    label: 'Thessalon',
    value: 'CA/ON/Thessalon',
  },
  {
    label: 'Blind River',
    value: 'CA/ON/Blind River',
  },
  {
    label: 'Spanish',
    value: 'CA/ON/Spanish',
  },
  {
    label: 'Elliot Lake',
    value: 'CA/ON/Elliot Lake',
  },
  {
    label: 'Sault Ste. Marie',
    value: 'CA/ON/Sault Ste. Marie',
  },
  {
    label: 'Thunder Bay',
    value: 'CA/ON/Thunder Bay',
  },
  {
    label: 'Marathon',
    value: 'CA/ON/Marathon',
  },
  {
    label: 'Atikokan',
    value: 'CA/ON/Atikokan',
  },
  {
    label: 'Fort Frances',
    value: 'CA/ON/Fort Frances',
  },
  {
    label: 'Rainy River',
    value: 'CA/ON/Rainy River',
  },
  {
    label: 'Kenora',
    value: 'CA/ON/Kenora',
  },
  {
    label: 'Dryden',
    value: 'CA/ON/Dryden',
  },
  {
    label: 'Lac du Bonnet',
    value: 'CA/MB/Lac du Bonnet',
  },
  {
    label: 'Powerview-Pine Falls',
    value: 'CA/MB/Powerview-Pine Falls',
  },
  {
    label: 'Steinbach',
    value: 'CA/MB/Steinbach',
  },
  {
    label: 'Niverville',
    value: 'CA/MB/Niverville',
  },
  {
    label: 'Ste. Anne',
    value: 'CA/MB/Ste. Anne',
  },
  {
    label: 'Altona',
    value: 'CA/MB/Altona',
  },
  {
    label: 'Winkler',
    value: 'CA/MB/Winkler',
  },
  {
    label: 'Morden',
    value: 'CA/MB/Morden',
  },
  {
    label: 'Morris',
    value: 'CA/MB/Morris',
  },
  {
    label: 'Carman',
    value: 'CA/MB/Carman',
  },
  {
    label: 'Melita',
    value: 'CA/MB/Melita',
  },
  {
    label: 'Virden',
    value: 'CA/MB/Virden',
  },
  {
    label: 'Brandon',
    value: 'CA/MB/Brandon',
  },
  {
    label: 'Carberry',
    value: 'CA/MB/Carberry',
  },
  {
    label: 'Portage la Prairie',
    value: 'CA/MB/Portage la Prairie',
  },
  {
    label: 'Winnipeg',
    value: 'CA/MB/Winnipeg',
  },
  {
    label: 'Beausejour',
    value: 'CA/MB/Beausejour',
  },
  {
    label: 'Selkirk',
    value: 'CA/MB/Selkirk',
  },
  {
    label: 'Stonewall',
    value: 'CA/MB/Stonewall',
  },
  {
    label: 'Teulon',
    value: 'CA/MB/Teulon',
  },
  {
    label: 'Neepawa',
    value: 'CA/MB/Neepawa',
  },
  {
    label: 'Minnedosa',
    value: 'CA/MB/Minnedosa',
  },
  {
    label: 'Dauphin',
    value: 'CA/MB/Dauphin',
  },
  {
    label: 'Winnipeg Beach',
    value: 'CA/MB/Winnipeg Beach',
  },
  {
    label: 'Arborg',
    value: 'CA/MB/Arborg',
  },
  {
    label: 'Swan River',
    value: 'CA/MB/Swan River',
  },
  {
    label: 'Grand Rapids',
    value: 'CA/MB/Grand Rapids',
  },
  {
    label: 'The Pas',
    value: 'CA/MB/The Pas',
  },
  {
    label: 'Flin Flon (Part)',
    value: 'CA/MB/Flin Flon (Part)',
  },
  {
    label: 'Snow Lake',
    value: 'CA/MB/Snow Lake',
  },
  {
    label: 'Thompson',
    value: 'CA/MB/Thompson',
  },
  {
    label: 'Gillam',
    value: 'CA/MB/Gillam',
  },
  {
    label: 'Leaf Rapids',
    value: 'CA/MB/Leaf Rapids',
  },
  {
    label: 'Lynn Lake',
    value: 'CA/MB/Lynn Lake',
  },
  {
    label: 'Churchill',
    value: 'CA/MB/Churchill',
  },
  {
    label: 'Carnduff',
    value: 'CA/SK/Carnduff',
  },
  {
    label: 'Oxbow',
    value: 'CA/SK/Oxbow',
  },
  {
    label: 'Bienfait',
    value: 'CA/SK/Bienfait',
  },
  {
    label: 'Estevan',
    value: 'CA/SK/Estevan',
  },
  {
    label: 'Lampman',
    value: 'CA/SK/Lampman',
  },
  {
    label: 'Alameda',
    value: 'CA/SK/Alameda',
  },
  {
    label: 'Redvers',
    value: 'CA/SK/Redvers',
  },
  {
    label: 'Carlyle',
    value: 'CA/SK/Carlyle',
  },
  {
    label: 'Arcola',
    value: 'CA/SK/Arcola',
  },
  {
    label: 'Stoughton',
    value: 'CA/SK/Stoughton',
  },
  {
    label: 'Wawota',
    value: 'CA/SK/Wawota',
  },
  {
    label: 'Bengough',
    value: 'CA/SK/Bengough',
  },
  {
    label: 'Radville',
    value: 'CA/SK/Radville',
  },
  {
    label: 'Midale',
    value: 'CA/SK/Midale',
  },
  {
    label: 'Weyburn',
    value: 'CA/SK/Weyburn',
  },
  {
    label: 'Ogema',
    value: 'CA/SK/Ogema',
  },
  {
    label: 'Milestone',
    value: 'CA/SK/Milestone',
  },
  {
    label: 'Yellow Grass',
    value: 'CA/SK/Yellow Grass',
  },
  {
    label: 'Coronach',
    value: 'CA/SK/Coronach',
  },
  {
    label: 'Rockglen',
    value: 'CA/SK/Rockglen',
  },
  {
    label: 'Willow Bunch',
    value: 'CA/SK/Willow Bunch',
  },
  {
    label: 'Assiniboia',
    value: 'CA/SK/Assiniboia',
  },
  {
    label: 'Lafleche',
    value: 'CA/SK/Lafleche',
  },
  {
    label: 'Ponteix',
    value: 'CA/SK/Ponteix',
  },
  {
    label: 'Gravelbourg',
    value: 'CA/SK/Gravelbourg',
  },
  {
    label: 'Mossbank',
    value: 'CA/SK/Mossbank',
  },
  {
    label: 'Eastend',
    value: 'CA/SK/Eastend',
  },
  {
    label: 'Shaunavon',
    value: 'CA/SK/Shaunavon',
  },
  {
    label: 'Maple Creek',
    value: 'CA/SK/Maple Creek',
  },
  {
    label: 'Fleming',
    value: 'CA/SK/Fleming',
  },
  {
    label: 'Moosomin',
    value: 'CA/SK/Moosomin',
  },
  {
    label: 'Wapella',
    value: 'CA/SK/Wapella',
  },
  {
    label: 'Kipling',
    value: 'CA/SK/Kipling',
  },
  {
    label: 'Wolseley',
    value: 'CA/SK/Wolseley',
  },
  {
    label: 'Grenfell',
    value: 'CA/SK/Grenfell',
  },
  {
    label: 'Broadview',
    value: 'CA/SK/Broadview',
  },
  {
    label: 'Whitewood',
    value: 'CA/SK/Whitewood',
  },
  {
    label: 'Rocanville',
    value: 'CA/SK/Rocanville',
  },
  {
    label: 'Langenburg',
    value: 'CA/SK/Langenburg',
  },
  {
    label: 'Esterhazy',
    value: 'CA/SK/Esterhazy',
  },
  {
    label: 'Lemberg',
    value: 'CA/SK/Lemberg',
  },
  {
    label: 'Melville',
    value: 'CA/SK/Melville',
  },
  {
    label: 'Saltcoats',
    value: 'CA/SK/Saltcoats',
  },
  {
    label: 'Bredenbury',
    value: 'CA/SK/Bredenbury',
  },
  {
    label: 'Churchbridge',
    value: 'CA/SK/Churchbridge',
  },
  {
    label: 'Francis',
    value: 'CA/SK/Francis',
  },
  {
    label: 'Rouleau',
    value: 'CA/SK/Rouleau',
  },
  {
    label: 'Pense',
    value: 'CA/SK/Pense',
  },
  {
    label: 'Regina',
    value: 'CA/SK/Regina',
  },
  {
    label: 'White City',
    value: 'CA/SK/White City',
  },
  {
    label: 'Pilot Butte',
    value: 'CA/SK/Pilot Butte',
  },
  {
    label: 'Balgonie',
    value: 'CA/SK/Balgonie',
  },
  {
    label: "Qu'Appelle",
    value: "CA/SK/Qu'Appelle",
  },
  {
    label: 'Indian Head',
    value: 'CA/SK/Indian Head',
  },
  {
    label: 'Sintaluta',
    value: 'CA/SK/Sintaluta',
  },
  {
    label: 'Balcarres',
    value: 'CA/SK/Balcarres',
  },
  {
    label: "Fort Qu'Appelle",
    value: "CA/SK/Fort Qu'Appelle",
  },
  {
    label: 'Lumsden',
    value: 'CA/SK/Lumsden',
  },
  {
    label: 'Regina Beach',
    value: 'CA/SK/Regina Beach',
  },
  {
    label: 'Strasbourg',
    value: 'CA/SK/Strasbourg',
  },
  {
    label: 'Southey',
    value: 'CA/SK/Southey',
  },
  {
    label: 'Cupar',
    value: 'CA/SK/Cupar',
  },
  {
    label: 'Herbert',
    value: 'CA/SK/Herbert',
  },
  {
    label: 'Morse',
    value: 'CA/SK/Morse',
  },
  {
    label: 'Moose Jaw',
    value: 'CA/SK/Moose Jaw',
  },
  {
    label: 'Central Butte',
    value: 'CA/SK/Central Butte',
  },
  {
    label: 'Craik',
    value: 'CA/SK/Craik',
  },
  {
    label: 'Swift Current',
    value: 'CA/SK/Swift Current',
  },
  {
    label: 'Gull Lake',
    value: 'CA/SK/Gull Lake',
  },
  {
    label: 'Cabri',
    value: 'CA/SK/Cabri',
  },
  {
    label: 'Kyle',
    value: 'CA/SK/Kyle',
  },
  {
    label: 'Leader',
    value: 'CA/SK/Leader',
  },
  {
    label: 'Burstall',
    value: 'CA/SK/Burstall',
  },
  {
    label: 'Eatonia',
    value: 'CA/SK/Eatonia',
  },
  {
    label: 'Eston',
    value: 'CA/SK/Eston',
  },
  {
    label: 'Elrose',
    value: 'CA/SK/Elrose',
  },
  {
    label: 'Yorkton',
    value: 'CA/SK/Yorkton',
  },
  {
    label: 'Springside',
    value: 'CA/SK/Springside',
  },
  {
    label: 'Canora',
    value: 'CA/SK/Canora',
  },
  {
    label: 'Kamsack',
    value: 'CA/SK/Kamsack',
  },
  {
    label: 'Preeceville',
    value: 'CA/SK/Preeceville',
  },
  {
    label: 'Sturgis',
    value: 'CA/SK/Sturgis',
  },
  {
    label: 'Norquay',
    value: 'CA/SK/Norquay',
  },
  {
    label: 'Ituna',
    value: 'CA/SK/Ituna',
  },
  {
    label: 'Raymore',
    value: 'CA/SK/Raymore',
  },
  {
    label: 'Foam Lake',
    value: 'CA/SK/Foam Lake',
  },
  {
    label: 'Wynyard',
    value: 'CA/SK/Wynyard',
  },
  {
    label: 'Leroy',
    value: 'CA/SK/Leroy',
  },
  {
    label: 'Watson',
    value: 'CA/SK/Watson',
  },
  {
    label: 'Wadena',
    value: 'CA/SK/Wadena',
  },
  {
    label: 'Govan',
    value: 'CA/SK/Govan',
  },
  {
    label: 'Imperial',
    value: 'CA/SK/Imperial',
  },
  {
    label: 'Davidson',
    value: 'CA/SK/Davidson',
  },
  {
    label: 'Outlook',
    value: 'CA/SK/Outlook',
  },
  {
    label: 'Hanley',
    value: 'CA/SK/Hanley',
  },
  {
    label: 'Nokomis',
    value: 'CA/SK/Nokomis',
  },
  {
    label: 'Lanigan',
    value: 'CA/SK/Lanigan',
  },
  {
    label: 'Watrous',
    value: 'CA/SK/Watrous',
  },
  {
    label: 'Dundurn',
    value: 'CA/SK/Dundurn',
  },
  {
    label: 'Saskatoon',
    value: 'CA/SK/Saskatoon',
  },
  {
    label: 'Langham',
    value: 'CA/SK/Langham',
  },
  {
    label: 'Warman',
    value: 'CA/SK/Warman',
  },
  {
    label: 'Martensville',
    value: 'CA/SK/Martensville',
  },
  {
    label: 'Allan',
    value: 'CA/SK/Allan',
  },
  {
    label: 'Dalmeny',
    value: 'CA/SK/Dalmeny',
  },
  {
    label: 'Osler',
    value: 'CA/SK/Osler',
  },
  {
    label: 'Colonsay',
    value: 'CA/SK/Colonsay',
  },
  {
    label: 'Rosetown',
    value: 'CA/SK/Rosetown',
  },
  {
    label: 'Zealandia',
    value: 'CA/SK/Zealandia',
  },
  {
    label: 'Biggar',
    value: 'CA/SK/Biggar',
  },
  {
    label: 'Delisle',
    value: 'CA/SK/Delisle',
  },
  {
    label: 'Asquith',
    value: 'CA/SK/Asquith',
  },
  {
    label: 'Battleford',
    value: 'CA/SK/Battleford',
  },
  {
    label: 'Kindersley',
    value: 'CA/SK/Kindersley',
  },
  {
    label: 'Kerrobert',
    value: 'CA/SK/Kerrobert',
  },
  {
    label: 'Luseland',
    value: 'CA/SK/Luseland',
  },
  {
    label: 'Macklin',
    value: 'CA/SK/Macklin',
  },
  {
    label: 'Scott',
    value: 'CA/SK/Scott',
  },
  {
    label: 'Wilkie',
    value: 'CA/SK/Wilkie',
  },
  {
    label: 'Unity',
    value: 'CA/SK/Unity',
  },
  {
    label: 'Cut Knife',
    value: 'CA/SK/Cut Knife',
  },
  {
    label: 'Hudson Bay',
    value: 'CA/SK/Hudson Bay',
  },
  {
    label: 'Porcupine Plain',
    value: 'CA/SK/Porcupine Plain',
  },
  {
    label: 'Kelvington',
    value: 'CA/SK/Kelvington',
  },
  {
    label: 'Rose Valley',
    value: 'CA/SK/Rose Valley',
  },
  {
    label: 'Naicam',
    value: 'CA/SK/Naicam',
  },
  {
    label: 'Tisdale',
    value: 'CA/SK/Tisdale',
  },
  {
    label: 'Star City',
    value: 'CA/SK/Star City',
  },
  {
    label: 'Melfort',
    value: 'CA/SK/Melfort',
  },
  {
    label: 'Arborfield',
    value: 'CA/SK/Arborfield',
  },
  {
    label: 'Carrot River',
    value: 'CA/SK/Carrot River',
  },
  {
    label: 'Nipawin',
    value: 'CA/SK/Nipawin',
  },
  {
    label: 'Choiceland',
    value: 'CA/SK/Choiceland',
  },
  {
    label: 'Humboldt',
    value: 'CA/SK/Humboldt',
  },
  {
    label: 'Bruno',
    value: 'CA/SK/Bruno',
  },
  {
    label: 'Vonda',
    value: 'CA/SK/Vonda',
  },
  {
    label: 'Aberdeen',
    value: 'CA/SK/Aberdeen',
  },
  {
    label: 'Hepburn',
    value: 'CA/SK/Hepburn',
  },
  {
    label: 'Waldheim',
    value: 'CA/SK/Waldheim',
  },
  {
    label: 'Rosthern',
    value: 'CA/SK/Rosthern',
  },
  {
    label: 'Hague',
    value: 'CA/SK/Hague',
  },
  {
    label: 'Cudworth',
    value: 'CA/SK/Cudworth',
  },
  {
    label: 'Wakaw',
    value: 'CA/SK/Wakaw',
  },
  {
    label: 'St. Brieux',
    value: 'CA/SK/St. Brieux',
  },
  {
    label: 'Duck Lake',
    value: 'CA/SK/Duck Lake',
  },
  {
    label: 'Prince Albert',
    value: 'CA/SK/Prince Albert',
  },
  {
    label: 'Birch Hills',
    value: 'CA/SK/Birch Hills',
  },
  {
    label: 'Kinistino',
    value: 'CA/SK/Kinistino',
  },
  {
    label: 'Radisson',
    value: 'CA/SK/Radisson',
  },
  {
    label: 'Blaine Lake',
    value: 'CA/SK/Blaine Lake',
  },
  {
    label: 'Hafford',
    value: 'CA/SK/Hafford',
  },
  {
    label: 'North Battleford',
    value: 'CA/SK/North Battleford',
  },
  {
    label: 'Shellbrook',
    value: 'CA/SK/Shellbrook',
  },
  {
    label: 'Spiritwood',
    value: 'CA/SK/Spiritwood',
  },
  {
    label: 'Big River',
    value: 'CA/SK/Big River',
  },
  {
    label: 'Maidstone',
    value: 'CA/SK/Maidstone',
  },
  {
    label: 'Lashburn',
    value: 'CA/SK/Lashburn',
  },
  {
    label: 'Marshall',
    value: 'CA/SK/Marshall',
  },
  {
    label: 'Lloydminster (Part)',
    value: 'CA/SK/Lloydminster (Part)',
  },
  {
    label: 'St. Walburg',
    value: 'CA/SK/St. Walburg',
  },
  {
    label: 'Turtleford',
    value: 'CA/SK/Turtleford',
  },
  {
    label: 'Meadow Lake',
    value: 'CA/SK/Meadow Lake',
  },
  {
    label: 'La Ronge',
    value: 'CA/SK/La Ronge',
  },
  {
    label: 'Creighton',
    value: 'CA/SK/Creighton',
  },
  {
    label: 'Flin Flon (Part)',
    value: 'CA/SK/Flin Flon (Part)',
  },
  {
    label: 'Medicine Hat',
    value: 'CA/AB/Medicine Hat',
  },
  {
    label: 'Bow Island',
    value: 'CA/AB/Bow Island',
  },
  {
    label: 'Redcliff',
    value: 'CA/AB/Redcliff',
  },
  {
    label: 'Milk River',
    value: 'CA/AB/Milk River',
  },
  {
    label: 'Raymond',
    value: 'CA/AB/Raymond',
  },
  {
    label: 'Lethbridge',
    value: 'CA/AB/Lethbridge',
  },
  {
    label: 'Coalhurst',
    value: 'CA/AB/Coalhurst',
  },
  {
    label: 'Picture Butte',
    value: 'CA/AB/Picture Butte',
  },
  {
    label: 'Coaldale',
    value: 'CA/AB/Coaldale',
  },
  {
    label: 'Taber',
    value: 'CA/AB/Taber',
  },
  {
    label: 'Vauxhall',
    value: 'CA/AB/Vauxhall',
  },
  {
    label: 'Brooks',
    value: 'CA/AB/Brooks',
  },
  {
    label: 'Bassano',
    value: 'CA/AB/Bassano',
  },
  {
    label: 'Magrath',
    value: 'CA/AB/Magrath',
  },
  {
    label: 'Cardston',
    value: 'CA/AB/Cardston',
  },
  {
    label: 'Pincher Creek',
    value: 'CA/AB/Pincher Creek',
  },
  {
    label: 'Fort Macleod',
    value: 'CA/AB/Fort Macleod',
  },
  {
    label: 'Granum',
    value: 'CA/AB/Granum',
  },
  {
    label: 'Claresholm',
    value: 'CA/AB/Claresholm',
  },
  {
    label: 'Stavely',
    value: 'CA/AB/Stavely',
  },
  {
    label: 'Nanton',
    value: 'CA/AB/Nanton',
  },
  {
    label: 'Hanna',
    value: 'CA/AB/Hanna',
  },
  {
    label: 'Oyen',
    value: 'CA/AB/Oyen',
  },
  {
    label: 'Vulcan',
    value: 'CA/AB/Vulcan',
  },
  {
    label: 'Strathmore',
    value: 'CA/AB/Strathmore',
  },
  {
    label: 'Drumheller',
    value: 'CA/AB/Drumheller',
  },
  {
    label: 'Three Hills',
    value: 'CA/AB/Three Hills',
  },
  {
    label: 'Trochu',
    value: 'CA/AB/Trochu',
  },
  {
    label: 'High River',
    value: 'CA/AB/High River',
  },
  {
    label: 'Turner Valley',
    value: 'CA/AB/Turner Valley',
  },
  {
    label: 'Black Diamond',
    value: 'CA/AB/Black Diamond',
  },
  {
    label: 'Okotoks',
    value: 'CA/AB/Okotoks',
  },
  {
    label: 'Calgary',
    value: 'CA/AB/Calgary',
  },
  {
    label: 'Chestermere',
    value: 'CA/AB/Chestermere',
  },
  {
    label: 'Cochrane',
    value: 'CA/AB/Cochrane',
  },
  {
    label: 'Airdrie',
    value: 'CA/AB/Airdrie',
  },
  {
    label: 'Irricana',
    value: 'CA/AB/Irricana',
  },
  {
    label: 'Crossfield',
    value: 'CA/AB/Crossfield',
  },
  {
    label: 'Carstairs',
    value: 'CA/AB/Carstairs',
  },
  {
    label: 'Didsbury',
    value: 'CA/AB/Didsbury',
  },
  {
    label: 'Olds',
    value: 'CA/AB/Olds',
  },
  {
    label: 'Sundre',
    value: 'CA/AB/Sundre',
  },
  {
    label: 'Provost',
    value: 'CA/AB/Provost',
  },
  {
    label: 'Coronation',
    value: 'CA/AB/Coronation',
  },
  {
    label: 'Castor',
    value: 'CA/AB/Castor',
  },
  {
    label: 'Stettler',
    value: 'CA/AB/Stettler',
  },
  {
    label: 'Daysland',
    value: 'CA/AB/Daysland',
  },
  {
    label: 'Killam',
    value: 'CA/AB/Killam',
  },
  {
    label: 'Sedgewick',
    value: 'CA/AB/Sedgewick',
  },
  {
    label: 'Hardisty',
    value: 'CA/AB/Hardisty',
  },
  {
    label: 'Wainwright',
    value: 'CA/AB/Wainwright',
  },
  {
    label: 'Bowden',
    value: 'CA/AB/Bowden',
  },
  {
    label: 'Innisfail',
    value: 'CA/AB/Innisfail',
  },
  {
    label: 'Penhold',
    value: 'CA/AB/Penhold',
  },
  {
    label: 'Red Deer',
    value: 'CA/AB/Red Deer',
  },
  {
    label: 'Sylvan Lake',
    value: 'CA/AB/Sylvan Lake',
  },
  {
    label: 'Eckville',
    value: 'CA/AB/Eckville',
  },
  {
    label: 'Bentley',
    value: 'CA/AB/Bentley',
  },
  {
    label: 'Blackfalds',
    value: 'CA/AB/Blackfalds',
  },
  {
    label: 'Lacombe',
    value: 'CA/AB/Lacombe',
  },
  {
    label: 'Ponoka',
    value: 'CA/AB/Ponoka',
  },
  {
    label: 'Rimbey',
    value: 'CA/AB/Rimbey',
  },
  {
    label: 'Rocky Mountain House',
    value: 'CA/AB/Rocky Mountain House',
  },
  {
    label: 'Bashaw',
    value: 'CA/AB/Bashaw',
  },
  {
    label: 'Camrose',
    value: 'CA/AB/Camrose',
  },
  {
    label: 'Tofield',
    value: 'CA/AB/Tofield',
  },
  {
    label: 'Viking',
    value: 'CA/AB/Viking',
  },
  {
    label: 'Vegreville',
    value: 'CA/AB/Vegreville',
  },
  {
    label: 'Lloydminster (Part)',
    value: 'CA/AB/Lloydminster (Part)',
  },
  {
    label: 'Vermilion',
    value: 'CA/AB/Vermilion',
  },
  {
    label: 'Two Hills',
    value: 'CA/AB/Two Hills',
  },
  {
    label: 'Mundare',
    value: 'CA/AB/Mundare',
  },
  {
    label: 'Lamont',
    value: 'CA/AB/Lamont',
  },
  {
    label: 'Bruderheim',
    value: 'CA/AB/Bruderheim',
  },
  {
    label: 'Wetaskiwin',
    value: 'CA/AB/Wetaskiwin',
  },
  {
    label: 'Millet',
    value: 'CA/AB/Millet',
  },
  {
    label: 'Beaumont',
    value: 'CA/AB/Beaumont',
  },
  {
    label: 'Leduc',
    value: 'CA/AB/Leduc',
  },
  {
    label: 'Devon',
    value: 'CA/AB/Devon',
  },
  {
    label: 'Calmar',
    value: 'CA/AB/Calmar',
  },
  {
    label: 'Drayton Valley',
    value: 'CA/AB/Drayton Valley',
  },
  {
    label: 'Stony Plain',
    value: 'CA/AB/Stony Plain',
  },
  {
    label: 'Spruce Grove',
    value: 'CA/AB/Spruce Grove',
  },
  {
    label: 'Fort Saskatchewan',
    value: 'CA/AB/Fort Saskatchewan',
  },
  {
    label: 'Edmonton',
    value: 'CA/AB/Edmonton',
  },
  {
    label: 'St. Albert',
    value: 'CA/AB/St. Albert',
  },
  {
    label: 'Gibbons',
    value: 'CA/AB/Gibbons',
  },
  {
    label: 'Redwater',
    value: 'CA/AB/Redwater',
  },
  {
    label: 'Bon Accord',
    value: 'CA/AB/Bon Accord',
  },
  {
    label: 'Morinville',
    value: 'CA/AB/Morinville',
  },
  {
    label: 'Legal',
    value: 'CA/AB/Legal',
  },
  {
    label: 'Cold Lake',
    value: 'CA/AB/Cold Lake',
  },
  {
    label: 'Bonnyville',
    value: 'CA/AB/Bonnyville',
  },
  {
    label: 'Elk Point',
    value: 'CA/AB/Elk Point',
  },
  {
    label: 'St. Paul',
    value: 'CA/AB/St. Paul',
  },
  {
    label: 'Smoky Lake',
    value: 'CA/AB/Smoky Lake',
  },
  {
    label: 'Mayerthorpe',
    value: 'CA/AB/Mayerthorpe',
  },
  {
    label: 'Onoway',
    value: 'CA/AB/Onoway',
  },
  {
    label: 'Barrhead',
    value: 'CA/AB/Barrhead',
  },
  {
    label: 'Whitecourt',
    value: 'CA/AB/Whitecourt',
  },
  {
    label: 'Westlock',
    value: 'CA/AB/Westlock',
  },
  {
    label: 'Athabasca',
    value: 'CA/AB/Athabasca',
  },
  {
    label: 'Hinton',
    value: 'CA/AB/Hinton',
  },
  {
    label: 'Edson',
    value: 'CA/AB/Edson',
  },
  {
    label: 'Canmore',
    value: 'CA/AB/Canmore',
  },
  {
    label: 'Banff',
    value: 'CA/AB/Banff',
  },
  {
    label: 'High Prairie',
    value: 'CA/AB/High Prairie',
  },
  {
    label: 'Swan Hills',
    value: 'CA/AB/Swan Hills',
  },
  {
    label: 'Slave Lake',
    value: 'CA/AB/Slave Lake',
  },
  {
    label: 'Manning',
    value: 'CA/AB/Manning',
  },
  {
    label: 'High Level',
    value: 'CA/AB/High Level',
  },
  {
    label: 'Rainbow Lake',
    value: 'CA/AB/Rainbow Lake',
  },
  {
    label: 'Fox Creek',
    value: 'CA/AB/Fox Creek',
  },
  {
    label: 'Grande Cache',
    value: 'CA/AB/Grande Cache',
  },
  {
    label: 'Valleyview',
    value: 'CA/AB/Valleyview',
  },
  {
    label: 'Beaverlodge',
    value: 'CA/AB/Beaverlodge',
  },
  {
    label: 'Wembley',
    value: 'CA/AB/Wembley',
  },
  {
    label: 'Grande Prairie',
    value: 'CA/AB/Grande Prairie',
  },
  {
    label: 'Sexsmith',
    value: 'CA/AB/Sexsmith',
  },
  {
    label: 'Peace River',
    value: 'CA/AB/Peace River',
  },
  {
    label: 'McLennan',
    value: 'CA/AB/McLennan',
  },
  {
    label: 'Falher',
    value: 'CA/AB/Falher',
  },
  {
    label: 'Spirit River',
    value: 'CA/AB/Spirit River',
  },
  {
    label: 'Fairview',
    value: 'CA/AB/Fairview',
  },
  {
    label: 'Grimshaw',
    value: 'CA/AB/Grimshaw',
  },
  {
    label: 'Fernie',
    value: 'CA/BC/Fernie',
  },
  {
    label: 'Cranbrook',
    value: 'CA/BC/Cranbrook',
  },
  {
    label: 'Kimberley',
    value: 'CA/BC/Kimberley',
  },
  {
    label: 'Creston',
    value: 'CA/BC/Creston',
  },
  {
    label: 'Nelson',
    value: 'CA/BC/Nelson',
  },
  {
    label: 'Castlegar',
    value: 'CA/BC/Castlegar',
  },
  {
    label: 'Trail',
    value: 'CA/BC/Trail',
  },
  {
    label: 'Rossland',
    value: 'CA/BC/Rossland',
  },
  {
    label: 'Grand Forks',
    value: 'CA/BC/Grand Forks',
  },
  {
    label: 'Greenwood',
    value: 'CA/BC/Greenwood',
  },
  {
    label: 'Osoyoos',
    value: 'CA/BC/Osoyoos',
  },
  {
    label: 'Oliver',
    value: 'CA/BC/Oliver',
  },
  {
    label: 'Princeton',
    value: 'CA/BC/Princeton',
  },
  {
    label: 'Penticton',
    value: 'CA/BC/Penticton',
  },
  {
    label: 'Chilliwack',
    value: 'CA/BC/Chilliwack',
  },
  {
    label: 'Abbotsford',
    value: 'CA/BC/Abbotsford',
  },
  {
    label: 'Langley',
    value: 'CA/BC/Langley',
  },
  {
    label: 'Surrey',
    value: 'CA/BC/Surrey',
  },
  {
    label: 'White Rock',
    value: 'CA/BC/White Rock',
  },
  {
    label: 'Richmond',
    value: 'CA/BC/Richmond',
  },
  {
    label: 'Vancouver',
    value: 'CA/BC/Vancouver',
  },
  {
    label: 'Burnaby',
    value: 'CA/BC/Burnaby',
  },
  {
    label: 'New Westminster',
    value: 'CA/BC/New Westminster',
  },
  {
    label: 'Coquitlam',
    value: 'CA/BC/Coquitlam',
  },
  {
    label: 'Port Coquitlam',
    value: 'CA/BC/Port Coquitlam',
  },
  {
    label: 'Port Moody',
    value: 'CA/BC/Port Moody',
  },
  {
    label: 'North Vancouver',
    value: 'CA/BC/North Vancouver',
  },
  {
    label: 'Pitt Meadows',
    value: 'CA/BC/Pitt Meadows',
  },
  {
    label: 'Maple Ridge',
    value: 'CA/BC/Maple Ridge',
  },
  {
    label: 'Sidney',
    value: 'CA/BC/Sidney',
  },
  {
    label: 'Victoria',
    value: 'CA/BC/Victoria',
  },
  {
    label: 'Colwood',
    value: 'CA/BC/Colwood',
  },
  {
    label: 'Langford',
    value: 'CA/BC/Langford',
  },
  {
    label: 'View Royal',
    value: 'CA/BC/View Royal',
  },
  {
    label: 'Duncan',
    value: 'CA/BC/Duncan',
  },
  {
    label: 'Lake Cowichan',
    value: 'CA/BC/Lake Cowichan',
  },
  {
    label: 'Ladysmith',
    value: 'CA/BC/Ladysmith',
  },
  {
    label: 'Nanaimo',
    value: 'CA/BC/Nanaimo',
  },
  {
    label: 'Parksville',
    value: 'CA/BC/Parksville',
  },
  {
    label: 'Qualicum Beach',
    value: 'CA/BC/Qualicum Beach',
  },
  {
    label: 'Port Alberni',
    value: 'CA/BC/Port Alberni',
  },
  {
    label: 'Campbell River',
    value: 'CA/BC/Campbell River',
  },
  {
    label: 'Comox',
    value: 'CA/BC/Comox',
  },
  {
    label: 'Courtenay',
    value: 'CA/BC/Courtenay',
  },
  {
    label: 'Powell River',
    value: 'CA/BC/Powell River',
  },
  {
    label: 'Gibsons',
    value: 'CA/BC/Gibsons',
  },
  {
    label: 'Merritt',
    value: 'CA/BC/Merritt',
  },
  {
    label: 'Kamloops',
    value: 'CA/BC/Kamloops',
  },
  {
    label: 'Kelowna',
    value: 'CA/BC/Kelowna',
  },
  {
    label: 'Vernon',
    value: 'CA/BC/Vernon',
  },
  {
    label: 'Armstrong',
    value: 'CA/BC/Armstrong',
  },
  {
    label: 'Enderby',
    value: 'CA/BC/Enderby',
  },
  {
    label: 'Golden',
    value: 'CA/BC/Golden',
  },
  {
    label: 'Revelstoke',
    value: 'CA/BC/Revelstoke',
  },
  {
    label: 'Salmon Arm',
    value: 'CA/BC/Salmon Arm',
  },
  {
    label: 'Williams Lake',
    value: 'CA/BC/Williams Lake',
  },
  {
    label: 'Quesnel',
    value: 'CA/BC/Quesnel',
  },
  {
    label: 'Port McNeill',
    value: 'CA/BC/Port McNeill',
  },
  {
    label: 'Prince Rupert',
    value: 'CA/BC/Prince Rupert',
  },
  {
    label: 'Terrace',
    value: 'CA/BC/Terrace',
  },
  {
    label: 'Smithers',
    value: 'CA/BC/Smithers',
  },
  {
    label: 'Prince George',
    value: 'CA/BC/Prince George',
  },
  {
    label: 'Dawson Creek',
    value: 'CA/BC/Dawson Creek',
  },
  {
    label: 'Fort St. John',
    value: 'CA/BC/Fort St. John',
  },
  {
    label: 'Watson Lake',
    value: 'CA/YT/Watson Lake',
  },
  {
    label: 'Faro',
    value: 'CA/YT/Faro',
  },
  {
    label: 'Whitehorse',
    value: 'CA/YT/Whitehorse',
  },
  {
    label: 'Dawson',
    value: 'CA/YT/Dawson',
  },
  {
    label: 'Inuvik',
    value: 'CA/NT/Inuvik',
  },
  {
    label: 'Norman Wells',
    value: 'CA/NT/Norman Wells',
  },
  {
    label: 'Fort Smith',
    value: 'CA/NT/Fort Smith',
  },
  {
    label: 'Hay River',
    value: 'CA/NT/Hay River',
  },
  {
    label: 'Yellowknife',
    value: 'CA/NT/Yellowknife',
  },
  {
    label: 'Iqaluit',
    value: 'CA/NU/Iqaluit',
  },
].sort((a, b) => a.label.localeCompare(b.label));
