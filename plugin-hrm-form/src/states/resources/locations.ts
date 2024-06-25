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
import { FilterOption } from './types';

// Temporary until we pull these options from the DB - we could pull them from S3 but not worth it for a temp workaround

// Deduplicate based on value and sort by label
const dedupAndSort = (arr: FilterOption[]) => {
  const mapped = arr.reduce((optionMap: Record<string, FilterOption>, option: FilterOption) => {
    optionMap[option.value] = option;
    return optionMap;
  }, {});
  const deduped = Object.values(mapped);
  return deduped.sort((a, b) => a.label.localeCompare(b.label));
};

export const provinceOptions = dedupAndSort([
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
]);

export const regionOptions = dedupAndSort([
  {
    label: 'Acadia',
    value: 'CA/AB/Acadia',
  },
  {
    label: 'Airdie',
    value: 'CA/AB/Airdie',
  },
  {
    label: 'Athabasca',
    value: 'CA/AB/Athabasca',
  },
  {
    label: 'Barrhead',
    value: 'CA/AB/Barrhead',
  },
  {
    label: 'Beaver',
    value: 'CA/AB/Beaver',
  },
  {
    label: 'Big Lakes',
    value: 'CA/AB/Big Lakes',
  },
  {
    label: 'Bighorn',
    value: 'CA/AB/Bighorn',
  },
  {
    label: 'Birch Hills',
    value: 'CA/AB/Birch Hills',
  },
  {
    label: 'Bonnyville',
    value: 'CA/AB/Bonnyville',
  },
  {
    label: 'Brazeau',
    value: 'CA/AB/Brazeau',
  },
  {
    label: 'Brooks',
    value: 'CA/AB/Brooks',
  },
  {
    label: 'Calgary',
    value: 'CA/AB/Calgary',
  },
  {
    label: 'Camrose',
    value: 'CA/AB/Camrose',
  },
  {
    label: 'Canmore',
    value: 'CA/AB/Canmore',
  },
  {
    label: 'Cardston',
    value: 'CA/AB/Cardston',
  },
  {
    label: 'Clear Hills',
    value: 'CA/AB/Clear Hills',
  },
  {
    label: 'Clearwater',
    value: 'CA/AB/Clearwater',
  },
  {
    label: 'Cold Lake',
    value: 'CA/AB/Cold Lake',
  },
  {
    label: 'Cypress',
    value: 'CA/AB/Cypress',
  },
  {
    label: 'Edmonton',
    value: 'CA/AB/Edmonton',
  },
  {
    label: 'Fairview',
    value: 'CA/AB/Fairview',
  },
  {
    label: 'Flagstaff',
    value: 'CA/AB/Flagstaff',
  },
  {
    label: 'Foothills',
    value: 'CA/AB/Foothills',
  },
  {
    label: 'Fort Mcleod',
    value: 'CA/AB/Fort Mcleod',
  },
  {
    label: 'Fort Mcmurray',
    value: 'CA/AB/Fort Mcmurray',
  },
  {
    label: 'Fort Saskatchewan',
    value: 'CA/AB/Fort Saskatchewan',
  },
  {
    label: 'Forty Mile',
    value: 'CA/AB/Forty Mile',
  },
  {
    label: 'Grande Prairie',
    value: 'CA/AB/Grande Prairie',
  },
  {
    label: 'Greenview',
    value: 'CA/AB/Greenview',
  },
  {
    label: 'Jasper',
    value: 'CA/AB/Jasper',
  },
  {
    label: 'Kneehill',
    value: 'CA/AB/Kneehill',
  },
  {
    label: 'Lac Ste. Anne',
    value: 'CA/AB/Lac Ste. Anne',
  },
  {
    label: 'Lacombe',
    value: 'CA/AB/Lacombe',
  },
  {
    label: 'Lakeland',
    value: 'CA/AB/Lakeland',
  },
  {
    label: 'Lamont',
    value: 'CA/AB/Lamont',
  },
  {
    label: 'Leduc',
    value: 'CA/AB/Leduc',
  },
  {
    label: 'Lesser Slave River',
    value: 'CA/AB/Lesser Slave River',
  },
  {
    label: 'Lethbridge',
    value: 'CA/AB/Lethbridge',
  },
  {
    label: 'Lloydminster (Part)',
    value: 'CA/AB/Lloydminster (Part)',
  },
  {
    label: 'Mackenzie',
    value: 'CA/AB/Mackenzie',
  },
  {
    label: 'Medicine Hat',
    value: 'CA/AB/Medicine Hat',
  },
  {
    label: 'Minburn',
    value: 'CA/AB/Minburn',
  },
  {
    label: 'Mountain View',
    value: 'CA/AB/Mountain View',
  },
  {
    label: 'Newell',
    value: 'CA/AB/Newell',
  },
  {
    label: 'Northern Lights',
    value: 'CA/AB/Northern Lights',
  },
  {
    label: 'Northern Sunrise',
    value: 'CA/AB/Northern Sunrise',
  },
  {
    label: 'Opportunity',
    value: 'CA/AB/Opportunity',
  },
  {
    label: 'Paintearth',
    value: 'CA/AB/Paintearth',
  },
  {
    label: 'Parkland',
    value: 'CA/AB/Parkland',
  },
  {
    label: 'Peace',
    value: 'CA/AB/Peace',
  },
  {
    label: 'Pincher Creek',
    value: 'CA/AB/Pincher Creek',
  },
  {
    label: 'Ponoka',
    value: 'CA/AB/Ponoka',
  },
  {
    label: 'Provost',
    value: 'CA/AB/Provost',
  },
  {
    label: 'Red Deer',
    value: 'CA/AB/Red Deer',
  },
  {
    label: 'Rocky Mountain House',
    value: 'CA/AB/Rocky Mountain House',
  },
  {
    label: 'Rocky View',
    value: 'CA/AB/Rocky View',
  },
  {
    label: 'Saddle Hills',
    value: 'CA/AB/Saddle Hills',
  },
  {
    label: 'Smoky Lake',
    value: 'CA/AB/Smoky Lake',
  },
  {
    label: 'Spirit River',
    value: 'CA/AB/Spirit River',
  },
  {
    label: 'Spruce Grove',
    value: 'CA/AB/Spruce Grove',
  },
  {
    label: 'St. Albert',
    value: 'CA/AB/St. Albert',
  },
  {
    label: 'St. Paul',
    value: 'CA/AB/St. Paul',
  },
  {
    label: 'Starland',
    value: 'CA/AB/Starland',
  },
  {
    label: 'Stettler',
    value: 'CA/AB/Stettler',
  },
  {
    label: 'Strathcona',
    value: 'CA/AB/Strathcona',
  },
  {
    label: 'Strathmore',
    value: 'CA/AB/Strathmore',
  },
  {
    label: 'Sturgeon',
    value: 'CA/AB/Sturgeon',
  },
  {
    label: 'Taber',
    value: 'CA/AB/Taber',
  },
  {
    label: 'Thorhild',
    value: 'CA/AB/Thorhild',
  },
  {
    label: 'Two Hills',
    value: 'CA/AB/Two Hills',
  },
  {
    label: 'Vermilion River',
    value: 'CA/AB/Vermilion River',
  },
  {
    label: 'Vulcan',
    value: 'CA/AB/Vulcan',
  },
  {
    label: 'Wainwright',
    value: 'CA/AB/Wainwright',
  },
  {
    label: 'Warner',
    value: 'CA/AB/Warner',
  },
  {
    label: 'Westlock',
    value: 'CA/AB/Westlock',
  },
  {
    label: 'Wetaskiwin',
    value: 'CA/AB/Wetaskiwin',
  },
  {
    label: 'Wheatland',
    value: 'CA/AB/Wheatland',
  },
  {
    label: 'Willow Creek',
    value: 'CA/AB/Willow Creek',
  },
  {
    label: 'Wood Buffalo',
    value: 'CA/AB/Wood Buffalo',
  },
  {
    label: 'Woodlands',
    value: 'CA/AB/Woodlands',
  },
  {
    label: 'Yellowhead',
    value: 'CA/AB/Yellowhead',
  },
  {
    label: 'Alberni-Clayoquot',
    value: 'CA/BC/Alberni-Clayoquot',
  },
  {
    label: 'Bulkley-Nechako',
    value: 'CA/BC/Bulkley-Nechako',
  },
  {
    label: 'Capital',
    value: 'CA/BC/Capital',
  },
  {
    label: 'Cariboo',
    value: 'CA/BC/Cariboo',
  },
  {
    label: 'Central Coast',
    value: 'CA/BC/Central Coast',
  },
  {
    label: 'Central Kootenay',
    value: 'CA/BC/Central Kootenay',
  },
  {
    label: 'Central Okanagan',
    value: 'CA/BC/Central Okanagan',
  },
  {
    label: 'Columbia-Shuswap',
    value: 'CA/BC/Columbia-Shuswap',
  },
  {
    label: 'Comox Valley',
    value: 'CA/BC/Comox Valley',
  },
  {
    label: 'Coquitlam',
    value: 'CA/BC/Coquitlam',
  },
  {
    label: 'Cowichan Valley',
    value: 'CA/BC/Cowichan Valley',
  },
  {
    label: 'East Kootenay',
    value: 'CA/BC/East Kootenay',
  },
  {
    label: 'Fraser-Fort George',
    value: 'CA/BC/Fraser-Fort George',
  },
  {
    label: 'Fraser Valley',
    value: 'CA/BC/Fraser Valley',
  },
  {
    label: 'Greater Vancouver',
    value: 'CA/BC/Greater Vancouver',
  },
  {
    label: 'Kitimat-Stikine',
    value: 'CA/BC/Kitimat-Stikine',
  },
  {
    label: 'Kootenay Boundary',
    value: 'CA/BC/Kootenay Boundary',
  },
  {
    label: 'Metro Vancouver',
    value: 'CA/BC/Metro Vancouver',
  },
  {
    label: 'Mount Waddington',
    value: 'CA/BC/Mount Waddington',
  },
  {
    label: 'Nanaimo',
    value: 'CA/BC/Nanaimo',
  },
  {
    label: 'New Westminster',
    value: 'CA/BC/New Westminster',
  },
  {
    label: 'North Cowichan',
    value: 'CA/BC/North Cowichan',
  },
  {
    label: 'North Okanagan',
    value: 'CA/BC/North Okanagan',
  },
  {
    label: 'Northern Rockies',
    value: 'CA/BC/Northern Rockies',
  },
  {
    label: 'Okanagan-Similkameen',
    value: 'CA/BC/Okanagan-Similkameen',
  },
  {
    label: 'Peace River',
    value: 'CA/BC/Peace River',
  },
  {
    label: 'Powell River',
    value: 'CA/BC/Powell River',
  },
  {
    label: 'Skeena-Queen Charlotte',
    value: 'CA/BC/Skeena-Queen Charlotte',
  },
  {
    label: 'Squamish-Lillooet',
    value: 'CA/BC/Squamish-Lillooet',
  },
  {
    label: 'Stikine',
    value: 'CA/BC/Stikine',
  },
  {
    label: 'Strathcona',
    value: 'CA/BC/Strathcona',
  },
  {
    label: 'Sunshine Coast',
    value: 'CA/BC/Sunshine Coast',
  },
  {
    label: 'Thompson-Nicola',
    value: 'CA/BC/Thompson-Nicola',
  },
  {
    label: 'Vancouver',
    value: 'CA/BC/Vancouver',
  },
  {
    label: 'Vancouver Metro',
    value: 'CA/BC/Vancouver Metro',
  },
  {
    label: 'Altona',
    value: 'CA/MB/Altona',
  },
  {
    label: 'Arborg',
    value: 'CA/MB/Arborg',
  },
  {
    label: 'Beausejour',
    value: 'CA/MB/Beausejour',
  },
  {
    label: 'Bifrost-Riverton',
    value: 'CA/MB/Bifrost-Riverton',
  },
  {
    label: 'Brandon',
    value: 'CA/MB/Brandon',
  },
  {
    label: 'Brenda-Waskada',
    value: 'CA/MB/Brenda-Waskada',
  },
  {
    label: 'Carberry',
    value: 'CA/MB/Carberry',
  },
  {
    label: 'Carman',
    value: 'CA/MB/Carman',
  },
  {
    label: 'Cartwright-Roblin',
    value: 'CA/MB/Cartwright-Roblin',
  },
  {
    label: 'Central Manitoba',
    value: 'CA/MB/Central Manitoba',
  },
  {
    label: 'Central Plains',
    value: 'CA/MB/Central Plains',
  },
  {
    label: 'Churchill',
    value: 'CA/MB/Churchill',
  },
  {
    label: 'Churchill And Northern Manitoba',
    value: 'CA/MB/Churchill And Northern Manitoba',
  },
  {
    label: 'Clanwilliam-Erickson',
    value: 'CA/MB/Clanwilliam-Erickson',
  },
  {
    label: 'Dauphin',
    value: 'CA/MB/Dauphin',
  },
  {
    label: 'Deloraine-Winchester',
    value: 'CA/MB/Deloraine-Winchester',
  },
  {
    label: 'Eastern Manitoba',
    value: 'CA/MB/Eastern Manitoba',
  },
  {
    label: 'Eastman',
    value: 'CA/MB/Eastman',
  },
  {
    label: 'Emerson-Franklin',
    value: 'CA/MB/Emerson-Franklin',
  },
  {
    label: 'Ethelbert',
    value: 'CA/MB/Ethelbert',
  },
  {
    label: 'Flin Flon',
    value: 'CA/MB/Flin Flon',
  },
  {
    label: 'Flin Flon And North West',
    value: 'CA/MB/Flin Flon And North West',
  },
  {
    label: 'Gilbert Plains',
    value: 'CA/MB/Gilbert Plains',
  },
  {
    label: 'Gillam',
    value: 'CA/MB/Gillam',
  },
  {
    label: 'Glenboro-South Cypress',
    value: 'CA/MB/Glenboro-South Cypress',
  },
  {
    label: 'Glenella-Lansdowne',
    value: 'CA/MB/Glenella-Lansdowne',
  },
  {
    label: 'Grand Rapids',
    value: 'CA/MB/Grand Rapids',
  },
  {
    label: 'Grandview',
    value: 'CA/MB/Grandview',
  },
  {
    label: 'Grassland',
    value: 'CA/MB/Grassland',
  },
  {
    label: 'Hamiota',
    value: 'CA/MB/Hamiota',
  },
  {
    label: 'Harrison Park',
    value: 'CA/MB/Harrison Park',
  },
  {
    label: 'Indigenous And Municipal Relations',
    value: 'CA/MB/Indigenous And Municipal Relations',
  },
  {
    label: 'Interlake',
    value: 'CA/MB/Interlake',
  },
  {
    label: 'Killarney-Turtle Mountain',
    value: 'CA/MB/Killarney-Turtle Mountain',
  },
  {
    label: 'Lac Du Bonnet',
    value: 'CA/MB/Lac Du Bonnet',
  },
  {
    label: 'Leaf Rapids',
    value: 'CA/MB/Leaf Rapids',
  },
  {
    label: 'Lgd Of Pinawa',
    value: 'CA/MB/Lgd Of Pinawa',
  },
  {
    label: 'Lorne',
    value: 'CA/MB/Lorne',
  },
  {
    label: 'Louise',
    value: 'CA/MB/Louise',
  },
  {
    label: 'Lynn Lake',
    value: 'CA/MB/Lynn Lake',
  },
  {
    label: 'Mccreary',
    value: 'CA/MB/Mccreary',
  },
  {
    label: 'Melita',
    value: 'CA/MB/Melita',
  },
  {
    label: 'Minitonas-Bowsman',
    value: 'CA/MB/Minitonas-Bowsman',
  },
  {
    label: 'Minnedosa',
    value: 'CA/MB/Minnedosa',
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
    label: 'Morton-Boissevain',
    value: 'CA/MB/Morton-Boissevain',
  },
  {
    label: 'Mossey River',
    value: 'CA/MB/Mossey River',
  },
  {
    label: 'Neepawa',
    value: 'CA/MB/Neepawa',
  },
  {
    label: 'Niverville',
    value: 'CA/MB/Niverville',
  },
  {
    label: 'Norfolk Treherne',
    value: 'CA/MB/Norfolk Treherne',
  },
  {
    label: 'North Cypress-Langford',
    value: 'CA/MB/North Cypress-Langford',
  },
  {
    label: 'North East',
    value: 'CA/MB/North East',
  },
  {
    label: 'North Interlake',
    value: 'CA/MB/North Interlake',
  },
  {
    label: 'North Norfolk',
    value: 'CA/MB/North Norfolk',
  },
  {
    label: 'Northern',
    value: 'CA/MB/Northern',
  },
  {
    label: 'Oakland-Wawanesa',
    value: 'CA/MB/Oakland-Wawanesa',
  },
  {
    label: 'Parkland',
    value: 'CA/MB/Parkland',
  },
  {
    label: 'Pembina',
    value: 'CA/MB/Pembina',
  },
  {
    label: 'Pembina Valley',
    value: 'CA/MB/Pembina Valley',
  },
  {
    label: 'Pilot Mound',
    value: 'CA/MB/Pilot Mound',
  },
  {
    label: 'Portage La Prairie',
    value: 'CA/MB/Portage La Prairie',
  },
  {
    label: 'Powerview-Pine Falls',
    value: 'CA/MB/Powerview-Pine Falls',
  },
  {
    label: 'Prairie View',
    value: 'CA/MB/Prairie View',
  },
  {
    label: 'Rhineland',
    value: 'CA/MB/Rhineland',
  },
  {
    label: 'Riverdale',
    value: 'CA/MB/Riverdale',
  },
  {
    label: 'Rm Of Alexander',
    value: 'CA/MB/Rm Of Alexander',
  },
  {
    label: 'Rm Of Alonsa',
    value: 'CA/MB/Rm Of Alonsa',
  },
  {
    label: 'Rm Of Argyle',
    value: 'CA/MB/Rm Of Argyle',
  },
  {
    label: 'Rm Of Armstrong',
    value: 'CA/MB/Rm Of Armstrong',
  },
  {
    label: 'Rm Of Brokenhead',
    value: 'CA/MB/Rm Of Brokenhead',
  },
  {
    label: 'Rm Of Cartier',
    value: 'CA/MB/Rm Of Cartier',
  },
  {
    label: 'Rm Of Coldwell',
    value: 'CA/MB/Rm Of Coldwell',
  },
  {
    label: 'Rm Of Cornwallis',
    value: 'CA/MB/Rm Of Cornwallis',
  },
  {
    label: 'Rm Of Dauphin',
    value: 'CA/MB/Rm Of Dauphin',
  },
  {
    label: 'Rm Of De Salaberry',
    value: 'CA/MB/Rm Of De Salaberry',
  },
  {
    label: 'Rm Of Dufferin',
    value: 'CA/MB/Rm Of Dufferin',
  },
  {
    label: 'Rm Of East St. Paul',
    value: 'CA/MB/Rm Of East St. Paul',
  },
  {
    label: 'Rm Of Ellice-Archie',
    value: 'CA/MB/Rm Of Ellice-Archie',
  },
  {
    label: 'Rm Of Elton',
    value: 'CA/MB/Rm Of Elton',
  },
  {
    label: 'Rm Of Fisher',
    value: 'CA/MB/Rm Of Fisher',
  },
  {
    label: 'Rm Of Gimli',
    value: 'CA/MB/Rm Of Gimli',
  },
  {
    label: 'Rm Of Grahamdale',
    value: 'CA/MB/Rm Of Grahamdale',
  },
  {
    label: 'Rm Of Grey',
    value: 'CA/MB/Rm Of Grey',
  },
  {
    label: 'Rm Of Hanover',
    value: 'CA/MB/Rm Of Hanover',
  },
  {
    label: 'Rm Of Headingley',
    value: 'CA/MB/Rm Of Headingley',
  },
  {
    label: 'Rm Of Kelsey',
    value: 'CA/MB/Rm Of Kelsey',
  },
  {
    label: 'Rm Of La Broquerie',
    value: 'CA/MB/Rm Of La Broquerie',
  },
  {
    label: 'Rm Of Lac Du Bonnet',
    value: 'CA/MB/Rm Of Lac Du Bonnet',
  },
  {
    label: 'Rm Of Lakeshore',
    value: 'CA/MB/Rm Of Lakeshore',
  },
  {
    label: 'Rm Of Macdonald',
    value: 'CA/MB/Rm Of Macdonald',
  },
  {
    label: 'Rm Of Minto-Odanah',
    value: 'CA/MB/Rm Of Minto-Odanah',
  },
  {
    label: 'Rm Of Montcalm',
    value: 'CA/MB/Rm Of Montcalm',
  },
  {
    label: 'Rm Of Morris',
    value: 'CA/MB/Rm Of Morris',
  },
  {
    label: 'Rm Of Mountain',
    value: 'CA/MB/Rm Of Mountain',
  },
  {
    label: 'Rm Of Oakview',
    value: 'CA/MB/Rm Of Oakview',
  },
  {
    label: 'Rm Of Piney',
    value: 'CA/MB/Rm Of Piney',
  },
  {
    label: 'Rm Of Pipestone',
    value: 'CA/MB/Rm Of Pipestone',
  },
  {
    label: 'Rm Of Portage La Prairie',
    value: 'CA/MB/Rm Of Portage La Prairie',
  },
  {
    label: 'Rm Of Prairie Lakes',
    value: 'CA/MB/Rm Of Prairie Lakes',
  },
  {
    label: 'Rm Of Reynolds',
    value: 'CA/MB/Rm Of Reynolds',
  },
  {
    label: 'Rm Of Riding Mountain West',
    value: 'CA/MB/Rm Of Riding Mountain West',
  },
  {
    label: 'Rm Of Ritchot',
    value: 'CA/MB/Rm Of Ritchot',
  },
  {
    label: 'Rm Of Rockwood',
    value: 'CA/MB/Rm Of Rockwood',
  },
  {
    label: 'Rm Of Roland',
    value: 'CA/MB/Rm Of Roland',
  },
  {
    label: 'Rm Of Rosedale',
    value: 'CA/MB/Rm Of Rosedale',
  },
  {
    label: 'Rm Of Rosser',
    value: 'CA/MB/Rm Of Rosser',
  },
  {
    label: 'Rm Of Sifton',
    value: 'CA/MB/Rm Of Sifton',
  },
  {
    label: 'Rm Of Springfield',
    value: 'CA/MB/Rm Of Springfield',
  },
  {
    label: 'Rm Of St. Andrews',
    value: 'CA/MB/Rm Of St. Andrews',
  },
  {
    label: 'Rm Of St. Clements',
    value: 'CA/MB/Rm Of St. Clements',
  },
  {
    label: 'Rm Of St. François Xavier',
    value: 'CA/MB/Rm Of St. François Xavier',
  },
  {
    label: 'Rm Of St. Laurent',
    value: 'CA/MB/Rm Of St. Laurent',
  },
  {
    label: 'Rm Of Stanley',
    value: 'CA/MB/Rm Of Stanley',
  },
  {
    label: 'Rm Of Ste. Anne',
    value: 'CA/MB/Rm Of Ste. Anne',
  },
  {
    label: 'Rm Of Stuartburn',
    value: 'CA/MB/Rm Of Stuartburn',
  },
  {
    label: 'Rm Of Taché',
    value: 'CA/MB/Rm Of Taché',
  },
  {
    label: 'Rm Of Thompson',
    value: 'CA/MB/Rm Of Thompson',
  },
  {
    label: 'Rm Of Victoria',
    value: 'CA/MB/Rm Of Victoria',
  },
  {
    label: 'Rm Of Victoria Beach',
    value: 'CA/MB/Rm Of Victoria Beach',
  },
  {
    label: 'Rm Of Wallace-Woodworth',
    value: 'CA/MB/Rm Of Wallace-Woodworth',
  },
  {
    label: 'Rm Of West Interlake',
    value: 'CA/MB/Rm Of West Interlake',
  },
  {
    label: 'Rm Of West St. Paul',
    value: 'CA/MB/Rm Of West St. Paul',
  },
  {
    label: 'Rm Of Whitehead',
    value: 'CA/MB/Rm Of Whitehead',
  },
  {
    label: 'Rm Of Whitemouth',
    value: 'CA/MB/Rm Of Whitemouth',
  },
  {
    label: 'Rm Of Woodlands',
    value: 'CA/MB/Rm Of Woodlands',
  },
  {
    label: 'Rm Of Yellowhead',
    value: 'CA/MB/Rm Of Yellowhead',
  },
  {
    label: 'Roblin',
    value: 'CA/MB/Roblin',
  },
  {
    label: 'Roblin, Russell, Rossburn',
    value: 'CA/MB/Roblin, Russell, Rossburn',
  },
  {
    label: 'Rossburn',
    value: 'CA/MB/Rossburn',
  },
  {
    label: 'Russell-Binscarth',
    value: 'CA/MB/Russell-Binscarth',
  },
  {
    label: 'Selkirk',
    value: 'CA/MB/Selkirk',
  },
  {
    label: 'Snow Lake',
    value: 'CA/MB/Snow Lake',
  },
  {
    label: 'Souris-Glenwood',
    value: 'CA/MB/Souris-Glenwood',
  },
  {
    label: 'South Interlake',
    value: 'CA/MB/South Interlake',
  },
  {
    label: 'South West',
    value: 'CA/MB/South West',
  },
  {
    label: 'Ste. Rose',
    value: 'CA/MB/Ste. Rose',
  },
  {
    label: 'Steinbach',
    value: 'CA/MB/Steinbach',
  },
  {
    label: 'Stonewall',
    value: 'CA/MB/Stonewall',
  },
  {
    label: 'Swan River',
    value: 'CA/MB/Swan River',
  },
  {
    label: 'Swan Valley West',
    value: 'CA/MB/Swan Valley West',
  },
  {
    label: 'Teulon',
    value: 'CA/MB/Teulon',
  },
  {
    label: 'The Pas',
    value: 'CA/MB/The Pas',
  },
  {
    label: 'Thompson',
    value: 'CA/MB/Thompson',
  },
  {
    label: 'Thompson And North Central',
    value: 'CA/MB/Thompson And North Central',
  },
  {
    label: 'Two Borders',
    value: 'CA/MB/Two Borders',
  },
  {
    label: 'Village Of Dunnottar',
    value: 'CA/MB/Village Of Dunnottar',
  },
  {
    label: 'Village Of St. Pierre-Jolys',
    value: 'CA/MB/Village Of St. Pierre-Jolys',
  },
  {
    label: 'Virden',
    value: 'CA/MB/Virden',
  },
  {
    label: 'Western Manitoba',
    value: 'CA/MB/Western Manitoba',
  },
  {
    label: 'Westlake-Gladstone',
    value: 'CA/MB/Westlake-Gladstone',
  },
  {
    label: 'Westman',
    value: 'CA/MB/Westman',
  },
  {
    label: 'Whitehorse Plains',
    value: 'CA/MB/Whitehorse Plains',
  },
  {
    label: 'Winkler',
    value: 'CA/MB/Winkler',
  },
  {
    label: 'Winnipeg',
    value: 'CA/MB/Winnipeg',
  },
  {
    label: 'Winnipeg Beach',
    value: 'CA/MB/Winnipeg Beach',
  },
  {
    label: 'Winnipeg Capital',
    value: 'CA/MB/Winnipeg Capital',
  },
  {
    label: 'Albert',
    value: 'CA/NB/Albert',
  },
  {
    label: 'Carleton',
    value: 'CA/NB/Carleton',
  },
  {
    label: 'Charlotte',
    value: 'CA/NB/Charlotte',
  },
  {
    label: 'Gloucester',
    value: 'CA/NB/Gloucester',
  },
  {
    label: 'Kent',
    value: 'CA/NB/Kent',
  },
  {
    label: 'Kings',
    value: 'CA/NB/Kings',
  },
  {
    label: 'Madawaska',
    value: 'CA/NB/Madawaska',
  },
  {
    label: 'Northumberland',
    value: 'CA/NB/Northumberland',
  },
  {
    label: 'Queens',
    value: 'CA/NB/Queens',
  },
  {
    label: 'Restigouche',
    value: 'CA/NB/Restigouche',
  },
  {
    label: 'Saint John',
    value: 'CA/NB/Saint John',
  },
  {
    label: 'Sunbury',
    value: 'CA/NB/Sunbury',
  },
  {
    label: 'Victoria',
    value: 'CA/NB/Victoria',
  },
  {
    label: 'Westmorland',
    value: 'CA/NB/Westmorland',
  },
  {
    label: 'York',
    value: 'CA/NB/York',
  },
  {
    label: 'Avalon',
    value: 'CA/NL/Avalon',
  },
  {
    label: 'Burin Peninsula',
    value: 'CA/NL/Burin Peninsula',
  },
  {
    label: 'Central',
    value: 'CA/NL/Central',
  },
  {
    label: 'Clarenville',
    value: 'CA/NL/Clarenville',
  },
  {
    label: 'Conception Bay - St. Johns',
    value: 'CA/NL/Conception Bay - St. Johns',
  },
  {
    label: 'Corner Brook',
    value: 'CA/NL/Corner Brook',
  },
  {
    label: 'Eastern',
    value: 'CA/NL/Eastern',
  },
  {
    label: 'Grand-Sault',
    value: 'CA/NL/Grand-Sault',
  },
  {
    label: 'Harbour Breton',
    value: 'CA/NL/Harbour Breton',
  },
  {
    label: 'Hopedale',
    value: 'CA/NL/Hopedale',
  },
  {
    label: 'Labrador',
    value: 'CA/NL/Labrador',
  },
  {
    label: 'Labrador City',
    value: 'CA/NL/Labrador City',
  },
  {
    label: 'Stephenville',
    value: 'CA/NL/Stephenville',
  },
  {
    label: 'Western',
    value: 'CA/NL/Western',
  },
  {
    label: 'Wiltondale',
    value: 'CA/NL/Wiltondale',
  },
  {
    label: 'Woodstock',
    value: 'CA/NL/Woodstock',
  },
  {
    label: 'Dehcho',
    value: 'CA/NT/Dehcho',
  },
  {
    label: 'Inuvik',
    value: 'CA/NT/Inuvik',
  },
  {
    label: 'North Slave',
    value: 'CA/NT/North Slave',
  },
  {
    label: 'Region 1',
    value: 'CA/NT/Region 1',
  },
  {
    label: 'Region 2',
    value: 'CA/NT/Region 2',
  },
  {
    label: 'Region 4',
    value: 'CA/NT/Region 4',
  },
  {
    label: 'Region 5',
    value: 'CA/NT/Region 5',
  },
  {
    label: 'Region 6',
    value: 'CA/NT/Region 6',
  },
  {
    label: 'Sahtu',
    value: 'CA/NT/Sahtu',
  },
  {
    label: 'South Slave',
    value: 'CA/NT/South Slave',
  },
  {
    label: 'Annapolis',
    value: 'CA/NS/Annapolis',
  },
  {
    label: 'Antigonish',
    value: 'CA/NS/Antigonish',
  },
  {
    label: 'Cape Breton',
    value: 'CA/NS/Cape Breton',
  },
  {
    label: 'Colchester',
    value: 'CA/NS/Colchester',
  },
  {
    label: 'Cumberland',
    value: 'CA/NS/Cumberland',
  },
  {
    label: 'Digby',
    value: 'CA/NS/Digby',
  },
  {
    label: 'Guysborough',
    value: 'CA/NS/Guysborough',
  },
  {
    label: 'Halifax',
    value: 'CA/NS/Halifax',
  },
  {
    label: 'Hants',
    value: 'CA/NS/Hants',
  },
  {
    label: 'Inverness',
    value: 'CA/NS/Inverness',
  },
  {
    label: 'Kings',
    value: 'CA/NS/Kings',
  },
  {
    label: 'Lunenburg',
    value: 'CA/NS/Lunenburg',
  },
  {
    label: 'Pictou',
    value: 'CA/NS/Pictou',
  },
  {
    label: 'Queens',
    value: 'CA/NS/Queens',
  },
  {
    label: 'Richmond',
    value: 'CA/NS/Richmond',
  },
  {
    label: 'Shelburne',
    value: 'CA/NS/Shelburne',
  },
  {
    label: 'Victoria',
    value: 'CA/NS/Victoria',
  },
  {
    label: 'Yarmouth',
    value: 'CA/NS/Yarmouth',
  },
  {
    label: 'Kitikmeot',
    value: 'CA/NU/Kitikmeot',
  },
  {
    label: 'Kivalliq',
    value: 'CA/NU/Kivalliq',
  },
  {
    label: 'Qikiqtaaluk',
    value: 'CA/NU/Qikiqtaaluk',
  },
  {
    label: 'Algoma',
    value: 'CA/ON/Algoma',
  },
  {
    label: 'Brant',
    value: 'CA/ON/Brant',
  },
  {
    label: 'Bruce',
    value: 'CA/ON/Bruce',
  },
  {
    label: 'Chatham-Kent',
    value: 'CA/ON/Chatham-Kent',
  },
  {
    label: 'Cochrane',
    value: 'CA/ON/Cochrane',
  },
  {
    label: 'Dufferin',
    value: 'CA/ON/Dufferin',
  },
  {
    label: 'Durham',
    value: 'CA/ON/Durham',
  },
  {
    label: 'Elgin',
    value: 'CA/ON/Elgin',
  },
  {
    label: 'Essex',
    value: 'CA/ON/Essex',
  },
  {
    label: 'Frontenac',
    value: 'CA/ON/Frontenac',
  },
  {
    label: 'Grey',
    value: 'CA/ON/Grey',
  },
  {
    label: 'Haldimand-Norfolk',
    value: 'CA/ON/Haldimand-Norfolk',
  },
  {
    label: 'Haliburton',
    value: 'CA/ON/Haliburton',
  },
  {
    label: 'Halton',
    value: 'CA/ON/Halton',
  },
  {
    label: 'Hamilton',
    value: 'CA/ON/Hamilton',
  },
  {
    label: 'Hastings',
    value: 'CA/ON/Hastings',
  },
  {
    label: 'Huron',
    value: 'CA/ON/Huron',
  },
  {
    label: 'Kawartha',
    value: 'CA/ON/Kawartha',
  },
  {
    label: 'Kawartha Lakes',
    value: 'CA/ON/Kawartha Lakes',
  },
  {
    label: 'Kenora',
    value: 'CA/ON/Kenora',
  },
  {
    label: 'Lambton',
    value: 'CA/ON/Lambton',
  },
  {
    label: 'Lanark',
    value: 'CA/ON/Lanark',
  },
  {
    label: 'Leeds And Grenville',
    value: 'CA/ON/Leeds And Grenville',
  },
  {
    label: 'Lennox And Addington',
    value: 'CA/ON/Lennox And Addington',
  },
  {
    label: 'Manitoulin',
    value: 'CA/ON/Manitoulin',
  },
  {
    label: 'Middlesex',
    value: 'CA/ON/Middlesex',
  },
  {
    label: 'Muskoka',
    value: 'CA/ON/Muskoka',
  },
  {
    label: 'Niagara',
    value: 'CA/ON/Niagara',
  },
  {
    label: 'Nipissing',
    value: 'CA/ON/Nipissing',
  },
  {
    label: 'Northumberland',
    value: 'CA/ON/Northumberland',
  },
  {
    label: 'Ottawa',
    value: 'CA/ON/Ottawa',
  },
  {
    label: 'Oxford',
    value: 'CA/ON/Oxford',
  },
  {
    label: 'Parry Sound',
    value: 'CA/ON/Parry Sound',
  },
  {
    label: 'Peel',
    value: 'CA/ON/Peel',
  },
  {
    label: 'Perth',
    value: 'CA/ON/Perth',
  },
  {
    label: 'Peterborough',
    value: 'CA/ON/Peterborough',
  },
  {
    label: 'Prescott And Russell',
    value: 'CA/ON/Prescott And Russell',
  },
  {
    label: 'Prince Edward',
    value: 'CA/ON/Prince Edward',
  },
  {
    label: 'Quebec',
    value: 'CA/ON/Quebec',
  },
  {
    label: 'Rainy River',
    value: 'CA/ON/Rainy River',
  },
  {
    label: 'Renfrew',
    value: 'CA/ON/Renfrew',
  },
  {
    label: 'Simcoe',
    value: 'CA/ON/Simcoe',
  },
  {
    label: 'Stormont, Dundas And Glengarry',
    value: 'CA/ON/Stormont, Dundas And Glengarry',
  },
  {
    label: 'Sudbury',
    value: 'CA/ON/Sudbury',
  },
  {
    label: 'Thunder Bay',
    value: 'CA/ON/Thunder Bay',
  },
  {
    label: 'Timiskaming',
    value: 'CA/ON/Timiskaming',
  },
  {
    label: 'Toronto',
    value: 'CA/ON/Toronto',
  },
  {
    label: 'Waterloo',
    value: 'CA/ON/Waterloo',
  },
  {
    label: 'Wellington',
    value: 'CA/ON/Wellington',
  },
  {
    label: 'York',
    value: 'CA/ON/York',
  },
  {
    label: 'Kings',
    value: 'CA/PE/Kings',
  },
  {
    label: 'Prince',
    value: 'CA/PE/Prince',
  },
  {
    label: 'Queens',
    value: 'CA/PE/Queens',
  },
  {
    label: 'Abitibi-Témiscamingue',
    value: 'CA/QC/Abitibi-Témiscamingue',
  },
  {
    label: 'Bas-Saint-Laurent',
    value: 'CA/QC/Bas-Saint-Laurent',
  },
  {
    label: 'Capitale-Nationale',
    value: 'CA/QC/Capitale-Nationale',
  },
  {
    label: 'Centre-du-Québec',
    value: 'CA/QC/Centre-du-Québec',
  },
  {
    label: 'Chaudière-Appalaches',
    value: 'CA/QC/Chaudière-Appalaches',
  },
  {
    label: 'Côte-Nord',
    value: 'CA/QC/Côte-Nord',
  },
  {
    label: 'Estrie',
    value: 'CA/QC/Estrie',
  },
  {
    label: 'Gaspésie-Îles-de-La-Madeleine',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine',
  },
  {
    label: 'Lanaudière',
    value: 'CA/QC/Lanaudière',
  },
  {
    label: 'Laurentides',
    value: 'CA/QC/Laurentides',
  },
  {
    label: 'Laval',
    value: 'CA/QC/Laval',
  },
  {
    label: 'Longueuil',
    value: 'CA/QC/Longueuil',
  },
  {
    label: 'Mauricie',
    value: 'CA/QC/Mauricie',
  },
  {
    label: 'Montérégie',
    value: 'CA/QC/Montérégie',
  },
  {
    label: 'Montréal',
    value: 'CA/QC/Montréal',
  },
  {
    label: 'Montrégie',
    value: 'CA/QC/Montrégie',
  },
  {
    label: 'Nord-du-Québec',
    value: 'CA/QC/Nord-du-Québec',
  },
  {
    label: 'Outaouais',
    value: 'CA/QC/Outaouais',
  },
  {
    label: 'Saguenay-Lac-Saint-Jean',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean',
  },
  {
    label: 'Assiniboia',
    value: 'CA/SK/Assiniboia',
  },
  {
    label: 'Battleford North',
    value: 'CA/SK/Battleford North',
  },
  {
    label: 'Cadillac',
    value: 'CA/SK/Cadillac',
  },
  {
    label: 'Central East',
    value: 'CA/SK/Central East',
  },
  {
    label: 'Central West',
    value: 'CA/SK/Central West',
  },
  {
    label: 'Estevan',
    value: 'CA/SK/Estevan',
  },
  {
    label: 'Kindersley',
    value: 'CA/SK/Kindersley',
  },
  {
    label: 'Lloydminster',
    value: 'CA/SK/Lloydminster',
  },
  {
    label: 'Melville',
    value: 'CA/SK/Melville',
  },
  {
    label: 'Moose Jaw',
    value: 'CA/SK/Moose Jaw',
  },
  {
    label: 'Nipawin',
    value: 'CA/SK/Nipawin',
  },
  {
    label: 'North',
    value: 'CA/SK/North',
  },
  {
    label: 'Prince Albert',
    value: 'CA/SK/Prince Albert',
  },
  {
    label: 'Regina',
    value: 'CA/SK/Regina',
  },
  {
    label: 'Rosetown',
    value: 'CA/SK/Rosetown',
  },
  {
    label: 'Saskatoon',
    value: 'CA/SK/Saskatoon',
  },
  {
    label: 'South East',
    value: 'CA/SK/South East',
  },
  {
    label: 'South West',
    value: 'CA/SK/South West',
  },
  {
    label: 'Swift Current',
    value: 'CA/SK/Swift Current',
  },
  {
    label: 'Wadena',
    value: 'CA/SK/Wadena',
  },
  {
    label: 'Weyburn',
    value: 'CA/SK/Weyburn',
  },
  {
    label: 'Yorkton',
    value: 'CA/SK/Yorkton',
  },
  {
    label: 'Kluane',
    value: 'CA/YT/Kluane',
  },
  {
    label: 'Liard',
    value: 'CA/YT/Liard',
  },
  {
    label: 'Northern',
    value: 'CA/YT/Northern',
  },
  {
    label: 'Northern Tuchone',
    value: 'CA/YT/Northern Tuchone',
  },
  {
    label: 'Southern Lakes',
    value: 'CA/YT/Southern Lakes',
  },
  {
    label: 'Yukon',
    value: 'CA/YT/Yukon',
  },
]);

export const cityOptions = dedupAndSort([
  {
    label: 'Acadia Valley',
    value: 'CA/AB/Acadia/Acadia Valley',
  },
  {
    label: 'Altario',
    value: 'CA/AB/Acadia/Altario',
  },
  {
    label: 'Big Stone',
    value: 'CA/AB/Acadia/Big Stone',
  },
  {
    label: 'Bindloss',
    value: 'CA/AB/Acadia/Bindloss',
  },
  {
    label: 'Buffalo',
    value: 'CA/AB/Acadia/Buffalo',
  },
  {
    label: 'Cereal',
    value: 'CA/AB/Acadia/Cereal',
  },
  {
    label: 'Cessford',
    value: 'CA/AB/Acadia/Cessford',
  },
  {
    label: 'Chinook',
    value: 'CA/AB/Acadia/Chinook',
  },
  {
    label: 'Compeer',
    value: 'CA/AB/Acadia/Compeer',
  },
  {
    label: 'Consort',
    value: 'CA/AB/Acadia/Consort',
  },
  {
    label: 'Empress',
    value: 'CA/AB/Acadia/Empress',
  },
  {
    label: 'Esther',
    value: 'CA/AB/Acadia/Esther',
  },
  {
    label: 'Finnegan',
    value: 'CA/AB/Acadia/Finnegan',
  },
  {
    label: 'Hanna',
    value: 'CA/AB/Acadia/Hanna',
  },
  {
    label: 'Jenner',
    value: 'CA/AB/Acadia/Jenner',
  },
  {
    label: 'Kirriemuir',
    value: 'CA/AB/Acadia/Kirriemuir',
  },
  {
    label: 'Monitor',
    value: 'CA/AB/Acadia/Monitor',
  },
  {
    label: 'New Brigden',
    value: 'CA/AB/Acadia/New Brigden',
  },
  {
    label: 'Oyen',
    value: 'CA/AB/Acadia/Oyen',
  },
  {
    label: 'Pollockville',
    value: 'CA/AB/Acadia/Pollockville',
  },
  {
    label: 'Sedalia',
    value: 'CA/AB/Acadia/Sedalia',
  },
  {
    label: 'Sibbald',
    value: 'CA/AB/Acadia/Sibbald',
  },
  {
    label: 'Sunnynook',
    value: 'CA/AB/Acadia/Sunnynook',
  },
  {
    label: 'Veteran',
    value: 'CA/AB/Acadia/Veteran',
  },
  {
    label: 'Wardlow',
    value: 'CA/AB/Acadia/Wardlow',
  },
  {
    label: 'Youngstown',
    value: 'CA/AB/Acadia/Youngstown',
  },
  {
    label: 'Crossfield',
    value: 'CA/AB/Airdie/Crossfield',
  },
  {
    label: 'Abee',
    value: 'CA/AB/Athabasca/Abee',
  },
  {
    label: 'Alberta Beach',
    value: 'CA/AB/Athabasca/Alberta Beach',
  },
  {
    label: 'Athabasca',
    value: 'CA/AB/Athabasca/Athabasca',
  },
  {
    label: 'Atmore',
    value: 'CA/AB/Athabasca/Atmore',
  },
  {
    label: 'Barrhead',
    value: 'CA/AB/Athabasca/Barrhead',
  },
  {
    label: 'Boyle',
    value: 'CA/AB/Athabasca/Boyle',
  },
  {
    label: 'Breynat',
    value: 'CA/AB/Athabasca/Breynat',
  },
  {
    label: 'Busby',
    value: 'CA/AB/Athabasca/Busby',
  },
  {
    label: 'Caslan',
    value: 'CA/AB/Athabasca/Caslan',
  },
  {
    label: 'Clyde',
    value: 'CA/AB/Athabasca/Clyde',
  },
  {
    label: 'Colinton',
    value: 'CA/AB/Athabasca/Colinton',
  },
  {
    label: 'Darwell',
    value: 'CA/AB/Athabasca/Darwell',
  },
  {
    label: 'Ellscott',
    value: 'CA/AB/Athabasca/Ellscott',
  },
  {
    label: 'Fawcett',
    value: 'CA/AB/Athabasca/Fawcett',
  },
  {
    label: 'Fort Assiniboine',
    value: 'CA/AB/Athabasca/Fort Assiniboine',
  },
  {
    label: 'Glenevis',
    value: 'CA/AB/Athabasca/Glenevis',
  },
  {
    label: 'Grassland',
    value: 'CA/AB/Athabasca/Grassland',
  },
  {
    label: 'Island Lake',
    value: 'CA/AB/Athabasca/Island Lake',
  },
  {
    label: 'Island Lake South',
    value: 'CA/AB/Athabasca/Island Lake South',
  },
  {
    label: 'Jarvie',
    value: 'CA/AB/Athabasca/Jarvie',
  },
  {
    label: 'Mayerthorpe',
    value: 'CA/AB/Athabasca/Mayerthorpe',
  },
  {
    label: 'Neerlandia',
    value: 'CA/AB/Athabasca/Neerlandia',
  },
  {
    label: 'Newbrook',
    value: 'CA/AB/Athabasca/Newbrook',
  },
  {
    label: 'Onoway',
    value: 'CA/AB/Athabasca/Onoway',
  },
  {
    label: 'Perryvale',
    value: 'CA/AB/Athabasca/Perryvale',
  },
  {
    label: 'Pickardville',
    value: 'CA/AB/Athabasca/Pickardville',
  },
  {
    label: 'Radway',
    value: 'CA/AB/Athabasca/Radway',
  },
  {
    label: 'Rochester',
    value: 'CA/AB/Athabasca/Rochester',
  },
  {
    label: 'Sangudo',
    value: 'CA/AB/Athabasca/Sangudo',
  },
  {
    label: 'South Baptiste',
    value: 'CA/AB/Athabasca/South Baptiste',
  },
  {
    label: 'Sturgeon County',
    value: 'CA/AB/Athabasca/Sturgeon County',
  },
  {
    label: 'Sunset Beach',
    value: 'CA/AB/Athabasca/Sunset Beach',
  },
  {
    label: 'Thorhild',
    value: 'CA/AB/Athabasca/Thorhild',
  },
  {
    label: 'Vimy',
    value: 'CA/AB/Athabasca/Vimy',
  },
  {
    label: 'Wandering River',
    value: 'CA/AB/Athabasca/Wandering River',
  },
  {
    label: 'West Baptiste',
    value: 'CA/AB/Athabasca/West Baptiste',
  },
  {
    label: 'Westlock',
    value: 'CA/AB/Athabasca/Westlock',
  },
  {
    label: 'Whispering Hills',
    value: 'CA/AB/Athabasca/Whispering Hills',
  },
  {
    label: 'White Gull',
    value: 'CA/AB/Athabasca/White Gull',
  },
  {
    label: 'Whitecourt',
    value: 'CA/AB/Athabasca/Whitecourt',
  },
  {
    label: 'Barrhead',
    value: 'CA/AB/Barrhead/Barrhead',
  },
  {
    label: 'Bloomsbury',
    value: 'CA/AB/Barrhead/Bloomsbury',
  },
  {
    label: 'Camp Creek',
    value: 'CA/AB/Barrhead/Camp Creek',
  },
  {
    label: 'Fort Assiniboine',
    value: 'CA/AB/Barrhead/Fort Assiniboine',
  },
  {
    label: 'Gunn',
    value: 'CA/AB/Barrhead/Gunn',
  },
  {
    label: 'Neerlandia',
    value: 'CA/AB/Barrhead/Neerlandia',
  },
  {
    label: 'Pickardville',
    value: 'CA/AB/Barrhead/Pickardville',
  },
  {
    label: 'Tiger Lily',
    value: 'CA/AB/Barrhead/Tiger Lily',
  },
  {
    label: 'Vega',
    value: 'CA/AB/Barrhead/Vega',
  },
  {
    label: 'Bruce',
    value: 'CA/AB/Beaver/Bruce',
  },
  {
    label: 'Kingman',
    value: 'CA/AB/Beaver/Kingman',
  },
  {
    label: 'Kinsella',
    value: 'CA/AB/Beaver/Kinsella',
  },
  {
    label: 'Ryley',
    value: 'CA/AB/Beaver/Ryley',
  },
  {
    label: 'Atikameg',
    value: 'CA/AB/Big Lakes/Atikameg',
  },
  {
    label: 'Cadotte Lake',
    value: 'CA/AB/Big Lakes/Cadotte Lake',
  },
  {
    label: 'Calling Lake',
    value: 'CA/AB/Big Lakes/Calling Lake',
  },
  {
    label: 'Chateh',
    value: 'CA/AB/Big Lakes/Chateh',
  },
  {
    label: 'Cherry Point',
    value: 'CA/AB/Big Lakes/Cherry Point',
  },
  {
    label: 'Chisholm Mills',
    value: 'CA/AB/Big Lakes/Chisholm Mills',
  },
  {
    label: 'Cleardale',
    value: 'CA/AB/Big Lakes/Cleardale',
  },
  {
    label: 'Deadwood',
    value: 'CA/AB/Big Lakes/Deadwood',
  },
  {
    label: 'Dixonville',
    value: 'CA/AB/Big Lakes/Dixonville',
  },
  {
    label: 'Driftpile',
    value: 'CA/AB/Big Lakes/Driftpile',
  },
  {
    label: 'Enilda',
    value: 'CA/AB/Big Lakes/Enilda',
  },
  {
    label: 'Faust',
    value: 'CA/AB/Big Lakes/Faust',
  },
  {
    label: 'Fort Vermilion',
    value: 'CA/AB/Big Lakes/Fort Vermilion',
  },
  {
    label: 'Fox Lake',
    value: 'CA/AB/Big Lakes/Fox Lake',
  },
  {
    label: 'Garden River',
    value: 'CA/AB/Big Lakes/Garden River',
  },
  {
    label: 'Gift Lake',
    value: 'CA/AB/Big Lakes/Gift Lake',
  },
  {
    label: 'Grouard',
    value: 'CA/AB/Big Lakes/Grouard',
  },
  {
    label: 'High Level',
    value: 'CA/AB/Big Lakes/High Level',
  },
  {
    label: 'High Prairie',
    value: 'CA/AB/Big Lakes/High Prairie',
  },
  {
    label: 'Hines Creek',
    value: 'CA/AB/Big Lakes/Hines Creek',
  },
  {
    label: "John D'or Prairie",
    value: "CA/AB/Big Lakes/John D'or Prairie",
  },
  {
    label: 'Joussard',
    value: 'CA/AB/Big Lakes/Joussard',
  },
  {
    label: 'Keg River',
    value: 'CA/AB/Big Lakes/Keg River',
  },
  {
    label: 'Kinuso',
    value: 'CA/AB/Big Lakes/Kinuso',
  },
  {
    label: 'La Crete',
    value: 'CA/AB/Big Lakes/La Crete',
  },
  {
    label: 'Manning',
    value: 'CA/AB/Big Lakes/Manning',
  },
  {
    label: 'Meander River',
    value: 'CA/AB/Big Lakes/Meander River',
  },
  {
    label: 'Nampa',
    value: 'CA/AB/Big Lakes/Nampa',
  },
  {
    label: 'Paddle Prairie',
    value: 'CA/AB/Big Lakes/Paddle Prairie',
  },
  {
    label: 'Rainbow Lake',
    value: 'CA/AB/Big Lakes/Rainbow Lake',
  },
  {
    label: 'Red Earth Creek',
    value: 'CA/AB/Big Lakes/Red Earth Creek',
  },
  {
    label: 'Slave Lake',
    value: 'CA/AB/Big Lakes/Slave Lake',
  },
  {
    label: 'Smith',
    value: 'CA/AB/Big Lakes/Smith',
  },
  {
    label: 'Sunset House',
    value: 'CA/AB/Big Lakes/Sunset House',
  },
  {
    label: 'Swan Hills',
    value: 'CA/AB/Big Lakes/Swan Hills',
  },
  {
    label: 'Wabasca',
    value: 'CA/AB/Big Lakes/Wabasca',
  },
  {
    label: 'Worsley',
    value: 'CA/AB/Big Lakes/Worsley',
  },
  {
    label: 'Cochrane',
    value: 'CA/AB/Bighorn/Cochrane',
  },
  {
    label: "Dead Man's Flats",
    value: "CA/AB/Bighorn/Dead Man's Flats",
  },
  {
    label: 'Exshaw',
    value: 'CA/AB/Bighorn/Exshaw',
  },
  {
    label: 'Harvie Heights',
    value: 'CA/AB/Bighorn/Harvie Heights',
  },
  {
    label: 'Lac Des Arcs',
    value: 'CA/AB/Bighorn/Lac Des Arcs',
  },
  {
    label: 'Eaglesham',
    value: 'CA/AB/Birch Hills/Eaglesham',
  },
  {
    label: 'Sexsmith',
    value: 'CA/AB/Birch Hills/Sexsmith',
  },
  {
    label: 'Tangent',
    value: 'CA/AB/Birch Hills/Tangent',
  },
  {
    label: 'Wanham',
    value: 'CA/AB/Birch Hills/Wanham',
  },
  {
    label: 'Watino',
    value: 'CA/AB/Birch Hills/Watino',
  },
  {
    label: 'Woking',
    value: 'CA/AB/Birch Hills/Woking',
  },
  {
    label: 'Ardmore',
    value: 'CA/AB/Bonnyville/Ardmore',
  },
  {
    label: 'Bonnyville',
    value: 'CA/AB/Bonnyville/Bonnyville',
  },
  {
    label: 'Cherry Grove',
    value: 'CA/AB/Bonnyville/Cherry Grove',
  },
  {
    label: 'Cold Lake',
    value: 'CA/AB/Bonnyville/Cold Lake',
  },
  {
    label: 'Fort Kent',
    value: 'CA/AB/Bonnyville/Fort Kent',
  },
  {
    label: 'Glendon',
    value: 'CA/AB/Bonnyville/Glendon',
  },
  {
    label: 'Goodridge',
    value: 'CA/AB/Bonnyville/Goodridge',
  },
  {
    label: 'Iron River',
    value: 'CA/AB/Bonnyville/Iron River',
  },
  {
    label: 'La Corey',
    value: 'CA/AB/Bonnyville/La Corey',
  },
  {
    label: 'Sputinow',
    value: 'CA/AB/Bonnyville/Sputinow',
  },
  {
    label: 'Breton',
    value: 'CA/AB/Brazeau/Breton',
  },
  {
    label: 'Buck Creek',
    value: 'CA/AB/Brazeau/Buck Creek',
  },
  {
    label: 'Carnwood',
    value: 'CA/AB/Brazeau/Carnwood',
  },
  {
    label: 'Cynthia',
    value: 'CA/AB/Brazeau/Cynthia',
  },
  {
    label: 'Drayton Valley',
    value: 'CA/AB/Brazeau/Drayton Valley',
  },
  {
    label: 'Lindale',
    value: 'CA/AB/Brazeau/Lindale',
  },
  {
    label: 'Lodgepole',
    value: 'CA/AB/Brazeau/Lodgepole',
  },
  {
    label: 'Rocky Rapids',
    value: 'CA/AB/Brazeau/Rocky Rapids',
  },
  {
    label: 'Brooks',
    value: 'CA/AB/Brooks/Brooks',
  },
  {
    label: 'Balzac',
    value: 'CA/AB/Calgary/Balzac',
  },
  {
    label: 'Beiseker',
    value: 'CA/AB/Calgary/Beiseker',
  },
  {
    label: 'Black Diamond',
    value: 'CA/AB/Calgary/Black Diamond',
  },
  {
    label: 'Blackie',
    value: 'CA/AB/Calgary/Blackie',
  },
  {
    label: 'Bragg Creek',
    value: 'CA/AB/Calgary/Bragg Creek',
  },
  {
    label: 'Calgary',
    value: 'CA/AB/Calgary/Calgary',
  },
  {
    label: 'Calgary',
    value: 'CA/AB/Calgary/Calgary',
  },
  {
    label: 'Carstairs',
    value: 'CA/AB/Calgary/Carstairs',
  },
  {
    label: 'Cayley',
    value: 'CA/AB/Calgary/Cayley',
  },
  {
    label: 'Chestermere',
    value: 'CA/AB/Calgary/Chestermere',
  },
  {
    label: 'Cochrane',
    value: 'CA/AB/Calgary/Cochrane',
  },
  {
    label: 'Cremona',
    value: 'CA/AB/Calgary/Cremona',
  },
  {
    label: 'Crossfield',
    value: 'CA/AB/Calgary/Crossfield',
  },
  {
    label: 'Didsbury',
    value: 'CA/AB/Calgary/Didsbury',
  },
  {
    label: 'Eden Valley',
    value: 'CA/AB/Calgary/Eden Valley',
  },
  {
    label: 'High River',
    value: 'CA/AB/Calgary/High River',
  },
  {
    label: 'Indus',
    value: 'CA/AB/Calgary/Indus',
  },
  {
    label: 'Langdon',
    value: 'CA/AB/Calgary/Langdon',
  },
  {
    label: 'Longview',
    value: 'CA/AB/Calgary/Longview',
  },
  {
    label: 'Millarville',
    value: 'CA/AB/Calgary/Millarville',
  },
  {
    label: 'Okotoks',
    value: 'CA/AB/Calgary/Okotoks',
  },
  {
    label: 'Olds',
    value: 'CA/AB/Calgary/Olds',
  },
  {
    label: 'Priddis',
    value: 'CA/AB/Calgary/Priddis',
  },
  {
    label: 'Redwood Meadows',
    value: 'CA/AB/Calgary/Redwood Meadows',
  },
  {
    label: 'Rocky View',
    value: 'CA/AB/Calgary/Rocky View',
  },
  {
    label: 'Sundre',
    value: 'CA/AB/Calgary/Sundre',
  },
  {
    label: "Tsuu T'ina",
    value: "CA/AB/Calgary/Tsuu T'ina",
  },
  {
    label: 'Turner Valley',
    value: 'CA/AB/Calgary/Turner Valley',
  },
  {
    label: 'Water Valley',
    value: 'CA/AB/Calgary/Water Valley',
  },
  {
    label: 'Andrew',
    value: 'CA/AB/Camrose/Andrew',
  },
  {
    label: 'Armena',
    value: 'CA/AB/Camrose/Armena',
  },
  {
    label: 'Bashaw',
    value: 'CA/AB/Camrose/Bashaw',
  },
  {
    label: 'Bawlf',
    value: 'CA/AB/Camrose/Bawlf',
  },
  {
    label: 'Beauvallon',
    value: 'CA/AB/Camrose/Beauvallon',
  },
  {
    label: 'Bittern Lake',
    value: 'CA/AB/Camrose/Bittern Lake',
  },
  {
    label: 'Bruce',
    value: 'CA/AB/Camrose/Bruce',
  },
  {
    label: 'Bruderheim',
    value: 'CA/AB/Camrose/Bruderheim',
  },
  {
    label: 'Camrose',
    value: 'CA/AB/Camrose/Camrose',
  },
  {
    label: 'Camrose County',
    value: 'CA/AB/Camrose/Camrose County',
  },
  {
    label: 'Chipman',
    value: 'CA/AB/Camrose/Chipman',
  },
  {
    label: 'Clandonald',
    value: 'CA/AB/Camrose/Clandonald',
  },
  {
    label: 'Derwent',
    value: 'CA/AB/Camrose/Derwent',
  },
  {
    label: 'Dewberry',
    value: 'CA/AB/Camrose/Dewberry',
  },
  {
    label: 'Donalda',
    value: 'CA/AB/Camrose/Donalda',
  },
  {
    label: 'Edberg',
    value: 'CA/AB/Camrose/Edberg',
  },
  {
    label: 'Ferintosh',
    value: 'CA/AB/Camrose/Ferintosh',
  },
  {
    label: 'Gwynne',
    value: 'CA/AB/Camrose/Gwynne',
  },
  {
    label: 'Hairy Hill',
    value: 'CA/AB/Camrose/Hairy Hill',
  },
  {
    label: 'Hay Lakes',
    value: 'CA/AB/Camrose/Hay Lakes',
  },
  {
    label: 'Holden',
    value: 'CA/AB/Camrose/Holden',
  },
  {
    label: 'Innisfree',
    value: 'CA/AB/Camrose/Innisfree',
  },
  {
    label: 'Islay',
    value: 'CA/AB/Camrose/Islay',
  },
  {
    label: 'Kelsey',
    value: 'CA/AB/Camrose/Kelsey',
  },
  {
    label: 'Kingman',
    value: 'CA/AB/Camrose/Kingman',
  },
  {
    label: 'Kitscoty',
    value: 'CA/AB/Camrose/Kitscoty',
  },
  {
    label: 'Lamont',
    value: 'CA/AB/Camrose/Lamont',
  },
  {
    label: 'Lloydminster',
    value: 'CA/AB/Camrose/Lloydminster',
  },
  {
    label: 'Mannville',
    value: 'CA/AB/Camrose/Mannville',
  },
  {
    label: 'Marwayne',
    value: 'CA/AB/Camrose/Marwayne',
  },
  {
    label: 'Meeting Creek',
    value: 'CA/AB/Camrose/Meeting Creek',
  },
  {
    label: 'Minburn',
    value: 'CA/AB/Camrose/Minburn',
  },
  {
    label: 'Myrnam',
    value: 'CA/AB/Camrose/Myrnam',
  },
  {
    label: 'New Norway',
    value: 'CA/AB/Camrose/New Norway',
  },
  {
    label: 'New Sarepta',
    value: 'CA/AB/Camrose/New Sarepta',
  },
  {
    label: 'Ohaton',
    value: 'CA/AB/Camrose/Ohaton',
  },
  {
    label: 'Paradise Valley',
    value: 'CA/AB/Camrose/Paradise Valley',
  },
  {
    label: 'Ranfurly',
    value: 'CA/AB/Camrose/Ranfurly',
  },
  {
    label: 'Rosalind',
    value: 'CA/AB/Camrose/Rosalind',
  },
  {
    label: 'Round Hill',
    value: 'CA/AB/Camrose/Round Hill',
  },
  {
    label: 'Ryley',
    value: 'CA/AB/Camrose/Ryley',
  },
  {
    label: 'St Michael',
    value: 'CA/AB/Camrose/St Michael',
  },
  {
    label: 'Tofield',
    value: 'CA/AB/Camrose/Tofield',
  },
  {
    label: 'Two Hills',
    value: 'CA/AB/Camrose/Two Hills',
  },
  {
    label: 'Vegreville',
    value: 'CA/AB/Camrose/Vegreville',
  },
  {
    label: 'Vermilion',
    value: 'CA/AB/Camrose/Vermilion',
  },
  {
    label: 'Viking',
    value: 'CA/AB/Camrose/Viking',
  },
  {
    label: 'Willingdon',
    value: 'CA/AB/Camrose/Willingdon',
  },
  {
    label: 'Banff',
    value: 'CA/AB/Canmore/Banff',
  },
  {
    label: 'Bellevue',
    value: 'CA/AB/Canmore/Bellevue',
  },
  {
    label: 'Blairmore',
    value: 'CA/AB/Canmore/Blairmore',
  },
  {
    label: 'Canmore',
    value: 'CA/AB/Canmore/Canmore',
  },
  {
    label: 'Coleman',
    value: 'CA/AB/Canmore/Coleman',
  },
  {
    label: 'Exshaw',
    value: 'CA/AB/Canmore/Exshaw',
  },
  {
    label: 'Hillcrest Mines',
    value: 'CA/AB/Canmore/Hillcrest Mines',
  },
  {
    label: 'Jasper',
    value: 'CA/AB/Canmore/Jasper',
  },
  {
    label: 'Kananaskis',
    value: 'CA/AB/Canmore/Kananaskis',
  },
  {
    label: 'Lake Louise',
    value: 'CA/AB/Canmore/Lake Louise',
  },
  {
    label: 'Morley',
    value: 'CA/AB/Canmore/Morley',
  },
  {
    label: 'Aetna',
    value: 'CA/AB/Cardston/Aetna',
  },
  {
    label: 'Cardston',
    value: 'CA/AB/Cardston/Cardston',
  },
  {
    label: 'Del Bonita',
    value: 'CA/AB/Cardston/Del Bonita',
  },
  {
    label: 'Glenwood',
    value: 'CA/AB/Cardston/Glenwood',
  },
  {
    label: 'Hill Spring',
    value: 'CA/AB/Cardston/Hill Spring',
  },
  {
    label: 'Magrath',
    value: 'CA/AB/Cardston/Magrath',
  },
  {
    label: 'Mountain View',
    value: 'CA/AB/Cardston/Mountain View',
  },
  {
    label: 'Spring Coulee',
    value: 'CA/AB/Cardston/Spring Coulee',
  },
  {
    label: 'Welling',
    value: 'CA/AB/Cardston/Welling',
  },
  {
    label: 'Bear Canyon',
    value: 'CA/AB/Clear Hills/Bear Canyon',
  },
  {
    label: 'Bluesky',
    value: 'CA/AB/Clear Hills/Bluesky',
  },
  {
    label: 'Cherry Point',
    value: 'CA/AB/Clear Hills/Cherry Point',
  },
  {
    label: 'Cleardale',
    value: 'CA/AB/Clear Hills/Cleardale',
  },
  {
    label: 'Eureka River',
    value: 'CA/AB/Clear Hills/Eureka River',
  },
  {
    label: 'Hines Creek',
    value: 'CA/AB/Clear Hills/Hines Creek',
  },
  {
    label: 'Worsley',
    value: 'CA/AB/Clear Hills/Worsley',
  },
  {
    label: 'Alhambra',
    value: 'CA/AB/Clearwater/Alhambra',
  },
  {
    label: 'Caroline',
    value: 'CA/AB/Clearwater/Caroline',
  },
  {
    label: 'Condor',
    value: 'CA/AB/Clearwater/Condor',
  },
  {
    label: 'James River Bridge',
    value: 'CA/AB/Clearwater/James River Bridge',
  },
  {
    label: 'Leslieville',
    value: 'CA/AB/Clearwater/Leslieville',
  },
  {
    label: 'Nordegg',
    value: 'CA/AB/Clearwater/Nordegg',
  },
  {
    label: 'Rocky Mountain House',
    value: 'CA/AB/Clearwater/Rocky Mountain House',
  },
  {
    label: 'Stauffer',
    value: 'CA/AB/Clearwater/Stauffer',
  },
  {
    label: 'Cold Lake',
    value: 'CA/AB/Cold Lake/Cold Lake',
  },
  {
    label: 'Cyrpress County',
    value: 'CA/AB/Cypress/Cyrpress County',
  },
  {
    label: 'Dunmore',
    value: 'CA/AB/Cypress/Dunmore',
  },
  {
    label: 'Elkwater',
    value: 'CA/AB/Cypress/Elkwater',
  },
  {
    label: 'Hilda',
    value: 'CA/AB/Cypress/Hilda',
  },
  {
    label: 'Iddesleigh',
    value: 'CA/AB/Cypress/Iddesleigh',
  },
  {
    label: 'Irvine',
    value: 'CA/AB/Cypress/Irvine',
  },
  {
    label: 'Merdicine Hat',
    value: 'CA/AB/Cypress/Merdicine Hat',
  },
  {
    label: 'Onefour',
    value: 'CA/AB/Cypress/Onefour',
  },
  {
    label: 'Ralston',
    value: 'CA/AB/Cypress/Ralston',
  },
  {
    label: 'Schuler',
    value: 'CA/AB/Cypress/Schuler',
  },
  {
    label: 'Serven Persons',
    value: 'CA/AB/Cypress/Serven Persons',
  },
  {
    label: 'Walsh',
    value: 'CA/AB/Cypress/Walsh',
  },
  {
    label: 'Acheson',
    value: 'CA/AB/Edmonton/Acheson',
  },
  {
    label: 'Alder Flats',
    value: 'CA/AB/Edmonton/Alder Flats',
  },
  {
    label: 'Ardrossan',
    value: 'CA/AB/Edmonton/Ardrossan',
  },
  {
    label: 'Beaumont',
    value: 'CA/AB/Edmonton/Beaumont',
  },
  {
    label: 'Bon Accord',
    value: 'CA/AB/Edmonton/Bon Accord',
  },
  {
    label: 'Brazeau County',
    value: 'CA/AB/Edmonton/Brazeau County',
  },
  {
    label: 'Breton',
    value: 'CA/AB/Edmonton/Breton',
  },
  {
    label: 'Calahoo',
    value: 'CA/AB/Edmonton/Calahoo',
  },
  {
    label: 'Calmar',
    value: 'CA/AB/Edmonton/Calmar',
  },
  {
    label: 'Carvel',
    value: 'CA/AB/Edmonton/Carvel',
  },
  {
    label: 'Devon',
    value: 'CA/AB/Edmonton/Devon',
  },
  {
    label: 'Drayton Valley',
    value: 'CA/AB/Edmonton/Drayton Valley',
  },
  {
    label: 'Duffield',
    value: 'CA/AB/Edmonton/Duffield',
  },
  {
    label: 'Edmonton',
    value: 'CA/AB/Edmonton/Edmonton',
  },
  {
    label: 'Edmonton International Airport',
    value: 'CA/AB/Edmonton/Edmonton International Airport',
  },
  {
    label: 'Enoch',
    value: 'CA/AB/Edmonton/Enoch',
  },
  {
    label: 'Entwistle',
    value: 'CA/AB/Edmonton/Entwistle',
  },
  {
    label: 'Fallis',
    value: 'CA/AB/Edmonton/Fallis',
  },
  {
    label: 'Fort Saskatchewan',
    value: 'CA/AB/Edmonton/Fort Saskatchewan',
  },
  {
    label: 'Gibbons',
    value: 'CA/AB/Edmonton/Gibbons',
  },
  {
    label: 'Kapasiwin',
    value: 'CA/AB/Edmonton/Kapasiwin',
  },
  {
    label: 'Lancaster Park',
    value: 'CA/AB/Edmonton/Lancaster Park',
  },
  {
    label: 'Leduc',
    value: 'CA/AB/Edmonton/Leduc',
  },
  {
    label: 'Leduc County',
    value: 'CA/AB/Edmonton/Leduc County',
  },
  {
    label: 'Legal',
    value: 'CA/AB/Edmonton/Legal',
  },
  {
    label: 'Lodgepole',
    value: 'CA/AB/Edmonton/Lodgepole',
  },
  {
    label: 'Ma-Me-O Beach',
    value: 'CA/AB/Edmonton/Ma-Me-O Beach',
  },
  {
    label: 'Maskwacis',
    value: 'CA/AB/Edmonton/Maskwacis',
  },
  {
    label: 'Millet',
    value: 'CA/AB/Edmonton/Millet',
  },
  {
    label: 'Morinville',
    value: 'CA/AB/Edmonton/Morinville',
  },
  {
    label: 'Mulhurst Bay',
    value: 'CA/AB/Edmonton/Mulhurst Bay',
  },
  {
    label: 'New Sarepta',
    value: 'CA/AB/Edmonton/New Sarepta',
  },
  {
    label: 'Nisku',
    value: 'CA/AB/Edmonton/Nisku',
  },
  {
    label: 'Parkland County',
    value: 'CA/AB/Edmonton/Parkland County',
  },
  {
    label: 'Redwater',
    value: 'CA/AB/Edmonton/Redwater',
  },
  {
    label: 'Rolly View',
    value: 'CA/AB/Edmonton/Rolly View',
  },
  {
    label: 'Seba Beach',
    value: 'CA/AB/Edmonton/Seba Beach',
  },
  {
    label: 'Sherwood Park',
    value: 'CA/AB/Edmonton/Sherwood Park',
  },
  {
    label: 'Spring Lake',
    value: 'CA/AB/Edmonton/Spring Lake',
  },
  {
    label: 'Spruce Grove',
    value: 'CA/AB/Edmonton/Spruce Grove',
  },
  {
    label: 'St Albert',
    value: 'CA/AB/Edmonton/St Albert',
  },
  {
    label: 'Stony Plain',
    value: 'CA/AB/Edmonton/Stony Plain',
  },
  {
    label: 'Sturgeon County',
    value: 'CA/AB/Edmonton/Sturgeon County',
  },
  {
    label: 'Sunnybrook',
    value: 'CA/AB/Edmonton/Sunnybrook',
  },
  {
    label: 'Thorsby',
    value: 'CA/AB/Edmonton/Thorsby',
  },
  {
    label: 'Tomahawk',
    value: 'CA/AB/Edmonton/Tomahawk',
  },
  {
    label: 'Wabamun',
    value: 'CA/AB/Edmonton/Wabamun',
  },
  {
    label: 'Warburg',
    value: 'CA/AB/Edmonton/Warburg',
  },
  {
    label: 'Westerose',
    value: 'CA/AB/Edmonton/Westerose',
  },
  {
    label: 'Wetaskiwin',
    value: 'CA/AB/Edmonton/Wetaskiwin',
  },
  {
    label: 'Winfield',
    value: 'CA/AB/Edmonton/Winfield',
  },
  {
    label: 'Deadwood',
    value: 'CA/AB/Fairview/Deadwood',
  },
  {
    label: 'Whitelaw',
    value: 'CA/AB/Fairview/Whitelaw',
  },
  {
    label: 'Fairview',
    value: 'CA/AB/Fairview/Fairview',
  },
  {
    label: 'Castor',
    value: 'CA/AB/Flagstaff/Castor',
  },
  {
    label: 'Daysland',
    value: 'CA/AB/Flagstaff/Daysland',
  },
  {
    label: 'Forestburg',
    value: 'CA/AB/Flagstaff/Forestburg',
  },
  {
    label: 'Galahad',
    value: 'CA/AB/Flagstaff/Galahad',
  },
  {
    label: 'Killam',
    value: 'CA/AB/Flagstaff/Killam',
  },
  {
    label: 'Lougheed',
    value: 'CA/AB/Flagstaff/Lougheed',
  },
  {
    label: 'Sedgewick',
    value: 'CA/AB/Flagstaff/Sedgewick',
  },
  {
    label: 'Strome',
    value: 'CA/AB/Flagstaff/Strome',
  },
  {
    label: 'Viking',
    value: 'CA/AB/Flagstaff/Viking',
  },
  {
    label: 'Aldersyde',
    value: 'CA/AB/Foothills/Aldersyde',
  },
  {
    label: 'Black Diamond',
    value: 'CA/AB/Foothills/Black Diamond',
  },
  {
    label: 'Bragg Creek',
    value: 'CA/AB/Foothills/Bragg Creek',
  },
  {
    label: 'Cayley',
    value: 'CA/AB/Foothills/Cayley',
  },
  {
    label: 'De Winton',
    value: 'CA/AB/Foothills/De Winton',
  },
  {
    label: 'High River',
    value: 'CA/AB/Foothills/High River',
  },
  {
    label: 'Longview',
    value: 'CA/AB/Foothills/Longview',
  },
  {
    label: 'Millarville',
    value: 'CA/AB/Foothills/Millarville',
  },
  {
    label: 'Okotoks',
    value: 'CA/AB/Foothills/Okotoks',
  },
  {
    label: 'Priddis',
    value: 'CA/AB/Foothills/Priddis',
  },
  {
    label: 'Turner Valley',
    value: 'CA/AB/Foothills/Turner Valley',
  },
  {
    label: 'Brocket',
    value: 'CA/AB/Fort Mcleod/Brocket',
  },
  {
    label: 'Cardston',
    value: 'CA/AB/Fort Mcleod/Cardston',
  },
  {
    label: 'Claresholm',
    value: 'CA/AB/Fort Mcleod/Claresholm',
  },
  {
    label: 'Del Bonita',
    value: 'CA/AB/Fort Mcleod/Del Bonita',
  },
  {
    label: 'Fort Macleod',
    value: 'CA/AB/Fort Mcleod/Fort Macleod',
  },
  {
    label: 'Glenwood',
    value: 'CA/AB/Fort Mcleod/Glenwood',
  },
  {
    label: 'Granum',
    value: 'CA/AB/Fort Mcleod/Granum',
  },
  {
    label: 'Hill Spring',
    value: 'CA/AB/Fort Mcleod/Hill Spring',
  },
  {
    label: 'Lundbreck',
    value: 'CA/AB/Fort Mcleod/Lundbreck',
  },
  {
    label: 'Magrath',
    value: 'CA/AB/Fort Mcleod/Magrath',
  },
  {
    label: 'Mountain View',
    value: 'CA/AB/Fort Mcleod/Mountain View',
  },
  {
    label: 'Nanton',
    value: 'CA/AB/Fort Mcleod/Nanton',
  },
  {
    label: 'Pincher Creek',
    value: 'CA/AB/Fort Mcleod/Pincher Creek',
  },
  {
    label: 'Spring Coulee',
    value: 'CA/AB/Fort Mcleod/Spring Coulee',
  },
  {
    label: 'Stand Off',
    value: 'CA/AB/Fort Mcleod/Stand Off',
  },
  {
    label: 'Stavely',
    value: 'CA/AB/Fort Mcleod/Stavely',
  },
  {
    label: 'Waterton Park',
    value: 'CA/AB/Fort Mcleod/Waterton Park',
  },
  {
    label: 'Chard',
    value: 'CA/AB/Fort Mcmurray/Chard',
  },
  {
    label: 'Fort Chipewyan',
    value: 'CA/AB/Fort Mcmurray/Fort Chipewyan',
  },
  {
    label: 'Fort Mackay',
    value: 'CA/AB/Fort Mcmurray/Fort Mackay',
  },
  {
    label: 'Fort Mcmurray',
    value: 'CA/AB/Fort Mcmurray/Fort Mcmurray',
  },
  {
    label: 'Fort Saskatchewan',
    value: 'CA/AB/Fort Saskatchewan/Fort Saskatchewan',
  },
  {
    label: 'High RIver',
    value: 'CA/AB/Fort Saskatchewan/High RIver',
  },
  {
    label: 'Aden',
    value: 'CA/AB/Forty Mile/Aden',
  },
  {
    label: 'Bow Island',
    value: 'CA/AB/Forty Mile/Bow Island',
  },
  {
    label: 'Burdett',
    value: 'CA/AB/Forty Mile/Burdett',
  },
  {
    label: 'Etzikom',
    value: 'CA/AB/Forty Mile/Etzikom',
  },
  {
    label: 'Maleb',
    value: 'CA/AB/Forty Mile/Maleb',
  },
  {
    label: 'Manyberries',
    value: 'CA/AB/Forty Mile/Manyberries',
  },
  {
    label: 'Orion',
    value: 'CA/AB/Forty Mile/Orion',
  },
  {
    label: 'Skiff',
    value: 'CA/AB/Forty Mile/Skiff',
  },
  {
    label: 'Beaverlodge',
    value: 'CA/AB/Grande Prairie/Beaverlodge',
  },
  {
    label: 'Berwyn',
    value: 'CA/AB/Grande Prairie/Berwyn',
  },
  {
    label: 'Bezanson',
    value: 'CA/AB/Grande Prairie/Bezanson',
  },
  {
    label: 'Bonanza',
    value: 'CA/AB/Grande Prairie/Bonanza',
  },
  {
    label: 'Clairmont',
    value: 'CA/AB/Grande Prairie/Clairmont',
  },
  {
    label: 'County Of Grande Prairie No 1',
    value: 'CA/AB/Grande Prairie/County Of Grande Prairie No 1',
  },
  {
    label: 'Demmitt',
    value: 'CA/AB/Grande Prairie/Demmitt',
  },
  {
    label: 'Donnelly',
    value: 'CA/AB/Grande Prairie/Donnelly',
  },
  {
    label: 'Eaglesham',
    value: 'CA/AB/Grande Prairie/Eaglesham',
  },
  {
    label: 'Elmworth',
    value: 'CA/AB/Grande Prairie/Elmworth',
  },
  {
    label: 'Fairview',
    value: 'CA/AB/Grande Prairie/Fairview',
  },
  {
    label: 'Falher',
    value: 'CA/AB/Grande Prairie/Falher',
  },
  {
    label: 'Girouxville',
    value: 'CA/AB/Grande Prairie/Girouxville',
  },
  {
    label: 'Goodfare',
    value: 'CA/AB/Grande Prairie/Goodfare',
  },
  {
    label: 'Grande Prairie',
    value: 'CA/AB/Grande Prairie/Grande Prairie',
  },
  {
    label: 'Grimshaw',
    value: 'CA/AB/Grande Prairie/Grimshaw',
  },
  {
    label: 'Guy',
    value: 'CA/AB/Grande Prairie/Guy',
  },
  {
    label: 'Hythe',
    value: 'CA/AB/Grande Prairie/Hythe',
  },
  {
    label: 'La Glace',
    value: 'CA/AB/Grande Prairie/La Glace',
  },
  {
    label: 'Mclennan',
    value: 'CA/AB/Grande Prairie/Mclennan',
  },
  {
    label: 'Peace River',
    value: 'CA/AB/Grande Prairie/Peace River',
  },
  {
    label: 'Rycroft',
    value: 'CA/AB/Grande Prairie/Rycroft',
  },
  {
    label: 'Sexsmith',
    value: 'CA/AB/Grande Prairie/Sexsmith',
  },
  {
    label: 'Spirit River',
    value: 'CA/AB/Grande Prairie/Spirit River',
  },
  {
    label: 'Tangent',
    value: 'CA/AB/Grande Prairie/Tangent',
  },
  {
    label: 'Valhalla Centre',
    value: 'CA/AB/Grande Prairie/Valhalla Centre',
  },
  {
    label: 'Wanham',
    value: 'CA/AB/Grande Prairie/Wanham',
  },
  {
    label: 'Wembley',
    value: 'CA/AB/Grande Prairie/Wembley',
  },
  {
    label: 'Calais',
    value: 'CA/AB/Greenview/Calais',
  },
  {
    label: 'Crooked Creek',
    value: 'CA/AB/Greenview/Crooked Creek',
  },
  {
    label: 'Debolt',
    value: 'CA/AB/Greenview/Debolt',
  },
  {
    label: 'Fox Creek',
    value: 'CA/AB/Greenview/Fox Creek',
  },
  {
    label: 'Grande Cache',
    value: 'CA/AB/Greenview/Grande Cache',
  },
  {
    label: 'Grovedale',
    value: 'CA/AB/Greenview/Grovedale',
  },
  {
    label: 'Little Smoky',
    value: 'CA/AB/Greenview/Little Smoky',
  },
  {
    label: 'Valleyview',
    value: 'CA/AB/Greenview/Valleyview',
  },
  {
    label: 'Jasper',
    value: 'CA/AB/Jasper/Jasper',
  },
  {
    label: 'Carbon',
    value: 'CA/AB/Kneehill/Carbon',
  },
  {
    label: 'Drumheller',
    value: 'CA/AB/Kneehill/Drumheller',
  },
  {
    label: 'Elnora',
    value: 'CA/AB/Kneehill/Elnora',
  },
  {
    label: 'Huxley',
    value: 'CA/AB/Kneehill/Huxley',
  },
  {
    label: 'Linden',
    value: 'CA/AB/Kneehill/Linden',
  },
  {
    label: 'Swalwell',
    value: 'CA/AB/Kneehill/Swalwell',
  },
  {
    label: 'Three Hills',
    value: 'CA/AB/Kneehill/Three Hills',
  },
  {
    label: 'Torrington',
    value: 'CA/AB/Kneehill/Torrington',
  },
  {
    label: 'Trochu',
    value: 'CA/AB/Kneehill/Trochu',
  },
  {
    label: 'Wimborne',
    value: 'CA/AB/Kneehill/Wimborne',
  },
  {
    label: 'Alberta Beach',
    value: 'CA/AB/Lac Ste. Anne/Alberta Beach',
  },
  {
    label: 'Cherhill',
    value: 'CA/AB/Lac Ste. Anne/Cherhill',
  },
  {
    label: 'Darwell',
    value: 'CA/AB/Lac Ste. Anne/Darwell',
  },
  {
    label: 'Glenevis',
    value: 'CA/AB/Lac Ste. Anne/Glenevis',
  },
  {
    label: 'Lake Isle',
    value: 'CA/AB/Lac Ste. Anne/Lake Isle',
  },
  {
    label: 'Mayerthorpe',
    value: 'CA/AB/Lac Ste. Anne/Mayerthorpe',
  },
  {
    label: 'Rochfort Bridge',
    value: 'CA/AB/Lac Ste. Anne/Rochfort Bridge',
  },
  {
    label: 'Sangudo',
    value: 'CA/AB/Lac Ste. Anne/Sangudo',
  },
  {
    label: 'Stony Plain',
    value: 'CA/AB/Lac Ste. Anne/Stony Plain',
  },
  {
    label: 'Alix',
    value: 'CA/AB/Lacombe/Alix',
  },
  {
    label: 'Clive',
    value: 'CA/AB/Lacombe/Clive',
  },
  {
    label: 'Lacombe',
    value: 'CA/AB/Lacombe/Lacombe',
  },
  {
    label: 'Mirror',
    value: 'CA/AB/Lacombe/Mirror',
  },
  {
    label: 'Rosedale Valley',
    value: 'CA/AB/Lacombe/Rosedale Valley',
  },
  {
    label: 'Sylvan Lake',
    value: 'CA/AB/Lacombe/Sylvan Lake',
  },
  {
    label: 'Boyle',
    value: 'CA/AB/Lakeland/Boyle',
  },
  {
    label: 'Hylo',
    value: 'CA/AB/Lakeland/Hylo',
  },
  {
    label: 'Lac La Biche',
    value: 'CA/AB/Lakeland/Lac La Biche',
  },
  {
    label: 'Plamondon',
    value: 'CA/AB/Lakeland/Plamondon',
  },
  {
    label: 'Wandering River',
    value: 'CA/AB/Lakeland/Wandering River',
  },
  {
    label: 'Bruderheim',
    value: 'CA/AB/Lamont/Bruderheim',
  },
  {
    label: 'Chipman',
    value: 'CA/AB/Lamont/Chipman',
  },
  {
    label: 'Hilliard',
    value: 'CA/AB/Lamont/Hilliard',
  },
  {
    label: 'Lamont',
    value: 'CA/AB/Lamont/Lamont',
  },
  {
    label: 'Mundare',
    value: 'CA/AB/Lamont/Mundare',
  },
  {
    label: 'St Michael',
    value: 'CA/AB/Lamont/St Michael',
  },
  {
    label: 'Star',
    value: 'CA/AB/Lamont/Star',
  },
  {
    label: 'Wostok',
    value: 'CA/AB/Lamont/Wostok',
  },
  {
    label: 'Alsike',
    value: 'CA/AB/Leduc/Alsike',
  },
  {
    label: 'Edmonton',
    value: 'CA/AB/Leduc/Edmonton',
  },
  {
    label: 'Leduc',
    value: 'CA/AB/Leduc/Leduc',
  },
  {
    label: 'Millet',
    value: 'CA/AB/Leduc/Millet',
  },
  {
    label: 'Nisku',
    value: 'CA/AB/Leduc/Nisku',
  },
  {
    label: 'Rolly View',
    value: 'CA/AB/Leduc/Rolly View',
  },
  {
    label: 'Sherwood Park',
    value: 'CA/AB/Leduc/Sherwood Park',
  },
  {
    label: 'Sunnybrook',
    value: 'CA/AB/Leduc/Sunnybrook',
  },
  {
    label: 'Thorsby',
    value: 'CA/AB/Leduc/Thorsby',
  },
  {
    label: 'Westerose',
    value: 'CA/AB/Leduc/Westerose',
  },
  {
    label: 'Canyon Creek',
    value: 'CA/AB/Lesser Slave River/Canyon Creek',
  },
  {
    label: 'Chisholm Mills',
    value: 'CA/AB/Lesser Slave River/Chisholm Mills',
  },
  {
    label: 'Flatbush',
    value: 'CA/AB/Lesser Slave River/Flatbush',
  },
  {
    label: 'Hondo',
    value: 'CA/AB/Lesser Slave River/Hondo',
  },
  {
    label: 'Slave Lake',
    value: 'CA/AB/Lesser Slave River/Slave Lake',
  },
  {
    label: 'Smith',
    value: 'CA/AB/Lesser Slave River/Smith',
  },
  {
    label: 'Widewater',
    value: 'CA/AB/Lesser Slave River/Widewater',
  },
  {
    label: 'Barnwell',
    value: 'CA/AB/Lethbridge/Barnwell',
  },
  {
    label: 'Barons',
    value: 'CA/AB/Lethbridge/Barons',
  },
  {
    label: 'Bassano',
    value: 'CA/AB/Lethbridge/Bassano',
  },
  {
    label: 'Brooks',
    value: 'CA/AB/Lethbridge/Brooks',
  },
  {
    label: 'Coaldale',
    value: 'CA/AB/Lethbridge/Coaldale',
  },
  {
    label: 'Coalhurst',
    value: 'CA/AB/Lethbridge/Coalhurst',
  },
  {
    label: 'Coutts',
    value: 'CA/AB/Lethbridge/Coutts',
  },
  {
    label: 'Diamond City',
    value: 'CA/AB/Lethbridge/Diamond City',
  },
  {
    label: 'Duchess',
    value: 'CA/AB/Lethbridge/Duchess',
  },
  {
    label: 'Iron Springs',
    value: 'CA/AB/Lethbridge/Iron Springs',
  },
  {
    label: 'Lake Newell Resort',
    value: 'CA/AB/Lethbridge/Lake Newell Resort',
  },
  {
    label: 'Lethbridge',
    value: 'CA/AB/Lethbridge/Lethbridge',
  },
  {
    label: 'Milk River',
    value: 'CA/AB/Lethbridge/Milk River',
  },
  {
    label: 'Monarch',
    value: 'CA/AB/Lethbridge/Monarch',
  },
  {
    label: 'New Dayton',
    value: 'CA/AB/Lethbridge/New Dayton',
  },
  {
    label: 'Nobleford',
    value: 'CA/AB/Lethbridge/Nobleford',
  },
  {
    label: 'Picture Butte',
    value: 'CA/AB/Lethbridge/Picture Butte',
  },
  {
    label: 'Raymond',
    value: 'CA/AB/Lethbridge/Raymond',
  },
  {
    label: 'Rocky View',
    value: 'CA/AB/Lethbridge/Rocky View',
  },
  {
    label: 'Rolling Hills',
    value: 'CA/AB/Lethbridge/Rolling Hills',
  },
  {
    label: 'Rosemary',
    value: 'CA/AB/Lethbridge/Rosemary',
  },
  {
    label: 'Shaughnessy',
    value: 'CA/AB/Lethbridge/Shaughnessy',
  },
  {
    label: 'Stirling',
    value: 'CA/AB/Lethbridge/Stirling',
  },
  {
    label: 'Taber',
    value: 'CA/AB/Lethbridge/Taber',
  },
  {
    label: 'Tilley',
    value: 'CA/AB/Lethbridge/Tilley',
  },
  {
    label: 'Turin',
    value: 'CA/AB/Lethbridge/Turin',
  },
  {
    label: 'Vauxhall',
    value: 'CA/AB/Lethbridge/Vauxhall',
  },
  {
    label: 'Warner',
    value: 'CA/AB/Lethbridge/Warner',
  },
  {
    label: 'Lloydminster',
    value: 'CA/AB/Lloydminster (Part)/Lloydminster',
  },
  {
    label: 'Buffalo Head Prairie',
    value: 'CA/AB/Mackenzie/Buffalo Head Prairie',
  },
  {
    label: 'Fort Vermilion',
    value: 'CA/AB/Mackenzie/Fort Vermilion',
  },
  {
    label: 'La Crete',
    value: 'CA/AB/Mackenzie/La Crete',
  },
  {
    label: 'Zama City',
    value: 'CA/AB/Mackenzie/Zama City',
  },
  {
    label: 'Bow Island',
    value: 'CA/AB/Medicine Hat/Bow Island',
  },
  {
    label: 'Burdett',
    value: 'CA/AB/Medicine Hat/Burdett',
  },
  {
    label: 'Cypress County',
    value: 'CA/AB/Medicine Hat/Cypress County',
  },
  {
    label: 'Desert Blume',
    value: 'CA/AB/Medicine Hat/Desert Blume',
  },
  {
    label: 'Dunmore',
    value: 'CA/AB/Medicine Hat/Dunmore',
  },
  {
    label: 'Foremost',
    value: 'CA/AB/Medicine Hat/Foremost',
  },
  {
    label: 'Irvine',
    value: 'CA/AB/Medicine Hat/Irvine',
  },
  {
    label: 'Medicine Hat',
    value: 'CA/AB/Medicine Hat/Medicine Hat',
  },
  {
    label: 'Ralston',
    value: 'CA/AB/Medicine Hat/Ralston',
  },
  {
    label: 'Redcliff',
    value: 'CA/AB/Medicine Hat/Redcliff',
  },
  {
    label: 'Edgerton',
    value: 'CA/AB/Minburn/Edgerton',
  },
  {
    label: 'Lavoy',
    value: 'CA/AB/Minburn/Lavoy',
  },
  {
    label: 'Mannville',
    value: 'CA/AB/Minburn/Mannville',
  },
  {
    label: 'Ranfurly',
    value: 'CA/AB/Minburn/Ranfurly',
  },
  {
    label: 'Vegreville',
    value: 'CA/AB/Minburn/Vegreville',
  },
  {
    label: 'Acme',
    value: 'CA/AB/Mountain View/Acme',
  },
  {
    label: 'Carstairs',
    value: 'CA/AB/Mountain View/Carstairs',
  },
  {
    label: 'Cochrane',
    value: 'CA/AB/Mountain View/Cochrane',
  },
  {
    label: 'Cremona',
    value: 'CA/AB/Mountain View/Cremona',
  },
  {
    label: 'Olds',
    value: 'CA/AB/Mountain View/Olds',
  },
  {
    label: 'Sundre',
    value: 'CA/AB/Mountain View/Sundre',
  },
  {
    label: 'Water Valley',
    value: 'CA/AB/Mountain View/Water Valley',
  },
  {
    label: 'Bassano',
    value: 'CA/AB/Newell/Bassano',
  },
  {
    label: 'Brooks',
    value: 'CA/AB/Newell/Brooks',
  },
  {
    label: 'Duchess',
    value: 'CA/AB/Newell/Duchess',
  },
  {
    label: 'Gem',
    value: 'CA/AB/Newell/Gem',
  },
  {
    label: 'Millicent',
    value: 'CA/AB/Newell/Millicent',
  },
  {
    label: 'Patricia',
    value: 'CA/AB/Newell/Patricia',
  },
  {
    label: 'Rainier',
    value: 'CA/AB/Newell/Rainier',
  },
  {
    label: 'Rolling Hills',
    value: 'CA/AB/Newell/Rolling Hills',
  },
  {
    label: 'Rosemary',
    value: 'CA/AB/Newell/Rosemary',
  },
  {
    label: 'Scandia',
    value: 'CA/AB/Newell/Scandia',
  },
  {
    label: 'Tilley',
    value: 'CA/AB/Newell/Tilley',
  },
  {
    label: 'Carcajou',
    value: 'CA/AB/Northern Lights/Carcajou',
  },
  {
    label: 'Dixonville',
    value: 'CA/AB/Northern Lights/Dixonville',
  },
  {
    label: 'Hotchkiss',
    value: 'CA/AB/Northern Lights/Hotchkiss',
  },
  {
    label: 'Keg River',
    value: 'CA/AB/Northern Lights/Keg River',
  },
  {
    label: 'Manning',
    value: 'CA/AB/Northern Lights/Manning',
  },
  {
    label: 'North Star',
    value: 'CA/AB/Northern Lights/North Star',
  },
  {
    label: 'Notikewin',
    value: 'CA/AB/Northern Lights/Notikewin',
  },
  {
    label: 'Paddle Prairie',
    value: 'CA/AB/Northern Lights/Paddle Prairie',
  },
  {
    label: 'Peace River',
    value: 'CA/AB/Northern Lights/Peace River',
  },
  {
    label: 'Marie Reine',
    value: 'CA/AB/Northern Sunrise/Marie Reine',
  },
  {
    label: 'Nampa',
    value: 'CA/AB/Northern Sunrise/Nampa',
  },
  {
    label: 'St Isidore',
    value: 'CA/AB/Northern Sunrise/St Isidore',
  },
  {
    label: 'Calling Lake',
    value: 'CA/AB/Opportunity/Calling Lake',
  },
  {
    label: 'Peerless Lake',
    value: 'CA/AB/Opportunity/Peerless Lake',
  },
  {
    label: 'Red Earth Creek',
    value: 'CA/AB/Opportunity/Red Earth Creek',
  },
  {
    label: 'Trout Lake',
    value: 'CA/AB/Opportunity/Trout Lake',
  },
  {
    label: 'Wabasca',
    value: 'CA/AB/Opportunity/Wabasca',
  },
  {
    label: 'Alliance',
    value: 'CA/AB/Paintearth/Alliance',
  },
  {
    label: 'Brownfield',
    value: 'CA/AB/Paintearth/Brownfield',
  },
  {
    label: 'Coronation',
    value: 'CA/AB/Paintearth/Coronation',
  },
  {
    label: 'Halkirk',
    value: 'CA/AB/Paintearth/Halkirk',
  },
  {
    label: 'Acheson',
    value: 'CA/AB/Parkland/Acheson',
  },
  {
    label: 'Carvel',
    value: 'CA/AB/Parkland/Carvel',
  },
  {
    label: 'Drayton Valley',
    value: 'CA/AB/Parkland/Drayton Valley',
  },
  {
    label: 'Duffield',
    value: 'CA/AB/Parkland/Duffield',
  },
  {
    label: 'Entwistle',
    value: 'CA/AB/Parkland/Entwistle',
  },
  {
    label: 'Fallis',
    value: 'CA/AB/Parkland/Fallis',
  },
  {
    label: 'Gainford',
    value: 'CA/AB/Parkland/Gainford',
  },
  {
    label: 'Onoway',
    value: 'CA/AB/Parkland/Onoway',
  },
  {
    label: 'Seba Beach',
    value: 'CA/AB/Parkland/Seba Beach',
  },
  {
    label: 'Spring Lake',
    value: 'CA/AB/Parkland/Spring Lake',
  },
  {
    label: 'Spruce Grove',
    value: 'CA/AB/Parkland/Spruce Grove',
  },
  {
    label: 'Stony Plain',
    value: 'CA/AB/Parkland/Stony Plain',
  },
  {
    label: 'Tomahawk',
    value: 'CA/AB/Parkland/Tomahawk',
  },
  {
    label: 'Wabamun',
    value: 'CA/AB/Parkland/Wabamun',
  },
  {
    label: 'Berwyn',
    value: 'CA/AB/Peace/Berwyn',
  },
  {
    label: 'Brownvale',
    value: 'CA/AB/Peace/Brownvale',
  },
  {
    label: 'Clairmont',
    value: 'CA/AB/Peace/Clairmont',
  },
  {
    label: 'Grimshaw',
    value: 'CA/AB/Peace/Grimshaw',
  },
  {
    label: 'Peace River',
    value: 'CA/AB/Peace/Peace River',
  },
  {
    label: 'Bellevue',
    value: 'CA/AB/Pincher Creek/Bellevue',
  },
  {
    label: 'Blairmore',
    value: 'CA/AB/Pincher Creek/Blairmore',
  },
  {
    label: 'Cowley',
    value: 'CA/AB/Pincher Creek/Cowley',
  },
  {
    label: 'Lundbreck',
    value: 'CA/AB/Pincher Creek/Lundbreck',
  },
  {
    label: 'Twin Butte',
    value: 'CA/AB/Pincher Creek/Twin Butte',
  },
  {
    label: 'Waterton Park',
    value: 'CA/AB/Pincher Creek/Waterton Park',
  },
  {
    label: 'Banshaw',
    value: 'CA/AB/Ponoka/Banshaw',
  },
  {
    label: 'Benntley',
    value: 'CA/AB/Ponoka/Benntley',
  },
  {
    label: 'Manskwacis',
    value: 'CA/AB/Ponoka/Manskwacis',
  },
  {
    label: 'Rinmbey',
    value: 'CA/AB/Ponoka/Rinmbey',
  },
  {
    label: 'Tenes',
    value: 'CA/AB/Ponoka/Tenes',
  },
  {
    label: 'Amisk',
    value: 'CA/AB/Provost/Amisk',
  },
  {
    label: 'Bodo',
    value: 'CA/AB/Provost/Bodo',
  },
  {
    label: 'Cadogan',
    value: 'CA/AB/Provost/Cadogan',
  },
  {
    label: 'Czar',
    value: 'CA/AB/Provost/Czar',
  },
  {
    label: 'Hayter',
    value: 'CA/AB/Provost/Hayter',
  },
  {
    label: 'Hughenden',
    value: 'CA/AB/Provost/Hughenden',
  },
  {
    label: 'Metiskow',
    value: 'CA/AB/Provost/Metiskow',
  },
  {
    label: 'Provost',
    value: 'CA/AB/Provost/Provost',
  },
  {
    label: 'Alix',
    value: 'CA/AB/Red Deer/Alix',
  },
  {
    label: 'Balzac',
    value: 'CA/AB/Red Deer/Balzac',
  },
  {
    label: 'Benalto',
    value: 'CA/AB/Red Deer/Benalto',
  },
  {
    label: 'Birchcliff',
    value: 'CA/AB/Red Deer/Birchcliff',
  },
  {
    label: 'Blackfalds',
    value: 'CA/AB/Red Deer/Blackfalds',
  },
  {
    label: 'Bluffton',
    value: 'CA/AB/Red Deer/Bluffton',
  },
  {
    label: 'Bowden',
    value: 'CA/AB/Red Deer/Bowden',
  },
  {
    label: 'Clive',
    value: 'CA/AB/Red Deer/Clive',
  },
  {
    label: 'College Heights',
    value: 'CA/AB/Red Deer/College Heights',
  },
  {
    label: 'Delburne',
    value: 'CA/AB/Red Deer/Delburne',
  },
  {
    label: 'Dickson',
    value: 'CA/AB/Red Deer/Dickson',
  },
  {
    label: 'Didsbury',
    value: 'CA/AB/Red Deer/Didsbury',
  },
  {
    label: 'Eckville',
    value: 'CA/AB/Red Deer/Eckville',
  },
  {
    label: 'Elnora',
    value: 'CA/AB/Red Deer/Elnora',
  },
  {
    label: 'Halfmoon Bay',
    value: 'CA/AB/Red Deer/Halfmoon Bay',
  },
  {
    label: 'Innisfail',
    value: 'CA/AB/Red Deer/Innisfail',
  },
  {
    label: 'Jarvis Bay',
    value: 'CA/AB/Red Deer/Jarvis Bay',
  },
  {
    label: 'Lacombe',
    value: 'CA/AB/Red Deer/Lacombe',
  },
  {
    label: 'Lacombe County',
    value: 'CA/AB/Red Deer/Lacombe County',
  },
  {
    label: 'Lousana',
    value: 'CA/AB/Red Deer/Lousana',
  },
  {
    label: 'Markerville',
    value: 'CA/AB/Red Deer/Markerville',
  },
  {
    label: 'Mirror',
    value: 'CA/AB/Red Deer/Mirror',
  },
  {
    label: 'Norglenwold',
    value: 'CA/AB/Red Deer/Norglenwold',
  },
  {
    label: 'Penhold',
    value: 'CA/AB/Red Deer/Penhold',
  },
  {
    label: 'Pine Lake',
    value: 'CA/AB/Red Deer/Pine Lake',
  },
  {
    label: 'Ponoka',
    value: 'CA/AB/Red Deer/Ponoka',
  },
  {
    label: 'Red Deer',
    value: 'CA/AB/Red Deer/Red Deer',
  },
  {
    label: 'Red Deer County',
    value: 'CA/AB/Red Deer/Red Deer County',
  },
  {
    label: 'Rimbey',
    value: 'CA/AB/Red Deer/Rimbey',
  },
  {
    label: 'Springbrook',
    value: 'CA/AB/Red Deer/Springbrook',
  },
  {
    label: 'Spruce View',
    value: 'CA/AB/Red Deer/Spruce View',
  },
  {
    label: 'Sylvan Lake',
    value: 'CA/AB/Red Deer/Sylvan Lake',
  },
  {
    label: 'Caroline',
    value: 'CA/AB/Rocky Mountain House/Caroline',
  },
  {
    label: 'James River Bridge',
    value: 'CA/AB/Rocky Mountain House/James River Bridge',
  },
  {
    label: 'Rocky Mountain House',
    value: 'CA/AB/Rocky Mountain House/Rocky Mountain House',
  },
  {
    label: 'Airdrie',
    value: 'CA/AB/Rocky View/Airdrie',
  },
  {
    label: 'Beiseker',
    value: 'CA/AB/Rocky View/Beiseker',
  },
  {
    label: 'Chestermere',
    value: 'CA/AB/Rocky View/Chestermere',
  },
  {
    label: 'Cochrane',
    value: 'CA/AB/Rocky View/Cochrane',
  },
  {
    label: 'Dalemead',
    value: 'CA/AB/Rocky View/Dalemead',
  },
  {
    label: 'Delacour',
    value: 'CA/AB/Rocky View/Delacour',
  },
  {
    label: 'Irricana',
    value: 'CA/AB/Rocky View/Irricana',
  },
  {
    label: 'Kathyrn',
    value: 'CA/AB/Rocky View/Kathyrn',
  },
  {
    label: 'Keoma',
    value: 'CA/AB/Rocky View/Keoma',
  },
  {
    label: 'Langdon',
    value: 'CA/AB/Rocky View/Langdon',
  },
  {
    label: 'Lyalta',
    value: 'CA/AB/Rocky View/Lyalta',
  },
  {
    label: 'Madden',
    value: 'CA/AB/Rocky View/Madden',
  },
  {
    label: 'Rocky View',
    value: 'CA/AB/Rocky View/Rocky View',
  },
  {
    label: 'Bay Tree',
    value: 'CA/AB/Saddle Hills/Bay Tree',
  },
  {
    label: 'Blueberry Mountain',
    value: 'CA/AB/Saddle Hills/Blueberry Mountain',
  },
  {
    label: 'Bonanza',
    value: 'CA/AB/Saddle Hills/Bonanza',
  },
  {
    label: 'Gordondale',
    value: 'CA/AB/Saddle Hills/Gordondale',
  },
  {
    label: 'Gundy',
    value: 'CA/AB/Saddle Hills/Gundy',
  },
  {
    label: 'Silver Valley',
    value: 'CA/AB/Saddle Hills/Silver Valley',
  },
  {
    label: 'Bellis',
    value: 'CA/AB/Smoky Lake/Bellis',
  },
  {
    label: 'Caslan',
    value: 'CA/AB/Smoky Lake/Caslan',
  },
  {
    label: 'Kikino',
    value: 'CA/AB/Smoky Lake/Kikino',
  },
  {
    label: 'Lac La Biche',
    value: 'CA/AB/Smoky Lake/Lac La Biche',
  },
  {
    label: 'Lafond',
    value: 'CA/AB/Smoky Lake/Lafond',
  },
  {
    label: 'Smoky Lake',
    value: 'CA/AB/Smoky Lake/Smoky Lake',
  },
  {
    label: 'Spedden',
    value: 'CA/AB/Smoky Lake/Spedden',
  },
  {
    label: 'Vilna',
    value: 'CA/AB/Smoky Lake/Vilna',
  },
  {
    label: 'Warspite',
    value: 'CA/AB/Smoky Lake/Warspite',
  },
  {
    label: 'Spirit River',
    value: 'CA/AB/Spirit River/Spirit River',
  },
  {
    label: 'Rycroft',
    value: 'CA/AB/Spirit River/Rycroft',
  },
  {
    label: 'Spruce Grove',
    value: 'CA/AB/Spruce Grove/Spruce Grove',
  },
  {
    label: 'St Albert',
    value: 'CA/AB/Spruce Grove/St Albert',
  },
  {
    label: 'St Albert',
    value: 'CA/AB/St. Albert/St Albert',
  },
  {
    label: 'Edmonton',
    value: 'CA/AB/St. Albert/Edmonton',
  },
  {
    label: 'Ashmont',
    value: 'CA/AB/St. Paul/Ashmont',
  },
  {
    label: 'Boyne Lake',
    value: 'CA/AB/St. Paul/Boyne Lake',
  },
  {
    label: 'Elk Point',
    value: 'CA/AB/St. Paul/Elk Point',
  },
  {
    label: 'Foisy',
    value: 'CA/AB/St. Paul/Foisy',
  },
  {
    label: 'Lindbergh',
    value: 'CA/AB/St. Paul/Lindbergh',
  },
  {
    label: 'Mallaig',
    value: 'CA/AB/St. Paul/Mallaig',
  },
  {
    label: 'Mcrae',
    value: 'CA/AB/St. Paul/Mcrae',
  },
  {
    label: 'Saddle Lake',
    value: 'CA/AB/St. Paul/Saddle Lake',
  },
  {
    label: 'St Brides',
    value: 'CA/AB/St. Paul/St Brides',
  },
  {
    label: 'St Lina',
    value: 'CA/AB/St. Paul/St Lina',
  },
  {
    label: 'St Paul',
    value: 'CA/AB/St. Paul/St Paul',
  },
  {
    label: 'St Vincent',
    value: 'CA/AB/St. Paul/St Vincent',
  },
  {
    label: 'Craigmyle',
    value: 'CA/AB/Starland/Craigmyle',
  },
  {
    label: 'Delia',
    value: 'CA/AB/Starland/Delia',
  },
  {
    label: 'Hanna',
    value: 'CA/AB/Starland/Hanna',
  },
  {
    label: 'Morrin',
    value: 'CA/AB/Starland/Morrin',
  },
  {
    label: 'Munson',
    value: 'CA/AB/Starland/Munson',
  },
  {
    label: 'Rowley',
    value: 'CA/AB/Starland/Rowley',
  },
  {
    label: 'Rumsey',
    value: 'CA/AB/Starland/Rumsey',
  },
  {
    label: 'Big Valley',
    value: 'CA/AB/Stettler/Big Valley',
  },
  {
    label: 'Botha',
    value: 'CA/AB/Stettler/Botha',
  },
  {
    label: 'Byemoor',
    value: 'CA/AB/Stettler/Byemoor',
  },
  {
    label: 'Endiang',
    value: 'CA/AB/Stettler/Endiang',
  },
  {
    label: 'Erskine',
    value: 'CA/AB/Stettler/Erskine',
  },
  {
    label: 'Fenn',
    value: 'CA/AB/Stettler/Fenn',
  },
  {
    label: 'Gadsby',
    value: 'CA/AB/Stettler/Gadsby',
  },
  {
    label: 'Nevis',
    value: 'CA/AB/Stettler/Nevis',
  },
  {
    label: 'Red Willow',
    value: 'CA/AB/Stettler/Red Willow',
  },
  {
    label: 'Stettler',
    value: 'CA/AB/Stettler/Stettler',
  },
  {
    label: 'Ardrossan',
    value: 'CA/AB/Strathcona/Ardrossan',
  },
  {
    label: 'Cooking Lake',
    value: 'CA/AB/Strathcona/Cooking Lake',
  },
  {
    label: 'Edmonton',
    value: 'CA/AB/Strathcona/Edmonton',
  },
  {
    label: 'Fort Saskatchewan',
    value: 'CA/AB/Strathcona/Fort Saskatchewan',
  },
  {
    label: 'North Cooking Lake',
    value: 'CA/AB/Strathcona/North Cooking Lake',
  },
  {
    label: 'Sherwood Park',
    value: 'CA/AB/Strathcona/Sherwood Park',
  },
  {
    label: 'Tofield',
    value: 'CA/AB/Strathcona/Tofield',
  },
  {
    label: 'Acme',
    value: 'CA/AB/Strathmore/Acme',
  },
  {
    label: 'Arrowwood',
    value: 'CA/AB/Strathmore/Arrowwood',
  },
  {
    label: 'Carbon',
    value: 'CA/AB/Strathmore/Carbon',
  },
  {
    label: 'Carmangay',
    value: 'CA/AB/Strathmore/Carmangay',
  },
  {
    label: 'Champion',
    value: 'CA/AB/Strathmore/Champion',
  },
  {
    label: 'Cluny',
    value: 'CA/AB/Strathmore/Cluny',
  },
  {
    label: 'Delia',
    value: 'CA/AB/Strathmore/Delia',
  },
  {
    label: 'Drumheller',
    value: 'CA/AB/Strathmore/Drumheller',
  },
  {
    label: 'East Coulee',
    value: 'CA/AB/Strathmore/East Coulee',
  },
  {
    label: 'Gleichen',
    value: 'CA/AB/Strathmore/Gleichen',
  },
  {
    label: 'Hussar',
    value: 'CA/AB/Strathmore/Hussar',
  },
  {
    label: 'Linden',
    value: 'CA/AB/Strathmore/Linden',
  },
  {
    label: 'Lomond',
    value: 'CA/AB/Strathmore/Lomond',
  },
  {
    label: 'Lyalta',
    value: 'CA/AB/Strathmore/Lyalta',
  },
  {
    label: 'Morrin',
    value: 'CA/AB/Strathmore/Morrin',
  },
  {
    label: 'Rosedale Station',
    value: 'CA/AB/Strathmore/Rosedale Station',
  },
  {
    label: 'Rumsey',
    value: 'CA/AB/Strathmore/Rumsey',
  },
  {
    label: 'Siksika',
    value: 'CA/AB/Strathmore/Siksika',
  },
  {
    label: 'Standard',
    value: 'CA/AB/Strathmore/Standard',
  },
  {
    label: 'Strathmore',
    value: 'CA/AB/Strathmore/Strathmore',
  },
  {
    label: 'Three Hills',
    value: 'CA/AB/Strathmore/Three Hills',
  },
  {
    label: 'Trochu',
    value: 'CA/AB/Strathmore/Trochu',
  },
  {
    label: 'Vulcan',
    value: 'CA/AB/Strathmore/Vulcan',
  },
  {
    label: 'Wimborne',
    value: 'CA/AB/Strathmore/Wimborne',
  },
  {
    label: 'Acheson',
    value: 'CA/AB/Sturgeon/Acheson',
  },
  {
    label: 'Alcomdale',
    value: 'CA/AB/Sturgeon/Alcomdale',
  },
  {
    label: 'Bon Accord',
    value: 'CA/AB/Sturgeon/Bon Accord',
  },
  {
    label: 'Calahoo',
    value: 'CA/AB/Sturgeon/Calahoo',
  },
  {
    label: 'Edmonton',
    value: 'CA/AB/Sturgeon/Edmonton',
  },
  {
    label: 'Fort Saskatchewan',
    value: 'CA/AB/Sturgeon/Fort Saskatchewan',
  },
  {
    label: 'Gibbons',
    value: 'CA/AB/Sturgeon/Gibbons',
  },
  {
    label: 'Lancaster Park',
    value: 'CA/AB/Sturgeon/Lancaster Park',
  },
  {
    label: 'Legal',
    value: 'CA/AB/Sturgeon/Legal',
  },
  {
    label: 'Morinville',
    value: 'CA/AB/Sturgeon/Morinville',
  },
  {
    label: 'Namao',
    value: 'CA/AB/Sturgeon/Namao',
  },
  {
    label: 'Riviere Qui Barre',
    value: 'CA/AB/Sturgeon/Riviere Qui Barre',
  },
  {
    label: 'Spruce Grove',
    value: 'CA/AB/Sturgeon/Spruce Grove',
  },
  {
    label: 'St Albert',
    value: 'CA/AB/Sturgeon/St Albert',
  },
  {
    label: 'Stony Plain',
    value: 'CA/AB/Sturgeon/Stony Plain',
  },
  {
    label: 'Sturgeon County',
    value: 'CA/AB/Sturgeon/Sturgeon County',
  },
  {
    label: 'Barnwell',
    value: 'CA/AB/Taber/Barnwell',
  },
  {
    label: 'Cranford',
    value: 'CA/AB/Taber/Cranford',
  },
  {
    label: 'Enchant',
    value: 'CA/AB/Taber/Enchant',
  },
  {
    label: 'Grassy Lake',
    value: 'CA/AB/Taber/Grassy Lake',
  },
  {
    label: 'Hays',
    value: 'CA/AB/Taber/Hays',
  },
  {
    label: 'Purple Springs',
    value: 'CA/AB/Taber/Purple Springs',
  },
  {
    label: 'Taber',
    value: 'CA/AB/Taber/Taber',
  },
  {
    label: 'Vauxhall',
    value: 'CA/AB/Taber/Vauxhall',
  },
  {
    label: 'Abee',
    value: 'CA/AB/Thorhild/Abee',
  },
  {
    label: 'Egremont',
    value: 'CA/AB/Thorhild/Egremont',
  },
  {
    label: 'Newbrook',
    value: 'CA/AB/Thorhild/Newbrook',
  },
  {
    label: 'Opal',
    value: 'CA/AB/Thorhild/Opal',
  },
  {
    label: 'Radway',
    value: 'CA/AB/Thorhild/Radway',
  },
  {
    label: 'Redwater',
    value: 'CA/AB/Thorhild/Redwater',
  },
  {
    label: 'Thorhild',
    value: 'CA/AB/Thorhild/Thorhild',
  },
  {
    label: 'Vimy',
    value: 'CA/AB/Thorhild/Vimy',
  },
  {
    label: 'Waskatenau',
    value: 'CA/AB/Thorhild/Waskatenau',
  },
  {
    label: 'Andrew',
    value: 'CA/AB/Two Hills/Andrew',
  },
  {
    label: 'Beauvallon',
    value: 'CA/AB/Two Hills/Beauvallon',
  },
  {
    label: 'Brosseau',
    value: 'CA/AB/Two Hills/Brosseau',
  },
  {
    label: 'Derwent',
    value: 'CA/AB/Two Hills/Derwent',
  },
  {
    label: 'Hairy Hill',
    value: 'CA/AB/Two Hills/Hairy Hill',
  },
  {
    label: 'Innisfree',
    value: 'CA/AB/Two Hills/Innisfree',
  },
  {
    label: 'Musidora',
    value: 'CA/AB/Two Hills/Musidora',
  },
  {
    label: 'Myrnam',
    value: 'CA/AB/Two Hills/Myrnam',
  },
  {
    label: 'Two Hills',
    value: 'CA/AB/Two Hills/Two Hills',
  },
  {
    label: 'Willingdon',
    value: 'CA/AB/Two Hills/Willingdon',
  },
  {
    label: 'Blackfoot',
    value: 'CA/AB/Vermilion River/Blackfoot',
  },
  {
    label: 'Clandonald',
    value: 'CA/AB/Vermilion River/Clandonald',
  },
  {
    label: 'Dewberry',
    value: 'CA/AB/Vermilion River/Dewberry',
  },
  {
    label: 'Heinsburg',
    value: 'CA/AB/Vermilion River/Heinsburg',
  },
  {
    label: 'Islay',
    value: 'CA/AB/Vermilion River/Islay',
  },
  {
    label: 'Kitscoty',
    value: 'CA/AB/Vermilion River/Kitscoty',
  },
  {
    label: 'Marwayne',
    value: 'CA/AB/Vermilion River/Marwayne',
  },
  {
    label: 'Mclaughlin',
    value: 'CA/AB/Vermilion River/Mclaughlin',
  },
  {
    label: 'Paradise Valley',
    value: 'CA/AB/Vermilion River/Paradise Valley',
  },
  {
    label: 'Rivercourse',
    value: 'CA/AB/Vermilion River/Rivercourse',
  },
  {
    label: 'Streamstown',
    value: 'CA/AB/Vermilion River/Streamstown',
  },
  {
    label: 'Tulliby Lake',
    value: 'CA/AB/Vermilion River/Tulliby Lake',
  },
  {
    label: 'Vermilion',
    value: 'CA/AB/Vermilion River/Vermilion',
  },
  {
    label: 'Arrowwood',
    value: 'CA/AB/Vulcan/Arrowwood',
  },
  {
    label: 'Blackie',
    value: 'CA/AB/Vulcan/Blackie',
  },
  {
    label: 'Brant',
    value: 'CA/AB/Vulcan/Brant',
  },
  {
    label: 'Carmangay',
    value: 'CA/AB/Vulcan/Carmangay',
  },
  {
    label: 'Champion',
    value: 'CA/AB/Vulcan/Champion',
  },
  {
    label: 'Lomond',
    value: 'CA/AB/Vulcan/Lomond',
  },
  {
    label: 'Milo',
    value: 'CA/AB/Vulcan/Milo',
  },
  {
    label: 'Mossleigh',
    value: 'CA/AB/Vulcan/Mossleigh',
  },
  {
    label: 'Vulcan',
    value: 'CA/AB/Vulcan/Vulcan',
  },
  {
    label: 'Alliance',
    value: 'CA/AB/Wainwright/Alliance',
  },
  {
    label: 'Amisk',
    value: 'CA/AB/Wainwright/Amisk',
  },
  {
    label: 'Big Valley',
    value: 'CA/AB/Wainwright/Big Valley',
  },
  {
    label: 'Botha',
    value: 'CA/AB/Wainwright/Botha',
  },
  {
    label: 'Cadogan',
    value: 'CA/AB/Wainwright/Cadogan',
  },
  {
    label: 'Castor',
    value: 'CA/AB/Wainwright/Castor',
  },
  {
    label: 'Chauvin',
    value: 'CA/AB/Wainwright/Chauvin',
  },
  {
    label: 'Coronation',
    value: 'CA/AB/Wainwright/Coronation',
  },
  {
    label: 'Czar',
    value: 'CA/AB/Wainwright/Czar',
  },
  {
    label: 'Daysland',
    value: 'CA/AB/Wainwright/Daysland',
  },
  {
    label: 'Denwood',
    value: 'CA/AB/Wainwright/Denwood',
  },
  {
    label: 'Donalda',
    value: 'CA/AB/Wainwright/Donalda',
  },
  {
    label: 'Edgerton',
    value: 'CA/AB/Wainwright/Edgerton',
  },
  {
    label: 'Erskine',
    value: 'CA/AB/Wainwright/Erskine',
  },
  {
    label: 'Forestburg',
    value: 'CA/AB/Wainwright/Forestburg',
  },
  {
    label: 'Galahad',
    value: 'CA/AB/Wainwright/Galahad',
  },
  {
    label: 'Halkirk',
    value: 'CA/AB/Wainwright/Halkirk',
  },
  {
    label: 'Hardisty',
    value: 'CA/AB/Wainwright/Hardisty',
  },
  {
    label: 'Hayter',
    value: 'CA/AB/Wainwright/Hayter',
  },
  {
    label: 'Heisler',
    value: 'CA/AB/Wainwright/Heisler',
  },
  {
    label: 'Hughenden',
    value: 'CA/AB/Wainwright/Hughenden',
  },
  {
    label: 'Irma',
    value: 'CA/AB/Wainwright/Irma',
  },
  {
    label: 'Killam',
    value: 'CA/AB/Wainwright/Killam',
  },
  {
    label: 'Lougheed',
    value: 'CA/AB/Wainwright/Lougheed',
  },
  {
    label: 'Metiskow',
    value: 'CA/AB/Wainwright/Metiskow',
  },
  {
    label: 'Provost',
    value: 'CA/AB/Wainwright/Provost',
  },
  {
    label: 'Rochon Sands',
    value: 'CA/AB/Wainwright/Rochon Sands',
  },
  {
    label: 'Sedgewick',
    value: 'CA/AB/Wainwright/Sedgewick',
  },
  {
    label: 'Stettler',
    value: 'CA/AB/Wainwright/Stettler',
  },
  {
    label: 'Strome',
    value: 'CA/AB/Wainwright/Strome',
  },
  {
    label: 'Wainwright',
    value: 'CA/AB/Wainwright/Wainwright',
  },
  {
    label: 'Coutts',
    value: 'CA/AB/Warner/Coutts',
  },
  {
    label: 'Foremost',
    value: 'CA/AB/Warner/Foremost',
  },
  {
    label: 'Milk River',
    value: 'CA/AB/Warner/Milk River',
  },
  {
    label: 'New Dayton',
    value: 'CA/AB/Warner/New Dayton',
  },
  {
    label: 'Raymond',
    value: 'CA/AB/Warner/Raymond',
  },
  {
    label: 'Stirling',
    value: 'CA/AB/Warner/Stirling',
  },
  {
    label: 'Wrentham',
    value: 'CA/AB/Warner/Wrentham',
  },
  {
    label: 'Busby',
    value: 'CA/AB/Westlock/Busby',
  },
  {
    label: 'Clyde',
    value: 'CA/AB/Westlock/Clyde',
  },
  {
    label: 'Dapp',
    value: 'CA/AB/Westlock/Dapp',
  },
  {
    label: 'Fawcett',
    value: 'CA/AB/Westlock/Fawcett',
  },
  {
    label: 'Jarvie',
    value: 'CA/AB/Westlock/Jarvie',
  },
  {
    label: 'Nestow',
    value: 'CA/AB/Westlock/Nestow',
  },
  {
    label: 'Tawatinaw',
    value: 'CA/AB/Westlock/Tawatinaw',
  },
  {
    label: 'Westlock',
    value: 'CA/AB/Westlock/Westlock',
  },
  {
    label: 'Alder Flats',
    value: 'CA/AB/Wetaskiwin/Alder Flats',
  },
  {
    label: 'Bluffton',
    value: 'CA/AB/Wetaskiwin/Bluffton',
  },
  {
    label: 'Buck Lake',
    value: 'CA/AB/Wetaskiwin/Buck Lake',
  },
  {
    label: 'Calmar',
    value: 'CA/AB/Wetaskiwin/Calmar',
  },
  {
    label: 'Falun',
    value: 'CA/AB/Wetaskiwin/Falun',
  },
  {
    label: 'Leduc County',
    value: 'CA/AB/Wetaskiwin/Leduc County',
  },
  {
    label: 'Mulhurst Bay',
    value: 'CA/AB/Wetaskiwin/Mulhurst Bay',
  },
  {
    label: 'Warburg',
    value: 'CA/AB/Wetaskiwin/Warburg',
  },
  {
    label: 'Wetaskiwin',
    value: 'CA/AB/Wetaskiwin/Wetaskiwin',
  },
  {
    label: 'Winfield',
    value: 'CA/AB/Wetaskiwin/Winfield',
  },
  {
    label: 'Carseland',
    value: 'CA/AB/Wheatland/Carseland',
  },
  {
    label: 'Cluny',
    value: 'CA/AB/Wheatland/Cluny',
  },
  {
    label: 'Dorothy',
    value: 'CA/AB/Wheatland/Dorothy',
  },
  {
    label: 'Gleichen',
    value: 'CA/AB/Wheatland/Gleichen',
  },
  {
    label: 'Hussar',
    value: 'CA/AB/Wheatland/Hussar',
  },
  {
    label: 'Langdon',
    value: 'CA/AB/Wheatland/Langdon',
  },
  {
    label: 'Lyalta',
    value: 'CA/AB/Wheatland/Lyalta',
  },
  {
    label: 'Redcliff',
    value: 'CA/AB/Wheatland/Redcliff',
  },
  {
    label: 'Rockyford',
    value: 'CA/AB/Wheatland/Rockyford',
  },
  {
    label: 'Rosebud',
    value: 'CA/AB/Wheatland/Rosebud',
  },
  {
    label: 'Rosedale Station',
    value: 'CA/AB/Wheatland/Rosedale Station',
  },
  {
    label: 'Standard',
    value: 'CA/AB/Wheatland/Standard',
  },
  {
    label: 'Strathmore',
    value: 'CA/AB/Wheatland/Strathmore',
  },
  {
    label: 'Claresholm',
    value: 'CA/AB/Willow Creek/Claresholm',
  },
  {
    label: 'Fort Macleod',
    value: 'CA/AB/Willow Creek/Fort Macleod',
  },
  {
    label: 'Granum',
    value: 'CA/AB/Willow Creek/Granum',
  },
  {
    label: 'Nanton',
    value: 'CA/AB/Willow Creek/Nanton',
  },
  {
    label: 'Parkland',
    value: 'CA/AB/Willow Creek/Parkland',
  },
  {
    label: 'Pincher Creek',
    value: 'CA/AB/Willow Creek/Pincher Creek',
  },
  {
    label: 'Stavely',
    value: 'CA/AB/Willow Creek/Stavely',
  },
  {
    label: 'Anzac',
    value: 'CA/AB/Wood Buffalo/Anzac',
  },
  {
    label: 'Ardmore',
    value: 'CA/AB/Wood Buffalo/Ardmore',
  },
  {
    label: 'Ashmont',
    value: 'CA/AB/Wood Buffalo/Ashmont',
  },
  {
    label: 'Bonnyville',
    value: 'CA/AB/Wood Buffalo/Bonnyville',
  },
  {
    label: 'Cherry Grove',
    value: 'CA/AB/Wood Buffalo/Cherry Grove',
  },
  {
    label: 'Cold Lake',
    value: 'CA/AB/Wood Buffalo/Cold Lake',
  },
  {
    label: 'Conklin',
    value: 'CA/AB/Wood Buffalo/Conklin',
  },
  {
    label: 'Elk Point',
    value: 'CA/AB/Wood Buffalo/Elk Point',
  },
  {
    label: 'Fitzgerald',
    value: 'CA/AB/Wood Buffalo/Fitzgerald',
  },
  {
    label: 'Fort Chipewyan',
    value: 'CA/AB/Wood Buffalo/Fort Chipewyan',
  },
  {
    label: 'Fort Mcmurray',
    value: 'CA/AB/Wood Buffalo/Fort Mcmurray',
  },
  {
    label: 'Frog Lake',
    value: 'CA/AB/Wood Buffalo/Frog Lake',
  },
  {
    label: 'Glendon',
    value: 'CA/AB/Wood Buffalo/Glendon',
  },
  {
    label: 'Goodfish Lake',
    value: 'CA/AB/Wood Buffalo/Goodfish Lake',
  },
  {
    label: 'Heinsburg',
    value: 'CA/AB/Wood Buffalo/Heinsburg',
  },
  {
    label: 'Iron River',
    value: 'CA/AB/Wood Buffalo/Iron River',
  },
  {
    label: 'Kehewin',
    value: 'CA/AB/Wood Buffalo/Kehewin',
  },
  {
    label: 'Lac La Biche',
    value: 'CA/AB/Wood Buffalo/Lac La Biche',
  },
  {
    label: 'Lindbergh',
    value: 'CA/AB/Wood Buffalo/Lindbergh',
  },
  {
    label: 'Mallaig',
    value: 'CA/AB/Wood Buffalo/Mallaig',
  },
  {
    label: 'Plamondon',
    value: 'CA/AB/Wood Buffalo/Plamondon',
  },
  {
    label: 'Saddle Lake',
    value: 'CA/AB/Wood Buffalo/Saddle Lake',
  },
  {
    label: 'Smoky Lake',
    value: 'CA/AB/Wood Buffalo/Smoky Lake',
  },
  {
    label: 'Sputinow',
    value: 'CA/AB/Wood Buffalo/Sputinow',
  },
  {
    label: 'St Lina',
    value: 'CA/AB/Wood Buffalo/St Lina',
  },
  {
    label: 'St Paul',
    value: 'CA/AB/Wood Buffalo/St Paul',
  },
  {
    label: 'St Vincent',
    value: 'CA/AB/Wood Buffalo/St Vincent',
  },
  {
    label: 'Sturgeon County',
    value: 'CA/AB/Wood Buffalo/Sturgeon County',
  },
  {
    label: 'Vilna',
    value: 'CA/AB/Wood Buffalo/Vilna',
  },
  {
    label: 'Waskatenau',
    value: 'CA/AB/Wood Buffalo/Waskatenau',
  },
  {
    label: 'Blue Ridge',
    value: 'CA/AB/Woodlands/Blue Ridge',
  },
  {
    label: 'Lone Pine',
    value: 'CA/AB/Woodlands/Lone Pine',
  },
  {
    label: 'Peers',
    value: 'CA/AB/Woodlands/Peers',
  },
  {
    label: 'Whitecourt',
    value: 'CA/AB/Woodlands/Whitecourt',
  },
  {
    label: 'Brule',
    value: 'CA/AB/Yellowhead/Brule',
  },
  {
    label: 'Cadomin',
    value: 'CA/AB/Yellowhead/Cadomin',
  },
  {
    label: 'Carrot Creek',
    value: 'CA/AB/Yellowhead/Carrot Creek',
  },
  {
    label: 'Edson',
    value: 'CA/AB/Yellowhead/Edson',
  },
  {
    label: 'Evansburg',
    value: 'CA/AB/Yellowhead/Evansburg',
  },
  {
    label: 'Hinton',
    value: 'CA/AB/Yellowhead/Hinton',
  },
  {
    label: 'Marlboro',
    value: 'CA/AB/Yellowhead/Marlboro',
  },
  {
    label: 'Niton Junction',
    value: 'CA/AB/Yellowhead/Niton Junction',
  },
  {
    label: 'Robb',
    value: 'CA/AB/Yellowhead/Robb',
  },
  {
    label: 'Wildwood',
    value: 'CA/AB/Yellowhead/Wildwood',
  },
  {
    label: 'Yellowhead County',
    value: 'CA/AB/Yellowhead/Yellowhead County',
  },
  {
    label: 'Ahousat',
    value: 'CA/BC/Alberni-Clayoquot/Ahousat',
  },
  {
    label: 'Bamfield',
    value: 'CA/BC/Alberni-Clayoquot/Bamfield',
  },
  {
    label: 'Kildonan',
    value: 'CA/BC/Alberni-Clayoquot/Kildonan',
  },
  {
    label: 'Kyuquot',
    value: 'CA/BC/Alberni-Clayoquot/Kyuquot',
  },
  {
    label: 'Port Alberni',
    value: 'CA/BC/Alberni-Clayoquot/Port Alberni',
  },
  {
    label: 'Tofino',
    value: 'CA/BC/Alberni-Clayoquot/Tofino',
  },
  {
    label: 'Ucluelet',
    value: 'CA/BC/Alberni-Clayoquot/Ucluelet',
  },
  {
    label: 'Burns Lake',
    value: 'CA/BC/Bulkley-Nechako/Burns Lake',
  },
  {
    label: 'Endako',
    value: 'CA/BC/Bulkley-Nechako/Endako',
  },
  {
    label: 'Fort Fraser',
    value: 'CA/BC/Bulkley-Nechako/Fort Fraser',
  },
  {
    label: 'Fort St James',
    value: 'CA/BC/Bulkley-Nechako/Fort St James',
  },
  {
    label: 'Francois Lake',
    value: 'CA/BC/Bulkley-Nechako/Francois Lake',
  },
  {
    label: 'Fraser Lake',
    value: 'CA/BC/Bulkley-Nechako/Fraser Lake',
  },
  {
    label: 'Granisle',
    value: 'CA/BC/Bulkley-Nechako/Granisle',
  },
  {
    label: 'Houston',
    value: 'CA/BC/Bulkley-Nechako/Houston',
  },
  {
    label: 'Smithers',
    value: 'CA/BC/Bulkley-Nechako/Smithers',
  },
  {
    label: 'Southbank',
    value: 'CA/BC/Bulkley-Nechako/Southbank',
  },
  {
    label: 'Takla Landing',
    value: 'CA/BC/Bulkley-Nechako/Takla Landing',
  },
  {
    label: 'Takysie Lake',
    value: 'CA/BC/Bulkley-Nechako/Takysie Lake',
  },
  {
    label: 'Telkwa',
    value: 'CA/BC/Bulkley-Nechako/Telkwa',
  },
  {
    label: 'Topley',
    value: 'CA/BC/Bulkley-Nechako/Topley',
  },
  {
    label: 'Vanderhoof',
    value: 'CA/BC/Bulkley-Nechako/Vanderhoof',
  },
  {
    label: 'Brentwood Bay',
    value: 'CA/BC/Capital/Brentwood Bay',
  },
  {
    label: 'Colwood',
    value: 'CA/BC/Capital/Colwood',
  },
  {
    label: 'Esquimalt ',
    value: 'CA/BC/Capital/Esquimalt ',
  },
  {
    label: 'Fulford Harbour',
    value: 'CA/BC/Capital/Fulford Harbour',
  },
  {
    label: 'Galiano Island',
    value: 'CA/BC/Capital/Galiano Island',
  },
  {
    label: 'Ganges',
    value: 'CA/BC/Capital/Ganges',
  },
  {
    label: 'Jordan River',
    value: 'CA/BC/Capital/Jordan River',
  },
  {
    label: 'Langford',
    value: 'CA/BC/Capital/Langford',
  },
  {
    label: 'Mayne Island',
    value: 'CA/BC/Capital/Mayne Island',
  },
  {
    label: 'North Saanich',
    value: 'CA/BC/Capital/North Saanich',
  },
  {
    label: 'Oak Bay',
    value: 'CA/BC/Capital/Oak Bay',
  },
  {
    label: 'Pender Island',
    value: 'CA/BC/Capital/Pender Island',
  },
  {
    label: 'Port Renfrew',
    value: 'CA/BC/Capital/Port Renfrew',
  },
  {
    label: 'Saanich',
    value: 'CA/BC/Capital/Saanich',
  },
  {
    label: 'Saanichton',
    value: 'CA/BC/Capital/Saanichton',
  },
  {
    label: 'Saltspring Island',
    value: 'CA/BC/Capital/Saltspring Island',
  },
  {
    label: 'Saturna Island',
    value: 'CA/BC/Capital/Saturna Island',
  },
  {
    label: 'Shirley',
    value: 'CA/BC/Capital/Shirley',
  },
  {
    label: 'Sidney',
    value: 'CA/BC/Capital/Sidney',
  },
  {
    label: 'Sooke',
    value: 'CA/BC/Capital/Sooke',
  },
  {
    label: 'Victoria',
    value: 'CA/BC/Capital/Victoria',
  },
  {
    label: 'View Royal',
    value: 'CA/BC/Capital/View Royal',
  },
  {
    label: '100 Mile House',
    value: 'CA/BC/Cariboo/100 Mile House',
  },
  {
    label: '108 Mile Ranch',
    value: 'CA/BC/Cariboo/108 Mile Ranch',
  },
  {
    label: '150 Mile House',
    value: 'CA/BC/Cariboo/150 Mile House',
  },
  {
    label: '70 Mile House',
    value: 'CA/BC/Cariboo/70 Mile House',
  },
  {
    label: 'Alexis Creek',
    value: 'CA/BC/Cariboo/Alexis Creek',
  },
  {
    label: 'Alkali Lake',
    value: 'CA/BC/Cariboo/Alkali Lake',
  },
  {
    label: 'Anahim Lake',
    value: 'CA/BC/Cariboo/Anahim Lake',
  },
  {
    label: 'Avola',
    value: 'CA/BC/Cariboo/Avola',
  },
  {
    label: 'Barkerville',
    value: 'CA/BC/Cariboo/Barkerville',
  },
  {
    label: 'Big Lake Ranch',
    value: 'CA/BC/Cariboo/Big Lake Ranch',
  },
  {
    label: 'Bridge Lake',
    value: 'CA/BC/Cariboo/Bridge Lake',
  },
  {
    label: 'Buffalo Creek',
    value: 'CA/BC/Cariboo/Buffalo Creek',
  },
  {
    label: 'Canim Lake',
    value: 'CA/BC/Cariboo/Canim Lake',
  },
  {
    label: 'Chilanko Forks',
    value: 'CA/BC/Cariboo/Chilanko Forks',
  },
  {
    label: 'Dog Creek',
    value: 'CA/BC/Cariboo/Dog Creek',
  },
  {
    label: 'Eagle Creek',
    value: 'CA/BC/Cariboo/Eagle Creek',
  },
  {
    label: 'Forest Grove',
    value: 'CA/BC/Cariboo/Forest Grove',
  },
  {
    label: 'Gang Ranch',
    value: 'CA/BC/Cariboo/Gang Ranch',
  },
  {
    label: 'Hanceville',
    value: 'CA/BC/Cariboo/Hanceville',
  },
  {
    label: 'Hixon',
    value: 'CA/BC/Cariboo/Hixon',
  },
  {
    label: 'Horsefly',
    value: 'CA/BC/Cariboo/Horsefly',
  },
  {
    label: 'Lac La Hache',
    value: 'CA/BC/Cariboo/Lac La Hache',
  },
  {
    label: 'Likely',
    value: 'CA/BC/Cariboo/Likely',
  },
  {
    label: 'Lone Butte',
    value: 'CA/BC/Cariboo/Lone Butte',
  },
  {
    label: 'Mcleese Lake',
    value: 'CA/BC/Cariboo/Mcleese Lake',
  },
  {
    label: 'Nemaiah Valley',
    value: 'CA/BC/Cariboo/Nemaiah Valley',
  },
  {
    label: 'Nimpo Lake',
    value: 'CA/BC/Cariboo/Nimpo Lake',
  },
  {
    label: 'Quesnel',
    value: 'CA/BC/Cariboo/Quesnel',
  },
  {
    label: 'Redstone',
    value: 'CA/BC/Cariboo/Redstone',
  },
  {
    label: 'Riske Creek',
    value: 'CA/BC/Cariboo/Riske Creek',
  },
  {
    label: 'Tatla Lake',
    value: 'CA/BC/Cariboo/Tatla Lake',
  },
  {
    label: 'Tatlayoko Lake',
    value: 'CA/BC/Cariboo/Tatlayoko Lake',
  },
  {
    label: 'Wells',
    value: 'CA/BC/Cariboo/Wells',
  },
  {
    label: 'Williams Lake',
    value: 'CA/BC/Cariboo/Williams Lake',
  },
  {
    label: 'Bella Bella',
    value: 'CA/BC/Central Coast/Bella Bella',
  },
  {
    label: 'Bella Coola',
    value: 'CA/BC/Central Coast/Bella Coola',
  },
  {
    label: 'Dawsons Landing',
    value: 'CA/BC/Central Coast/Dawsons Landing',
  },
  {
    label: 'Denny Island',
    value: 'CA/BC/Central Coast/Denny Island',
  },
  {
    label: 'Hagensborg',
    value: 'CA/BC/Central Coast/Hagensborg',
  },
  {
    label: 'Kleena Kleene',
    value: 'CA/BC/Central Coast/Kleena Kleene',
  },
  {
    label: 'Klemtu',
    value: 'CA/BC/Central Coast/Klemtu',
  },
  {
    label: 'Ocean Falls',
    value: 'CA/BC/Central Coast/Ocean Falls',
  },
  {
    label: 'Waglisla',
    value: 'CA/BC/Central Coast/Waglisla',
  },
  {
    label: 'Ainsworth Hot Springs',
    value: 'CA/BC/Central Kootenay/Ainsworth Hot Springs',
  },
  {
    label: 'Argenta',
    value: 'CA/BC/Central Kootenay/Argenta',
  },
  {
    label: 'Arrow Creek',
    value: 'CA/BC/Central Kootenay/Arrow Creek',
  },
  {
    label: 'Balfour',
    value: 'CA/BC/Central Kootenay/Balfour',
  },
  {
    label: 'Beasley',
    value: 'CA/BC/Central Kootenay/Beasley',
  },
  {
    label: 'Bonnington',
    value: 'CA/BC/Central Kootenay/Bonnington',
  },
  {
    label: 'Boswell',
    value: 'CA/BC/Central Kootenay/Boswell',
  },
  {
    label: 'Burton',
    value: 'CA/BC/Central Kootenay/Burton',
  },
  {
    label: 'Canyon',
    value: 'CA/BC/Central Kootenay/Canyon',
  },
  {
    label: 'Castlegar',
    value: 'CA/BC/Central Kootenay/Castlegar',
  },
  {
    label: 'Crawford Bay',
    value: 'CA/BC/Central Kootenay/Crawford Bay',
  },
  {
    label: 'Crescent Valley',
    value: 'CA/BC/Central Kootenay/Crescent Valley',
  },
  {
    label: 'Creston',
    value: 'CA/BC/Central Kootenay/Creston',
  },
  {
    label: 'Edgewood',
    value: 'CA/BC/Central Kootenay/Edgewood',
  },
  {
    label: 'Erickson',
    value: 'CA/BC/Central Kootenay/Erickson',
  },
  {
    label: 'Fauquier',
    value: 'CA/BC/Central Kootenay/Fauquier',
  },
  {
    label: 'Genelle',
    value: 'CA/BC/Central Kootenay/Genelle',
  },
  {
    label: 'Gray Creek',
    value: 'CA/BC/Central Kootenay/Gray Creek',
  },
  {
    label: 'Kaslo',
    value: 'CA/BC/Central Kootenay/Kaslo',
  },
  {
    label: 'Kingsgate',
    value: 'CA/BC/Central Kootenay/Kingsgate',
  },
  {
    label: 'Kitchener',
    value: 'CA/BC/Central Kootenay/Kitchener',
  },
  {
    label: 'Kootenay Bay',
    value: 'CA/BC/Central Kootenay/Kootenay Bay',
  },
  {
    label: 'Krestova',
    value: 'CA/BC/Central Kootenay/Krestova',
  },
  {
    label: 'Lister',
    value: 'CA/BC/Central Kootenay/Lister',
  },
  {
    label: 'Meadow Creek',
    value: 'CA/BC/Central Kootenay/Meadow Creek',
  },
  {
    label: 'Nakusp',
    value: 'CA/BC/Central Kootenay/Nakusp',
  },
  {
    label: 'Nelson',
    value: 'CA/BC/Central Kootenay/Nelson',
  },
  {
    label: 'New Denver',
    value: 'CA/BC/Central Kootenay/New Denver',
  },
  {
    label: 'Procter',
    value: 'CA/BC/Central Kootenay/Procter',
  },
  {
    label: 'Riondel',
    value: 'CA/BC/Central Kootenay/Riondel',
  },
  {
    label: 'Robson',
    value: 'CA/BC/Central Kootenay/Robson',
  },
  {
    label: 'Ross Spur',
    value: 'CA/BC/Central Kootenay/Ross Spur',
  },
  {
    label: 'Salmo',
    value: 'CA/BC/Central Kootenay/Salmo',
  },
  {
    label: 'Sanca',
    value: 'CA/BC/Central Kootenay/Sanca',
  },
  {
    label: 'Silverton',
    value: 'CA/BC/Central Kootenay/Silverton',
  },
  {
    label: 'Sirdar',
    value: 'CA/BC/Central Kootenay/Sirdar',
  },
  {
    label: 'Slocan',
    value: 'CA/BC/Central Kootenay/Slocan',
  },
  {
    label: 'Slocan Park',
    value: 'CA/BC/Central Kootenay/Slocan Park',
  },
  {
    label: 'South Slocan',
    value: 'CA/BC/Central Kootenay/South Slocan',
  },
  {
    label: 'Winlaw',
    value: 'CA/BC/Central Kootenay/Winlaw',
  },
  {
    label: 'Wynndel',
    value: 'CA/BC/Central Kootenay/Wynndel',
  },
  {
    label: 'Yahk',
    value: 'CA/BC/Central Kootenay/Yahk',
  },
  {
    label: 'Ymir',
    value: 'CA/BC/Central Kootenay/Ymir',
  },
  {
    label: 'Kelowna',
    value: 'CA/BC/Central Okanagan/Kelowna',
  },
  {
    label: 'Lake Country',
    value: 'CA/BC/Central Okanagan/Lake Country',
  },
  {
    label: 'Okanagan Centre',
    value: 'CA/BC/Central Okanagan/Okanagan Centre',
  },
  {
    label: 'Oyama',
    value: 'CA/BC/Central Okanagan/Oyama',
  },
  {
    label: 'Peachland',
    value: 'CA/BC/Central Okanagan/Peachland',
  },
  {
    label: 'West Kelowna',
    value: 'CA/BC/Central Okanagan/West Kelowna',
  },
  {
    label: 'Westbank',
    value: 'CA/BC/Central Okanagan/Westbank',
  },
  {
    label: 'Winfield',
    value: 'CA/BC/Central Okanagan/Winfield',
  },
  {
    label: 'Anglemont',
    value: 'CA/BC/Columbia-Shuswap/Anglemont',
  },
  {
    label: 'Blind Bay',
    value: 'CA/BC/Columbia-Shuswap/Blind Bay',
  },
  {
    label: 'Brisco',
    value: 'CA/BC/Columbia-Shuswap/Brisco',
  },
  {
    label: 'Canoe',
    value: 'CA/BC/Columbia-Shuswap/Canoe',
  },
  {
    label: 'Celista',
    value: 'CA/BC/Columbia-Shuswap/Celista',
  },
  {
    label: 'Eagle Bay',
    value: 'CA/BC/Columbia-Shuswap/Eagle Bay',
  },
  {
    label: 'Edgewater',
    value: 'CA/BC/Columbia-Shuswap/Edgewater',
  },
  {
    label: 'Falkland',
    value: 'CA/BC/Columbia-Shuswap/Falkland',
  },
  {
    label: 'Field',
    value: 'CA/BC/Columbia-Shuswap/Field',
  },
  {
    label: 'Golden',
    value: 'CA/BC/Columbia-Shuswap/Golden',
  },
  {
    label: 'Grindrod',
    value: 'CA/BC/Columbia-Shuswap/Grindrod',
  },
  {
    label: 'Harrogate',
    value: 'CA/BC/Columbia-Shuswap/Harrogate',
  },
  {
    label: 'Lee Creek',
    value: 'CA/BC/Columbia-Shuswap/Lee Creek',
  },
  {
    label: 'Magna Bay',
    value: 'CA/BC/Columbia-Shuswap/Magna Bay',
  },
  {
    label: 'Malakwa',
    value: 'CA/BC/Columbia-Shuswap/Malakwa',
  },
  {
    label: 'Mara',
    value: 'CA/BC/Columbia-Shuswap/Mara',
  },
  {
    label: 'Mica Creek',
    value: 'CA/BC/Columbia-Shuswap/Mica Creek',
  },
  {
    label: 'Parson',
    value: 'CA/BC/Columbia-Shuswap/Parson',
  },
  {
    label: 'Revelstoke',
    value: 'CA/BC/Columbia-Shuswap/Revelstoke',
  },
  {
    label: 'Salmon Arm',
    value: 'CA/BC/Columbia-Shuswap/Salmon Arm',
  },
  {
    label: 'Scotch Creek',
    value: 'CA/BC/Columbia-Shuswap/Scotch Creek',
  },
  {
    label: 'Sicamous',
    value: 'CA/BC/Columbia-Shuswap/Sicamous',
  },
  {
    label: 'Sorrento',
    value: 'CA/BC/Columbia-Shuswap/Sorrento',
  },
  {
    label: 'St Ives',
    value: 'CA/BC/Columbia-Shuswap/St Ives',
  },
  {
    label: 'Tappen',
    value: 'CA/BC/Columbia-Shuswap/Tappen',
  },
  {
    label: 'Black Creek',
    value: 'CA/BC/Comox Valley/Black Creek',
  },
  {
    label: 'Comox',
    value: 'CA/BC/Comox Valley/Comox',
  },
  {
    label: 'Courtenay',
    value: 'CA/BC/Comox Valley/Courtenay',
  },
  {
    label: 'Cumberland',
    value: 'CA/BC/Comox Valley/Cumberland',
  },
  {
    label: 'Denman Island',
    value: 'CA/BC/Comox Valley/Denman Island',
  },
  {
    label: 'Fanny Bay',
    value: 'CA/BC/Comox Valley/Fanny Bay',
  },
  {
    label: 'Hornby Island',
    value: 'CA/BC/Comox Valley/Hornby Island',
  },
  {
    label: 'Lazo',
    value: 'CA/BC/Comox Valley/Lazo',
  },
  {
    label: 'Merville',
    value: 'CA/BC/Comox Valley/Merville',
  },
  {
    label: 'Royston',
    value: 'CA/BC/Comox Valley/Royston',
  },
  {
    label: 'Union Bay',
    value: 'CA/BC/Comox Valley/Union Bay',
  },
  {
    label: 'Van Anda',
    value: 'CA/BC/Comox Valley/Van Anda',
  },
  {
    label: 'Coquitlam',
    value: 'CA/BC/Coquitlam/Coquitlam',
  },
  {
    label: 'Chemainus',
    value: 'CA/BC/Cowichan Valley/Chemainus',
  },
  {
    label: 'Cobble Hill',
    value: 'CA/BC/Cowichan Valley/Cobble Hill',
  },
  {
    label: 'Cowichan Bay',
    value: 'CA/BC/Cowichan Valley/Cowichan Bay',
  },
  {
    label: 'Crofton',
    value: 'CA/BC/Cowichan Valley/Crofton',
  },
  {
    label: 'Duncan',
    value: 'CA/BC/Cowichan Valley/Duncan',
  },
  {
    label: 'Dunster',
    value: 'CA/BC/Cowichan Valley/Dunster',
  },
  {
    label: 'Honeymoon Bay',
    value: 'CA/BC/Cowichan Valley/Honeymoon Bay',
  },
  {
    label: 'Koksilah',
    value: 'CA/BC/Cowichan Valley/Koksilah',
  },
  {
    label: 'Ladysmith',
    value: 'CA/BC/Cowichan Valley/Ladysmith',
  },
  {
    label: 'Lake Cowichan',
    value: 'CA/BC/Cowichan Valley/Lake Cowichan',
  },
  {
    label: 'Malahat',
    value: 'CA/BC/Cowichan Valley/Malahat',
  },
  {
    label: 'Mesachie Lake',
    value: 'CA/BC/Cowichan Valley/Mesachie Lake',
  },
  {
    label: 'Mill Bay',
    value: 'CA/BC/Cowichan Valley/Mill Bay',
  },
  {
    label: 'Shawnigan Lake',
    value: 'CA/BC/Cowichan Valley/Shawnigan Lake',
  },
  {
    label: 'Thetis Island',
    value: 'CA/BC/Cowichan Valley/Thetis Island',
  },
  {
    label: 'Westholme',
    value: 'CA/BC/Cowichan Valley/Westholme',
  },
  {
    label: 'Athalmer',
    value: 'CA/BC/East Kootenay/Athalmer',
  },
  {
    label: 'Baynes Lake',
    value: 'CA/BC/East Kootenay/Baynes Lake',
  },
  {
    label: 'Canal Flats',
    value: 'CA/BC/East Kootenay/Canal Flats',
  },
  {
    label: 'Cranbrook',
    value: 'CA/BC/East Kootenay/Cranbrook',
  },
  {
    label: 'Destiny Bay',
    value: 'CA/BC/East Kootenay/Destiny Bay',
  },
  {
    label: 'Edgewater',
    value: 'CA/BC/East Kootenay/Edgewater',
  },
  {
    label: 'Elkford',
    value: 'CA/BC/East Kootenay/Elkford',
  },
  {
    label: 'Elko',
    value: 'CA/BC/East Kootenay/Elko',
  },
  {
    label: 'Fairmont Hot Springs',
    value: 'CA/BC/East Kootenay/Fairmont Hot Springs',
  },
  {
    label: 'Fernie',
    value: 'CA/BC/East Kootenay/Fernie',
  },
  {
    label: 'Fort Steele',
    value: 'CA/BC/East Kootenay/Fort Steele',
  },
  {
    label: 'Galloway',
    value: 'CA/BC/East Kootenay/Galloway',
  },
  {
    label: 'Grasmere',
    value: 'CA/BC/East Kootenay/Grasmere',
  },
  {
    label: 'Invermere',
    value: 'CA/BC/East Kootenay/Invermere',
  },
  {
    label: 'Jaffray',
    value: 'CA/BC/East Kootenay/Jaffray',
  },
  {
    label: 'Kimberley',
    value: 'CA/BC/East Kootenay/Kimberley',
  },
  {
    label: 'Koocanusa West',
    value: 'CA/BC/East Kootenay/Koocanusa West',
  },
  {
    label: 'Kuskanook',
    value: 'CA/BC/East Kootenay/Kuskanook',
  },
  {
    label: 'Marysville',
    value: 'CA/BC/East Kootenay/Marysville',
  },
  {
    label: 'Moyie',
    value: 'CA/BC/East Kootenay/Moyie',
  },
  {
    label: 'Newgate',
    value: 'CA/BC/East Kootenay/Newgate',
  },
  {
    label: 'Panorama',
    value: 'CA/BC/East Kootenay/Panorama',
  },
  {
    label: 'Radium Hot Springs',
    value: 'CA/BC/East Kootenay/Radium Hot Springs',
  },
  {
    label: 'Skookumchuck',
    value: 'CA/BC/East Kootenay/Skookumchuck',
  },
  {
    label: 'Sparwood',
    value: 'CA/BC/East Kootenay/Sparwood',
  },
  {
    label: 'Spillimacheen',
    value: 'CA/BC/East Kootenay/Spillimacheen',
  },
  {
    label: 'Ta Ta Creek',
    value: 'CA/BC/East Kootenay/Ta Ta Creek',
  },
  {
    label: 'Wardner',
    value: 'CA/BC/East Kootenay/Wardner',
  },
  {
    label: 'Wasa',
    value: 'CA/BC/East Kootenay/Wasa',
  },
  {
    label: 'Windermere',
    value: 'CA/BC/East Kootenay/Windermere',
  },
  {
    label: 'Bear Lake',
    value: 'CA/BC/Fraser-Fort George/Bear Lake',
  },
  {
    label: 'Crescent Spur',
    value: 'CA/BC/Fraser-Fort George/Crescent Spur',
  },
  {
    label: 'Dome Creek',
    value: 'CA/BC/Fraser-Fort George/Dome Creek',
  },
  {
    label: 'Dunster',
    value: 'CA/BC/Fraser-Fort George/Dunster',
  },
  {
    label: 'Germansen Landing',
    value: 'CA/BC/Fraser-Fort George/Germansen Landing',
  },
  {
    label: 'Hixon',
    value: 'CA/BC/Fraser-Fort George/Hixon',
  },
  {
    label: 'Longworth',
    value: 'CA/BC/Fraser-Fort George/Longworth',
  },
  {
    label: 'Mackenzie',
    value: 'CA/BC/Fraser-Fort George/Mackenzie',
  },
  {
    label: 'Manson Creek',
    value: 'CA/BC/Fraser-Fort George/Manson Creek',
  },
  {
    label: 'Mcbride',
    value: 'CA/BC/Fraser-Fort George/Mcbride',
  },
  {
    label: 'Mcleod Lake',
    value: 'CA/BC/Fraser-Fort George/Mcleod Lake',
  },
  {
    label: 'Penny',
    value: 'CA/BC/Fraser-Fort George/Penny',
  },
  {
    label: 'Prince George',
    value: 'CA/BC/Fraser-Fort George/Prince George',
  },
  {
    label: 'Sinclair Mills',
    value: 'CA/BC/Fraser-Fort George/Sinclair Mills',
  },
  {
    label: 'Summit Lake',
    value: 'CA/BC/Fraser-Fort George/Summit Lake',
  },
  {
    label: 'Upper Fraser',
    value: 'CA/BC/Fraser-Fort George/Upper Fraser',
  },
  {
    label: 'Valemount',
    value: 'CA/BC/Fraser-Fort George/Valemount',
  },
  {
    label: 'Willow River',
    value: 'CA/BC/Fraser-Fort George/Willow River',
  },
  {
    label: 'Abbotsford',
    value: 'CA/BC/Fraser Valley/Abbotsford',
  },
  {
    label: 'Agassiz',
    value: 'CA/BC/Fraser Valley/Agassiz',
  },
  {
    label: 'Boston Bar',
    value: 'CA/BC/Fraser Valley/Boston Bar',
  },
  {
    label: 'Chilliwack',
    value: 'CA/BC/Fraser Valley/Chilliwack',
  },
  {
    label: 'Cultus Lake',
    value: 'CA/BC/Fraser Valley/Cultus Lake',
  },
  {
    label: 'Deroche',
    value: 'CA/BC/Fraser Valley/Deroche',
  },
  {
    label: 'Dewdney',
    value: 'CA/BC/Fraser Valley/Dewdney',
  },
  {
    label: 'Harrison Hot Springs',
    value: 'CA/BC/Fraser Valley/Harrison Hot Springs',
  },
  {
    label: 'Harrison Mills',
    value: 'CA/BC/Fraser Valley/Harrison Mills',
  },
  {
    label: 'Hope',
    value: 'CA/BC/Fraser Valley/Hope',
  },
  {
    label: 'Lake Errock',
    value: 'CA/BC/Fraser Valley/Lake Errock',
  },
  {
    label: 'Lindell Beach',
    value: 'CA/BC/Fraser Valley/Lindell Beach',
  },
  {
    label: 'Mission',
    value: 'CA/BC/Fraser Valley/Mission',
  },
  {
    label: 'North Bend',
    value: 'CA/BC/Fraser Valley/North Bend',
  },
  {
    label: 'Rosedale',
    value: 'CA/BC/Fraser Valley/Rosedale',
  },
  {
    label: 'Spuzzum',
    value: 'CA/BC/Fraser Valley/Spuzzum',
  },
  {
    label: 'Yale',
    value: 'CA/BC/Fraser Valley/Yale',
  },
  {
    label: 'Coquitlam',
    value: 'CA/BC/Greater Vancouver/Coquitlam',
  },
  {
    label: 'Aiyansh',
    value: 'CA/BC/Kitimat-Stikine/Aiyansh',
  },
  {
    label: 'Cedarvale',
    value: 'CA/BC/Kitimat-Stikine/Cedarvale',
  },
  {
    label: 'Dease Lake',
    value: 'CA/BC/Kitimat-Stikine/Dease Lake',
  },
  {
    label: 'Gitanmaax',
    value: 'CA/BC/Kitimat-Stikine/Gitanmaax',
  },
  {
    label: 'Haisla',
    value: 'CA/BC/Kitimat-Stikine/Haisla',
  },
  {
    label: 'Hartley Bay',
    value: 'CA/BC/Kitimat-Stikine/Hartley Bay',
  },
  {
    label: 'Hazelton',
    value: 'CA/BC/Kitimat-Stikine/Hazelton',
  },
  {
    label: 'Iskut',
    value: 'CA/BC/Kitimat-Stikine/Iskut',
  },
  {
    label: 'Jade City',
    value: 'CA/BC/Kitimat-Stikine/Jade City',
  },
  {
    label: 'Kispiox',
    value: 'CA/BC/Kitimat-Stikine/Kispiox',
  },
  {
    label: 'Kitamaat Village',
    value: 'CA/BC/Kitimat-Stikine/Kitamaat Village',
  },
  {
    label: 'Kitimat',
    value: 'CA/BC/Kitimat-Stikine/Kitimat',
  },
  {
    label: 'Kitwanga',
    value: 'CA/BC/Kitimat-Stikine/Kitwanga',
  },
  {
    label: 'Meziadin Lake',
    value: 'CA/BC/Kitimat-Stikine/Meziadin Lake',
  },
  {
    label: 'Moricetown',
    value: 'CA/BC/Kitimat-Stikine/Moricetown',
  },
  {
    label: 'Nass Camp',
    value: 'CA/BC/Kitimat-Stikine/Nass Camp',
  },
  {
    label: 'New Aiyansh',
    value: 'CA/BC/Kitimat-Stikine/New Aiyansh',
  },
  {
    label: 'New Hazelton',
    value: 'CA/BC/Kitimat-Stikine/New Hazelton',
  },
  {
    label: 'Rosswood',
    value: 'CA/BC/Kitimat-Stikine/Rosswood',
  },
  {
    label: 'Sik-E-Dakh',
    value: 'CA/BC/Kitimat-Stikine/Sik-E-Dakh',
  },
  {
    label: 'South Hazelton',
    value: 'CA/BC/Kitimat-Stikine/South Hazelton',
  },
  {
    label: 'Stewart',
    value: 'CA/BC/Kitimat-Stikine/Stewart',
  },
  {
    label: 'Telegraph Creek',
    value: 'CA/BC/Kitimat-Stikine/Telegraph Creek',
  },
  {
    label: 'Terrace',
    value: 'CA/BC/Kitimat-Stikine/Terrace',
  },
  {
    label: 'Thornhill',
    value: 'CA/BC/Kitimat-Stikine/Thornhill',
  },
  {
    label: 'Beaverdell',
    value: 'CA/BC/Kootenay Boundary/Beaverdell',
  },
  {
    label: 'Christina Lake',
    value: 'CA/BC/Kootenay Boundary/Christina Lake',
  },
  {
    label: 'Fruitvale',
    value: 'CA/BC/Kootenay Boundary/Fruitvale',
  },
  {
    label: 'Genelle',
    value: 'CA/BC/Kootenay Boundary/Genelle',
  },
  {
    label: 'Grand Forks',
    value: 'CA/BC/Kootenay Boundary/Grand Forks',
  },
  {
    label: 'Greenwood',
    value: 'CA/BC/Kootenay Boundary/Greenwood',
  },
  {
    label: 'Midway',
    value: 'CA/BC/Kootenay Boundary/Midway',
  },
  {
    label: 'Montrose',
    value: 'CA/BC/Kootenay Boundary/Montrose',
  },
  {
    label: 'Rock Creek',
    value: 'CA/BC/Kootenay Boundary/Rock Creek',
  },
  {
    label: 'Rossland',
    value: 'CA/BC/Kootenay Boundary/Rossland',
  },
  {
    label: 'Trail',
    value: 'CA/BC/Kootenay Boundary/Trail',
  },
  {
    label: 'Westbridge',
    value: 'CA/BC/Kootenay Boundary/Westbridge',
  },
  {
    label: 'Aldergrove',
    value: 'CA/BC/Metro Vancouver/Aldergrove',
  },
  {
    label: 'Anmore',
    value: 'CA/BC/Metro Vancouver/Anmore',
  },
  {
    label: 'Belcarra',
    value: 'CA/BC/Metro Vancouver/Belcarra',
  },
  {
    label: 'Bowen Island',
    value: 'CA/BC/Metro Vancouver/Bowen Island',
  },
  {
    label: 'Burnaby',
    value: 'CA/BC/Metro Vancouver/Burnaby',
  },
  {
    label: 'Coquitlam',
    value: 'CA/BC/Metro Vancouver/Coquitlam',
  },
  {
    label: 'Delta',
    value: 'CA/BC/Metro Vancouver/Delta',
  },
  {
    label: 'Gold Creek',
    value: 'CA/BC/Metro Vancouver/Gold Creek',
  },
  {
    label: 'Langley',
    value: 'CA/BC/Metro Vancouver/Langley',
  },
  {
    label: 'Lions Bay',
    value: 'CA/BC/Metro Vancouver/Lions Bay',
  },
  {
    label: 'Maple Ridge',
    value: 'CA/BC/Metro Vancouver/Maple Ridge',
  },
  {
    label: 'Milner',
    value: 'CA/BC/Metro Vancouver/Milner',
  },
  {
    label: 'New Westminster',
    value: 'CA/BC/Metro Vancouver/New Westminster',
  },
  {
    label: 'North Vancouver',
    value: 'CA/BC/Metro Vancouver/North Vancouver',
  },
  {
    label: 'Pitt Meadows',
    value: 'CA/BC/Metro Vancouver/Pitt Meadows',
  },
  {
    label: 'Port Coquitlam',
    value: 'CA/BC/Metro Vancouver/Port Coquitlam',
  },
  {
    label: 'Port Moody',
    value: 'CA/BC/Metro Vancouver/Port Moody',
  },
  {
    label: 'Richmond',
    value: 'CA/BC/Metro Vancouver/Richmond',
  },
  {
    label: 'Surrey',
    value: 'CA/BC/Metro Vancouver/Surrey',
  },
  {
    label: 'Vancouver',
    value: 'CA/BC/Metro Vancouver/Vancouver',
  },
  {
    label: 'West Vancouver',
    value: 'CA/BC/Metro Vancouver/West Vancouver',
  },
  {
    label: 'White Rock',
    value: 'CA/BC/Metro Vancouver/White Rock',
  },
  {
    label: 'Alert Bay',
    value: 'CA/BC/Mount Waddington/Alert Bay',
  },
  {
    label: 'Coal Harbour',
    value: 'CA/BC/Mount Waddington/Coal Harbour',
  },
  {
    label: 'Holberg',
    value: 'CA/BC/Mount Waddington/Holberg',
  },
  {
    label: 'Kingcome Inlet',
    value: 'CA/BC/Mount Waddington/Kingcome Inlet',
  },
  {
    label: 'Minstrel Island',
    value: 'CA/BC/Mount Waddington/Minstrel Island',
  },
  {
    label: 'Port Alice',
    value: 'CA/BC/Mount Waddington/Port Alice',
  },
  {
    label: 'Port Hardy',
    value: 'CA/BC/Mount Waddington/Port Hardy',
  },
  {
    label: 'Port Mcneill',
    value: 'CA/BC/Mount Waddington/Port Mcneill',
  },
  {
    label: 'Quatsino',
    value: 'CA/BC/Mount Waddington/Quatsino',
  },
  {
    label: 'Simoom Sound',
    value: 'CA/BC/Mount Waddington/Simoom Sound',
  },
  {
    label: 'Sointula',
    value: 'CA/BC/Mount Waddington/Sointula',
  },
  {
    label: 'Sullivan Bay',
    value: 'CA/BC/Mount Waddington/Sullivan Bay',
  },
  {
    label: 'Telegraph Cove',
    value: 'CA/BC/Mount Waddington/Telegraph Cove',
  },
  {
    label: 'Winter Harbour',
    value: 'CA/BC/Mount Waddington/Winter Harbour',
  },
  {
    label: 'Woss',
    value: 'CA/BC/Mount Waddington/Woss',
  },
  {
    label: 'Bowser',
    value: 'CA/BC/Nanaimo/Bowser',
  },
  {
    label: 'Cassidy',
    value: 'CA/BC/Nanaimo/Cassidy',
  },
  {
    label: 'Coombs',
    value: 'CA/BC/Nanaimo/Coombs',
  },
  {
    label: 'Errington',
    value: 'CA/BC/Nanaimo/Errington',
  },
  {
    label: 'Gabriola Island',
    value: 'CA/BC/Nanaimo/Gabriola Island',
  },
  {
    label: 'Lantzville',
    value: 'CA/BC/Nanaimo/Lantzville',
  },
  {
    label: 'Nanaimo',
    value: 'CA/BC/Nanaimo/Nanaimo',
  },
  {
    label: 'Nanoose Bay',
    value: 'CA/BC/Nanaimo/Nanoose Bay',
  },
  {
    label: 'Parksville',
    value: 'CA/BC/Nanaimo/Parksville',
  },
  {
    label: 'Qualicum',
    value: 'CA/BC/Nanaimo/Qualicum',
  },
  {
    label: 'New Westminster',
    value: 'CA/BC/New Westminster/New Westminster',
  },
  {
    label: 'North Cowichan',
    value: 'CA/BC/North Cowichan/North Cowichan',
  },
  {
    label: 'Armstrong',
    value: 'CA/BC/North Okanagan/Armstrong',
  },
  {
    label: 'Coldstream',
    value: 'CA/BC/North Okanagan/Coldstream',
  },
  {
    label: 'Enderby',
    value: 'CA/BC/North Okanagan/Enderby',
  },
  {
    label: 'Grindrod',
    value: 'CA/BC/North Okanagan/Grindrod',
  },
  {
    label: 'Lavington',
    value: 'CA/BC/North Okanagan/Lavington',
  },
  {
    label: 'Lumby',
    value: 'CA/BC/North Okanagan/Lumby',
  },
  {
    label: 'Vernon',
    value: 'CA/BC/North Okanagan/Vernon',
  },
  {
    label: 'Fort Nelson',
    value: 'CA/BC/Northern Rockies/Fort Nelson',
  },
  {
    label: 'Muncho Lake',
    value: 'CA/BC/Northern Rockies/Muncho Lake',
  },
  {
    label: 'Prophet River',
    value: 'CA/BC/Northern Rockies/Prophet River',
  },
  {
    label: 'Toad River',
    value: 'CA/BC/Northern Rockies/Toad River',
  },
  {
    label: 'Bridesville',
    value: 'CA/BC/Okanagan-Similkameen/Bridesville',
  },
  {
    label: 'Cawston',
    value: 'CA/BC/Okanagan-Similkameen/Cawston',
  },
  {
    label: 'Cherryville',
    value: 'CA/BC/Okanagan-Similkameen/Cherryville',
  },
  {
    label: 'Coalmont',
    value: 'CA/BC/Okanagan-Similkameen/Coalmont',
  },
  {
    label: 'Hedley',
    value: 'CA/BC/Okanagan-Similkameen/Hedley',
  },
  {
    label: 'Kaleden',
    value: 'CA/BC/Okanagan-Similkameen/Kaleden',
  },
  {
    label: 'Keremeos',
    value: 'CA/BC/Okanagan-Similkameen/Keremeos',
  },
  {
    label: 'Lake Country',
    value: 'CA/BC/Okanagan-Similkameen/Lake Country',
  },
  {
    label: 'Manning Park',
    value: 'CA/BC/Okanagan-Similkameen/Manning Park',
  },
  {
    label: 'Naramata',
    value: 'CA/BC/Okanagan-Similkameen/Naramata',
  },
  {
    label: 'Okanagan Falls',
    value: 'CA/BC/Okanagan-Similkameen/Okanagan Falls',
  },
  {
    label: 'Oliver',
    value: 'CA/BC/Okanagan-Similkameen/Oliver',
  },
  {
    label: 'Osoyoos',
    value: 'CA/BC/Okanagan-Similkameen/Osoyoos',
  },
  {
    label: 'Penticton',
    value: 'CA/BC/Okanagan-Similkameen/Penticton',
  },
  {
    label: 'Princeton',
    value: 'CA/BC/Okanagan-Similkameen/Princeton',
  },
  {
    label: 'Summerland',
    value: 'CA/BC/Okanagan-Similkameen/Summerland',
  },
  {
    label: 'Tulameen',
    value: 'CA/BC/Okanagan-Similkameen/Tulameen',
  },
  {
    label: 'Altona',
    value: 'CA/BC/Peace River/Altona',
  },
  {
    label: 'Arras',
    value: 'CA/BC/Peace River/Arras',
  },
  {
    label: 'Baldonnel',
    value: 'CA/BC/Peace River/Baldonnel',
  },
  {
    label: 'Buick',
    value: 'CA/BC/Peace River/Buick',
  },
  {
    label: 'Cecil Lake',
    value: 'CA/BC/Peace River/Cecil Lake',
  },
  {
    label: 'Charlie Lake',
    value: 'CA/BC/Peace River/Charlie Lake',
  },
  {
    label: 'Chetwynd',
    value: 'CA/BC/Peace River/Chetwynd',
  },
  {
    label: 'Clayhurst',
    value: 'CA/BC/Peace River/Clayhurst',
  },
  {
    label: 'Dawson Creek',
    value: 'CA/BC/Peace River/Dawson Creek',
  },
  {
    label: 'Farmington',
    value: 'CA/BC/Peace River/Farmington',
  },
  {
    label: 'Fort St John',
    value: 'CA/BC/Peace River/Fort St John',
  },
  {
    label: 'Goodlow',
    value: 'CA/BC/Peace River/Goodlow',
  },
  {
    label: 'Groundbirch',
    value: 'CA/BC/Peace River/Groundbirch',
  },
  {
    label: 'Hudsons Hope',
    value: 'CA/BC/Peace River/Hudsons Hope',
  },
  {
    label: 'Moberly Lake',
    value: 'CA/BC/Peace River/Moberly Lake',
  },
  {
    label: 'Montney',
    value: 'CA/BC/Peace River/Montney',
  },
  {
    label: 'North Pine',
    value: 'CA/BC/Peace River/North Pine',
  },
  {
    label: 'Peace River Regional District',
    value: 'CA/BC/Peace River/Peace River Regional District',
  },
  {
    label: 'Pink Mountain',
    value: 'CA/BC/Peace River/Pink Mountain',
  },
  {
    label: 'Pouce Coupe',
    value: 'CA/BC/Peace River/Pouce Coupe',
  },
  {
    label: 'Prespatou',
    value: 'CA/BC/Peace River/Prespatou',
  },
  {
    label: 'Progress',
    value: 'CA/BC/Peace River/Progress',
  },
  {
    label: 'Rolla',
    value: 'CA/BC/Peace River/Rolla',
  },
  {
    label: 'Rose Prairie',
    value: 'CA/BC/Peace River/Rose Prairie',
  },
  {
    label: 'Sunset Prairie',
    value: 'CA/BC/Peace River/Sunset Prairie',
  },
  {
    label: 'Taylor',
    value: 'CA/BC/Peace River/Taylor',
  },
  {
    label: 'Tomslake',
    value: 'CA/BC/Peace River/Tomslake',
  },
  {
    label: 'Tsay Keh Dene',
    value: 'CA/BC/Peace River/Tsay Keh Dene',
  },
  {
    label: 'Tumbler Ridge',
    value: 'CA/BC/Peace River/Tumbler Ridge',
  },
  {
    label: 'Ware',
    value: 'CA/BC/Peace River/Ware',
  },
  {
    label: 'Wonowon',
    value: 'CA/BC/Peace River/Wonowon',
  },
  {
    label: 'Blubber Bay',
    value: 'CA/BC/Powell River/Blubber Bay',
  },
  {
    label: 'Gillies Bay',
    value: 'CA/BC/Powell River/Gillies Bay',
  },
  {
    label: 'Lasqueti Island',
    value: 'CA/BC/Powell River/Lasqueti Island',
  },
  {
    label: 'Lund',
    value: 'CA/BC/Powell River/Lund',
  },
  {
    label: 'Powell River',
    value: 'CA/BC/Powell River/Powell River',
  },
  {
    label: 'Savary Island',
    value: 'CA/BC/Powell River/Savary Island',
  },
  {
    label: 'Texada Island',
    value: 'CA/BC/Powell River/Texada Island',
  },
  {
    label: 'Van Anda',
    value: 'CA/BC/Powell River/Van Anda',
  },
  {
    label: 'Daajing Giids',
    value: 'CA/BC/Skeena-Queen Charlotte/Daajing Giids',
  },
  {
    label: 'Gitwinksihlkw',
    value: 'CA/BC/Skeena-Queen Charlotte/Gitwinksihlkw',
  },
  {
    label: 'Greenville',
    value: 'CA/BC/Skeena-Queen Charlotte/Greenville',
  },
  {
    label: 'Juskatla',
    value: 'CA/BC/Skeena-Queen Charlotte/Juskatla',
  },
  {
    label: 'Kincolith',
    value: 'CA/BC/Skeena-Queen Charlotte/Kincolith',
  },
  {
    label: 'Kitkatla',
    value: 'CA/BC/Skeena-Queen Charlotte/Kitkatla',
  },
  {
    label: "Lax Kw'alaams",
    value: "CA/BC/Skeena-Queen Charlotte/Lax Kw'alaams",
  },
  {
    label: 'Masset',
    value: 'CA/BC/Skeena-Queen Charlotte/Masset',
  },
  {
    label: 'Oona River',
    value: 'CA/BC/Skeena-Queen Charlotte/Oona River',
  },
  {
    label: 'Port Clements',
    value: 'CA/BC/Skeena-Queen Charlotte/Port Clements',
  },
  {
    label: 'Port Edward',
    value: 'CA/BC/Skeena-Queen Charlotte/Port Edward',
  },
  {
    label: 'Prince Rupert',
    value: 'CA/BC/Skeena-Queen Charlotte/Prince Rupert',
  },
  {
    label: 'Sandspit',
    value: 'CA/BC/Skeena-Queen Charlotte/Sandspit',
  },
  {
    label: 'Skidegate',
    value: 'CA/BC/Skeena-Queen Charlotte/Skidegate',
  },
  {
    label: 'Tlell',
    value: 'CA/BC/Skeena-Queen Charlotte/Tlell',
  },
  {
    label: 'Brackendale',
    value: 'CA/BC/Squamish-Lillooet/Brackendale',
  },
  {
    label: 'Britannia Beach',
    value: 'CA/BC/Squamish-Lillooet/Britannia Beach',
  },
  {
    label: "D'arcy",
    value: "CA/BC/Squamish-Lillooet/D'arcy",
  },
  {
    label: 'Furry Creek',
    value: 'CA/BC/Squamish-Lillooet/Furry Creek',
  },
  {
    label: 'Garibaldi Highlands',
    value: 'CA/BC/Squamish-Lillooet/Garibaldi Highlands',
  },
  {
    label: 'Gold Bridge',
    value: 'CA/BC/Squamish-Lillooet/Gold Bridge',
  },
  {
    label: 'Lillooet',
    value: 'CA/BC/Squamish-Lillooet/Lillooet',
  },
  {
    label: 'Mount Currie',
    value: 'CA/BC/Squamish-Lillooet/Mount Currie',
  },
  {
    label: 'Pavilion',
    value: 'CA/BC/Squamish-Lillooet/Pavilion',
  },
  {
    label: 'Pemberton',
    value: 'CA/BC/Squamish-Lillooet/Pemberton',
  },
  {
    label: 'Seton Portage',
    value: 'CA/BC/Squamish-Lillooet/Seton Portage',
  },
  {
    label: 'Shalalth',
    value: 'CA/BC/Squamish-Lillooet/Shalalth',
  },
  {
    label: 'Squamish',
    value: 'CA/BC/Squamish-Lillooet/Squamish',
  },
  {
    label: 'Whistler',
    value: 'CA/BC/Squamish-Lillooet/Whistler',
  },
  {
    label: 'Atlin',
    value: 'CA/BC/Stikine/Atlin',
  },
  {
    label: 'Dease Lake',
    value: 'CA/BC/Stikine/Dease Lake',
  },
  {
    label: 'Good Hope Lake',
    value: 'CA/BC/Stikine/Good Hope Lake',
  },
  {
    label: 'Iskut',
    value: 'CA/BC/Stikine/Iskut',
  },
  {
    label: 'Lower Post',
    value: 'CA/BC/Stikine/Lower Post',
  },
  {
    label: 'Blind Channel',
    value: 'CA/BC/Strathcona/Blind Channel',
  },
  {
    label: 'Campbell River',
    value: 'CA/BC/Strathcona/Campbell River',
  },
  {
    label: 'Gold River',
    value: 'CA/BC/Strathcona/Gold River',
  },
  {
    label: 'Heriot Bay',
    value: 'CA/BC/Strathcona/Heriot Bay',
  },
  {
    label: 'Kyuquot',
    value: 'CA/BC/Strathcona/Kyuquot',
  },
  {
    label: 'Mansons Landing',
    value: 'CA/BC/Strathcona/Mansons Landing',
  },
  {
    label: 'Port Neville',
    value: 'CA/BC/Strathcona/Port Neville',
  },
  {
    label: 'Quadra Island',
    value: 'CA/BC/Strathcona/Quadra Island',
  },
  {
    label: 'Quathiaski Cove',
    value: 'CA/BC/Strathcona/Quathiaski Cove',
  },
  {
    label: 'Refuge Cove',
    value: 'CA/BC/Strathcona/Refuge Cove',
  },
  {
    label: 'Sayward',
    value: 'CA/BC/Strathcona/Sayward',
  },
  {
    label: 'Squirrel Cove',
    value: 'CA/BC/Strathcona/Squirrel Cove',
  },
  {
    label: 'Stuart Island',
    value: 'CA/BC/Strathcona/Stuart Island',
  },
  {
    label: 'Surge Narrows',
    value: 'CA/BC/Strathcona/Surge Narrows',
  },
  {
    label: 'Tahsis',
    value: 'CA/BC/Strathcona/Tahsis',
  },
  {
    label: 'Whaletown',
    value: 'CA/BC/Strathcona/Whaletown',
  },
  {
    label: 'Zeballos',
    value: 'CA/BC/Strathcona/Zeballos',
  },
  {
    label: 'Egmont',
    value: 'CA/BC/Sunshine Coast/Egmont',
  },
  {
    label: 'Gambier Island',
    value: 'CA/BC/Sunshine Coast/Gambier Island',
  },
  {
    label: 'Garden Bay',
    value: 'CA/BC/Sunshine Coast/Garden Bay',
  },
  {
    label: 'Gibsons',
    value: 'CA/BC/Sunshine Coast/Gibsons',
  },
  {
    label: 'Gillies Bay',
    value: 'CA/BC/Sunshine Coast/Gillies Bay',
  },
  {
    label: 'Granthams Landing',
    value: 'CA/BC/Sunshine Coast/Granthams Landing',
  },
  {
    label: 'Halfmoon Bay',
    value: 'CA/BC/Sunshine Coast/Halfmoon Bay',
  },
  {
    label: 'Madeira Park',
    value: 'CA/BC/Sunshine Coast/Madeira Park',
  },
  {
    label: 'Port Mellon',
    value: 'CA/BC/Sunshine Coast/Port Mellon',
  },
  {
    label: 'Roberts Creek',
    value: 'CA/BC/Sunshine Coast/Roberts Creek',
  },
  {
    label: 'Sechelt',
    value: 'CA/BC/Sunshine Coast/Sechelt',
  },
  {
    label: '70 Mile House',
    value: 'CA/BC/Thompson-Nicola/70 Mile House',
  },
  {
    label: 'Ashcroft',
    value: 'CA/BC/Thompson-Nicola/Ashcroft',
  },
  {
    label: 'Barriere',
    value: 'CA/BC/Thompson-Nicola/Barriere',
  },
  {
    label: 'Blue River',
    value: 'CA/BC/Thompson-Nicola/Blue River',
  },
  {
    label: 'Cache Creek',
    value: 'CA/BC/Thompson-Nicola/Cache Creek',
  },
  {
    label: 'Chase',
    value: 'CA/BC/Thompson-Nicola/Chase',
  },
  {
    label: 'Clearwater',
    value: 'CA/BC/Thompson-Nicola/Clearwater',
  },
  {
    label: 'Clinton',
    value: 'CA/BC/Thompson-Nicola/Clinton',
  },
  {
    label: 'Darfield',
    value: 'CA/BC/Thompson-Nicola/Darfield',
  },
  {
    label: 'Douglas Lake',
    value: 'CA/BC/Thompson-Nicola/Douglas Lake',
  },
  {
    label: 'Heffley Creek',
    value: 'CA/BC/Thompson-Nicola/Heffley Creek',
  },
  {
    label: 'Kamloops',
    value: 'CA/BC/Thompson-Nicola/Kamloops',
  },
  {
    label: 'Knutsford',
    value: 'CA/BC/Thompson-Nicola/Knutsford',
  },
  {
    label: 'Little Fort',
    value: 'CA/BC/Thompson-Nicola/Little Fort',
  },
  {
    label: 'Logan Lake',
    value: 'CA/BC/Thompson-Nicola/Logan Lake',
  },
  {
    label: 'Louis Creek',
    value: 'CA/BC/Thompson-Nicola/Louis Creek',
  },
  {
    label: 'Lower Nicola',
    value: 'CA/BC/Thompson-Nicola/Lower Nicola',
  },
  {
    label: 'Lytton',
    value: 'CA/BC/Thompson-Nicola/Lytton',
  },
  {
    label: 'Mclure',
    value: 'CA/BC/Thompson-Nicola/Mclure',
  },
  {
    label: 'Merritt',
    value: 'CA/BC/Thompson-Nicola/Merritt',
  },
  {
    label: 'Monte Creek',
    value: 'CA/BC/Thompson-Nicola/Monte Creek',
  },
  {
    label: 'Monte Lake',
    value: 'CA/BC/Thompson-Nicola/Monte Lake',
  },
  {
    label: 'Pinantan Lake',
    value: 'CA/BC/Thompson-Nicola/Pinantan Lake',
  },
  {
    label: 'Pritchard',
    value: 'CA/BC/Thompson-Nicola/Pritchard',
  },
  {
    label: 'Quilchena',
    value: 'CA/BC/Thompson-Nicola/Quilchena',
  },
  {
    label: 'Savona',
    value: 'CA/BC/Thompson-Nicola/Savona',
  },
  {
    label: 'Spences Bridge',
    value: 'CA/BC/Thompson-Nicola/Spences Bridge',
  },
  {
    label: 'Sun Peaks',
    value: 'CA/BC/Thompson-Nicola/Sun Peaks',
  },
  {
    label: 'Tobiano',
    value: 'CA/BC/Thompson-Nicola/Tobiano',
  },
  {
    label: 'Vavenby',
    value: 'CA/BC/Thompson-Nicola/Vavenby',
  },
  {
    label: 'Walhachin',
    value: 'CA/BC/Thompson-Nicola/Walhachin',
  },
  {
    label: 'Westwold',
    value: 'CA/BC/Thompson-Nicola/Westwold',
  },
  {
    label: 'Burnaby',
    value: 'CA/BC/Vancouver/Burnaby',
  },
  {
    label: 'Vancouver',
    value: 'CA/BC/Vancouver Metro/Vancouver',
  },
  {
    label: 'Altona',
    value: 'CA/MB/Altona/Altona',
  },
  {
    label: 'Arborg',
    value: 'CA/MB/Arborg/Arborg',
  },
  {
    label: 'Anola',
    value: 'CA/MB/Beausejour/Anola',
  },
  {
    label: 'Beausejour',
    value: 'CA/MB/Beausejour/Beausejour',
  },
  {
    label: 'Dugald',
    value: 'CA/MB/Beausejour/Dugald',
  },
  {
    label: 'Garson',
    value: 'CA/MB/Beausejour/Garson',
  },
  {
    label: 'Oakbank',
    value: 'CA/MB/Beausejour/Oakbank',
  },
  {
    label: 'Springfield',
    value: 'CA/MB/Beausejour/Springfield',
  },
  {
    label: 'West Pine Ridge',
    value: 'CA/MB/Beausejour/West Pine Ridge',
  },
  {
    label: 'Morweena',
    value: 'CA/MB/Bifrost-Riverton/Morweena',
  },
  {
    label: 'Okno',
    value: 'CA/MB/Bifrost-Riverton/Okno',
  },
  {
    label: 'Riverton',
    value: 'CA/MB/Bifrost-Riverton/Riverton',
  },
  {
    label: 'Vidir',
    value: 'CA/MB/Bifrost-Riverton/Vidir',
  },
  {
    label: 'Alexander',
    value: 'CA/MB/Brandon/Alexander',
  },
  {
    label: 'Brandon',
    value: 'CA/MB/Brandon/Brandon',
  },
  {
    label: 'Brookdale',
    value: 'CA/MB/Brandon/Brookdale',
  },
  {
    label: 'Carberry',
    value: 'CA/MB/Brandon/Carberry',
  },
  {
    label: 'Carroll',
    value: 'CA/MB/Brandon/Carroll',
  },
  {
    label: 'Glenboro',
    value: 'CA/MB/Brandon/Glenboro',
  },
  {
    label: 'Rivers',
    value: 'CA/MB/Brandon/Rivers',
  },
  {
    label: 'Shilo',
    value: 'CA/MB/Brandon/Shilo',
  },
  {
    label: 'Souris',
    value: 'CA/MB/Brandon/Souris',
  },
  {
    label: 'Wawanesa',
    value: 'CA/MB/Brandon/Wawanesa',
  },
  {
    label: 'Goodlands',
    value: 'CA/MB/Brenda-Waskada/Goodlands',
  },
  {
    label: 'Medora',
    value: 'CA/MB/Brenda-Waskada/Medora',
  },
  {
    label: 'Napinka',
    value: 'CA/MB/Brenda-Waskada/Napinka',
  },
  {
    label: 'Waskada',
    value: 'CA/MB/Brenda-Waskada/Waskada',
  },
  {
    label: 'Carberry',
    value: 'CA/MB/Carberry/Carberry',
  },
  {
    label: 'Carman',
    value: 'CA/MB/Carman/Carman',
  },
  {
    label: 'Cartwright',
    value: 'CA/MB/Cartwright-Roblin/Cartwright',
  },
  {
    label: 'Mather',
    value: 'CA/MB/Cartwright-Roblin/Mather',
  },
  {
    label: 'Arden',
    value: 'CA/MB/Central Manitoba/Arden',
  },
  {
    label: 'Austin',
    value: 'CA/MB/Central Manitoba/Austin',
  },
  {
    label: 'Gladstone',
    value: 'CA/MB/Central Manitoba/Gladstone',
  },
  {
    label: 'Glenella',
    value: 'CA/MB/Central Manitoba/Glenella',
  },
  {
    label: 'Holland',
    value: 'CA/MB/Central Manitoba/Holland',
  },
  {
    label: 'Langruth',
    value: 'CA/MB/Central Manitoba/Langruth',
  },
  {
    label: 'Macgregor',
    value: 'CA/MB/Central Manitoba/Macgregor',
  },
  {
    label: 'Rathwell',
    value: 'CA/MB/Central Manitoba/Rathwell',
  },
  {
    label: 'Treherne',
    value: 'CA/MB/Central Manitoba/Treherne',
  },
  {
    label: 'Westbourne',
    value: 'CA/MB/Central Manitoba/Westbourne',
  },
  {
    label: 'Alonsa',
    value: 'CA/MB/Central Plains/Alonsa',
  },
  {
    label: 'Amaranth',
    value: 'CA/MB/Central Plains/Amaranth',
  },
  {
    label: 'Austin',
    value: 'CA/MB/Central Plains/Austin',
  },
  {
    label: 'Bagot',
    value: 'CA/MB/Central Plains/Bagot',
  },
  {
    label: 'Cypress River',
    value: 'CA/MB/Central Plains/Cypress River',
  },
  {
    label: 'Dacotah',
    value: 'CA/MB/Central Plains/Dacotah',
  },
  {
    label: 'Dakota Tipi',
    value: 'CA/MB/Central Plains/Dakota Tipi',
  },
  {
    label: 'Eddystone',
    value: 'CA/MB/Central Plains/Eddystone',
  },
  {
    label: 'Edwin',
    value: 'CA/MB/Central Plains/Edwin',
  },
  {
    label: 'Elie',
    value: 'CA/MB/Central Plains/Elie',
  },
  {
    label: 'Gladstone',
    value: 'CA/MB/Central Plains/Gladstone',
  },
  {
    label: 'Glenella',
    value: 'CA/MB/Central Plains/Glenella',
  },
  {
    label: 'High Bluff',
    value: 'CA/MB/Central Plains/High Bluff',
  },
  {
    label: 'Holland',
    value: 'CA/MB/Central Plains/Holland',
  },
  {
    label: 'Kinosota',
    value: 'CA/MB/Central Plains/Kinosota',
  },
  {
    label: 'Lakeland',
    value: 'CA/MB/Central Plains/Lakeland',
  },
  {
    label: 'Langruth',
    value: 'CA/MB/Central Plains/Langruth',
  },
  {
    label: 'Lavenham',
    value: 'CA/MB/Central Plains/Lavenham',
  },
  {
    label: 'Macdonald',
    value: 'CA/MB/Central Plains/Macdonald',
  },
  {
    label: 'Macgregor',
    value: 'CA/MB/Central Plains/Macgregor',
  },
  {
    label: 'Marius',
    value: 'CA/MB/Central Plains/Marius',
  },
  {
    label: 'Newton Siding',
    value: 'CA/MB/Central Plains/Newton Siding',
  },
  {
    label: 'Notre Dame De Lourdes',
    value: 'CA/MB/Central Plains/Notre Dame De Lourdes',
  },
  {
    label: 'Oakville',
    value: 'CA/MB/Central Plains/Oakville',
  },
  {
    label: 'Plumas',
    value: 'CA/MB/Central Plains/Plumas',
  },
  {
    label: 'Poplar Point',
    value: 'CA/MB/Central Plains/Poplar Point',
  },
  {
    label: 'Portage La Prairie',
    value: 'CA/MB/Central Plains/Portage La Prairie',
  },
  {
    label: 'Pratt',
    value: 'CA/MB/Central Plains/Pratt',
  },
  {
    label: 'Rathwell',
    value: 'CA/MB/Central Plains/Rathwell',
  },
  {
    label: 'Rossendale',
    value: 'CA/MB/Central Plains/Rossendale',
  },
  {
    label: 'Silver Ridge',
    value: 'CA/MB/Central Plains/Silver Ridge',
  },
  {
    label: 'Southport',
    value: 'CA/MB/Central Plains/Southport',
  },
  {
    label: 'Springstein',
    value: 'CA/MB/Central Plains/Springstein',
  },
  {
    label: 'St Ambroise',
    value: 'CA/MB/Central Plains/St Ambroise',
  },
  {
    label: 'St Claude',
    value: 'CA/MB/Central Plains/St Claude',
  },
  {
    label: 'St Eustache',
    value: 'CA/MB/Central Plains/St Eustache',
  },
  {
    label: 'St Marks',
    value: 'CA/MB/Central Plains/St Marks',
  },
  {
    label: 'Treherne',
    value: 'CA/MB/Central Plains/Treherne',
  },
  {
    label: 'Waldersee',
    value: 'CA/MB/Central Plains/Waldersee',
  },
  {
    label: 'Westbourne',
    value: 'CA/MB/Central Plains/Westbourne',
  },
  {
    label: 'Woodside',
    value: 'CA/MB/Central Plains/Woodside',
  },
  {
    label: 'Churchill',
    value: 'CA/MB/Churchill/Churchill',
  },
  {
    label: 'Churchill Harbour',
    value: 'CA/MB/Churchill/Churchill Harbour',
  },
  {
    label: 'Churchill',
    value: 'CA/MB/Churchill And Northern Manitoba/Churchill',
  },
  {
    label: 'Gillam',
    value: 'CA/MB/Churchill And Northern Manitoba/Gillam',
  },
  {
    label: 'Leaf Rapids',
    value: 'CA/MB/Churchill And Northern Manitoba/Leaf Rapids',
  },
  {
    label: 'Lynn Lake',
    value: 'CA/MB/Churchill And Northern Manitoba/Lynn Lake',
  },
  {
    label: 'Clanwilliam',
    value: 'CA/MB/Clanwilliam-Erickson/Clanwilliam',
  },
  {
    label: 'Erickson',
    value: 'CA/MB/Clanwilliam-Erickson/Erickson',
  },
  {
    label: 'Alonsa',
    value: 'CA/MB/Dauphin/Alonsa',
  },
  {
    label: 'Amaranth',
    value: 'CA/MB/Dauphin/Amaranth',
  },
  {
    label: 'Dauphin',
    value: 'CA/MB/Dauphin/Dauphin',
  },
  {
    label: 'Ebb And Flow',
    value: 'CA/MB/Dauphin/Ebb And Flow',
  },
  {
    label: 'Ethelbert',
    value: 'CA/MB/Dauphin/Ethelbert',
  },
  {
    label: 'Fork River',
    value: 'CA/MB/Dauphin/Fork River',
  },
  {
    label: 'Garland',
    value: 'CA/MB/Dauphin/Garland',
  },
  {
    label: 'Gilbert Plains',
    value: 'CA/MB/Dauphin/Gilbert Plains',
  },
  {
    label: 'Grandview',
    value: 'CA/MB/Dauphin/Grandview',
  },
  {
    label: 'Laurier',
    value: 'CA/MB/Dauphin/Laurier',
  },
  {
    label: 'Mccreary',
    value: 'CA/MB/Dauphin/Mccreary',
  },
  {
    label: 'Ochre River',
    value: 'CA/MB/Dauphin/Ochre River',
  },
  {
    label: 'Rorketon',
    value: 'CA/MB/Dauphin/Rorketon',
  },
  {
    label: 'Ste Rose Du Lac',
    value: 'CA/MB/Dauphin/Ste Rose Du Lac',
  },
  {
    label: 'Tootinaowaziibeeng',
    value: 'CA/MB/Dauphin/Tootinaowaziibeeng',
  },
  {
    label: 'Valley River',
    value: 'CA/MB/Dauphin/Valley River',
  },
  {
    label: 'Winnipegosis',
    value: 'CA/MB/Dauphin/Winnipegosis',
  },
  {
    label: 'Deloraine',
    value: 'CA/MB/Deloraine-Winchester/Deloraine',
  },
  {
    label: 'Metigoshe',
    value: 'CA/MB/Deloraine-Winchester/Metigoshe',
  },
  {
    label: 'Cross Lake',
    value: 'CA/MB/Eastern Manitoba/Cross Lake',
  },
  {
    label: 'Falcon Beach',
    value: 'CA/MB/Eastern Manitoba/Falcon Beach',
  },
  {
    label: 'Hadashville',
    value: 'CA/MB/Eastern Manitoba/Hadashville',
  },
  {
    label: 'Lac Du Bonnet',
    value: 'CA/MB/Eastern Manitoba/Lac Du Bonnet',
  },
  {
    label: 'Pinawa',
    value: 'CA/MB/Eastern Manitoba/Pinawa',
  },
  {
    label: 'Pine Falls',
    value: 'CA/MB/Eastern Manitoba/Pine Falls',
  },
  {
    label: 'Piney',
    value: 'CA/MB/Eastern Manitoba/Piney',
  },
  {
    label: 'Pointe Du Bois',
    value: 'CA/MB/Eastern Manitoba/Pointe Du Bois',
  },
  {
    label: 'Rennie',
    value: 'CA/MB/Eastern Manitoba/Rennie',
  },
  {
    label: 'River Hills',
    value: 'CA/MB/Eastern Manitoba/River Hills',
  },
  {
    label: 'Sandilands',
    value: 'CA/MB/Eastern Manitoba/Sandilands',
  },
  {
    label: 'Seddons Corner',
    value: 'CA/MB/Eastern Manitoba/Seddons Corner',
  },
  {
    label: 'Seven Sisters Falls',
    value: 'CA/MB/Eastern Manitoba/Seven Sisters Falls',
  },
  {
    label: 'Sprague',
    value: 'CA/MB/Eastern Manitoba/Sprague',
  },
  {
    label: 'Sundown',
    value: 'CA/MB/Eastern Manitoba/Sundown',
  },
  {
    label: 'Traverse Bay',
    value: 'CA/MB/Eastern Manitoba/Traverse Bay',
  },
  {
    label: 'Victoria Beach',
    value: 'CA/MB/Eastern Manitoba/Victoria Beach',
  },
  {
    label: 'Vita',
    value: 'CA/MB/Eastern Manitoba/Vita',
  },
  {
    label: 'Whitemouth',
    value: 'CA/MB/Eastern Manitoba/Whitemouth',
  },
  {
    label: 'Woodridge',
    value: 'CA/MB/Eastern Manitoba/Woodridge',
  },
  {
    label: 'Anola',
    value: 'CA/MB/Eastman/Anola',
  },
  {
    label: 'Aubigny',
    value: 'CA/MB/Eastman/Aubigny',
  },
  {
    label: 'Beausejour',
    value: 'CA/MB/Eastman/Beausejour',
  },
  {
    label: 'Berens River',
    value: 'CA/MB/Eastman/Berens River',
  },
  {
    label: 'Bissett',
    value: 'CA/MB/Eastman/Bissett',
  },
  {
    label: 'Buffalo Point',
    value: 'CA/MB/Eastman/Buffalo Point',
  },
  {
    label: 'Carlowrie',
    value: 'CA/MB/Eastman/Carlowrie',
  },
  {
    label: 'Dominion City',
    value: 'CA/MB/Eastman/Dominion City',
  },
  {
    label: 'Dufresne',
    value: 'CA/MB/Eastman/Dufresne',
  },
  {
    label: 'Dufrost',
    value: 'CA/MB/Eastman/Dufrost',
  },
  {
    label: 'Dugald',
    value: 'CA/MB/Eastman/Dugald',
  },
  {
    label: 'East Braintree',
    value: 'CA/MB/Eastman/East Braintree',
  },
  {
    label: 'Elma',
    value: 'CA/MB/Eastman/Elma',
  },
  {
    label: 'Falcon Beach',
    value: 'CA/MB/Eastman/Falcon Beach',
  },
  {
    label: 'Fort Alexander',
    value: 'CA/MB/Eastman/Fort Alexander',
  },
  {
    label: 'Gardenton',
    value: 'CA/MB/Eastman/Gardenton',
  },
  {
    label: 'Giroux',
    value: 'CA/MB/Eastman/Giroux',
  },
  {
    label: 'Great Falls',
    value: 'CA/MB/Eastman/Great Falls',
  },
  {
    label: 'Green Ridge',
    value: 'CA/MB/Eastman/Green Ridge',
  },
  {
    label: 'Grunthal',
    value: 'CA/MB/Eastman/Grunthal',
  },
  {
    label: 'Hadashville',
    value: 'CA/MB/Eastman/Hadashville',
  },
  {
    label: 'Hazelridge',
    value: 'CA/MB/Eastman/Hazelridge',
  },
  {
    label: 'Ile Des Chenes',
    value: 'CA/MB/Eastman/Ile Des Chenes',
  },
  {
    label: 'Kleefeld',
    value: 'CA/MB/Eastman/Kleefeld',
  },
  {
    label: 'La Broquerie',
    value: 'CA/MB/Eastman/La Broquerie',
  },
  {
    label: 'Lac Du Bonnet',
    value: 'CA/MB/Eastman/Lac Du Bonnet',
  },
  {
    label: 'Landmark',
    value: 'CA/MB/Eastman/Landmark',
  },
  {
    label: 'Little Grand Rapids',
    value: 'CA/MB/Eastman/Little Grand Rapids',
  },
  {
    label: 'Manigotagan',
    value: 'CA/MB/Eastman/Manigotagan',
  },
  {
    label: 'Marchand',
    value: 'CA/MB/Eastman/Marchand',
  },
  {
    label: 'Menisino',
    value: 'CA/MB/Eastman/Menisino',
  },
  {
    label: 'Middlebro',
    value: 'CA/MB/Eastman/Middlebro',
  },
  {
    label: 'Mitchell',
    value: 'CA/MB/Eastman/Mitchell',
  },
  {
    label: 'Negginan',
    value: 'CA/MB/Eastman/Negginan',
  },
  {
    label: 'New Bothwell',
    value: 'CA/MB/Eastman/New Bothwell',
  },
  {
    label: 'Niverville',
    value: 'CA/MB/Eastman/Niverville',
  },
  {
    label: "O'hanly",
    value: "CA/MB/Eastman/O'hanly",
  },
  {
    label: 'Otterburne',
    value: 'CA/MB/Eastman/Otterburne',
  },
  {
    label: 'Overstoneville',
    value: 'CA/MB/Eastman/Overstoneville',
  },
  {
    label: 'Pansy',
    value: 'CA/MB/Eastman/Pansy',
  },
  {
    label: 'Pauingassi',
    value: 'CA/MB/Eastman/Pauingassi',
  },
  {
    label: 'Pinawa',
    value: 'CA/MB/Eastman/Pinawa',
  },
  {
    label: 'Pine Falls',
    value: 'CA/MB/Eastman/Pine Falls',
  },
  {
    label: 'Piney',
    value: 'CA/MB/Eastman/Piney',
  },
  {
    label: 'Pointe Du Bois',
    value: 'CA/MB/Eastman/Pointe Du Bois',
  },
  {
    label: 'Powerview',
    value: 'CA/MB/Eastman/Powerview',
  },
  {
    label: 'Randolph',
    value: 'CA/MB/Eastman/Randolph',
  },
  {
    label: 'Rennie',
    value: 'CA/MB/Eastman/Rennie',
  },
  {
    label: 'Richer',
    value: 'CA/MB/Eastman/Richer',
  },
  {
    label: 'Ridgeville',
    value: 'CA/MB/Eastman/Ridgeville',
  },
  {
    label: 'River Hills',
    value: 'CA/MB/Eastman/River Hills',
  },
  {
    label: 'Rosa',
    value: 'CA/MB/Eastman/Rosa',
  },
  {
    label: 'Roseau River',
    value: 'CA/MB/Eastman/Roseau River',
  },
  {
    label: 'Sandilands',
    value: 'CA/MB/Eastman/Sandilands',
  },
  {
    label: 'Sarto',
    value: 'CA/MB/Eastman/Sarto',
  },
  {
    label: 'Seddons Corner',
    value: 'CA/MB/Eastman/Seddons Corner',
  },
  {
    label: 'Seven Sisters Falls',
    value: 'CA/MB/Eastman/Seven Sisters Falls',
  },
  {
    label: 'South Junction',
    value: 'CA/MB/Eastman/South Junction',
  },
  {
    label: 'Sprague',
    value: 'CA/MB/Eastman/Sprague',
  },
  {
    label: 'St Adolphe',
    value: 'CA/MB/Eastman/St Adolphe',
  },
  {
    label: 'St Georges',
    value: 'CA/MB/Eastman/St Georges',
  },
  {
    label: 'St Malo',
    value: 'CA/MB/Eastman/St Malo',
  },
  {
    label: 'St Pierre Jolys',
    value: 'CA/MB/Eastman/St Pierre Jolys',
  },
  {
    label: 'Ste Anne',
    value: 'CA/MB/Eastman/Ste Anne',
  },
  {
    label: 'Stead',
    value: 'CA/MB/Eastman/Stead',
  },
  {
    label: 'Steinbach',
    value: 'CA/MB/Eastman/Steinbach',
  },
  {
    label: 'Stuartburn',
    value: 'CA/MB/Eastman/Stuartburn',
  },
  {
    label: 'Sundown',
    value: 'CA/MB/Eastman/Sundown',
  },
  {
    label: 'Tolstoi',
    value: 'CA/MB/Eastman/Tolstoi',
  },
  {
    label: 'Tourond',
    value: 'CA/MB/Eastman/Tourond',
  },
  {
    label: 'Traverse Bay',
    value: 'CA/MB/Eastman/Traverse Bay',
  },
  {
    label: 'Tyndall',
    value: 'CA/MB/Eastman/Tyndall',
  },
  {
    label: 'Vassar',
    value: 'CA/MB/Eastman/Vassar',
  },
  {
    label: 'Vita',
    value: 'CA/MB/Eastman/Vita',
  },
  {
    label: 'Wanipigow',
    value: 'CA/MB/Eastman/Wanipigow',
  },
  {
    label: 'Whitemouth',
    value: 'CA/MB/Eastman/Whitemouth',
  },
  {
    label: 'Whiteshell',
    value: 'CA/MB/Eastman/Whiteshell',
  },
  {
    label: 'Woodmore',
    value: 'CA/MB/Eastman/Woodmore',
  },
  {
    label: 'Woodridge',
    value: 'CA/MB/Eastman/Woodridge',
  },
  {
    label: 'Zhoda',
    value: 'CA/MB/Eastman/Zhoda',
  },
  {
    label: 'Arnaud',
    value: 'CA/MB/Emerson-Franklin/Arnaud',
  },
  {
    label: 'Dominion City',
    value: 'CA/MB/Emerson-Franklin/Dominion City',
  },
  {
    label: 'Emerson',
    value: 'CA/MB/Emerson-Franklin/Emerson',
  },
  {
    label: 'Ginew',
    value: 'CA/MB/Emerson-Franklin/Ginew',
  },
  {
    label: 'Roseau River Reserve',
    value: 'CA/MB/Emerson-Franklin/Roseau River Reserve',
  },
  {
    label: 'West Lynne',
    value: 'CA/MB/Emerson-Franklin/West Lynne',
  },
  {
    label: 'Woodmore',
    value: 'CA/MB/Emerson-Franklin/Woodmore',
  },
  {
    label: 'Ethelbert',
    value: 'CA/MB/Ethelbert/Ethelbert',
  },
  {
    label: 'Garland',
    value: 'CA/MB/Ethelbert/Garland',
  },
  {
    label: 'Flin Flon',
    value: 'CA/MB/Flin Flon/Flin Flon',
  },
  {
    label: 'Channing',
    value: 'CA/MB/Flin Flon/Channing',
  },
  {
    label: 'Cormorant',
    value: 'CA/MB/Flin Flon And North West/Cormorant',
  },
  {
    label: 'Cranberry Portage',
    value: 'CA/MB/Flin Flon And North West/Cranberry Portage',
  },
  {
    label: 'Easterville',
    value: 'CA/MB/Flin Flon And North West/Easterville',
  },
  {
    label: 'Flin Flon',
    value: 'CA/MB/Flin Flon And North West/Flin Flon',
  },
  {
    label: 'Grand Rapids',
    value: 'CA/MB/Flin Flon And North West/Grand Rapids',
  },
  {
    label: 'Moose Lake',
    value: 'CA/MB/Flin Flon And North West/Moose Lake',
  },
  {
    label: 'Sherridon',
    value: 'CA/MB/Flin Flon And North West/Sherridon',
  },
  {
    label: 'Snow Lake',
    value: 'CA/MB/Flin Flon And North West/Snow Lake',
  },
  {
    label: 'The Pas',
    value: 'CA/MB/Flin Flon And North West/The Pas',
  },
  {
    label: 'Wanless',
    value: 'CA/MB/Flin Flon And North West/Wanless',
  },
  {
    label: 'Ashville',
    value: 'CA/MB/Gilbert Plains/Ashville',
  },
  {
    label: 'Gillam',
    value: 'CA/MB/Gillam/Gillam',
  },
  {
    label: 'Glenboro',
    value: 'CA/MB/Glenboro-South Cypress/Glenboro',
  },
  {
    label: 'Stockton',
    value: 'CA/MB/Glenboro-South Cypress/Stockton',
  },
  {
    label: 'Arden',
    value: 'CA/MB/Glenella-Lansdowne/Arden',
  },
  {
    label: 'Glenella',
    value: 'CA/MB/Glenella-Lansdowne/Glenella',
  },
  {
    label: 'Waldersee',
    value: 'CA/MB/Glenella-Lansdowne/Waldersee',
  },
  {
    label: 'Grand Rapids',
    value: 'CA/MB/Grand Rapids/Grand Rapids',
  },
  {
    label: 'Grandview',
    value: 'CA/MB/Grandview/Grandview',
  },
  {
    label: 'Elgin',
    value: 'CA/MB/Grassland/Elgin',
  },
  {
    label: 'Fairfax',
    value: 'CA/MB/Grassland/Fairfax',
  },
  {
    label: 'Hartney',
    value: 'CA/MB/Grassland/Hartney',
  },
  {
    label: 'Lauder',
    value: 'CA/MB/Grassland/Lauder',
  },
  {
    label: 'Minto',
    value: 'CA/MB/Grassland/Minto',
  },
  {
    label: 'Decker',
    value: 'CA/MB/Hamiota/Decker',
  },
  {
    label: 'Hamiota',
    value: 'CA/MB/Hamiota/Hamiota',
  },
  {
    label: 'Newdale',
    value: 'CA/MB/Harrison Park/Newdale',
  },
  {
    label: 'Onanole',
    value: 'CA/MB/Harrison Park/Onanole',
  },
  {
    label: 'Rackham',
    value: 'CA/MB/Harrison Park/Rackham',
  },
  {
    label: 'Sandy Lake',
    value: 'CA/MB/Harrison Park/Sandy Lake',
  },
  {
    label: 'Berens River',
    value: 'CA/MB/Indigenous And Municipal Relations/Berens River',
  },
  {
    label: 'Bissett',
    value: 'CA/MB/Indigenous And Municipal Relations/Bissett',
  },
  {
    label: 'Bloodvein',
    value: 'CA/MB/Indigenous And Municipal Relations/Bloodvein',
  },
  {
    label: 'Bloodvein 12',
    value: 'CA/MB/Indigenous And Municipal Relations/Bloodvein 12',
  },
  {
    label: 'Arborg',
    value: 'CA/MB/Interlake/Arborg',
  },
  {
    label: 'Argyle',
    value: 'CA/MB/Interlake/Argyle',
  },
  {
    label: 'Arnes',
    value: 'CA/MB/Interlake/Arnes',
  },
  {
    label: 'Ashern',
    value: 'CA/MB/Interlake/Ashern',
  },
  {
    label: 'Balmoral',
    value: 'CA/MB/Interlake/Balmoral',
  },
  {
    label: 'Beaconia',
    value: 'CA/MB/Interlake/Beaconia',
  },
  {
    label: 'Belair',
    value: 'CA/MB/Interlake/Belair',
  },
  {
    label: 'Bloodvein',
    value: 'CA/MB/Interlake/Bloodvein',
  },
  {
    label: 'Broad Valley',
    value: 'CA/MB/Interlake/Broad Valley',
  },
  {
    label: 'Camp Morton',
    value: 'CA/MB/Interlake/Camp Morton',
  },
  {
    label: 'Chatfield',
    value: 'CA/MB/Interlake/Chatfield',
  },
  {
    label: 'Clandeboye',
    value: 'CA/MB/Interlake/Clandeboye',
  },
  {
    label: 'Dallas',
    value: 'CA/MB/Interlake/Dallas',
  },
  {
    label: 'East Selkirk',
    value: 'CA/MB/Interlake/East Selkirk',
  },
  {
    label: 'Eriksdale',
    value: 'CA/MB/Interlake/Eriksdale',
  },
  {
    label: 'Fairford',
    value: 'CA/MB/Interlake/Fairford',
  },
  {
    label: 'Faulkner',
    value: 'CA/MB/Interlake/Faulkner',
  },
  {
    label: 'Fisher Branch',
    value: 'CA/MB/Interlake/Fisher Branch',
  },
  {
    label: 'Fraserwood',
    value: 'CA/MB/Interlake/Fraserwood',
  },
  {
    label: 'Gimli',
    value: 'CA/MB/Interlake/Gimli',
  },
  {
    label: 'Grahamdale',
    value: 'CA/MB/Interlake/Grahamdale',
  },
  {
    label: 'Grand Marais',
    value: 'CA/MB/Interlake/Grand Marais',
  },
  {
    label: 'Grosse Isle',
    value: 'CA/MB/Interlake/Grosse Isle',
  },
  {
    label: 'Gunton',
    value: 'CA/MB/Interlake/Gunton',
  },
  {
    label: 'Gypsumville',
    value: 'CA/MB/Interlake/Gypsumville',
  },
  {
    label: 'Hilbre',
    value: 'CA/MB/Interlake/Hilbre',
  },
  {
    label: 'Hodgson',
    value: 'CA/MB/Interlake/Hodgson',
  },
  {
    label: 'Inwood',
    value: 'CA/MB/Interlake/Inwood',
  },
  {
    label: 'Komarno',
    value: 'CA/MB/Interlake/Komarno',
  },
  {
    label: 'Koostatak',
    value: 'CA/MB/Interlake/Koostatak',
  },
  {
    label: 'Lake Francis',
    value: 'CA/MB/Interlake/Lake Francis',
  },
  {
    label: 'Libau',
    value: 'CA/MB/Interlake/Libau',
  },
  {
    label: 'Little Bullhead',
    value: 'CA/MB/Interlake/Little Bullhead',
  },
  {
    label: 'Lockport',
    value: 'CA/MB/Interlake/Lockport',
  },
  {
    label: 'Lundar',
    value: 'CA/MB/Interlake/Lundar',
  },
  {
    label: 'Malonton',
    value: 'CA/MB/Interlake/Malonton',
  },
  {
    label: 'Marquette',
    value: 'CA/MB/Interlake/Marquette',
  },
  {
    label: 'Matheson Island',
    value: 'CA/MB/Interlake/Matheson Island',
  },
  {
    label: 'Matlock',
    value: 'CA/MB/Interlake/Matlock',
  },
  {
    label: 'Meleb',
    value: 'CA/MB/Interlake/Meleb',
  },
  {
    label: 'Moosehorn',
    value: 'CA/MB/Interlake/Moosehorn',
  },
  {
    label: 'Mulvihill',
    value: 'CA/MB/Interlake/Mulvihill',
  },
  {
    label: 'Narcisse',
    value: 'CA/MB/Interlake/Narcisse',
  },
  {
    label: 'Oak Point',
    value: 'CA/MB/Interlake/Oak Point',
  },
  {
    label: 'Oakview',
    value: 'CA/MB/Interlake/Oakview',
  },
  {
    label: 'Peguis',
    value: 'CA/MB/Interlake/Peguis',
  },
  {
    label: 'Petersfield',
    value: 'CA/MB/Interlake/Petersfield',
  },
  {
    label: 'Poplarfield',
    value: 'CA/MB/Interlake/Poplarfield',
  },
  {
    label: 'Princess Harbour',
    value: 'CA/MB/Interlake/Princess Harbour',
  },
  {
    label: 'Riverton',
    value: 'CA/MB/Interlake/Riverton',
  },
  {
    label: 'Rock Ridge',
    value: 'CA/MB/Interlake/Rock Ridge',
  },
  {
    label: 'Rosser',
    value: 'CA/MB/Interlake/Rosser',
  },
  {
    label: 'Sandy Hook',
    value: 'CA/MB/Interlake/Sandy Hook',
  },
  {
    label: 'Scanterbury',
    value: 'CA/MB/Interlake/Scanterbury',
  },
  {
    label: 'Selkirk',
    value: 'CA/MB/Interlake/Selkirk',
  },
  {
    label: 'Silver',
    value: 'CA/MB/Interlake/Silver',
  },
  {
    label: 'Skownan',
    value: 'CA/MB/Interlake/Skownan',
  },
  {
    label: 'St Andrews',
    value: 'CA/MB/Interlake/St Andrews',
  },
  {
    label: 'St Laurent',
    value: 'CA/MB/Interlake/St Laurent',
  },
  {
    label: 'St Martin',
    value: 'CA/MB/Interlake/St Martin',
  },
  {
    label: 'Steep Rock',
    value: 'CA/MB/Interlake/Steep Rock',
  },
  {
    label: 'Stonewall',
    value: 'CA/MB/Interlake/Stonewall',
  },
  {
    label: 'Stony Mountain',
    value: 'CA/MB/Interlake/Stony Mountain',
  },
  {
    label: 'Teulon',
    value: 'CA/MB/Interlake/Teulon',
  },
  {
    label: 'Victoria Beach',
    value: 'CA/MB/Interlake/Victoria Beach',
  },
  {
    label: 'Vogar',
    value: 'CA/MB/Interlake/Vogar',
  },
  {
    label: 'Warren',
    value: 'CA/MB/Interlake/Warren',
  },
  {
    label: 'Winnipeg Beach',
    value: 'CA/MB/Interlake/Winnipeg Beach',
  },
  {
    label: 'Woodlands',
    value: 'CA/MB/Interlake/Woodlands',
  },
  {
    label: 'Holmfield',
    value: 'CA/MB/Killarney-Turtle Mountain/Holmfield',
  },
  {
    label: 'Ninga',
    value: 'CA/MB/Killarney-Turtle Mountain/Ninga',
  },
  {
    label: 'Killarney',
    value: 'CA/MB/Killarney-Turtle Mountain/Killarney',
  },
  {
    label: 'Lac Du Bonnet',
    value: 'CA/MB/Lac Du Bonnet/Lac Du Bonnet',
  },
  {
    label: 'Leaf Rapids',
    value: 'CA/MB/Leaf Rapids/Leaf Rapids',
  },
  {
    label: 'Pinawa',
    value: 'CA/MB/Lgd Of Pinawa/Pinawa',
  },
  {
    label: 'Altamont',
    value: 'CA/MB/Lorne/Altamont',
  },
  {
    label: 'Bruxelles',
    value: 'CA/MB/Lorne/Bruxelles',
  },
  {
    label: 'Mariapolis',
    value: 'CA/MB/Lorne/Mariapolis',
  },
  {
    label: 'Notre-Dame-De-Lourdes',
    value: 'CA/MB/Lorne/Notre-Dame-De-Lourdes',
  },
  {
    label: 'Somerset',
    value: 'CA/MB/Lorne/Somerset',
  },
  {
    label: 'St. Alphonse',
    value: 'CA/MB/Lorne/St. Alphonse',
  },
  {
    label: 'St. Leon',
    value: 'CA/MB/Lorne/St. Leon',
  },
  {
    label: 'Swan Lake',
    value: 'CA/MB/Lorne/Swan Lake',
  },
  {
    label: 'Clearwater',
    value: 'CA/MB/Louise/Clearwater',
  },
  {
    label: 'Crystal City',
    value: 'CA/MB/Louise/Crystal City',
  },
  {
    label: 'Pilot Mound',
    value: 'CA/MB/Louise/Pilot Mound',
  },
  {
    label: 'Lynn Lake',
    value: 'CA/MB/Lynn Lake/Lynn Lake',
  },
  {
    label: 'Mccreary',
    value: 'CA/MB/Mccreary/Mccreary',
  },
  {
    label: 'Melita',
    value: 'CA/MB/Melita/Melita',
  },
  {
    label: 'Minitonas',
    value: 'CA/MB/Minitonas-Bowsman/Minitonas',
  },
  {
    label: 'Bowsman',
    value: 'CA/MB/Minitonas-Bowsman/Bowsman',
  },
  {
    label: 'Minnedosa',
    value: 'CA/MB/Minnedosa/Minnedosa',
  },
  {
    label: 'Morden',
    value: 'CA/MB/Morden/Morden',
  },
  {
    label: 'Morris',
    value: 'CA/MB/Morris/Morris',
  },
  {
    label: 'Boissevain',
    value: 'CA/MB/Morton-Boissevain/Boissevain',
  },
  {
    label: 'Winnipegosis',
    value: 'CA/MB/Mossey River/Winnipegosis',
  },
  {
    label: 'Neepawa',
    value: 'CA/MB/Neepawa/Neepawa',
  },
  {
    label: 'Niverville',
    value: 'CA/MB/Niverville/Niverville',
  },
  {
    label: 'Treherne',
    value: 'CA/MB/Norfolk Treherne/Treherne',
  },
  {
    label: 'Rathwell',
    value: 'CA/MB/Norfolk Treherne/Rathwell',
  },
  {
    label: 'Brookdale',
    value: 'CA/MB/North Cypress-Langford/Brookdale',
  },
  {
    label: 'Shilo',
    value: 'CA/MB/North Cypress-Langford/Shilo',
  },
  {
    label: 'Shilo, C.F.B.',
    value: 'CA/MB/North Cypress-Langford/Shilo, C.F.B.',
  },
  {
    label: 'Wellwood',
    value: 'CA/MB/North Cypress-Langford/Wellwood',
  },
  {
    label: 'Barrows',
    value: 'CA/MB/North East/Barrows',
  },
  {
    label: 'Berens River',
    value: 'CA/MB/North East/Berens River',
  },
  {
    label: 'Bissett',
    value: 'CA/MB/North East/Bissett',
  },
  {
    label: 'Camperville',
    value: 'CA/MB/North East/Camperville',
  },
  {
    label: 'Crane River',
    value: 'CA/MB/North East/Crane River',
  },
  {
    label: 'Duck Bay',
    value: 'CA/MB/North East/Duck Bay',
  },
  {
    label: 'Grand Marais',
    value: 'CA/MB/North East/Grand Marais',
  },
  {
    label: 'Lake Manitoba First Nation',
    value: 'CA/MB/North East/Lake Manitoba First Nation',
  },
  {
    label: 'Little Grand Rapids',
    value: 'CA/MB/North East/Little Grand Rapids',
  },
  {
    label: 'Manigotagan',
    value: 'CA/MB/North East/Manigotagan',
  },
  {
    label: 'Matheson Island',
    value: 'CA/MB/North East/Matheson Island',
  },
  {
    label: 'Peguis',
    value: 'CA/MB/North East/Peguis',
  },
  {
    label: 'Pelican Rapids',
    value: 'CA/MB/North East/Pelican Rapids',
  },
  {
    label: 'Waterhen',
    value: 'CA/MB/North East/Waterhen',
  },
  {
    label: 'Arborg',
    value: 'CA/MB/North Interlake/Arborg',
  },
  {
    label: 'Arnes',
    value: 'CA/MB/North Interlake/Arnes',
  },
  {
    label: 'Ashern',
    value: 'CA/MB/North Interlake/Ashern',
  },
  {
    label: 'Eriksdale',
    value: 'CA/MB/North Interlake/Eriksdale',
  },
  {
    label: 'Fairford',
    value: 'CA/MB/North Interlake/Fairford',
  },
  {
    label: 'Fisher Branch',
    value: 'CA/MB/North Interlake/Fisher Branch',
  },
  {
    label: 'Fraserwood',
    value: 'CA/MB/North Interlake/Fraserwood',
  },
  {
    label: 'Gimli',
    value: 'CA/MB/North Interlake/Gimli',
  },
  {
    label: 'Gypsumville',
    value: 'CA/MB/North Interlake/Gypsumville',
  },
  {
    label: 'Hilbre',
    value: 'CA/MB/North Interlake/Hilbre',
  },
  {
    label: 'Hodgson',
    value: 'CA/MB/North Interlake/Hodgson',
  },
  {
    label: 'Inwood',
    value: 'CA/MB/North Interlake/Inwood',
  },
  {
    label: 'Lundar',
    value: 'CA/MB/North Interlake/Lundar',
  },
  {
    label: 'Moosehorn',
    value: 'CA/MB/North Interlake/Moosehorn',
  },
  {
    label: 'Oakview',
    value: 'CA/MB/North Interlake/Oakview',
  },
  {
    label: 'Poplarfield',
    value: 'CA/MB/North Interlake/Poplarfield',
  },
  {
    label: 'Riverton',
    value: 'CA/MB/North Interlake/Riverton',
  },
  {
    label: 'Sandy Hook',
    value: 'CA/MB/North Interlake/Sandy Hook',
  },
  {
    label: 'St Laurent',
    value: 'CA/MB/North Interlake/St Laurent',
  },
  {
    label: 'St Martin',
    value: 'CA/MB/North Interlake/St Martin',
  },
  {
    label: 'Winnipeg Beach',
    value: 'CA/MB/North Interlake/Winnipeg Beach',
  },
  {
    label: 'Austin',
    value: 'CA/MB/North Norfolk/Austin',
  },
  {
    label: 'Bagot',
    value: 'CA/MB/North Norfolk/Bagot',
  },
  {
    label: 'Macgregor',
    value: 'CA/MB/North Norfolk/Macgregor',
  },
  {
    label: 'Rossendale',
    value: 'CA/MB/North Norfolk/Rossendale',
  },
  {
    label: 'Sidney',
    value: 'CA/MB/North Norfolk/Sidney',
  },
  {
    label: 'Brochet',
    value: 'CA/MB/Northern/Brochet',
  },
  {
    label: 'Channing',
    value: 'CA/MB/Northern/Channing',
  },
  {
    label: 'Churchill',
    value: 'CA/MB/Northern/Churchill',
  },
  {
    label: 'Cormorant',
    value: 'CA/MB/Northern/Cormorant',
  },
  {
    label: 'Cranberry Portage',
    value: 'CA/MB/Northern/Cranberry Portage',
  },
  {
    label: 'Cross Lake',
    value: 'CA/MB/Northern/Cross Lake',
  },
  {
    label: 'Easterville',
    value: 'CA/MB/Northern/Easterville',
  },
  {
    label: 'Flin Flon',
    value: 'CA/MB/Northern/Flin Flon',
  },
  {
    label: 'Gillam',
    value: 'CA/MB/Northern/Gillam',
  },
  {
    label: 'Gods Lake Narrows',
    value: 'CA/MB/Northern/Gods Lake Narrows',
  },
  {
    label: 'Gods River',
    value: 'CA/MB/Northern/Gods River',
  },
  {
    label: 'Grand Rapids',
    value: 'CA/MB/Northern/Grand Rapids',
  },
  {
    label: 'Granville Lake',
    value: 'CA/MB/Northern/Granville Lake',
  },
  {
    label: 'Ilford',
    value: 'CA/MB/Northern/Ilford',
  },
  {
    label: 'Island Lake',
    value: 'CA/MB/Northern/Island Lake',
  },
  {
    label: 'Lac Brochet',
    value: 'CA/MB/Northern/Lac Brochet',
  },
  {
    label: 'Leaf Rapids',
    value: 'CA/MB/Northern/Leaf Rapids',
  },
  {
    label: 'Lynn Lake',
    value: 'CA/MB/Northern/Lynn Lake',
  },
  {
    label: 'Moose Lake',
    value: 'CA/MB/Northern/Moose Lake',
  },
  {
    label: 'Nelson House',
    value: 'CA/MB/Northern/Nelson House',
  },
  {
    label: 'Norway House',
    value: 'CA/MB/Northern/Norway House',
  },
  {
    label: 'Opaskwayak',
    value: 'CA/MB/Northern/Opaskwayak',
  },
  {
    label: 'Oxford House',
    value: 'CA/MB/Northern/Oxford House',
  },
  {
    label: 'Pikwitonei',
    value: 'CA/MB/Northern/Pikwitonei',
  },
  {
    label: 'Pukatawagan',
    value: 'CA/MB/Northern/Pukatawagan',
  },
  {
    label: 'Red Sucker Lake',
    value: 'CA/MB/Northern/Red Sucker Lake',
  },
  {
    label: 'Shamattawa',
    value: 'CA/MB/Northern/Shamattawa',
  },
  {
    label: 'Sherridon',
    value: 'CA/MB/Northern/Sherridon',
  },
  {
    label: 'Snow Lake',
    value: 'CA/MB/Northern/Snow Lake',
  },
  {
    label: 'South Indian Lake',
    value: 'CA/MB/Northern/South Indian Lake',
  },
  {
    label: 'Split Lake',
    value: 'CA/MB/Northern/Split Lake',
  },
  {
    label: 'St Theresa Point',
    value: 'CA/MB/Northern/St Theresa Point',
  },
  {
    label: 'Stevenson Island',
    value: 'CA/MB/Northern/Stevenson Island',
  },
  {
    label: 'Tadoule Lake',
    value: 'CA/MB/Northern/Tadoule Lake',
  },
  {
    label: 'The Pas',
    value: 'CA/MB/Northern/The Pas',
  },
  {
    label: 'Thicket Portage',
    value: 'CA/MB/Northern/Thicket Portage',
  },
  {
    label: 'Thompson',
    value: 'CA/MB/Northern/Thompson',
  },
  {
    label: 'Waasagomach',
    value: 'CA/MB/Northern/Waasagomach',
  },
  {
    label: 'Wabowden',
    value: 'CA/MB/Northern/Wabowden',
  },
  {
    label: 'Wanless',
    value: 'CA/MB/Northern/Wanless',
  },
  {
    label: 'York Landing',
    value: 'CA/MB/Northern/York Landing',
  },
  {
    label: 'Carroll',
    value: 'CA/MB/Oakland-Wawanesa/Carroll',
  },
  {
    label: 'Nesbitt',
    value: 'CA/MB/Oakland-Wawanesa/Nesbitt',
  },
  {
    label: 'Wawanesa',
    value: 'CA/MB/Oakland-Wawanesa/Wawanesa',
  },
  {
    label: 'Angusville',
    value: 'CA/MB/Parkland/Angusville',
  },
  {
    label: 'Ashville',
    value: 'CA/MB/Parkland/Ashville',
  },
  {
    label: 'Barrows',
    value: 'CA/MB/Parkland/Barrows',
  },
  {
    label: 'Benito',
    value: 'CA/MB/Parkland/Benito',
  },
  {
    label: 'Binscarth',
    value: 'CA/MB/Parkland/Binscarth',
  },
  {
    label: 'Birch River',
    value: 'CA/MB/Parkland/Birch River',
  },
  {
    label: 'Boggy Creek',
    value: 'CA/MB/Parkland/Boggy Creek',
  },
  {
    label: 'Bowsman',
    value: 'CA/MB/Parkland/Bowsman',
  },
  {
    label: 'Camperville',
    value: 'CA/MB/Parkland/Camperville',
  },
  {
    label: 'Cayer',
    value: 'CA/MB/Parkland/Cayer',
  },
  {
    label: 'Cowan',
    value: 'CA/MB/Parkland/Cowan',
  },
  {
    label: 'Crane River',
    value: 'CA/MB/Parkland/Crane River',
  },
  {
    label: 'Dauphin',
    value: 'CA/MB/Parkland/Dauphin',
  },
  {
    label: 'Dropmore',
    value: 'CA/MB/Parkland/Dropmore',
  },
  {
    label: 'Duck Bay',
    value: 'CA/MB/Parkland/Duck Bay',
  },
  {
    label: 'Durban',
    value: 'CA/MB/Parkland/Durban',
  },
  {
    label: 'Ebb And Flow',
    value: 'CA/MB/Parkland/Ebb And Flow',
  },
  {
    label: 'Elphinstone',
    value: 'CA/MB/Parkland/Elphinstone',
  },
  {
    label: 'Erickson',
    value: 'CA/MB/Parkland/Erickson',
  },
  {
    label: 'Ethelbert',
    value: 'CA/MB/Parkland/Ethelbert',
  },
  {
    label: 'Fork River',
    value: 'CA/MB/Parkland/Fork River',
  },
  {
    label: 'Garland',
    value: 'CA/MB/Parkland/Garland',
  },
  {
    label: 'Gilbert Plains',
    value: 'CA/MB/Parkland/Gilbert Plains',
  },
  {
    label: 'Grandview',
    value: 'CA/MB/Parkland/Grandview',
  },
  {
    label: 'Inglis',
    value: 'CA/MB/Parkland/Inglis',
  },
  {
    label: 'Kelwood',
    value: 'CA/MB/Parkland/Kelwood',
  },
  {
    label: 'Kenville',
    value: 'CA/MB/Parkland/Kenville',
  },
  {
    label: 'Lake Audy',
    value: 'CA/MB/Parkland/Lake Audy',
  },
  {
    label: 'Laurier',
    value: 'CA/MB/Parkland/Laurier',
  },
  {
    label: 'Mafeking',
    value: 'CA/MB/Parkland/Mafeking',
  },
  {
    label: 'Makinak',
    value: 'CA/MB/Parkland/Makinak',
  },
  {
    label: 'Mccreary',
    value: 'CA/MB/Parkland/Mccreary',
  },
  {
    label: 'Meadow Portage',
    value: 'CA/MB/Parkland/Meadow Portage',
  },
  {
    label: 'Menzie',
    value: 'CA/MB/Parkland/Menzie',
  },
  {
    label: 'Minitonas',
    value: 'CA/MB/Parkland/Minitonas',
  },
  {
    label: 'Oakburn',
    value: 'CA/MB/Parkland/Oakburn',
  },
  {
    label: 'Ochre River',
    value: 'CA/MB/Parkland/Ochre River',
  },
  {
    label: 'Olha',
    value: 'CA/MB/Parkland/Olha',
  },
  {
    label: 'Onanole',
    value: 'CA/MB/Parkland/Onanole',
  },
  {
    label: 'Pelican Rapids',
    value: 'CA/MB/Parkland/Pelican Rapids',
  },
  {
    label: 'Pine River',
    value: 'CA/MB/Parkland/Pine River',
  },
  {
    label: 'Renwer',
    value: 'CA/MB/Parkland/Renwer',
  },
  {
    label: 'Riding Mountain',
    value: 'CA/MB/Parkland/Riding Mountain',
  },
  {
    label: 'Roblin',
    value: 'CA/MB/Parkland/Roblin',
  },
  {
    label: 'Rorketon',
    value: 'CA/MB/Parkland/Rorketon',
  },
  {
    label: 'Rossburn',
    value: 'CA/MB/Parkland/Rossburn',
  },
  {
    label: 'Russell',
    value: 'CA/MB/Parkland/Russell',
  },
  {
    label: 'San Clara',
    value: 'CA/MB/Parkland/San Clara',
  },
  {
    label: 'Shellmouth',
    value: 'CA/MB/Parkland/Shellmouth',
  },
  {
    label: 'Shortdale',
    value: 'CA/MB/Parkland/Shortdale',
  },
  {
    label: 'Sifton',
    value: 'CA/MB/Parkland/Sifton',
  },
  {
    label: 'Ste Rose Du Lac',
    value: 'CA/MB/Parkland/Ste Rose Du Lac',
  },
  {
    label: 'Swan River',
    value: 'CA/MB/Parkland/Swan River',
  },
  {
    label: 'Toutes Aides',
    value: 'CA/MB/Parkland/Toutes Aides',
  },
  {
    label: 'Valley River',
    value: 'CA/MB/Parkland/Valley River',
  },
  {
    label: 'Vista',
    value: 'CA/MB/Parkland/Vista',
  },
  {
    label: 'Wasagaming',
    value: 'CA/MB/Parkland/Wasagaming',
  },
  {
    label: 'Waterhen',
    value: 'CA/MB/Parkland/Waterhen',
  },
  {
    label: 'Waywayseecappo',
    value: 'CA/MB/Parkland/Waywayseecappo',
  },
  {
    label: 'Winnipegosis',
    value: 'CA/MB/Parkland/Winnipegosis',
  },
  {
    label: 'Darlingford',
    value: 'CA/MB/Pembina/Darlingford',
  },
  {
    label: 'La Rivière',
    value: 'CA/MB/Pembina/La Rivière',
  },
  {
    label: 'Manitou',
    value: 'CA/MB/Pembina/Manitou',
  },
  {
    label: 'Snowflake',
    value: 'CA/MB/Pembina/Snowflake',
  },
  {
    label: 'Altamont',
    value: 'CA/MB/Pembina Valley/Altamont',
  },
  {
    label: 'Altona',
    value: 'CA/MB/Pembina Valley/Altona',
  },
  {
    label: 'Blumenort',
    value: 'CA/MB/Pembina Valley/Blumenort',
  },
  {
    label: 'Brunkild',
    value: 'CA/MB/Pembina Valley/Brunkild',
  },
  {
    label: 'Bruxelles',
    value: 'CA/MB/Pembina Valley/Bruxelles',
  },
  {
    label: 'Carman',
    value: 'CA/MB/Pembina Valley/Carman',
  },
  {
    label: 'Cartwright',
    value: 'CA/MB/Pembina Valley/Cartwright',
  },
  {
    label: 'Darlingford',
    value: 'CA/MB/Pembina Valley/Darlingford',
  },
  {
    label: 'Domain',
    value: 'CA/MB/Pembina Valley/Domain',
  },
  {
    label: 'Elm Creek',
    value: 'CA/MB/Pembina Valley/Elm Creek',
  },
  {
    label: 'Emerson',
    value: 'CA/MB/Pembina Valley/Emerson',
  },
  {
    label: 'Fannystelle',
    value: 'CA/MB/Pembina Valley/Fannystelle',
  },
  {
    label: 'Ginew',
    value: 'CA/MB/Pembina Valley/Ginew',
  },
  {
    label: 'Glenlea',
    value: 'CA/MB/Pembina Valley/Glenlea',
  },
  {
    label: 'Graysville',
    value: 'CA/MB/Pembina Valley/Graysville',
  },
  {
    label: 'Gretna',
    value: 'CA/MB/Pembina Valley/Gretna',
  },
  {
    label: 'Halbstadt',
    value: 'CA/MB/Pembina Valley/Halbstadt',
  },
  {
    label: 'Haywood',
    value: 'CA/MB/Pembina Valley/Haywood',
  },
  {
    label: 'Homewood',
    value: 'CA/MB/Pembina Valley/Homewood',
  },
  {
    label: 'Horndean',
    value: 'CA/MB/Pembina Valley/Horndean',
  },
  {
    label: 'La Riviere',
    value: 'CA/MB/Pembina Valley/La Riviere',
  },
  {
    label: 'La Salle',
    value: 'CA/MB/Pembina Valley/La Salle',
  },
  {
    label: 'Letellier',
    value: 'CA/MB/Pembina Valley/Letellier',
  },
  {
    label: 'Lowe Farm',
    value: 'CA/MB/Pembina Valley/Lowe Farm',
  },
  {
    label: 'Manitou',
    value: 'CA/MB/Pembina Valley/Manitou',
  },
  {
    label: 'Mariapolis',
    value: 'CA/MB/Pembina Valley/Mariapolis',
  },
  {
    label: 'Miami',
    value: 'CA/MB/Pembina Valley/Miami',
  },
  {
    label: 'Morden',
    value: 'CA/MB/Pembina Valley/Morden',
  },
  {
    label: 'Morris',
    value: 'CA/MB/Pembina Valley/Morris',
  },
  {
    label: 'Oak Bluff',
    value: 'CA/MB/Pembina Valley/Oak Bluff',
  },
  {
    label: 'Plum Coulee',
    value: 'CA/MB/Pembina Valley/Plum Coulee',
  },
  {
    label: 'Reinfeld',
    value: 'CA/MB/Pembina Valley/Reinfeld',
  },
  {
    label: 'Roland',
    value: 'CA/MB/Pembina Valley/Roland',
  },
  {
    label: 'Roseisle',
    value: 'CA/MB/Pembina Valley/Roseisle',
  },
  {
    label: 'Rosenfeld',
    value: 'CA/MB/Pembina Valley/Rosenfeld',
  },
  {
    label: 'Rosenort',
    value: 'CA/MB/Pembina Valley/Rosenort',
  },
  {
    label: 'Sanford',
    value: 'CA/MB/Pembina Valley/Sanford',
  },
  {
    label: 'Schanzenfeld',
    value: 'CA/MB/Pembina Valley/Schanzenfeld',
  },
  {
    label: 'Snowflake',
    value: 'CA/MB/Pembina Valley/Snowflake',
  },
  {
    label: 'Somerset',
    value: 'CA/MB/Pembina Valley/Somerset',
  },
  {
    label: 'Sperling',
    value: 'CA/MB/Pembina Valley/Sperling',
  },
  {
    label: 'St Alphonse',
    value: 'CA/MB/Pembina Valley/St Alphonse',
  },
  {
    label: 'St Jean Baptiste',
    value: 'CA/MB/Pembina Valley/St Jean Baptiste',
  },
  {
    label: 'St Joseph',
    value: 'CA/MB/Pembina Valley/St Joseph',
  },
  {
    label: 'St Leon',
    value: 'CA/MB/Pembina Valley/St Leon',
  },
  {
    label: 'Starbuck',
    value: 'CA/MB/Pembina Valley/Starbuck',
  },
  {
    label: 'Ste Agathe',
    value: 'CA/MB/Pembina Valley/Ste Agathe',
  },
  {
    label: 'Stephenfield',
    value: 'CA/MB/Pembina Valley/Stephenfield',
  },
  {
    label: 'Swan Lake',
    value: 'CA/MB/Pembina Valley/Swan Lake',
  },
  {
    label: 'Thornhill',
    value: 'CA/MB/Pembina Valley/Thornhill',
  },
  {
    label: 'Winkler',
    value: 'CA/MB/Pembina Valley/Winkler',
  },
  {
    label: 'Altamont',
    value: 'CA/MB/Pilot Mound/Altamont',
  },
  {
    label: 'Baldur',
    value: 'CA/MB/Pilot Mound/Baldur',
  },
  {
    label: 'Cartwright',
    value: 'CA/MB/Pilot Mound/Cartwright',
  },
  {
    label: 'Crystal City',
    value: 'CA/MB/Pilot Mound/Crystal City',
  },
  {
    label: 'Darlingford',
    value: 'CA/MB/Pilot Mound/Darlingford',
  },
  {
    label: 'La Riviere',
    value: 'CA/MB/Pilot Mound/La Riviere',
  },
  {
    label: 'Manitou',
    value: 'CA/MB/Pilot Mound/Manitou',
  },
  {
    label: 'Mariapolis',
    value: 'CA/MB/Pilot Mound/Mariapolis',
  },
  {
    label: 'Mather',
    value: 'CA/MB/Pilot Mound/Mather',
  },
  {
    label: 'Pilot Mound',
    value: 'CA/MB/Pilot Mound/Pilot Mound',
  },
  {
    label: 'Swan Lake',
    value: 'CA/MB/Pilot Mound/Swan Lake',
  },
  {
    label: 'Edwin',
    value: 'CA/MB/Portage La Prairie/Edwin',
  },
  {
    label: 'Elm Creek',
    value: 'CA/MB/Portage La Prairie/Elm Creek',
  },
  {
    label: 'Fannystelle',
    value: 'CA/MB/Portage La Prairie/Fannystelle',
  },
  {
    label: 'Haywood',
    value: 'CA/MB/Portage La Prairie/Haywood',
  },
  {
    label: 'Newton Siding',
    value: 'CA/MB/Portage La Prairie/Newton Siding',
  },
  {
    label: 'Oakville',
    value: 'CA/MB/Portage La Prairie/Oakville',
  },
  {
    label: 'Portage La Prairie',
    value: 'CA/MB/Portage La Prairie/Portage La Prairie',
  },
  {
    label: 'Southport',
    value: 'CA/MB/Portage La Prairie/Southport',
  },
  {
    label: 'St Claude',
    value: 'CA/MB/Portage La Prairie/St Claude',
  },
  {
    label: 'Powerview-Pine Falls',
    value: 'CA/MB/Powerview-Pine Falls/Powerview-Pine Falls',
  },
  {
    label: 'Arrow River',
    value: 'CA/MB/Prairie View/Arrow River',
  },
  {
    label: 'Beulah',
    value: 'CA/MB/Prairie View/Beulah',
  },
  {
    label: 'Birtle',
    value: 'CA/MB/Prairie View/Birtle',
  },
  {
    label: 'Crandall',
    value: 'CA/MB/Prairie View/Crandall',
  },
  {
    label: 'Foxwarren',
    value: 'CA/MB/Prairie View/Foxwarren',
  },
  {
    label: 'Isabella',
    value: 'CA/MB/Prairie View/Isabella',
  },
  {
    label: 'Miniota',
    value: 'CA/MB/Prairie View/Miniota',
  },
  {
    label: 'Solsgirth',
    value: 'CA/MB/Prairie View/Solsgirth',
  },
  {
    label: 'Altbergthal',
    value: 'CA/MB/Rhineland/Altbergthal',
  },
  {
    label: 'Blumengart',
    value: 'CA/MB/Rhineland/Blumengart',
  },
  {
    label: 'Blumenort South',
    value: 'CA/MB/Rhineland/Blumenort South',
  },
  {
    label: 'Gnadenfeld',
    value: 'CA/MB/Rhineland/Gnadenfeld',
  },
  {
    label: 'Gnadenthal',
    value: 'CA/MB/Rhineland/Gnadenthal',
  },
  {
    label: 'Gretna',
    value: 'CA/MB/Rhineland/Gretna',
  },
  {
    label: 'Halbstadt',
    value: 'CA/MB/Rhineland/Halbstadt',
  },
  {
    label: 'Horndean',
    value: 'CA/MB/Rhineland/Horndean',
  },
  {
    label: 'Neubergthal',
    value: 'CA/MB/Rhineland/Neubergthal',
  },
  {
    label: 'Plum Coulee',
    value: 'CA/MB/Rhineland/Plum Coulee',
  },
  {
    label: 'Rosenfeld',
    value: 'CA/MB/Rhineland/Rosenfeld',
  },
  {
    label: 'Rosengart',
    value: 'CA/MB/Rhineland/Rosengart',
  },
  {
    label: 'Rosetown',
    value: 'CA/MB/Rhineland/Rosetown',
  },
  {
    label: 'Schoenwiese',
    value: 'CA/MB/Rhineland/Schoenwiese',
  },
  {
    label: 'Daly',
    value: 'CA/MB/Riverdale/Daly',
  },
  {
    label: 'Daly Beach',
    value: 'CA/MB/Riverdale/Daly Beach',
  },
  {
    label: 'Rivers',
    value: 'CA/MB/Riverdale/Rivers',
  },
  {
    label: 'Great Falls',
    value: 'CA/MB/Rm Of Alexander/Great Falls',
  },
  {
    label: 'Lester Beach',
    value: 'CA/MB/Rm Of Alexander/Lester Beach',
  },
  {
    label: 'St-Georges',
    value: 'CA/MB/Rm Of Alexander/St-Georges',
  },
  {
    label: 'Traverse Bay',
    value: 'CA/MB/Rm Of Alexander/Traverse Bay',
  },
  {
    label: 'Victoria Beach',
    value: 'CA/MB/Rm Of Alexander/Victoria Beach',
  },
  {
    label: 'White Mud Falls',
    value: 'CA/MB/Rm Of Alexander/White Mud Falls',
  },
  {
    label: 'Alonsa',
    value: 'CA/MB/Rm Of Alonsa/Alonsa',
  },
  {
    label: 'Amaranth',
    value: 'CA/MB/Rm Of Alonsa/Amaranth',
  },
  {
    label: 'Eddystone',
    value: 'CA/MB/Rm Of Alonsa/Eddystone',
  },
  {
    label: 'Harcus',
    value: 'CA/MB/Rm Of Alonsa/Harcus',
  },
  {
    label: 'Baldur',
    value: 'CA/MB/Rm Of Argyle/Baldur',
  },
  {
    label: 'Glenora',
    value: 'CA/MB/Rm Of Argyle/Glenora',
  },
  {
    label: 'Chatfield',
    value: 'CA/MB/Rm Of Armstrong/Chatfield',
  },
  {
    label: 'Fraserwood',
    value: 'CA/MB/Rm Of Armstrong/Fraserwood',
  },
  {
    label: 'Inwood',
    value: 'CA/MB/Rm Of Armstrong/Inwood',
  },
  {
    label: 'Malonton',
    value: 'CA/MB/Rm Of Armstrong/Malonton',
  },
  {
    label: 'Meleb',
    value: 'CA/MB/Rm Of Armstrong/Meleb',
  },
  {
    label: 'Narcisse',
    value: 'CA/MB/Rm Of Armstrong/Narcisse',
  },
  {
    label: 'Silver',
    value: 'CA/MB/Rm Of Armstrong/Silver',
  },
  {
    label: 'Garson',
    value: 'CA/MB/Rm Of Brokenhead/Garson',
  },
  {
    label: 'St. Ouens',
    value: 'CA/MB/Rm Of Brokenhead/St. Ouens',
  },
  {
    label: 'Tyndell',
    value: 'CA/MB/Rm Of Brokenhead/Tyndell',
  },
  {
    label: 'Elie',
    value: 'CA/MB/Rm Of Cartier/Elie',
  },
  {
    label: 'Springstein',
    value: 'CA/MB/Rm Of Cartier/Springstein',
  },
  {
    label: 'St. Eustache',
    value: 'CA/MB/Rm Of Cartier/St. Eustache',
  },
  {
    label: 'Lundar',
    value: 'CA/MB/Rm Of Coldwell/Lundar',
  },
  {
    label: 'Chater',
    value: 'CA/MB/Rm Of Cornwallis/Chater',
  },
  {
    label: 'Cottonwoods',
    value: 'CA/MB/Rm Of Cornwallis/Cottonwoods',
  },
  {
    label: 'Sprucewoods',
    value: 'CA/MB/Rm Of Cornwallis/Sprucewoods',
  },
  {
    label: 'Dauphin',
    value: 'CA/MB/Rm Of Dauphin/Dauphin',
  },
  {
    label: 'Dufrost',
    value: 'CA/MB/Rm Of De Salaberry/Dufrost',
  },
  {
    label: 'Otterburne',
    value: 'CA/MB/Rm Of De Salaberry/Otterburne',
  },
  {
    label: 'St. Malo',
    value: 'CA/MB/Rm Of De Salaberry/St. Malo',
  },
  {
    label: 'Graysville',
    value: 'CA/MB/Rm Of Dufferin/Graysville',
  },
  {
    label: 'Homewood',
    value: 'CA/MB/Rm Of Dufferin/Homewood',
  },
  {
    label: 'Roseisle',
    value: 'CA/MB/Rm Of Dufferin/Roseisle',
  },
  {
    label: 'Stephenfield',
    value: 'CA/MB/Rm Of Dufferin/Stephenfield',
  },
  {
    label: 'East St. Paul',
    value: 'CA/MB/Rm Of East St. Paul/East St. Paul',
  },
  {
    label: 'Manson',
    value: 'CA/MB/Rm Of Ellice-Archie/Manson',
  },
  {
    label: 'Mcauley',
    value: 'CA/MB/Rm Of Ellice-Archie/Mcauley',
  },
  {
    label: 'St-Lazare',
    value: 'CA/MB/Rm Of Ellice-Archie/St-Lazare',
  },
  {
    label: 'Douglas',
    value: 'CA/MB/Rm Of Elton/Douglas',
  },
  {
    label: 'Douglas Station',
    value: 'CA/MB/Rm Of Elton/Douglas Station',
  },
  {
    label: 'Forrest',
    value: 'CA/MB/Rm Of Elton/Forrest',
  },
  {
    label: 'Justice',
    value: 'CA/MB/Rm Of Elton/Justice',
  },
  {
    label: 'Broad Valley',
    value: 'CA/MB/Rm Of Fisher/Broad Valley',
  },
  {
    label: 'Hodgson',
    value: 'CA/MB/Rm Of Fisher/Hodgson',
  },
  {
    label: 'Poplarfield',
    value: 'CA/MB/Rm Of Fisher/Poplarfield',
  },
  {
    label: 'Arnes',
    value: 'CA/MB/Rm Of Gimli/Arnes',
  },
  {
    label: 'Camp Morton',
    value: 'CA/MB/Rm Of Gimli/Camp Morton',
  },
  {
    label: 'Gimli',
    value: 'CA/MB/Rm Of Gimli/Gimli',
  },
  {
    label: 'Sandy Hook',
    value: 'CA/MB/Rm Of Gimli/Sandy Hook',
  },
  {
    label: 'Grahamdale',
    value: 'CA/MB/Rm Of Grahamdale/Grahamdale',
  },
  {
    label: 'Hilbre',
    value: 'CA/MB/Rm Of Grahamdale/Hilbre',
  },
  {
    label: 'Moosehorn',
    value: 'CA/MB/Rm Of Grahamdale/Moosehorn',
  },
  {
    label: 'Mulvihill',
    value: 'CA/MB/Rm Of Grahamdale/Mulvihill',
  },
  {
    label: 'St. Martin',
    value: 'CA/MB/Rm Of Grahamdale/St. Martin',
  },
  {
    label: 'Elm Creek',
    value: 'CA/MB/Rm Of Grey/Elm Creek',
  },
  {
    label: 'Fannystelle',
    value: 'CA/MB/Rm Of Grey/Fannystelle',
  },
  {
    label: 'Haywood',
    value: 'CA/MB/Rm Of Grey/Haywood',
  },
  {
    label: 'St. Claude',
    value: 'CA/MB/Rm Of Grey/St. Claude',
  },
  {
    label: 'Blumenort',
    value: 'CA/MB/Rm Of Hanover/Blumenort',
  },
  {
    label: 'Grunthal',
    value: 'CA/MB/Rm Of Hanover/Grunthal',
  },
  {
    label: 'Kleefeld',
    value: 'CA/MB/Rm Of Hanover/Kleefeld',
  },
  {
    label: 'Mitchell',
    value: 'CA/MB/Rm Of Hanover/Mitchell',
  },
  {
    label: 'New Bothwell',
    value: 'CA/MB/Rm Of Hanover/New Bothwell',
  },
  {
    label: 'Sarto',
    value: 'CA/MB/Rm Of Hanover/Sarto',
  },
  {
    label: 'Tourond',
    value: 'CA/MB/Rm Of Hanover/Tourond',
  },
  {
    label: 'Headingley',
    value: 'CA/MB/Rm Of Headingley/Headingley',
  },
  {
    label: 'Hedingley',
    value: 'CA/MB/Rm Of Headingley/Hedingley',
  },
  {
    label: 'Cranberry Portage',
    value: 'CA/MB/Rm Of Kelsey/Cranberry Portage',
  },
  {
    label: 'La Broquerie',
    value: 'CA/MB/Rm Of La Broquerie/La Broquerie',
  },
  {
    label: 'Marchand',
    value: 'CA/MB/Rm Of La Broquerie/Marchand',
  },
  {
    label: 'Zhoda',
    value: 'CA/MB/Rm Of La Broquerie/Zhoda',
  },
  {
    label: 'Lac Du Bonnet',
    value: 'CA/MB/Rm Of Lac Du Bonnet/Lac Du Bonnet',
  },
  {
    label: 'Seddons Corner',
    value: 'CA/MB/Rm Of Lac Du Bonnet/Seddons Corner',
  },
  {
    label: 'Makinak',
    value: 'CA/MB/Rm Of Lakeshore/Makinak',
  },
  {
    label: 'Ochre River',
    value: 'CA/MB/Rm Of Lakeshore/Ochre River',
  },
  {
    label: 'Rorketon',
    value: 'CA/MB/Rm Of Lakeshore/Rorketon',
  },
  {
    label: 'Brunkild',
    value: 'CA/MB/Rm Of Macdonald/Brunkild',
  },
  {
    label: 'Domain',
    value: 'CA/MB/Rm Of Macdonald/Domain',
  },
  {
    label: 'La Salle',
    value: 'CA/MB/Rm Of Macdonald/La Salle',
  },
  {
    label: 'Oak Bluff',
    value: 'CA/MB/Rm Of Macdonald/Oak Bluff',
  },
  {
    label: 'Sanford',
    value: 'CA/MB/Rm Of Macdonald/Sanford',
  },
  {
    label: 'Starbuck',
    value: 'CA/MB/Rm Of Macdonald/Starbuck',
  },
  {
    label: 'Bethany',
    value: 'CA/MB/Rm Of Minto-Odanah/Bethany',
  },
  {
    label: 'Clanwilliam',
    value: 'CA/MB/Rm Of Minto-Odanah/Clanwilliam',
  },
  {
    label: 'Letellier',
    value: 'CA/MB/Rm Of Montcalm/Letellier',
  },
  {
    label: 'St. Jean Baptiste',
    value: 'CA/MB/Rm Of Montcalm/St. Jean Baptiste',
  },
  {
    label: 'St. Joseph',
    value: 'CA/MB/Rm Of Montcalm/St. Joseph',
  },
  {
    label: 'Ste. Agathe',
    value: 'CA/MB/Rm Of Montcalm/Ste. Agathe',
  },
  {
    label: 'Aubigny',
    value: 'CA/MB/Rm Of Morris/Aubigny',
  },
  {
    label: 'Lowe Farm',
    value: 'CA/MB/Rm Of Morris/Lowe Farm',
  },
  {
    label: 'Morris',
    value: 'CA/MB/Rm Of Morris/Morris',
  },
  {
    label: 'Rosenort',
    value: 'CA/MB/Rm Of Morris/Rosenort',
  },
  {
    label: 'Sperling',
    value: 'CA/MB/Rm Of Morris/Sperling',
  },
  {
    label: 'Birch River',
    value: 'CA/MB/Rm Of Mountain/Birch River',
  },
  {
    label: 'Cowan',
    value: 'CA/MB/Rm Of Mountain/Cowan',
  },
  {
    label: 'Mafeking',
    value: 'CA/MB/Rm Of Mountain/Mafeking',
  },
  {
    label: 'Oak River',
    value: 'CA/MB/Rm Of Oakview/Oak River',
  },
  {
    label: 'Rapid City',
    value: 'CA/MB/Rm Of Oakview/Rapid City',
  },
  {
    label: 'Menisino',
    value: 'CA/MB/Rm Of Piney/Menisino',
  },
  {
    label: 'Middlebro',
    value: 'CA/MB/Rm Of Piney/Middlebro',
  },
  {
    label: 'Piney',
    value: 'CA/MB/Rm Of Piney/Piney',
  },
  {
    label: 'Sandilands',
    value: 'CA/MB/Rm Of Piney/Sandilands',
  },
  {
    label: 'Sprague',
    value: 'CA/MB/Rm Of Piney/Sprague',
  },
  {
    label: 'Vassar',
    value: 'CA/MB/Rm Of Piney/Vassar',
  },
  {
    label: 'Woodridge',
    value: 'CA/MB/Rm Of Piney/Woodridge',
  },
  {
    label: 'Cromer',
    value: 'CA/MB/Rm Of Pipestone/Cromer',
  },
  {
    label: 'Pipestone',
    value: 'CA/MB/Rm Of Pipestone/Pipestone',
  },
  {
    label: 'Reston',
    value: 'CA/MB/Rm Of Pipestone/Reston',
  },
  {
    label: 'Sinclair',
    value: 'CA/MB/Rm Of Pipestone/Sinclair',
  },
  {
    label: 'Edwin',
    value: 'CA/MB/Rm Of Portage La Prairie/Edwin',
  },
  {
    label: 'Fort La Reine',
    value: 'CA/MB/Rm Of Portage La Prairie/Fort La Reine',
  },
  {
    label: 'High Bluff',
    value: 'CA/MB/Rm Of Portage La Prairie/High Bluff',
  },
  {
    label: 'Macdonald',
    value: 'CA/MB/Rm Of Portage La Prairie/Macdonald',
  },
  {
    label: 'Newton',
    value: 'CA/MB/Rm Of Portage La Prairie/Newton',
  },
  {
    label: 'Oakville',
    value: 'CA/MB/Rm Of Portage La Prairie/Oakville',
  },
  {
    label: 'Portage La Prairie',
    value: 'CA/MB/Rm Of Portage La Prairie/Portage La Prairie',
  },
  {
    label: 'Southport',
    value: 'CA/MB/Rm Of Portage La Prairie/Southport',
  },
  {
    label: 'St. Ambroise',
    value: 'CA/MB/Rm Of Portage La Prairie/St. Ambroise',
  },
  {
    label: 'Belmont',
    value: 'CA/MB/Rm Of Prairie Lakes/Belmont',
  },
  {
    label: 'Dunrea',
    value: 'CA/MB/Rm Of Prairie Lakes/Dunrea',
  },
  {
    label: 'Margaret',
    value: 'CA/MB/Rm Of Prairie Lakes/Margaret',
  },
  {
    label: 'Ninette',
    value: 'CA/MB/Rm Of Prairie Lakes/Ninette',
  },
  {
    label: 'East Braintree',
    value: 'CA/MB/Rm Of Reynolds/East Braintree',
  },
  {
    label: 'Hadashville',
    value: 'CA/MB/Rm Of Reynolds/Hadashville',
  },
  {
    label: 'Rennie',
    value: 'CA/MB/Rm Of Reynolds/Rennie',
  },
  {
    label: 'Angusville',
    value: 'CA/MB/Rm Of Riding Mountain West/Angusville',
  },
  {
    label: 'Dropmore',
    value: 'CA/MB/Rm Of Riding Mountain West/Dropmore',
  },
  {
    label: 'Inglis',
    value: 'CA/MB/Rm Of Riding Mountain West/Inglis',
  },
  {
    label: 'Shellmouth',
    value: 'CA/MB/Rm Of Riding Mountain West/Shellmouth',
  },
  {
    label: 'Glenlea',
    value: 'CA/MB/Rm Of Ritchot/Glenlea',
  },
  {
    label: 'Ile Des Chênes',
    value: 'CA/MB/Rm Of Ritchot/Ile Des Chênes',
  },
  {
    label: 'St. Adolphe',
    value: 'CA/MB/Rm Of Ritchot/St. Adolphe',
  },
  {
    label: 'St. Germain South',
    value: 'CA/MB/Rm Of Ritchot/St. Germain South',
  },
  {
    label: 'Ste. Agathe',
    value: 'CA/MB/Rm Of Ritchot/Ste. Agathe',
  },
  {
    label: 'Argyle',
    value: 'CA/MB/Rm Of Rockwood/Argyle',
  },
  {
    label: 'Balmoral',
    value: 'CA/MB/Rm Of Rockwood/Balmoral',
  },
  {
    label: 'Gunton',
    value: 'CA/MB/Rm Of Rockwood/Gunton',
  },
  {
    label: 'Komarno',
    value: 'CA/MB/Rm Of Rockwood/Komarno',
  },
  {
    label: 'Roland',
    value: 'CA/MB/Rm Of Roland/Roland',
  },
  {
    label: 'Birnie',
    value: 'CA/MB/Rm Of Rosedale/Birnie',
  },
  {
    label: 'Eden',
    value: 'CA/MB/Rm Of Rosedale/Eden',
  },
  {
    label: 'Franklin',
    value: 'CA/MB/Rm Of Rosedale/Franklin',
  },
  {
    label: 'Kelwood',
    value: 'CA/MB/Rm Of Rosedale/Kelwood',
  },
  {
    label: 'Polonia',
    value: 'CA/MB/Rm Of Rosedale/Polonia',
  },
  {
    label: 'Riding Mountain',
    value: 'CA/MB/Rm Of Rosedale/Riding Mountain',
  },
  {
    label: 'Grosse Isle',
    value: 'CA/MB/Rm Of Rosser/Grosse Isle',
  },
  {
    label: 'Rosser',
    value: 'CA/MB/Rm Of Rosser/Rosser',
  },
  {
    label: 'Deleau',
    value: 'CA/MB/Rm Of Sifton/Deleau',
  },
  {
    label: 'Griswold',
    value: 'CA/MB/Rm Of Sifton/Griswold',
  },
  {
    label: 'Oak Lake',
    value: 'CA/MB/Rm Of Sifton/Oak Lake',
  },
  {
    label: 'Anola',
    value: 'CA/MB/Rm Of Springfield/Anola',
  },
  {
    label: 'Deacon',
    value: 'CA/MB/Rm Of Springfield/Deacon',
  },
  {
    label: 'Deacons Corner',
    value: 'CA/MB/Rm Of Springfield/Deacons Corner',
  },
  {
    label: 'Dugald',
    value: 'CA/MB/Rm Of Springfield/Dugald',
  },
  {
    label: 'Hazelridge',
    value: 'CA/MB/Rm Of Springfield/Hazelridge',
  },
  {
    label: 'Oakbank',
    value: 'CA/MB/Rm Of Springfield/Oakbank',
  },
  {
    label: 'Clandeboye',
    value: 'CA/MB/Rm Of St. Andrews/Clandeboye',
  },
  {
    label: 'Lockport',
    value: 'CA/MB/Rm Of St. Andrews/Lockport',
  },
  {
    label: 'Matlock',
    value: 'CA/MB/Rm Of St. Andrews/Matlock',
  },
  {
    label: 'Petersfield',
    value: 'CA/MB/Rm Of St. Andrews/Petersfield',
  },
  {
    label: 'St. Andrews',
    value: 'CA/MB/Rm Of St. Andrews/St. Andrews',
  },
  {
    label: 'Brokenhead Reserve',
    value: 'CA/MB/Rm Of St. Clements/Brokenhead Reserve',
  },
  {
    label: 'East Selkirk',
    value: 'CA/MB/Rm Of St. Clements/East Selkirk',
  },
  {
    label: 'Gonor',
    value: 'CA/MB/Rm Of St. Clements/Gonor',
  },
  {
    label: 'Grand Marais',
    value: 'CA/MB/Rm Of St. Clements/Grand Marais',
  },
  {
    label: 'Libau',
    value: 'CA/MB/Rm Of St. Clements/Libau',
  },
  {
    label: 'Narol',
    value: 'CA/MB/Rm Of St. Clements/Narol',
  },
  {
    label: 'Scanterbury',
    value: 'CA/MB/Rm Of St. Clements/Scanterbury',
  },
  {
    label: 'St. François Xavier',
    value: 'CA/MB/Rm Of St. François Xavier/St. François Xavier',
  },
  {
    label: 'Oak Point',
    value: 'CA/MB/Rm Of St. Laurent/Oak Point',
  },
  {
    label: 'St. Laurent',
    value: 'CA/MB/Rm Of St. Laurent/St. Laurent',
  },
  {
    label: 'Blumenfeld',
    value: 'CA/MB/Rm Of Stanley/Blumenfeld',
  },
  {
    label: 'Hochfeld',
    value: 'CA/MB/Rm Of Stanley/Hochfeld',
  },
  {
    label: 'Neuenburg',
    value: 'CA/MB/Rm Of Stanley/Neuenburg',
  },
  {
    label: 'Osterwick',
    value: 'CA/MB/Rm Of Stanley/Osterwick',
  },
  {
    label: 'Reinfeld',
    value: 'CA/MB/Rm Of Stanley/Reinfeld',
  },
  {
    label: 'Schanzenfeld',
    value: 'CA/MB/Rm Of Stanley/Schanzenfeld',
  },
  {
    label: 'Thornhill',
    value: 'CA/MB/Rm Of Stanley/Thornhill',
  },
  {
    label: 'Richer',
    value: 'CA/MB/Rm Of Ste. Anne/Richer',
  },
  {
    label: 'Ste. Anne',
    value: 'CA/MB/Rm Of Ste. Anne/Ste. Anne',
  },
  {
    label: 'Gardenton',
    value: 'CA/MB/Rm Of Stuartburn/Gardenton',
  },
  {
    label: 'Stuartburn',
    value: 'CA/MB/Rm Of Stuartburn/Stuartburn',
  },
  {
    label: 'Sundown',
    value: 'CA/MB/Rm Of Stuartburn/Sundown',
  },
  {
    label: 'Vita',
    value: 'CA/MB/Rm Of Stuartburn/Vita',
  },
  {
    label: 'Dufresne',
    value: 'CA/MB/Rm Of Taché/Dufresne',
  },
  {
    label: 'Landmark',
    value: 'CA/MB/Rm Of Taché/Landmark',
  },
  {
    label: 'Lorette',
    value: 'CA/MB/Rm Of Taché/Lorette',
  },
  {
    label: 'Miami',
    value: 'CA/MB/Rm Of Thompson/Miami',
  },
  {
    label: 'Holland',
    value: 'CA/MB/Rm Of Victoria/Holland',
  },
  {
    label: 'Cypress River',
    value: 'CA/MB/Rm Of Victoria/Cypress River',
  },
  {
    label: 'Victoria Beach',
    value: 'CA/MB/Rm Of Victoria Beach/Victoria Beach',
  },
  {
    label: 'Elkhorn',
    value: 'CA/MB/Rm Of Wallace-Woodworth/Elkhorn',
  },
  {
    label: 'Harding',
    value: 'CA/MB/Rm Of Wallace-Woodworth/Harding',
  },
  {
    label: 'Hargrave',
    value: 'CA/MB/Rm Of Wallace-Woodworth/Hargrave',
  },
  {
    label: 'Kenton',
    value: 'CA/MB/Rm Of Wallace-Woodworth/Kenton',
  },
  {
    label: 'Kola',
    value: 'CA/MB/Rm Of Wallace-Woodworth/Kola',
  },
  {
    label: 'Lenore',
    value: 'CA/MB/Rm Of Wallace-Woodworth/Lenore',
  },
  {
    label: 'Ashern',
    value: 'CA/MB/Rm Of West Interlake/Ashern',
  },
  {
    label: 'Eriksdale',
    value: 'CA/MB/Rm Of West Interlake/Eriksdale',
  },
  {
    label: 'West St. Paul',
    value: 'CA/MB/Rm Of West St. Paul/West St. Paul',
  },
  {
    label: 'Alexander',
    value: 'CA/MB/Rm Of Whitehead/Alexander',
  },
  {
    label: 'Elma',
    value: 'CA/MB/Rm Of Whitemouth/Elma',
  },
  {
    label: 'River Hills',
    value: 'CA/MB/Rm Of Whitemouth/River Hills',
  },
  {
    label: 'Seven Sisters Falls',
    value: 'CA/MB/Rm Of Whitemouth/Seven Sisters Falls',
  },
  {
    label: 'Whitemouth',
    value: 'CA/MB/Rm Of Whitemouth/Whitemouth',
  },
  {
    label: 'Marquette',
    value: 'CA/MB/Rm Of Woodlands/Marquette',
  },
  {
    label: 'Warren',
    value: 'CA/MB/Rm Of Woodlands/Warren',
  },
  {
    label: 'Woodlands',
    value: 'CA/MB/Rm Of Woodlands/Woodlands',
  },
  {
    label: 'Elphinstone',
    value: 'CA/MB/Rm Of Yellowhead/Elphinstone',
  },
  {
    label: 'Menzie',
    value: 'CA/MB/Rm Of Yellowhead/Menzie',
  },
  {
    label: 'Oakburn',
    value: 'CA/MB/Rm Of Yellowhead/Oakburn',
  },
  {
    label: 'Shoal Lake',
    value: 'CA/MB/Rm Of Yellowhead/Shoal Lake',
  },
  {
    label: 'Strathclair',
    value: 'CA/MB/Rm Of Yellowhead/Strathclair',
  },
  {
    label: 'Robin',
    value: 'CA/MB/Roblin/Robin',
  },
  {
    label: 'San Clara',
    value: 'CA/MB/Roblin/San Clara',
  },
  {
    label: 'Angusville',
    value: 'CA/MB/Roblin, Russell, Rossburn/Angusville',
  },
  {
    label: 'Binscarth',
    value: 'CA/MB/Roblin, Russell, Rossburn/Binscarth',
  },
  {
    label: 'Roblin',
    value: 'CA/MB/Roblin, Russell, Rossburn/Roblin',
  },
  {
    label: 'Rossburn',
    value: 'CA/MB/Roblin, Russell, Rossburn/Rossburn',
  },
  {
    label: 'Russell',
    value: 'CA/MB/Roblin, Russell, Rossburn/Russell',
  },
  {
    label: 'San Clara',
    value: 'CA/MB/Roblin, Russell, Rossburn/San Clara',
  },
  {
    label: 'Waywayseecappo',
    value: 'CA/MB/Roblin, Russell, Rossburn/Waywayseecappo',
  },
  {
    label: 'Rossburn',
    value: 'CA/MB/Rossburn/Rossburn',
  },
  {
    label: 'Russell',
    value: 'CA/MB/Russell-Binscarth/Russell',
  },
  {
    label: 'Binscarth',
    value: 'CA/MB/Russell-Binscarth/Binscarth',
  },
  {
    label: 'Clandeboye',
    value: 'CA/MB/Selkirk/Clandeboye',
  },
  {
    label: 'East Selkirk',
    value: 'CA/MB/Selkirk/East Selkirk',
  },
  {
    label: 'East St Paul',
    value: 'CA/MB/Selkirk/East St Paul',
  },
  {
    label: 'Gonor',
    value: 'CA/MB/Selkirk/Gonor',
  },
  {
    label: 'Libau',
    value: 'CA/MB/Selkirk/Libau',
  },
  {
    label: 'Lockport',
    value: 'CA/MB/Selkirk/Lockport',
  },
  {
    label: 'Narol',
    value: 'CA/MB/Selkirk/Narol',
  },
  {
    label: 'Selkirk',
    value: 'CA/MB/Selkirk/Selkirk',
  },
  {
    label: 'St Andrews',
    value: 'CA/MB/Selkirk/St Andrews',
  },
  {
    label: 'West St Paul',
    value: 'CA/MB/Selkirk/West St Paul',
  },
  {
    label: 'Snow Lake',
    value: 'CA/MB/Snow Lake/Snow Lake',
  },
  {
    label: 'Souris',
    value: 'CA/MB/Souris-Glenwood/Souris',
  },
  {
    label: 'Glenwood',
    value: 'CA/MB/Souris-Glenwood/Glenwood',
  },
  {
    label: 'Argyle',
    value: 'CA/MB/South Interlake/Argyle',
  },
  {
    label: 'Balmoral',
    value: 'CA/MB/South Interlake/Balmoral',
  },
  {
    label: 'Gunton',
    value: 'CA/MB/South Interlake/Gunton',
  },
  {
    label: 'Komarno',
    value: 'CA/MB/South Interlake/Komarno',
  },
  {
    label: 'Rosser',
    value: 'CA/MB/South Interlake/Rosser',
  },
  {
    label: 'Stonewall',
    value: 'CA/MB/South Interlake/Stonewall',
  },
  {
    label: 'Stony Mountain',
    value: 'CA/MB/South Interlake/Stony Mountain',
  },
  {
    label: 'Teulon',
    value: 'CA/MB/South Interlake/Teulon',
  },
  {
    label: 'Warren',
    value: 'CA/MB/South Interlake/Warren',
  },
  {
    label: 'Woodlands',
    value: 'CA/MB/South Interlake/Woodlands',
  },
  {
    label: 'Belmont',
    value: 'CA/MB/South West/Belmont',
  },
  {
    label: 'Boissevain',
    value: 'CA/MB/South West/Boissevain',
  },
  {
    label: 'Deloraine',
    value: 'CA/MB/South West/Deloraine',
  },
  {
    label: 'Dunrea',
    value: 'CA/MB/South West/Dunrea',
  },
  {
    label: 'Hartney',
    value: 'CA/MB/South West/Hartney',
  },
  {
    label: 'Killarney',
    value: 'CA/MB/South West/Killarney',
  },
  {
    label: 'Medora',
    value: 'CA/MB/South West/Medora',
  },
  {
    label: 'Melita',
    value: 'CA/MB/South West/Melita',
  },
  {
    label: 'Minto',
    value: 'CA/MB/South West/Minto',
  },
  {
    label: 'Ninette',
    value: 'CA/MB/South West/Ninette',
  },
  {
    label: 'Pierson',
    value: 'CA/MB/South West/Pierson',
  },
  {
    label: 'Waskada',
    value: 'CA/MB/South West/Waskada',
  },
  {
    label: 'Laurier',
    value: 'CA/MB/Ste. Rose/Laurier',
  },
  {
    label: 'Arnaud',
    value: 'CA/MB/Steinbach/Arnaud',
  },
  {
    label: 'Blumenort',
    value: 'CA/MB/Steinbach/Blumenort',
  },
  {
    label: 'Dominion City',
    value: 'CA/MB/Steinbach/Dominion City',
  },
  {
    label: 'Glenlea',
    value: 'CA/MB/Steinbach/Glenlea',
  },
  {
    label: 'Grunthal',
    value: 'CA/MB/Steinbach/Grunthal',
  },
  {
    label: 'Ile Des Chenes',
    value: 'CA/MB/Steinbach/Ile Des Chenes',
  },
  {
    label: 'La Broquerie',
    value: 'CA/MB/Steinbach/La Broquerie',
  },
  {
    label: 'Landmark',
    value: 'CA/MB/Steinbach/Landmark',
  },
  {
    label: 'Lorette',
    value: 'CA/MB/Steinbach/Lorette',
  },
  {
    label: 'Marchand',
    value: 'CA/MB/Steinbach/Marchand',
  },
  {
    label: 'Mitchell',
    value: 'CA/MB/Steinbach/Mitchell',
  },
  {
    label: 'New Bothwell',
    value: 'CA/MB/Steinbach/New Bothwell',
  },
  {
    label: 'Niverville',
    value: 'CA/MB/Steinbach/Niverville',
  },
  {
    label: 'Otterburne',
    value: 'CA/MB/Steinbach/Otterburne',
  },
  {
    label: 'Pansy',
    value: 'CA/MB/Steinbach/Pansy',
  },
  {
    label: 'Richer',
    value: 'CA/MB/Steinbach/Richer',
  },
  {
    label: 'Ridgeville',
    value: 'CA/MB/Steinbach/Ridgeville',
  },
  {
    label: 'Roseau River',
    value: 'CA/MB/Steinbach/Roseau River',
  },
  {
    label: 'St Adolphe',
    value: 'CA/MB/Steinbach/St Adolphe',
  },
  {
    label: 'St Malo',
    value: 'CA/MB/Steinbach/St Malo',
  },
  {
    label: 'St Pierre Jolys',
    value: 'CA/MB/Steinbach/St Pierre Jolys',
  },
  {
    label: 'Ste Agathe',
    value: 'CA/MB/Steinbach/Ste Agathe',
  },
  {
    label: 'Ste Anne',
    value: 'CA/MB/Steinbach/Ste Anne',
  },
  {
    label: 'Steinbach',
    value: 'CA/MB/Steinbach/Steinbach',
  },
  {
    label: 'Tourond',
    value: 'CA/MB/Steinbach/Tourond',
  },
  {
    label: 'Woodmore',
    value: 'CA/MB/Steinbach/Woodmore',
  },
  {
    label: 'Stonewall',
    value: 'CA/MB/Stonewall/Stonewall',
  },
  {
    label: 'Benito',
    value: 'CA/MB/Swan River/Benito',
  },
  {
    label: 'Birch River',
    value: 'CA/MB/Swan River/Birch River',
  },
  {
    label: 'Bowsman',
    value: 'CA/MB/Swan River/Bowsman',
  },
  {
    label: 'Cowan',
    value: 'CA/MB/Swan River/Cowan',
  },
  {
    label: 'Kenville',
    value: 'CA/MB/Swan River/Kenville',
  },
  {
    label: 'Mafeking',
    value: 'CA/MB/Swan River/Mafeking',
  },
  {
    label: 'Minitonas',
    value: 'CA/MB/Swan River/Minitonas',
  },
  {
    label: 'Pine River',
    value: 'CA/MB/Swan River/Pine River',
  },
  {
    label: 'Swan River',
    value: 'CA/MB/Swan River/Swan River',
  },
  {
    label: 'Benito',
    value: 'CA/MB/Swan Valley West/Benito',
  },
  {
    label: 'Durban',
    value: 'CA/MB/Swan Valley West/Durban',
  },
  {
    label: 'Kenville',
    value: 'CA/MB/Swan Valley West/Kenville',
  },
  {
    label: 'Teulon',
    value: 'CA/MB/Teulon/Teulon',
  },
  {
    label: 'The Pas',
    value: 'CA/MB/The Pas/The Pas',
  },
  {
    label: 'Thompson',
    value: 'CA/MB/Thompson/Thompson',
  },
  {
    label: 'God Lake Narrows',
    value: 'CA/MB/Thompson And North Central/God Lake Narrows',
  },
  {
    label: 'Gods River',
    value: 'CA/MB/Thompson And North Central/Gods River',
  },
  {
    label: 'Nelson House',
    value: 'CA/MB/Thompson And North Central/Nelson House',
  },
  {
    label: 'Norway House',
    value: 'CA/MB/Thompson And North Central/Norway House',
  },
  {
    label: 'St  Theresa Point',
    value: 'CA/MB/Thompson And North Central/St  Theresa Point',
  },
  {
    label: 'Stevenson Island',
    value: 'CA/MB/Thompson And North Central/Stevenson Island',
  },
  {
    label: 'Thompson',
    value: 'CA/MB/Thompson And North Central/Thompson',
  },
  {
    label: 'Wabowden',
    value: 'CA/MB/Thompson And North Central/Wabowden',
  },
  {
    label: 'Elva',
    value: 'CA/MB/Two Borders/Elva',
  },
  {
    label: 'Lyleton',
    value: 'CA/MB/Two Borders/Lyleton',
  },
  {
    label: 'Pierson',
    value: 'CA/MB/Two Borders/Pierson',
  },
  {
    label: 'Tilston',
    value: 'CA/MB/Two Borders/Tilston',
  },
  {
    label: 'Whytewold',
    value: 'CA/MB/Village Of Dunnottar/Whytewold',
  },
  {
    label: 'St. Pierre-Jolys',
    value: 'CA/MB/Village Of St. Pierre-Jolys/St. Pierre-Jolys',
  },
  {
    label: 'Cromer',
    value: 'CA/MB/Virden/Cromer',
  },
  {
    label: 'Elkhorn',
    value: 'CA/MB/Virden/Elkhorn',
  },
  {
    label: 'Hargrave',
    value: 'CA/MB/Virden/Hargrave',
  },
  {
    label: 'Kenton',
    value: 'CA/MB/Virden/Kenton',
  },
  {
    label: 'Oak Lake',
    value: 'CA/MB/Virden/Oak Lake',
  },
  {
    label: 'Reston',
    value: 'CA/MB/Virden/Reston',
  },
  {
    label: 'Sinclair',
    value: 'CA/MB/Virden/Sinclair',
  },
  {
    label: 'Virden',
    value: 'CA/MB/Virden/Virden',
  },
  {
    label: 'Birtle',
    value: 'CA/MB/Western Manitoba/Birtle',
  },
  {
    label: 'Cardale',
    value: 'CA/MB/Western Manitoba/Cardale',
  },
  {
    label: 'Erickson',
    value: 'CA/MB/Western Manitoba/Erickson',
  },
  {
    label: 'Foxwarren',
    value: 'CA/MB/Western Manitoba/Foxwarren',
  },
  {
    label: 'Hamiota',
    value: 'CA/MB/Western Manitoba/Hamiota',
  },
  {
    label: 'Mcauley',
    value: 'CA/MB/Western Manitoba/Mcauley',
  },
  {
    label: 'Miniota',
    value: 'CA/MB/Western Manitoba/Miniota',
  },
  {
    label: 'Minnedosa',
    value: 'CA/MB/Western Manitoba/Minnedosa',
  },
  {
    label: 'Neepawa',
    value: 'CA/MB/Western Manitoba/Neepawa',
  },
  {
    label: 'Newdale',
    value: 'CA/MB/Western Manitoba/Newdale',
  },
  {
    label: 'Oak River',
    value: 'CA/MB/Western Manitoba/Oak River',
  },
  {
    label: 'Oakburn',
    value: 'CA/MB/Western Manitoba/Oakburn',
  },
  {
    label: 'Onanole',
    value: 'CA/MB/Western Manitoba/Onanole',
  },
  {
    label: 'Rapid City',
    value: 'CA/MB/Western Manitoba/Rapid City',
  },
  {
    label: 'Riding Mountain',
    value: 'CA/MB/Western Manitoba/Riding Mountain',
  },
  {
    label: 'Sandy Lake',
    value: 'CA/MB/Western Manitoba/Sandy Lake',
  },
  {
    label: 'Shoal Lake',
    value: 'CA/MB/Western Manitoba/Shoal Lake',
  },
  {
    label: 'St Lazare',
    value: 'CA/MB/Western Manitoba/St Lazare',
  },
  {
    label: 'Strathclair',
    value: 'CA/MB/Western Manitoba/Strathclair',
  },
  {
    label: 'Gladstone',
    value: 'CA/MB/Westlake-Gladstone/Gladstone',
  },
  {
    label: 'Langruth',
    value: 'CA/MB/Westlake-Gladstone/Langruth',
  },
  {
    label: 'Plumas',
    value: 'CA/MB/Westlake-Gladstone/Plumas',
  },
  {
    label: 'Westbourne',
    value: 'CA/MB/Westlake-Gladstone/Westbourne',
  },
  {
    label: 'Alexander',
    value: 'CA/MB/Westman/Alexander',
  },
  {
    label: 'Arden',
    value: 'CA/MB/Westman/Arden',
  },
  {
    label: 'Arrow River',
    value: 'CA/MB/Westman/Arrow River',
  },
  {
    label: 'Baldur',
    value: 'CA/MB/Westman/Baldur',
  },
  {
    label: 'Belleview',
    value: 'CA/MB/Westman/Belleview',
  },
  {
    label: 'Belmont',
    value: 'CA/MB/Westman/Belmont',
  },
  {
    label: 'Bethany',
    value: 'CA/MB/Westman/Bethany',
  },
  {
    label: 'Beulah',
    value: 'CA/MB/Westman/Beulah',
  },
  {
    label: 'Birnie',
    value: 'CA/MB/Westman/Birnie',
  },
  {
    label: 'Birtle',
    value: 'CA/MB/Westman/Birtle',
  },
  {
    label: 'Boissevain',
    value: 'CA/MB/Westman/Boissevain',
  },
  {
    label: 'Bradwardine',
    value: 'CA/MB/Westman/Bradwardine',
  },
  {
    label: 'Brandon',
    value: 'CA/MB/Westman/Brandon',
  },
  {
    label: 'Brookdale',
    value: 'CA/MB/Westman/Brookdale',
  },
  {
    label: 'Carberry',
    value: 'CA/MB/Westman/Carberry',
  },
  {
    label: 'Cardale',
    value: 'CA/MB/Westman/Cardale',
  },
  {
    label: 'Carroll',
    value: 'CA/MB/Westman/Carroll',
  },
  {
    label: 'Clanwilliam',
    value: 'CA/MB/Westman/Clanwilliam',
  },
  {
    label: 'Clearwater',
    value: 'CA/MB/Westman/Clearwater',
  },
  {
    label: 'Coulter',
    value: 'CA/MB/Westman/Coulter',
  },
  {
    label: 'Crandall',
    value: 'CA/MB/Westman/Crandall',
  },
  {
    label: 'Cromer',
    value: 'CA/MB/Westman/Cromer',
  },
  {
    label: 'Crystal City',
    value: 'CA/MB/Westman/Crystal City',
  },
  {
    label: 'Decker',
    value: 'CA/MB/Westman/Decker',
  },
  {
    label: 'Deleau',
    value: 'CA/MB/Westman/Deleau',
  },
  {
    label: 'Deloraine',
    value: 'CA/MB/Westman/Deloraine',
  },
  {
    label: 'Douglas',
    value: 'CA/MB/Westman/Douglas',
  },
  {
    label: 'Dunrea',
    value: 'CA/MB/Westman/Dunrea',
  },
  {
    label: 'Eden',
    value: 'CA/MB/Westman/Eden',
  },
  {
    label: 'Elgin',
    value: 'CA/MB/Westman/Elgin',
  },
  {
    label: 'Elkhorn',
    value: 'CA/MB/Westman/Elkhorn',
  },
  {
    label: 'Fairfax',
    value: 'CA/MB/Westman/Fairfax',
  },
  {
    label: 'Forrest Station',
    value: 'CA/MB/Westman/Forrest Station',
  },
  {
    label: 'Foxwarren',
    value: 'CA/MB/Westman/Foxwarren',
  },
  {
    label: 'Franklin',
    value: 'CA/MB/Westman/Franklin',
  },
  {
    label: 'Glenboro',
    value: 'CA/MB/Westman/Glenboro',
  },
  {
    label: 'Glenora',
    value: 'CA/MB/Westman/Glenora',
  },
  {
    label: 'Goodlands',
    value: 'CA/MB/Westman/Goodlands',
  },
  {
    label: 'Griswold',
    value: 'CA/MB/Westman/Griswold',
  },
  {
    label: 'Hamiota',
    value: 'CA/MB/Westman/Hamiota',
  },
  {
    label: 'Harding',
    value: 'CA/MB/Westman/Harding',
  },
  {
    label: 'Hargrave',
    value: 'CA/MB/Westman/Hargrave',
  },
  {
    label: 'Hartney',
    value: 'CA/MB/Westman/Hartney',
  },
  {
    label: 'Holmfield',
    value: 'CA/MB/Westman/Holmfield',
  },
  {
    label: 'Isabella',
    value: 'CA/MB/Westman/Isabella',
  },
  {
    label: 'Justice',
    value: 'CA/MB/Westman/Justice',
  },
  {
    label: 'Kenton',
    value: 'CA/MB/Westman/Kenton',
  },
  {
    label: 'Killarney',
    value: 'CA/MB/Westman/Killarney',
  },
  {
    label: 'Kirkella',
    value: 'CA/MB/Westman/Kirkella',
  },
  {
    label: 'Kola',
    value: 'CA/MB/Westman/Kola',
  },
  {
    label: 'Lauder',
    value: 'CA/MB/Westman/Lauder',
  },
  {
    label: 'Lenore',
    value: 'CA/MB/Westman/Lenore',
  },
  {
    label: 'Lyleton',
    value: 'CA/MB/Westman/Lyleton',
  },
  {
    label: 'Manson',
    value: 'CA/MB/Westman/Manson',
  },
  {
    label: 'Margaret',
    value: 'CA/MB/Westman/Margaret',
  },
  {
    label: 'Mather',
    value: 'CA/MB/Westman/Mather',
  },
  {
    label: 'Mcauley',
    value: 'CA/MB/Westman/Mcauley',
  },
  {
    label: 'Medora',
    value: 'CA/MB/Westman/Medora',
  },
  {
    label: 'Melita',
    value: 'CA/MB/Westman/Melita',
  },
  {
    label: 'Miniota',
    value: 'CA/MB/Westman/Miniota',
  },
  {
    label: 'Minnedosa',
    value: 'CA/MB/Westman/Minnedosa',
  },
  {
    label: 'Minto',
    value: 'CA/MB/Westman/Minto',
  },
  {
    label: 'Mountain Road',
    value: 'CA/MB/Westman/Mountain Road',
  },
  {
    label: 'Napinka',
    value: 'CA/MB/Westman/Napinka',
  },
  {
    label: 'Neepawa',
    value: 'CA/MB/Westman/Neepawa',
  },
  {
    label: 'Nesbitt',
    value: 'CA/MB/Westman/Nesbitt',
  },
  {
    label: 'Newdale',
    value: 'CA/MB/Westman/Newdale',
  },
  {
    label: 'Ninette',
    value: 'CA/MB/Westman/Ninette',
  },
  {
    label: 'Ninga',
    value: 'CA/MB/Westman/Ninga',
  },
  {
    label: 'Oak Lake',
    value: 'CA/MB/Westman/Oak Lake',
  },
  {
    label: 'Oak River',
    value: 'CA/MB/Westman/Oak River',
  },
  {
    label: 'Pierson',
    value: 'CA/MB/Westman/Pierson',
  },
  {
    label: 'Pilot Mound',
    value: 'CA/MB/Westman/Pilot Mound',
  },
  {
    label: 'Pipestone',
    value: 'CA/MB/Westman/Pipestone',
  },
  {
    label: 'Polonia',
    value: 'CA/MB/Westman/Polonia',
  },
  {
    label: 'Rapid City',
    value: 'CA/MB/Westman/Rapid City',
  },
  {
    label: 'Reston',
    value: 'CA/MB/Westman/Reston',
  },
  {
    label: 'Rivers',
    value: 'CA/MB/Westman/Rivers',
  },
  {
    label: 'Sandy Lake',
    value: 'CA/MB/Westman/Sandy Lake',
  },
  {
    label: 'Shilo',
    value: 'CA/MB/Westman/Shilo',
  },
  {
    label: 'Shoal Lake',
    value: 'CA/MB/Westman/Shoal Lake',
  },
  {
    label: 'Sidney',
    value: 'CA/MB/Westman/Sidney',
  },
  {
    label: 'Sinclair',
    value: 'CA/MB/Westman/Sinclair',
  },
  {
    label: 'Solsgirth',
    value: 'CA/MB/Westman/Solsgirth',
  },
  {
    label: 'Souris',
    value: 'CA/MB/Westman/Souris',
  },
  {
    label: 'St Lazare',
    value: 'CA/MB/Westman/St Lazare',
  },
  {
    label: 'Stockton',
    value: 'CA/MB/Westman/Stockton',
  },
  {
    label: 'Strathclair',
    value: 'CA/MB/Westman/Strathclair',
  },
  {
    label: 'Tilston',
    value: 'CA/MB/Westman/Tilston',
  },
  {
    label: 'Virden',
    value: 'CA/MB/Westman/Virden',
  },
  {
    label: 'Waskada',
    value: 'CA/MB/Westman/Waskada',
  },
  {
    label: 'Wawanesa',
    value: 'CA/MB/Westman/Wawanesa',
  },
  {
    label: 'Wellwood',
    value: 'CA/MB/Westman/Wellwood',
  },
  {
    label: 'Brunkild',
    value: 'CA/MB/Whitehorse Plains/Brunkild',
  },
  {
    label: 'Elie',
    value: 'CA/MB/Whitehorse Plains/Elie',
  },
  {
    label: 'La Salle',
    value: 'CA/MB/Whitehorse Plains/La Salle',
  },
  {
    label: 'Oak Bluff',
    value: 'CA/MB/Whitehorse Plains/Oak Bluff',
  },
  {
    label: 'Sanford',
    value: 'CA/MB/Whitehorse Plains/Sanford',
  },
  {
    label: 'St Francois Xavier',
    value: 'CA/MB/Whitehorse Plains/St Francois Xavier',
  },
  {
    label: 'Starbuck',
    value: 'CA/MB/Whitehorse Plains/Starbuck',
  },
  {
    label: 'Winkler',
    value: 'CA/MB/Winkler/Winkler',
  },
  {
    label: 'Winnipeg',
    value: 'CA/MB/Winnipeg/Winnipeg',
  },
  {
    label: 'Headingley',
    value: 'CA/MB/Winnipeg/Headingley',
  },
  {
    label: 'Winnipeg Beach',
    value: 'CA/MB/Winnipeg Beach/Winnipeg Beach',
  },
  {
    label: 'Cartier',
    value: 'CA/MB/Winnipeg Capital/Cartier',
  },
  {
    label: 'East St Paul',
    value: 'CA/MB/Winnipeg Capital/East St Paul',
  },
  {
    label: 'Garson',
    value: 'CA/MB/Winnipeg Capital/Garson',
  },
  {
    label: 'Grande Pointe',
    value: 'CA/MB/Winnipeg Capital/Grande Pointe',
  },
  {
    label: 'Headingley',
    value: 'CA/MB/Winnipeg Capital/Headingley',
  },
  {
    label: 'Howden',
    value: 'CA/MB/Winnipeg Capital/Howden',
  },
  {
    label: 'La Barriere',
    value: 'CA/MB/Winnipeg Capital/La Barriere',
  },
  {
    label: 'Lorette',
    value: 'CA/MB/Winnipeg Capital/Lorette',
  },
  {
    label: 'Oakbank',
    value: 'CA/MB/Winnipeg Capital/Oakbank',
  },
  {
    label: 'Springfield',
    value: 'CA/MB/Winnipeg Capital/Springfield',
  },
  {
    label: 'St Francois Xavier',
    value: 'CA/MB/Winnipeg Capital/St Francois Xavier',
  },
  {
    label: 'St Germain South',
    value: 'CA/MB/Winnipeg Capital/St Germain South',
  },
  {
    label: 'Vermette',
    value: 'CA/MB/Winnipeg Capital/Vermette',
  },
  {
    label: 'West St Paul',
    value: 'CA/MB/Winnipeg Capital/West St Paul',
  },
  {
    label: 'Winnipeg',
    value: 'CA/MB/Winnipeg Capital/Winnipeg',
  },
  {
    label: 'Albert Mines',
    value: 'CA/NB/Albert/Albert Mines',
  },
  {
    label: 'Alma',
    value: 'CA/NB/Albert/Alma',
  },
  {
    label: 'Baltimore',
    value: 'CA/NB/Albert/Baltimore',
  },
  {
    label: 'Beaverbrook Albert Co',
    value: 'CA/NB/Albert/Beaverbrook Albert Co',
  },
  {
    label: 'Berryton',
    value: 'CA/NB/Albert/Berryton',
  },
  {
    label: 'Caledonia Mountain',
    value: 'CA/NB/Albert/Caledonia Mountain',
  },
  {
    label: 'Cape Enrage',
    value: 'CA/NB/Albert/Cape Enrage',
  },
  {
    label: 'Cape Station',
    value: 'CA/NB/Albert/Cape Station',
  },
  {
    label: 'Colpitts Settlement',
    value: 'CA/NB/Albert/Colpitts Settlement',
  },
  {
    label: 'Curryville',
    value: 'CA/NB/Albert/Curryville',
  },
  {
    label: 'Dawson Settlement',
    value: 'CA/NB/Albert/Dawson Settlement',
  },
  {
    label: 'Dennis Beach',
    value: 'CA/NB/Albert/Dennis Beach',
  },
  {
    label: 'Edgetts Landing',
    value: 'CA/NB/Albert/Edgetts Landing',
  },
  {
    label: 'Elgin',
    value: 'CA/NB/Albert/Elgin',
  },
  {
    label: 'Forest Glen',
    value: 'CA/NB/Albert/Forest Glen',
  },
  {
    label: 'Fundy National Park',
    value: 'CA/NB/Albert/Fundy National Park',
  },
  {
    label: 'Germantown',
    value: 'CA/NB/Albert/Germantown',
  },
  {
    label: 'Harvey Albert Co',
    value: 'CA/NB/Albert/Harvey Albert Co',
  },
  {
    label: 'Hebron',
    value: 'CA/NB/Albert/Hebron',
  },
  {
    label: 'Hillsborough',
    value: 'CA/NB/Albert/Hillsborough',
  },
  {
    label: 'Hillsborough West',
    value: 'CA/NB/Albert/Hillsborough West',
  },
  {
    label: 'Hopewell Cape',
    value: 'CA/NB/Albert/Hopewell Cape',
  },
  {
    label: 'Hopewell Hill',
    value: 'CA/NB/Albert/Hopewell Hill',
  },
  {
    label: 'Little River Albert Co',
    value: 'CA/NB/Albert/Little River Albert Co',
  },
  {
    label: 'Lower Cape',
    value: 'CA/NB/Albert/Lower Cape',
  },
  {
    label: 'Lower Coverdale',
    value: 'CA/NB/Albert/Lower Coverdale',
  },
  {
    label: 'Midway',
    value: 'CA/NB/Albert/Midway',
  },
  {
    label: 'New Horton',
    value: 'CA/NB/Albert/New Horton',
  },
  {
    label: 'Osborne Corner',
    value: 'CA/NB/Albert/Osborne Corner',
  },
  {
    label: 'Parkindale',
    value: 'CA/NB/Albert/Parkindale',
  },
  {
    label: 'Pine Glen',
    value: 'CA/NB/Albert/Pine Glen',
  },
  {
    label: 'Prosser Brook',
    value: 'CA/NB/Albert/Prosser Brook',
  },
  {
    label: 'Riverside-Albert',
    value: 'CA/NB/Albert/Riverside-Albert',
  },
  {
    label: 'Riverview',
    value: 'CA/NB/Albert/Riverview',
  },
  {
    label: 'Rosevale',
    value: 'CA/NB/Albert/Rosevale',
  },
  {
    label: 'Sackville Road',
    value: 'CA/NB/Albert/Sackville Road',
  },
  {
    label: 'Salem',
    value: 'CA/NB/Albert/Salem',
  },
  {
    label: 'Shenstone',
    value: 'CA/NB/Albert/Shenstone',
  },
  {
    label: 'Shepody Albert Co',
    value: 'CA/NB/Albert/Shepody Albert Co',
  },
  {
    label: 'Shepody Kings Co',
    value: 'CA/NB/Albert/Shepody Kings Co',
  },
  {
    label: 'Stoney Creek',
    value: 'CA/NB/Albert/Stoney Creek',
  },
  {
    label: 'Turtle Creek',
    value: 'CA/NB/Albert/Turtle Creek',
  },
  {
    label: 'Upper Coverdale',
    value: 'CA/NB/Albert/Upper Coverdale',
  },
  {
    label: 'Waterside',
    value: 'CA/NB/Albert/Waterside',
  },
  {
    label: 'Weldon',
    value: 'CA/NB/Albert/Weldon',
  },
  {
    label: 'West River',
    value: 'CA/NB/Albert/West River',
  },
  {
    label: 'Armond',
    value: 'CA/NB/Carleton/Armond',
  },
  {
    label: 'Ashland',
    value: 'CA/NB/Carleton/Ashland',
  },
  {
    label: 'Avondale',
    value: 'CA/NB/Carleton/Avondale',
  },
  {
    label: 'Bannon',
    value: 'CA/NB/Carleton/Bannon',
  },
  {
    label: 'Bath',
    value: 'CA/NB/Carleton/Bath',
  },
  {
    label: 'Beardsley',
    value: 'CA/NB/Carleton/Beardsley',
  },
  {
    label: 'Beckim Settlement',
    value: 'CA/NB/Carleton/Beckim Settlement',
  },
  {
    label: 'Bedell',
    value: 'CA/NB/Carleton/Bedell',
  },
  {
    label: 'Beechwood',
    value: 'CA/NB/Carleton/Beechwood',
  },
  {
    label: 'Belleville',
    value: 'CA/NB/Carleton/Belleville',
  },
  {
    label: 'Benton',
    value: 'CA/NB/Carleton/Benton',
  },
  {
    label: 'Bloomfield Carleton Co',
    value: 'CA/NB/Carleton/Bloomfield Carleton Co',
  },
  {
    label: 'Bristol',
    value: 'CA/NB/Carleton/Bristol',
  },
  {
    label: 'Bristol Junction',
    value: 'CA/NB/Carleton/Bristol Junction',
  },
  {
    label: 'Brookville',
    value: 'CA/NB/Carleton/Brookville',
  },
  {
    label: 'Bubartown',
    value: 'CA/NB/Carleton/Bubartown',
  },
  {
    label: 'Bulls Creek',
    value: 'CA/NB/Carleton/Bulls Creek',
  },
  {
    label: 'Campbell Settlement',
    value: 'CA/NB/Carleton/Campbell Settlement',
  },
  {
    label: 'Carlisle',
    value: 'CA/NB/Carleton/Carlisle',
  },
  {
    label: 'Carlow',
    value: 'CA/NB/Carleton/Carlow',
  },
  {
    label: 'Centreville',
    value: 'CA/NB/Carleton/Centreville',
  },
  {
    label: 'Charleston',
    value: 'CA/NB/Carleton/Charleston',
  },
  {
    label: 'Clearview',
    value: 'CA/NB/Carleton/Clearview',
  },
  {
    label: 'Cloverdale',
    value: 'CA/NB/Carleton/Cloverdale',
  },
  {
    label: 'Coldstream',
    value: 'CA/NB/Carleton/Coldstream',
  },
  {
    label: 'Connell',
    value: 'CA/NB/Carleton/Connell',
  },
  {
    label: 'Debec',
    value: 'CA/NB/Carleton/Debec',
  },
  {
    label: 'Deerville',
    value: 'CA/NB/Carleton/Deerville',
  },
  {
    label: 'Divide',
    value: 'CA/NB/Carleton/Divide',
  },
  {
    label: 'East Brighton',
    value: 'CA/NB/Carleton/East Brighton',
  },
  {
    label: 'East Centreville',
    value: 'CA/NB/Carleton/East Centreville',
  },
  {
    label: 'East Coldstream',
    value: 'CA/NB/Carleton/East Coldstream',
  },
  {
    label: 'East Newbridge',
    value: 'CA/NB/Carleton/East Newbridge',
  },
  {
    label: 'Elmwood',
    value: 'CA/NB/Carleton/Elmwood',
  },
  {
    label: 'Fielding',
    value: 'CA/NB/Carleton/Fielding',
  },
  {
    label: 'Flemington',
    value: 'CA/NB/Carleton/Flemington',
  },
  {
    label: 'Florenceville-Bristol',
    value: 'CA/NB/Carleton/Florenceville-Bristol',
  },
  {
    label: 'Glassville',
    value: 'CA/NB/Carleton/Glassville',
  },
  {
    label: 'Good Corner',
    value: 'CA/NB/Carleton/Good Corner',
  },
  {
    label: 'Gordonsville',
    value: 'CA/NB/Carleton/Gordonsville',
  },
  {
    label: 'Grafton',
    value: 'CA/NB/Carleton/Grafton',
  },
  {
    label: 'Green Road',
    value: 'CA/NB/Carleton/Green Road',
  },
  {
    label: 'Greenfield',
    value: 'CA/NB/Carleton/Greenfield',
  },
  {
    label: 'Gregg Settlement',
    value: 'CA/NB/Carleton/Gregg Settlement',
  },
  {
    label: 'Hartford',
    value: 'CA/NB/Carleton/Hartford',
  },
  {
    label: 'Hartland',
    value: 'CA/NB/Carleton/Hartland',
  },
  {
    label: 'Hartley Settlement',
    value: 'CA/NB/Carleton/Hartley Settlement',
  },
  {
    label: 'Holmesville',
    value: 'CA/NB/Carleton/Holmesville',
  },
  {
    label: 'Howard Brook',
    value: 'CA/NB/Carleton/Howard Brook',
  },
  {
    label: 'Irish Settlement',
    value: 'CA/NB/Carleton/Irish Settlement',
  },
  {
    label: 'Jackson Falls',
    value: 'CA/NB/Carleton/Jackson Falls',
  },
  {
    label: 'Jacksontown',
    value: 'CA/NB/Carleton/Jacksontown',
  },
  {
    label: 'Jacksonville',
    value: 'CA/NB/Carleton/Jacksonville',
  },
  {
    label: 'Johnville',
    value: 'CA/NB/Carleton/Johnville',
  },
  {
    label: 'Juniper',
    value: 'CA/NB/Carleton/Juniper',
  },
  {
    label: 'Killoween',
    value: 'CA/NB/Carleton/Killoween',
  },
  {
    label: 'Kirkland',
    value: 'CA/NB/Carleton/Kirkland',
  },
  {
    label: 'Knowlesville',
    value: 'CA/NB/Carleton/Knowlesville',
  },
  {
    label: 'Lakeville',
    value: 'CA/NB/Carleton/Lakeville',
  },
  {
    label: 'Lakeville Carleton Co',
    value: 'CA/NB/Carleton/Lakeville Carleton Co',
  },
  {
    label: 'Lansdowne',
    value: 'CA/NB/Carleton/Lansdowne',
  },
  {
    label: 'Limestone',
    value: 'CA/NB/Carleton/Limestone',
  },
  {
    label: 'Lindsay',
    value: 'CA/NB/Carleton/Lindsay',
  },
  {
    label: 'Long Settlement',
    value: 'CA/NB/Carleton/Long Settlement',
  },
  {
    label: 'Lower Brighton',
    value: 'CA/NB/Carleton/Lower Brighton',
  },
  {
    label: 'Lower Knoxford',
    value: 'CA/NB/Carleton/Lower Knoxford',
  },
  {
    label: 'Lower Woodstock',
    value: 'CA/NB/Carleton/Lower Woodstock',
  },
  {
    label: 'Mainstream',
    value: 'CA/NB/Carleton/Mainstream',
  },
  {
    label: 'Mapledale',
    value: 'CA/NB/Carleton/Mapledale',
  },
  {
    label: 'Maplehurst',
    value: 'CA/NB/Carleton/Maplehurst',
  },
  {
    label: 'Mckenna',
    value: 'CA/NB/Carleton/Mckenna',
  },
  {
    label: 'Mckenzie Corner',
    value: 'CA/NB/Carleton/Mckenzie Corner',
  },
  {
    label: 'Monquart',
    value: 'CA/NB/Carleton/Monquart',
  },
  {
    label: 'Monument',
    value: 'CA/NB/Carleton/Monument',
  },
  {
    label: 'Moose Mountain',
    value: 'CA/NB/Carleton/Moose Mountain',
  },
  {
    label: 'Mount Delight',
    value: 'CA/NB/Carleton/Mount Delight',
  },
  {
    label: 'Mount Pleasant',
    value: 'CA/NB/Carleton/Mount Pleasant',
  },
  {
    label: 'Newbridge',
    value: 'CA/NB/Carleton/Newbridge',
  },
  {
    label: 'Newburg',
    value: 'CA/NB/Carleton/Newburg',
  },
  {
    label: 'Northampton',
    value: 'CA/NB/Carleton/Northampton',
  },
  {
    label: 'Oak Mountain',
    value: 'CA/NB/Carleton/Oak Mountain',
  },
  {
    label: 'Oakland',
    value: 'CA/NB/Carleton/Oakland',
  },
  {
    label: 'Oakville',
    value: 'CA/NB/Carleton/Oakville',
  },
  {
    label: 'Peel',
    value: 'CA/NB/Carleton/Peel',
  },
  {
    label: 'Pembroke',
    value: 'CA/NB/Carleton/Pembroke',
  },
  {
    label: 'Piercemont',
    value: 'CA/NB/Carleton/Piercemont',
  },
  {
    label: 'Plymouth',
    value: 'CA/NB/Carleton/Plymouth',
  },
  {
    label: 'Pole Hill',
    value: 'CA/NB/Carleton/Pole Hill',
  },
  {
    label: 'Red Bridge',
    value: 'CA/NB/Carleton/Red Bridge',
  },
  {
    label: 'Riceville',
    value: 'CA/NB/Carleton/Riceville',
  },
  {
    label: 'Richmond Corner',
    value: 'CA/NB/Carleton/Richmond Corner',
  },
  {
    label: 'Richmond Settlement',
    value: 'CA/NB/Carleton/Richmond Settlement',
  },
  {
    label: 'Riverbank Carleton Co',
    value: 'CA/NB/Carleton/Riverbank Carleton Co',
  },
  {
    label: 'Rosedale',
    value: 'CA/NB/Carleton/Rosedale',
  },
  {
    label: 'Royalton',
    value: 'CA/NB/Carleton/Royalton',
  },
  {
    label: 'Simonds',
    value: 'CA/NB/Carleton/Simonds',
  },
  {
    label: 'Somerville',
    value: 'CA/NB/Carleton/Somerville',
  },
  {
    label: 'Speerville',
    value: 'CA/NB/Carleton/Speerville',
  },
  {
    label: 'St Thomas',
    value: 'CA/NB/Carleton/St Thomas',
  },
  {
    label: 'Stickney',
    value: 'CA/NB/Carleton/Stickney',
  },
  {
    label: 'Summerfield Carleton Co',
    value: 'CA/NB/Carleton/Summerfield Carleton Co',
  },
  {
    label: 'Teeds Mills',
    value: 'CA/NB/Carleton/Teeds Mills',
  },
  {
    label: 'Tracey Mills',
    value: 'CA/NB/Carleton/Tracey Mills',
  },
  {
    label: 'Union Corner',
    value: 'CA/NB/Carleton/Union Corner',
  },
  {
    label: 'Upper Brighton',
    value: 'CA/NB/Carleton/Upper Brighton',
  },
  {
    label: 'Upper Kent',
    value: 'CA/NB/Carleton/Upper Kent',
  },
  {
    label: 'Upper Knoxford',
    value: 'CA/NB/Carleton/Upper Knoxford',
  },
  {
    label: 'Upper Woodstock',
    value: 'CA/NB/Carleton/Upper Woodstock',
  },
  {
    label: 'Victoria Corner',
    value: 'CA/NB/Carleton/Victoria Corner',
  },
  {
    label: 'Wakefield',
    value: 'CA/NB/Carleton/Wakefield',
  },
  {
    label: 'Waterville Carleton Co',
    value: 'CA/NB/Carleton/Waterville Carleton Co',
  },
  {
    label: 'West Florenceville',
    value: 'CA/NB/Carleton/West Florenceville',
  },
  {
    label: 'Weston',
    value: 'CA/NB/Carleton/Weston',
  },
  {
    label: 'Wicklow',
    value: 'CA/NB/Carleton/Wicklow',
  },
  {
    label: 'Williamstown Carleton Co',
    value: 'CA/NB/Carleton/Williamstown Carleton Co',
  },
  {
    label: 'Wilmot',
    value: 'CA/NB/Carleton/Wilmot',
  },
  {
    label: 'Windsor',
    value: 'CA/NB/Carleton/Windsor',
  },
  {
    label: 'Woodstock',
    value: 'CA/NB/Carleton/Woodstock',
  },
  {
    label: 'Woodstock First Nation',
    value: 'CA/NB/Carleton/Woodstock First Nation',
  },
  {
    label: 'Andersonville',
    value: 'CA/NB/Charlotte/Andersonville',
  },
  {
    label: 'Back Bay',
    value: 'CA/NB/Charlotte/Back Bay',
  },
  {
    label: 'Baillie',
    value: 'CA/NB/Charlotte/Baillie',
  },
  {
    label: 'Barter Settlement',
    value: 'CA/NB/Charlotte/Barter Settlement',
  },
  {
    label: 'Bartletts Mills',
    value: 'CA/NB/Charlotte/Bartletts Mills',
  },
  {
    label: 'Basswood Ridge',
    value: 'CA/NB/Charlotte/Basswood Ridge',
  },
  {
    label: 'Bayside',
    value: 'CA/NB/Charlotte/Bayside',
  },
  {
    label: 'Beaver Harbour',
    value: 'CA/NB/Charlotte/Beaver Harbour',
  },
  {
    label: 'Bedell',
    value: 'CA/NB/Charlotte/Bedell',
  },
  {
    label: 'Bethel',
    value: 'CA/NB/Charlotte/Bethel',
  },
  {
    label: 'Blacks Harbour',
    value: 'CA/NB/Charlotte/Blacks Harbour',
  },
  {
    label: 'Bocabec',
    value: 'CA/NB/Charlotte/Bocabec',
  },
  {
    label: 'Bonny River',
    value: 'CA/NB/Charlotte/Bonny River',
  },
  {
    label: 'Burnt Hill',
    value: 'CA/NB/Charlotte/Burnt Hill',
  },
  {
    label: 'Caithness',
    value: 'CA/NB/Charlotte/Caithness',
  },
  {
    label: 'Calders Head',
    value: 'CA/NB/Charlotte/Calders Head',
  },
  {
    label: 'Canal',
    value: 'CA/NB/Charlotte/Canal',
  },
  {
    label: 'Canoose',
    value: 'CA/NB/Charlotte/Canoose',
  },
  {
    label: 'Chamcook',
    value: 'CA/NB/Charlotte/Chamcook',
  },
  {
    label: 'Chocolate Cove',
    value: 'CA/NB/Charlotte/Chocolate Cove',
  },
  {
    label: 'Crocker Hill',
    value: 'CA/NB/Charlotte/Crocker Hill',
  },
  {
    label: 'Cummings Cove',
    value: 'CA/NB/Charlotte/Cummings Cove',
  },
  {
    label: 'Dewolfe',
    value: 'CA/NB/Charlotte/Dewolfe',
  },
  {
    label: 'Digdeguash',
    value: 'CA/NB/Charlotte/Digdeguash',
  },
  {
    label: 'Dufferin',
    value: 'CA/NB/Charlotte/Dufferin',
  },
  {
    label: 'Dufferin Charlotte Co',
    value: 'CA/NB/Charlotte/Dufferin Charlotte Co',
  },
  {
    label: 'Elmsville',
    value: 'CA/NB/Charlotte/Elmsville',
  },
  {
    label: 'Fairhaven',
    value: 'CA/NB/Charlotte/Fairhaven',
  },
  {
    label: 'Flume Ridge',
    value: 'CA/NB/Charlotte/Flume Ridge',
  },
  {
    label: 'Four Corners',
    value: 'CA/NB/Charlotte/Four Corners',
  },
  {
    label: 'Grand Manan',
    value: 'CA/NB/Charlotte/Grand Manan',
  },
  {
    label: 'Hayman Hill',
    value: 'CA/NB/Charlotte/Hayman Hill',
  },
  {
    label: 'Heathland',
    value: 'CA/NB/Charlotte/Heathland',
  },
  {
    label: 'Hersonville',
    value: 'CA/NB/Charlotte/Hersonville',
  },
  {
    label: 'Hibernia Cove',
    value: 'CA/NB/Charlotte/Hibernia Cove',
  },
  {
    label: 'Honeydale',
    value: 'CA/NB/Charlotte/Honeydale',
  },
  {
    label: 'Indian Island',
    value: 'CA/NB/Charlotte/Indian Island',
  },
  {
    label: 'Johnson Settlement Charlotte Co',
    value: 'CA/NB/Charlotte/Johnson Settlement Charlotte Co',
  },
  {
    label: 'Johnson Settlement York Co',
    value: 'CA/NB/Charlotte/Johnson Settlement York Co',
  },
  {
    label: "Lambert's Cove",
    value: "CA/NB/Charlotte/Lambert's Cove",
  },
  {
    label: 'Lambertville',
    value: 'CA/NB/Charlotte/Lambertville',
  },
  {
    label: 'Lawrence Station',
    value: 'CA/NB/Charlotte/Lawrence Station',
  },
  {
    label: 'Lee Settlement',
    value: 'CA/NB/Charlotte/Lee Settlement',
  },
  {
    label: 'Leonardville',
    value: 'CA/NB/Charlotte/Leonardville',
  },
  {
    label: 'Lepreau',
    value: 'CA/NB/Charlotte/Lepreau',
  },
  {
    label: 'Letang',
    value: 'CA/NB/Charlotte/Letang',
  },
  {
    label: "L'etete",
    value: "CA/NB/Charlotte/L'etete",
  },
  {
    label: 'Leverville',
    value: 'CA/NB/Charlotte/Leverville',
  },
  {
    label: 'Little Ridge',
    value: 'CA/NB/Charlotte/Little Ridge',
  },
  {
    label: "Lord's Cove",
    value: "CA/NB/Charlotte/Lord's Cove",
  },
  {
    label: 'Lynnfield',
    value: 'CA/NB/Charlotte/Lynnfield',
  },
  {
    label: 'Maces Bay',
    value: 'CA/NB/Charlotte/Maces Bay',
  },
  {
    label: 'Mascarene',
    value: 'CA/NB/Charlotte/Mascarene',
  },
  {
    label: 'Mayfield',
    value: 'CA/NB/Charlotte/Mayfield',
  },
  {
    label: 'Ministers Island',
    value: 'CA/NB/Charlotte/Ministers Island',
  },
  {
    label: 'Mohannes',
    value: 'CA/NB/Charlotte/Mohannes',
  },
  {
    label: 'Moores Mills',
    value: 'CA/NB/Charlotte/Moores Mills',
  },
  {
    label: 'New River Beach',
    value: 'CA/NB/Charlotte/New River Beach',
  },
  {
    label: 'Northern Harbour',
    value: 'CA/NB/Charlotte/Northern Harbour',
  },
  {
    label: 'Oak Bay',
    value: 'CA/NB/Charlotte/Oak Bay',
  },
  {
    label: 'Oak Haven',
    value: 'CA/NB/Charlotte/Oak Haven',
  },
  {
    label: 'Oak Hill',
    value: 'CA/NB/Charlotte/Oak Hill',
  },
  {
    label: 'Old Ridge',
    value: 'CA/NB/Charlotte/Old Ridge',
  },
  {
    label: 'Pennfield',
    value: 'CA/NB/Charlotte/Pennfield',
  },
  {
    label: 'Pleasant Ridge Char County',
    value: 'CA/NB/Charlotte/Pleasant Ridge Char County',
  },
  {
    label: 'Pocologan',
    value: 'CA/NB/Charlotte/Pocologan',
  },
  {
    label: 'Pomeroy Ridge',
    value: 'CA/NB/Charlotte/Pomeroy Ridge',
  },
  {
    label: 'Richardson',
    value: 'CA/NB/Charlotte/Richardson',
  },
  {
    label: 'Rollingdam',
    value: 'CA/NB/Charlotte/Rollingdam',
  },
  {
    label: 'Scotch Ridge',
    value: 'CA/NB/Charlotte/Scotch Ridge',
  },
  {
    label: 'Second Falls',
    value: 'CA/NB/Charlotte/Second Falls',
  },
  {
    label: 'Seeleys Cove',
    value: 'CA/NB/Charlotte/Seeleys Cove',
  },
  {
    label: 'South Oromocto Lake',
    value: 'CA/NB/Charlotte/South Oromocto Lake',
  },
  {
    label: 'St Andrews',
    value: 'CA/NB/Charlotte/St Andrews',
  },
  {
    label: 'St David Ridge',
    value: 'CA/NB/Charlotte/St David Ridge',
  },
  {
    label: 'St George',
    value: 'CA/NB/Charlotte/St George',
  },
  {
    label: 'St Stephen',
    value: 'CA/NB/Charlotte/St Stephen',
  },
  {
    label: 'Stuart Town',
    value: 'CA/NB/Charlotte/Stuart Town',
  },
  {
    label: 'Tower Hill',
    value: 'CA/NB/Charlotte/Tower Hill',
  },
  {
    label: 'Upper Letang',
    value: 'CA/NB/Charlotte/Upper Letang',
  },
  {
    label: 'Upper Mills',
    value: 'CA/NB/Charlotte/Upper Mills',
  },
  {
    label: 'Utopia',
    value: 'CA/NB/Charlotte/Utopia',
  },
  {
    label: 'Valley Road',
    value: 'CA/NB/Charlotte/Valley Road',
  },
  {
    label: 'Waweig',
    value: 'CA/NB/Charlotte/Waweig',
  },
  {
    label: 'Welshpool',
    value: 'CA/NB/Charlotte/Welshpool',
  },
  {
    label: 'White Head',
    value: 'CA/NB/Charlotte/White Head',
  },
  {
    label: 'White Head Island',
    value: 'CA/NB/Charlotte/White Head Island',
  },
  {
    label: 'Wilsons Beach',
    value: 'CA/NB/Charlotte/Wilsons Beach',
  },
  {
    label: 'Alcida',
    value: 'CA/NB/Gloucester/Alcida',
  },
  {
    label: 'Alderwood',
    value: 'CA/NB/Gloucester/Alderwood',
  },
  {
    label: 'Allardville',
    value: 'CA/NB/Gloucester/Allardville',
  },
  {
    label: 'Anse-Bleue',
    value: 'CA/NB/Gloucester/Anse-Bleue',
  },
  {
    label: 'Baie De Petit-Pokemouche',
    value: 'CA/NB/Gloucester/Baie De Petit-Pokemouche',
  },
  {
    label: 'Bas-Caraquet',
    value: 'CA/NB/Gloucester/Bas-Caraquet',
  },
  {
    label: 'Bas-Paquetville',
    value: 'CA/NB/Gloucester/Bas-Paquetville',
  },
  {
    label: 'Bathurst',
    value: 'CA/NB/Gloucester/Bathurst',
  },
  {
    label: 'Benoit',
    value: 'CA/NB/Gloucester/Benoit',
  },
  {
    label: 'Beresford',
    value: 'CA/NB/Gloucester/Beresford',
  },
  {
    label: 'Bertrand',
    value: 'CA/NB/Gloucester/Bertrand',
  },
  {
    label: 'Big River',
    value: 'CA/NB/Gloucester/Big River',
  },
  {
    label: 'Black Rock',
    value: 'CA/NB/Gloucester/Black Rock',
  },
  {
    label: 'Bois-Blanc',
    value: 'CA/NB/Gloucester/Bois-Blanc',
  },
  {
    label: 'Bois-Gagnon',
    value: 'CA/NB/Gloucester/Bois-Gagnon',
  },
  {
    label: 'Brunswick Mines',
    value: 'CA/NB/Gloucester/Brunswick Mines',
  },
  {
    label: 'Burnsville',
    value: 'CA/NB/Gloucester/Burnsville',
  },
  {
    label: 'Canobie',
    value: 'CA/NB/Gloucester/Canobie',
  },
  {
    label: 'Canton Des Basques',
    value: 'CA/NB/Gloucester/Canton Des Basques',
  },
  {
    label: 'Cap-Bateau',
    value: 'CA/NB/Gloucester/Cap-Bateau',
  },
  {
    label: 'Caraquet',
    value: 'CA/NB/Gloucester/Caraquet',
  },
  {
    label: 'Chamberlain Settlement',
    value: 'CA/NB/Gloucester/Chamberlain Settlement',
  },
  {
    label: 'Chiasson Office',
    value: 'CA/NB/Gloucester/Chiasson Office',
  },
  {
    label: 'Clifton',
    value: 'CA/NB/Gloucester/Clifton',
  },
  {
    label: 'Coteau Road',
    value: 'CA/NB/Gloucester/Coteau Road',
  },
  {
    label: 'Dauversiere',
    value: 'CA/NB/Gloucester/Dauversiere',
  },
  {
    label: 'Dugas',
    value: 'CA/NB/Gloucester/Dugas',
  },
  {
    label: 'Duguayville',
    value: 'CA/NB/Gloucester/Duguayville',
  },
  {
    label: 'Dunlop',
    value: 'CA/NB/Gloucester/Dunlop',
  },
  {
    label: 'Evangeline',
    value: 'CA/NB/Gloucester/Evangeline',
  },
  {
    label: 'Four Roads',
    value: 'CA/NB/Gloucester/Four Roads',
  },
  {
    label: 'Free Grant',
    value: 'CA/NB/Gloucester/Free Grant',
  },
  {
    label: 'Gauvreau',
    value: 'CA/NB/Gloucester/Gauvreau',
  },
  {
    label: 'Gloucester Junction',
    value: 'CA/NB/Gloucester/Gloucester Junction',
  },
  {
    label: 'Goodwin Mill',
    value: 'CA/NB/Gloucester/Goodwin Mill',
  },
  {
    label: 'Grande-Anse',
    value: 'CA/NB/Gloucester/Grande-Anse',
  },
  {
    label: 'Hacheyville',
    value: 'CA/NB/Gloucester/Hacheyville',
  },
  {
    label: 'Haut-Lameque',
    value: 'CA/NB/Gloucester/Haut-Lameque',
  },
  {
    label: 'Haut-Paquetville',
    value: 'CA/NB/Gloucester/Haut-Paquetville',
  },
  {
    label: 'Haut-Sheila',
    value: 'CA/NB/Gloucester/Haut-Sheila',
  },
  {
    label: 'Haut-Shippagan',
    value: 'CA/NB/Gloucester/Haut-Shippagan',
  },
  {
    label: 'Inkerman',
    value: 'CA/NB/Gloucester/Inkerman',
  },
  {
    label: 'Inkerman Ferry',
    value: 'CA/NB/Gloucester/Inkerman Ferry',
  },
  {
    label: 'Janeville',
    value: 'CA/NB/Gloucester/Janeville',
  },
  {
    label: 'Lameque',
    value: 'CA/NB/Gloucester/Lameque',
  },
  {
    label: 'Landry Office',
    value: 'CA/NB/Gloucester/Landry Office',
  },
  {
    label: 'Laplante',
    value: 'CA/NB/Gloucester/Laplante',
  },
  {
    label: 'Le Goulet',
    value: 'CA/NB/Gloucester/Le Goulet',
  },
  {
    label: 'Leech',
    value: 'CA/NB/Gloucester/Leech',
  },
  {
    label: 'Little River Gloucester Co',
    value: 'CA/NB/Gloucester/Little River Gloucester Co',
  },
  {
    label: 'Losier Settlement',
    value: 'CA/NB/Gloucester/Losier Settlement',
  },
  {
    label: 'Lugar',
    value: 'CA/NB/Gloucester/Lugar',
  },
  {
    label: 'Madran',
    value: 'CA/NB/Gloucester/Madran',
  },
  {
    label: 'Maisonnette',
    value: 'CA/NB/Gloucester/Maisonnette',
  },
  {
    label: 'Maltempec',
    value: 'CA/NB/Gloucester/Maltempec',
  },
  {
    label: 'Middle River',
    value: 'CA/NB/Gloucester/Middle River',
  },
  {
    label: 'Miramichi Road',
    value: 'CA/NB/Gloucester/Miramichi Road',
  },
  {
    label: 'Miscou',
    value: 'CA/NB/Gloucester/Miscou',
  },
  {
    label: 'Nepisiguit Falls',
    value: 'CA/NB/Gloucester/Nepisiguit Falls',
  },
  {
    label: 'New Bandon Gloucester Co',
    value: 'CA/NB/Gloucester/New Bandon Gloucester Co',
  },
  {
    label: 'Nicholas Denys',
    value: 'CA/NB/Gloucester/Nicholas Denys',
  },
  {
    label: 'Nigadoo',
    value: 'CA/NB/Gloucester/Nigadoo',
  },
  {
    label: 'North Tetagouche',
    value: 'CA/NB/Gloucester/North Tetagouche',
  },
  {
    label: 'Notre-Dame-Des-Erables',
    value: 'CA/NB/Gloucester/Notre-Dame-Des-Erables',
  },
  {
    label: 'Pabineau Falls',
    value: 'CA/NB/Gloucester/Pabineau Falls',
  },
  {
    label: 'Pabineau First Nation',
    value: 'CA/NB/Gloucester/Pabineau First Nation',
  },
  {
    label: 'Paquetville',
    value: 'CA/NB/Gloucester/Paquetville',
  },
  {
    label: 'Petit-Paquetville',
    value: 'CA/NB/Gloucester/Petit-Paquetville',
  },
  {
    label: 'Petit-Rocher',
    value: 'CA/NB/Gloucester/Petit-Rocher',
  },
  {
    label: 'Petit-Rocher-Nord',
    value: 'CA/NB/Gloucester/Petit-Rocher-Nord',
  },
  {
    label: 'Petit-Rocher-Ouest',
    value: 'CA/NB/Gloucester/Petit-Rocher-Ouest',
  },
  {
    label: 'Petit-Rocher-Sud',
    value: 'CA/NB/Gloucester/Petit-Rocher-Sud',
  },
  {
    label: 'Petit-Shippagan',
    value: 'CA/NB/Gloucester/Petit-Shippagan',
  },
  {
    label: 'Petit Tracadie',
    value: 'CA/NB/Gloucester/Petit Tracadie',
  },
  {
    label: 'Petite-Lameque',
    value: 'CA/NB/Gloucester/Petite-Lameque',
  },
  {
    label: "Petite-Riviere-De-L'ile",
    value: "CA/NB/Gloucester/Petite-Riviere-De-L'ile",
  },
  {
    label: 'Pigeon Hill',
    value: 'CA/NB/Gloucester/Pigeon Hill',
  },
  {
    label: 'Pointe A Bouleau',
    value: 'CA/NB/Gloucester/Pointe A Bouleau',
  },
  {
    label: 'Pointe A Tom',
    value: 'CA/NB/Gloucester/Pointe A Tom',
  },
  {
    label: 'Pointe-Alexandre',
    value: 'CA/NB/Gloucester/Pointe-Alexandre',
  },
  {
    label: 'Pointe-Brule',
    value: 'CA/NB/Gloucester/Pointe-Brule',
  },
  {
    label: 'Pointe-Canot',
    value: 'CA/NB/Gloucester/Pointe-Canot',
  },
  {
    label: 'Pointe Des Robichaud',
    value: 'CA/NB/Gloucester/Pointe Des Robichaud',
  },
  {
    label: 'Pointe-Sauvage',
    value: 'CA/NB/Gloucester/Pointe-Sauvage',
  },
  {
    label: 'Pointe-Verte',
    value: 'CA/NB/Gloucester/Pointe-Verte',
  },
  {
    label: 'Poirier Subdivision',
    value: 'CA/NB/Gloucester/Poirier Subdivision',
  },
  {
    label: 'Pokemouche',
    value: 'CA/NB/Gloucester/Pokemouche',
  },
  {
    label: 'Pokeshaw',
    value: 'CA/NB/Gloucester/Pokeshaw',
  },
  {
    label: 'Pokesudie',
    value: 'CA/NB/Gloucester/Pokesudie',
  },
  {
    label: 'Pont Lafrance',
    value: 'CA/NB/Gloucester/Pont Lafrance',
  },
  {
    label: 'Pont Landry',
    value: 'CA/NB/Gloucester/Pont Landry',
  },
  {
    label: 'Rang-Saint-Georges',
    value: 'CA/NB/Gloucester/Rang-Saint-Georges',
  },
  {
    label: 'Rio Grande',
    value: 'CA/NB/Gloucester/Rio Grande',
  },
  {
    label: 'Riviere A La Truite',
    value: 'CA/NB/Gloucester/Riviere A La Truite',
  },
  {
    label: 'Riviere Du Nord',
    value: 'CA/NB/Gloucester/Riviere Du Nord',
  },
  {
    label: 'Robertville',
    value: 'CA/NB/Gloucester/Robertville',
  },
  {
    label: 'Rocheville',
    value: 'CA/NB/Gloucester/Rocheville',
  },
  {
    label: 'Rosehill',
    value: 'CA/NB/Gloucester/Rosehill',
  },
  {
    label: 'Rough Waters',
    value: 'CA/NB/Gloucester/Rough Waters',
  },
  {
    label: 'Saint-Amateur',
    value: 'CA/NB/Gloucester/Saint-Amateur',
  },
  {
    label: 'Saint-Irenee',
    value: 'CA/NB/Gloucester/Saint-Irenee',
  },
  {
    label: 'Saint-Isidore',
    value: 'CA/NB/Gloucester/Saint-Isidore',
  },
  {
    label: 'Saint-Laurent',
    value: 'CA/NB/Gloucester/Saint-Laurent',
  },
  {
    label: 'Saint-Laurent Nord',
    value: 'CA/NB/Gloucester/Saint-Laurent Nord',
  },
  {
    label: 'Saint-Leolin',
    value: 'CA/NB/Gloucester/Saint-Leolin',
  },
  {
    label: 'Saint-Sauveur',
    value: 'CA/NB/Gloucester/Saint-Sauveur',
  },
  {
    label: 'Saint-Simon',
    value: 'CA/NB/Gloucester/Saint-Simon',
  },
  {
    label: 'Sainte-Anne Gloucester Co',
    value: 'CA/NB/Gloucester/Sainte-Anne Gloucester Co',
  },
  {
    label: 'Sainte-Cecile',
    value: 'CA/NB/Gloucester/Sainte-Cecile',
  },
  {
    label: 'Sainte-Louise',
    value: 'CA/NB/Gloucester/Sainte-Louise',
  },
  {
    label: 'Sainte-Marie-Saint-Raphael',
    value: 'CA/NB/Gloucester/Sainte-Marie-Saint-Raphael',
  },
  {
    label: 'Sainte Rose',
    value: 'CA/NB/Gloucester/Sainte Rose',
  },
  {
    label: 'Sainte-Rosette',
    value: 'CA/NB/Gloucester/Sainte-Rosette',
  },
  {
    label: 'Sainte-Therese Sud',
    value: 'CA/NB/Gloucester/Sainte-Therese Sud',
  },
  {
    label: 'Salisbury West',
    value: 'CA/NB/Gloucester/Salisbury West',
  },
  {
    label: 'Salmon Beach',
    value: 'CA/NB/Gloucester/Salmon Beach',
  },
  {
    label: 'Saumarez',
    value: 'CA/NB/Gloucester/Saumarez',
  },
  {
    label: 'Savoie Landing',
    value: 'CA/NB/Gloucester/Savoie Landing',
  },
  {
    label: 'Shippagan',
    value: 'CA/NB/Gloucester/Shippagan',
  },
  {
    label: 'Six Roads',
    value: 'CA/NB/Gloucester/Six Roads',
  },
  {
    label: 'Sormany',
    value: 'CA/NB/Gloucester/Sormany',
  },
  {
    label: 'South Tetagouche',
    value: 'CA/NB/Gloucester/South Tetagouche',
  },
  {
    label: 'St Pons',
    value: 'CA/NB/Gloucester/St Pons',
  },
  {
    label: 'Stonehaven',
    value: 'CA/NB/Gloucester/Stonehaven',
  },
  {
    label: 'Tetagouche Falls',
    value: 'CA/NB/Gloucester/Tetagouche Falls',
  },
  {
    label: 'Tilley',
    value: 'CA/NB/Gloucester/Tilley',
  },
  {
    label: 'Tilley Road',
    value: 'CA/NB/Gloucester/Tilley Road',
  },
  {
    label: 'Tracadie Beach',
    value: 'CA/NB/Gloucester/Tracadie Beach',
  },
  {
    label: 'Tracadie-Sheila',
    value: 'CA/NB/Gloucester/Tracadie-Sheila',
  },
  {
    label: 'Tremblay',
    value: 'CA/NB/Gloucester/Tremblay',
  },
  {
    label: 'Trudel',
    value: 'CA/NB/Gloucester/Trudel',
  },
  {
    label: 'Val Comeau',
    value: 'CA/NB/Gloucester/Val Comeau',
  },
  {
    label: 'Val-Doucet',
    value: 'CA/NB/Gloucester/Val-Doucet',
  },
  {
    label: 'Village Blanchard',
    value: 'CA/NB/Gloucester/Village Blanchard',
  },
  {
    label: 'Village-Des-Poirier',
    value: 'CA/NB/Gloucester/Village-Des-Poirier',
  },
  {
    label: 'Acadie Siding',
    value: 'CA/NB/Kent/Acadie Siding',
  },
  {
    label: 'Acadieville',
    value: 'CA/NB/Kent/Acadieville',
  },
  {
    label: 'Adamsville',
    value: 'CA/NB/Kent/Adamsville',
  },
  {
    label: 'Aldouane',
    value: 'CA/NB/Kent/Aldouane',
  },
  {
    label: 'Baie De Bouctouche',
    value: 'CA/NB/Kent/Baie De Bouctouche',
  },
  {
    label: 'Balla Philip',
    value: 'CA/NB/Kent/Balla Philip',
  },
  {
    label: 'Bass River',
    value: 'CA/NB/Kent/Bass River',
  },
  {
    label: 'Beersville',
    value: 'CA/NB/Kent/Beersville',
  },
  {
    label: 'Birch Ridge',
    value: 'CA/NB/Kent/Birch Ridge',
  },
  {
    label: 'Bouctouche',
    value: 'CA/NB/Kent/Bouctouche',
  },
  {
    label: 'Bouctouche Cove',
    value: 'CA/NB/Kent/Bouctouche Cove',
  },
  {
    label: 'Bouctouche Reserve',
    value: 'CA/NB/Kent/Bouctouche Reserve',
  },
  {
    label: 'Bouctouche Sud',
    value: 'CA/NB/Kent/Bouctouche Sud',
  },
  {
    label: 'Browns Yard',
    value: 'CA/NB/Kent/Browns Yard',
  },
  {
    label: 'Cails Mills',
    value: 'CA/NB/Kent/Cails Mills',
  },
  {
    label: 'Canisto',
    value: 'CA/NB/Kent/Canisto',
  },
  {
    label: 'Childs Creek',
    value: 'CA/NB/Kent/Childs Creek',
  },
  {
    label: 'Clairville',
    value: 'CA/NB/Kent/Clairville',
  },
  {
    label: 'Coal Branch',
    value: 'CA/NB/Kent/Coal Branch',
  },
  {
    label: 'Cocagne',
    value: 'CA/NB/Kent/Cocagne',
  },
  {
    label: 'Dundas',
    value: 'CA/NB/Kent/Dundas',
  },
  {
    label: 'East Branch',
    value: 'CA/NB/Kent/East Branch',
  },
  {
    label: 'Eel River Bar First Nation',
    value: 'CA/NB/Kent/Eel River Bar First Nation',
  },
  {
    label: 'Elsipogtog First Nation',
    value: 'CA/NB/Kent/Elsipogtog First Nation',
  },
  {
    label: 'Ford Bank',
    value: 'CA/NB/Kent/Ford Bank',
  },
  {
    label: 'Fords Mills',
    value: 'CA/NB/Kent/Fords Mills',
  },
  {
    label: 'Galloway',
    value: 'CA/NB/Kent/Galloway',
  },
  {
    label: 'Gladeside',
    value: 'CA/NB/Kent/Gladeside',
  },
  {
    label: 'Grande-Digue',
    value: 'CA/NB/Kent/Grande-Digue',
  },
  {
    label: 'Harcourt',
    value: 'CA/NB/Kent/Harcourt',
  },
  {
    label: 'Haut-Saint-Antoine',
    value: 'CA/NB/Kent/Haut-Saint-Antoine',
  },
  {
    label: 'Hebert',
    value: 'CA/NB/Kent/Hebert',
  },
  {
    label: 'Indian Island',
    value: 'CA/NB/Kent/Indian Island',
  },
  {
    label: 'Jardineville',
    value: 'CA/NB/Kent/Jardineville',
  },
  {
    label: 'Kent Junction',
    value: 'CA/NB/Kent/Kent Junction',
  },
  {
    label: 'Kouchibouguac',
    value: 'CA/NB/Kent/Kouchibouguac',
  },
  {
    label: 'Kouchibouguac National Park',
    value: 'CA/NB/Kent/Kouchibouguac National Park',
  },
  {
    label: 'Main River',
    value: 'CA/NB/Kent/Main River',
  },
  {
    label: 'Mcintosh Hill',
    value: 'CA/NB/Kent/Mcintosh Hill',
  },
  {
    label: 'Mckees Mills',
    value: 'CA/NB/Kent/Mckees Mills',
  },
  {
    label: 'Mundleville',
    value: 'CA/NB/Kent/Mundleville',
  },
  {
    label: 'Noinville',
    value: 'CA/NB/Kent/Noinville',
  },
  {
    label: 'Notre-Dame',
    value: 'CA/NB/Kent/Notre-Dame',
  },
  {
    label: 'Pelerin',
    value: 'CA/NB/Kent/Pelerin',
  },
  {
    label: 'Pine Ridge',
    value: 'CA/NB/Kent/Pine Ridge',
  },
  {
    label: 'Pointe Dixon Point',
    value: 'CA/NB/Kent/Pointe Dixon Point',
  },
  {
    label: 'Pointe-Sapin',
    value: 'CA/NB/Kent/Pointe-Sapin',
  },
  {
    label: 'Portage St-Louis',
    value: 'CA/NB/Kent/Portage St-Louis',
  },
  {
    label: 'Redmondville',
    value: 'CA/NB/Kent/Redmondville',
  },
  {
    label: 'Renauds Mills',
    value: 'CA/NB/Kent/Renauds Mills',
  },
  {
    label: 'Rexton',
    value: 'CA/NB/Kent/Rexton',
  },
  {
    label: 'Richibouctou-Village',
    value: 'CA/NB/Kent/Richibouctou-Village',
  },
  {
    label: 'Richibucto',
    value: 'CA/NB/Kent/Richibucto',
  },
  {
    label: 'Richibucto-Village',
    value: 'CA/NB/Kent/Richibucto-Village',
  },
  {
    label: 'Rogersville-Est',
    value: 'CA/NB/Kent/Rogersville-Est',
  },
  {
    label: 'Rogersville-Ouest',
    value: 'CA/NB/Kent/Rogersville-Ouest',
  },
  {
    label: 'Saint-Antoine',
    value: 'CA/NB/Kent/Saint-Antoine',
  },
  {
    label: 'Saint-Antoine-De-Kent',
    value: 'CA/NB/Kent/Saint-Antoine-De-Kent',
  },
  {
    label: 'Saint-Antoine Sud',
    value: 'CA/NB/Kent/Saint-Antoine Sud',
  },
  {
    label: 'Saint-Charles',
    value: 'CA/NB/Kent/Saint-Charles',
  },
  {
    label: 'Saint-Damien',
    value: 'CA/NB/Kent/Saint-Damien',
  },
  {
    label: 'Saint-Edouard-De-Kent',
    value: 'CA/NB/Kent/Saint-Edouard-De-Kent',
  },
  {
    label: 'Saint-Gregoire',
    value: 'CA/NB/Kent/Saint-Gregoire',
  },
  {
    label: 'Saint-Ignace',
    value: 'CA/NB/Kent/Saint-Ignace',
  },
  {
    label: 'Saint-Joseph-De-Kent',
    value: 'CA/NB/Kent/Saint-Joseph-De-Kent',
  },
  {
    label: 'Saint-Louis',
    value: 'CA/NB/Kent/Saint-Louis',
  },
  {
    label: 'Saint-Louis-De-Kent',
    value: 'CA/NB/Kent/Saint-Louis-De-Kent',
  },
  {
    label: 'Saint-Maurice',
    value: 'CA/NB/Kent/Saint-Maurice',
  },
  {
    label: 'Saint-Norbert',
    value: 'CA/NB/Kent/Saint-Norbert',
  },
  {
    label: 'Saint-Paul',
    value: 'CA/NB/Kent/Saint-Paul',
  },
  {
    label: 'Saint-Thomas-De-Kent',
    value: 'CA/NB/Kent/Saint-Thomas-De-Kent',
  },
  {
    label: 'Sainte-Anne-De-Kent',
    value: 'CA/NB/Kent/Sainte-Anne-De-Kent',
  },
  {
    label: 'Sainte-Marie-De-Kent',
    value: 'CA/NB/Kent/Sainte-Marie-De-Kent',
  },
  {
    label: 'Salmon River Road',
    value: 'CA/NB/Kent/Salmon River Road',
  },
  {
    label: 'Shediac Bridge-Shediac River',
    value: 'CA/NB/Kent/Shediac Bridge-Shediac River',
  },
  {
    label: "Smith's Corner",
    value: "CA/NB/Kent/Smith's Corner",
  },
  {
    label: 'South Branch Kent Co',
    value: 'CA/NB/Kent/South Branch Kent Co',
  },
  {
    label: 'St-Antoine Nord',
    value: 'CA/NB/Kent/St-Antoine Nord',
  },
  {
    label: 'Targettville',
    value: 'CA/NB/Kent/Targettville',
  },
  {
    label: 'Upper Rexton',
    value: 'CA/NB/Kent/Upper Rexton',
  },
  {
    label: 'West Branch',
    value: 'CA/NB/Kent/West Branch',
  },
  {
    label: 'Anagance',
    value: 'CA/NB/Kings/Anagance',
  },
  {
    label: 'Apohaqui',
    value: 'CA/NB/Kings/Apohaqui',
  },
  {
    label: 'Barnesville',
    value: 'CA/NB/Kings/Barnesville',
  },
  {
    label: 'Bayswater',
    value: 'CA/NB/Kings/Bayswater',
  },
  {
    label: 'Belleisle Creek',
    value: 'CA/NB/Kings/Belleisle Creek',
  },
  {
    label: 'Berwick',
    value: 'CA/NB/Kings/Berwick',
  },
  {
    label: 'Bloomfield Kings Co',
    value: 'CA/NB/Kings/Bloomfield Kings Co',
  },
  {
    label: 'Browns Flat',
    value: 'CA/NB/Kings/Browns Flat',
  },
  {
    label: 'Carsonville',
    value: 'CA/NB/Kings/Carsonville',
  },
  {
    label: 'Carters Point',
    value: 'CA/NB/Kings/Carters Point',
  },
  {
    label: 'Cassidy Lake',
    value: 'CA/NB/Kings/Cassidy Lake',
  },
  {
    label: 'Cedar Camp',
    value: 'CA/NB/Kings/Cedar Camp',
  },
  {
    label: 'Central Greenwich',
    value: 'CA/NB/Kings/Central Greenwich',
  },
  {
    label: 'Chambers Settlement',
    value: 'CA/NB/Kings/Chambers Settlement',
  },
  {
    label: 'Clifton Royal',
    value: 'CA/NB/Kings/Clifton Royal',
  },
  {
    label: 'Clover Hill',
    value: 'CA/NB/Kings/Clover Hill',
  },
  {
    label: 'Collina',
    value: 'CA/NB/Kings/Collina',
  },
  {
    label: 'Cornhill',
    value: 'CA/NB/Kings/Cornhill',
  },
  {
    label: 'Damascus',
    value: 'CA/NB/Kings/Damascus',
  },
  {
    label: 'Darlings Island',
    value: 'CA/NB/Kings/Darlings Island',
  },
  {
    label: 'Donegal',
    value: 'CA/NB/Kings/Donegal',
  },
  {
    label: 'Drurys Cove',
    value: 'CA/NB/Kings/Drurys Cove',
  },
  {
    label: 'Dubee Settlement',
    value: 'CA/NB/Kings/Dubee Settlement',
  },
  {
    label: 'Dunsinane',
    value: 'CA/NB/Kings/Dunsinane',
  },
  {
    label: 'Dutch Valley',
    value: 'CA/NB/Kings/Dutch Valley',
  },
  {
    label: 'Erb Settlement',
    value: 'CA/NB/Kings/Erb Settlement',
  },
  {
    label: 'Erbs Cove',
    value: 'CA/NB/Kings/Erbs Cove',
  },
  {
    label: 'Evandale',
    value: 'CA/NB/Kings/Evandale',
  },
  {
    label: 'French Village Kings Co',
    value: 'CA/NB/Kings/French Village Kings Co',
  },
  {
    label: 'Glenwood Kings Co',
    value: 'CA/NB/Kings/Glenwood Kings Co',
  },
  {
    label: 'Grand Bay-Westfield',
    value: 'CA/NB/Kings/Grand Bay-Westfield',
  },
  {
    label: 'Hammondvale',
    value: 'CA/NB/Kings/Hammondvale',
  },
  {
    label: 'Hampton',
    value: 'CA/NB/Kings/Hampton',
  },
  {
    label: 'Hanford Brook',
    value: 'CA/NB/Kings/Hanford Brook',
  },
  {
    label: 'Hatfield Point',
    value: 'CA/NB/Kings/Hatfield Point',
  },
  {
    label: 'Havelock',
    value: 'CA/NB/Kings/Havelock',
  },
  {
    label: 'Head Of Millstream',
    value: 'CA/NB/Kings/Head Of Millstream',
  },
  {
    label: 'Hillsdale',
    value: 'CA/NB/Kings/Hillsdale',
  },
  {
    label: 'Jeffries Corner',
    value: 'CA/NB/Kings/Jeffries Corner',
  },
  {
    label: 'Jordan Mountain',
    value: 'CA/NB/Kings/Jordan Mountain',
  },
  {
    label: 'Kars',
    value: 'CA/NB/Kings/Kars',
  },
  {
    label: 'Kierstead Mountain',
    value: 'CA/NB/Kings/Kierstead Mountain',
  },
  {
    label: 'Kiersteadville',
    value: 'CA/NB/Kings/Kiersteadville',
  },
  {
    label: 'Kingston',
    value: 'CA/NB/Kings/Kingston',
  },
  {
    label: 'Knightville',
    value: 'CA/NB/Kings/Knightville',
  },
  {
    label: 'Lakeside',
    value: 'CA/NB/Kings/Lakeside',
  },
  {
    label: 'Laketon',
    value: 'CA/NB/Kings/Laketon',
  },
  {
    label: 'Little Salmon River West',
    value: 'CA/NB/Kings/Little Salmon River West',
  },
  {
    label: 'Londonderry',
    value: 'CA/NB/Kings/Londonderry',
  },
  {
    label: 'Long Point',
    value: 'CA/NB/Kings/Long Point',
  },
  {
    label: 'Long Reach',
    value: 'CA/NB/Kings/Long Reach',
  },
  {
    label: 'Long Settlement Kings Co',
    value: 'CA/NB/Kings/Long Settlement Kings Co',
  },
  {
    label: 'Lower Cove',
    value: 'CA/NB/Kings/Lower Cove',
  },
  {
    label: 'Lower Greenwich',
    value: 'CA/NB/Kings/Lower Greenwich',
  },
  {
    label: 'Lower Millstream',
    value: 'CA/NB/Kings/Lower Millstream',
  },
  {
    label: 'Lower Norton',
    value: 'CA/NB/Kings/Lower Norton',
  },
  {
    label: 'Mannhurst',
    value: 'CA/NB/Kings/Mannhurst',
  },
  {
    label: 'Markhamville',
    value: 'CA/NB/Kings/Markhamville',
  },
  {
    label: 'Marrtown',
    value: 'CA/NB/Kings/Marrtown',
  },
  {
    label: 'Mechanic Settlement',
    value: 'CA/NB/Kings/Mechanic Settlement',
  },
  {
    label: 'Midland Kings Co',
    value: 'CA/NB/Kings/Midland Kings Co',
  },
  {
    label: 'Mill Brook',
    value: 'CA/NB/Kings/Mill Brook',
  },
  {
    label: 'Moosehorn Creek',
    value: 'CA/NB/Kings/Moosehorn Creek',
  },
  {
    label: 'Morrisdale',
    value: 'CA/NB/Kings/Morrisdale',
  },
  {
    label: 'Mount Hebron',
    value: 'CA/NB/Kings/Mount Hebron',
  },
  {
    label: 'Mount Pisgah',
    value: 'CA/NB/Kings/Mount Pisgah',
  },
  {
    label: 'Mt Middleton',
    value: 'CA/NB/Kings/Mt Middleton',
  },
  {
    label: 'Nauwigewauk',
    value: 'CA/NB/Kings/Nauwigewauk',
  },
  {
    label: 'Nerepis',
    value: 'CA/NB/Kings/Nerepis',
  },
  {
    label: 'New Canaan',
    value: 'CA/NB/Kings/New Canaan',
  },
  {
    label: 'New Line',
    value: 'CA/NB/Kings/New Line',
  },
  {
    label: 'Newtown',
    value: 'CA/NB/Kings/Newtown',
  },
  {
    label: 'Norton',
    value: 'CA/NB/Kings/Norton',
  },
  {
    label: 'Oak Point Kings Co',
    value: 'CA/NB/Kings/Oak Point Kings Co',
  },
  {
    label: 'Parlee Brook',
    value: 'CA/NB/Kings/Parlee Brook',
  },
  {
    label: 'Parleeville',
    value: 'CA/NB/Kings/Parleeville',
  },
  {
    label: 'Passekeag',
    value: 'CA/NB/Kings/Passekeag',
  },
  {
    label: 'Pearsonville',
    value: 'CA/NB/Kings/Pearsonville',
  },
  {
    label: 'Penobsquis',
    value: 'CA/NB/Kings/Penobsquis',
  },
  {
    label: 'Perry Settlement',
    value: 'CA/NB/Kings/Perry Settlement',
  },
  {
    label: 'Picadilly',
    value: 'CA/NB/Kings/Picadilly',
  },
  {
    label: 'Pleasant Ridge Kings Co',
    value: 'CA/NB/Kings/Pleasant Ridge Kings Co',
  },
  {
    label: 'Plumweseep',
    value: 'CA/NB/Kings/Plumweseep',
  },
  {
    label: 'Poodiac',
    value: 'CA/NB/Kings/Poodiac',
  },
  {
    label: 'Portage Vale',
    value: 'CA/NB/Kings/Portage Vale',
  },
  {
    label: 'Public Landing',
    value: 'CA/NB/Kings/Public Landing',
  },
  {
    label: 'Quispamsis',
    value: 'CA/NB/Kings/Quispamsis',
  },
  {
    label: 'Ratter Corner',
    value: 'CA/NB/Kings/Ratter Corner',
  },
  {
    label: 'Richibucto Road',
    value: 'CA/NB/Kings/Richibucto Road',
  },
  {
    label: 'Riverbank Kings Co',
    value: 'CA/NB/Kings/Riverbank Kings Co',
  },
  {
    label: 'Riverbank South',
    value: 'CA/NB/Kings/Riverbank South',
  },
  {
    label: 'Roachville',
    value: 'CA/NB/Kings/Roachville',
  },
  {
    label: 'Rothesay',
    value: 'CA/NB/Kings/Rothesay',
  },
  {
    label: 'Salt Springs',
    value: 'CA/NB/Kings/Salt Springs',
  },
  {
    label: 'Searsville',
    value: 'CA/NB/Kings/Searsville',
  },
  {
    label: 'Shepody Kings Co',
    value: 'CA/NB/Kings/Shepody Kings Co',
  },
  {
    label: 'Smiths Creek',
    value: 'CA/NB/Kings/Smiths Creek',
  },
  {
    label: 'Smithtown',
    value: 'CA/NB/Kings/Smithtown',
  },
  {
    label: 'Snider Mountain',
    value: 'CA/NB/Kings/Snider Mountain',
  },
  {
    label: 'South Branch Kings Co',
    value: 'CA/NB/Kings/South Branch Kings Co',
  },
  {
    label: 'Southfield',
    value: 'CA/NB/Kings/Southfield',
  },
  {
    label: 'Springdale',
    value: 'CA/NB/Kings/Springdale',
  },
  {
    label: 'Springfield Kings Co',
    value: 'CA/NB/Kings/Springfield Kings Co',
  },
  {
    label: 'Summerfield Kings Co',
    value: 'CA/NB/Kings/Summerfield Kings Co',
  },
  {
    label: 'Summerville',
    value: 'CA/NB/Kings/Summerville',
  },
  {
    label: 'Sussex',
    value: 'CA/NB/Kings/Sussex',
  },
  {
    label: 'Sussex Corner',
    value: 'CA/NB/Kings/Sussex Corner',
  },
  {
    label: 'Sussex East',
    value: 'CA/NB/Kings/Sussex East',
  },
  {
    label: 'Sussex South',
    value: 'CA/NB/Kings/Sussex South',
  },
  {
    label: 'Titusville',
    value: 'CA/NB/Kings/Titusville',
  },
  {
    label: 'Upham',
    value: 'CA/NB/Kings/Upham',
  },
  {
    label: 'Upper Golden Grove',
    value: 'CA/NB/Kings/Upper Golden Grove',
  },
  {
    label: 'Upperton',
    value: 'CA/NB/Kings/Upperton',
  },
  {
    label: 'Vinegar Hill',
    value: 'CA/NB/Kings/Vinegar Hill',
  },
  {
    label: 'Walker Settlement',
    value: 'CA/NB/Kings/Walker Settlement',
  },
  {
    label: 'Wards Creek',
    value: 'CA/NB/Kings/Wards Creek',
  },
  {
    label: 'Waterford',
    value: 'CA/NB/Kings/Waterford',
  },
  {
    label: 'Whites Mountain',
    value: 'CA/NB/Kings/Whites Mountain',
  },
  {
    label: 'Woodmans Point',
    value: 'CA/NB/Kings/Woodmans Point',
  },
  {
    label: 'Baker Brook',
    value: 'CA/NB/Madawaska/Baker Brook',
  },
  {
    label: 'Clair',
    value: 'CA/NB/Madawaska/Clair',
  },
  {
    label: 'Edmundston',
    value: 'CA/NB/Madawaska/Edmundston',
  },
  {
    label: 'Lac Baker',
    value: 'CA/NB/Madawaska/Lac Baker',
  },
  {
    label: 'Madawaska Maliseet First Nation',
    value: 'CA/NB/Madawaska/Madawaska Maliseet First Nation',
  },
  {
    label: 'Notre Dame De Lourdes',
    value: 'CA/NB/Madawaska/Notre Dame De Lourdes',
  },
  {
    label: 'Riviere A La Truite',
    value: 'CA/NB/Madawaska/Riviere A La Truite',
  },
  {
    label: 'Riviere-Verte',
    value: 'CA/NB/Madawaska/Riviere-Verte',
  },
  {
    label: 'Saint-Andre',
    value: 'CA/NB/Madawaska/Saint-Andre',
  },
  {
    label: 'Saint-Basile',
    value: 'CA/NB/Madawaska/Saint-Basile',
  },
  {
    label: 'Saint-Francois-De-Madawaska',
    value: 'CA/NB/Madawaska/Saint-Francois-De-Madawaska',
  },
  {
    label: 'Saint-Jacques',
    value: 'CA/NB/Madawaska/Saint-Jacques',
  },
  {
    label: 'Saint-Leonard',
    value: 'CA/NB/Madawaska/Saint-Leonard',
  },
  {
    label: 'Saint-Leonard-Parent',
    value: 'CA/NB/Madawaska/Saint-Leonard-Parent',
  },
  {
    label: 'Sainte-Anne-De-Madawaska',
    value: 'CA/NB/Madawaska/Sainte-Anne-De-Madawaska',
  },
  {
    label: 'Siegas',
    value: 'CA/NB/Madawaska/Siegas',
  },
  {
    label: 'St-Hilaire',
    value: 'CA/NB/Madawaska/St-Hilaire',
  },
  {
    label: 'St-Joseph-De-Madawaska',
    value: 'CA/NB/Madawaska/St-Joseph-De-Madawaska',
  },
  {
    label: 'Verret',
    value: 'CA/NB/Madawaska/Verret',
  },
  {
    label: 'Allainville',
    value: 'CA/NB/Northumberland/Allainville',
  },
  {
    label: 'Arbeau Settlement',
    value: 'CA/NB/Northumberland/Arbeau Settlement',
  },
  {
    label: 'Baie-Sainte-Anne',
    value: 'CA/NB/Northumberland/Baie-Sainte-Anne',
  },
  {
    label: 'Barnaby',
    value: 'CA/NB/Northumberland/Barnaby',
  },
  {
    label: 'Barnettville',
    value: 'CA/NB/Northumberland/Barnettville',
  },
  {
    label: 'Barryville',
    value: 'CA/NB/Northumberland/Barryville',
  },
  {
    label: 'Bartholomew',
    value: 'CA/NB/Northumberland/Bartholomew',
  },
  {
    label: 'Bartibog',
    value: 'CA/NB/Northumberland/Bartibog',
  },
  {
    label: 'Bartibog Bridge',
    value: 'CA/NB/Northumberland/Bartibog Bridge',
  },
  {
    label: 'Bay Du Vin',
    value: 'CA/NB/Northumberland/Bay Du Vin',
  },
  {
    label: 'Beaverbrook',
    value: 'CA/NB/Northumberland/Beaverbrook',
  },
  {
    label: 'Bellefond',
    value: 'CA/NB/Northumberland/Bellefond',
  },
  {
    label: 'Bettsburg',
    value: 'CA/NB/Northumberland/Bettsburg',
  },
  {
    label: 'Big Hole',
    value: 'CA/NB/Northumberland/Big Hole',
  },
  {
    label: 'Black River',
    value: 'CA/NB/Northumberland/Black River',
  },
  {
    label: 'Black River Bridge',
    value: 'CA/NB/Northumberland/Black River Bridge',
  },
  {
    label: 'Blackville',
    value: 'CA/NB/Northumberland/Blackville',
  },
  {
    label: 'Blissfield',
    value: 'CA/NB/Northumberland/Blissfield',
  },
  {
    label: 'Boiestown',
    value: 'CA/NB/Northumberland/Boiestown',
  },
  {
    label: 'Boom Road',
    value: 'CA/NB/Northumberland/Boom Road',
  },
  {
    label: 'Brantville',
    value: 'CA/NB/Northumberland/Brantville',
  },
  {
    label: 'Breadalbane',
    value: 'CA/NB/Northumberland/Breadalbane',
  },
  {
    label: 'Bryenton',
    value: 'CA/NB/Northumberland/Bryenton',
  },
  {
    label: 'Burnt Church',
    value: 'CA/NB/Northumberland/Burnt Church',
  },
  {
    label: 'Burnt Church First Nation',
    value: 'CA/NB/Northumberland/Burnt Church First Nation',
  },
  {
    label: 'Cains River',
    value: 'CA/NB/Northumberland/Cains River',
  },
  {
    label: 'Caissie Road',
    value: 'CA/NB/Northumberland/Caissie Road',
  },
  {
    label: 'Carrolls Crossing',
    value: 'CA/NB/Northumberland/Carrolls Crossing',
  },
  {
    label: 'Cassilis',
    value: 'CA/NB/Northumberland/Cassilis',
  },
  {
    label: 'Chaplin Island Road',
    value: 'CA/NB/Northumberland/Chaplin Island Road',
  },
  {
    label: 'Chelmsford',
    value: 'CA/NB/Northumberland/Chelmsford',
  },
  {
    label: 'Collette',
    value: 'CA/NB/Northumberland/Collette',
  },
  {
    label: 'Curventon',
    value: 'CA/NB/Northumberland/Curventon',
  },
  {
    label: 'Derby',
    value: 'CA/NB/Northumberland/Derby',
  },
  {
    label: 'Derby Junction',
    value: 'CA/NB/Northumberland/Derby Junction',
  },
  {
    label: 'Doaktown',
    value: 'CA/NB/Northumberland/Doaktown',
  },
  {
    label: 'Doyles Brook',
    value: 'CA/NB/Northumberland/Doyles Brook',
  },
  {
    label: 'Eel Ground',
    value: 'CA/NB/Northumberland/Eel Ground',
  },
  {
    label: 'Escuminac',
    value: 'CA/NB/Northumberland/Escuminac',
  },
  {
    label: 'Exmoor',
    value: 'CA/NB/Northumberland/Exmoor',
  },
  {
    label: 'Fairisle',
    value: 'CA/NB/Northumberland/Fairisle',
  },
  {
    label: 'Gardiner Point',
    value: 'CA/NB/Northumberland/Gardiner Point',
  },
  {
    label: 'Glenwood',
    value: 'CA/NB/Northumberland/Glenwood',
  },
  {
    label: 'Grand Lake Road',
    value: 'CA/NB/Northumberland/Grand Lake Road',
  },
  {
    label: 'Gray Rapids',
    value: 'CA/NB/Northumberland/Gray Rapids',
  },
  {
    label: 'Halcomb',
    value: 'CA/NB/Northumberland/Halcomb',
  },
  {
    label: 'Hardwicke',
    value: 'CA/NB/Northumberland/Hardwicke',
  },
  {
    label: 'Haut-Riviere-Du-Portage',
    value: 'CA/NB/Northumberland/Haut-Riviere-Du-Portage',
  },
  {
    label: 'Hay Settlement',
    value: 'CA/NB/Northumberland/Hay Settlement',
  },
  {
    label: 'Hazelton',
    value: 'CA/NB/Northumberland/Hazelton',
  },
  {
    label: 'Hilltop',
    value: 'CA/NB/Northumberland/Hilltop',
  },
  {
    label: 'Holtville',
    value: 'CA/NB/Northumberland/Holtville',
  },
  {
    label: 'Howard',
    value: 'CA/NB/Northumberland/Howard',
  },
  {
    label: 'Keenans',
    value: 'CA/NB/Northumberland/Keenans',
  },
  {
    label: 'Lagaceville',
    value: 'CA/NB/Northumberland/Lagaceville',
  },
  {
    label: 'Lavillette',
    value: 'CA/NB/Northumberland/Lavillette',
  },
  {
    label: 'Little Bartibog',
    value: 'CA/NB/Northumberland/Little Bartibog',
  },
  {
    label: 'Lockstead',
    value: 'CA/NB/Northumberland/Lockstead',
  },
  {
    label: 'Lower Derby',
    value: 'CA/NB/Northumberland/Lower Derby',
  },
  {
    label: 'Lower Newcastle',
    value: 'CA/NB/Northumberland/Lower Newcastle',
  },
  {
    label: 'Ludlow',
    value: 'CA/NB/Northumberland/Ludlow',
  },
  {
    label: 'Lyttleton',
    value: 'CA/NB/Northumberland/Lyttleton',
  },
  {
    label: 'Maple Glen',
    value: 'CA/NB/Northumberland/Maple Glen',
  },
  {
    label: 'Matthews Settlement',
    value: 'CA/NB/Northumberland/Matthews Settlement',
  },
  {
    label: 'Mckinleyville',
    value: 'CA/NB/Northumberland/Mckinleyville',
  },
  {
    label: 'Mcnamee',
    value: 'CA/NB/Northumberland/Mcnamee',
  },
  {
    label: 'Millerton',
    value: 'CA/NB/Northumberland/Millerton',
  },
  {
    label: 'Miramichi',
    value: 'CA/NB/Northumberland/Miramichi',
  },
  {
    label: 'Miramichi Bay',
    value: 'CA/NB/Northumberland/Miramichi Bay',
  },
  {
    label: 'Murray Settlement',
    value: 'CA/NB/Northumberland/Murray Settlement',
  },
  {
    label: 'Napan',
    value: 'CA/NB/Northumberland/Napan',
  },
  {
    label: 'Neguac',
    value: 'CA/NB/Northumberland/Neguac',
  },
  {
    label: 'Nelson Hollow',
    value: 'CA/NB/Northumberland/Nelson Hollow',
  },
  {
    label: 'New Bandon Northumb Co',
    value: 'CA/NB/Northumberland/New Bandon Northumb Co',
  },
  {
    label: 'New Jersey',
    value: 'CA/NB/Northumberland/New Jersey',
  },
  {
    label: 'Oak Point',
    value: 'CA/NB/Northumberland/Oak Point',
  },
  {
    label: 'Parker Road',
    value: 'CA/NB/Northumberland/Parker Road',
  },
  {
    label: 'Pineville',
    value: 'CA/NB/Northumberland/Pineville',
  },
  {
    label: 'Porter Cove',
    value: 'CA/NB/Northumberland/Porter Cove',
  },
  {
    label: 'Priceville',
    value: 'CA/NB/Northumberland/Priceville',
  },
  {
    label: 'Quarryville',
    value: 'CA/NB/Northumberland/Quarryville',
  },
  {
    label: 'Red Bank',
    value: 'CA/NB/Northumberland/Red Bank',
  },
  {
    label: 'Red Bank Reserve',
    value: 'CA/NB/Northumberland/Red Bank Reserve',
  },
  {
    label: 'Red Rock',
    value: 'CA/NB/Northumberland/Red Rock',
  },
  {
    label: 'Renous',
    value: 'CA/NB/Northumberland/Renous',
  },
  {
    label: 'Riviere-Du-Portage',
    value: 'CA/NB/Northumberland/Riviere-Du-Portage',
  },
  {
    label: 'Robichaud Settlement',
    value: 'CA/NB/Northumberland/Robichaud Settlement',
  },
  {
    label: 'Rogersville',
    value: 'CA/NB/Northumberland/Rogersville',
  },
  {
    label: 'Rogersville-Est',
    value: 'CA/NB/Northumberland/Rogersville-Est',
  },
  {
    label: 'Rogersville-Ouest',
    value: 'CA/NB/Northumberland/Rogersville-Ouest',
  },
  {
    label: 'Rosaireville',
    value: 'CA/NB/Northumberland/Rosaireville',
  },
  {
    label: 'Russellville',
    value: 'CA/NB/Northumberland/Russellville',
  },
  {
    label: 'Saint-Wilfred',
    value: 'CA/NB/Northumberland/Saint-Wilfred',
  },
  {
    label: 'Sevogle',
    value: 'CA/NB/Northumberland/Sevogle',
  },
  {
    label: 'Sillikers',
    value: 'CA/NB/Northumberland/Sillikers',
  },
  {
    label: 'Smith Crossing',
    value: 'CA/NB/Northumberland/Smith Crossing',
  },
  {
    label: 'South Esk',
    value: 'CA/NB/Northumberland/South Esk',
  },
  {
    label: 'South Nelson',
    value: 'CA/NB/Northumberland/South Nelson',
  },
  {
    label: 'St Margarets',
    value: 'CA/NB/Northumberland/St Margarets',
  },
  {
    label: 'Storeytown',
    value: 'CA/NB/Northumberland/Storeytown',
  },
  {
    label: 'Strathadam',
    value: 'CA/NB/Northumberland/Strathadam',
  },
  {
    label: 'Stymiest',
    value: 'CA/NB/Northumberland/Stymiest',
  },
  {
    label: 'Sunny Corner',
    value: 'CA/NB/Northumberland/Sunny Corner',
  },
  {
    label: 'Tabusintac',
    value: 'CA/NB/Northumberland/Tabusintac',
  },
  {
    label: 'Trout Brook',
    value: 'CA/NB/Northumberland/Trout Brook',
  },
  {
    label: 'Upper Blackville',
    value: 'CA/NB/Northumberland/Upper Blackville',
  },
  {
    label: 'Upper Derby',
    value: 'CA/NB/Northumberland/Upper Derby',
  },
  {
    label: 'Village-Saint-Laurent',
    value: 'CA/NB/Northumberland/Village-Saint-Laurent',
  },
  {
    label: 'Warwick Settlement',
    value: 'CA/NB/Northumberland/Warwick Settlement',
  },
  {
    label: 'Wayerton',
    value: 'CA/NB/Northumberland/Wayerton',
  },
  {
    label: 'Weaver Siding',
    value: 'CA/NB/Northumberland/Weaver Siding',
  },
  {
    label: 'White Rapids',
    value: 'CA/NB/Northumberland/White Rapids',
  },
  {
    label: 'Whitney',
    value: 'CA/NB/Northumberland/Whitney',
  },
  {
    label: 'Williamstown',
    value: 'CA/NB/Northumberland/Williamstown',
  },
  {
    label: 'Big Cove Queens Co',
    value: 'CA/NB/Queens/Big Cove Queens Co',
  },
  {
    label: 'Briggs Corner Queens Co',
    value: 'CA/NB/Queens/Briggs Corner Queens Co',
  },
  {
    label: 'Bronson Settlement',
    value: 'CA/NB/Queens/Bronson Settlement',
  },
  {
    label: 'Cambridge-Narrows',
    value: 'CA/NB/Queens/Cambridge-Narrows',
  },
  {
    label: 'Canaan Forks',
    value: 'CA/NB/Queens/Canaan Forks',
  },
  {
    label: 'Central Hampstead',
    value: 'CA/NB/Queens/Central Hampstead',
  },
  {
    label: 'Chipman',
    value: 'CA/NB/Queens/Chipman',
  },
  {
    label: 'Clarendon',
    value: 'CA/NB/Queens/Clarendon',
  },
  {
    label: 'Clarks Corner',
    value: 'CA/NB/Queens/Clarks Corner',
  },
  {
    label: 'Coal Creek',
    value: 'CA/NB/Queens/Coal Creek',
  },
  {
    label: 'Codys',
    value: 'CA/NB/Queens/Codys',
  },
  {
    label: 'Coles Island Queens Co',
    value: 'CA/NB/Queens/Coles Island Queens Co',
  },
  {
    label: 'Cumberland Bay',
    value: 'CA/NB/Queens/Cumberland Bay',
  },
  {
    label: 'Douglas Harbour',
    value: 'CA/NB/Queens/Douglas Harbour',
  },
  {
    label: 'Dufferin Queens Co',
    value: 'CA/NB/Queens/Dufferin Queens Co',
  },
  {
    label: 'Elm Hill',
    value: 'CA/NB/Queens/Elm Hill',
  },
  {
    label: 'Evans Road',
    value: 'CA/NB/Queens/Evans Road',
  },
  {
    label: 'Flowers Cove',
    value: 'CA/NB/Queens/Flowers Cove',
  },
  {
    label: 'Gagetown',
    value: 'CA/NB/Queens/Gagetown',
  },
  {
    label: 'Gaspereau Forks',
    value: 'CA/NB/Queens/Gaspereau Forks',
  },
  {
    label: 'Hampstead',
    value: 'CA/NB/Queens/Hampstead',
  },
  {
    label: 'Henderson Settlement',
    value: 'CA/NB/Queens/Henderson Settlement',
  },
  {
    label: 'Highfield',
    value: 'CA/NB/Queens/Highfield',
  },
  {
    label: 'Hunters Home',
    value: 'CA/NB/Queens/Hunters Home',
  },
  {
    label: 'Iron Bound Cove',
    value: 'CA/NB/Queens/Iron Bound Cove',
  },
  {
    label: 'Jemseg',
    value: 'CA/NB/Queens/Jemseg',
  },
  {
    label: 'Little River Hill',
    value: 'CA/NB/Queens/Little River Hill',
  },
  {
    label: 'Long Creek',
    value: 'CA/NB/Queens/Long Creek',
  },
  {
    label: 'Lower Cambridge',
    value: 'CA/NB/Queens/Lower Cambridge',
  },
  {
    label: 'Maquapit Lake',
    value: 'CA/NB/Queens/Maquapit Lake',
  },
  {
    label: 'Midland Queens Co',
    value: 'CA/NB/Queens/Midland Queens Co',
  },
  {
    label: 'Mill Cove',
    value: 'CA/NB/Queens/Mill Cove',
  },
  {
    label: 'Minto',
    value: 'CA/NB/Queens/Minto',
  },
  {
    label: 'Newcastle Centre',
    value: 'CA/NB/Queens/Newcastle Centre',
  },
  {
    label: 'Newcastle Creek',
    value: 'CA/NB/Queens/Newcastle Creek',
  },
  {
    label: 'Old Avon',
    value: 'CA/NB/Queens/Old Avon',
  },
  {
    label: 'Picketts Cove',
    value: 'CA/NB/Queens/Picketts Cove',
  },
  {
    label: 'Pleasant Villa',
    value: 'CA/NB/Queens/Pleasant Villa',
  },
  {
    label: 'Princess Park',
    value: 'CA/NB/Queens/Princess Park',
  },
  {
    label: 'Printz Cove',
    value: 'CA/NB/Queens/Printz Cove',
  },
  {
    label: 'Queenstown',
    value: 'CA/NB/Queens/Queenstown',
  },
  {
    label: 'Red Bank Queens Co',
    value: 'CA/NB/Queens/Red Bank Queens Co',
  },
  {
    label: 'Salmon Creek',
    value: 'CA/NB/Queens/Salmon Creek',
  },
  {
    label: 'Scotchtown',
    value: 'CA/NB/Queens/Scotchtown',
  },
  {
    label: 'Shannon',
    value: 'CA/NB/Queens/Shannon',
  },
  {
    label: 'Sypher Cove',
    value: 'CA/NB/Queens/Sypher Cove',
  },
  {
    label: 'Upper Gagetown',
    value: 'CA/NB/Queens/Upper Gagetown',
  },
  {
    label: 'Upper Hampstead',
    value: 'CA/NB/Queens/Upper Hampstead',
  },
  {
    label: 'Waterborough',
    value: 'CA/NB/Queens/Waterborough',
  },
  {
    label: 'Welsford',
    value: 'CA/NB/Queens/Welsford',
  },
  {
    label: 'Whites Cove',
    value: 'CA/NB/Queens/Whites Cove',
  },
  {
    label: 'Wickham',
    value: 'CA/NB/Queens/Wickham',
  },
  {
    label: 'Wirral',
    value: 'CA/NB/Queens/Wirral',
  },
  {
    label: 'Wuhrs Beach',
    value: 'CA/NB/Queens/Wuhrs Beach',
  },
  {
    label: 'Youngs Cove',
    value: 'CA/NB/Queens/Youngs Cove',
  },
  {
    label: 'Adams Gulch',
    value: 'CA/NB/Restigouche/Adams Gulch',
  },
  {
    label: 'Atholville',
    value: 'CA/NB/Restigouche/Atholville',
  },
  {
    label: 'Balmoral',
    value: 'CA/NB/Restigouche/Balmoral',
  },
  {
    label: 'Balmoral Est',
    value: 'CA/NB/Restigouche/Balmoral Est',
  },
  {
    label: 'Balmoral Sud',
    value: 'CA/NB/Restigouche/Balmoral Sud',
  },
  {
    label: 'Belledune',
    value: 'CA/NB/Restigouche/Belledune',
  },
  {
    label: 'Benjamin River',
    value: 'CA/NB/Restigouche/Benjamin River',
  },
  {
    label: 'Black Point',
    value: 'CA/NB/Restigouche/Black Point',
  },
  {
    label: 'Blackland Restigouche Co',
    value: 'CA/NB/Restigouche/Blackland Restigouche Co',
  },
  {
    label: 'Blair Athol',
    value: 'CA/NB/Restigouche/Blair Athol',
  },
  {
    label: 'Campbellton',
    value: 'CA/NB/Restigouche/Campbellton',
  },
  {
    label: 'Charlo',
    value: 'CA/NB/Restigouche/Charlo',
  },
  {
    label: 'Charlo South',
    value: 'CA/NB/Restigouche/Charlo South',
  },
  {
    label: 'Dalhousie',
    value: 'CA/NB/Restigouche/Dalhousie',
  },
  {
    label: 'Dalhousie Junction',
    value: 'CA/NB/Restigouche/Dalhousie Junction',
  },
  {
    label: 'Dawsonville',
    value: 'CA/NB/Restigouche/Dawsonville',
  },
  {
    label: 'Dundee',
    value: 'CA/NB/Restigouche/Dundee',
  },
  {
    label: 'Eel River Bar First Nation',
    value: 'CA/NB/Restigouche/Eel River Bar First Nation',
  },
  {
    label: 'Eel River Cove',
    value: 'CA/NB/Restigouche/Eel River Cove',
  },
  {
    label: 'Eel River Crossing',
    value: 'CA/NB/Restigouche/Eel River Crossing',
  },
  {
    label: 'Flatlands',
    value: 'CA/NB/Restigouche/Flatlands',
  },
  {
    label: 'Glencoe',
    value: 'CA/NB/Restigouche/Glencoe',
  },
  {
    label: 'Glenlevit',
    value: 'CA/NB/Restigouche/Glenlevit',
  },
  {
    label: 'Glenvale',
    value: 'CA/NB/Restigouche/Glenvale',
  },
  {
    label: 'Glenwood',
    value: 'CA/NB/Restigouche/Glenwood',
  },
  {
    label: 'Gravel Hill',
    value: 'CA/NB/Restigouche/Gravel Hill',
  },
  {
    label: 'Kedgwick',
    value: 'CA/NB/Restigouche/Kedgwick',
  },
  {
    label: 'Kedgwick Nord',
    value: 'CA/NB/Restigouche/Kedgwick Nord',
  },
  {
    label: 'Kedgwick Ouest',
    value: 'CA/NB/Restigouche/Kedgwick Ouest',
  },
  {
    label: 'Kedgwick River',
    value: 'CA/NB/Restigouche/Kedgwick River',
  },
  {
    label: 'Kedgwick Sud',
    value: 'CA/NB/Restigouche/Kedgwick Sud',
  },
  {
    label: 'Lorne',
    value: 'CA/NB/Restigouche/Lorne',
  },
  {
    label: "Mann's Mountain",
    value: "CA/NB/Restigouche/Mann's Mountain",
  },
  {
    label: 'Mcleods',
    value: 'CA/NB/Restigouche/Mcleods',
  },
  {
    label: 'Menneval',
    value: 'CA/NB/Restigouche/Menneval',
  },
  {
    label: 'Nash Creek',
    value: 'CA/NB/Restigouche/Nash Creek',
  },
  {
    label: 'New Mills',
    value: 'CA/NB/Restigouche/New Mills',
  },
  {
    label: 'North Shannonvale',
    value: 'CA/NB/Restigouche/North Shannonvale',
  },
  {
    label: 'Point La Nim',
    value: 'CA/NB/Restigouche/Point La Nim',
  },
  {
    label: 'Robinsonville',
    value: 'CA/NB/Restigouche/Robinsonville',
  },
  {
    label: 'Saint-Arthur',
    value: 'CA/NB/Restigouche/Saint-Arthur',
  },
  {
    label: 'Saint-Martin-De-Restigouche',
    value: 'CA/NB/Restigouche/Saint-Martin-De-Restigouche',
  },
  {
    label: 'Saint-Maure',
    value: 'CA/NB/Restigouche/Saint-Maure',
  },
  {
    label: 'Saint-Quentin',
    value: 'CA/NB/Restigouche/Saint-Quentin',
  },
  {
    label: 'Sea Side',
    value: 'CA/NB/Restigouche/Sea Side',
  },
  {
    label: 'Squaw Cap',
    value: 'CA/NB/Restigouche/Squaw Cap',
  },
  {
    label: 'St-Jean-Baptiste',
    value: 'CA/NB/Restigouche/St-Jean-Baptiste',
  },
  {
    label: 'Sunnyside Beach',
    value: 'CA/NB/Restigouche/Sunnyside Beach',
  },
  {
    label: 'Tide Head',
    value: 'CA/NB/Restigouche/Tide Head',
  },
  {
    label: 'Upsalquitch',
    value: 'CA/NB/Restigouche/Upsalquitch',
  },
  {
    label: "Val-D'amour",
    value: "CA/NB/Restigouche/Val-D'amour",
  },
  {
    label: 'Whites Brook',
    value: 'CA/NB/Restigouche/Whites Brook',
  },
  {
    label: 'Wyers Brook',
    value: 'CA/NB/Restigouche/Wyers Brook',
  },
  {
    label: 'Bains Corner',
    value: 'CA/NB/Saint John/Bains Corner',
  },
  {
    label: 'Baxters Corner',
    value: 'CA/NB/Saint John/Baxters Corner',
  },
  {
    label: 'Bay View',
    value: 'CA/NB/Saint John/Bay View',
  },
  {
    label: 'Chance Harbour',
    value: 'CA/NB/Saint John/Chance Harbour',
  },
  {
    label: 'Clover Valley',
    value: 'CA/NB/Saint John/Clover Valley',
  },
  {
    label: 'Dipper Harbour',
    value: 'CA/NB/Saint John/Dipper Harbour',
  },
  {
    label: 'Gardner Creek',
    value: 'CA/NB/Saint John/Gardner Creek',
  },
  {
    label: 'Garnett Settlement',
    value: 'CA/NB/Saint John/Garnett Settlement',
  },
  {
    label: 'Grove Hill',
    value: 'CA/NB/Saint John/Grove Hill',
  },
  {
    label: 'Little Lepreau',
    value: 'CA/NB/Saint John/Little Lepreau',
  },
  {
    label: 'Little Salmon River West',
    value: 'CA/NB/Saint John/Little Salmon River West',
  },
  {
    label: 'Mispec',
    value: 'CA/NB/Saint John/Mispec',
  },
  {
    label: 'Musquash',
    value: 'CA/NB/Saint John/Musquash',
  },
  {
    label: 'Orange Hill',
    value: 'CA/NB/Saint John/Orange Hill',
  },
  {
    label: 'Pokiok',
    value: 'CA/NB/Saint John/Pokiok',
  },
  {
    label: 'Prince Of Wales',
    value: 'CA/NB/Saint John/Prince Of Wales',
  },
  {
    label: 'Rowley',
    value: 'CA/NB/Saint John/Rowley',
  },
  {
    label: 'Saint John',
    value: 'CA/NB/Saint John/Saint John',
  },
  {
    label: 'Salmon River',
    value: 'CA/NB/Saint John/Salmon River',
  },
  {
    label: 'Shanklin',
    value: 'CA/NB/Saint John/Shanklin',
  },
  {
    label: 'St Martins',
    value: 'CA/NB/Saint John/St Martins',
  },
  {
    label: 'St Martins North',
    value: 'CA/NB/Saint John/St Martins North',
  },
  {
    label: 'Tynemouth Creek',
    value: 'CA/NB/Saint John/Tynemouth Creek',
  },
  {
    label: 'Upper Loch Lomond',
    value: 'CA/NB/Saint John/Upper Loch Lomond',
  },
  {
    label: 'West Quaco',
    value: 'CA/NB/Saint John/West Quaco',
  },
  {
    label: 'Willow Grove',
    value: 'CA/NB/Saint John/Willow Grove',
  },
  {
    label: 'Albrights Corner',
    value: 'CA/NB/Sunbury/Albrights Corner',
  },
  {
    label: 'Burpee',
    value: 'CA/NB/Sunbury/Burpee',
  },
  {
    label: 'Burton',
    value: 'CA/NB/Sunbury/Burton',
  },
  {
    label: 'Central Blissville',
    value: 'CA/NB/Sunbury/Central Blissville',
  },
  {
    label: 'Fredericton Junction',
    value: 'CA/NB/Sunbury/Fredericton Junction',
  },
  {
    label: 'French Lake',
    value: 'CA/NB/Sunbury/French Lake',
  },
  {
    label: 'Geary',
    value: 'CA/NB/Sunbury/Geary',
  },
  {
    label: 'Haneytown',
    value: 'CA/NB/Sunbury/Haneytown',
  },
  {
    label: 'Hardwood Ridge',
    value: 'CA/NB/Sunbury/Hardwood Ridge',
  },
  {
    label: 'Harvey York Co',
    value: 'CA/NB/Sunbury/Harvey York Co',
  },
  {
    label: 'Hoyt',
    value: 'CA/NB/Sunbury/Hoyt',
  },
  {
    label: 'Immigrant Road',
    value: 'CA/NB/Sunbury/Immigrant Road',
  },
  {
    label: 'Lakeville Corner',
    value: 'CA/NB/Sunbury/Lakeville Corner',
  },
  {
    label: 'Lincoln',
    value: 'CA/NB/Sunbury/Lincoln',
  },
  {
    label: 'Little River Hill',
    value: 'CA/NB/Sunbury/Little River Hill',
  },
  {
    label: 'Maugerville',
    value: 'CA/NB/Sunbury/Maugerville',
  },
  {
    label: 'New Avon',
    value: 'CA/NB/Sunbury/New Avon',
  },
  {
    label: 'New England Settlement',
    value: 'CA/NB/Sunbury/New England Settlement',
  },
  {
    label: 'New Zion',
    value: 'CA/NB/Sunbury/New Zion',
  },
  {
    label: 'Noonan',
    value: 'CA/NB/Sunbury/Noonan',
  },
  {
    label: 'North Forks',
    value: 'CA/NB/Sunbury/North Forks',
  },
  {
    label: 'Oromocto',
    value: 'CA/NB/Sunbury/Oromocto',
  },
  {
    label: 'Peltoma Settlement',
    value: 'CA/NB/Sunbury/Peltoma Settlement',
  },
  {
    label: 'Pondstream',
    value: 'CA/NB/Sunbury/Pondstream',
  },
  {
    label: 'Ripples',
    value: 'CA/NB/Sunbury/Ripples',
  },
  {
    label: 'Rooth',
    value: 'CA/NB/Sunbury/Rooth',
  },
  {
    label: 'Rusagonis',
    value: 'CA/NB/Sunbury/Rusagonis',
  },
  {
    label: 'Sheffield',
    value: 'CA/NB/Sunbury/Sheffield',
  },
  {
    label: 'Slope',
    value: 'CA/NB/Sunbury/Slope',
  },
  {
    label: 'Swan Creek',
    value: 'CA/NB/Sunbury/Swan Creek',
  },
  {
    label: 'Three Tree Creek',
    value: 'CA/NB/Sunbury/Three Tree Creek',
  },
  {
    label: 'Tracy',
    value: 'CA/NB/Sunbury/Tracy',
  },
  {
    label: 'Tracyville',
    value: 'CA/NB/Sunbury/Tracyville',
  },
  {
    label: 'Upper Salmon Creek',
    value: 'CA/NB/Sunbury/Upper Salmon Creek',
  },
  {
    label: 'Upper Tracy',
    value: 'CA/NB/Sunbury/Upper Tracy',
  },
  {
    label: 'Vespra',
    value: 'CA/NB/Sunbury/Vespra',
  },
  {
    label: 'Waasis',
    value: 'CA/NB/Sunbury/Waasis',
  },
  {
    label: 'Waterville-Sunbury',
    value: 'CA/NB/Sunbury/Waterville-Sunbury',
  },
  {
    label: 'Wuhrs Beach',
    value: 'CA/NB/Sunbury/Wuhrs Beach',
  },
  {
    label: 'Anderson Road',
    value: 'CA/NB/Victoria/Anderson Road',
  },
  {
    label: 'Anfield',
    value: 'CA/NB/Victoria/Anfield',
  },
  {
    label: 'Aroostook',
    value: 'CA/NB/Victoria/Aroostook',
  },
  {
    label: 'Aroostook Junction',
    value: 'CA/NB/Victoria/Aroostook Junction',
  },
  {
    label: 'Arthurette',
    value: 'CA/NB/Victoria/Arthurette',
  },
  {
    label: 'Bairdsville',
    value: 'CA/NB/Victoria/Bairdsville',
  },
  {
    label: 'Beaconsfield',
    value: 'CA/NB/Victoria/Beaconsfield',
  },
  {
    label: 'Blue Bell',
    value: 'CA/NB/Victoria/Blue Bell',
  },
  {
    label: 'Blue Mountain Bend',
    value: 'CA/NB/Victoria/Blue Mountain Bend',
  },
  {
    label: 'Bon Accord',
    value: 'CA/NB/Victoria/Bon Accord',
  },
  {
    label: 'Burntland Brook',
    value: 'CA/NB/Victoria/Burntland Brook',
  },
  {
    label: 'California Settlement',
    value: 'CA/NB/Victoria/California Settlement',
  },
  {
    label: 'Carlingford',
    value: 'CA/NB/Victoria/Carlingford',
  },
  {
    label: 'Craig Flats',
    value: 'CA/NB/Victoria/Craig Flats',
  },
  {
    label: 'Crombie Settlement',
    value: 'CA/NB/Victoria/Crombie Settlement',
  },
  {
    label: 'Currie Siding',
    value: 'CA/NB/Victoria/Currie Siding',
  },
  {
    label: 'Drummond',
    value: 'CA/NB/Victoria/Drummond',
  },
  {
    label: 'Dsl De Drummond',
    value: 'CA/NB/Victoria/Dsl De Drummond',
  },
  {
    label: 'Dsl De Grand-Sault/Falls',
    value: 'CA/NB/Victoria/Dsl De Grand-Sault/Falls',
  },
  {
    label: 'Dsl De Saint-Andre',
    value: 'CA/NB/Victoria/Dsl De Saint-Andre',
  },
  {
    label: 'Enterprise',
    value: 'CA/NB/Victoria/Enterprise',
  },
  {
    label: 'Everett',
    value: 'CA/NB/Victoria/Everett',
  },
  {
    label: 'Four Falls',
    value: 'CA/NB/Victoria/Four Falls',
  },
  {
    label: 'Gladwyn',
    value: 'CA/NB/Victoria/Gladwyn',
  },
  {
    label: 'Grand Falls',
    value: 'CA/NB/Victoria/Grand Falls',
  },
  {
    label: 'Grand-Sault/Grand Falls',
    value: 'CA/NB/Victoria/Grand-Sault/Grand Falls',
  },
  {
    label: 'Hazeldean',
    value: 'CA/NB/Victoria/Hazeldean',
  },
  {
    label: 'Hillandale',
    value: 'CA/NB/Victoria/Hillandale',
  },
  {
    label: 'Kilburn',
    value: 'CA/NB/Victoria/Kilburn',
  },
  {
    label: 'Kincardine',
    value: 'CA/NB/Victoria/Kincardine',
  },
  {
    label: 'Lake Edward',
    value: 'CA/NB/Victoria/Lake Edward',
  },
  {
    label: 'Leonard Colony',
    value: 'CA/NB/Victoria/Leonard Colony',
  },
  {
    label: 'Linton Corner',
    value: 'CA/NB/Victoria/Linton Corner',
  },
  {
    label: 'Lower Kintore',
    value: 'CA/NB/Victoria/Lower Kintore',
  },
  {
    label: 'Maple View',
    value: 'CA/NB/Victoria/Maple View',
  },
  {
    label: 'Mclaughlin',
    value: 'CA/NB/Victoria/Mclaughlin',
  },
  {
    label: 'Medford',
    value: 'CA/NB/Victoria/Medford',
  },
  {
    label: 'Morrell Siding',
    value: 'CA/NB/Victoria/Morrell Siding',
  },
  {
    label: 'Muniac',
    value: 'CA/NB/Victoria/Muniac',
  },
  {
    label: 'New Denmark',
    value: 'CA/NB/Victoria/New Denmark',
  },
  {
    label: 'Nictau',
    value: 'CA/NB/Victoria/Nictau',
  },
  {
    label: 'North View',
    value: 'CA/NB/Victoria/North View',
  },
  {
    label: 'Odell',
    value: 'CA/NB/Victoria/Odell',
  },
  {
    label: 'Oxbow',
    value: 'CA/NB/Victoria/Oxbow',
  },
  {
    label: 'Perth-Andover',
    value: 'CA/NB/Victoria/Perth-Andover',
  },
  {
    label: 'Plaster Rock',
    value: 'CA/NB/Victoria/Plaster Rock',
  },
  {
    label: 'Quaker Brook',
    value: 'CA/NB/Victoria/Quaker Brook',
  },
  {
    label: 'Red Rapids',
    value: 'CA/NB/Victoria/Red Rapids',
  },
  {
    label: 'Riley Brook',
    value: 'CA/NB/Victoria/Riley Brook',
  },
  {
    label: 'River De Chute',
    value: 'CA/NB/Victoria/River De Chute',
  },
  {
    label: 'Rowena',
    value: 'CA/NB/Victoria/Rowena',
  },
  {
    label: 'Sisson Brook',
    value: 'CA/NB/Victoria/Sisson Brook',
  },
  {
    label: 'Sisson Ridge',
    value: 'CA/NB/Victoria/Sisson Ridge',
  },
  {
    label: 'St Almo',
    value: 'CA/NB/Victoria/St Almo',
  },
  {
    label: 'Three Brooks',
    value: 'CA/NB/Victoria/Three Brooks',
  },
  {
    label: 'Tinker',
    value: 'CA/NB/Victoria/Tinker',
  },
  {
    label: 'Tobique First Nation',
    value: 'CA/NB/Victoria/Tobique First Nation',
  },
  {
    label: 'Tobique Narrows',
    value: 'CA/NB/Victoria/Tobique Narrows',
  },
  {
    label: 'Two Brooks',
    value: 'CA/NB/Victoria/Two Brooks',
  },
  {
    label: 'Upper Kintore',
    value: 'CA/NB/Victoria/Upper Kintore',
  },
  {
    label: 'Wapske',
    value: 'CA/NB/Victoria/Wapske',
  },
  {
    label: 'Weaver',
    value: 'CA/NB/Victoria/Weaver',
  },
  {
    label: 'Allison ',
    value: 'CA/NB/Westmorland/Allison ',
  },
  {
    label: 'Ammon',
    value: 'CA/NB/Westmorland/Ammon',
  },
  {
    label: 'Anderson Settlement',
    value: 'CA/NB/Westmorland/Anderson Settlement',
  },
  {
    label: 'Aulac',
    value: 'CA/NB/Westmorland/Aulac',
  },
  {
    label: 'Baie Verte',
    value: 'CA/NB/Westmorland/Baie Verte',
  },
  {
    label: 'Bas-Cap-Pele',
    value: 'CA/NB/Westmorland/Bas-Cap-Pele',
  },
  {
    label: 'Bayfield',
    value: 'CA/NB/Westmorland/Bayfield',
  },
  {
    label: 'Bayside',
    value: 'CA/NB/Westmorland/Bayside',
  },
  {
    label: 'Berry Mills',
    value: 'CA/NB/Westmorland/Berry Mills',
  },
  {
    label: 'Boudreau-Ouest',
    value: 'CA/NB/Westmorland/Boudreau-Ouest',
  },
  {
    label: 'Boundary Creek',
    value: 'CA/NB/Westmorland/Boundary Creek',
  },
  {
    label: 'British Settlement',
    value: 'CA/NB/Westmorland/British Settlement',
  },
  {
    label: 'Calhoun',
    value: 'CA/NB/Westmorland/Calhoun',
  },
  {
    label: 'Canaan Station',
    value: 'CA/NB/Westmorland/Canaan Station',
  },
  {
    label: 'Cap-Pele',
    value: 'CA/NB/Westmorland/Cap-Pele',
  },
  {
    label: 'Cape Spear',
    value: 'CA/NB/Westmorland/Cape Spear',
  },
  {
    label: 'Cape Tormentine',
    value: 'CA/NB/Westmorland/Cape Tormentine',
  },
  {
    label: 'Centre Village',
    value: 'CA/NB/Westmorland/Centre Village',
  },
  {
    label: 'Cherry Burton',
    value: 'CA/NB/Westmorland/Cherry Burton',
  },
  {
    label: 'Coburg',
    value: 'CA/NB/Westmorland/Coburg',
  },
  {
    label: 'Cookville',
    value: 'CA/NB/Westmorland/Cookville',
  },
  {
    label: 'Cormier-Village',
    value: 'CA/NB/Westmorland/Cormier-Village',
  },
  {
    label: 'Dieppe',
    value: 'CA/NB/Westmorland/Dieppe',
  },
  {
    label: 'Dobson Corner',
    value: 'CA/NB/Westmorland/Dobson Corner',
  },
  {
    label: 'Dorchester',
    value: 'CA/NB/Westmorland/Dorchester',
  },
  {
    label: 'Dorchester Cape',
    value: 'CA/NB/Westmorland/Dorchester Cape',
  },
  {
    label: 'Fairfield',
    value: 'CA/NB/Westmorland/Fairfield',
  },
  {
    label: 'Fairfield Westmorland Co',
    value: 'CA/NB/Westmorland/Fairfield Westmorland Co',
  },
  {
    label: 'Fawcett Hill',
    value: 'CA/NB/Westmorland/Fawcett Hill',
  },
  {
    label: 'Frosty Hollow',
    value: 'CA/NB/Westmorland/Frosty Hollow',
  },
  {
    label: 'Gallagher Ridge',
    value: 'CA/NB/Westmorland/Gallagher Ridge',
  },
  {
    label: 'Grand-Barachois',
    value: 'CA/NB/Westmorland/Grand-Barachois',
  },
  {
    label: 'Greater Lakeburn',
    value: 'CA/NB/Westmorland/Greater Lakeburn',
  },
  {
    label: 'Harewood',
    value: 'CA/NB/Westmorland/Harewood',
  },
  {
    label: 'Haute-Aboujagane',
    value: 'CA/NB/Westmorland/Haute-Aboujagane',
  },
  {
    label: 'Havelock',
    value: 'CA/NB/Westmorland/Havelock',
  },
  {
    label: 'Hicksville',
    value: 'CA/NB/Westmorland/Hicksville',
  },
  {
    label: 'Hillgrove',
    value: 'CA/NB/Westmorland/Hillgrove',
  },
  {
    label: 'Indian Mountain',
    value: 'CA/NB/Westmorland/Indian Mountain',
  },
  {
    label: 'Intervale',
    value: 'CA/NB/Westmorland/Intervale',
  },
  {
    label: 'Irishtown',
    value: 'CA/NB/Westmorland/Irishtown',
  },
  {
    label: "Johnson's Mills",
    value: "CA/NB/Westmorland/Johnson's Mills",
  },
  {
    label: 'Johnston Point',
    value: 'CA/NB/Westmorland/Johnston Point',
  },
  {
    label: 'Jolicure',
    value: 'CA/NB/Westmorland/Jolicure',
  },
  {
    label: 'Killams Mills',
    value: 'CA/NB/Westmorland/Killams Mills',
  },
  {
    label: 'Kinnear Settlement',
    value: 'CA/NB/Westmorland/Kinnear Settlement',
  },
  {
    label: 'Lakeville-Westmorland',
    value: 'CA/NB/Westmorland/Lakeville-Westmorland',
  },
  {
    label: 'Lewis Mountain',
    value: 'CA/NB/Westmorland/Lewis Mountain',
  },
  {
    label: 'Little Shemogue',
    value: 'CA/NB/Westmorland/Little Shemogue',
  },
  {
    label: 'Lutes Mountain',
    value: 'CA/NB/Westmorland/Lutes Mountain',
  },
  {
    label: 'Macdougall Settlement',
    value: 'CA/NB/Westmorland/Macdougall Settlement',
  },
  {
    label: 'Malden',
    value: 'CA/NB/Westmorland/Malden',
  },
  {
    label: 'Mates Corner',
    value: 'CA/NB/Westmorland/Mates Corner',
  },
  {
    label: 'Mcquade',
    value: 'CA/NB/Westmorland/Mcquade',
  },
  {
    label: 'Meadow Brook',
    value: 'CA/NB/Westmorland/Meadow Brook',
  },
  {
    label: 'Melrose',
    value: 'CA/NB/Westmorland/Melrose',
  },
  {
    label: 'Memramcook',
    value: 'CA/NB/Westmorland/Memramcook',
  },
  {
    label: 'Memramcook East',
    value: 'CA/NB/Westmorland/Memramcook East',
  },
  {
    label: 'Middle Sackville',
    value: 'CA/NB/Westmorland/Middle Sackville',
  },
  {
    label: 'Middleton',
    value: 'CA/NB/Westmorland/Middleton',
  },
  {
    label: 'Midgic',
    value: 'CA/NB/Westmorland/Midgic',
  },
  {
    label: 'Moncton',
    value: 'CA/NB/Westmorland/Moncton',
  },
  {
    label: 'Monteagle',
    value: 'CA/NB/Westmorland/Monteagle',
  },
  {
    label: 'Murray Corner',
    value: 'CA/NB/Westmorland/Murray Corner',
  },
  {
    label: 'New Scotland',
    value: 'CA/NB/Westmorland/New Scotland',
  },
  {
    label: 'Otter Creek',
    value: 'CA/NB/Westmorland/Otter Creek',
  },
  {
    label: 'Petit-Cap',
    value: 'CA/NB/Westmorland/Petit-Cap',
  },
  {
    label: 'Petitcodiac',
    value: 'CA/NB/Westmorland/Petitcodiac',
  },
  {
    label: 'Petitcodiac East',
    value: 'CA/NB/Westmorland/Petitcodiac East',
  },
  {
    label: 'Point De Bute',
    value: 'CA/NB/Westmorland/Point De Bute',
  },
  {
    label: 'Pointe-Du-Chene',
    value: 'CA/NB/Westmorland/Pointe-Du-Chene',
  },
  {
    label: 'Pollett River',
    value: 'CA/NB/Westmorland/Pollett River',
  },
  {
    label: 'Port Elgin',
    value: 'CA/NB/Westmorland/Port Elgin',
  },
  {
    label: 'Portage',
    value: 'CA/NB/Westmorland/Portage',
  },
  {
    label: 'River Glade',
    value: 'CA/NB/Westmorland/River Glade',
  },
  {
    label: 'Rockland',
    value: 'CA/NB/Westmorland/Rockland',
  },
  {
    label: 'Rockport',
    value: 'CA/NB/Westmorland/Rockport',
  },
  {
    label: 'Sackville',
    value: 'CA/NB/Westmorland/Sackville',
  },
  {
    label: 'Saint-Andre-Leblanc',
    value: 'CA/NB/Westmorland/Saint-Andre-Leblanc',
  },
  {
    label: 'Saint-Philippe',
    value: 'CA/NB/Westmorland/Saint-Philippe',
  },
  {
    label: 'Salisbury',
    value: 'CA/NB/Westmorland/Salisbury',
  },
  {
    label: 'Salisbury West',
    value: 'CA/NB/Westmorland/Salisbury West',
  },
  {
    label: 'Scotch Settlement',
    value: 'CA/NB/Westmorland/Scotch Settlement',
  },
  {
    label: 'Scoudouc',
    value: 'CA/NB/Westmorland/Scoudouc',
  },
  {
    label: 'Scoudouc Road',
    value: 'CA/NB/Westmorland/Scoudouc Road',
  },
  {
    label: 'Second North River',
    value: 'CA/NB/Westmorland/Second North River',
  },
  {
    label: 'Shediac',
    value: 'CA/NB/Westmorland/Shediac',
  },
  {
    label: 'Shediac Bridge',
    value: 'CA/NB/Westmorland/Shediac Bridge',
  },
  {
    label: 'Shediac Bridge-Shediac River',
    value: 'CA/NB/Westmorland/Shediac Bridge-Shediac River',
  },
  {
    label: 'Shediac Cape',
    value: 'CA/NB/Westmorland/Shediac Cape',
  },
  {
    label: 'Shediac River',
    value: 'CA/NB/Westmorland/Shediac River',
  },
  {
    label: 'Shemogue',
    value: 'CA/NB/Westmorland/Shemogue',
  },
  {
    label: 'South Canaan',
    value: 'CA/NB/Westmorland/South Canaan',
  },
  {
    label: 'Steeves Mountain',
    value: 'CA/NB/Westmorland/Steeves Mountain',
  },
  {
    label: 'Steeves Settlement',
    value: 'CA/NB/Westmorland/Steeves Settlement',
  },
  {
    label: 'Stilesville',
    value: 'CA/NB/Westmorland/Stilesville',
  },
  {
    label: 'Taylor Village',
    value: 'CA/NB/Westmorland/Taylor Village',
  },
  {
    label: 'The Glades',
    value: 'CA/NB/Westmorland/The Glades',
  },
  {
    label: 'Timber River',
    value: 'CA/NB/Westmorland/Timber River',
  },
  {
    label: 'Trois-Ruisseaux',
    value: 'CA/NB/Westmorland/Trois-Ruisseaux',
  },
  {
    label: 'Upper Cape',
    value: 'CA/NB/Westmorland/Upper Cape',
  },
  {
    label: 'Upper Dorchester',
    value: 'CA/NB/Westmorland/Upper Dorchester',
  },
  {
    label: 'Upper Rockport',
    value: 'CA/NB/Westmorland/Upper Rockport',
  },
  {
    label: 'Upper Sackville',
    value: 'CA/NB/Westmorland/Upper Sackville',
  },
  {
    label: 'Westcock',
    value: 'CA/NB/Westmorland/Westcock',
  },
  {
    label: 'Wheaton Settlement',
    value: 'CA/NB/Westmorland/Wheaton Settlement',
  },
  {
    label: 'Wood Point',
    value: 'CA/NB/Westmorland/Wood Point',
  },
  {
    label: 'Woodside',
    value: 'CA/NB/Westmorland/Woodside',
  },
  {
    label: 'Astle',
    value: 'CA/NB/York/Astle',
  },
  {
    label: 'Barony',
    value: 'CA/NB/York/Barony',
  },
  {
    label: 'Bear Island',
    value: 'CA/NB/York/Bear Island',
  },
  {
    label: 'Beaver Dam',
    value: 'CA/NB/York/Beaver Dam',
  },
  {
    label: 'Birdton',
    value: 'CA/NB/York/Birdton',
  },
  {
    label: 'Bloomfield Ridge',
    value: 'CA/NB/York/Bloomfield Ridge',
  },
  {
    label: 'Brewers Mill',
    value: 'CA/NB/York/Brewers Mill',
  },
  {
    label: 'Brockway',
    value: 'CA/NB/York/Brockway',
  },
  {
    label: 'Bull Lake',
    value: 'CA/NB/York/Bull Lake',
  },
  {
    label: 'Burpee',
    value: 'CA/NB/York/Burpee',
  },
  {
    label: 'Burtts Corner',
    value: 'CA/NB/York/Burtts Corner',
  },
  {
    label: 'Campbell Settlement York Co',
    value: 'CA/NB/York/Campbell Settlement York Co',
  },
  {
    label: 'Canterbury',
    value: 'CA/NB/York/Canterbury',
  },
  {
    label: 'Cardigan',
    value: 'CA/NB/York/Cardigan',
  },
  {
    label: 'Carrol Ridge',
    value: 'CA/NB/York/Carrol Ridge',
  },
  {
    label: 'Central Hainesville',
    value: 'CA/NB/York/Central Hainesville',
  },
  {
    label: 'Central Waterville',
    value: 'CA/NB/York/Central Waterville',
  },
  {
    label: 'Charlie Lake',
    value: 'CA/NB/York/Charlie Lake',
  },
  {
    label: 'Charters Settlement',
    value: 'CA/NB/York/Charters Settlement',
  },
  {
    label: 'Clarkville',
    value: 'CA/NB/York/Clarkville',
  },
  {
    label: 'Cross Creek',
    value: 'CA/NB/York/Cross Creek',
  },
  {
    label: 'Currieburg',
    value: 'CA/NB/York/Currieburg',
  },
  {
    label: 'Dead Creek',
    value: 'CA/NB/York/Dead Creek',
  },
  {
    label: 'Deersdale',
    value: 'CA/NB/York/Deersdale',
  },
  {
    label: 'Dorrington Hill',
    value: 'CA/NB/York/Dorrington Hill',
  },
  {
    label: 'Douglas',
    value: 'CA/NB/York/Douglas',
  },
  {
    label: 'Dow Settlement',
    value: 'CA/NB/York/Dow Settlement',
  },
  {
    label: 'Dumfries',
    value: 'CA/NB/York/Dumfries',
  },
  {
    label: 'Durham Bridge',
    value: 'CA/NB/York/Durham Bridge',
  },
  {
    label: 'Eel River Lake',
    value: 'CA/NB/York/Eel River Lake',
  },
  {
    label: 'English Settlement',
    value: 'CA/NB/York/English Settlement',
  },
  {
    label: "Estey's Bridge",
    value: "CA/NB/York/Estey's Bridge",
  },
  {
    label: 'Forest City',
    value: 'CA/NB/York/Forest City',
  },
  {
    label: 'Fosterville',
    value: 'CA/NB/York/Fosterville',
  },
  {
    label: 'Fredericksburg',
    value: 'CA/NB/York/Fredericksburg',
  },
  {
    label: 'Fredericton',
    value: 'CA/NB/York/Fredericton',
  },
  {
    label: 'French Village-York',
    value: 'CA/NB/York/French Village-York',
  },
  {
    label: 'Giants Glen',
    value: 'CA/NB/York/Giants Glen',
  },
  {
    label: 'Green Hill',
    value: 'CA/NB/York/Green Hill',
  },
  {
    label: 'Green Mountain',
    value: 'CA/NB/York/Green Mountain',
  },
  {
    label: 'Greenhill Lake',
    value: 'CA/NB/York/Greenhill Lake',
  },
  {
    label: 'Hamtown Corner',
    value: 'CA/NB/York/Hamtown Corner',
  },
  {
    label: 'Hanwell',
    value: 'CA/NB/York/Hanwell',
  },
  {
    label: 'Hartfield',
    value: 'CA/NB/York/Hartfield',
  },
  {
    label: 'Hartin Settlement',
    value: 'CA/NB/York/Hartin Settlement',
  },
  {
    label: 'Harvey Station',
    value: 'CA/NB/York/Harvey Station',
  },
  {
    label: 'Harvey York Co',
    value: 'CA/NB/York/Harvey York Co',
  },
  {
    label: 'Hawkins Corner',
    value: 'CA/NB/York/Hawkins Corner',
  },
  {
    label: 'Hawkshaw',
    value: 'CA/NB/York/Hawkshaw',
  },
  {
    label: 'Hayesville',
    value: 'CA/NB/York/Hayesville',
  },
  {
    label: 'Howland Ridge',
    value: 'CA/NB/York/Howland Ridge',
  },
  {
    label: 'Island View',
    value: 'CA/NB/York/Island View',
  },
  {
    label: 'Jewetts Mills',
    value: 'CA/NB/York/Jewetts Mills',
  },
  {
    label: 'Keswick',
    value: 'CA/NB/York/Keswick',
  },
  {
    label: 'Keswick Ridge',
    value: 'CA/NB/York/Keswick Ridge',
  },
  {
    label: 'Killarney Road',
    value: 'CA/NB/York/Killarney Road',
  },
  {
    label: 'Kings Landing Historical Settl',
    value: 'CA/NB/York/Kings Landing Historical Settl',
  },
  {
    label: 'Kingsclear First Nation',
    value: 'CA/NB/York/Kingsclear First Nation',
  },
  {
    label: 'Kingsley',
    value: 'CA/NB/York/Kingsley',
  },
  {
    label: 'Lake George',
    value: 'CA/NB/York/Lake George',
  },
  {
    label: 'Limekiln',
    value: 'CA/NB/York/Limekiln',
  },
  {
    label: 'Lincoln',
    value: 'CA/NB/York/Lincoln',
  },
  {
    label: 'Lower Hainesville',
    value: 'CA/NB/York/Lower Hainesville',
  },
  {
    label: 'Lower Kingsclear',
    value: 'CA/NB/York/Lower Kingsclear',
  },
  {
    label: 'Lower Queensbury',
    value: 'CA/NB/York/Lower Queensbury',
  },
  {
    label: 'Lower St Marys',
    value: 'CA/NB/York/Lower St Marys',
  },
  {
    label: 'Maclaggan Bridge',
    value: 'CA/NB/York/Maclaggan Bridge',
  },
  {
    label: 'Mactaquac',
    value: 'CA/NB/York/Mactaquac',
  },
  {
    label: 'Maple Grove',
    value: 'CA/NB/York/Maple Grove',
  },
  {
    label: 'Maple Ridge',
    value: 'CA/NB/York/Maple Ridge',
  },
  {
    label: 'Maplewood',
    value: 'CA/NB/York/Maplewood',
  },
  {
    label: 'Marne',
    value: 'CA/NB/York/Marne',
  },
  {
    label: 'Maxwell',
    value: 'CA/NB/York/Maxwell',
  },
  {
    label: 'Mazerolle Settlement',
    value: 'CA/NB/York/Mazerolle Settlement',
  },
  {
    label: 'Mcadam',
    value: 'CA/NB/York/Mcadam',
  },
  {
    label: 'Mcgivney',
    value: 'CA/NB/York/Mcgivney',
  },
  {
    label: 'Mcleod Hill',
    value: 'CA/NB/York/Mcleod Hill',
  },
  {
    label: 'Meductic',
    value: 'CA/NB/York/Meductic',
  },
  {
    label: 'Middle Hainesville',
    value: 'CA/NB/York/Middle Hainesville',
  },
  {
    label: 'Millville',
    value: 'CA/NB/York/Millville',
  },
  {
    label: 'Mount Hope',
    value: 'CA/NB/York/Mount Hope',
  },
  {
    label: 'Nackawic',
    value: 'CA/NB/York/Nackawic',
  },
  {
    label: 'Napadogan',
    value: 'CA/NB/York/Napadogan',
  },
  {
    label: 'Nashwaak Bridge',
    value: 'CA/NB/York/Nashwaak Bridge',
  },
  {
    label: 'Nashwaak Village',
    value: 'CA/NB/York/Nashwaak Village',
  },
  {
    label: 'Nasonworth',
    value: 'CA/NB/York/Nasonworth',
  },
  {
    label: 'New Market',
    value: 'CA/NB/York/New Market',
  },
  {
    label: 'New Maryland',
    value: 'CA/NB/York/New Maryland',
  },
  {
    label: 'North Lake',
    value: 'CA/NB/York/North Lake',
  },
  {
    label: 'North Tay',
    value: 'CA/NB/York/North Tay',
  },
  {
    label: 'Nortondale',
    value: 'CA/NB/York/Nortondale',
  },
  {
    label: 'Parker Ridge',
    value: 'CA/NB/York/Parker Ridge',
  },
  {
    label: 'Pemberton Ridge',
    value: 'CA/NB/York/Pemberton Ridge',
  },
  {
    label: 'Penniac',
    value: 'CA/NB/York/Penniac',
  },
  {
    label: 'Prince William',
    value: 'CA/NB/York/Prince William',
  },
  {
    label: 'Richibucto Road',
    value: 'CA/NB/York/Richibucto Road',
  },
  {
    label: 'Ritchie',
    value: 'CA/NB/York/Ritchie',
  },
  {
    label: 'Rossville',
    value: 'CA/NB/York/Rossville',
  },
  {
    label: 'Royal Road',
    value: 'CA/NB/York/Royal Road',
  },
  {
    label: 'Scotch Lake',
    value: 'CA/NB/York/Scotch Lake',
  },
  {
    label: 'Scotch Settlement York Co',
    value: 'CA/NB/York/Scotch Settlement York Co',
  },
  {
    label: 'Scott Siding',
    value: 'CA/NB/York/Scott Siding',
  },
  {
    label: 'Skiff Lake',
    value: 'CA/NB/York/Skiff Lake',
  },
  {
    label: 'Smithfield',
    value: 'CA/NB/York/Smithfield',
  },
  {
    label: 'Southampton',
    value: 'CA/NB/York/Southampton',
  },
  {
    label: 'Springfield York Co',
    value: 'CA/NB/York/Springfield York Co',
  },
  {
    label: 'St Croix',
    value: 'CA/NB/York/St Croix',
  },
  {
    label: 'Stanley',
    value: 'CA/NB/York/Stanley',
  },
  {
    label: 'Staples Settlement',
    value: 'CA/NB/York/Staples Settlement',
  },
  {
    label: 'Taxis River',
    value: 'CA/NB/York/Taxis River',
  },
  {
    label: 'Tay Creek',
    value: 'CA/NB/York/Tay Creek',
  },
  {
    label: 'Tay Falls',
    value: 'CA/NB/York/Tay Falls',
  },
  {
    label: 'Taymouth',
    value: 'CA/NB/York/Taymouth',
  },
  {
    label: 'Temperance Vale',
    value: 'CA/NB/York/Temperance Vale',
  },
  {
    label: 'Temple',
    value: 'CA/NB/York/Temple',
  },
  {
    label: 'Tilley',
    value: 'CA/NB/York/Tilley',
  },
  {
    label: 'Upper Caverhill',
    value: 'CA/NB/York/Upper Caverhill',
  },
  {
    label: 'Upper Hainesville',
    value: 'CA/NB/York/Upper Hainesville',
  },
  {
    label: 'Upper Keswick',
    value: 'CA/NB/York/Upper Keswick',
  },
  {
    label: 'Upper Kingsclear',
    value: 'CA/NB/York/Upper Kingsclear',
  },
  {
    label: 'Upper Queensbury',
    value: 'CA/NB/York/Upper Queensbury',
  },
  {
    label: 'Ward Settlement',
    value: 'CA/NB/York/Ward Settlement',
  },
  {
    label: 'Wiggins Mill',
    value: 'CA/NB/York/Wiggins Mill',
  },
  {
    label: 'Williamsburg',
    value: 'CA/NB/York/Williamsburg',
  },
  {
    label: 'Woodlands',
    value: 'CA/NB/York/Woodlands',
  },
  {
    label: 'Yoho',
    value: 'CA/NB/York/Yoho',
  },
  {
    label: 'Zealand',
    value: 'CA/NB/York/Zealand',
  },
  {
    label: 'Zionville',
    value: 'CA/NB/York/Zionville',
  },
  {
    label: "Admiral's Beach",
    value: "CA/NL/Avalon/Admiral's Beach",
  },
  {
    label: 'Aquaforte',
    value: 'CA/NL/Avalon/Aquaforte',
  },
  {
    label: 'Avondale',
    value: 'CA/NL/Avalon/Avondale',
  },
  {
    label: 'Bauline',
    value: 'CA/NL/Avalon/Bauline',
  },
  {
    label: 'Bay Bulls',
    value: 'CA/NL/Avalon/Bay Bulls',
  },
  {
    label: 'Bay De Verde',
    value: 'CA/NL/Avalon/Bay De Verde',
  },
  {
    label: 'Bay Roberts',
    value: 'CA/NL/Avalon/Bay Roberts',
  },
  {
    label: 'Bell Island',
    value: 'CA/NL/Avalon/Bell Island',
  },
  {
    label: 'Bell Island Front',
    value: 'CA/NL/Avalon/Bell Island Front',
  },
  {
    label: 'Bellevue',
    value: 'CA/NL/Avalon/Bellevue',
  },
  {
    label: 'Blaketown',
    value: 'CA/NL/Avalon/Blaketown',
  },
  {
    label: 'Branch',
    value: 'CA/NL/Avalon/Branch',
  },
  {
    label: 'Brigus',
    value: 'CA/NL/Avalon/Brigus',
  },
  {
    label: 'Brigus Junction',
    value: 'CA/NL/Avalon/Brigus Junction',
  },
  {
    label: 'Broad Cove Bdv',
    value: 'CA/NL/Avalon/Broad Cove Bdv',
  },
  {
    label: 'Brownsdale',
    value: 'CA/NL/Avalon/Brownsdale',
  },
  {
    label: 'Burnt Point Bdv',
    value: 'CA/NL/Avalon/Burnt Point Bdv',
  },
  {
    label: 'Calvert',
    value: 'CA/NL/Avalon/Calvert',
  },
  {
    label: 'Cape Broyle',
    value: 'CA/NL/Avalon/Cape Broyle',
  },
  {
    label: 'Caplin Cove Bdv',
    value: 'CA/NL/Avalon/Caplin Cove Bdv',
  },
  {
    label: 'Cappahayden',
    value: 'CA/NL/Avalon/Cappahayden',
  },
  {
    label: 'Carbonear',
    value: 'CA/NL/Avalon/Carbonear',
  },
  {
    label: 'Cavendish',
    value: 'CA/NL/Avalon/Cavendish',
  },
  {
    label: 'Chance Cove',
    value: 'CA/NL/Avalon/Chance Cove',
  },
  {
    label: 'Chapel Arm',
    value: 'CA/NL/Avalon/Chapel Arm',
  },
  {
    label: 'Chapel Cove',
    value: 'CA/NL/Avalon/Chapel Cove',
  },
  {
    label: 'Clarkes Beach',
    value: 'CA/NL/Avalon/Clarkes Beach',
  },
  {
    label: 'Coleys Point South',
    value: 'CA/NL/Avalon/Coleys Point South',
  },
  {
    label: 'Colinet',
    value: 'CA/NL/Avalon/Colinet',
  },
  {
    label: 'Colliers Riverhead',
    value: 'CA/NL/Avalon/Colliers Riverhead',
  },
  {
    label: 'Conception Bay South',
    value: 'CA/NL/Avalon/Conception Bay South',
  },
  {
    label: 'Conception Harbour',
    value: 'CA/NL/Avalon/Conception Harbour',
  },
  {
    label: 'Cupids',
    value: 'CA/NL/Avalon/Cupids',
  },
  {
    label: 'Dildo',
    value: 'CA/NL/Avalon/Dildo',
  },
  {
    label: 'Dunville',
    value: 'CA/NL/Avalon/Dunville',
  },
  {
    label: 'Fair Haven',
    value: 'CA/NL/Avalon/Fair Haven',
  },
  {
    label: 'Fermeuse',
    value: 'CA/NL/Avalon/Fermeuse',
  },
  {
    label: 'Ferryland',
    value: 'CA/NL/Avalon/Ferryland',
  },
  {
    label: 'Flatrock',
    value: 'CA/NL/Avalon/Flatrock',
  },
  {
    label: 'Fox Harbour Pb',
    value: 'CA/NL/Avalon/Fox Harbour Pb',
  },
  {
    label: 'Freshwater Pb',
    value: 'CA/NL/Avalon/Freshwater Pb',
  },
  {
    label: 'Goulds',
    value: 'CA/NL/Avalon/Goulds',
  },
  {
    label: 'Grates Cove',
    value: 'CA/NL/Avalon/Grates Cove',
  },
  {
    label: 'Greens Harbour',
    value: 'CA/NL/Avalon/Greens Harbour',
  },
  {
    label: 'Hants Harbour',
    value: 'CA/NL/Avalon/Hants Harbour',
  },
  {
    label: 'Harbour Grace',
    value: 'CA/NL/Avalon/Harbour Grace',
  },
  {
    label: 'Harbour Grace South',
    value: 'CA/NL/Avalon/Harbour Grace South',
  },
  {
    label: 'Harbour Main',
    value: 'CA/NL/Avalon/Harbour Main',
  },
  {
    label: 'Hearts Content',
    value: 'CA/NL/Avalon/Hearts Content',
  },
  {
    label: 'Hearts Delight',
    value: 'CA/NL/Avalon/Hearts Delight',
  },
  {
    label: 'Hearts Desire',
    value: 'CA/NL/Avalon/Hearts Desire',
  },
  {
    label: 'Holyrood',
    value: 'CA/NL/Avalon/Holyrood',
  },
  {
    label: 'Hopeall',
    value: 'CA/NL/Avalon/Hopeall',
  },
  {
    label: 'Islington',
    value: 'CA/NL/Avalon/Islington',
  },
  {
    label: 'Jerseyside',
    value: 'CA/NL/Avalon/Jerseyside',
  },
  {
    label: 'Jobs Cove',
    value: 'CA/NL/Avalon/Jobs Cove',
  },
  {
    label: 'Lance Cove',
    value: 'CA/NL/Avalon/Lance Cove',
  },
  {
    label: 'Little Harbour East Pb',
    value: 'CA/NL/Avalon/Little Harbour East Pb',
  },
  {
    label: 'Logy Bay',
    value: 'CA/NL/Avalon/Logy Bay',
  },
  {
    label: 'Long Harbour',
    value: 'CA/NL/Avalon/Long Harbour',
  },
  {
    label: 'Lower Island Cove',
    value: 'CA/NL/Avalon/Lower Island Cove',
  },
  {
    label: 'Makinsons',
    value: 'CA/NL/Avalon/Makinsons',
  },
  {
    label: 'Marysvale',
    value: 'CA/NL/Avalon/Marysvale',
  },
  {
    label: 'Middle Cove',
    value: 'CA/NL/Avalon/Middle Cove',
  },
  {
    label: 'Mobile',
    value: 'CA/NL/Avalon/Mobile',
  },
  {
    label: 'Mount Arlington Heights',
    value: 'CA/NL/Avalon/Mount Arlington Heights',
  },
  {
    label: 'Mount Carmel',
    value: 'CA/NL/Avalon/Mount Carmel',
  },
  {
    label: 'Mount Pearl',
    value: 'CA/NL/Avalon/Mount Pearl',
  },
  {
    label: 'New Chelsea',
    value: 'CA/NL/Avalon/New Chelsea',
  },
  {
    label: 'New Harbour Tb',
    value: 'CA/NL/Avalon/New Harbour Tb',
  },
  {
    label: 'New Melbourne',
    value: 'CA/NL/Avalon/New Melbourne',
  },
  {
    label: 'New Perlican',
    value: 'CA/NL/Avalon/New Perlican',
  },
  {
    label: 'Normans Cove',
    value: 'CA/NL/Avalon/Normans Cove',
  },
  {
    label: 'North Harbour Smb',
    value: 'CA/NL/Avalon/North Harbour Smb',
  },
  {
    label: 'North Valley',
    value: 'CA/NL/Avalon/North Valley',
  },
  {
    label: 'Northern Bay',
    value: 'CA/NL/Avalon/Northern Bay',
  },
  {
    label: 'Ochre Pit Cove',
    value: 'CA/NL/Avalon/Ochre Pit Cove',
  },
  {
    label: 'Old Perlican',
    value: 'CA/NL/Avalon/Old Perlican',
  },
  {
    label: 'Old Shop',
    value: 'CA/NL/Avalon/Old Shop',
  },
  {
    label: 'Outer Cove',
    value: 'CA/NL/Avalon/Outer Cove',
  },
  {
    label: 'Paradise',
    value: 'CA/NL/Avalon/Paradise',
  },
  {
    label: "Patrick's Cove-Angels Cove",
    value: "CA/NL/Avalon/Patrick's Cove-Angels Cove",
  },
  {
    label: 'Petty Harbour',
    value: 'CA/NL/Avalon/Petty Harbour',
  },
  {
    label: 'Placentia',
    value: 'CA/NL/Avalon/Placentia',
  },
  {
    label: 'Port De Grave',
    value: 'CA/NL/Avalon/Port De Grave',
  },
  {
    label: 'Portugal Cove-St Philips',
    value: 'CA/NL/Avalon/Portugal Cove-St Philips',
  },
  {
    label: 'Pouch Cove',
    value: 'CA/NL/Avalon/Pouch Cove',
  },
  {
    label: 'Red Head Cove',
    value: 'CA/NL/Avalon/Red Head Cove',
  },
  {
    label: 'Renews',
    value: 'CA/NL/Avalon/Renews',
  },
  {
    label: 'Riverhead Harbour Grace',
    value: 'CA/NL/Avalon/Riverhead Harbour Grace',
  },
  {
    label: 'Salmon Cove Bdv',
    value: 'CA/NL/Avalon/Salmon Cove Bdv',
  },
  {
    label: 'Shea Heights',
    value: 'CA/NL/Avalon/Shea Heights',
  },
  {
    label: 'Shearstown',
    value: 'CA/NL/Avalon/Shearstown',
  },
  {
    label: 'Ship Harbour Pb',
    value: 'CA/NL/Avalon/Ship Harbour Pb',
  },
  {
    label: 'South Dildo',
    value: 'CA/NL/Avalon/South Dildo',
  },
  {
    label: 'South River',
    value: 'CA/NL/Avalon/South River',
  },
  {
    label: 'Southern Harbour Pb',
    value: 'CA/NL/Avalon/Southern Harbour Pb',
  },
  {
    label: 'Spaniards Bay',
    value: 'CA/NL/Avalon/Spaniards Bay',
  },
  {
    label: 'St Brides',
    value: 'CA/NL/Avalon/St Brides',
  },
  {
    label: "St John's",
    value: "CA/NL/Avalon/St John's",
  },
  {
    label: 'St Josephs Sal',
    value: 'CA/NL/Avalon/St Josephs Sal',
  },
  {
    label: 'St Marys',
    value: 'CA/NL/Avalon/St Marys',
  },
  {
    label: 'St Shotts',
    value: 'CA/NL/Avalon/St Shotts',
  },
  {
    label: 'St Vincents',
    value: 'CA/NL/Avalon/St Vincents',
  },
  {
    label: 'Torbay',
    value: 'CA/NL/Avalon/Torbay',
  },
  {
    label: 'Tors Cove',
    value: 'CA/NL/Avalon/Tors Cove',
  },
  {
    label: 'Trepassey',
    value: 'CA/NL/Avalon/Trepassey',
  },
  {
    label: 'Turks Cove',
    value: 'CA/NL/Avalon/Turks Cove',
  },
  {
    label: 'Upper Island Cove',
    value: 'CA/NL/Avalon/Upper Island Cove',
  },
  {
    label: 'Victoria Cb',
    value: 'CA/NL/Avalon/Victoria Cb',
  },
  {
    label: 'Western Bay',
    value: 'CA/NL/Avalon/Western Bay',
  },
  {
    label: 'Whitbourne',
    value: 'CA/NL/Avalon/Whitbourne',
  },
  {
    label: 'Whiteway',
    value: 'CA/NL/Avalon/Whiteway',
  },
  {
    label: 'Winterton',
    value: 'CA/NL/Avalon/Winterton',
  },
  {
    label: 'Witless Bay',
    value: 'CA/NL/Avalon/Witless Bay',
  },
  {
    label: 'Woodfords',
    value: 'CA/NL/Avalon/Woodfords',
  },
  {
    label: 'Baine Harbour',
    value: 'CA/NL/Burin Peninsula/Baine Harbour',
  },
  {
    label: 'Burin',
    value: 'CA/NL/Burin Peninsula/Burin',
  },
  {
    label: 'Burin Bay Arm',
    value: 'CA/NL/Burin Peninsula/Burin Bay Arm',
  },
  {
    label: 'Creston',
    value: 'CA/NL/Burin Peninsula/Creston',
  },
  {
    label: 'Creston North',
    value: 'CA/NL/Burin Peninsula/Creston North',
  },
  {
    label: 'English Harbour East',
    value: 'CA/NL/Burin Peninsula/English Harbour East',
  },
  {
    label: 'Epworth',
    value: 'CA/NL/Burin Peninsula/Epworth',
  },
  {
    label: 'Fortune',
    value: 'CA/NL/Burin Peninsula/Fortune',
  },
  {
    label: 'Garden Cove Pb',
    value: 'CA/NL/Burin Peninsula/Garden Cove Pb',
  },
  {
    label: 'Garnish',
    value: 'CA/NL/Burin Peninsula/Garnish',
  },
  {
    label: 'Grand Bank',
    value: 'CA/NL/Burin Peninsula/Grand Bank',
  },
  {
    label: 'Grand Beach',
    value: 'CA/NL/Burin Peninsula/Grand Beach',
  },
  {
    label: 'Harbour Mille',
    value: 'CA/NL/Burin Peninsula/Harbour Mille',
  },
  {
    label: 'Lamaline',
    value: 'CA/NL/Burin Peninsula/Lamaline',
  },
  {
    label: 'Lawn',
    value: 'CA/NL/Burin Peninsula/Lawn',
  },
  {
    label: 'Lewins Cove',
    value: 'CA/NL/Burin Peninsula/Lewins Cove',
  },
  {
    label: 'Little Bay East',
    value: 'CA/NL/Burin Peninsula/Little Bay East',
  },
  {
    label: 'Marystown',
    value: 'CA/NL/Burin Peninsula/Marystown',
  },
  {
    label: 'Monkstown',
    value: 'CA/NL/Burin Peninsula/Monkstown',
  },
  {
    label: 'Parkers Cove',
    value: 'CA/NL/Burin Peninsula/Parkers Cove',
  },
  {
    label: 'Red Harbour Pb',
    value: 'CA/NL/Burin Peninsula/Red Harbour Pb',
  },
  {
    label: 'Rushoon',
    value: 'CA/NL/Burin Peninsula/Rushoon',
  },
  {
    label: 'South East Bight',
    value: 'CA/NL/Burin Peninsula/South East Bight',
  },
  {
    label: 'St Bernards-Jacques Fontaine',
    value: 'CA/NL/Burin Peninsula/St Bernards-Jacques Fontaine',
  },
  {
    label: 'St Lawrence',
    value: 'CA/NL/Burin Peninsula/St Lawrence',
  },
  {
    label: 'Swift Current',
    value: 'CA/NL/Burin Peninsula/Swift Current',
  },
  {
    label: 'Terrenceville',
    value: 'CA/NL/Burin Peninsula/Terrenceville',
  },
  {
    label: 'Aspen Cove',
    value: 'CA/NL/Central/Aspen Cove',
  },
  {
    label: 'Badger',
    value: 'CA/NL/Central/Badger',
  },
  {
    label: 'Badgers Quay',
    value: 'CA/NL/Central/Badgers Quay',
  },
  {
    label: 'Baie Verte',
    value: 'CA/NL/Central/Baie Verte',
  },
  {
    label: 'Baytona',
    value: 'CA/NL/Central/Baytona',
  },
  {
    label: 'Beaumont',
    value: 'CA/NL/Central/Beaumont',
  },
  {
    label: 'Belleoram',
    value: 'CA/NL/Central/Belleoram',
  },
  {
    label: 'Benton',
    value: 'CA/NL/Central/Benton',
  },
  {
    label: 'Birchy Bay',
    value: 'CA/NL/Central/Birchy Bay',
  },
  {
    label: 'Bishops Falls',
    value: 'CA/NL/Central/Bishops Falls',
  },
  {
    label: 'Botwood',
    value: 'CA/NL/Central/Botwood',
  },
  {
    label: 'Boyds Cove',
    value: 'CA/NL/Central/Boyds Cove',
  },
  {
    label: 'Brents Cove',
    value: 'CA/NL/Central/Brents Cove',
  },
  {
    label: 'Bridgeport',
    value: 'CA/NL/Central/Bridgeport',
  },
  {
    label: 'Brighton',
    value: 'CA/NL/Central/Brighton',
  },
  {
    label: 'Brookfield',
    value: 'CA/NL/Central/Brookfield',
  },
  {
    label: 'Buchans',
    value: 'CA/NL/Central/Buchans',
  },
  {
    label: 'Buchans Junction',
    value: 'CA/NL/Central/Buchans Junction',
  },
  {
    label: 'Burlington',
    value: 'CA/NL/Central/Burlington',
  },
  {
    label: 'Burnside',
    value: 'CA/NL/Central/Burnside',
  },
  {
    label: 'Campbellton',
    value: 'CA/NL/Central/Campbellton',
  },
  {
    label: 'Cape Freels North',
    value: 'CA/NL/Central/Cape Freels North',
  },
  {
    label: 'Carmanville',
    value: 'CA/NL/Central/Carmanville',
  },
  {
    label: 'Carters Cove',
    value: 'CA/NL/Central/Carters Cove',
  },
  {
    label: 'Change Islands',
    value: 'CA/NL/Central/Change Islands',
  },
  {
    label: 'Charlottetown',
    value: 'CA/NL/Central/Charlottetown',
  },
  {
    label: 'Coachmans Cove',
    value: 'CA/NL/Central/Coachmans Cove',
  },
  {
    label: 'Comfort Cove-Newstead',
    value: 'CA/NL/Central/Comfort Cove-Newstead',
  },
  {
    label: 'Conne River',
    value: 'CA/NL/Central/Conne River',
  },
  {
    label: 'Coombs Cove',
    value: 'CA/NL/Central/Coombs Cove',
  },
  {
    label: 'Cottlesville',
    value: 'CA/NL/Central/Cottlesville',
  },
  {
    label: 'Cottrells Cove',
    value: 'CA/NL/Central/Cottrells Cove',
  },
  {
    label: 'Deadmans Bay',
    value: 'CA/NL/Central/Deadmans Bay',
  },
  {
    label: 'Deep Bay',
    value: 'CA/NL/Central/Deep Bay',
  },
  {
    label: 'Dover',
    value: 'CA/NL/Central/Dover',
  },
  {
    label: 'Durrell',
    value: 'CA/NL/Central/Durrell',
  },
  {
    label: 'Eastport',
    value: 'CA/NL/Central/Eastport',
  },
  {
    label: 'Embree',
    value: 'CA/NL/Central/Embree',
  },
  {
    label: 'English Harbour West',
    value: 'CA/NL/Central/English Harbour West',
  },
  {
    label: 'Fleur De Lys',
    value: 'CA/NL/Central/Fleur De Lys',
  },
  {
    label: 'Fogo',
    value: 'CA/NL/Central/Fogo',
  },
  {
    label: 'Francois',
    value: 'CA/NL/Central/Francois',
  },
  {
    label: 'Frederickton',
    value: 'CA/NL/Central/Frederickton',
  },
  {
    label: 'Gambo',
    value: 'CA/NL/Central/Gambo',
  },
  {
    label: 'Gambo South',
    value: 'CA/NL/Central/Gambo South',
  },
  {
    label: 'Gander',
    value: 'CA/NL/Central/Gander',
  },
  {
    label: 'Gander Bay',
    value: 'CA/NL/Central/Gander Bay',
  },
  {
    label: 'Gander Bay South',
    value: 'CA/NL/Central/Gander Bay South',
  },
  {
    label: 'Gaultois',
    value: 'CA/NL/Central/Gaultois',
  },
  {
    label: 'Glenwood',
    value: 'CA/NL/Central/Glenwood',
  },
  {
    label: 'Glovertown',
    value: 'CA/NL/Central/Glovertown',
  },
  {
    label: 'Glovertown South',
    value: 'CA/NL/Central/Glovertown South',
  },
  {
    label: 'Grand Falls-Windsor',
    value: 'CA/NL/Central/Grand Falls-Windsor',
  },
  {
    label: 'Greenspond',
    value: 'CA/NL/Central/Greenspond',
  },
  {
    label: 'Grey River',
    value: 'CA/NL/Central/Grey River',
  },
  {
    label: 'Harbour Breton',
    value: 'CA/NL/Central/Harbour Breton',
  },
  {
    label: 'Harbour Round',
    value: 'CA/NL/Central/Harbour Round',
  },
  {
    label: 'Hare Bay Bb',
    value: 'CA/NL/Central/Hare Bay Bb',
  },
  {
    label: 'Harrys Harbour',
    value: 'CA/NL/Central/Harrys Harbour',
  },
  {
    label: "Head Bay D'espoir",
    value: "CA/NL/Central/Head Bay D'espoir",
  },
  {
    label: 'Hermitage',
    value: 'CA/NL/Central/Hermitage',
  },
  {
    label: 'Herring Neck',
    value: 'CA/NL/Central/Herring Neck',
  },
  {
    label: 'Hillgrade',
    value: 'CA/NL/Central/Hillgrade',
  },
  {
    label: 'Horwood',
    value: 'CA/NL/Central/Horwood',
  },
  {
    label: 'Howley',
    value: 'CA/NL/Central/Howley',
  },
  {
    label: 'Indian Bay Bb',
    value: 'CA/NL/Central/Indian Bay Bb',
  },
  {
    label: 'Island Harbour',
    value: 'CA/NL/Central/Island Harbour',
  },
  {
    label: 'Jacksons Cove',
    value: 'CA/NL/Central/Jacksons Cove',
  },
  {
    label: 'Joe Batts Arm',
    value: 'CA/NL/Central/Joe Batts Arm',
  },
  {
    label: 'Kings Point',
    value: 'CA/NL/Central/Kings Point',
  },
  {
    label: 'La Scie',
    value: 'CA/NL/Central/La Scie',
  },
  {
    label: 'Ladle Cove',
    value: 'CA/NL/Central/Ladle Cove',
  },
  {
    label: 'Laurenceton',
    value: 'CA/NL/Central/Laurenceton',
  },
  {
    label: 'Leading Tickles',
    value: 'CA/NL/Central/Leading Tickles',
  },
  {
    label: 'Lewisporte',
    value: 'CA/NL/Central/Lewisporte',
  },
  {
    label: 'Little Bay Islands',
    value: 'CA/NL/Central/Little Bay Islands',
  },
  {
    label: 'Little Bay Ndb',
    value: 'CA/NL/Central/Little Bay Ndb',
  },
  {
    label: 'Little Burnt Bay',
    value: 'CA/NL/Central/Little Burnt Bay',
  },
  {
    label: 'Loon Bay',
    value: 'CA/NL/Central/Loon Bay',
  },
  {
    label: 'Lumsden',
    value: 'CA/NL/Central/Lumsden',
  },
  {
    label: 'Main Point',
    value: 'CA/NL/Central/Main Point',
  },
  {
    label: 'Mccallum',
    value: 'CA/NL/Central/Mccallum',
  },
  {
    label: 'Middle Arm Gb',
    value: 'CA/NL/Central/Middle Arm Gb',
  },
  {
    label: 'Miles Cove',
    value: 'CA/NL/Central/Miles Cove',
  },
  {
    label: 'Millertown',
    value: 'CA/NL/Central/Millertown',
  },
  {
    label: 'Milltown',
    value: 'CA/NL/Central/Milltown',
  },
  {
    label: 'Mings Bight',
    value: 'CA/NL/Central/Mings Bight',
  },
  {
    label: 'Moretons Harbour',
    value: 'CA/NL/Central/Moretons Harbour',
  },
  {
    label: 'Musgrave Harbour',
    value: 'CA/NL/Central/Musgrave Harbour',
  },
  {
    label: 'Newtown',
    value: 'CA/NL/Central/Newtown',
  },
  {
    label: 'Nippers Harbour',
    value: 'CA/NL/Central/Nippers Harbour',
  },
  {
    label: 'Norris Arm',
    value: 'CA/NL/Central/Norris Arm',
  },
  {
    label: 'Norris Arm Northside',
    value: 'CA/NL/Central/Norris Arm Northside',
  },
  {
    label: 'Pacquet',
    value: 'CA/NL/Central/Pacquet',
  },
  {
    label: 'Peterview',
    value: 'CA/NL/Central/Peterview',
  },
  {
    label: 'Pilleys Island',
    value: 'CA/NL/Central/Pilleys Island',
  },
  {
    label: 'Point Leamington',
    value: 'CA/NL/Central/Point Leamington',
  },
  {
    label: 'Point Of Bay',
    value: 'CA/NL/Central/Point Of Bay',
  },
  {
    label: 'Pools Cove',
    value: 'CA/NL/Central/Pools Cove',
  },
  {
    label: 'Pools Island',
    value: 'CA/NL/Central/Pools Island',
  },
  {
    label: 'Port Albert',
    value: 'CA/NL/Central/Port Albert',
  },
  {
    label: 'Port Anson',
    value: 'CA/NL/Central/Port Anson',
  },
  {
    label: 'Pound Cove',
    value: 'CA/NL/Central/Pound Cove',
  },
  {
    label: 'Ramea',
    value: 'CA/NL/Central/Ramea',
  },
  {
    label: 'Rattling Brook',
    value: 'CA/NL/Central/Rattling Brook',
  },
  {
    label: 'Rencontre East',
    value: 'CA/NL/Central/Rencontre East',
  },
  {
    label: 'Roberts Arm',
    value: 'CA/NL/Central/Roberts Arm',
  },
  {
    label: 'Rodgers Cove',
    value: 'CA/NL/Central/Rodgers Cove',
  },
  {
    label: 'Round Harbour Gb',
    value: 'CA/NL/Central/Round Harbour Gb',
  },
  {
    label: 'Salvage',
    value: 'CA/NL/Central/Salvage',
  },
  {
    label: 'Sandringham',
    value: 'CA/NL/Central/Sandringham',
  },
  {
    label: 'Seal Cove Fb',
    value: 'CA/NL/Central/Seal Cove Fb',
  },
  {
    label: 'Seal Cove Wb',
    value: 'CA/NL/Central/Seal Cove Wb',
  },
  {
    label: 'Seldom',
    value: 'CA/NL/Central/Seldom',
  },
  {
    label: 'Shalloway Cove',
    value: 'CA/NL/Central/Shalloway Cove',
  },
  {
    label: 'Shoe Cove',
    value: 'CA/NL/Central/Shoe Cove',
  },
  {
    label: 'Snooks Arm',
    value: 'CA/NL/Central/Snooks Arm',
  },
  {
    label: 'South Brook Gb',
    value: 'CA/NL/Central/South Brook Gb',
  },
  {
    label: 'Springdale',
    value: 'CA/NL/Central/Springdale',
  },
  {
    label: 'St Albans',
    value: 'CA/NL/Central/St Albans',
  },
  {
    label: 'St Brendans',
    value: 'CA/NL/Central/St Brendans',
  },
  {
    label: 'St Chads',
    value: 'CA/NL/Central/St Chads',
  },
  {
    label: 'Stag Harbour',
    value: 'CA/NL/Central/Stag Harbour',
  },
  {
    label: 'Stoneville',
    value: 'CA/NL/Central/Stoneville',
  },
  {
    label: 'Summerford',
    value: 'CA/NL/Central/Summerford',
  },
  {
    label: 'Templeman',
    value: 'CA/NL/Central/Templeman',
  },
  {
    label: 'Tilting',
    value: 'CA/NL/Central/Tilting',
  },
  {
    label: 'Tizzards Harbour',
    value: 'CA/NL/Central/Tizzards Harbour',
  },
  {
    label: 'Traytown',
    value: 'CA/NL/Central/Traytown',
  },
  {
    label: 'Trinity Bb',
    value: 'CA/NL/Central/Trinity Bb',
  },
  {
    label: 'Triton',
    value: 'CA/NL/Central/Triton',
  },
  {
    label: 'Twillingate',
    value: 'CA/NL/Central/Twillingate',
  },
  {
    label: 'Valley Pond',
    value: 'CA/NL/Central/Valley Pond',
  },
  {
    label: 'Victoria Cove',
    value: 'CA/NL/Central/Victoria Cove',
  },
  {
    label: 'Wareham-Centreville',
    value: 'CA/NL/Central/Wareham-Centreville',
  },
  {
    label: 'Wesleyville',
    value: 'CA/NL/Central/Wesleyville',
  },
  {
    label: 'Westport',
    value: 'CA/NL/Central/Westport',
  },
  {
    label: 'Wings Point',
    value: 'CA/NL/Central/Wings Point',
  },
  {
    label: 'Woodstock',
    value: 'CA/NL/Central/Woodstock',
  },
  {
    label: 'Badgers Quay',
    value: 'CA/NL/Clarenville/Badgers Quay',
  },
  {
    label: 'Bloomfield',
    value: 'CA/NL/Clarenville/Bloomfield',
  },
  {
    label: 'Bonavista',
    value: 'CA/NL/Clarenville/Bonavista',
  },
  {
    label: 'Bunyans Cove',
    value: 'CA/NL/Clarenville/Bunyans Cove',
  },
  {
    label: 'Cape Freels North',
    value: 'CA/NL/Clarenville/Cape Freels North',
  },
  {
    label: 'Catalina',
    value: 'CA/NL/Clarenville/Catalina',
  },
  {
    label: 'Charlottetown',
    value: 'CA/NL/Clarenville/Charlottetown',
  },
  {
    label: 'Clarenville',
    value: 'CA/NL/Clarenville/Clarenville',
  },
  {
    label: 'Dover',
    value: 'CA/NL/Clarenville/Dover',
  },
  {
    label: 'Eastport',
    value: 'CA/NL/Clarenville/Eastport',
  },
  {
    label: 'Elliston',
    value: 'CA/NL/Clarenville/Elliston',
  },
  {
    label: 'Gambo',
    value: 'CA/NL/Clarenville/Gambo',
  },
  {
    label: 'Gambo South',
    value: 'CA/NL/Clarenville/Gambo South',
  },
  {
    label: 'Glovertown',
    value: 'CA/NL/Clarenville/Glovertown',
  },
  {
    label: 'Glovertown South',
    value: 'CA/NL/Clarenville/Glovertown South',
  },
  {
    label: 'Gooseberry Cove',
    value: 'CA/NL/Clarenville/Gooseberry Cove',
  },
  {
    label: 'Greenspond',
    value: 'CA/NL/Clarenville/Greenspond',
  },
  {
    label: 'Hare Bay Bb',
    value: 'CA/NL/Clarenville/Hare Bay Bb',
  },
  {
    label: 'Hickmans Harbour',
    value: 'CA/NL/Clarenville/Hickmans Harbour',
  },
  {
    label: 'Hillview',
    value: 'CA/NL/Clarenville/Hillview',
  },
  {
    label: 'Hodges Cove',
    value: 'CA/NL/Clarenville/Hodges Cove',
  },
  {
    label: 'Indian Bay Bb',
    value: 'CA/NL/Clarenville/Indian Bay Bb',
  },
  {
    label: 'Kings Cove',
    value: 'CA/NL/Clarenville/Kings Cove',
  },
  {
    label: 'Knights Cove',
    value: 'CA/NL/Clarenville/Knights Cove',
  },
  {
    label: 'Lethbridge',
    value: 'CA/NL/Clarenville/Lethbridge',
  },
  {
    label: 'Little Catalina',
    value: 'CA/NL/Clarenville/Little Catalina',
  },
  {
    label: 'Melrose',
    value: 'CA/NL/Clarenville/Melrose',
  },
  {
    label: 'Musgravetown',
    value: 'CA/NL/Clarenville/Musgravetown',
  },
  {
    label: 'Newmans Cove',
    value: 'CA/NL/Clarenville/Newmans Cove',
  },
  {
    label: 'Newtown',
    value: 'CA/NL/Clarenville/Newtown',
  },
  {
    label: 'Plate Cove East',
    value: 'CA/NL/Clarenville/Plate Cove East',
  },
  {
    label: 'Plate Cove West',
    value: 'CA/NL/Clarenville/Plate Cove West',
  },
  {
    label: 'Port Blandford',
    value: 'CA/NL/Clarenville/Port Blandford',
  },
  {
    label: 'Port Rexton',
    value: 'CA/NL/Clarenville/Port Rexton',
  },
  {
    label: 'Port Union',
    value: 'CA/NL/Clarenville/Port Union',
  },
  {
    label: 'Princeton',
    value: 'CA/NL/Clarenville/Princeton',
  },
  {
    label: 'Salvage',
    value: 'CA/NL/Clarenville/Salvage',
  },
  {
    label: 'Sandringham',
    value: 'CA/NL/Clarenville/Sandringham',
  },
  {
    label: 'Sandy Cove',
    value: 'CA/NL/Clarenville/Sandy Cove',
  },
  {
    label: 'Southern Bay',
    value: 'CA/NL/Clarenville/Southern Bay',
  },
  {
    label: 'St Brendans',
    value: 'CA/NL/Clarenville/St Brendans',
  },
  {
    label: 'St Chads',
    value: 'CA/NL/Clarenville/St Chads',
  },
  {
    label: 'Summerville',
    value: 'CA/NL/Clarenville/Summerville',
  },
  {
    label: 'Sweet Bay',
    value: 'CA/NL/Clarenville/Sweet Bay',
  },
  {
    label: 'Templeman',
    value: 'CA/NL/Clarenville/Templeman',
  },
  {
    label: 'Tickle Cove',
    value: 'CA/NL/Clarenville/Tickle Cove',
  },
  {
    label: 'Traytown',
    value: 'CA/NL/Clarenville/Traytown',
  },
  {
    label: 'Trinity Bb',
    value: 'CA/NL/Clarenville/Trinity Bb',
  },
  {
    label: 'Trinity Tb',
    value: 'CA/NL/Clarenville/Trinity Tb',
  },
  {
    label: 'Wareham-Centreville',
    value: 'CA/NL/Clarenville/Wareham-Centreville',
  },
  {
    label: 'Wesleyville',
    value: 'CA/NL/Clarenville/Wesleyville',
  },
  {
    label: 'Aquaforte',
    value: 'CA/NL/Conception Bay - St. Johns/Aquaforte',
  },
  {
    label: 'Arnolds Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Arnolds Cove',
  },
  {
    label: 'Avondale',
    value: 'CA/NL/Conception Bay - St. Johns/Avondale',
  },
  {
    label: 'Bay Bulls',
    value: 'CA/NL/Conception Bay - St. Johns/Bay Bulls',
  },
  {
    label: 'Bay De Verde',
    value: 'CA/NL/Conception Bay - St. Johns/Bay De Verde',
  },
  {
    label: 'Bay Roberts',
    value: 'CA/NL/Conception Bay - St. Johns/Bay Roberts',
  },
  {
    label: 'Bell Island',
    value: 'CA/NL/Conception Bay - St. Johns/Bell Island',
  },
  {
    label: 'Bell Island Front',
    value: 'CA/NL/Conception Bay - St. Johns/Bell Island Front',
  },
  {
    label: 'Bellevue',
    value: 'CA/NL/Conception Bay - St. Johns/Bellevue',
  },
  {
    label: 'Blaketown',
    value: 'CA/NL/Conception Bay - St. Johns/Blaketown',
  },
  {
    label: 'Branch',
    value: 'CA/NL/Conception Bay - St. Johns/Branch',
  },
  {
    label: 'Brigus',
    value: 'CA/NL/Conception Bay - St. Johns/Brigus',
  },
  {
    label: 'Brigus Junction',
    value: 'CA/NL/Conception Bay - St. Johns/Brigus Junction',
  },
  {
    label: 'Broad Cove Bdv',
    value: 'CA/NL/Conception Bay - St. Johns/Broad Cove Bdv',
  },
  {
    label: 'Brownsdale',
    value: 'CA/NL/Conception Bay - St. Johns/Brownsdale',
  },
  {
    label: 'Burnt Point Bdv',
    value: 'CA/NL/Conception Bay - St. Johns/Burnt Point Bdv',
  },
  {
    label: 'Calvert',
    value: 'CA/NL/Conception Bay - St. Johns/Calvert',
  },
  {
    label: 'Cape Broyle',
    value: 'CA/NL/Conception Bay - St. Johns/Cape Broyle',
  },
  {
    label: 'Cappahayden',
    value: 'CA/NL/Conception Bay - St. Johns/Cappahayden',
  },
  {
    label: 'Carbonear',
    value: 'CA/NL/Conception Bay - St. Johns/Carbonear',
  },
  {
    label: 'Cavendish',
    value: 'CA/NL/Conception Bay - St. Johns/Cavendish',
  },
  {
    label: 'Chance Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Chance Cove',
  },
  {
    label: 'Chapel Arm',
    value: 'CA/NL/Conception Bay - St. Johns/Chapel Arm',
  },
  {
    label: 'Clarkes Beach',
    value: 'CA/NL/Conception Bay - St. Johns/Clarkes Beach',
  },
  {
    label: 'Coleys Point South',
    value: 'CA/NL/Conception Bay - St. Johns/Coleys Point South',
  },
  {
    label: 'Colinet',
    value: 'CA/NL/Conception Bay - St. Johns/Colinet',
  },
  {
    label: 'Colliers Riverhead',
    value: 'CA/NL/Conception Bay - St. Johns/Colliers Riverhead',
  },
  {
    label: 'Come By Chance',
    value: 'CA/NL/Conception Bay - St. Johns/Come By Chance',
  },
  {
    label: 'Conception Bay South',
    value: 'CA/NL/Conception Bay - St. Johns/Conception Bay South',
  },
  {
    label: 'Conception Harbour',
    value: 'CA/NL/Conception Bay - St. Johns/Conception Harbour',
  },
  {
    label: 'Cupids',
    value: 'CA/NL/Conception Bay - St. Johns/Cupids',
  },
  {
    label: 'Dildo',
    value: 'CA/NL/Conception Bay - St. Johns/Dildo',
  },
  {
    label: 'Dunville',
    value: 'CA/NL/Conception Bay - St. Johns/Dunville',
  },
  {
    label: 'Fair Haven',
    value: 'CA/NL/Conception Bay - St. Johns/Fair Haven',
  },
  {
    label: 'Fermeuse',
    value: 'CA/NL/Conception Bay - St. Johns/Fermeuse',
  },
  {
    label: 'Ferryland',
    value: 'CA/NL/Conception Bay - St. Johns/Ferryland',
  },
  {
    label: 'Flatrock',
    value: 'CA/NL/Conception Bay - St. Johns/Flatrock',
  },
  {
    label: 'Fox Harbour Pb',
    value: 'CA/NL/Conception Bay - St. Johns/Fox Harbour Pb',
  },
  {
    label: 'Freshwater Pb',
    value: 'CA/NL/Conception Bay - St. Johns/Freshwater Pb',
  },
  {
    label: 'Goulds',
    value: 'CA/NL/Conception Bay - St. Johns/Goulds',
  },
  {
    label: 'Grates Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Grates Cove',
  },
  {
    label: 'Greens Harbour',
    value: 'CA/NL/Conception Bay - St. Johns/Greens Harbour',
  },
  {
    label: 'Hants Harbour',
    value: 'CA/NL/Conception Bay - St. Johns/Hants Harbour',
  },
  {
    label: 'Harbour Grace',
    value: 'CA/NL/Conception Bay - St. Johns/Harbour Grace',
  },
  {
    label: 'Harbour Main',
    value: 'CA/NL/Conception Bay - St. Johns/Harbour Main',
  },
  {
    label: 'Hearts Content',
    value: 'CA/NL/Conception Bay - St. Johns/Hearts Content',
  },
  {
    label: 'Holyrood',
    value: 'CA/NL/Conception Bay - St. Johns/Holyrood',
  },
  {
    label: 'Hopeall',
    value: 'CA/NL/Conception Bay - St. Johns/Hopeall',
  },
  {
    label: 'Islington',
    value: 'CA/NL/Conception Bay - St. Johns/Islington',
  },
  {
    label: 'Jerseyside',
    value: 'CA/NL/Conception Bay - St. Johns/Jerseyside',
  },
  {
    label: 'Jobs Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Jobs Cove',
  },
  {
    label: 'Logy Bay',
    value: 'CA/NL/Conception Bay - St. Johns/Logy Bay',
  },
  {
    label: 'Long Harbour',
    value: 'CA/NL/Conception Bay - St. Johns/Long Harbour',
  },
  {
    label: 'Lower Island Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Lower Island Cove',
  },
  {
    label: 'Makinsons',
    value: 'CA/NL/Conception Bay - St. Johns/Makinsons',
  },
  {
    label: 'Mount Carmel',
    value: 'CA/NL/Conception Bay - St. Johns/Mount Carmel',
  },
  {
    label: 'Mount Pearl',
    value: 'CA/NL/Conception Bay - St. Johns/Mount Pearl',
  },
  {
    label: 'New Harbour Tb',
    value: 'CA/NL/Conception Bay - St. Johns/New Harbour Tb',
  },
  {
    label: 'Normans Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Normans Cove',
  },
  {
    label: 'Northern Bay',
    value: 'CA/NL/Conception Bay - St. Johns/Northern Bay',
  },
  {
    label: 'Old Perlican',
    value: 'CA/NL/Conception Bay - St. Johns/Old Perlican',
  },
  {
    label: 'Outer Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Outer Cove',
  },
  {
    label: 'Paradise',
    value: 'CA/NL/Conception Bay - St. Johns/Paradise',
  },
  {
    label: 'Petty Harbour',
    value: 'CA/NL/Conception Bay - St. Johns/Petty Harbour',
  },
  {
    label: 'Placentia',
    value: 'CA/NL/Conception Bay - St. Johns/Placentia',
  },
  {
    label: 'Port De Grave',
    value: 'CA/NL/Conception Bay - St. Johns/Port De Grave',
  },
  {
    label: "Portugal Cove-St Philip's",
    value: "CA/NL/Conception Bay - St. Johns/Portugal Cove-St Philip's",
  },
  {
    label: 'Pouch Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Pouch Cove',
  },
  {
    label: 'Red Head Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Red Head Cove',
  },
  {
    label: 'Renews',
    value: 'CA/NL/Conception Bay - St. Johns/Renews',
  },
  {
    label: 'Shea Heights',
    value: 'CA/NL/Conception Bay - St. Johns/Shea Heights',
  },
  {
    label: 'Ship Harbour Pb',
    value: 'CA/NL/Conception Bay - St. Johns/Ship Harbour Pb',
  },
  {
    label: 'South River',
    value: 'CA/NL/Conception Bay - St. Johns/South River',
  },
  {
    label: 'Southern Harbour Pb',
    value: 'CA/NL/Conception Bay - St. Johns/Southern Harbour Pb',
  },
  {
    label: 'Spaniards Bay',
    value: 'CA/NL/Conception Bay - St. Johns/Spaniards Bay',
  },
  {
    label: 'St Brides',
    value: 'CA/NL/Conception Bay - St. Johns/St Brides',
  },
  {
    label: "St John's",
    value: "CA/NL/Conception Bay - St. Johns/St John's",
  },
  {
    label: 'St Marys',
    value: 'CA/NL/Conception Bay - St. Johns/St Marys',
  },
  {
    label: 'St Shotts',
    value: 'CA/NL/Conception Bay - St. Johns/St Shotts',
  },
  {
    label: 'St Vincents',
    value: 'CA/NL/Conception Bay - St. Johns/St Vincents',
  },
  {
    label: 'Sunnyside',
    value: 'CA/NL/Conception Bay - St. Johns/Sunnyside',
  },
  {
    label: 'Torbay',
    value: 'CA/NL/Conception Bay - St. Johns/Torbay',
  },
  {
    label: 'Tors Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Tors Cove',
  },
  {
    label: 'Trepassey',
    value: 'CA/NL/Conception Bay - St. Johns/Trepassey',
  },
  {
    label: 'Upper Island Cove',
    value: 'CA/NL/Conception Bay - St. Johns/Upper Island Cove',
  },
  {
    label: 'Victoria',
    value: 'CA/NL/Conception Bay - St. Johns/Victoria',
  },
  {
    label: 'Western Bay',
    value: 'CA/NL/Conception Bay - St. Johns/Western Bay',
  },
  {
    label: 'Whitbourne',
    value: 'CA/NL/Conception Bay - St. Johns/Whitbourne',
  },
  {
    label: 'Whiteway',
    value: 'CA/NL/Conception Bay - St. Johns/Whiteway',
  },
  {
    label: 'Winterton',
    value: 'CA/NL/Conception Bay - St. Johns/Winterton',
  },
  {
    label: 'Witless Bay',
    value: 'CA/NL/Conception Bay - St. Johns/Witless Bay',
  },
  {
    label: 'Woodfords',
    value: 'CA/NL/Conception Bay - St. Johns/Woodfords',
  },
  {
    label: 'Benoits Cove',
    value: 'CA/NL/Corner Brook/Benoits Cove',
  },
  {
    label: 'Corner Brook',
    value: 'CA/NL/Corner Brook/Corner Brook',
  },
  {
    label: 'Coxs Cove',
    value: 'CA/NL/Corner Brook/Coxs Cove',
  },
  {
    label: 'Deer Lake',
    value: 'CA/NL/Corner Brook/Deer Lake',
  },
  {
    label: "Frenchman's Cove Boi",
    value: "CA/NL/Corner Brook/Frenchman's Cove Boi",
  },
  {
    label: 'Hampden',
    value: 'CA/NL/Corner Brook/Hampden',
  },
  {
    label: 'Howley',
    value: 'CA/NL/Corner Brook/Howley',
  },
  {
    label: 'Irishtown-Summerside',
    value: 'CA/NL/Corner Brook/Irishtown-Summerside',
  },
  {
    label: 'Jacksons Arm',
    value: 'CA/NL/Corner Brook/Jacksons Arm',
  },
  {
    label: 'Lark Harbour',
    value: 'CA/NL/Corner Brook/Lark Harbour',
  },
  {
    label: 'Massey Drive',
    value: 'CA/NL/Corner Brook/Massey Drive',
  },
  {
    label: 'Mount Moriah',
    value: 'CA/NL/Corner Brook/Mount Moriah',
  },
  {
    label: 'Pasadena',
    value: 'CA/NL/Corner Brook/Pasadena',
  },
  {
    label: 'Pollards Point',
    value: 'CA/NL/Corner Brook/Pollards Point',
  },
  {
    label: 'Reidville',
    value: 'CA/NL/Corner Brook/Reidville',
  },
  {
    label: 'Sops Arm',
    value: 'CA/NL/Corner Brook/Sops Arm',
  },
  {
    label: 'York Harbour',
    value: 'CA/NL/Corner Brook/York Harbour',
  },
  {
    label: 'Arnolds Cove',
    value: 'CA/NL/Eastern/Arnolds Cove',
  },
  {
    label: 'Baine Harbour',
    value: 'CA/NL/Eastern/Baine Harbour',
  },
  {
    label: "Bay L'argent",
    value: "CA/NL/Eastern/Bay L'argent",
  },
  {
    label: 'Bloomfield',
    value: 'CA/NL/Eastern/Bloomfield',
  },
  {
    label: 'Boat Harbour West',
    value: 'CA/NL/Eastern/Boat Harbour West',
  },
  {
    label: 'Bonavista',
    value: 'CA/NL/Eastern/Bonavista',
  },
  {
    label: 'Bunyans Cove',
    value: 'CA/NL/Eastern/Bunyans Cove',
  },
  {
    label: 'Burgoynes Cove',
    value: 'CA/NL/Eastern/Burgoynes Cove',
  },
  {
    label: 'Burin',
    value: 'CA/NL/Eastern/Burin',
  },
  {
    label: 'Burin Bay Arm',
    value: 'CA/NL/Eastern/Burin Bay Arm',
  },
  {
    label: 'Burns Cove',
    value: 'CA/NL/Eastern/Burns Cove',
  },
  {
    label: 'Cannings Cove',
    value: 'CA/NL/Eastern/Cannings Cove',
  },
  {
    label: 'Catalina',
    value: 'CA/NL/Eastern/Catalina',
  },
  {
    label: 'Charleston',
    value: 'CA/NL/Eastern/Charleston',
  },
  {
    label: 'Clarenville',
    value: 'CA/NL/Eastern/Clarenville',
  },
  {
    label: 'Come By Chance',
    value: 'CA/NL/Eastern/Come By Chance',
  },
  {
    label: 'Creston',
    value: 'CA/NL/Eastern/Creston',
  },
  {
    label: 'Creston North',
    value: 'CA/NL/Eastern/Creston North',
  },
  {
    label: 'Duntara',
    value: 'CA/NL/Eastern/Duntara',
  },
  {
    label: 'Elliston',
    value: 'CA/NL/Eastern/Elliston',
  },
  {
    label: 'English Harbour East',
    value: 'CA/NL/Eastern/English Harbour East',
  },
  {
    label: 'Epworth',
    value: 'CA/NL/Eastern/Epworth',
  },
  {
    label: 'Fortune',
    value: 'CA/NL/Eastern/Fortune',
  },
  {
    label: 'Frenchmans Cove Fb',
    value: 'CA/NL/Eastern/Frenchmans Cove Fb',
  },
  {
    label: 'Garden Cove Pb',
    value: 'CA/NL/Eastern/Garden Cove Pb',
  },
  {
    label: 'Garnish',
    value: 'CA/NL/Eastern/Garnish',
  },
  {
    label: 'Gooseberry Cove',
    value: 'CA/NL/Eastern/Gooseberry Cove',
  },
  {
    label: 'Grand Bank',
    value: 'CA/NL/Eastern/Grand Bank',
  },
  {
    label: 'Grand Beach',
    value: 'CA/NL/Eastern/Grand Beach',
  },
  {
    label: 'Grand Le Pierre',
    value: 'CA/NL/Eastern/Grand Le Pierre',
  },
  {
    label: 'Harbour Mille',
    value: 'CA/NL/Eastern/Harbour Mille',
  },
  {
    label: 'Hickmans Harbour',
    value: 'CA/NL/Eastern/Hickmans Harbour',
  },
  {
    label: 'Hillview',
    value: 'CA/NL/Eastern/Hillview',
  },
  {
    label: 'Hodges Cove',
    value: 'CA/NL/Eastern/Hodges Cove',
  },
  {
    label: 'Keels',
    value: 'CA/NL/Eastern/Keels',
  },
  {
    label: 'Kings Cove',
    value: 'CA/NL/Eastern/Kings Cove',
  },
  {
    label: 'Knights Cove',
    value: 'CA/NL/Eastern/Knights Cove',
  },
  {
    label: 'Lamaline',
    value: 'CA/NL/Eastern/Lamaline',
  },
  {
    label: 'Lawn',
    value: 'CA/NL/Eastern/Lawn',
  },
  {
    label: 'Lethbridge',
    value: 'CA/NL/Eastern/Lethbridge',
  },
  {
    label: 'Lewins Cove',
    value: 'CA/NL/Eastern/Lewins Cove',
  },
  {
    label: 'Little Bay East',
    value: 'CA/NL/Eastern/Little Bay East',
  },
  {
    label: 'Little Bay Pb',
    value: 'CA/NL/Eastern/Little Bay Pb',
  },
  {
    label: 'Little Catalina',
    value: 'CA/NL/Eastern/Little Catalina',
  },
  {
    label: 'Little Hearts Ease',
    value: 'CA/NL/Eastern/Little Hearts Ease',
  },
  {
    label: 'Little St Lawrence',
    value: 'CA/NL/Eastern/Little St Lawrence',
  },
  {
    label: 'Marystown',
    value: 'CA/NL/Eastern/Marystown',
  },
  {
    label: 'Melrose',
    value: 'CA/NL/Eastern/Melrose',
  },
  {
    label: 'Monkstown',
    value: 'CA/NL/Eastern/Monkstown',
  },
  {
    label: 'Musgravetown',
    value: 'CA/NL/Eastern/Musgravetown',
  },
  {
    label: 'Newmans Cove',
    value: 'CA/NL/Eastern/Newmans Cove',
  },
  {
    label: 'North Harbour Pb',
    value: 'CA/NL/Eastern/North Harbour Pb',
  },
  {
    label: 'North West Brook',
    value: 'CA/NL/Eastern/North West Brook',
  },
  {
    label: 'Open Hall',
    value: 'CA/NL/Eastern/Open Hall',
  },
  {
    label: 'Petit Forte',
    value: 'CA/NL/Eastern/Petit Forte',
  },
  {
    label: 'Plate Cove East',
    value: 'CA/NL/Eastern/Plate Cove East',
  },
  {
    label: 'Plate Cove West',
    value: 'CA/NL/Eastern/Plate Cove West',
  },
  {
    label: 'Port Blandford',
    value: 'CA/NL/Eastern/Port Blandford',
  },
  {
    label: 'Port Rexton',
    value: 'CA/NL/Eastern/Port Rexton',
  },
  {
    label: 'Port Union',
    value: 'CA/NL/Eastern/Port Union',
  },
  {
    label: 'Princeton',
    value: 'CA/NL/Eastern/Princeton',
  },
  {
    label: 'Red Harbour Pb',
    value: 'CA/NL/Eastern/Red Harbour Pb',
  },
  {
    label: 'Rushoon',
    value: 'CA/NL/Eastern/Rushoon',
  },
  {
    label: 'South East Bight',
    value: 'CA/NL/Eastern/South East Bight',
  },
  {
    label: 'Southern Bay',
    value: 'CA/NL/Eastern/Southern Bay',
  },
  {
    label: 'St Bernards-Jacques Fontaine',
    value: 'CA/NL/Eastern/St Bernards-Jacques Fontaine',
  },
  {
    label: 'St Lawrence',
    value: 'CA/NL/Eastern/St Lawrence',
  },
  {
    label: 'Summerville',
    value: 'CA/NL/Eastern/Summerville',
  },
  {
    label: 'Sunnyside',
    value: 'CA/NL/Eastern/Sunnyside',
  },
  {
    label: 'Sweet Bay',
    value: 'CA/NL/Eastern/Sweet Bay',
  },
  {
    label: 'Swift Current',
    value: 'CA/NL/Eastern/Swift Current',
  },
  {
    label: 'Terrenceville',
    value: 'CA/NL/Eastern/Terrenceville',
  },
  {
    label: 'Tickle Cove',
    value: 'CA/NL/Eastern/Tickle Cove',
  },
  {
    label: 'Trinity Tb',
    value: 'CA/NL/Eastern/Trinity Tb',
  },
  {
    label: 'Winterland',
    value: 'CA/NL/Eastern/Winterland',
  },
  {
    label: 'Badger',
    value: 'CA/NL/Grand-Sault/Badger',
  },
  {
    label: 'Benton',
    value: 'CA/NL/Grand-Sault/Benton',
  },
  {
    label: 'Bishops Falls',
    value: 'CA/NL/Grand-Sault/Bishops Falls',
  },
  {
    label: 'Botwood',
    value: 'CA/NL/Grand-Sault/Botwood',
  },
  {
    label: 'Buchans',
    value: 'CA/NL/Grand-Sault/Buchans',
  },
  {
    label: 'Gander',
    value: 'CA/NL/Grand-Sault/Gander',
  },
  {
    label: 'Glenwood',
    value: 'CA/NL/Grand-Sault/Glenwood',
  },
  {
    label: 'Grand Falls-Windsor',
    value: 'CA/NL/Grand-Sault/Grand Falls-Windsor',
  },
  {
    label: 'Millertown',
    value: 'CA/NL/Grand-Sault/Millertown',
  },
  {
    label: 'Norris Arm',
    value: 'CA/NL/Grand-Sault/Norris Arm',
  },
  {
    label: 'Peterview',
    value: 'CA/NL/Grand-Sault/Peterview',
  },
  {
    label: 'Belleoram',
    value: 'CA/NL/Harbour Breton/Belleoram',
  },
  {
    label: 'Burgeo',
    value: 'CA/NL/Harbour Breton/Burgeo',
  },
  {
    label: 'Burnt Islands Blp',
    value: 'CA/NL/Harbour Breton/Burnt Islands Blp',
  },
  {
    label: 'Channel-Port-Aux-Basques',
    value: 'CA/NL/Harbour Breton/Channel-Port-Aux-Basques',
  },
  {
    label: 'Conne River',
    value: 'CA/NL/Harbour Breton/Conne River',
  },
  {
    label: 'English Harbour West',
    value: 'CA/NL/Harbour Breton/English Harbour West',
  },
  {
    label: 'Francois',
    value: 'CA/NL/Harbour Breton/Francois',
  },
  {
    label: 'Gaultois',
    value: 'CA/NL/Harbour Breton/Gaultois',
  },
  {
    label: 'Grand Bay East',
    value: 'CA/NL/Harbour Breton/Grand Bay East',
  },
  {
    label: 'Grey River',
    value: 'CA/NL/Harbour Breton/Grey River',
  },
  {
    label: 'Harbour Breton',
    value: 'CA/NL/Harbour Breton/Harbour Breton',
  },
  {
    label: "Head Bay D'espoir",
    value: "CA/NL/Harbour Breton/Head Bay D'espoir",
  },
  {
    label: 'Hermitage',
    value: 'CA/NL/Harbour Breton/Hermitage',
  },
  {
    label: 'Isle-Aux-Morts',
    value: 'CA/NL/Harbour Breton/Isle-Aux-Morts',
  },
  {
    label: 'La Poile',
    value: 'CA/NL/Harbour Breton/La Poile',
  },
  {
    label: 'Mccallum',
    value: 'CA/NL/Harbour Breton/Mccallum',
  },
  {
    label: 'Milltown',
    value: 'CA/NL/Harbour Breton/Milltown',
  },
  {
    label: 'Pools Cove',
    value: 'CA/NL/Harbour Breton/Pools Cove',
  },
  {
    label: 'Ramea',
    value: 'CA/NL/Harbour Breton/Ramea',
  },
  {
    label: 'Rose Blanche',
    value: 'CA/NL/Harbour Breton/Rose Blanche',
  },
  {
    label: 'Seal Cove Fb',
    value: 'CA/NL/Harbour Breton/Seal Cove Fb',
  },
  {
    label: 'St Albans',
    value: 'CA/NL/Harbour Breton/St Albans',
  },
  {
    label: 'Hopedale',
    value: 'CA/NL/Hopedale/Hopedale',
  },
  {
    label: 'Makkovik',
    value: 'CA/NL/Hopedale/Makkovik',
  },
  {
    label: 'Nain',
    value: 'CA/NL/Hopedale/Nain',
  },
  {
    label: 'Postville',
    value: 'CA/NL/Hopedale/Postville',
  },
  {
    label: 'Rigolet',
    value: 'CA/NL/Hopedale/Rigolet',
  },
  {
    label: 'Black Tickle',
    value: 'CA/NL/Labrador/Black Tickle',
  },
  {
    label: 'Cartwright',
    value: 'CA/NL/Labrador/Cartwright',
  },
  {
    label: 'Churchill Falls',
    value: 'CA/NL/Labrador/Churchill Falls',
  },
  {
    label: 'Forteau',
    value: 'CA/NL/Labrador/Forteau',
  },
  {
    label: 'Happy Valley-Goose Bay',
    value: 'CA/NL/Labrador/Happy Valley-Goose Bay',
  },
  {
    label: 'Hopedale',
    value: 'CA/NL/Labrador/Hopedale',
  },
  {
    label: 'Labrador City',
    value: 'CA/NL/Labrador/Labrador City',
  },
  {
    label: "L'anse Au Clair",
    value: "CA/NL/Labrador/L'anse Au Clair",
  },
  {
    label: "L'anse Au Loup",
    value: "CA/NL/Labrador/L'anse Au Loup",
  },
  {
    label: 'Lodge Bay',
    value: 'CA/NL/Labrador/Lodge Bay',
  },
  {
    label: 'Makkovik',
    value: 'CA/NL/Labrador/Makkovik',
  },
  {
    label: 'Marys Harbour',
    value: 'CA/NL/Labrador/Marys Harbour',
  },
  {
    label: 'Mud Lake',
    value: 'CA/NL/Labrador/Mud Lake',
  },
  {
    label: 'Nain',
    value: 'CA/NL/Labrador/Nain',
  },
  {
    label: 'Natuashish',
    value: 'CA/NL/Labrador/Natuashish',
  },
  {
    label: 'North West River',
    value: 'CA/NL/Labrador/North West River',
  },
  {
    label: 'Port Hope Simpson',
    value: 'CA/NL/Labrador/Port Hope Simpson',
  },
  {
    label: 'Postville',
    value: 'CA/NL/Labrador/Postville',
  },
  {
    label: 'Red Bay',
    value: 'CA/NL/Labrador/Red Bay',
  },
  {
    label: 'Rigolet',
    value: 'CA/NL/Labrador/Rigolet',
  },
  {
    label: 'St Lewis',
    value: 'CA/NL/Labrador/St Lewis',
  },
  {
    label: 'Wabush',
    value: 'CA/NL/Labrador/Wabush',
  },
  {
    label: 'West St Modeste',
    value: 'CA/NL/Labrador/West St Modeste',
  },
  {
    label: "Athlete's Village",
    value: "CA/NL/Labrador City/Athlete's Village",
  },
  {
    label: 'Black Tickle',
    value: 'CA/NL/Labrador City/Black Tickle',
  },
  {
    label: 'Cartwright',
    value: 'CA/NL/Labrador City/Cartwright',
  },
  {
    label: 'Churchill Falls',
    value: 'CA/NL/Labrador City/Churchill Falls',
  },
  {
    label: 'Forteau',
    value: 'CA/NL/Labrador City/Forteau',
  },
  {
    label: 'Happy Valley-Goose Bay',
    value: 'CA/NL/Labrador City/Happy Valley-Goose Bay',
  },
  {
    label: 'Harrington Harbour',
    value: 'CA/NL/Labrador City/Harrington Harbour',
  },
  {
    label: 'Labrador City',
    value: 'CA/NL/Labrador City/Labrador City',
  },
  {
    label: "L'anse Au Clair",
    value: "CA/NL/Labrador City/L'anse Au Clair",
  },
  {
    label: "L'anse Au Loup",
    value: "CA/NL/Labrador City/L'anse Au Loup",
  },
  {
    label: 'Lodge Bay',
    value: 'CA/NL/Labrador City/Lodge Bay',
  },
  {
    label: 'Marys Harbour',
    value: 'CA/NL/Labrador City/Marys Harbour',
  },
  {
    label: 'North West River',
    value: 'CA/NL/Labrador City/North West River',
  },
  {
    label: 'Port Hope Simpson',
    value: 'CA/NL/Labrador City/Port Hope Simpson',
  },
  {
    label: 'St Lewis',
    value: 'CA/NL/Labrador City/St Lewis',
  },
  {
    label: 'Wabush',
    value: 'CA/NL/Labrador City/Wabush',
  },
  {
    label: 'Aguathuna',
    value: 'CA/NL/Stephenville/Aguathuna',
  },
  {
    label: 'Barachois Brook',
    value: 'CA/NL/Stephenville/Barachois Brook',
  },
  {
    label: 'Codroy',
    value: 'CA/NL/Stephenville/Codroy',
  },
  {
    label: 'Doyles',
    value: 'CA/NL/Stephenville/Doyles',
  },
  {
    label: 'Heatherton',
    value: 'CA/NL/Stephenville/Heatherton',
  },
  {
    label: 'Highlands',
    value: 'CA/NL/Stephenville/Highlands',
  },
  {
    label: 'Kippens',
    value: 'CA/NL/Stephenville/Kippens',
  },
  {
    label: 'Lourdes',
    value: 'CA/NL/Stephenville/Lourdes',
  },
  {
    label: 'Noels Pond',
    value: 'CA/NL/Stephenville/Noels Pond',
  },
  {
    label: 'Port Au Port',
    value: 'CA/NL/Stephenville/Port Au Port',
  },
  {
    label: 'Robinsons',
    value: 'CA/NL/Stephenville/Robinsons',
  },
  {
    label: 'South Branch',
    value: 'CA/NL/Stephenville/South Branch',
  },
  {
    label: 'St Andrews',
    value: 'CA/NL/Stephenville/St Andrews',
  },
  {
    label: 'St Davids',
    value: 'CA/NL/Stephenville/St Davids',
  },
  {
    label: 'St Fintans',
    value: 'CA/NL/Stephenville/St Fintans',
  },
  {
    label: 'St Georges',
    value: 'CA/NL/Stephenville/St Georges',
  },
  {
    label: 'Stephenville',
    value: 'CA/NL/Stephenville/Stephenville',
  },
  {
    label: 'Stephenville Crossing',
    value: 'CA/NL/Stephenville/Stephenville Crossing',
  },
  {
    label: 'West Bay Centre',
    value: 'CA/NL/Stephenville/West Bay Centre',
  },
  {
    label: 'Aguathuna',
    value: 'CA/NL/Western/Aguathuna',
  },
  {
    label: 'Anchor Point',
    value: 'CA/NL/Western/Anchor Point',
  },
  {
    label: 'Barachois Brook',
    value: 'CA/NL/Western/Barachois Brook',
  },
  {
    label: 'Bartletts Harbour',
    value: 'CA/NL/Western/Bartletts Harbour',
  },
  {
    label: 'Bellburns',
    value: 'CA/NL/Western/Bellburns',
  },
  {
    label: 'Benoits Cove',
    value: 'CA/NL/Western/Benoits Cove',
  },
  {
    label: 'Bide Arm',
    value: 'CA/NL/Western/Bide Arm',
  },
  {
    label: 'Birchy Head',
    value: 'CA/NL/Western/Birchy Head',
  },
  {
    label: 'Bird Cove',
    value: 'CA/NL/Western/Bird Cove',
  },
  {
    label: 'Black Duck Cove',
    value: 'CA/NL/Western/Black Duck Cove',
  },
  {
    label: 'Black Duck Siding',
    value: 'CA/NL/Western/Black Duck Siding',
  },
  {
    label: 'Bonne Bay',
    value: 'CA/NL/Western/Bonne Bay',
  },
  {
    label: 'Bonne Bay Pond',
    value: 'CA/NL/Western/Bonne Bay Pond',
  },
  {
    label: 'Burgeo',
    value: 'CA/NL/Western/Burgeo',
  },
  {
    label: 'Burnt Islands Blp',
    value: 'CA/NL/Western/Burnt Islands Blp',
  },
  {
    label: 'Cape Ray',
    value: 'CA/NL/Western/Cape Ray',
  },
  {
    label: 'Cape St George',
    value: 'CA/NL/Western/Cape St George',
  },
  {
    label: 'Cartyville',
    value: 'CA/NL/Western/Cartyville',
  },
  {
    label: 'Castors River',
    value: 'CA/NL/Western/Castors River',
  },
  {
    label: 'Channel-Port-Aux-Basques',
    value: 'CA/NL/Western/Channel-Port-Aux-Basques',
  },
  {
    label: 'Charlottetown Lab',
    value: 'CA/NL/Western/Charlottetown Lab',
  },
  {
    label: 'Codroy',
    value: 'CA/NL/Western/Codroy',
  },
  {
    label: 'Conche',
    value: 'CA/NL/Western/Conche',
  },
  {
    label: 'Cooks Harbour',
    value: 'CA/NL/Western/Cooks Harbour',
  },
  {
    label: 'Cormack',
    value: 'CA/NL/Western/Cormack',
  },
  {
    label: 'Corner Brook',
    value: 'CA/NL/Western/Corner Brook',
  },
  {
    label: 'Cow Head',
    value: 'CA/NL/Western/Cow Head',
  },
  {
    label: 'Coxs Cove',
    value: 'CA/NL/Western/Coxs Cove',
  },
  {
    label: 'Croque',
    value: 'CA/NL/Western/Croque',
  },
  {
    label: 'Daniels Harbour',
    value: 'CA/NL/Western/Daniels Harbour',
  },
  {
    label: 'Deer Lake',
    value: 'CA/NL/Western/Deer Lake',
  },
  {
    label: 'Doyles',
    value: 'CA/NL/Western/Doyles',
  },
  {
    label: 'Eddies Cove',
    value: 'CA/NL/Western/Eddies Cove',
  },
  {
    label: 'Eddies Cove West',
    value: 'CA/NL/Western/Eddies Cove West',
  },
  {
    label: 'Englee',
    value: 'CA/NL/Western/Englee',
  },
  {
    label: 'Flowers Cove',
    value: 'CA/NL/Western/Flowers Cove',
  },
  {
    label: 'Frenchmans Cove Boi',
    value: 'CA/NL/Western/Frenchmans Cove Boi',
  },
  {
    label: 'Gallants',
    value: 'CA/NL/Western/Gallants',
  },
  {
    label: 'Grand Bay East',
    value: 'CA/NL/Western/Grand Bay East',
  },
  {
    label: 'Grand Bruit',
    value: 'CA/NL/Western/Grand Bruit',
  },
  {
    label: 'Great Brehat',
    value: 'CA/NL/Western/Great Brehat',
  },
  {
    label: 'Green Island Brook',
    value: 'CA/NL/Western/Green Island Brook',
  },
  {
    label: 'Green Island Cove',
    value: 'CA/NL/Western/Green Island Cove',
  },
  {
    label: 'Hampden',
    value: 'CA/NL/Western/Hampden',
  },
  {
    label: 'Hawkes Bay',
    value: 'CA/NL/Western/Hawkes Bay',
  },
  {
    label: 'Heatherton',
    value: 'CA/NL/Western/Heatherton',
  },
  {
    label: 'Highlands',
    value: 'CA/NL/Western/Highlands',
  },
  {
    label: 'Isle-Aux-Morts',
    value: 'CA/NL/Western/Isle-Aux-Morts',
  },
  {
    label: 'Jacksons Arm',
    value: 'CA/NL/Western/Jacksons Arm',
  },
  {
    label: 'Jeffreys',
    value: 'CA/NL/Western/Jeffreys',
  },
  {
    label: 'Kippens',
    value: 'CA/NL/Western/Kippens',
  },
  {
    label: 'La Poile',
    value: 'CA/NL/Western/La Poile',
  },
  {
    label: 'Lark Harbour',
    value: 'CA/NL/Western/Lark Harbour',
  },
  {
    label: 'Lourdes',
    value: 'CA/NL/Western/Lourdes',
  },
  {
    label: 'Main Brook',
    value: 'CA/NL/Western/Main Brook',
  },
  {
    label: 'Massey Drive',
    value: 'CA/NL/Western/Massey Drive',
  },
  {
    label: 'Meadows',
    value: 'CA/NL/Western/Meadows',
  },
  {
    label: 'Mount Moriah',
    value: 'CA/NL/Western/Mount Moriah',
  },
  {
    label: 'Noels Pond',
    value: 'CA/NL/Western/Noels Pond',
  },
  {
    label: 'Norris Point',
    value: 'CA/NL/Western/Norris Point',
  },
  {
    label: 'Paradise River',
    value: 'CA/NL/Western/Paradise River',
  },
  {
    label: 'Parsons Pond',
    value: 'CA/NL/Western/Parsons Pond',
  },
  {
    label: 'Pasadena',
    value: 'CA/NL/Western/Pasadena',
  },
  {
    label: 'Plum Point',
    value: 'CA/NL/Western/Plum Point',
  },
  {
    label: 'Pollards Point',
    value: 'CA/NL/Western/Pollards Point',
  },
  {
    label: 'Port Au Choix',
    value: 'CA/NL/Western/Port Au Choix',
  },
  {
    label: 'Port Au Port',
    value: 'CA/NL/Western/Port Au Port',
  },
  {
    label: 'Port Saunders',
    value: 'CA/NL/Western/Port Saunders',
  },
  {
    label: 'Portland Creek',
    value: 'CA/NL/Western/Portland Creek',
  },
  {
    label: "Pynn's Brook",
    value: "CA/NL/Western/Pynn's Brook",
  },
  {
    label: 'Raleigh',
    value: 'CA/NL/Western/Raleigh',
  },
  {
    label: 'Reefs Harbour',
    value: 'CA/NL/Western/Reefs Harbour',
  },
  {
    label: 'Reidville',
    value: 'CA/NL/Western/Reidville',
  },
  {
    label: 'River Of Ponds',
    value: 'CA/NL/Western/River Of Ponds',
  },
  {
    label: 'Robinsons',
    value: 'CA/NL/Western/Robinsons',
  },
  {
    label: 'Rocky Harbour',
    value: 'CA/NL/Western/Rocky Harbour',
  },
  {
    label: 'Roddickton',
    value: 'CA/NL/Western/Roddickton',
  },
  {
    label: 'Rose Blanche',
    value: 'CA/NL/Western/Rose Blanche',
  },
  {
    label: 'Sallys Cove',
    value: 'CA/NL/Western/Sallys Cove',
  },
  {
    label: 'Sandy Cove',
    value: 'CA/NL/Western/Sandy Cove',
  },
  {
    label: 'Sops Arm',
    value: 'CA/NL/Western/Sops Arm',
  },
  {
    label: 'South Branch',
    value: 'CA/NL/Western/South Branch',
  },
  {
    label: 'St Andrews',
    value: 'CA/NL/Western/St Andrews',
  },
  {
    label: 'St Anthony',
    value: 'CA/NL/Western/St Anthony',
  },
  {
    label: 'St Anthony East',
    value: 'CA/NL/Western/St Anthony East',
  },
  {
    label: 'St Davids',
    value: 'CA/NL/Western/St Davids',
  },
  {
    label: 'St Fintans',
    value: 'CA/NL/Western/St Fintans',
  },
  {
    label: 'St Georges',
    value: 'CA/NL/Western/St Georges',
  },
  {
    label: 'St Judes',
    value: 'CA/NL/Western/St Judes',
  },
  {
    label: 'St Juliens',
    value: 'CA/NL/Western/St Juliens',
  },
  {
    label: 'St Lunaire-Griquet',
    value: 'CA/NL/Western/St Lunaire-Griquet',
  },
  {
    label: 'St Pauls',
    value: 'CA/NL/Western/St Pauls',
  },
  {
    label: 'Steady Brook',
    value: 'CA/NL/Western/Steady Brook',
  },
  {
    label: 'Stephenville',
    value: 'CA/NL/Western/Stephenville',
  },
  {
    label: 'Stephenville Crossing',
    value: 'CA/NL/Western/Stephenville Crossing',
  },
  {
    label: 'Trout River',
    value: 'CA/NL/Western/Trout River',
  },
  {
    label: 'West Bay Centre',
    value: 'CA/NL/Western/West Bay Centre',
  },
  {
    label: 'Wild Cove Wb',
    value: 'CA/NL/Western/Wild Cove Wb',
  },
  {
    label: 'Williams Harbour',
    value: 'CA/NL/Western/Williams Harbour',
  },
  {
    label: 'Wiltondale',
    value: 'CA/NL/Western/Wiltondale',
  },
  {
    label: 'York Harbour',
    value: 'CA/NL/Western/York Harbour',
  },
  {
    label: 'Bellburns',
    value: 'CA/NL/Wiltondale/Bellburns',
  },
  {
    label: 'Bide Arm',
    value: 'CA/NL/Wiltondale/Bide Arm',
  },
  {
    label: 'Birchy Head',
    value: 'CA/NL/Wiltondale/Birchy Head',
  },
  {
    label: 'Bird Cove',
    value: 'CA/NL/Wiltondale/Bird Cove',
  },
  {
    label: 'Black Duck Cove',
    value: 'CA/NL/Wiltondale/Black Duck Cove',
  },
  {
    label: 'Bonne Bay',
    value: 'CA/NL/Wiltondale/Bonne Bay',
  },
  {
    label: 'Bonne Bay Pond',
    value: 'CA/NL/Wiltondale/Bonne Bay Pond',
  },
  {
    label: 'Charlottetown',
    value: 'CA/NL/Wiltondale/Charlottetown',
  },
  {
    label: 'Conche',
    value: 'CA/NL/Wiltondale/Conche',
  },
  {
    label: 'Cooks Harbour',
    value: 'CA/NL/Wiltondale/Cooks Harbour',
  },
  {
    label: 'Cow Head',
    value: 'CA/NL/Wiltondale/Cow Head',
  },
  {
    label: 'Daniels Harbour',
    value: 'CA/NL/Wiltondale/Daniels Harbour',
  },
  {
    label: 'Eddies Cove',
    value: 'CA/NL/Wiltondale/Eddies Cove',
  },
  {
    label: 'Eddies Cove West',
    value: 'CA/NL/Wiltondale/Eddies Cove West',
  },
  {
    label: 'Englee',
    value: 'CA/NL/Wiltondale/Englee',
  },
  {
    label: 'Flowers Cove',
    value: 'CA/NL/Wiltondale/Flowers Cove',
  },
  {
    label: 'Green Island Brook',
    value: 'CA/NL/Wiltondale/Green Island Brook',
  },
  {
    label: 'Green Island Cove',
    value: 'CA/NL/Wiltondale/Green Island Cove',
  },
  {
    label: 'Hawkes Bay',
    value: 'CA/NL/Wiltondale/Hawkes Bay',
  },
  {
    label: 'Main Brook',
    value: 'CA/NL/Wiltondale/Main Brook',
  },
  {
    label: 'Norris Point',
    value: 'CA/NL/Wiltondale/Norris Point',
  },
  {
    label: 'Parsons Pond',
    value: 'CA/NL/Wiltondale/Parsons Pond',
  },
  {
    label: 'Plum Point',
    value: 'CA/NL/Wiltondale/Plum Point',
  },
  {
    label: 'Port Au Choix',
    value: 'CA/NL/Wiltondale/Port Au Choix',
  },
  {
    label: 'Port Saunders',
    value: 'CA/NL/Wiltondale/Port Saunders',
  },
  {
    label: 'Portland Creek',
    value: 'CA/NL/Wiltondale/Portland Creek',
  },
  {
    label: 'Raleigh',
    value: 'CA/NL/Wiltondale/Raleigh',
  },
  {
    label: 'Reefs Harbour',
    value: 'CA/NL/Wiltondale/Reefs Harbour',
  },
  {
    label: 'River Of Ponds',
    value: 'CA/NL/Wiltondale/River Of Ponds',
  },
  {
    label: 'Rocky Harbour',
    value: 'CA/NL/Wiltondale/Rocky Harbour',
  },
  {
    label: 'Roddickton',
    value: 'CA/NL/Wiltondale/Roddickton',
  },
  {
    label: 'St Anthony',
    value: 'CA/NL/Wiltondale/St Anthony',
  },
  {
    label: 'St Anthony East',
    value: 'CA/NL/Wiltondale/St Anthony East',
  },
  {
    label: 'St Lunaire-Griquet',
    value: 'CA/NL/Wiltondale/St Lunaire-Griquet',
  },
  {
    label: 'Trout River',
    value: 'CA/NL/Wiltondale/Trout River',
  },
  {
    label: 'Aspen Cove',
    value: 'CA/NL/Woodstock/Aspen Cove',
  },
  {
    label: 'Baie Verte',
    value: 'CA/NL/Woodstock/Baie Verte',
  },
  {
    label: 'Baytona',
    value: 'CA/NL/Woodstock/Baytona',
  },
  {
    label: 'Beaumont',
    value: 'CA/NL/Woodstock/Beaumont',
  },
  {
    label: 'Birchy Bay',
    value: 'CA/NL/Woodstock/Birchy Bay',
  },
  {
    label: 'Boyds Cove',
    value: 'CA/NL/Woodstock/Boyds Cove',
  },
  {
    label: 'Brents Cove',
    value: 'CA/NL/Woodstock/Brents Cove',
  },
  {
    label: 'Bridgeport',
    value: 'CA/NL/Woodstock/Bridgeport',
  },
  {
    label: 'Brighton',
    value: 'CA/NL/Woodstock/Brighton',
  },
  {
    label: 'Burlington',
    value: 'CA/NL/Woodstock/Burlington',
  },
  {
    label: 'Campbellton',
    value: 'CA/NL/Woodstock/Campbellton',
  },
  {
    label: 'Carmanville',
    value: 'CA/NL/Woodstock/Carmanville',
  },
  {
    label: 'Carters Cove',
    value: 'CA/NL/Woodstock/Carters Cove',
  },
  {
    label: 'Change Islands',
    value: 'CA/NL/Woodstock/Change Islands',
  },
  {
    label: 'Comfort Cove-Newstead',
    value: 'CA/NL/Woodstock/Comfort Cove-Newstead',
  },
  {
    label: 'Cottlesville',
    value: 'CA/NL/Woodstock/Cottlesville',
  },
  {
    label: 'Deadmans Bay',
    value: 'CA/NL/Woodstock/Deadmans Bay',
  },
  {
    label: 'Durrell',
    value: 'CA/NL/Woodstock/Durrell',
  },
  {
    label: 'Embree',
    value: 'CA/NL/Woodstock/Embree',
  },
  {
    label: 'Fleur De Lys',
    value: 'CA/NL/Woodstock/Fleur De Lys',
  },
  {
    label: 'Fogo',
    value: 'CA/NL/Woodstock/Fogo',
  },
  {
    label: 'Gander Bay',
    value: 'CA/NL/Woodstock/Gander Bay',
  },
  {
    label: 'Gander Bay South',
    value: 'CA/NL/Woodstock/Gander Bay South',
  },
  {
    label: 'Harbour Round',
    value: 'CA/NL/Woodstock/Harbour Round',
  },
  {
    label: 'Herring Neck',
    value: 'CA/NL/Woodstock/Herring Neck',
  },
  {
    label: 'Hillgrade',
    value: 'CA/NL/Woodstock/Hillgrade',
  },
  {
    label: 'Horwood',
    value: 'CA/NL/Woodstock/Horwood',
  },
  {
    label: 'Island Harbour',
    value: 'CA/NL/Woodstock/Island Harbour',
  },
  {
    label: 'Joe Batts Arm',
    value: 'CA/NL/Woodstock/Joe Batts Arm',
  },
  {
    label: 'Kings Point',
    value: 'CA/NL/Woodstock/Kings Point',
  },
  {
    label: 'La Scie',
    value: 'CA/NL/Woodstock/La Scie',
  },
  {
    label: 'Ladle Cove',
    value: 'CA/NL/Woodstock/Ladle Cove',
  },
  {
    label: 'Laurenceton',
    value: 'CA/NL/Woodstock/Laurenceton',
  },
  {
    label: 'Leading Tickles',
    value: 'CA/NL/Woodstock/Leading Tickles',
  },
  {
    label: 'Lewisporte',
    value: 'CA/NL/Woodstock/Lewisporte',
  },
  {
    label: 'Little Bay Islands',
    value: 'CA/NL/Woodstock/Little Bay Islands',
  },
  {
    label: 'Little Bay Ndb',
    value: 'CA/NL/Woodstock/Little Bay Ndb',
  },
  {
    label: 'Little Burnt Bay',
    value: 'CA/NL/Woodstock/Little Burnt Bay',
  },
  {
    label: 'Loon Bay',
    value: 'CA/NL/Woodstock/Loon Bay',
  },
  {
    label: 'Lumsden',
    value: 'CA/NL/Woodstock/Lumsden',
  },
  {
    label: 'Middle Arm Gb',
    value: 'CA/NL/Woodstock/Middle Arm Gb',
  },
  {
    label: 'Miles Cove',
    value: 'CA/NL/Woodstock/Miles Cove',
  },
  {
    label: 'Mings Bight',
    value: 'CA/NL/Woodstock/Mings Bight',
  },
  {
    label: 'Moretons Harbour',
    value: 'CA/NL/Woodstock/Moretons Harbour',
  },
  {
    label: 'Musgrave Harbour',
    value: 'CA/NL/Woodstock/Musgrave Harbour',
  },
  {
    label: 'Nippers Harbour',
    value: 'CA/NL/Woodstock/Nippers Harbour',
  },
  {
    label: 'Pacquet',
    value: 'CA/NL/Woodstock/Pacquet',
  },
  {
    label: 'Pilleys Island',
    value: 'CA/NL/Woodstock/Pilleys Island',
  },
  {
    label: 'Point Leamington',
    value: 'CA/NL/Woodstock/Point Leamington',
  },
  {
    label: 'Port Albert',
    value: 'CA/NL/Woodstock/Port Albert',
  },
  {
    label: 'Pound Cove',
    value: 'CA/NL/Woodstock/Pound Cove',
  },
  {
    label: 'Roberts Arm',
    value: 'CA/NL/Woodstock/Roberts Arm',
  },
  {
    label: 'Seal Cove Wb',
    value: 'CA/NL/Woodstock/Seal Cove Wb',
  },
  {
    label: 'Seldom',
    value: 'CA/NL/Woodstock/Seldom',
  },
  {
    label: 'Shoe Cove',
    value: 'CA/NL/Woodstock/Shoe Cove',
  },
  {
    label: 'South Brook Gb',
    value: 'CA/NL/Woodstock/South Brook Gb',
  },
  {
    label: 'Springdale',
    value: 'CA/NL/Woodstock/Springdale',
  },
  {
    label: 'Stoneville',
    value: 'CA/NL/Woodstock/Stoneville',
  },
  {
    label: 'Summerford',
    value: 'CA/NL/Woodstock/Summerford',
  },
  {
    label: 'Tilting',
    value: 'CA/NL/Woodstock/Tilting',
  },
  {
    label: 'Triton',
    value: 'CA/NL/Woodstock/Triton',
  },
  {
    label: 'Twillingate',
    value: 'CA/NL/Woodstock/Twillingate',
  },
  {
    label: 'Valley Pond',
    value: 'CA/NL/Woodstock/Valley Pond',
  },
  {
    label: 'Victoria Cove',
    value: 'CA/NL/Woodstock/Victoria Cove',
  },
  {
    label: 'Westport',
    value: 'CA/NL/Woodstock/Westport',
  },
  {
    label: 'Wings Point',
    value: 'CA/NL/Woodstock/Wings Point',
  },
  {
    label: 'Woodstock',
    value: 'CA/NL/Woodstock/Woodstock',
  },
  {
    label: 'Fort Liard',
    value: 'CA/NT/Dehcho/Fort Liard',
  },
  {
    label: 'Fort Simpson',
    value: 'CA/NT/Dehcho/Fort Simpson',
  },
  {
    label: 'Jean Marie River  ',
    value: 'CA/NT/Dehcho/Jean Marie River  ',
  },
  {
    label: 'Nahanni Butte',
    value: 'CA/NT/Dehcho/Nahanni Butte',
  },
  {
    label: 'Trout Lake',
    value: 'CA/NT/Dehcho/Trout Lake',
  },
  {
    label: 'Wrigley',
    value: 'CA/NT/Dehcho/Wrigley',
  },
  {
    label: 'Fort Mcpherson',
    value: 'CA/NT/Inuvik/Fort Mcpherson',
  },
  {
    label: 'Inuvik',
    value: 'CA/NT/Inuvik/Inuvik',
  },
  {
    label: 'Paulatuk',
    value: 'CA/NT/Inuvik/Paulatuk',
  },
  {
    label: 'Sachs Harbour',
    value: 'CA/NT/Inuvik/Sachs Harbour',
  },
  {
    label: 'Tsiigehtchic',
    value: 'CA/NT/Inuvik/Tsiigehtchic',
  },
  {
    label: 'Tuktoyaktuk',
    value: 'CA/NT/Inuvik/Tuktoyaktuk',
  },
  {
    label: 'Ulukhaktok',
    value: 'CA/NT/Inuvik/Ulukhaktok',
  },
  {
    label: 'Behchoko',
    value: 'CA/NT/North Slave/Behchoko',
  },
  {
    label: 'Gameti',
    value: 'CA/NT/North Slave/Gameti',
  },
  {
    label: "Lutselk'e",
    value: "CA/NT/North Slave/Lutselk'e",
  },
  {
    label: 'Wekweti',
    value: 'CA/NT/North Slave/Wekweti',
  },
  {
    label: 'Whati',
    value: 'CA/NT/North Slave/Whati',
  },
  {
    label: 'Yellowknife',
    value: 'CA/NT/North Slave/Yellowknife',
  },
  {
    label: 'Fort Mcpherson',
    value: 'CA/NT/Region 1/Fort Mcpherson',
  },
  {
    label: 'Inuvik',
    value: 'CA/NT/Region 1/Inuvik',
  },
  {
    label: 'Tsiigehtchic',
    value: 'CA/NT/Region 1/Tsiigehtchic',
  },
  {
    label: 'Tuktoyaktuk',
    value: 'CA/NT/Region 1/Tuktoyaktuk',
  },
  {
    label: 'Deline',
    value: 'CA/NT/Region 2/Deline',
  },
  {
    label: 'Fort Good Hope',
    value: 'CA/NT/Region 2/Fort Good Hope',
  },
  {
    label: 'Tulita',
    value: 'CA/NT/Region 2/Tulita',
  },
  {
    label: 'Fort Providence',
    value: 'CA/NT/Region 4/Fort Providence',
  },
  {
    label: 'Fort Simpson',
    value: 'CA/NT/Region 4/Fort Simpson',
  },
  {
    label: 'Fort Smith',
    value: 'CA/NT/Region 5/Fort Smith',
  },
  {
    label: 'Fort Resolution',
    value: 'CA/NT/Region 5/Fort Resolution',
  },
  {
    label: 'Hay River',
    value: 'CA/NT/Region 5/Hay River',
  },
  {
    label: 'Yellowknife',
    value: 'CA/NT/Region 6/Yellowknife',
  },
  {
    label: 'Colville Lake',
    value: 'CA/NT/Sahtu/Colville Lake',
  },
  {
    label: 'Deline',
    value: 'CA/NT/Sahtu/Deline',
  },
  {
    label: 'Fort Good Hope',
    value: 'CA/NT/Sahtu/Fort Good Hope',
  },
  {
    label: 'Norman Wells',
    value: 'CA/NT/Sahtu/Norman Wells',
  },
  {
    label: 'Tulita',
    value: 'CA/NT/Sahtu/Tulita',
  },
  {
    label: 'Fort Providence',
    value: 'CA/NT/South Slave/Fort Providence',
  },
  {
    label: 'Fort Resolution',
    value: 'CA/NT/South Slave/Fort Resolution',
  },
  {
    label: 'Fort Smith',
    value: 'CA/NT/South Slave/Fort Smith',
  },
  {
    label: 'Hay River',
    value: 'CA/NT/South Slave/Hay River',
  },
  {
    label: 'Annapolis Royal',
    value: 'CA/NS/Annapolis/Annapolis Royal',
  },
  {
    label: 'Bridgetown',
    value: 'CA/NS/Annapolis/Bridgetown',
  },
  {
    label: 'Clementsport',
    value: 'CA/NS/Annapolis/Clementsport',
  },
  {
    label: 'Clementsvale',
    value: 'CA/NS/Annapolis/Clementsvale',
  },
  {
    label: 'Cornwallis',
    value: 'CA/NS/Annapolis/Cornwallis',
  },
  {
    label: 'Deep Brook',
    value: 'CA/NS/Annapolis/Deep Brook',
  },
  {
    label: 'Granville Ferry',
    value: 'CA/NS/Annapolis/Granville Ferry',
  },
  {
    label: 'Hampton',
    value: 'CA/NS/Annapolis/Hampton',
  },
  {
    label: 'Lawrencetown',
    value: 'CA/NS/Annapolis/Lawrencetown',
  },
  {
    label: 'Maitland Bridge',
    value: 'CA/NS/Annapolis/Maitland Bridge',
  },
  {
    label: 'Margaretsville',
    value: 'CA/NS/Annapolis/Margaretsville',
  },
  {
    label: 'Middleton',
    value: 'CA/NS/Annapolis/Middleton',
  },
  {
    label: 'Paradise',
    value: 'CA/NS/Annapolis/Paradise',
  },
  {
    label: 'Springfield',
    value: 'CA/NS/Annapolis/Springfield',
  },
  {
    label: 'Wilmot Station',
    value: 'CA/NS/Annapolis/Wilmot Station',
  },
  {
    label: 'Afton Station',
    value: 'CA/NS/Antigonish/Afton Station',
  },
  {
    label: 'Antigonish',
    value: 'CA/NS/Antigonish/Antigonish',
  },
  {
    label: 'Frankville',
    value: 'CA/NS/Antigonish/Frankville',
  },
  {
    label: 'Havre Boucher',
    value: 'CA/NS/Antigonish/Havre Boucher',
  },
  {
    label: 'Heatherton',
    value: 'CA/NS/Antigonish/Heatherton',
  },
  {
    label: 'Lower South River',
    value: 'CA/NS/Antigonish/Lower South River',
  },
  {
    label: 'Monastery',
    value: 'CA/NS/Antigonish/Monastery',
  },
  {
    label: 'St Andrews',
    value: 'CA/NS/Antigonish/St Andrews',
  },
  {
    label: 'Albert Bridge',
    value: 'CA/NS/Cape Breton/Albert Bridge',
  },
  {
    label: 'Alder Point',
    value: 'CA/NS/Cape Breton/Alder Point',
  },
  {
    label: 'Balls Creek',
    value: 'CA/NS/Cape Breton/Balls Creek',
  },
  {
    label: 'Bateston',
    value: 'CA/NS/Cape Breton/Bateston',
  },
  {
    label: 'Beaver Cove',
    value: 'CA/NS/Cape Breton/Beaver Cove',
  },
  {
    label: 'Beechmont',
    value: 'CA/NS/Cape Breton/Beechmont',
  },
  {
    label: 'Ben Eoin',
    value: 'CA/NS/Cape Breton/Ben Eoin',
  },
  {
    label: 'Benacadie',
    value: 'CA/NS/Cape Breton/Benacadie',
  },
  {
    label: 'Big Beach',
    value: 'CA/NS/Cape Breton/Big Beach',
  },
  {
    label: 'Big Pond',
    value: 'CA/NS/Cape Breton/Big Pond',
  },
  {
    label: 'Big Pond Centre',
    value: 'CA/NS/Cape Breton/Big Pond Centre',
  },
  {
    label: 'Big Ridge',
    value: 'CA/NS/Cape Breton/Big Ridge',
  },
  {
    label: 'Birch Grove',
    value: 'CA/NS/Cape Breton/Birch Grove',
  },
  {
    label: 'Blacketts Lake',
    value: 'CA/NS/Cape Breton/Blacketts Lake',
  },
  {
    label: 'Boisdale',
    value: 'CA/NS/Cape Breton/Boisdale',
  },
  {
    label: "Bras D'or",
    value: "CA/NS/Cape Breton/Bras D'or",
  },
  {
    label: 'Broughton',
    value: 'CA/NS/Cape Breton/Broughton',
  },
  {
    label: 'Caribou Marsh',
    value: 'CA/NS/Cape Breton/Caribou Marsh',
  },
  {
    label: 'Castle Bay',
    value: 'CA/NS/Cape Breton/Castle Bay',
  },
  {
    label: 'Catalone',
    value: 'CA/NS/Cape Breton/Catalone',
  },
  {
    label: 'Catalone Gut',
    value: 'CA/NS/Cape Breton/Catalone Gut',
  },
  {
    label: 'Christmas Island',
    value: 'CA/NS/Cape Breton/Christmas Island',
  },
  {
    label: 'Coxheath',
    value: 'CA/NS/Cape Breton/Coxheath',
  },
  {
    label: 'Dalem Lake',
    value: 'CA/NS/Cape Breton/Dalem Lake',
  },
  {
    label: 'Dominion',
    value: 'CA/NS/Cape Breton/Dominion',
  },
  {
    label: 'Donkin',
    value: 'CA/NS/Cape Breton/Donkin',
  },
  {
    label: 'Dutch Brook',
    value: 'CA/NS/Cape Breton/Dutch Brook',
  },
  {
    label: 'East Bay',
    value: 'CA/NS/Cape Breton/East Bay',
  },
  {
    label: 'Edwardsville',
    value: 'CA/NS/Cape Breton/Edwardsville',
  },
  {
    label: 'Enon',
    value: 'CA/NS/Cape Breton/Enon',
  },
  {
    label: 'Eskasoni',
    value: 'CA/NS/Cape Breton/Eskasoni',
  },
  {
    label: 'Florence',
    value: 'CA/NS/Cape Breton/Florence',
  },
  {
    label: 'Fortress Of Louisbourg',
    value: 'CA/NS/Cape Breton/Fortress Of Louisbourg',
  },
  {
    label: 'French Road',
    value: 'CA/NS/Cape Breton/French Road',
  },
  {
    label: 'Frenchvale',
    value: 'CA/NS/Cape Breton/Frenchvale',
  },
  {
    label: 'Gabarus',
    value: 'CA/NS/Cape Breton/Gabarus',
  },
  {
    label: 'Gabarus Lake',
    value: 'CA/NS/Cape Breton/Gabarus Lake',
  },
  {
    label: 'Gardiner Mines',
    value: 'CA/NS/Cape Breton/Gardiner Mines',
  },
  {
    label: 'Georges River',
    value: 'CA/NS/Cape Breton/Georges River',
  },
  {
    label: 'Gillis Lake',
    value: 'CA/NS/Cape Breton/Gillis Lake',
  },
  {
    label: 'Glace Bay',
    value: 'CA/NS/Cape Breton/Glace Bay',
  },
  {
    label: 'Grand Lake Road',
    value: 'CA/NS/Cape Breton/Grand Lake Road',
  },
  {
    label: 'Grand Mira North',
    value: 'CA/NS/Cape Breton/Grand Mira North',
  },
  {
    label: 'Grand Mira South',
    value: 'CA/NS/Cape Breton/Grand Mira South',
  },
  {
    label: 'Grand Narrows',
    value: 'CA/NS/Cape Breton/Grand Narrows',
  },
  {
    label: 'Groves Point',
    value: 'CA/NS/Cape Breton/Groves Point',
  },
  {
    label: 'Hillside Boularderie',
    value: 'CA/NS/Cape Breton/Hillside Boularderie',
  },
  {
    label: 'Homeville',
    value: 'CA/NS/Cape Breton/Homeville',
  },
  {
    label: 'Howie Center',
    value: 'CA/NS/Cape Breton/Howie Center',
  },
  {
    label: 'Huntington',
    value: 'CA/NS/Cape Breton/Huntington',
  },
  {
    label: 'Irishvale',
    value: 'CA/NS/Cape Breton/Irishvale',
  },
  {
    label: 'Ironville',
    value: 'CA/NS/Cape Breton/Ironville',
  },
  {
    label: 'Islandview',
    value: 'CA/NS/Cape Breton/Islandview',
  },
  {
    label: 'Juniper Mountain',
    value: 'CA/NS/Cape Breton/Juniper Mountain',
  },
  {
    label: 'Leitches Creek',
    value: 'CA/NS/Cape Breton/Leitches Creek',
  },
  {
    label: 'Lingan',
    value: 'CA/NS/Cape Breton/Lingan',
  },
  {
    label: 'Lingan Road',
    value: 'CA/NS/Cape Breton/Lingan Road',
  },
  {
    label: "Little Bras D'or",
    value: "CA/NS/Cape Breton/Little Bras D'or",
  },
  {
    label: 'Little Lorraine',
    value: 'CA/NS/Cape Breton/Little Lorraine',
  },
  {
    label: 'Little Pond',
    value: 'CA/NS/Cape Breton/Little Pond',
  },
  {
    label: 'Long Island',
    value: 'CA/NS/Cape Breton/Long Island',
  },
  {
    label: 'Louisbourg',
    value: 'CA/NS/Cape Breton/Louisbourg',
  },
  {
    label: 'Macadams Lake',
    value: 'CA/NS/Cape Breton/Macadams Lake',
  },
  {
    label: 'Main-A-Dieu',
    value: 'CA/NS/Cape Breton/Main-A-Dieu',
  },
  {
    label: 'Marion Bridge',
    value: 'CA/NS/Cape Breton/Marion Bridge',
  },
  {
    label: 'Membertou',
    value: 'CA/NS/Cape Breton/Membertou',
  },
  {
    label: 'Middle Cape',
    value: 'CA/NS/Cape Breton/Middle Cape',
  },
  {
    label: 'Mill Creek',
    value: 'CA/NS/Cape Breton/Mill Creek',
  },
  {
    label: 'Millville',
    value: 'CA/NS/Cape Breton/Millville',
  },
  {
    label: 'Mira Gut',
    value: 'CA/NS/Cape Breton/Mira Gut',
  },
  {
    label: 'Mira Road',
    value: 'CA/NS/Cape Breton/Mira Road',
  },
  {
    label: 'New Victoria',
    value: 'CA/NS/Cape Breton/New Victoria',
  },
  {
    label: 'New Waterford',
    value: 'CA/NS/Cape Breton/New Waterford',
  },
  {
    label: 'North Sydney',
    value: 'CA/NS/Cape Breton/North Sydney',
  },
  {
    label: 'North West Arm',
    value: 'CA/NS/Cape Breton/North West Arm',
  },
  {
    label: 'Northside East Bay',
    value: 'CA/NS/Cape Breton/Northside East Bay',
  },
  {
    label: 'Oakfield',
    value: 'CA/NS/Cape Breton/Oakfield',
  },
  {
    label: 'Pipers Cove',
    value: 'CA/NS/Cape Breton/Pipers Cove',
  },
  {
    label: 'Point Aconi',
    value: 'CA/NS/Cape Breton/Point Aconi',
  },
  {
    label: 'Point Edward',
    value: 'CA/NS/Cape Breton/Point Edward',
  },
  {
    label: 'Port Caledonia',
    value: 'CA/NS/Cape Breton/Port Caledonia',
  },
  {
    label: 'Port Morien',
    value: 'CA/NS/Cape Breton/Port Morien',
  },
  {
    label: 'Portage',
    value: 'CA/NS/Cape Breton/Portage',
  },
  {
    label: 'Prime Brook',
    value: 'CA/NS/Cape Breton/Prime Brook',
  },
  {
    label: 'Reserve Mines',
    value: 'CA/NS/Cape Breton/Reserve Mines',
  },
  {
    label: 'River Ryan',
    value: 'CA/NS/Cape Breton/River Ryan',
  },
  {
    label: 'Rock Elm',
    value: 'CA/NS/Cape Breton/Rock Elm',
  },
  {
    label: 'Round Island',
    value: 'CA/NS/Cape Breton/Round Island',
  },
  {
    label: 'Sandfield',
    value: 'CA/NS/Cape Breton/Sandfield',
  },
  {
    label: 'Scotch Lake',
    value: 'CA/NS/Cape Breton/Scotch Lake',
  },
  {
    label: 'Scotchtown',
    value: 'CA/NS/Cape Breton/Scotchtown',
  },
  {
    label: 'Shenacadie',
    value: 'CA/NS/Cape Breton/Shenacadie',
  },
  {
    label: 'South Bar',
    value: 'CA/NS/Cape Breton/South Bar',
  },
  {
    label: 'South Head',
    value: 'CA/NS/Cape Breton/South Head',
  },
  {
    label: 'Southside Boularderie',
    value: 'CA/NS/Cape Breton/Southside Boularderie',
  },
  {
    label: 'St Andrews Channel',
    value: 'CA/NS/Cape Breton/St Andrews Channel',
  },
  {
    label: 'Sydney',
    value: 'CA/NS/Cape Breton/Sydney',
  },
  {
    label: 'Sydney',
    value: 'CA/NS/Cape Breton/Sydney',
  },
  {
    label: 'Sydney Forks',
    value: 'CA/NS/Cape Breton/Sydney Forks',
  },
  {
    label: 'Sydney Mines',
    value: 'CA/NS/Cape Breton/Sydney Mines',
  },
  {
    label: 'Sydney River',
    value: 'CA/NS/Cape Breton/Sydney River',
  },
  {
    label: 'Tower Road',
    value: 'CA/NS/Cape Breton/Tower Road',
  },
  {
    label: 'Upper Grand Mira',
    value: 'CA/NS/Cape Breton/Upper Grand Mira',
  },
  {
    label: 'Upper Leitches Creek',
    value: 'CA/NS/Cape Breton/Upper Leitches Creek',
  },
  {
    label: 'Upper North Sydney',
    value: 'CA/NS/Cape Breton/Upper North Sydney',
  },
  {
    label: 'Victoria Mines',
    value: 'CA/NS/Cape Breton/Victoria Mines',
  },
  {
    label: 'Westmount',
    value: 'CA/NS/Cape Breton/Westmount',
  },
  {
    label: 'Barrachois',
    value: 'CA/NS/Colchester/Barrachois',
  },
  {
    label: 'Bass River',
    value: 'CA/NS/Colchester/Bass River',
  },
  {
    label: 'Beaver Brook',
    value: 'CA/NS/Colchester/Beaver Brook',
  },
  {
    label: 'Belmont',
    value: 'CA/NS/Colchester/Belmont',
  },
  {
    label: 'Bible Hill',
    value: 'CA/NS/Colchester/Bible Hill',
  },
  {
    label: 'Brookfield',
    value: 'CA/NS/Colchester/Brookfield',
  },
  {
    label: 'Brookside',
    value: 'CA/NS/Colchester/Brookside',
  },
  {
    label: 'Camden',
    value: 'CA/NS/Colchester/Camden',
  },
  {
    label: 'Central North River',
    value: 'CA/NS/Colchester/Central North River',
  },
  {
    label: 'Central Onslow',
    value: 'CA/NS/Colchester/Central Onslow',
  },
  {
    label: 'Clifton',
    value: 'CA/NS/Colchester/Clifton',
  },
  {
    label: 'Crowes Mills',
    value: 'CA/NS/Colchester/Crowes Mills',
  },
  {
    label: 'Debert',
    value: 'CA/NS/Colchester/Debert',
  },
  {
    label: 'East Mountain',
    value: 'CA/NS/Colchester/East Mountain',
  },
  {
    label: 'Economy',
    value: 'CA/NS/Colchester/Economy',
  },
  {
    label: 'Five Islands',
    value: 'CA/NS/Colchester/Five Islands',
  },
  {
    label: 'Grand-Barachois',
    value: 'CA/NS/Colchester/Grand-Barachois',
  },
  {
    label: 'Great Village',
    value: 'CA/NS/Colchester/Great Village',
  },
  {
    label: 'Green Oaks',
    value: 'CA/NS/Colchester/Green Oaks',
  },
  {
    label: 'Harmony',
    value: 'CA/NS/Colchester/Harmony',
  },
  {
    label: 'Kemptown',
    value: 'CA/NS/Colchester/Kemptown',
  },
  {
    label: 'Londonderry',
    value: 'CA/NS/Colchester/Londonderry',
  },
  {
    label: 'Lower Five Islands',
    value: 'CA/NS/Colchester/Lower Five Islands',
  },
  {
    label: 'Lower Onslow',
    value: 'CA/NS/Colchester/Lower Onslow',
  },
  {
    label: 'Lower Truro',
    value: 'CA/NS/Colchester/Lower Truro',
  },
  {
    label: 'Main River',
    value: 'CA/NS/Colchester/Main River',
  },
  {
    label: 'Manganese Mines',
    value: 'CA/NS/Colchester/Manganese Mines',
  },
  {
    label: 'Mccallum Settlement',
    value: 'CA/NS/Colchester/Mccallum Settlement',
  },
  {
    label: 'Murray Siding',
    value: 'CA/NS/Colchester/Murray Siding',
  },
  {
    label: 'North River',
    value: 'CA/NS/Colchester/North River',
  },
  {
    label: 'Nuttby',
    value: 'CA/NS/Colchester/Nuttby',
  },
  {
    label: 'Old Barns',
    value: 'CA/NS/Colchester/Old Barns',
  },
  {
    label: 'Onslow Mountain',
    value: 'CA/NS/Colchester/Onslow Mountain',
  },
  {
    label: 'Princeport',
    value: 'CA/NS/Colchester/Princeport',
  },
  {
    label: 'Riversdale',
    value: 'CA/NS/Colchester/Riversdale',
  },
  {
    label: 'Salmon River',
    value: 'CA/NS/Colchester/Salmon River',
  },
  {
    label: 'Stewiacke',
    value: 'CA/NS/Colchester/Stewiacke',
  },
  {
    label: 'Tatamagouche',
    value: 'CA/NS/Colchester/Tatamagouche',
  },
  {
    label: 'Truro',
    value: 'CA/NS/Colchester/Truro',
  },
  {
    label: 'Truro Heights',
    value: 'CA/NS/Colchester/Truro Heights',
  },
  {
    label: 'Upper Brookside',
    value: 'CA/NS/Colchester/Upper Brookside',
  },
  {
    label: 'Upper North River',
    value: 'CA/NS/Colchester/Upper North River',
  },
  {
    label: 'Upper Onslow',
    value: 'CA/NS/Colchester/Upper Onslow',
  },
  {
    label: 'Upper Stewiacke',
    value: 'CA/NS/Colchester/Upper Stewiacke',
  },
  {
    label: 'Valley',
    value: 'CA/NS/Colchester/Valley',
  },
  {
    label: 'Advocate Harbour',
    value: 'CA/NS/Cumberland/Advocate Harbour',
  },
  {
    label: 'Amherst',
    value: 'CA/NS/Cumberland/Amherst',
  },
  {
    label: 'Collingwood Corner',
    value: 'CA/NS/Cumberland/Collingwood Corner',
  },
  {
    label: 'Diligent River',
    value: 'CA/NS/Cumberland/Diligent River',
  },
  {
    label: 'Joggins',
    value: 'CA/NS/Cumberland/Joggins',
  },
  {
    label: 'Maccan',
    value: 'CA/NS/Cumberland/Maccan',
  },
  {
    label: 'Malagash',
    value: 'CA/NS/Cumberland/Malagash',
  },
  {
    label: 'Nappan',
    value: 'CA/NS/Cumberland/Nappan',
  },
  {
    label: 'Northport',
    value: 'CA/NS/Cumberland/Northport',
  },
  {
    label: 'Oxford',
    value: 'CA/NS/Cumberland/Oxford',
  },
  {
    label: 'Oxford Junction',
    value: 'CA/NS/Cumberland/Oxford Junction',
  },
  {
    label: 'Parrsboro',
    value: 'CA/NS/Cumberland/Parrsboro',
  },
  {
    label: 'Port Greville',
    value: 'CA/NS/Cumberland/Port Greville',
  },
  {
    label: 'Port Howe',
    value: 'CA/NS/Cumberland/Port Howe',
  },
  {
    label: 'Pugwash',
    value: 'CA/NS/Cumberland/Pugwash',
  },
  {
    label: 'Pugwash Junction',
    value: 'CA/NS/Cumberland/Pugwash Junction',
  },
  {
    label: 'River Hebert',
    value: 'CA/NS/Cumberland/River Hebert',
  },
  {
    label: 'River Hebert East',
    value: 'CA/NS/Cumberland/River Hebert East',
  },
  {
    label: 'River Philip',
    value: 'CA/NS/Cumberland/River Philip',
  },
  {
    label: 'Southampton',
    value: 'CA/NS/Cumberland/Southampton',
  },
  {
    label: 'Springhill',
    value: 'CA/NS/Cumberland/Springhill',
  },
  {
    label: 'Wallace',
    value: 'CA/NS/Cumberland/Wallace',
  },
  {
    label: 'Wentworth',
    value: 'CA/NS/Cumberland/Wentworth',
  },
  {
    label: 'Westchester Station',
    value: 'CA/NS/Cumberland/Westchester Station',
  },
  {
    label: 'Barton',
    value: 'CA/NS/Digby/Barton',
  },
  {
    label: 'Bear River',
    value: 'CA/NS/Digby/Bear River',
  },
  {
    label: 'Belliveau Cove',
    value: 'CA/NS/Digby/Belliveau Cove',
  },
  {
    label: 'Church Point',
    value: 'CA/NS/Digby/Church Point',
  },
  {
    label: 'Digby',
    value: 'CA/NS/Digby/Digby',
  },
  {
    label: 'Freeport',
    value: 'CA/NS/Digby/Freeport',
  },
  {
    label: 'Little Brook',
    value: 'CA/NS/Digby/Little Brook',
  },
  {
    label: 'Little River',
    value: 'CA/NS/Digby/Little River',
  },
  {
    label: 'Mavillette',
    value: 'CA/NS/Digby/Mavillette',
  },
  {
    label: 'Meteghan',
    value: 'CA/NS/Digby/Meteghan',
  },
  {
    label: 'Meteghan Centre',
    value: 'CA/NS/Digby/Meteghan Centre',
  },
  {
    label: 'Meteghan River',
    value: 'CA/NS/Digby/Meteghan River',
  },
  {
    label: 'Plympton',
    value: 'CA/NS/Digby/Plympton',
  },
  {
    label: 'Salmon River',
    value: 'CA/NS/Digby/Salmon River',
  },
  {
    label: 'Sandy Cove',
    value: 'CA/NS/Digby/Sandy Cove',
  },
  {
    label: 'Saulnierville',
    value: 'CA/NS/Digby/Saulnierville',
  },
  {
    label: 'Smiths Cove',
    value: 'CA/NS/Digby/Smiths Cove',
  },
  {
    label: 'Tiverton',
    value: 'CA/NS/Digby/Tiverton',
  },
  {
    label: 'Westport',
    value: 'CA/NS/Digby/Westport',
  },
  {
    label: 'Weymouth',
    value: 'CA/NS/Digby/Weymouth',
  },
  {
    label: 'Aspen',
    value: 'CA/NS/Guysborough/Aspen',
  },
  {
    label: 'Bickerton West',
    value: 'CA/NS/Guysborough/Bickerton West',
  },
  {
    label: 'Boylston',
    value: 'CA/NS/Guysborough/Boylston',
  },
  {
    label: 'Canso',
    value: 'CA/NS/Guysborough/Canso',
  },
  {
    label: 'Cross Roads Country Harbour',
    value: 'CA/NS/Guysborough/Cross Roads Country Harbour',
  },
  {
    label: 'Ecum Secum',
    value: 'CA/NS/Guysborough/Ecum Secum',
  },
  {
    label: 'Fishermans Harbour',
    value: 'CA/NS/Guysborough/Fishermans Harbour',
  },
  {
    label: 'Goldboro',
    value: 'CA/NS/Guysborough/Goldboro',
  },
  {
    label: 'Guysborough',
    value: 'CA/NS/Guysborough/Guysborough',
  },
  {
    label: 'Isaacs Harbour',
    value: 'CA/NS/Guysborough/Isaacs Harbour',
  },
  {
    label: 'Larrys River',
    value: 'CA/NS/Guysborough/Larrys River',
  },
  {
    label: 'Liscomb',
    value: 'CA/NS/Guysborough/Liscomb',
  },
  {
    label: 'Little Dover',
    value: 'CA/NS/Guysborough/Little Dover',
  },
  {
    label: 'Marie Joseph',
    value: 'CA/NS/Guysborough/Marie Joseph',
  },
  {
    label: 'Moser River',
    value: 'CA/NS/Guysborough/Moser River',
  },
  {
    label: 'Mulgrave',
    value: 'CA/NS/Guysborough/Mulgrave',
  },
  {
    label: 'Sherbrooke',
    value: 'CA/NS/Guysborough/Sherbrooke',
  },
  {
    label: 'Bayside',
    value: 'CA/NS/Halifax/Bayside',
  },
  {
    label: 'Bear Cove',
    value: 'CA/NS/Halifax/Bear Cove',
  },
  {
    label: 'Beaver Bank',
    value: 'CA/NS/Halifax/Beaver Bank',
  },
  {
    label: 'Bedford',
    value: 'CA/NS/Halifax/Bedford',
  },
  {
    label: 'Beechville',
    value: 'CA/NS/Halifax/Beechville',
  },
  {
    label: 'Big Lake',
    value: 'CA/NS/Halifax/Big Lake',
  },
  {
    label: 'Black Point',
    value: 'CA/NS/Halifax/Black Point',
  },
  {
    label: 'Blind Bay',
    value: 'CA/NS/Halifax/Blind Bay',
  },
  {
    label: 'Boutiliers Point',
    value: 'CA/NS/Halifax/Boutiliers Point',
  },
  {
    label: 'Brookside',
    value: 'CA/NS/Halifax/Brookside',
  },
  {
    label: 'Cherry Brook',
    value: 'CA/NS/Halifax/Cherry Brook',
  },
  {
    label: 'Cole Harbour',
    value: 'CA/NS/Halifax/Cole Harbour',
  },
  {
    label: 'Cow Bay',
    value: 'CA/NS/Halifax/Cow Bay',
  },
  {
    label: 'Dartmouth',
    value: 'CA/NS/Halifax/Dartmouth',
  },
  {
    label: 'Dartmouth',
    value: 'CA/NS/Halifax/Dartmouth',
  },
  {
    label: 'Duncans Cove',
    value: 'CA/NS/Halifax/Duncans Cove',
  },
  {
    label: 'Dutch Settlement',
    value: 'CA/NS/Halifax/Dutch Settlement',
  },
  {
    label: 'East Dover',
    value: 'CA/NS/Halifax/East Dover',
  },
  {
    label: 'East Lawrencetown',
    value: 'CA/NS/Halifax/East Lawrencetown',
  },
  {
    label: 'East Pennant',
    value: 'CA/NS/Halifax/East Pennant',
  },
  {
    label: 'East Preston',
    value: 'CA/NS/Halifax/East Preston',
  },
  {
    label: 'Eastern Passage',
    value: 'CA/NS/Halifax/Eastern Passage',
  },
  {
    label: 'Elderbank',
    value: 'CA/NS/Halifax/Elderbank',
  },
  {
    label: 'Enfield',
    value: 'CA/NS/Halifax/Enfield',
  },
  {
    label: 'Fall River',
    value: 'CA/NS/Halifax/Fall River',
  },
  {
    label: 'Fergusons Cove',
    value: 'CA/NS/Halifax/Fergusons Cove',
  },
  {
    label: 'Fletchers Lake',
    value: 'CA/NS/Halifax/Fletchers Lake',
  },
  {
    label: 'French Village',
    value: 'CA/NS/Halifax/French Village',
  },
  {
    label: 'Glen Haven',
    value: 'CA/NS/Halifax/Glen Haven',
  },
  {
    label: 'Glen Margaret',
    value: 'CA/NS/Halifax/Glen Margaret',
  },
  {
    label: 'Goffs',
    value: 'CA/NS/Halifax/Goffs',
  },
  {
    label: 'Goodwood',
    value: 'CA/NS/Halifax/Goodwood',
  },
  {
    label: 'Grand Lake',
    value: 'CA/NS/Halifax/Grand Lake',
  },
  {
    label: 'Hacketts Cove',
    value: 'CA/NS/Halifax/Hacketts Cove',
  },
  {
    label: 'Halibut Bay',
    value: 'CA/NS/Halifax/Halibut Bay',
  },
  {
    label: 'Halifax',
    value: 'CA/NS/Halifax/Halifax',
  },
  {
    label: 'Halifax',
    value: 'CA/NS/Halifax/Halifax',
  },
  {
    label: 'Hammonds Plains',
    value: 'CA/NS/Halifax/Hammonds Plains',
  },
  {
    label: 'Harrietsfield',
    value: 'CA/NS/Halifax/Harrietsfield',
  },
  {
    label: 'Hatchet Lake',
    value: 'CA/NS/Halifax/Hatchet Lake',
  },
  {
    label: 'Head Of Jeddore',
    value: 'CA/NS/Halifax/Head Of Jeddore',
  },
  {
    label: 'Head Of St Margarets Bay',
    value: 'CA/NS/Halifax/Head Of St Margarets Bay',
  },
  {
    label: 'Herring Cove',
    value: 'CA/NS/Halifax/Herring Cove',
  },
  {
    label: 'Hubbards',
    value: 'CA/NS/Halifax/Hubbards',
  },
  {
    label: 'Hubley',
    value: 'CA/NS/Halifax/Hubley',
  },
  {
    label: 'Indian Harbour',
    value: 'CA/NS/Halifax/Indian Harbour',
  },
  {
    label: 'Ingramport',
    value: 'CA/NS/Halifax/Ingramport',
  },
  {
    label: 'Jeddore Oyster Ponds',
    value: 'CA/NS/Halifax/Jeddore Oyster Ponds',
  },
  {
    label: 'Ketch Harbour',
    value: 'CA/NS/Halifax/Ketch Harbour',
  },
  {
    label: 'Kinsac',
    value: 'CA/NS/Halifax/Kinsac',
  },
  {
    label: 'Lake Charlotte',
    value: 'CA/NS/Halifax/Lake Charlotte',
  },
  {
    label: 'Lake Echo',
    value: 'CA/NS/Halifax/Lake Echo',
  },
  {
    label: 'Lakeside',
    value: 'CA/NS/Halifax/Lakeside',
  },
  {
    label: 'Lawrencetown',
    value: 'CA/NS/Halifax/Lawrencetown',
  },
  {
    label: 'Lewis Lake',
    value: 'CA/NS/Halifax/Lewis Lake',
  },
  {
    label: 'Lower Prospect',
    value: 'CA/NS/Halifax/Lower Prospect',
  },
  {
    label: 'Lower Sackville',
    value: 'CA/NS/Halifax/Lower Sackville',
  },
  {
    label: 'Lucasville',
    value: 'CA/NS/Halifax/Lucasville',
  },
  {
    label: 'Mcgraths Cove',
    value: 'CA/NS/Halifax/Mcgraths Cove',
  },
  {
    label: 'Meaghers Grant',
    value: 'CA/NS/Halifax/Meaghers Grant',
  },
  {
    label: 'Middle Musquodoboit',
    value: 'CA/NS/Halifax/Middle Musquodoboit',
  },
  {
    label: 'Middle Porters Lake',
    value: 'CA/NS/Halifax/Middle Porters Lake',
  },
  {
    label: 'Middle Sackville',
    value: 'CA/NS/Halifax/Middle Sackville',
  },
  {
    label: 'Mineville',
    value: 'CA/NS/Halifax/Mineville',
  },
  {
    label: 'Montague Gold Mines',
    value: 'CA/NS/Halifax/Montague Gold Mines',
  },
  {
    label: 'Mooseland',
    value: 'CA/NS/Halifax/Mooseland',
  },
  {
    label: 'Moser River',
    value: 'CA/NS/Halifax/Moser River',
  },
  {
    label: 'Musquodoboit Harbour',
    value: 'CA/NS/Halifax/Musquodoboit Harbour',
  },
  {
    label: 'North Preston',
    value: 'CA/NS/Halifax/North Preston',
  },
  {
    label: 'Oakfield',
    value: 'CA/NS/Halifax/Oakfield',
  },
  {
    label: 'Oldham',
    value: 'CA/NS/Halifax/Oldham',
  },
  {
    label: 'Peggys Cove',
    value: 'CA/NS/Halifax/Peggys Cove',
  },
  {
    label: 'Port Dufferin',
    value: 'CA/NS/Halifax/Port Dufferin',
  },
  {
    label: 'Porters Lake',
    value: 'CA/NS/Halifax/Porters Lake',
  },
  {
    label: 'Portuguese Cove',
    value: 'CA/NS/Halifax/Portuguese Cove',
  },
  {
    label: 'Prospect',
    value: 'CA/NS/Halifax/Prospect',
  },
  {
    label: 'Prospect Bay',
    value: 'CA/NS/Halifax/Prospect Bay',
  },
  {
    label: 'Prospect Village',
    value: 'CA/NS/Halifax/Prospect Village',
  },
  {
    label: 'Sambro',
    value: 'CA/NS/Halifax/Sambro',
  },
  {
    label: 'Sambro Creek',
    value: 'CA/NS/Halifax/Sambro Creek',
  },
  {
    label: 'Sambro Head',
    value: 'CA/NS/Halifax/Sambro Head',
  },
  {
    label: 'Seabright',
    value: 'CA/NS/Halifax/Seabright',
  },
  {
    label: 'Shad Bay',
    value: 'CA/NS/Halifax/Shad Bay',
  },
  {
    label: 'Shearwater',
    value: 'CA/NS/Halifax/Shearwater',
  },
  {
    label: 'Sheet Harbour',
    value: 'CA/NS/Halifax/Sheet Harbour',
  },
  {
    label: 'Stillwater Lake',
    value: 'CA/NS/Halifax/Stillwater Lake',
  },
  {
    label: 'Tangier',
    value: 'CA/NS/Halifax/Tangier',
  },
  {
    label: 'Tantallon',
    value: 'CA/NS/Halifax/Tantallon',
  },
  {
    label: 'Terence Bay',
    value: 'CA/NS/Halifax/Terence Bay',
  },
  {
    label: 'Timberlea',
    value: 'CA/NS/Halifax/Timberlea',
  },
  {
    label: 'Upper Hammonds Plains',
    value: 'CA/NS/Halifax/Upper Hammonds Plains',
  },
  {
    label: 'Upper Musquodoboit',
    value: 'CA/NS/Halifax/Upper Musquodoboit',
  },
  {
    label: 'Upper Sackville',
    value: 'CA/NS/Halifax/Upper Sackville',
  },
  {
    label: 'Upper Tantallon',
    value: 'CA/NS/Halifax/Upper Tantallon',
  },
  {
    label: 'Waverley',
    value: 'CA/NS/Halifax/Waverley',
  },
  {
    label: 'Wellington',
    value: 'CA/NS/Halifax/Wellington',
  },
  {
    label: 'West Chezzetcook',
    value: 'CA/NS/Halifax/West Chezzetcook',
  },
  {
    label: 'West Dover',
    value: 'CA/NS/Halifax/West Dover',
  },
  {
    label: 'West Pennant',
    value: 'CA/NS/Halifax/West Pennant',
  },
  {
    label: 'West Porters Lake',
    value: 'CA/NS/Halifax/West Porters Lake',
  },
  {
    label: 'Westphal',
    value: 'CA/NS/Halifax/Westphal',
  },
  {
    label: 'Whites Lake',
    value: 'CA/NS/Halifax/Whites Lake',
  },
  {
    label: 'Williamswood',
    value: 'CA/NS/Halifax/Williamswood',
  },
  {
    label: 'Windsor Junction',
    value: 'CA/NS/Halifax/Windsor Junction',
  },
  {
    label: 'Barr Settlement',
    value: 'CA/NS/Hants/Barr Settlement',
  },
  {
    label: 'Belnan',
    value: 'CA/NS/Hants/Belnan',
  },
  {
    label: 'Centre Burlington',
    value: 'CA/NS/Hants/Centre Burlington',
  },
  {
    label: 'Cheverie',
    value: 'CA/NS/Hants/Cheverie',
  },
  {
    label: 'Currys Corner',
    value: 'CA/NS/Hants/Currys Corner',
  },
  {
    label: 'Densmores Mills',
    value: 'CA/NS/Hants/Densmores Mills',
  },
  {
    label: 'East Gore',
    value: 'CA/NS/Hants/East Gore',
  },
  {
    label: 'Ellershouse',
    value: 'CA/NS/Hants/Ellershouse',
  },
  {
    label: 'Elmsdale',
    value: 'CA/NS/Hants/Elmsdale',
  },
  {
    label: 'Enfield',
    value: 'CA/NS/Hants/Enfield',
  },
  {
    label: 'Falmouth',
    value: 'CA/NS/Hants/Falmouth',
  },
  {
    label: 'Goshen',
    value: 'CA/NS/Hants/Goshen',
  },
  {
    label: 'Greenfield',
    value: 'CA/NS/Hants/Greenfield',
  },
  {
    label: 'Hantsport',
    value: 'CA/NS/Hants/Hantsport',
  },
  {
    label: 'Kennetcook',
    value: 'CA/NS/Hants/Kennetcook',
  },
  {
    label: 'Lantz',
    value: 'CA/NS/Hants/Lantz',
  },
  {
    label: 'Maitland',
    value: 'CA/NS/Hants/Maitland',
  },
  {
    label: 'Milford Station',
    value: 'CA/NS/Hants/Milford Station',
  },
  {
    label: 'Mill Village',
    value: 'CA/NS/Hants/Mill Village',
  },
  {
    label: 'Mount Uniacke',
    value: 'CA/NS/Hants/Mount Uniacke',
  },
  {
    label: 'Newport',
    value: 'CA/NS/Hants/Newport',
  },
  {
    label: 'Newport Station',
    value: 'CA/NS/Hants/Newport Station',
  },
  {
    label: 'Nine Mile River',
    value: 'CA/NS/Hants/Nine Mile River',
  },
  {
    label: 'Noel',
    value: 'CA/NS/Hants/Noel',
  },
  {
    label: 'Scotch Village',
    value: 'CA/NS/Hants/Scotch Village',
  },
  {
    label: 'Shubenacadie',
    value: 'CA/NS/Hants/Shubenacadie',
  },
  {
    label: 'Ste Croix',
    value: 'CA/NS/Hants/Ste Croix',
  },
  {
    label: 'Summerville',
    value: 'CA/NS/Hants/Summerville',
  },
  {
    label: 'Upper Kennetcook',
    value: 'CA/NS/Hants/Upper Kennetcook',
  },
  {
    label: 'Upper Nine Mile River',
    value: 'CA/NS/Hants/Upper Nine Mile River',
  },
  {
    label: 'Upper Rawdon',
    value: 'CA/NS/Hants/Upper Rawdon',
  },
  {
    label: 'Walton',
    value: 'CA/NS/Hants/Walton',
  },
  {
    label: 'Windsor',
    value: 'CA/NS/Hants/Windsor',
  },
  {
    label: 'Askilton',
    value: 'CA/NS/Inverness/Askilton',
  },
  {
    label: 'Belle Cote',
    value: 'CA/NS/Inverness/Belle Cote',
  },
  {
    label: 'Cheticamp',
    value: 'CA/NS/Inverness/Cheticamp',
  },
  {
    label: 'Craigmore',
    value: 'CA/NS/Inverness/Craigmore',
  },
  {
    label: 'Crandall Road',
    value: 'CA/NS/Inverness/Crandall Road',
  },
  {
    label: 'Creignish',
    value: 'CA/NS/Inverness/Creignish',
  },
  {
    label: 'Glendale',
    value: 'CA/NS/Inverness/Glendale',
  },
  {
    label: 'Grand Etang',
    value: 'CA/NS/Inverness/Grand Etang',
  },
  {
    label: 'Inverness',
    value: 'CA/NS/Inverness/Inverness',
  },
  {
    label: 'Judique',
    value: 'CA/NS/Inverness/Judique',
  },
  {
    label: 'Lexington',
    value: 'CA/NS/Inverness/Lexington',
  },
  {
    label: 'Long Point',
    value: 'CA/NS/Inverness/Long Point',
  },
  {
    label: 'Mabou',
    value: 'CA/NS/Inverness/Mabou',
  },
  {
    label: 'Mackdale',
    value: 'CA/NS/Inverness/Mackdale',
  },
  {
    label: 'Margaree',
    value: 'CA/NS/Inverness/Margaree',
  },
  {
    label: 'Margaree Centre',
    value: 'CA/NS/Inverness/Margaree Centre',
  },
  {
    label: 'Margaree Forks',
    value: 'CA/NS/Inverness/Margaree Forks',
  },
  {
    label: 'Margaree Harbour',
    value: 'CA/NS/Inverness/Margaree Harbour',
  },
  {
    label: 'Margaree Valley',
    value: 'CA/NS/Inverness/Margaree Valley',
  },
  {
    label: 'Newtown',
    value: 'CA/NS/Inverness/Newtown',
  },
  {
    label: 'North East Margaree',
    value: 'CA/NS/Inverness/North East Margaree',
  },
  {
    label: 'Orangedale',
    value: 'CA/NS/Inverness/Orangedale',
  },
  {
    label: 'Petit Etang',
    value: 'CA/NS/Inverness/Petit Etang',
  },
  {
    label: 'Pleasant Bay',
    value: 'CA/NS/Inverness/Pleasant Bay',
  },
  {
    label: 'Pleasant Hill',
    value: 'CA/NS/Inverness/Pleasant Hill',
  },
  {
    label: 'Port Hastings',
    value: 'CA/NS/Inverness/Port Hastings',
  },
  {
    label: 'Port Hawkesbury',
    value: 'CA/NS/Inverness/Port Hawkesbury',
  },
  {
    label: 'Port Hood',
    value: 'CA/NS/Inverness/Port Hood',
  },
  {
    label: 'Queensville',
    value: 'CA/NS/Inverness/Queensville',
  },
  {
    label: 'River Denys',
    value: 'CA/NS/Inverness/River Denys',
  },
  {
    label: 'Scotsville',
    value: 'CA/NS/Inverness/Scotsville',
  },
  {
    label: 'South West Margaree',
    value: 'CA/NS/Inverness/South West Margaree',
  },
  {
    label: 'St-Joseph-Du-Moine',
    value: 'CA/NS/Inverness/St-Joseph-Du-Moine',
  },
  {
    label: 'Sugar Camp',
    value: 'CA/NS/Inverness/Sugar Camp',
  },
  {
    label: 'Troy',
    value: 'CA/NS/Inverness/Troy',
  },
  {
    label: 'West Bay',
    value: 'CA/NS/Inverness/West Bay',
  },
  {
    label: 'West Bay Road',
    value: 'CA/NS/Inverness/West Bay Road',
  },
  {
    label: 'Whycocomagh',
    value: 'CA/NS/Inverness/Whycocomagh',
  },
  {
    label: 'Auburn',
    value: 'CA/NS/Kings/Auburn',
  },
  {
    label: 'Avonport',
    value: 'CA/NS/Kings/Avonport',
  },
  {
    label: 'Aylesford',
    value: 'CA/NS/Kings/Aylesford',
  },
  {
    label: 'Berwick',
    value: 'CA/NS/Kings/Berwick',
  },
  {
    label: 'Cambridge Station',
    value: 'CA/NS/Kings/Cambridge Station',
  },
  {
    label: 'Canning',
    value: 'CA/NS/Kings/Canning',
  },
  {
    label: 'Centreville',
    value: 'CA/NS/Kings/Centreville',
  },
  {
    label: 'Coldbrook',
    value: 'CA/NS/Kings/Coldbrook',
  },
  {
    label: 'Grand Pre',
    value: 'CA/NS/Kings/Grand Pre',
  },
  {
    label: 'Greenwood',
    value: 'CA/NS/Kings/Greenwood',
  },
  {
    label: 'Harmony',
    value: 'CA/NS/Kings/Harmony',
  },
  {
    label: 'Kentville',
    value: 'CA/NS/Kings/Kentville',
  },
  {
    label: 'Kingston',
    value: 'CA/NS/Kings/Kingston',
  },
  {
    label: 'Millville',
    value: 'CA/NS/Kings/Millville',
  },
  {
    label: 'New Minas',
    value: 'CA/NS/Kings/New Minas',
  },
  {
    label: 'Port Williams',
    value: 'CA/NS/Kings/Port Williams',
  },
  {
    label: 'Prospect',
    value: 'CA/NS/Kings/Prospect',
  },
  {
    label: 'Waterville',
    value: 'CA/NS/Kings/Waterville',
  },
  {
    label: 'Wolfville',
    value: 'CA/NS/Kings/Wolfville',
  },
  {
    label: 'Auburndale',
    value: 'CA/NS/Lunenburg/Auburndale',
  },
  {
    label: 'Baker Settlement',
    value: 'CA/NS/Lunenburg/Baker Settlement',
  },
  {
    label: 'Barss Corner',
    value: 'CA/NS/Lunenburg/Barss Corner',
  },
  {
    label: 'Blandford',
    value: 'CA/NS/Lunenburg/Blandford',
  },
  {
    label: 'Blockhouse',
    value: 'CA/NS/Lunenburg/Blockhouse',
  },
  {
    label: 'Branch Lahave',
    value: 'CA/NS/Lunenburg/Branch Lahave',
  },
  {
    label: 'Bridgewater',
    value: 'CA/NS/Lunenburg/Bridgewater',
  },
  {
    label: 'Camperdown',
    value: 'CA/NS/Lunenburg/Camperdown',
  },
  {
    label: 'Chelsea',
    value: 'CA/NS/Lunenburg/Chelsea',
  },
  {
    label: 'Chester',
    value: 'CA/NS/Lunenburg/Chester',
  },
  {
    label: 'Chester Basin',
    value: 'CA/NS/Lunenburg/Chester Basin',
  },
  {
    label: 'Conquerall Bank',
    value: 'CA/NS/Lunenburg/Conquerall Bank',
  },
  {
    label: 'Conquerall Mills',
    value: 'CA/NS/Lunenburg/Conquerall Mills',
  },
  {
    label: 'Cookville',
    value: 'CA/NS/Lunenburg/Cookville',
  },
  {
    label: 'Cookville',
    value: 'CA/NS/Lunenburg/Cookville',
  },
  {
    label: 'Crouses Settlement',
    value: 'CA/NS/Lunenburg/Crouses Settlement',
  },
  {
    label: 'Crousetown',
    value: 'CA/NS/Lunenburg/Crousetown',
  },
  {
    label: 'Danesville',
    value: 'CA/NS/Lunenburg/Danesville',
  },
  {
    label: 'Dayspring',
    value: 'CA/NS/Lunenburg/Dayspring',
  },
  {
    label: 'East Clifford',
    value: 'CA/NS/Lunenburg/East Clifford',
  },
  {
    label: 'East Lahave',
    value: 'CA/NS/Lunenburg/East Lahave',
  },
  {
    label: 'Green Bay',
    value: 'CA/NS/Lunenburg/Green Bay',
  },
  {
    label: 'Grimms Settlement',
    value: 'CA/NS/Lunenburg/Grimms Settlement',
  },
  {
    label: 'Hebbs Cross',
    value: 'CA/NS/Lunenburg/Hebbs Cross',
  },
  {
    label: 'Hebbville',
    value: 'CA/NS/Lunenburg/Hebbville',
  },
  {
    label: 'Indian Path',
    value: 'CA/NS/Lunenburg/Indian Path',
  },
  {
    label: 'Italy Cross',
    value: 'CA/NS/Lunenburg/Italy Cross',
  },
  {
    label: 'La Have',
    value: 'CA/NS/Lunenburg/La Have',
  },
  {
    label: 'Laconia',
    value: 'CA/NS/Lunenburg/Laconia',
  },
  {
    label: 'Lahave',
    value: 'CA/NS/Lunenburg/Lahave',
  },
  {
    label: 'Lapland',
    value: 'CA/NS/Lunenburg/Lapland',
  },
  {
    label: 'Little Tancook',
    value: 'CA/NS/Lunenburg/Little Tancook',
  },
  {
    label: 'Lower Branch',
    value: 'CA/NS/Lunenburg/Lower Branch',
  },
  {
    label: 'Lower Northfield',
    value: 'CA/NS/Lunenburg/Lower Northfield',
  },
  {
    label: 'Lunenburg',
    value: 'CA/NS/Lunenburg/Lunenburg',
  },
  {
    label: 'Mahone Bay',
    value: 'CA/NS/Lunenburg/Mahone Bay',
  },
  {
    label: 'Middle Lahave',
    value: 'CA/NS/Lunenburg/Middle Lahave',
  },
  {
    label: 'Middlewood',
    value: 'CA/NS/Lunenburg/Middlewood',
  },
  {
    label: 'Midville Branch',
    value: 'CA/NS/Lunenburg/Midville Branch',
  },
  {
    label: 'Molega Lake',
    value: 'CA/NS/Lunenburg/Molega Lake',
  },
  {
    label: 'New Canada',
    value: 'CA/NS/Lunenburg/New Canada',
  },
  {
    label: 'New Germany',
    value: 'CA/NS/Lunenburg/New Germany',
  },
  {
    label: 'New Ross',
    value: 'CA/NS/Lunenburg/New Ross',
  },
  {
    label: 'Newcombville',
    value: 'CA/NS/Lunenburg/Newcombville',
  },
  {
    label: 'Oakhill',
    value: 'CA/NS/Lunenburg/Oakhill',
  },
  {
    label: 'Petite Riviere',
    value: 'CA/NS/Lunenburg/Petite Riviere',
  },
  {
    label: 'Petite-Riviere-Bridge',
    value: 'CA/NS/Lunenburg/Petite-Riviere-Bridge',
  },
  {
    label: 'Pine Grove',
    value: 'CA/NS/Lunenburg/Pine Grove',
  },
  {
    label: 'Pinehurst',
    value: 'CA/NS/Lunenburg/Pinehurst',
  },
  {
    label: 'Pleasantville',
    value: 'CA/NS/Lunenburg/Pleasantville',
  },
  {
    label: 'Rhodes Corner',
    value: 'CA/NS/Lunenburg/Rhodes Corner',
  },
  {
    label: 'Riverport',
    value: 'CA/NS/Lunenburg/Riverport',
  },
  {
    label: 'Rose Bay',
    value: 'CA/NS/Lunenburg/Rose Bay',
  },
  {
    label: 'Spectacle Lakes',
    value: 'CA/NS/Lunenburg/Spectacle Lakes',
  },
  {
    label: 'Tancook Island',
    value: 'CA/NS/Lunenburg/Tancook Island',
  },
  {
    label: 'Upper Branch',
    value: 'CA/NS/Lunenburg/Upper Branch',
  },
  {
    label: 'Upper Chelsea',
    value: 'CA/NS/Lunenburg/Upper Chelsea',
  },
  {
    label: 'Upper Lahave',
    value: 'CA/NS/Lunenburg/Upper Lahave',
  },
  {
    label: 'Upper Northfield',
    value: 'CA/NS/Lunenburg/Upper Northfield',
  },
  {
    label: 'Waterloo',
    value: 'CA/NS/Lunenburg/Waterloo',
  },
  {
    label: 'Wentzells Lake',
    value: 'CA/NS/Lunenburg/Wentzells Lake',
  },
  {
    label: 'West Clifford',
    value: 'CA/NS/Lunenburg/West Clifford',
  },
  {
    label: 'West Northfield',
    value: 'CA/NS/Lunenburg/West Northfield',
  },
  {
    label: 'Western Shore',
    value: 'CA/NS/Lunenburg/Western Shore',
  },
  {
    label: 'Whynotts Settlement',
    value: 'CA/NS/Lunenburg/Whynotts Settlement',
  },
  {
    label: 'Wileville',
    value: 'CA/NS/Lunenburg/Wileville',
  },
  {
    label: 'Barneys River Station',
    value: 'CA/NS/Pictou/Barneys River Station',
  },
  {
    label: 'Black Brook',
    value: 'CA/NS/Pictou/Black Brook',
  },
  {
    label: 'Eureka',
    value: 'CA/NS/Pictou/Eureka',
  },
  {
    label: 'Hopewell',
    value: 'CA/NS/Pictou/Hopewell',
  },
  {
    label: 'Melville',
    value: 'CA/NS/Pictou/Melville',
  },
  {
    label: 'Merigomish',
    value: 'CA/NS/Pictou/Merigomish',
  },
  {
    label: 'Micmac',
    value: 'CA/NS/Pictou/Micmac',
  },
  {
    label: 'Millbrook',
    value: 'CA/NS/Pictou/Millbrook',
  },
  {
    label: 'New Glasgow',
    value: 'CA/NS/Pictou/New Glasgow',
  },
  {
    label: 'Pictou',
    value: 'CA/NS/Pictou/Pictou',
  },
  {
    label: 'Pictou Island',
    value: 'CA/NS/Pictou/Pictou Island',
  },
  {
    label: 'River John',
    value: 'CA/NS/Pictou/River John',
  },
  {
    label: 'Salt Springs',
    value: 'CA/NS/Pictou/Salt Springs',
  },
  {
    label: 'Scotsburn',
    value: 'CA/NS/Pictou/Scotsburn',
  },
  {
    label: 'Stellarton',
    value: 'CA/NS/Pictou/Stellarton',
  },
  {
    label: 'Sunnybrae',
    value: 'CA/NS/Pictou/Sunnybrae',
  },
  {
    label: 'Thorburn',
    value: 'CA/NS/Pictou/Thorburn',
  },
  {
    label: 'Trenton',
    value: 'CA/NS/Pictou/Trenton',
  },
  {
    label: 'West River Station',
    value: 'CA/NS/Pictou/West River Station',
  },
  {
    label: 'Westville',
    value: 'CA/NS/Pictou/Westville',
  },
  {
    label: 'Brooklyn',
    value: 'CA/NS/Queens/Brooklyn',
  },
  {
    label: 'Buckfield',
    value: 'CA/NS/Queens/Buckfield',
  },
  {
    label: 'Caledonia',
    value: 'CA/NS/Queens/Caledonia',
  },
  {
    label: 'Greenfield',
    value: 'CA/NS/Queens/Greenfield',
  },
  {
    label: 'Hunts Point',
    value: 'CA/NS/Queens/Hunts Point',
  },
  {
    label: 'Labelle',
    value: 'CA/NS/Queens/Labelle',
  },
  {
    label: 'Lakeview',
    value: 'CA/NS/Queens/Lakeview',
  },
  {
    label: 'Liverpool',
    value: 'CA/NS/Queens/Liverpool',
  },
  {
    label: 'Mill Village',
    value: 'CA/NS/Queens/Mill Village',
  },
  {
    label: 'Milton',
    value: 'CA/NS/Queens/Milton',
  },
  {
    label: 'Port Joli',
    value: 'CA/NS/Queens/Port Joli',
  },
  {
    label: 'Port Medway',
    value: 'CA/NS/Queens/Port Medway',
  },
  {
    label: 'Port Mouton',
    value: 'CA/NS/Queens/Port Mouton',
  },
  {
    label: 'South Brookfield',
    value: 'CA/NS/Queens/South Brookfield',
  },
  {
    label: 'Arichat',
    value: 'CA/NS/Richmond/Arichat',
  },
  {
    label: 'Cleveland',
    value: 'CA/NS/Richmond/Cleveland',
  },
  {
    label: "D'escousse",
    value: "CA/NS/Richmond/D'escousse",
  },
  {
    label: 'Dundee',
    value: 'CA/NS/Richmond/Dundee',
  },
  {
    label: 'Fourchu',
    value: 'CA/NS/Richmond/Fourchu',
  },
  {
    label: 'Framboise',
    value: 'CA/NS/Richmond/Framboise',
  },
  {
    label: 'Framboise Intervale',
    value: 'CA/NS/Richmond/Framboise Intervale',
  },
  {
    label: 'Grand Lake',
    value: 'CA/NS/Richmond/Grand Lake',
  },
  {
    label: 'Grand River',
    value: 'CA/NS/Richmond/Grand River',
  },
  {
    label: 'Irish Cove',
    value: 'CA/NS/Richmond/Irish Cove',
  },
  {
    label: 'Lake Uist',
    value: 'CA/NS/Richmond/Lake Uist',
  },
  {
    label: "L'ardoise",
    value: "CA/NS/Richmond/L'ardoise",
  },
  {
    label: 'Loch Lomond',
    value: 'CA/NS/Richmond/Loch Lomond',
  },
  {
    label: 'Louisdale',
    value: 'CA/NS/Richmond/Louisdale',
  },
  {
    label: "Lower L'ardoise",
    value: "CA/NS/Richmond/Lower L'ardoise",
  },
  {
    label: 'Petit De Grat',
    value: 'CA/NS/Richmond/Petit De Grat',
  },
  {
    label: 'Point Tupper',
    value: 'CA/NS/Richmond/Point Tupper',
  },
  {
    label: 'Port Malcolm',
    value: 'CA/NS/Richmond/Port Malcolm',
  },
  {
    label: 'River Bourgeois',
    value: 'CA/NS/Richmond/River Bourgeois',
  },
  {
    label: 'Salmon River',
    value: 'CA/NS/Richmond/Salmon River',
  },
  {
    label: 'Sampson Cove',
    value: 'CA/NS/Richmond/Sampson Cove',
  },
  {
    label: 'St Peters',
    value: 'CA/NS/Richmond/St Peters',
  },
  {
    label: 'Stirling',
    value: 'CA/NS/Richmond/Stirling',
  },
  {
    label: 'West Arichat',
    value: 'CA/NS/Richmond/West Arichat',
  },
  {
    label: 'Baccaro',
    value: 'CA/NS/Shelburne/Baccaro',
  },
  {
    label: 'Barrington',
    value: 'CA/NS/Shelburne/Barrington',
  },
  {
    label: 'Barrington Passage',
    value: 'CA/NS/Shelburne/Barrington Passage',
  },
  {
    label: 'Clam Point',
    value: 'CA/NS/Shelburne/Clam Point',
  },
  {
    label: 'Clarks Harbour',
    value: 'CA/NS/Shelburne/Clarks Harbour',
  },
  {
    label: 'Clyde River',
    value: 'CA/NS/Shelburne/Clyde River',
  },
  {
    label: 'Crowell',
    value: 'CA/NS/Shelburne/Crowell',
  },
  {
    label: 'East Baccaro',
    value: 'CA/NS/Shelburne/East Baccaro',
  },
  {
    label: 'Eel Bay',
    value: 'CA/NS/Shelburne/Eel Bay',
  },
  {
    label: 'Ingomar',
    value: 'CA/NS/Shelburne/Ingomar',
  },
  {
    label: 'Jordan Falls',
    value: 'CA/NS/Shelburne/Jordan Falls',
  },
  {
    label: 'Lockeport',
    value: 'CA/NS/Shelburne/Lockeport',
  },
  {
    label: 'Lower Woods Harbour',
    value: 'CA/NS/Shelburne/Lower Woods Harbour',
  },
  {
    label: 'Lydgate',
    value: 'CA/NS/Shelburne/Lydgate',
  },
  {
    label: 'Mcgray',
    value: 'CA/NS/Shelburne/Mcgray',
  },
  {
    label: 'North East Point',
    value: 'CA/NS/Shelburne/North East Point',
  },
  {
    label: 'Osborne Harbour',
    value: 'CA/NS/Shelburne/Osborne Harbour',
  },
  {
    label: 'Port Clyde',
    value: 'CA/NS/Shelburne/Port Clyde',
  },
  {
    label: 'Port La Tour',
    value: 'CA/NS/Shelburne/Port La Tour',
  },
  {
    label: 'Sable River',
    value: 'CA/NS/Shelburne/Sable River',
  },
  {
    label: 'Shag Harbour',
    value: 'CA/NS/Shelburne/Shag Harbour',
  },
  {
    label: 'Shelburne',
    value: 'CA/NS/Shelburne/Shelburne',
  },
  {
    label: 'Smithsville',
    value: 'CA/NS/Shelburne/Smithsville',
  },
  {
    label: 'Stoney Island',
    value: 'CA/NS/Shelburne/Stoney Island',
  },
  {
    label: 'Thomasville',
    value: 'CA/NS/Shelburne/Thomasville',
  },
  {
    label: 'Upper Port La Tour',
    value: 'CA/NS/Shelburne/Upper Port La Tour',
  },
  {
    label: 'Baddeck',
    value: 'CA/NS/Victoria/Baddeck',
  },
  {
    label: 'Barra Glen',
    value: 'CA/NS/Victoria/Barra Glen',
  },
  {
    label: "Big Bras D'or",
    value: "CA/NS/Victoria/Big Bras D'or",
  },
  {
    label: 'Black Rock',
    value: 'CA/NS/Victoria/Black Rock',
  },
  {
    label: 'Boularderie Center',
    value: 'CA/NS/Victoria/Boularderie Center',
  },
  {
    label: 'Boularderie East',
    value: 'CA/NS/Victoria/Boularderie East',
  },
  {
    label: 'Cape Dauphin',
    value: 'CA/NS/Victoria/Cape Dauphin',
  },
  {
    label: 'Cape North',
    value: 'CA/NS/Victoria/Cape North',
  },
  {
    label: 'Capstick',
    value: 'CA/NS/Victoria/Capstick',
  },
  {
    label: 'Dingwall',
    value: 'CA/NS/Victoria/Dingwall',
  },
  {
    label: 'Englishtown',
    value: 'CA/NS/Victoria/Englishtown',
  },
  {
    label: 'Gillis Point',
    value: 'CA/NS/Victoria/Gillis Point',
  },
  {
    label: 'Grass Cove',
    value: 'CA/NS/Victoria/Grass Cove',
  },
  {
    label: 'Highland Hill',
    value: 'CA/NS/Victoria/Highland Hill',
  },
  {
    label: 'Ingonish',
    value: 'CA/NS/Victoria/Ingonish',
  },
  {
    label: 'Ingonish Beach',
    value: 'CA/NS/Victoria/Ingonish Beach',
  },
  {
    label: 'Iona',
    value: 'CA/NS/Victoria/Iona',
  },
  {
    label: 'Jamesville',
    value: 'CA/NS/Victoria/Jamesville',
  },
  {
    label: 'Kempt Head',
    value: 'CA/NS/Victoria/Kempt Head',
  },
  {
    label: "Little Bras D'or",
    value: "CA/NS/Victoria/Little Bras D'or",
  },
  {
    label: 'Little Narrows',
    value: 'CA/NS/Victoria/Little Narrows',
  },
  {
    label: 'Little River',
    value: 'CA/NS/Victoria/Little River',
  },
  {
    label: 'Lower Washabuck',
    value: 'CA/NS/Victoria/Lower Washabuck',
  },
  {
    label: 'Mackinnons Harbour',
    value: 'CA/NS/Victoria/Mackinnons Harbour',
  },
  {
    label: 'Neils Harbour',
    value: 'CA/NS/Victoria/Neils Harbour',
  },
  {
    label: 'New Campbellton',
    value: 'CA/NS/Victoria/New Campbellton',
  },
  {
    label: 'New Harris',
    value: 'CA/NS/Victoria/New Harris',
  },
  {
    label: 'New Haven',
    value: 'CA/NS/Victoria/New Haven',
  },
  {
    label: 'Ottawa Brook',
    value: 'CA/NS/Victoria/Ottawa Brook',
  },
  {
    label: 'Red Point',
    value: 'CA/NS/Victoria/Red Point',
  },
  {
    label: 'Ross Ferry',
    value: 'CA/NS/Victoria/Ross Ferry',
  },
  {
    label: 'St Columba',
    value: 'CA/NS/Victoria/St Columba',
  },
  {
    label: 'St Margaret Village',
    value: 'CA/NS/Victoria/St Margaret Village',
  },
  {
    label: 'Upper Washabuck',
    value: 'CA/NS/Victoria/Upper Washabuck',
  },
  {
    label: 'Wagmatcook',
    value: 'CA/NS/Victoria/Wagmatcook',
  },
  {
    label: 'Washabuck Centre',
    value: 'CA/NS/Victoria/Washabuck Centre',
  },
  {
    label: 'Alder Plains',
    value: 'CA/NS/Yarmouth/Alder Plains',
  },
  {
    label: 'Arcadia',
    value: 'CA/NS/Yarmouth/Arcadia',
  },
  {
    label: 'Barrio Lake',
    value: 'CA/NS/Yarmouth/Barrio Lake',
  },
  {
    label: 'Beaver River',
    value: 'CA/NS/Yarmouth/Beaver River',
  },
  {
    label: 'Brazil Lake',
    value: 'CA/NS/Yarmouth/Brazil Lake',
  },
  {
    label: 'Brenton',
    value: 'CA/NS/Yarmouth/Brenton',
  },
  {
    label: 'Brooklyn',
    value: 'CA/NS/Yarmouth/Brooklyn',
  },
  {
    label: 'Canaan',
    value: 'CA/NS/Yarmouth/Canaan',
  },
  {
    label: 'Cape Forchu',
    value: 'CA/NS/Yarmouth/Cape Forchu',
  },
  {
    label: 'Cape St Marys',
    value: 'CA/NS/Yarmouth/Cape St Marys',
  },
  {
    label: 'Carleton',
    value: 'CA/NS/Yarmouth/Carleton',
  },
  {
    label: 'Cedar Lake',
    value: 'CA/NS/Yarmouth/Cedar Lake',
  },
  {
    label: 'Central Chebogue',
    value: 'CA/NS/Yarmouth/Central Chebogue',
  },
  {
    label: 'Chebogue Point',
    value: 'CA/NS/Yarmouth/Chebogue Point',
  },
  {
    label: 'Darlings Lake',
    value: 'CA/NS/Yarmouth/Darlings Lake',
  },
  {
    label: 'Dayton',
    value: 'CA/NS/Yarmouth/Dayton',
  },
  {
    label: 'Deerfield',
    value: 'CA/NS/Yarmouth/Deerfield',
  },
  {
    label: 'East Kemptville',
    value: 'CA/NS/Yarmouth/East Kemptville',
  },
  {
    label: 'Forest Glen',
    value: 'CA/NS/Yarmouth/Forest Glen',
  },
  {
    label: 'Gardners Mills',
    value: 'CA/NS/Yarmouth/Gardners Mills',
  },
  {
    label: 'Glenwood',
    value: 'CA/NS/Yarmouth/Glenwood',
  },
  {
    label: 'Greenville',
    value: 'CA/NS/Yarmouth/Greenville',
  },
  {
    label: 'Hebron',
    value: 'CA/NS/Yarmouth/Hebron',
  },
  {
    label: 'Hectanooga',
    value: 'CA/NS/Yarmouth/Hectanooga',
  },
  {
    label: 'Hillview',
    value: 'CA/NS/Yarmouth/Hillview',
  },
  {
    label: 'Ireton',
    value: 'CA/NS/Yarmouth/Ireton',
  },
  {
    label: 'Kelleys Cove',
    value: 'CA/NS/Yarmouth/Kelleys Cove',
  },
  {
    label: 'Kemptville',
    value: 'CA/NS/Yarmouth/Kemptville',
  },
  {
    label: 'Lake Annis',
    value: 'CA/NS/Yarmouth/Lake Annis',
  },
  {
    label: 'Lake George',
    value: 'CA/NS/Yarmouth/Lake George',
  },
  {
    label: 'Lakeside',
    value: 'CA/NS/Yarmouth/Lakeside',
  },
  {
    label: 'Lower East Pubnico',
    value: 'CA/NS/Yarmouth/Lower East Pubnico',
  },
  {
    label: 'Lower Wedgeport',
    value: 'CA/NS/Yarmouth/Lower Wedgeport',
  },
  {
    label: 'Lower West Pubnico',
    value: 'CA/NS/Yarmouth/Lower West Pubnico',
  },
  {
    label: 'Mavillette',
    value: 'CA/NS/Yarmouth/Mavillette',
  },
  {
    label: 'Mcgray',
    value: 'CA/NS/Yarmouth/Mcgray',
  },
  {
    label: 'Middle West Pubnico',
    value: 'CA/NS/Yarmouth/Middle West Pubnico',
  },
  {
    label: 'Milton Highlands',
    value: 'CA/NS/Yarmouth/Milton Highlands',
  },
  {
    label: 'North Chegoggin',
    value: 'CA/NS/Yarmouth/North Chegoggin',
  },
  {
    label: 'North Kemptville',
    value: 'CA/NS/Yarmouth/North Kemptville',
  },
  {
    label: 'Norwood',
    value: 'CA/NS/Yarmouth/Norwood',
  },
  {
    label: 'Overton',
    value: 'CA/NS/Yarmouth/Overton',
  },
  {
    label: 'Pembroke',
    value: 'CA/NS/Yarmouth/Pembroke',
  },
  {
    label: 'Pleasant Lake',
    value: 'CA/NS/Yarmouth/Pleasant Lake',
  },
  {
    label: 'Pleasant Valley',
    value: 'CA/NS/Yarmouth/Pleasant Valley',
  },
  {
    label: 'Port Maitland',
    value: 'CA/NS/Yarmouth/Port Maitland',
  },
  {
    label: 'Pubnico',
    value: 'CA/NS/Yarmouth/Pubnico',
  },
  {
    label: 'Richfield',
    value: 'CA/NS/Yarmouth/Richfield',
  },
  {
    label: 'Richmond',
    value: 'CA/NS/Yarmouth/Richmond',
  },
  {
    label: 'Rockville',
    value: 'CA/NS/Yarmouth/Rockville',
  },
  {
    label: 'Salmon River',
    value: 'CA/NS/Yarmouth/Salmon River',
  },
  {
    label: 'Sand Beach',
    value: 'CA/NS/Yarmouth/Sand Beach',
  },
  {
    label: 'Sandford',
    value: 'CA/NS/Yarmouth/Sandford',
  },
  {
    label: 'Short Beach',
    value: 'CA/NS/Yarmouth/Short Beach',
  },
  {
    label: 'South Chegoggin',
    value: 'CA/NS/Yarmouth/South Chegoggin',
  },
  {
    label: 'South Ohio',
    value: 'CA/NS/Yarmouth/South Ohio',
  },
  {
    label: 'Springdale',
    value: 'CA/NS/Yarmouth/Springdale',
  },
  {
    label: 'Ste-Anne-Du-Ruisseau',
    value: 'CA/NS/Yarmouth/Ste-Anne-Du-Ruisseau',
  },
  {
    label: 'Summerville',
    value: 'CA/NS/Yarmouth/Summerville',
  },
  {
    label: 'Tusket',
    value: 'CA/NS/Yarmouth/Tusket',
  },
  {
    label: 'Wedgeport',
    value: 'CA/NS/Yarmouth/Wedgeport',
  },
  {
    label: 'Wellington',
    value: 'CA/NS/Yarmouth/Wellington',
  },
  {
    label: 'West Pubnico',
    value: 'CA/NS/Yarmouth/West Pubnico',
  },
  {
    label: 'Woodstock',
    value: 'CA/NS/Yarmouth/Woodstock',
  },
  {
    label: 'Woodvale',
    value: 'CA/NS/Yarmouth/Woodvale',
  },
  {
    label: 'Yarmouth',
    value: 'CA/NS/Yarmouth/Yarmouth',
  },
  {
    label: 'Cambridge Bay',
    value: 'CA/NU/Kitikmeot/Cambridge Bay',
  },
  {
    label: 'Gjoa Haven',
    value: 'CA/NU/Kitikmeot/Gjoa Haven',
  },
  {
    label: 'Kugaaruk',
    value: 'CA/NU/Kitikmeot/Kugaaruk',
  },
  {
    label: 'Kugluktuk',
    value: 'CA/NU/Kitikmeot/Kugluktuk',
  },
  {
    label: 'Taloyoak',
    value: 'CA/NU/Kitikmeot/Taloyoak',
  },
  {
    label: 'Umingmaktok',
    value: 'CA/NU/Kitikmeot/Umingmaktok',
  },
  {
    label: 'Arviat',
    value: 'CA/NU/Kivalliq/Arviat',
  },
  {
    label: 'Baker Lake',
    value: 'CA/NU/Kivalliq/Baker Lake',
  },
  {
    label: 'Chesterfield Inlet',
    value: 'CA/NU/Kivalliq/Chesterfield Inlet',
  },
  {
    label: 'Coral Harbour',
    value: 'CA/NU/Kivalliq/Coral Harbour',
  },
  {
    label: 'Naujaat',
    value: 'CA/NU/Kivalliq/Naujaat',
  },
  {
    label: 'Rankin Inlet',
    value: 'CA/NU/Kivalliq/Rankin Inlet',
  },
  {
    label: 'Whale Cove',
    value: 'CA/NU/Kivalliq/Whale Cove',
  },
  {
    label: 'Arctic Bay',
    value: 'CA/NU/Qikiqtaaluk/Arctic Bay',
  },
  {
    label: 'Cape Dorset',
    value: 'CA/NU/Qikiqtaaluk/Cape Dorset',
  },
  {
    label: 'Clyde River',
    value: 'CA/NU/Qikiqtaaluk/Clyde River',
  },
  {
    label: 'Eureka',
    value: 'CA/NU/Qikiqtaaluk/Eureka',
  },
  {
    label: 'Grise Fiord',
    value: 'CA/NU/Qikiqtaaluk/Grise Fiord',
  },
  {
    label: 'Hall Beach',
    value: 'CA/NU/Qikiqtaaluk/Hall Beach',
  },
  {
    label: 'Igloolik',
    value: 'CA/NU/Qikiqtaaluk/Igloolik',
  },
  {
    label: 'Iqaluit',
    value: 'CA/NU/Qikiqtaaluk/Iqaluit',
  },
  {
    label: 'Kimmirut',
    value: 'CA/NU/Qikiqtaaluk/Kimmirut',
  },
  {
    label: 'Nanisivik',
    value: 'CA/NU/Qikiqtaaluk/Nanisivik',
  },
  {
    label: 'Pangnirtung',
    value: 'CA/NU/Qikiqtaaluk/Pangnirtung',
  },
  {
    label: 'Pond Inlet',
    value: 'CA/NU/Qikiqtaaluk/Pond Inlet',
  },
  {
    label: 'Qikiqtarjuaq',
    value: 'CA/NU/Qikiqtaaluk/Qikiqtarjuaq',
  },
  {
    label: 'Resolute',
    value: 'CA/NU/Qikiqtaaluk/Resolute',
  },
  {
    label: 'Sanikiluaq',
    value: 'CA/NU/Qikiqtaaluk/Sanikiluaq',
  },
  {
    label: 'Algoma Mills',
    value: 'CA/ON/Algoma/Algoma Mills',
  },
  {
    label: 'Aweres',
    value: 'CA/ON/Algoma/Aweres',
  },
  {
    label: 'Batchawana Bay',
    value: 'CA/ON/Algoma/Batchawana Bay',
  },
  {
    label: 'Batchewana First Nation',
    value: 'CA/ON/Algoma/Batchewana First Nation',
  },
  {
    label: 'Blind River',
    value: 'CA/ON/Algoma/Blind River',
  },
  {
    label: 'Bruce Mines',
    value: 'CA/ON/Algoma/Bruce Mines',
  },
  {
    label: 'Cutler',
    value: 'CA/ON/Algoma/Cutler',
  },
  {
    label: 'Desbarats',
    value: 'CA/ON/Algoma/Desbarats',
  },
  {
    label: 'Dubreuilville',
    value: 'CA/ON/Algoma/Dubreuilville',
  },
  {
    label: 'Echo Bay',
    value: 'CA/ON/Algoma/Echo Bay',
  },
  {
    label: 'Elliot Lake',
    value: 'CA/ON/Algoma/Elliot Lake',
  },
  {
    label: 'Garden River First Nation',
    value: 'CA/ON/Algoma/Garden River First Nation',
  },
  {
    label: 'Goulais River',
    value: 'CA/ON/Algoma/Goulais River',
  },
  {
    label: 'Hawk Junction',
    value: 'CA/ON/Algoma/Hawk Junction',
  },
  {
    label: 'Hilton',
    value: 'CA/ON/Algoma/Hilton',
  },
  {
    label: 'Hilton Beach',
    value: 'CA/ON/Algoma/Hilton Beach',
  },
  {
    label: 'Hornepayne',
    value: 'CA/ON/Algoma/Hornepayne',
  },
  {
    label: 'Hornpayne First Nation',
    value: 'CA/ON/Algoma/Hornpayne First Nation',
  },
  {
    label: 'Iron Bridge',
    value: 'CA/ON/Algoma/Iron Bridge',
  },
  {
    label: 'Jocelyn',
    value: 'CA/ON/Algoma/Jocelyn',
  },
  {
    label: 'Laird',
    value: 'CA/ON/Algoma/Laird',
  },
  {
    label: 'Michipicoten First Nation',
    value: 'CA/ON/Algoma/Michipicoten First Nation',
  },
  {
    label: 'Missanabie',
    value: 'CA/ON/Algoma/Missanabie',
  },
  {
    label: 'Missanabie Cree First Nation',
    value: 'CA/ON/Algoma/Missanabie Cree First Nation',
  },
  {
    label: 'Mississauga First Nation',
    value: 'CA/ON/Algoma/Mississauga First Nation',
  },
  {
    label: 'Montreal River Harbour',
    value: 'CA/ON/Algoma/Montreal River Harbour',
  },
  {
    label: 'Oba',
    value: 'CA/ON/Algoma/Oba',
  },
  {
    label: 'Plummer Additional',
    value: 'CA/ON/Algoma/Plummer Additional',
  },
  {
    label: 'Prince',
    value: 'CA/ON/Algoma/Prince',
  },
  {
    label: 'Rankin Location 15D First Nation',
    value: 'CA/ON/Algoma/Rankin Location 15D First Nation',
  },
  {
    label: 'Richards Landing',
    value: 'CA/ON/Algoma/Richards Landing',
  },
  {
    label: 'Sagamok First Nation',
    value: 'CA/ON/Algoma/Sagamok First Nation',
  },
  {
    label: 'Sault Ste Marie',
    value: 'CA/ON/Algoma/Sault Ste Marie',
  },
  {
    label: 'Searchmont',
    value: 'CA/ON/Algoma/Searchmont',
  },
  {
    label: 'Serpent River',
    value: 'CA/ON/Algoma/Serpent River',
  },
  {
    label: 'Serpent River First Nation',
    value: 'CA/ON/Algoma/Serpent River First Nation',
  },
  {
    label: 'Spanish',
    value: 'CA/ON/Algoma/Spanish',
  },
  {
    label: 'Spragge',
    value: 'CA/ON/Algoma/Spragge',
  },
  {
    label: 'Tarbutt And Tarbutt Additional',
    value: 'CA/ON/Algoma/Tarbutt And Tarbutt Additional',
  },
  {
    label: 'Thessalon',
    value: 'CA/ON/Algoma/Thessalon',
  },
  {
    label: 'Thessalon First Nation',
    value: 'CA/ON/Algoma/Thessalon First Nation',
  },
  {
    label: 'Wawa',
    value: 'CA/ON/Algoma/Wawa',
  },
  {
    label: 'White River',
    value: 'CA/ON/Algoma/White River',
  },
  {
    label: 'Branchton',
    value: 'CA/ON/Brant/Branchton',
  },
  {
    label: 'Brantford',
    value: 'CA/ON/Brant/Brantford',
  },
  {
    label: 'Burford',
    value: 'CA/ON/Brant/Burford',
  },
  {
    label: 'Cathcart',
    value: 'CA/ON/Brant/Cathcart',
  },
  {
    label: 'Glen Morris',
    value: 'CA/ON/Brant/Glen Morris',
  },
  {
    label: 'Harley',
    value: 'CA/ON/Brant/Harley',
  },
  {
    label: 'Mount Pleasant',
    value: 'CA/ON/Brant/Mount Pleasant',
  },
  {
    label: 'Ohsweken',
    value: 'CA/ON/Brant/Ohsweken',
  },
  {
    label: 'Paris',
    value: 'CA/ON/Brant/Paris',
  },
  {
    label: 'Scotland',
    value: 'CA/ON/Brant/Scotland',
  },
  {
    label: 'Six Nations/New Credit',
    value: 'CA/ON/Brant/Six Nations/New Credit',
  },
  {
    label: 'St George Brant',
    value: 'CA/ON/Brant/St George Brant',
  },
  {
    label: 'Allenford',
    value: 'CA/ON/Bruce/Allenford',
  },
  {
    label: 'Cape Croker',
    value: 'CA/ON/Bruce/Cape Croker',
  },
  {
    label: 'Cargill',
    value: 'CA/ON/Bruce/Cargill',
  },
  {
    label: 'Chepstow',
    value: 'CA/ON/Bruce/Chepstow',
  },
  {
    label: 'Chesley',
    value: 'CA/ON/Bruce/Chesley',
  },
  {
    label: 'Dobbinton',
    value: 'CA/ON/Bruce/Dobbinton',
  },
  {
    label: 'Elmwood',
    value: 'CA/ON/Bruce/Elmwood',
  },
  {
    label: 'Formosa',
    value: 'CA/ON/Bruce/Formosa',
  },
  {
    label: 'Hepworth',
    value: 'CA/ON/Bruce/Hepworth',
  },
  {
    label: 'Holyrood',
    value: 'CA/ON/Bruce/Holyrood',
  },
  {
    label: 'Kincardine',
    value: 'CA/ON/Bruce/Kincardine',
  },
  {
    label: 'Lions Head',
    value: 'CA/ON/Bruce/Lions Head',
  },
  {
    label: 'Lucknow',
    value: 'CA/ON/Bruce/Lucknow',
  },
  {
    label: 'Mar',
    value: 'CA/ON/Bruce/Mar',
  },
  {
    label: 'Mildmay',
    value: 'CA/ON/Bruce/Mildmay',
  },
  {
    label: 'Miller Lake',
    value: 'CA/ON/Bruce/Miller Lake',
  },
  {
    label: 'Neyaashiinigmiing',
    value: 'CA/ON/Bruce/Neyaashiinigmiing',
  },
  {
    label: 'Paisley',
    value: 'CA/ON/Bruce/Paisley',
  },
  {
    label: 'Port Elgin',
    value: 'CA/ON/Bruce/Port Elgin',
  },
  {
    label: 'Ripley',
    value: 'CA/ON/Bruce/Ripley',
  },
  {
    label: 'Sauble Beach',
    value: 'CA/ON/Bruce/Sauble Beach',
  },
  {
    label: 'Southampton',
    value: 'CA/ON/Bruce/Southampton',
  },
  {
    label: 'Stokes Bay',
    value: 'CA/ON/Bruce/Stokes Bay',
  },
  {
    label: 'Tara',
    value: 'CA/ON/Bruce/Tara',
  },
  {
    label: 'Teeswater',
    value: 'CA/ON/Bruce/Teeswater',
  },
  {
    label: 'Tiverton',
    value: 'CA/ON/Bruce/Tiverton',
  },
  {
    label: 'Tobermory',
    value: 'CA/ON/Bruce/Tobermory',
  },
  {
    label: 'Walkerton',
    value: 'CA/ON/Bruce/Walkerton',
  },
  {
    label: 'Wiarton',
    value: 'CA/ON/Bruce/Wiarton',
  },
  {
    label: 'Blenheim',
    value: 'CA/ON/Chatham-Kent/Blenheim',
  },
  {
    label: 'Bothwell',
    value: 'CA/ON/Chatham-Kent/Bothwell',
  },
  {
    label: 'Cedar Springs',
    value: 'CA/ON/Chatham-Kent/Cedar Springs',
  },
  {
    label: 'Charing Cross',
    value: 'CA/ON/Chatham-Kent/Charing Cross',
  },
  {
    label: 'Chatham',
    value: 'CA/ON/Chatham-Kent/Chatham',
  },
  {
    label: 'Coatsworth Station',
    value: 'CA/ON/Chatham-Kent/Coatsworth Station',
  },
  {
    label: 'Dover Centre',
    value: 'CA/ON/Chatham-Kent/Dover Centre',
  },
  {
    label: 'Dresden',
    value: 'CA/ON/Chatham-Kent/Dresden',
  },
  {
    label: 'Duart',
    value: 'CA/ON/Chatham-Kent/Duart',
  },
  {
    label: 'Erieau',
    value: 'CA/ON/Chatham-Kent/Erieau',
  },
  {
    label: 'Grande Pointe',
    value: 'CA/ON/Chatham-Kent/Grande Pointe',
  },
  {
    label: 'Highgate',
    value: 'CA/ON/Chatham-Kent/Highgate',
  },
  {
    label: 'Kent Bridge',
    value: 'CA/ON/Chatham-Kent/Kent Bridge',
  },
  {
    label: 'Merlin',
    value: 'CA/ON/Chatham-Kent/Merlin',
  },
  {
    label: 'Morpeth',
    value: 'CA/ON/Chatham-Kent/Morpeth',
  },
  {
    label: 'Muirkirk',
    value: 'CA/ON/Chatham-Kent/Muirkirk',
  },
  {
    label: 'North Buxton',
    value: 'CA/ON/Chatham-Kent/North Buxton',
  },
  {
    label: 'Pain Court',
    value: 'CA/ON/Chatham-Kent/Pain Court',
  },
  {
    label: 'Port Alma',
    value: 'CA/ON/Chatham-Kent/Port Alma',
  },
  {
    label: 'Ridgetown',
    value: 'CA/ON/Chatham-Kent/Ridgetown',
  },
  {
    label: 'Thamesville',
    value: 'CA/ON/Chatham-Kent/Thamesville',
  },
  {
    label: 'Tilbury',
    value: 'CA/ON/Chatham-Kent/Tilbury',
  },
  {
    label: 'Tupperville',
    value: 'CA/ON/Chatham-Kent/Tupperville',
  },
  {
    label: 'Wallaceburg',
    value: 'CA/ON/Chatham-Kent/Wallaceburg',
  },
  {
    label: 'Wheatley',
    value: 'CA/ON/Chatham-Kent/Wheatley',
  },
  {
    label: 'Calstock',
    value: 'CA/ON/Cochrane/Calstock',
  },
  {
    label: 'Cochrane',
    value: 'CA/ON/Cochrane/Cochrane',
  },
  {
    label: 'Connaught',
    value: 'CA/ON/Cochrane/Connaught',
  },
  {
    label: 'Constance Lake First Nation',
    value: 'CA/ON/Cochrane/Constance Lake First Nation',
  },
  {
    label: 'Driftwood',
    value: 'CA/ON/Cochrane/Driftwood',
  },
  {
    label: 'Fauquier',
    value: 'CA/ON/Cochrane/Fauquier',
  },
  {
    label: 'Fort Albany First Nation',
    value: 'CA/ON/Cochrane/Fort Albany First Nation',
  },
  {
    label: 'Frederickhouse',
    value: 'CA/ON/Cochrane/Frederickhouse',
  },
  {
    label: 'Hallebourg',
    value: 'CA/ON/Cochrane/Hallebourg',
  },
  {
    label: 'Harty',
    value: 'CA/ON/Cochrane/Harty',
  },
  {
    label: 'Hearst',
    value: 'CA/ON/Cochrane/Hearst',
  },
  {
    label: 'Holtyre',
    value: 'CA/ON/Cochrane/Holtyre',
  },
  {
    label: 'Hunta',
    value: 'CA/ON/Cochrane/Hunta',
  },
  {
    label: 'Iroquois Falls',
    value: 'CA/ON/Cochrane/Iroquois Falls',
  },
  {
    label: 'Iroquois Falls A',
    value: 'CA/ON/Cochrane/Iroquois Falls A',
  },
  {
    label: 'Jogues',
    value: 'CA/ON/Cochrane/Jogues',
  },
  {
    label: 'Kapuskasing',
    value: 'CA/ON/Cochrane/Kapuskasing',
  },
  {
    label: 'Kashechewan First Nation',
    value: 'CA/ON/Cochrane/Kashechewan First Nation',
  },
  {
    label: 'Marten Falls First Nation',
    value: 'CA/ON/Cochrane/Marten Falls First Nation',
  },
  {
    label: 'Matheson',
    value: 'CA/ON/Cochrane/Matheson',
  },
  {
    label: 'Mattice',
    value: 'CA/ON/Cochrane/Mattice',
  },
  {
    label: 'Monteith',
    value: 'CA/ON/Cochrane/Monteith',
  },
  {
    label: 'Moonbeam',
    value: 'CA/ON/Cochrane/Moonbeam',
  },
  {
    label: 'Moose Factory',
    value: 'CA/ON/Cochrane/Moose Factory',
  },
  {
    label: 'Moosonee',
    value: 'CA/ON/Cochrane/Moosonee',
  },
  {
    label: 'Opasatika',
    value: 'CA/ON/Cochrane/Opasatika',
  },
  {
    label: 'Porcupine',
    value: 'CA/ON/Cochrane/Porcupine',
  },
  {
    label: 'Porquis Junction',
    value: 'CA/ON/Cochrane/Porquis Junction',
  },
  {
    label: 'Ramore',
    value: 'CA/ON/Cochrane/Ramore',
  },
  {
    label: 'Schumacher',
    value: 'CA/ON/Cochrane/Schumacher',
  },
  {
    label: 'Smooth Rock Falls',
    value: 'CA/ON/Cochrane/Smooth Rock Falls',
  },
  {
    label: 'South Porcupine',
    value: 'CA/ON/Cochrane/South Porcupine',
  },
  {
    label: 'Strickland',
    value: 'CA/ON/Cochrane/Strickland',
  },
  {
    label: 'Timmins',
    value: 'CA/ON/Cochrane/Timmins',
  },
  {
    label: 'Tunis',
    value: 'CA/ON/Cochrane/Tunis',
  },
  {
    label: 'Val Cote',
    value: 'CA/ON/Cochrane/Val Cote',
  },
  {
    label: 'Val Gagne',
    value: 'CA/ON/Cochrane/Val Gagne',
  },
  {
    label: 'Val Rita',
    value: 'CA/ON/Cochrane/Val Rita',
  },
  {
    label: 'Amaranth',
    value: 'CA/ON/Dufferin/Amaranth',
  },
  {
    label: 'East Garafraxa',
    value: 'CA/ON/Dufferin/East Garafraxa',
  },
  {
    label: 'Grand Valley',
    value: 'CA/ON/Dufferin/Grand Valley',
  },
  {
    label: 'Honeywood',
    value: 'CA/ON/Dufferin/Honeywood',
  },
  {
    label: 'Hornings Mills',
    value: 'CA/ON/Dufferin/Hornings Mills',
  },
  {
    label: 'Laurel',
    value: 'CA/ON/Dufferin/Laurel',
  },
  {
    label: 'Mansfield',
    value: 'CA/ON/Dufferin/Mansfield',
  },
  {
    label: 'Melancthon',
    value: 'CA/ON/Dufferin/Melancthon',
  },
  {
    label: 'Mono',
    value: 'CA/ON/Dufferin/Mono',
  },
  {
    label: 'Mulmur',
    value: 'CA/ON/Dufferin/Mulmur',
  },
  {
    label: 'Orangeville',
    value: 'CA/ON/Dufferin/Orangeville',
  },
  {
    label: 'Orton',
    value: 'CA/ON/Dufferin/Orton',
  },
  {
    label: 'Shelburne',
    value: 'CA/ON/Dufferin/Shelburne',
  },
  {
    label: 'Ajax',
    value: 'CA/ON/Durham/Ajax',
  },
  {
    label: 'Ashburn',
    value: 'CA/ON/Durham/Ashburn',
  },
  {
    label: 'Beaverton',
    value: 'CA/ON/Durham/Beaverton',
  },
  {
    label: 'Blackstock',
    value: 'CA/ON/Durham/Blackstock',
  },
  {
    label: 'Bond Head',
    value: 'CA/ON/Durham/Bond Head',
  },
  {
    label: 'Bowmanville',
    value: 'CA/ON/Durham/Bowmanville',
  },
  {
    label: 'Brougham',
    value: 'CA/ON/Durham/Brougham',
  },
  {
    label: 'Caesarea',
    value: 'CA/ON/Durham/Caesarea',
  },
  {
    label: 'Cannington',
    value: 'CA/ON/Durham/Cannington',
  },
  {
    label: 'Claremont',
    value: 'CA/ON/Durham/Claremont',
  },
  {
    label: 'Courtice',
    value: 'CA/ON/Durham/Courtice',
  },
  {
    label: 'Goodwood',
    value: 'CA/ON/Durham/Goodwood',
  },
  {
    label: 'Greenbank',
    value: 'CA/ON/Durham/Greenbank',
  },
  {
    label: 'Greenwood',
    value: 'CA/ON/Durham/Greenwood',
  },
  {
    label: 'Hampton',
    value: 'CA/ON/Durham/Hampton',
  },
  {
    label: 'Kendal',
    value: 'CA/ON/Durham/Kendal',
  },
  {
    label: 'Leaskdale',
    value: 'CA/ON/Durham/Leaskdale',
  },
  {
    label: 'Locust Hill',
    value: 'CA/ON/Durham/Locust Hill',
  },
  {
    label: 'Nestleton Station',
    value: 'CA/ON/Durham/Nestleton Station',
  },
  {
    label: 'Newcastle',
    value: 'CA/ON/Durham/Newcastle',
  },
  {
    label: 'Newtonville',
    value: 'CA/ON/Durham/Newtonville',
  },
  {
    label: 'Orono',
    value: 'CA/ON/Durham/Orono',
  },
  {
    label: 'Oshawa',
    value: 'CA/ON/Durham/Oshawa',
  },
  {
    label: 'Pickering',
    value: 'CA/ON/Durham/Pickering',
  },
  {
    label: 'Port Perry',
    value: 'CA/ON/Durham/Port Perry',
  },
  {
    label: 'Prince Albert',
    value: 'CA/ON/Durham/Prince Albert',
  },
  {
    label: 'Sandford',
    value: 'CA/ON/Durham/Sandford',
  },
  {
    label: 'Seagrave',
    value: 'CA/ON/Durham/Seagrave',
  },
  {
    label: 'Sunderland',
    value: 'CA/ON/Durham/Sunderland',
  },
  {
    label: 'Uxbridge',
    value: 'CA/ON/Durham/Uxbridge',
  },
  {
    label: 'Whitby',
    value: 'CA/ON/Durham/Whitby',
  },
  {
    label: 'Whitevale',
    value: 'CA/ON/Durham/Whitevale',
  },
  {
    label: 'Zephyr',
    value: 'CA/ON/Durham/Zephyr',
  },
  {
    label: 'Aylmer',
    value: 'CA/ON/Elgin/Aylmer',
  },
  {
    label: 'Belmont',
    value: 'CA/ON/Elgin/Belmont',
  },
  {
    label: 'Dutton',
    value: 'CA/ON/Elgin/Dutton',
  },
  {
    label: 'Eden',
    value: 'CA/ON/Elgin/Eden',
  },
  {
    label: 'Fingal',
    value: 'CA/ON/Elgin/Fingal',
  },
  {
    label: 'Iona Station',
    value: 'CA/ON/Elgin/Iona Station',
  },
  {
    label: 'Port Burwell',
    value: 'CA/ON/Elgin/Port Burwell',
  },
  {
    label: 'Port Stanley',
    value: 'CA/ON/Elgin/Port Stanley',
  },
  {
    label: 'Richmond',
    value: 'CA/ON/Elgin/Richmond',
  },
  {
    label: 'Rodney',
    value: 'CA/ON/Elgin/Rodney',
  },
  {
    label: 'Shedden',
    value: 'CA/ON/Elgin/Shedden',
  },
  {
    label: 'Southwold',
    value: 'CA/ON/Elgin/Southwold',
  },
  {
    label: 'Sparta',
    value: 'CA/ON/Elgin/Sparta',
  },
  {
    label: 'Springfield',
    value: 'CA/ON/Elgin/Springfield',
  },
  {
    label: 'St Thomas',
    value: 'CA/ON/Elgin/St Thomas',
  },
  {
    label: 'St.Thomas',
    value: 'CA/ON/Elgin/St.Thomas',
  },
  {
    label: 'Straffordville',
    value: 'CA/ON/Elgin/Straffordville',
  },
  {
    label: 'Talbotville Royal',
    value: 'CA/ON/Elgin/Talbotville Royal',
  },
  {
    label: 'Union',
    value: 'CA/ON/Elgin/Union',
  },
  {
    label: 'Vienna',
    value: 'CA/ON/Elgin/Vienna',
  },
  {
    label: 'Wallacetown',
    value: 'CA/ON/Elgin/Wallacetown',
  },
  {
    label: 'West Lorne',
    value: 'CA/ON/Elgin/West Lorne',
  },
  {
    label: 'Amherstburg',
    value: 'CA/ON/Essex/Amherstburg',
  },
  {
    label: 'Belle River',
    value: 'CA/ON/Essex/Belle River',
  },
  {
    label: 'Blytheswood',
    value: 'CA/ON/Essex/Blytheswood',
  },
  {
    label: 'Comber',
    value: 'CA/ON/Essex/Comber',
  },
  {
    label: 'Cottam',
    value: 'CA/ON/Essex/Cottam',
  },
  {
    label: 'Emeryville',
    value: 'CA/ON/Essex/Emeryville',
  },
  {
    label: 'Essex',
    value: 'CA/ON/Essex/Essex',
  },
  {
    label: 'Harrow',
    value: 'CA/ON/Essex/Harrow',
  },
  {
    label: 'Kingsville',
    value: 'CA/ON/Essex/Kingsville',
  },
  {
    label: 'Lasalle',
    value: 'CA/ON/Essex/Lasalle',
  },
  {
    label: 'Leamington',
    value: 'CA/ON/Essex/Leamington',
  },
  {
    label: 'Maidstone',
    value: 'CA/ON/Essex/Maidstone',
  },
  {
    label: 'Mcgregor',
    value: 'CA/ON/Essex/Mcgregor',
  },
  {
    label: 'Oldcastle',
    value: 'CA/ON/Essex/Oldcastle',
  },
  {
    label: 'Pelee Island',
    value: 'CA/ON/Essex/Pelee Island',
  },
  {
    label: 'Pointe Aux Roches',
    value: 'CA/ON/Essex/Pointe Aux Roches',
  },
  {
    label: 'Ruscom Station',
    value: 'CA/ON/Essex/Ruscom Station',
  },
  {
    label: 'Ruthven',
    value: 'CA/ON/Essex/Ruthven',
  },
  {
    label: 'South Woodslee',
    value: 'CA/ON/Essex/South Woodslee',
  },
  {
    label: 'St Joachim',
    value: 'CA/ON/Essex/St Joachim',
  },
  {
    label: 'Staples',
    value: 'CA/ON/Essex/Staples',
  },
  {
    label: 'Tecumseh',
    value: 'CA/ON/Essex/Tecumseh',
  },
  {
    label: 'Wheatley',
    value: 'CA/ON/Essex/Wheatley',
  },
  {
    label: 'Windsor',
    value: 'CA/ON/Essex/Windsor',
  },
  {
    label: 'Arden',
    value: 'CA/ON/Frontenac/Arden',
  },
  {
    label: 'Ardoch',
    value: 'CA/ON/Frontenac/Ardoch',
  },
  {
    label: 'Battersea',
    value: 'CA/ON/Frontenac/Battersea',
  },
  {
    label: 'Bedford',
    value: 'CA/ON/Frontenac/Bedford',
  },
  {
    label: 'Central Frontenac',
    value: 'CA/ON/Frontenac/Central Frontenac',
  },
  {
    label: 'Clarendon',
    value: 'CA/ON/Frontenac/Clarendon',
  },
  {
    label: 'Cloyne',
    value: 'CA/ON/Frontenac/Cloyne',
  },
  {
    label: 'Elginburg',
    value: 'CA/ON/Frontenac/Elginburg',
  },
  {
    label: 'Forest',
    value: 'CA/ON/Frontenac/Forest',
  },
  {
    label: 'Frontenac Islands',
    value: 'CA/ON/Frontenac/Frontenac Islands',
  },
  {
    label: 'Glenburnie',
    value: 'CA/ON/Frontenac/Glenburnie',
  },
  {
    label: 'Godfrey',
    value: 'CA/ON/Frontenac/Godfrey',
  },
  {
    label: 'Harrowsmith',
    value: 'CA/ON/Frontenac/Harrowsmith',
  },
  {
    label: 'Hartington',
    value: 'CA/ON/Frontenac/Hartington',
  },
  {
    label: 'Hinchinbrooke',
    value: 'CA/ON/Frontenac/Hinchinbrooke',
  },
  {
    label: 'Inverary',
    value: 'CA/ON/Frontenac/Inverary',
  },
  {
    label: 'Joyceville',
    value: 'CA/ON/Frontenac/Joyceville',
  },
  {
    label: 'Kennebec',
    value: 'CA/ON/Frontenac/Kennebec',
  },
  {
    label: 'Kingston',
    value: 'CA/ON/Frontenac/Kingston',
  },
  {
    label: 'Loughborough',
    value: 'CA/ON/Frontenac/Loughborough',
  },
  {
    label: 'Miller',
    value: 'CA/ON/Frontenac/Miller',
  },
  {
    label: 'Mountain Grove',
    value: 'CA/ON/Frontenac/Mountain Grove',
  },
  {
    label: 'North Canonto',
    value: 'CA/ON/Frontenac/North Canonto',
  },
  {
    label: 'North Frontenac',
    value: 'CA/ON/Frontenac/North Frontenac',
  },
  {
    label: 'Ompah',
    value: 'CA/ON/Frontenac/Ompah',
  },
  {
    label: 'Parham',
    value: 'CA/ON/Frontenac/Parham',
  },
  {
    label: 'Perth Road',
    value: 'CA/ON/Frontenac/Perth Road',
  },
  {
    label: 'Plevna',
    value: 'CA/ON/Frontenac/Plevna',
  },
  {
    label: 'Seeleys Bay',
    value: 'CA/ON/Frontenac/Seeleys Bay',
  },
  {
    label: 'Sharbot Lake',
    value: 'CA/ON/Frontenac/Sharbot Lake',
  },
  {
    label: 'Snow Road Station',
    value: 'CA/ON/Frontenac/Snow Road Station',
  },
  {
    label: 'Sydenham',
    value: 'CA/ON/Frontenac/Sydenham',
  },
  {
    label: 'Tichborne',
    value: 'CA/ON/Frontenac/Tichborne',
  },
  {
    label: 'Verona',
    value: 'CA/ON/Frontenac/Verona',
  },
  {
    label: 'Westbrook',
    value: 'CA/ON/Frontenac/Westbrook',
  },
  {
    label: 'Wolfe Island',
    value: 'CA/ON/Frontenac/Wolfe Island',
  },
  {
    label: 'Annan',
    value: 'CA/ON/Grey/Annan',
  },
  {
    label: 'Ayton',
    value: 'CA/ON/Grey/Ayton',
  },
  {
    label: 'Badjeros',
    value: 'CA/ON/Grey/Badjeros',
  },
  {
    label: 'Berkeley',
    value: 'CA/ON/Grey/Berkeley',
  },
  {
    label: 'Blue Mountains',
    value: 'CA/ON/Grey/Blue Mountains',
  },
  {
    label: 'Bognor',
    value: 'CA/ON/Grey/Bognor',
  },
  {
    label: 'Chatsworth',
    value: 'CA/ON/Grey/Chatsworth',
  },
  {
    label: 'Clarksburg',
    value: 'CA/ON/Grey/Clarksburg',
  },
  {
    label: 'Desboro',
    value: 'CA/ON/Grey/Desboro',
  },
  {
    label: 'Dornoch',
    value: 'CA/ON/Grey/Dornoch',
  },
  {
    label: 'Dundalk',
    value: 'CA/ON/Grey/Dundalk',
  },
  {
    label: 'Durham',
    value: 'CA/ON/Grey/Durham',
  },
  {
    label: 'Elmwood',
    value: 'CA/ON/Grey/Elmwood',
  },
  {
    label: 'Eugenia',
    value: 'CA/ON/Grey/Eugenia',
  },
  {
    label: 'Feversham',
    value: 'CA/ON/Grey/Feversham',
  },
  {
    label: 'Flesherton',
    value: 'CA/ON/Grey/Flesherton',
  },
  {
    label: 'Hanover',
    value: 'CA/ON/Grey/Hanover',
  },
  {
    label: 'Heathcote',
    value: 'CA/ON/Grey/Heathcote',
  },
  {
    label: 'Holland Centre',
    value: 'CA/ON/Grey/Holland Centre',
  },
  {
    label: 'Holstein',
    value: 'CA/ON/Grey/Holstein',
  },
  {
    label: 'Keady',
    value: 'CA/ON/Grey/Keady',
  },
  {
    label: 'Kemble',
    value: 'CA/ON/Grey/Kemble',
  },
  {
    label: 'Kimberley',
    value: 'CA/ON/Grey/Kimberley',
  },
  {
    label: 'Leith',
    value: 'CA/ON/Grey/Leith',
  },
  {
    label: 'Markdale',
    value: 'CA/ON/Grey/Markdale',
  },
  {
    label: 'Maxwell',
    value: 'CA/ON/Grey/Maxwell',
  },
  {
    label: 'Meaford',
    value: 'CA/ON/Grey/Meaford',
  },
  {
    label: 'Mount Forest',
    value: 'CA/ON/Grey/Mount Forest',
  },
  {
    label: 'Neustadt',
    value: 'CA/ON/Grey/Neustadt',
  },
  {
    label: 'Owen Sound',
    value: 'CA/ON/Grey/Owen Sound',
  },
  {
    label: 'Priceville',
    value: 'CA/ON/Grey/Priceville',
  },
  {
    label: 'Proton Station',
    value: 'CA/ON/Grey/Proton Station',
  },
  {
    label: 'Ravenna',
    value: 'CA/ON/Grey/Ravenna',
  },
  {
    label: 'Shallow Lake',
    value: 'CA/ON/Grey/Shallow Lake',
  },
  {
    label: 'Singhampton',
    value: 'CA/ON/Grey/Singhampton',
  },
  {
    label: 'Thornbury',
    value: 'CA/ON/Grey/Thornbury',
  },
  {
    label: 'Varney',
    value: 'CA/ON/Grey/Varney',
  },
  {
    label: 'Walters Falls',
    value: 'CA/ON/Grey/Walters Falls',
  },
  {
    label: 'Williamsford',
    value: 'CA/ON/Grey/Williamsford',
  },
  {
    label: 'Caledonia',
    value: 'CA/ON/Haldimand-Norfolk/Caledonia',
  },
  {
    label: 'Canfield',
    value: 'CA/ON/Haldimand-Norfolk/Canfield',
  },
  {
    label: 'Cayuga',
    value: 'CA/ON/Haldimand-Norfolk/Cayuga',
  },
  {
    label: 'Clear Creek',
    value: 'CA/ON/Haldimand-Norfolk/Clear Creek',
  },
  {
    label: 'Courtland',
    value: 'CA/ON/Haldimand-Norfolk/Courtland',
  },
  {
    label: 'Delhi',
    value: 'CA/ON/Haldimand-Norfolk/Delhi',
  },
  {
    label: 'Dunnville',
    value: 'CA/ON/Haldimand-Norfolk/Dunnville',
  },
  {
    label: 'Fisherville',
    value: 'CA/ON/Haldimand-Norfolk/Fisherville',
  },
  {
    label: 'Hagersville',
    value: 'CA/ON/Haldimand-Norfolk/Hagersville',
  },
  {
    label: 'Jarvis',
    value: 'CA/ON/Haldimand-Norfolk/Jarvis',
  },
  {
    label: 'La Salette',
    value: 'CA/ON/Haldimand-Norfolk/La Salette',
  },
  {
    label: 'Langton',
    value: 'CA/ON/Haldimand-Norfolk/Langton',
  },
  {
    label: 'Lowbanks',
    value: 'CA/ON/Haldimand-Norfolk/Lowbanks',
  },
  {
    label: 'Nanticoke',
    value: 'CA/ON/Haldimand-Norfolk/Nanticoke',
  },
  {
    label: 'Oakland',
    value: 'CA/ON/Haldimand-Norfolk/Oakland',
  },
  {
    label: 'Port Dover',
    value: 'CA/ON/Haldimand-Norfolk/Port Dover',
  },
  {
    label: 'Port Rowan',
    value: 'CA/ON/Haldimand-Norfolk/Port Rowan',
  },
  {
    label: 'Scotland',
    value: 'CA/ON/Haldimand-Norfolk/Scotland',
  },
  {
    label: 'Selkirk',
    value: 'CA/ON/Haldimand-Norfolk/Selkirk',
  },
  {
    label: 'Simcoe',
    value: 'CA/ON/Haldimand-Norfolk/Simcoe',
  },
  {
    label: 'St Williams',
    value: 'CA/ON/Haldimand-Norfolk/St Williams',
  },
  {
    label: 'Teeterville',
    value: 'CA/ON/Haldimand-Norfolk/Teeterville',
  },
  {
    label: 'Townsend',
    value: 'CA/ON/Haldimand-Norfolk/Townsend',
  },
  {
    label: 'Turkey Point',
    value: 'CA/ON/Haldimand-Norfolk/Turkey Point',
  },
  {
    label: 'Vanessa',
    value: 'CA/ON/Haldimand-Norfolk/Vanessa',
  },
  {
    label: 'Vittoria',
    value: 'CA/ON/Haldimand-Norfolk/Vittoria',
  },
  {
    label: 'Walsingham',
    value: 'CA/ON/Haldimand-Norfolk/Walsingham',
  },
  {
    label: 'Waterford',
    value: 'CA/ON/Haldimand-Norfolk/Waterford',
  },
  {
    label: 'Wilsonville',
    value: 'CA/ON/Haldimand-Norfolk/Wilsonville',
  },
  {
    label: 'Windham Centre',
    value: 'CA/ON/Haldimand-Norfolk/Windham Centre',
  },
  {
    label: 'York',
    value: 'CA/ON/Haldimand-Norfolk/York',
  },
  {
    label: 'Algonquin Highlands',
    value: 'CA/ON/Haliburton/Algonquin Highlands',
  },
  {
    label: 'Cardiff',
    value: 'CA/ON/Haliburton/Cardiff',
  },
  {
    label: 'Carnarvon',
    value: 'CA/ON/Haliburton/Carnarvon',
  },
  {
    label: 'Eagle Lake',
    value: 'CA/ON/Haliburton/Eagle Lake',
  },
  {
    label: 'Fort Irwin',
    value: 'CA/ON/Haliburton/Fort Irwin',
  },
  {
    label: 'Gooderham',
    value: 'CA/ON/Haliburton/Gooderham',
  },
  {
    label: 'Haliburton',
    value: 'CA/ON/Haliburton/Haliburton',
  },
  {
    label: 'Harcourt',
    value: 'CA/ON/Haliburton/Harcourt',
  },
  {
    label: 'Highland Grove',
    value: 'CA/ON/Haliburton/Highland Grove',
  },
  {
    label: 'Irondale',
    value: 'CA/ON/Haliburton/Irondale',
  },
  {
    label: 'Lochlin',
    value: 'CA/ON/Haliburton/Lochlin',
  },
  {
    label: 'Minden',
    value: 'CA/ON/Haliburton/Minden',
  },
  {
    label: 'Oxtongue Lake',
    value: 'CA/ON/Haliburton/Oxtongue Lake',
  },
  {
    label: 'Tory Hill',
    value: 'CA/ON/Haliburton/Tory Hill',
  },
  {
    label: 'West Guilford',
    value: 'CA/ON/Haliburton/West Guilford',
  },
  {
    label: 'Wilberforce',
    value: 'CA/ON/Haliburton/Wilberforce',
  },
  {
    label: 'Acton',
    value: 'CA/ON/Halton/Acton',
  },
  {
    label: 'Ballinafad',
    value: 'CA/ON/Halton/Ballinafad',
  },
  {
    label: 'Burlington',
    value: 'CA/ON/Halton/Burlington',
  },
  {
    label: 'Campbellville',
    value: 'CA/ON/Halton/Campbellville',
  },
  {
    label: 'Georgetown',
    value: 'CA/ON/Halton/Georgetown',
  },
  {
    label: 'Glen Williams',
    value: 'CA/ON/Halton/Glen Williams',
  },
  {
    label: 'Halton Hills',
    value: 'CA/ON/Halton/Halton Hills',
  },
  {
    label: 'Hornby',
    value: 'CA/ON/Halton/Hornby',
  },
  {
    label: 'Kilbride',
    value: 'CA/ON/Halton/Kilbride',
  },
  {
    label: 'Limehouse',
    value: 'CA/ON/Halton/Limehouse',
  },
  {
    label: 'Milton',
    value: 'CA/ON/Halton/Milton',
  },
  {
    label: 'Moffat',
    value: 'CA/ON/Halton/Moffat',
  },
  {
    label: 'Norval',
    value: 'CA/ON/Halton/Norval',
  },
  {
    label: 'Oakville',
    value: 'CA/ON/Halton/Oakville',
  },
  {
    label: 'Alberton',
    value: 'CA/ON/Hamilton/Alberton',
  },
  {
    label: 'Ancaster',
    value: 'CA/ON/Hamilton/Ancaster',
  },
  {
    label: 'Binbrook',
    value: 'CA/ON/Hamilton/Binbrook',
  },
  {
    label: 'Carlisle',
    value: 'CA/ON/Hamilton/Carlisle',
  },
  {
    label: 'Copetown',
    value: 'CA/ON/Hamilton/Copetown',
  },
  {
    label: 'Dundas',
    value: 'CA/ON/Hamilton/Dundas',
  },
  {
    label: 'Flamborough',
    value: 'CA/ON/Hamilton/Flamborough',
  },
  {
    label: 'Freelton',
    value: 'CA/ON/Hamilton/Freelton',
  },
  {
    label: 'Glanbrook',
    value: 'CA/ON/Hamilton/Glanbrook',
  },
  {
    label: 'Hamilton',
    value: 'CA/ON/Hamilton/Hamilton',
  },
  {
    label: 'Hannon',
    value: 'CA/ON/Hamilton/Hannon',
  },
  {
    label: 'Jerseyville',
    value: 'CA/ON/Hamilton/Jerseyville',
  },
  {
    label: 'Lynden',
    value: 'CA/ON/Hamilton/Lynden',
  },
  {
    label: 'Millgrove',
    value: 'CA/ON/Hamilton/Millgrove',
  },
  {
    label: 'Mount Hope',
    value: 'CA/ON/Hamilton/Mount Hope',
  },
  {
    label: 'Rockton',
    value: 'CA/ON/Hamilton/Rockton',
  },
  {
    label: 'Sheffield',
    value: 'CA/ON/Hamilton/Sheffield',
  },
  {
    label: 'Stoney Creek',
    value: 'CA/ON/Hamilton/Stoney Creek',
  },
  {
    label: 'Troy',
    value: 'CA/ON/Hamilton/Troy',
  },
  {
    label: 'Waterdown',
    value: 'CA/ON/Hamilton/Waterdown',
  },
  {
    label: 'West Flamborough',
    value: 'CA/ON/Hamilton/West Flamborough',
  },
  {
    label: 'Astra',
    value: 'CA/ON/Hastings/Astra',
  },
  {
    label: 'Bancroft',
    value: 'CA/ON/Hastings/Bancroft',
  },
  {
    label: 'Batawa',
    value: 'CA/ON/Hastings/Batawa',
  },
  {
    label: 'Belleville',
    value: 'CA/ON/Hastings/Belleville',
  },
  {
    label: 'Boulter',
    value: 'CA/ON/Hastings/Boulter',
  },
  {
    label: 'Cannifton',
    value: 'CA/ON/Hastings/Cannifton',
  },
  {
    label: 'Coe Hill',
    value: 'CA/ON/Hastings/Coe Hill',
  },
  {
    label: 'Combermere',
    value: 'CA/ON/Hastings/Combermere',
  },
  {
    label: 'Corbyville',
    value: 'CA/ON/Hastings/Corbyville',
  },
  {
    label: 'Deseronto',
    value: 'CA/ON/Hastings/Deseronto',
  },
  {
    label: 'Eldorado',
    value: 'CA/ON/Hastings/Eldorado',
  },
  {
    label: 'Foxboro',
    value: 'CA/ON/Hastings/Foxboro',
  },
  {
    label: 'Frankford',
    value: 'CA/ON/Hastings/Frankford',
  },
  {
    label: 'Gilmour',
    value: 'CA/ON/Hastings/Gilmour',
  },
  {
    label: "L'amable",
    value: "CA/ON/Hastings/L'amable",
  },
  {
    label: 'Madoc',
    value: 'CA/ON/Hastings/Madoc',
  },
  {
    label: 'Maple Leaf',
    value: 'CA/ON/Hastings/Maple Leaf',
  },
  {
    label: 'Marlbank',
    value: 'CA/ON/Hastings/Marlbank',
  },
  {
    label: 'Marmora',
    value: 'CA/ON/Hastings/Marmora',
  },
  {
    label: 'Marysville',
    value: 'CA/ON/Hastings/Marysville',
  },
  {
    label: 'Maynooth',
    value: 'CA/ON/Hastings/Maynooth',
  },
  {
    label: 'Plainfield',
    value: 'CA/ON/Hastings/Plainfield',
  },
  {
    label: 'Roslin',
    value: 'CA/ON/Hastings/Roslin',
  },
  {
    label: 'Shannonville',
    value: 'CA/ON/Hastings/Shannonville',
  },
  {
    label: 'Springbrook',
    value: 'CA/ON/Hastings/Springbrook',
  },
  {
    label: 'Stirling',
    value: 'CA/ON/Hastings/Stirling',
  },
  {
    label: 'Thomasburg',
    value: 'CA/ON/Hastings/Thomasburg',
  },
  {
    label: 'Trenton',
    value: 'CA/ON/Hastings/Trenton',
  },
  {
    label: 'Tweed',
    value: 'CA/ON/Hastings/Tweed',
  },
  {
    label: 'Wooler',
    value: 'CA/ON/Hastings/Wooler',
  },
  {
    label: 'Auburn',
    value: 'CA/ON/Huron/Auburn',
  },
  {
    label: 'Bayfield',
    value: 'CA/ON/Huron/Bayfield',
  },
  {
    label: 'Belgrave',
    value: 'CA/ON/Huron/Belgrave',
  },
  {
    label: 'Benmiller',
    value: 'CA/ON/Huron/Benmiller',
  },
  {
    label: 'Bluevale',
    value: 'CA/ON/Huron/Bluevale',
  },
  {
    label: 'Blyth',
    value: 'CA/ON/Huron/Blyth',
  },
  {
    label: 'Brodhagen',
    value: 'CA/ON/Huron/Brodhagen',
  },
  {
    label: 'Brucefield',
    value: 'CA/ON/Huron/Brucefield',
  },
  {
    label: 'Brussels',
    value: 'CA/ON/Huron/Brussels',
  },
  {
    label: 'Centralia',
    value: 'CA/ON/Huron/Centralia',
  },
  {
    label: 'Clifford',
    value: 'CA/ON/Huron/Clifford',
  },
  {
    label: 'Clinton',
    value: 'CA/ON/Huron/Clinton',
  },
  {
    label: 'Crediton',
    value: 'CA/ON/Huron/Crediton',
  },
  {
    label: 'Dashwood',
    value: 'CA/ON/Huron/Dashwood',
  },
  {
    label: 'Dublin',
    value: 'CA/ON/Huron/Dublin',
  },
  {
    label: 'Dungannon',
    value: 'CA/ON/Huron/Dungannon',
  },
  {
    label: 'Egmondville',
    value: 'CA/ON/Huron/Egmondville',
  },
  {
    label: 'Ethel',
    value: 'CA/ON/Huron/Ethel',
  },
  {
    label: 'Exeter',
    value: 'CA/ON/Huron/Exeter',
  },
  {
    label: 'Fordwich',
    value: 'CA/ON/Huron/Fordwich',
  },
  {
    label: 'Goderich',
    value: 'CA/ON/Huron/Goderich',
  },
  {
    label: 'Gorrie',
    value: 'CA/ON/Huron/Gorrie',
  },
  {
    label: 'Hay',
    value: 'CA/ON/Huron/Hay',
  },
  {
    label: 'Hensall',
    value: 'CA/ON/Huron/Hensall',
  },
  {
    label: 'Huron Park',
    value: 'CA/ON/Huron/Huron Park',
  },
  {
    label: 'Kippen',
    value: 'CA/ON/Huron/Kippen',
  },
  {
    label: 'Kirkton',
    value: 'CA/ON/Huron/Kirkton',
  },
  {
    label: 'Londesborough',
    value: 'CA/ON/Huron/Londesborough',
  },
  {
    label: 'Lucknow',
    value: 'CA/ON/Huron/Lucknow',
  },
  {
    label: 'Seaforth',
    value: 'CA/ON/Huron/Seaforth',
  },
  {
    label: 'St Joseph',
    value: 'CA/ON/Huron/St Joseph',
  },
  {
    label: 'Varna',
    value: 'CA/ON/Huron/Varna',
  },
  {
    label: 'Walton',
    value: 'CA/ON/Huron/Walton',
  },
  {
    label: 'Wingham',
    value: 'CA/ON/Huron/Wingham',
  },
  {
    label: 'Woodham',
    value: 'CA/ON/Huron/Woodham',
  },
  {
    label: 'Wroxeter',
    value: 'CA/ON/Huron/Wroxeter',
  },
  {
    label: 'Zurich',
    value: 'CA/ON/Huron/Zurich',
  },
  {
    label: 'Dunsford',
    value: 'CA/ON/Kawartha/Dunsford',
  },
  {
    label: 'Rosedale',
    value: 'CA/ON/Kawartha/Rosedale',
  },
  {
    label: 'Bethany',
    value: 'CA/ON/Kawartha Lakes/Bethany',
  },
  {
    label: 'Bobcaygeon',
    value: 'CA/ON/Kawartha Lakes/Bobcaygeon',
  },
  {
    label: 'Bolsover',
    value: 'CA/ON/Kawartha Lakes/Bolsover',
  },
  {
    label: 'Burnt River',
    value: 'CA/ON/Kawartha Lakes/Burnt River',
  },
  {
    label: 'Cambray',
    value: 'CA/ON/Kawartha Lakes/Cambray',
  },
  {
    label: 'Cameron',
    value: 'CA/ON/Kawartha Lakes/Cameron',
  },
  {
    label: 'Coboconk',
    value: 'CA/ON/Kawartha Lakes/Coboconk',
  },
  {
    label: 'Fenelon Falls',
    value: 'CA/ON/Kawartha Lakes/Fenelon Falls',
  },
  {
    label: 'Janetville',
    value: 'CA/ON/Kawartha Lakes/Janetville',
  },
  {
    label: 'Kinmount',
    value: 'CA/ON/Kawartha Lakes/Kinmount',
  },
  {
    label: 'Kirkfield',
    value: 'CA/ON/Kawartha Lakes/Kirkfield',
  },
  {
    label: 'Lindsay',
    value: 'CA/ON/Kawartha Lakes/Lindsay',
  },
  {
    label: 'Little Britain',
    value: 'CA/ON/Kawartha Lakes/Little Britain',
  },
  {
    label: 'Manilla',
    value: 'CA/ON/Kawartha Lakes/Manilla',
  },
  {
    label: 'Norland',
    value: 'CA/ON/Kawartha Lakes/Norland',
  },
  {
    label: 'Oakwood',
    value: 'CA/ON/Kawartha Lakes/Oakwood',
  },
  {
    label: 'Omemee',
    value: 'CA/ON/Kawartha Lakes/Omemee',
  },
  {
    label: 'Pontypool',
    value: 'CA/ON/Kawartha Lakes/Pontypool',
  },
  {
    label: 'Reaboro',
    value: 'CA/ON/Kawartha Lakes/Reaboro',
  },
  {
    label: 'Sebright',
    value: 'CA/ON/Kawartha Lakes/Sebright',
  },
  {
    label: 'Woodville',
    value: 'CA/ON/Kawartha Lakes/Woodville',
  },
  {
    label: 'Angling Lake First Nation',
    value: 'CA/ON/Kenora/Angling Lake First Nation',
  },
  {
    label: 'Attawapiskat First Nation',
    value: 'CA/ON/Kenora/Attawapiskat First Nation',
  },
  {
    label: 'Balmertown',
    value: 'CA/ON/Kenora/Balmertown',
  },
  {
    label: 'Bearskin Lake First Nation',
    value: 'CA/ON/Kenora/Bearskin Lake First Nation',
  },
  {
    label: 'Big Trout Lake First Nation',
    value: 'CA/ON/Kenora/Big Trout Lake First Nation',
  },
  {
    label: 'Cat Lake First Nation',
    value: 'CA/ON/Kenora/Cat Lake First Nation',
  },
  {
    label: 'Clearwater Bay',
    value: 'CA/ON/Kenora/Clearwater Bay',
  },
  {
    label: 'Cochenour',
    value: 'CA/ON/Kenora/Cochenour',
  },
  {
    label: 'Dalles First Nation',
    value: 'CA/ON/Kenora/Dalles First Nation',
  },
  {
    label: 'Deer Lake First Nation',
    value: 'CA/ON/Kenora/Deer Lake First Nation',
  },
  {
    label: 'Dinorwic',
    value: 'CA/ON/Kenora/Dinorwic',
  },
  {
    label: 'Dryden',
    value: 'CA/ON/Kenora/Dryden',
  },
  {
    label: 'Eagle Lake First Nation',
    value: 'CA/ON/Kenora/Eagle Lake First Nation',
  },
  {
    label: 'Eagle River',
    value: 'CA/ON/Kenora/Eagle River',
  },
  {
    label: 'Ear Falls',
    value: 'CA/ON/Kenora/Ear Falls',
  },
  {
    label: 'Fort Hope First Nation (Eabametoong)',
    value: 'CA/ON/Kenora/Fort Hope First Nation (Eabametoong)',
  },
  {
    label: 'Fort Severn First Nation',
    value: 'CA/ON/Kenora/Fort Severn First Nation',
  },
  {
    label: 'Grassy Narrows First Nation',
    value: 'CA/ON/Kenora/Grassy Narrows First Nation',
  },
  {
    label: 'Hudson',
    value: 'CA/ON/Kenora/Hudson',
  },
  {
    label: 'Ignace',
    value: 'CA/ON/Kenora/Ignace',
  },
  {
    label: 'Ingolf',
    value: 'CA/ON/Kenora/Ingolf',
  },
  {
    label: 'Kasabonika First Nation',
    value: 'CA/ON/Kenora/Kasabonika First Nation',
  },
  {
    label: 'Keewatin',
    value: 'CA/ON/Kenora/Keewatin',
  },
  {
    label: 'Keewaywin First Nation',
    value: 'CA/ON/Kenora/Keewaywin First Nation',
  },
  {
    label: 'Kejick First Nation',
    value: 'CA/ON/Kenora/Kejick First Nation',
  },
  {
    label: 'Kenora',
    value: 'CA/ON/Kenora/Kenora',
  },
  {
    label: 'Kingfisher Lake First Nation',
    value: 'CA/ON/Kenora/Kingfisher Lake First Nation',
  },
  {
    label: 'Lac Seul First Nation',
    value: 'CA/ON/Kenora/Lac Seul First Nation',
  },
  {
    label: 'Lansdowne House First Nation',
    value: 'CA/ON/Kenora/Lansdowne House First Nation',
  },
  {
    label: 'Longbow Lake',
    value: 'CA/ON/Kenora/Longbow Lake',
  },
  {
    label: 'Madsen',
    value: 'CA/ON/Kenora/Madsen',
  },
  {
    label: 'Mckenzie Island',
    value: 'CA/ON/Kenora/Mckenzie Island',
  },
  {
    label: 'Minaki',
    value: 'CA/ON/Kenora/Minaki',
  },
  {
    label: 'Minnitaki',
    value: 'CA/ON/Kenora/Minnitaki',
  },
  {
    label: 'Muskrat Dam First Nation',
    value: 'CA/ON/Kenora/Muskrat Dam First Nation',
  },
  {
    label: 'Nestor Falls',
    value: 'CA/ON/Kenora/Nestor Falls',
  },
  {
    label: 'North Caribou Lake First Nation',
    value: 'CA/ON/Kenora/North Caribou Lake First Nation',
  },
  {
    label: 'North Spirit Lake First Nation',
    value: 'CA/ON/Kenora/North Spirit Lake First Nation',
  },
  {
    label: 'Osnaburgh House',
    value: 'CA/ON/Kenora/Osnaburgh House',
  },
  {
    label: 'Oxdrift',
    value: 'CA/ON/Kenora/Oxdrift',
  },
  {
    label: 'Pawitik',
    value: 'CA/ON/Kenora/Pawitik',
  },
  {
    label: 'Peawanuck',
    value: 'CA/ON/Kenora/Peawanuck',
  },
  {
    label: 'Perrault Falls',
    value: 'CA/ON/Kenora/Perrault Falls',
  },
  {
    label: 'Pickle Lake',
    value: 'CA/ON/Kenora/Pickle Lake',
  },
  {
    label: 'Pikangikum First Nation',
    value: 'CA/ON/Kenora/Pikangikum First Nation',
  },
  {
    label: 'Poplar Hill First Nation',
    value: 'CA/ON/Kenora/Poplar Hill First Nation',
  },
  {
    label: 'Red Lake',
    value: 'CA/ON/Kenora/Red Lake',
  },
  {
    label: 'Redditt',
    value: 'CA/ON/Kenora/Redditt',
  },
  {
    label: 'Sachigo Lake First Nation',
    value: 'CA/ON/Kenora/Sachigo Lake First Nation',
  },
  {
    label: 'Sandy Lake First Nation',
    value: 'CA/ON/Kenora/Sandy Lake First Nation',
  },
  {
    label: 'Sioux Lookout',
    value: 'CA/ON/Kenora/Sioux Lookout',
  },
  {
    label: 'Sioux Narrows',
    value: 'CA/ON/Kenora/Sioux Narrows',
  },
  {
    label: 'Slate Falls First Nation',
    value: 'CA/ON/Kenora/Slate Falls First Nation',
  },
  {
    label: 'Summer Beaver First Nation',
    value: 'CA/ON/Kenora/Summer Beaver First Nation',
  },
  {
    label: 'Vermilion Bay',
    value: 'CA/ON/Kenora/Vermilion Bay',
  },
  {
    label: 'Wabigoon',
    value: 'CA/ON/Kenora/Wabigoon',
  },
  {
    label: 'Waldhof',
    value: 'CA/ON/Kenora/Waldhof',
  },
  {
    label: 'Weagamow Lake  First Nation',
    value: 'CA/ON/Kenora/Weagamow Lake  First Nation',
  },
  {
    label: 'Webequie First Nation',
    value: 'CA/ON/Kenora/Webequie First Nation',
  },
  {
    label: 'Whitedog First Nation (Wabaseemoong)',
    value: 'CA/ON/Kenora/Whitedog First Nation (Wabaseemoong)',
  },
  {
    label: 'Wunnumin Lake First Nation',
    value: 'CA/ON/Kenora/Wunnumin Lake First Nation',
  },
  {
    label: 'Alvinston',
    value: 'CA/ON/Lambton/Alvinston',
  },
  {
    label: 'Arkona',
    value: 'CA/ON/Lambton/Arkona',
  },
  {
    label: 'Brigden',
    value: 'CA/ON/Lambton/Brigden',
  },
  {
    label: "Bright's Grove",
    value: "CA/ON/Lambton/Bright's Grove",
  },
  {
    label: 'Camlachie',
    value: 'CA/ON/Lambton/Camlachie',
  },
  {
    label: 'Corunna',
    value: 'CA/ON/Lambton/Corunna',
  },
  {
    label: 'Courtright',
    value: 'CA/ON/Lambton/Courtright',
  },
  {
    label: 'Croton',
    value: 'CA/ON/Lambton/Croton',
  },
  {
    label: 'Florence',
    value: 'CA/ON/Lambton/Florence',
  },
  {
    label: 'Forest',
    value: 'CA/ON/Lambton/Forest',
  },
  {
    label: 'Grand Bend',
    value: 'CA/ON/Lambton/Grand Bend',
  },
  {
    label: 'Inwood',
    value: 'CA/ON/Lambton/Inwood',
  },
  {
    label: 'Kettle And Stony Point',
    value: 'CA/ON/Lambton/Kettle And Stony Point',
  },
  {
    label: 'Lambton Shores',
    value: 'CA/ON/Lambton/Lambton Shores',
  },
  {
    label: 'Mooretown',
    value: 'CA/ON/Lambton/Mooretown',
  },
  {
    label: 'Oil City',
    value: 'CA/ON/Lambton/Oil City',
  },
  {
    label: 'Oil Springs',
    value: 'CA/ON/Lambton/Oil Springs',
  },
  {
    label: 'Petrolia',
    value: 'CA/ON/Lambton/Petrolia',
  },
  {
    label: 'Point Edward',
    value: 'CA/ON/Lambton/Point Edward',
  },
  {
    label: 'Port Franks',
    value: 'CA/ON/Lambton/Port Franks',
  },
  {
    label: 'Port Lambton',
    value: 'CA/ON/Lambton/Port Lambton',
  },
  {
    label: 'Sarnia',
    value: 'CA/ON/Lambton/Sarnia',
  },
  {
    label: 'Sombra',
    value: 'CA/ON/Lambton/Sombra',
  },
  {
    label: 'Thedford',
    value: 'CA/ON/Lambton/Thedford',
  },
  {
    label: 'Town Of Plympton Wyoming',
    value: 'CA/ON/Lambton/Town Of Plympton Wyoming',
  },
  {
    label: 'Warwick Township',
    value: 'CA/ON/Lambton/Warwick Township',
  },
  {
    label: 'Watford',
    value: 'CA/ON/Lambton/Watford',
  },
  {
    label: 'Wilkesport',
    value: 'CA/ON/Lambton/Wilkesport',
  },
  {
    label: 'Wyoming',
    value: 'CA/ON/Lambton/Wyoming',
  },
  {
    label: 'Almonte',
    value: 'CA/ON/Lanark/Almonte',
  },
  {
    label: 'Balderson',
    value: 'CA/ON/Lanark/Balderson',
  },
  {
    label: 'Carleton Place',
    value: 'CA/ON/Lanark/Carleton Place',
  },
  {
    label: 'Clarendon Station',
    value: 'CA/ON/Lanark/Clarendon Station',
  },
  {
    label: 'Clayton',
    value: 'CA/ON/Lanark/Clayton',
  },
  {
    label: 'Lanark',
    value: 'CA/ON/Lanark/Lanark',
  },
  {
    label: 'Maberly',
    value: 'CA/ON/Lanark/Maberly',
  },
  {
    label: 'Mcdonalds Corners',
    value: 'CA/ON/Lanark/Mcdonalds Corners',
  },
  {
    label: 'Mississippi Station',
    value: 'CA/ON/Lanark/Mississippi Station',
  },
  {
    label: 'Pakenham',
    value: 'CA/ON/Lanark/Pakenham',
  },
  {
    label: 'Perth',
    value: 'CA/ON/Lanark/Perth',
  },
  {
    label: 'Rideau Ferry',
    value: 'CA/ON/Lanark/Rideau Ferry',
  },
  {
    label: 'Smiths Falls',
    value: 'CA/ON/Lanark/Smiths Falls',
  },
  {
    label: 'White Lake',
    value: 'CA/ON/Lanark/White Lake',
  },
  {
    label: 'Addison',
    value: 'CA/ON/Leeds And Grenville/Addison',
  },
  {
    label: 'Athens',
    value: 'CA/ON/Leeds And Grenville/Athens',
  },
  {
    label: 'Augusta',
    value: 'CA/ON/Leeds And Grenville/Augusta',
  },
  {
    label: 'Brockville',
    value: 'CA/ON/Leeds And Grenville/Brockville',
  },
  {
    label: 'Cardinal',
    value: 'CA/ON/Leeds And Grenville/Cardinal',
  },
  {
    label: 'Delta',
    value: 'CA/ON/Leeds And Grenville/Delta',
  },
  {
    label: 'Elgin',
    value: 'CA/ON/Leeds And Grenville/Elgin',
  },
  {
    label: 'Elizabethtown',
    value: 'CA/ON/Leeds And Grenville/Elizabethtown',
  },
  {
    label: 'Frankville',
    value: 'CA/ON/Leeds And Grenville/Frankville',
  },
  {
    label: 'Gananoque',
    value: 'CA/ON/Leeds And Grenville/Gananoque',
  },
  {
    label: 'Jasper',
    value: 'CA/ON/Leeds And Grenville/Jasper',
  },
  {
    label: 'Johnstown',
    value: 'CA/ON/Leeds And Grenville/Johnstown',
  },
  {
    label: 'Kemptville',
    value: 'CA/ON/Leeds And Grenville/Kemptville',
  },
  {
    label: 'Lansdowne',
    value: 'CA/ON/Leeds And Grenville/Lansdowne',
  },
  {
    label: 'Lombardy',
    value: 'CA/ON/Leeds And Grenville/Lombardy',
  },
  {
    label: 'Lyn',
    value: 'CA/ON/Leeds And Grenville/Lyn',
  },
  {
    label: 'Lyndhurst',
    value: 'CA/ON/Leeds And Grenville/Lyndhurst',
  },
  {
    label: 'Maitland',
    value: 'CA/ON/Leeds And Grenville/Maitland',
  },
  {
    label: 'Mallorytown',
    value: 'CA/ON/Leeds And Grenville/Mallorytown',
  },
  {
    label: 'Merrickville',
    value: 'CA/ON/Leeds And Grenville/Merrickville',
  },
  {
    label: 'Newboro',
    value: 'CA/ON/Leeds And Grenville/Newboro',
  },
  {
    label: 'North Augusta',
    value: 'CA/ON/Leeds And Grenville/North Augusta',
  },
  {
    label: 'Oxford Mills',
    value: 'CA/ON/Leeds And Grenville/Oxford Mills',
  },
  {
    label: 'Oxford Station',
    value: 'CA/ON/Leeds And Grenville/Oxford Station',
  },
  {
    label: 'Portland',
    value: 'CA/ON/Leeds And Grenville/Portland',
  },
  {
    label: 'Prescott',
    value: 'CA/ON/Leeds And Grenville/Prescott',
  },
  {
    label: 'Rockport',
    value: 'CA/ON/Leeds And Grenville/Rockport',
  },
  {
    label: 'Seeleys Bay',
    value: 'CA/ON/Leeds And Grenville/Seeleys Bay',
  },
  {
    label: 'Smiths Falls',
    value: 'CA/ON/Leeds And Grenville/Smiths Falls',
  },
  {
    label: 'Spencerville',
    value: 'CA/ON/Leeds And Grenville/Spencerville',
  },
  {
    label: 'Toledo',
    value: 'CA/ON/Leeds And Grenville/Toledo',
  },
  {
    label: 'Westport',
    value: 'CA/ON/Leeds And Grenville/Westport',
  },
  {
    label: 'Amherstview',
    value: 'CA/ON/Lennox And Addington/Amherstview',
  },
  {
    label: 'Bath',
    value: 'CA/ON/Lennox And Addington/Bath',
  },
  {
    label: 'Camden East',
    value: 'CA/ON/Lennox And Addington/Camden East',
  },
  {
    label: 'Centreville',
    value: 'CA/ON/Lennox And Addington/Centreville',
  },
  {
    label: 'Cloyne',
    value: 'CA/ON/Lennox And Addington/Cloyne',
  },
  {
    label: 'Denbigh',
    value: 'CA/ON/Lennox And Addington/Denbigh',
  },
  {
    label: 'Enterprise',
    value: 'CA/ON/Lennox And Addington/Enterprise',
  },
  {
    label: 'Erinsville',
    value: 'CA/ON/Lennox And Addington/Erinsville',
  },
  {
    label: 'Flinton',
    value: 'CA/ON/Lennox And Addington/Flinton',
  },
  {
    label: 'Kaladar',
    value: 'CA/ON/Lennox And Addington/Kaladar',
  },
  {
    label: 'Kingston',
    value: 'CA/ON/Lennox And Addington/Kingston',
  },
  {
    label: 'Mcarthurs Mills',
    value: 'CA/ON/Lennox And Addington/Mcarthurs Mills',
  },
  {
    label: 'Napanee',
    value: 'CA/ON/Lennox And Addington/Napanee',
  },
  {
    label: 'Newburgh',
    value: 'CA/ON/Lennox And Addington/Newburgh',
  },
  {
    label: 'Northbrook',
    value: 'CA/ON/Lennox And Addington/Northbrook',
  },
  {
    label: 'Odessa',
    value: 'CA/ON/Lennox And Addington/Odessa',
  },
  {
    label: 'Plevna',
    value: 'CA/ON/Lennox And Addington/Plevna',
  },
  {
    label: 'Roblin',
    value: 'CA/ON/Lennox And Addington/Roblin',
  },
  {
    label: 'Selby',
    value: 'CA/ON/Lennox And Addington/Selby',
  },
  {
    label: 'Stella',
    value: 'CA/ON/Lennox And Addington/Stella',
  },
  {
    label: 'Tamworth',
    value: 'CA/ON/Lennox And Addington/Tamworth',
  },
  {
    label: 'Yarker',
    value: 'CA/ON/Lennox And Addington/Yarker',
  },
  {
    label: 'Birch Island',
    value: 'CA/ON/Manitoulin/Birch Island',
  },
  {
    label: 'Cockburn Island',
    value: 'CA/ON/Manitoulin/Cockburn Island',
  },
  {
    label: 'Evansville',
    value: 'CA/ON/Manitoulin/Evansville',
  },
  {
    label: 'Gordon/Barrie Island',
    value: 'CA/ON/Manitoulin/Gordon/Barrie Island',
  },
  {
    label: 'Gore Bay',
    value: 'CA/ON/Manitoulin/Gore Bay',
  },
  {
    label: 'Kagawong',
    value: 'CA/ON/Manitoulin/Kagawong',
  },
  {
    label: 'Little Current',
    value: 'CA/ON/Manitoulin/Little Current',
  },
  {
    label: 'Manitowaning',
    value: 'CA/ON/Manitoulin/Manitowaning',
  },
  {
    label: 'Mchigeeng First Nation',
    value: 'CA/ON/Manitoulin/Mchigeeng First Nation',
  },
  {
    label: 'Meldrum Bay',
    value: 'CA/ON/Manitoulin/Meldrum Bay',
  },
  {
    label: 'Mindemoya',
    value: 'CA/ON/Manitoulin/Mindemoya',
  },
  {
    label: 'Providence Bay',
    value: 'CA/ON/Manitoulin/Providence Bay',
  },
  {
    label: 'Sheguiandah First Nation',
    value: 'CA/ON/Manitoulin/Sheguiandah First Nation',
  },
  {
    label: 'Sheshegwaning First Nation',
    value: 'CA/ON/Manitoulin/Sheshegwaning First Nation',
  },
  {
    label: 'Silver Water',
    value: 'CA/ON/Manitoulin/Silver Water',
  },
  {
    label: 'South Baymouth',
    value: 'CA/ON/Manitoulin/South Baymouth',
  },
  {
    label: 'Spring Bay',
    value: 'CA/ON/Manitoulin/Spring Bay',
  },
  {
    label: 'Tehkummah',
    value: 'CA/ON/Manitoulin/Tehkummah',
  },
  {
    label: 'Wikwemikong First Nation',
    value: 'CA/ON/Manitoulin/Wikwemikong First Nation',
  },
  {
    label: 'Ailsa Craig',
    value: 'CA/ON/Middlesex/Ailsa Craig',
  },
  {
    label: 'Appin',
    value: 'CA/ON/Middlesex/Appin',
  },
  {
    label: 'Arva',
    value: 'CA/ON/Middlesex/Arva',
  },
  {
    label: 'Carlisle',
    value: 'CA/ON/Middlesex/Carlisle',
  },
  {
    label: 'Delaware',
    value: 'CA/ON/Middlesex/Delaware',
  },
  {
    label: 'Denfield',
    value: 'CA/ON/Middlesex/Denfield',
  },
  {
    label: 'Dorchester',
    value: 'CA/ON/Middlesex/Dorchester',
  },
  {
    label: 'Glencoe',
    value: 'CA/ON/Middlesex/Glencoe',
  },
  {
    label: 'Granton',
    value: 'CA/ON/Middlesex/Granton',
  },
  {
    label: 'Harrietsville',
    value: 'CA/ON/Middlesex/Harrietsville',
  },
  {
    label: 'Ilderton',
    value: 'CA/ON/Middlesex/Ilderton',
  },
  {
    label: 'Kerwood',
    value: 'CA/ON/Middlesex/Kerwood',
  },
  {
    label: 'Komoka',
    value: 'CA/ON/Middlesex/Komoka',
  },
  {
    label: 'London',
    value: 'CA/ON/Middlesex/London',
  },
  {
    label: 'Lucan',
    value: 'CA/ON/Middlesex/Lucan',
  },
  {
    label: 'Melbourne',
    value: 'CA/ON/Middlesex/Melbourne',
  },
  {
    label: 'Mossley',
    value: 'CA/ON/Middlesex/Mossley',
  },
  {
    label: 'Mount Brydges',
    value: 'CA/ON/Middlesex/Mount Brydges',
  },
  {
    label: 'Muncey',
    value: 'CA/ON/Middlesex/Muncey',
  },
  {
    label: 'Newbury',
    value: 'CA/ON/Middlesex/Newbury',
  },
  {
    label: 'Parkhill',
    value: 'CA/ON/Middlesex/Parkhill',
  },
  {
    label: 'Putnam',
    value: 'CA/ON/Middlesex/Putnam',
  },
  {
    label: 'Sharon',
    value: 'CA/ON/Middlesex/Sharon',
  },
  {
    label: 'Southwold',
    value: 'CA/ON/Middlesex/Southwold',
  },
  {
    label: 'Strathroy',
    value: 'CA/ON/Middlesex/Strathroy',
  },
  {
    label: 'Thorndale',
    value: 'CA/ON/Middlesex/Thorndale',
  },
  {
    label: 'Wardsville',
    value: 'CA/ON/Middlesex/Wardsville',
  },
  {
    label: 'Bala',
    value: 'CA/ON/Muskoka/Bala',
  },
  {
    label: 'Baysville',
    value: 'CA/ON/Muskoka/Baysville',
  },
  {
    label: 'Beaumaris',
    value: 'CA/ON/Muskoka/Beaumaris',
  },
  {
    label: 'Bracebridge',
    value: 'CA/ON/Muskoka/Bracebridge',
  },
  {
    label: 'Dorset',
    value: 'CA/ON/Muskoka/Dorset',
  },
  {
    label: 'Dwight',
    value: 'CA/ON/Muskoka/Dwight',
  },
  {
    label: 'Gravenhurst',
    value: 'CA/ON/Muskoka/Gravenhurst',
  },
  {
    label: 'Honey Harbour',
    value: 'CA/ON/Muskoka/Honey Harbour',
  },
  {
    label: 'Huntsville',
    value: 'CA/ON/Muskoka/Huntsville',
  },
  {
    label: 'Kilworthy',
    value: 'CA/ON/Muskoka/Kilworthy',
  },
  {
    label: 'Mactier',
    value: 'CA/ON/Muskoka/Mactier',
  },
  {
    label: 'Milford Bay',
    value: 'CA/ON/Muskoka/Milford Bay',
  },
  {
    label: 'Minett',
    value: 'CA/ON/Muskoka/Minett',
  },
  {
    label: 'Novar',
    value: 'CA/ON/Muskoka/Novar',
  },
  {
    label: 'Port Carling',
    value: 'CA/ON/Muskoka/Port Carling',
  },
  {
    label: 'Port Sandfield',
    value: 'CA/ON/Muskoka/Port Sandfield',
  },
  {
    label: 'Port Severn',
    value: 'CA/ON/Muskoka/Port Severn',
  },
  {
    label: 'Port Sydney',
    value: 'CA/ON/Muskoka/Port Sydney',
  },
  {
    label: 'Rosseau',
    value: 'CA/ON/Muskoka/Rosseau',
  },
  {
    label: 'Torrance',
    value: 'CA/ON/Muskoka/Torrance',
  },
  {
    label: 'Utterson',
    value: 'CA/ON/Muskoka/Utterson',
  },
  {
    label: 'Windermere',
    value: 'CA/ON/Muskoka/Windermere',
  },
  {
    label: 'Allanburg',
    value: 'CA/ON/Niagara/Allanburg',
  },
  {
    label: 'Beamsville',
    value: 'CA/ON/Niagara/Beamsville',
  },
  {
    label: 'Caistor Centre',
    value: 'CA/ON/Niagara/Caistor Centre',
  },
  {
    label: 'Campden',
    value: 'CA/ON/Niagara/Campden',
  },
  {
    label: 'Crystal Beach',
    value: 'CA/ON/Niagara/Crystal Beach',
  },
  {
    label: 'Fenwick',
    value: 'CA/ON/Niagara/Fenwick',
  },
  {
    label: 'Fonthill',
    value: 'CA/ON/Niagara/Fonthill',
  },
  {
    label: 'Fort Erie',
    value: 'CA/ON/Niagara/Fort Erie',
  },
  {
    label: 'Grassie',
    value: 'CA/ON/Niagara/Grassie',
  },
  {
    label: 'Grimsby',
    value: 'CA/ON/Niagara/Grimsby',
  },
  {
    label: 'Jordan Station',
    value: 'CA/ON/Niagara/Jordan Station',
  },
  {
    label: 'Lincoln',
    value: 'CA/ON/Niagara/Lincoln',
  },
  {
    label: 'Niagara Falls',
    value: 'CA/ON/Niagara/Niagara Falls',
  },
  {
    label: 'Niagara On The Lake',
    value: 'CA/ON/Niagara/Niagara On The Lake',
  },
  {
    label: 'Pelham',
    value: 'CA/ON/Niagara/Pelham',
  },
  {
    label: 'Port Colborne',
    value: 'CA/ON/Niagara/Port Colborne',
  },
  {
    label: 'Port Robinson',
    value: 'CA/ON/Niagara/Port Robinson',
  },
  {
    label: 'Queenston',
    value: 'CA/ON/Niagara/Queenston',
  },
  {
    label: 'Ridgeville',
    value: 'CA/ON/Niagara/Ridgeville',
  },
  {
    label: 'Ridgeway',
    value: 'CA/ON/Niagara/Ridgeway',
  },
  {
    label: 'Sherkston',
    value: 'CA/ON/Niagara/Sherkston',
  },
  {
    label: 'Smithville',
    value: 'CA/ON/Niagara/Smithville',
  },
  {
    label: 'St Anns',
    value: 'CA/ON/Niagara/St Anns',
  },
  {
    label: 'St Catharines',
    value: 'CA/ON/Niagara/St Catharines',
  },
  {
    label: 'St Davids',
    value: 'CA/ON/Niagara/St Davids',
  },
  {
    label: 'Stevensville',
    value: 'CA/ON/Niagara/Stevensville',
  },
  {
    label: 'Thorold',
    value: 'CA/ON/Niagara/Thorold',
  },
  {
    label: 'Vineland',
    value: 'CA/ON/Niagara/Vineland',
  },
  {
    label: 'Virgil',
    value: 'CA/ON/Niagara/Virgil',
  },
  {
    label: 'Wainfleet',
    value: 'CA/ON/Niagara/Wainfleet',
  },
  {
    label: 'Welland',
    value: 'CA/ON/Niagara/Welland',
  },
  {
    label: 'Wellandport',
    value: 'CA/ON/Niagara/Wellandport',
  },
  {
    label: 'West Lincoln',
    value: 'CA/ON/Niagara/West Lincoln',
  },
  {
    label: 'Astorville',
    value: 'CA/ON/Nipissing/Astorville',
  },
  {
    label: 'Balsam Creek',
    value: 'CA/ON/Nipissing/Balsam Creek',
  },
  {
    label: 'Bear Island First Nation',
    value: 'CA/ON/Nipissing/Bear Island First Nation',
  },
  {
    label: 'Bissett Creek',
    value: 'CA/ON/Nipissing/Bissett Creek',
  },
  {
    label: 'Bonfield',
    value: 'CA/ON/Nipissing/Bonfield',
  },
  {
    label: 'Cache Bay',
    value: 'CA/ON/Nipissing/Cache Bay',
  },
  {
    label: 'Calvin',
    value: 'CA/ON/Nipissing/Calvin',
  },
  {
    label: 'Corbeil',
    value: 'CA/ON/Nipissing/Corbeil',
  },
  {
    label: 'Crystal Falls',
    value: 'CA/ON/Nipissing/Crystal Falls',
  },
  {
    label: 'Eldee',
    value: 'CA/ON/Nipissing/Eldee',
  },
  {
    label: 'Field',
    value: 'CA/ON/Nipissing/Field',
  },
  {
    label: 'Garden Village',
    value: 'CA/ON/Nipissing/Garden Village',
  },
  {
    label: 'Hornell Heights',
    value: 'CA/ON/Nipissing/Hornell Heights',
  },
  {
    label: 'Lake St Peter',
    value: 'CA/ON/Nipissing/Lake St Peter',
  },
  {
    label: 'Lavigne',
    value: 'CA/ON/Nipissing/Lavigne',
  },
  {
    label: 'Madawaska',
    value: 'CA/ON/Nipissing/Madawaska',
  },
  {
    label: 'Marten River',
    value: 'CA/ON/Nipissing/Marten River',
  },
  {
    label: 'Mattawa',
    value: 'CA/ON/Nipissing/Mattawa',
  },
  {
    label: 'Mattawan',
    value: 'CA/ON/Nipissing/Mattawan',
  },
  {
    label: 'Monetville',
    value: 'CA/ON/Nipissing/Monetville',
  },
  {
    label: 'North Bay',
    value: 'CA/ON/Nipissing/North Bay',
  },
  {
    label: 'Papineau-Cameron',
    value: 'CA/ON/Nipissing/Papineau-Cameron',
  },
  {
    label: 'Redbridge',
    value: 'CA/ON/Nipissing/Redbridge',
  },
  {
    label: 'River Valley',
    value: 'CA/ON/Nipissing/River Valley',
  },
  {
    label: 'Rutherglen',
    value: 'CA/ON/Nipissing/Rutherglen',
  },
  {
    label: 'Songis',
    value: 'CA/ON/Nipissing/Songis',
  },
  {
    label: 'Sturgeon Falls',
    value: 'CA/ON/Nipissing/Sturgeon Falls',
  },
  {
    label: 'Temagami',
    value: 'CA/ON/Nipissing/Temagami',
  },
  {
    label: 'Thorne',
    value: 'CA/ON/Nipissing/Thorne',
  },
  {
    label: 'Tilden Lake',
    value: 'CA/ON/Nipissing/Tilden Lake',
  },
  {
    label: 'Verner',
    value: 'CA/ON/Nipissing/Verner',
  },
  {
    label: 'Whitney',
    value: 'CA/ON/Nipissing/Whitney',
  },
  {
    label: 'Baltimore',
    value: 'CA/ON/Northumberland/Baltimore',
  },
  {
    label: 'Bewdley',
    value: 'CA/ON/Northumberland/Bewdley',
  },
  {
    label: 'Brighton',
    value: 'CA/ON/Northumberland/Brighton',
  },
  {
    label: 'Campbellcroft',
    value: 'CA/ON/Northumberland/Campbellcroft',
  },
  {
    label: 'Campbellford',
    value: 'CA/ON/Northumberland/Campbellford',
  },
  {
    label: 'Castleton',
    value: 'CA/ON/Northumberland/Castleton',
  },
  {
    label: 'Cobourg',
    value: 'CA/ON/Northumberland/Cobourg',
  },
  {
    label: 'Codrington',
    value: 'CA/ON/Northumberland/Codrington',
  },
  {
    label: 'Colborne',
    value: 'CA/ON/Northumberland/Colborne',
  },
  {
    label: 'Gores Landing',
    value: 'CA/ON/Northumberland/Gores Landing',
  },
  {
    label: 'Grafton',
    value: 'CA/ON/Northumberland/Grafton',
  },
  {
    label: 'Harwood',
    value: 'CA/ON/Northumberland/Harwood',
  },
  {
    label: 'Hastings',
    value: 'CA/ON/Northumberland/Hastings',
  },
  {
    label: 'Port Hope',
    value: 'CA/ON/Northumberland/Port Hope',
  },
  {
    label: 'Roseneath',
    value: 'CA/ON/Northumberland/Roseneath',
  },
  {
    label: 'Trent River',
    value: 'CA/ON/Northumberland/Trent River',
  },
  {
    label: 'Warkworth',
    value: 'CA/ON/Northumberland/Warkworth',
  },
  {
    label: 'Ashton',
    value: 'CA/ON/Ottawa/Ashton',
  },
  {
    label: 'Burritts Rapids',
    value: 'CA/ON/Ottawa/Burritts Rapids',
  },
  {
    label: 'Carlsbad Springs',
    value: 'CA/ON/Ottawa/Carlsbad Springs',
  },
  {
    label: 'Carp',
    value: 'CA/ON/Ottawa/Carp',
  },
  {
    label: 'Cumberland',
    value: 'CA/ON/Ottawa/Cumberland',
  },
  {
    label: 'Dunrobin',
    value: 'CA/ON/Ottawa/Dunrobin',
  },
  {
    label: 'Edwards',
    value: 'CA/ON/Ottawa/Edwards',
  },
  {
    label: 'Fitzroy Harbour',
    value: 'CA/ON/Ottawa/Fitzroy Harbour',
  },
  {
    label: 'Gloucester',
    value: 'CA/ON/Ottawa/Gloucester',
  },
  {
    label: 'Greely',
    value: 'CA/ON/Ottawa/Greely',
  },
  {
    label: 'Kanata',
    value: 'CA/ON/Ottawa/Kanata',
  },
  {
    label: 'Kars',
    value: 'CA/ON/Ottawa/Kars',
  },
  {
    label: 'Kenmore',
    value: 'CA/ON/Ottawa/Kenmore',
  },
  {
    label: 'Kinburn',
    value: 'CA/ON/Ottawa/Kinburn',
  },
  {
    label: 'Manotick',
    value: 'CA/ON/Ottawa/Manotick',
  },
  {
    label: 'Metcalfe',
    value: 'CA/ON/Ottawa/Metcalfe',
  },
  {
    label: 'Munster',
    value: 'CA/ON/Ottawa/Munster',
  },
  {
    label: 'Navan',
    value: 'CA/ON/Ottawa/Navan',
  },
  {
    label: 'Nepean',
    value: 'CA/ON/Ottawa/Nepean',
  },
  {
    label: 'North Gower',
    value: 'CA/ON/Ottawa/North Gower',
  },
  {
    label: 'Orleans',
    value: 'CA/ON/Ottawa/Orleans',
  },
  {
    label: 'Osgoode',
    value: 'CA/ON/Ottawa/Osgoode',
  },
  {
    label: 'Ottawa',
    value: 'CA/ON/Ottawa/Ottawa',
  },
  {
    label: 'Ramsayville',
    value: 'CA/ON/Ottawa/Ramsayville',
  },
  {
    label: 'Richmond',
    value: 'CA/ON/Ottawa/Richmond',
  },
  {
    label: 'Rockcliffe',
    value: 'CA/ON/Ottawa/Rockcliffe',
  },
  {
    label: 'Saint-Pascal-Baylon',
    value: 'CA/ON/Ottawa/Saint-Pascal-Baylon',
  },
  {
    label: 'Sarsfield',
    value: 'CA/ON/Ottawa/Sarsfield',
  },
  {
    label: 'Stittsville',
    value: 'CA/ON/Ottawa/Stittsville',
  },
  {
    label: 'Vanier',
    value: 'CA/ON/Ottawa/Vanier',
  },
  {
    label: 'Vars',
    value: 'CA/ON/Ottawa/Vars',
  },
  {
    label: 'Vernon',
    value: 'CA/ON/Ottawa/Vernon',
  },
  {
    label: 'Woodlawn',
    value: 'CA/ON/Ottawa/Woodlawn',
  },
  {
    label: 'Beachville',
    value: 'CA/ON/Oxford/Beachville',
  },
  {
    label: 'Bright',
    value: 'CA/ON/Oxford/Bright',
  },
  {
    label: 'Brownsville',
    value: 'CA/ON/Oxford/Brownsville',
  },
  {
    label: 'Burgessville',
    value: 'CA/ON/Oxford/Burgessville',
  },
  {
    label: 'Drumbo',
    value: 'CA/ON/Oxford/Drumbo',
  },
  {
    label: 'Embro',
    value: 'CA/ON/Oxford/Embro',
  },
  {
    label: 'Hickson',
    value: 'CA/ON/Oxford/Hickson',
  },
  {
    label: 'Ingersoll',
    value: 'CA/ON/Oxford/Ingersoll',
  },
  {
    label: 'Innerkip',
    value: 'CA/ON/Oxford/Innerkip',
  },
  {
    label: 'Kintore',
    value: 'CA/ON/Oxford/Kintore',
  },
  {
    label: 'La Salette',
    value: 'CA/ON/Oxford/La Salette',
  },
  {
    label: 'Lakeside',
    value: 'CA/ON/Oxford/Lakeside',
  },
  {
    label: 'Mount Elgin',
    value: 'CA/ON/Oxford/Mount Elgin',
  },
  {
    label: 'Norwich',
    value: 'CA/ON/Oxford/Norwich',
  },
  {
    label: 'Otterville',
    value: 'CA/ON/Oxford/Otterville',
  },
  {
    label: 'Plattsville',
    value: 'CA/ON/Oxford/Plattsville',
  },
  {
    label: 'Princeton',
    value: 'CA/ON/Oxford/Princeton',
  },
  {
    label: 'Salford',
    value: 'CA/ON/Oxford/Salford',
  },
  {
    label: 'Springford',
    value: 'CA/ON/Oxford/Springford',
  },
  {
    label: 'Tavistock',
    value: 'CA/ON/Oxford/Tavistock',
  },
  {
    label: 'Thamesford',
    value: 'CA/ON/Oxford/Thamesford',
  },
  {
    label: 'Tillsonburg',
    value: 'CA/ON/Oxford/Tillsonburg',
  },
  {
    label: 'Woodstock',
    value: 'CA/ON/Oxford/Woodstock',
  },
  {
    label: 'Ahmic Harbour',
    value: 'CA/ON/Parry Sound/Ahmic Harbour',
  },
  {
    label: 'Arnstein',
    value: 'CA/ON/Parry Sound/Arnstein',
  },
  {
    label: 'Britt',
    value: 'CA/ON/Parry Sound/Britt',
  },
  {
    label: 'Burks Falls',
    value: 'CA/ON/Parry Sound/Burks Falls',
  },
  {
    label: 'Byng Inlet',
    value: 'CA/ON/Parry Sound/Byng Inlet',
  },
  {
    label: 'Callander',
    value: 'CA/ON/Parry Sound/Callander',
  },
  {
    label: 'Commanda',
    value: 'CA/ON/Parry Sound/Commanda',
  },
  {
    label: 'Dokis First Nation',
    value: 'CA/ON/Parry Sound/Dokis First Nation',
  },
  {
    label: 'Dunchurch',
    value: 'CA/ON/Parry Sound/Dunchurch',
  },
  {
    label: 'Emsdale',
    value: 'CA/ON/Parry Sound/Emsdale',
  },
  {
    label: 'Golden Valley',
    value: 'CA/ON/Parry Sound/Golden Valley',
  },
  {
    label: 'Katrine',
    value: 'CA/ON/Parry Sound/Katrine',
  },
  {
    label: 'Kearney',
    value: 'CA/ON/Parry Sound/Kearney',
  },
  {
    label: 'Loring',
    value: 'CA/ON/Parry Sound/Loring',
  },
  {
    label: 'Magnetawan',
    value: 'CA/ON/Parry Sound/Magnetawan',
  },
  {
    label: 'Mcdougall',
    value: 'CA/ON/Parry Sound/Mcdougall',
  },
  {
    label: 'Mckellar',
    value: 'CA/ON/Parry Sound/Mckellar',
  },
  {
    label: 'Minett',
    value: 'CA/ON/Parry Sound/Minett',
  },
  {
    label: 'Nipissing',
    value: 'CA/ON/Parry Sound/Nipissing',
  },
  {
    label: 'Nobel',
    value: 'CA/ON/Parry Sound/Nobel',
  },
  {
    label: 'Novar',
    value: 'CA/ON/Parry Sound/Novar',
  },
  {
    label: 'Parry Sound',
    value: 'CA/ON/Parry Sound/Parry Sound',
  },
  {
    label: 'Pointe-Au-Baril-Station',
    value: 'CA/ON/Parry Sound/Pointe-Au-Baril-Station',
  },
  {
    label: 'Port Loring',
    value: 'CA/ON/Parry Sound/Port Loring',
  },
  {
    label: 'Powassan',
    value: 'CA/ON/Parry Sound/Powassan',
  },
  {
    label: 'Restoule',
    value: 'CA/ON/Parry Sound/Restoule',
  },
  {
    label: 'Rosseau',
    value: 'CA/ON/Parry Sound/Rosseau',
  },
  {
    label: 'Rosseau Road',
    value: 'CA/ON/Parry Sound/Rosseau Road',
  },
  {
    label: 'Seguin',
    value: 'CA/ON/Parry Sound/Seguin',
  },
  {
    label: 'South River',
    value: 'CA/ON/Parry Sound/South River',
  },
  {
    label: 'Sprucedale',
    value: 'CA/ON/Parry Sound/Sprucedale',
  },
  {
    label: 'Sturgeon Falls',
    value: 'CA/ON/Parry Sound/Sturgeon Falls',
  },
  {
    label: 'Sundridge',
    value: 'CA/ON/Parry Sound/Sundridge',
  },
  {
    label: 'The Archipelago',
    value: 'CA/ON/Parry Sound/The Archipelago',
  },
  {
    label: 'Trout Creek',
    value: 'CA/ON/Parry Sound/Trout Creek',
  },
  {
    label: 'Alton',
    value: 'CA/ON/Peel/Alton',
  },
  {
    label: 'Belfountain',
    value: 'CA/ON/Peel/Belfountain',
  },
  {
    label: 'Bolton',
    value: 'CA/ON/Peel/Bolton',
  },
  {
    label: 'Brampton',
    value: 'CA/ON/Peel/Brampton',
  },
  {
    label: 'Caledon',
    value: 'CA/ON/Peel/Caledon',
  },
  {
    label: 'Caledon East',
    value: 'CA/ON/Peel/Caledon East',
  },
  {
    label: 'Caledon Village',
    value: 'CA/ON/Peel/Caledon Village',
  },
  {
    label: 'Cheltenham',
    value: 'CA/ON/Peel/Cheltenham',
  },
  {
    label: 'Inglewood',
    value: 'CA/ON/Peel/Inglewood',
  },
  {
    label: 'Mississauga',
    value: 'CA/ON/Peel/Mississauga',
  },
  {
    label: 'Palgrave',
    value: 'CA/ON/Peel/Palgrave',
  },
  {
    label: 'Springbrook',
    value: 'CA/ON/Peel/Springbrook',
  },
  {
    label: 'Terra Cotta',
    value: 'CA/ON/Peel/Terra Cotta',
  },
  {
    label: 'Atwood',
    value: 'CA/ON/Perth/Atwood',
  },
  {
    label: 'Bornholm',
    value: 'CA/ON/Perth/Bornholm',
  },
  {
    label: 'Brodhagen',
    value: 'CA/ON/Perth/Brodhagen',
  },
  {
    label: 'Brunner',
    value: 'CA/ON/Perth/Brunner',
  },
  {
    label: 'Dublin',
    value: 'CA/ON/Perth/Dublin',
  },
  {
    label: 'Fullarton',
    value: 'CA/ON/Perth/Fullarton',
  },
  {
    label: 'Gads Hill Station',
    value: 'CA/ON/Perth/Gads Hill Station',
  },
  {
    label: 'Gowanstown',
    value: 'CA/ON/Perth/Gowanstown',
  },
  {
    label: 'Granton',
    value: 'CA/ON/Perth/Granton',
  },
  {
    label: 'Kirkton',
    value: 'CA/ON/Perth/Kirkton',
  },
  {
    label: 'Listowel',
    value: 'CA/ON/Perth/Listowel',
  },
  {
    label: 'Milverton',
    value: 'CA/ON/Perth/Milverton',
  },
  {
    label: 'Mitchell',
    value: 'CA/ON/Perth/Mitchell',
  },
  {
    label: 'Monkton',
    value: 'CA/ON/Perth/Monkton',
  },
  {
    label: 'Newton',
    value: 'CA/ON/Perth/Newton',
  },
  {
    label: 'Poole',
    value: 'CA/ON/Perth/Poole',
  },
  {
    label: 'Rostock',
    value: 'CA/ON/Perth/Rostock',
  },
  {
    label: 'Sebringville',
    value: 'CA/ON/Perth/Sebringville',
  },
  {
    label: 'Shakespeare',
    value: 'CA/ON/Perth/Shakespeare',
  },
  {
    label: 'St Marys',
    value: 'CA/ON/Perth/St Marys',
  },
  {
    label: 'St Pauls Station',
    value: 'CA/ON/Perth/St Pauls Station',
  },
  {
    label: 'Staffa',
    value: 'CA/ON/Perth/Staffa',
  },
  {
    label: 'Stratford',
    value: 'CA/ON/Perth/Stratford',
  },
  {
    label: 'Apsley',
    value: 'CA/ON/Peterborough/Apsley',
  },
  {
    label: 'Bailieboro',
    value: 'CA/ON/Peterborough/Bailieboro',
  },
  {
    label: 'Bobcaygeon',
    value: 'CA/ON/Peterborough/Bobcaygeon',
  },
  {
    label: 'Bridgenorth',
    value: 'CA/ON/Peterborough/Bridgenorth',
  },
  {
    label: 'Buckhorn',
    value: 'CA/ON/Peterborough/Buckhorn',
  },
  {
    label: 'Burleigh Falls',
    value: 'CA/ON/Peterborough/Burleigh Falls',
  },
  {
    label: 'Cavan',
    value: 'CA/ON/Peterborough/Cavan',
  },
  {
    label: 'Cavan Monaghan',
    value: 'CA/ON/Peterborough/Cavan Monaghan',
  },
  {
    label: 'Curve Lake',
    value: 'CA/ON/Peterborough/Curve Lake',
  },
  {
    label: 'Douro',
    value: 'CA/ON/Peterborough/Douro',
  },
  {
    label: 'Dunsford',
    value: 'CA/ON/Peterborough/Dunsford',
  },
  {
    label: 'Ennismore',
    value: 'CA/ON/Peterborough/Ennismore',
  },
  {
    label: 'Fraserville',
    value: 'CA/ON/Peterborough/Fraserville',
  },
  {
    label: 'Gooderham',
    value: 'CA/ON/Peterborough/Gooderham',
  },
  {
    label: 'Hastings',
    value: 'CA/ON/Peterborough/Hastings',
  },
  {
    label: 'Havelock',
    value: 'CA/ON/Peterborough/Havelock',
  },
  {
    label: 'Hiawatha',
    value: 'CA/ON/Peterborough/Hiawatha',
  },
  {
    label: 'Indian River',
    value: 'CA/ON/Peterborough/Indian River',
  },
  {
    label: 'Juniper Island',
    value: 'CA/ON/Peterborough/Juniper Island',
  },
  {
    label: 'Kawartha Park',
    value: 'CA/ON/Peterborough/Kawartha Park',
  },
  {
    label: 'Keene',
    value: 'CA/ON/Peterborough/Keene',
  },
  {
    label: 'Kinmount',
    value: 'CA/ON/Peterborough/Kinmount',
  },
  {
    label: 'Lakefield',
    value: 'CA/ON/Peterborough/Lakefield',
  },
  {
    label: 'Lakehurst',
    value: 'CA/ON/Peterborough/Lakehurst',
  },
  {
    label: 'Millbrook',
    value: 'CA/ON/Peterborough/Millbrook',
  },
  {
    label: 'Norwood',
    value: 'CA/ON/Peterborough/Norwood',
  },
  {
    label: 'Otonabee',
    value: 'CA/ON/Peterborough/Otonabee',
  },
  {
    label: 'Peterborough',
    value: 'CA/ON/Peterborough/Peterborough',
  },
  {
    label: 'Selwyn',
    value: 'CA/ON/Peterborough/Selwyn',
  },
  {
    label: 'Warsaw',
    value: 'CA/ON/Peterborough/Warsaw',
  },
  {
    label: 'Westwood',
    value: 'CA/ON/Peterborough/Westwood',
  },
  {
    label: 'Woodview',
    value: 'CA/ON/Peterborough/Woodview',
  },
  {
    label: 'Youngs Point',
    value: 'CA/ON/Peterborough/Youngs Point',
  },
  {
    label: 'Alfred',
    value: 'CA/ON/Prescott And Russell/Alfred',
  },
  {
    label: 'Bourget',
    value: 'CA/ON/Prescott And Russell/Bourget',
  },
  {
    label: 'Casselman',
    value: 'CA/ON/Prescott And Russell/Casselman',
  },
  {
    label: 'Chute A Blondeau',
    value: 'CA/ON/Prescott And Russell/Chute A Blondeau',
  },
  {
    label: 'Clarence Creek',
    value: 'CA/ON/Prescott And Russell/Clarence Creek',
  },
  {
    label: 'Curran',
    value: 'CA/ON/Prescott And Russell/Curran',
  },
  {
    label: 'Embrun',
    value: 'CA/ON/Prescott And Russell/Embrun',
  },
  {
    label: 'Fournier',
    value: 'CA/ON/Prescott And Russell/Fournier',
  },
  {
    label: 'Hammond',
    value: 'CA/ON/Prescott And Russell/Hammond',
  },
  {
    label: 'Hawkesbury',
    value: 'CA/ON/Prescott And Russell/Hawkesbury',
  },
  {
    label: 'Lefaivre',
    value: 'CA/ON/Prescott And Russell/Lefaivre',
  },
  {
    label: 'Limoges',
    value: 'CA/ON/Prescott And Russell/Limoges',
  },
  {
    label: "L'orignal",
    value: "CA/ON/Prescott And Russell/L'orignal",
  },
  {
    label: 'Plantagenet',
    value: 'CA/ON/Prescott And Russell/Plantagenet',
  },
  {
    label: 'Rockland',
    value: 'CA/ON/Prescott And Russell/Rockland',
  },
  {
    label: 'Russell',
    value: 'CA/ON/Prescott And Russell/Russell',
  },
  {
    label: 'Saint-Pascal-Baylon',
    value: 'CA/ON/Prescott And Russell/Saint-Pascal-Baylon',
  },
  {
    label: 'St Albert',
    value: 'CA/ON/Prescott And Russell/St Albert',
  },
  {
    label: 'St Bernardin',
    value: 'CA/ON/Prescott And Russell/St Bernardin',
  },
  {
    label: 'St Eugene',
    value: 'CA/ON/Prescott And Russell/St Eugene',
  },
  {
    label: 'St Isidore',
    value: 'CA/ON/Prescott And Russell/St Isidore',
  },
  {
    label: 'Vankleek Hill',
    value: 'CA/ON/Prescott And Russell/Vankleek Hill',
  },
  {
    label: 'Wendover',
    value: 'CA/ON/Prescott And Russell/Wendover',
  },
  {
    label: 'Ameliasburg',
    value: 'CA/ON/Prince Edward/Ameliasburg',
  },
  {
    label: 'Bloomfield',
    value: 'CA/ON/Prince Edward/Bloomfield',
  },
  {
    label: 'Carrying Place',
    value: 'CA/ON/Prince Edward/Carrying Place',
  },
  {
    label: 'Cherry Valley',
    value: 'CA/ON/Prince Edward/Cherry Valley',
  },
  {
    label: 'Consecon',
    value: 'CA/ON/Prince Edward/Consecon',
  },
  {
    label: 'Demorestville',
    value: 'CA/ON/Prince Edward/Demorestville',
  },
  {
    label: 'Hillier',
    value: 'CA/ON/Prince Edward/Hillier',
  },
  {
    label: 'Milford',
    value: 'CA/ON/Prince Edward/Milford',
  },
  {
    label: 'Picton',
    value: 'CA/ON/Prince Edward/Picton',
  },
  {
    label: 'Wellington',
    value: 'CA/ON/Prince Edward/Wellington',
  },
  {
    label: 'Woodville',
    value: 'CA/ON/Prince Edward/Woodville',
  },
  {
    label: 'Gatineau',
    value: 'CA/ON/Quebec/Gatineau',
  },
  {
    label: 'Atikokan',
    value: 'CA/ON/Rainy River/Atikokan',
  },
  {
    label: 'Barwick',
    value: 'CA/ON/Rainy River/Barwick',
  },
  {
    label: 'Devlin',
    value: 'CA/ON/Rainy River/Devlin',
  },
  {
    label: 'Emo',
    value: 'CA/ON/Rainy River/Emo',
  },
  {
    label: 'Fort Frances',
    value: 'CA/ON/Rainy River/Fort Frances',
  },
  {
    label: 'Kashabowie',
    value: 'CA/ON/Rainy River/Kashabowie',
  },
  {
    label: 'Lac La Croix First Nation',
    value: 'CA/ON/Rainy River/Lac La Croix First Nation',
  },
  {
    label: 'Mine Centre',
    value: 'CA/ON/Rainy River/Mine Centre',
  },
  {
    label: 'Morson',
    value: 'CA/ON/Rainy River/Morson',
  },
  {
    label: 'Pinewood',
    value: 'CA/ON/Rainy River/Pinewood',
  },
  {
    label: 'Rainy River',
    value: 'CA/ON/Rainy River/Rainy River',
  },
  {
    label: 'Sleeman',
    value: 'CA/ON/Rainy River/Sleeman',
  },
  {
    label: 'Stratton',
    value: 'CA/ON/Rainy River/Stratton',
  },
  {
    label: 'Arnprior',
    value: 'CA/ON/Renfrew/Arnprior',
  },
  {
    label: 'Barrys Bay',
    value: 'CA/ON/Renfrew/Barrys Bay',
  },
  {
    label: 'Beachburg',
    value: 'CA/ON/Renfrew/Beachburg',
  },
  {
    label: 'Braeside',
    value: 'CA/ON/Renfrew/Braeside',
  },
  {
    label: 'Burnstown',
    value: 'CA/ON/Renfrew/Burnstown',
  },
  {
    label: 'Calabogie',
    value: 'CA/ON/Renfrew/Calabogie',
  },
  {
    label: 'Chalk River',
    value: 'CA/ON/Renfrew/Chalk River',
  },
  {
    label: 'Cobden',
    value: 'CA/ON/Renfrew/Cobden',
  },
  {
    label: 'Combermere',
    value: 'CA/ON/Renfrew/Combermere',
  },
  {
    label: 'Cormac',
    value: 'CA/ON/Renfrew/Cormac',
  },
  {
    label: 'Dacre',
    value: 'CA/ON/Renfrew/Dacre',
  },
  {
    label: 'Deep River',
    value: 'CA/ON/Renfrew/Deep River',
  },
  {
    label: 'Deux Rivieres',
    value: 'CA/ON/Renfrew/Deux Rivieres',
  },
  {
    label: 'Douglas',
    value: 'CA/ON/Renfrew/Douglas',
  },
  {
    label: 'Eganville',
    value: 'CA/ON/Renfrew/Eganville',
  },
  {
    label: 'Foresters Falls',
    value: 'CA/ON/Renfrew/Foresters Falls',
  },
  {
    label: 'Foymount',
    value: 'CA/ON/Renfrew/Foymount',
  },
  {
    label: 'Golden Lake',
    value: 'CA/ON/Renfrew/Golden Lake',
  },
  {
    label: 'Griffith',
    value: 'CA/ON/Renfrew/Griffith',
  },
  {
    label: 'Haley Station',
    value: 'CA/ON/Renfrew/Haley Station',
  },
  {
    label: 'Horton',
    value: 'CA/ON/Renfrew/Horton',
  },
  {
    label: 'Killaloe',
    value: 'CA/ON/Renfrew/Killaloe',
  },
  {
    label: 'Mackey',
    value: 'CA/ON/Renfrew/Mackey',
  },
  {
    label: 'Mcnab/Braeside',
    value: 'CA/ON/Renfrew/Mcnab/Braeside',
  },
  {
    label: 'Palmer Rapids',
    value: 'CA/ON/Renfrew/Palmer Rapids',
  },
  {
    label: 'Pembroke',
    value: 'CA/ON/Renfrew/Pembroke',
  },
  {
    label: 'Petawawa',
    value: 'CA/ON/Renfrew/Petawawa',
  },
  {
    label: 'Quadeville',
    value: 'CA/ON/Renfrew/Quadeville',
  },
  {
    label: 'Renfrew',
    value: 'CA/ON/Renfrew/Renfrew',
  },
  {
    label: 'Rolphton',
    value: 'CA/ON/Renfrew/Rolphton',
  },
  {
    label: 'Round Lake Centre',
    value: 'CA/ON/Renfrew/Round Lake Centre',
  },
  {
    label: 'Stonecliffe',
    value: 'CA/ON/Renfrew/Stonecliffe',
  },
  {
    label: 'Township Of Laurentian Valley',
    value: 'CA/ON/Renfrew/Township Of Laurentian Valley',
  },
  {
    label: 'Township Of Whitewater Region',
    value: 'CA/ON/Renfrew/Township Of Whitewater Region',
  },
  {
    label: 'Westmeath',
    value: 'CA/ON/Renfrew/Westmeath',
  },
  {
    label: 'White Lake',
    value: 'CA/ON/Renfrew/White Lake',
  },
  {
    label: 'Wilno',
    value: 'CA/ON/Renfrew/Wilno',
  },
  {
    label: 'Alliston',
    value: 'CA/ON/Simcoe/Alliston',
  },
  {
    label: 'Angus',
    value: 'CA/ON/Simcoe/Angus',
  },
  {
    label: 'Barrie',
    value: 'CA/ON/Simcoe/Barrie',
  },
  {
    label: 'Beeton',
    value: 'CA/ON/Simcoe/Beeton',
  },
  {
    label: 'Belle Ewart',
    value: 'CA/ON/Simcoe/Belle Ewart',
  },
  {
    label: 'Bond Head',
    value: 'CA/ON/Simcoe/Bond Head',
  },
  {
    label: 'Borden',
    value: 'CA/ON/Simcoe/Borden',
  },
  {
    label: 'Bradford',
    value: 'CA/ON/Simcoe/Bradford',
  },
  {
    label: 'Brechin',
    value: 'CA/ON/Simcoe/Brechin',
  },
  {
    label: 'Cedar Point',
    value: 'CA/ON/Simcoe/Cedar Point',
  },
  {
    label: 'Christian Island',
    value: 'CA/ON/Simcoe/Christian Island',
  },
  {
    label: 'Churchill',
    value: 'CA/ON/Simcoe/Churchill',
  },
  {
    label: 'Coldwater',
    value: 'CA/ON/Simcoe/Coldwater',
  },
  {
    label: 'Collingwood',
    value: 'CA/ON/Simcoe/Collingwood',
  },
  {
    label: 'Cookstown',
    value: 'CA/ON/Simcoe/Cookstown',
  },
  {
    label: 'Creemore',
    value: 'CA/ON/Simcoe/Creemore',
  },
  {
    label: 'Cumberland Beach',
    value: 'CA/ON/Simcoe/Cumberland Beach',
  },
  {
    label: 'Duntroon',
    value: 'CA/ON/Simcoe/Duntroon',
  },
  {
    label: 'Egbert',
    value: 'CA/ON/Simcoe/Egbert',
  },
  {
    label: 'Elmvale',
    value: 'CA/ON/Simcoe/Elmvale',
  },
  {
    label: 'Essa',
    value: 'CA/ON/Simcoe/Essa',
  },
  {
    label: 'Everett',
    value: 'CA/ON/Simcoe/Everett',
  },
  {
    label: 'Gilford',
    value: 'CA/ON/Simcoe/Gilford',
  },
  {
    label: 'Glen Huron',
    value: 'CA/ON/Simcoe/Glen Huron',
  },
  {
    label: 'Glencairn',
    value: 'CA/ON/Simcoe/Glencairn',
  },
  {
    label: 'Hawkestone',
    value: 'CA/ON/Simcoe/Hawkestone',
  },
  {
    label: 'Hillsdale',
    value: 'CA/ON/Simcoe/Hillsdale',
  },
  {
    label: 'Innisfil',
    value: 'CA/ON/Simcoe/Innisfil',
  },
  {
    label: 'Lafontaine',
    value: 'CA/ON/Simcoe/Lafontaine',
  },
  {
    label: 'Lefroy',
    value: 'CA/ON/Simcoe/Lefroy',
  },
  {
    label: 'Lisle',
    value: 'CA/ON/Simcoe/Lisle',
  },
  {
    label: 'Longford Mills',
    value: 'CA/ON/Simcoe/Longford Mills',
  },
  {
    label: 'Loretto',
    value: 'CA/ON/Simcoe/Loretto',
  },
  {
    label: 'Midhurst',
    value: 'CA/ON/Simcoe/Midhurst',
  },
  {
    label: 'Midland',
    value: 'CA/ON/Simcoe/Midland',
  },
  {
    label: 'Minesing',
    value: 'CA/ON/Simcoe/Minesing',
  },
  {
    label: 'Moonstone',
    value: 'CA/ON/Simcoe/Moonstone',
  },
  {
    label: 'Mount Albert',
    value: 'CA/ON/Simcoe/Mount Albert',
  },
  {
    label: 'New Lowell',
    value: 'CA/ON/Simcoe/New Lowell',
  },
  {
    label: 'New Tecumseth',
    value: 'CA/ON/Simcoe/New Tecumseth',
  },
  {
    label: 'Nottawa',
    value: 'CA/ON/Simcoe/Nottawa',
  },
  {
    label: 'Orillia',
    value: 'CA/ON/Simcoe/Orillia',
  },
  {
    label: 'Oro',
    value: 'CA/ON/Simcoe/Oro',
  },
  {
    label: 'Oro Station',
    value: 'CA/ON/Simcoe/Oro Station',
  },
  {
    label: 'Penetanguishene',
    value: 'CA/ON/Simcoe/Penetanguishene',
  },
  {
    label: 'Perkinsfield',
    value: 'CA/ON/Simcoe/Perkinsfield',
  },
  {
    label: 'Phelpston',
    value: 'CA/ON/Simcoe/Phelpston',
  },
  {
    label: 'Port Mcnicoll',
    value: 'CA/ON/Simcoe/Port Mcnicoll',
  },
  {
    label: 'Port Severn',
    value: 'CA/ON/Simcoe/Port Severn',
  },
  {
    label: 'Rama',
    value: 'CA/ON/Simcoe/Rama',
  },
  {
    label: 'Ramara',
    value: 'CA/ON/Simcoe/Ramara',
  },
  {
    label: 'Rosemont',
    value: 'CA/ON/Simcoe/Rosemont',
  },
  {
    label: 'Sebright',
    value: 'CA/ON/Simcoe/Sebright',
  },
  {
    label: 'Severn Bridge',
    value: 'CA/ON/Simcoe/Severn Bridge',
  },
  {
    label: 'Shanty Bay',
    value: 'CA/ON/Simcoe/Shanty Bay',
  },
  {
    label: 'Stayner',
    value: 'CA/ON/Simcoe/Stayner',
  },
  {
    label: 'Stroud',
    value: 'CA/ON/Simcoe/Stroud',
  },
  {
    label: 'Thornton',
    value: 'CA/ON/Simcoe/Thornton',
  },
  {
    label: 'Tiny',
    value: 'CA/ON/Simcoe/Tiny',
  },
  {
    label: 'Tottenham',
    value: 'CA/ON/Simcoe/Tottenham',
  },
  {
    label: 'Utopia',
    value: 'CA/ON/Simcoe/Utopia',
  },
  {
    label: 'Victoria Harbour',
    value: 'CA/ON/Simcoe/Victoria Harbour',
  },
  {
    label: 'Warminster',
    value: 'CA/ON/Simcoe/Warminster',
  },
  {
    label: 'Wasaga Beach',
    value: 'CA/ON/Simcoe/Wasaga Beach',
  },
  {
    label: 'Washago',
    value: 'CA/ON/Simcoe/Washago',
  },
  {
    label: 'Waubaushene',
    value: 'CA/ON/Simcoe/Waubaushene',
  },
  {
    label: 'Wyebridge',
    value: 'CA/ON/Simcoe/Wyebridge',
  },
  {
    label: 'Wyevale',
    value: 'CA/ON/Simcoe/Wyevale',
  },
  {
    label: 'Akwesasne',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Akwesasne',
  },
  {
    label: 'Alexandria',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Alexandria',
  },
  {
    label: 'Apple Hill',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Apple Hill',
  },
  {
    label: 'Avonmore',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Avonmore',
  },
  {
    label: 'Bainsville',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Bainsville',
  },
  {
    label: 'Berwick',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Berwick',
  },
  {
    label: 'Brinston',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Brinston',
  },
  {
    label: 'Chesterville',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Chesterville',
  },
  {
    label: 'Connaught',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Connaught',
  },
  {
    label: 'Cornwall',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Cornwall',
  },
  {
    label: 'Crysler',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Crysler',
  },
  {
    label: 'Dalkeith',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Dalkeith',
  },
  {
    label: 'Dunvegan',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Dunvegan',
  },
  {
    label: 'Finch',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Finch',
  },
  {
    label: 'Glen Robertson',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Glen Robertson',
  },
  {
    label: 'Green Valley',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Green Valley',
  },
  {
    label: 'Ingleside',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Ingleside',
  },
  {
    label: 'Inkerman',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Inkerman',
  },
  {
    label: 'Iroquois',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Iroquois',
  },
  {
    label: 'Lancaster',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Lancaster',
  },
  {
    label: 'Long Sault',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Long Sault',
  },
  {
    label: 'Lunenburg',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Lunenburg',
  },
  {
    label: 'Martintown',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Martintown',
  },
  {
    label: 'Maxville',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Maxville',
  },
  {
    label: 'Monkland',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Monkland',
  },
  {
    label: 'Moose Creek',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Moose Creek',
  },
  {
    label: 'Morewood',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Morewood',
  },
  {
    label: 'Morrisburg',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Morrisburg',
  },
  {
    label: 'Mountain',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Mountain',
  },
  {
    label: 'Newington',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Newington',
  },
  {
    label: 'North Lancaster',
    value: 'CA/ON/Stormont, Dundas And Glengarry/North Lancaster',
  },
  {
    label: 'Orleans',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Orleans',
  },
  {
    label: 'South Glengarry',
    value: 'CA/ON/Stormont, Dundas And Glengarry/South Glengarry',
  },
  {
    label: 'South Lancaster',
    value: 'CA/ON/Stormont, Dundas And Glengarry/South Lancaster',
  },
  {
    label: 'South Mountain',
    value: 'CA/ON/Stormont, Dundas And Glengarry/South Mountain',
  },
  {
    label: 'South Stormont',
    value: 'CA/ON/Stormont, Dundas And Glengarry/South Stormont',
  },
  {
    label: 'St Andrews West',
    value: 'CA/ON/Stormont, Dundas And Glengarry/St Andrews West',
  },
  {
    label: 'Ste Anne De Prescott',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Ste Anne De Prescott',
  },
  {
    label: 'Summerstown',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Summerstown',
  },
  {
    label: 'Upper Canada Village',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Upper Canada Village',
  },
  {
    label: 'Williamsburg',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Williamsburg',
  },
  {
    label: 'Williamstown',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Williamstown',
  },
  {
    label: 'Winchester',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Winchester',
  },
  {
    label: 'Winchester Springs',
    value: 'CA/ON/Stormont, Dundas And Glengarry/Winchester Springs',
  },
  {
    label: 'Alban',
    value: 'CA/ON/Sudbury/Alban',
  },
  {
    label: 'Azilda',
    value: 'CA/ON/Sudbury/Azilda',
  },
  {
    label: 'Biscotasing',
    value: 'CA/ON/Sudbury/Biscotasing',
  },
  {
    label: 'Blezard Valley',
    value: 'CA/ON/Sudbury/Blezard Valley',
  },
  {
    label: 'Capreol',
    value: 'CA/ON/Sudbury/Capreol',
  },
  {
    label: 'Cartier',
    value: 'CA/ON/Sudbury/Cartier',
  },
  {
    label: 'Chapleau',
    value: 'CA/ON/Sudbury/Chapleau',
  },
  {
    label: 'Chelmsford',
    value: 'CA/ON/Sudbury/Chelmsford',
  },
  {
    label: 'Coniston',
    value: 'CA/ON/Sudbury/Coniston',
  },
  {
    label: 'Copper Cliff',
    value: 'CA/ON/Sudbury/Copper Cliff',
  },
  {
    label: 'Dowling',
    value: 'CA/ON/Sudbury/Dowling',
  },
  {
    label: 'Espanola',
    value: 'CA/ON/Sudbury/Espanola',
  },
  {
    label: 'Falconbridge',
    value: 'CA/ON/Sudbury/Falconbridge',
  },
  {
    label: 'Foleyet',
    value: 'CA/ON/Sudbury/Foleyet',
  },
  {
    label: 'Garson',
    value: 'CA/ON/Sudbury/Garson',
  },
  {
    label: 'Gogama',
    value: 'CA/ON/Sudbury/Gogama',
  },
  {
    label: 'Hagar',
    value: 'CA/ON/Sudbury/Hagar',
  },
  {
    label: 'Hanmer',
    value: 'CA/ON/Sudbury/Hanmer',
  },
  {
    label: 'Killarney',
    value: 'CA/ON/Sudbury/Killarney',
  },
  {
    label: 'Levack',
    value: 'CA/ON/Sudbury/Levack',
  },
  {
    label: 'Lively',
    value: 'CA/ON/Sudbury/Lively',
  },
  {
    label: 'Markstay',
    value: 'CA/ON/Sudbury/Markstay',
  },
  {
    label: 'Massey',
    value: 'CA/ON/Sudbury/Massey',
  },
  {
    label: 'Mckerrow',
    value: 'CA/ON/Sudbury/Mckerrow',
  },
  {
    label: 'Nairn Centre',
    value: 'CA/ON/Sudbury/Nairn Centre',
  },
  {
    label: 'Naughton',
    value: 'CA/ON/Sudbury/Naughton',
  },
  {
    label: 'Noelville',
    value: 'CA/ON/Sudbury/Noelville',
  },
  {
    label: 'Onaping',
    value: 'CA/ON/Sudbury/Onaping',
  },
  {
    label: 'Pickerel',
    value: 'CA/ON/Sudbury/Pickerel',
  },
  {
    label: 'Ramsey',
    value: 'CA/ON/Sudbury/Ramsey',
  },
  {
    label: 'Shining Tree',
    value: 'CA/ON/Sudbury/Shining Tree',
  },
  {
    label: 'Skead',
    value: 'CA/ON/Sudbury/Skead',
  },
  {
    label: 'St Charles',
    value: 'CA/ON/Sudbury/St Charles',
  },
  {
    label: 'Sudbury',
    value: 'CA/ON/Sudbury/Sudbury',
  },
  {
    label: 'Sultan',
    value: 'CA/ON/Sudbury/Sultan',
  },
  {
    label: 'Val Caron',
    value: 'CA/ON/Sudbury/Val Caron',
  },
  {
    label: 'Val Therese',
    value: 'CA/ON/Sudbury/Val Therese',
  },
  {
    label: 'Wahnapitae',
    value: 'CA/ON/Sudbury/Wahnapitae',
  },
  {
    label: 'Walford',
    value: 'CA/ON/Sudbury/Walford',
  },
  {
    label: 'Warren',
    value: 'CA/ON/Sudbury/Warren',
  },
  {
    label: 'Webbwood',
    value: 'CA/ON/Sudbury/Webbwood',
  },
  {
    label: 'Whitefish',
    value: 'CA/ON/Sudbury/Whitefish',
  },
  {
    label: 'Whitefish Falls',
    value: 'CA/ON/Sudbury/Whitefish Falls',
  },
  {
    label: 'Worthington',
    value: 'CA/ON/Sudbury/Worthington',
  },
  {
    label: 'Armstrong',
    value: 'CA/ON/Thunder Bay/Armstrong',
  },
  {
    label: 'Armstrong Station',
    value: 'CA/ON/Thunder Bay/Armstrong Station',
  },
  {
    label: 'Aroland First Nation',
    value: 'CA/ON/Thunder Bay/Aroland First Nation',
  },
  {
    label: 'Beardmore',
    value: 'CA/ON/Thunder Bay/Beardmore',
  },
  {
    label: 'Caramat',
    value: 'CA/ON/Thunder Bay/Caramat',
  },
  {
    label: 'Collins',
    value: 'CA/ON/Thunder Bay/Collins',
  },
  {
    label: 'Conmee',
    value: 'CA/ON/Thunder Bay/Conmee',
  },
  {
    label: 'Dorion',
    value: 'CA/ON/Thunder Bay/Dorion',
  },
  {
    label: 'East Gorham',
    value: 'CA/ON/Thunder Bay/East Gorham',
  },
  {
    label: 'Fort William First Nation',
    value: 'CA/ON/Thunder Bay/Fort William First Nation',
  },
  {
    label: 'Fowler',
    value: 'CA/ON/Thunder Bay/Fowler',
  },
  {
    label: 'Geraldton',
    value: 'CA/ON/Thunder Bay/Geraldton',
  },
  {
    label: 'Gorham',
    value: 'CA/ON/Thunder Bay/Gorham',
  },
  {
    label: 'Graham',
    value: 'CA/ON/Thunder Bay/Graham',
  },
  {
    label: 'Greenstone',
    value: 'CA/ON/Thunder Bay/Greenstone',
  },
  {
    label: 'Gull Bay First Nation',
    value: 'CA/ON/Thunder Bay/Gull Bay First Nation',
  },
  {
    label: 'Heron Bay',
    value: 'CA/ON/Thunder Bay/Heron Bay',
  },
  {
    label: 'Hurkett',
    value: 'CA/ON/Thunder Bay/Hurkett',
  },
  {
    label: 'Jacques',
    value: 'CA/ON/Thunder Bay/Jacques',
  },
  {
    label: 'Jellicoe',
    value: 'CA/ON/Thunder Bay/Jellicoe',
  },
  {
    label: 'Kakabeka Falls',
    value: 'CA/ON/Thunder Bay/Kakabeka Falls',
  },
  {
    label: 'Kaministiquia',
    value: 'CA/ON/Thunder Bay/Kaministiquia',
  },
  {
    label: 'Lappe',
    value: 'CA/ON/Thunder Bay/Lappe',
  },
  {
    label: 'Longlac',
    value: 'CA/ON/Thunder Bay/Longlac',
  },
  {
    label: 'Macdiarmid',
    value: 'CA/ON/Thunder Bay/Macdiarmid',
  },
  {
    label: 'Manitouwadge',
    value: 'CA/ON/Thunder Bay/Manitouwadge',
  },
  {
    label: 'Marathon',
    value: 'CA/ON/Thunder Bay/Marathon',
  },
  {
    label: 'Mobert First Nation',
    value: 'CA/ON/Thunder Bay/Mobert First Nation',
  },
  {
    label: 'Murillo',
    value: 'CA/ON/Thunder Bay/Murillo',
  },
  {
    label: 'Nakina',
    value: 'CA/ON/Thunder Bay/Nakina',
  },
  {
    label: 'Neebing',
    value: 'CA/ON/Thunder Bay/Neebing',
  },
  {
    label: 'Nipigon',
    value: 'CA/ON/Thunder Bay/Nipigon',
  },
  {
    label: 'Nolalu',
    value: 'CA/ON/Thunder Bay/Nolalu',
  },
  {
    label: 'Oconnor',
    value: 'CA/ON/Thunder Bay/Oconnor',
  },
  {
    label: 'Pass Lake',
    value: 'CA/ON/Thunder Bay/Pass Lake',
  },
  {
    label: 'Pays Plat First Nation',
    value: 'CA/ON/Thunder Bay/Pays Plat First Nation',
  },
  {
    label: 'Raith',
    value: 'CA/ON/Thunder Bay/Raith',
  },
  {
    label: 'Red Rock',
    value: 'CA/ON/Thunder Bay/Red Rock',
  },
  {
    label: 'Rosslyn',
    value: 'CA/ON/Thunder Bay/Rosslyn',
  },
  {
    label: 'Rossport',
    value: 'CA/ON/Thunder Bay/Rossport',
  },
  {
    label: 'Savant Lake',
    value: 'CA/ON/Thunder Bay/Savant Lake',
  },
  {
    label: 'Schreiber',
    value: 'CA/ON/Thunder Bay/Schreiber',
  },
  {
    label: 'Shebandowan',
    value: 'CA/ON/Thunder Bay/Shebandowan',
  },
  {
    label: 'Shuniah',
    value: 'CA/ON/Thunder Bay/Shuniah',
  },
  {
    label: 'Slate River',
    value: 'CA/ON/Thunder Bay/Slate River',
  },
  {
    label: 'South Gillies',
    value: 'CA/ON/Thunder Bay/South Gillies',
  },
  {
    label: 'Terrace Bay',
    value: 'CA/ON/Thunder Bay/Terrace Bay',
  },
  {
    label: 'Thunder Bay',
    value: 'CA/ON/Thunder Bay/Thunder Bay',
  },
  {
    label: 'Upsala',
    value: 'CA/ON/Thunder Bay/Upsala',
  },
  {
    label: 'Belle Vallee',
    value: 'CA/ON/Timiskaming/Belle Vallee',
  },
  {
    label: 'Brethour',
    value: 'CA/ON/Timiskaming/Brethour',
  },
  {
    label: 'Chamberlain',
    value: 'CA/ON/Timiskaming/Chamberlain',
  },
  {
    label: 'Chaput Hughes',
    value: 'CA/ON/Timiskaming/Chaput Hughes',
  },
  {
    label: 'Charlton',
    value: 'CA/ON/Timiskaming/Charlton',
  },
  {
    label: 'Cobalt',
    value: 'CA/ON/Timiskaming/Cobalt',
  },
  {
    label: 'Coleman',
    value: 'CA/ON/Timiskaming/Coleman',
  },
  {
    label: 'Dobie',
    value: 'CA/ON/Timiskaming/Dobie',
  },
  {
    label: 'Dymond',
    value: 'CA/ON/Timiskaming/Dymond',
  },
  {
    label: 'Earlton',
    value: 'CA/ON/Timiskaming/Earlton',
  },
  {
    label: 'Elk Lake',
    value: 'CA/ON/Timiskaming/Elk Lake',
  },
  {
    label: 'Englehart',
    value: 'CA/ON/Timiskaming/Englehart',
  },
  {
    label: 'Evanturel',
    value: 'CA/ON/Timiskaming/Evanturel',
  },
  {
    label: 'Gowganda',
    value: 'CA/ON/Timiskaming/Gowganda',
  },
  {
    label: 'Haileybury',
    value: 'CA/ON/Timiskaming/Haileybury',
  },
  {
    label: 'Harley',
    value: 'CA/ON/Timiskaming/Harley',
  },
  {
    label: 'Harris',
    value: 'CA/ON/Timiskaming/Harris',
  },
  {
    label: 'Hilliardton',
    value: 'CA/ON/Timiskaming/Hilliardton',
  },
  {
    label: 'Hudson',
    value: 'CA/ON/Timiskaming/Hudson',
  },
  {
    label: 'Kearns',
    value: 'CA/ON/Timiskaming/Kearns',
  },
  {
    label: 'Kenabeek',
    value: 'CA/ON/Timiskaming/Kenabeek',
  },
  {
    label: 'Kerns',
    value: 'CA/ON/Timiskaming/Kerns',
  },
  {
    label: 'King Kirkland',
    value: 'CA/ON/Timiskaming/King Kirkland',
  },
  {
    label: 'Kirkland Lake',
    value: 'CA/ON/Timiskaming/Kirkland Lake',
  },
  {
    label: 'Larder Lake',
    value: 'CA/ON/Timiskaming/Larder Lake',
  },
  {
    label: 'Latchford',
    value: 'CA/ON/Timiskaming/Latchford',
  },
  {
    label: 'Marter',
    value: 'CA/ON/Timiskaming/Marter',
  },
  {
    label: 'Matachewan',
    value: 'CA/ON/Timiskaming/Matachewan',
  },
  {
    label: 'New Liskeard',
    value: 'CA/ON/Timiskaming/New Liskeard',
  },
  {
    label: 'North Cobalt',
    value: 'CA/ON/Timiskaming/North Cobalt',
  },
  {
    label: 'Sesekinika',
    value: 'CA/ON/Timiskaming/Sesekinika',
  },
  {
    label: 'Swastika',
    value: 'CA/ON/Timiskaming/Swastika',
  },
  {
    label: 'Tarzwell',
    value: 'CA/ON/Timiskaming/Tarzwell',
  },
  {
    label: 'Thornloe',
    value: 'CA/ON/Timiskaming/Thornloe',
  },
  {
    label: 'Tomstown',
    value: 'CA/ON/Timiskaming/Tomstown',
  },
  {
    label: 'Virginiatown',
    value: 'CA/ON/Timiskaming/Virginiatown',
  },
  {
    label: 'East York',
    value: 'CA/ON/Toronto/East York',
  },
  {
    label: 'Etobicoke',
    value: 'CA/ON/Toronto/Etobicoke',
  },
  {
    label: 'North York',
    value: 'CA/ON/Toronto/North York',
  },
  {
    label: 'Scarborough',
    value: 'CA/ON/Toronto/Scarborough',
  },
  {
    label: 'Toronto',
    value: 'CA/ON/Toronto/Toronto',
  },
  {
    label: 'York',
    value: 'CA/ON/Toronto/York',
  },
  {
    label: 'Ayr',
    value: 'CA/ON/Waterloo/Ayr',
  },
  {
    label: 'Baden',
    value: 'CA/ON/Waterloo/Baden',
  },
  {
    label: 'Bloomingdale',
    value: 'CA/ON/Waterloo/Bloomingdale',
  },
  {
    label: 'Breslau',
    value: 'CA/ON/Waterloo/Breslau',
  },
  {
    label: 'Cambridge',
    value: 'CA/ON/Waterloo/Cambridge',
  },
  {
    label: 'Conestogo',
    value: 'CA/ON/Waterloo/Conestogo',
  },
  {
    label: 'Elmira',
    value: 'CA/ON/Waterloo/Elmira',
  },
  {
    label: 'Hawkesville',
    value: 'CA/ON/Waterloo/Hawkesville',
  },
  {
    label: 'Heidelberg',
    value: 'CA/ON/Waterloo/Heidelberg',
  },
  {
    label: 'Kitchener',
    value: 'CA/ON/Waterloo/Kitchener',
  },
  {
    label: 'Linwood',
    value: 'CA/ON/Waterloo/Linwood',
  },
  {
    label: 'Maryhill',
    value: 'CA/ON/Waterloo/Maryhill',
  },
  {
    label: 'Millbank',
    value: 'CA/ON/Waterloo/Millbank',
  },
  {
    label: 'New Dundee',
    value: 'CA/ON/Waterloo/New Dundee',
  },
  {
    label: 'New Hamburg',
    value: 'CA/ON/Waterloo/New Hamburg',
  },
  {
    label: 'North Dumfries',
    value: 'CA/ON/Waterloo/North Dumfries',
  },
  {
    label: 'Petersburg',
    value: 'CA/ON/Waterloo/Petersburg',
  },
  {
    label: 'Sheffield',
    value: 'CA/ON/Waterloo/Sheffield',
  },
  {
    label: 'St Agatha',
    value: 'CA/ON/Waterloo/St Agatha',
  },
  {
    label: 'St Clements',
    value: 'CA/ON/Waterloo/St Clements',
  },
  {
    label: 'St Jacobs',
    value: 'CA/ON/Waterloo/St Jacobs',
  },
  {
    label: 'Wallenstein',
    value: 'CA/ON/Waterloo/Wallenstein',
  },
  {
    label: 'Waterloo',
    value: 'CA/ON/Waterloo/Waterloo',
  },
  {
    label: 'Wellesley',
    value: 'CA/ON/Waterloo/Wellesley',
  },
  {
    label: 'West Montrose',
    value: 'CA/ON/Waterloo/West Montrose',
  },
  {
    label: 'Woolwich Township',
    value: 'CA/ON/Waterloo/Woolwich Township',
  },
  {
    label: 'Alma',
    value: 'CA/ON/Wellington/Alma',
  },
  {
    label: 'Ariss',
    value: 'CA/ON/Wellington/Ariss',
  },
  {
    label: 'Arkell',
    value: 'CA/ON/Wellington/Arkell',
  },
  {
    label: 'Arthur',
    value: 'CA/ON/Wellington/Arthur',
  },
  {
    label: 'Ballinafad',
    value: 'CA/ON/Wellington/Ballinafad',
  },
  {
    label: 'Belwood',
    value: 'CA/ON/Wellington/Belwood',
  },
  {
    label: 'Centre Wellington',
    value: 'CA/ON/Wellington/Centre Wellington',
  },
  {
    label: 'Clifford',
    value: 'CA/ON/Wellington/Clifford',
  },
  {
    label: 'Conn',
    value: 'CA/ON/Wellington/Conn',
  },
  {
    label: 'Drayton',
    value: 'CA/ON/Wellington/Drayton',
  },
  {
    label: 'Eden Mills',
    value: 'CA/ON/Wellington/Eden Mills',
  },
  {
    label: 'Elora',
    value: 'CA/ON/Wellington/Elora',
  },
  {
    label: 'Erin',
    value: 'CA/ON/Wellington/Erin',
  },
  {
    label: 'Fergus',
    value: 'CA/ON/Wellington/Fergus',
  },
  {
    label: 'Floradale',
    value: 'CA/ON/Wellington/Floradale',
  },
  {
    label: 'Guelph',
    value: 'CA/ON/Wellington/Guelph',
  },
  {
    label: 'Guelph-Eramosa',
    value: 'CA/ON/Wellington/Guelph-Eramosa',
  },
  {
    label: 'Harriston',
    value: 'CA/ON/Wellington/Harriston',
  },
  {
    label: 'Hillsburgh',
    value: 'CA/ON/Wellington/Hillsburgh',
  },
  {
    label: 'Kenilworth',
    value: 'CA/ON/Wellington/Kenilworth',
  },
  {
    label: 'Mapleton',
    value: 'CA/ON/Wellington/Mapleton',
  },
  {
    label: 'Minto',
    value: 'CA/ON/Wellington/Minto',
  },
  {
    label: 'Moorefield',
    value: 'CA/ON/Wellington/Moorefield',
  },
  {
    label: 'Morriston',
    value: 'CA/ON/Wellington/Morriston',
  },
  {
    label: 'Mount Forest',
    value: 'CA/ON/Wellington/Mount Forest',
  },
  {
    label: 'Palmerston',
    value: 'CA/ON/Wellington/Palmerston',
  },
  {
    label: 'Puslinch',
    value: 'CA/ON/Wellington/Puslinch',
  },
  {
    label: 'Rockwood',
    value: 'CA/ON/Wellington/Rockwood',
  },
  {
    label: 'Township Of Wilmot',
    value: 'CA/ON/Wellington/Township Of Wilmot',
  },
  {
    label: 'Wellington North',
    value: 'CA/ON/Wellington/Wellington North',
  },
  {
    label: 'Aurora',
    value: 'CA/ON/York/Aurora',
  },
  {
    label: 'Baldwin',
    value: 'CA/ON/York/Baldwin',
  },
  {
    label: 'Cedar Valley',
    value: 'CA/ON/York/Cedar Valley',
  },
  {
    label: 'Concord',
    value: 'CA/ON/York/Concord',
  },
  {
    label: 'East Gwillimbury',
    value: 'CA/ON/York/East Gwillimbury',
  },
  {
    label: 'Gormley',
    value: 'CA/ON/York/Gormley',
  },
  {
    label: 'Holland Landing',
    value: 'CA/ON/York/Holland Landing',
  },
  {
    label: 'Jacksons Point',
    value: 'CA/ON/York/Jacksons Point',
  },
  {
    label: 'Keswick',
    value: 'CA/ON/York/Keswick',
  },
  {
    label: 'Kettleby',
    value: 'CA/ON/York/Kettleby',
  },
  {
    label: 'King',
    value: 'CA/ON/York/King',
  },
  {
    label: 'King City',
    value: 'CA/ON/York/King City',
  },
  {
    label: 'Kleinburg',
    value: 'CA/ON/York/Kleinburg',
  },
  {
    label: 'Locust Hill',
    value: 'CA/ON/York/Locust Hill',
  },
  {
    label: 'Maple',
    value: 'CA/ON/York/Maple',
  },
  {
    label: 'Markham',
    value: 'CA/ON/York/Markham',
  },
  {
    label: 'Mount Albert',
    value: 'CA/ON/York/Mount Albert',
  },
  {
    label: 'Newmarket',
    value: 'CA/ON/York/Newmarket',
  },
  {
    label: 'Nobleton',
    value: 'CA/ON/York/Nobleton',
  },
  {
    label: 'Pefferlaw',
    value: 'CA/ON/York/Pefferlaw',
  },
  {
    label: 'Queensville',
    value: 'CA/ON/York/Queensville',
  },
  {
    label: 'Richmond Hill',
    value: 'CA/ON/York/Richmond Hill',
  },
  {
    label: 'River Drive Park',
    value: 'CA/ON/York/River Drive Park',
  },
  {
    label: 'Roches Point',
    value: 'CA/ON/York/Roches Point',
  },
  {
    label: 'Schomberg',
    value: 'CA/ON/York/Schomberg',
  },
  {
    label: 'Sharon',
    value: 'CA/ON/York/Sharon',
  },
  {
    label: 'Stouffville',
    value: 'CA/ON/York/Stouffville',
  },
  {
    label: 'Sutton West',
    value: 'CA/ON/York/Sutton West',
  },
  {
    label: 'Thornhill',
    value: 'CA/ON/York/Thornhill',
  },
  {
    label: 'Udora',
    value: 'CA/ON/York/Udora',
  },
  {
    label: 'Unionville',
    value: 'CA/ON/York/Unionville',
  },
  {
    label: 'Vaughan',
    value: 'CA/ON/York/Vaughan',
  },
  {
    label: 'Willow Beach',
    value: 'CA/ON/York/Willow Beach',
  },
  {
    label: 'Woodbridge',
    value: 'CA/ON/York/Woodbridge',
  },
  {
    label: 'Annandale',
    value: 'CA/PE/Kings/Annandale',
  },
  {
    label: 'Bothwell',
    value: 'CA/PE/Kings/Bothwell',
  },
  {
    label: 'Brudenelle',
    value: 'CA/PE/Kings/Brudenelle',
  },
  {
    label: 'Cardigan',
    value: 'CA/PE/Kings/Cardigan',
  },
  {
    label: 'Georgetown',
    value: 'CA/PE/Kings/Georgetown',
  },
  {
    label: 'Howe Bay',
    value: 'CA/PE/Kings/Howe Bay',
  },
  {
    label: 'Little Pond',
    value: 'CA/PE/Kings/Little Pond',
  },
  {
    label: 'Lorne Valley',
    value: 'CA/PE/Kings/Lorne Valley',
  },
  {
    label: 'Lower Montague',
    value: 'CA/PE/Kings/Lower Montague',
  },
  {
    label: 'Montague',
    value: 'CA/PE/Kings/Montague',
  },
  {
    label: 'Morell',
    value: 'CA/PE/Kings/Morell',
  },
  {
    label: 'Murray Harbour',
    value: 'CA/PE/Kings/Murray Harbour',
  },
  {
    label: 'Murray River',
    value: 'CA/PE/Kings/Murray River',
  },
  {
    label: 'Souris',
    value: 'CA/PE/Kings/Souris',
  },
  {
    label: 'Souris West',
    value: 'CA/PE/Kings/Souris West',
  },
  {
    label: 'St-Peters Bay',
    value: 'CA/PE/Kings/St-Peters Bay',
  },
  {
    label: 'Valleyfield',
    value: 'CA/PE/Kings/Valleyfield',
  },
  {
    label: 'Abram-Village',
    value: 'CA/PE/Prince/Abram-Village',
  },
  {
    label: 'Albany',
    value: 'CA/PE/Prince/Albany',
  },
  {
    label: 'Alberton',
    value: 'CA/PE/Prince/Alberton',
  },
  {
    label: 'Baltic',
    value: 'CA/PE/Prince/Baltic',
  },
  {
    label: 'Bedeque',
    value: 'CA/PE/Prince/Bedeque',
  },
  {
    label: 'Bideford',
    value: 'CA/PE/Prince/Bideford',
  },
  {
    label: 'Bloomfield Station',
    value: 'CA/PE/Prince/Bloomfield Station',
  },
  {
    label: 'Borden-Carleton',
    value: 'CA/PE/Prince/Borden-Carleton',
  },
  {
    label: 'Central Bedeque',
    value: 'CA/PE/Prince/Central Bedeque',
  },
  {
    label: 'Coleman',
    value: 'CA/PE/Prince/Coleman',
  },
  {
    label: 'Conway',
    value: 'CA/PE/Prince/Conway',
  },
  {
    label: 'Darnley',
    value: 'CA/PE/Prince/Darnley',
  },
  {
    label: 'East Bideford',
    value: 'CA/PE/Prince/East Bideford',
  },
  {
    label: 'Ellerslie',
    value: 'CA/PE/Prince/Ellerslie',
  },
  {
    label: 'Elmsdale',
    value: 'CA/PE/Prince/Elmsdale',
  },
  {
    label: 'Foxley River',
    value: 'CA/PE/Prince/Foxley River',
  },
  {
    label: 'Freeland',
    value: 'CA/PE/Prince/Freeland',
  },
  {
    label: 'Greenmount',
    value: 'CA/PE/Prince/Greenmount',
  },
  {
    label: 'Hamilton',
    value: 'CA/PE/Prince/Hamilton',
  },
  {
    label: 'Indian River',
    value: 'CA/PE/Prince/Indian River',
  },
  {
    label: 'Kensington',
    value: 'CA/PE/Prince/Kensington',
  },
  {
    label: 'Kinkora',
    value: 'CA/PE/Prince/Kinkora',
  },
  {
    label: 'Lady Slipper',
    value: 'CA/PE/Prince/Lady Slipper',
  },
  {
    label: 'Linkletter',
    value: 'CA/PE/Prince/Linkletter',
  },
  {
    label: 'Malpeque',
    value: 'CA/PE/Prince/Malpeque',
  },
  {
    label: 'Miminegash',
    value: 'CA/PE/Prince/Miminegash',
  },
  {
    label: 'Miscouche',
    value: 'CA/PE/Prince/Miscouche',
  },
  {
    label: 'Montrose',
    value: 'CA/PE/Prince/Montrose',
  },
  {
    label: 'Murray Road',
    value: 'CA/PE/Prince/Murray Road',
  },
  {
    label: 'Northport',
    value: 'CA/PE/Prince/Northport',
  },
  {
    label: "O'leary",
    value: "CA/PE/Prince/O'leary",
  },
  {
    label: 'Poplar Grove',
    value: 'CA/PE/Prince/Poplar Grove',
  },
  {
    label: 'Richmond',
    value: 'CA/PE/Prince/Richmond',
  },
  {
    label: 'Scotchfort',
    value: 'CA/PE/Prince/Scotchfort',
  },
  {
    label: 'Sherbrooke',
    value: 'CA/PE/Prince/Sherbrooke',
  },
  {
    label: 'Slemon Park',
    value: 'CA/PE/Prince/Slemon Park',
  },
  {
    label: 'Spring Valley',
    value: 'CA/PE/Prince/Spring Valley',
  },
  {
    label: 'St-Louis',
    value: 'CA/PE/Prince/St-Louis',
  },
  {
    label: 'St. Felix',
    value: 'CA/PE/Prince/St. Felix',
  },
  {
    label: 'St. Nicholas',
    value: 'CA/PE/Prince/St. Nicholas',
  },
  {
    label: 'Summerside',
    value: 'CA/PE/Prince/Summerside',
  },
  {
    label: 'Tignish',
    value: 'CA/PE/Prince/Tignish',
  },
  {
    label: 'Tignish Shore',
    value: 'CA/PE/Prince/Tignish Shore',
  },
  {
    label: 'Tyne Valley',
    value: 'CA/PE/Prince/Tyne Valley',
  },
  {
    label: 'Wellington Station',
    value: 'CA/PE/Prince/Wellington Station',
  },
  {
    label: 'Alexandra',
    value: 'CA/PE/Queens/Alexandra',
  },
  {
    label: 'Argyle Shore',
    value: 'CA/PE/Queens/Argyle Shore',
  },
  {
    label: 'Auburn',
    value: 'CA/PE/Queens/Auburn',
  },
  {
    label: 'Belfast',
    value: 'CA/PE/Queens/Belfast',
  },
  {
    label: 'Belle River',
    value: 'CA/PE/Queens/Belle River',
  },
  {
    label: 'Bethel',
    value: 'CA/PE/Queens/Bethel',
  },
  {
    label: 'Bonshaw',
    value: 'CA/PE/Queens/Bonshaw',
  },
  {
    label: 'Brackley',
    value: 'CA/PE/Queens/Brackley',
  },
  {
    label: 'Brackley Beach',
    value: 'CA/PE/Queens/Brackley Beach',
  },
  {
    label: 'Breadalbane',
    value: 'CA/PE/Queens/Breadalbane',
  },
  {
    label: 'Bunbury',
    value: 'CA/PE/Queens/Bunbury',
  },
  {
    label: 'Canoe Cove',
    value: 'CA/PE/Queens/Canoe Cove',
  },
  {
    label: 'Charlottetown',
    value: 'CA/PE/Queens/Charlottetown',
  },
  {
    label: 'Clyde River',
    value: 'CA/PE/Queens/Clyde River',
  },
  {
    label: 'Cornwall',
    value: 'CA/PE/Queens/Cornwall',
  },
  {
    label: 'Covehead Road',
    value: 'CA/PE/Queens/Covehead Road',
  },
  {
    label: 'Crapaud',
    value: 'CA/PE/Queens/Crapaud',
  },
  {
    label: 'Cumberland',
    value: 'CA/PE/Queens/Cumberland',
  },
  {
    label: 'Darlington',
    value: 'CA/PE/Queens/Darlington',
  },
  {
    label: 'Donagh',
    value: 'CA/PE/Queens/Donagh',
  },
  {
    label: 'Dunstaffnage',
    value: 'CA/PE/Queens/Dunstaffnage',
  },
  {
    label: 'Ebenezer',
    value: 'CA/PE/Queens/Ebenezer',
  },
  {
    label: 'Emyvale',
    value: 'CA/PE/Queens/Emyvale',
  },
  {
    label: 'Fairview',
    value: 'CA/PE/Queens/Fairview',
  },
  {
    label: 'Fort Augustus',
    value: 'CA/PE/Queens/Fort Augustus',
  },
  {
    label: 'Frenchfort',
    value: 'CA/PE/Queens/Frenchfort',
  },
  {
    label: 'Glenfinnan',
    value: 'CA/PE/Queens/Glenfinnan',
  },
  {
    label: 'Grand Tracadie',
    value: 'CA/PE/Queens/Grand Tracadie',
  },
  {
    label: 'Green Gables',
    value: 'CA/PE/Queens/Green Gables',
  },
  {
    label: 'Hampshire',
    value: 'CA/PE/Queens/Hampshire',
  },
  {
    label: 'Harrington',
    value: 'CA/PE/Queens/Harrington',
  },
  {
    label: 'Hazelbrook',
    value: 'CA/PE/Queens/Hazelbrook',
  },
  {
    label: 'Hermitage',
    value: 'CA/PE/Queens/Hermitage',
  },
  {
    label: 'Hunter River',
    value: 'CA/PE/Queens/Hunter River',
  },
  {
    label: 'Johnstons River',
    value: 'CA/PE/Queens/Johnstons River',
  },
  {
    label: 'Kingston',
    value: 'CA/PE/Queens/Kingston',
  },
  {
    label: 'Lake Verde',
    value: 'CA/PE/Queens/Lake Verde',
  },
  {
    label: 'Long Creek',
    value: 'CA/PE/Queens/Long Creek',
  },
  {
    label: 'Marshfield',
    value: 'CA/PE/Queens/Marshfield',
  },
  {
    label: 'Meadowbank',
    value: 'CA/PE/Queens/Meadowbank',
  },
  {
    label: 'Mermaid',
    value: 'CA/PE/Queens/Mermaid',
  },
  {
    label: 'Milton Station',
    value: 'CA/PE/Queens/Milton Station',
  },
  {
    label: 'Mount Albion',
    value: 'CA/PE/Queens/Mount Albion',
  },
  {
    label: 'Mount Herbert',
    value: 'CA/PE/Queens/Mount Herbert',
  },
  {
    label: 'Mount Mellick',
    value: 'CA/PE/Queens/Mount Mellick',
  },
  {
    label: 'Mount Stewart',
    value: 'CA/PE/Queens/Mount Stewart',
  },
  {
    label: 'New Argyle',
    value: 'CA/PE/Queens/New Argyle',
  },
  {
    label: 'New Dominion',
    value: 'CA/PE/Queens/New Dominion',
  },
  {
    label: 'New Haven',
    value: 'CA/PE/Queens/New Haven',
  },
  {
    label: 'Nine Mile Creek',
    value: 'CA/PE/Queens/Nine Mile Creek',
  },
  {
    label: 'North Milton',
    value: 'CA/PE/Queens/North Milton',
  },
  {
    label: 'North Rustico',
    value: 'CA/PE/Queens/North Rustico',
  },
  {
    label: 'North Wiltshire',
    value: 'CA/PE/Queens/North Wiltshire',
  },
  {
    label: 'North Winsloe',
    value: 'CA/PE/Queens/North Winsloe',
  },
  {
    label: 'Oyster Bed',
    value: 'CA/PE/Queens/Oyster Bed',
  },
  {
    label: 'Pisquid West',
    value: 'CA/PE/Queens/Pisquid West',
  },
  {
    label: 'Pleasant Grove',
    value: 'CA/PE/Queens/Pleasant Grove',
  },
  {
    label: 'Pownal',
    value: 'CA/PE/Queens/Pownal',
  },
  {
    label: 'Rice Point',
    value: 'CA/PE/Queens/Rice Point',
  },
  {
    label: 'Riverdale',
    value: 'CA/PE/Queens/Riverdale',
  },
  {
    label: 'Rocky Point',
    value: 'CA/PE/Queens/Rocky Point',
  },
  {
    label: 'Sea View',
    value: 'CA/PE/Queens/Sea View',
  },
  {
    label: 'Springvale',
    value: 'CA/PE/Queens/Springvale',
  },
  {
    label: 'Stanhope',
    value: 'CA/PE/Queens/Stanhope',
  },
  {
    label: 'Stratford',
    value: 'CA/PE/Queens/Stratford',
  },
  {
    label: 'Suffolk',
    value: 'CA/PE/Queens/Suffolk',
  },
  {
    label: 'Tarantum',
    value: 'CA/PE/Queens/Tarantum',
  },
  {
    label: 'Tracadie',
    value: 'CA/PE/Queens/Tracadie',
  },
  {
    label: 'Union Road',
    value: 'CA/PE/Queens/Union Road',
  },
  {
    label: 'Vernon Bridge',
    value: 'CA/PE/Queens/Vernon Bridge',
  },
  {
    label: 'Victoria',
    value: 'CA/PE/Queens/Victoria',
  },
  {
    label: 'Village Green',
    value: 'CA/PE/Queens/Village Green',
  },
  {
    label: 'Warren Grove',
    value: 'CA/PE/Queens/Warren Grove',
  },
  {
    label: 'Waterside',
    value: 'CA/PE/Queens/Waterside',
  },
  {
    label: 'Websters Corner',
    value: 'CA/PE/Queens/Websters Corner',
  },
  {
    label: 'West Covehead',
    value: 'CA/PE/Queens/West Covehead',
  },
  {
    label: 'Wheatley River',
    value: 'CA/PE/Queens/Wheatley River',
  },
  {
    label: 'Winsloe',
    value: 'CA/PE/Queens/Winsloe',
  },
  {
    label: 'Winsloe South',
    value: 'CA/PE/Queens/Winsloe South',
  },
  {
    label: 'York',
    value: 'CA/PE/Queens/York',
  },
  {
    label: 'Amos',
    value: 'CA/QC/Abitibi-Témiscamingue/Amos',
  },
  {
    label: 'Angliers',
    value: 'CA/QC/Abitibi-Témiscamingue/Angliers',
  },
  {
    label: 'Arntfield',
    value: 'CA/QC/Abitibi-Témiscamingue/Arntfield',
  },
  {
    label: 'Authier',
    value: 'CA/QC/Abitibi-Témiscamingue/Authier',
  },
  {
    label: 'Authier-Nord',
    value: 'CA/QC/Abitibi-Témiscamingue/Authier-Nord',
  },
  {
    label: 'Barraute',
    value: 'CA/QC/Abitibi-Témiscamingue/Barraute',
  },
  {
    label: 'Béarn',
    value: 'CA/QC/Abitibi-Témiscamingue/Béarn',
  },
  {
    label: 'Belcourt',
    value: 'CA/QC/Abitibi-Témiscamingue/Belcourt',
  },
  {
    label: 'Bellecombe',
    value: 'CA/QC/Abitibi-Témiscamingue/Bellecombe',
  },
  {
    label: 'Belleterre',
    value: 'CA/QC/Abitibi-Témiscamingue/Belleterre',
  },
  {
    label: 'Berry',
    value: 'CA/QC/Abitibi-Témiscamingue/Berry',
  },
  {
    label: 'Cadillac',
    value: 'CA/QC/Abitibi-Témiscamingue/Cadillac',
  },
  {
    label: 'Champneuf',
    value: 'CA/QC/Abitibi-Témiscamingue/Champneuf',
  },
  {
    label: 'Chazel',
    value: 'CA/QC/Abitibi-Témiscamingue/Chazel',
  },
  {
    label: 'Cléricy',
    value: 'CA/QC/Abitibi-Témiscamingue/Cléricy',
  },
  {
    label: 'Clerval',
    value: 'CA/QC/Abitibi-Témiscamingue/Clerval',
  },
  {
    label: 'Cloutier',
    value: 'CA/QC/Abitibi-Témiscamingue/Cloutier',
  },
  {
    label: 'Desmeloizes',
    value: 'CA/QC/Abitibi-Témiscamingue/Desmeloizes',
  },
  {
    label: 'Duhamel-Ouest',
    value: 'CA/QC/Abitibi-Témiscamingue/Duhamel-Ouest',
  },
  {
    label: 'Duparquet',
    value: 'CA/QC/Abitibi-Témiscamingue/Duparquet',
  },
  {
    label: 'Dupuy',
    value: 'CA/QC/Abitibi-Témiscamingue/Dupuy',
  },
  {
    label: 'Em-1-A-Sarcelle-Rupert',
    value: 'CA/QC/Abitibi-Témiscamingue/Em-1-A-Sarcelle-Rupert',
  },
  {
    label: 'Évain',
    value: 'CA/QC/Abitibi-Témiscamingue/Évain',
  },
  {
    label: 'Fugèreville',
    value: 'CA/QC/Abitibi-Témiscamingue/Fugèreville',
  },
  {
    label: 'Gallichan',
    value: 'CA/QC/Abitibi-Témiscamingue/Gallichan',
  },
  {
    label: 'Guérin',
    value: 'CA/QC/Abitibi-Témiscamingue/Guérin',
  },
  {
    label: 'Guyenne',
    value: 'CA/QC/Abitibi-Témiscamingue/Guyenne',
  },
  {
    label: "Hunter's Point",
    value: "CA/QC/Abitibi-Témiscamingue/Hunter's Point",
  },
  {
    label: 'Kebaowek',
    value: 'CA/QC/Abitibi-Témiscamingue/Kebaowek',
  },
  {
    label: 'Kipawa',
    value: 'CA/QC/Abitibi-Témiscamingue/Kipawa',
  },
  {
    label: 'Kitcisakik',
    value: 'CA/QC/Abitibi-Témiscamingue/Kitcisakik',
  },
  {
    label: 'La Corne',
    value: 'CA/QC/Abitibi-Témiscamingue/La Corne',
  },
  {
    label: 'La Morandière',
    value: 'CA/QC/Abitibi-Témiscamingue/La Morandière',
  },
  {
    label: 'La Motte',
    value: 'CA/QC/Abitibi-Témiscamingue/La Motte',
  },
  {
    label: 'La Reine',
    value: 'CA/QC/Abitibi-Témiscamingue/La Reine',
  },
  {
    label: 'La Sarre',
    value: 'CA/QC/Abitibi-Témiscamingue/La Sarre',
  },
  {
    label: 'Lac-Simon',
    value: 'CA/QC/Abitibi-Témiscamingue/Lac-Simon',
  },
  {
    label: 'Laforce',
    value: 'CA/QC/Abitibi-Témiscamingue/Laforce',
  },
  {
    label: 'Landrienne',
    value: 'CA/QC/Abitibi-Témiscamingue/Landrienne',
  },
  {
    label: 'Laniel',
    value: 'CA/QC/Abitibi-Témiscamingue/Laniel',
  },
  {
    label: 'Latulipe',
    value: 'CA/QC/Abitibi-Témiscamingue/Latulipe',
  },
  {
    label: 'Latulipe-Et-Gaboury',
    value: 'CA/QC/Abitibi-Témiscamingue/Latulipe-Et-Gaboury',
  },
  {
    label: 'Launay',
    value: 'CA/QC/Abitibi-Témiscamingue/Launay',
  },
  {
    label: 'Laverlochère',
    value: 'CA/QC/Abitibi-Témiscamingue/Laverlochère',
  },
  {
    label: 'Lorrainville',
    value: 'CA/QC/Abitibi-Témiscamingue/Lorrainville',
  },
  {
    label: 'Macamic',
    value: 'CA/QC/Abitibi-Témiscamingue/Macamic',
  },
  {
    label: 'Malartic',
    value: 'CA/QC/Abitibi-Témiscamingue/Malartic',
  },
  {
    label: 'Moffet',
    value: 'CA/QC/Abitibi-Témiscamingue/Moffet',
  },
  {
    label: 'Mont-Brun',
    value: 'CA/QC/Abitibi-Témiscamingue/Mont-Brun',
  },
  {
    label: 'Montbeillard',
    value: 'CA/QC/Abitibi-Témiscamingue/Montbeillard',
  },
  {
    label: 'Nédélec',
    value: 'CA/QC/Abitibi-Témiscamingue/Nédélec',
  },
  {
    label: 'Normétal',
    value: 'CA/QC/Abitibi-Témiscamingue/Normétal',
  },
  {
    label: 'Notre-Dame-Du-Nord',
    value: 'CA/QC/Abitibi-Témiscamingue/Notre-Dame-Du-Nord',
  },
  {
    label: 'Palmarolle',
    value: 'CA/QC/Abitibi-Témiscamingue/Palmarolle',
  },
  {
    label: 'Pikogan',
    value: 'CA/QC/Abitibi-Témiscamingue/Pikogan',
  },
  {
    label: 'Poularies',
    value: 'CA/QC/Abitibi-Témiscamingue/Poularies',
  },
  {
    label: 'Preissac',
    value: 'CA/QC/Abitibi-Témiscamingue/Preissac',
  },
  {
    label: 'Rapide-Danseur',
    value: 'CA/QC/Abitibi-Témiscamingue/Rapide-Danseur',
  },
  {
    label: 'Rémigny',
    value: 'CA/QC/Abitibi-Témiscamingue/Rémigny',
  },
  {
    label: 'Rivière-Héva',
    value: 'CA/QC/Abitibi-Témiscamingue/Rivière-Héva',
  },
  {
    label: 'Rochebaucourt',
    value: 'CA/QC/Abitibi-Témiscamingue/Rochebaucourt',
  },
  {
    label: 'Rollet',
    value: 'CA/QC/Abitibi-Témiscamingue/Rollet',
  },
  {
    label: 'Roquemaure',
    value: 'CA/QC/Abitibi-Témiscamingue/Roquemaure',
  },
  {
    label: 'Rouyn-Noranda',
    value: 'CA/QC/Abitibi-Témiscamingue/Rouyn-Noranda',
  },
  {
    label: 'Saint-Bruno-De-Guigues',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Bruno-De-Guigues',
  },
  {
    label: 'Saint-Dominique-Du-Rosaire',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Dominique-Du-Rosaire',
  },
  {
    label: 'Saint-Édouard-De-Fabre',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Édouard-De-Fabre',
  },
  {
    label: 'Saint-Eugène-De-Guigues',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Eugène-De-Guigues',
  },
  {
    label: 'Saint-Félix-De-Dalquier',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Félix-De-Dalquier',
  },
  {
    label: 'Saint-Lambert',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Lambert',
  },
  {
    label: 'Saint-Marc-De-Figuery',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Marc-De-Figuery',
  },
  {
    label: "Saint-Mathieu-D'harricana",
    value: "CA/QC/Abitibi-Témiscamingue/Saint-Mathieu-D'harricana",
  },
  {
    label: 'Saint-Vital-De-Clermont',
    value: 'CA/QC/Abitibi-Témiscamingue/Saint-Vital-De-Clermont',
  },
  {
    label: 'Sainte-Germaine-Boulé',
    value: 'CA/QC/Abitibi-Témiscamingue/Sainte-Germaine-Boulé',
  },
  {
    label: 'Sainte-Gertrude-De-Villeneuve',
    value: 'CA/QC/Abitibi-Témiscamingue/Sainte-Gertrude-De-Villeneuve',
  },
  {
    label: 'Sainte-Gertrude-Manneville',
    value: 'CA/QC/Abitibi-Témiscamingue/Sainte-Gertrude-Manneville',
  },
  {
    label: 'Sainte-Gertrude-Manneville',
    value: 'CA/QC/Abitibi-Témiscamingue/Sainte-Gertrude-Manneville',
  },
  {
    label: 'Sainte-Hélène-De-Mancebourg',
    value: 'CA/QC/Abitibi-Témiscamingue/Sainte-Hélène-De-Mancebourg',
  },
  {
    label: 'Senneterre',
    value: 'CA/QC/Abitibi-Témiscamingue/Senneterre',
  },
  {
    label: 'Sullivan',
    value: 'CA/QC/Abitibi-Témiscamingue/Sullivan',
  },
  {
    label: 'Taschereau',
    value: 'CA/QC/Abitibi-Témiscamingue/Taschereau',
  },
  {
    label: 'Témiscaming',
    value: 'CA/QC/Abitibi-Témiscamingue/Témiscaming',
  },
  {
    label: 'Timiskaming',
    value: 'CA/QC/Abitibi-Témiscamingue/Timiskaming',
  },
  {
    label: 'Trécesson',
    value: 'CA/QC/Abitibi-Témiscamingue/Trécesson',
  },
  {
    label: "Val-D'or",
    value: "CA/QC/Abitibi-Témiscamingue/Val-D'or",
  },
  {
    label: 'Val-Senneville',
    value: 'CA/QC/Abitibi-Témiscamingue/Val-Senneville',
  },
  {
    label: 'Vassan',
    value: 'CA/QC/Abitibi-Témiscamingue/Vassan',
  },
  {
    label: 'Ville-Marie',
    value: 'CA/QC/Abitibi-Témiscamingue/Ville-Marie',
  },
  {
    label: 'Villemontel',
    value: 'CA/QC/Abitibi-Témiscamingue/Villemontel',
  },
  {
    label: 'Winneway',
    value: 'CA/QC/Abitibi-Témiscamingue/Winneway',
  },
  {
    label: 'Albertville',
    value: 'CA/QC/Bas-Saint-Laurent/Albertville',
  },
  {
    label: 'Amqui',
    value: 'CA/QC/Bas-Saint-Laurent/Amqui',
  },
  {
    label: 'Auclair',
    value: 'CA/QC/Bas-Saint-Laurent/Auclair',
  },
  {
    label: 'Baie-Des-Sables',
    value: 'CA/QC/Bas-Saint-Laurent/Baie-Des-Sables',
  },
  {
    label: 'Biencourt',
    value: 'CA/QC/Bas-Saint-Laurent/Biencourt',
  },
  {
    label: 'Cabano',
    value: 'CA/QC/Bas-Saint-Laurent/Cabano',
  },
  {
    label: 'Cacouna',
    value: 'CA/QC/Bas-Saint-Laurent/Cacouna',
  },
  {
    label: 'Causapscal',
    value: 'CA/QC/Bas-Saint-Laurent/Causapscal',
  },
  {
    label: 'Dégelis',
    value: 'CA/QC/Bas-Saint-Laurent/Dégelis',
  },
  {
    label: 'Esprit-Saint',
    value: 'CA/QC/Bas-Saint-Laurent/Esprit-Saint',
  },
  {
    label: 'Grand-Métis',
    value: 'CA/QC/Bas-Saint-Laurent/Grand-Métis',
  },
  {
    label: 'Grosses-Roches',
    value: 'CA/QC/Bas-Saint-Laurent/Grosses-Roches',
  },
  {
    label: 'Kamouraska',
    value: 'CA/QC/Bas-Saint-Laurent/Kamouraska',
  },
  {
    label: 'La Pocatière',
    value: 'CA/QC/Bas-Saint-Laurent/La Pocatière',
  },
  {
    label: 'La Pocatière-Station',
    value: 'CA/QC/Bas-Saint-Laurent/La Pocatière-Station',
  },
  {
    label: 'La Rédemption',
    value: 'CA/QC/Bas-Saint-Laurent/La Rédemption',
  },
  {
    label: 'La Trinité-Des-Monts',
    value: 'CA/QC/Bas-Saint-Laurent/La Trinité-Des-Monts',
  },
  {
    label: 'Lac-Au-Saumon',
    value: 'CA/QC/Bas-Saint-Laurent/Lac-Au-Saumon',
  },
  {
    label: 'Lac-Des-Aigles',
    value: 'CA/QC/Bas-Saint-Laurent/Lac-Des-Aigles',
  },
  {
    label: 'Le Bic',
    value: 'CA/QC/Bas-Saint-Laurent/Le Bic',
  },
  {
    label: 'Lejeune',
    value: 'CA/QC/Bas-Saint-Laurent/Lejeune',
  },
  {
    label: 'Les Hauteurs',
    value: 'CA/QC/Bas-Saint-Laurent/Les Hauteurs',
  },
  {
    label: 'Les Méchins',
    value: 'CA/QC/Bas-Saint-Laurent/Les Méchins',
  },
  {
    label: "L'isle-Verte",
    value: "CA/QC/Bas-Saint-Laurent/L'isle-Verte",
  },
  {
    label: "L'isle-Verte-Ouest",
    value: "CA/QC/Bas-Saint-Laurent/L'isle-Verte-Ouest",
  },
  {
    label: 'Lots-Renversés',
    value: 'CA/QC/Bas-Saint-Laurent/Lots-Renversés',
  },
  {
    label: 'Matane',
    value: 'CA/QC/Bas-Saint-Laurent/Matane',
  },
  {
    label: 'Matapédia',
    value: 'CA/QC/Bas-Saint-Laurent/Matapédia',
  },
  {
    label: 'Métis-Sur-Mer',
    value: 'CA/QC/Bas-Saint-Laurent/Métis-Sur-Mer',
  },
  {
    label: 'Mont-Carmel',
    value: 'CA/QC/Bas-Saint-Laurent/Mont-Carmel',
  },
  {
    label: 'Mont-Joli',
    value: 'CA/QC/Bas-Saint-Laurent/Mont-Joli',
  },
  {
    label: 'Notre-Dame-Des-Neiges',
    value: 'CA/QC/Bas-Saint-Laurent/Notre-Dame-Des-Neiges',
  },
  {
    label: 'Notre-Dame-Des-Sept-Douleurs',
    value: 'CA/QC/Bas-Saint-Laurent/Notre-Dame-Des-Sept-Douleurs',
  },
  {
    label: 'Notre-Dame-Du-Lac',
    value: 'CA/QC/Bas-Saint-Laurent/Notre-Dame-Du-Lac',
  },
  {
    label: 'Notre-Dame-Du-Portage',
    value: 'CA/QC/Bas-Saint-Laurent/Notre-Dame-Du-Portage',
  },
  {
    label: 'Packington',
    value: 'CA/QC/Bas-Saint-Laurent/Packington',
  },
  {
    label: 'Padoue',
    value: 'CA/QC/Bas-Saint-Laurent/Padoue',
  },
  {
    label: 'Pohénégamook',
    value: 'CA/QC/Bas-Saint-Laurent/Pohénégamook',
  },
  {
    label: 'Price',
    value: 'CA/QC/Bas-Saint-Laurent/Price',
  },
  {
    label: 'Rimouski',
    value: 'CA/QC/Bas-Saint-Laurent/Rimouski',
  },
  {
    label: 'Rivière-Bleue',
    value: 'CA/QC/Bas-Saint-Laurent/Rivière-Bleue',
  },
  {
    label: 'Rivière-Du-Loup',
    value: 'CA/QC/Bas-Saint-Laurent/Rivière-Du-Loup',
  },
  {
    label: 'Rivière-Ouelle',
    value: 'CA/QC/Bas-Saint-Laurent/Rivière-Ouelle',
  },
  {
    label: 'Rivière-Trois-Pistoles',
    value: 'CA/QC/Bas-Saint-Laurent/Rivière-Trois-Pistoles',
  },
  {
    label: 'Routhierville',
    value: 'CA/QC/Bas-Saint-Laurent/Routhierville',
  },
  {
    label: 'Saint-Adelme',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Adelme',
  },
  {
    label: 'Saint-Alexandre-De-Kamouraska',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Alexandre-De-Kamouraska',
  },
  {
    label: 'Saint-Alexandre-Des-Lacs',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Alexandre-Des-Lacs',
  },
  {
    label: 'Saint-Anaclet-De-Lessard',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Anaclet-De-Lessard',
  },
  {
    label: 'Saint-André',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-André',
  },
  {
    label: 'Saint-Antonin',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Antonin',
  },
  {
    label: 'Saint-Arsène',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Arsène',
  },
  {
    label: 'Saint-Athanase',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Athanase',
  },
  {
    label: 'Saint-Bruno-De-Kamouraska',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Bruno-De-Kamouraska',
  },
  {
    label: 'Saint-Charles-Garnier',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Charles-Garnier',
  },
  {
    label: 'Saint-Clément',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Clément',
  },
  {
    label: 'Saint-Cléophas',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Cléophas',
  },
  {
    label: 'Saint-Cyprien',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Cyprien',
  },
  {
    label: 'Saint-Damase',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Damase',
  },
  {
    label: 'Saint-Denis-De La Bouteillerie',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Denis-De La Bouteillerie',
  },
  {
    label: 'Saint-Donat',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Donat',
  },
  {
    label: 'Saint-Éloi',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Éloi',
  },
  {
    label: 'Saint-Elzéar-De-Témiscouata',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Elzéar-De-Témiscouata',
  },
  {
    label: 'Saint-Épiphane',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Épiphane',
  },
  {
    label: 'Saint-Eugène-De-Ladrière',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Eugène-De-Ladrière',
  },
  {
    label: 'Saint-Eusèbe',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Eusèbe',
  },
  {
    label: 'Saint-Fabien',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Fabien',
  },
  {
    label: 'Saint-François-Xavier-De-Viger',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-François-Xavier-De-Viger',
  },
  {
    label: 'Saint-Gabriel-De-Rimouski',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Gabriel-De-Rimouski',
  },
  {
    label: 'Saint-Gabriel-Lalemant',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Gabriel-Lalemant',
  },
  {
    label: 'Saint-Germain',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Germain',
  },
  {
    label: 'Saint-Guy',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Guy',
  },
  {
    label: 'Saint-Honoré-De-Témiscouata',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Honoré-De-Témiscouata',
  },
  {
    label: 'Saint-Hubert-De-Rivière-Du-Loup',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Hubert-De-Rivière-Du-Loup',
  },
  {
    label: 'Saint-Jean-De-Cherbourg',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Jean-De-Cherbourg',
  },
  {
    label: 'Saint-Jean-De-Dieu',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Jean-De-Dieu',
  },
  {
    label: 'Saint-Jean-De-La-Lande',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Jean-De-La-Lande',
  },
  {
    label: 'Saint-Joseph-De-Kamouraska',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Joseph-De-Kamouraska',
  },
  {
    label: 'Saint-Joseph-De-Lepage',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Joseph-De-Lepage',
  },
  {
    label: 'Saint-Juste-Du-Lac',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Juste-Du-Lac',
  },
  {
    label: 'Saint-Léandre',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Léandre',
  },
  {
    label: 'Saint-Léon-Le-Grand',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Léon-Le-Grand',
  },
  {
    label: 'Saint-Louis-Du-Ha! Ha!',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Louis-Du-Ha! Ha!',
  },
  {
    label: 'Saint-Marc-Du-Lac-Long',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Marc-Du-Lac-Long',
  },
  {
    label: 'Saint-Marcellin',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Marcellin',
  },
  {
    label: 'Saint-Mathieu-De-Rioux',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Mathieu-De-Rioux',
  },
  {
    label: 'Saint-Médard',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Médard',
  },
  {
    label: 'Saint-Michel-Du-Squatec',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Michel-Du-Squatec',
  },
  {
    label: 'Saint-Modeste',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Modeste',
  },
  {
    label: 'Saint-Moïse',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Moïse',
  },
  {
    label: 'Saint-Narcisse',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Narcisse',
  },
  {
    label: 'Saint-Narcisse-De-Rimouski',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Narcisse-De-Rimouski',
  },
  {
    label: 'Saint-Noël',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Noël',
  },
  {
    label: 'Saint-Octave-De-Métis',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Octave-De-Métis',
  },
  {
    label: "Saint-Onésime-D'ixworth",
    value: "CA/QC/Bas-Saint-Laurent/Saint-Onésime-D'ixworth",
  },
  {
    label: 'Saint-Pacôme',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Pacôme',
  },
  {
    label: 'Saint-Pascal',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Pascal',
  },
  {
    label: 'Saint-Paul-De-La-Croix',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Paul-De-La-Croix',
  },
  {
    label: 'Saint-Philippe-De-Néri',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Philippe-De-Néri',
  },
  {
    label: 'Saint-Pierre-De-Lamy',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Pierre-De-Lamy',
  },
  {
    label: 'Saint-Simon',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Simon',
  },
  {
    label: 'Saint-Tharcisius',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Tharcisius',
  },
  {
    label: 'Saint-Ulric',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Ulric',
  },
  {
    label: 'Saint-Valérien',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Valérien',
  },
  {
    label: 'Saint-Vianney',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Vianney',
  },
  {
    label: 'Saint-Zénon-Du-Lac-Humqui',
    value: 'CA/QC/Bas-Saint-Laurent/Saint-Zénon-Du-Lac-Humqui',
  },
  {
    label: 'Sainte-Angèle-De-Mérici',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Angèle-De-Mérici',
  },
  {
    label: 'Sainte-Anne-De-La-Pocatière',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Anne-De-La-Pocatière',
  },
  {
    label: 'Sainte-Félicité',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Félicité',
  },
  {
    label: 'Sainte-Flavie',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Flavie',
  },
  {
    label: 'Sainte-Florence',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Florence',
  },
  {
    label: 'Sainte-Françoise',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Françoise',
  },
  {
    label: 'Sainte-Hélène-De-Kamouraska',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Hélène-De-Kamouraska',
  },
  {
    label: 'Sainte-Irène',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Irène',
  },
  {
    label: "Sainte-Jeanne-D'arc",
    value: "CA/QC/Bas-Saint-Laurent/Sainte-Jeanne-D'arc",
  },
  {
    label: 'Sainte-Luce',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Luce',
  },
  {
    label: 'Sainte-Marguerite-Marie',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Marguerite-Marie',
  },
  {
    label: 'Sainte-Paule',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Paule',
  },
  {
    label: 'Sainte-Rita',
    value: 'CA/QC/Bas-Saint-Laurent/Sainte-Rita',
  },
  {
    label: 'Sayabec',
    value: 'CA/QC/Bas-Saint-Laurent/Sayabec',
  },
  {
    label: 'St-Gabriel-De-Kamouraska',
    value: 'CA/QC/Bas-Saint-Laurent/St-Gabriel-De-Kamouraska',
  },
  {
    label: 'Témiscouata-Sur-Le-Lac',
    value: 'CA/QC/Bas-Saint-Laurent/Témiscouata-Sur-Le-Lac',
  },
  {
    label: 'Trois-Pistoles',
    value: 'CA/QC/Bas-Saint-Laurent/Trois-Pistoles',
  },
  {
    label: 'Val-Brillant',
    value: 'CA/QC/Bas-Saint-Laurent/Val-Brillant',
  },
  {
    label: 'Vendée',
    value: 'CA/QC/Bas-Saint-Laurent/Vendée',
  },
  {
    label: 'Whitworth',
    value: 'CA/QC/Bas-Saint-Laurent/Whitworth',
  },
  {
    label: 'Baie-Saint-Paul',
    value: 'CA/QC/Capitale-Nationale/Baie-Saint-Paul',
  },
  {
    label: 'Baie-Sainte-Catherine',
    value: 'CA/QC/Capitale-Nationale/Baie-Sainte-Catherine',
  },
  {
    label: 'Beaupré',
    value: 'CA/QC/Capitale-Nationale/Beaupré',
  },
  {
    label: 'Boischatel',
    value: 'CA/QC/Capitale-Nationale/Boischatel',
  },
  {
    label: 'Cap-Santé',
    value: 'CA/QC/Capitale-Nationale/Cap-Santé',
  },
  {
    label: 'Château-Richer',
    value: 'CA/QC/Capitale-Nationale/Château-Richer',
  },
  {
    label: 'Clermont',
    value: 'CA/QC/Capitale-Nationale/Clermont',
  },
  {
    label: 'Courcelette',
    value: 'CA/QC/Capitale-Nationale/Courcelette',
  },
  {
    label: 'Deschambault',
    value: 'CA/QC/Capitale-Nationale/Deschambault',
  },
  {
    label: 'Deschambault-Grondines',
    value: 'CA/QC/Capitale-Nationale/Deschambault-Grondines',
  },
  {
    label: 'Donnacona',
    value: 'CA/QC/Capitale-Nationale/Donnacona',
  },
  {
    label: 'Fossambault-Sur-Le-Lac',
    value: 'CA/QC/Capitale-Nationale/Fossambault-Sur-Le-Lac',
  },
  {
    label: 'Grondines',
    value: 'CA/QC/Capitale-Nationale/Grondines',
  },
  {
    label: 'La Baleine',
    value: 'CA/QC/Capitale-Nationale/La Baleine',
  },
  {
    label: 'La Malbaie',
    value: 'CA/QC/Capitale-Nationale/La Malbaie',
  },
  {
    label: 'Lac-Beauport',
    value: 'CA/QC/Capitale-Nationale/Lac-Beauport',
  },
  {
    label: 'Lac-Delage',
    value: 'CA/QC/Capitale-Nationale/Lac-Delage',
  },
  {
    label: 'Lac-Saint-Joseph',
    value: 'CA/QC/Capitale-Nationale/Lac-Saint-Joseph',
  },
  {
    label: 'Lac-Sergent',
    value: 'CA/QC/Capitale-Nationale/Lac-Sergent',
  },
  {
    label: "L'ancienne-Lorette",
    value: "CA/QC/Capitale-Nationale/L'ancienne-Lorette",
  },
  {
    label: "L'ange-Gardien",
    value: "CA/QC/Capitale-Nationale/L'ange-Gardien",
  },
  {
    label: 'Les Éboulements',
    value: 'CA/QC/Capitale-Nationale/Les Éboulements',
  },
  {
    label: "L'isle-Aux-Coudres",
    value: "CA/QC/Capitale-Nationale/L'isle-Aux-Coudres",
  },
  {
    label: 'Neuville',
    value: 'CA/QC/Capitale-Nationale/Neuville',
  },
  {
    label: 'Notre-Dame-Des-Anges',
    value: 'CA/QC/Capitale-Nationale/Notre-Dame-Des-Anges',
  },
  {
    label: 'Notre-Dame-Des-Monts',
    value: 'CA/QC/Capitale-Nationale/Notre-Dame-Des-Monts',
  },
  {
    label: 'Petite-Rivière-Saint-François',
    value: 'CA/QC/Capitale-Nationale/Petite-Rivière-Saint-François',
  },
  {
    label: 'Pont-Rouge',
    value: 'CA/QC/Capitale-Nationale/Pont-Rouge',
  },
  {
    label: 'Portneuf',
    value: 'CA/QC/Capitale-Nationale/Portneuf',
  },
  {
    label: 'Portneuf-Station',
    value: 'CA/QC/Capitale-Nationale/Portneuf-Station',
  },
  {
    label: 'Portneuf-Sur-Mer',
    value: 'CA/QC/Capitale-Nationale/Portneuf-Sur-Mer',
  },
  {
    label: 'Québec',
    value: 'CA/QC/Capitale-Nationale/Québec',
  },
  {
    label: 'Rivière-À-Pierre',
    value: 'CA/QC/Capitale-Nationale/Rivière-À-Pierre',
  },
  {
    label: 'Saint-Aimé-Des-Lacs',
    value: 'CA/QC/Capitale-Nationale/Saint-Aimé-Des-Lacs',
  },
  {
    label: 'Saint-Alban',
    value: 'CA/QC/Capitale-Nationale/Saint-Alban',
  },
  {
    label: 'Saint-Augustin-De-Desmaures',
    value: 'CA/QC/Capitale-Nationale/Saint-Augustin-De-Desmaures',
  },
  {
    label: 'Saint-Basile',
    value: 'CA/QC/Capitale-Nationale/Saint-Basile',
  },
  {
    label: 'Saint-Bernard-Sur-Mer',
    value: 'CA/QC/Capitale-Nationale/Saint-Bernard-Sur-Mer',
  },
  {
    label: 'Saint-Casimir',
    value: 'CA/QC/Capitale-Nationale/Saint-Casimir',
  },
  {
    label: 'Saint-Ferréol-Les-Neiges',
    value: 'CA/QC/Capitale-Nationale/Saint-Ferréol-Les-Neiges',
  },
  {
    label: "Saint-François-De-L'île-D'orléans",
    value: "CA/QC/Capitale-Nationale/Saint-François-De-L'île-D'orléans",
  },
  {
    label: 'Saint-Gabriel-De-Valcartier',
    value: 'CA/QC/Capitale-Nationale/Saint-Gabriel-De-Valcartier',
  },
  {
    label: 'Saint-Gilbert',
    value: 'CA/QC/Capitale-Nationale/Saint-Gilbert',
  },
  {
    label: 'Saint-Hilarion',
    value: 'CA/QC/Capitale-Nationale/Saint-Hilarion',
  },
  {
    label: 'Saint-Irénée',
    value: 'CA/QC/Capitale-Nationale/Saint-Irénée',
  },
  {
    label: "Saint-Jean-De-L'île-D'orléans",
    value: "CA/QC/Capitale-Nationale/Saint-Jean-De-L'île-D'orléans",
  },
  {
    label: 'Saint-Joachim',
    value: 'CA/QC/Capitale-Nationale/Saint-Joachim',
  },
  {
    label: 'Saint-Joseph-De-La-Rive',
    value: 'CA/QC/Capitale-Nationale/Saint-Joseph-De-La-Rive',
  },
  {
    label: 'Saint-Léonard-De-Portneuf',
    value: 'CA/QC/Capitale-Nationale/Saint-Léonard-De-Portneuf',
  },
  {
    label: 'Saint-Louis-De-Gonzague-Du-Cap-Tourmente',
    value: 'CA/QC/Capitale-Nationale/Saint-Louis-De-Gonzague-Du-Cap-Tourmente',
  },
  {
    label: 'Saint-Marc-Des-Carrières',
    value: 'CA/QC/Capitale-Nationale/Saint-Marc-Des-Carrières',
  },
  {
    label: 'Saint-Nicolas',
    value: 'CA/QC/Capitale-Nationale/Saint-Nicolas',
  },
  {
    label: "Saint-Pierre-De-L'île-D'orléans",
    value: "CA/QC/Capitale-Nationale/Saint-Pierre-De-L'île-D'orléans",
  },
  {
    label: 'Saint-Raymond',
    value: 'CA/QC/Capitale-Nationale/Saint-Raymond',
  },
  {
    label: 'Saint-Siméon',
    value: 'CA/QC/Capitale-Nationale/Saint-Siméon',
  },
  {
    label: 'Saint-Thuribe',
    value: 'CA/QC/Capitale-Nationale/Saint-Thuribe',
  },
  {
    label: 'Saint-Tite-Des-Caps',
    value: 'CA/QC/Capitale-Nationale/Saint-Tite-Des-Caps',
  },
  {
    label: 'Saint-Ubalde',
    value: 'CA/QC/Capitale-Nationale/Saint-Ubalde',
  },
  {
    label: 'Saint-Urbain',
    value: 'CA/QC/Capitale-Nationale/Saint-Urbain',
  },
  {
    label: 'Sainte-Anne-De-Beaupré',
    value: 'CA/QC/Capitale-Nationale/Sainte-Anne-De-Beaupré',
  },
  {
    label: 'Sainte-Brigitte-De-Laval',
    value: 'CA/QC/Capitale-Nationale/Sainte-Brigitte-De-Laval',
  },
  {
    label: 'Sainte-Catherine-De-La-Jacques-Cartier',
    value: 'CA/QC/Capitale-Nationale/Sainte-Catherine-De-La-Jacques-Cartier',
  },
  {
    label: 'Sainte-Catherine-De-La-Jacques-Cartier',
    value: 'CA/QC/Capitale-Nationale/Sainte-Catherine-De-La-Jacques-Cartier',
  },
  {
    label: 'Sainte-Famille',
    value: 'CA/QC/Capitale-Nationale/Sainte-Famille',
  },
  {
    label: 'Sainte-Pétronille',
    value: 'CA/QC/Capitale-Nationale/Sainte-Pétronille',
  },
  {
    label: 'Shannon',
    value: 'CA/QC/Capitale-Nationale/Shannon',
  },
  {
    label: 'Ste-Catherine-De-La-J-Cartier',
    value: 'CA/QC/Capitale-Nationale/Ste-Catherine-De-La-J-Cartier',
  },
  {
    label: 'Stoneham',
    value: 'CA/QC/Capitale-Nationale/Stoneham',
  },
  {
    label: 'Stoneham-Et-Tewkesbury',
    value: 'CA/QC/Capitale-Nationale/Stoneham-Et-Tewkesbury',
  },
  {
    label: 'Wendake',
    value: 'CA/QC/Capitale-Nationale/Wendake',
  },
  {
    label: 'Aston-Jonction',
    value: 'CA/QC/Centre-du-Québec/Aston-Jonction',
  },
  {
    label: 'Baie-Du-Febvre',
    value: 'CA/QC/Centre-du-Québec/Baie-Du-Febvre',
  },
  {
    label: 'Bécancour',
    value: 'CA/QC/Centre-du-Québec/Bécancour',
  },
  {
    label: 'Chesterville',
    value: 'CA/QC/Centre-du-Québec/Chesterville',
  },
  {
    label: 'Daveluyville',
    value: 'CA/QC/Centre-du-Québec/Daveluyville',
  },
  {
    label: 'Deschaillons-Sur-Saint-Laurent',
    value: 'CA/QC/Centre-du-Québec/Deschaillons-Sur-Saint-Laurent',
  },
  {
    label: 'Drummondville',
    value: 'CA/QC/Centre-du-Québec/Drummondville',
  },
  {
    label: 'Durham-Sud',
    value: 'CA/QC/Centre-du-Québec/Durham-Sud',
  },
  {
    label: 'Fortierville',
    value: 'CA/QC/Centre-du-Québec/Fortierville',
  },
  {
    label: 'Foster',
    value: 'CA/QC/Centre-du-Québec/Foster',
  },
  {
    label: 'Grand-Saint-Esprit',
    value: 'CA/QC/Centre-du-Québec/Grand-Saint-Esprit',
  },
  {
    label: 'Ham-Nord',
    value: 'CA/QC/Centre-du-Québec/Ham-Nord',
  },
  {
    label: 'Inverness',
    value: 'CA/QC/Centre-du-Québec/Inverness',
  },
  {
    label: 'Kingsey Falls',
    value: 'CA/QC/Centre-du-Québec/Kingsey Falls',
  },
  {
    label: 'La Visitation-De-Yamaska',
    value: 'CA/QC/Centre-du-Québec/La Visitation-De-Yamaska',
  },
  {
    label: 'Laurierville',
    value: 'CA/QC/Centre-du-Québec/Laurierville',
  },
  {
    label: "L'avenir",
    value: "CA/QC/Centre-du-Québec/L'avenir",
  },
  {
    label: 'Lefebvre',
    value: 'CA/QC/Centre-du-Québec/Lefebvre',
  },
  {
    label: 'Lemieux',
    value: 'CA/QC/Centre-du-Québec/Lemieux',
  },
  {
    label: 'Lyster',
    value: 'CA/QC/Centre-du-Québec/Lyster',
  },
  {
    label: 'Maddington Falls',
    value: 'CA/QC/Centre-du-Québec/Maddington Falls',
  },
  {
    label: 'Manseau',
    value: 'CA/QC/Centre-du-Québec/Manseau',
  },
  {
    label: 'Nicolet',
    value: 'CA/QC/Centre-du-Québec/Nicolet',
  },
  {
    label: 'Norbertville',
    value: 'CA/QC/Centre-du-Québec/Norbertville',
  },
  {
    label: 'Notre-Dame-De-Ham',
    value: 'CA/QC/Centre-du-Québec/Notre-Dame-De-Ham',
  },
  {
    label: 'Notre-Dame-De-Lourdes',
    value: 'CA/QC/Centre-du-Québec/Notre-Dame-De-Lourdes',
  },
  {
    label: 'Notre-Dame-Du-Bon-Conseil',
    value: 'CA/QC/Centre-du-Québec/Notre-Dame-Du-Bon-Conseil',
  },
  {
    label: 'Odanak',
    value: 'CA/QC/Centre-du-Québec/Odanak',
  },
  {
    label: 'Parisville',
    value: 'CA/QC/Centre-du-Québec/Parisville',
  },
  {
    label: 'Pierreville',
    value: 'CA/QC/Centre-du-Québec/Pierreville',
  },
  {
    label: 'Plessisville',
    value: 'CA/QC/Centre-du-Québec/Plessisville',
  },
  {
    label: 'Princeville',
    value: 'CA/QC/Centre-du-Québec/Princeville',
  },
  {
    label: 'Saint-Albert',
    value: 'CA/QC/Centre-du-Québec/Saint-Albert',
  },
  {
    label: 'Saint-Bonaventure',
    value: 'CA/QC/Centre-du-Québec/Saint-Bonaventure',
  },
  {
    label: 'Saint-Célestin',
    value: 'CA/QC/Centre-du-Québec/Saint-Célestin',
  },
  {
    label: 'Saint-Charles-De-Drummond',
    value: 'CA/QC/Centre-du-Québec/Saint-Charles-De-Drummond',
  },
  {
    label: "Saint-Christophe-D'arthabaska",
    value: "CA/QC/Centre-du-Québec/Saint-Christophe-D'arthabaska",
  },
  {
    label: 'Saint-Cyrille-De-Wendover',
    value: 'CA/QC/Centre-du-Québec/Saint-Cyrille-De-Wendover',
  },
  {
    label: 'Saint-Edmond-De-Grantham',
    value: 'CA/QC/Centre-du-Québec/Saint-Edmond-De-Grantham',
  },
  {
    label: 'Saint-Elphège',
    value: 'CA/QC/Centre-du-Québec/Saint-Elphège',
  },
  {
    label: 'Saint-Eugène',
    value: 'CA/QC/Centre-du-Québec/Saint-Eugène',
  },
  {
    label: 'Saint-Félix-De-Kingsey',
    value: 'CA/QC/Centre-du-Québec/Saint-Félix-De-Kingsey',
  },
  {
    label: 'Saint-Ferdinand',
    value: 'CA/QC/Centre-du-Québec/Saint-Ferdinand',
  },
  {
    label: 'Saint-François-Du-Lac',
    value: 'CA/QC/Centre-du-Québec/Saint-François-Du-Lac',
  },
  {
    label: 'Saint-Germain-De-Grantham',
    value: 'CA/QC/Centre-du-Québec/Saint-Germain-De-Grantham',
  },
  {
    label: 'Saint-Guillaume',
    value: 'CA/QC/Centre-du-Québec/Saint-Guillaume',
  },
  {
    label: 'Saint-Joachim-De-Courval',
    value: 'CA/QC/Centre-du-Québec/Saint-Joachim-De-Courval',
  },
  {
    label: "Saint-Léonard-D'aston",
    value: "CA/QC/Centre-du-Québec/Saint-Léonard-D'aston",
  },
  {
    label: 'Saint-Louis-De-Blandford',
    value: 'CA/QC/Centre-du-Québec/Saint-Louis-De-Blandford',
  },
  {
    label: 'Saint-Lucien',
    value: 'CA/QC/Centre-du-Québec/Saint-Lucien',
  },
  {
    label: 'Saint-Majorique-De-Grantham',
    value: 'CA/QC/Centre-du-Québec/Saint-Majorique-De-Grantham',
  },
  {
    label: 'Saint-Nicéphore',
    value: 'CA/QC/Centre-du-Québec/Saint-Nicéphore',
  },
  {
    label: "Saint-Norbert-D'arthabaska",
    value: "CA/QC/Centre-du-Québec/Saint-Norbert-D'arthabaska",
  },
  {
    label: 'Saint-Pie-De-Guire',
    value: 'CA/QC/Centre-du-Québec/Saint-Pie-De-Guire',
  },
  {
    label: 'Saint-Pierre-Baptiste',
    value: 'CA/QC/Centre-du-Québec/Saint-Pierre-Baptiste',
  },
  {
    label: 'Saint-Pierre-Les-Becquets',
    value: 'CA/QC/Centre-du-Québec/Saint-Pierre-Les-Becquets',
  },
  {
    label: 'Saint-Rémi-De-Tingwick',
    value: 'CA/QC/Centre-du-Québec/Saint-Rémi-De-Tingwick',
  },
  {
    label: 'Saint-Rosaire',
    value: 'CA/QC/Centre-du-Québec/Saint-Rosaire',
  },
  {
    label: 'Saint-Samuel',
    value: 'CA/QC/Centre-du-Québec/Saint-Samuel',
  },
  {
    label: 'Saint-Sylvère',
    value: 'CA/QC/Centre-du-Québec/Saint-Sylvère',
  },
  {
    label: 'Saint-Valère',
    value: 'CA/QC/Centre-du-Québec/Saint-Valère',
  },
  {
    label: 'Saint-Wenceslas',
    value: 'CA/QC/Centre-du-Québec/Saint-Wenceslas',
  },
  {
    label: 'Saint-Zéphirin-De-Courval',
    value: 'CA/QC/Centre-du-Québec/Saint-Zéphirin-De-Courval',
  },
  {
    label: 'Sainte-Brigitte-Des-Saults',
    value: 'CA/QC/Centre-du-Québec/Sainte-Brigitte-Des-Saults',
  },
  {
    label: 'Sainte-Cécile-De-Lévrard',
    value: 'CA/QC/Centre-du-Québec/Sainte-Cécile-De-Lévrard',
  },
  {
    label: 'Sainte-Clotilde-De-Horton',
    value: 'CA/QC/Centre-du-Québec/Sainte-Clotilde-De-Horton',
  },
  {
    label: 'Sainte-Élizabeth-De-Warwick',
    value: 'CA/QC/Centre-du-Québec/Sainte-Élizabeth-De-Warwick',
  },
  {
    label: 'Sainte-Eulalie',
    value: 'CA/QC/Centre-du-Québec/Sainte-Eulalie',
  },
  {
    label: 'Sainte-Françoise',
    value: 'CA/QC/Centre-du-Québec/Sainte-Françoise',
  },
  {
    label: 'Sainte-Hélène-De-Chester',
    value: 'CA/QC/Centre-du-Québec/Sainte-Hélène-De-Chester',
  },
  {
    label: 'Sainte-Marie-De-Blandford',
    value: 'CA/QC/Centre-du-Québec/Sainte-Marie-De-Blandford',
  },
  {
    label: 'Sainte-Monique',
    value: 'CA/QC/Centre-du-Québec/Sainte-Monique',
  },
  {
    label: 'Sainte-Perpétue',
    value: 'CA/QC/Centre-du-Québec/Sainte-Perpétue',
  },
  {
    label: 'Sainte-Séraphine',
    value: 'CA/QC/Centre-du-Québec/Sainte-Séraphine',
  },
  {
    label: 'Sainte-Sophie-De-Lévrard',
    value: 'CA/QC/Centre-du-Québec/Sainte-Sophie-De-Lévrard',
  },
  {
    label: "Sainte-Sophie-D'halifax",
    value: "CA/QC/Centre-du-Québec/Sainte-Sophie-D'halifax",
  },
  {
    label: "Sainte-Sophie-D'halifax",
    value: "CA/QC/Centre-du-Québec/Sainte-Sophie-D'halifax",
  },
  {
    label: 'Saints-Martyrs-Canadiens',
    value: 'CA/QC/Centre-du-Québec/Saints-Martyrs-Canadiens',
  },
  {
    label: 'Tingwick',
    value: 'CA/QC/Centre-du-Québec/Tingwick',
  },
  {
    label: 'Victoriaville',
    value: 'CA/QC/Centre-du-Québec/Victoriaville',
  },
  {
    label: 'Villeroy',
    value: 'CA/QC/Centre-du-Québec/Villeroy',
  },
  {
    label: 'Warwick',
    value: 'CA/QC/Centre-du-Québec/Warwick',
  },
  {
    label: 'Wickham',
    value: 'CA/QC/Centre-du-Québec/Wickham',
  },
  {
    label: 'Wôlinak',
    value: 'CA/QC/Centre-du-Québec/Wôlinak',
  },
  {
    label: 'Adstock',
    value: 'CA/QC/Chaudière-Appalaches/Adstock',
  },
  {
    label: 'Armagh',
    value: 'CA/QC/Chaudière-Appalaches/Armagh',
  },
  {
    label: 'Aubert-Gallion',
    value: 'CA/QC/Chaudière-Appalaches/Aubert-Gallion',
  },
  {
    label: 'Beauceville',
    value: 'CA/QC/Chaudière-Appalaches/Beauceville',
  },
  {
    label: 'Beaulac-Garthby',
    value: 'CA/QC/Chaudière-Appalaches/Beaulac-Garthby',
  },
  {
    label: 'Beaumont',
    value: 'CA/QC/Chaudière-Appalaches/Beaumont',
  },
  {
    label: 'Berthier-Sur-Mer',
    value: 'CA/QC/Chaudière-Appalaches/Berthier-Sur-Mer',
  },
  {
    label: 'Cap-Saint-Ignace',
    value: 'CA/QC/Chaudière-Appalaches/Cap-Saint-Ignace',
  },
  {
    label: 'Charny',
    value: 'CA/QC/Chaudière-Appalaches/Charny',
  },
  {
    label: 'Disraeli',
    value: 'CA/QC/Chaudière-Appalaches/Disraeli',
  },
  {
    label: 'Dosquet',
    value: 'CA/QC/Chaudière-Appalaches/Dosquet',
  },
  {
    label: 'East Broughton',
    value: 'CA/QC/Chaudière-Appalaches/East Broughton',
  },
  {
    label: 'East Broughton Station',
    value: 'CA/QC/Chaudière-Appalaches/East Broughton Station',
  },
  {
    label: 'Frampton',
    value: 'CA/QC/Chaudière-Appalaches/Frampton',
  },
  {
    label: 'Honfleur',
    value: 'CA/QC/Chaudière-Appalaches/Honfleur',
  },
  {
    label: 'Irlande',
    value: 'CA/QC/Chaudière-Appalaches/Irlande',
  },
  {
    label: "Kinnear's Mills",
    value: "CA/QC/Chaudière-Appalaches/Kinnear's Mills",
  },
  {
    label: 'La Durantaye',
    value: 'CA/QC/Chaudière-Appalaches/La Durantaye',
  },
  {
    label: 'La Guadeloupe',
    value: 'CA/QC/Chaudière-Appalaches/La Guadeloupe',
  },
  {
    label: 'Lac-Etchemin',
    value: 'CA/QC/Chaudière-Appalaches/Lac-Etchemin',
  },
  {
    label: 'Lac-Frontière',
    value: 'CA/QC/Chaudière-Appalaches/Lac-Frontière',
  },
  {
    label: 'Lac-Poulin',
    value: 'CA/QC/Chaudière-Appalaches/Lac-Poulin',
  },
  {
    label: 'Lamartine',
    value: 'CA/QC/Chaudière-Appalaches/Lamartine',
  },
  {
    label: 'Laurier-Station',
    value: 'CA/QC/Chaudière-Appalaches/Laurier-Station',
  },
  {
    label: 'Leclercville',
    value: 'CA/QC/Chaudière-Appalaches/Leclercville',
  },
  {
    label: 'Lévis',
    value: 'CA/QC/Chaudière-Appalaches/Lévis',
  },
  {
    label: "L'islet",
    value: "CA/QC/Chaudière-Appalaches/L'islet",
  },
  {
    label: "L'isletville",
    value: "CA/QC/Chaudière-Appalaches/L'isletville",
  },
  {
    label: 'Lotbinière',
    value: 'CA/QC/Chaudière-Appalaches/Lotbinière',
  },
  {
    label: 'Montmagny',
    value: 'CA/QC/Chaudière-Appalaches/Montmagny',
  },
  {
    label: 'Notre-Dame-Auxiliatrice-De-Buckland',
    value: 'CA/QC/Chaudière-Appalaches/Notre-Dame-Auxiliatrice-De-Buckland',
  },
  {
    label: 'Notre-Dame-Des-Pins',
    value: 'CA/QC/Chaudière-Appalaches/Notre-Dame-Des-Pins',
  },
  {
    label: 'Notre-Dame-Du-Rosaire',
    value: 'CA/QC/Chaudière-Appalaches/Notre-Dame-Du-Rosaire',
  },
  {
    label: "Notre-Dame-Du-Sacré-Coeur-D'issoudun",
    value: "CA/QC/Chaudière-Appalaches/Notre-Dame-Du-Sacré-Coeur-D'issoudun",
  },
  {
    label: 'Pintendre',
    value: 'CA/QC/Chaudière-Appalaches/Pintendre',
  },
  {
    label: 'Ravignan',
    value: 'CA/QC/Chaudière-Appalaches/Ravignan',
  },
  {
    label: 'Sacré-Coeur-De-Jésus',
    value: 'CA/QC/Chaudière-Appalaches/Sacré-Coeur-De-Jésus',
  },
  {
    label: 'Saint-Adalbert',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Adalbert',
  },
  {
    label: "Saint-Adrien-D'irlande",
    value: "CA/QC/Chaudière-Appalaches/Saint-Adrien-D'irlande",
  },
  {
    label: 'Saint-Agapit',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Agapit',
  },
  {
    label: 'Saint-Alfred',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Alfred',
  },
  {
    label: 'Saint-Anselme',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Anselme',
  },
  {
    label: "Saint-Antoine-De-L'isle-Aux-Grues",
    value: "CA/QC/Chaudière-Appalaches/Saint-Antoine-De-L'isle-Aux-Grues",
  },
  {
    label: 'Saint-Antoine-De-Tilly',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Antoine-De-Tilly',
  },
  {
    label: 'Saint-Apollinaire',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Apollinaire',
  },
  {
    label: 'Saint-Aubert',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Aubert',
  },
  {
    label: 'Saint-Benjamin',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Benjamin',
  },
  {
    label: 'Saint-Benoît-Labre',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Benoît-Labre',
  },
  {
    label: 'Saint-Bernard',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Bernard',
  },
  {
    label: 'Saint-Camille-De-Lellis',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Camille-De-Lellis',
  },
  {
    label: 'Saint-Charles-De-Bellechasse',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Charles-De-Bellechasse',
  },
  {
    label: 'Saint-Côme-Linière',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Côme-Linière',
  },
  {
    label: 'Saint-Cyprien',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Cyprien',
  },
  {
    label: 'Saint-Cyrille-De-Lessard',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Cyrille-De-Lessard',
  },
  {
    label: "Saint-Damase-De-L'islet",
    value: "CA/QC/Chaudière-Appalaches/Saint-Damase-De-L'islet",
  },
  {
    label: 'Saint-Damien-De-Buckland',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Damien-De-Buckland',
  },
  {
    label: 'Saint-Édouard-De-Lotbinière',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Édouard-De-Lotbinière',
  },
  {
    label: 'Saint-Elzéar',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Elzéar',
  },
  {
    label: 'Saint-Éphrem-De-Beauce',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Éphrem-De-Beauce',
  },
  {
    label: 'Saint-Étienne-De-Lauzon',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Étienne-De-Lauzon',
  },
  {
    label: 'Saint-Évariste-De-Forsyth',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Évariste-De-Forsyth',
  },
  {
    label: 'Saint-Fabien-De-Panet',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Fabien-De-Panet',
  },
  {
    label: 'Saint-Flavien',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Flavien',
  },
  {
    label: 'Saint-Fortunat',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Fortunat',
  },
  {
    label: 'Saint-François-De-La-Rivière-Du-Sud',
    value: 'CA/QC/Chaudière-Appalaches/Saint-François-De-La-Rivière-Du-Sud',
  },
  {
    label: 'Saint-Frédéric',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Frédéric',
  },
  {
    label: 'Saint-Gédéon-De-Beauce',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Gédéon-De-Beauce',
  },
  {
    label: 'Saint-Georges',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Georges',
  },
  {
    label: 'Saint-Georges-De-Champlain',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Georges-De-Champlain',
  },
  {
    label: 'Saint-Georges-Est',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Georges-Est',
  },
  {
    label: 'Saint-Gervais',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Gervais',
  },
  {
    label: 'Saint-Gilles',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Gilles',
  },
  {
    label: 'Saint-Henri',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Henri',
  },
  {
    label: 'Saint-Hilaire-De-Dorset',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Hilaire-De-Dorset',
  },
  {
    label: 'Saint-Honoré-De-Shenley',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Honoré-De-Shenley',
  },
  {
    label: 'Saint-Isidore',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Isidore',
  },
  {
    label: 'Saint-Jacques-De-Leeds',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Jacques-De-Leeds',
  },
  {
    label: 'Saint-Jacques-Le-Majeur-De-Wolfestown',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Jacques-Le-Majeur-De-Wolfestown',
  },
  {
    label: 'Saint-Janvier-De-Joly',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Janvier-De-Joly',
  },
  {
    label: 'Saint-Jean-Chrysostome',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Jean-Chrysostome',
  },
  {
    label: 'Saint-Jean-De-Brébeuf',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Jean-De-Brébeuf',
  },
  {
    label: 'Saint-Jean-Port-Joli',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Jean-Port-Joli',
  },
  {
    label: 'Saint-Joseph-De-Beauce',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Joseph-De-Beauce',
  },
  {
    label: 'Saint-Joseph-De-Coleraine',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Joseph-De-Coleraine',
  },
  {
    label: 'Saint-Joseph-Des-Érables',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Joseph-Des-Érables',
  },
  {
    label: 'Saint-Jules',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Jules',
  },
  {
    label: 'Saint-Julien',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Julien',
  },
  {
    label: 'Saint-Just-De-Bretenières',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Just-De-Bretenières',
  },
  {
    label: 'Saint-Lambert-De-Lauzon',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Lambert-De-Lauzon',
  },
  {
    label: 'Saint-Lazare-De-Bellechasse',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Lazare-De-Bellechasse',
  },
  {
    label: 'Saint-Léon-De-Standon',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Léon-De-Standon',
  },
  {
    label: 'Saint-Luc-De-Bellechasse',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Luc-De-Bellechasse',
  },
  {
    label: 'Saint-Magloire',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Magloire',
  },
  {
    label: 'Saint-Malachie',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Malachie',
  },
  {
    label: 'Saint-Marcel',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Marcel',
  },
  {
    label: 'Saint-Martin',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Martin',
  },
  {
    label: 'Saint-Michel-De-Bellechasse',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Michel-De-Bellechasse',
  },
  {
    label: 'Saint-Narcisse-De-Beaurivage',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Narcisse-De-Beaurivage',
  },
  {
    label: 'Saint-Nazaire-De-Dorchester',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Nazaire-De-Dorchester',
  },
  {
    label: 'Saint-Nérée-De-Bellechasse',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Nérée-De-Bellechasse',
  },
  {
    label: 'Saint-Nicolas',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Nicolas',
  },
  {
    label: 'Saint-Odilon-De-Cranbourne',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Odilon-De-Cranbourne',
  },
  {
    label: 'Saint-Omer',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Omer',
  },
  {
    label: "Saint-Omer-L'islet",
    value: "CA/QC/Chaudière-Appalaches/Saint-Omer-L'islet",
  },
  {
    label: 'Saint-Pamphile',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Pamphile',
  },
  {
    label: 'Saint-Patrice-De-Beaurivage',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Patrice-De-Beaurivage',
  },
  {
    label: 'Saint-Paul-De-Montminy',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Paul-De-Montminy',
  },
  {
    label: 'Saint-Philémon',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Philémon',
  },
  {
    label: 'Saint-Philibert',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Philibert',
  },
  {
    label: 'Saint-Pierre-De-Broughton',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Pierre-De-Broughton',
  },
  {
    label: 'Saint-Pierre-De-La-Rivière-Du-Sud',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Pierre-De-La-Rivière-Du-Sud',
  },
  {
    label: 'Saint-Prosper',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Prosper',
  },
  {
    label: 'Saint-Prosper-De-Dorchester',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Prosper-De-Dorchester',
  },
  {
    label: 'Saint-Raphaël',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Raphaël',
  },
  {
    label: 'Saint-Rédempteur',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Rédempteur',
  },
  {
    label: 'Saint-René',
    value: 'CA/QC/Chaudière-Appalaches/Saint-René',
  },
  {
    label: 'Saint-Roch-Des-Aulnaies',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Roch-Des-Aulnaies',
  },
  {
    label: 'Saint-Romuald',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Romuald',
  },
  {
    label: 'Saint-Séverin',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Séverin',
  },
  {
    label: 'Saint-Simon-Les-Mines',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Simon-Les-Mines',
  },
  {
    label: 'Saint-Sylvestre',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Sylvestre',
  },
  {
    label: 'Saint-Théophile',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Théophile',
  },
  {
    label: 'Saint-Vallier',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Vallier',
  },
  {
    label: 'Saint-Victor',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Victor',
  },
  {
    label: 'Saint-Zacharie',
    value: 'CA/QC/Chaudière-Appalaches/Saint-Zacharie',
  },
  {
    label: 'Sainte-Agathe-De-Lotbinière',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Agathe-De-Lotbinière',
  },
  {
    label: 'Sainte-Agathe-De-Lotbinière',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Agathe-De-Lotbinière',
  },
  {
    label: 'Sainte-Apolline-De-Patton',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Apolline-De-Patton',
  },
  {
    label: 'Sainte-Apolline-De-Patton',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Apolline-De-Patton',
  },
  {
    label: 'Sainte-Aurélie',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Aurélie',
  },
  {
    label: 'Sainte-Aurélie',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Aurélie',
  },
  {
    label: 'Sainte-Claire',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Claire',
  },
  {
    label: 'Sainte-Claire',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Claire',
  },
  {
    label: 'Sainte-Clotilde-De-Beauce',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Clotilde-De-Beauce',
  },
  {
    label: 'Sainte-Clotilde-De-Beauce',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Clotilde-De-Beauce',
  },
  {
    label: 'Sainte-Croix',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Croix',
  },
  {
    label: 'Sainte-Croix',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Croix',
  },
  {
    label: 'Sainte-Euphémie-Sur-Rivière-Du-Sud',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Euphémie-Sur-Rivière-Du-Sud',
  },
  {
    label: 'Sainte-Euphémie-Sur-Rivière-Du-Sud',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Euphémie-Sur-Rivière-Du-Sud',
  },
  {
    label: 'Sainte-Félicité',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Félicité',
  },
  {
    label: 'Sainte-Félicité',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Félicité',
  },
  {
    label: 'Sainte-Hélène-De-Breakeyville',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Hélène-De-Breakeyville',
  },
  {
    label: 'Sainte-Hélène-De-Breakeyville',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Hélène-De-Breakeyville',
  },
  {
    label: 'Sainte-Hénédine',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Hénédine',
  },
  {
    label: 'Sainte-Hénédine',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Hénédine',
  },
  {
    label: 'Sainte-Justine',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Justine',
  },
  {
    label: 'Sainte-Justine',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Justine',
  },
  {
    label: 'Sainte-Louise',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Louise',
  },
  {
    label: 'Sainte-Louise',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Louise',
  },
  {
    label: 'Sainte-Lucie-De-Beauregard',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Lucie-De-Beauregard',
  },
  {
    label: 'Sainte-Lucie-De-Beauregard',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Lucie-De-Beauregard',
  },
  {
    label: 'Sainte-Marguerite',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Marguerite',
  },
  {
    label: 'Sainte-Marguerite',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Marguerite',
  },
  {
    label: 'Sainte-Marie',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Marie',
  },
  {
    label: 'Sainte-Marie',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Marie',
  },
  {
    label: 'Sainte-Perpétue',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Perpétue',
  },
  {
    label: 'Sainte-Perpétue',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Perpétue',
  },
  {
    label: 'Sainte-Praxède',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Praxède',
  },
  {
    label: 'Sainte-Praxède',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Praxède',
  },
  {
    label: 'Sainte-Rose-De-Watford',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Rose-De-Watford',
  },
  {
    label: 'Sainte-Rose-De-Watford',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Rose-De-Watford',
  },
  {
    label: 'Sainte-Sabine',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Sabine',
  },
  {
    label: 'Sainte-Sabine',
    value: 'CA/QC/Chaudière-Appalaches/Sainte-Sabine',
  },
  {
    label: 'Saints-Anges',
    value: 'CA/QC/Chaudière-Appalaches/Saints-Anges',
  },
  {
    label: 'Scott',
    value: 'CA/QC/Chaudière-Appalaches/Scott',
  },
  {
    label: 'St-Jean-De-La-Lande-De-Beauce',
    value: 'CA/QC/Chaudière-Appalaches/St-Jean-De-La-Lande-De-Beauce',
  },
  {
    label: 'St-Nazaire-De-Buckland',
    value: 'CA/QC/Chaudière-Appalaches/St-Nazaire-De-Buckland',
  },
  {
    label: 'Thetford Mines',
    value: 'CA/QC/Chaudière-Appalaches/Thetford Mines',
  },
  {
    label: 'Tourville',
    value: 'CA/QC/Chaudière-Appalaches/Tourville',
  },
  {
    label: 'Tring-Jonction',
    value: 'CA/QC/Chaudière-Appalaches/Tring-Jonction',
  },
  {
    label: 'Val-Alain',
    value: 'CA/QC/Chaudière-Appalaches/Val-Alain',
  },
  {
    label: 'Vallée-Jonction',
    value: 'CA/QC/Chaudière-Appalaches/Vallée-Jonction',
  },
  {
    label: 'Aguanish',
    value: 'CA/QC/Côte-Nord/Aguanish',
  },
  {
    label: 'Baie-Comeau',
    value: 'CA/QC/Côte-Nord/Baie-Comeau',
  },
  {
    label: 'Baie-Johan-Beetz',
    value: 'CA/QC/Côte-Nord/Baie-Johan-Beetz',
  },
  {
    label: 'Baie-Trinité',
    value: 'CA/QC/Côte-Nord/Baie-Trinité',
  },
  {
    label: 'Blanc-Sablon',
    value: 'CA/QC/Côte-Nord/Blanc-Sablon',
  },
  {
    label: 'Bonne-Espérance',
    value: 'CA/QC/Côte-Nord/Bonne-Espérance',
  },
  {
    label: 'Brador',
    value: 'CA/QC/Côte-Nord/Brador',
  },
  {
    label: 'Chevery',
    value: 'CA/QC/Côte-Nord/Chevery',
  },
  {
    label: 'Chute-Aux-Outardes',
    value: 'CA/QC/Côte-Nord/Chute-Aux-Outardes',
  },
  {
    label: 'Clarke City',
    value: 'CA/QC/Côte-Nord/Clarke City',
  },
  {
    label: 'Colombier',
    value: 'CA/QC/Côte-Nord/Colombier',
  },
  {
    label: 'Essipit',
    value: 'CA/QC/Côte-Nord/Essipit',
  },
  {
    label: 'Fermont',
    value: 'CA/QC/Côte-Nord/Fermont',
  },
  {
    label: 'Forestville',
    value: 'CA/QC/Côte-Nord/Forestville',
  },
  {
    label: 'Franquelin',
    value: 'CA/QC/Côte-Nord/Franquelin',
  },
  {
    label: 'Gallix',
    value: 'CA/QC/Côte-Nord/Gallix',
  },
  {
    label: 'Godbout',
    value: 'CA/QC/Côte-Nord/Godbout',
  },
  {
    label: 'Grandes-Bergeronnes',
    value: 'CA/QC/Côte-Nord/Grandes-Bergeronnes',
  },
  {
    label: 'Gros-Mécatina',
    value: 'CA/QC/Côte-Nord/Gros-Mécatina',
  },
  {
    label: 'Harrington Harbour',
    value: 'CA/QC/Côte-Nord/Harrington Harbour',
  },
  {
    label: 'Havre-Saint-Pierre',
    value: 'CA/QC/Côte-Nord/Havre-Saint-Pierre',
  },
  {
    label: 'Kegaska',
    value: 'CA/QC/Côte-Nord/Kegaska',
  },
  {
    label: 'La Romaine',
    value: 'CA/QC/Côte-Nord/La Romaine',
  },
  {
    label: 'La Tabatière',
    value: 'CA/QC/Côte-Nord/La Tabatière',
  },
  {
    label: 'Les Bergeronnes',
    value: 'CA/QC/Côte-Nord/Les Bergeronnes',
  },
  {
    label: 'Les Buissons',
    value: 'CA/QC/Côte-Nord/Les Buissons',
  },
  {
    label: 'Les Escoumins',
    value: 'CA/QC/Côte-Nord/Les Escoumins',
  },
  {
    label: "L'île-D'anticosti",
    value: "CA/QC/Côte-Nord/L'île-D'anticosti",
  },
  {
    label: "L'ile-Michon",
    value: "CA/QC/Côte-Nord/L'ile-Michon",
  },
  {
    label: 'Longue-Pointe-De-Mingan',
    value: 'CA/QC/Côte-Nord/Longue-Pointe-De-Mingan',
  },
  {
    label: 'Longue-Rive',
    value: 'CA/QC/Côte-Nord/Longue-Rive',
  },
  {
    label: 'Lourdes-De-Blanc-Sablon',
    value: 'CA/QC/Côte-Nord/Lourdes-De-Blanc-Sablon',
  },
  {
    label: 'Magpie',
    value: 'CA/QC/Côte-Nord/Magpie',
  },
  {
    label: 'Middle Bay',
    value: 'CA/QC/Côte-Nord/Middle Bay',
  },
  {
    label: 'Mingan',
    value: 'CA/QC/Côte-Nord/Mingan',
  },
  {
    label: 'Moisie',
    value: 'CA/QC/Côte-Nord/Moisie',
  },
  {
    label: 'Mutton Bay',
    value: 'CA/QC/Côte-Nord/Mutton Bay',
  },
  {
    label: 'Natashquan',
    value: 'CA/QC/Côte-Nord/Natashquan',
  },
  {
    label: 'Old Fort Bay',
    value: 'CA/QC/Côte-Nord/Old Fort Bay',
  },
  {
    label: 'Pakuashipi',
    value: 'CA/QC/Côte-Nord/Pakuashipi',
  },
  {
    label: 'Pessamit',
    value: 'CA/QC/Côte-Nord/Pessamit',
  },
  {
    label: 'Pointe-Aux-Outardes',
    value: 'CA/QC/Côte-Nord/Pointe-Aux-Outardes',
  },
  {
    label: 'Pointe-Lebel',
    value: 'CA/QC/Côte-Nord/Pointe-Lebel',
  },
  {
    label: 'Port-Cartier',
    value: 'CA/QC/Côte-Nord/Port-Cartier',
  },
  {
    label: 'Port-Menier',
    value: 'CA/QC/Côte-Nord/Port-Menier',
  },
  {
    label: 'Portneuf-Sur-Mer',
    value: 'CA/QC/Côte-Nord/Portneuf-Sur-Mer',
  },
  {
    label: 'Ragueneau',
    value: 'CA/QC/Côte-Nord/Ragueneau',
  },
  {
    label: 'Rivière-Au-Tonnerre',
    value: 'CA/QC/Côte-Nord/Rivière-Au-Tonnerre',
  },
  {
    label: 'Rivière-Pentecôte',
    value: 'CA/QC/Côte-Nord/Rivière-Pentecôte',
  },
  {
    label: 'Rivière-Saint-Jean',
    value: 'CA/QC/Côte-Nord/Rivière-Saint-Jean',
  },
  {
    label: 'Rivière-Saint-Paul',
    value: 'CA/QC/Côte-Nord/Rivière-Saint-Paul',
  },
  {
    label: 'Sacré-Coeur',
    value: 'CA/QC/Côte-Nord/Sacré-Coeur',
  },
  {
    label: 'Saint-Augustin',
    value: 'CA/QC/Côte-Nord/Saint-Augustin',
  },
  {
    label: 'Schefferville',
    value: 'CA/QC/Côte-Nord/Schefferville',
  },
  {
    label: 'Sept-Îles',
    value: 'CA/QC/Côte-Nord/Sept-Îles',
  },
  {
    label: 'Tadoussac',
    value: 'CA/QC/Côte-Nord/Tadoussac',
  },
  {
    label: 'Tête-À-La-Baleine',
    value: 'CA/QC/Côte-Nord/Tête-À-La-Baleine',
  },
  {
    label: 'Uashat-Maliotenam',
    value: 'CA/QC/Côte-Nord/Uashat-Maliotenam',
  },
  {
    label: 'Abercorn',
    value: 'CA/QC/Estrie/Abercorn',
  },
  {
    label: 'Asbestos',
    value: 'CA/QC/Estrie/Asbestos',
  },
  {
    label: 'Ascot Corner',
    value: 'CA/QC/Estrie/Ascot Corner',
  },
  {
    label: 'Audet',
    value: 'CA/QC/Estrie/Audet',
  },
  {
    label: 'Austin',
    value: 'CA/QC/Estrie/Austin',
  },
  {
    label: "Ayer's Cliff",
    value: "CA/QC/Estrie/Ayer's Cliff",
  },
  {
    label: 'Barnston-Ouest',
    value: 'CA/QC/Estrie/Barnston-Ouest',
  },
  {
    label: 'Bedford',
    value: 'CA/QC/Estrie/Bedford',
  },
  {
    label: 'Bishopton',
    value: 'CA/QC/Estrie/Bishopton',
  },
  {
    label: 'Bolton-Est',
    value: 'CA/QC/Estrie/Bolton-Est',
  },
  {
    label: 'Bolton-Ouest',
    value: 'CA/QC/Estrie/Bolton-Ouest',
  },
  {
    label: 'Bonsecours',
    value: 'CA/QC/Estrie/Bonsecours',
  },
  {
    label: 'Brigham',
    value: 'CA/QC/Estrie/Brigham',
  },
  {
    label: 'Brome',
    value: 'CA/QC/Estrie/Brome',
  },
  {
    label: 'Bromont',
    value: 'CA/QC/Estrie/Bromont',
  },
  {
    label: 'Bury',
    value: 'CA/QC/Estrie/Bury',
  },
  {
    label: 'Canton Magog',
    value: 'CA/QC/Estrie/Canton Magog',
  },
  {
    label: 'Chartierville',
    value: 'CA/QC/Estrie/Chartierville',
  },
  {
    label: 'Cleveland',
    value: 'CA/QC/Estrie/Cleveland',
  },
  {
    label: 'Coaticook',
    value: 'CA/QC/Estrie/Coaticook',
  },
  {
    label: 'Compton',
    value: 'CA/QC/Estrie/Compton',
  },
  {
    label: 'Cookshire',
    value: 'CA/QC/Estrie/Cookshire',
  },
  {
    label: 'Cookshire-Eaton',
    value: 'CA/QC/Estrie/Cookshire-Eaton',
  },
  {
    label: 'Courcelles',
    value: 'CA/QC/Estrie/Courcelles',
  },
  {
    label: 'Cowansville',
    value: 'CA/QC/Estrie/Cowansville',
  },
  {
    label: 'Danville',
    value: 'CA/QC/Estrie/Danville',
  },
  {
    label: 'Dixville',
    value: 'CA/QC/Estrie/Dixville',
  },
  {
    label: 'Dudswell',
    value: 'CA/QC/Estrie/Dudswell',
  },
  {
    label: 'Dunham',
    value: 'CA/QC/Estrie/Dunham',
  },
  {
    label: 'East Angus',
    value: 'CA/QC/Estrie/East Angus',
  },
  {
    label: 'East Farnham',
    value: 'CA/QC/Estrie/East Farnham',
  },
  {
    label: 'East Hereford',
    value: 'CA/QC/Estrie/East Hereford',
  },
  {
    label: 'Eastman',
    value: 'CA/QC/Estrie/Eastman',
  },
  {
    label: 'Farnham',
    value: 'CA/QC/Estrie/Farnham',
  },
  {
    label: 'Frelighsburg',
    value: 'CA/QC/Estrie/Frelighsburg',
  },
  {
    label: 'Frontenac',
    value: 'CA/QC/Estrie/Frontenac',
  },
  {
    label: 'Georgeville',
    value: 'CA/QC/Estrie/Georgeville',
  },
  {
    label: 'Granby',
    value: 'CA/QC/Estrie/Granby',
  },
  {
    label: 'Ham-Sud',
    value: 'CA/QC/Estrie/Ham-Sud',
  },
  {
    label: 'Hampden',
    value: 'CA/QC/Estrie/Hampden',
  },
  {
    label: 'Hatley',
    value: 'CA/QC/Estrie/Hatley',
  },
  {
    label: 'Kingsbury',
    value: 'CA/QC/Estrie/Kingsbury',
  },
  {
    label: 'La Patrie',
    value: 'CA/QC/Estrie/La Patrie',
  },
  {
    label: 'Lac-Brome',
    value: 'CA/QC/Estrie/Lac-Brome',
  },
  {
    label: 'Lac-Drolet',
    value: 'CA/QC/Estrie/Lac-Drolet',
  },
  {
    label: 'Lac-Mégantic',
    value: 'CA/QC/Estrie/Lac-Mégantic',
  },
  {
    label: 'Lambton',
    value: 'CA/QC/Estrie/Lambton',
  },
  {
    label: 'Lawrenceville',
    value: 'CA/QC/Estrie/Lawrenceville',
  },
  {
    label: 'Lingwick',
    value: 'CA/QC/Estrie/Lingwick',
  },
  {
    label: 'Magog',
    value: 'CA/QC/Estrie/Magog',
  },
  {
    label: 'Mansonville',
    value: 'CA/QC/Estrie/Mansonville',
  },
  {
    label: 'Marbleton',
    value: 'CA/QC/Estrie/Marbleton',
  },
  {
    label: 'Maricourt',
    value: 'CA/QC/Estrie/Maricourt',
  },
  {
    label: 'Marston',
    value: 'CA/QC/Estrie/Marston',
  },
  {
    label: 'Martinville',
    value: 'CA/QC/Estrie/Martinville',
  },
  {
    label: 'Melbourne',
    value: 'CA/QC/Estrie/Melbourne',
  },
  {
    label: 'Milan',
    value: 'CA/QC/Estrie/Milan',
  },
  {
    label: 'Nantes',
    value: 'CA/QC/Estrie/Nantes',
  },
  {
    label: 'Newport',
    value: 'CA/QC/Estrie/Newport',
  },
  {
    label: 'North Hatley',
    value: 'CA/QC/Estrie/North Hatley',
  },
  {
    label: 'Notre-Dame-De-Stanbridge',
    value: 'CA/QC/Estrie/Notre-Dame-De-Stanbridge',
  },
  {
    label: 'Notre-Dame-Des-Bois',
    value: 'CA/QC/Estrie/Notre-Dame-Des-Bois',
  },
  {
    label: 'Ogden',
    value: 'CA/QC/Estrie/Ogden',
  },
  {
    label: 'Omerville',
    value: 'CA/QC/Estrie/Omerville',
  },
  {
    label: 'Orford',
    value: 'CA/QC/Estrie/Orford',
  },
  {
    label: 'Pike River',
    value: 'CA/QC/Estrie/Pike River',
  },
  {
    label: 'Piopolis',
    value: 'CA/QC/Estrie/Piopolis',
  },
  {
    label: 'Potton',
    value: 'CA/QC/Estrie/Potton',
  },
  {
    label: 'Racine',
    value: 'CA/QC/Estrie/Racine',
  },
  {
    label: 'Richmond',
    value: 'CA/QC/Estrie/Richmond',
  },
  {
    label: 'Roxton Pond',
    value: 'CA/QC/Estrie/Roxton Pond',
  },
  {
    label: 'Saint-Adrien',
    value: 'CA/QC/Estrie/Saint-Adrien',
  },
  {
    label: 'Saint-Alphonse-De-Granby',
    value: 'CA/QC/Estrie/Saint-Alphonse-De-Granby',
  },
  {
    label: 'Saint-Armand',
    value: 'CA/QC/Estrie/Saint-Armand',
  },
  {
    label: 'Saint-Augustin-De-Woburn',
    value: 'CA/QC/Estrie/Saint-Augustin-De-Woburn',
  },
  {
    label: 'Saint-Benoît-Du-Lac',
    value: 'CA/QC/Estrie/Saint-Benoît-Du-Lac',
  },
  {
    label: 'Saint-Camille',
    value: 'CA/QC/Estrie/Saint-Camille',
  },
  {
    label: 'Saint-Claude',
    value: 'CA/QC/Estrie/Saint-Claude',
  },
  {
    label: 'Saint-Denis-De-Brompton',
    value: 'CA/QC/Estrie/Saint-Denis-De-Brompton',
  },
  {
    label: 'Saint-Étienne-De-Bolton',
    value: 'CA/QC/Estrie/Saint-Étienne-De-Bolton',
  },
  {
    label: 'Saint-François-Xavier-Brompton',
    value: 'CA/QC/Estrie/Saint-François-Xavier-Brompton',
  },
  {
    label: 'Saint-Georges-De-Windsor',
    value: 'CA/QC/Estrie/Saint-Georges-De-Windsor',
  },
  {
    label: 'Saint-Herménégilde',
    value: 'CA/QC/Estrie/Saint-Herménégilde',
  },
  {
    label: 'Saint-Ignace-De-Stanbridge',
    value: 'CA/QC/Estrie/Saint-Ignace-De-Stanbridge',
  },
  {
    label: 'Saint-Isidore-De-Clifton',
    value: 'CA/QC/Estrie/Saint-Isidore-De-Clifton',
  },
  {
    label: 'Saint-Joachim-De-Shefford',
    value: 'CA/QC/Estrie/Saint-Joachim-De-Shefford',
  },
  {
    label: 'Saint-Ludger',
    value: 'CA/QC/Estrie/Saint-Ludger',
  },
  {
    label: 'Saint-Malo',
    value: 'CA/QC/Estrie/Saint-Malo',
  },
  {
    label: 'Saint-Robert-Bellarmin',
    value: 'CA/QC/Estrie/Saint-Robert-Bellarmin',
  },
  {
    label: 'Saint-Romain',
    value: 'CA/QC/Estrie/Saint-Romain',
  },
  {
    label: 'Saint-Sébastien',
    value: 'CA/QC/Estrie/Saint-Sébastien',
  },
  {
    label: 'Saint-Venant-De-Paquette',
    value: 'CA/QC/Estrie/Saint-Venant-De-Paquette',
  },
  {
    label: 'Sainte-Anne-De-La-Rochelle',
    value: 'CA/QC/Estrie/Sainte-Anne-De-La-Rochelle',
  },
  {
    label: 'Sainte-Catherine-De-Hatley',
    value: 'CA/QC/Estrie/Sainte-Catherine-De-Hatley',
  },
  {
    label: 'Sainte-Cécile-De-Milton',
    value: 'CA/QC/Estrie/Sainte-Cécile-De-Milton',
  },
  {
    label: 'Sainte-Cécile-De-Whitton',
    value: 'CA/QC/Estrie/Sainte-Cécile-De-Whitton',
  },
  {
    label: 'Sainte-Edwidge-De-Clifton',
    value: 'CA/QC/Estrie/Sainte-Edwidge-De-Clifton',
  },
  {
    label: 'Sainte-Sabine',
    value: 'CA/QC/Estrie/Sainte-Sabine',
  },
  {
    label: 'Sawyerville',
    value: 'CA/QC/Estrie/Sawyerville',
  },
  {
    label: 'Scotstown',
    value: 'CA/QC/Estrie/Scotstown',
  },
  {
    label: 'Shefford',
    value: 'CA/QC/Estrie/Shefford',
  },
  {
    label: 'Sherbrooke',
    value: 'CA/QC/Estrie/Sherbrooke',
  },
  {
    label: 'Stanbridge East',
    value: 'CA/QC/Estrie/Stanbridge East',
  },
  {
    label: 'Stanbridge Station',
    value: 'CA/QC/Estrie/Stanbridge Station',
  },
  {
    label: 'Stanhope',
    value: 'CA/QC/Estrie/Stanhope',
  },
  {
    label: 'Stanstead',
    value: 'CA/QC/Estrie/Stanstead',
  },
  {
    label: 'Stanstead-Est',
    value: 'CA/QC/Estrie/Stanstead-Est',
  },
  {
    label: 'Stoke',
    value: 'CA/QC/Estrie/Stoke',
  },
  {
    label: 'Stornoway',
    value: 'CA/QC/Estrie/Stornoway',
  },
  {
    label: 'Stratford',
    value: 'CA/QC/Estrie/Stratford',
  },
  {
    label: 'Stukely-Sud',
    value: 'CA/QC/Estrie/Stukely-Sud',
  },
  {
    label: 'Sutton',
    value: 'CA/QC/Estrie/Sutton',
  },
  {
    label: 'Ulverton',
    value: 'CA/QC/Estrie/Ulverton',
  },
  {
    label: 'Val-Joli',
    value: 'CA/QC/Estrie/Val-Joli',
  },
  {
    label: 'Val-Racine',
    value: 'CA/QC/Estrie/Val-Racine',
  },
  {
    label: 'Valcourt',
    value: 'CA/QC/Estrie/Valcourt',
  },
  {
    label: 'Warden',
    value: 'CA/QC/Estrie/Warden',
  },
  {
    label: 'Waterloo',
    value: 'CA/QC/Estrie/Waterloo',
  },
  {
    label: 'Waterville',
    value: 'CA/QC/Estrie/Waterville',
  },
  {
    label: 'Weedon',
    value: 'CA/QC/Estrie/Weedon',
  },
  {
    label: 'Westbury',
    value: 'CA/QC/Estrie/Westbury',
  },
  {
    label: 'Windsor',
    value: 'CA/QC/Estrie/Windsor',
  },
  {
    label: 'Wotton',
    value: 'CA/QC/Estrie/Wotton',
  },
  {
    label: 'Baie-Des-Sables',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Baie-Des-Sables',
  },
  {
    label: 'Barachois',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Barachois',
  },
  {
    label: 'Bassin',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Bassin',
  },
  {
    label: 'Bonaventure',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Bonaventure',
  },
  {
    label: 'Cap-Au-Renard',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Cap-Au-Renard',
  },
  {
    label: 'Cap-Aux-Meules',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Cap-Aux-Meules',
  },
  {
    label: 'Cap-Chat',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Cap-Chat',
  },
  {
    label: 'Cap-Chat-Est',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Cap-Chat-Est',
  },
  {
    label: "Cap-D'espoir",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/Cap-D'espoir",
  },
  {
    label: 'Caplan',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Caplan',
  },
  {
    label: 'Capucins',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Capucins',
  },
  {
    label: 'Carleton',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Carleton',
  },
  {
    label: 'Carleton-Sur-Mer',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Carleton-Sur-Mer',
  },
  {
    label: 'Cascapédia-Saint-Jules',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Cascapédia-Saint-Jules',
  },
  {
    label: 'Chandler',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Chandler',
  },
  {
    label: 'Cloridorme',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Cloridorme',
  },
  {
    label: 'Escuminac',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Escuminac',
  },
  {
    label: 'Fatima',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Fatima',
  },
  {
    label: 'Gascons',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Gascons',
  },
  {
    label: 'Gaspé',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Gaspé',
  },
  {
    label: 'Gesgapegiag',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Gesgapegiag',
  },
  {
    label: 'Gespeg',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Gespeg',
  },
  {
    label: 'Grande-Entrée',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Grande-Entrée',
  },
  {
    label: 'Grande-Rivière',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Grande-Rivière',
  },
  {
    label: 'Grande-Rivière-Ouest',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Grande-Rivière-Ouest',
  },
  {
    label: 'Grande-Vallée',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Grande-Vallée',
  },
  {
    label: 'Gros-Morne',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Gros-Morne',
  },
  {
    label: 'Grosse-Île',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Grosse-Île',
  },
  {
    label: 'Grosses-Roches',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Grosses-Roches',
  },
  {
    label: 'Havre-Aubert',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Havre-Aubert',
  },
  {
    label: 'Havre-Aux-Maisons',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Havre-Aux-Maisons',
  },
  {
    label: 'Hope',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Hope',
  },
  {
    label: 'Hope Town',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Hope Town',
  },
  {
    label: 'La Martre',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/La Martre',
  },
  {
    label: "L'alverne",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/L'alverne",
  },
  {
    label: "L'anse-Pleureuse",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/L'anse-Pleureuse",
  },
  {
    label: "L'ascension-De-Patapédia",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/L'ascension-De-Patapédia",
  },
  {
    label: 'Les Îles-De-La-Madeleine',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Les Îles-De-La-Madeleine',
  },
  {
    label: 'Les Méchins',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Les Méchins',
  },
  {
    label: "L'etang-Du-Nord",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/L'etang-Du-Nord",
  },
  {
    label: "L'ile-D'entree",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/L'ile-D'entree",
  },
  {
    label: 'Listuguj',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Listuguj',
  },
  {
    label: 'Madeleine-Centre',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Madeleine-Centre',
  },
  {
    label: "Manche-D'epee",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/Manche-D'epee",
  },
  {
    label: 'Maria',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Maria',
  },
  {
    label: 'Marsoui',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Marsoui',
  },
  {
    label: 'Matane',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Matane',
  },
  {
    label: 'Matapédia',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Matapédia',
  },
  {
    label: 'Mont-Louis',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Mont-Louis',
  },
  {
    label: 'Mont-Saint-Pierre',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Mont-Saint-Pierre',
  },
  {
    label: 'Murdochville',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Murdochville',
  },
  {
    label: 'New Carlisle',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/New Carlisle',
  },
  {
    label: 'New Richmond',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/New Richmond',
  },
  {
    label: 'Nouvelle',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Nouvelle',
  },
  {
    label: 'Nouvelle-Ouest',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Nouvelle-Ouest',
  },
  {
    label: 'Pabos',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Pabos',
  },
  {
    label: 'Pabos Mills',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Pabos Mills',
  },
  {
    label: 'Paspébiac',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Paspébiac',
  },
  {
    label: 'Percé',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Percé',
  },
  {
    label: 'Petite-Vallée',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Petite-Vallée',
  },
  {
    label: 'Pointe-À-La-Croix',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Pointe-À-La-Croix',
  },
  {
    label: 'Pointe-À-La-Garde',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Pointe-À-La-Garde',
  },
  {
    label: 'Pointe-Aux-Loups',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Pointe-Aux-Loups',
  },
  {
    label: 'Port-Daniel',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Port-Daniel',
  },
  {
    label: 'Port-Daniel-Gascons',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Port-Daniel-Gascons',
  },
  {
    label: 'Ristigouche-Partie-Sud-Est',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Ristigouche-Partie-Sud-Est',
  },
  {
    label: 'Rivière-À-Claude',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Rivière-À-Claude',
  },
  {
    label: 'Rivière-Madeleine',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Rivière-Madeleine',
  },
  {
    label: 'Rivière-Paspébiac',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Rivière-Paspébiac',
  },
  {
    label: 'Ruisseau-À-Rebours',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Ruisseau-À-Rebours',
  },
  {
    label: 'Saint-Alexis-De-Matapédia',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Alexis-De-Matapédia',
  },
  {
    label: 'Saint-Alphonse',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Alphonse',
  },
  {
    label: 'Saint-André-De-Restigouche',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-André-De-Restigouche',
  },
  {
    label: 'Saint-Elzéar',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Elzéar',
  },
  {
    label: "Saint-François-D'assise",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-François-D'assise",
  },
  {
    label: 'Saint-Georges-De-Malbaie',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Georges-De-Malbaie',
  },
  {
    label: 'Saint-Godefroi',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Godefroi',
  },
  {
    label: 'Saint-Jean-De-Matapédia',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Jean-De-Matapédia',
  },
  {
    label: 'Saint-Jogues',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Jogues',
  },
  {
    label: 'Saint-Léandre',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Léandre',
  },
  {
    label: 'Saint-Maxime-Du-Mont-Louis',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Maxime-Du-Mont-Louis',
  },
  {
    label: 'Saint-René-De-Matane',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-René-De-Matane',
  },
  {
    label: 'Saint-Siméon',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Siméon',
  },
  {
    label: 'Saint-Ulric',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Saint-Ulric',
  },
  {
    label: 'Sainte-Anne-Des-Monts',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Sainte-Anne-Des-Monts',
  },
  {
    label: 'Sainte-Félicité',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Sainte-Félicité',
  },
  {
    label: 'Sainte-Madeleine-De-La-Rivière-Madeleine',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Sainte-Madeleine-De-La-Rivière-Madeleine',
  },
  {
    label: 'Sainte-Paule',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Sainte-Paule',
  },
  {
    label: 'Sainte-Thérèse-De-Gaspé',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Sainte-Thérèse-De-Gaspé',
  },
  {
    label: 'Shigawake',
    value: 'CA/QC/Gaspésie-Îles-de-La-Madeleine/Shigawake',
  },
  {
    label: "Val-D'espoir",
    value: "CA/QC/Gaspésie-Îles-de-La-Madeleine/Val-D'espoir",
  },
  {
    label: 'Berthierville',
    value: 'CA/QC/Lanaudière/Berthierville',
  },
  {
    label: 'Charlemagne',
    value: 'CA/QC/Lanaudière/Charlemagne',
  },
  {
    label: 'Chertsey',
    value: 'CA/QC/Lanaudière/Chertsey',
  },
  {
    label: 'Crabtree',
    value: 'CA/QC/Lanaudière/Crabtree',
  },
  {
    label: 'Entrelacs',
    value: 'CA/QC/Lanaudière/Entrelacs',
  },
  {
    label: 'Joliette',
    value: 'CA/QC/Lanaudière/Joliette',
  },
  {
    label: "La Visitation-De-L'île-Dupas",
    value: "CA/QC/Lanaudière/La Visitation-De-L'île-Dupas",
  },
  {
    label: 'Lanoraie',
    value: 'CA/QC/Lanaudière/Lanoraie',
  },
  {
    label: "L'assomption",
    value: "CA/QC/Lanaudière/L'assomption",
  },
  {
    label: 'Lavaltrie',
    value: 'CA/QC/Lanaudière/Lavaltrie',
  },
  {
    label: "L'épiphanie",
    value: "CA/QC/Lanaudière/L'épiphanie",
  },
  {
    label: 'Manawan',
    value: 'CA/QC/Lanaudière/Manawan',
  },
  {
    label: 'Mandeville',
    value: 'CA/QC/Lanaudière/Mandeville',
  },
  {
    label: 'Mascouche',
    value: 'CA/QC/Lanaudière/Mascouche',
  },
  {
    label: 'Notre-Dame-De-La-Merci',
    value: 'CA/QC/Lanaudière/Notre-Dame-De-La-Merci',
  },
  {
    label: 'Notre-Dame-De-Lourdes',
    value: 'CA/QC/Lanaudière/Notre-Dame-De-Lourdes',
  },
  {
    label: 'Notre-Dame-Des-Prairies',
    value: 'CA/QC/Lanaudière/Notre-Dame-Des-Prairies',
  },
  {
    label: 'Rawdon',
    value: 'CA/QC/Lanaudière/Rawdon',
  },
  {
    label: 'Repentigny',
    value: 'CA/QC/Lanaudière/Repentigny',
  },
  {
    label: 'Saint-Alexis',
    value: 'CA/QC/Lanaudière/Saint-Alexis',
  },
  {
    label: 'Saint-Alphonse-Rodriguez',
    value: 'CA/QC/Lanaudière/Saint-Alphonse-Rodriguez',
  },
  {
    label: 'Saint-Ambroise-De-Kildare',
    value: 'CA/QC/Lanaudière/Saint-Ambroise-De-Kildare',
  },
  {
    label: 'Saint-Barthélemy',
    value: 'CA/QC/Lanaudière/Saint-Barthélemy',
  },
  {
    label: 'Saint-Calixte',
    value: 'CA/QC/Lanaudière/Saint-Calixte',
  },
  {
    label: 'Saint-Charles-Borromée',
    value: 'CA/QC/Lanaudière/Saint-Charles-Borromée',
  },
  {
    label: 'Saint-Cléophas-De-Brandon',
    value: 'CA/QC/Lanaudière/Saint-Cléophas-De-Brandon',
  },
  {
    label: 'Saint-Côme',
    value: 'CA/QC/Lanaudière/Saint-Côme',
  },
  {
    label: 'Saint-Cuthbert',
    value: 'CA/QC/Lanaudière/Saint-Cuthbert',
  },
  {
    label: 'Saint-Damien',
    value: 'CA/QC/Lanaudière/Saint-Damien',
  },
  {
    label: 'Saint-Didace',
    value: 'CA/QC/Lanaudière/Saint-Didace',
  },
  {
    label: 'Saint-Donat',
    value: 'CA/QC/Lanaudière/Saint-Donat',
  },
  {
    label: 'Saint-Esprit',
    value: 'CA/QC/Lanaudière/Saint-Esprit',
  },
  {
    label: 'Saint-Félix-De-Valois',
    value: 'CA/QC/Lanaudière/Saint-Félix-De-Valois',
  },
  {
    label: 'Saint-Gabriel',
    value: 'CA/QC/Lanaudière/Saint-Gabriel',
  },
  {
    label: 'Saint-Gabriel-De-Brandon',
    value: 'CA/QC/Lanaudière/Saint-Gabriel-De-Brandon',
  },
  {
    label: 'Saint-Ignace-De-Loyola',
    value: 'CA/QC/Lanaudière/Saint-Ignace-De-Loyola',
  },
  {
    label: 'Saint-Jacques',
    value: 'CA/QC/Lanaudière/Saint-Jacques',
  },
  {
    label: 'Saint-Jean-De-Matha',
    value: 'CA/QC/Lanaudière/Saint-Jean-De-Matha',
  },
  {
    label: 'Saint-Liguori',
    value: 'CA/QC/Lanaudière/Saint-Liguori',
  },
  {
    label: 'Saint-Lin-Laurentides',
    value: 'CA/QC/Lanaudière/Saint-Lin-Laurentides',
  },
  {
    label: 'Saint-Michel-Des-Saints',
    value: 'CA/QC/Lanaudière/Saint-Michel-Des-Saints',
  },
  {
    label: 'Saint-Norbert',
    value: 'CA/QC/Lanaudière/Saint-Norbert',
  },
  {
    label: 'Saint-Paul',
    value: 'CA/QC/Lanaudière/Saint-Paul',
  },
  {
    label: 'Saint-Pierre',
    value: 'CA/QC/Lanaudière/Saint-Pierre',
  },
  {
    label: "Saint-Roch-De-L'achigan",
    value: "CA/QC/Lanaudière/Saint-Roch-De-L'achigan",
  },
  {
    label: 'Saint-Roch-Ouest',
    value: 'CA/QC/Lanaudière/Saint-Roch-Ouest',
  },
  {
    label: 'Saint-Sulpice',
    value: 'CA/QC/Lanaudière/Saint-Sulpice',
  },
  {
    label: 'Saint-Thomas',
    value: 'CA/QC/Lanaudière/Saint-Thomas',
  },
  {
    label: 'Saint-Zénon',
    value: 'CA/QC/Lanaudière/Saint-Zénon',
  },
  {
    label: 'Sainte-Béatrix',
    value: 'CA/QC/Lanaudière/Sainte-Béatrix',
  },
  {
    label: 'Sainte-Élisabeth',
    value: 'CA/QC/Lanaudière/Sainte-Élisabeth',
  },
  {
    label: "Sainte-Émélie-De-L'énergie",
    value: "CA/QC/Lanaudière/Sainte-Émélie-De-L'énergie",
  },
  {
    label: 'Sainte-Geneviève-De-Berthier',
    value: 'CA/QC/Lanaudière/Sainte-Geneviève-De-Berthier',
  },
  {
    label: 'Sainte-Julienne',
    value: 'CA/QC/Lanaudière/Sainte-Julienne',
  },
  {
    label: 'Sainte-Marcelline-De-Kildare',
    value: 'CA/QC/Lanaudière/Sainte-Marcelline-De-Kildare',
  },
  {
    label: 'Sainte-Marie-Salomé',
    value: 'CA/QC/Lanaudière/Sainte-Marie-Salomé',
  },
  {
    label: 'Sainte-Mélanie',
    value: 'CA/QC/Lanaudière/Sainte-Mélanie',
  },
  {
    label: 'Terrebonne',
    value: 'CA/QC/Lanaudière/Terrebonne',
  },
  {
    label: 'Amherst',
    value: 'CA/QC/Laurentides/Amherst',
  },
  {
    label: 'Arundel',
    value: 'CA/QC/Laurentides/Arundel',
  },
  {
    label: 'Barkmere',
    value: 'CA/QC/Laurentides/Barkmere',
  },
  {
    label: 'Blainville',
    value: 'CA/QC/Laurentides/Blainville',
  },
  {
    label: 'Bois-Des-Filion',
    value: 'CA/QC/Laurentides/Bois-Des-Filion',
  },
  {
    label: 'Boisbriand',
    value: 'CA/QC/Laurentides/Boisbriand',
  },
  {
    label: 'Brébeuf',
    value: 'CA/QC/Laurentides/Brébeuf',
  },
  {
    label: 'Brownsburg-Chatham',
    value: 'CA/QC/Laurentides/Brownsburg-Chatham',
  },
  {
    label: 'Chute-Saint-Philippe',
    value: 'CA/QC/Laurentides/Chute-Saint-Philippe',
  },
  {
    label: 'Deux-Montagnes',
    value: 'CA/QC/Laurentides/Deux-Montagnes',
  },
  {
    label: 'Estérel',
    value: 'CA/QC/Laurentides/Estérel',
  },
  {
    label: 'Ferme-Neuve',
    value: 'CA/QC/Laurentides/Ferme-Neuve',
  },
  {
    label: 'Gore',
    value: 'CA/QC/Laurentides/Gore',
  },
  {
    label: 'Grenville',
    value: 'CA/QC/Laurentides/Grenville',
  },
  {
    label: 'Grenville-Sur-La-Rouge',
    value: 'CA/QC/Laurentides/Grenville-Sur-La-Rouge',
  },
  {
    label: 'Harrington',
    value: 'CA/QC/Laurentides/Harrington',
  },
  {
    label: 'Huberdeau',
    value: 'CA/QC/Laurentides/Huberdeau',
  },
  {
    label: 'Ivry-Sur-Le-Lac',
    value: 'CA/QC/Laurentides/Ivry-Sur-Le-Lac',
  },
  {
    label: 'Kanesatake',
    value: 'CA/QC/Laurentides/Kanesatake',
  },
  {
    label: 'Kiamika',
    value: 'CA/QC/Laurentides/Kiamika',
  },
  {
    label: 'La Conception',
    value: 'CA/QC/Laurentides/La Conception',
  },
  {
    label: 'La Macaza',
    value: 'CA/QC/Laurentides/La Macaza',
  },
  {
    label: 'La Minerve',
    value: 'CA/QC/Laurentides/La Minerve',
  },
  {
    label: 'Labelle',
    value: 'CA/QC/Laurentides/Labelle',
  },
  {
    label: 'Lac-Des-Écorces',
    value: 'CA/QC/Laurentides/Lac-Des-Écorces',
  },
  {
    label: 'Lac-Des-Seize-Îles',
    value: 'CA/QC/Laurentides/Lac-Des-Seize-Îles',
  },
  {
    label: 'Lac-Du-Cerf',
    value: 'CA/QC/Laurentides/Lac-Du-Cerf',
  },
  {
    label: 'Lac-Saguay',
    value: 'CA/QC/Laurentides/Lac-Saguay',
  },
  {
    label: 'Lac-Saint-Paul',
    value: 'CA/QC/Laurentides/Lac-Saint-Paul',
  },
  {
    label: 'Lac-Supérieur',
    value: 'CA/QC/Laurentides/Lac-Supérieur',
  },
  {
    label: 'Lac-Tremblant-Nord',
    value: 'CA/QC/Laurentides/Lac-Tremblant-Nord',
  },
  {
    label: 'Lachute',
    value: 'CA/QC/Laurentides/Lachute',
  },
  {
    label: 'Lantier',
    value: 'CA/QC/Laurentides/Lantier',
  },
  {
    label: "L'ascension",
    value: "CA/QC/Laurentides/L'ascension",
  },
  {
    label: 'Lorraine',
    value: 'CA/QC/Laurentides/Lorraine',
  },
  {
    label: 'Mille-Isles',
    value: 'CA/QC/Laurentides/Mille-Isles',
  },
  {
    label: 'Mirabel',
    value: 'CA/QC/Laurentides/Mirabel',
  },
  {
    label: 'Mont-Laurier',
    value: 'CA/QC/Laurentides/Mont-Laurier',
  },
  {
    label: 'Mont-Saint-Michel',
    value: 'CA/QC/Laurentides/Mont-Saint-Michel',
  },
  {
    label: 'Mont-Tremblant',
    value: 'CA/QC/Laurentides/Mont-Tremblant',
  },
  {
    label: 'Montcalm',
    value: 'CA/QC/Laurentides/Montcalm',
  },
  {
    label: 'Morin-Heights',
    value: 'CA/QC/Laurentides/Morin-Heights',
  },
  {
    label: 'Nominingue',
    value: 'CA/QC/Laurentides/Nominingue',
  },
  {
    label: 'Notre-Dame-De-Pontmain',
    value: 'CA/QC/Laurentides/Notre-Dame-De-Pontmain',
  },
  {
    label: 'Notre-Dame-Du-Laus',
    value: 'CA/QC/Laurentides/Notre-Dame-Du-Laus',
  },
  {
    label: 'Oka',
    value: 'CA/QC/Laurentides/Oka',
  },
  {
    label: 'Piedmont',
    value: 'CA/QC/Laurentides/Piedmont',
  },
  {
    label: 'Pointe-Calumet',
    value: 'CA/QC/Laurentides/Pointe-Calumet',
  },
  {
    label: 'Prévost',
    value: 'CA/QC/Laurentides/Prévost',
  },
  {
    label: 'Rivière-Rouge',
    value: 'CA/QC/Laurentides/Rivière-Rouge',
  },
  {
    label: 'Rosemère',
    value: 'CA/QC/Laurentides/Rosemère',
  },
  {
    label: "Saint-Adolphe-D'howard",
    value: "CA/QC/Laurentides/Saint-Adolphe-D'howard",
  },
  {
    label: 'Saint-Aimé-Du-Lac-Des-Îles',
    value: 'CA/QC/Laurentides/Saint-Aimé-Du-Lac-Des-Îles',
  },
  {
    label: "Saint-André-D'argenteuil",
    value: "CA/QC/Laurentides/Saint-André-D'argenteuil",
  },
  {
    label: 'Saint-Colomban',
    value: 'CA/QC/Laurentides/Saint-Colomban',
  },
  {
    label: 'Saint-Eustache',
    value: 'CA/QC/Laurentides/Saint-Eustache',
  },
  {
    label: 'Saint-Faustin-Lac-Carré',
    value: 'CA/QC/Laurentides/Saint-Faustin-Lac-Carré',
  },
  {
    label: 'Saint-Hippolyte',
    value: 'CA/QC/Laurentides/Saint-Hippolyte',
  },
  {
    label: 'Saint-Jérôme',
    value: 'CA/QC/Laurentides/Saint-Jérôme',
  },
  {
    label: 'Saint-Joseph-Du-Lac',
    value: 'CA/QC/Laurentides/Saint-Joseph-Du-Lac',
  },
  {
    label: 'Saint-Placide',
    value: 'CA/QC/Laurentides/Saint-Placide',
  },
  {
    label: 'Saint-Sauveur',
    value: 'CA/QC/Laurentides/Saint-Sauveur',
  },
  {
    label: 'Sainte-Adèle',
    value: 'CA/QC/Laurentides/Sainte-Adèle',
  },
  {
    label: 'Sainte-Agathe-Des-Monts',
    value: 'CA/QC/Laurentides/Sainte-Agathe-Des-Monts',
  },
  {
    label: 'Sainte-Anne-Des-Lacs',
    value: 'CA/QC/Laurentides/Sainte-Anne-Des-Lacs',
  },
  {
    label: 'Sainte-Anne-Des-Plaines',
    value: 'CA/QC/Laurentides/Sainte-Anne-Des-Plaines',
  },
  {
    label: 'Sainte-Anne-Des-Plaintes',
    value: 'CA/QC/Laurentides/Sainte-Anne-Des-Plaintes',
  },
  {
    label: 'Sainte-Anne-Du-Lac',
    value: 'CA/QC/Laurentides/Sainte-Anne-Du-Lac',
  },
  {
    label: 'Sainte-Lucie-Des-Laurentides',
    value: 'CA/QC/Laurentides/Sainte-Lucie-Des-Laurentides',
  },
  {
    label: 'Sainte-Marguerite-Du-Lac-Masson',
    value: 'CA/QC/Laurentides/Sainte-Marguerite-Du-Lac-Masson',
  },
  {
    label: 'Sainte-Marthe-Sur-Le-Lac',
    value: 'CA/QC/Laurentides/Sainte-Marthe-Sur-Le-Lac',
  },
  {
    label: 'Sainte-Sophie',
    value: 'CA/QC/Laurentides/Sainte-Sophie',
  },
  {
    label: 'Sainte-Thérèse',
    value: 'CA/QC/Laurentides/Sainte-Thérèse',
  },
  {
    label: 'Ste-Adèle',
    value: 'CA/QC/Laurentides/Ste-Adèle',
  },
  {
    label: 'Val-David',
    value: 'CA/QC/Laurentides/Val-David',
  },
  {
    label: 'Val-Des-Lacs',
    value: 'CA/QC/Laurentides/Val-Des-Lacs',
  },
  {
    label: 'Val-Morin',
    value: 'CA/QC/Laurentides/Val-Morin',
  },
  {
    label: 'Wentworth',
    value: 'CA/QC/Laurentides/Wentworth',
  },
  {
    label: 'Wentworth-Nord',
    value: 'CA/QC/Laurentides/Wentworth-Nord',
  },
  {
    label: 'Auteuil',
    value: 'CA/QC/Laval/Auteuil',
  },
  {
    label: 'Chomedey',
    value: 'CA/QC/Laval/Chomedey',
  },
  {
    label: 'Duvernay',
    value: 'CA/QC/Laval/Duvernay',
  },
  {
    label: 'Fabreville',
    value: 'CA/QC/Laval/Fabreville',
  },
  {
    label: 'Îles-Laval',
    value: 'CA/QC/Laval/Îles-Laval',
  },
  {
    label: 'Laval',
    value: 'CA/QC/Laval/Laval',
  },
  {
    label: 'Laval-Des-Rapides',
    value: 'CA/QC/Laval/Laval-Des-Rapides',
  },
  {
    label: 'Laval-Ouest',
    value: 'CA/QC/Laval/Laval-Ouest',
  },
  {
    label: 'Laval-Sur-Le-Lac',
    value: 'CA/QC/Laval/Laval-Sur-Le-Lac',
  },
  {
    label: 'Pont-Viau',
    value: 'CA/QC/Laval/Pont-Viau',
  },
  {
    label: 'Saint-François',
    value: 'CA/QC/Laval/Saint-François',
  },
  {
    label: 'Saint-Vincent-De-Paul',
    value: 'CA/QC/Laval/Saint-Vincent-De-Paul',
  },
  {
    label: 'Sainte-Dorothée',
    value: 'CA/QC/Laval/Sainte-Dorothée',
  },
  {
    label: 'Sainte-Rose',
    value: 'CA/QC/Laval/Sainte-Rose',
  },
  {
    label: 'Vimont',
    value: 'CA/QC/Laval/Vimont',
  },
  {
    label: 'Saint-Hubert',
    value: 'CA/QC/Longueuil/Saint-Hubert',
  },
  {
    label: 'Batiscan',
    value: 'CA/QC/Mauricie/Batiscan',
  },
  {
    label: 'Champlain',
    value: 'CA/QC/Mauricie/Champlain',
  },
  {
    label: 'Charette',
    value: 'CA/QC/Mauricie/Charette',
  },
  {
    label: 'Clova',
    value: 'CA/QC/Mauricie/Clova',
  },
  {
    label: 'Grand-Mère',
    value: 'CA/QC/Mauricie/Grand-Mère',
  },
  {
    label: 'Grandes-Piles',
    value: 'CA/QC/Mauricie/Grandes-Piles',
  },
  {
    label: 'Hérouxville',
    value: 'CA/QC/Mauricie/Hérouxville',
  },
  {
    label: 'La Bostonnais',
    value: 'CA/QC/Mauricie/La Bostonnais',
  },
  {
    label: 'La Croche',
    value: 'CA/QC/Mauricie/La Croche',
  },
  {
    label: 'La Tuque',
    value: 'CA/QC/Mauricie/La Tuque',
  },
  {
    label: 'Lac-À-La-Tortue',
    value: 'CA/QC/Mauricie/Lac-À-La-Tortue',
  },
  {
    label: 'Lac-Aux-Sables',
    value: 'CA/QC/Mauricie/Lac-Aux-Sables',
  },
  {
    label: 'Lac-Édouard',
    value: 'CA/QC/Mauricie/Lac-Édouard',
  },
  {
    label: 'Louiseville',
    value: 'CA/QC/Mauricie/Louiseville',
  },
  {
    label: 'Maskinongé',
    value: 'CA/QC/Mauricie/Maskinongé',
  },
  {
    label: 'Notre-Dame-De-Montauban',
    value: 'CA/QC/Mauricie/Notre-Dame-De-Montauban',
  },
  {
    label: 'Notre-Dame-Du-Mont-Carmel',
    value: 'CA/QC/Mauricie/Notre-Dame-Du-Mont-Carmel',
  },
  {
    label: 'Obedjiwan',
    value: 'CA/QC/Mauricie/Obedjiwan',
  },
  {
    label: 'Parent',
    value: 'CA/QC/Mauricie/Parent',
  },
  {
    label: 'Proulxville',
    value: 'CA/QC/Mauricie/Proulxville',
  },
  {
    label: 'Rivière-Mékinac',
    value: 'CA/QC/Mauricie/Rivière-Mékinac',
  },
  {
    label: 'Saint-Adelphe',
    value: 'CA/QC/Mauricie/Saint-Adelphe',
  },
  {
    label: 'Saint-Alexis-Des-Monts',
    value: 'CA/QC/Mauricie/Saint-Alexis-Des-Monts',
  },
  {
    label: 'Saint-Barnabé',
    value: 'CA/QC/Mauricie/Saint-Barnabé',
  },
  {
    label: 'Saint-Boniface',
    value: 'CA/QC/Mauricie/Saint-Boniface',
  },
  {
    label: 'Saint-Édouard-De-Maskinongé',
    value: 'CA/QC/Mauricie/Saint-Édouard-De-Maskinongé',
  },
  {
    label: 'Saint-Élie-De-Caxton',
    value: 'CA/QC/Mauricie/Saint-Élie-De-Caxton',
  },
  {
    label: 'Saint-Étienne-Des-Grès',
    value: 'CA/QC/Mauricie/Saint-Étienne-Des-Grès',
  },
  {
    label: 'Saint-Georges-De-Champlain',
    value: 'CA/QC/Mauricie/Saint-Georges-De-Champlain',
  },
  {
    label: 'Saint-Gérard-Des-Laurentides',
    value: 'CA/QC/Mauricie/Saint-Gérard-Des-Laurentides',
  },
  {
    label: 'Saint-Jean-Des-Piles',
    value: 'CA/QC/Mauricie/Saint-Jean-Des-Piles',
  },
  {
    label: 'Saint-Justin',
    value: 'CA/QC/Mauricie/Saint-Justin',
  },
  {
    label: 'Saint-Léon-Le-Grand',
    value: 'CA/QC/Mauricie/Saint-Léon-Le-Grand',
  },
  {
    label: 'Saint-Luc-De-Vincennes',
    value: 'CA/QC/Mauricie/Saint-Luc-De-Vincennes',
  },
  {
    label: 'Saint-Mathieu-Du-Parc',
    value: 'CA/QC/Mauricie/Saint-Mathieu-Du-Parc',
  },
  {
    label: 'Saint-Maurice',
    value: 'CA/QC/Mauricie/Saint-Maurice',
  },
  {
    label: 'Saint-Narcisse',
    value: 'CA/QC/Mauricie/Saint-Narcisse',
  },
  {
    label: 'Saint-Paulin',
    value: 'CA/QC/Mauricie/Saint-Paulin',
  },
  {
    label: 'Saint-Prosper',
    value: 'CA/QC/Mauricie/Saint-Prosper',
  },
  {
    label: 'Saint-Prosper-De-Champlain',
    value: 'CA/QC/Mauricie/Saint-Prosper-De-Champlain',
  },
  {
    label: 'Saint-Roch-De-Mékinac',
    value: 'CA/QC/Mauricie/Saint-Roch-De-Mékinac',
  },
  {
    label: 'Saint-Sévère',
    value: 'CA/QC/Mauricie/Saint-Sévère',
  },
  {
    label: 'Saint-Séverin',
    value: 'CA/QC/Mauricie/Saint-Séverin',
  },
  {
    label: 'Saint-Stanislas',
    value: 'CA/QC/Mauricie/Saint-Stanislas',
  },
  {
    label: 'Saint-Tite',
    value: 'CA/QC/Mauricie/Saint-Tite',
  },
  {
    label: 'Sainte-Angèle-De-Prémont',
    value: 'CA/QC/Mauricie/Sainte-Angèle-De-Prémont',
  },
  {
    label: 'Sainte-Anne-De-La-Pérade',
    value: 'CA/QC/Mauricie/Sainte-Anne-De-La-Pérade',
  },
  {
    label: 'Sainte-Geneviève-De-Batiscan',
    value: 'CA/QC/Mauricie/Sainte-Geneviève-De-Batiscan',
  },
  {
    label: 'Sainte-Thècle',
    value: 'CA/QC/Mauricie/Sainte-Thècle',
  },
  {
    label: 'Sainte-Ursule',
    value: 'CA/QC/Mauricie/Sainte-Ursule',
  },
  {
    label: 'Shawinigan',
    value: 'CA/QC/Mauricie/Shawinigan',
  },
  {
    label: 'Shawinigan-Sud',
    value: 'CA/QC/Mauricie/Shawinigan-Sud',
  },
  {
    label: 'Trois-Rives',
    value: 'CA/QC/Mauricie/Trois-Rives',
  },
  {
    label: 'Trois-Rivières',
    value: 'CA/QC/Mauricie/Trois-Rivières',
  },
  {
    label: 'Valcartier Bpm 210',
    value: 'CA/QC/Mauricie/Valcartier Bpm 210',
  },
  {
    label: 'Wemotaci',
    value: 'CA/QC/Mauricie/Wemotaci',
  },
  {
    label: 'Yamachiche',
    value: 'CA/QC/Mauricie/Yamachiche',
  },
  {
    label: 'Acton Vale',
    value: 'CA/QC/Montérégie/Acton Vale',
  },
  {
    label: 'Akwesasne',
    value: 'CA/QC/Montérégie/Akwesasne',
  },
  {
    label: 'Ange-Gardien',
    value: 'CA/QC/Montérégie/Ange-Gardien',
  },
  {
    label: 'Beauharnois',
    value: 'CA/QC/Montérégie/Beauharnois',
  },
  {
    label: 'Beloeil',
    value: 'CA/QC/Montérégie/Beloeil',
  },
  {
    label: 'Béthanie',
    value: 'CA/QC/Montérégie/Béthanie',
  },
  {
    label: 'Boucherville',
    value: 'CA/QC/Montérégie/Boucherville',
  },
  {
    label: 'Brossard',
    value: 'CA/QC/Montérégie/Brossard',
  },
  {
    label: 'Calixa-Lavallée',
    value: 'CA/QC/Montérégie/Calixa-Lavallée',
  },
  {
    label: 'Candiac',
    value: 'CA/QC/Montérégie/Candiac',
  },
  {
    label: 'Carignan',
    value: 'CA/QC/Montérégie/Carignan',
  },
  {
    label: 'Chambly',
    value: 'CA/QC/Montérégie/Chambly',
  },
  {
    label: 'Châteauguay',
    value: 'CA/QC/Montérégie/Châteauguay',
  },
  {
    label: 'Contrecoeur',
    value: 'CA/QC/Montérégie/Contrecoeur',
  },
  {
    label: 'Coteau-Du-Lac',
    value: 'CA/QC/Montérégie/Coteau-Du-Lac',
  },
  {
    label: 'Delson',
    value: 'CA/QC/Montérégie/Delson',
  },
  {
    label: 'Dundee',
    value: 'CA/QC/Montérégie/Dundee',
  },
  {
    label: 'Elgin',
    value: 'CA/QC/Montérégie/Elgin',
  },
  {
    label: 'Franklin',
    value: 'CA/QC/Montérégie/Franklin',
  },
  {
    label: 'Godmanchester',
    value: 'CA/QC/Montérégie/Godmanchester',
  },
  {
    label: 'Havelock',
    value: 'CA/QC/Montérégie/Havelock',
  },
  {
    label: 'Hemmingford',
    value: 'CA/QC/Montérégie/Hemmingford',
  },
  {
    label: 'Henryville',
    value: 'CA/QC/Montérégie/Henryville',
  },
  {
    label: 'Hinchinbrooke',
    value: 'CA/QC/Montérégie/Hinchinbrooke',
  },
  {
    label: 'Howick',
    value: 'CA/QC/Montérégie/Howick',
  },
  {
    label: 'Hudson',
    value: 'CA/QC/Montérégie/Hudson',
  },
  {
    label: 'Huntingdon',
    value: 'CA/QC/Montérégie/Huntingdon',
  },
  {
    label: 'Kahnawake',
    value: 'CA/QC/Montérégie/Kahnawake',
  },
  {
    label: 'La Prairie',
    value: 'CA/QC/Montérégie/La Prairie',
  },
  {
    label: 'La Présentation',
    value: 'CA/QC/Montérégie/La Présentation',
  },
  {
    label: 'Lacolle',
    value: 'CA/QC/Montérégie/Lacolle',
  },
  {
    label: 'Léry',
    value: 'CA/QC/Montérégie/Léry',
  },
  {
    label: 'Les Cèdres',
    value: 'CA/QC/Montérégie/Les Cèdres',
  },
  {
    label: 'Les Coteaux',
    value: 'CA/QC/Montérégie/Les Coteaux',
  },
  {
    label: "L'île-Cadieux",
    value: "CA/QC/Montérégie/L'île-Cadieux",
  },
  {
    label: "L'île-Perrot",
    value: "CA/QC/Montérégie/L'île-Perrot",
  },
  {
    label: 'Longueuil',
    value: 'CA/QC/Montérégie/Longueuil',
  },
  {
    label: 'Marieville',
    value: 'CA/QC/Montérégie/Marieville',
  },
  {
    label: 'Massueville',
    value: 'CA/QC/Montérégie/Massueville',
  },
  {
    label: 'Mcmasterville',
    value: 'CA/QC/Montérégie/Mcmasterville',
  },
  {
    label: 'Mercier',
    value: 'CA/QC/Montérégie/Mercier',
  },
  {
    label: 'Mont-Saint-Grégoire',
    value: 'CA/QC/Montérégie/Mont-Saint-Grégoire',
  },
  {
    label: 'Mont-Saint-Hilaire',
    value: 'CA/QC/Montérégie/Mont-Saint-Hilaire',
  },
  {
    label: 'Napierville',
    value: 'CA/QC/Montérégie/Napierville',
  },
  {
    label: "Notre-Dame-De-L'île-Perrot",
    value: "CA/QC/Montérégie/Notre-Dame-De-L'île-Perrot",
  },
  {
    label: 'Noyan',
    value: 'CA/QC/Montérégie/Noyan',
  },
  {
    label: 'Ormstown',
    value: 'CA/QC/Montérégie/Ormstown',
  },
  {
    label: 'Otterburn Park',
    value: 'CA/QC/Montérégie/Otterburn Park',
  },
  {
    label: 'Pincourt',
    value: 'CA/QC/Montérégie/Pincourt',
  },
  {
    label: 'Pointe-Des-Cascades',
    value: 'CA/QC/Montérégie/Pointe-Des-Cascades',
  },
  {
    label: 'Pointe-Fortune',
    value: 'CA/QC/Montérégie/Pointe-Fortune',
  },
  {
    label: 'Richelieu',
    value: 'CA/QC/Montérégie/Richelieu',
  },
  {
    label: 'Rigaud',
    value: 'CA/QC/Montérégie/Rigaud',
  },
  {
    label: 'Rivière-Beaudette',
    value: 'CA/QC/Montérégie/Rivière-Beaudette',
  },
  {
    label: 'Rougemont',
    value: 'CA/QC/Montérégie/Rougemont',
  },
  {
    label: 'Roxton',
    value: 'CA/QC/Montérégie/Roxton',
  },
  {
    label: 'Roxton Falls',
    value: 'CA/QC/Montérégie/Roxton Falls',
  },
  {
    label: 'Saint-Aimé',
    value: 'CA/QC/Montérégie/Saint-Aimé',
  },
  {
    label: 'Saint-Alexandre',
    value: 'CA/QC/Montérégie/Saint-Alexandre',
  },
  {
    label: 'Saint-Amable',
    value: 'CA/QC/Montérégie/Saint-Amable',
  },
  {
    label: 'Saint-Anicet',
    value: 'CA/QC/Montérégie/Saint-Anicet',
  },
  {
    label: 'Saint-Antoine-Sur-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Antoine-Sur-Richelieu',
  },
  {
    label: 'Saint-Barnabé-Sud',
    value: 'CA/QC/Montérégie/Saint-Barnabé-Sud',
  },
  {
    label: 'Saint-Basile-Le-Grand',
    value: 'CA/QC/Montérégie/Saint-Basile-Le-Grand',
  },
  {
    label: 'Saint-Bernard-De-Lacolle',
    value: 'CA/QC/Montérégie/Saint-Bernard-De-Lacolle',
  },
  {
    label: 'Saint-Bernard-De-Michaudville',
    value: 'CA/QC/Montérégie/Saint-Bernard-De-Michaudville',
  },
  {
    label: 'Saint-Blaise-Sur-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Blaise-Sur-Richelieu',
  },
  {
    label: 'Saint-Bruno-De-Montarville',
    value: 'CA/QC/Montérégie/Saint-Bruno-De-Montarville',
  },
  {
    label: 'Saint-Césaire',
    value: 'CA/QC/Montérégie/Saint-Césaire',
  },
  {
    label: 'Saint-Charles-Sur-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Charles-Sur-Richelieu',
  },
  {
    label: 'Saint-Chrysostome',
    value: 'CA/QC/Montérégie/Saint-Chrysostome',
  },
  {
    label: 'Saint-Clet',
    value: 'CA/QC/Montérégie/Saint-Clet',
  },
  {
    label: 'Saint-Constant',
    value: 'CA/QC/Montérégie/Saint-Constant',
  },
  {
    label: 'Saint-Cyprien-De-Napierville',
    value: 'CA/QC/Montérégie/Saint-Cyprien-De-Napierville',
  },
  {
    label: 'Saint-Damase',
    value: 'CA/QC/Montérégie/Saint-Damase',
  },
  {
    label: 'Saint-David',
    value: 'CA/QC/Montérégie/Saint-David',
  },
  {
    label: 'Saint-Denis-Sur-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Denis-Sur-Richelieu',
  },
  {
    label: 'Saint-Dominique',
    value: 'CA/QC/Montérégie/Saint-Dominique',
  },
  {
    label: 'Saint-Édouard',
    value: 'CA/QC/Montérégie/Saint-Édouard',
  },
  {
    label: 'Saint-Étienne-De-Beauharnois',
    value: 'CA/QC/Montérégie/Saint-Étienne-De-Beauharnois',
  },
  {
    label: 'Saint-Georges-De-Clarenceville',
    value: 'CA/QC/Montérégie/Saint-Georges-De-Clarenceville',
  },
  {
    label: 'Saint-Gérard-Majella',
    value: 'CA/QC/Montérégie/Saint-Gérard-Majella',
  },
  {
    label: 'Saint-Hugues',
    value: 'CA/QC/Montérégie/Saint-Hugues',
  },
  {
    label: 'Saint-Hyacinthe',
    value: 'CA/QC/Montérégie/Saint-Hyacinthe',
  },
  {
    label: 'Saint-Isidore',
    value: 'CA/QC/Montérégie/Saint-Isidore',
  },
  {
    label: 'Saint-Jacques-Le-Mineur',
    value: 'CA/QC/Montérégie/Saint-Jacques-Le-Mineur',
  },
  {
    label: 'Saint-Jean-Baptiste',
    value: 'CA/QC/Montérégie/Saint-Jean-Baptiste',
  },
  {
    label: 'Saint-Jean-Sur-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Jean-Sur-Richelieu',
  },
  {
    label: 'Saint-Joseph-De-Sorel',
    value: 'CA/QC/Montérégie/Saint-Joseph-De-Sorel',
  },
  {
    label: 'Saint-Jude',
    value: 'CA/QC/Montérégie/Saint-Jude',
  },
  {
    label: 'Saint-Lambert',
    value: 'CA/QC/Montérégie/Saint-Lambert',
  },
  {
    label: 'Saint-Lazare',
    value: 'CA/QC/Montérégie/Saint-Lazare',
  },
  {
    label: 'Saint-Liboire',
    value: 'CA/QC/Montérégie/Saint-Liboire',
  },
  {
    label: 'Saint-Louis',
    value: 'CA/QC/Montérégie/Saint-Louis',
  },
  {
    label: 'Saint-Louis-De-Gonzague',
    value: 'CA/QC/Montérégie/Saint-Louis-De-Gonzague',
  },
  {
    label: 'Saint-Marc-Sur-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Marc-Sur-Richelieu',
  },
  {
    label: 'Saint-Marcel-De-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Marcel-De-Richelieu',
  },
  {
    label: 'Saint-Mathias-Sur-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Mathias-Sur-Richelieu',
  },
  {
    label: 'Saint-Mathieu',
    value: 'CA/QC/Montérégie/Saint-Mathieu',
  },
  {
    label: 'Saint-Mathieu-De-Beloeil',
    value: 'CA/QC/Montérégie/Saint-Mathieu-De-Beloeil',
  },
  {
    label: 'Saint-Michel',
    value: 'CA/QC/Montérégie/Saint-Michel',
  },
  {
    label: "Saint-Nazaire-D'acton",
    value: "CA/QC/Montérégie/Saint-Nazaire-D'acton",
  },
  {
    label: 'Saint-Ours',
    value: 'CA/QC/Montérégie/Saint-Ours',
  },
  {
    label: 'Saint-Patrice-De-Sherrington',
    value: 'CA/QC/Montérégie/Saint-Patrice-De-Sherrington',
  },
  {
    label: "Saint-Paul-D'abbotsford",
    value: "CA/QC/Montérégie/Saint-Paul-D'abbotsford",
  },
  {
    label: "Saint-Paul-De-L'île-Aux-Noix",
    value: "CA/QC/Montérégie/Saint-Paul-De-L'île-Aux-Noix",
  },
  {
    label: 'Saint-Philippe',
    value: 'CA/QC/Montérégie/Saint-Philippe',
  },
  {
    label: 'Saint-Pie',
    value: 'CA/QC/Montérégie/Saint-Pie',
  },
  {
    label: 'Saint-Polycarpe',
    value: 'CA/QC/Montérégie/Saint-Polycarpe',
  },
  {
    label: 'Saint-Rémi',
    value: 'CA/QC/Montérégie/Saint-Rémi',
  },
  {
    label: 'Saint-Robert',
    value: 'CA/QC/Montérégie/Saint-Robert',
  },
  {
    label: 'Saint-Roch-De-Richelieu',
    value: 'CA/QC/Montérégie/Saint-Roch-De-Richelieu',
  },
  {
    label: 'Saint-Sébastien',
    value: 'CA/QC/Montérégie/Saint-Sébastien',
  },
  {
    label: 'Saint-Simon',
    value: 'CA/QC/Montérégie/Saint-Simon',
  },
  {
    label: 'Saint-Stanislas-De-Kostka',
    value: 'CA/QC/Montérégie/Saint-Stanislas-De-Kostka',
  },
  {
    label: 'Saint-Télesphore',
    value: 'CA/QC/Montérégie/Saint-Télesphore',
  },
  {
    label: "Saint-Théodore-D'acton",
    value: "CA/QC/Montérégie/Saint-Théodore-D'acton",
  },
  {
    label: 'Saint-Urbain-Premier',
    value: 'CA/QC/Montérégie/Saint-Urbain-Premier',
  },
  {
    label: 'Saint-Valentin',
    value: 'CA/QC/Montérégie/Saint-Valentin',
  },
  {
    label: 'Saint-Valérien-De-Milton',
    value: 'CA/QC/Montérégie/Saint-Valérien-De-Milton',
  },
  {
    label: 'Saint-Zotique',
    value: 'CA/QC/Montérégie/Saint-Zotique',
  },
  {
    label: 'Sainte-Angèle-De-Monnoir',
    value: 'CA/QC/Montérégie/Sainte-Angèle-De-Monnoir',
  },
  {
    label: 'Sainte-Anne-De-Sabrevois',
    value: 'CA/QC/Montérégie/Sainte-Anne-De-Sabrevois',
  },
  {
    label: 'Sainte-Anne-De-Sorel',
    value: 'CA/QC/Montérégie/Sainte-Anne-De-Sorel',
  },
  {
    label: 'Sainte-Barbe',
    value: 'CA/QC/Montérégie/Sainte-Barbe',
  },
  {
    label: "Sainte-Brigide-D'iberville",
    value: "CA/QC/Montérégie/Sainte-Brigide-D'iberville",
  },
  {
    label: 'Sainte-Catherine',
    value: 'CA/QC/Montérégie/Sainte-Catherine',
  },
  {
    label: 'Sainte-Christine',
    value: 'CA/QC/Montérégie/Sainte-Christine',
  },
  {
    label: 'Sainte-Clotilde',
    value: 'CA/QC/Montérégie/Sainte-Clotilde',
  },
  {
    label: 'Sainte-Hélène-De-Bagot',
    value: 'CA/QC/Montérégie/Sainte-Hélène-De-Bagot',
  },
  {
    label: 'Sainte-Julie',
    value: 'CA/QC/Montérégie/Sainte-Julie',
  },
  {
    label: 'Sainte-Justine-De-Newton',
    value: 'CA/QC/Montérégie/Sainte-Justine-De-Newton',
  },
  {
    label: 'Sainte-Madeleine',
    value: 'CA/QC/Montérégie/Sainte-Madeleine',
  },
  {
    label: 'Sainte-Marie-Madeleine',
    value: 'CA/QC/Montérégie/Sainte-Marie-Madeleine',
  },
  {
    label: 'Sainte-Marthe',
    value: 'CA/QC/Montérégie/Sainte-Marthe',
  },
  {
    label: 'Sainte-Martine',
    value: 'CA/QC/Montérégie/Sainte-Martine',
  },
  {
    label: 'Sainte-Victoire-De-Sorel',
    value: 'CA/QC/Montérégie/Sainte-Victoire-De-Sorel',
  },
  {
    label: 'Salaberry-De-Valleyfield',
    value: 'CA/QC/Montérégie/Salaberry-De-Valleyfield',
  },
  {
    label: 'Sorel-Tracy',
    value: 'CA/QC/Montérégie/Sorel-Tracy',
  },
  {
    label: 'Terrasse-Vaudreuil',
    value: 'CA/QC/Montérégie/Terrasse-Vaudreuil',
  },
  {
    label: 'Très-Saint-Rédempteur',
    value: 'CA/QC/Montérégie/Très-Saint-Rédempteur',
  },
  {
    label: 'Très-Saint-Sacrement',
    value: 'CA/QC/Montérégie/Très-Saint-Sacrement',
  },
  {
    label: 'Upton',
    value: 'CA/QC/Montérégie/Upton',
  },
  {
    label: 'Varennes',
    value: 'CA/QC/Montérégie/Varennes',
  },
  {
    label: 'Vaudreuil-Dorion',
    value: 'CA/QC/Montérégie/Vaudreuil-Dorion',
  },
  {
    label: 'Vaudreuil-Sur-Le-Lac',
    value: 'CA/QC/Montérégie/Vaudreuil-Sur-Le-Lac',
  },
  {
    label: 'Venise-En-Québec',
    value: 'CA/QC/Montérégie/Venise-En-Québec',
  },
  {
    label: 'Verchères',
    value: 'CA/QC/Montérégie/Verchères',
  },
  {
    label: 'Yamaska',
    value: 'CA/QC/Montérégie/Yamaska',
  },
  {
    label: 'Ahunstic-Cartierville',
    value: 'CA/QC/Montréal/Ahunstic-Cartierville',
  },
  {
    label: 'Ahunstic-Cartierville',
    value: 'CA/QC/Montréal/Ahunstic-Cartierville',
  },
  {
    label: 'Anjou',
    value: 'CA/QC/Montréal/Anjou',
  },
  {
    label: "Baie-D'urfé",
    value: "CA/QC/Montréal/Baie-D'urfé",
  },
  {
    label: 'Beaconsfield',
    value: 'CA/QC/Montréal/Beaconsfield',
  },
  {
    label: 'Côte-Des-Neiges-Notre-Dame-De-Grâce',
    value: 'CA/QC/Montréal/Côte-Des-Neiges-Notre-Dame-De-Grâce',
  },
  {
    label: 'Côte-Des-Neiges–Notre-Dame-De-Grâce',
    value: 'CA/QC/Montréal/Côte-Des-Neiges–Notre-Dame-De-Grâce',
  },
  {
    label: 'Côte-Saint-Luc',
    value: 'CA/QC/Montréal/Côte-Saint-Luc',
  },
  {
    label: 'Ahunstic-Des Ormeaux',
    value: 'CA/QC/Montréal/Ahunstic-Des Ormeaux',
  },
  {
    label: 'Dorval',
    value: 'CA/QC/Montréal/Dorval',
  },
  {
    label: 'Hampstead',
    value: 'CA/QC/Montréal/Hampstead',
  },
  {
    label: 'Kirkland',
    value: 'CA/QC/Montréal/Kirkland',
  },
  {
    label: 'Ahunstic-Patrie',
    value: 'CA/QC/Montréal/Ahunstic-Patrie',
  },
  {
    label: 'Lachine',
    value: 'CA/QC/Montréal/Lachine',
  },
  {
    label: 'Lasalle',
    value: 'CA/QC/Montréal/Lasalle',
  },
  {
    label: 'Le Plateau-Mont-Royal',
    value: 'CA/QC/Montréal/Le Plateau-Mont-Royal',
  },
  {
    label: 'Ahunstic-Oues',
    value: 'CA/QC/Montréal/Ahunstic-Oues',
  },
  {
    label: 'Ahunstic-Ouest',
    value: 'CA/QC/Montréal/Ahunstic-Ouest',
  },
  {
    label: "L'île-Bizard-Sainte-Geneviève",
    value: "CA/QC/Montréal/L'île-Bizard-Sainte-Geneviève",
  },
  {
    label: "L'île-Dorval",
    value: "CA/QC/Montréal/L'île-Dorval",
  },
  {
    label: 'Mercier-Hochelaga-Maisonneuve',
    value: 'CA/QC/Montréal/Mercier-Hochelaga-Maisonneuve',
  },
  {
    label: 'Mercier-Hochelaga-Maisonneuve',
    value: 'CA/QC/Montréal/Mercier-Hochelaga-Maisonneuve',
  },
  {
    label: 'Ahunstic-Maisonneuve',
    value: 'CA/QC/Montréal/Ahunstic-Maisonneuve',
  },
  {
    label: 'Ahunstic-Royal',
    value: 'CA/QC/Montréal/Ahunstic-Royal',
  },
  {
    label: 'Montréal',
    value: 'CA/QC/Montréal/Montréal',
  },
  {
    label: 'Ahunstic-Est',
    value: 'CA/QC/Montréal/Ahunstic-Est',
  },
  {
    label: 'Ahunstic-Nord',
    value: 'CA/QC/Montréal/Ahunstic-Nord',
  },
  {
    label: 'Ahunstic-Ouest',
    value: 'CA/QC/Montréal/Ahunstic-Ouest',
  },
  {
    label: 'Outremont',
    value: 'CA/QC/Montréal/Outremont',
  },
  {
    label: 'Ahunstic-Roxboro',
    value: 'CA/QC/Montréal/Ahunstic-Roxboro',
  },
  {
    label: 'Ahunstic-Claire',
    value: 'CA/QC/Montréal/Ahunstic-Claire',
  },
  {
    label: 'Rivière-Des-Prairies-Pointe-Aux-Trembles',
    value: 'CA/QC/Montréal/Rivière-Des-Prairies-Pointe-Aux-Trembles',
  },
  {
    label: 'Rosemont-La Petite-Patrie',
    value: 'CA/QC/Montréal/Rosemont-La Petite-Patrie',
  },
  {
    label: 'Ahunstic-Patrie',
    value: 'CA/QC/Montréal/Ahunstic-Patrie',
  },
  {
    label: 'Ahunstic-Laurent',
    value: 'CA/QC/Montréal/Ahunstic-Laurent',
  },
  {
    label: 'Ahunstic-Léonard',
    value: 'CA/QC/Montréal/Ahunstic-Léonard',
  },
  {
    label: 'Sainte-Anne-De-Bellevue',
    value: 'CA/QC/Montréal/Sainte-Anne-De-Bellevue',
  },
  {
    label: 'Senneville',
    value: 'CA/QC/Montréal/Senneville',
  },
  {
    label: 'Ahunstic-Léonard',
    value: 'CA/QC/Montréal/Ahunstic-Léonard',
  },
  {
    label: 'Verdun',
    value: 'CA/QC/Montréal/Verdun',
  },
  {
    label: 'Ahunstic-Marie',
    value: 'CA/QC/Montréal/Ahunstic-Marie',
  },
  {
    label: 'Villeray-Saint-Michel-Parc-Extension',
    value: 'CA/QC/Montréal/Villeray-Saint-Michel-Parc-Extension',
  },
  {
    label: 'Westmount',
    value: 'CA/QC/Montréal/Westmount',
  },
  {
    label: 'La Prairie',
    value: 'CA/QC/Montrégie/La Prairie',
  },
  {
    label: 'Akulivik',
    value: 'CA/QC/Nord-du-Québec/Akulivik',
  },
  {
    label: 'Aupaluk',
    value: 'CA/QC/Nord-du-Québec/Aupaluk',
  },
  {
    label: 'Beaucanton',
    value: 'CA/QC/Nord-du-Québec/Beaucanton',
  },
  {
    label: 'Chapais',
    value: 'CA/QC/Nord-du-Québec/Chapais',
  },
  {
    label: 'Chibougamau',
    value: 'CA/QC/Nord-du-Québec/Chibougamau',
  },
  {
    label: 'Chisasibi',
    value: 'CA/QC/Nord-du-Québec/Chisasibi',
  },
  {
    label: 'Desmaraisville',
    value: 'CA/QC/Nord-du-Québec/Desmaraisville',
  },
  {
    label: 'Eastmain',
    value: 'CA/QC/Nord-du-Québec/Eastmain',
  },
  {
    label: 'Eastmain 2',
    value: 'CA/QC/Nord-du-Québec/Eastmain 2',
  },
  {
    label: 'Inukjuak',
    value: 'CA/QC/Nord-du-Québec/Inukjuak',
  },
  {
    label: 'Ivujivik',
    value: 'CA/QC/Nord-du-Québec/Ivujivik',
  },
  {
    label: 'Kangiqsualujjuaq',
    value: 'CA/QC/Nord-du-Québec/Kangiqsualujjuaq',
  },
  {
    label: 'Kangiqsujuaq',
    value: 'CA/QC/Nord-du-Québec/Kangiqsujuaq',
  },
  {
    label: 'Kangirsuk',
    value: 'CA/QC/Nord-du-Québec/Kangirsuk',
  },
  {
    label: 'Kawawachikamach',
    value: 'CA/QC/Nord-du-Québec/Kawawachikamach',
  },
  {
    label: 'Kuujjuaq',
    value: 'CA/QC/Nord-du-Québec/Kuujjuaq',
  },
  {
    label: 'Kuujjuarapik',
    value: 'CA/QC/Nord-du-Québec/Kuujjuarapik',
  },
  {
    label: 'Lebel-Sur-Quévillon',
    value: 'CA/QC/Nord-du-Québec/Lebel-Sur-Quévillon',
  },
  {
    label: 'Matagami',
    value: 'CA/QC/Nord-du-Québec/Matagami',
  },
  {
    label: 'Matimekosh Lac-John',
    value: 'CA/QC/Nord-du-Québec/Matimekosh Lac-John',
  },
  {
    label: 'Miquelon',
    value: 'CA/QC/Nord-du-Québec/Miquelon',
  },
  {
    label: 'Mistissini',
    value: 'CA/QC/Nord-du-Québec/Mistissini',
  },
  {
    label: 'Nemaska',
    value: 'CA/QC/Nord-du-Québec/Nemaska',
  },
  {
    label: 'Oujé-Bougoumou',
    value: 'CA/QC/Nord-du-Québec/Oujé-Bougoumou',
  },
  {
    label: 'Puvirnituq',
    value: 'CA/QC/Nord-du-Québec/Puvirnituq',
  },
  {
    label: 'Quaqtaq',
    value: 'CA/QC/Nord-du-Québec/Quaqtaq',
  },
  {
    label: 'Radisson',
    value: 'CA/QC/Nord-du-Québec/Radisson',
  },
  {
    label: 'Salluit',
    value: 'CA/QC/Nord-du-Québec/Salluit',
  },
  {
    label: 'Tasiujaq',
    value: 'CA/QC/Nord-du-Québec/Tasiujaq',
  },
  {
    label: 'Umiujaq',
    value: 'CA/QC/Nord-du-Québec/Umiujaq',
  },
  {
    label: 'Val-Paradis',
    value: 'CA/QC/Nord-du-Québec/Val-Paradis',
  },
  {
    label: 'Val-Saint-Gilles',
    value: 'CA/QC/Nord-du-Québec/Val-Saint-Gilles',
  },
  {
    label: 'Villebois',
    value: 'CA/QC/Nord-du-Québec/Villebois',
  },
  {
    label: 'Waskaganish',
    value: 'CA/QC/Nord-du-Québec/Waskaganish',
  },
  {
    label: 'Waswanipi',
    value: 'CA/QC/Nord-du-Québec/Waswanipi',
  },
  {
    label: 'Wemindji',
    value: 'CA/QC/Nord-du-Québec/Wemindji',
  },
  {
    label: 'Whapmagoostui',
    value: 'CA/QC/Nord-du-Québec/Whapmagoostui',
  },
  {
    label: 'Alcove',
    value: 'CA/QC/Outaouais/Alcove',
  },
  {
    label: 'Alleyn-Et-Cawood',
    value: 'CA/QC/Outaouais/Alleyn-Et-Cawood',
  },
  {
    label: 'Aumond',
    value: 'CA/QC/Outaouais/Aumond',
  },
  {
    label: 'Blue Sea',
    value: 'CA/QC/Outaouais/Blue Sea',
  },
  {
    label: 'Boileau',
    value: 'CA/QC/Outaouais/Boileau',
  },
  {
    label: 'Bois-Franc',
    value: 'CA/QC/Outaouais/Bois-Franc',
  },
  {
    label: 'Bouchette',
    value: 'CA/QC/Outaouais/Bouchette',
  },
  {
    label: 'Bowman',
    value: 'CA/QC/Outaouais/Bowman',
  },
  {
    label: 'Bristol',
    value: 'CA/QC/Outaouais/Bristol',
  },
  {
    label: 'Bryson',
    value: 'CA/QC/Outaouais/Bryson',
  },
  {
    label: "Campbell's Bay",
    value: "CA/QC/Outaouais/Campbell's Bay",
  },
  {
    label: 'Cantley',
    value: 'CA/QC/Outaouais/Cantley',
  },
  {
    label: 'Cayamant',
    value: 'CA/QC/Outaouais/Cayamant',
  },
  {
    label: 'Chapeau',
    value: 'CA/QC/Outaouais/Chapeau',
  },
  {
    label: 'Chelsea',
    value: 'CA/QC/Outaouais/Chelsea',
  },
  {
    label: 'Chénéville',
    value: 'CA/QC/Outaouais/Chénéville',
  },
  {
    label: 'Chichester',
    value: 'CA/QC/Outaouais/Chichester',
  },
  {
    label: 'Clarendon',
    value: 'CA/QC/Outaouais/Clarendon',
  },
  {
    label: 'Danford Lake',
    value: 'CA/QC/Outaouais/Danford Lake',
  },
  {
    label: 'Davidson',
    value: 'CA/QC/Outaouais/Davidson',
  },
  {
    label: 'Déléage',
    value: 'CA/QC/Outaouais/Déléage',
  },
  {
    label: 'Denholm',
    value: 'CA/QC/Outaouais/Denholm',
  },
  {
    label: 'Duclos',
    value: 'CA/QC/Outaouais/Duclos',
  },
  {
    label: 'Duhamel',
    value: 'CA/QC/Outaouais/Duhamel',
  },
  {
    label: 'Egan-Sud',
    value: 'CA/QC/Outaouais/Egan-Sud',
  },
  {
    label: 'Farrellton',
    value: 'CA/QC/Outaouais/Farrellton',
  },
  {
    label: 'Fassett',
    value: 'CA/QC/Outaouais/Fassett',
  },
  {
    label: 'Fort-Coulonge',
    value: 'CA/QC/Outaouais/Fort-Coulonge',
  },
  {
    label: 'Gatineau',
    value: 'CA/QC/Outaouais/Gatineau',
  },
  {
    label: 'Gracefield',
    value: 'CA/QC/Outaouais/Gracefield',
  },
  {
    label: 'Grand-Remous',
    value: 'CA/QC/Outaouais/Grand-Remous',
  },
  {
    label: 'Kazabazua',
    value: 'CA/QC/Outaouais/Kazabazua',
  },
  {
    label: 'Kitigan Zibi',
    value: 'CA/QC/Outaouais/Kitigan Zibi',
  },
  {
    label: 'La Pêche',
    value: 'CA/QC/Outaouais/La Pêche',
  },
  {
    label: 'Lac Des Loups',
    value: 'CA/QC/Outaouais/Lac Des Loups',
  },
  {
    label: 'Lac-Des-Plages',
    value: 'CA/QC/Outaouais/Lac-Des-Plages',
  },
  {
    label: 'Lac-Rapide',
    value: 'CA/QC/Outaouais/Lac-Rapide',
  },
  {
    label: 'Lac-Sainte-Marie',
    value: 'CA/QC/Outaouais/Lac-Sainte-Marie',
  },
  {
    label: 'Lac-Simon',
    value: 'CA/QC/Outaouais/Lac-Simon',
  },
  {
    label: 'Ladysmith',
    value: 'CA/QC/Outaouais/Ladysmith',
  },
  {
    label: "L'ange-Gardien",
    value: "CA/QC/Outaouais/L'ange-Gardien",
  },
  {
    label: "L'île-Du-Grand-Calumet",
    value: "CA/QC/Outaouais/L'île-Du-Grand-Calumet",
  },
  {
    label: "L'isle-Aux-Allumettes",
    value: "CA/QC/Outaouais/L'isle-Aux-Allumettes",
  },
  {
    label: 'Litchfield',
    value: 'CA/QC/Outaouais/Litchfield',
  },
  {
    label: 'Lochaber',
    value: 'CA/QC/Outaouais/Lochaber',
  },
  {
    label: 'Lochaber-Partie-Ouest',
    value: 'CA/QC/Outaouais/Lochaber-Partie-Ouest',
  },
  {
    label: 'Low',
    value: 'CA/QC/Outaouais/Low',
  },
  {
    label: 'Luskville',
    value: 'CA/QC/Outaouais/Luskville',
  },
  {
    label: 'Maniwaki',
    value: 'CA/QC/Outaouais/Maniwaki',
  },
  {
    label: 'Mansfield-Et-Pontefract',
    value: 'CA/QC/Outaouais/Mansfield-Et-Pontefract',
  },
  {
    label: 'Mayo',
    value: 'CA/QC/Outaouais/Mayo',
  },
  {
    label: 'Messines',
    value: 'CA/QC/Outaouais/Messines',
  },
  {
    label: 'Montcerf-Lytton',
    value: 'CA/QC/Outaouais/Montcerf-Lytton',
  },
  {
    label: 'Montebello',
    value: 'CA/QC/Outaouais/Montebello',
  },
  {
    label: 'Montpellier',
    value: 'CA/QC/Outaouais/Montpellier',
  },
  {
    label: 'Mulgrave-Et-Derry',
    value: 'CA/QC/Outaouais/Mulgrave-Et-Derry',
  },
  {
    label: 'Namur',
    value: 'CA/QC/Outaouais/Namur',
  },
  {
    label: 'Notre-Dame-De-Bonsecours',
    value: 'CA/QC/Outaouais/Notre-Dame-De-Bonsecours',
  },
  {
    label: 'Notre-Dame-De-La-Paix',
    value: 'CA/QC/Outaouais/Notre-Dame-De-La-Paix',
  },
  {
    label: 'Notre-Dame-De-La-Salette',
    value: 'CA/QC/Outaouais/Notre-Dame-De-La-Salette',
  },
  {
    label: 'Otter Lake',
    value: 'CA/QC/Outaouais/Otter Lake',
  },
  {
    label: 'Papineauville',
    value: 'CA/QC/Outaouais/Papineauville',
  },
  {
    label: 'Plaisance',
    value: 'CA/QC/Outaouais/Plaisance',
  },
  {
    label: 'Pontiac',
    value: 'CA/QC/Outaouais/Pontiac',
  },
  {
    label: 'Portage-Du-Fort',
    value: 'CA/QC/Outaouais/Portage-Du-Fort',
  },
  {
    label: 'Quyon',
    value: 'CA/QC/Outaouais/Quyon',
  },
  {
    label: 'Rapides-Des-Joachims',
    value: 'CA/QC/Outaouais/Rapides-Des-Joachims',
  },
  {
    label: 'Ripon',
    value: 'CA/QC/Outaouais/Ripon',
  },
  {
    label: 'Saint-André-Avellin',
    value: 'CA/QC/Outaouais/Saint-André-Avellin',
  },
  {
    label: 'Saint-Émile-De-Suffolk',
    value: 'CA/QC/Outaouais/Saint-Émile-De-Suffolk',
  },
  {
    label: 'Saint-Sixte',
    value: 'CA/QC/Outaouais/Saint-Sixte',
  },
  {
    label: 'Sainte-Cécile-De-Masham',
    value: 'CA/QC/Outaouais/Sainte-Cécile-De-Masham',
  },
  {
    label: 'Sainte-Thérèse-De-La-Gatineau',
    value: 'CA/QC/Outaouais/Sainte-Thérèse-De-La-Gatineau',
  },
  {
    label: 'Shawville',
    value: 'CA/QC/Outaouais/Shawville',
  },
  {
    label: 'Sheenboro',
    value: 'CA/QC/Outaouais/Sheenboro',
  },
  {
    label: 'Thorne',
    value: 'CA/QC/Outaouais/Thorne',
  },
  {
    label: 'Thurso',
    value: 'CA/QC/Outaouais/Thurso',
  },
  {
    label: 'Val-Des-Bois',
    value: 'CA/QC/Outaouais/Val-Des-Bois',
  },
  {
    label: 'Val-Des-Monts',
    value: 'CA/QC/Outaouais/Val-Des-Monts',
  },
  {
    label: 'Venosta',
    value: 'CA/QC/Outaouais/Venosta',
  },
  {
    label: 'Wakefield',
    value: 'CA/QC/Outaouais/Wakefield',
  },
  {
    label: 'Waltham',
    value: 'CA/QC/Outaouais/Waltham',
  },
  {
    label: 'Albanel',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Albanel',
  },
  {
    label: 'Alma',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Alma',
  },
  {
    label: 'Alouette',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Alouette',
  },
  {
    label: 'Bégin',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Bégin',
  },
  {
    label: 'Boulanger',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Boulanger',
  },
  {
    label: 'Canton Tremblay',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Canton Tremblay',
  },
  {
    label: 'Chambord',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Chambord',
  },
  {
    label: 'Chicoutimi',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Chicoutimi',
  },
  {
    label: 'Dalmas',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Dalmas',
  },
  {
    label: 'Desbiens',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Desbiens',
  },
  {
    label: 'Dolbeau-Mistassini',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Dolbeau-Mistassini',
  },
  {
    label: 'Ferland-Et-Boilleau',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Ferland-Et-Boilleau',
  },
  {
    label: 'Girardville',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Girardville',
  },
  {
    label: 'Hébertville',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Hébertville',
  },
  {
    label: 'Hébertville-Station',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Hébertville-Station',
  },
  {
    label: 'Jonquière',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Jonquière',
  },
  {
    label: 'La Baie',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/La Baie',
  },
  {
    label: 'La Doré',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/La Doré',
  },
  {
    label: 'Labrecque',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Labrecque',
  },
  {
    label: 'Lac-Bouchette',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Lac-Bouchette',
  },
  {
    label: 'Lac-Kénogami',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Lac-Kénogami',
  },
  {
    label: 'Lamarche',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Lamarche',
  },
  {
    label: "L'anse-Saint-Jean",
    value: "CA/QC/Saguenay-Lac-Saint-Jean/L'anse-Saint-Jean",
  },
  {
    label: 'Larouche',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Larouche',
  },
  {
    label: "L'ascension-De-Notre-Seigneur",
    value: "CA/QC/Saguenay-Lac-Saint-Jean/L'ascension-De-Notre-Seigneur",
  },
  {
    label: 'Laterrière',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Laterrière',
  },
  {
    label: 'Mashteuiatsh',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Mashteuiatsh',
  },
  {
    label: 'Métabetchouan-Lac-À-La-Croix',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Métabetchouan-Lac-À-La-Croix',
  },
  {
    label: 'Normandin',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Normandin',
  },
  {
    label: 'Notre-Dame-De-Lorette',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Notre-Dame-De-Lorette',
  },
  {
    label: 'Passes-Dangereuses',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Passes-Dangereuses',
  },
  {
    label: 'Péribonka',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Péribonka',
  },
  {
    label: 'Petit-Saguenay',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Petit-Saguenay',
  },
  {
    label: 'Rivière-Éternité',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Rivière-Éternité',
  },
  {
    label: 'Roberval',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Roberval',
  },
  {
    label: 'Saint-Ambroise',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Ambroise',
  },
  {
    label: 'Saint-André-Du-Lac-Saint-Jean',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-André-Du-Lac-Saint-Jean',
  },
  {
    label: 'Saint-Augustin',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Augustin',
  },
  {
    label: 'Saint-Bruno',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Bruno',
  },
  {
    label: 'Saint-Charles-De-Bourget',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Charles-De-Bourget',
  },
  {
    label: 'Saint-David-De-Falardeau',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-David-De-Falardeau',
  },
  {
    label: 'Saint-Edmond-Les-Plaines',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Edmond-Les-Plaines',
  },
  {
    label: "Saint-Eugène-D'argentenay",
    value: "CA/QC/Saguenay-Lac-Saint-Jean/Saint-Eugène-D'argentenay",
  },
  {
    label: 'Saint-Félicien',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Félicien',
  },
  {
    label: "Saint-Félix-D'otis",
    value: "CA/QC/Saguenay-Lac-Saint-Jean/Saint-Félix-D'otis",
  },
  {
    label: 'Saint-François-De-Sales',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-François-De-Sales',
  },
  {
    label: 'Saint-Fulgence',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Fulgence',
  },
  {
    label: 'Saint-Gédéon',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Gédéon',
  },
  {
    label: 'Saint-Henri-De-Taillon',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Henri-De-Taillon',
  },
  {
    label: 'Saint-Honoré',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Honoré',
  },
  {
    label: 'Saint-Ludger-De-Milot',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Ludger-De-Milot',
  },
  {
    label: 'Saint-Nazaire',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Nazaire',
  },
  {
    label: 'Saint-Prime',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Prime',
  },
  {
    label: 'Saint-Stanislas',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Stanislas',
  },
  {
    label: 'Saint-Thomas-Didyme',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Saint-Thomas-Didyme',
  },
  {
    label: 'Sainte-Élisabeth-De-Proulx',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Sainte-Élisabeth-De-Proulx',
  },
  {
    label: 'Sainte-Hedwidge',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Sainte-Hedwidge',
  },
  {
    label: "Sainte-Jeanne-D'arc",
    value: "CA/QC/Saguenay-Lac-Saint-Jean/Sainte-Jeanne-D'arc",
  },
  {
    label: 'Sainte-Monique',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Sainte-Monique',
  },
  {
    label: 'Sainte-Rose-Du-Nord',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Sainte-Rose-Du-Nord',
  },
  {
    label: 'Shipshaw',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Shipshaw',
  },
  {
    label: 'Taschereau',
    value: 'CA/QC/Saguenay-Lac-Saint-Jean/Taschereau',
  },
  {
    label: 'Aneroid',
    value: 'CA/SK/Assiniboia/Aneroid',
  },
  {
    label: 'Assiniboia',
    value: 'CA/SK/Assiniboia/Assiniboia',
  },
  {
    label: 'Coronach',
    value: 'CA/SK/Assiniboia/Coronach',
  },
  {
    label: 'Crane Valley',
    value: 'CA/SK/Assiniboia/Crane Valley',
  },
  {
    label: 'Fir Mountain',
    value: 'CA/SK/Assiniboia/Fir Mountain',
  },
  {
    label: 'Glenbain',
    value: 'CA/SK/Assiniboia/Glenbain',
  },
  {
    label: 'Glentworth',
    value: 'CA/SK/Assiniboia/Glentworth',
  },
  {
    label: 'Gravelbourg',
    value: 'CA/SK/Assiniboia/Gravelbourg',
  },
  {
    label: 'Hazenmore',
    value: 'CA/SK/Assiniboia/Hazenmore',
  },
  {
    label: 'Lafleche',
    value: 'CA/SK/Assiniboia/Lafleche',
  },
  {
    label: 'Limerick',
    value: 'CA/SK/Assiniboia/Limerick',
  },
  {
    label: 'Mankota',
    value: 'CA/SK/Assiniboia/Mankota',
  },
  {
    label: 'Mazenod',
    value: 'CA/SK/Assiniboia/Mazenod',
  },
  {
    label: 'Mccord',
    value: 'CA/SK/Assiniboia/Mccord',
  },
  {
    label: 'Mossbank',
    value: 'CA/SK/Assiniboia/Mossbank',
  },
  {
    label: 'Neville',
    value: 'CA/SK/Assiniboia/Neville',
  },
  {
    label: 'Ponteix',
    value: 'CA/SK/Assiniboia/Ponteix',
  },
  {
    label: 'Rockglen',
    value: 'CA/SK/Assiniboia/Rockglen',
  },
  {
    label: 'Willow Bunch',
    value: 'CA/SK/Assiniboia/Willow Bunch',
  },
  {
    label: 'Wood Mountain',
    value: 'CA/SK/Assiniboia/Wood Mountain',
  },
  {
    label: 'Woodrow',
    value: 'CA/SK/Assiniboia/Woodrow',
  },
  {
    label: 'Alticane',
    value: 'CA/SK/Battleford North/Alticane',
  },
  {
    label: 'Big River',
    value: 'CA/SK/Battleford North/Big River',
  },
  {
    label: 'Blaine Lake',
    value: 'CA/SK/Battleford North/Blaine Lake',
  },
  {
    label: 'Borden',
    value: 'CA/SK/Battleford North/Borden',
  },
  {
    label: 'Canwood',
    value: 'CA/SK/Battleford North/Canwood',
  },
  {
    label: 'Debden',
    value: 'CA/SK/Battleford North/Debden',
  },
  {
    label: 'Denholm',
    value: 'CA/SK/Battleford North/Denholm',
  },
  {
    label: 'Hafford',
    value: 'CA/SK/Battleford North/Hafford',
  },
  {
    label: 'Holbein',
    value: 'CA/SK/Battleford North/Holbein',
  },
  {
    label: 'Leask',
    value: 'CA/SK/Battleford North/Leask',
  },
  {
    label: 'Leoville',
    value: 'CA/SK/Battleford North/Leoville',
  },
  {
    label: 'Marcelin',
    value: 'CA/SK/Battleford North/Marcelin',
  },
  {
    label: 'Maymont',
    value: 'CA/SK/Battleford North/Maymont',
  },
  {
    label: 'Mayview',
    value: 'CA/SK/Battleford North/Mayview',
  },
  {
    label: 'Medstead',
    value: 'CA/SK/Battleford North/Medstead',
  },
  {
    label: 'Mildred',
    value: 'CA/SK/Battleford North/Mildred',
  },
  {
    label: 'Mont Nebo',
    value: 'CA/SK/Battleford North/Mont Nebo',
  },
  {
    label: 'North Battleford',
    value: 'CA/SK/Battleford North/North Battleford',
  },
  {
    label: 'Parkside',
    value: 'CA/SK/Battleford North/Parkside',
  },
  {
    label: 'Radisson',
    value: 'CA/SK/Battleford North/Radisson',
  },
  {
    label: 'Richard',
    value: 'CA/SK/Battleford North/Richard',
  },
  {
    label: 'Shell Lake',
    value: 'CA/SK/Battleford North/Shell Lake',
  },
  {
    label: 'Speers',
    value: 'CA/SK/Battleford North/Speers',
  },
  {
    label: 'Spiritwood',
    value: 'CA/SK/Battleford North/Spiritwood',
  },
  {
    label: 'Victoire',
    value: 'CA/SK/Battleford North/Victoire',
  },
  {
    label: 'Waskesiu Lake',
    value: 'CA/SK/Battleford North/Waskesiu Lake',
  },
  {
    label: 'Bracken',
    value: 'CA/SK/Cadillac/Bracken',
  },
  {
    label: 'Claydon',
    value: 'CA/SK/Cadillac/Claydon',
  },
  {
    label: 'Climax',
    value: 'CA/SK/Cadillac/Climax',
  },
  {
    label: 'Consul',
    value: 'CA/SK/Cadillac/Consul',
  },
  {
    label: 'Eastend',
    value: 'CA/SK/Cadillac/Eastend',
  },
  {
    label: 'Frontier',
    value: 'CA/SK/Cadillac/Frontier',
  },
  {
    label: 'Maple Creek',
    value: 'CA/SK/Cadillac/Maple Creek',
  },
  {
    label: 'Piapot',
    value: 'CA/SK/Cadillac/Piapot',
  },
  {
    label: 'Shaunavon',
    value: 'CA/SK/Cadillac/Shaunavon',
  },
  {
    label: 'Val Marie',
    value: 'CA/SK/Cadillac/Val Marie',
  },
  {
    label: 'Annaheim',
    value: 'CA/SK/Central East/Annaheim',
  },
  {
    label: 'Arborfield',
    value: 'CA/SK/Central East/Arborfield',
  },
  {
    label: 'Archerwill',
    value: 'CA/SK/Central East/Archerwill',
  },
  {
    label: 'Arran',
    value: 'CA/SK/Central East/Arran',
  },
  {
    label: 'Aylsham',
    value: 'CA/SK/Central East/Aylsham',
  },
  {
    label: 'Bankend',
    value: 'CA/SK/Central East/Bankend',
  },
  {
    label: 'Beatty',
    value: 'CA/SK/Central East/Beatty',
  },
  {
    label: 'Bjorkdale',
    value: 'CA/SK/Central East/Bjorkdale',
  },
  {
    label: 'Brockington',
    value: 'CA/SK/Central East/Brockington',
  },
  {
    label: 'Brooksby',
    value: 'CA/SK/Central East/Brooksby',
  },
  {
    label: 'Buchanan',
    value: 'CA/SK/Central East/Buchanan',
  },
  {
    label: 'Burr',
    value: 'CA/SK/Central East/Burr',
  },
  {
    label: 'Canora',
    value: 'CA/SK/Central East/Canora',
  },
  {
    label: 'Carmel',
    value: 'CA/SK/Central East/Carmel',
  },
  {
    label: 'Carragana',
    value: 'CA/SK/Central East/Carragana',
  },
  {
    label: 'Carrot River',
    value: 'CA/SK/Central East/Carrot River',
  },
  {
    label: 'Chorney Beach',
    value: 'CA/SK/Central East/Chorney Beach',
  },
  {
    label: 'Cote First Nation',
    value: 'CA/SK/Central East/Cote First Nation',
  },
  {
    label: 'Crooked River',
    value: 'CA/SK/Central East/Crooked River',
  },
  {
    label: 'Crystal Springs',
    value: 'CA/SK/Central East/Crystal Springs',
  },
  {
    label: 'Dafoe',
    value: 'CA/SK/Central East/Dafoe',
  },
  {
    label: 'Danbury',
    value: 'CA/SK/Central East/Danbury',
  },
  {
    label: 'Day Star First Nation',
    value: 'CA/SK/Central East/Day Star First Nation',
  },
  {
    label: 'Drake',
    value: 'CA/SK/Central East/Drake',
  },
  {
    label: 'Duval',
    value: 'CA/SK/Central East/Duval',
  },
  {
    label: 'Elfros',
    value: 'CA/SK/Central East/Elfros',
  },
  {
    label: 'Endeavour',
    value: 'CA/SK/Central East/Endeavour',
  },
  {
    label: 'Englefeld',
    value: 'CA/SK/Central East/Englefeld',
  },
  {
    label: 'Etters Beach',
    value: 'CA/SK/Central East/Etters Beach',
  },
  {
    label: 'Fairy Glen',
    value: 'CA/SK/Central East/Fairy Glen',
  },
  {
    label: 'Fenwood',
    value: 'CA/SK/Central East/Fenwood',
  },
  {
    label: 'Foam Lake',
    value: 'CA/SK/Central East/Foam Lake',
  },
  {
    label: 'Fosston',
    value: 'CA/SK/Central East/Fosston',
  },
  {
    label: 'Fulda',
    value: 'CA/SK/Central East/Fulda',
  },
  {
    label: 'Govan',
    value: 'CA/SK/Central East/Govan',
  },
  {
    label: 'Gronlid',
    value: 'CA/SK/Central East/Gronlid',
  },
  {
    label: 'Guernsey',
    value: 'CA/SK/Central East/Guernsey',
  },
  {
    label: 'Hagen',
    value: 'CA/SK/Central East/Hagen',
  },
  {
    label: 'Hazel Dell',
    value: 'CA/SK/Central East/Hazel Dell',
  },
  {
    label: 'Hendon',
    value: 'CA/SK/Central East/Hendon',
  },
  {
    label: 'Homefield',
    value: 'CA/SK/Central East/Homefield',
  },
  {
    label: 'Hubbard',
    value: 'CA/SK/Central East/Hubbard',
  },
  {
    label: 'Hudson Bay',
    value: 'CA/SK/Central East/Hudson Bay',
  },
  {
    label: 'Humboldt',
    value: 'CA/SK/Central East/Humboldt',
  },
  {
    label: 'Hyas',
    value: 'CA/SK/Central East/Hyas',
  },
  {
    label: 'Imperial',
    value: 'CA/SK/Central East/Imperial',
  },
  {
    label: 'Invermay',
    value: 'CA/SK/Central East/Invermay',
  },
  {
    label: 'Ituna',
    value: 'CA/SK/Central East/Ituna',
  },
  {
    label: 'James Smith First Nation',
    value: 'CA/SK/Central East/James Smith First Nation',
  },
  {
    label: 'Jansen',
    value: 'CA/SK/Central East/Jansen',
  },
  {
    label: 'Jedburgh',
    value: 'CA/SK/Central East/Jedburgh',
  },
  {
    label: 'Kamsack',
    value: 'CA/SK/Central East/Kamsack',
  },
  {
    label: 'Keeseekoose First Nation',
    value: 'CA/SK/Central East/Keeseekoose First Nation',
  },
  {
    label: 'Kelliher',
    value: 'CA/SK/Central East/Kelliher',
  },
  {
    label: 'Kelvington',
    value: 'CA/SK/Central East/Kelvington',
  },
  {
    label: 'Key First Nation',
    value: 'CA/SK/Central East/Key First Nation',
  },
  {
    label: 'Kinistin Saulteaux First Nation',
    value: 'CA/SK/Central East/Kinistin Saulteaux First Nation',
  },
  {
    label: 'Kinistino',
    value: 'CA/SK/Central East/Kinistino',
  },
  {
    label: 'Kuroki',
    value: 'CA/SK/Central East/Kuroki',
  },
  {
    label: 'Kylemore',
    value: 'CA/SK/Central East/Kylemore',
  },
  {
    label: 'Lac Vert',
    value: 'CA/SK/Central East/Lac Vert',
  },
  {
    label: 'Lake Lenore',
    value: 'CA/SK/Central East/Lake Lenore',
  },
  {
    label: 'Leross',
    value: 'CA/SK/Central East/Leross',
  },
  {
    label: 'Leroy',
    value: 'CA/SK/Central East/Leroy',
  },
  {
    label: 'Leslie',
    value: 'CA/SK/Central East/Leslie',
  },
  {
    label: 'Leslie Beach',
    value: 'CA/SK/Central East/Leslie Beach',
  },
  {
    label: 'Lestock',
    value: 'CA/SK/Central East/Lestock',
  },
  {
    label: 'Liberty',
    value: 'CA/SK/Central East/Liberty',
  },
  {
    label: 'Lintlaw',
    value: 'CA/SK/Central East/Lintlaw',
  },
  {
    label: 'Lockwood',
    value: 'CA/SK/Central East/Lockwood',
  },
  {
    label: 'Macnutt',
    value: 'CA/SK/Central East/Macnutt',
  },
  {
    label: 'Manitou Beach',
    value: 'CA/SK/Central East/Manitou Beach',
  },
  {
    label: 'Margo',
    value: 'CA/SK/Central East/Margo',
  },
  {
    label: 'Melfort',
    value: 'CA/SK/Central East/Melfort',
  },
  {
    label: 'Meskanaw',
    value: 'CA/SK/Central East/Meskanaw',
  },
  {
    label: 'Middle Lake',
    value: 'CA/SK/Central East/Middle Lake',
  },
  {
    label: 'Mikado',
    value: 'CA/SK/Central East/Mikado',
  },
  {
    label: 'Mistatim',
    value: 'CA/SK/Central East/Mistatim',
  },
  {
    label: 'Mozart',
    value: 'CA/SK/Central East/Mozart',
  },
  {
    label: 'Muenster',
    value: 'CA/SK/Central East/Muenster',
  },
  {
    label: 'Muskoday',
    value: 'CA/SK/Central East/Muskoday',
  },
  {
    label: 'Muskoday First Nation',
    value: 'CA/SK/Central East/Muskoday First Nation',
  },
  {
    label: 'Naicam',
    value: 'CA/SK/Central East/Naicam',
  },
  {
    label: 'Nipawin',
    value: 'CA/SK/Central East/Nipawin',
  },
  {
    label: 'Nokomis',
    value: 'CA/SK/Central East/Nokomis',
  },
  {
    label: 'Norquay',
    value: 'CA/SK/Central East/Norquay',
  },
  {
    label: 'Nut Mountain',
    value: 'CA/SK/Central East/Nut Mountain',
  },
  {
    label: 'Okla',
    value: 'CA/SK/Central East/Okla',
  },
  {
    label: 'Parkerview',
    value: 'CA/SK/Central East/Parkerview',
  },
  {
    label: 'Pathlow',
    value: 'CA/SK/Central East/Pathlow',
  },
  {
    label: 'Pelly',
    value: 'CA/SK/Central East/Pelly',
  },
  {
    label: 'Penzance',
    value: 'CA/SK/Central East/Penzance',
  },
  {
    label: 'Pilger',
    value: 'CA/SK/Central East/Pilger',
  },
  {
    label: 'Pleasantdale',
    value: 'CA/SK/Central East/Pleasantdale',
  },
  {
    label: 'Plunkett',
    value: 'CA/SK/Central East/Plunkett',
  },
  {
    label: 'Porcupine Plain',
    value: 'CA/SK/Central East/Porcupine Plain',
  },
  {
    label: 'Preeceville',
    value: 'CA/SK/Central East/Preeceville',
  },
  {
    label: 'Punnichy',
    value: 'CA/SK/Central East/Punnichy',
  },
  {
    label: 'Quill Lake',
    value: 'CA/SK/Central East/Quill Lake',
  },
  {
    label: 'Quinton',
    value: 'CA/SK/Central East/Quinton',
  },
  {
    label: 'Rama',
    value: 'CA/SK/Central East/Rama',
  },
  {
    label: 'Raymore',
    value: 'CA/SK/Central East/Raymore',
  },
  {
    label: 'Red Earth',
    value: 'CA/SK/Central East/Red Earth',
  },
  {
    label: 'Red Earth First Nation',
    value: 'CA/SK/Central East/Red Earth First Nation',
  },
  {
    label: 'Rhein',
    value: 'CA/SK/Central East/Rhein',
  },
  {
    label: 'Ridgedale',
    value: 'CA/SK/Central East/Ridgedale',
  },
  {
    label: 'Rokeby',
    value: 'CA/SK/Central East/Rokeby',
  },
  {
    label: 'Rose Valley',
    value: 'CA/SK/Central East/Rose Valley',
  },
  {
    label: 'Runnymede',
    value: 'CA/SK/Central East/Runnymede',
  },
  {
    label: 'Saltcoats',
    value: 'CA/SK/Central East/Saltcoats',
  },
  {
    label: 'Semans',
    value: 'CA/SK/Central East/Semans',
  },
  {
    label: 'Sheho',
    value: 'CA/SK/Central East/Sheho',
  },
  {
    label: 'Shoal Lake Cree First Nation',
    value: 'CA/SK/Central East/Shoal Lake Cree First Nation',
  },
  {
    label: 'Simpson',
    value: 'CA/SK/Central East/Simpson',
  },
  {
    label: 'Spalding',
    value: 'CA/SK/Central East/Spalding',
  },
  {
    label: 'Springside',
    value: 'CA/SK/Central East/Springside',
  },
  {
    label: 'St Benedict',
    value: 'CA/SK/Central East/St Benedict',
  },
  {
    label: 'St Brieux',
    value: 'CA/SK/Central East/St Brieux',
  },
  {
    label: 'St Gregor',
    value: 'CA/SK/Central East/St Gregor',
  },
  {
    label: 'Stalwart',
    value: 'CA/SK/Central East/Stalwart',
  },
  {
    label: 'Star City',
    value: 'CA/SK/Central East/Star City',
  },
  {
    label: 'Stenen',
    value: 'CA/SK/Central East/Stenen',
  },
  {
    label: 'Stornoway',
    value: 'CA/SK/Central East/Stornoway',
  },
  {
    label: 'Strasbourg',
    value: 'CA/SK/Central East/Strasbourg',
  },
  {
    label: 'Sturgis',
    value: 'CA/SK/Central East/Sturgis',
  },
  {
    label: 'Sylvania',
    value: 'CA/SK/Central East/Sylvania',
  },
  {
    label: 'Theodore',
    value: 'CA/SK/Central East/Theodore',
  },
  {
    label: 'Tisdale',
    value: 'CA/SK/Central East/Tisdale',
  },
  {
    label: 'Tobin Lake',
    value: 'CA/SK/Central East/Tobin Lake',
  },
  {
    label: 'Togo',
    value: 'CA/SK/Central East/Togo',
  },
  {
    label: 'Tway',
    value: 'CA/SK/Central East/Tway',
  },
  {
    label: 'Valparaiso',
    value: 'CA/SK/Central East/Valparaiso',
  },
  {
    label: 'Wadena',
    value: 'CA/SK/Central East/Wadena',
  },
  {
    label: 'Watson',
    value: 'CA/SK/Central East/Watson',
  },
  {
    label: 'Weekes',
    value: 'CA/SK/Central East/Weekes',
  },
  {
    label: 'Weldon',
    value: 'CA/SK/Central East/Weldon',
  },
  {
    label: 'White Fox',
    value: 'CA/SK/Central East/White Fox',
  },
  {
    label: 'Willowbrook',
    value: 'CA/SK/Central East/Willowbrook',
  },
  {
    label: 'Wishart',
    value: 'CA/SK/Central East/Wishart',
  },
  {
    label: 'Wroxton',
    value: 'CA/SK/Central East/Wroxton',
  },
  {
    label: 'Wynyard',
    value: 'CA/SK/Central East/Wynyard',
  },
  {
    label: 'Yellow Creek',
    value: 'CA/SK/Central East/Yellow Creek',
  },
  {
    label: 'Yellow Quill First Nation',
    value: 'CA/SK/Central East/Yellow Quill First Nation',
  },
  {
    label: 'Yorkton',
    value: 'CA/SK/Central East/Yorkton',
  },
  {
    label: 'Zenon Park',
    value: 'CA/SK/Central East/Zenon Park',
  },
  {
    label: 'Aberdeen',
    value: 'CA/SK/Central West/Aberdeen',
  },
  {
    label: 'Allan',
    value: 'CA/SK/Central West/Allan',
  },
  {
    label: 'Alvena',
    value: 'CA/SK/Central West/Alvena',
  },
  {
    label: 'Aquadeo',
    value: 'CA/SK/Central West/Aquadeo',
  },
  {
    label: 'Ardath',
    value: 'CA/SK/Central West/Ardath',
  },
  {
    label: 'Arelee',
    value: 'CA/SK/Central West/Arelee',
  },
  {
    label: 'Asquith',
    value: 'CA/SK/Central West/Asquith',
  },
  {
    label: 'Baldwinton',
    value: 'CA/SK/Central West/Baldwinton',
  },
  {
    label: 'Battleford',
    value: 'CA/SK/Central West/Battleford',
  },
  {
    label: 'Beardys And Okemasis First Nation',
    value: 'CA/SK/Central West/Beardys And Okemasis First Nation',
  },
  {
    label: 'Big Shell',
    value: 'CA/SK/Central West/Big Shell',
  },
  {
    label: 'Biggar',
    value: 'CA/SK/Central West/Biggar',
  },
  {
    label: 'Birch Hills',
    value: 'CA/SK/Central West/Birch Hills',
  },
  {
    label: 'Birsay',
    value: 'CA/SK/Central West/Birsay',
  },
  {
    label: 'Bladworth',
    value: 'CA/SK/Central West/Bladworth',
  },
  {
    label: 'Blaine Lake',
    value: 'CA/SK/Central West/Blaine Lake',
  },
  {
    label: 'Borden',
    value: 'CA/SK/Central West/Borden',
  },
  {
    label: 'Bradwell',
    value: 'CA/SK/Central West/Bradwell',
  },
  {
    label: 'Brock',
    value: 'CA/SK/Central West/Brock',
  },
  {
    label: 'Broderick',
    value: 'CA/SK/Central West/Broderick',
  },
  {
    label: 'Bruno',
    value: 'CA/SK/Central West/Bruno',
  },
  {
    label: 'Cactus Lake',
    value: 'CA/SK/Central West/Cactus Lake',
  },
  {
    label: 'Cando',
    value: 'CA/SK/Central West/Cando',
  },
  {
    label: 'Carlton',
    value: 'CA/SK/Central West/Carlton',
  },
  {
    label: 'Casa Rio',
    value: 'CA/SK/Central West/Casa Rio',
  },
  {
    label: 'Clavet',
    value: 'CA/SK/Central West/Clavet',
  },
  {
    label: 'Cochin',
    value: 'CA/SK/Central West/Cochin',
  },
  {
    label: 'Coleville',
    value: 'CA/SK/Central West/Coleville',
  },
  {
    label: 'Colonsay',
    value: 'CA/SK/Central West/Colonsay',
  },
  {
    label: 'Conquest',
    value: 'CA/SK/Central West/Conquest',
  },
  {
    label: 'Corman Park',
    value: 'CA/SK/Central West/Corman Park',
  },
  {
    label: 'Coteau Beach',
    value: 'CA/SK/Central West/Coteau Beach',
  },
  {
    label: 'Craik',
    value: 'CA/SK/Central West/Craik',
  },
  {
    label: 'Cudworth',
    value: 'CA/SK/Central West/Cudworth',
  },
  {
    label: 'Cut Knife',
    value: 'CA/SK/Central West/Cut Knife',
  },
  {
    label: 'Dalmeny',
    value: 'CA/SK/Central West/Dalmeny',
  },
  {
    label: 'Davidson',
    value: 'CA/SK/Central West/Davidson',
  },
  {
    label: 'Delisle',
    value: 'CA/SK/Central West/Delisle',
  },
  {
    label: 'Delmas',
    value: 'CA/SK/Central West/Delmas',
  },
  {
    label: 'Denholm',
    value: 'CA/SK/Central West/Denholm',
  },
  {
    label: 'Denzil',
    value: 'CA/SK/Central West/Denzil',
  },
  {
    label: 'Dinsmore',
    value: 'CA/SK/Central West/Dinsmore',
  },
  {
    label: 'Dodsland',
    value: 'CA/SK/Central West/Dodsland',
  },
  {
    label: 'Domremy',
    value: 'CA/SK/Central West/Domremy',
  },
  {
    label: 'Duck Lake',
    value: 'CA/SK/Central West/Duck Lake',
  },
  {
    label: 'Dundurn',
    value: 'CA/SK/Central West/Dundurn',
  },
  {
    label: 'Duperow',
    value: 'CA/SK/Central West/Duperow',
  },
  {
    label: 'Eatonia',
    value: 'CA/SK/Central West/Eatonia',
  },
  {
    label: 'Echo Bay',
    value: 'CA/SK/Central West/Echo Bay',
  },
  {
    label: 'Edam',
    value: 'CA/SK/Central West/Edam',
  },
  {
    label: 'Elbow',
    value: 'CA/SK/Central West/Elbow',
  },
  {
    label: 'Elrose',
    value: 'CA/SK/Central West/Elrose',
  },
  {
    label: 'Elstow',
    value: 'CA/SK/Central West/Elstow',
  },
  {
    label: 'Eston',
    value: 'CA/SK/Central West/Eston',
  },
  {
    label: 'Evesham',
    value: 'CA/SK/Central West/Evesham',
  },
  {
    label: 'Fishing Lake First Nation',
    value: 'CA/SK/Central West/Fishing Lake First Nation',
  },
  {
    label: 'Fiske',
    value: 'CA/SK/Central West/Fiske',
  },
  {
    label: 'Flaxcombe',
    value: 'CA/SK/Central West/Flaxcombe',
  },
  {
    label: 'Furdale',
    value: 'CA/SK/Central West/Furdale',
  },
  {
    label: 'Gallivan',
    value: 'CA/SK/Central West/Gallivan',
  },
  {
    label: 'Glasnevin',
    value: 'CA/SK/Central West/Glasnevin',
  },
  {
    label: 'Glenbush',
    value: 'CA/SK/Central West/Glenbush',
  },
  {
    label: 'Glenside',
    value: 'CA/SK/Central West/Glenside',
  },
  {
    label: 'Glidden',
    value: 'CA/SK/Central West/Glidden',
  },
  {
    label: 'Gordon First Nation',
    value: 'CA/SK/Central West/Gordon First Nation',
  },
  {
    label: 'Grandora',
    value: 'CA/SK/Central West/Grandora',
  },
  {
    label: 'Grasswood',
    value: 'CA/SK/Central West/Grasswood',
  },
  {
    label: 'Hafford',
    value: 'CA/SK/Central West/Hafford',
  },
  {
    label: 'Hague',
    value: 'CA/SK/Central West/Hague',
  },
  {
    label: 'Handel',
    value: 'CA/SK/Central West/Handel',
  },
  {
    label: 'Hanley',
    value: 'CA/SK/Central West/Hanley',
  },
  {
    label: 'Harris',
    value: 'CA/SK/Central West/Harris',
  },
  {
    label: 'Hawarden',
    value: 'CA/SK/Central West/Hawarden',
  },
  {
    label: 'Hepburn',
    value: 'CA/SK/Central West/Hepburn',
  },
  {
    label: 'Herschel',
    value: 'CA/SK/Central West/Herschel',
  },
  {
    label: 'Hoey',
    value: 'CA/SK/Central West/Hoey',
  },
  {
    label: 'Hoosier',
    value: 'CA/SK/Central West/Hoosier',
  },
  {
    label: 'Insinger',
    value: 'CA/SK/Central West/Insinger',
  },
  {
    label: 'Island Lake',
    value: 'CA/SK/Central West/Island Lake',
  },
  {
    label: 'Jackfish Lake',
    value: 'CA/SK/Central West/Jackfish Lake',
  },
  {
    label: 'Kawacatoose First Nation',
    value: 'CA/SK/Central West/Kawacatoose First Nation',
  },
  {
    label: 'Kelfield',
    value: 'CA/SK/Central West/Kelfield',
  },
  {
    label: 'Kenaston',
    value: 'CA/SK/Central West/Kenaston',
  },
  {
    label: 'Kerrobert',
    value: 'CA/SK/Central West/Kerrobert',
  },
  {
    label: 'Kindersley',
    value: 'CA/SK/Central West/Kindersley',
  },
  {
    label: 'Kinley',
    value: 'CA/SK/Central West/Kinley',
  },
  {
    label: 'Krydor',
    value: 'CA/SK/Central West/Krydor',
  },
  {
    label: 'Laird',
    value: 'CA/SK/Central West/Laird',
  },
  {
    label: 'Landis',
    value: 'CA/SK/Central West/Landis',
  },
  {
    label: 'Langham',
    value: 'CA/SK/Central West/Langham',
  },
  {
    label: 'Laporte',
    value: 'CA/SK/Central West/Laporte',
  },
  {
    label: 'Lashburn',
    value: 'CA/SK/Central West/Lashburn',
  },
  {
    label: 'Leask',
    value: 'CA/SK/Central West/Leask',
  },
  {
    label: 'Little Pine First Nation',
    value: 'CA/SK/Central West/Little Pine First Nation',
  },
  {
    label: 'Lloydminster',
    value: 'CA/SK/Central West/Lloydminster',
  },
  {
    label: 'Lone Rock',
    value: 'CA/SK/Central West/Lone Rock',
  },
  {
    label: 'Loreburn',
    value: 'CA/SK/Central West/Loreburn',
  },
  {
    label: 'Loverna',
    value: 'CA/SK/Central West/Loverna',
  },
  {
    label: 'Lucky Man First Nation',
    value: 'CA/SK/Central West/Lucky Man First Nation',
  },
  {
    label: 'Luseland',
    value: 'CA/SK/Central West/Luseland',
  },
  {
    label: 'Macklin',
    value: 'CA/SK/Central West/Macklin',
  },
  {
    label: 'Macrorie',
    value: 'CA/SK/Central West/Macrorie',
  },
  {
    label: 'Madison',
    value: 'CA/SK/Central West/Madison',
  },
  {
    label: 'Maidstone',
    value: 'CA/SK/Central West/Maidstone',
  },
  {
    label: 'Major',
    value: 'CA/SK/Central West/Major',
  },
  {
    label: 'Mantario',
    value: 'CA/SK/Central West/Mantario',
  },
  {
    label: 'Marcelin',
    value: 'CA/SK/Central West/Marcelin',
  },
  {
    label: 'Marengo',
    value: 'CA/SK/Central West/Marengo',
  },
  {
    label: 'Marsden',
    value: 'CA/SK/Central West/Marsden',
  },
  {
    label: 'Marshall',
    value: 'CA/SK/Central West/Marshall',
  },
  {
    label: 'Martensville',
    value: 'CA/SK/Central West/Martensville',
  },
  {
    label: 'Mayfair',
    value: 'CA/SK/Central West/Mayfair',
  },
  {
    label: 'Maymont',
    value: 'CA/SK/Central West/Maymont',
  },
  {
    label: 'Meacham',
    value: 'CA/SK/Central West/Meacham',
  },
  {
    label: 'Medstead',
    value: 'CA/SK/Central West/Medstead',
  },
  {
    label: 'Meota',
    value: 'CA/SK/Central West/Meota',
  },
  {
    label: 'Mervin',
    value: 'CA/SK/Central West/Mervin',
  },
  {
    label: 'Metinota',
    value: 'CA/SK/Central West/Metinota',
  },
  {
    label: 'Milden',
    value: 'CA/SK/Central West/Milden',
  },
  {
    label: 'Mistawasis First Nation',
    value: 'CA/SK/Central West/Mistawasis First Nation',
  },
  {
    label: 'Mistusinne',
    value: 'CA/SK/Central West/Mistusinne',
  },
  {
    label: 'Moosomin First Nation',
    value: 'CA/SK/Central West/Moosomin First Nation',
  },
  {
    label: 'Mosquito Grizzly Bears Head First Nation',
    value: 'CA/SK/Central West/Mosquito Grizzly Bears Head First Nation',
  },
  {
    label: 'Mullingar',
    value: 'CA/SK/Central West/Mullingar',
  },
  {
    label: 'Muskeg Lake First Nation',
    value: 'CA/SK/Central West/Muskeg Lake First Nation',
  },
  {
    label: 'Muskowekwan First Nation',
    value: 'CA/SK/Central West/Muskowekwan First Nation',
  },
  {
    label: 'Neilburg',
    value: 'CA/SK/Central West/Neilburg',
  },
  {
    label: 'Netherhill',
    value: 'CA/SK/Central West/Netherhill',
  },
  {
    label: 'North Battleford',
    value: 'CA/SK/Central West/North Battleford',
  },
  {
    label: 'One Arrow First Nation',
    value: 'CA/SK/Central West/One Arrow First Nation',
  },
  {
    label: 'Osler',
    value: 'CA/SK/Central West/Osler',
  },
  {
    label: 'Outlook',
    value: 'CA/SK/Central West/Outlook',
  },
  {
    label: 'Pakwaw Lake',
    value: 'CA/SK/Central West/Pakwaw Lake',
  },
  {
    label: 'Paradise Hill',
    value: 'CA/SK/Central West/Paradise Hill',
  },
  {
    label: 'Paynton',
    value: 'CA/SK/Central West/Paynton',
  },
  {
    label: 'Pebble Baye',
    value: 'CA/SK/Central West/Pebble Baye',
  },
  {
    label: 'Perdue',
    value: 'CA/SK/Central West/Perdue',
  },
  {
    label: 'Phippen',
    value: 'CA/SK/Central West/Phippen',
  },
  {
    label: 'Plato',
    value: 'CA/SK/Central West/Plato',
  },
  {
    label: 'Plenty',
    value: 'CA/SK/Central West/Plenty',
  },
  {
    label: 'Poundmaker First Nation',
    value: 'CA/SK/Central West/Poundmaker First Nation',
  },
  {
    label: 'Preston Park Ii Retirement Residence',
    value: 'CA/SK/Central West/Preston Park Ii Retirement Residence',
  },
  {
    label: 'Preston Park Retirement Residence',
    value: 'CA/SK/Central West/Preston Park Retirement Residence',
  },
  {
    label: 'Primate',
    value: 'CA/SK/Central West/Primate',
  },
  {
    label: 'Rabbit Lake',
    value: 'CA/SK/Central West/Rabbit Lake',
  },
  {
    label: 'Radisson',
    value: 'CA/SK/Central West/Radisson',
  },
  {
    label: 'Red Pheasant First Nation',
    value: 'CA/SK/Central West/Red Pheasant First Nation',
  },
  {
    label: 'Reward',
    value: 'CA/SK/Central West/Reward',
  },
  {
    label: 'Richard',
    value: 'CA/SK/Central West/Richard',
  },
  {
    label: 'Richlea',
    value: 'CA/SK/Central West/Richlea',
  },
  {
    label: 'Riverside Estates',
    value: 'CA/SK/Central West/Riverside Estates',
  },
  {
    label: 'Rockhaven',
    value: 'CA/SK/Central West/Rockhaven',
  },
  {
    label: 'Rosetown',
    value: 'CA/SK/Central West/Rosetown',
  },
  {
    label: 'Rosthern',
    value: 'CA/SK/Central West/Rosthern',
  },
  {
    label: 'Ruddell',
    value: 'CA/SK/Central West/Ruddell',
  },
  {
    label: 'Ruthilda',
    value: 'CA/SK/Central West/Ruthilda',
  },
  {
    label: 'Salvador',
    value: 'CA/SK/Central West/Salvador',
  },
  {
    label: 'Saskatoon',
    value: 'CA/SK/Central West/Saskatoon',
  },
  {
    label: 'Saulteaux First Nation',
    value: 'CA/SK/Central West/Saulteaux First Nation',
  },
  {
    label: 'Scott',
    value: 'CA/SK/Central West/Scott',
  },
  {
    label: 'Senlac',
    value: 'CA/SK/Central West/Senlac',
  },
  {
    label: 'Shell Lake',
    value: 'CA/SK/Central West/Shell Lake',
  },
  {
    label: 'Shields',
    value: 'CA/SK/Central West/Shields',
  },
  {
    label: 'Smiley',
    value: 'CA/SK/Central West/Smiley',
  },
  {
    label: 'Sonningdale',
    value: 'CA/SK/Central West/Sonningdale',
  },
  {
    label: 'Sovereign',
    value: 'CA/SK/Central West/Sovereign',
  },
  {
    label: 'Speers',
    value: 'CA/SK/Central West/Speers',
  },
  {
    label: 'Spiritwood',
    value: 'CA/SK/Central West/Spiritwood',
  },
  {
    label: 'Springwater',
    value: 'CA/SK/Central West/Springwater',
  },
  {
    label: 'St Denis',
    value: 'CA/SK/Central West/St Denis',
  },
  {
    label: 'St Isidore De Bellevue',
    value: 'CA/SK/Central West/St Isidore De Bellevue',
  },
  {
    label: 'St Louis',
    value: 'CA/SK/Central West/St Louis',
  },
  {
    label: 'Stranraer',
    value: 'CA/SK/Central West/Stranraer',
  },
  {
    label: 'Strongfield',
    value: 'CA/SK/Central West/Strongfield',
  },
  {
    label: 'Sweetgrass First Nation',
    value: 'CA/SK/Central West/Sweetgrass First Nation',
  },
  {
    label: 'Tessier',
    value: 'CA/SK/Central West/Tessier',
  },
  {
    label: 'Thode',
    value: 'CA/SK/Central West/Thode',
  },
  {
    label: 'Tramping Lake',
    value: 'CA/SK/Central West/Tramping Lake',
  },
  {
    label: 'Tuffnell',
    value: 'CA/SK/Central West/Tuffnell',
  },
  {
    label: 'Turtleford',
    value: 'CA/SK/Central West/Turtleford',
  },
  {
    label: 'Tyner',
    value: 'CA/SK/Central West/Tyner',
  },
  {
    label: 'Unity',
    value: 'CA/SK/Central West/Unity',
  },
  {
    label: 'Vanscoy',
    value: 'CA/SK/Central West/Vanscoy',
  },
  {
    label: 'Vawn',
    value: 'CA/SK/Central West/Vawn',
  },
  {
    label: 'Viscount',
    value: 'CA/SK/Central West/Viscount',
  },
  {
    label: 'Vonda',
    value: 'CA/SK/Central West/Vonda',
  },
  {
    label: 'Wakaw',
    value: 'CA/SK/Central West/Wakaw',
  },
  {
    label: 'Wakaw Lake',
    value: 'CA/SK/Central West/Wakaw Lake',
  },
  {
    label: 'Waldheim',
    value: 'CA/SK/Central West/Waldheim',
  },
  {
    label: 'Warman',
    value: 'CA/SK/Central West/Warman',
  },
  {
    label: 'Waseca',
    value: 'CA/SK/Central West/Waseca',
  },
  {
    label: 'Watrous',
    value: 'CA/SK/Central West/Watrous',
  },
  {
    label: 'Whitecap Dakota First Nation',
    value: 'CA/SK/Central West/Whitecap Dakota First Nation',
  },
  {
    label: 'Wilkie',
    value: 'CA/SK/Central West/Wilkie',
  },
  {
    label: 'Wiseton',
    value: 'CA/SK/Central West/Wiseton',
  },
  {
    label: 'Young',
    value: 'CA/SK/Central West/Young',
  },
  {
    label: 'Zealandia',
    value: 'CA/SK/Central West/Zealandia',
  },
  {
    label: 'Zelma',
    value: 'CA/SK/Central West/Zelma',
  },
  {
    label: 'Alida',
    value: 'CA/SK/Estevan/Alida',
  },
  {
    label: 'Antler',
    value: 'CA/SK/Estevan/Antler',
  },
  {
    label: 'Arcola',
    value: 'CA/SK/Estevan/Arcola',
  },
  {
    label: 'Bellegarde',
    value: 'CA/SK/Estevan/Bellegarde',
  },
  {
    label: 'Bienfait',
    value: 'CA/SK/Estevan/Bienfait',
  },
  {
    label: 'Carievale',
    value: 'CA/SK/Estevan/Carievale',
  },
  {
    label: 'Carlyle',
    value: 'CA/SK/Estevan/Carlyle',
  },
  {
    label: 'Carnduff',
    value: 'CA/SK/Estevan/Carnduff',
  },
  {
    label: 'Corning',
    value: 'CA/SK/Estevan/Corning',
  },
  {
    label: 'Emerald Park',
    value: 'CA/SK/Estevan/Emerald Park',
  },
  {
    label: 'Estevan',
    value: 'CA/SK/Estevan/Estevan',
  },
  {
    label: 'Frobisher',
    value: 'CA/SK/Estevan/Frobisher',
  },
  {
    label: 'Gainsborough',
    value: 'CA/SK/Estevan/Gainsborough',
  },
  {
    label: 'Glen Ewen',
    value: 'CA/SK/Estevan/Glen Ewen',
  },
  {
    label: 'Kennedy',
    value: 'CA/SK/Estevan/Kennedy',
  },
  {
    label: 'Kisbey',
    value: 'CA/SK/Estevan/Kisbey',
  },
  {
    label: 'Lampman',
    value: 'CA/SK/Estevan/Lampman',
  },
  {
    label: 'Manor',
    value: 'CA/SK/Estevan/Manor',
  },
  {
    label: 'Maryfield',
    value: 'CA/SK/Estevan/Maryfield',
  },
  {
    label: 'North Portal',
    value: 'CA/SK/Estevan/North Portal',
  },
  {
    label: 'Oxbow',
    value: 'CA/SK/Estevan/Oxbow',
  },
  {
    label: 'Redvers',
    value: 'CA/SK/Estevan/Redvers',
  },
  {
    label: 'Stoughton',
    value: 'CA/SK/Estevan/Stoughton',
  },
  {
    label: 'Wawota',
    value: 'CA/SK/Estevan/Wawota',
  },
  {
    label: 'Alsask',
    value: 'CA/SK/Kindersley/Alsask',
  },
  {
    label: 'Baldwinton',
    value: 'CA/SK/Kindersley/Baldwinton',
  },
  {
    label: 'Brock',
    value: 'CA/SK/Kindersley/Brock',
  },
  {
    label: 'Cactus Lake',
    value: 'CA/SK/Kindersley/Cactus Lake',
  },
  {
    label: 'Coleville',
    value: 'CA/SK/Kindersley/Coleville',
  },
  {
    label: 'Cut Knife',
    value: 'CA/SK/Kindersley/Cut Knife',
  },
  {
    label: "D'arcy Station",
    value: "CA/SK/Kindersley/D'arcy Station",
  },
  {
    label: 'Denzil',
    value: 'CA/SK/Kindersley/Denzil',
  },
  {
    label: 'Dodsland',
    value: 'CA/SK/Kindersley/Dodsland',
  },
  {
    label: 'Kerrobert',
    value: 'CA/SK/Kindersley/Kerrobert',
  },
  {
    label: 'Kindersley',
    value: 'CA/SK/Kindersley/Kindersley',
  },
  {
    label: 'Landis',
    value: 'CA/SK/Kindersley/Landis',
  },
  {
    label: 'Loverna',
    value: 'CA/SK/Kindersley/Loverna',
  },
  {
    label: 'Luseland',
    value: 'CA/SK/Kindersley/Luseland',
  },
  {
    label: 'Macklin',
    value: 'CA/SK/Kindersley/Macklin',
  },
  {
    label: 'Major',
    value: 'CA/SK/Kindersley/Major',
  },
  {
    label: 'Marsden',
    value: 'CA/SK/Kindersley/Marsden',
  },
  {
    label: 'Neilburg',
    value: 'CA/SK/Kindersley/Neilburg',
  },
  {
    label: 'Plenty',
    value: 'CA/SK/Kindersley/Plenty',
  },
  {
    label: 'Reward',
    value: 'CA/SK/Kindersley/Reward',
  },
  {
    label: 'Scott',
    value: 'CA/SK/Kindersley/Scott',
  },
  {
    label: 'Senlac',
    value: 'CA/SK/Kindersley/Senlac',
  },
  {
    label: 'Unity',
    value: 'CA/SK/Kindersley/Unity',
  },
  {
    label: 'Wilkie',
    value: 'CA/SK/Kindersley/Wilkie',
  },
  {
    label: 'Bright Sand',
    value: 'CA/SK/Lloydminster/Bright Sand',
  },
  {
    label: 'Cochin',
    value: 'CA/SK/Lloydminster/Cochin',
  },
  {
    label: 'Dorintosh',
    value: 'CA/SK/Lloydminster/Dorintosh',
  },
  {
    label: 'Edam',
    value: 'CA/SK/Lloydminster/Edam',
  },
  {
    label: 'Frenchman Butte',
    value: 'CA/SK/Lloydminster/Frenchman Butte',
  },
  {
    label: 'Glaslyn',
    value: 'CA/SK/Lloydminster/Glaslyn',
  },
  {
    label: 'Goodsoil',
    value: 'CA/SK/Lloydminster/Goodsoil',
  },
  {
    label: 'Greig Lake',
    value: 'CA/SK/Lloydminster/Greig Lake',
  },
  {
    label: 'Island Lake',
    value: 'CA/SK/Lloydminster/Island Lake',
  },
  {
    label: 'Kivimaa-Moonlight Bay',
    value: 'CA/SK/Lloydminster/Kivimaa-Moonlight Bay',
  },
  {
    label: 'Lashburn',
    value: 'CA/SK/Lloydminster/Lashburn',
  },
  {
    label: 'Livelong',
    value: 'CA/SK/Lloydminster/Livelong',
  },
  {
    label: 'Lone Rock',
    value: 'CA/SK/Lloydminster/Lone Rock',
  },
  {
    label: 'Loon Lake',
    value: 'CA/SK/Lloydminster/Loon Lake',
  },
  {
    label: 'Maidstone',
    value: 'CA/SK/Lloydminster/Maidstone',
  },
  {
    label: 'Makwa',
    value: 'CA/SK/Lloydminster/Makwa',
  },
  {
    label: 'Marshall',
    value: 'CA/SK/Lloydminster/Marshall',
  },
  {
    label: 'Meadow Lake',
    value: 'CA/SK/Lloydminster/Meadow Lake',
  },
  {
    label: 'Mervin',
    value: 'CA/SK/Lloydminster/Mervin',
  },
  {
    label: 'Onion Lake',
    value: 'CA/SK/Lloydminster/Onion Lake',
  },
  {
    label: 'Paradise Hill',
    value: 'CA/SK/Lloydminster/Paradise Hill',
  },
  {
    label: 'Paynton',
    value: 'CA/SK/Lloydminster/Paynton',
  },
  {
    label: 'Pierceland',
    value: 'CA/SK/Lloydminster/Pierceland',
  },
  {
    label: 'St Walburg',
    value: 'CA/SK/Lloydminster/St Walburg',
  },
  {
    label: 'Turtleford',
    value: 'CA/SK/Lloydminster/Turtleford',
  },
  {
    label: 'Waterhen Lake',
    value: 'CA/SK/Lloydminster/Waterhen Lake',
  },
  {
    label: 'Whelan',
    value: 'CA/SK/Lloydminster/Whelan',
  },
  {
    label: 'Bredenbury',
    value: 'CA/SK/Melville/Bredenbury',
  },
  {
    label: 'Broadview',
    value: 'CA/SK/Melville/Broadview',
  },
  {
    label: 'Churchbridge',
    value: 'CA/SK/Melville/Churchbridge',
  },
  {
    label: 'Duff',
    value: 'CA/SK/Melville/Duff',
  },
  {
    label: 'Esterhazy',
    value: 'CA/SK/Melville/Esterhazy',
  },
  {
    label: 'Fleming',
    value: 'CA/SK/Melville/Fleming',
  },
  {
    label: 'Glenavon',
    value: 'CA/SK/Melville/Glenavon',
  },
  {
    label: 'Goodeve',
    value: 'CA/SK/Melville/Goodeve',
  },
  {
    label: 'Grayson',
    value: 'CA/SK/Melville/Grayson',
  },
  {
    label: 'Grenfell',
    value: 'CA/SK/Melville/Grenfell',
  },
  {
    label: 'Killaly',
    value: 'CA/SK/Melville/Killaly',
  },
  {
    label: 'Kipling',
    value: 'CA/SK/Melville/Kipling',
  },
  {
    label: 'Langbank',
    value: 'CA/SK/Melville/Langbank',
  },
  {
    label: 'Langenburg',
    value: 'CA/SK/Melville/Langenburg',
  },
  {
    label: 'Lemberg',
    value: 'CA/SK/Melville/Lemberg',
  },
  {
    label: 'Macnutt',
    value: 'CA/SK/Melville/Macnutt',
  },
  {
    label: 'Moosomin',
    value: 'CA/SK/Melville/Moosomin',
  },
  {
    label: 'Neudorf',
    value: 'CA/SK/Melville/Neudorf',
  },
  {
    label: 'Rocanville',
    value: 'CA/SK/Melville/Rocanville',
  },
  {
    label: 'Saltcoats',
    value: 'CA/SK/Melville/Saltcoats',
  },
  {
    label: 'Spy Hill',
    value: 'CA/SK/Melville/Spy Hill',
  },
  {
    label: 'Stockholm',
    value: 'CA/SK/Melville/Stockholm',
  },
  {
    label: 'Tantallon',
    value: 'CA/SK/Melville/Tantallon',
  },
  {
    label: 'Wapella',
    value: 'CA/SK/Melville/Wapella',
  },
  {
    label: 'Welwyn',
    value: 'CA/SK/Melville/Welwyn',
  },
  {
    label: 'Whitewood',
    value: 'CA/SK/Melville/Whitewood',
  },
  {
    label: 'Wolseley',
    value: 'CA/SK/Melville/Wolseley',
  },
  {
    label: 'Beechy',
    value: 'CA/SK/Moose Jaw/Beechy',
  },
  {
    label: 'Bushell Park',
    value: 'CA/SK/Moose Jaw/Bushell Park',
  },
  {
    label: 'Caronport',
    value: 'CA/SK/Moose Jaw/Caronport',
  },
  {
    label: 'Central Butte',
    value: 'CA/SK/Moose Jaw/Central Butte',
  },
  {
    label: 'Chaplin',
    value: 'CA/SK/Moose Jaw/Chaplin',
  },
  {
    label: 'Coderre',
    value: 'CA/SK/Moose Jaw/Coderre',
  },
  {
    label: 'Courval',
    value: 'CA/SK/Moose Jaw/Courval',
  },
  {
    label: 'Craik',
    value: 'CA/SK/Moose Jaw/Craik',
  },
  {
    label: 'Eyebrow',
    value: 'CA/SK/Moose Jaw/Eyebrow',
  },
  {
    label: 'Herbert',
    value: 'CA/SK/Moose Jaw/Herbert',
  },
  {
    label: 'Hodgeville',
    value: 'CA/SK/Moose Jaw/Hodgeville',
  },
  {
    label: 'Lucky Lake',
    value: 'CA/SK/Moose Jaw/Lucky Lake',
  },
  {
    label: 'Marquis',
    value: 'CA/SK/Moose Jaw/Marquis',
  },
  {
    label: 'Moose Jaw',
    value: 'CA/SK/Moose Jaw/Moose Jaw',
  },
  {
    label: 'Morse',
    value: 'CA/SK/Moose Jaw/Morse',
  },
  {
    label: 'Mortlach',
    value: 'CA/SK/Moose Jaw/Mortlach',
  },
  {
    label: 'Parkbeg',
    value: 'CA/SK/Moose Jaw/Parkbeg',
  },
  {
    label: 'Riverhurst',
    value: 'CA/SK/Moose Jaw/Riverhurst',
  },
  {
    label: 'Tugaske',
    value: 'CA/SK/Moose Jaw/Tugaske',
  },
  {
    label: 'Waldeck',
    value: 'CA/SK/Moose Jaw/Waldeck',
  },
  {
    label: 'Arborfield',
    value: 'CA/SK/Nipawin/Arborfield',
  },
  {
    label: 'Archerwill',
    value: 'CA/SK/Nipawin/Archerwill',
  },
  {
    label: 'Aylsham',
    value: 'CA/SK/Nipawin/Aylsham',
  },
  {
    label: 'Bjorkdale',
    value: 'CA/SK/Nipawin/Bjorkdale',
  },
  {
    label: 'Carragana',
    value: 'CA/SK/Nipawin/Carragana',
  },
  {
    label: 'Carrot River',
    value: 'CA/SK/Nipawin/Carrot River',
  },
  {
    label: 'Chelan',
    value: 'CA/SK/Nipawin/Chelan',
  },
  {
    label: 'Choiceland',
    value: 'CA/SK/Nipawin/Choiceland',
  },
  {
    label: 'Codette',
    value: 'CA/SK/Nipawin/Codette',
  },
  {
    label: 'Fosston',
    value: 'CA/SK/Nipawin/Fosston',
  },
  {
    label: 'Gronlid',
    value: 'CA/SK/Nipawin/Gronlid',
  },
  {
    label: 'Hudson Bay',
    value: 'CA/SK/Nipawin/Hudson Bay',
  },
  {
    label: 'Kelvington',
    value: 'CA/SK/Nipawin/Kelvington',
  },
  {
    label: 'Love',
    value: 'CA/SK/Nipawin/Love',
  },
  {
    label: 'Melfort',
    value: 'CA/SK/Nipawin/Melfort',
  },
  {
    label: 'Mistatim',
    value: 'CA/SK/Nipawin/Mistatim',
  },
  {
    label: 'Naicam',
    value: 'CA/SK/Nipawin/Naicam',
  },
  {
    label: 'Nipawin',
    value: 'CA/SK/Nipawin/Nipawin',
  },
  {
    label: 'Porcupine Plain',
    value: 'CA/SK/Nipawin/Porcupine Plain',
  },
  {
    label: 'Prairie River',
    value: 'CA/SK/Nipawin/Prairie River',
  },
  {
    label: 'Ridgedale',
    value: 'CA/SK/Nipawin/Ridgedale',
  },
  {
    label: 'Rose Valley',
    value: 'CA/SK/Nipawin/Rose Valley',
  },
  {
    label: 'Smeaton',
    value: 'CA/SK/Nipawin/Smeaton',
  },
  {
    label: 'Snowden',
    value: 'CA/SK/Nipawin/Snowden',
  },
  {
    label: 'Spalding',
    value: 'CA/SK/Nipawin/Spalding',
  },
  {
    label: 'Star City',
    value: 'CA/SK/Nipawin/Star City',
  },
  {
    label: 'Tisdale',
    value: 'CA/SK/Nipawin/Tisdale',
  },
  {
    label: 'Weekes',
    value: 'CA/SK/Nipawin/Weekes',
  },
  {
    label: 'White Fox',
    value: 'CA/SK/Nipawin/White Fox',
  },
  {
    label: 'Zenon Park',
    value: 'CA/SK/Nipawin/Zenon Park',
  },
  {
    label: 'Ahtahkakoop First Nation',
    value: 'CA/SK/North/Ahtahkakoop First Nation',
  },
  {
    label: 'Air Ronge',
    value: 'CA/SK/North/Air Ronge',
  },
  {
    label: 'Albertville',
    value: 'CA/SK/North/Albertville',
  },
  {
    label: 'Barthel',
    value: 'CA/SK/North/Barthel',
  },
  {
    label: 'Bear Creek',
    value: 'CA/SK/North/Bear Creek',
  },
  {
    label: 'Beauval',
    value: 'CA/SK/North/Beauval',
  },
  {
    label: 'Big Island Lake Cree First Nation',
    value: 'CA/SK/North/Big Island Lake Cree First Nation',
  },
  {
    label: 'Big River',
    value: 'CA/SK/North/Big River',
  },
  {
    label: 'Big River First Nation',
    value: 'CA/SK/North/Big River First Nation',
  },
  {
    label: 'Birch Narrows First Nation',
    value: 'CA/SK/North/Birch Narrows First Nation',
  },
  {
    label: 'Black Lake',
    value: 'CA/SK/North/Black Lake',
  },
  {
    label: 'Black Lake First Nation',
    value: 'CA/SK/North/Black Lake First Nation',
  },
  {
    label: 'Black Point',
    value: 'CA/SK/North/Black Point',
  },
  {
    label: 'Brabant Lake',
    value: 'CA/SK/North/Brabant Lake',
  },
  {
    label: 'Buffalo Narrows',
    value: 'CA/SK/North/Buffalo Narrows',
  },
  {
    label: 'Buffalo River Dene First Nation',
    value: 'CA/SK/North/Buffalo River Dene First Nation',
  },
  {
    label: 'Camsell Portage',
    value: 'CA/SK/North/Camsell Portage',
  },
  {
    label: 'Candle Lake',
    value: 'CA/SK/North/Candle Lake',
  },
  {
    label: 'Canoe Lake Cree First Nation',
    value: 'CA/SK/North/Canoe Lake Cree First Nation',
  },
  {
    label: 'Canoe Narrows',
    value: 'CA/SK/North/Canoe Narrows',
  },
  {
    label: 'Canwood',
    value: 'CA/SK/North/Canwood',
  },
  {
    label: 'Carry The Kettle First Nation',
    value: 'CA/SK/North/Carry The Kettle First Nation',
  },
  {
    label: 'Chitek Lake',
    value: 'CA/SK/North/Chitek Lake',
  },
  {
    label: 'Choiceland',
    value: 'CA/SK/North/Choiceland',
  },
  {
    label: 'Christopher Lake',
    value: 'CA/SK/North/Christopher Lake',
  },
  {
    label: 'Clearwater River',
    value: 'CA/SK/North/Clearwater River',
  },
  {
    label: 'Clearwater River Dene First Nation',
    value: 'CA/SK/North/Clearwater River Dene First Nation',
  },
  {
    label: 'Cole Bay',
    value: 'CA/SK/North/Cole Bay',
  },
  {
    label: 'Creighton',
    value: 'CA/SK/North/Creighton',
  },
  {
    label: 'Cumberland House',
    value: 'CA/SK/North/Cumberland House',
  },
  {
    label: 'Cumberland House Cree First Nation',
    value: 'CA/SK/North/Cumberland House Cree First Nation',
  },
  {
    label: 'Debden',
    value: 'CA/SK/North/Debden',
  },
  {
    label: 'Denare Beach',
    value: 'CA/SK/North/Denare Beach',
  },
  {
    label: 'Deschambault Lake',
    value: 'CA/SK/North/Deschambault Lake',
  },
  {
    label: 'Descharme Lake',
    value: 'CA/SK/North/Descharme Lake',
  },
  {
    label: 'Dillon',
    value: 'CA/SK/North/Dillon',
  },
  {
    label: 'Dore Lake',
    value: 'CA/SK/North/Dore Lake',
  },
  {
    label: 'Dorintosh',
    value: 'CA/SK/North/Dorintosh',
  },
  {
    label: 'English River First Nation',
    value: 'CA/SK/North/English River First Nation',
  },
  {
    label: 'Flying Dust First Nation',
    value: 'CA/SK/North/Flying Dust First Nation',
  },
  {
    label: 'Fond Du Lac',
    value: 'CA/SK/North/Fond Du Lac',
  },
  {
    label: 'Fond Du Lac First Nation',
    value: 'CA/SK/North/Fond Du Lac First Nation',
  },
  {
    label: 'Foxford',
    value: 'CA/SK/North/Foxford',
  },
  {
    label: 'Frenchman Butte',
    value: 'CA/SK/North/Frenchman Butte',
  },
  {
    label: 'Garrick',
    value: 'CA/SK/North/Garrick',
  },
  {
    label: 'Garson Lake',
    value: 'CA/SK/North/Garson Lake',
  },
  {
    label: 'Goodsoil',
    value: 'CA/SK/North/Goodsoil',
  },
  {
    label: 'Green Lake',
    value: 'CA/SK/North/Green Lake',
  },
  {
    label: 'Hatchet Lake First Nation',
    value: 'CA/SK/North/Hatchet Lake First Nation',
  },
  {
    label: 'Henribourg',
    value: 'CA/SK/North/Henribourg',
  },
  {
    label: 'Holbein',
    value: 'CA/SK/North/Holbein',
  },
  {
    label: 'Ile-A-La-Crosse',
    value: 'CA/SK/North/Ile-A-La-Crosse',
  },
  {
    label: 'Island Lake First Nation',
    value: 'CA/SK/North/Island Lake First Nation',
  },
  {
    label: 'Jans Bay',
    value: 'CA/SK/North/Jans Bay',
  },
  {
    label: 'Kinoosao',
    value: 'CA/SK/North/Kinoosao',
  },
  {
    label: 'La Loche',
    value: 'CA/SK/North/La Loche',
  },
  {
    label: 'La Ronge',
    value: 'CA/SK/North/La Ronge',
  },
  {
    label: 'Lac La Ronge First Nation',
    value: 'CA/SK/North/Lac La Ronge First Nation',
  },
  {
    label: 'Leoville',
    value: 'CA/SK/North/Leoville',
  },
  {
    label: 'Livelong',
    value: 'CA/SK/North/Livelong',
  },
  {
    label: 'Loon Lake',
    value: 'CA/SK/North/Loon Lake',
  },
  {
    label: 'Love',
    value: 'CA/SK/North/Love',
  },
  {
    label: 'Makwa',
    value: 'CA/SK/North/Makwa',
  },
  {
    label: 'Makwa Sahgaiehcan First Nation',
    value: 'CA/SK/North/Makwa Sahgaiehcan First Nation',
  },
  {
    label: 'Meadow Lake',
    value: 'CA/SK/North/Meadow Lake',
  },
  {
    label: 'Meath Park',
    value: 'CA/SK/North/Meath Park',
  },
  {
    label: 'Michel Village',
    value: 'CA/SK/North/Michel Village',
  },
  {
    label: 'Mildred',
    value: 'CA/SK/North/Mildred',
  },
  {
    label: 'Missinipe',
    value: 'CA/SK/North/Missinipe',
  },
  {
    label: 'Mont Nebo',
    value: 'CA/SK/North/Mont Nebo',
  },
  {
    label: 'Montreal Lake',
    value: 'CA/SK/North/Montreal Lake',
  },
  {
    label: 'Montreal Lake First Nation',
    value: 'CA/SK/North/Montreal Lake First Nation',
  },
  {
    label: 'Northside',
    value: 'CA/SK/North/Northside',
  },
  {
    label: 'Onion Lake',
    value: 'CA/SK/North/Onion Lake',
  },
  {
    label: 'Onion Lake First Nation',
    value: 'CA/SK/North/Onion Lake First Nation',
  },
  {
    label: 'Paddockwood',
    value: 'CA/SK/North/Paddockwood',
  },
  {
    label: 'Patuanak',
    value: 'CA/SK/North/Patuanak',
  },
  {
    label: 'Pelican Lake First Nation',
    value: 'CA/SK/North/Pelican Lake First Nation',
  },
  {
    label: 'Pelican Narrows',
    value: 'CA/SK/North/Pelican Narrows',
  },
  {
    label: 'Peter Ballantyne Cree First Nation',
    value: 'CA/SK/North/Peter Ballantyne Cree First Nation',
  },
  {
    label: 'Pierceland',
    value: 'CA/SK/North/Pierceland',
  },
  {
    label: 'Pinehouse Lake',
    value: 'CA/SK/North/Pinehouse Lake',
  },
  {
    label: 'Prince Albert',
    value: 'CA/SK/North/Prince Albert',
  },
  {
    label: 'Rapid View',
    value: 'CA/SK/North/Rapid View',
  },
  {
    label: 'Sandy Bay',
    value: 'CA/SK/North/Sandy Bay',
  },
  {
    label: 'Shellbrook',
    value: 'CA/SK/North/Shellbrook',
  },
  {
    label: 'Shipman',
    value: 'CA/SK/North/Shipman',
  },
  {
    label: 'Sled Lake',
    value: 'CA/SK/North/Sled Lake',
  },
  {
    label: 'Smeaton',
    value: 'CA/SK/North/Smeaton',
  },
  {
    label: 'Snowden',
    value: 'CA/SK/North/Snowden',
  },
  {
    label: 'Southend',
    value: 'CA/SK/North/Southend',
  },
  {
    label: 'Spruce Home',
    value: 'CA/SK/North/Spruce Home',
  },
  {
    label: 'Spruce Lake',
    value: 'CA/SK/North/Spruce Lake',
  },
  {
    label: 'St Georges Hill',
    value: 'CA/SK/North/St Georges Hill',
  },
  {
    label: 'St Walburg',
    value: 'CA/SK/North/St Walburg',
  },
  {
    label: 'Stanley Mission',
    value: 'CA/SK/North/Stanley Mission',
  },
  {
    label: 'Stony Rapids',
    value: 'CA/SK/North/Stony Rapids',
  },
  {
    label: 'Stump Lake',
    value: 'CA/SK/North/Stump Lake',
  },
  {
    label: 'Sturgeon Lake First Nation',
    value: 'CA/SK/North/Sturgeon Lake First Nation',
  },
  {
    label: 'Sturgeon Landing',
    value: 'CA/SK/North/Sturgeon Landing',
  },
  {
    label: 'Thunderchild First Nation',
    value: 'CA/SK/North/Thunderchild First Nation',
  },
  {
    label: 'Timber Bay',
    value: 'CA/SK/North/Timber Bay',
  },
  {
    label: 'Turnor Lake',
    value: 'CA/SK/North/Turnor Lake',
  },
  {
    label: 'Uranium City',
    value: 'CA/SK/North/Uranium City',
  },
  {
    label: 'Victoire',
    value: 'CA/SK/North/Victoire',
  },
  {
    label: 'Wahpeton Dakota First Nation',
    value: 'CA/SK/North/Wahpeton Dakota First Nation',
  },
  {
    label: 'Waskesiu Lake',
    value: 'CA/SK/North/Waskesiu Lake',
  },
  {
    label: 'Waterhen Lake',
    value: 'CA/SK/North/Waterhen Lake',
  },
  {
    label: 'Weyakwin',
    value: 'CA/SK/North/Weyakwin',
  },
  {
    label: 'Witchekan Lake First Nation',
    value: 'CA/SK/North/Witchekan Lake First Nation',
  },
  {
    label: 'Wollaston Lake',
    value: 'CA/SK/North/Wollaston Lake',
  },
  {
    label: 'Aberdeen',
    value: 'CA/SK/Prince Albert/Aberdeen',
  },
  {
    label: 'Alvena',
    value: 'CA/SK/Prince Albert/Alvena',
  },
  {
    label: 'Annaheim',
    value: 'CA/SK/Prince Albert/Annaheim',
  },
  {
    label: 'Beatty',
    value: 'CA/SK/Prince Albert/Beatty',
  },
  {
    label: 'Birch Hills',
    value: 'CA/SK/Prince Albert/Birch Hills',
  },
  {
    label: 'Bruno',
    value: 'CA/SK/Prince Albert/Bruno',
  },
  {
    label: 'Candle Lake',
    value: 'CA/SK/Prince Albert/Candle Lake',
  },
  {
    label: 'Carmel',
    value: 'CA/SK/Prince Albert/Carmel',
  },
  {
    label: 'Christopher Lake',
    value: 'CA/SK/Prince Albert/Christopher Lake',
  },
  {
    label: 'Crystal Springs',
    value: 'CA/SK/Prince Albert/Crystal Springs',
  },
  {
    label: 'Domremy',
    value: 'CA/SK/Prince Albert/Domremy',
  },
  {
    label: 'Duck Lake',
    value: 'CA/SK/Prince Albert/Duck Lake',
  },
  {
    label: 'Englefeld',
    value: 'CA/SK/Prince Albert/Englefeld',
  },
  {
    label: 'Foxford',
    value: 'CA/SK/Prince Albert/Foxford',
  },
  {
    label: 'Fulda',
    value: 'CA/SK/Prince Albert/Fulda',
  },
  {
    label: 'Hague',
    value: 'CA/SK/Prince Albert/Hague',
  },
  {
    label: 'Hepburn',
    value: 'CA/SK/Prince Albert/Hepburn',
  },
  {
    label: 'Humboldt',
    value: 'CA/SK/Prince Albert/Humboldt',
  },
  {
    label: 'Kinistino',
    value: 'CA/SK/Prince Albert/Kinistino',
  },
  {
    label: 'Laird',
    value: 'CA/SK/Prince Albert/Laird',
  },
  {
    label: 'Lake Lenore',
    value: 'CA/SK/Prince Albert/Lake Lenore',
  },
  {
    label: 'Macdowall',
    value: 'CA/SK/Prince Albert/Macdowall',
  },
  {
    label: 'Meath Park',
    value: 'CA/SK/Prince Albert/Meath Park',
  },
  {
    label: 'Muskoday',
    value: 'CA/SK/Prince Albert/Muskoday',
  },
  {
    label: 'Paddockwood',
    value: 'CA/SK/Prince Albert/Paddockwood',
  },
  {
    label: 'Pilger',
    value: 'CA/SK/Prince Albert/Pilger',
  },
  {
    label: 'Prince Albert',
    value: 'CA/SK/Prince Albert/Prince Albert',
  },
  {
    label: "Prud'homme",
    value: "CA/SK/Prince Albert/Prud'homme",
  },
  {
    label: 'Rosthern',
    value: 'CA/SK/Prince Albert/Rosthern',
  },
  {
    label: 'St Brieux',
    value: 'CA/SK/Prince Albert/St Brieux',
  },
  {
    label: 'St Isidore De Bellevue',
    value: 'CA/SK/Prince Albert/St Isidore De Bellevue',
  },
  {
    label: 'St Louis',
    value: 'CA/SK/Prince Albert/St Louis',
  },
  {
    label: 'Vonda',
    value: 'CA/SK/Prince Albert/Vonda',
  },
  {
    label: 'Wakaw',
    value: 'CA/SK/Prince Albert/Wakaw',
  },
  {
    label: 'Waldheim',
    value: 'CA/SK/Prince Albert/Waldheim',
  },
  {
    label: 'Weirdale',
    value: 'CA/SK/Prince Albert/Weirdale',
  },
  {
    label: 'Weldon',
    value: 'CA/SK/Prince Albert/Weldon',
  },
  {
    label: 'Abernethy',
    value: 'CA/SK/Regina/Abernethy',
  },
  {
    label: 'Balcarres',
    value: 'CA/SK/Regina/Balcarres',
  },
  {
    label: 'Balgonie',
    value: 'CA/SK/Regina/Balgonie',
  },
  {
    label: 'Bethune',
    value: 'CA/SK/Regina/Bethune',
  },
  {
    label: 'Buena Vista',
    value: 'CA/SK/Regina/Buena Vista',
  },
  {
    label: 'Bulyea',
    value: 'CA/SK/Regina/Bulyea',
  },
  {
    label: 'Chamberlain',
    value: 'CA/SK/Regina/Chamberlain',
  },
  {
    label: 'Coppersands',
    value: 'CA/SK/Regina/Coppersands',
  },
  {
    label: 'Craven',
    value: 'CA/SK/Regina/Craven',
  },
  {
    label: 'Cupar',
    value: 'CA/SK/Regina/Cupar',
  },
  {
    label: 'Davin',
    value: 'CA/SK/Regina/Davin',
  },
  {
    label: 'Dilke',
    value: 'CA/SK/Regina/Dilke',
  },
  {
    label: 'Dysart',
    value: 'CA/SK/Regina/Dysart',
  },
  {
    label: 'Earl Grey',
    value: 'CA/SK/Regina/Earl Grey',
  },
  {
    label: 'Edenwold',
    value: 'CA/SK/Regina/Edenwold',
  },
  {
    label: "Fort Qu'appelle",
    value: "CA/SK/Regina/Fort Qu'appelle",
  },
  {
    label: 'Francis',
    value: 'CA/SK/Regina/Francis',
  },
  {
    label: 'Holdfast',
    value: 'CA/SK/Regina/Holdfast',
  },
  {
    label: 'Indian Head',
    value: 'CA/SK/Regina/Indian Head',
  },
  {
    label: 'Kronau',
    value: 'CA/SK/Regina/Kronau',
  },
  {
    label: 'Lebret',
    value: 'CA/SK/Regina/Lebret',
  },
  {
    label: 'Lipton',
    value: 'CA/SK/Regina/Lipton',
  },
  {
    label: 'Lumsden',
    value: 'CA/SK/Regina/Lumsden',
  },
  {
    label: 'Montmartre',
    value: 'CA/SK/Regina/Montmartre',
  },
  {
    label: 'Pense',
    value: 'CA/SK/Regina/Pense',
  },
  {
    label: 'Pilot Butte',
    value: 'CA/SK/Regina/Pilot Butte',
  },
  {
    label: "Qu'appelle",
    value: "CA/SK/Regina/Qu'appelle",
  },
  {
    label: 'Regina',
    value: 'CA/SK/Regina/Regina',
  },
  {
    label: 'Richardson',
    value: 'CA/SK/Regina/Richardson',
  },
  {
    label: 'Rouleau',
    value: 'CA/SK/Regina/Rouleau',
  },
  {
    label: 'Southey',
    value: 'CA/SK/Regina/Southey',
  },
  {
    label: 'Stony Beach',
    value: 'CA/SK/Regina/Stony Beach',
  },
  {
    label: 'Strasbourg',
    value: 'CA/SK/Regina/Strasbourg',
  },
  {
    label: 'Vibank',
    value: 'CA/SK/Regina/Vibank',
  },
  {
    label: 'White City',
    value: 'CA/SK/Regina/White City',
  },
  {
    label: 'Wilcox',
    value: 'CA/SK/Regina/Wilcox',
  },
  {
    label: 'Zehner',
    value: 'CA/SK/Regina/Zehner',
  },
  {
    label: 'Asquith',
    value: 'CA/SK/Rosetown/Asquith',
  },
  {
    label: 'Battleford',
    value: 'CA/SK/Rosetown/Battleford',
  },
  {
    label: 'Biggar',
    value: 'CA/SK/Rosetown/Biggar',
  },
  {
    label: 'Cando',
    value: 'CA/SK/Rosetown/Cando',
  },
  {
    label: 'Conquest',
    value: 'CA/SK/Rosetown/Conquest',
  },
  {
    label: 'Delisle',
    value: 'CA/SK/Rosetown/Delisle',
  },
  {
    label: 'Dinsmore',
    value: 'CA/SK/Rosetown/Dinsmore',
  },
  {
    label: 'Herschel',
    value: 'CA/SK/Rosetown/Herschel',
  },
  {
    label: 'Milden',
    value: 'CA/SK/Rosetown/Milden',
  },
  {
    label: 'Perdue',
    value: 'CA/SK/Rosetown/Perdue',
  },
  {
    label: 'Rosetown',
    value: 'CA/SK/Rosetown/Rosetown',
  },
  {
    label: 'Sovereign',
    value: 'CA/SK/Rosetown/Sovereign',
  },
  {
    label: 'Stranraer',
    value: 'CA/SK/Rosetown/Stranraer',
  },
  {
    label: 'Vanscoy',
    value: 'CA/SK/Rosetown/Vanscoy',
  },
  {
    label: 'Zealandia',
    value: 'CA/SK/Rosetown/Zealandia',
  },
  {
    label: 'Allan',
    value: 'CA/SK/Saskatoon/Allan',
  },
  {
    label: 'Beaver Creek',
    value: 'CA/SK/Saskatoon/Beaver Creek',
  },
  {
    label: 'Bladworth',
    value: 'CA/SK/Saskatoon/Bladworth',
  },
  {
    label: 'Broderick',
    value: 'CA/SK/Saskatoon/Broderick',
  },
  {
    label: 'Clavet',
    value: 'CA/SK/Saskatoon/Clavet',
  },
  {
    label: 'Colonsay',
    value: 'CA/SK/Saskatoon/Colonsay',
  },
  {
    label: 'Corman Park',
    value: 'CA/SK/Saskatoon/Corman Park',
  },
  {
    label: 'Cymric',
    value: 'CA/SK/Saskatoon/Cymric',
  },
  {
    label: 'Dalmeny',
    value: 'CA/SK/Saskatoon/Dalmeny',
  },
  {
    label: 'Davidson',
    value: 'CA/SK/Saskatoon/Davidson',
  },
  {
    label: 'Dundurn',
    value: 'CA/SK/Saskatoon/Dundurn',
  },
  {
    label: 'Eagle Ridge',
    value: 'CA/SK/Saskatoon/Eagle Ridge',
  },
  {
    label: 'Glenside',
    value: 'CA/SK/Saskatoon/Glenside',
  },
  {
    label: 'Govan',
    value: 'CA/SK/Saskatoon/Govan',
  },
  {
    label: 'Guernsey',
    value: 'CA/SK/Saskatoon/Guernsey',
  },
  {
    label: 'Hanley',
    value: 'CA/SK/Saskatoon/Hanley',
  },
  {
    label: 'Hawarden',
    value: 'CA/SK/Saskatoon/Hawarden',
  },
  {
    label: 'Imperial',
    value: 'CA/SK/Saskatoon/Imperial',
  },
  {
    label: 'Kenaston',
    value: 'CA/SK/Saskatoon/Kenaston',
  },
  {
    label: 'Langham',
    value: 'CA/SK/Saskatoon/Langham',
  },
  {
    label: 'Lanigan',
    value: 'CA/SK/Saskatoon/Lanigan',
  },
  {
    label: 'Liberty',
    value: 'CA/SK/Saskatoon/Liberty',
  },
  {
    label: 'Lockwood',
    value: 'CA/SK/Saskatoon/Lockwood',
  },
  {
    label: 'Loreburn',
    value: 'CA/SK/Saskatoon/Loreburn',
  },
  {
    label: 'Martensville',
    value: 'CA/SK/Saskatoon/Martensville',
  },
  {
    label: 'Meacham',
    value: 'CA/SK/Saskatoon/Meacham',
  },
  {
    label: 'Nokomis',
    value: 'CA/SK/Saskatoon/Nokomis',
  },
  {
    label: 'Outlook',
    value: 'CA/SK/Saskatoon/Outlook',
  },
  {
    label: 'Saskatoon',
    value: 'CA/SK/Saskatoon/Saskatoon',
  },
  {
    label: 'Viscount',
    value: 'CA/SK/Saskatoon/Viscount',
  },
  {
    label: 'Warman',
    value: 'CA/SK/Saskatoon/Warman',
  },
  {
    label: 'Young',
    value: 'CA/SK/Saskatoon/Young',
  },
  {
    label: 'Abbey',
    value: 'CA/SK/South East/Abbey',
  },
  {
    label: 'Abernethy',
    value: 'CA/SK/South East/Abernethy',
  },
  {
    label: 'Alameda',
    value: 'CA/SK/South East/Alameda',
  },
  {
    label: 'Alice Beach',
    value: 'CA/SK/South East/Alice Beach',
  },
  {
    label: 'Alida',
    value: 'CA/SK/South East/Alida',
  },
  {
    label: 'Antler',
    value: 'CA/SK/South East/Antler',
  },
  {
    label: 'Arcola',
    value: 'CA/SK/South East/Arcola',
  },
  {
    label: 'Atwater',
    value: 'CA/SK/South East/Atwater',
  },
  {
    label: 'Avonhurst',
    value: 'CA/SK/South East/Avonhurst',
  },
  {
    label: 'Avonlea',
    value: 'CA/SK/South East/Avonlea',
  },
  {
    label: 'B-Say-Tah',
    value: 'CA/SK/South East/B-Say-Tah',
  },
  {
    label: 'Balcarres',
    value: 'CA/SK/South East/Balcarres',
  },
  {
    label: 'Balgonie',
    value: 'CA/SK/South East/Balgonie',
  },
  {
    label: 'Bangor',
    value: 'CA/SK/South East/Bangor',
  },
  {
    label: 'Beaubier',
    value: 'CA/SK/South East/Beaubier',
  },
  {
    label: 'Belle Plaine',
    value: 'CA/SK/South East/Belle Plaine',
  },
  {
    label: 'Bellegarde',
    value: 'CA/SK/South East/Bellegarde',
  },
  {
    label: 'Bengough',
    value: 'CA/SK/South East/Bengough',
  },
  {
    label: 'Benson',
    value: 'CA/SK/South East/Benson',
  },
  {
    label: 'Bethune',
    value: 'CA/SK/South East/Bethune',
  },
  {
    label: 'Bienfait',
    value: 'CA/SK/South East/Bienfait',
  },
  {
    label: 'Big Beaver',
    value: 'CA/SK/South East/Big Beaver',
  },
  {
    label: 'Birds Point',
    value: 'CA/SK/South East/Birds Point',
  },
  {
    label: 'Bredenbury',
    value: 'CA/SK/South East/Bredenbury',
  },
  {
    label: 'Briercrest',
    value: 'CA/SK/South East/Briercrest',
  },
  {
    label: 'Broadview',
    value: 'CA/SK/South East/Broadview',
  },
  {
    label: 'Broadview And District Centennial Lodge',
    value: 'CA/SK/South East/Broadview And District Centennial Lodge',
  },
  {
    label: 'Bromhead',
    value: 'CA/SK/South East/Bromhead',
  },
  {
    label: 'Buena Vista',
    value: 'CA/SK/South East/Buena Vista',
  },
  {
    label: 'Bulyea',
    value: 'CA/SK/South East/Bulyea',
  },
  {
    label: 'Candiac',
    value: 'CA/SK/South East/Candiac',
  },
  {
    label: 'Carievale',
    value: 'CA/SK/South East/Carievale',
  },
  {
    label: 'Carlyle',
    value: 'CA/SK/South East/Carlyle',
  },
  {
    label: 'Carnduff',
    value: 'CA/SK/South East/Carnduff',
  },
  {
    label: 'Ceylon',
    value: 'CA/SK/South East/Ceylon',
  },
  {
    label: 'Churchbridge',
    value: 'CA/SK/South East/Churchbridge',
  },
  {
    label: 'Claybank',
    value: 'CA/SK/South East/Claybank',
  },
  {
    label: 'Colfax',
    value: 'CA/SK/South East/Colfax',
  },
  {
    label: 'Colgate',
    value: 'CA/SK/South East/Colgate',
  },
  {
    label: 'College Park Retirement Centre',
    value: 'CA/SK/South East/College Park Retirement Centre',
  },
  {
    label: 'Corning',
    value: 'CA/SK/South East/Corning',
  },
  {
    label: 'Cowessess',
    value: 'CA/SK/South East/Cowessess',
  },
  {
    label: 'Cowessess First Nation',
    value: 'CA/SK/South East/Cowessess First Nation',
  },
  {
    label: 'Craven',
    value: 'CA/SK/South East/Craven',
  },
  {
    label: 'Creelman',
    value: 'CA/SK/South East/Creelman',
  },
  {
    label: 'Cupar',
    value: 'CA/SK/South East/Cupar',
  },
  {
    label: 'Davin',
    value: 'CA/SK/South East/Davin',
  },
  {
    label: 'Deer Valley',
    value: 'CA/SK/South East/Deer Valley',
  },
  {
    label: 'Dilke',
    value: 'CA/SK/South East/Dilke',
  },
  {
    label: 'Disley',
    value: 'CA/SK/South East/Disley',
  },
  {
    label: 'District Of Katepwa',
    value: 'CA/SK/South East/District Of Katepwa',
  },
  {
    label: 'Drinkwater',
    value: 'CA/SK/South East/Drinkwater',
  },
  {
    label: 'Dubuc',
    value: 'CA/SK/South East/Dubuc',
  },
  {
    label: 'Duff',
    value: 'CA/SK/South East/Duff',
  },
  {
    label: 'Dummer',
    value: 'CA/SK/South East/Dummer',
  },
  {
    label: 'Dysart',
    value: 'CA/SK/South East/Dysart',
  },
  {
    label: 'Earl Grey',
    value: 'CA/SK/South East/Earl Grey',
  },
  {
    label: 'Edenwold',
    value: 'CA/SK/South East/Edenwold',
  },
  {
    label: 'Edgeley',
    value: 'CA/SK/South East/Edgeley',
  },
  {
    label: 'Emerald Park',
    value: 'CA/SK/South East/Emerald Park',
  },
  {
    label: 'Esterhazy',
    value: 'CA/SK/South East/Esterhazy',
  },
  {
    label: 'Estevan',
    value: 'CA/SK/South East/Estevan',
  },
  {
    label: 'Fairlight',
    value: 'CA/SK/South East/Fairlight',
  },
  {
    label: 'Fertile',
    value: 'CA/SK/South East/Fertile',
  },
  {
    label: 'Fillmore',
    value: 'CA/SK/South East/Fillmore',
  },
  {
    label: 'Findlater',
    value: 'CA/SK/South East/Findlater',
  },
  {
    label: 'Fleming',
    value: 'CA/SK/South East/Fleming',
  },
  {
    label: 'Forget',
    value: 'CA/SK/South East/Forget',
  },
  {
    label: 'Fort San',
    value: 'CA/SK/South East/Fort San',
  },
  {
    label: 'Francis',
    value: 'CA/SK/South East/Francis',
  },
  {
    label: 'Frobisher',
    value: 'CA/SK/South East/Frobisher',
  },
  {
    label: 'Gainsborough',
    value: 'CA/SK/South East/Gainsborough',
  },
  {
    label: 'Gerald',
    value: 'CA/SK/South East/Gerald',
  },
  {
    label: 'Gladmar',
    value: 'CA/SK/South East/Gladmar',
  },
  {
    label: 'Glen Ewen',
    value: 'CA/SK/South East/Glen Ewen',
  },
  {
    label: 'Glen Harbour',
    value: 'CA/SK/South East/Glen Harbour',
  },
  {
    label: 'Glenavon',
    value: 'CA/SK/South East/Glenavon',
  },
  {
    label: 'Goodwater',
    value: 'CA/SK/South East/Goodwater',
  },
  {
    label: 'Grand Coulee',
    value: 'CA/SK/South East/Grand Coulee',
  },
  {
    label: 'Grandview Beach',
    value: 'CA/SK/South East/Grandview Beach',
  },
  {
    label: 'Gray',
    value: 'CA/SK/South East/Gray',
  },
  {
    label: 'Grayson',
    value: 'CA/SK/South East/Grayson',
  },
  {
    label: 'Grenfell',
    value: 'CA/SK/South East/Grenfell',
  },
  {
    label: 'Griffin',
    value: 'CA/SK/South East/Griffin',
  },
  {
    label: 'Halbrite',
    value: 'CA/SK/South East/Halbrite',
  },
  {
    label: 'Hardy',
    value: 'CA/SK/South East/Hardy',
  },
  {
    label: 'Hearne',
    value: 'CA/SK/South East/Hearne',
  },
  {
    label: 'Heward',
    value: 'CA/SK/South East/Heward',
  },
  {
    label: 'Holdfast',
    value: 'CA/SK/South East/Holdfast',
  },
  {
    label: 'Indian Head',
    value: 'CA/SK/South East/Indian Head',
  },
  {
    label: 'Island View',
    value: 'CA/SK/South East/Island View',
  },
  {
    label: 'Kahkewistahaw First Nation',
    value: 'CA/SK/South East/Kahkewistahaw First Nation',
  },
  {
    label: 'Kannata Valley',
    value: 'CA/SK/South East/Kannata Valley',
  },
  {
    label: 'Kayville',
    value: 'CA/SK/South East/Kayville',
  },
  {
    label: 'Kelso',
    value: 'CA/SK/South East/Kelso',
  },
  {
    label: 'Kendal',
    value: 'CA/SK/South East/Kendal',
  },
  {
    label: 'Kennedy',
    value: 'CA/SK/South East/Kennedy',
  },
  {
    label: 'Kenosee Lake',
    value: 'CA/SK/South East/Kenosee Lake',
  },
  {
    label: 'Khedive',
    value: 'CA/SK/South East/Khedive',
  },
  {
    label: 'Killaly',
    value: 'CA/SK/South East/Killaly',
  },
  {
    label: 'Kipling',
    value: 'CA/SK/South East/Kipling',
  },
  {
    label: 'Kisbey',
    value: 'CA/SK/South East/Kisbey',
  },
  {
    label: 'Kronau',
    value: 'CA/SK/South East/Kronau',
  },
  {
    label: 'Lajord',
    value: 'CA/SK/South East/Lajord',
  },
  {
    label: 'Lake Alma',
    value: 'CA/SK/South East/Lake Alma',
  },
  {
    label: 'Lang',
    value: 'CA/SK/South East/Lang',
  },
  {
    label: 'Langbank',
    value: 'CA/SK/South East/Langbank',
  },
  {
    label: 'Langenburg',
    value: 'CA/SK/South East/Langenburg',
  },
  {
    label: 'Lebret',
    value: 'CA/SK/South East/Lebret',
  },
  {
    label: 'Lemberg',
    value: 'CA/SK/South East/Lemberg',
  },
  {
    label: 'Lewvan',
    value: 'CA/SK/South East/Lewvan',
  },
  {
    label: 'Lipton',
    value: 'CA/SK/South East/Lipton',
  },
  {
    label: 'Little Black Bear First Nation',
    value: 'CA/SK/South East/Little Black Bear First Nation',
  },
  {
    label: 'Lumsden',
    value: 'CA/SK/South East/Lumsden',
  },
  {
    label: 'Lumsden Beach',
    value: 'CA/SK/South East/Lumsden Beach',
  },
  {
    label: 'Macoun',
    value: 'CA/SK/South East/Macoun',
  },
  {
    label: 'Manor',
    value: 'CA/SK/South East/Manor',
  },
  {
    label: 'Marchwell',
    value: 'CA/SK/South East/Marchwell',
  },
  {
    label: 'Markinch',
    value: 'CA/SK/South East/Markinch',
  },
  {
    label: 'Maryfield',
    value: 'CA/SK/South East/Maryfield',
  },
  {
    label: 'Mclean',
    value: 'CA/SK/South East/Mclean',
  },
  {
    label: 'Mctaggart',
    value: 'CA/SK/South East/Mctaggart',
  },
  {
    label: 'Melville',
    value: 'CA/SK/South East/Melville',
  },
  {
    label: 'Melville Beach',
    value: 'CA/SK/South East/Melville Beach',
  },
  {
    label: 'Midale',
    value: 'CA/SK/South East/Midale',
  },
  {
    label: 'Minton',
    value: 'CA/SK/South East/Minton',
  },
  {
    label: 'Montmartre',
    value: 'CA/SK/South East/Montmartre',
  },
  {
    label: 'Moosomin',
    value: 'CA/SK/South East/Moosomin',
  },
  {
    label: 'Muscowpetung First Nation',
    value: 'CA/SK/South East/Muscowpetung First Nation',
  },
  {
    label: 'Neudorf',
    value: 'CA/SK/South East/Neudorf',
  },
  {
    label: 'North Portal',
    value: 'CA/SK/South East/North Portal',
  },
  {
    label: 'North Weyburn',
    value: 'CA/SK/South East/North Weyburn',
  },
  {
    label: 'Northgate',
    value: 'CA/SK/South East/Northgate',
  },
  {
    label: 'Ocean Man First Nation',
    value: 'CA/SK/South East/Ocean Man First Nation',
  },
  {
    label: 'Ochapowace First Nation',
    value: 'CA/SK/South East/Ochapowace First Nation',
  },
  {
    label: 'Odessa',
    value: 'CA/SK/South East/Odessa',
  },
  {
    label: 'Ogema',
    value: 'CA/SK/South East/Ogema',
  },
  {
    label: 'Okanese First Nation',
    value: 'CA/SK/South East/Okanese First Nation',
  },
  {
    label: 'Ormiston',
    value: 'CA/SK/South East/Ormiston',
  },
  {
    label: 'Osage',
    value: 'CA/SK/South East/Osage',
  },
  {
    label: 'Oungre',
    value: 'CA/SK/South East/Oungre',
  },
  {
    label: 'Oxbow',
    value: 'CA/SK/South East/Oxbow',
  },
  {
    label: 'Pangman',
    value: 'CA/SK/South East/Pangman',
  },
  {
    label: 'Parkman',
    value: 'CA/SK/South East/Parkman',
  },
  {
    label: 'Parry',
    value: 'CA/SK/South East/Parry',
  },
  {
    label: 'Pasqua',
    value: 'CA/SK/South East/Pasqua',
  },
  {
    label: 'Pasqua First Nation',
    value: 'CA/SK/South East/Pasqua First Nation',
  },
  {
    label: 'Peebles',
    value: 'CA/SK/South East/Peebles',
  },
  {
    label: 'Peepeekisis First Nation',
    value: 'CA/SK/South East/Peepeekisis First Nation',
  },
  {
    label: 'Pelican Pointe',
    value: 'CA/SK/South East/Pelican Pointe',
  },
  {
    label: 'Pense',
    value: 'CA/SK/South East/Pense',
  },
  {
    label: 'Pheasant Rump Nakota First Nation',
    value: 'CA/SK/South East/Pheasant Rump Nakota First Nation',
  },
  {
    label: 'Piapot First Nation',
    value: 'CA/SK/South East/Piapot First Nation',
  },
  {
    label: 'Pilot Butte',
    value: 'CA/SK/South East/Pilot Butte',
  },
  {
    label: 'Radville',
    value: 'CA/SK/South East/Radville',
  },
  {
    label: 'Redvers',
    value: 'CA/SK/South East/Redvers',
  },
  {
    label: 'Regina',
    value: 'CA/SK/South East/Regina',
  },
  {
    label: 'Regina Beach',
    value: 'CA/SK/South East/Regina Beach',
  },
  {
    label: 'Riceton',
    value: 'CA/SK/South East/Riceton',
  },
  {
    label: 'Richardson',
    value: 'CA/SK/South East/Richardson',
  },
  {
    label: 'Rocanville',
    value: 'CA/SK/South East/Rocanville',
  },
  {
    label: 'Roche Percee',
    value: 'CA/SK/South East/Roche Percee',
  },
  {
    label: 'Rouleau',
    value: 'CA/SK/South East/Rouleau',
  },
  {
    label: 'Sakimay First Nations',
    value: 'CA/SK/South East/Sakimay First Nations',
  },
  {
    label: 'Saskatchewan Beach',
    value: 'CA/SK/South East/Saskatchewan Beach',
  },
  {
    label: 'Sedley',
    value: 'CA/SK/South East/Sedley',
  },
  {
    label: 'Silton',
    value: 'CA/SK/South East/Silton',
  },
  {
    label: 'Sintaluta',
    value: 'CA/SK/South East/Sintaluta',
  },
  {
    label: 'Southey',
    value: 'CA/SK/South East/Southey',
  },
  {
    label: 'Spring Valley',
    value: 'CA/SK/South East/Spring Valley',
  },
  {
    label: 'Spy Hill',
    value: 'CA/SK/South East/Spy Hill',
  },
  {
    label: 'Standing Buffalo First Nation',
    value: 'CA/SK/South East/Standing Buffalo First Nation',
  },
  {
    label: 'Star Blanket First Nation',
    value: 'CA/SK/South East/Star Blanket First Nation',
  },
  {
    label: 'Steelman',
    value: 'CA/SK/South East/Steelman',
  },
  {
    label: 'Stockholm',
    value: 'CA/SK/South East/Stockholm',
  },
  {
    label: 'Storthoaks',
    value: 'CA/SK/South East/Storthoaks',
  },
  {
    label: 'Stoughton',
    value: 'CA/SK/South East/Stoughton',
  },
  {
    label: 'Summerberry',
    value: 'CA/SK/South East/Summerberry',
  },
  {
    label: 'Sunset Cove',
    value: 'CA/SK/South East/Sunset Cove',
  },
  {
    label: 'Tantallon',
    value: 'CA/SK/South East/Tantallon',
  },
  {
    label: 'Tompkins',
    value: 'CA/SK/South East/Tompkins',
  },
  {
    label: 'Torquay',
    value: 'CA/SK/South East/Torquay',
  },
  {
    label: 'Tribune',
    value: 'CA/SK/South East/Tribune',
  },
  {
    label: 'Trossachs',
    value: 'CA/SK/South East/Trossachs',
  },
  {
    label: 'Truax',
    value: 'CA/SK/South East/Truax',
  },
  {
    label: 'Tyvan',
    value: 'CA/SK/South East/Tyvan',
  },
  {
    label: 'Vibank',
    value: 'CA/SK/South East/Vibank',
  },
  {
    label: 'Viceroy',
    value: 'CA/SK/South East/Viceroy',
  },
  {
    label: 'Waldron',
    value: 'CA/SK/South East/Waldron',
  },
  {
    label: 'Wapella',
    value: 'CA/SK/South East/Wapella',
  },
  {
    label: 'Waterhen Lake First Nation',
    value: 'CA/SK/South East/Waterhen Lake First Nation',
  },
  {
    label: 'Wauchope',
    value: 'CA/SK/South East/Wauchope',
  },
  {
    label: 'Wawota',
    value: 'CA/SK/South East/Wawota',
  },
  {
    label: 'Wee Too Beach',
    value: 'CA/SK/South East/Wee Too Beach',
  },
  {
    label: 'Welwyn',
    value: 'CA/SK/South East/Welwyn',
  },
  {
    label: 'West End',
    value: 'CA/SK/South East/West End',
  },
  {
    label: 'Weyburn',
    value: 'CA/SK/South East/Weyburn',
  },
  {
    label: 'White Bear',
    value: 'CA/SK/South East/White Bear',
  },
  {
    label: 'White Bear First Nation',
    value: 'CA/SK/South East/White Bear First Nation',
  },
  {
    label: 'White City',
    value: 'CA/SK/South East/White City',
  },
  {
    label: 'Whitewood',
    value: 'CA/SK/South East/Whitewood',
  },
  {
    label: 'Wilcox',
    value: 'CA/SK/South East/Wilcox',
  },
  {
    label: 'Windthorst',
    value: 'CA/SK/South East/Windthorst',
  },
  {
    label: 'Wolseley',
    value: 'CA/SK/South East/Wolseley',
  },
  {
    label: 'Yarbo',
    value: 'CA/SK/South East/Yarbo',
  },
  {
    label: 'Yellow Grass',
    value: 'CA/SK/South East/Yellow Grass',
  },
  {
    label: 'Zehner',
    value: 'CA/SK/South East/Zehner',
  },
  {
    label: 'Admiral',
    value: 'CA/SK/South West/Admiral',
  },
  {
    label: 'Aneroid',
    value: 'CA/SK/South West/Aneroid',
  },
  {
    label: 'Ardill',
    value: 'CA/SK/South West/Ardill',
  },
  {
    label: 'Assiniboia',
    value: 'CA/SK/South West/Assiniboia',
  },
  {
    label: 'Aylesbury',
    value: 'CA/SK/South West/Aylesbury',
  },
  {
    label: 'Bateman',
    value: 'CA/SK/South West/Bateman',
  },
  {
    label: 'Beaver Flat',
    value: 'CA/SK/South West/Beaver Flat',
  },
  {
    label: 'Beechy',
    value: 'CA/SK/South West/Beechy',
  },
  {
    label: 'Blumenhof',
    value: 'CA/SK/South West/Blumenhof',
  },
  {
    label: 'Bracken',
    value: 'CA/SK/South West/Bracken',
  },
  {
    label: 'Brownlee',
    value: 'CA/SK/South West/Brownlee',
  },
  {
    label: 'Burstall',
    value: 'CA/SK/South West/Burstall',
  },
  {
    label: 'Bushell Park',
    value: 'CA/SK/South West/Bushell Park',
  },
  {
    label: 'Cabri',
    value: 'CA/SK/South West/Cabri',
  },
  {
    label: 'Cadillac',
    value: 'CA/SK/South West/Cadillac',
  },
  {
    label: 'Cardross',
    value: 'CA/SK/South West/Cardross',
  },
  {
    label: 'Carmichael',
    value: 'CA/SK/South West/Carmichael',
  },
  {
    label: 'Caron',
    value: 'CA/SK/South West/Caron',
  },
  {
    label: 'Caronport',
    value: 'CA/SK/South West/Caronport',
  },
  {
    label: 'Central Butte',
    value: 'CA/SK/South West/Central Butte',
  },
  {
    label: 'Chamberlain',
    value: 'CA/SK/South West/Chamberlain',
  },
  {
    label: 'Chaplin',
    value: 'CA/SK/South West/Chaplin',
  },
  {
    label: 'Claydon',
    value: 'CA/SK/South West/Claydon',
  },
  {
    label: 'Climax',
    value: 'CA/SK/South West/Climax',
  },
  {
    label: 'Congress',
    value: 'CA/SK/South West/Congress',
  },
  {
    label: 'Consul',
    value: 'CA/SK/South West/Consul',
  },
  {
    label: 'Coronach',
    value: 'CA/SK/South West/Coronach',
  },
  {
    label: 'Courval',
    value: 'CA/SK/South West/Courval',
  },
  {
    label: 'Crane Valley',
    value: 'CA/SK/South West/Crane Valley',
  },
  {
    label: 'Demaine',
    value: 'CA/SK/South West/Demaine',
  },
  {
    label: 'Dollard',
    value: 'CA/SK/South West/Dollard',
  },
  {
    label: 'Eastend',
    value: 'CA/SK/South West/Eastend',
  },
  {
    label: 'Ernfold',
    value: 'CA/SK/South West/Ernfold',
  },
  {
    label: 'Eyebrow',
    value: 'CA/SK/South West/Eyebrow',
  },
  {
    label: 'Ferland',
    value: 'CA/SK/South West/Ferland',
  },
  {
    label: 'Fife Lake',
    value: 'CA/SK/South West/Fife Lake',
  },
  {
    label: 'Flintoft',
    value: 'CA/SK/South West/Flintoft',
  },
  {
    label: 'Fox Valley',
    value: 'CA/SK/South West/Fox Valley',
  },
  {
    label: 'Frontier',
    value: 'CA/SK/South West/Frontier',
  },
  {
    label: 'Glenbain',
    value: 'CA/SK/South West/Glenbain',
  },
  {
    label: 'Glentworth',
    value: 'CA/SK/South West/Glentworth',
  },
  {
    label: 'Golden Prairie',
    value: 'CA/SK/South West/Golden Prairie',
  },
  {
    label: 'Gouldtown',
    value: 'CA/SK/South West/Gouldtown',
  },
  {
    label: 'Gravelbourg',
    value: 'CA/SK/South West/Gravelbourg',
  },
  {
    label: 'Gull Lake',
    value: 'CA/SK/South West/Gull Lake',
  },
  {
    label: 'Hazenmore',
    value: 'CA/SK/South West/Hazenmore',
  },
  {
    label: 'Hazlet',
    value: 'CA/SK/South West/Hazlet',
  },
  {
    label: 'Herbert',
    value: 'CA/SK/South West/Herbert',
  },
  {
    label: 'Hodgeville',
    value: 'CA/SK/South West/Hodgeville',
  },
  {
    label: 'Keeler',
    value: 'CA/SK/South West/Keeler',
  },
  {
    label: 'Kincaid',
    value: 'CA/SK/South West/Kincaid',
  },
  {
    label: 'Kyle',
    value: 'CA/SK/South West/Kyle',
  },
  {
    label: 'Lacadena',
    value: 'CA/SK/South West/Lacadena',
  },
  {
    label: 'Lafleche',
    value: 'CA/SK/South West/Lafleche',
  },
  {
    label: 'Lancer',
    value: 'CA/SK/South West/Lancer',
  },
  {
    label: 'Leader',
    value: 'CA/SK/South West/Leader',
  },
  {
    label: 'Liebenthal',
    value: 'CA/SK/South West/Liebenthal',
  },
  {
    label: 'Limerick',
    value: 'CA/SK/South West/Limerick',
  },
  {
    label: 'Lisieux',
    value: 'CA/SK/South West/Lisieux',
  },
  {
    label: 'Lucky Lake',
    value: 'CA/SK/South West/Lucky Lake',
  },
  {
    label: 'Main Centre',
    value: 'CA/SK/South West/Main Centre',
  },
  {
    label: 'Mankota',
    value: 'CA/SK/South West/Mankota',
  },
  {
    label: 'Maple Creek',
    value: 'CA/SK/South West/Maple Creek',
  },
  {
    label: 'Marquis',
    value: 'CA/SK/South West/Marquis',
  },
  {
    label: 'Mazenod',
    value: 'CA/SK/South West/Mazenod',
  },
  {
    label: 'Mcmahon',
    value: 'CA/SK/South West/Mcmahon',
  },
  {
    label: 'Melaval',
    value: 'CA/SK/South West/Melaval',
  },
  {
    label: 'Mendham',
    value: 'CA/SK/South West/Mendham',
  },
  {
    label: 'Meyronne',
    value: 'CA/SK/South West/Meyronne',
  },
  {
    label: 'Moose Jaw',
    value: 'CA/SK/South West/Moose Jaw',
  },
  {
    label: 'Morse',
    value: 'CA/SK/South West/Morse',
  },
  {
    label: 'Mortlach',
    value: 'CA/SK/South West/Mortlach',
  },
  {
    label: 'Mossbank',
    value: 'CA/SK/South West/Mossbank',
  },
  {
    label: 'Neidpath',
    value: 'CA/SK/South West/Neidpath',
  },
  {
    label: 'Nekaneet First Nation',
    value: 'CA/SK/South West/Nekaneet First Nation',
  },
  {
    label: 'Neville',
    value: 'CA/SK/South West/Neville',
  },
  {
    label: 'North Grove',
    value: 'CA/SK/South West/North Grove',
  },
  {
    label: 'Orkney',
    value: 'CA/SK/South West/Orkney',
  },
  {
    label: 'Palmer',
    value: 'CA/SK/South West/Palmer',
  },
  {
    label: 'Pambrun',
    value: 'CA/SK/South West/Pambrun',
  },
  {
    label: 'Parkbeg',
    value: 'CA/SK/South West/Parkbeg',
  },
  {
    label: 'Piapot',
    value: 'CA/SK/South West/Piapot',
  },
  {
    label: 'Ponteix',
    value: 'CA/SK/South West/Ponteix',
  },
  {
    label: 'Portreeve',
    value: 'CA/SK/South West/Portreeve',
  },
  {
    label: 'Prairie View',
    value: 'CA/SK/South West/Prairie View',
  },
  {
    label: 'Prelate',
    value: 'CA/SK/South West/Prelate',
  },
  {
    label: 'Richmound',
    value: 'CA/SK/South West/Richmound',
  },
  {
    label: 'Riverhurst',
    value: 'CA/SK/South West/Riverhurst',
  },
  {
    label: 'Robsart',
    value: 'CA/SK/South West/Robsart',
  },
  {
    label: 'Rockglen',
    value: 'CA/SK/South West/Rockglen',
  },
  {
    label: 'Rush Lake',
    value: 'CA/SK/South West/Rush Lake',
  },
  {
    label: 'Sceptre',
    value: 'CA/SK/South West/Sceptre',
  },
  {
    label: 'Scout Lake',
    value: 'CA/SK/South West/Scout Lake',
  },
  {
    label: 'Shackleton',
    value: 'CA/SK/South West/Shackleton',
  },
  {
    label: 'Shamrock',
    value: 'CA/SK/South West/Shamrock',
  },
  {
    label: 'Shaunavon',
    value: 'CA/SK/South West/Shaunavon',
  },
  {
    label: 'Simmie',
    value: 'CA/SK/South West/Simmie',
  },
  {
    label: 'South Lake',
    value: 'CA/SK/South West/South Lake',
  },
  {
    label: 'St Victor',
    value: 'CA/SK/South West/St Victor',
  },
  {
    label: 'Stewart Valley',
    value: 'CA/SK/South West/Stewart Valley',
  },
  {
    label: 'Success',
    value: 'CA/SK/South West/Success',
  },
  {
    label: 'Sun Valley',
    value: 'CA/SK/South West/Sun Valley',
  },
  {
    label: 'Swift Current',
    value: 'CA/SK/South West/Swift Current',
  },
  {
    label: 'Tugaske',
    value: 'CA/SK/South West/Tugaske',
  },
  {
    label: 'Tuxford',
    value: 'CA/SK/South West/Tuxford',
  },
  {
    label: 'Val Marie',
    value: 'CA/SK/South West/Val Marie',
  },
  {
    label: 'Vanguard',
    value: 'CA/SK/South West/Vanguard',
  },
  {
    label: 'Verwood',
    value: 'CA/SK/South West/Verwood',
  },
  {
    label: 'Vidora',
    value: 'CA/SK/South West/Vidora',
  },
  {
    label: 'Waldeck',
    value: 'CA/SK/South West/Waldeck',
  },
  {
    label: 'Webb',
    value: 'CA/SK/South West/Webb',
  },
  {
    label: 'Willow Bunch',
    value: 'CA/SK/South West/Willow Bunch',
  },
  {
    label: 'Wood Mountain',
    value: 'CA/SK/South West/Wood Mountain',
  },
  {
    label: 'Wood Mountain First Nation',
    value: 'CA/SK/South West/Wood Mountain First Nation',
  },
  {
    label: 'Wymark',
    value: 'CA/SK/South West/Wymark',
  },
  {
    label: 'Abbey',
    value: 'CA/SK/Swift Current/Abbey',
  },
  {
    label: 'Cabri',
    value: 'CA/SK/Swift Current/Cabri',
  },
  {
    label: 'Eatonia',
    value: 'CA/SK/Swift Current/Eatonia',
  },
  {
    label: 'Elrose',
    value: 'CA/SK/Swift Current/Elrose',
  },
  {
    label: 'Eston',
    value: 'CA/SK/Swift Current/Eston',
  },
  {
    label: 'Fox Valley',
    value: 'CA/SK/Swift Current/Fox Valley',
  },
  {
    label: 'Glidden',
    value: 'CA/SK/Swift Current/Glidden',
  },
  {
    label: 'Golden Prairie',
    value: 'CA/SK/Swift Current/Golden Prairie',
  },
  {
    label: 'Gull Lake',
    value: 'CA/SK/Swift Current/Gull Lake',
  },
  {
    label: 'Hazlet',
    value: 'CA/SK/Swift Current/Hazlet',
  },
  {
    label: 'Kyle',
    value: 'CA/SK/Swift Current/Kyle',
  },
  {
    label: 'Lacadena',
    value: 'CA/SK/Swift Current/Lacadena',
  },
  {
    label: 'Lancer',
    value: 'CA/SK/Swift Current/Lancer',
  },
  {
    label: 'Leader',
    value: 'CA/SK/Swift Current/Leader',
  },
  {
    label: 'Pennant Station',
    value: 'CA/SK/Swift Current/Pennant Station',
  },
  {
    label: 'Plato',
    value: 'CA/SK/Swift Current/Plato',
  },
  {
    label: 'Portreeve',
    value: 'CA/SK/Swift Current/Portreeve',
  },
  {
    label: 'Prelate',
    value: 'CA/SK/Swift Current/Prelate',
  },
  {
    label: 'Richmound',
    value: 'CA/SK/Swift Current/Richmound',
  },
  {
    label: 'Sceptre',
    value: 'CA/SK/Swift Current/Sceptre',
  },
  {
    label: 'Swift Current',
    value: 'CA/SK/Swift Current/Swift Current',
  },
  {
    label: 'Tompkins',
    value: 'CA/SK/Swift Current/Tompkins',
  },
  {
    label: 'Webb',
    value: 'CA/SK/Swift Current/Webb',
  },
  {
    label: 'Wymark',
    value: 'CA/SK/Swift Current/Wymark',
  },
  {
    label: 'Bankend',
    value: 'CA/SK/Wadena/Bankend',
  },
  {
    label: 'Clair',
    value: 'CA/SK/Wadena/Clair',
  },
  {
    label: 'Foam Lake',
    value: 'CA/SK/Wadena/Foam Lake',
  },
  {
    label: 'Hendon',
    value: 'CA/SK/Wadena/Hendon',
  },
  {
    label: 'Ituna',
    value: 'CA/SK/Wadena/Ituna',
  },
  {
    label: 'Jansen',
    value: 'CA/SK/Wadena/Jansen',
  },
  {
    label: 'Kelliher',
    value: 'CA/SK/Wadena/Kelliher',
  },
  {
    label: 'Leroy',
    value: 'CA/SK/Wadena/Leroy',
  },
  {
    label: 'Lestock',
    value: 'CA/SK/Wadena/Lestock',
  },
  {
    label: 'Margo',
    value: 'CA/SK/Wadena/Margo',
  },
  {
    label: 'Mozart',
    value: 'CA/SK/Wadena/Mozart',
  },
  {
    label: 'Punnichy',
    value: 'CA/SK/Wadena/Punnichy',
  },
  {
    label: 'Quill Lake',
    value: 'CA/SK/Wadena/Quill Lake',
  },
  {
    label: 'Raymore',
    value: 'CA/SK/Wadena/Raymore',
  },
  {
    label: 'Semans',
    value: 'CA/SK/Wadena/Semans',
  },
  {
    label: 'Tuffnell',
    value: 'CA/SK/Wadena/Tuffnell',
  },
  {
    label: 'Wadena',
    value: 'CA/SK/Wadena/Wadena',
  },
  {
    label: 'Watson',
    value: 'CA/SK/Wadena/Watson',
  },
  {
    label: 'West Bend',
    value: 'CA/SK/Wadena/West Bend',
  },
  {
    label: 'Wishart',
    value: 'CA/SK/Wadena/Wishart',
  },
  {
    label: 'Wynyard',
    value: 'CA/SK/Wadena/Wynyard',
  },
  {
    label: 'Avonlea',
    value: 'CA/SK/Weyburn/Avonlea',
  },
  {
    label: 'Beaubier',
    value: 'CA/SK/Weyburn/Beaubier',
  },
  {
    label: 'Bengough',
    value: 'CA/SK/Weyburn/Bengough',
  },
  {
    label: 'Big Beaver',
    value: 'CA/SK/Weyburn/Big Beaver',
  },
  {
    label: 'Bromhead',
    value: 'CA/SK/Weyburn/Bromhead',
  },
  {
    label: 'Ceylon',
    value: 'CA/SK/Weyburn/Ceylon',
  },
  {
    label: 'Colgate',
    value: 'CA/SK/Weyburn/Colgate',
  },
  {
    label: 'Creelman',
    value: 'CA/SK/Weyburn/Creelman',
  },
  {
    label: 'Fillmore',
    value: 'CA/SK/Weyburn/Fillmore',
  },
  {
    label: 'Goodwater',
    value: 'CA/SK/Weyburn/Goodwater',
  },
  {
    label: 'Lake Alma',
    value: 'CA/SK/Weyburn/Lake Alma',
  },
  {
    label: 'Midale',
    value: 'CA/SK/Weyburn/Midale',
  },
  {
    label: 'Milestone',
    value: 'CA/SK/Weyburn/Milestone',
  },
  {
    label: 'Minton',
    value: 'CA/SK/Weyburn/Minton',
  },
  {
    label: 'Ogema',
    value: 'CA/SK/Weyburn/Ogema',
  },
  {
    label: 'Pangman',
    value: 'CA/SK/Weyburn/Pangman',
  },
  {
    label: 'Radville',
    value: 'CA/SK/Weyburn/Radville',
  },
  {
    label: 'Torquay',
    value: 'CA/SK/Weyburn/Torquay',
  },
  {
    label: 'Weyburn',
    value: 'CA/SK/Weyburn/Weyburn',
  },
  {
    label: 'Buchanan',
    value: 'CA/SK/Yorkton/Buchanan',
  },
  {
    label: 'Calder',
    value: 'CA/SK/Yorkton/Calder',
  },
  {
    label: 'Canora',
    value: 'CA/SK/Yorkton/Canora',
  },
  {
    label: 'Ebenezer',
    value: 'CA/SK/Yorkton/Ebenezer',
  },
  {
    label: 'Endeavour',
    value: 'CA/SK/Yorkton/Endeavour',
  },
  {
    label: 'Good Spirit Acres',
    value: 'CA/SK/Yorkton/Good Spirit Acres',
  },
  {
    label: 'Hyas',
    value: 'CA/SK/Yorkton/Hyas',
  },
  {
    label: 'Insinger',
    value: 'CA/SK/Yorkton/Insinger',
  },
  {
    label: 'Invermay',
    value: 'CA/SK/Yorkton/Invermay',
  },
  {
    label: 'Jedburgh',
    value: 'CA/SK/Yorkton/Jedburgh',
  },
  {
    label: 'Kamsack',
    value: 'CA/SK/Yorkton/Kamsack',
  },
  {
    label: 'Norquay',
    value: 'CA/SK/Yorkton/Norquay',
  },
  {
    label: 'Pelly',
    value: 'CA/SK/Yorkton/Pelly',
  },
  {
    label: 'Preeceville',
    value: 'CA/SK/Yorkton/Preeceville',
  },
  {
    label: 'Rama',
    value: 'CA/SK/Yorkton/Rama',
  },
  {
    label: 'Rhein',
    value: 'CA/SK/Yorkton/Rhein',
  },
  {
    label: 'Springside',
    value: 'CA/SK/Yorkton/Springside',
  },
  {
    label: 'Sturgis',
    value: 'CA/SK/Yorkton/Sturgis',
  },
  {
    label: 'Theodore',
    value: 'CA/SK/Yorkton/Theodore',
  },
  {
    label: 'Veregin',
    value: 'CA/SK/Yorkton/Veregin',
  },
  {
    label: 'Wroxton',
    value: 'CA/SK/Yorkton/Wroxton',
  },
  {
    label: 'Yellow Quill',
    value: 'CA/SK/Yorkton/Yellow Quill',
  },
  {
    label: 'Yorkton',
    value: 'CA/SK/Yorkton/Yorkton',
  },
  {
    label: 'Beaver Creek',
    value: 'CA/YT/Kluane/Beaver Creek',
  },
  {
    label: 'Burwash Landing',
    value: 'CA/YT/Kluane/Burwash Landing',
  },
  {
    label: 'Destruction Bay',
    value: 'CA/YT/Kluane/Destruction Bay',
  },
  {
    label: 'Haines Junction',
    value: 'CA/YT/Kluane/Haines Junction',
  },
  {
    label: 'Faro',
    value: 'CA/YT/Liard/Faro',
  },
  {
    label: 'Ross River',
    value: 'CA/YT/Liard/Ross River',
  },
  {
    label: 'Watson Lake',
    value: 'CA/YT/Liard/Watson Lake',
  },
  {
    label: 'Dawson',
    value: 'CA/YT/Northern/Dawson',
  },
  {
    label: 'Old Crow',
    value: 'CA/YT/Northern/Old Crow',
  },
  {
    label: 'Carmacks',
    value: 'CA/YT/Northern Tuchone/Carmacks',
  },
  {
    label: 'Elsa',
    value: 'CA/YT/Northern Tuchone/Elsa',
  },
  {
    label: 'Mayo',
    value: 'CA/YT/Northern Tuchone/Mayo',
  },
  {
    label: 'Pelly Crossing',
    value: 'CA/YT/Northern Tuchone/Pelly Crossing',
  },
  {
    label: 'Carcross',
    value: 'CA/YT/Southern Lakes/Carcross',
  },
  {
    label: 'Marsh Lake',
    value: 'CA/YT/Southern Lakes/Marsh Lake',
  },
  {
    label: 'Tagish',
    value: 'CA/YT/Southern Lakes/Tagish',
  },
  {
    label: 'Whitehorse',
    value: 'CA/YT/Southern Lakes/Whitehorse',
  },
  {
    label: 'Beaver Creek',
    value: 'CA/YT/Yukon/Beaver Creek',
  },
  {
    label: 'Carcross',
    value: 'CA/YT/Yukon/Carcross',
  },
  {
    label: 'Dawson',
    value: 'CA/YT/Yukon/Dawson',
  },
  {
    label: 'Destruction Bay',
    value: 'CA/YT/Yukon/Destruction Bay',
  },
  {
    label: 'Faro',
    value: 'CA/YT/Yukon/Faro',
  },
  {
    label: 'Haines Junction',
    value: 'CA/YT/Yukon/Haines Junction',
  },
  {
    label: 'Mayo',
    value: 'CA/YT/Yukon/Mayo',
  },
  {
    label: 'Ross River',
    value: 'CA/YT/Yukon/Ross River',
  },
  {
    label: 'Teslin',
    value: 'CA/YT/Yukon/Teslin',
  },
  {
    label: 'Watson Lake',
    value: 'CA/YT/Yukon/Watson Lake',
  },
  {
    label: 'Whitehorse',
    value: 'CA/YT/Yukon/Whitehorse',
  },
]);
