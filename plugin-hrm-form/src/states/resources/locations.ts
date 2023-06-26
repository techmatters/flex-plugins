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
    label: 'Saint-Léonard',
    value: 'CA/NB/Saint-Léonard',
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
    label: 'Lamèque',
    value: 'CA/NB/Lamèque',
  },
  {
    label: 'Les Îles-de-la-Madeleine',
    value: 'CA/QC/Les Îles-de-la-Madeleine',
  },
  {
    label: 'Grosse-Île',
    value: 'CA/QC/Grosse-Île',
  },
  {
    label: 'Percé',
    value: 'CA/QC/Percé',
  },
  {
    label: 'Sainte-Thérèse-de-Gaspé',
    value: 'CA/QC/Sainte-Thérèse-de-Gaspé',
  },
  {
    label: 'Grande-Rivière',
    value: 'CA/QC/Grande-Rivière',
  },
  {
    label: 'Chandler',
    value: 'CA/QC/Chandler',
  },
  {
    label: 'Port-Daniel--Gascons',
    value: 'CA/QC/Port-Daniel--Gascons',
  },
  {
    label: 'Gaspé',
    value: 'CA/QC/Gaspé',
  },
  {
    label: 'Petite-Vallée',
    value: 'CA/QC/Petite-Vallée',
  },
  {
    label: 'Grande-Vallée',
    value: 'CA/QC/Grande-Vallée',
  },
  {
    label: 'Murdochville',
    value: 'CA/QC/Murdochville',
  },
  {
    label: 'Sainte-Madeleine-de-la-Rivière-Madeleine',
    value: 'CA/QC/Sainte-Madeleine-de-la-Rivière-Madeleine',
  },
  {
    label: 'Saint-Maxime-du-Mont-Louis',
    value: 'CA/QC/Saint-Maxime-du-Mont-Louis',
  },
  {
    label: 'Rivière-à-Claude',
    value: 'CA/QC/Rivière-à-Claude',
  },
  {
    label: 'La Martre',
    value: 'CA/QC/La Martre',
  },
  {
    label: 'Sainte-Anne-des-Monts',
    value: 'CA/QC/Sainte-Anne-des-Monts',
  },
  {
    label: 'Cap-Chat',
    value: 'CA/QC/Cap-Chat',
  },
  {
    label: 'Shigawake',
    value: 'CA/QC/Shigawake',
  },
  {
    label: 'Hope Town',
    value: 'CA/QC/Hope Town',
  },
  {
    label: 'Paspébiac',
    value: 'CA/QC/Paspébiac',
  },
  {
    label: 'New Carlisle',
    value: 'CA/QC/New Carlisle',
  },
  {
    label: 'Bonaventure',
    value: 'CA/QC/Bonaventure',
  },
  {
    label: 'Saint-Elzéar',
    value: 'CA/QC/Saint-Elzéar',
  },
  {
    label: 'Caplan',
    value: 'CA/QC/Caplan',
  },
  {
    label: 'Saint-Alphonse',
    value: 'CA/QC/Saint-Alphonse',
  },
  {
    label: 'New Richmond',
    value: 'CA/QC/New Richmond',
  },
  {
    label: 'Cascapédia--Saint-Jules',
    value: 'CA/QC/Cascapédia--Saint-Jules',
  },
  {
    label: 'Maria',
    value: 'CA/QC/Maria',
  },
  {
    label: 'Carleton-sur-Mer',
    value: 'CA/QC/Carleton-sur-Mer',
  },
  {
    label: 'Nouvelle',
    value: 'CA/QC/Nouvelle',
  },
  {
    label: 'Escuminac',
    value: 'CA/QC/Escuminac',
  },
  {
    label: 'Pointe-à-la-Croix',
    value: 'CA/QC/Pointe-à-la-Croix',
  },
  {
    label: 'Saint-André-de-Restigouche',
    value: 'CA/QC/Saint-André-de-Restigouche',
  },
  {
    label: 'Matapédia',
    value: 'CA/QC/Matapédia',
  },
  {
    label: 'Saint-Alexis-de-Matapédia',
    value: 'CA/QC/Saint-Alexis-de-Matapédia',
  },
  {
    label: "Saint-François-d'Assise",
    value: "CA/QC/Saint-François-d'Assise",
  },
  {
    label: "L'Ascension-de-Patapédia",
    value: "CA/QC/L'Ascension-de-Patapédia",
  },
  {
    label: 'Sainte-Marguerite-Marie',
    value: 'CA/QC/Sainte-Marguerite-Marie',
  },
  {
    label: 'Sainte-Florence',
    value: 'CA/QC/Sainte-Florence',
  },
  {
    label: 'Causapscal',
    value: 'CA/QC/Causapscal',
  },
  {
    label: 'Albertville',
    value: 'CA/QC/Albertville',
  },
  {
    label: 'Amqui',
    value: 'CA/QC/Amqui',
  },
  {
    label: 'Lac-au-Saumon',
    value: 'CA/QC/Lac-au-Saumon',
  },
  {
    label: 'Saint-Vianney',
    value: 'CA/QC/Saint-Vianney',
  },
  {
    label: 'Val-Brillant',
    value: 'CA/QC/Val-Brillant',
  },
  {
    label: 'Sayabec',
    value: 'CA/QC/Sayabec',
  },
  {
    label: 'Les Méchins',
    value: 'CA/QC/Les Méchins',
  },
  {
    label: 'Grosses-Roches',
    value: 'CA/QC/Grosses-Roches',
  },
  {
    label: 'Sainte-Félicité',
    value: 'CA/QC/Sainte-Félicité',
  },
  {
    label: 'Saint-René-de-Matane',
    value: 'CA/QC/Saint-René-de-Matane',
  },
  {
    label: 'Sainte-Paule',
    value: 'CA/QC/Sainte-Paule',
  },
  {
    label: 'Matane',
    value: 'CA/QC/Matane',
  },
  {
    label: 'Saint-Ulric',
    value: 'CA/QC/Saint-Ulric',
  },
  {
    label: 'Baie-des-Sables',
    value: 'CA/QC/Baie-des-Sables',
  },
  {
    label: 'Les Hauteurs',
    value: 'CA/QC/Les Hauteurs',
  },
  {
    label: 'Saint-Gabriel-de-Rimouski',
    value: 'CA/QC/Saint-Gabriel-de-Rimouski',
  },
  {
    label: 'Sainte-Angèle-de-Mérici',
    value: 'CA/QC/Sainte-Angèle-de-Mérici',
  },
  {
    label: 'Padoue',
    value: 'CA/QC/Padoue',
  },
  {
    label: 'Métis-sur-Mer',
    value: 'CA/QC/Métis-sur-Mer',
  },
  {
    label: 'Grand-Métis',
    value: 'CA/QC/Grand-Métis',
  },
  {
    label: 'Mont-Joli',
    value: 'CA/QC/Mont-Joli',
  },
  {
    label: 'Sainte-Luce',
    value: 'CA/QC/Sainte-Luce',
  },
  {
    label: 'Esprit-Saint',
    value: 'CA/QC/Esprit-Saint',
  },
  {
    label: 'Rimouski',
    value: 'CA/QC/Rimouski',
  },
  {
    label: 'Saint-Jean-de-Dieu',
    value: 'CA/QC/Saint-Jean-de-Dieu',
  },
  {
    label: 'Sainte-Rita',
    value: 'CA/QC/Sainte-Rita',
  },
  {
    label: 'Saint-Guy',
    value: 'CA/QC/Saint-Guy',
  },
  {
    label: 'Saint-Médard',
    value: 'CA/QC/Saint-Médard',
  },
  {
    label: 'Trois-Pistoles',
    value: 'CA/QC/Trois-Pistoles',
  },
  {
    label: 'Notre-Dame-des-Neiges',
    value: 'CA/QC/Notre-Dame-des-Neiges',
  },
  {
    label: 'Saint-Cyprien',
    value: 'CA/QC/Saint-Cyprien',
  },
  {
    label: 'Saint-Hubert-de-Rivière-du-Loup',
    value: 'CA/QC/Saint-Hubert-de-Rivière-du-Loup',
  },
  {
    label: 'Saint-Antonin',
    value: 'CA/QC/Saint-Antonin',
  },
  {
    label: 'Saint-Modeste',
    value: 'CA/QC/Saint-Modeste',
  },
  {
    label: 'Saint-François-Xavier-de-Viger',
    value: 'CA/QC/Saint-François-Xavier-de-Viger',
  },
  {
    label: 'Saint-Épiphane',
    value: 'CA/QC/Saint-Épiphane',
  },
  {
    label: "L'Isle-Verte",
    value: "CA/QC/L'Isle-Verte",
  },
  {
    label: 'Cacouna',
    value: 'CA/QC/Cacouna',
  },
  {
    label: 'Rivière-du-Loup',
    value: 'CA/QC/Rivière-du-Loup',
  },
  {
    label: 'Notre-Dame-du-Portage',
    value: 'CA/QC/Notre-Dame-du-Portage',
  },
  {
    label: 'Dégelis',
    value: 'CA/QC/Dégelis',
  },
  {
    label: 'Saint-Jean-de-la-Lande',
    value: 'CA/QC/Saint-Jean-de-la-Lande',
  },
  {
    label: 'Rivière-Bleue',
    value: 'CA/QC/Rivière-Bleue',
  },
  {
    label: 'Saint-Juste-du-Lac',
    value: 'CA/QC/Saint-Juste-du-Lac',
  },
  {
    label: 'Auclair',
    value: 'CA/QC/Auclair',
  },
  {
    label: 'Lejeune',
    value: 'CA/QC/Lejeune',
  },
  {
    label: 'Biencourt',
    value: 'CA/QC/Biencourt',
  },
  {
    label: 'Lac-des-Aigles',
    value: 'CA/QC/Lac-des-Aigles',
  },
  {
    label: 'Saint-Michel-du-Squatec',
    value: 'CA/QC/Saint-Michel-du-Squatec',
  },
  {
    label: 'Témiscouata-sur-le-Lac',
    value: 'CA/QC/Témiscouata-sur-le-Lac',
  },
  {
    label: 'Saint-Pierre-de-Lamy',
    value: 'CA/QC/Saint-Pierre-de-Lamy',
  },
  {
    label: 'Saint-Elzéar-de-Témiscouata',
    value: 'CA/QC/Saint-Elzéar-de-Témiscouata',
  },
  {
    label: 'Saint-Honoré-de-Témiscouata',
    value: 'CA/QC/Saint-Honoré-de-Témiscouata',
  },
  {
    label: 'Pohénégamook',
    value: 'CA/QC/Pohénégamook',
  },
  {
    label: 'Saint-Athanase',
    value: 'CA/QC/Saint-Athanase',
  },
  {
    label: 'Mont-Carmel',
    value: 'CA/QC/Mont-Carmel',
  },
  {
    label: 'Saint-Bruno-de-Kamouraska',
    value: 'CA/QC/Saint-Bruno-de-Kamouraska',
  },
  {
    label: 'Saint-Pascal',
    value: 'CA/QC/Saint-Pascal',
  },
  {
    label: 'Sainte-Hélène-de-Kamouraska',
    value: 'CA/QC/Sainte-Hélène-de-Kamouraska',
  },
  {
    label: 'Saint-Alexandre-de-Kamouraska',
    value: 'CA/QC/Saint-Alexandre-de-Kamouraska',
  },
  {
    label: 'Saint-André',
    value: 'CA/QC/Saint-André',
  },
  {
    label: 'Kamouraska',
    value: 'CA/QC/Kamouraska',
  },
  {
    label: 'Saint-Denis-De La Bouteillerie',
    value: 'CA/QC/Saint-Denis-De La Bouteillerie',
  },
  {
    label: 'Rivière-Ouelle',
    value: 'CA/QC/Rivière-Ouelle',
  },
  {
    label: 'Saint-Pacôme',
    value: 'CA/QC/Saint-Pacôme',
  },
  {
    label: 'Saint-Gabriel-Lalemant',
    value: 'CA/QC/Saint-Gabriel-Lalemant',
  },
  {
    label: "Saint-Onésime-d'Ixworth",
    value: "CA/QC/Saint-Onésime-d'Ixworth",
  },
  {
    label: 'La Pocatière',
    value: 'CA/QC/La Pocatière',
  },
  {
    label: 'La Malbaie',
    value: 'CA/QC/La Malbaie',
  },
  {
    label: 'Notre-Dame-des-Monts',
    value: 'CA/QC/Notre-Dame-des-Monts',
  },
  {
    label: 'Saint-Aimé-des-Lacs',
    value: 'CA/QC/Saint-Aimé-des-Lacs',
  },
  {
    label: 'Clermont',
    value: 'CA/QC/Clermont',
  },
  {
    label: 'Saint-Siméon',
    value: 'CA/QC/Saint-Siméon',
  },
  {
    label: 'Baie-Sainte-Catherine',
    value: 'CA/QC/Baie-Sainte-Catherine',
  },
  {
    label: 'Petite-Rivière-Saint-François',
    value: 'CA/QC/Petite-Rivière-Saint-François',
  },
  {
    label: 'Baie-Saint-Paul',
    value: 'CA/QC/Baie-Saint-Paul',
  },
  {
    label: "L'Isle-aux-Coudres",
    value: "CA/QC/L'Isle-aux-Coudres",
  },
  {
    label: 'Les Éboulements',
    value: 'CA/QC/Les Éboulements',
  },
  {
    label: 'Saint-Omer',
    value: 'CA/QC/Saint-Omer',
  },
  {
    label: 'Saint-Pamphile',
    value: 'CA/QC/Saint-Pamphile',
  },
  {
    label: 'Saint-Adalbert',
    value: 'CA/QC/Saint-Adalbert',
  },
  {
    label: 'Saint-Marcel',
    value: 'CA/QC/Saint-Marcel',
  },
  {
    label: 'Sainte-Félicité',
    value: 'CA/QC/Sainte-Félicité',
  },
  {
    label: 'Sainte-Perpétue',
    value: 'CA/QC/Sainte-Perpétue',
  },
  {
    label: 'Tourville',
    value: 'CA/QC/Tourville',
  },
  {
    label: "Saint-Damase-de-L'Islet",
    value: "CA/QC/Saint-Damase-de-L'Islet",
  },
  {
    label: 'Saint-Aubert',
    value: 'CA/QC/Saint-Aubert',
  },
  {
    label: 'Saint-Jean-Port-Joli',
    value: 'CA/QC/Saint-Jean-Port-Joli',
  },
  {
    label: "L'Islet",
    value: "CA/QC/L'Islet",
  },
  {
    label: 'Saint-Just-de-Bretenières',
    value: 'CA/QC/Saint-Just-de-Bretenières',
  },
  {
    label: 'Lac-Frontière',
    value: 'CA/QC/Lac-Frontière',
  },
  {
    label: 'Sainte-Lucie-de-Beauregard',
    value: 'CA/QC/Sainte-Lucie-de-Beauregard',
  },
  {
    label: 'Saint-Paul-de-Montminy',
    value: 'CA/QC/Saint-Paul-de-Montminy',
  },
  {
    label: 'Sainte-Euphémie-sur-Rivière-du-Sud',
    value: 'CA/QC/Sainte-Euphémie-sur-Rivière-du-Sud',
  },
  {
    label: 'Notre-Dame-du-Rosaire',
    value: 'CA/QC/Notre-Dame-du-Rosaire',
  },
  {
    label: 'Cap-Saint-Ignace',
    value: 'CA/QC/Cap-Saint-Ignace',
  },
  {
    label: 'Montmagny',
    value: 'CA/QC/Montmagny',
  },
  {
    label: 'Saint-François-de-la-Rivière-du-Sud',
    value: 'CA/QC/Saint-François-de-la-Rivière-du-Sud',
  },
  {
    label: 'Berthier-sur-Mer',
    value: 'CA/QC/Berthier-sur-Mer',
  },
  {
    label: 'Armagh',
    value: 'CA/QC/Armagh',
  },
  {
    label: 'Saint-Nérée-de-Bellechasse',
    value: 'CA/QC/Saint-Nérée-de-Bellechasse',
  },
  {
    label: 'Saint-Lazare-de-Bellechasse',
    value: 'CA/QC/Saint-Lazare-de-Bellechasse',
  },
  {
    label: 'Sainte-Claire',
    value: 'CA/QC/Sainte-Claire',
  },
  {
    label: 'Saint-Anselme',
    value: 'CA/QC/Saint-Anselme',
  },
  {
    label: 'Saint-Henri',
    value: 'CA/QC/Saint-Henri',
  },
  {
    label: 'Honfleur',
    value: 'CA/QC/Honfleur',
  },
  {
    label: 'Saint-Gervais',
    value: 'CA/QC/Saint-Gervais',
  },
  {
    label: 'Saint-Raphaël',
    value: 'CA/QC/Saint-Raphaël',
  },
  {
    label: 'Saint-Charles-de-Bellechasse',
    value: 'CA/QC/Saint-Charles-de-Bellechasse',
  },
  {
    label: 'Beaumont',
    value: 'CA/QC/Beaumont',
  },
  {
    label: 'Saint-Michel-de-Bellechasse',
    value: 'CA/QC/Saint-Michel-de-Bellechasse',
  },
  {
    label: 'Saint-Vallier',
    value: 'CA/QC/Saint-Vallier',
  },
  {
    label: "Saint-François-de-l'Île-d'Orléans",
    value: "CA/QC/Saint-François-de-l'Île-d'Orléans",
  },
  {
    label: "Saint-Jean-de-l'Île-d'Orléans",
    value: "CA/QC/Saint-Jean-de-l'Île-d'Orléans",
  },
  {
    label: "Saint-Laurent-de-l'Île-d'Orléans",
    value: "CA/QC/Saint-Laurent-de-l'Île-d'Orléans",
  },
  {
    label: "Saint-Pierre-de-l'Île-d'Orléans",
    value: "CA/QC/Saint-Pierre-de-l'Île-d'Orléans",
  },
  {
    label: 'Saint-Tite-des-Caps',
    value: 'CA/QC/Saint-Tite-des-Caps',
  },
  {
    label: 'Saint-Ferréol-les-Neiges',
    value: 'CA/QC/Saint-Ferréol-les-Neiges',
  },
  {
    label: 'Beaupré',
    value: 'CA/QC/Beaupré',
  },
  {
    label: 'Sainte-Anne-de-Beaupré',
    value: 'CA/QC/Sainte-Anne-de-Beaupré',
  },
  {
    label: 'Château-Richer',
    value: 'CA/QC/Château-Richer',
  },
  {
    label: "L'Ange-Gardien",
    value: "CA/QC/L'Ange-Gardien",
  },
  {
    label: 'Boischatel',
    value: 'CA/QC/Boischatel',
  },
  {
    label: 'Sainte-Catherine-de-la-Jacques-Cartier',
    value: 'CA/QC/Sainte-Catherine-de-la-Jacques-Cartier',
  },
  {
    label: 'Fossambault-sur-le-Lac',
    value: 'CA/QC/Fossambault-sur-le-Lac',
  },
  {
    label: 'Lac-Saint-Joseph',
    value: 'CA/QC/Lac-Saint-Joseph',
  },
  {
    label: 'Shannon',
    value: 'CA/QC/Shannon',
  },
  {
    label: 'Saint-Gabriel-de-Valcartier',
    value: 'CA/QC/Saint-Gabriel-de-Valcartier',
  },
  {
    label: 'Lac-Delage',
    value: 'CA/QC/Lac-Delage',
  },
  {
    label: 'Lac-Beauport',
    value: 'CA/QC/Lac-Beauport',
  },
  {
    label: 'Sainte-Brigitte-de-Laval',
    value: 'CA/QC/Sainte-Brigitte-de-Laval',
  },
  {
    label: 'Québec',
    value: 'CA/QC/Québec',
  },
  {
    label: "L'Ancienne-Lorette",
    value: "CA/QC/L'Ancienne-Lorette",
  },
  {
    label: 'Saint-Augustin-de-Desmaures',
    value: 'CA/QC/Saint-Augustin-de-Desmaures',
  },
  {
    label: 'Lévis',
    value: 'CA/QC/Lévis',
  },
  {
    label: 'Frampton',
    value: 'CA/QC/Frampton',
  },
  {
    label: 'Vallée-Jonction',
    value: 'CA/QC/Vallée-Jonction',
  },
  {
    label: 'Saint-Elzéar',
    value: 'CA/QC/Saint-Elzéar',
  },
  {
    label: 'Sainte-Marie',
    value: 'CA/QC/Sainte-Marie',
  },
  {
    label: 'Scott',
    value: 'CA/QC/Scott',
  },
  {
    label: 'Saint-Bernard',
    value: 'CA/QC/Saint-Bernard',
  },
  {
    label: 'Saint-Isidore',
    value: 'CA/QC/Saint-Isidore',
  },
  {
    label: 'Saint-Lambert-de-Lauzon',
    value: 'CA/QC/Saint-Lambert-de-Lauzon',
  },
  {
    label: 'Saint-Victor',
    value: 'CA/QC/Saint-Victor',
  },
  {
    label: 'Saint-Alfred',
    value: 'CA/QC/Saint-Alfred',
  },
  {
    label: 'Beauceville',
    value: 'CA/QC/Beauceville',
  },
  {
    label: 'Saint-Joseph-de-Beauce',
    value: 'CA/QC/Saint-Joseph-de-Beauce',
  },
  {
    label: 'Saint-Joseph-des-Érables',
    value: 'CA/QC/Saint-Joseph-des-Érables',
  },
  {
    label: 'Saint-Zacharie',
    value: 'CA/QC/Saint-Zacharie',
  },
  {
    label: 'Sainte-Aurélie',
    value: 'CA/QC/Sainte-Aurélie',
  },
  {
    label: 'Saint-Prosper',
    value: 'CA/QC/Saint-Prosper',
  },
  {
    label: 'Saint-Benjamin',
    value: 'CA/QC/Saint-Benjamin',
  },
  {
    label: 'Sainte-Rose-de-Watford',
    value: 'CA/QC/Sainte-Rose-de-Watford',
  },
  {
    label: 'Saint-Louis-de-Gonzague',
    value: 'CA/QC/Saint-Louis-de-Gonzague',
  },
  {
    label: 'Sainte-Justine',
    value: 'CA/QC/Sainte-Justine',
  },
  {
    label: 'Lac-Etchemin',
    value: 'CA/QC/Lac-Etchemin',
  },
  {
    label: 'Saint-Luc-de-Bellechasse',
    value: 'CA/QC/Saint-Luc-de-Bellechasse',
  },
  {
    label: 'Saint-Magloire',
    value: 'CA/QC/Saint-Magloire',
  },
  {
    label: 'Saint-Théophile',
    value: 'CA/QC/Saint-Théophile',
  },
  {
    label: 'Saint-Gédéon-de-Beauce',
    value: 'CA/QC/Saint-Gédéon-de-Beauce',
  },
  {
    label: 'Saint-Évariste-de-Forsyth',
    value: 'CA/QC/Saint-Évariste-de-Forsyth',
  },
  {
    label: 'Saint-Honoré-de-Shenley',
    value: 'CA/QC/Saint-Honoré-de-Shenley',
  },
  {
    label: 'Saint-Côme--Linière',
    value: 'CA/QC/Saint-Côme--Linière',
  },
  {
    label: 'Saint-Philibert',
    value: 'CA/QC/Saint-Philibert',
  },
  {
    label: 'Saint-Georges',
    value: 'CA/QC/Saint-Georges',
  },
  {
    label: 'Saint-Benoît-Labre',
    value: 'CA/QC/Saint-Benoît-Labre',
  },
  {
    label: 'Saint-Éphrem-de-Beauce',
    value: 'CA/QC/Saint-Éphrem-de-Beauce',
  },
  {
    label: 'Saint-Simon-les-Mines',
    value: 'CA/QC/Saint-Simon-les-Mines',
  },
  {
    label: 'Notre-Dame-des-Bois',
    value: 'CA/QC/Notre-Dame-des-Bois',
  },
  {
    label: 'Val-Racine',
    value: 'CA/QC/Val-Racine',
  },
  {
    label: 'Piopolis',
    value: 'CA/QC/Piopolis',
  },
  {
    label: 'Frontenac',
    value: 'CA/QC/Frontenac',
  },
  {
    label: 'Lac-Mégantic',
    value: 'CA/QC/Lac-Mégantic',
  },
  {
    label: 'Milan',
    value: 'CA/QC/Milan',
  },
  {
    label: 'Nantes',
    value: 'CA/QC/Nantes',
  },
  {
    label: 'Sainte-Cécile-de-Whitton',
    value: 'CA/QC/Sainte-Cécile-de-Whitton',
  },
  {
    label: 'Audet',
    value: 'CA/QC/Audet',
  },
  {
    label: 'Saint-Robert-Bellarmin',
    value: 'CA/QC/Saint-Robert-Bellarmin',
  },
  {
    label: 'Saint-Ludger',
    value: 'CA/QC/Saint-Ludger',
  },
  {
    label: 'Lac-Drolet',
    value: 'CA/QC/Lac-Drolet',
  },
  {
    label: 'Saint-Sébastien',
    value: 'CA/QC/Saint-Sébastien',
  },
  {
    label: 'Courcelles',
    value: 'CA/QC/Courcelles',
  },
  {
    label: 'Lambton',
    value: 'CA/QC/Lambton',
  },
  {
    label: 'Saint-Romain',
    value: 'CA/QC/Saint-Romain',
  },
  {
    label: 'Stornoway',
    value: 'CA/QC/Stornoway',
  },
  {
    label: 'Beaulac-Garthby',
    value: 'CA/QC/Beaulac-Garthby',
  },
  {
    label: 'Disraeli',
    value: 'CA/QC/Disraeli',
  },
  {
    label: 'Saint-Fortunat',
    value: 'CA/QC/Saint-Fortunat',
  },
  {
    label: 'Saint-Julien',
    value: 'CA/QC/Saint-Julien',
  },
  {
    label: 'Irlande',
    value: 'CA/QC/Irlande',
  },
  {
    label: 'Saint-Joseph-de-Coleraine',
    value: 'CA/QC/Saint-Joseph-de-Coleraine',
  },
  {
    label: 'Adstock',
    value: 'CA/QC/Adstock',
  },
  {
    label: 'Sainte-Clotilde-de-Beauce',
    value: 'CA/QC/Sainte-Clotilde-de-Beauce',
  },
  {
    label: 'Thetford Mines',
    value: 'CA/QC/Thetford Mines',
  },
  {
    label: "Saint-Adrien-d'Irlande",
    value: "CA/QC/Saint-Adrien-d'Irlande",
  },
  {
    label: 'Saint-Jean-de-Brébeuf',
    value: 'CA/QC/Saint-Jean-de-Brébeuf',
  },
  {
    label: "Kinnear's Mills",
    value: "CA/QC/Kinnear's Mills",
  },
  {
    label: 'East Broughton',
    value: 'CA/QC/East Broughton',
  },
  {
    label: 'Saint-Pierre-de-Broughton',
    value: 'CA/QC/Saint-Pierre-de-Broughton',
  },
  {
    label: 'Saint-Jacques-de-Leeds',
    value: 'CA/QC/Saint-Jacques-de-Leeds',
  },
  {
    label: 'Saint-Ferdinand',
    value: 'CA/QC/Saint-Ferdinand',
  },
  {
    label: "Sainte-Sophie-d'Halifax",
    value: "CA/QC/Sainte-Sophie-d'Halifax",
  },
  {
    label: 'Princeville',
    value: 'CA/QC/Princeville',
  },
  {
    label: 'Plessisville',
    value: 'CA/QC/Plessisville',
  },
  {
    label: 'Inverness',
    value: 'CA/QC/Inverness',
  },
  {
    label: 'Lyster',
    value: 'CA/QC/Lyster',
  },
  {
    label: 'Laurierville',
    value: 'CA/QC/Laurierville',
  },
  {
    label: 'Villeroy',
    value: 'CA/QC/Villeroy',
  },
  {
    label: 'Saint-Sylvestre',
    value: 'CA/QC/Saint-Sylvestre',
  },
  {
    label: 'Sainte-Agathe-de-Lotbinière',
    value: 'CA/QC/Sainte-Agathe-de-Lotbinière',
  },
  {
    label: 'Saint-Patrice-de-Beaurivage',
    value: 'CA/QC/Saint-Patrice-de-Beaurivage',
  },
  {
    label: 'Dosquet',
    value: 'CA/QC/Dosquet',
  },
  {
    label: 'Saint-Agapit',
    value: 'CA/QC/Saint-Agapit',
  },
  {
    label: 'Saint-Flavien',
    value: 'CA/QC/Saint-Flavien',
  },
  {
    label: 'Saint-Janvier-de-Joly',
    value: 'CA/QC/Saint-Janvier-de-Joly',
  },
  {
    label: 'Val-Alain',
    value: 'CA/QC/Val-Alain',
  },
  {
    label: 'Saint-Apollinaire',
    value: 'CA/QC/Saint-Apollinaire',
  },
  {
    label: 'Saint-Antoine-de-Tilly',
    value: 'CA/QC/Saint-Antoine-de-Tilly',
  },
  {
    label: 'Sainte-Croix',
    value: 'CA/QC/Sainte-Croix',
  },
  {
    label: 'Lotbinière',
    value: 'CA/QC/Lotbinière',
  },
  {
    label: 'Leclercville',
    value: 'CA/QC/Leclercville',
  },
  {
    label: 'Neuville',
    value: 'CA/QC/Neuville',
  },
  {
    label: 'Pont-Rouge',
    value: 'CA/QC/Pont-Rouge',
  },
  {
    label: 'Donnacona',
    value: 'CA/QC/Donnacona',
  },
  {
    label: 'Cap-Santé',
    value: 'CA/QC/Cap-Santé',
  },
  {
    label: 'Saint-Basile',
    value: 'CA/QC/Saint-Basile',
  },
  {
    label: 'Portneuf',
    value: 'CA/QC/Portneuf',
  },
  {
    label: 'Deschambault-Grondines',
    value: 'CA/QC/Deschambault-Grondines',
  },
  {
    label: 'Saint-Marc-des-Carrières',
    value: 'CA/QC/Saint-Marc-des-Carrières',
  },
  {
    label: 'Saint-Casimir',
    value: 'CA/QC/Saint-Casimir',
  },
  {
    label: 'Saint-Ubalde',
    value: 'CA/QC/Saint-Ubalde',
  },
  {
    label: 'Saint-Alban',
    value: 'CA/QC/Saint-Alban',
  },
  {
    label: "Sainte-Christine-d'Auvergne",
    value: "CA/QC/Sainte-Christine-d'Auvergne",
  },
  {
    label: 'Saint-Léonard-de-Portneuf',
    value: 'CA/QC/Saint-Léonard-de-Portneuf',
  },
  {
    label: 'Lac-Sergent',
    value: 'CA/QC/Lac-Sergent',
  },
  {
    label: 'Saint-Raymond',
    value: 'CA/QC/Saint-Raymond',
  },
  {
    label: 'Rivière-à-Pierre',
    value: 'CA/QC/Rivière-à-Pierre',
  },
  {
    label: 'Notre-Dame-de-Montauban',
    value: 'CA/QC/Notre-Dame-de-Montauban',
  },
  {
    label: 'Saint-Tite',
    value: 'CA/QC/Saint-Tite',
  },
  {
    label: 'Sainte-Thècle',
    value: 'CA/QC/Sainte-Thècle',
  },
  {
    label: 'Trois-Rives',
    value: 'CA/QC/Trois-Rives',
  },
  {
    label: 'Shawinigan',
    value: 'CA/QC/Shawinigan',
  },
  {
    label: 'Trois-Rivières',
    value: 'CA/QC/Trois-Rivières',
  },
  {
    label: 'Sainte-Anne-de-la-Pérade',
    value: 'CA/QC/Sainte-Anne-de-la-Pérade',
  },
  {
    label: 'Batiscan',
    value: 'CA/QC/Batiscan',
  },
  {
    label: 'Champlain',
    value: 'CA/QC/Champlain',
  },
  {
    label: 'Saint-Luc-de-Vincennes',
    value: 'CA/QC/Saint-Luc-de-Vincennes',
  },
  {
    label: 'Saint-Stanislas',
    value: 'CA/QC/Saint-Stanislas',
  },
  {
    label: 'Saint-Prosper-de-Champlain',
    value: 'CA/QC/Saint-Prosper-de-Champlain',
  },
  {
    label: 'Saint-Sylvère',
    value: 'CA/QC/Saint-Sylvère',
  },
  {
    label: 'Bécancour',
    value: 'CA/QC/Bécancour',
  },
  {
    label: 'Sainte-Marie-de-Blandford',
    value: 'CA/QC/Sainte-Marie-de-Blandford',
  },
  {
    label: 'Lemieux',
    value: 'CA/QC/Lemieux',
  },
  {
    label: 'Manseau',
    value: 'CA/QC/Manseau',
  },
  {
    label: 'Sainte-Françoise',
    value: 'CA/QC/Sainte-Françoise',
  },
  {
    label: 'Fortierville',
    value: 'CA/QC/Fortierville',
  },
  {
    label: 'Saint-Pierre-les-Becquets',
    value: 'CA/QC/Saint-Pierre-les-Becquets',
  },
  {
    label: 'Deschaillons-sur-Saint-Laurent',
    value: 'CA/QC/Deschaillons-sur-Saint-Laurent',
  },
  {
    label: 'Notre-Dame-de-Ham',
    value: 'CA/QC/Notre-Dame-de-Ham',
  },
  {
    label: 'Saint-Rémi-de-Tingwick',
    value: 'CA/QC/Saint-Rémi-de-Tingwick',
  },
  {
    label: 'Tingwick',
    value: 'CA/QC/Tingwick',
  },
  {
    label: 'Chesterville',
    value: 'CA/QC/Chesterville',
  },
  {
    label: 'Sainte-Hélène-de-Chester',
    value: 'CA/QC/Sainte-Hélène-de-Chester',
  },
  {
    label: "Saint-Norbert-d'Arthabaska",
    value: "CA/QC/Saint-Norbert-d'Arthabaska",
  },
  {
    label: 'Victoriaville',
    value: 'CA/QC/Victoriaville',
  },
  {
    label: 'Warwick',
    value: 'CA/QC/Warwick',
  },
  {
    label: 'Saint-Albert',
    value: 'CA/QC/Saint-Albert',
  },
  {
    label: 'Sainte-Élizabeth-de-Warwick',
    value: 'CA/QC/Sainte-Élizabeth-de-Warwick',
  },
  {
    label: 'Kingsey Falls',
    value: 'CA/QC/Kingsey Falls',
  },
  {
    label: 'Sainte-Clotilde-de-Horton',
    value: 'CA/QC/Sainte-Clotilde-de-Horton',
  },
  {
    label: 'Saint-Samuel',
    value: 'CA/QC/Saint-Samuel',
  },
  {
    label: 'Saint-Valère',
    value: 'CA/QC/Saint-Valère',
  },
  {
    label: 'Sainte-Anne-du-Sault',
    value: 'CA/QC/Sainte-Anne-du-Sault',
  },
  {
    label: 'Daveluyville',
    value: 'CA/QC/Daveluyville',
  },
  {
    label: 'Maddington Falls',
    value: 'CA/QC/Maddington Falls',
  },
  {
    label: 'Saint-Louis-de-Blandford',
    value: 'CA/QC/Saint-Louis-de-Blandford',
  },
  {
    label: 'Ham-Sud',
    value: 'CA/QC/Ham-Sud',
  },
  {
    label: 'Saint-Adrien',
    value: 'CA/QC/Saint-Adrien',
  },
  {
    label: 'Wotton',
    value: 'CA/QC/Wotton',
  },
  {
    label: 'Saint-Georges-de-Windsor',
    value: 'CA/QC/Saint-Georges-de-Windsor',
  },
  {
    label: 'Asbestos',
    value: 'CA/QC/Asbestos',
  },
  {
    label: 'Danville',
    value: 'CA/QC/Danville',
  },
  {
    label: 'Saint-Isidore-de-Clifton',
    value: 'CA/QC/Saint-Isidore-de-Clifton',
  },
  {
    label: 'Chartierville',
    value: 'CA/QC/Chartierville',
  },
  {
    label: 'La Patrie',
    value: 'CA/QC/La Patrie',
  },
  {
    label: 'Newport',
    value: 'CA/QC/Newport',
  },
  {
    label: 'Cookshire-Eaton',
    value: 'CA/QC/Cookshire-Eaton',
  },
  {
    label: 'Ascot Corner',
    value: 'CA/QC/Ascot Corner',
  },
  {
    label: 'East Angus',
    value: 'CA/QC/East Angus',
  },
  {
    label: 'Bury',
    value: 'CA/QC/Bury',
  },
  {
    label: 'Scotstown',
    value: 'CA/QC/Scotstown',
  },
  {
    label: 'Weedon',
    value: 'CA/QC/Weedon',
  },
  {
    label: 'Dudswell',
    value: 'CA/QC/Dudswell',
  },
  {
    label: 'Stoke',
    value: 'CA/QC/Stoke',
  },
  {
    label: 'Saint-François-Xavier-de-Brompton',
    value: 'CA/QC/Saint-François-Xavier-de-Brompton',
  },
  {
    label: 'Saint-Denis-de-Brompton',
    value: 'CA/QC/Saint-Denis-de-Brompton',
  },
  {
    label: 'Racine',
    value: 'CA/QC/Racine',
  },
  {
    label: 'Bonsecours',
    value: 'CA/QC/Bonsecours',
  },
  {
    label: 'Sainte-Anne-de-la-Rochelle',
    value: 'CA/QC/Sainte-Anne-de-la-Rochelle',
  },
  {
    label: 'Valcourt',
    value: 'CA/QC/Valcourt',
  },
  {
    label: 'Maricourt',
    value: 'CA/QC/Maricourt',
  },
  {
    label: 'Ulverton',
    value: 'CA/QC/Ulverton',
  },
  {
    label: 'Windsor',
    value: 'CA/QC/Windsor',
  },
  {
    label: 'Val-Joli',
    value: 'CA/QC/Val-Joli',
  },
  {
    label: 'Richmond',
    value: 'CA/QC/Richmond',
  },
  {
    label: 'Saint-Claude',
    value: 'CA/QC/Saint-Claude',
  },
  {
    label: 'Sherbrooke',
    value: 'CA/QC/Sherbrooke',
  },
  {
    label: 'Saint-Malo',
    value: 'CA/QC/Saint-Malo',
  },
  {
    label: 'Saint-Venant-de-Paquette',
    value: 'CA/QC/Saint-Venant-de-Paquette',
  },
  {
    label: 'East Hereford',
    value: 'CA/QC/East Hereford',
  },
  {
    label: 'Saint-Herménégilde',
    value: 'CA/QC/Saint-Herménégilde',
  },
  {
    label: 'Dixville',
    value: 'CA/QC/Dixville',
  },
  {
    label: 'Coaticook',
    value: 'CA/QC/Coaticook',
  },
  {
    label: 'Barnston-Ouest',
    value: 'CA/QC/Barnston-Ouest',
  },
  {
    label: 'Stanstead-Est',
    value: 'CA/QC/Stanstead-Est',
  },
  {
    label: 'Martinville',
    value: 'CA/QC/Martinville',
  },
  {
    label: 'Compton',
    value: 'CA/QC/Compton',
  },
  {
    label: 'Waterville',
    value: 'CA/QC/Waterville',
  },
  {
    label: 'Stanstead',
    value: 'CA/QC/Stanstead',
  },
  {
    label: 'Ogden',
    value: 'CA/QC/Ogden',
  },
  {
    label: 'Hatley',
    value: 'CA/QC/Hatley',
  },
  {
    label: 'Sainte-Catherine-de-Hatley',
    value: 'CA/QC/Sainte-Catherine-de-Hatley',
  },
  {
    label: 'Magog',
    value: 'CA/QC/Magog',
  },
  {
    label: 'Saint-Benoît-du-Lac',
    value: 'CA/QC/Saint-Benoît-du-Lac',
  },
  {
    label: 'Austin',
    value: 'CA/QC/Austin',
  },
  {
    label: 'Eastman',
    value: 'CA/QC/Eastman',
  },
  {
    label: 'Bolton-Est',
    value: 'CA/QC/Bolton-Est',
  },
  {
    label: 'Saint-Étienne-de-Bolton',
    value: 'CA/QC/Saint-Étienne-de-Bolton',
  },
  {
    label: 'Frelighsburg',
    value: 'CA/QC/Frelighsburg',
  },
  {
    label: 'Saint-Armand',
    value: 'CA/QC/Saint-Armand',
  },
  {
    label: 'Pike River',
    value: 'CA/QC/Pike River',
  },
  {
    label: 'Stanbridge Station',
    value: 'CA/QC/Stanbridge Station',
  },
  {
    label: 'Bedford',
    value: 'CA/QC/Bedford',
  },
  {
    label: 'Stanbridge East',
    value: 'CA/QC/Stanbridge East',
  },
  {
    label: 'Dunham',
    value: 'CA/QC/Dunham',
  },
  {
    label: 'Sutton',
    value: 'CA/QC/Sutton',
  },
  {
    label: 'Bolton-Ouest',
    value: 'CA/QC/Bolton-Ouest',
  },
  {
    label: 'Lac-Brome',
    value: 'CA/QC/Lac-Brome',
  },
  {
    label: 'Bromont',
    value: 'CA/QC/Bromont',
  },
  {
    label: 'Cowansville',
    value: 'CA/QC/Cowansville',
  },
  {
    label: 'East Farnham',
    value: 'CA/QC/East Farnham',
  },
  {
    label: 'Brigham',
    value: 'CA/QC/Brigham',
  },
  {
    label: 'Saint-Ignace-de-Stanbridge',
    value: 'CA/QC/Saint-Ignace-de-Stanbridge',
  },
  {
    label: 'Notre-Dame-de-Stanbridge',
    value: 'CA/QC/Notre-Dame-de-Stanbridge',
  },
  {
    label: 'Sainte-Sabine',
    value: 'CA/QC/Sainte-Sabine',
  },
  {
    label: 'Farnham',
    value: 'CA/QC/Farnham',
  },
  {
    label: 'Saint-Alphonse-de-Granby',
    value: 'CA/QC/Saint-Alphonse-de-Granby',
  },
  {
    label: 'Granby',
    value: 'CA/QC/Granby',
  },
  {
    label: 'Waterloo',
    value: 'CA/QC/Waterloo',
  },
  {
    label: 'Saint-Joachim-de-Shefford',
    value: 'CA/QC/Saint-Joachim-de-Shefford',
  },
  {
    label: 'Roxton Pond',
    value: 'CA/QC/Roxton Pond',
  },
  {
    label: 'Sainte-Cécile-de-Milton',
    value: 'CA/QC/Sainte-Cécile-de-Milton',
  },
  {
    label: 'Béthanie',
    value: 'CA/QC/Béthanie',
  },
  {
    label: 'Acton Vale',
    value: 'CA/QC/Acton Vale',
  },
  {
    label: 'Upton',
    value: 'CA/QC/Upton',
  },
  {
    label: "Saint-Théodore-d'Acton",
    value: "CA/QC/Saint-Théodore-d'Acton",
  },
  {
    label: 'Saint-Félix-de-Kingsey',
    value: 'CA/QC/Saint-Félix-de-Kingsey',
  },
  {
    label: 'Durham-Sud',
    value: 'CA/QC/Durham-Sud',
  },
  {
    label: 'Lefebvre',
    value: 'CA/QC/Lefebvre',
  },
  {
    label: "L'Avenir",
    value: "CA/QC/L'Avenir",
  },
  {
    label: 'Saint-Lucien',
    value: 'CA/QC/Saint-Lucien',
  },
  {
    label: 'Wickham',
    value: 'CA/QC/Wickham',
  },
  {
    label: 'Saint-Germain-de-Grantham',
    value: 'CA/QC/Saint-Germain-de-Grantham',
  },
  {
    label: 'Drummondville',
    value: 'CA/QC/Drummondville',
  },
  {
    label: 'Saint-Cyrille-de-Wendover',
    value: 'CA/QC/Saint-Cyrille-de-Wendover',
  },
  {
    label: 'Saint-Eugène',
    value: 'CA/QC/Saint-Eugène',
  },
  {
    label: 'Saint-Guillaume',
    value: 'CA/QC/Saint-Guillaume',
  },
  {
    label: 'Saint-Bonaventure',
    value: 'CA/QC/Saint-Bonaventure',
  },
  {
    label: 'Sainte-Eulalie',
    value: 'CA/QC/Sainte-Eulalie',
  },
  {
    label: 'Aston-Jonction',
    value: 'CA/QC/Aston-Jonction',
  },
  {
    label: 'Saint-Wenceslas',
    value: 'CA/QC/Saint-Wenceslas',
  },
  {
    label: 'Saint-Célestin',
    value: 'CA/QC/Saint-Célestin',
  },
  {
    label: "Saint-Léonard-d'Aston",
    value: "CA/QC/Saint-Léonard-d'Aston",
  },
  {
    label: 'Sainte-Monique',
    value: 'CA/QC/Sainte-Monique',
  },
  {
    label: 'Grand-Saint-Esprit',
    value: 'CA/QC/Grand-Saint-Esprit',
  },
  {
    label: 'Nicolet',
    value: 'CA/QC/Nicolet',
  },
  {
    label: 'La Visitation-de-Yamaska',
    value: 'CA/QC/La Visitation-de-Yamaska',
  },
  {
    label: 'Baie-du-Febvre',
    value: 'CA/QC/Baie-du-Febvre',
  },
  {
    label: 'Pierreville',
    value: 'CA/QC/Pierreville',
  },
  {
    label: 'Saint-François-du-Lac',
    value: 'CA/QC/Saint-François-du-Lac',
  },
  {
    label: 'Maskinongé',
    value: 'CA/QC/Maskinongé',
  },
  {
    label: 'Louiseville',
    value: 'CA/QC/Louiseville',
  },
  {
    label: 'Yamachiche',
    value: 'CA/QC/Yamachiche',
  },
  {
    label: 'Saint-Justin',
    value: 'CA/QC/Saint-Justin',
  },
  {
    label: 'Saint-Édouard-de-Maskinongé',
    value: 'CA/QC/Saint-Édouard-de-Maskinongé',
  },
  {
    label: 'Sainte-Angèle-de-Prémont',
    value: 'CA/QC/Sainte-Angèle-de-Prémont',
  },
  {
    label: 'Saint-Paulin',
    value: 'CA/QC/Saint-Paulin',
  },
  {
    label: 'Saint-Mathieu-du-Parc',
    value: 'CA/QC/Saint-Mathieu-du-Parc',
  },
  {
    label: 'Saint-Élie-de-Caxton',
    value: 'CA/QC/Saint-Élie-de-Caxton',
  },
  {
    label: 'Charette',
    value: 'CA/QC/Charette',
  },
  {
    label: 'Saint-Boniface',
    value: 'CA/QC/Saint-Boniface',
  },
  {
    label: 'Lavaltrie',
    value: 'CA/QC/Lavaltrie',
  },
  {
    label: 'Lanoraie',
    value: 'CA/QC/Lanoraie',
  },
  {
    label: 'Sainte-Élisabeth',
    value: 'CA/QC/Sainte-Élisabeth',
  },
  {
    label: 'Berthierville',
    value: 'CA/QC/Berthierville',
  },
  {
    label: 'Sainte-Geneviève-de-Berthier',
    value: 'CA/QC/Sainte-Geneviève-de-Berthier',
  },
  {
    label: 'Saint-Ignace-de-Loyola',
    value: 'CA/QC/Saint-Ignace-de-Loyola',
  },
  {
    label: "La Visitation-de-l'Île-Dupas",
    value: "CA/QC/La Visitation-de-l'Île-Dupas",
  },
  {
    label: 'Saint-Cuthbert',
    value: 'CA/QC/Saint-Cuthbert',
  },
  {
    label: 'Saint-Cléophas-de-Brandon',
    value: 'CA/QC/Saint-Cléophas-de-Brandon',
  },
  {
    label: 'Saint-Gabriel',
    value: 'CA/QC/Saint-Gabriel',
  },
  {
    label: 'Saint-Gabriel-de-Brandon',
    value: 'CA/QC/Saint-Gabriel-de-Brandon',
  },
  {
    label: 'Mandeville',
    value: 'CA/QC/Mandeville',
  },
  {
    label: 'Saint-David',
    value: 'CA/QC/Saint-David',
  },
  {
    label: 'Saint-Aimé',
    value: 'CA/QC/Saint-Aimé',
  },
  {
    label: 'Saint-Robert',
    value: 'CA/QC/Saint-Robert',
  },
  {
    label: 'Sainte-Victoire-de-Sorel',
    value: 'CA/QC/Sainte-Victoire-de-Sorel',
  },
  {
    label: 'Saint-Ours',
    value: 'CA/QC/Saint-Ours',
  },
  {
    label: 'Saint-Roch-de-Richelieu',
    value: 'CA/QC/Saint-Roch-de-Richelieu',
  },
  {
    label: 'Saint-Joseph-de-Sorel',
    value: 'CA/QC/Saint-Joseph-de-Sorel',
  },
  {
    label: 'Sorel-Tracy',
    value: 'CA/QC/Sorel-Tracy',
  },
  {
    label: 'Sainte-Anne-de-Sorel',
    value: 'CA/QC/Sainte-Anne-de-Sorel',
  },
  {
    label: 'Yamaska',
    value: 'CA/QC/Yamaska',
  },
  {
    label: 'Saint-Pie',
    value: 'CA/QC/Saint-Pie',
  },
  {
    label: 'Saint-Damase',
    value: 'CA/QC/Saint-Damase',
  },
  {
    label: 'La Présentation',
    value: 'CA/QC/La Présentation',
  },
  {
    label: 'Saint-Hyacinthe',
    value: 'CA/QC/Saint-Hyacinthe',
  },
  {
    label: 'Saint-Dominique',
    value: 'CA/QC/Saint-Dominique',
  },
  {
    label: 'Saint-Valérien-de-Milton',
    value: 'CA/QC/Saint-Valérien-de-Milton',
  },
  {
    label: 'Saint-Liboire',
    value: 'CA/QC/Saint-Liboire',
  },
  {
    label: 'Saint-Simon',
    value: 'CA/QC/Saint-Simon',
  },
  {
    label: 'Sainte-Hélène-de-Bagot',
    value: 'CA/QC/Sainte-Hélène-de-Bagot',
  },
  {
    label: 'Saint-Hugues',
    value: 'CA/QC/Saint-Hugues',
  },
  {
    label: 'Saint-Barnabé-Sud',
    value: 'CA/QC/Saint-Barnabé-Sud',
  },
  {
    label: 'Saint-Jude',
    value: 'CA/QC/Saint-Jude',
  },
  {
    label: 'Saint-Bernard-de-Michaudville',
    value: 'CA/QC/Saint-Bernard-de-Michaudville',
  },
  {
    label: 'Saint-Louis',
    value: 'CA/QC/Saint-Louis',
  },
  {
    label: 'Saint-Marcel-de-Richelieu',
    value: 'CA/QC/Saint-Marcel-de-Richelieu',
  },
  {
    label: 'Ange-Gardien',
    value: 'CA/QC/Ange-Gardien',
  },
  {
    label: "Saint-Paul-d'Abbotsford",
    value: "CA/QC/Saint-Paul-d'Abbotsford",
  },
  {
    label: 'Saint-Césaire',
    value: 'CA/QC/Saint-Césaire',
  },
  {
    label: 'Sainte-Angèle-de-Monnoir',
    value: 'CA/QC/Sainte-Angèle-de-Monnoir',
  },
  {
    label: 'Rougemont',
    value: 'CA/QC/Rougemont',
  },
  {
    label: 'Marieville',
    value: 'CA/QC/Marieville',
  },
  {
    label: 'Richelieu',
    value: 'CA/QC/Richelieu',
  },
  {
    label: 'Saint-Mathias-sur-Richelieu',
    value: 'CA/QC/Saint-Mathias-sur-Richelieu',
  },
  {
    label: 'Venise-en-Québec',
    value: 'CA/QC/Venise-en-Québec',
  },
  {
    label: 'Saint-Georges-de-Clarenceville',
    value: 'CA/QC/Saint-Georges-de-Clarenceville',
  },
  {
    label: 'Noyan',
    value: 'CA/QC/Noyan',
  },
  {
    label: 'Lacolle',
    value: 'CA/QC/Lacolle',
  },
  {
    label: 'Saint-Valentin',
    value: 'CA/QC/Saint-Valentin',
  },
  {
    label: "Saint-Paul-de-l'Île-aux-Noix",
    value: "CA/QC/Saint-Paul-de-l'Île-aux-Noix",
  },
  {
    label: 'Henryville',
    value: 'CA/QC/Henryville',
  },
  {
    label: 'Saint-Sébastien',
    value: 'CA/QC/Saint-Sébastien',
  },
  {
    label: 'Saint-Alexandre',
    value: 'CA/QC/Saint-Alexandre',
  },
  {
    label: 'Saint-Blaise-sur-Richelieu',
    value: 'CA/QC/Saint-Blaise-sur-Richelieu',
  },
  {
    label: 'Saint-Jean-sur-Richelieu',
    value: 'CA/QC/Saint-Jean-sur-Richelieu',
  },
  {
    label: 'Mont-Saint-Grégoire',
    value: 'CA/QC/Mont-Saint-Grégoire',
  },
  {
    label: "Sainte-Brigide-d'Iberville",
    value: "CA/QC/Sainte-Brigide-d'Iberville",
  },
  {
    label: 'Chambly',
    value: 'CA/QC/Chambly',
  },
  {
    label: 'Carignan',
    value: 'CA/QC/Carignan',
  },
  {
    label: 'Saint-Basile-le-Grand',
    value: 'CA/QC/Saint-Basile-le-Grand',
  },
  {
    label: 'McMasterville',
    value: 'CA/QC/McMasterville',
  },
  {
    label: 'Otterburn Park',
    value: 'CA/QC/Otterburn Park',
  },
  {
    label: 'Saint-Jean-Baptiste',
    value: 'CA/QC/Saint-Jean-Baptiste',
  },
  {
    label: 'Mont-Saint-Hilaire',
    value: 'CA/QC/Mont-Saint-Hilaire',
  },
  {
    label: 'Beloeil',
    value: 'CA/QC/Beloeil',
  },
  {
    label: 'Saint-Mathieu-de-Beloeil',
    value: 'CA/QC/Saint-Mathieu-de-Beloeil',
  },
  {
    label: 'Saint-Marc-sur-Richelieu',
    value: 'CA/QC/Saint-Marc-sur-Richelieu',
  },
  {
    label: 'Saint-Charles-sur-Richelieu',
    value: 'CA/QC/Saint-Charles-sur-Richelieu',
  },
  {
    label: 'Saint-Denis-sur-Richelieu',
    value: 'CA/QC/Saint-Denis-sur-Richelieu',
  },
  {
    label: 'Saint-Antoine-sur-Richelieu',
    value: 'CA/QC/Saint-Antoine-sur-Richelieu',
  },
  {
    label: 'Brossard',
    value: 'CA/QC/Brossard',
  },
  {
    label: 'Saint-Lambert',
    value: 'CA/QC/Saint-Lambert',
  },
  {
    label: 'Boucherville',
    value: 'CA/QC/Boucherville',
  },
  {
    label: 'Saint-Bruno-de-Montarville',
    value: 'CA/QC/Saint-Bruno-de-Montarville',
  },
  {
    label: 'Longueuil',
    value: 'CA/QC/Longueuil',
  },
  {
    label: 'Sainte-Julie',
    value: 'CA/QC/Sainte-Julie',
  },
  {
    label: 'Saint-Amable',
    value: 'CA/QC/Saint-Amable',
  },
  {
    label: 'Varennes',
    value: 'CA/QC/Varennes',
  },
  {
    label: 'Verchères',
    value: 'CA/QC/Verchères',
  },
  {
    label: 'Calixa-Lavallée',
    value: 'CA/QC/Calixa-Lavallée',
  },
  {
    label: 'Contrecoeur',
    value: 'CA/QC/Contrecoeur',
  },
  {
    label: 'Charlemagne',
    value: 'CA/QC/Charlemagne',
  },
  {
    label: 'Repentigny',
    value: 'CA/QC/Repentigny',
  },
  {
    label: "L'Assomption",
    value: "CA/QC/L'Assomption",
  },
  {
    label: "L'Épiphanie",
    value: "CA/QC/L'Épiphanie",
  },
  {
    label: 'Saint-Paul',
    value: 'CA/QC/Saint-Paul',
  },
  {
    label: 'Crabtree',
    value: 'CA/QC/Crabtree',
  },
  {
    label: 'Joliette',
    value: 'CA/QC/Joliette',
  },
  {
    label: 'Saint-Thomas',
    value: 'CA/QC/Saint-Thomas',
  },
  {
    label: 'Notre-Dame-des-Prairies',
    value: 'CA/QC/Notre-Dame-des-Prairies',
  },
  {
    label: 'Saint-Charles-Borromée',
    value: 'CA/QC/Saint-Charles-Borromée',
  },
  {
    label: 'Saint-Ambroise-de-Kildare',
    value: 'CA/QC/Saint-Ambroise-de-Kildare',
  },
  {
    label: 'Notre-Dame-de-Lourdes',
    value: 'CA/QC/Notre-Dame-de-Lourdes',
  },
  {
    label: 'Sainte-Mélanie',
    value: 'CA/QC/Sainte-Mélanie',
  },
  {
    label: 'Saint-Félix-de-Valois',
    value: 'CA/QC/Saint-Félix-de-Valois',
  },
  {
    label: 'Saint-Jean-de-Matha',
    value: 'CA/QC/Saint-Jean-de-Matha',
  },
  {
    label: 'Sainte-Béatrix',
    value: 'CA/QC/Sainte-Béatrix',
  },
  {
    label: 'Saint-Alphonse-Rodriguez',
    value: 'CA/QC/Saint-Alphonse-Rodriguez',
  },
  {
    label: 'Sainte-Marcelline-de-Kildare',
    value: 'CA/QC/Sainte-Marcelline-de-Kildare',
  },
  {
    label: 'Rawdon',
    value: 'CA/QC/Rawdon',
  },
  {
    label: 'Chertsey',
    value: 'CA/QC/Chertsey',
  },
  {
    label: 'Entrelacs',
    value: 'CA/QC/Entrelacs',
  },
  {
    label: 'Notre-Dame-de-la-Merci',
    value: 'CA/QC/Notre-Dame-de-la-Merci',
  },
  {
    label: 'Saint-Donat',
    value: 'CA/QC/Saint-Donat',
  },
  {
    label: "Sainte-Émélie-de-l'Énergie",
    value: "CA/QC/Sainte-Émélie-de-l'Énergie",
  },
  {
    label: 'Saint-Zénon',
    value: 'CA/QC/Saint-Zénon',
  },
  {
    label: 'Saint-Michel-des-Saints',
    value: 'CA/QC/Saint-Michel-des-Saints',
  },
  {
    label: 'Saint-Jacques',
    value: 'CA/QC/Saint-Jacques',
  },
  {
    label: 'Saint-Alexis',
    value: 'CA/QC/Saint-Alexis',
  },
  {
    label: 'Saint-Esprit',
    value: 'CA/QC/Saint-Esprit',
  },
  {
    label: "Saint-Roch-de-l'Achigan",
    value: "CA/QC/Saint-Roch-de-l'Achigan",
  },
  {
    label: 'Saint-Roch-Ouest',
    value: 'CA/QC/Saint-Roch-Ouest',
  },
  {
    label: 'Saint-Lin--Laurentides',
    value: 'CA/QC/Saint-Lin--Laurentides',
  },
  {
    label: 'Saint-Calixte',
    value: 'CA/QC/Saint-Calixte',
  },
  {
    label: 'Sainte-Julienne',
    value: 'CA/QC/Sainte-Julienne',
  },
  {
    label: 'Terrebonne',
    value: 'CA/QC/Terrebonne',
  },
  {
    label: 'Mascouche',
    value: 'CA/QC/Mascouche',
  },
  {
    label: 'Laval',
    value: 'CA/QC/Laval',
  },
  {
    label: 'Montréal-Est',
    value: 'CA/QC/Montréal-Est',
  },
  {
    label: 'Montréal',
    value: 'CA/QC/Montréal',
  },
  {
    label: 'Westmount',
    value: 'CA/QC/Westmount',
  },
  {
    label: 'Montréal-Ouest',
    value: 'CA/QC/Montréal-Ouest',
  },
  {
    label: 'Côte-Saint-Luc',
    value: 'CA/QC/Côte-Saint-Luc',
  },
  {
    label: 'Hampstead',
    value: 'CA/QC/Hampstead',
  },
  {
    label: 'Mont-Royal',
    value: 'CA/QC/Mont-Royal',
  },
  {
    label: 'Dorval',
    value: 'CA/QC/Dorval',
  },
  {
    label: "L'Île-Dorval",
    value: "CA/QC/L'Île-Dorval",
  },
  {
    label: 'Pointe-Claire',
    value: 'CA/QC/Pointe-Claire',
  },
  {
    label: 'Kirkland',
    value: 'CA/QC/Kirkland',
  },
  {
    label: 'Beaconsfield',
    value: 'CA/QC/Beaconsfield',
  },
  {
    label: "Baie-D'Urfé",
    value: "CA/QC/Baie-D'Urfé",
  },
  {
    label: 'Sainte-Anne-de-Bellevue',
    value: 'CA/QC/Sainte-Anne-de-Bellevue',
  },
  {
    label: 'Dollard-Des Ormeaux',
    value: 'CA/QC/Dollard-Des Ormeaux',
  },
  {
    label: 'Saint-Mathieu',
    value: 'CA/QC/Saint-Mathieu',
  },
  {
    label: 'Saint-Philippe',
    value: 'CA/QC/Saint-Philippe',
  },
  {
    label: 'La Prairie',
    value: 'CA/QC/La Prairie',
  },
  {
    label: 'Candiac',
    value: 'CA/QC/Candiac',
  },
  {
    label: 'Delson',
    value: 'CA/QC/Delson',
  },
  {
    label: 'Sainte-Catherine',
    value: 'CA/QC/Sainte-Catherine',
  },
  {
    label: 'Saint-Constant',
    value: 'CA/QC/Saint-Constant',
  },
  {
    label: 'Mercier',
    value: 'CA/QC/Mercier',
  },
  {
    label: 'Châteauguay',
    value: 'CA/QC/Châteauguay',
  },
  {
    label: 'Léry',
    value: 'CA/QC/Léry',
  },
  {
    label: 'Sainte-Clotilde',
    value: 'CA/QC/Sainte-Clotilde',
  },
  {
    label: 'Saint-Patrice-de-Sherrington',
    value: 'CA/QC/Saint-Patrice-de-Sherrington',
  },
  {
    label: 'Napierville',
    value: 'CA/QC/Napierville',
  },
  {
    label: 'Saint-Cyprien-de-Napierville',
    value: 'CA/QC/Saint-Cyprien-de-Napierville',
  },
  {
    label: 'Saint-Jacques-le-Mineur',
    value: 'CA/QC/Saint-Jacques-le-Mineur',
  },
  {
    label: 'Saint-Édouard',
    value: 'CA/QC/Saint-Édouard',
  },
  {
    label: 'Saint-Michel',
    value: 'CA/QC/Saint-Michel',
  },
  {
    label: 'Saint-Rémi',
    value: 'CA/QC/Saint-Rémi',
  },
  {
    label: 'Franklin',
    value: 'CA/QC/Franklin',
  },
  {
    label: 'Saint-Chrysostome',
    value: 'CA/QC/Saint-Chrysostome',
  },
  {
    label: 'Howick',
    value: 'CA/QC/Howick',
  },
  {
    label: 'Ormstown',
    value: 'CA/QC/Ormstown',
  },
  {
    label: 'Hinchinbrooke',
    value: 'CA/QC/Hinchinbrooke',
  },
  {
    label: 'Elgin',
    value: 'CA/QC/Elgin',
  },
  {
    label: 'Huntingdon',
    value: 'CA/QC/Huntingdon',
  },
  {
    label: 'Sainte-Barbe',
    value: 'CA/QC/Sainte-Barbe',
  },
  {
    label: 'Saint-Anicet',
    value: 'CA/QC/Saint-Anicet',
  },
  {
    label: 'Saint-Urbain-Premier',
    value: 'CA/QC/Saint-Urbain-Premier',
  },
  {
    label: 'Sainte-Martine',
    value: 'CA/QC/Sainte-Martine',
  },
  {
    label: 'Beauharnois',
    value: 'CA/QC/Beauharnois',
  },
  {
    label: 'Saint-Étienne-de-Beauharnois',
    value: 'CA/QC/Saint-Étienne-de-Beauharnois',
  },
  {
    label: 'Saint-Stanislas-de-Kostka',
    value: 'CA/QC/Saint-Stanislas-de-Kostka',
  },
  {
    label: 'Salaberry-de-Valleyfield',
    value: 'CA/QC/Salaberry-de-Valleyfield',
  },
  {
    label: 'Rivière-Beaudette',
    value: 'CA/QC/Rivière-Beaudette',
  },
  {
    label: 'Saint-Télesphore',
    value: 'CA/QC/Saint-Télesphore',
  },
  {
    label: 'Saint-Polycarpe',
    value: 'CA/QC/Saint-Polycarpe',
  },
  {
    label: 'Saint-Zotique',
    value: 'CA/QC/Saint-Zotique',
  },
  {
    label: 'Les Coteaux',
    value: 'CA/QC/Les Coteaux',
  },
  {
    label: 'Coteau-du-Lac',
    value: 'CA/QC/Coteau-du-Lac',
  },
  {
    label: 'Saint-Clet',
    value: 'CA/QC/Saint-Clet',
  },
  {
    label: 'Les Cèdres',
    value: 'CA/QC/Les Cèdres',
  },
  {
    label: "L'Île-Perrot",
    value: "CA/QC/L'Île-Perrot",
  },
  {
    label: "Notre-Dame-de-l'Île-Perrot",
    value: "CA/QC/Notre-Dame-de-l'Île-Perrot",
  },
  {
    label: 'Pincourt',
    value: 'CA/QC/Pincourt',
  },
  {
    label: 'Terrasse-Vaudreuil',
    value: 'CA/QC/Terrasse-Vaudreuil',
  },
  {
    label: 'Vaudreuil-Dorion',
    value: 'CA/QC/Vaudreuil-Dorion',
  },
  {
    label: "L'Île-Cadieux",
    value: "CA/QC/L'Île-Cadieux",
  },
  {
    label: 'Hudson',
    value: 'CA/QC/Hudson',
  },
  {
    label: 'Saint-Lazare',
    value: 'CA/QC/Saint-Lazare',
  },
  {
    label: 'Sainte-Marthe',
    value: 'CA/QC/Sainte-Marthe',
  },
  {
    label: 'Sainte-Justine-de-Newton',
    value: 'CA/QC/Sainte-Justine-de-Newton',
  },
  {
    label: 'Très-Saint-Rédempteur',
    value: 'CA/QC/Très-Saint-Rédempteur',
  },
  {
    label: 'Rigaud',
    value: 'CA/QC/Rigaud',
  },
  {
    label: 'Saint-Eustache',
    value: 'CA/QC/Saint-Eustache',
  },
  {
    label: 'Deux-Montagnes',
    value: 'CA/QC/Deux-Montagnes',
  },
  {
    label: 'Sainte-Marthe-sur-le-Lac',
    value: 'CA/QC/Sainte-Marthe-sur-le-Lac',
  },
  {
    label: 'Pointe-Calumet',
    value: 'CA/QC/Pointe-Calumet',
  },
  {
    label: 'Saint-Joseph-du-Lac',
    value: 'CA/QC/Saint-Joseph-du-Lac',
  },
  {
    label: 'Oka',
    value: 'CA/QC/Oka',
  },
  {
    label: 'Saint-Placide',
    value: 'CA/QC/Saint-Placide',
  },
  {
    label: 'Boisbriand',
    value: 'CA/QC/Boisbriand',
  },
  {
    label: 'Sainte-Thérèse',
    value: 'CA/QC/Sainte-Thérèse',
  },
  {
    label: 'Blainville',
    value: 'CA/QC/Blainville',
  },
  {
    label: 'Rosemère',
    value: 'CA/QC/Rosemère',
  },
  {
    label: 'Lorraine',
    value: 'CA/QC/Lorraine',
  },
  {
    label: 'Bois-des-Filion',
    value: 'CA/QC/Bois-des-Filion',
  },
  {
    label: 'Sainte-Anne-des-Plaines',
    value: 'CA/QC/Sainte-Anne-des-Plaines',
  },
  {
    label: 'Mirabel',
    value: 'CA/QC/Mirabel',
  },
  {
    label: 'Saint-Colomban',
    value: 'CA/QC/Saint-Colomban',
  },
  {
    label: 'Saint-Jérôme',
    value: 'CA/QC/Saint-Jérôme',
  },
  {
    label: 'Sainte-Sophie',
    value: 'CA/QC/Sainte-Sophie',
  },
  {
    label: 'Prévost',
    value: 'CA/QC/Prévost',
  },
  {
    label: 'Saint-Hippolyte',
    value: 'CA/QC/Saint-Hippolyte',
  },
  {
    label: "Saint-André-d'Argenteuil",
    value: "CA/QC/Saint-André-d'Argenteuil",
  },
  {
    label: 'Lachute',
    value: 'CA/QC/Lachute',
  },
  {
    label: 'Mille-Isles',
    value: 'CA/QC/Mille-Isles',
  },
  {
    label: 'Brownsburg-Chatham',
    value: 'CA/QC/Brownsburg-Chatham',
  },
  {
    label: 'Grenville-sur-la-Rouge',
    value: 'CA/QC/Grenville-sur-la-Rouge',
  },
  {
    label: 'Estérel',
    value: 'CA/QC/Estérel',
  },
  {
    label: 'Sainte-Marguerite-du-Lac-Masson',
    value: 'CA/QC/Sainte-Marguerite-du-Lac-Masson',
  },
  {
    label: 'Sainte-Adèle',
    value: 'CA/QC/Sainte-Adèle',
  },
  {
    label: 'Piedmont',
    value: 'CA/QC/Piedmont',
  },
  {
    label: 'Saint-Sauveur',
    value: 'CA/QC/Saint-Sauveur',
  },
  {
    label: 'Morin-Heights',
    value: 'CA/QC/Morin-Heights',
  },
  {
    label: 'Lac-des-Seize-Îles',
    value: 'CA/QC/Lac-des-Seize-Îles',
  },
  {
    label: 'Wentworth-Nord',
    value: 'CA/QC/Wentworth-Nord',
  },
  {
    label: "Saint-Adolphe-d'Howard",
    value: "CA/QC/Saint-Adolphe-d'Howard",
  },
  {
    label: 'Val-Morin',
    value: 'CA/QC/Val-Morin',
  },
  {
    label: 'Lantier',
    value: 'CA/QC/Lantier',
  },
  {
    label: 'Sainte-Lucie-des-Laurentides',
    value: 'CA/QC/Sainte-Lucie-des-Laurentides',
  },
  {
    label: 'Sainte-Agathe-des-Monts',
    value: 'CA/QC/Sainte-Agathe-des-Monts',
  },
  {
    label: 'Ivry-sur-le-Lac',
    value: 'CA/QC/Ivry-sur-le-Lac',
  },
  {
    label: 'Saint-Faustin--Lac-Carré',
    value: 'CA/QC/Saint-Faustin--Lac-Carré',
  },
  {
    label: 'Barkmere',
    value: 'CA/QC/Barkmere',
  },
  {
    label: 'Montcalm',
    value: 'CA/QC/Montcalm',
  },
  {
    label: 'Huberdeau',
    value: 'CA/QC/Huberdeau',
  },
  {
    label: 'Lac-Supérieur',
    value: 'CA/QC/Lac-Supérieur',
  },
  {
    label: 'Val-des-Lacs',
    value: 'CA/QC/Val-des-Lacs',
  },
  {
    label: 'Mont-Tremblant',
    value: 'CA/QC/Mont-Tremblant',
  },
  {
    label: 'La Conception',
    value: 'CA/QC/La Conception',
  },
  {
    label: 'Labelle',
    value: 'CA/QC/Labelle',
  },
  {
    label: 'Lac-Tremblant-Nord',
    value: 'CA/QC/Lac-Tremblant-Nord',
  },
  {
    label: 'La Minerve',
    value: 'CA/QC/La Minerve',
  },
  {
    label: 'Notre-Dame-du-Laus',
    value: 'CA/QC/Notre-Dame-du-Laus',
  },
  {
    label: 'Notre-Dame-de-Pontmain',
    value: 'CA/QC/Notre-Dame-de-Pontmain',
  },
  {
    label: 'Lac-du-Cerf',
    value: 'CA/QC/Lac-du-Cerf',
  },
  {
    label: 'Saint-Aimé-du-Lac-des-Îles',
    value: 'CA/QC/Saint-Aimé-du-Lac-des-Îles',
  },
  {
    label: 'Kiamika',
    value: 'CA/QC/Kiamika',
  },
  {
    label: 'Nominingue',
    value: 'CA/QC/Nominingue',
  },
  {
    label: 'Rivière-Rouge',
    value: 'CA/QC/Rivière-Rouge',
  },
  {
    label: 'La Macaza',
    value: 'CA/QC/La Macaza',
  },
  {
    label: "L'Ascension",
    value: "CA/QC/L'Ascension",
  },
  {
    label: 'Chute-Saint-Philippe',
    value: 'CA/QC/Chute-Saint-Philippe',
  },
  {
    label: 'Lac-des-Écorces',
    value: 'CA/QC/Lac-des-Écorces',
  },
  {
    label: 'Mont-Laurier',
    value: 'CA/QC/Mont-Laurier',
  },
  {
    label: 'Ferme-Neuve',
    value: 'CA/QC/Ferme-Neuve',
  },
  {
    label: 'Lac-Saint-Paul',
    value: 'CA/QC/Lac-Saint-Paul',
  },
  {
    label: 'Mont-Saint-Michel',
    value: 'CA/QC/Mont-Saint-Michel',
  },
  {
    label: 'Sainte-Anne-du-Lac',
    value: 'CA/QC/Sainte-Anne-du-Lac',
  },
  {
    label: 'Fassett',
    value: 'CA/QC/Fassett',
  },
  {
    label: 'Montebello',
    value: 'CA/QC/Montebello',
  },
  {
    label: 'Notre-Dame-de-Bonsecours',
    value: 'CA/QC/Notre-Dame-de-Bonsecours',
  },
  {
    label: 'Notre-Dame-de-la-Paix',
    value: 'CA/QC/Notre-Dame-de-la-Paix',
  },
  {
    label: 'Saint-André-Avellin',
    value: 'CA/QC/Saint-André-Avellin',
  },
  {
    label: 'Papineauville',
    value: 'CA/QC/Papineauville',
  },
  {
    label: 'Plaisance',
    value: 'CA/QC/Plaisance',
  },
  {
    label: 'Thurso',
    value: 'CA/QC/Thurso',
  },
  {
    label: 'Mayo',
    value: 'CA/QC/Mayo',
  },
  {
    label: 'Saint-Sixte',
    value: 'CA/QC/Saint-Sixte',
  },
  {
    label: 'Ripon',
    value: 'CA/QC/Ripon',
  },
  {
    label: 'Mulgrave-et-Derry',
    value: 'CA/QC/Mulgrave-et-Derry',
  },
  {
    label: 'Montpellier',
    value: 'CA/QC/Montpellier',
  },
  {
    label: 'Lac-Simon',
    value: 'CA/QC/Lac-Simon',
  },
  {
    label: 'Chénéville',
    value: 'CA/QC/Chénéville',
  },
  {
    label: 'Namur',
    value: 'CA/QC/Namur',
  },
  {
    label: 'Boileau',
    value: 'CA/QC/Boileau',
  },
  {
    label: 'Saint-Émile-de-Suffolk',
    value: 'CA/QC/Saint-Émile-de-Suffolk',
  },
  {
    label: 'Lac-des-Plages',
    value: 'CA/QC/Lac-des-Plages',
  },
  {
    label: 'Duhamel',
    value: 'CA/QC/Duhamel',
  },
  {
    label: 'Val-des-Bois',
    value: 'CA/QC/Val-des-Bois',
  },
  {
    label: 'Bowman',
    value: 'CA/QC/Bowman',
  },
  {
    label: 'Gatineau',
    value: 'CA/QC/Gatineau',
  },
  {
    label: "L'Ange-Gardien",
    value: "CA/QC/L'Ange-Gardien",
  },
  {
    label: 'Notre-Dame-de-la-Salette',
    value: 'CA/QC/Notre-Dame-de-la-Salette',
  },
  {
    label: 'Val-des-Monts',
    value: 'CA/QC/Val-des-Monts',
  },
  {
    label: 'Cantley',
    value: 'CA/QC/Cantley',
  },
  {
    label: 'Chelsea',
    value: 'CA/QC/Chelsea',
  },
  {
    label: 'Pontiac',
    value: 'CA/QC/Pontiac',
  },
  {
    label: 'La Pêche',
    value: 'CA/QC/La Pêche',
  },
  {
    label: 'Denholm',
    value: 'CA/QC/Denholm',
  },
  {
    label: 'Kazabazua',
    value: 'CA/QC/Kazabazua',
  },
  {
    label: 'Lac-Sainte-Marie',
    value: 'CA/QC/Lac-Sainte-Marie',
  },
  {
    label: 'Gracefield',
    value: 'CA/QC/Gracefield',
  },
  {
    label: 'Cayamant',
    value: 'CA/QC/Cayamant',
  },
  {
    label: 'Blue Sea',
    value: 'CA/QC/Blue Sea',
  },
  {
    label: 'Bouchette',
    value: 'CA/QC/Bouchette',
  },
  {
    label: 'Sainte-Thérèse-de-la-Gatineau',
    value: 'CA/QC/Sainte-Thérèse-de-la-Gatineau',
  },
  {
    label: 'Messines',
    value: 'CA/QC/Messines',
  },
  {
    label: 'Maniwaki',
    value: 'CA/QC/Maniwaki',
  },
  {
    label: 'Déléage',
    value: 'CA/QC/Déléage',
  },
  {
    label: 'Egan-Sud',
    value: 'CA/QC/Egan-Sud',
  },
  {
    label: 'Bois-Franc',
    value: 'CA/QC/Bois-Franc',
  },
  {
    label: 'Montcerf-Lytton',
    value: 'CA/QC/Montcerf-Lytton',
  },
  {
    label: 'Grand-Remous',
    value: 'CA/QC/Grand-Remous',
  },
  {
    label: 'Bristol',
    value: 'CA/QC/Bristol',
  },
  {
    label: 'Shawville',
    value: 'CA/QC/Shawville',
  },
  {
    label: 'Clarendon',
    value: 'CA/QC/Clarendon',
  },
  {
    label: 'Bryson',
    value: 'CA/QC/Bryson',
  },
  {
    label: "Campbell's Bay",
    value: "CA/QC/Campbell's Bay",
  },
  {
    label: "L'Île-du-Grand-Calumet",
    value: "CA/QC/L'Île-du-Grand-Calumet",
  },
  {
    label: 'Litchfield',
    value: 'CA/QC/Litchfield',
  },
  {
    label: 'Thorne',
    value: 'CA/QC/Thorne',
  },
  {
    label: 'Alleyn-et-Cawood',
    value: 'CA/QC/Alleyn-et-Cawood',
  },
  {
    label: 'Otter Lake',
    value: 'CA/QC/Otter Lake',
  },
  {
    label: 'Mansfield-et-Pontefract',
    value: 'CA/QC/Mansfield-et-Pontefract',
  },
  {
    label: 'Waltham',
    value: 'CA/QC/Waltham',
  },
  {
    label: "L'Isle-aux-Allumettes",
    value: "CA/QC/L'Isle-aux-Allumettes",
  },
  {
    label: 'Sheenboro',
    value: 'CA/QC/Sheenboro',
  },
  {
    label: 'Rapides-des-Joachims',
    value: 'CA/QC/Rapides-des-Joachims',
  },
  {
    label: 'Témiscaming',
    value: 'CA/QC/Témiscaming',
  },
  {
    label: 'Kipawa',
    value: 'CA/QC/Kipawa',
  },
  {
    label: 'Béarn',
    value: 'CA/QC/Béarn',
  },
  {
    label: 'Ville-Marie',
    value: 'CA/QC/Ville-Marie',
  },
  {
    label: 'Duhamel-Ouest',
    value: 'CA/QC/Duhamel-Ouest',
  },
  {
    label: 'Lorrainville',
    value: 'CA/QC/Lorrainville',
  },
  {
    label: 'Saint-Bruno-de-Guigues',
    value: 'CA/QC/Saint-Bruno-de-Guigues',
  },
  {
    label: 'Laverlochère',
    value: 'CA/QC/Laverlochère',
  },
  {
    label: 'Fugèreville',
    value: 'CA/QC/Fugèreville',
  },
  {
    label: 'Belleterre',
    value: 'CA/QC/Belleterre',
  },
  {
    label: 'Laforce',
    value: 'CA/QC/Laforce',
  },
  {
    label: 'Moffet',
    value: 'CA/QC/Moffet',
  },
  {
    label: 'Saint-Eugène-de-Guigues',
    value: 'CA/QC/Saint-Eugène-de-Guigues',
  },
  {
    label: 'Notre-Dame-du-Nord',
    value: 'CA/QC/Notre-Dame-du-Nord',
  },
  {
    label: 'Rémigny',
    value: 'CA/QC/Rémigny',
  },
  {
    label: 'Rouyn-Noranda',
    value: 'CA/QC/Rouyn-Noranda',
  },
  {
    label: 'Duparquet',
    value: 'CA/QC/Duparquet',
  },
  {
    label: 'Rapide-Danseur',
    value: 'CA/QC/Rapide-Danseur',
  },
  {
    label: 'Roquemaure',
    value: 'CA/QC/Roquemaure',
  },
  {
    label: 'Gallichan',
    value: 'CA/QC/Gallichan',
  },
  {
    label: 'Palmarolle',
    value: 'CA/QC/Palmarolle',
  },
  {
    label: 'Sainte-Germaine-Boulé',
    value: 'CA/QC/Sainte-Germaine-Boulé',
  },
  {
    label: 'Poularies',
    value: 'CA/QC/Poularies',
  },
  {
    label: 'Taschereau',
    value: 'CA/QC/Taschereau',
  },
  {
    label: 'Authier',
    value: 'CA/QC/Authier',
  },
  {
    label: 'Macamic',
    value: 'CA/QC/Macamic',
  },
  {
    label: 'Clerval',
    value: 'CA/QC/Clerval',
  },
  {
    label: 'La Reine',
    value: 'CA/QC/La Reine',
  },
  {
    label: 'Dupuy',
    value: 'CA/QC/Dupuy',
  },
  {
    label: 'La Sarre',
    value: 'CA/QC/La Sarre',
  },
  {
    label: 'Chazel',
    value: 'CA/QC/Chazel',
  },
  {
    label: 'Authier-Nord',
    value: 'CA/QC/Authier-Nord',
  },
  {
    label: 'Val-Saint-Gilles',
    value: 'CA/QC/Val-Saint-Gilles',
  },
  {
    label: 'Normétal',
    value: 'CA/QC/Normétal',
  },
  {
    label: 'Champneuf',
    value: 'CA/QC/Champneuf',
  },
  {
    label: 'Rochebaucourt',
    value: 'CA/QC/Rochebaucourt',
  },
  {
    label: 'La Morandière',
    value: 'CA/QC/La Morandière',
  },
  {
    label: 'Barraute',
    value: 'CA/QC/Barraute',
  },
  {
    label: 'La Corne',
    value: 'CA/QC/La Corne',
  },
  {
    label: 'La Motte',
    value: 'CA/QC/La Motte',
  },
  {
    label: "Saint-Mathieu-d'Harricana",
    value: "CA/QC/Saint-Mathieu-d'Harricana",
  },
  {
    label: 'Amos',
    value: 'CA/QC/Amos',
  },
  {
    label: 'Saint-Félix-de-Dalquier',
    value: 'CA/QC/Saint-Félix-de-Dalquier',
  },
  {
    label: 'Saint-Dominique-du-Rosaire',
    value: 'CA/QC/Saint-Dominique-du-Rosaire',
  },
  {
    label: 'Berry',
    value: 'CA/QC/Berry',
  },
  {
    label: 'Sainte-Gertrude-Manneville',
    value: 'CA/QC/Sainte-Gertrude-Manneville',
  },
  {
    label: 'Preissac',
    value: 'CA/QC/Preissac',
  },
  {
    label: "Val-d'Or",
    value: "CA/QC/Val-d'Or",
  },
  {
    label: 'Rivière-Héva',
    value: 'CA/QC/Rivière-Héva',
  },
  {
    label: 'Malartic',
    value: 'CA/QC/Malartic',
  },
  {
    label: 'Senneterre',
    value: 'CA/QC/Senneterre',
  },
  {
    label: 'Belcourt',
    value: 'CA/QC/Belcourt',
  },
  {
    label: 'La Tuque',
    value: 'CA/QC/La Tuque',
  },
  {
    label: 'La Bostonnais',
    value: 'CA/QC/La Bostonnais',
  },
  {
    label: 'Lac-Édouard',
    value: 'CA/QC/Lac-Édouard',
  },
  {
    label: 'Lac-Bouchette',
    value: 'CA/QC/Lac-Bouchette',
  },
  {
    label: 'Saint-François-de-Sales',
    value: 'CA/QC/Saint-François-de-Sales',
  },
  {
    label: 'Chambord',
    value: 'CA/QC/Chambord',
  },
  {
    label: 'Roberval',
    value: 'CA/QC/Roberval',
  },
  {
    label: 'Sainte-Hedwidge',
    value: 'CA/QC/Sainte-Hedwidge',
  },
  {
    label: 'Saint-Prime',
    value: 'CA/QC/Saint-Prime',
  },
  {
    label: 'Saint-Félicien',
    value: 'CA/QC/Saint-Félicien',
  },
  {
    label: 'Péribonka',
    value: 'CA/QC/Péribonka',
  },
  {
    label: 'Dolbeau-Mistassini',
    value: 'CA/QC/Dolbeau-Mistassini',
  },
  {
    label: 'Albanel',
    value: 'CA/QC/Albanel',
  },
  {
    label: 'Normandin',
    value: 'CA/QC/Normandin',
  },
  {
    label: 'Saint-Thomas-Didyme',
    value: 'CA/QC/Saint-Thomas-Didyme',
  },
  {
    label: 'Saint-Edmond-les-Plaines',
    value: 'CA/QC/Saint-Edmond-les-Plaines',
  },
  {
    label: 'Girardville',
    value: 'CA/QC/Girardville',
  },
  {
    label: 'Notre-Dame-de-Lorette',
    value: 'CA/QC/Notre-Dame-de-Lorette',
  },
  {
    label: "Saint-Eugène-d'Argentenay",
    value: "CA/QC/Saint-Eugène-d'Argentenay",
  },
  {
    label: 'Saint-Stanislas',
    value: 'CA/QC/Saint-Stanislas',
  },
  {
    label: 'Desbiens',
    value: 'CA/QC/Desbiens',
  },
  {
    label: 'Métabetchouan--Lac-à-la-Croix',
    value: 'CA/QC/Métabetchouan--Lac-à-la-Croix',
  },
  {
    label: 'Hébertville',
    value: 'CA/QC/Hébertville',
  },
  {
    label: 'Saint-Bruno',
    value: 'CA/QC/Saint-Bruno',
  },
  {
    label: 'Saint-Gédéon',
    value: 'CA/QC/Saint-Gédéon',
  },
  {
    label: 'Alma',
    value: 'CA/QC/Alma',
  },
  {
    label: 'Saint-Nazaire',
    value: 'CA/QC/Saint-Nazaire',
  },
  {
    label: 'Labrecque',
    value: 'CA/QC/Labrecque',
  },
  {
    label: 'Lamarche',
    value: 'CA/QC/Lamarche',
  },
  {
    label: 'Saint-Henri-de-Taillon',
    value: 'CA/QC/Saint-Henri-de-Taillon',
  },
  {
    label: 'Sainte-Monique',
    value: 'CA/QC/Sainte-Monique',
  },
  {
    label: 'Saint-Ludger-de-Milot',
    value: 'CA/QC/Saint-Ludger-de-Milot',
  },
  {
    label: 'Saguenay',
    value: 'CA/QC/Saguenay',
  },
  {
    label: 'Petit-Saguenay',
    value: 'CA/QC/Petit-Saguenay',
  },
  {
    label: "L'Anse-Saint-Jean",
    value: "CA/QC/L'Anse-Saint-Jean",
  },
  {
    label: 'Rivière-Éternité',
    value: 'CA/QC/Rivière-Éternité',
  },
  {
    label: 'Ferland-et-Boilleau',
    value: 'CA/QC/Ferland-et-Boilleau',
  },
  {
    label: "Saint-Félix-d'Otis",
    value: "CA/QC/Saint-Félix-d'Otis",
  },
  {
    label: 'Saint-Fulgence',
    value: 'CA/QC/Saint-Fulgence',
  },
  {
    label: 'Saint-Honoré',
    value: 'CA/QC/Saint-Honoré',
  },
  {
    label: 'Saint-David-de-Falardeau',
    value: 'CA/QC/Saint-David-de-Falardeau',
  },
  {
    label: 'Bégin',
    value: 'CA/QC/Bégin',
  },
  {
    label: 'Saint-Ambroise',
    value: 'CA/QC/Saint-Ambroise',
  },
  {
    label: 'Saint-Charles-de-Bourget',
    value: 'CA/QC/Saint-Charles-de-Bourget',
  },
  {
    label: 'Larouche',
    value: 'CA/QC/Larouche',
  },
  {
    label: 'Sacré-Coeur',
    value: 'CA/QC/Sacré-Coeur',
  },
  {
    label: 'Les Bergeronnes',
    value: 'CA/QC/Les Bergeronnes',
  },
  {
    label: 'Les Escoumins',
    value: 'CA/QC/Les Escoumins',
  },
  {
    label: 'Longue-Rive',
    value: 'CA/QC/Longue-Rive',
  },
  {
    label: 'Portneuf-sur-Mer',
    value: 'CA/QC/Portneuf-sur-Mer',
  },
  {
    label: 'Forestville',
    value: 'CA/QC/Forestville',
  },
  {
    label: 'Colombier',
    value: 'CA/QC/Colombier',
  },
  {
    label: 'Franquelin',
    value: 'CA/QC/Franquelin',
  },
  {
    label: 'Baie-Comeau',
    value: 'CA/QC/Baie-Comeau',
  },
  {
    label: 'Sept-Îles',
    value: 'CA/QC/Sept-Îles',
  },
  {
    label: 'Port-Cartier',
    value: 'CA/QC/Port-Cartier',
  },
  {
    label: 'Fermont',
    value: 'CA/QC/Fermont',
  },
  {
    label: 'Schefferville',
    value: 'CA/QC/Schefferville',
  },
  {
    label: 'Blanc-Sablon',
    value: 'CA/QC/Blanc-Sablon',
  },
  {
    label: 'Bonne-Espérance',
    value: 'CA/QC/Bonne-Espérance',
  },
  {
    label: 'Saint-Augustin',
    value: 'CA/QC/Saint-Augustin',
  },
  {
    label: 'Gros-Mécatina',
    value: 'CA/QC/Gros-Mécatina',
  },
  {
    label: 'Côte-Nord-du-Golfe-du-Saint-Laurent',
    value: 'CA/QC/Côte-Nord-du-Golfe-du-Saint-Laurent',
  },
  {
    label: "L'Île-d'Anticosti",
    value: "CA/QC/L'Île-d'Anticosti",
  },
  {
    label: 'Aguanish',
    value: 'CA/QC/Aguanish',
  },
  {
    label: 'Baie-Johan-Beetz',
    value: 'CA/QC/Baie-Johan-Beetz',
  },
  {
    label: 'Havre-Saint-Pierre',
    value: 'CA/QC/Havre-Saint-Pierre',
  },
  {
    label: 'Longue-Pointe-de-Mingan',
    value: 'CA/QC/Longue-Pointe-de-Mingan',
  },
  {
    label: 'Rivière-Saint-Jean',
    value: 'CA/QC/Rivière-Saint-Jean',
  },
  {
    label: 'Rivière-au-Tonnerre',
    value: 'CA/QC/Rivière-au-Tonnerre',
  },
  {
    label: 'Lebel-sur-Quévillon',
    value: 'CA/QC/Lebel-sur-Quévillon',
  },
  {
    label: 'Matagami',
    value: 'CA/QC/Matagami',
  },
  {
    label: 'Chapais',
    value: 'CA/QC/Chapais',
  },
  {
    label: 'Chibougamau',
    value: 'CA/QC/Chibougamau',
  },
  {
    label: 'Eeyou Istchee Baie-James',
    value: 'CA/QC/Eeyou Istchee Baie-James',
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
