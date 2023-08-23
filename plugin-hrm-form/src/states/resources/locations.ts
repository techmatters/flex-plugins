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
    "label": "Acadia Valley",
    "value": "CA/AB/Acadia Valley"
  },
  {
    "label": "Altario",
    "value": "CA/AB/Altario"
  },
  {
    "label": "Big Stone",
    "value": "CA/AB/Big Stone"
  },
  {
    "label": "Bindloss",
    "value": "CA/AB/Bindloss"
  },
  {
    "label": "Buffalo",
    "value": "CA/AB/Buffalo"
  },
  {
    "label": "Cereal",
    "value": "CA/AB/Cereal"
  },
  {
    "label": "Cessford",
    "value": "CA/AB/Cessford"
  },
  {
    "label": "Chinook",
    "value": "CA/AB/Chinook"
  },
  {
    "label": "Compeer",
    "value": "CA/AB/Compeer"
  },
  {
    "label": "Consort",
    "value": "CA/AB/Consort"
  },
  {
    "label": "Empress",
    "value": "CA/AB/Empress"
  },
  {
    "label": "Esther",
    "value": "CA/AB/Esther"
  },
  {
    "label": "Finnegan",
    "value": "CA/AB/Finnegan"
  },
  {
    "label": "Hanna",
    "value": "CA/AB/Hanna"
  },
  {
    "label": "Jenner",
    "value": "CA/AB/Jenner"
  },
  {
    "label": "Kirriemuir",
    "value": "CA/AB/Kirriemuir"
  },
  {
    "label": "Monitor",
    "value": "CA/AB/Monitor"
  },
  {
    "label": "New Brigden",
    "value": "CA/AB/New Brigden"
  },
  {
    "label": "Oyen",
    "value": "CA/AB/Oyen"
  },
  {
    "label": "Pollockville",
    "value": "CA/AB/Pollockville"
  },
  {
    "label": "Sedalia",
    "value": "CA/AB/Sedalia"
  },
  {
    "label": "Sibbald",
    "value": "CA/AB/Sibbald"
  },
  {
    "label": "Sunnynook",
    "value": "CA/AB/Sunnynook"
  },
  {
    "label": "Veteran",
    "value": "CA/AB/Veteran"
  },
  {
    "label": "Wardlow",
    "value": "CA/AB/Wardlow"
  },
  {
    "label": "Youngstown",
    "value": "CA/AB/Youngstown"
  },
  {
    "label": "Crossfield",
    "value": "CA/AB/Crossfield"
  },
  {
    "label": "Abee",
    "value": "CA/AB/Abee"
  },
  {
    "label": "Alberta Beach",
    "value": "CA/AB/Alberta Beach"
  },
  {
    "label": "Athabasca",
    "value": "CA/AB/Athabasca"
  },
  {
    "label": "Atmore",
    "value": "CA/AB/Atmore"
  },
  {
    "label": "Barrhead",
    "value": "CA/AB/Barrhead"
  },
  {
    "label": "Boyle",
    "value": "CA/AB/Boyle"
  },
  {
    "label": "Breynat",
    "value": "CA/AB/Breynat"
  },
  {
    "label": "Busby",
    "value": "CA/AB/Busby"
  },
  {
    "label": "Caslan",
    "value": "CA/AB/Caslan"
  },
  {
    "label": "Clyde",
    "value": "CA/AB/Clyde"
  },
  {
    "label": "Colinton",
    "value": "CA/AB/Colinton"
  },
  {
    "label": "Darwell",
    "value": "CA/AB/Darwell"
  },
  {
    "label": "Ellscott",
    "value": "CA/AB/Ellscott"
  },
  {
    "label": "Fawcett",
    "value": "CA/AB/Fawcett"
  },
  {
    "label": "Fort Assiniboine",
    "value": "CA/AB/Fort Assiniboine"
  },
  {
    "label": "Glenevis",
    "value": "CA/AB/Glenevis"
  },
  {
    "label": "Grassland",
    "value": "CA/AB/Grassland"
  },
  {
    "label": "Island Lake",
    "value": "CA/AB/Island Lake"
  },
  {
    "label": "Island Lake South",
    "value": "CA/AB/Island Lake South"
  },
  {
    "label": "Jarvie",
    "value": "CA/AB/Jarvie"
  },
  {
    "label": "Mayerthorpe",
    "value": "CA/AB/Mayerthorpe"
  },
  {
    "label": "Neerlandia",
    "value": "CA/AB/Neerlandia"
  },
  {
    "label": "Newbrook",
    "value": "CA/AB/Newbrook"
  },
  {
    "label": "Onoway",
    "value": "CA/AB/Onoway"
  },
  {
    "label": "Perryvale",
    "value": "CA/AB/Perryvale"
  },
  {
    "label": "Pickardville",
    "value": "CA/AB/Pickardville"
  },
  {
    "label": "Radway",
    "value": "CA/AB/Radway"
  },
  {
    "label": "Rochester",
    "value": "CA/AB/Rochester"
  },
  {
    "label": "Sangudo",
    "value": "CA/AB/Sangudo"
  },
  {
    "label": "South Baptiste",
    "value": "CA/AB/South Baptiste"
  },
  {
    "label": "Sturgeon County",
    "value": "CA/AB/Sturgeon County"
  },
  {
    "label": "Sunset Beach",
    "value": "CA/AB/Sunset Beach"
  },
  {
    "label": "Thorhild",
    "value": "CA/AB/Thorhild"
  },
  {
    "label": "Vimy",
    "value": "CA/AB/Vimy"
  },
  {
    "label": "Wandering River",
    "value": "CA/AB/Wandering River"
  },
  {
    "label": "West Baptiste",
    "value": "CA/AB/West Baptiste"
  },
  {
    "label": "Westlock",
    "value": "CA/AB/Westlock"
  },
  {
    "label": "Whispering Hills",
    "value": "CA/AB/Whispering Hills"
  },
  {
    "label": "White Gull",
    "value": "CA/AB/White Gull"
  },
  {
    "label": "Whitecourt",
    "value": "CA/AB/Whitecourt"
  },
  {
    "label": "Bloomsbury",
    "value": "CA/AB/Bloomsbury"
  },
  {
    "label": "Camp Creek",
    "value": "CA/AB/Camp Creek"
  },
  {
    "label": "Gunn",
    "value": "CA/AB/Gunn"
  },
  {
    "label": "Tiger Lily",
    "value": "CA/AB/Tiger Lily"
  },
  {
    "label": "Vega",
    "value": "CA/AB/Vega"
  },
  {
    "label": "Bruce",
    "value": "CA/AB/Bruce"
  },
  {
    "label": "Kingman",
    "value": "CA/AB/Kingman"
  },
  {
    "label": "Kinsella",
    "value": "CA/AB/Kinsella"
  },
  {
    "label": "Ryley",
    "value": "CA/AB/Ryley"
  },
  {
    "label": "Atikameg",
    "value": "CA/AB/Atikameg"
  },
  {
    "label": "Cadotte Lake",
    "value": "CA/AB/Cadotte Lake"
  },
  {
    "label": "Calling Lake",
    "value": "CA/AB/Calling Lake"
  },
  {
    "label": "Chateh",
    "value": "CA/AB/Chateh"
  },
  {
    "label": "Cherry Point",
    "value": "CA/AB/Cherry Point"
  },
  {
    "label": "Chisholm Mills",
    "value": "CA/AB/Chisholm Mills"
  },
  {
    "label": "Cleardale",
    "value": "CA/AB/Cleardale"
  },
  {
    "label": "Deadwood",
    "value": "CA/AB/Deadwood"
  },
  {
    "label": "Dixonville",
    "value": "CA/AB/Dixonville"
  },
  {
    "label": "Driftpile",
    "value": "CA/AB/Driftpile"
  },
  {
    "label": "Enilda",
    "value": "CA/AB/Enilda"
  },
  {
    "label": "Faust",
    "value": "CA/AB/Faust"
  },
  {
    "label": "Fort Vermilion",
    "value": "CA/AB/Fort Vermilion"
  },
  {
    "label": "Fox Lake",
    "value": "CA/AB/Fox Lake"
  },
  {
    "label": "Garden River",
    "value": "CA/AB/Garden River"
  },
  {
    "label": "Gift Lake",
    "value": "CA/AB/Gift Lake"
  },
  {
    "label": "Grouard",
    "value": "CA/AB/Grouard"
  },
  {
    "label": "High Level",
    "value": "CA/AB/High Level"
  },
  {
    "label": "High Prairie",
    "value": "CA/AB/High Prairie"
  },
  {
    "label": "Hines Creek",
    "value": "CA/AB/Hines Creek"
  },
  {
    "label": "John D'or Prairie",
    "value": "CA/AB/John D'or Prairie"
  },
  {
    "label": "Joussard",
    "value": "CA/AB/Joussard"
  },
  {
    "label": "Keg River",
    "value": "CA/AB/Keg River"
  },
  {
    "label": "Kinuso",
    "value": "CA/AB/Kinuso"
  },
  {
    "label": "La Crete",
    "value": "CA/AB/La Crete"
  },
  {
    "label": "Manning",
    "value": "CA/AB/Manning"
  },
  {
    "label": "Meander River",
    "value": "CA/AB/Meander River"
  },
  {
    "label": "Nampa",
    "value": "CA/AB/Nampa"
  },
  {
    "label": "Paddle Prairie",
    "value": "CA/AB/Paddle Prairie"
  },
  {
    "label": "Rainbow Lake",
    "value": "CA/AB/Rainbow Lake"
  },
  {
    "label": "Red Earth Creek",
    "value": "CA/AB/Red Earth Creek"
  },
  {
    "label": "Slave Lake",
    "value": "CA/AB/Slave Lake"
  },
  {
    "label": "Smith",
    "value": "CA/AB/Smith"
  },
  {
    "label": "Sunset House",
    "value": "CA/AB/Sunset House"
  },
  {
    "label": "Swan Hills",
    "value": "CA/AB/Swan Hills"
  },
  {
    "label": "Wabasca",
    "value": "CA/AB/Wabasca"
  },
  {
    "label": "Worsley",
    "value": "CA/AB/Worsley"
  },
  {
    "label": "Cochrane",
    "value": "CA/AB/Cochrane"
  },
  {
    "label": "Dead Man's Flats",
    "value": "CA/AB/Dead Man's Flats"
  },
  {
    "label": "Exshaw",
    "value": "CA/AB/Exshaw"
  },
  {
    "label": "Harvie Heights",
    "value": "CA/AB/Harvie Heights"
  },
  {
    "label": "Lac Des Arcs",
    "value": "CA/AB/Lac Des Arcs"
  },
  {
    "label": "Eaglesham",
    "value": "CA/AB/Eaglesham"
  },
  {
    "label": "Sexsmith",
    "value": "CA/AB/Sexsmith"
  },
  {
    "label": "Tangent",
    "value": "CA/AB/Tangent"
  },
  {
    "label": "Wanham",
    "value": "CA/AB/Wanham"
  },
  {
    "label": "Watino",
    "value": "CA/AB/Watino"
  },
  {
    "label": "Woking",
    "value": "CA/AB/Woking"
  },
  {
    "label": "Ardmore",
    "value": "CA/AB/Ardmore"
  },
  {
    "label": "Bonnyville",
    "value": "CA/AB/Bonnyville"
  },
  {
    "label": "Cherry Grove",
    "value": "CA/AB/Cherry Grove"
  },
  {
    "label": "Cold Lake",
    "value": "CA/AB/Cold Lake"
  },
  {
    "label": "Fort Kent",
    "value": "CA/AB/Fort Kent"
  },
  {
    "label": "Glendon",
    "value": "CA/AB/Glendon"
  },
  {
    "label": "Goodridge",
    "value": "CA/AB/Goodridge"
  },
  {
    "label": "Iron River",
    "value": "CA/AB/Iron River"
  },
  {
    "label": "La Corey",
    "value": "CA/AB/La Corey"
  },
  {
    "label": "Sputinow",
    "value": "CA/AB/Sputinow"
  },
  {
    "label": "Breton",
    "value": "CA/AB/Breton"
  },
  {
    "label": "Buck Creek",
    "value": "CA/AB/Buck Creek"
  },
  {
    "label": "Carnwood",
    "value": "CA/AB/Carnwood"
  },
  {
    "label": "Cynthia",
    "value": "CA/AB/Cynthia"
  },
  {
    "label": "Drayton Valley",
    "value": "CA/AB/Drayton Valley"
  },
  {
    "label": "Lindale",
    "value": "CA/AB/Lindale"
  },
  {
    "label": "Lodgepole",
    "value": "CA/AB/Lodgepole"
  },
  {
    "label": "Rocky Rapids",
    "value": "CA/AB/Rocky Rapids"
  },
  {
    "label": "Brooks",
    "value": "CA/AB/Brooks"
  },
  {
    "label": "Balzac",
    "value": "CA/AB/Balzac"
  },
  {
    "label": "Beiseker",
    "value": "CA/AB/Beiseker"
  },
  {
    "label": "Black Diamond",
    "value": "CA/AB/Black Diamond"
  },
  {
    "label": "Blackie",
    "value": "CA/AB/Blackie"
  },
  {
    "label": "Bragg Creek",
    "value": "CA/AB/Bragg Creek"
  },
  {
    "label": "Calgary",
    "value": "CA/AB/Calgary"
  },
  {
    "label": "Carstairs",
    "value": "CA/AB/Carstairs"
  },
  {
    "label": "Cayley",
    "value": "CA/AB/Cayley"
  },
  {
    "label": "Chestermere",
    "value": "CA/AB/Chestermere"
  },
  {
    "label": "Cremona",
    "value": "CA/AB/Cremona"
  },
  {
    "label": "Didsbury",
    "value": "CA/AB/Didsbury"
  },
  {
    "label": "Eden Valley",
    "value": "CA/AB/Eden Valley"
  },
  {
    "label": "High River",
    "value": "CA/AB/High River"
  },
  {
    "label": "Indus",
    "value": "CA/AB/Indus"
  },
  {
    "label": "Langdon",
    "value": "CA/AB/Langdon"
  },
  {
    "label": "Longview",
    "value": "CA/AB/Longview"
  },
  {
    "label": "Millarville",
    "value": "CA/AB/Millarville"
  },
  {
    "label": "Okotoks",
    "value": "CA/AB/Okotoks"
  },
  {
    "label": "Olds",
    "value": "CA/AB/Olds"
  },
  {
    "label": "Priddis",
    "value": "CA/AB/Priddis"
  },
  {
    "label": "Redwood Meadows",
    "value": "CA/AB/Redwood Meadows"
  },
  {
    "label": "Rocky View",
    "value": "CA/AB/Rocky View"
  },
  {
    "label": "Sundre",
    "value": "CA/AB/Sundre"
  },
  {
    "label": "Tsuu T'ina",
    "value": "CA/AB/Tsuu T'ina"
  },
  {
    "label": "Turner Valley",
    "value": "CA/AB/Turner Valley"
  },
  {
    "label": "Water Valley",
    "value": "CA/AB/Water Valley"
  },
  {
    "label": "Andrew",
    "value": "CA/AB/Andrew"
  },
  {
    "label": "Armena",
    "value": "CA/AB/Armena"
  },
  {
    "label": "Bashaw",
    "value": "CA/AB/Bashaw"
  },
  {
    "label": "Bawlf",
    "value": "CA/AB/Bawlf"
  },
  {
    "label": "Beauvallon",
    "value": "CA/AB/Beauvallon"
  },
  {
    "label": "Bittern Lake",
    "value": "CA/AB/Bittern Lake"
  },
  {
    "label": "Bruderheim",
    "value": "CA/AB/Bruderheim"
  },
  {
    "label": "Camrose",
    "value": "CA/AB/Camrose"
  },
  {
    "label": "Camrose County",
    "value": "CA/AB/Camrose County"
  },
  {
    "label": "Chipman",
    "value": "CA/AB/Chipman"
  },
  {
    "label": "Clandonald",
    "value": "CA/AB/Clandonald"
  },
  {
    "label": "Derwent",
    "value": "CA/AB/Derwent"
  },
  {
    "label": "Dewberry",
    "value": "CA/AB/Dewberry"
  },
  {
    "label": "Donalda",
    "value": "CA/AB/Donalda"
  },
  {
    "label": "Edberg",
    "value": "CA/AB/Edberg"
  },
  {
    "label": "Ferintosh",
    "value": "CA/AB/Ferintosh"
  },
  {
    "label": "Gwynne",
    "value": "CA/AB/Gwynne"
  },
  {
    "label": "Hairy Hill",
    "value": "CA/AB/Hairy Hill"
  },
  {
    "label": "Hay Lakes",
    "value": "CA/AB/Hay Lakes"
  },
  {
    "label": "Holden",
    "value": "CA/AB/Holden"
  },
  {
    "label": "Innisfree",
    "value": "CA/AB/Innisfree"
  },
  {
    "label": "Islay",
    "value": "CA/AB/Islay"
  },
  {
    "label": "Kelsey",
    "value": "CA/AB/Kelsey"
  },
  {
    "label": "Kitscoty",
    "value": "CA/AB/Kitscoty"
  },
  {
    "label": "Lamont",
    "value": "CA/AB/Lamont"
  },
  {
    "label": "Lloydminster",
    "value": "CA/AB/Lloydminster"
  },
  {
    "label": "Mannville",
    "value": "CA/AB/Mannville"
  },
  {
    "label": "Marwayne",
    "value": "CA/AB/Marwayne"
  },
  {
    "label": "Meeting Creek",
    "value": "CA/AB/Meeting Creek"
  },
  {
    "label": "Minburn",
    "value": "CA/AB/Minburn"
  },
  {
    "label": "Myrnam",
    "value": "CA/AB/Myrnam"
  },
  {
    "label": "New Norway",
    "value": "CA/AB/New Norway"
  },
  {
    "label": "New Sarepta",
    "value": "CA/AB/New Sarepta"
  },
  {
    "label": "Ohaton",
    "value": "CA/AB/Ohaton"
  },
  {
    "label": "Paradise Valley",
    "value": "CA/AB/Paradise Valley"
  },
  {
    "label": "Ranfurly",
    "value": "CA/AB/Ranfurly"
  },
  {
    "label": "Rosalind",
    "value": "CA/AB/Rosalind"
  },
  {
    "label": "Round Hill",
    "value": "CA/AB/Round Hill"
  },
  {
    "label": "St Michael",
    "value": "CA/AB/St Michael"
  },
  {
    "label": "Tofield",
    "value": "CA/AB/Tofield"
  },
  {
    "label": "Two Hills",
    "value": "CA/AB/Two Hills"
  },
  {
    "label": "Vegreville",
    "value": "CA/AB/Vegreville"
  },
  {
    "label": "Vermilion",
    "value": "CA/AB/Vermilion"
  },
  {
    "label": "Viking",
    "value": "CA/AB/Viking"
  },
  {
    "label": "Willingdon",
    "value": "CA/AB/Willingdon"
  },
  {
    "label": "Banff",
    "value": "CA/AB/Banff"
  },
  {
    "label": "Bellevue",
    "value": "CA/AB/Bellevue"
  },
  {
    "label": "Blairmore",
    "value": "CA/AB/Blairmore"
  },
  {
    "label": "Canmore",
    "value": "CA/AB/Canmore"
  },
  {
    "label": "Coleman",
    "value": "CA/AB/Coleman"
  },
  {
    "label": "Hillcrest Mines",
    "value": "CA/AB/Hillcrest Mines"
  },
  {
    "label": "Jasper",
    "value": "CA/AB/Jasper"
  },
  {
    "label": "Kananaskis",
    "value": "CA/AB/Kananaskis"
  },
  {
    "label": "Lake Louise",
    "value": "CA/AB/Lake Louise"
  },
  {
    "label": "Morley",
    "value": "CA/AB/Morley"
  },
  {
    "label": "Aetna",
    "value": "CA/AB/Aetna"
  },
  {
    "label": "Cardston",
    "value": "CA/AB/Cardston"
  },
  {
    "label": "Del Bonita",
    "value": "CA/AB/Del Bonita"
  },
  {
    "label": "Glenwood",
    "value": "CA/AB/Glenwood"
  },
  {
    "label": "Hill Spring",
    "value": "CA/AB/Hill Spring"
  },
  {
    "label": "Magrath",
    "value": "CA/AB/Magrath"
  },
  {
    "label": "Mountain View",
    "value": "CA/AB/Mountain View"
  },
  {
    "label": "Spring Coulee",
    "value": "CA/AB/Spring Coulee"
  },
  {
    "label": "Welling",
    "value": "CA/AB/Welling"
  },
  {
    "label": "Bear Canyon",
    "value": "CA/AB/Bear Canyon"
  },
  {
    "label": "Bluesky",
    "value": "CA/AB/Bluesky"
  },
  {
    "label": "Eureka River",
    "value": "CA/AB/Eureka River"
  },
  {
    "label": "Alhambra",
    "value": "CA/AB/Alhambra"
  },
  {
    "label": "Caroline",
    "value": "CA/AB/Caroline"
  },
  {
    "label": "Condor",
    "value": "CA/AB/Condor"
  },
  {
    "label": "James River Bridge",
    "value": "CA/AB/James River Bridge"
  },
  {
    "label": "Leslieville",
    "value": "CA/AB/Leslieville"
  },
  {
    "label": "Nordegg",
    "value": "CA/AB/Nordegg"
  },
  {
    "label": "Rocky Mountain House",
    "value": "CA/AB/Rocky Mountain House"
  },
  {
    "label": "Stauffer",
    "value": "CA/AB/Stauffer"
  },
  {
    "label": "Cyrpress County",
    "value": "CA/AB/Cyrpress County"
  },
  {
    "label": "Dunmore",
    "value": "CA/AB/Dunmore"
  },
  {
    "label": "Elkwater",
    "value": "CA/AB/Elkwater"
  },
  {
    "label": "Hilda",
    "value": "CA/AB/Hilda"
  },
  {
    "label": "Iddesleigh",
    "value": "CA/AB/Iddesleigh"
  },
  {
    "label": "Irvine",
    "value": "CA/AB/Irvine"
  },
  {
    "label": "Merdicine Hat",
    "value": "CA/AB/Merdicine Hat"
  },
  {
    "label": "Onefour",
    "value": "CA/AB/Onefour"
  },
  {
    "label": "Ralston",
    "value": "CA/AB/Ralston"
  },
  {
    "label": "Schuler",
    "value": "CA/AB/Schuler"
  },
  {
    "label": "Serven Persons",
    "value": "CA/AB/Serven Persons"
  },
  {
    "label": "Walsh",
    "value": "CA/AB/Walsh"
  },
  {
    "label": "Acheson",
    "value": "CA/AB/Acheson"
  },
  {
    "label": "Alder Flats",
    "value": "CA/AB/Alder Flats"
  },
  {
    "label": "Ardrossan",
    "value": "CA/AB/Ardrossan"
  },
  {
    "label": "Beaumont",
    "value": "CA/AB/Beaumont"
  },
  {
    "label": "Bon Accord",
    "value": "CA/AB/Bon Accord"
  },
  {
    "label": "Brazeau County",
    "value": "CA/AB/Brazeau County"
  },
  {
    "label": "Calahoo",
    "value": "CA/AB/Calahoo"
  },
  {
    "label": "Calmar",
    "value": "CA/AB/Calmar"
  },
  {
    "label": "Carvel",
    "value": "CA/AB/Carvel"
  },
  {
    "label": "Devon",
    "value": "CA/AB/Devon"
  },
  {
    "label": "Duffield",
    "value": "CA/AB/Duffield"
  },
  {
    "label": "Edmonton",
    "value": "CA/AB/Edmonton"
  },
  {
    "label": "Edmonton International Airport",
    "value": "CA/AB/Edmonton International Airport"
  },
  {
    "label": "Enoch",
    "value": "CA/AB/Enoch"
  },
  {
    "label": "Entwistle",
    "value": "CA/AB/Entwistle"
  },
  {
    "label": "Fallis",
    "value": "CA/AB/Fallis"
  },
  {
    "label": "Fort Saskatchewan",
    "value": "CA/AB/Fort Saskatchewan"
  },
  {
    "label": "Gibbons",
    "value": "CA/AB/Gibbons"
  },
  {
    "label": "Kapasiwin",
    "value": "CA/AB/Kapasiwin"
  },
  {
    "label": "Lancaster Park",
    "value": "CA/AB/Lancaster Park"
  },
  {
    "label": "Leduc",
    "value": "CA/AB/Leduc"
  },
  {
    "label": "Leduc County",
    "value": "CA/AB/Leduc County"
  },
  {
    "label": "Legal",
    "value": "CA/AB/Legal"
  },
  {
    "label": "Ma-Me-O Beach",
    "value": "CA/AB/Ma-Me-O Beach"
  },
  {
    "label": "Maskwacis",
    "value": "CA/AB/Maskwacis"
  },
  {
    "label": "Millet",
    "value": "CA/AB/Millet"
  },
  {
    "label": "Morinville",
    "value": "CA/AB/Morinville"
  },
  {
    "label": "Mulhurst Bay",
    "value": "CA/AB/Mulhurst Bay"
  },
  {
    "label": "Nisku",
    "value": "CA/AB/Nisku"
  },
  {
    "label": "Parkland County",
    "value": "CA/AB/Parkland County"
  },
  {
    "label": "Redwater",
    "value": "CA/AB/Redwater"
  },
  {
    "label": "Rolly View",
    "value": "CA/AB/Rolly View"
  },
  {
    "label": "Seba Beach",
    "value": "CA/AB/Seba Beach"
  },
  {
    "label": "Sherwood Park",
    "value": "CA/AB/Sherwood Park"
  },
  {
    "label": "Spring Lake",
    "value": "CA/AB/Spring Lake"
  },
  {
    "label": "Spruce Grove",
    "value": "CA/AB/Spruce Grove"
  },
  {
    "label": "St Albert",
    "value": "CA/AB/St Albert"
  },
  {
    "label": "Stony Plain",
    "value": "CA/AB/Stony Plain"
  },
  {
    "label": "Sunnybrook",
    "value": "CA/AB/Sunnybrook"
  },
  {
    "label": "Thorsby",
    "value": "CA/AB/Thorsby"
  },
  {
    "label": "Tomahawk",
    "value": "CA/AB/Tomahawk"
  },
  {
    "label": "Wabamun",
    "value": "CA/AB/Wabamun"
  },
  {
    "label": "Warburg",
    "value": "CA/AB/Warburg"
  },
  {
    "label": "Westerose",
    "value": "CA/AB/Westerose"
  },
  {
    "label": "Wetaskiwin",
    "value": "CA/AB/Wetaskiwin"
  },
  {
    "label": "Winfield",
    "value": "CA/AB/Winfield"
  },
  {
    "label": "Whitelaw",
    "value": "CA/AB/Whitelaw"
  },
  {
    "label": "Fairview",
    "value": "CA/AB/Fairview"
  },
  {
    "label": "Castor",
    "value": "CA/AB/Castor"
  },
  {
    "label": "Daysland",
    "value": "CA/AB/Daysland"
  },
  {
    "label": "Forestburg",
    "value": "CA/AB/Forestburg"
  },
  {
    "label": "Galahad",
    "value": "CA/AB/Galahad"
  },
  {
    "label": "Killam",
    "value": "CA/AB/Killam"
  },
  {
    "label": "Lougheed",
    "value": "CA/AB/Lougheed"
  },
  {
    "label": "Sedgewick",
    "value": "CA/AB/Sedgewick"
  },
  {
    "label": "Strome",
    "value": "CA/AB/Strome"
  },
  {
    "label": "Aldersyde",
    "value": "CA/AB/Aldersyde"
  },
  {
    "label": "De Winton",
    "value": "CA/AB/De Winton"
  },
  {
    "label": "Brocket",
    "value": "CA/AB/Brocket"
  },
  {
    "label": "Claresholm",
    "value": "CA/AB/Claresholm"
  },
  {
    "label": "Fort Macleod",
    "value": "CA/AB/Fort Macleod"
  },
  {
    "label": "Granum",
    "value": "CA/AB/Granum"
  },
  {
    "label": "Lundbreck",
    "value": "CA/AB/Lundbreck"
  },
  {
    "label": "Nanton",
    "value": "CA/AB/Nanton"
  },
  {
    "label": "Pincher Creek",
    "value": "CA/AB/Pincher Creek"
  },
  {
    "label": "Stand Off",
    "value": "CA/AB/Stand Off"
  },
  {
    "label": "Stavely",
    "value": "CA/AB/Stavely"
  },
  {
    "label": "Waterton Park",
    "value": "CA/AB/Waterton Park"
  },
  {
    "label": "Chard",
    "value": "CA/AB/Chard"
  },
  {
    "label": "Fort Chipewyan",
    "value": "CA/AB/Fort Chipewyan"
  },
  {
    "label": "Fort Mackay",
    "value": "CA/AB/Fort Mackay"
  },
  {
    "label": "Fort Mcmurray",
    "value": "CA/AB/Fort Mcmurray"
  },
  {
    "label": "High RIver",
    "value": "CA/AB/High RIver"
  },
  {
    "label": "Aden",
    "value": "CA/AB/Aden"
  },
  {
    "label": "Bow Island",
    "value": "CA/AB/Bow Island"
  },
  {
    "label": "Burdett",
    "value": "CA/AB/Burdett"
  },
  {
    "label": "Etzikom",
    "value": "CA/AB/Etzikom"
  },
  {
    "label": "Maleb",
    "value": "CA/AB/Maleb"
  },
  {
    "label": "Manyberries",
    "value": "CA/AB/Manyberries"
  },
  {
    "label": "Orion",
    "value": "CA/AB/Orion"
  },
  {
    "label": "Skiff",
    "value": "CA/AB/Skiff"
  },
  {
    "label": "Beaverlodge",
    "value": "CA/AB/Beaverlodge"
  },
  {
    "label": "Berwyn",
    "value": "CA/AB/Berwyn"
  },
  {
    "label": "Bezanson",
    "value": "CA/AB/Bezanson"
  },
  {
    "label": "Bonanza",
    "value": "CA/AB/Bonanza"
  },
  {
    "label": "Clairmont",
    "value": "CA/AB/Clairmont"
  },
  {
    "label": "County Of Grande Prairie No 1",
    "value": "CA/AB/County Of Grande Prairie No 1"
  },
  {
    "label": "Demmitt",
    "value": "CA/AB/Demmitt"
  },
  {
    "label": "Donnelly",
    "value": "CA/AB/Donnelly"
  },
  {
    "label": "Elmworth",
    "value": "CA/AB/Elmworth"
  },
  {
    "label": "Falher",
    "value": "CA/AB/Falher"
  },
  {
    "label": "Girouxville",
    "value": "CA/AB/Girouxville"
  },
  {
    "label": "Goodfare",
    "value": "CA/AB/Goodfare"
  },
  {
    "label": "Grande Prairie",
    "value": "CA/AB/Grande Prairie"
  },
  {
    "label": "Grimshaw",
    "value": "CA/AB/Grimshaw"
  },
  {
    "label": "Guy",
    "value": "CA/AB/Guy"
  },
  {
    "label": "Hythe",
    "value": "CA/AB/Hythe"
  },
  {
    "label": "La Glace",
    "value": "CA/AB/La Glace"
  },
  {
    "label": "Mclennan",
    "value": "CA/AB/Mclennan"
  },
  {
    "label": "Peace River",
    "value": "CA/AB/Peace River"
  },
  {
    "label": "Rycroft",
    "value": "CA/AB/Rycroft"
  },
  {
    "label": "Spirit River",
    "value": "CA/AB/Spirit River"
  },
  {
    "label": "Valhalla Centre",
    "value": "CA/AB/Valhalla Centre"
  },
  {
    "label": "Wembley",
    "value": "CA/AB/Wembley"
  },
  {
    "label": "Calais",
    "value": "CA/AB/Calais"
  },
  {
    "label": "Crooked Creek",
    "value": "CA/AB/Crooked Creek"
  },
  {
    "label": "Debolt",
    "value": "CA/AB/Debolt"
  },
  {
    "label": "Fox Creek",
    "value": "CA/AB/Fox Creek"
  },
  {
    "label": "Grande Cache",
    "value": "CA/AB/Grande Cache"
  },
  {
    "label": "Grovedale",
    "value": "CA/AB/Grovedale"
  },
  {
    "label": "Little Smoky",
    "value": "CA/AB/Little Smoky"
  },
  {
    "label": "Valleyview",
    "value": "CA/AB/Valleyview"
  },
  {
    "label": "Carbon",
    "value": "CA/AB/Carbon"
  },
  {
    "label": "Drumheller",
    "value": "CA/AB/Drumheller"
  },
  {
    "label": "Elnora",
    "value": "CA/AB/Elnora"
  },
  {
    "label": "Huxley",
    "value": "CA/AB/Huxley"
  },
  {
    "label": "Linden",
    "value": "CA/AB/Linden"
  },
  {
    "label": "Swalwell",
    "value": "CA/AB/Swalwell"
  },
  {
    "label": "Three Hills",
    "value": "CA/AB/Three Hills"
  },
  {
    "label": "Torrington",
    "value": "CA/AB/Torrington"
  },
  {
    "label": "Trochu",
    "value": "CA/AB/Trochu"
  },
  {
    "label": "Wimborne",
    "value": "CA/AB/Wimborne"
  },
  {
    "label": "Cherhill",
    "value": "CA/AB/Cherhill"
  },
  {
    "label": "Lake Isle",
    "value": "CA/AB/Lake Isle"
  },
  {
    "label": "Rochfort Bridge",
    "value": "CA/AB/Rochfort Bridge"
  },
  {
    "label": "Alix",
    "value": "CA/AB/Alix"
  },
  {
    "label": "Clive",
    "value": "CA/AB/Clive"
  },
  {
    "label": "Lacombe",
    "value": "CA/AB/Lacombe"
  },
  {
    "label": "Mirror",
    "value": "CA/AB/Mirror"
  },
  {
    "label": "Rosedale Valley",
    "value": "CA/AB/Rosedale Valley"
  },
  {
    "label": "Sylvan Lake",
    "value": "CA/AB/Sylvan Lake"
  },
  {
    "label": "Hylo",
    "value": "CA/AB/Hylo"
  },
  {
    "label": "Lac La Biche",
    "value": "CA/AB/Lac La Biche"
  },
  {
    "label": "Plamondon",
    "value": "CA/AB/Plamondon"
  },
  {
    "label": "Hilliard",
    "value": "CA/AB/Hilliard"
  },
  {
    "label": "Mundare",
    "value": "CA/AB/Mundare"
  },
  {
    "label": "Star",
    "value": "CA/AB/Star"
  },
  {
    "label": "Wostok",
    "value": "CA/AB/Wostok"
  },
  {
    "label": "Alsike",
    "value": "CA/AB/Alsike"
  },
  {
    "label": "Canyon Creek",
    "value": "CA/AB/Canyon Creek"
  },
  {
    "label": "Flatbush",
    "value": "CA/AB/Flatbush"
  },
  {
    "label": "Hondo",
    "value": "CA/AB/Hondo"
  },
  {
    "label": "Widewater",
    "value": "CA/AB/Widewater"
  },
  {
    "label": "Barnwell",
    "value": "CA/AB/Barnwell"
  },
  {
    "label": "Barons",
    "value": "CA/AB/Barons"
  },
  {
    "label": "Bassano",
    "value": "CA/AB/Bassano"
  },
  {
    "label": "Coaldale",
    "value": "CA/AB/Coaldale"
  },
  {
    "label": "Coalhurst",
    "value": "CA/AB/Coalhurst"
  },
  {
    "label": "Coutts",
    "value": "CA/AB/Coutts"
  },
  {
    "label": "Diamond City",
    "value": "CA/AB/Diamond City"
  },
  {
    "label": "Duchess",
    "value": "CA/AB/Duchess"
  },
  {
    "label": "Iron Springs",
    "value": "CA/AB/Iron Springs"
  },
  {
    "label": "Lake Newell Resort",
    "value": "CA/AB/Lake Newell Resort"
  },
  {
    "label": "Lethbridge",
    "value": "CA/AB/Lethbridge"
  },
  {
    "label": "Milk River",
    "value": "CA/AB/Milk River"
  },
  {
    "label": "Monarch",
    "value": "CA/AB/Monarch"
  },
  {
    "label": "New Dayton",
    "value": "CA/AB/New Dayton"
  },
  {
    "label": "Nobleford",
    "value": "CA/AB/Nobleford"
  },
  {
    "label": "Picture Butte",
    "value": "CA/AB/Picture Butte"
  },
  {
    "label": "Raymond",
    "value": "CA/AB/Raymond"
  },
  {
    "label": "Rolling Hills",
    "value": "CA/AB/Rolling Hills"
  },
  {
    "label": "Rosemary",
    "value": "CA/AB/Rosemary"
  },
  {
    "label": "Shaughnessy",
    "value": "CA/AB/Shaughnessy"
  },
  {
    "label": "Stirling",
    "value": "CA/AB/Stirling"
  },
  {
    "label": "Taber",
    "value": "CA/AB/Taber"
  },
  {
    "label": "Tilley",
    "value": "CA/AB/Tilley"
  },
  {
    "label": "Turin",
    "value": "CA/AB/Turin"
  },
  {
    "label": "Vauxhall",
    "value": "CA/AB/Vauxhall"
  },
  {
    "label": "Warner",
    "value": "CA/AB/Warner"
  },
  {
    "label": "Buffalo Head Prairie",
    "value": "CA/AB/Buffalo Head Prairie"
  },
  {
    "label": "Zama City",
    "value": "CA/AB/Zama City"
  },
  {
    "label": "Cypress County",
    "value": "CA/AB/Cypress County"
  },
  {
    "label": "Desert Blume",
    "value": "CA/AB/Desert Blume"
  },
  {
    "label": "Foremost",
    "value": "CA/AB/Foremost"
  },
  {
    "label": "Medicine Hat",
    "value": "CA/AB/Medicine Hat"
  },
  {
    "label": "Redcliff",
    "value": "CA/AB/Redcliff"
  },
  {
    "label": "Edgerton",
    "value": "CA/AB/Edgerton"
  },
  {
    "label": "Lavoy",
    "value": "CA/AB/Lavoy"
  },
  {
    "label": "Acme",
    "value": "CA/AB/Acme"
  },
  {
    "label": "Gem",
    "value": "CA/AB/Gem"
  },
  {
    "label": "Millicent",
    "value": "CA/AB/Millicent"
  },
  {
    "label": "Patricia",
    "value": "CA/AB/Patricia"
  },
  {
    "label": "Rainier",
    "value": "CA/AB/Rainier"
  },
  {
    "label": "Scandia",
    "value": "CA/AB/Scandia"
  },
  {
    "label": "Carcajou",
    "value": "CA/AB/Carcajou"
  },
  {
    "label": "Hotchkiss",
    "value": "CA/AB/Hotchkiss"
  },
  {
    "label": "North Star",
    "value": "CA/AB/North Star"
  },
  {
    "label": "Notikewin",
    "value": "CA/AB/Notikewin"
  },
  {
    "label": "Marie Reine",
    "value": "CA/AB/Marie Reine"
  },
  {
    "label": "St Isidore",
    "value": "CA/AB/St Isidore"
  },
  {
    "label": "Peerless Lake",
    "value": "CA/AB/Peerless Lake"
  },
  {
    "label": "Trout Lake",
    "value": "CA/AB/Trout Lake"
  },
  {
    "label": "Alliance",
    "value": "CA/AB/Alliance"
  },
  {
    "label": "Brownfield",
    "value": "CA/AB/Brownfield"
  },
  {
    "label": "Coronation",
    "value": "CA/AB/Coronation"
  },
  {
    "label": "Halkirk",
    "value": "CA/AB/Halkirk"
  },
  {
    "label": "Gainford",
    "value": "CA/AB/Gainford"
  },
  {
    "label": "Brownvale",
    "value": "CA/AB/Brownvale"
  },
  {
    "label": "Cowley",
    "value": "CA/AB/Cowley"
  },
  {
    "label": "Twin Butte",
    "value": "CA/AB/Twin Butte"
  },
  {
    "label": "Banshaw",
    "value": "CA/AB/Banshaw"
  },
  {
    "label": "Benntley",
    "value": "CA/AB/Benntley"
  },
  {
    "label": "Manskwacis",
    "value": "CA/AB/Manskwacis"
  },
  {
    "label": "Rinmbey",
    "value": "CA/AB/Rinmbey"
  },
  {
    "label": "Tenes",
    "value": "CA/AB/Tenes"
  },
  {
    "label": "Amisk",
    "value": "CA/AB/Amisk"
  },
  {
    "label": "Bodo",
    "value": "CA/AB/Bodo"
  },
  {
    "label": "Cadogan",
    "value": "CA/AB/Cadogan"
  },
  {
    "label": "Czar",
    "value": "CA/AB/Czar"
  },
  {
    "label": "Hayter",
    "value": "CA/AB/Hayter"
  },
  {
    "label": "Hughenden",
    "value": "CA/AB/Hughenden"
  },
  {
    "label": "Metiskow",
    "value": "CA/AB/Metiskow"
  },
  {
    "label": "Provost",
    "value": "CA/AB/Provost"
  },
  {
    "label": "Benalto",
    "value": "CA/AB/Benalto"
  },
  {
    "label": "Birchcliff",
    "value": "CA/AB/Birchcliff"
  },
  {
    "label": "Blackfalds",
    "value": "CA/AB/Blackfalds"
  },
  {
    "label": "Bluffton",
    "value": "CA/AB/Bluffton"
  },
  {
    "label": "Bowden",
    "value": "CA/AB/Bowden"
  },
  {
    "label": "College Heights",
    "value": "CA/AB/College Heights"
  },
  {
    "label": "Delburne",
    "value": "CA/AB/Delburne"
  },
  {
    "label": "Dickson",
    "value": "CA/AB/Dickson"
  },
  {
    "label": "Eckville",
    "value": "CA/AB/Eckville"
  },
  {
    "label": "Halfmoon Bay",
    "value": "CA/AB/Halfmoon Bay"
  },
  {
    "label": "Innisfail",
    "value": "CA/AB/Innisfail"
  },
  {
    "label": "Jarvis Bay",
    "value": "CA/AB/Jarvis Bay"
  },
  {
    "label": "Lacombe County",
    "value": "CA/AB/Lacombe County"
  },
  {
    "label": "Lousana",
    "value": "CA/AB/Lousana"
  },
  {
    "label": "Markerville",
    "value": "CA/AB/Markerville"
  },
  {
    "label": "Norglenwold",
    "value": "CA/AB/Norglenwold"
  },
  {
    "label": "Penhold",
    "value": "CA/AB/Penhold"
  },
  {
    "label": "Pine Lake",
    "value": "CA/AB/Pine Lake"
  },
  {
    "label": "Ponoka",
    "value": "CA/AB/Ponoka"
  },
  {
    "label": "Red Deer",
    "value": "CA/AB/Red Deer"
  },
  {
    "label": "Red Deer County",
    "value": "CA/AB/Red Deer County"
  },
  {
    "label": "Rimbey",
    "value": "CA/AB/Rimbey"
  },
  {
    "label": "Springbrook",
    "value": "CA/AB/Springbrook"
  },
  {
    "label": "Spruce View",
    "value": "CA/AB/Spruce View"
  },
  {
    "label": "Airdrie",
    "value": "CA/AB/Airdrie"
  },
  {
    "label": "Dalemead",
    "value": "CA/AB/Dalemead"
  },
  {
    "label": "Delacour",
    "value": "CA/AB/Delacour"
  },
  {
    "label": "Irricana",
    "value": "CA/AB/Irricana"
  },
  {
    "label": "Kathyrn",
    "value": "CA/AB/Kathyrn"
  },
  {
    "label": "Keoma",
    "value": "CA/AB/Keoma"
  },
  {
    "label": "Lyalta",
    "value": "CA/AB/Lyalta"
  },
  {
    "label": "Madden",
    "value": "CA/AB/Madden"
  },
  {
    "label": "Bay Tree",
    "value": "CA/AB/Bay Tree"
  },
  {
    "label": "Blueberry Mountain",
    "value": "CA/AB/Blueberry Mountain"
  },
  {
    "label": "Gordondale",
    "value": "CA/AB/Gordondale"
  },
  {
    "label": "Gundy",
    "value": "CA/AB/Gundy"
  },
  {
    "label": "Silver Valley",
    "value": "CA/AB/Silver Valley"
  },
  {
    "label": "Bellis",
    "value": "CA/AB/Bellis"
  },
  {
    "label": "Kikino",
    "value": "CA/AB/Kikino"
  },
  {
    "label": "Lafond",
    "value": "CA/AB/Lafond"
  },
  {
    "label": "Smoky Lake",
    "value": "CA/AB/Smoky Lake"
  },
  {
    "label": "Spedden",
    "value": "CA/AB/Spedden"
  },
  {
    "label": "Vilna",
    "value": "CA/AB/Vilna"
  },
  {
    "label": "Warspite",
    "value": "CA/AB/Warspite"
  },
  {
    "label": "Ashmont",
    "value": "CA/AB/Ashmont"
  },
  {
    "label": "Boyne Lake",
    "value": "CA/AB/Boyne Lake"
  },
  {
    "label": "Elk Point",
    "value": "CA/AB/Elk Point"
  },
  {
    "label": "Foisy",
    "value": "CA/AB/Foisy"
  },
  {
    "label": "Lindbergh",
    "value": "CA/AB/Lindbergh"
  },
  {
    "label": "Mallaig",
    "value": "CA/AB/Mallaig"
  },
  {
    "label": "Mcrae",
    "value": "CA/AB/Mcrae"
  },
  {
    "label": "Saddle Lake",
    "value": "CA/AB/Saddle Lake"
  },
  {
    "label": "St Brides",
    "value": "CA/AB/St Brides"
  },
  {
    "label": "St Lina",
    "value": "CA/AB/St Lina"
  },
  {
    "label": "St Paul",
    "value": "CA/AB/St Paul"
  },
  {
    "label": "St Vincent",
    "value": "CA/AB/St Vincent"
  },
  {
    "label": "Craigmyle",
    "value": "CA/AB/Craigmyle"
  },
  {
    "label": "Delia",
    "value": "CA/AB/Delia"
  },
  {
    "label": "Morrin",
    "value": "CA/AB/Morrin"
  },
  {
    "label": "Munson",
    "value": "CA/AB/Munson"
  },
  {
    "label": "Rowley",
    "value": "CA/AB/Rowley"
  },
  {
    "label": "Rumsey",
    "value": "CA/AB/Rumsey"
  },
  {
    "label": "Big Valley",
    "value": "CA/AB/Big Valley"
  },
  {
    "label": "Botha",
    "value": "CA/AB/Botha"
  },
  {
    "label": "Byemoor",
    "value": "CA/AB/Byemoor"
  },
  {
    "label": "Endiang",
    "value": "CA/AB/Endiang"
  },
  {
    "label": "Erskine",
    "value": "CA/AB/Erskine"
  },
  {
    "label": "Fenn",
    "value": "CA/AB/Fenn"
  },
  {
    "label": "Gadsby",
    "value": "CA/AB/Gadsby"
  },
  {
    "label": "Nevis",
    "value": "CA/AB/Nevis"
  },
  {
    "label": "Red Willow",
    "value": "CA/AB/Red Willow"
  },
  {
    "label": "Stettler",
    "value": "CA/AB/Stettler"
  },
  {
    "label": "Cooking Lake",
    "value": "CA/AB/Cooking Lake"
  },
  {
    "label": "North Cooking Lake",
    "value": "CA/AB/North Cooking Lake"
  },
  {
    "label": "Arrowwood",
    "value": "CA/AB/Arrowwood"
  },
  {
    "label": "Carmangay",
    "value": "CA/AB/Carmangay"
  },
  {
    "label": "Champion",
    "value": "CA/AB/Champion"
  },
  {
    "label": "Cluny",
    "value": "CA/AB/Cluny"
  },
  {
    "label": "East Coulee",
    "value": "CA/AB/East Coulee"
  },
  {
    "label": "Gleichen",
    "value": "CA/AB/Gleichen"
  },
  {
    "label": "Hussar",
    "value": "CA/AB/Hussar"
  },
  {
    "label": "Lomond",
    "value": "CA/AB/Lomond"
  },
  {
    "label": "Rosedale Station",
    "value": "CA/AB/Rosedale Station"
  },
  {
    "label": "Siksika",
    "value": "CA/AB/Siksika"
  },
  {
    "label": "Standard",
    "value": "CA/AB/Standard"
  },
  {
    "label": "Strathmore",
    "value": "CA/AB/Strathmore"
  },
  {
    "label": "Vulcan",
    "value": "CA/AB/Vulcan"
  },
  {
    "label": "Alcomdale",
    "value": "CA/AB/Alcomdale"
  },
  {
    "label": "Namao",
    "value": "CA/AB/Namao"
  },
  {
    "label": "Riviere Qui Barre",
    "value": "CA/AB/Riviere Qui Barre"
  },
  {
    "label": "Cranford",
    "value": "CA/AB/Cranford"
  },
  {
    "label": "Enchant",
    "value": "CA/AB/Enchant"
  },
  {
    "label": "Grassy Lake",
    "value": "CA/AB/Grassy Lake"
  },
  {
    "label": "Hays",
    "value": "CA/AB/Hays"
  },
  {
    "label": "Purple Springs",
    "value": "CA/AB/Purple Springs"
  },
  {
    "label": "Egremont",
    "value": "CA/AB/Egremont"
  },
  {
    "label": "Opal",
    "value": "CA/AB/Opal"
  },
  {
    "label": "Waskatenau",
    "value": "CA/AB/Waskatenau"
  },
  {
    "label": "Brosseau",
    "value": "CA/AB/Brosseau"
  },
  {
    "label": "Musidora",
    "value": "CA/AB/Musidora"
  },
  {
    "label": "Blackfoot",
    "value": "CA/AB/Blackfoot"
  },
  {
    "label": "Heinsburg",
    "value": "CA/AB/Heinsburg"
  },
  {
    "label": "Mclaughlin",
    "value": "CA/AB/Mclaughlin"
  },
  {
    "label": "Rivercourse",
    "value": "CA/AB/Rivercourse"
  },
  {
    "label": "Streamstown",
    "value": "CA/AB/Streamstown"
  },
  {
    "label": "Tulliby Lake",
    "value": "CA/AB/Tulliby Lake"
  },
  {
    "label": "Brant",
    "value": "CA/AB/Brant"
  },
  {
    "label": "Milo",
    "value": "CA/AB/Milo"
  },
  {
    "label": "Mossleigh",
    "value": "CA/AB/Mossleigh"
  },
  {
    "label": "Chauvin",
    "value": "CA/AB/Chauvin"
  },
  {
    "label": "Denwood",
    "value": "CA/AB/Denwood"
  },
  {
    "label": "Hardisty",
    "value": "CA/AB/Hardisty"
  },
  {
    "label": "Heisler",
    "value": "CA/AB/Heisler"
  },
  {
    "label": "Irma",
    "value": "CA/AB/Irma"
  },
  {
    "label": "Rochon Sands",
    "value": "CA/AB/Rochon Sands"
  },
  {
    "label": "Wainwright",
    "value": "CA/AB/Wainwright"
  },
  {
    "label": "Wrentham",
    "value": "CA/AB/Wrentham"
  },
  {
    "label": "Dapp",
    "value": "CA/AB/Dapp"
  },
  {
    "label": "Nestow",
    "value": "CA/AB/Nestow"
  },
  {
    "label": "Tawatinaw",
    "value": "CA/AB/Tawatinaw"
  },
  {
    "label": "Buck Lake",
    "value": "CA/AB/Buck Lake"
  },
  {
    "label": "Falun",
    "value": "CA/AB/Falun"
  },
  {
    "label": "Carseland",
    "value": "CA/AB/Carseland"
  },
  {
    "label": "Dorothy",
    "value": "CA/AB/Dorothy"
  },
  {
    "label": "Rockyford",
    "value": "CA/AB/Rockyford"
  },
  {
    "label": "Rosebud",
    "value": "CA/AB/Rosebud"
  },
  {
    "label": "Parkland",
    "value": "CA/AB/Parkland"
  },
  {
    "label": "Anzac",
    "value": "CA/AB/Anzac"
  },
  {
    "label": "Conklin",
    "value": "CA/AB/Conklin"
  },
  {
    "label": "Fitzgerald",
    "value": "CA/AB/Fitzgerald"
  },
  {
    "label": "Frog Lake",
    "value": "CA/AB/Frog Lake"
  },
  {
    "label": "Goodfish Lake",
    "value": "CA/AB/Goodfish Lake"
  },
  {
    "label": "Kehewin",
    "value": "CA/AB/Kehewin"
  },
  {
    "label": "Blue Ridge",
    "value": "CA/AB/Blue Ridge"
  },
  {
    "label": "Lone Pine",
    "value": "CA/AB/Lone Pine"
  },
  {
    "label": "Peers",
    "value": "CA/AB/Peers"
  },
  {
    "label": "Brule",
    "value": "CA/AB/Brule"
  },
  {
    "label": "Cadomin",
    "value": "CA/AB/Cadomin"
  },
  {
    "label": "Carrot Creek",
    "value": "CA/AB/Carrot Creek"
  },
  {
    "label": "Edson",
    "value": "CA/AB/Edson"
  },
  {
    "label": "Evansburg",
    "value": "CA/AB/Evansburg"
  },
  {
    "label": "Hinton",
    "value": "CA/AB/Hinton"
  },
  {
    "label": "Marlboro",
    "value": "CA/AB/Marlboro"
  },
  {
    "label": "Niton Junction",
    "value": "CA/AB/Niton Junction"
  },
  {
    "label": "Robb",
    "value": "CA/AB/Robb"
  },
  {
    "label": "Wildwood",
    "value": "CA/AB/Wildwood"
  },
  {
    "label": "Yellowhead County",
    "value": "CA/AB/Yellowhead County"
  },
  {
    "label": "Ahousat",
    "value": "CA/BC/Ahousat"
  },
  {
    "label": "Bamfield",
    "value": "CA/BC/Bamfield"
  },
  {
    "label": "Kildonan",
    "value": "CA/BC/Kildonan"
  },
  {
    "label": "Kyuquot",
    "value": "CA/BC/Kyuquot"
  },
  {
    "label": "Port Alberni",
    "value": "CA/BC/Port Alberni"
  },
  {
    "label": "Tofino",
    "value": "CA/BC/Tofino"
  },
  {
    "label": "Ucluelet",
    "value": "CA/BC/Ucluelet"
  },
  {
    "label": "Burns Lake",
    "value": "CA/BC/Burns Lake"
  },
  {
    "label": "Endako",
    "value": "CA/BC/Endako"
  },
  {
    "label": "Fort Fraser",
    "value": "CA/BC/Fort Fraser"
  },
  {
    "label": "Fort St James",
    "value": "CA/BC/Fort St James"
  },
  {
    "label": "Francois Lake",
    "value": "CA/BC/Francois Lake"
  },
  {
    "label": "Fraser Lake",
    "value": "CA/BC/Fraser Lake"
  },
  {
    "label": "Granisle",
    "value": "CA/BC/Granisle"
  },
  {
    "label": "Houston",
    "value": "CA/BC/Houston"
  },
  {
    "label": "Smithers",
    "value": "CA/BC/Smithers"
  },
  {
    "label": "Southbank",
    "value": "CA/BC/Southbank"
  },
  {
    "label": "Takla Landing",
    "value": "CA/BC/Takla Landing"
  },
  {
    "label": "Takysie Lake",
    "value": "CA/BC/Takysie Lake"
  },
  {
    "label": "Telkwa",
    "value": "CA/BC/Telkwa"
  },
  {
    "label": "Topley",
    "value": "CA/BC/Topley"
  },
  {
    "label": "Vanderhoof",
    "value": "CA/BC/Vanderhoof"
  },
  {
    "label": "Brentwood Bay",
    "value": "CA/BC/Brentwood Bay"
  },
  {
    "label": "Colwood",
    "value": "CA/BC/Colwood"
  },
  {
    "label": "Esquimalt ",
    "value": "CA/BC/Esquimalt "
  },
  {
    "label": "Fulford Harbour",
    "value": "CA/BC/Fulford Harbour"
  },
  {
    "label": "Galiano Island",
    "value": "CA/BC/Galiano Island"
  },
  {
    "label": "Ganges",
    "value": "CA/BC/Ganges"
  },
  {
    "label": "Jordan River",
    "value": "CA/BC/Jordan River"
  },
  {
    "label": "Langford",
    "value": "CA/BC/Langford"
  },
  {
    "label": "Mayne Island",
    "value": "CA/BC/Mayne Island"
  },
  {
    "label": "North Saanich",
    "value": "CA/BC/North Saanich"
  },
  {
    "label": "Oak Bay",
    "value": "CA/BC/Oak Bay"
  },
  {
    "label": "Pender Island",
    "value": "CA/BC/Pender Island"
  },
  {
    "label": "Port Renfrew",
    "value": "CA/BC/Port Renfrew"
  },
  {
    "label": "Saanich",
    "value": "CA/BC/Saanich"
  },
  {
    "label": "Saanichton",
    "value": "CA/BC/Saanichton"
  },
  {
    "label": "Saltspring Island",
    "value": "CA/BC/Saltspring Island"
  },
  {
    "label": "Saturna Island",
    "value": "CA/BC/Saturna Island"
  },
  {
    "label": "Shirley",
    "value": "CA/BC/Shirley"
  },
  {
    "label": "Sidney",
    "value": "CA/BC/Sidney"
  },
  {
    "label": "Sooke",
    "value": "CA/BC/Sooke"
  },
  {
    "label": "Victoria",
    "value": "CA/BC/Victoria"
  },
  {
    "label": "View Royal",
    "value": "CA/BC/View Royal"
  },
  {
    "label": "100 Mile House",
    "value": "CA/BC/100 Mile House"
  },
  {
    "label": "108 Mile Ranch",
    "value": "CA/BC/108 Mile Ranch"
  },
  {
    "label": "150 Mile House",
    "value": "CA/BC/150 Mile House"
  },
  {
    "label": "70 Mile House",
    "value": "CA/BC/70 Mile House"
  },
  {
    "label": "Alexis Creek",
    "value": "CA/BC/Alexis Creek"
  },
  {
    "label": "Alkali Lake",
    "value": "CA/BC/Alkali Lake"
  },
  {
    "label": "Anahim Lake",
    "value": "CA/BC/Anahim Lake"
  },
  {
    "label": "Avola",
    "value": "CA/BC/Avola"
  },
  {
    "label": "Barkerville",
    "value": "CA/BC/Barkerville"
  },
  {
    "label": "Big Lake Ranch",
    "value": "CA/BC/Big Lake Ranch"
  },
  {
    "label": "Bridge Lake",
    "value": "CA/BC/Bridge Lake"
  },
  {
    "label": "Buffalo Creek",
    "value": "CA/BC/Buffalo Creek"
  },
  {
    "label": "Canim Lake",
    "value": "CA/BC/Canim Lake"
  },
  {
    "label": "Chilanko Forks",
    "value": "CA/BC/Chilanko Forks"
  },
  {
    "label": "Dog Creek",
    "value": "CA/BC/Dog Creek"
  },
  {
    "label": "Eagle Creek",
    "value": "CA/BC/Eagle Creek"
  },
  {
    "label": "Forest Grove",
    "value": "CA/BC/Forest Grove"
  },
  {
    "label": "Gang Ranch",
    "value": "CA/BC/Gang Ranch"
  },
  {
    "label": "Hanceville",
    "value": "CA/BC/Hanceville"
  },
  {
    "label": "Hixon",
    "value": "CA/BC/Hixon"
  },
  {
    "label": "Horsefly",
    "value": "CA/BC/Horsefly"
  },
  {
    "label": "Lac La Hache",
    "value": "CA/BC/Lac La Hache"
  },
  {
    "label": "Likely",
    "value": "CA/BC/Likely"
  },
  {
    "label": "Lone Butte",
    "value": "CA/BC/Lone Butte"
  },
  {
    "label": "Mcleese Lake",
    "value": "CA/BC/Mcleese Lake"
  },
  {
    "label": "Nemaiah Valley",
    "value": "CA/BC/Nemaiah Valley"
  },
  {
    "label": "Nimpo Lake",
    "value": "CA/BC/Nimpo Lake"
  },
  {
    "label": "Quesnel",
    "value": "CA/BC/Quesnel"
  },
  {
    "label": "Redstone",
    "value": "CA/BC/Redstone"
  },
  {
    "label": "Riske Creek",
    "value": "CA/BC/Riske Creek"
  },
  {
    "label": "Tatla Lake",
    "value": "CA/BC/Tatla Lake"
  },
  {
    "label": "Tatlayoko Lake",
    "value": "CA/BC/Tatlayoko Lake"
  },
  {
    "label": "Wells",
    "value": "CA/BC/Wells"
  },
  {
    "label": "Williams Lake",
    "value": "CA/BC/Williams Lake"
  },
  {
    "label": "Bella Bella",
    "value": "CA/BC/Bella Bella"
  },
  {
    "label": "Bella Coola",
    "value": "CA/BC/Bella Coola"
  },
  {
    "label": "Dawsons Landing",
    "value": "CA/BC/Dawsons Landing"
  },
  {
    "label": "Denny Island",
    "value": "CA/BC/Denny Island"
  },
  {
    "label": "Hagensborg",
    "value": "CA/BC/Hagensborg"
  },
  {
    "label": "Kleena Kleene",
    "value": "CA/BC/Kleena Kleene"
  },
  {
    "label": "Klemtu",
    "value": "CA/BC/Klemtu"
  },
  {
    "label": "Ocean Falls",
    "value": "CA/BC/Ocean Falls"
  },
  {
    "label": "Waglisla",
    "value": "CA/BC/Waglisla"
  },
  {
    "label": "Ainsworth Hot Springs",
    "value": "CA/BC/Ainsworth Hot Springs"
  },
  {
    "label": "Argenta",
    "value": "CA/BC/Argenta"
  },
  {
    "label": "Arrow Creek",
    "value": "CA/BC/Arrow Creek"
  },
  {
    "label": "Balfour",
    "value": "CA/BC/Balfour"
  },
  {
    "label": "Beasley",
    "value": "CA/BC/Beasley"
  },
  {
    "label": "Bonnington",
    "value": "CA/BC/Bonnington"
  },
  {
    "label": "Boswell",
    "value": "CA/BC/Boswell"
  },
  {
    "label": "Burton",
    "value": "CA/BC/Burton"
  },
  {
    "label": "Canyon",
    "value": "CA/BC/Canyon"
  },
  {
    "label": "Castlegar",
    "value": "CA/BC/Castlegar"
  },
  {
    "label": "Crawford Bay",
    "value": "CA/BC/Crawford Bay"
  },
  {
    "label": "Crescent Valley",
    "value": "CA/BC/Crescent Valley"
  },
  {
    "label": "Creston",
    "value": "CA/BC/Creston"
  },
  {
    "label": "Edgewood",
    "value": "CA/BC/Edgewood"
  },
  {
    "label": "Erickson",
    "value": "CA/BC/Erickson"
  },
  {
    "label": "Fauquier",
    "value": "CA/BC/Fauquier"
  },
  {
    "label": "Genelle",
    "value": "CA/BC/Genelle"
  },
  {
    "label": "Gray Creek",
    "value": "CA/BC/Gray Creek"
  },
  {
    "label": "Kaslo",
    "value": "CA/BC/Kaslo"
  },
  {
    "label": "Kingsgate",
    "value": "CA/BC/Kingsgate"
  },
  {
    "label": "Kitchener",
    "value": "CA/BC/Kitchener"
  },
  {
    "label": "Kootenay Bay",
    "value": "CA/BC/Kootenay Bay"
  },
  {
    "label": "Krestova",
    "value": "CA/BC/Krestova"
  },
  {
    "label": "Lister",
    "value": "CA/BC/Lister"
  },
  {
    "label": "Meadow Creek",
    "value": "CA/BC/Meadow Creek"
  },
  {
    "label": "Nakusp",
    "value": "CA/BC/Nakusp"
  },
  {
    "label": "Nelson",
    "value": "CA/BC/Nelson"
  },
  {
    "label": "New Denver",
    "value": "CA/BC/New Denver"
  },
  {
    "label": "Procter",
    "value": "CA/BC/Procter"
  },
  {
    "label": "Riondel",
    "value": "CA/BC/Riondel"
  },
  {
    "label": "Robson",
    "value": "CA/BC/Robson"
  },
  {
    "label": "Ross Spur",
    "value": "CA/BC/Ross Spur"
  },
  {
    "label": "Salmo",
    "value": "CA/BC/Salmo"
  },
  {
    "label": "Sanca",
    "value": "CA/BC/Sanca"
  },
  {
    "label": "Silverton",
    "value": "CA/BC/Silverton"
  },
  {
    "label": "Sirdar",
    "value": "CA/BC/Sirdar"
  },
  {
    "label": "Slocan",
    "value": "CA/BC/Slocan"
  },
  {
    "label": "Slocan Park",
    "value": "CA/BC/Slocan Park"
  },
  {
    "label": "South Slocan",
    "value": "CA/BC/South Slocan"
  },
  {
    "label": "Winlaw",
    "value": "CA/BC/Winlaw"
  },
  {
    "label": "Wynndel",
    "value": "CA/BC/Wynndel"
  },
  {
    "label": "Yahk",
    "value": "CA/BC/Yahk"
  },
  {
    "label": "Ymir",
    "value": "CA/BC/Ymir"
  },
  {
    "label": "Kelowna",
    "value": "CA/BC/Kelowna"
  },
  {
    "label": "Lake Country",
    "value": "CA/BC/Lake Country"
  },
  {
    "label": "Okanagan Centre",
    "value": "CA/BC/Okanagan Centre"
  },
  {
    "label": "Oyama",
    "value": "CA/BC/Oyama"
  },
  {
    "label": "Peachland",
    "value": "CA/BC/Peachland"
  },
  {
    "label": "West Kelowna",
    "value": "CA/BC/West Kelowna"
  },
  {
    "label": "Westbank",
    "value": "CA/BC/Westbank"
  },
  {
    "label": "Winfield",
    "value": "CA/BC/Winfield"
  },
  {
    "label": "Anglemont",
    "value": "CA/BC/Anglemont"
  },
  {
    "label": "Blind Bay",
    "value": "CA/BC/Blind Bay"
  },
  {
    "label": "Brisco",
    "value": "CA/BC/Brisco"
  },
  {
    "label": "Canoe",
    "value": "CA/BC/Canoe"
  },
  {
    "label": "Celista",
    "value": "CA/BC/Celista"
  },
  {
    "label": "Eagle Bay",
    "value": "CA/BC/Eagle Bay"
  },
  {
    "label": "Edgewater",
    "value": "CA/BC/Edgewater"
  },
  {
    "label": "Falkland",
    "value": "CA/BC/Falkland"
  },
  {
    "label": "Field",
    "value": "CA/BC/Field"
  },
  {
    "label": "Golden",
    "value": "CA/BC/Golden"
  },
  {
    "label": "Grindrod",
    "value": "CA/BC/Grindrod"
  },
  {
    "label": "Harrogate",
    "value": "CA/BC/Harrogate"
  },
  {
    "label": "Lee Creek",
    "value": "CA/BC/Lee Creek"
  },
  {
    "label": "Magna Bay",
    "value": "CA/BC/Magna Bay"
  },
  {
    "label": "Malakwa",
    "value": "CA/BC/Malakwa"
  },
  {
    "label": "Mara",
    "value": "CA/BC/Mara"
  },
  {
    "label": "Mica Creek",
    "value": "CA/BC/Mica Creek"
  },
  {
    "label": "Parson",
    "value": "CA/BC/Parson"
  },
  {
    "label": "Revelstoke",
    "value": "CA/BC/Revelstoke"
  },
  {
    "label": "Salmon Arm",
    "value": "CA/BC/Salmon Arm"
  },
  {
    "label": "Scotch Creek",
    "value": "CA/BC/Scotch Creek"
  },
  {
    "label": "Sicamous",
    "value": "CA/BC/Sicamous"
  },
  {
    "label": "Sorrento",
    "value": "CA/BC/Sorrento"
  },
  {
    "label": "St Ives",
    "value": "CA/BC/St Ives"
  },
  {
    "label": "Tappen",
    "value": "CA/BC/Tappen"
  },
  {
    "label": "Black Creek",
    "value": "CA/BC/Black Creek"
  },
  {
    "label": "Comox",
    "value": "CA/BC/Comox"
  },
  {
    "label": "Courtenay",
    "value": "CA/BC/Courtenay"
  },
  {
    "label": "Cumberland",
    "value": "CA/BC/Cumberland"
  },
  {
    "label": "Denman Island",
    "value": "CA/BC/Denman Island"
  },
  {
    "label": "Fanny Bay",
    "value": "CA/BC/Fanny Bay"
  },
  {
    "label": "Hornby Island",
    "value": "CA/BC/Hornby Island"
  },
  {
    "label": "Lazo",
    "value": "CA/BC/Lazo"
  },
  {
    "label": "Merville",
    "value": "CA/BC/Merville"
  },
  {
    "label": "Royston",
    "value": "CA/BC/Royston"
  },
  {
    "label": "Union Bay",
    "value": "CA/BC/Union Bay"
  },
  {
    "label": "Van Anda",
    "value": "CA/BC/Van Anda"
  },
  {
    "label": "Coquitlam",
    "value": "CA/BC/Coquitlam"
  },
  {
    "label": "Chemainus",
    "value": "CA/BC/Chemainus"
  },
  {
    "label": "Cobble Hill",
    "value": "CA/BC/Cobble Hill"
  },
  {
    "label": "Cowichan Bay",
    "value": "CA/BC/Cowichan Bay"
  },
  {
    "label": "Crofton",
    "value": "CA/BC/Crofton"
  },
  {
    "label": "Duncan",
    "value": "CA/BC/Duncan"
  },
  {
    "label": "Dunster",
    "value": "CA/BC/Dunster"
  },
  {
    "label": "Honeymoon Bay",
    "value": "CA/BC/Honeymoon Bay"
  },
  {
    "label": "Koksilah",
    "value": "CA/BC/Koksilah"
  },
  {
    "label": "Ladysmith",
    "value": "CA/BC/Ladysmith"
  },
  {
    "label": "Lake Cowichan",
    "value": "CA/BC/Lake Cowichan"
  },
  {
    "label": "Malahat",
    "value": "CA/BC/Malahat"
  },
  {
    "label": "Mesachie Lake",
    "value": "CA/BC/Mesachie Lake"
  },
  {
    "label": "Mill Bay",
    "value": "CA/BC/Mill Bay"
  },
  {
    "label": "Shawnigan Lake",
    "value": "CA/BC/Shawnigan Lake"
  },
  {
    "label": "Thetis Island",
    "value": "CA/BC/Thetis Island"
  },
  {
    "label": "Westholme",
    "value": "CA/BC/Westholme"
  },
  {
    "label": "Athalmer",
    "value": "CA/BC/Athalmer"
  },
  {
    "label": "Baynes Lake",
    "value": "CA/BC/Baynes Lake"
  },
  {
    "label": "Canal Flats",
    "value": "CA/BC/Canal Flats"
  },
  {
    "label": "Cranbrook",
    "value": "CA/BC/Cranbrook"
  },
  {
    "label": "Destiny Bay",
    "value": "CA/BC/Destiny Bay"
  },
  {
    "label": "Elkford",
    "value": "CA/BC/Elkford"
  },
  {
    "label": "Elko",
    "value": "CA/BC/Elko"
  },
  {
    "label": "Fairmont Hot Springs",
    "value": "CA/BC/Fairmont Hot Springs"
  },
  {
    "label": "Fernie",
    "value": "CA/BC/Fernie"
  },
  {
    "label": "Fort Steele",
    "value": "CA/BC/Fort Steele"
  },
  {
    "label": "Galloway",
    "value": "CA/BC/Galloway"
  },
  {
    "label": "Grasmere",
    "value": "CA/BC/Grasmere"
  },
  {
    "label": "Invermere",
    "value": "CA/BC/Invermere"
  },
  {
    "label": "Jaffray",
    "value": "CA/BC/Jaffray"
  },
  {
    "label": "Kimberley",
    "value": "CA/BC/Kimberley"
  },
  {
    "label": "Koocanusa West",
    "value": "CA/BC/Koocanusa West"
  },
  {
    "label": "Kuskanook",
    "value": "CA/BC/Kuskanook"
  },
  {
    "label": "Marysville",
    "value": "CA/BC/Marysville"
  },
  {
    "label": "Moyie",
    "value": "CA/BC/Moyie"
  },
  {
    "label": "Newgate",
    "value": "CA/BC/Newgate"
  },
  {
    "label": "Panorama",
    "value": "CA/BC/Panorama"
  },
  {
    "label": "Radium Hot Springs",
    "value": "CA/BC/Radium Hot Springs"
  },
  {
    "label": "Skookumchuck",
    "value": "CA/BC/Skookumchuck"
  },
  {
    "label": "Sparwood",
    "value": "CA/BC/Sparwood"
  },
  {
    "label": "Spillimacheen",
    "value": "CA/BC/Spillimacheen"
  },
  {
    "label": "Ta Ta Creek",
    "value": "CA/BC/Ta Ta Creek"
  },
  {
    "label": "Wardner",
    "value": "CA/BC/Wardner"
  },
  {
    "label": "Wasa",
    "value": "CA/BC/Wasa"
  },
  {
    "label": "Windermere",
    "value": "CA/BC/Windermere"
  },
  {
    "label": "Bear Lake",
    "value": "CA/BC/Bear Lake"
  },
  {
    "label": "Crescent Spur",
    "value": "CA/BC/Crescent Spur"
  },
  {
    "label": "Dome Creek",
    "value": "CA/BC/Dome Creek"
  },
  {
    "label": "Germansen Landing",
    "value": "CA/BC/Germansen Landing"
  },
  {
    "label": "Longworth",
    "value": "CA/BC/Longworth"
  },
  {
    "label": "Mackenzie",
    "value": "CA/BC/Mackenzie"
  },
  {
    "label": "Manson Creek",
    "value": "CA/BC/Manson Creek"
  },
  {
    "label": "Mcbride",
    "value": "CA/BC/Mcbride"
  },
  {
    "label": "Mcleod Lake",
    "value": "CA/BC/Mcleod Lake"
  },
  {
    "label": "Penny",
    "value": "CA/BC/Penny"
  },
  {
    "label": "Prince George",
    "value": "CA/BC/Prince George"
  },
  {
    "label": "Sinclair Mills",
    "value": "CA/BC/Sinclair Mills"
  },
  {
    "label": "Summit Lake",
    "value": "CA/BC/Summit Lake"
  },
  {
    "label": "Upper Fraser",
    "value": "CA/BC/Upper Fraser"
  },
  {
    "label": "Valemount",
    "value": "CA/BC/Valemount"
  },
  {
    "label": "Willow River",
    "value": "CA/BC/Willow River"
  },
  {
    "label": "Abbotsford",
    "value": "CA/BC/Abbotsford"
  },
  {
    "label": "Agassiz",
    "value": "CA/BC/Agassiz"
  },
  {
    "label": "Boston Bar",
    "value": "CA/BC/Boston Bar"
  },
  {
    "label": "Chilliwack",
    "value": "CA/BC/Chilliwack"
  },
  {
    "label": "Cultus Lake",
    "value": "CA/BC/Cultus Lake"
  },
  {
    "label": "Deroche",
    "value": "CA/BC/Deroche"
  },
  {
    "label": "Dewdney",
    "value": "CA/BC/Dewdney"
  },
  {
    "label": "Harrison Hot Springs",
    "value": "CA/BC/Harrison Hot Springs"
  },
  {
    "label": "Harrison Mills",
    "value": "CA/BC/Harrison Mills"
  },
  {
    "label": "Hope",
    "value": "CA/BC/Hope"
  },
  {
    "label": "Lake Errock",
    "value": "CA/BC/Lake Errock"
  },
  {
    "label": "Lindell Beach",
    "value": "CA/BC/Lindell Beach"
  },
  {
    "label": "Mission",
    "value": "CA/BC/Mission"
  },
  {
    "label": "North Bend",
    "value": "CA/BC/North Bend"
  },
  {
    "label": "Rosedale",
    "value": "CA/BC/Rosedale"
  },
  {
    "label": "Spuzzum",
    "value": "CA/BC/Spuzzum"
  },
  {
    "label": "Yale",
    "value": "CA/BC/Yale"
  },
  {
    "label": "Aiyansh",
    "value": "CA/BC/Aiyansh"
  },
  {
    "label": "Cedarvale",
    "value": "CA/BC/Cedarvale"
  },
  {
    "label": "Dease Lake",
    "value": "CA/BC/Dease Lake"
  },
  {
    "label": "Gitanmaax",
    "value": "CA/BC/Gitanmaax"
  },
  {
    "label": "Haisla",
    "value": "CA/BC/Haisla"
  },
  {
    "label": "Hartley Bay",
    "value": "CA/BC/Hartley Bay"
  },
  {
    "label": "Hazelton",
    "value": "CA/BC/Hazelton"
  },
  {
    "label": "Iskut",
    "value": "CA/BC/Iskut"
  },
  {
    "label": "Jade City",
    "value": "CA/BC/Jade City"
  },
  {
    "label": "Kispiox",
    "value": "CA/BC/Kispiox"
  },
  {
    "label": "Kitamaat Village",
    "value": "CA/BC/Kitamaat Village"
  },
  {
    "label": "Kitimat",
    "value": "CA/BC/Kitimat"
  },
  {
    "label": "Kitwanga",
    "value": "CA/BC/Kitwanga"
  },
  {
    "label": "Meziadin Lake",
    "value": "CA/BC/Meziadin Lake"
  },
  {
    "label": "Moricetown",
    "value": "CA/BC/Moricetown"
  },
  {
    "label": "Nass Camp",
    "value": "CA/BC/Nass Camp"
  },
  {
    "label": "New Aiyansh",
    "value": "CA/BC/New Aiyansh"
  },
  {
    "label": "New Hazelton",
    "value": "CA/BC/New Hazelton"
  },
  {
    "label": "Rosswood",
    "value": "CA/BC/Rosswood"
  },
  {
    "label": "Sik-E-Dakh",
    "value": "CA/BC/Sik-E-Dakh"
  },
  {
    "label": "South Hazelton",
    "value": "CA/BC/South Hazelton"
  },
  {
    "label": "Stewart",
    "value": "CA/BC/Stewart"
  },
  {
    "label": "Telegraph Creek",
    "value": "CA/BC/Telegraph Creek"
  },
  {
    "label": "Terrace",
    "value": "CA/BC/Terrace"
  },
  {
    "label": "Thornhill",
    "value": "CA/BC/Thornhill"
  },
  {
    "label": "Beaverdell",
    "value": "CA/BC/Beaverdell"
  },
  {
    "label": "Christina Lake",
    "value": "CA/BC/Christina Lake"
  },
  {
    "label": "Fruitvale",
    "value": "CA/BC/Fruitvale"
  },
  {
    "label": "Grand Forks",
    "value": "CA/BC/Grand Forks"
  },
  {
    "label": "Greenwood",
    "value": "CA/BC/Greenwood"
  },
  {
    "label": "Midway",
    "value": "CA/BC/Midway"
  },
  {
    "label": "Montrose",
    "value": "CA/BC/Montrose"
  },
  {
    "label": "Rock Creek",
    "value": "CA/BC/Rock Creek"
  },
  {
    "label": "Rossland",
    "value": "CA/BC/Rossland"
  },
  {
    "label": "Trail",
    "value": "CA/BC/Trail"
  },
  {
    "label": "Westbridge",
    "value": "CA/BC/Westbridge"
  },
  {
    "label": "Aldergrove",
    "value": "CA/BC/Aldergrove"
  },
  {
    "label": "Anmore",
    "value": "CA/BC/Anmore"
  },
  {
    "label": "Belcarra",
    "value": "CA/BC/Belcarra"
  },
  {
    "label": "Bowen Island",
    "value": "CA/BC/Bowen Island"
  },
  {
    "label": "Burnaby",
    "value": "CA/BC/Burnaby"
  },
  {
    "label": "Delta",
    "value": "CA/BC/Delta"
  },
  {
    "label": "Gold Creek",
    "value": "CA/BC/Gold Creek"
  },
  {
    "label": "Langley",
    "value": "CA/BC/Langley"
  },
  {
    "label": "Lions Bay",
    "value": "CA/BC/Lions Bay"
  },
  {
    "label": "Maple Ridge",
    "value": "CA/BC/Maple Ridge"
  },
  {
    "label": "Milner",
    "value": "CA/BC/Milner"
  },
  {
    "label": "New Westminster",
    "value": "CA/BC/New Westminster"
  },
  {
    "label": "North Vancouver",
    "value": "CA/BC/North Vancouver"
  },
  {
    "label": "Pitt Meadows",
    "value": "CA/BC/Pitt Meadows"
  },
  {
    "label": "Port Coquitlam",
    "value": "CA/BC/Port Coquitlam"
  },
  {
    "label": "Port Moody",
    "value": "CA/BC/Port Moody"
  },
  {
    "label": "Richmond",
    "value": "CA/BC/Richmond"
  },
  {
    "label": "Surrey",
    "value": "CA/BC/Surrey"
  },
  {
    "label": "Vancouver",
    "value": "CA/BC/Vancouver"
  },
  {
    "label": "West Vancouver",
    "value": "CA/BC/West Vancouver"
  },
  {
    "label": "White Rock",
    "value": "CA/BC/White Rock"
  },
  {
    "label": "Alert Bay",
    "value": "CA/BC/Alert Bay"
  },
  {
    "label": "Coal Harbour",
    "value": "CA/BC/Coal Harbour"
  },
  {
    "label": "Holberg",
    "value": "CA/BC/Holberg"
  },
  {
    "label": "Kingcome Inlet",
    "value": "CA/BC/Kingcome Inlet"
  },
  {
    "label": "Minstrel Island",
    "value": "CA/BC/Minstrel Island"
  },
  {
    "label": "Port Alice",
    "value": "CA/BC/Port Alice"
  },
  {
    "label": "Port Hardy",
    "value": "CA/BC/Port Hardy"
  },
  {
    "label": "Port Mcneill",
    "value": "CA/BC/Port Mcneill"
  },
  {
    "label": "Quatsino",
    "value": "CA/BC/Quatsino"
  },
  {
    "label": "Simoom Sound",
    "value": "CA/BC/Simoom Sound"
  },
  {
    "label": "Sointula",
    "value": "CA/BC/Sointula"
  },
  {
    "label": "Sullivan Bay",
    "value": "CA/BC/Sullivan Bay"
  },
  {
    "label": "Telegraph Cove",
    "value": "CA/BC/Telegraph Cove"
  },
  {
    "label": "Winter Harbour",
    "value": "CA/BC/Winter Harbour"
  },
  {
    "label": "Woss",
    "value": "CA/BC/Woss"
  },
  {
    "label": "Bowser",
    "value": "CA/BC/Bowser"
  },
  {
    "label": "Cassidy",
    "value": "CA/BC/Cassidy"
  },
  {
    "label": "Coombs",
    "value": "CA/BC/Coombs"
  },
  {
    "label": "Errington",
    "value": "CA/BC/Errington"
  },
  {
    "label": "Gabriola Island",
    "value": "CA/BC/Gabriola Island"
  },
  {
    "label": "Lantzville",
    "value": "CA/BC/Lantzville"
  },
  {
    "label": "Nanaimo",
    "value": "CA/BC/Nanaimo"
  },
  {
    "label": "Nanoose Bay",
    "value": "CA/BC/Nanoose Bay"
  },
  {
    "label": "Parksville",
    "value": "CA/BC/Parksville"
  },
  {
    "label": "Qualicum",
    "value": "CA/BC/Qualicum"
  },
  {
    "label": "North Cowichan",
    "value": "CA/BC/North Cowichan"
  },
  {
    "label": "Armstrong",
    "value": "CA/BC/Armstrong"
  },
  {
    "label": "Coldstream",
    "value": "CA/BC/Coldstream"
  },
  {
    "label": "Enderby",
    "value": "CA/BC/Enderby"
  },
  {
    "label": "Lavington",
    "value": "CA/BC/Lavington"
  },
  {
    "label": "Lumby",
    "value": "CA/BC/Lumby"
  },
  {
    "label": "Vernon",
    "value": "CA/BC/Vernon"
  },
  {
    "label": "Fort Nelson",
    "value": "CA/BC/Fort Nelson"
  },
  {
    "label": "Muncho Lake",
    "value": "CA/BC/Muncho Lake"
  },
  {
    "label": "Prophet River",
    "value": "CA/BC/Prophet River"
  },
  {
    "label": "Toad River",
    "value": "CA/BC/Toad River"
  },
  {
    "label": "Bridesville",
    "value": "CA/BC/Bridesville"
  },
  {
    "label": "Cawston",
    "value": "CA/BC/Cawston"
  },
  {
    "label": "Cherryville",
    "value": "CA/BC/Cherryville"
  },
  {
    "label": "Coalmont",
    "value": "CA/BC/Coalmont"
  },
  {
    "label": "Hedley",
    "value": "CA/BC/Hedley"
  },
  {
    "label": "Kaleden",
    "value": "CA/BC/Kaleden"
  },
  {
    "label": "Keremeos",
    "value": "CA/BC/Keremeos"
  },
  {
    "label": "Manning Park",
    "value": "CA/BC/Manning Park"
  },
  {
    "label": "Naramata",
    "value": "CA/BC/Naramata"
  },
  {
    "label": "Okanagan Falls",
    "value": "CA/BC/Okanagan Falls"
  },
  {
    "label": "Oliver",
    "value": "CA/BC/Oliver"
  },
  {
    "label": "Osoyoos",
    "value": "CA/BC/Osoyoos"
  },
  {
    "label": "Penticton",
    "value": "CA/BC/Penticton"
  },
  {
    "label": "Princeton",
    "value": "CA/BC/Princeton"
  },
  {
    "label": "Summerland",
    "value": "CA/BC/Summerland"
  },
  {
    "label": "Tulameen",
    "value": "CA/BC/Tulameen"
  },
  {
    "label": "Altona",
    "value": "CA/BC/Altona"
  },
  {
    "label": "Arras",
    "value": "CA/BC/Arras"
  },
  {
    "label": "Baldonnel",
    "value": "CA/BC/Baldonnel"
  },
  {
    "label": "Buick",
    "value": "CA/BC/Buick"
  },
  {
    "label": "Cecil Lake",
    "value": "CA/BC/Cecil Lake"
  },
  {
    "label": "Charlie Lake",
    "value": "CA/BC/Charlie Lake"
  },
  {
    "label": "Chetwynd",
    "value": "CA/BC/Chetwynd"
  },
  {
    "label": "Clayhurst",
    "value": "CA/BC/Clayhurst"
  },
  {
    "label": "Dawson Creek",
    "value": "CA/BC/Dawson Creek"
  },
  {
    "label": "Farmington",
    "value": "CA/BC/Farmington"
  },
  {
    "label": "Fort St John",
    "value": "CA/BC/Fort St John"
  },
  {
    "label": "Goodlow",
    "value": "CA/BC/Goodlow"
  },
  {
    "label": "Groundbirch",
    "value": "CA/BC/Groundbirch"
  },
  {
    "label": "Hudsons Hope",
    "value": "CA/BC/Hudsons Hope"
  },
  {
    "label": "Moberly Lake",
    "value": "CA/BC/Moberly Lake"
  },
  {
    "label": "Montney",
    "value": "CA/BC/Montney"
  },
  {
    "label": "North Pine",
    "value": "CA/BC/North Pine"
  },
  {
    "label": "Peace River Regional District",
    "value": "CA/BC/Peace River Regional District"
  },
  {
    "label": "Pink Mountain",
    "value": "CA/BC/Pink Mountain"
  },
  {
    "label": "Pouce Coupe",
    "value": "CA/BC/Pouce Coupe"
  },
  {
    "label": "Prespatou",
    "value": "CA/BC/Prespatou"
  },
  {
    "label": "Progress",
    "value": "CA/BC/Progress"
  },
  {
    "label": "Rolla",
    "value": "CA/BC/Rolla"
  },
  {
    "label": "Rose Prairie",
    "value": "CA/BC/Rose Prairie"
  },
  {
    "label": "Sunset Prairie",
    "value": "CA/BC/Sunset Prairie"
  },
  {
    "label": "Taylor",
    "value": "CA/BC/Taylor"
  },
  {
    "label": "Tomslake",
    "value": "CA/BC/Tomslake"
  },
  {
    "label": "Tsay Keh Dene",
    "value": "CA/BC/Tsay Keh Dene"
  },
  {
    "label": "Tumbler Ridge",
    "value": "CA/BC/Tumbler Ridge"
  },
  {
    "label": "Ware",
    "value": "CA/BC/Ware"
  },
  {
    "label": "Wonowon",
    "value": "CA/BC/Wonowon"
  },
  {
    "label": "Blubber Bay",
    "value": "CA/BC/Blubber Bay"
  },
  {
    "label": "Gillies Bay",
    "value": "CA/BC/Gillies Bay"
  },
  {
    "label": "Lasqueti Island",
    "value": "CA/BC/Lasqueti Island"
  },
  {
    "label": "Lund",
    "value": "CA/BC/Lund"
  },
  {
    "label": "Powell River",
    "value": "CA/BC/Powell River"
  },
  {
    "label": "Savary Island",
    "value": "CA/BC/Savary Island"
  },
  {
    "label": "Texada Island",
    "value": "CA/BC/Texada Island"
  },
  {
    "label": "Daajing Giids",
    "value": "CA/BC/Daajing Giids"
  },
  {
    "label": "Gitwinksihlkw",
    "value": "CA/BC/Gitwinksihlkw"
  },
  {
    "label": "Greenville",
    "value": "CA/BC/Greenville"
  },
  {
    "label": "Juskatla",
    "value": "CA/BC/Juskatla"
  },
  {
    "label": "Kincolith",
    "value": "CA/BC/Kincolith"
  },
  {
    "label": "Kitkatla",
    "value": "CA/BC/Kitkatla"
  },
  {
    "label": "Lax Kw'alaams",
    "value": "CA/BC/Lax Kw'alaams"
  },
  {
    "label": "Masset",
    "value": "CA/BC/Masset"
  },
  {
    "label": "Oona River",
    "value": "CA/BC/Oona River"
  },
  {
    "label": "Port Clements",
    "value": "CA/BC/Port Clements"
  },
  {
    "label": "Port Edward",
    "value": "CA/BC/Port Edward"
  },
  {
    "label": "Prince Rupert",
    "value": "CA/BC/Prince Rupert"
  },
  {
    "label": "Sandspit",
    "value": "CA/BC/Sandspit"
  },
  {
    "label": "Skidegate",
    "value": "CA/BC/Skidegate"
  },
  {
    "label": "Tlell",
    "value": "CA/BC/Tlell"
  },
  {
    "label": "Brackendale",
    "value": "CA/BC/Brackendale"
  },
  {
    "label": "Britannia Beach",
    "value": "CA/BC/Britannia Beach"
  },
  {
    "label": "D'arcy",
    "value": "CA/BC/D'arcy"
  },
  {
    "label": "Furry Creek",
    "value": "CA/BC/Furry Creek"
  },
  {
    "label": "Garibaldi Highlands",
    "value": "CA/BC/Garibaldi Highlands"
  },
  {
    "label": "Gold Bridge",
    "value": "CA/BC/Gold Bridge"
  },
  {
    "label": "Lillooet",
    "value": "CA/BC/Lillooet"
  },
  {
    "label": "Mount Currie",
    "value": "CA/BC/Mount Currie"
  },
  {
    "label": "Pavilion",
    "value": "CA/BC/Pavilion"
  },
  {
    "label": "Pemberton",
    "value": "CA/BC/Pemberton"
  },
  {
    "label": "Seton Portage",
    "value": "CA/BC/Seton Portage"
  },
  {
    "label": "Shalalth",
    "value": "CA/BC/Shalalth"
  },
  {
    "label": "Squamish",
    "value": "CA/BC/Squamish"
  },
  {
    "label": "Whistler",
    "value": "CA/BC/Whistler"
  },
  {
    "label": "Atlin",
    "value": "CA/BC/Atlin"
  },
  {
    "label": "Good Hope Lake",
    "value": "CA/BC/Good Hope Lake"
  },
  {
    "label": "Lower Post",
    "value": "CA/BC/Lower Post"
  },
  {
    "label": "Blind Channel",
    "value": "CA/BC/Blind Channel"
  },
  {
    "label": "Campbell River",
    "value": "CA/BC/Campbell River"
  },
  {
    "label": "Gold River",
    "value": "CA/BC/Gold River"
  },
  {
    "label": "Heriot Bay",
    "value": "CA/BC/Heriot Bay"
  },
  {
    "label": "Mansons Landing",
    "value": "CA/BC/Mansons Landing"
  },
  {
    "label": "Port Neville",
    "value": "CA/BC/Port Neville"
  },
  {
    "label": "Quadra Island",
    "value": "CA/BC/Quadra Island"
  },
  {
    "label": "Quathiaski Cove",
    "value": "CA/BC/Quathiaski Cove"
  },
  {
    "label": "Refuge Cove",
    "value": "CA/BC/Refuge Cove"
  },
  {
    "label": "Sayward",
    "value": "CA/BC/Sayward"
  },
  {
    "label": "Squirrel Cove",
    "value": "CA/BC/Squirrel Cove"
  },
  {
    "label": "Stuart Island",
    "value": "CA/BC/Stuart Island"
  },
  {
    "label": "Surge Narrows",
    "value": "CA/BC/Surge Narrows"
  },
  {
    "label": "Tahsis",
    "value": "CA/BC/Tahsis"
  },
  {
    "label": "Whaletown",
    "value": "CA/BC/Whaletown"
  },
  {
    "label": "Zeballos",
    "value": "CA/BC/Zeballos"
  },
  {
    "label": "Egmont",
    "value": "CA/BC/Egmont"
  },
  {
    "label": "Gambier Island",
    "value": "CA/BC/Gambier Island"
  },
  {
    "label": "Garden Bay",
    "value": "CA/BC/Garden Bay"
  },
  {
    "label": "Gibsons",
    "value": "CA/BC/Gibsons"
  },
  {
    "label": "Granthams Landing",
    "value": "CA/BC/Granthams Landing"
  },
  {
    "label": "Halfmoon Bay",
    "value": "CA/BC/Halfmoon Bay"
  },
  {
    "label": "Madeira Park",
    "value": "CA/BC/Madeira Park"
  },
  {
    "label": "Port Mellon",
    "value": "CA/BC/Port Mellon"
  },
  {
    "label": "Roberts Creek",
    "value": "CA/BC/Roberts Creek"
  },
  {
    "label": "Sechelt",
    "value": "CA/BC/Sechelt"
  },
  {
    "label": "Ashcroft",
    "value": "CA/BC/Ashcroft"
  },
  {
    "label": "Barriere",
    "value": "CA/BC/Barriere"
  },
  {
    "label": "Blue River",
    "value": "CA/BC/Blue River"
  },
  {
    "label": "Cache Creek",
    "value": "CA/BC/Cache Creek"
  },
  {
    "label": "Chase",
    "value": "CA/BC/Chase"
  },
  {
    "label": "Clearwater",
    "value": "CA/BC/Clearwater"
  },
  {
    "label": "Clinton",
    "value": "CA/BC/Clinton"
  },
  {
    "label": "Darfield",
    "value": "CA/BC/Darfield"
  },
  {
    "label": "Douglas Lake",
    "value": "CA/BC/Douglas Lake"
  },
  {
    "label": "Heffley Creek",
    "value": "CA/BC/Heffley Creek"
  },
  {
    "label": "Kamloops",
    "value": "CA/BC/Kamloops"
  },
  {
    "label": "Knutsford",
    "value": "CA/BC/Knutsford"
  },
  {
    "label": "Little Fort",
    "value": "CA/BC/Little Fort"
  },
  {
    "label": "Logan Lake",
    "value": "CA/BC/Logan Lake"
  },
  {
    "label": "Louis Creek",
    "value": "CA/BC/Louis Creek"
  },
  {
    "label": "Lower Nicola",
    "value": "CA/BC/Lower Nicola"
  },
  {
    "label": "Lytton",
    "value": "CA/BC/Lytton"
  },
  {
    "label": "Mclure",
    "value": "CA/BC/Mclure"
  },
  {
    "label": "Merritt",
    "value": "CA/BC/Merritt"
  },
  {
    "label": "Monte Creek",
    "value": "CA/BC/Monte Creek"
  },
  {
    "label": "Monte Lake",
    "value": "CA/BC/Monte Lake"
  },
  {
    "label": "Pinantan Lake",
    "value": "CA/BC/Pinantan Lake"
  },
  {
    "label": "Pritchard",
    "value": "CA/BC/Pritchard"
  },
  {
    "label": "Quilchena",
    "value": "CA/BC/Quilchena"
  },
  {
    "label": "Savona",
    "value": "CA/BC/Savona"
  },
  {
    "label": "Spences Bridge",
    "value": "CA/BC/Spences Bridge"
  },
  {
    "label": "Sun Peaks",
    "value": "CA/BC/Sun Peaks"
  },
  {
    "label": "Tobiano",
    "value": "CA/BC/Tobiano"
  },
  {
    "label": "Vavenby",
    "value": "CA/BC/Vavenby"
  },
  {
    "label": "Walhachin",
    "value": "CA/BC/Walhachin"
  },
  {
    "label": "Westwold",
    "value": "CA/BC/Westwold"
  },
  {
    "label": "Altona",
    "value": "CA/MB/Altona"
  },
  {
    "label": "Arborg",
    "value": "CA/MB/Arborg"
  },
  {
    "label": "Anola",
    "value": "CA/MB/Anola"
  },
  {
    "label": "Beausejour",
    "value": "CA/MB/Beausejour"
  },
  {
    "label": "Dugald",
    "value": "CA/MB/Dugald"
  },
  {
    "label": "Garson",
    "value": "CA/MB/Garson"
  },
  {
    "label": "Oakbank",
    "value": "CA/MB/Oakbank"
  },
  {
    "label": "Springfield",
    "value": "CA/MB/Springfield"
  },
  {
    "label": "West Pine Ridge",
    "value": "CA/MB/West Pine Ridge"
  },
  {
    "label": "Morweena",
    "value": "CA/MB/Morweena"
  },
  {
    "label": "Okno",
    "value": "CA/MB/Okno"
  },
  {
    "label": "Riverton",
    "value": "CA/MB/Riverton"
  },
  {
    "label": "Vidir",
    "value": "CA/MB/Vidir"
  },
  {
    "label": "Alexander",
    "value": "CA/MB/Alexander"
  },
  {
    "label": "Brandon",
    "value": "CA/MB/Brandon"
  },
  {
    "label": "Brookdale",
    "value": "CA/MB/Brookdale"
  },
  {
    "label": "Carberry",
    "value": "CA/MB/Carberry"
  },
  {
    "label": "Carroll",
    "value": "CA/MB/Carroll"
  },
  {
    "label": "Glenboro",
    "value": "CA/MB/Glenboro"
  },
  {
    "label": "Rivers",
    "value": "CA/MB/Rivers"
  },
  {
    "label": "Shilo",
    "value": "CA/MB/Shilo"
  },
  {
    "label": "Souris",
    "value": "CA/MB/Souris"
  },
  {
    "label": "Wawanesa",
    "value": "CA/MB/Wawanesa"
  },
  {
    "label": "Goodlands",
    "value": "CA/MB/Goodlands"
  },
  {
    "label": "Medora",
    "value": "CA/MB/Medora"
  },
  {
    "label": "Napinka",
    "value": "CA/MB/Napinka"
  },
  {
    "label": "Waskada",
    "value": "CA/MB/Waskada"
  },
  {
    "label": "Carman",
    "value": "CA/MB/Carman"
  },
  {
    "label": "Cartwright",
    "value": "CA/MB/Cartwright"
  },
  {
    "label": "Mather",
    "value": "CA/MB/Mather"
  },
  {
    "label": "Arden",
    "value": "CA/MB/Arden"
  },
  {
    "label": "Austin",
    "value": "CA/MB/Austin"
  },
  {
    "label": "Gladstone",
    "value": "CA/MB/Gladstone"
  },
  {
    "label": "Glenella",
    "value": "CA/MB/Glenella"
  },
  {
    "label": "Holland",
    "value": "CA/MB/Holland"
  },
  {
    "label": "Langruth",
    "value": "CA/MB/Langruth"
  },
  {
    "label": "Macgregor",
    "value": "CA/MB/Macgregor"
  },
  {
    "label": "Rathwell",
    "value": "CA/MB/Rathwell"
  },
  {
    "label": "Treherne",
    "value": "CA/MB/Treherne"
  },
  {
    "label": "Westbourne",
    "value": "CA/MB/Westbourne"
  },
  {
    "label": "Alonsa",
    "value": "CA/MB/Alonsa"
  },
  {
    "label": "Amaranth",
    "value": "CA/MB/Amaranth"
  },
  {
    "label": "Bagot",
    "value": "CA/MB/Bagot"
  },
  {
    "label": "Cypress River",
    "value": "CA/MB/Cypress River"
  },
  {
    "label": "Dacotah",
    "value": "CA/MB/Dacotah"
  },
  {
    "label": "Dakota Tipi",
    "value": "CA/MB/Dakota Tipi"
  },
  {
    "label": "Eddystone",
    "value": "CA/MB/Eddystone"
  },
  {
    "label": "Edwin",
    "value": "CA/MB/Edwin"
  },
  {
    "label": "Elie",
    "value": "CA/MB/Elie"
  },
  {
    "label": "High Bluff",
    "value": "CA/MB/High Bluff"
  },
  {
    "label": "Kinosota",
    "value": "CA/MB/Kinosota"
  },
  {
    "label": "Lakeland",
    "value": "CA/MB/Lakeland"
  },
  {
    "label": "Lavenham",
    "value": "CA/MB/Lavenham"
  },
  {
    "label": "Macdonald",
    "value": "CA/MB/Macdonald"
  },
  {
    "label": "Marius",
    "value": "CA/MB/Marius"
  },
  {
    "label": "Newton Siding",
    "value": "CA/MB/Newton Siding"
  },
  {
    "label": "Notre Dame De Lourdes",
    "value": "CA/MB/Notre Dame De Lourdes"
  },
  {
    "label": "Oakville",
    "value": "CA/MB/Oakville"
  },
  {
    "label": "Plumas",
    "value": "CA/MB/Plumas"
  },
  {
    "label": "Poplar Point",
    "value": "CA/MB/Poplar Point"
  },
  {
    "label": "Portage La Prairie",
    "value": "CA/MB/Portage La Prairie"
  },
  {
    "label": "Pratt",
    "value": "CA/MB/Pratt"
  },
  {
    "label": "Rossendale",
    "value": "CA/MB/Rossendale"
  },
  {
    "label": "Silver Ridge",
    "value": "CA/MB/Silver Ridge"
  },
  {
    "label": "Southport",
    "value": "CA/MB/Southport"
  },
  {
    "label": "Springstein",
    "value": "CA/MB/Springstein"
  },
  {
    "label": "St Ambroise",
    "value": "CA/MB/St Ambroise"
  },
  {
    "label": "St Claude",
    "value": "CA/MB/St Claude"
  },
  {
    "label": "St Eustache",
    "value": "CA/MB/St Eustache"
  },
  {
    "label": "St Marks",
    "value": "CA/MB/St Marks"
  },
  {
    "label": "Waldersee",
    "value": "CA/MB/Waldersee"
  },
  {
    "label": "Woodside",
    "value": "CA/MB/Woodside"
  },
  {
    "label": "Churchill",
    "value": "CA/MB/Churchill"
  },
  {
    "label": "Churchill Harbour",
    "value": "CA/MB/Churchill Harbour"
  },
  {
    "label": "Gillam",
    "value": "CA/MB/Gillam"
  },
  {
    "label": "Leaf Rapids",
    "value": "CA/MB/Leaf Rapids"
  },
  {
    "label": "Lynn Lake",
    "value": "CA/MB/Lynn Lake"
  },
  {
    "label": "Clanwilliam",
    "value": "CA/MB/Clanwilliam"
  },
  {
    "label": "Erickson",
    "value": "CA/MB/Erickson"
  },
  {
    "label": "Dauphin",
    "value": "CA/MB/Dauphin"
  },
  {
    "label": "Ebb And Flow",
    "value": "CA/MB/Ebb And Flow"
  },
  {
    "label": "Ethelbert",
    "value": "CA/MB/Ethelbert"
  },
  {
    "label": "Fork River",
    "value": "CA/MB/Fork River"
  },
  {
    "label": "Garland",
    "value": "CA/MB/Garland"
  },
  {
    "label": "Gilbert Plains",
    "value": "CA/MB/Gilbert Plains"
  },
  {
    "label": "Grandview",
    "value": "CA/MB/Grandview"
  },
  {
    "label": "Laurier",
    "value": "CA/MB/Laurier"
  },
  {
    "label": "Mccreary",
    "value": "CA/MB/Mccreary"
  },
  {
    "label": "Ochre River",
    "value": "CA/MB/Ochre River"
  },
  {
    "label": "Rorketon",
    "value": "CA/MB/Rorketon"
  },
  {
    "label": "Ste Rose Du Lac",
    "value": "CA/MB/Ste Rose Du Lac"
  },
  {
    "label": "Tootinaowaziibeeng",
    "value": "CA/MB/Tootinaowaziibeeng"
  },
  {
    "label": "Valley River",
    "value": "CA/MB/Valley River"
  },
  {
    "label": "Winnipegosis",
    "value": "CA/MB/Winnipegosis"
  },
  {
    "label": "Deloraine",
    "value": "CA/MB/Deloraine"
  },
  {
    "label": "Metigoshe",
    "value": "CA/MB/Metigoshe"
  },
  {
    "label": "Cross Lake",
    "value": "CA/MB/Cross Lake"
  },
  {
    "label": "Falcon Beach",
    "value": "CA/MB/Falcon Beach"
  },
  {
    "label": "Hadashville",
    "value": "CA/MB/Hadashville"
  },
  {
    "label": "Lac Du Bonnet",
    "value": "CA/MB/Lac Du Bonnet"
  },
  {
    "label": "Pinawa",
    "value": "CA/MB/Pinawa"
  },
  {
    "label": "Pine Falls",
    "value": "CA/MB/Pine Falls"
  },
  {
    "label": "Piney",
    "value": "CA/MB/Piney"
  },
  {
    "label": "Pointe Du Bois",
    "value": "CA/MB/Pointe Du Bois"
  },
  {
    "label": "Rennie",
    "value": "CA/MB/Rennie"
  },
  {
    "label": "River Hills",
    "value": "CA/MB/River Hills"
  },
  {
    "label": "Sandilands",
    "value": "CA/MB/Sandilands"
  },
  {
    "label": "Seddons Corner",
    "value": "CA/MB/Seddons Corner"
  },
  {
    "label": "Seven Sisters Falls",
    "value": "CA/MB/Seven Sisters Falls"
  },
  {
    "label": "Sprague",
    "value": "CA/MB/Sprague"
  },
  {
    "label": "Sundown",
    "value": "CA/MB/Sundown"
  },
  {
    "label": "Traverse Bay",
    "value": "CA/MB/Traverse Bay"
  },
  {
    "label": "Victoria Beach",
    "value": "CA/MB/Victoria Beach"
  },
  {
    "label": "Vita",
    "value": "CA/MB/Vita"
  },
  {
    "label": "Whitemouth",
    "value": "CA/MB/Whitemouth"
  },
  {
    "label": "Woodridge",
    "value": "CA/MB/Woodridge"
  },
  {
    "label": "Aubigny",
    "value": "CA/MB/Aubigny"
  },
  {
    "label": "Berens River",
    "value": "CA/MB/Berens River"
  },
  {
    "label": "Bissett",
    "value": "CA/MB/Bissett"
  },
  {
    "label": "Buffalo Point",
    "value": "CA/MB/Buffalo Point"
  },
  {
    "label": "Carlowrie",
    "value": "CA/MB/Carlowrie"
  },
  {
    "label": "Dominion City",
    "value": "CA/MB/Dominion City"
  },
  {
    "label": "Dufresne",
    "value": "CA/MB/Dufresne"
  },
  {
    "label": "Dufrost",
    "value": "CA/MB/Dufrost"
  },
  {
    "label": "East Braintree",
    "value": "CA/MB/East Braintree"
  },
  {
    "label": "Elma",
    "value": "CA/MB/Elma"
  },
  {
    "label": "Fort Alexander",
    "value": "CA/MB/Fort Alexander"
  },
  {
    "label": "Gardenton",
    "value": "CA/MB/Gardenton"
  },
  {
    "label": "Giroux",
    "value": "CA/MB/Giroux"
  },
  {
    "label": "Great Falls",
    "value": "CA/MB/Great Falls"
  },
  {
    "label": "Green Ridge",
    "value": "CA/MB/Green Ridge"
  },
  {
    "label": "Grunthal",
    "value": "CA/MB/Grunthal"
  },
  {
    "label": "Hazelridge",
    "value": "CA/MB/Hazelridge"
  },
  {
    "label": "Ile Des Chenes",
    "value": "CA/MB/Ile Des Chenes"
  },
  {
    "label": "Kleefeld",
    "value": "CA/MB/Kleefeld"
  },
  {
    "label": "La Broquerie",
    "value": "CA/MB/La Broquerie"
  },
  {
    "label": "Landmark",
    "value": "CA/MB/Landmark"
  },
  {
    "label": "Little Grand Rapids",
    "value": "CA/MB/Little Grand Rapids"
  },
  {
    "label": "Manigotagan",
    "value": "CA/MB/Manigotagan"
  },
  {
    "label": "Marchand",
    "value": "CA/MB/Marchand"
  },
  {
    "label": "Menisino",
    "value": "CA/MB/Menisino"
  },
  {
    "label": "Middlebro",
    "value": "CA/MB/Middlebro"
  },
  {
    "label": "Mitchell",
    "value": "CA/MB/Mitchell"
  },
  {
    "label": "Negginan",
    "value": "CA/MB/Negginan"
  },
  {
    "label": "New Bothwell",
    "value": "CA/MB/New Bothwell"
  },
  {
    "label": "Niverville",
    "value": "CA/MB/Niverville"
  },
  {
    "label": "O'hanly",
    "value": "CA/MB/O'hanly"
  },
  {
    "label": "Otterburne",
    "value": "CA/MB/Otterburne"
  },
  {
    "label": "Overstoneville",
    "value": "CA/MB/Overstoneville"
  },
  {
    "label": "Pansy",
    "value": "CA/MB/Pansy"
  },
  {
    "label": "Pauingassi",
    "value": "CA/MB/Pauingassi"
  },
  {
    "label": "Powerview",
    "value": "CA/MB/Powerview"
  },
  {
    "label": "Randolph",
    "value": "CA/MB/Randolph"
  },
  {
    "label": "Richer",
    "value": "CA/MB/Richer"
  },
  {
    "label": "Ridgeville",
    "value": "CA/MB/Ridgeville"
  },
  {
    "label": "Rosa",
    "value": "CA/MB/Rosa"
  },
  {
    "label": "Roseau River",
    "value": "CA/MB/Roseau River"
  },
  {
    "label": "Sarto",
    "value": "CA/MB/Sarto"
  },
  {
    "label": "South Junction",
    "value": "CA/MB/South Junction"
  },
  {
    "label": "St Adolphe",
    "value": "CA/MB/St Adolphe"
  },
  {
    "label": "St Georges",
    "value": "CA/MB/St Georges"
  },
  {
    "label": "St Malo",
    "value": "CA/MB/St Malo"
  },
  {
    "label": "St Pierre Jolys",
    "value": "CA/MB/St Pierre Jolys"
  },
  {
    "label": "Ste Anne",
    "value": "CA/MB/Ste Anne"
  },
  {
    "label": "Stead",
    "value": "CA/MB/Stead"
  },
  {
    "label": "Steinbach",
    "value": "CA/MB/Steinbach"
  },
  {
    "label": "Stuartburn",
    "value": "CA/MB/Stuartburn"
  },
  {
    "label": "Tolstoi",
    "value": "CA/MB/Tolstoi"
  },
  {
    "label": "Tourond",
    "value": "CA/MB/Tourond"
  },
  {
    "label": "Tyndall",
    "value": "CA/MB/Tyndall"
  },
  {
    "label": "Vassar",
    "value": "CA/MB/Vassar"
  },
  {
    "label": "Wanipigow",
    "value": "CA/MB/Wanipigow"
  },
  {
    "label": "Whiteshell",
    "value": "CA/MB/Whiteshell"
  },
  {
    "label": "Woodmore",
    "value": "CA/MB/Woodmore"
  },
  {
    "label": "Zhoda",
    "value": "CA/MB/Zhoda"
  },
  {
    "label": "Arnaud",
    "value": "CA/MB/Arnaud"
  },
  {
    "label": "Emerson",
    "value": "CA/MB/Emerson"
  },
  {
    "label": "Ginew",
    "value": "CA/MB/Ginew"
  },
  {
    "label": "Roseau River Reserve",
    "value": "CA/MB/Roseau River Reserve"
  },
  {
    "label": "West Lynne",
    "value": "CA/MB/West Lynne"
  },
  {
    "label": "Flin Flon",
    "value": "CA/MB/Flin Flon"
  },
  {
    "label": "Channing",
    "value": "CA/MB/Channing"
  },
  {
    "label": "Cormorant",
    "value": "CA/MB/Cormorant"
  },
  {
    "label": "Cranberry Portage",
    "value": "CA/MB/Cranberry Portage"
  },
  {
    "label": "Easterville",
    "value": "CA/MB/Easterville"
  },
  {
    "label": "Grand Rapids",
    "value": "CA/MB/Grand Rapids"
  },
  {
    "label": "Moose Lake",
    "value": "CA/MB/Moose Lake"
  },
  {
    "label": "Sherridon",
    "value": "CA/MB/Sherridon"
  },
  {
    "label": "Snow Lake",
    "value": "CA/MB/Snow Lake"
  },
  {
    "label": "The Pas",
    "value": "CA/MB/The Pas"
  },
  {
    "label": "Wanless",
    "value": "CA/MB/Wanless"
  },
  {
    "label": "Ashville",
    "value": "CA/MB/Ashville"
  },
  {
    "label": "Stockton",
    "value": "CA/MB/Stockton"
  },
  {
    "label": "Elgin",
    "value": "CA/MB/Elgin"
  },
  {
    "label": "Fairfax",
    "value": "CA/MB/Fairfax"
  },
  {
    "label": "Hartney",
    "value": "CA/MB/Hartney"
  },
  {
    "label": "Lauder",
    "value": "CA/MB/Lauder"
  },
  {
    "label": "Minto",
    "value": "CA/MB/Minto"
  },
  {
    "label": "Decker",
    "value": "CA/MB/Decker"
  },
  {
    "label": "Hamiota",
    "value": "CA/MB/Hamiota"
  },
  {
    "label": "Newdale",
    "value": "CA/MB/Newdale"
  },
  {
    "label": "Onanole",
    "value": "CA/MB/Onanole"
  },
  {
    "label": "Rackham",
    "value": "CA/MB/Rackham"
  },
  {
    "label": "Sandy Lake",
    "value": "CA/MB/Sandy Lake"
  },
  {
    "label": "Bloodvein",
    "value": "CA/MB/Bloodvein"
  },
  {
    "label": "Bloodvein 12",
    "value": "CA/MB/Bloodvein 12"
  },
  {
    "label": "Argyle",
    "value": "CA/MB/Argyle"
  },
  {
    "label": "Arnes",
    "value": "CA/MB/Arnes"
  },
  {
    "label": "Ashern",
    "value": "CA/MB/Ashern"
  },
  {
    "label": "Balmoral",
    "value": "CA/MB/Balmoral"
  },
  {
    "label": "Beaconia",
    "value": "CA/MB/Beaconia"
  },
  {
    "label": "Belair",
    "value": "CA/MB/Belair"
  },
  {
    "label": "Broad Valley",
    "value": "CA/MB/Broad Valley"
  },
  {
    "label": "Camp Morton",
    "value": "CA/MB/Camp Morton"
  },
  {
    "label": "Chatfield",
    "value": "CA/MB/Chatfield"
  },
  {
    "label": "Clandeboye",
    "value": "CA/MB/Clandeboye"
  },
  {
    "label": "Dallas",
    "value": "CA/MB/Dallas"
  },
  {
    "label": "East Selkirk",
    "value": "CA/MB/East Selkirk"
  },
  {
    "label": "Eriksdale",
    "value": "CA/MB/Eriksdale"
  },
  {
    "label": "Fairford",
    "value": "CA/MB/Fairford"
  },
  {
    "label": "Faulkner",
    "value": "CA/MB/Faulkner"
  },
  {
    "label": "Fisher Branch",
    "value": "CA/MB/Fisher Branch"
  },
  {
    "label": "Fraserwood",
    "value": "CA/MB/Fraserwood"
  },
  {
    "label": "Gimli",
    "value": "CA/MB/Gimli"
  },
  {
    "label": "Grahamdale",
    "value": "CA/MB/Grahamdale"
  },
  {
    "label": "Grand Marais",
    "value": "CA/MB/Grand Marais"
  },
  {
    "label": "Grosse Isle",
    "value": "CA/MB/Grosse Isle"
  },
  {
    "label": "Gunton",
    "value": "CA/MB/Gunton"
  },
  {
    "label": "Gypsumville",
    "value": "CA/MB/Gypsumville"
  },
  {
    "label": "Hilbre",
    "value": "CA/MB/Hilbre"
  },
  {
    "label": "Hodgson",
    "value": "CA/MB/Hodgson"
  },
  {
    "label": "Inwood",
    "value": "CA/MB/Inwood"
  },
  {
    "label": "Komarno",
    "value": "CA/MB/Komarno"
  },
  {
    "label": "Koostatak",
    "value": "CA/MB/Koostatak"
  },
  {
    "label": "Lake Francis",
    "value": "CA/MB/Lake Francis"
  },
  {
    "label": "Libau",
    "value": "CA/MB/Libau"
  },
  {
    "label": "Little Bullhead",
    "value": "CA/MB/Little Bullhead"
  },
  {
    "label": "Lockport",
    "value": "CA/MB/Lockport"
  },
  {
    "label": "Lundar",
    "value": "CA/MB/Lundar"
  },
  {
    "label": "Malonton",
    "value": "CA/MB/Malonton"
  },
  {
    "label": "Marquette",
    "value": "CA/MB/Marquette"
  },
  {
    "label": "Matheson Island",
    "value": "CA/MB/Matheson Island"
  },
  {
    "label": "Matlock",
    "value": "CA/MB/Matlock"
  },
  {
    "label": "Meleb",
    "value": "CA/MB/Meleb"
  },
  {
    "label": "Moosehorn",
    "value": "CA/MB/Moosehorn"
  },
  {
    "label": "Mulvihill",
    "value": "CA/MB/Mulvihill"
  },
  {
    "label": "Narcisse",
    "value": "CA/MB/Narcisse"
  },
  {
    "label": "Oak Point",
    "value": "CA/MB/Oak Point"
  },
  {
    "label": "Oakview",
    "value": "CA/MB/Oakview"
  },
  {
    "label": "Peguis",
    "value": "CA/MB/Peguis"
  },
  {
    "label": "Petersfield",
    "value": "CA/MB/Petersfield"
  },
  {
    "label": "Poplarfield",
    "value": "CA/MB/Poplarfield"
  },
  {
    "label": "Princess Harbour",
    "value": "CA/MB/Princess Harbour"
  },
  {
    "label": "Rock Ridge",
    "value": "CA/MB/Rock Ridge"
  },
  {
    "label": "Rosser",
    "value": "CA/MB/Rosser"
  },
  {
    "label": "Sandy Hook",
    "value": "CA/MB/Sandy Hook"
  },
  {
    "label": "Scanterbury",
    "value": "CA/MB/Scanterbury"
  },
  {
    "label": "Selkirk",
    "value": "CA/MB/Selkirk"
  },
  {
    "label": "Silver",
    "value": "CA/MB/Silver"
  },
  {
    "label": "Skownan",
    "value": "CA/MB/Skownan"
  },
  {
    "label": "St Andrews",
    "value": "CA/MB/St Andrews"
  },
  {
    "label": "St Laurent",
    "value": "CA/MB/St Laurent"
  },
  {
    "label": "St Martin",
    "value": "CA/MB/St Martin"
  },
  {
    "label": "Steep Rock",
    "value": "CA/MB/Steep Rock"
  },
  {
    "label": "Stonewall",
    "value": "CA/MB/Stonewall"
  },
  {
    "label": "Stony Mountain",
    "value": "CA/MB/Stony Mountain"
  },
  {
    "label": "Teulon",
    "value": "CA/MB/Teulon"
  },
  {
    "label": "Vogar",
    "value": "CA/MB/Vogar"
  },
  {
    "label": "Warren",
    "value": "CA/MB/Warren"
  },
  {
    "label": "Winnipeg Beach",
    "value": "CA/MB/Winnipeg Beach"
  },
  {
    "label": "Woodlands",
    "value": "CA/MB/Woodlands"
  },
  {
    "label": "Holmfield",
    "value": "CA/MB/Holmfield"
  },
  {
    "label": "Ninga",
    "value": "CA/MB/Ninga"
  },
  {
    "label": "Killarney",
    "value": "CA/MB/Killarney"
  },
  {
    "label": "Altamont",
    "value": "CA/MB/Altamont"
  },
  {
    "label": "Bruxelles",
    "value": "CA/MB/Bruxelles"
  },
  {
    "label": "Mariapolis",
    "value": "CA/MB/Mariapolis"
  },
  {
    "label": "Notre-Dame-De-Lourdes",
    "value": "CA/MB/Notre-Dame-De-Lourdes"
  },
  {
    "label": "Somerset",
    "value": "CA/MB/Somerset"
  },
  {
    "label": "St. Alphonse",
    "value": "CA/MB/St. Alphonse"
  },
  {
    "label": "St. Leon",
    "value": "CA/MB/St. Leon"
  },
  {
    "label": "Swan Lake",
    "value": "CA/MB/Swan Lake"
  },
  {
    "label": "Clearwater",
    "value": "CA/MB/Clearwater"
  },
  {
    "label": "Crystal City",
    "value": "CA/MB/Crystal City"
  },
  {
    "label": "Pilot Mound",
    "value": "CA/MB/Pilot Mound"
  },
  {
    "label": "Melita",
    "value": "CA/MB/Melita"
  },
  {
    "label": "Minitonas",
    "value": "CA/MB/Minitonas"
  },
  {
    "label": "Bowsman",
    "value": "CA/MB/Bowsman"
  },
  {
    "label": "Minnedosa",
    "value": "CA/MB/Minnedosa"
  },
  {
    "label": "Morden",
    "value": "CA/MB/Morden"
  },
  {
    "label": "Morris",
    "value": "CA/MB/Morris"
  },
  {
    "label": "Boissevain",
    "value": "CA/MB/Boissevain"
  },
  {
    "label": "Neepawa",
    "value": "CA/MB/Neepawa"
  },
  {
    "label": "Shilo, C.F.B.",
    "value": "CA/MB/Shilo, C.F.B."
  },
  {
    "label": "Wellwood",
    "value": "CA/MB/Wellwood"
  },
  {
    "label": "Barrows",
    "value": "CA/MB/Barrows"
  },
  {
    "label": "Camperville",
    "value": "CA/MB/Camperville"
  },
  {
    "label": "Crane River",
    "value": "CA/MB/Crane River"
  },
  {
    "label": "Duck Bay",
    "value": "CA/MB/Duck Bay"
  },
  {
    "label": "Lake Manitoba First Nation",
    "value": "CA/MB/Lake Manitoba First Nation"
  },
  {
    "label": "Pelican Rapids",
    "value": "CA/MB/Pelican Rapids"
  },
  {
    "label": "Waterhen",
    "value": "CA/MB/Waterhen"
  },
  {
    "label": "Sidney",
    "value": "CA/MB/Sidney"
  },
  {
    "label": "Brochet",
    "value": "CA/MB/Brochet"
  },
  {
    "label": "Gods Lake Narrows",
    "value": "CA/MB/Gods Lake Narrows"
  },
  {
    "label": "Gods River",
    "value": "CA/MB/Gods River"
  },
  {
    "label": "Granville Lake",
    "value": "CA/MB/Granville Lake"
  },
  {
    "label": "Ilford",
    "value": "CA/MB/Ilford"
  },
  {
    "label": "Island Lake",
    "value": "CA/MB/Island Lake"
  },
  {
    "label": "Lac Brochet",
    "value": "CA/MB/Lac Brochet"
  },
  {
    "label": "Nelson House",
    "value": "CA/MB/Nelson House"
  },
  {
    "label": "Norway House",
    "value": "CA/MB/Norway House"
  },
  {
    "label": "Opaskwayak",
    "value": "CA/MB/Opaskwayak"
  },
  {
    "label": "Oxford House",
    "value": "CA/MB/Oxford House"
  },
  {
    "label": "Pikwitonei",
    "value": "CA/MB/Pikwitonei"
  },
  {
    "label": "Pukatawagan",
    "value": "CA/MB/Pukatawagan"
  },
  {
    "label": "Red Sucker Lake",
    "value": "CA/MB/Red Sucker Lake"
  },
  {
    "label": "Shamattawa",
    "value": "CA/MB/Shamattawa"
  },
  {
    "label": "South Indian Lake",
    "value": "CA/MB/South Indian Lake"
  },
  {
    "label": "Split Lake",
    "value": "CA/MB/Split Lake"
  },
  {
    "label": "St Theresa Point",
    "value": "CA/MB/St Theresa Point"
  },
  {
    "label": "Stevenson Island",
    "value": "CA/MB/Stevenson Island"
  },
  {
    "label": "Tadoule Lake",
    "value": "CA/MB/Tadoule Lake"
  },
  {
    "label": "Thicket Portage",
    "value": "CA/MB/Thicket Portage"
  },
  {
    "label": "Thompson",
    "value": "CA/MB/Thompson"
  },
  {
    "label": "Waasagomach",
    "value": "CA/MB/Waasagomach"
  },
  {
    "label": "Wabowden",
    "value": "CA/MB/Wabowden"
  },
  {
    "label": "York Landing",
    "value": "CA/MB/York Landing"
  },
  {
    "label": "Nesbitt",
    "value": "CA/MB/Nesbitt"
  },
  {
    "label": "Angusville",
    "value": "CA/MB/Angusville"
  },
  {
    "label": "Benito",
    "value": "CA/MB/Benito"
  },
  {
    "label": "Binscarth",
    "value": "CA/MB/Binscarth"
  },
  {
    "label": "Birch River",
    "value": "CA/MB/Birch River"
  },
  {
    "label": "Boggy Creek",
    "value": "CA/MB/Boggy Creek"
  },
  {
    "label": "Cayer",
    "value": "CA/MB/Cayer"
  },
  {
    "label": "Cowan",
    "value": "CA/MB/Cowan"
  },
  {
    "label": "Dropmore",
    "value": "CA/MB/Dropmore"
  },
  {
    "label": "Durban",
    "value": "CA/MB/Durban"
  },
  {
    "label": "Elphinstone",
    "value": "CA/MB/Elphinstone"
  },
  {
    "label": "Inglis",
    "value": "CA/MB/Inglis"
  },
  {
    "label": "Kelwood",
    "value": "CA/MB/Kelwood"
  },
  {
    "label": "Kenville",
    "value": "CA/MB/Kenville"
  },
  {
    "label": "Lake Audy",
    "value": "CA/MB/Lake Audy"
  },
  {
    "label": "Mafeking",
    "value": "CA/MB/Mafeking"
  },
  {
    "label": "Makinak",
    "value": "CA/MB/Makinak"
  },
  {
    "label": "Meadow Portage",
    "value": "CA/MB/Meadow Portage"
  },
  {
    "label": "Menzie",
    "value": "CA/MB/Menzie"
  },
  {
    "label": "Oakburn",
    "value": "CA/MB/Oakburn"
  },
  {
    "label": "Olha",
    "value": "CA/MB/Olha"
  },
  {
    "label": "Pine River",
    "value": "CA/MB/Pine River"
  },
  {
    "label": "Renwer",
    "value": "CA/MB/Renwer"
  },
  {
    "label": "Riding Mountain",
    "value": "CA/MB/Riding Mountain"
  },
  {
    "label": "Roblin",
    "value": "CA/MB/Roblin"
  },
  {
    "label": "Rossburn",
    "value": "CA/MB/Rossburn"
  },
  {
    "label": "Russell",
    "value": "CA/MB/Russell"
  },
  {
    "label": "San Clara",
    "value": "CA/MB/San Clara"
  },
  {
    "label": "Shellmouth",
    "value": "CA/MB/Shellmouth"
  },
  {
    "label": "Shortdale",
    "value": "CA/MB/Shortdale"
  },
  {
    "label": "Sifton",
    "value": "CA/MB/Sifton"
  },
  {
    "label": "Swan River",
    "value": "CA/MB/Swan River"
  },
  {
    "label": "Toutes Aides",
    "value": "CA/MB/Toutes Aides"
  },
  {
    "label": "Vista",
    "value": "CA/MB/Vista"
  },
  {
    "label": "Wasagaming",
    "value": "CA/MB/Wasagaming"
  },
  {
    "label": "Waywayseecappo",
    "value": "CA/MB/Waywayseecappo"
  },
  {
    "label": "Darlingford",
    "value": "CA/MB/Darlingford"
  },
  {
    "label": "La Rivière",
    "value": "CA/MB/La Rivière"
  },
  {
    "label": "Manitou",
    "value": "CA/MB/Manitou"
  },
  {
    "label": "Snowflake",
    "value": "CA/MB/Snowflake"
  },
  {
    "label": "Blumenort",
    "value": "CA/MB/Blumenort"
  },
  {
    "label": "Brunkild",
    "value": "CA/MB/Brunkild"
  },
  {
    "label": "Domain",
    "value": "CA/MB/Domain"
  },
  {
    "label": "Elm Creek",
    "value": "CA/MB/Elm Creek"
  },
  {
    "label": "Fannystelle",
    "value": "CA/MB/Fannystelle"
  },
  {
    "label": "Glenlea",
    "value": "CA/MB/Glenlea"
  },
  {
    "label": "Graysville",
    "value": "CA/MB/Graysville"
  },
  {
    "label": "Gretna",
    "value": "CA/MB/Gretna"
  },
  {
    "label": "Halbstadt",
    "value": "CA/MB/Halbstadt"
  },
  {
    "label": "Haywood",
    "value": "CA/MB/Haywood"
  },
  {
    "label": "Homewood",
    "value": "CA/MB/Homewood"
  },
  {
    "label": "Horndean",
    "value": "CA/MB/Horndean"
  },
  {
    "label": "La Riviere",
    "value": "CA/MB/La Riviere"
  },
  {
    "label": "La Salle",
    "value": "CA/MB/La Salle"
  },
  {
    "label": "Letellier",
    "value": "CA/MB/Letellier"
  },
  {
    "label": "Lowe Farm",
    "value": "CA/MB/Lowe Farm"
  },
  {
    "label": "Miami",
    "value": "CA/MB/Miami"
  },
  {
    "label": "Oak Bluff",
    "value": "CA/MB/Oak Bluff"
  },
  {
    "label": "Plum Coulee",
    "value": "CA/MB/Plum Coulee"
  },
  {
    "label": "Reinfeld",
    "value": "CA/MB/Reinfeld"
  },
  {
    "label": "Roland",
    "value": "CA/MB/Roland"
  },
  {
    "label": "Roseisle",
    "value": "CA/MB/Roseisle"
  },
  {
    "label": "Rosenfeld",
    "value": "CA/MB/Rosenfeld"
  },
  {
    "label": "Rosenort",
    "value": "CA/MB/Rosenort"
  },
  {
    "label": "Sanford",
    "value": "CA/MB/Sanford"
  },
  {
    "label": "Schanzenfeld",
    "value": "CA/MB/Schanzenfeld"
  },
  {
    "label": "Sperling",
    "value": "CA/MB/Sperling"
  },
  {
    "label": "St Alphonse",
    "value": "CA/MB/St Alphonse"
  },
  {
    "label": "St Jean Baptiste",
    "value": "CA/MB/St Jean Baptiste"
  },
  {
    "label": "St Joseph",
    "value": "CA/MB/St Joseph"
  },
  {
    "label": "St Leon",
    "value": "CA/MB/St Leon"
  },
  {
    "label": "Starbuck",
    "value": "CA/MB/Starbuck"
  },
  {
    "label": "Ste Agathe",
    "value": "CA/MB/Ste Agathe"
  },
  {
    "label": "Stephenfield",
    "value": "CA/MB/Stephenfield"
  },
  {
    "label": "Thornhill",
    "value": "CA/MB/Thornhill"
  },
  {
    "label": "Winkler",
    "value": "CA/MB/Winkler"
  },
  {
    "label": "Baldur",
    "value": "CA/MB/Baldur"
  },
  {
    "label": "Powerview-Pine Falls",
    "value": "CA/MB/Powerview-Pine Falls"
  },
  {
    "label": "Arrow River",
    "value": "CA/MB/Arrow River"
  },
  {
    "label": "Beulah",
    "value": "CA/MB/Beulah"
  },
  {
    "label": "Birtle",
    "value": "CA/MB/Birtle"
  },
  {
    "label": "Crandall",
    "value": "CA/MB/Crandall"
  },
  {
    "label": "Foxwarren",
    "value": "CA/MB/Foxwarren"
  },
  {
    "label": "Isabella",
    "value": "CA/MB/Isabella"
  },
  {
    "label": "Miniota",
    "value": "CA/MB/Miniota"
  },
  {
    "label": "Solsgirth",
    "value": "CA/MB/Solsgirth"
  },
  {
    "label": "Altbergthal",
    "value": "CA/MB/Altbergthal"
  },
  {
    "label": "Blumengart",
    "value": "CA/MB/Blumengart"
  },
  {
    "label": "Blumenort South",
    "value": "CA/MB/Blumenort South"
  },
  {
    "label": "Gnadenfeld",
    "value": "CA/MB/Gnadenfeld"
  },
  {
    "label": "Gnadenthal",
    "value": "CA/MB/Gnadenthal"
  },
  {
    "label": "Neubergthal",
    "value": "CA/MB/Neubergthal"
  },
  {
    "label": "Rosengart",
    "value": "CA/MB/Rosengart"
  },
  {
    "label": "Rosetown",
    "value": "CA/MB/Rosetown"
  },
  {
    "label": "Schoenwiese",
    "value": "CA/MB/Schoenwiese"
  },
  {
    "label": "Daly",
    "value": "CA/MB/Daly"
  },
  {
    "label": "Daly Beach",
    "value": "CA/MB/Daly Beach"
  },
  {
    "label": "Lester Beach",
    "value": "CA/MB/Lester Beach"
  },
  {
    "label": "St-Georges",
    "value": "CA/MB/St-Georges"
  },
  {
    "label": "White Mud Falls",
    "value": "CA/MB/White Mud Falls"
  },
  {
    "label": "Harcus",
    "value": "CA/MB/Harcus"
  },
  {
    "label": "Glenora",
    "value": "CA/MB/Glenora"
  },
  {
    "label": "St. Ouens",
    "value": "CA/MB/St. Ouens"
  },
  {
    "label": "Tyndell",
    "value": "CA/MB/Tyndell"
  },
  {
    "label": "St. Eustache",
    "value": "CA/MB/St. Eustache"
  },
  {
    "label": "Chater",
    "value": "CA/MB/Chater"
  },
  {
    "label": "Cottonwoods",
    "value": "CA/MB/Cottonwoods"
  },
  {
    "label": "Sprucewoods",
    "value": "CA/MB/Sprucewoods"
  },
  {
    "label": "St. Malo",
    "value": "CA/MB/St. Malo"
  },
  {
    "label": "East St. Paul",
    "value": "CA/MB/East St. Paul"
  },
  {
    "label": "Manson",
    "value": "CA/MB/Manson"
  },
  {
    "label": "Mcauley",
    "value": "CA/MB/Mcauley"
  },
  {
    "label": "St-Lazare",
    "value": "CA/MB/St-Lazare"
  },
  {
    "label": "Douglas",
    "value": "CA/MB/Douglas"
  },
  {
    "label": "Douglas Station",
    "value": "CA/MB/Douglas Station"
  },
  {
    "label": "Forrest",
    "value": "CA/MB/Forrest"
  },
  {
    "label": "Justice",
    "value": "CA/MB/Justice"
  },
  {
    "label": "St. Martin",
    "value": "CA/MB/St. Martin"
  },
  {
    "label": "St. Claude",
    "value": "CA/MB/St. Claude"
  },
  {
    "label": "Headingley",
    "value": "CA/MB/Headingley"
  },
  {
    "label": "Hedingley",
    "value": "CA/MB/Hedingley"
  },
  {
    "label": "Bethany",
    "value": "CA/MB/Bethany"
  },
  {
    "label": "St. Jean Baptiste",
    "value": "CA/MB/St. Jean Baptiste"
  },
  {
    "label": "St. Joseph",
    "value": "CA/MB/St. Joseph"
  },
  {
    "label": "Ste. Agathe",
    "value": "CA/MB/Ste. Agathe"
  },
  {
    "label": "Oak River",
    "value": "CA/MB/Oak River"
  },
  {
    "label": "Rapid City",
    "value": "CA/MB/Rapid City"
  },
  {
    "label": "Cromer",
    "value": "CA/MB/Cromer"
  },
  {
    "label": "Pipestone",
    "value": "CA/MB/Pipestone"
  },
  {
    "label": "Reston",
    "value": "CA/MB/Reston"
  },
  {
    "label": "Sinclair",
    "value": "CA/MB/Sinclair"
  },
  {
    "label": "Fort La Reine",
    "value": "CA/MB/Fort La Reine"
  },
  {
    "label": "Newton",
    "value": "CA/MB/Newton"
  },
  {
    "label": "St. Ambroise",
    "value": "CA/MB/St. Ambroise"
  },
  {
    "label": "Belmont",
    "value": "CA/MB/Belmont"
  },
  {
    "label": "Dunrea",
    "value": "CA/MB/Dunrea"
  },
  {
    "label": "Margaret",
    "value": "CA/MB/Margaret"
  },
  {
    "label": "Ninette",
    "value": "CA/MB/Ninette"
  },
  {
    "label": "Ile Des Chênes",
    "value": "CA/MB/Ile Des Chênes"
  },
  {
    "label": "St. Adolphe",
    "value": "CA/MB/St. Adolphe"
  },
  {
    "label": "St. Germain South",
    "value": "CA/MB/St. Germain South"
  },
  {
    "label": "Birnie",
    "value": "CA/MB/Birnie"
  },
  {
    "label": "Eden",
    "value": "CA/MB/Eden"
  },
  {
    "label": "Franklin",
    "value": "CA/MB/Franklin"
  },
  {
    "label": "Polonia",
    "value": "CA/MB/Polonia"
  },
  {
    "label": "Deleau",
    "value": "CA/MB/Deleau"
  },
  {
    "label": "Griswold",
    "value": "CA/MB/Griswold"
  },
  {
    "label": "Oak Lake",
    "value": "CA/MB/Oak Lake"
  },
  {
    "label": "Deacon",
    "value": "CA/MB/Deacon"
  },
  {
    "label": "Deacons Corner",
    "value": "CA/MB/Deacons Corner"
  },
  {
    "label": "St. Andrews",
    "value": "CA/MB/St. Andrews"
  },
  {
    "label": "Brokenhead Reserve",
    "value": "CA/MB/Brokenhead Reserve"
  },
  {
    "label": "Gonor",
    "value": "CA/MB/Gonor"
  },
  {
    "label": "Narol",
    "value": "CA/MB/Narol"
  },
  {
    "label": "St. François Xavier",
    "value": "CA/MB/St. François Xavier"
  },
  {
    "label": "St. Laurent",
    "value": "CA/MB/St. Laurent"
  },
  {
    "label": "Blumenfeld",
    "value": "CA/MB/Blumenfeld"
  },
  {
    "label": "Hochfeld",
    "value": "CA/MB/Hochfeld"
  },
  {
    "label": "Neuenburg",
    "value": "CA/MB/Neuenburg"
  },
  {
    "label": "Osterwick",
    "value": "CA/MB/Osterwick"
  },
  {
    "label": "Ste. Anne",
    "value": "CA/MB/Ste. Anne"
  },
  {
    "label": "Lorette",
    "value": "CA/MB/Lorette"
  },
  {
    "label": "Elkhorn",
    "value": "CA/MB/Elkhorn"
  },
  {
    "label": "Harding",
    "value": "CA/MB/Harding"
  },
  {
    "label": "Hargrave",
    "value": "CA/MB/Hargrave"
  },
  {
    "label": "Kenton",
    "value": "CA/MB/Kenton"
  },
  {
    "label": "Kola",
    "value": "CA/MB/Kola"
  },
  {
    "label": "Lenore",
    "value": "CA/MB/Lenore"
  },
  {
    "label": "West St. Paul",
    "value": "CA/MB/West St. Paul"
  },
  {
    "label": "Shoal Lake",
    "value": "CA/MB/Shoal Lake"
  },
  {
    "label": "Strathclair",
    "value": "CA/MB/Strathclair"
  },
  {
    "label": "Robin",
    "value": "CA/MB/Robin"
  },
  {
    "label": "East St Paul",
    "value": "CA/MB/East St Paul"
  },
  {
    "label": "West St Paul",
    "value": "CA/MB/West St Paul"
  },
  {
    "label": "Glenwood",
    "value": "CA/MB/Glenwood"
  },
  {
    "label": "Pierson",
    "value": "CA/MB/Pierson"
  },
  {
    "label": "God Lake Narrows",
    "value": "CA/MB/God Lake Narrows"
  },
  {
    "label": "St  Theresa Point",
    "value": "CA/MB/St  Theresa Point"
  },
  {
    "label": "Elva",
    "value": "CA/MB/Elva"
  },
  {
    "label": "Lyleton",
    "value": "CA/MB/Lyleton"
  },
  {
    "label": "Tilston",
    "value": "CA/MB/Tilston"
  },
  {
    "label": "Whytewold",
    "value": "CA/MB/Whytewold"
  },
  {
    "label": "St. Pierre-Jolys",
    "value": "CA/MB/St. Pierre-Jolys"
  },
  {
    "label": "Virden",
    "value": "CA/MB/Virden"
  },
  {
    "label": "Cardale",
    "value": "CA/MB/Cardale"
  },
  {
    "label": "St Lazare",
    "value": "CA/MB/St Lazare"
  },
  {
    "label": "Belleview",
    "value": "CA/MB/Belleview"
  },
  {
    "label": "Bradwardine",
    "value": "CA/MB/Bradwardine"
  },
  {
    "label": "Coulter",
    "value": "CA/MB/Coulter"
  },
  {
    "label": "Forrest Station",
    "value": "CA/MB/Forrest Station"
  },
  {
    "label": "Kirkella",
    "value": "CA/MB/Kirkella"
  },
  {
    "label": "Mountain Road",
    "value": "CA/MB/Mountain Road"
  },
  {
    "label": "St Francois Xavier",
    "value": "CA/MB/St Francois Xavier"
  },
  {
    "label": "Winnipeg",
    "value": "CA/MB/Winnipeg"
  },
  {
    "label": "Cartier",
    "value": "CA/MB/Cartier"
  },
  {
    "label": "Grande Pointe",
    "value": "CA/MB/Grande Pointe"
  },
  {
    "label": "Howden",
    "value": "CA/MB/Howden"
  },
  {
    "label": "La Barriere",
    "value": "CA/MB/La Barriere"
  },
  {
    "label": "St Germain South",
    "value": "CA/MB/St Germain South"
  },
  {
    "label": "Vermette",
    "value": "CA/MB/Vermette"
  },
  {
    "label": "Albert Mines",
    "value": "CA/NB/Albert Mines"
  },
  {
    "label": "Alma",
    "value": "CA/NB/Alma"
  },
  {
    "label": "Baltimore",
    "value": "CA/NB/Baltimore"
  },
  {
    "label": "Beaverbrook Albert Co",
    "value": "CA/NB/Beaverbrook Albert Co"
  },
  {
    "label": "Berryton",
    "value": "CA/NB/Berryton"
  },
  {
    "label": "Caledonia Mountain",
    "value": "CA/NB/Caledonia Mountain"
  },
  {
    "label": "Cape Enrage",
    "value": "CA/NB/Cape Enrage"
  },
  {
    "label": "Cape Station",
    "value": "CA/NB/Cape Station"
  },
  {
    "label": "Colpitts Settlement",
    "value": "CA/NB/Colpitts Settlement"
  },
  {
    "label": "Curryville",
    "value": "CA/NB/Curryville"
  },
  {
    "label": "Dawson Settlement",
    "value": "CA/NB/Dawson Settlement"
  },
  {
    "label": "Dennis Beach",
    "value": "CA/NB/Dennis Beach"
  },
  {
    "label": "Edgetts Landing",
    "value": "CA/NB/Edgetts Landing"
  },
  {
    "label": "Elgin",
    "value": "CA/NB/Elgin"
  },
  {
    "label": "Forest Glen",
    "value": "CA/NB/Forest Glen"
  },
  {
    "label": "Fundy National Park",
    "value": "CA/NB/Fundy National Park"
  },
  {
    "label": "Germantown",
    "value": "CA/NB/Germantown"
  },
  {
    "label": "Harvey Albert Co",
    "value": "CA/NB/Harvey Albert Co"
  },
  {
    "label": "Hebron",
    "value": "CA/NB/Hebron"
  },
  {
    "label": "Hillsborough",
    "value": "CA/NB/Hillsborough"
  },
  {
    "label": "Hillsborough West",
    "value": "CA/NB/Hillsborough West"
  },
  {
    "label": "Hopewell Cape",
    "value": "CA/NB/Hopewell Cape"
  },
  {
    "label": "Hopewell Hill",
    "value": "CA/NB/Hopewell Hill"
  },
  {
    "label": "Little River Albert Co",
    "value": "CA/NB/Little River Albert Co"
  },
  {
    "label": "Lower Cape",
    "value": "CA/NB/Lower Cape"
  },
  {
    "label": "Lower Coverdale",
    "value": "CA/NB/Lower Coverdale"
  },
  {
    "label": "Midway",
    "value": "CA/NB/Midway"
  },
  {
    "label": "New Horton",
    "value": "CA/NB/New Horton"
  },
  {
    "label": "Osborne Corner",
    "value": "CA/NB/Osborne Corner"
  },
  {
    "label": "Parkindale",
    "value": "CA/NB/Parkindale"
  },
  {
    "label": "Pine Glen",
    "value": "CA/NB/Pine Glen"
  },
  {
    "label": "Prosser Brook",
    "value": "CA/NB/Prosser Brook"
  },
  {
    "label": "Riverside-Albert",
    "value": "CA/NB/Riverside-Albert"
  },
  {
    "label": "Riverview",
    "value": "CA/NB/Riverview"
  },
  {
    "label": "Rosevale",
    "value": "CA/NB/Rosevale"
  },
  {
    "label": "Sackville Road",
    "value": "CA/NB/Sackville Road"
  },
  {
    "label": "Salem",
    "value": "CA/NB/Salem"
  },
  {
    "label": "Shenstone",
    "value": "CA/NB/Shenstone"
  },
  {
    "label": "Shepody Albert Co",
    "value": "CA/NB/Shepody Albert Co"
  },
  {
    "label": "Shepody Kings Co",
    "value": "CA/NB/Shepody Kings Co"
  },
  {
    "label": "Stoney Creek",
    "value": "CA/NB/Stoney Creek"
  },
  {
    "label": "Turtle Creek",
    "value": "CA/NB/Turtle Creek"
  },
  {
    "label": "Upper Coverdale",
    "value": "CA/NB/Upper Coverdale"
  },
  {
    "label": "Waterside",
    "value": "CA/NB/Waterside"
  },
  {
    "label": "Weldon",
    "value": "CA/NB/Weldon"
  },
  {
    "label": "West River",
    "value": "CA/NB/West River"
  },
  {
    "label": "Armond",
    "value": "CA/NB/Armond"
  },
  {
    "label": "Ashland",
    "value": "CA/NB/Ashland"
  },
  {
    "label": "Avondale",
    "value": "CA/NB/Avondale"
  },
  {
    "label": "Bannon",
    "value": "CA/NB/Bannon"
  },
  {
    "label": "Bath",
    "value": "CA/NB/Bath"
  },
  {
    "label": "Beardsley",
    "value": "CA/NB/Beardsley"
  },
  {
    "label": "Beckim Settlement",
    "value": "CA/NB/Beckim Settlement"
  },
  {
    "label": "Bedell",
    "value": "CA/NB/Bedell"
  },
  {
    "label": "Beechwood",
    "value": "CA/NB/Beechwood"
  },
  {
    "label": "Belleville",
    "value": "CA/NB/Belleville"
  },
  {
    "label": "Benton",
    "value": "CA/NB/Benton"
  },
  {
    "label": "Bloomfield Carleton Co",
    "value": "CA/NB/Bloomfield Carleton Co"
  },
  {
    "label": "Bristol",
    "value": "CA/NB/Bristol"
  },
  {
    "label": "Bristol Junction",
    "value": "CA/NB/Bristol Junction"
  },
  {
    "label": "Brookville",
    "value": "CA/NB/Brookville"
  },
  {
    "label": "Bubartown",
    "value": "CA/NB/Bubartown"
  },
  {
    "label": "Bulls Creek",
    "value": "CA/NB/Bulls Creek"
  },
  {
    "label": "Campbell Settlement",
    "value": "CA/NB/Campbell Settlement"
  },
  {
    "label": "Carlisle",
    "value": "CA/NB/Carlisle"
  },
  {
    "label": "Carlow",
    "value": "CA/NB/Carlow"
  },
  {
    "label": "Centreville",
    "value": "CA/NB/Centreville"
  },
  {
    "label": "Charleston",
    "value": "CA/NB/Charleston"
  },
  {
    "label": "Clearview",
    "value": "CA/NB/Clearview"
  },
  {
    "label": "Cloverdale",
    "value": "CA/NB/Cloverdale"
  },
  {
    "label": "Coldstream",
    "value": "CA/NB/Coldstream"
  },
  {
    "label": "Connell",
    "value": "CA/NB/Connell"
  },
  {
    "label": "Debec",
    "value": "CA/NB/Debec"
  },
  {
    "label": "Deerville",
    "value": "CA/NB/Deerville"
  },
  {
    "label": "Divide",
    "value": "CA/NB/Divide"
  },
  {
    "label": "East Brighton",
    "value": "CA/NB/East Brighton"
  },
  {
    "label": "East Centreville",
    "value": "CA/NB/East Centreville"
  },
  {
    "label": "East Coldstream",
    "value": "CA/NB/East Coldstream"
  },
  {
    "label": "East Newbridge",
    "value": "CA/NB/East Newbridge"
  },
  {
    "label": "Elmwood",
    "value": "CA/NB/Elmwood"
  },
  {
    "label": "Fielding",
    "value": "CA/NB/Fielding"
  },
  {
    "label": "Flemington",
    "value": "CA/NB/Flemington"
  },
  {
    "label": "Florenceville-Bristol",
    "value": "CA/NB/Florenceville-Bristol"
  },
  {
    "label": "Glassville",
    "value": "CA/NB/Glassville"
  },
  {
    "label": "Good Corner",
    "value": "CA/NB/Good Corner"
  },
  {
    "label": "Gordonsville",
    "value": "CA/NB/Gordonsville"
  },
  {
    "label": "Grafton",
    "value": "CA/NB/Grafton"
  },
  {
    "label": "Green Road",
    "value": "CA/NB/Green Road"
  },
  {
    "label": "Greenfield",
    "value": "CA/NB/Greenfield"
  },
  {
    "label": "Gregg Settlement",
    "value": "CA/NB/Gregg Settlement"
  },
  {
    "label": "Hartford",
    "value": "CA/NB/Hartford"
  },
  {
    "label": "Hartland",
    "value": "CA/NB/Hartland"
  },
  {
    "label": "Hartley Settlement",
    "value": "CA/NB/Hartley Settlement"
  },
  {
    "label": "Holmesville",
    "value": "CA/NB/Holmesville"
  },
  {
    "label": "Howard Brook",
    "value": "CA/NB/Howard Brook"
  },
  {
    "label": "Irish Settlement",
    "value": "CA/NB/Irish Settlement"
  },
  {
    "label": "Jackson Falls",
    "value": "CA/NB/Jackson Falls"
  },
  {
    "label": "Jacksontown",
    "value": "CA/NB/Jacksontown"
  },
  {
    "label": "Jacksonville",
    "value": "CA/NB/Jacksonville"
  },
  {
    "label": "Johnville",
    "value": "CA/NB/Johnville"
  },
  {
    "label": "Juniper",
    "value": "CA/NB/Juniper"
  },
  {
    "label": "Killoween",
    "value": "CA/NB/Killoween"
  },
  {
    "label": "Kirkland",
    "value": "CA/NB/Kirkland"
  },
  {
    "label": "Knowlesville",
    "value": "CA/NB/Knowlesville"
  },
  {
    "label": "Lakeville",
    "value": "CA/NB/Lakeville"
  },
  {
    "label": "Lakeville Carleton Co",
    "value": "CA/NB/Lakeville Carleton Co"
  },
  {
    "label": "Lansdowne",
    "value": "CA/NB/Lansdowne"
  },
  {
    "label": "Limestone",
    "value": "CA/NB/Limestone"
  },
  {
    "label": "Lindsay",
    "value": "CA/NB/Lindsay"
  },
  {
    "label": "Long Settlement",
    "value": "CA/NB/Long Settlement"
  },
  {
    "label": "Lower Brighton",
    "value": "CA/NB/Lower Brighton"
  },
  {
    "label": "Lower Knoxford",
    "value": "CA/NB/Lower Knoxford"
  },
  {
    "label": "Lower Woodstock",
    "value": "CA/NB/Lower Woodstock"
  },
  {
    "label": "Mainstream",
    "value": "CA/NB/Mainstream"
  },
  {
    "label": "Mapledale",
    "value": "CA/NB/Mapledale"
  },
  {
    "label": "Maplehurst",
    "value": "CA/NB/Maplehurst"
  },
  {
    "label": "Mckenna",
    "value": "CA/NB/Mckenna"
  },
  {
    "label": "Mckenzie Corner",
    "value": "CA/NB/Mckenzie Corner"
  },
  {
    "label": "Monquart",
    "value": "CA/NB/Monquart"
  },
  {
    "label": "Monument",
    "value": "CA/NB/Monument"
  },
  {
    "label": "Moose Mountain",
    "value": "CA/NB/Moose Mountain"
  },
  {
    "label": "Mount Delight",
    "value": "CA/NB/Mount Delight"
  },
  {
    "label": "Mount Pleasant",
    "value": "CA/NB/Mount Pleasant"
  },
  {
    "label": "Newbridge",
    "value": "CA/NB/Newbridge"
  },
  {
    "label": "Newburg",
    "value": "CA/NB/Newburg"
  },
  {
    "label": "Northampton",
    "value": "CA/NB/Northampton"
  },
  {
    "label": "Oak Mountain",
    "value": "CA/NB/Oak Mountain"
  },
  {
    "label": "Oakland",
    "value": "CA/NB/Oakland"
  },
  {
    "label": "Oakville",
    "value": "CA/NB/Oakville"
  },
  {
    "label": "Peel",
    "value": "CA/NB/Peel"
  },
  {
    "label": "Pembroke",
    "value": "CA/NB/Pembroke"
  },
  {
    "label": "Piercemont",
    "value": "CA/NB/Piercemont"
  },
  {
    "label": "Plymouth",
    "value": "CA/NB/Plymouth"
  },
  {
    "label": "Pole Hill",
    "value": "CA/NB/Pole Hill"
  },
  {
    "label": "Red Bridge",
    "value": "CA/NB/Red Bridge"
  },
  {
    "label": "Riceville",
    "value": "CA/NB/Riceville"
  },
  {
    "label": "Richmond Corner",
    "value": "CA/NB/Richmond Corner"
  },
  {
    "label": "Richmond Settlement",
    "value": "CA/NB/Richmond Settlement"
  },
  {
    "label": "Riverbank Carleton Co",
    "value": "CA/NB/Riverbank Carleton Co"
  },
  {
    "label": "Rosedale",
    "value": "CA/NB/Rosedale"
  },
  {
    "label": "Royalton",
    "value": "CA/NB/Royalton"
  },
  {
    "label": "Simonds",
    "value": "CA/NB/Simonds"
  },
  {
    "label": "Somerville",
    "value": "CA/NB/Somerville"
  },
  {
    "label": "Speerville",
    "value": "CA/NB/Speerville"
  },
  {
    "label": "St Thomas",
    "value": "CA/NB/St Thomas"
  },
  {
    "label": "Stickney",
    "value": "CA/NB/Stickney"
  },
  {
    "label": "Summerfield Carleton Co",
    "value": "CA/NB/Summerfield Carleton Co"
  },
  {
    "label": "Teeds Mills",
    "value": "CA/NB/Teeds Mills"
  },
  {
    "label": "Tracey Mills",
    "value": "CA/NB/Tracey Mills"
  },
  {
    "label": "Union Corner",
    "value": "CA/NB/Union Corner"
  },
  {
    "label": "Upper Brighton",
    "value": "CA/NB/Upper Brighton"
  },
  {
    "label": "Upper Kent",
    "value": "CA/NB/Upper Kent"
  },
  {
    "label": "Upper Knoxford",
    "value": "CA/NB/Upper Knoxford"
  },
  {
    "label": "Upper Woodstock",
    "value": "CA/NB/Upper Woodstock"
  },
  {
    "label": "Victoria Corner",
    "value": "CA/NB/Victoria Corner"
  },
  {
    "label": "Wakefield",
    "value": "CA/NB/Wakefield"
  },
  {
    "label": "Waterville Carleton Co",
    "value": "CA/NB/Waterville Carleton Co"
  },
  {
    "label": "West Florenceville",
    "value": "CA/NB/West Florenceville"
  },
  {
    "label": "Weston",
    "value": "CA/NB/Weston"
  },
  {
    "label": "Wicklow",
    "value": "CA/NB/Wicklow"
  },
  {
    "label": "Williamstown Carleton Co",
    "value": "CA/NB/Williamstown Carleton Co"
  },
  {
    "label": "Wilmot",
    "value": "CA/NB/Wilmot"
  },
  {
    "label": "Windsor",
    "value": "CA/NB/Windsor"
  },
  {
    "label": "Woodstock",
    "value": "CA/NB/Woodstock"
  },
  {
    "label": "Woodstock First Nation",
    "value": "CA/NB/Woodstock First Nation"
  },
  {
    "label": "Andersonville",
    "value": "CA/NB/Andersonville"
  },
  {
    "label": "Back Bay",
    "value": "CA/NB/Back Bay"
  },
  {
    "label": "Baillie",
    "value": "CA/NB/Baillie"
  },
  {
    "label": "Barter Settlement",
    "value": "CA/NB/Barter Settlement"
  },
  {
    "label": "Bartletts Mills",
    "value": "CA/NB/Bartletts Mills"
  },
  {
    "label": "Basswood Ridge",
    "value": "CA/NB/Basswood Ridge"
  },
  {
    "label": "Bayside",
    "value": "CA/NB/Bayside"
  },
  {
    "label": "Beaver Harbour",
    "value": "CA/NB/Beaver Harbour"
  },
  {
    "label": "Bethel",
    "value": "CA/NB/Bethel"
  },
  {
    "label": "Blacks Harbour",
    "value": "CA/NB/Blacks Harbour"
  },
  {
    "label": "Bocabec",
    "value": "CA/NB/Bocabec"
  },
  {
    "label": "Bonny River",
    "value": "CA/NB/Bonny River"
  },
  {
    "label": "Burnt Hill",
    "value": "CA/NB/Burnt Hill"
  },
  {
    "label": "Caithness",
    "value": "CA/NB/Caithness"
  },
  {
    "label": "Calders Head",
    "value": "CA/NB/Calders Head"
  },
  {
    "label": "Canal",
    "value": "CA/NB/Canal"
  },
  {
    "label": "Canoose",
    "value": "CA/NB/Canoose"
  },
  {
    "label": "Chamcook",
    "value": "CA/NB/Chamcook"
  },
  {
    "label": "Chocolate Cove",
    "value": "CA/NB/Chocolate Cove"
  },
  {
    "label": "Crocker Hill",
    "value": "CA/NB/Crocker Hill"
  },
  {
    "label": "Cummings Cove",
    "value": "CA/NB/Cummings Cove"
  },
  {
    "label": "Dewolfe",
    "value": "CA/NB/Dewolfe"
  },
  {
    "label": "Digdeguash",
    "value": "CA/NB/Digdeguash"
  },
  {
    "label": "Dufferin",
    "value": "CA/NB/Dufferin"
  },
  {
    "label": "Dufferin Charlotte Co",
    "value": "CA/NB/Dufferin Charlotte Co"
  },
  {
    "label": "Elmsville",
    "value": "CA/NB/Elmsville"
  },
  {
    "label": "Fairhaven",
    "value": "CA/NB/Fairhaven"
  },
  {
    "label": "Flume Ridge",
    "value": "CA/NB/Flume Ridge"
  },
  {
    "label": "Four Corners",
    "value": "CA/NB/Four Corners"
  },
  {
    "label": "Grand Manan",
    "value": "CA/NB/Grand Manan"
  },
  {
    "label": "Hayman Hill",
    "value": "CA/NB/Hayman Hill"
  },
  {
    "label": "Heathland",
    "value": "CA/NB/Heathland"
  },
  {
    "label": "Hersonville",
    "value": "CA/NB/Hersonville"
  },
  {
    "label": "Hibernia Cove",
    "value": "CA/NB/Hibernia Cove"
  },
  {
    "label": "Honeydale",
    "value": "CA/NB/Honeydale"
  },
  {
    "label": "Indian Island",
    "value": "CA/NB/Indian Island"
  },
  {
    "label": "Johnson Settlement Charlotte Co",
    "value": "CA/NB/Johnson Settlement Charlotte Co"
  },
  {
    "label": "Johnson Settlement York Co",
    "value": "CA/NB/Johnson Settlement York Co"
  },
  {
    "label": "Lambert's Cove",
    "value": "CA/NB/Lambert's Cove"
  },
  {
    "label": "Lambertville",
    "value": "CA/NB/Lambertville"
  },
  {
    "label": "Lawrence Station",
    "value": "CA/NB/Lawrence Station"
  },
  {
    "label": "Lee Settlement",
    "value": "CA/NB/Lee Settlement"
  },
  {
    "label": "Leonardville",
    "value": "CA/NB/Leonardville"
  },
  {
    "label": "Lepreau",
    "value": "CA/NB/Lepreau"
  },
  {
    "label": "Letang",
    "value": "CA/NB/Letang"
  },
  {
    "label": "L'etete",
    "value": "CA/NB/L'etete"
  },
  {
    "label": "Leverville",
    "value": "CA/NB/Leverville"
  },
  {
    "label": "Little Ridge",
    "value": "CA/NB/Little Ridge"
  },
  {
    "label": "Lord's Cove",
    "value": "CA/NB/Lord's Cove"
  },
  {
    "label": "Lynnfield",
    "value": "CA/NB/Lynnfield"
  },
  {
    "label": "Maces Bay",
    "value": "CA/NB/Maces Bay"
  },
  {
    "label": "Mascarene",
    "value": "CA/NB/Mascarene"
  },
  {
    "label": "Mayfield",
    "value": "CA/NB/Mayfield"
  },
  {
    "label": "Ministers Island",
    "value": "CA/NB/Ministers Island"
  },
  {
    "label": "Mohannes",
    "value": "CA/NB/Mohannes"
  },
  {
    "label": "Moores Mills",
    "value": "CA/NB/Moores Mills"
  },
  {
    "label": "New River Beach",
    "value": "CA/NB/New River Beach"
  },
  {
    "label": "Northern Harbour",
    "value": "CA/NB/Northern Harbour"
  },
  {
    "label": "Oak Bay",
    "value": "CA/NB/Oak Bay"
  },
  {
    "label": "Oak Haven",
    "value": "CA/NB/Oak Haven"
  },
  {
    "label": "Oak Hill",
    "value": "CA/NB/Oak Hill"
  },
  {
    "label": "Old Ridge",
    "value": "CA/NB/Old Ridge"
  },
  {
    "label": "Pennfield",
    "value": "CA/NB/Pennfield"
  },
  {
    "label": "Pleasant Ridge Char County",
    "value": "CA/NB/Pleasant Ridge Char County"
  },
  {
    "label": "Pocologan",
    "value": "CA/NB/Pocologan"
  },
  {
    "label": "Pomeroy Ridge",
    "value": "CA/NB/Pomeroy Ridge"
  },
  {
    "label": "Richardson",
    "value": "CA/NB/Richardson"
  },
  {
    "label": "Rollingdam",
    "value": "CA/NB/Rollingdam"
  },
  {
    "label": "Scotch Ridge",
    "value": "CA/NB/Scotch Ridge"
  },
  {
    "label": "Second Falls",
    "value": "CA/NB/Second Falls"
  },
  {
    "label": "Seeleys Cove",
    "value": "CA/NB/Seeleys Cove"
  },
  {
    "label": "South Oromocto Lake",
    "value": "CA/NB/South Oromocto Lake"
  },
  {
    "label": "St Andrews",
    "value": "CA/NB/St Andrews"
  },
  {
    "label": "St David Ridge",
    "value": "CA/NB/St David Ridge"
  },
  {
    "label": "St George",
    "value": "CA/NB/St George"
  },
  {
    "label": "St Stephen",
    "value": "CA/NB/St Stephen"
  },
  {
    "label": "Stuart Town",
    "value": "CA/NB/Stuart Town"
  },
  {
    "label": "Tower Hill",
    "value": "CA/NB/Tower Hill"
  },
  {
    "label": "Upper Letang",
    "value": "CA/NB/Upper Letang"
  },
  {
    "label": "Upper Mills",
    "value": "CA/NB/Upper Mills"
  },
  {
    "label": "Utopia",
    "value": "CA/NB/Utopia"
  },
  {
    "label": "Valley Road",
    "value": "CA/NB/Valley Road"
  },
  {
    "label": "Waweig",
    "value": "CA/NB/Waweig"
  },
  {
    "label": "Welshpool",
    "value": "CA/NB/Welshpool"
  },
  {
    "label": "White Head",
    "value": "CA/NB/White Head"
  },
  {
    "label": "White Head Island",
    "value": "CA/NB/White Head Island"
  },
  {
    "label": "Wilsons Beach",
    "value": "CA/NB/Wilsons Beach"
  },
  {
    "label": "Alcida",
    "value": "CA/NB/Alcida"
  },
  {
    "label": "Alderwood",
    "value": "CA/NB/Alderwood"
  },
  {
    "label": "Allardville",
    "value": "CA/NB/Allardville"
  },
  {
    "label": "Anse-Bleue",
    "value": "CA/NB/Anse-Bleue"
  },
  {
    "label": "Baie De Petit-Pokemouche",
    "value": "CA/NB/Baie De Petit-Pokemouche"
  },
  {
    "label": "Bas-Caraquet",
    "value": "CA/NB/Bas-Caraquet"
  },
  {
    "label": "Bas-Paquetville",
    "value": "CA/NB/Bas-Paquetville"
  },
  {
    "label": "Bathurst",
    "value": "CA/NB/Bathurst"
  },
  {
    "label": "Benoit",
    "value": "CA/NB/Benoit"
  },
  {
    "label": "Beresford",
    "value": "CA/NB/Beresford"
  },
  {
    "label": "Bertrand",
    "value": "CA/NB/Bertrand"
  },
  {
    "label": "Big River",
    "value": "CA/NB/Big River"
  },
  {
    "label": "Black Rock",
    "value": "CA/NB/Black Rock"
  },
  {
    "label": "Bois-Blanc",
    "value": "CA/NB/Bois-Blanc"
  },
  {
    "label": "Bois-Gagnon",
    "value": "CA/NB/Bois-Gagnon"
  },
  {
    "label": "Brunswick Mines",
    "value": "CA/NB/Brunswick Mines"
  },
  {
    "label": "Burnsville",
    "value": "CA/NB/Burnsville"
  },
  {
    "label": "Canobie",
    "value": "CA/NB/Canobie"
  },
  {
    "label": "Canton Des Basques",
    "value": "CA/NB/Canton Des Basques"
  },
  {
    "label": "Cap-Bateau",
    "value": "CA/NB/Cap-Bateau"
  },
  {
    "label": "Caraquet",
    "value": "CA/NB/Caraquet"
  },
  {
    "label": "Chamberlain Settlement",
    "value": "CA/NB/Chamberlain Settlement"
  },
  {
    "label": "Chiasson Office",
    "value": "CA/NB/Chiasson Office"
  },
  {
    "label": "Clifton",
    "value": "CA/NB/Clifton"
  },
  {
    "label": "Coteau Road",
    "value": "CA/NB/Coteau Road"
  },
  {
    "label": "Dauversiere",
    "value": "CA/NB/Dauversiere"
  },
  {
    "label": "Dugas",
    "value": "CA/NB/Dugas"
  },
  {
    "label": "Duguayville",
    "value": "CA/NB/Duguayville"
  },
  {
    "label": "Dunlop",
    "value": "CA/NB/Dunlop"
  },
  {
    "label": "Evangeline",
    "value": "CA/NB/Evangeline"
  },
  {
    "label": "Four Roads",
    "value": "CA/NB/Four Roads"
  },
  {
    "label": "Free Grant",
    "value": "CA/NB/Free Grant"
  },
  {
    "label": "Gauvreau",
    "value": "CA/NB/Gauvreau"
  },
  {
    "label": "Gloucester Junction",
    "value": "CA/NB/Gloucester Junction"
  },
  {
    "label": "Goodwin Mill",
    "value": "CA/NB/Goodwin Mill"
  },
  {
    "label": "Grande-Anse",
    "value": "CA/NB/Grande-Anse"
  },
  {
    "label": "Hacheyville",
    "value": "CA/NB/Hacheyville"
  },
  {
    "label": "Haut-Lameque",
    "value": "CA/NB/Haut-Lameque"
  },
  {
    "label": "Haut-Paquetville",
    "value": "CA/NB/Haut-Paquetville"
  },
  {
    "label": "Haut-Sheila",
    "value": "CA/NB/Haut-Sheila"
  },
  {
    "label": "Haut-Shippagan",
    "value": "CA/NB/Haut-Shippagan"
  },
  {
    "label": "Inkerman",
    "value": "CA/NB/Inkerman"
  },
  {
    "label": "Inkerman Ferry",
    "value": "CA/NB/Inkerman Ferry"
  },
  {
    "label": "Janeville",
    "value": "CA/NB/Janeville"
  },
  {
    "label": "Lameque",
    "value": "CA/NB/Lameque"
  },
  {
    "label": "Landry Office",
    "value": "CA/NB/Landry Office"
  },
  {
    "label": "Laplante",
    "value": "CA/NB/Laplante"
  },
  {
    "label": "Le Goulet",
    "value": "CA/NB/Le Goulet"
  },
  {
    "label": "Leech",
    "value": "CA/NB/Leech"
  },
  {
    "label": "Little River Gloucester Co",
    "value": "CA/NB/Little River Gloucester Co"
  },
  {
    "label": "Losier Settlement",
    "value": "CA/NB/Losier Settlement"
  },
  {
    "label": "Lugar",
    "value": "CA/NB/Lugar"
  },
  {
    "label": "Madran",
    "value": "CA/NB/Madran"
  },
  {
    "label": "Maisonnette",
    "value": "CA/NB/Maisonnette"
  },
  {
    "label": "Maltempec",
    "value": "CA/NB/Maltempec"
  },
  {
    "label": "Middle River",
    "value": "CA/NB/Middle River"
  },
  {
    "label": "Miramichi Road",
    "value": "CA/NB/Miramichi Road"
  },
  {
    "label": "Miscou",
    "value": "CA/NB/Miscou"
  },
  {
    "label": "Nepisiguit Falls",
    "value": "CA/NB/Nepisiguit Falls"
  },
  {
    "label": "New Bandon Gloucester Co",
    "value": "CA/NB/New Bandon Gloucester Co"
  },
  {
    "label": "Nicholas Denys",
    "value": "CA/NB/Nicholas Denys"
  },
  {
    "label": "Nigadoo",
    "value": "CA/NB/Nigadoo"
  },
  {
    "label": "North Tetagouche",
    "value": "CA/NB/North Tetagouche"
  },
  {
    "label": "Notre-Dame-Des-Erables",
    "value": "CA/NB/Notre-Dame-Des-Erables"
  },
  {
    "label": "Pabineau Falls",
    "value": "CA/NB/Pabineau Falls"
  },
  {
    "label": "Pabineau First Nation",
    "value": "CA/NB/Pabineau First Nation"
  },
  {
    "label": "Paquetville",
    "value": "CA/NB/Paquetville"
  },
  {
    "label": "Petit-Paquetville",
    "value": "CA/NB/Petit-Paquetville"
  },
  {
    "label": "Petit-Rocher",
    "value": "CA/NB/Petit-Rocher"
  },
  {
    "label": "Petit-Rocher-Nord",
    "value": "CA/NB/Petit-Rocher-Nord"
  },
  {
    "label": "Petit-Rocher-Ouest",
    "value": "CA/NB/Petit-Rocher-Ouest"
  },
  {
    "label": "Petit-Rocher-Sud",
    "value": "CA/NB/Petit-Rocher-Sud"
  },
  {
    "label": "Petit-Shippagan",
    "value": "CA/NB/Petit-Shippagan"
  },
  {
    "label": "Petit Tracadie",
    "value": "CA/NB/Petit Tracadie"
  },
  {
    "label": "Petite-Lameque",
    "value": "CA/NB/Petite-Lameque"
  },
  {
    "label": "Petite-Riviere-De-L'ile",
    "value": "CA/NB/Petite-Riviere-De-L'ile"
  },
  {
    "label": "Pigeon Hill",
    "value": "CA/NB/Pigeon Hill"
  },
  {
    "label": "Pointe A Bouleau",
    "value": "CA/NB/Pointe A Bouleau"
  },
  {
    "label": "Pointe A Tom",
    "value": "CA/NB/Pointe A Tom"
  },
  {
    "label": "Pointe-Alexandre",
    "value": "CA/NB/Pointe-Alexandre"
  },
  {
    "label": "Pointe-Brule",
    "value": "CA/NB/Pointe-Brule"
  },
  {
    "label": "Pointe-Canot",
    "value": "CA/NB/Pointe-Canot"
  },
  {
    "label": "Pointe Des Robichaud",
    "value": "CA/NB/Pointe Des Robichaud"
  },
  {
    "label": "Pointe-Sauvage",
    "value": "CA/NB/Pointe-Sauvage"
  },
  {
    "label": "Pointe-Verte",
    "value": "CA/NB/Pointe-Verte"
  },
  {
    "label": "Poirier Subdivision",
    "value": "CA/NB/Poirier Subdivision"
  },
  {
    "label": "Pokemouche",
    "value": "CA/NB/Pokemouche"
  },
  {
    "label": "Pokeshaw",
    "value": "CA/NB/Pokeshaw"
  },
  {
    "label": "Pokesudie",
    "value": "CA/NB/Pokesudie"
  },
  {
    "label": "Pont Lafrance",
    "value": "CA/NB/Pont Lafrance"
  },
  {
    "label": "Pont Landry",
    "value": "CA/NB/Pont Landry"
  },
  {
    "label": "Rang-Saint-Georges",
    "value": "CA/NB/Rang-Saint-Georges"
  },
  {
    "label": "Rio Grande",
    "value": "CA/NB/Rio Grande"
  },
  {
    "label": "Riviere A La Truite",
    "value": "CA/NB/Riviere A La Truite"
  },
  {
    "label": "Riviere Du Nord",
    "value": "CA/NB/Riviere Du Nord"
  },
  {
    "label": "Robertville",
    "value": "CA/NB/Robertville"
  },
  {
    "label": "Rocheville",
    "value": "CA/NB/Rocheville"
  },
  {
    "label": "Rosehill",
    "value": "CA/NB/Rosehill"
  },
  {
    "label": "Rough Waters",
    "value": "CA/NB/Rough Waters"
  },
  {
    "label": "Saint-Amateur",
    "value": "CA/NB/Saint-Amateur"
  },
  {
    "label": "Saint-Irenee",
    "value": "CA/NB/Saint-Irenee"
  },
  {
    "label": "Saint-Isidore",
    "value": "CA/NB/Saint-Isidore"
  },
  {
    "label": "Saint-Laurent",
    "value": "CA/NB/Saint-Laurent"
  },
  {
    "label": "Saint-Laurent Nord",
    "value": "CA/NB/Saint-Laurent Nord"
  },
  {
    "label": "Saint-Leolin",
    "value": "CA/NB/Saint-Leolin"
  },
  {
    "label": "Saint-Sauveur",
    "value": "CA/NB/Saint-Sauveur"
  },
  {
    "label": "Saint-Simon",
    "value": "CA/NB/Saint-Simon"
  },
  {
    "label": "Sainte-Anne Gloucester Co",
    "value": "CA/NB/Sainte-Anne Gloucester Co"
  },
  {
    "label": "Sainte-Cecile",
    "value": "CA/NB/Sainte-Cecile"
  },
  {
    "label": "Sainte-Louise",
    "value": "CA/NB/Sainte-Louise"
  },
  {
    "label": "Sainte-Marie-Saint-Raphael",
    "value": "CA/NB/Sainte-Marie-Saint-Raphael"
  },
  {
    "label": "Sainte Rose",
    "value": "CA/NB/Sainte Rose"
  },
  {
    "label": "Sainte-Rosette",
    "value": "CA/NB/Sainte-Rosette"
  },
  {
    "label": "Sainte-Therese Sud",
    "value": "CA/NB/Sainte-Therese Sud"
  },
  {
    "label": "Salisbury West",
    "value": "CA/NB/Salisbury West"
  },
  {
    "label": "Salmon Beach",
    "value": "CA/NB/Salmon Beach"
  },
  {
    "label": "Saumarez",
    "value": "CA/NB/Saumarez"
  },
  {
    "label": "Savoie Landing",
    "value": "CA/NB/Savoie Landing"
  },
  {
    "label": "Shippagan",
    "value": "CA/NB/Shippagan"
  },
  {
    "label": "Six Roads",
    "value": "CA/NB/Six Roads"
  },
  {
    "label": "Sormany",
    "value": "CA/NB/Sormany"
  },
  {
    "label": "South Tetagouche",
    "value": "CA/NB/South Tetagouche"
  },
  {
    "label": "St Pons",
    "value": "CA/NB/St Pons"
  },
  {
    "label": "Stonehaven",
    "value": "CA/NB/Stonehaven"
  },
  {
    "label": "Tetagouche Falls",
    "value": "CA/NB/Tetagouche Falls"
  },
  {
    "label": "Tilley",
    "value": "CA/NB/Tilley"
  },
  {
    "label": "Tilley Road",
    "value": "CA/NB/Tilley Road"
  },
  {
    "label": "Tracadie Beach",
    "value": "CA/NB/Tracadie Beach"
  },
  {
    "label": "Tracadie-Sheila",
    "value": "CA/NB/Tracadie-Sheila"
  },
  {
    "label": "Tremblay",
    "value": "CA/NB/Tremblay"
  },
  {
    "label": "Trudel",
    "value": "CA/NB/Trudel"
  },
  {
    "label": "Val Comeau",
    "value": "CA/NB/Val Comeau"
  },
  {
    "label": "Val-Doucet",
    "value": "CA/NB/Val-Doucet"
  },
  {
    "label": "Village Blanchard",
    "value": "CA/NB/Village Blanchard"
  },
  {
    "label": "Village-Des-Poirier",
    "value": "CA/NB/Village-Des-Poirier"
  },
  {
    "label": "Acadie Siding",
    "value": "CA/NB/Acadie Siding"
  },
  {
    "label": "Acadieville",
    "value": "CA/NB/Acadieville"
  },
  {
    "label": "Adamsville",
    "value": "CA/NB/Adamsville"
  },
  {
    "label": "Aldouane",
    "value": "CA/NB/Aldouane"
  },
  {
    "label": "Baie De Bouctouche",
    "value": "CA/NB/Baie De Bouctouche"
  },
  {
    "label": "Balla Philip",
    "value": "CA/NB/Balla Philip"
  },
  {
    "label": "Bass River",
    "value": "CA/NB/Bass River"
  },
  {
    "label": "Beersville",
    "value": "CA/NB/Beersville"
  },
  {
    "label": "Birch Ridge",
    "value": "CA/NB/Birch Ridge"
  },
  {
    "label": "Bouctouche",
    "value": "CA/NB/Bouctouche"
  },
  {
    "label": "Bouctouche Cove",
    "value": "CA/NB/Bouctouche Cove"
  },
  {
    "label": "Bouctouche Reserve",
    "value": "CA/NB/Bouctouche Reserve"
  },
  {
    "label": "Bouctouche Sud",
    "value": "CA/NB/Bouctouche Sud"
  },
  {
    "label": "Browns Yard",
    "value": "CA/NB/Browns Yard"
  },
  {
    "label": "Cails Mills",
    "value": "CA/NB/Cails Mills"
  },
  {
    "label": "Canisto",
    "value": "CA/NB/Canisto"
  },
  {
    "label": "Childs Creek",
    "value": "CA/NB/Childs Creek"
  },
  {
    "label": "Clairville",
    "value": "CA/NB/Clairville"
  },
  {
    "label": "Coal Branch",
    "value": "CA/NB/Coal Branch"
  },
  {
    "label": "Cocagne",
    "value": "CA/NB/Cocagne"
  },
  {
    "label": "Dundas",
    "value": "CA/NB/Dundas"
  },
  {
    "label": "East Branch",
    "value": "CA/NB/East Branch"
  },
  {
    "label": "Eel River Bar First Nation",
    "value": "CA/NB/Eel River Bar First Nation"
  },
  {
    "label": "Elsipogtog First Nation",
    "value": "CA/NB/Elsipogtog First Nation"
  },
  {
    "label": "Ford Bank",
    "value": "CA/NB/Ford Bank"
  },
  {
    "label": "Fords Mills",
    "value": "CA/NB/Fords Mills"
  },
  {
    "label": "Galloway",
    "value": "CA/NB/Galloway"
  },
  {
    "label": "Gladeside",
    "value": "CA/NB/Gladeside"
  },
  {
    "label": "Grande-Digue",
    "value": "CA/NB/Grande-Digue"
  },
  {
    "label": "Harcourt",
    "value": "CA/NB/Harcourt"
  },
  {
    "label": "Haut-Saint-Antoine",
    "value": "CA/NB/Haut-Saint-Antoine"
  },
  {
    "label": "Hebert",
    "value": "CA/NB/Hebert"
  },
  {
    "label": "Jardineville",
    "value": "CA/NB/Jardineville"
  },
  {
    "label": "Kent Junction",
    "value": "CA/NB/Kent Junction"
  },
  {
    "label": "Kouchibouguac",
    "value": "CA/NB/Kouchibouguac"
  },
  {
    "label": "Kouchibouguac National Park",
    "value": "CA/NB/Kouchibouguac National Park"
  },
  {
    "label": "Main River",
    "value": "CA/NB/Main River"
  },
  {
    "label": "Mcintosh Hill",
    "value": "CA/NB/Mcintosh Hill"
  },
  {
    "label": "Mckees Mills",
    "value": "CA/NB/Mckees Mills"
  },
  {
    "label": "Mundleville",
    "value": "CA/NB/Mundleville"
  },
  {
    "label": "Noinville",
    "value": "CA/NB/Noinville"
  },
  {
    "label": "Notre-Dame",
    "value": "CA/NB/Notre-Dame"
  },
  {
    "label": "Pelerin",
    "value": "CA/NB/Pelerin"
  },
  {
    "label": "Pine Ridge",
    "value": "CA/NB/Pine Ridge"
  },
  {
    "label": "Pointe Dixon Point",
    "value": "CA/NB/Pointe Dixon Point"
  },
  {
    "label": "Pointe-Sapin",
    "value": "CA/NB/Pointe-Sapin"
  },
  {
    "label": "Portage St-Louis",
    "value": "CA/NB/Portage St-Louis"
  },
  {
    "label": "Redmondville",
    "value": "CA/NB/Redmondville"
  },
  {
    "label": "Renauds Mills",
    "value": "CA/NB/Renauds Mills"
  },
  {
    "label": "Rexton",
    "value": "CA/NB/Rexton"
  },
  {
    "label": "Richibouctou-Village",
    "value": "CA/NB/Richibouctou-Village"
  },
  {
    "label": "Richibucto",
    "value": "CA/NB/Richibucto"
  },
  {
    "label": "Richibucto-Village",
    "value": "CA/NB/Richibucto-Village"
  },
  {
    "label": "Rogersville-Est",
    "value": "CA/NB/Rogersville-Est"
  },
  {
    "label": "Rogersville-Ouest",
    "value": "CA/NB/Rogersville-Ouest"
  },
  {
    "label": "Saint-Antoine",
    "value": "CA/NB/Saint-Antoine"
  },
  {
    "label": "Saint-Antoine-De-Kent",
    "value": "CA/NB/Saint-Antoine-De-Kent"
  },
  {
    "label": "Saint-Antoine Sud",
    "value": "CA/NB/Saint-Antoine Sud"
  },
  {
    "label": "Saint-Charles",
    "value": "CA/NB/Saint-Charles"
  },
  {
    "label": "Saint-Damien",
    "value": "CA/NB/Saint-Damien"
  },
  {
    "label": "Saint-Edouard-De-Kent",
    "value": "CA/NB/Saint-Edouard-De-Kent"
  },
  {
    "label": "Saint-Gregoire",
    "value": "CA/NB/Saint-Gregoire"
  },
  {
    "label": "Saint-Ignace",
    "value": "CA/NB/Saint-Ignace"
  },
  {
    "label": "Saint-Joseph-De-Kent",
    "value": "CA/NB/Saint-Joseph-De-Kent"
  },
  {
    "label": "Saint-Louis",
    "value": "CA/NB/Saint-Louis"
  },
  {
    "label": "Saint-Louis-De-Kent",
    "value": "CA/NB/Saint-Louis-De-Kent"
  },
  {
    "label": "Saint-Maurice",
    "value": "CA/NB/Saint-Maurice"
  },
  {
    "label": "Saint-Norbert",
    "value": "CA/NB/Saint-Norbert"
  },
  {
    "label": "Saint-Paul",
    "value": "CA/NB/Saint-Paul"
  },
  {
    "label": "Saint-Thomas-De-Kent",
    "value": "CA/NB/Saint-Thomas-De-Kent"
  },
  {
    "label": "Sainte-Anne-De-Kent",
    "value": "CA/NB/Sainte-Anne-De-Kent"
  },
  {
    "label": "Sainte-Marie-De-Kent",
    "value": "CA/NB/Sainte-Marie-De-Kent"
  },
  {
    "label": "Salmon River Road",
    "value": "CA/NB/Salmon River Road"
  },
  {
    "label": "Shediac Bridge-Shediac River",
    "value": "CA/NB/Shediac Bridge-Shediac River"
  },
  {
    "label": "Smith's Corner",
    "value": "CA/NB/Smith's Corner"
  },
  {
    "label": "South Branch Kent Co",
    "value": "CA/NB/South Branch Kent Co"
  },
  {
    "label": "St-Antoine Nord",
    "value": "CA/NB/St-Antoine Nord"
  },
  {
    "label": "Targettville",
    "value": "CA/NB/Targettville"
  },
  {
    "label": "Upper Rexton",
    "value": "CA/NB/Upper Rexton"
  },
  {
    "label": "West Branch",
    "value": "CA/NB/West Branch"
  },
  {
    "label": "Anagance",
    "value": "CA/NB/Anagance"
  },
  {
    "label": "Apohaqui",
    "value": "CA/NB/Apohaqui"
  },
  {
    "label": "Barnesville",
    "value": "CA/NB/Barnesville"
  },
  {
    "label": "Bayswater",
    "value": "CA/NB/Bayswater"
  },
  {
    "label": "Belleisle Creek",
    "value": "CA/NB/Belleisle Creek"
  },
  {
    "label": "Berwick",
    "value": "CA/NB/Berwick"
  },
  {
    "label": "Bloomfield Kings Co",
    "value": "CA/NB/Bloomfield Kings Co"
  },
  {
    "label": "Browns Flat",
    "value": "CA/NB/Browns Flat"
  },
  {
    "label": "Carsonville",
    "value": "CA/NB/Carsonville"
  },
  {
    "label": "Carters Point",
    "value": "CA/NB/Carters Point"
  },
  {
    "label": "Cassidy Lake",
    "value": "CA/NB/Cassidy Lake"
  },
  {
    "label": "Cedar Camp",
    "value": "CA/NB/Cedar Camp"
  },
  {
    "label": "Central Greenwich",
    "value": "CA/NB/Central Greenwich"
  },
  {
    "label": "Chambers Settlement",
    "value": "CA/NB/Chambers Settlement"
  },
  {
    "label": "Clifton Royal",
    "value": "CA/NB/Clifton Royal"
  },
  {
    "label": "Clover Hill",
    "value": "CA/NB/Clover Hill"
  },
  {
    "label": "Collina",
    "value": "CA/NB/Collina"
  },
  {
    "label": "Cornhill",
    "value": "CA/NB/Cornhill"
  },
  {
    "label": "Damascus",
    "value": "CA/NB/Damascus"
  },
  {
    "label": "Darlings Island",
    "value": "CA/NB/Darlings Island"
  },
  {
    "label": "Donegal",
    "value": "CA/NB/Donegal"
  },
  {
    "label": "Drurys Cove",
    "value": "CA/NB/Drurys Cove"
  },
  {
    "label": "Dubee Settlement",
    "value": "CA/NB/Dubee Settlement"
  },
  {
    "label": "Dunsinane",
    "value": "CA/NB/Dunsinane"
  },
  {
    "label": "Dutch Valley",
    "value": "CA/NB/Dutch Valley"
  },
  {
    "label": "Erb Settlement",
    "value": "CA/NB/Erb Settlement"
  },
  {
    "label": "Erbs Cove",
    "value": "CA/NB/Erbs Cove"
  },
  {
    "label": "Evandale",
    "value": "CA/NB/Evandale"
  },
  {
    "label": "French Village Kings Co",
    "value": "CA/NB/French Village Kings Co"
  },
  {
    "label": "Glenwood Kings Co",
    "value": "CA/NB/Glenwood Kings Co"
  },
  {
    "label": "Grand Bay-Westfield",
    "value": "CA/NB/Grand Bay-Westfield"
  },
  {
    "label": "Hammondvale",
    "value": "CA/NB/Hammondvale"
  },
  {
    "label": "Hampton",
    "value": "CA/NB/Hampton"
  },
  {
    "label": "Hanford Brook",
    "value": "CA/NB/Hanford Brook"
  },
  {
    "label": "Hatfield Point",
    "value": "CA/NB/Hatfield Point"
  },
  {
    "label": "Havelock",
    "value": "CA/NB/Havelock"
  },
  {
    "label": "Head Of Millstream",
    "value": "CA/NB/Head Of Millstream"
  },
  {
    "label": "Hillsdale",
    "value": "CA/NB/Hillsdale"
  },
  {
    "label": "Jeffries Corner",
    "value": "CA/NB/Jeffries Corner"
  },
  {
    "label": "Jordan Mountain",
    "value": "CA/NB/Jordan Mountain"
  },
  {
    "label": "Kars",
    "value": "CA/NB/Kars"
  },
  {
    "label": "Kierstead Mountain",
    "value": "CA/NB/Kierstead Mountain"
  },
  {
    "label": "Kiersteadville",
    "value": "CA/NB/Kiersteadville"
  },
  {
    "label": "Kingston",
    "value": "CA/NB/Kingston"
  },
  {
    "label": "Knightville",
    "value": "CA/NB/Knightville"
  },
  {
    "label": "Lakeside",
    "value": "CA/NB/Lakeside"
  },
  {
    "label": "Laketon",
    "value": "CA/NB/Laketon"
  },
  {
    "label": "Little Salmon River West",
    "value": "CA/NB/Little Salmon River West"
  },
  {
    "label": "Londonderry",
    "value": "CA/NB/Londonderry"
  },
  {
    "label": "Long Point",
    "value": "CA/NB/Long Point"
  },
  {
    "label": "Long Reach",
    "value": "CA/NB/Long Reach"
  },
  {
    "label": "Long Settlement Kings Co",
    "value": "CA/NB/Long Settlement Kings Co"
  },
  {
    "label": "Lower Cove",
    "value": "CA/NB/Lower Cove"
  },
  {
    "label": "Lower Greenwich",
    "value": "CA/NB/Lower Greenwich"
  },
  {
    "label": "Lower Millstream",
    "value": "CA/NB/Lower Millstream"
  },
  {
    "label": "Lower Norton",
    "value": "CA/NB/Lower Norton"
  },
  {
    "label": "Mannhurst",
    "value": "CA/NB/Mannhurst"
  },
  {
    "label": "Markhamville",
    "value": "CA/NB/Markhamville"
  },
  {
    "label": "Marrtown",
    "value": "CA/NB/Marrtown"
  },
  {
    "label": "Mechanic Settlement",
    "value": "CA/NB/Mechanic Settlement"
  },
  {
    "label": "Midland Kings Co",
    "value": "CA/NB/Midland Kings Co"
  },
  {
    "label": "Mill Brook",
    "value": "CA/NB/Mill Brook"
  },
  {
    "label": "Moosehorn Creek",
    "value": "CA/NB/Moosehorn Creek"
  },
  {
    "label": "Morrisdale",
    "value": "CA/NB/Morrisdale"
  },
  {
    "label": "Mount Hebron",
    "value": "CA/NB/Mount Hebron"
  },
  {
    "label": "Mount Pisgah",
    "value": "CA/NB/Mount Pisgah"
  },
  {
    "label": "Mt Middleton",
    "value": "CA/NB/Mt Middleton"
  },
  {
    "label": "Nauwigewauk",
    "value": "CA/NB/Nauwigewauk"
  },
  {
    "label": "Nerepis",
    "value": "CA/NB/Nerepis"
  },
  {
    "label": "New Canaan",
    "value": "CA/NB/New Canaan"
  },
  {
    "label": "New Line",
    "value": "CA/NB/New Line"
  },
  {
    "label": "Newtown",
    "value": "CA/NB/Newtown"
  },
  {
    "label": "Norton",
    "value": "CA/NB/Norton"
  },
  {
    "label": "Oak Point Kings Co",
    "value": "CA/NB/Oak Point Kings Co"
  },
  {
    "label": "Parlee Brook",
    "value": "CA/NB/Parlee Brook"
  },
  {
    "label": "Parleeville",
    "value": "CA/NB/Parleeville"
  },
  {
    "label": "Passekeag",
    "value": "CA/NB/Passekeag"
  },
  {
    "label": "Pearsonville",
    "value": "CA/NB/Pearsonville"
  },
  {
    "label": "Penobsquis",
    "value": "CA/NB/Penobsquis"
  },
  {
    "label": "Perry Settlement",
    "value": "CA/NB/Perry Settlement"
  },
  {
    "label": "Picadilly",
    "value": "CA/NB/Picadilly"
  },
  {
    "label": "Pleasant Ridge Kings Co",
    "value": "CA/NB/Pleasant Ridge Kings Co"
  },
  {
    "label": "Plumweseep",
    "value": "CA/NB/Plumweseep"
  },
  {
    "label": "Poodiac",
    "value": "CA/NB/Poodiac"
  },
  {
    "label": "Portage Vale",
    "value": "CA/NB/Portage Vale"
  },
  {
    "label": "Public Landing",
    "value": "CA/NB/Public Landing"
  },
  {
    "label": "Quispamsis",
    "value": "CA/NB/Quispamsis"
  },
  {
    "label": "Ratter Corner",
    "value": "CA/NB/Ratter Corner"
  },
  {
    "label": "Richibucto Road",
    "value": "CA/NB/Richibucto Road"
  },
  {
    "label": "Riverbank Kings Co",
    "value": "CA/NB/Riverbank Kings Co"
  },
  {
    "label": "Riverbank South",
    "value": "CA/NB/Riverbank South"
  },
  {
    "label": "Roachville",
    "value": "CA/NB/Roachville"
  },
  {
    "label": "Rothesay",
    "value": "CA/NB/Rothesay"
  },
  {
    "label": "Salt Springs",
    "value": "CA/NB/Salt Springs"
  },
  {
    "label": "Searsville",
    "value": "CA/NB/Searsville"
  },
  {
    "label": "Smiths Creek",
    "value": "CA/NB/Smiths Creek"
  },
  {
    "label": "Smithtown",
    "value": "CA/NB/Smithtown"
  },
  {
    "label": "Snider Mountain",
    "value": "CA/NB/Snider Mountain"
  },
  {
    "label": "South Branch Kings Co",
    "value": "CA/NB/South Branch Kings Co"
  },
  {
    "label": "Southfield",
    "value": "CA/NB/Southfield"
  },
  {
    "label": "Springdale",
    "value": "CA/NB/Springdale"
  },
  {
    "label": "Springfield Kings Co",
    "value": "CA/NB/Springfield Kings Co"
  },
  {
    "label": "Summerfield Kings Co",
    "value": "CA/NB/Summerfield Kings Co"
  },
  {
    "label": "Summerville",
    "value": "CA/NB/Summerville"
  },
  {
    "label": "Sussex",
    "value": "CA/NB/Sussex"
  },
  {
    "label": "Sussex Corner",
    "value": "CA/NB/Sussex Corner"
  },
  {
    "label": "Sussex East",
    "value": "CA/NB/Sussex East"
  },
  {
    "label": "Sussex South",
    "value": "CA/NB/Sussex South"
  },
  {
    "label": "Titusville",
    "value": "CA/NB/Titusville"
  },
  {
    "label": "Upham",
    "value": "CA/NB/Upham"
  },
  {
    "label": "Upper Golden Grove",
    "value": "CA/NB/Upper Golden Grove"
  },
  {
    "label": "Upperton",
    "value": "CA/NB/Upperton"
  },
  {
    "label": "Vinegar Hill",
    "value": "CA/NB/Vinegar Hill"
  },
  {
    "label": "Walker Settlement",
    "value": "CA/NB/Walker Settlement"
  },
  {
    "label": "Wards Creek",
    "value": "CA/NB/Wards Creek"
  },
  {
    "label": "Waterford",
    "value": "CA/NB/Waterford"
  },
  {
    "label": "Whites Mountain",
    "value": "CA/NB/Whites Mountain"
  },
  {
    "label": "Woodmans Point",
    "value": "CA/NB/Woodmans Point"
  },
  {
    "label": "Baker Brook",
    "value": "CA/NB/Baker Brook"
  },
  {
    "label": "Clair",
    "value": "CA/NB/Clair"
  },
  {
    "label": "Edmundston",
    "value": "CA/NB/Edmundston"
  },
  {
    "label": "Lac Baker",
    "value": "CA/NB/Lac Baker"
  },
  {
    "label": "Madawaska Maliseet First Nation",
    "value": "CA/NB/Madawaska Maliseet First Nation"
  },
  {
    "label": "Notre Dame De Lourdes",
    "value": "CA/NB/Notre Dame De Lourdes"
  },
  {
    "label": "Riviere-Verte",
    "value": "CA/NB/Riviere-Verte"
  },
  {
    "label": "Saint-Andre",
    "value": "CA/NB/Saint-Andre"
  },
  {
    "label": "Saint-Basile",
    "value": "CA/NB/Saint-Basile"
  },
  {
    "label": "Saint-Francois-De-Madawaska",
    "value": "CA/NB/Saint-Francois-De-Madawaska"
  },
  {
    "label": "Saint-Jacques",
    "value": "CA/NB/Saint-Jacques"
  },
  {
    "label": "Saint-Leonard",
    "value": "CA/NB/Saint-Leonard"
  },
  {
    "label": "Saint-Leonard-Parent",
    "value": "CA/NB/Saint-Leonard-Parent"
  },
  {
    "label": "Sainte-Anne-De-Madawaska",
    "value": "CA/NB/Sainte-Anne-De-Madawaska"
  },
  {
    "label": "Siegas",
    "value": "CA/NB/Siegas"
  },
  {
    "label": "St-Hilaire",
    "value": "CA/NB/St-Hilaire"
  },
  {
    "label": "St-Joseph-De-Madawaska",
    "value": "CA/NB/St-Joseph-De-Madawaska"
  },
  {
    "label": "Verret",
    "value": "CA/NB/Verret"
  },
  {
    "label": "Allainville",
    "value": "CA/NB/Allainville"
  },
  {
    "label": "Arbeau Settlement",
    "value": "CA/NB/Arbeau Settlement"
  },
  {
    "label": "Baie-Sainte-Anne",
    "value": "CA/NB/Baie-Sainte-Anne"
  },
  {
    "label": "Barnaby",
    "value": "CA/NB/Barnaby"
  },
  {
    "label": "Barnettville",
    "value": "CA/NB/Barnettville"
  },
  {
    "label": "Barryville",
    "value": "CA/NB/Barryville"
  },
  {
    "label": "Bartholomew",
    "value": "CA/NB/Bartholomew"
  },
  {
    "label": "Bartibog",
    "value": "CA/NB/Bartibog"
  },
  {
    "label": "Bartibog Bridge",
    "value": "CA/NB/Bartibog Bridge"
  },
  {
    "label": "Bay Du Vin",
    "value": "CA/NB/Bay Du Vin"
  },
  {
    "label": "Beaverbrook",
    "value": "CA/NB/Beaverbrook"
  },
  {
    "label": "Bellefond",
    "value": "CA/NB/Bellefond"
  },
  {
    "label": "Bettsburg",
    "value": "CA/NB/Bettsburg"
  },
  {
    "label": "Big Hole",
    "value": "CA/NB/Big Hole"
  },
  {
    "label": "Black River",
    "value": "CA/NB/Black River"
  },
  {
    "label": "Black River Bridge",
    "value": "CA/NB/Black River Bridge"
  },
  {
    "label": "Blackville",
    "value": "CA/NB/Blackville"
  },
  {
    "label": "Blissfield",
    "value": "CA/NB/Blissfield"
  },
  {
    "label": "Boiestown",
    "value": "CA/NB/Boiestown"
  },
  {
    "label": "Boom Road",
    "value": "CA/NB/Boom Road"
  },
  {
    "label": "Brantville",
    "value": "CA/NB/Brantville"
  },
  {
    "label": "Breadalbane",
    "value": "CA/NB/Breadalbane"
  },
  {
    "label": "Bryenton",
    "value": "CA/NB/Bryenton"
  },
  {
    "label": "Burnt Church",
    "value": "CA/NB/Burnt Church"
  },
  {
    "label": "Burnt Church First Nation",
    "value": "CA/NB/Burnt Church First Nation"
  },
  {
    "label": "Cains River",
    "value": "CA/NB/Cains River"
  },
  {
    "label": "Caissie Road",
    "value": "CA/NB/Caissie Road"
  },
  {
    "label": "Carrolls Crossing",
    "value": "CA/NB/Carrolls Crossing"
  },
  {
    "label": "Cassilis",
    "value": "CA/NB/Cassilis"
  },
  {
    "label": "Chaplin Island Road",
    "value": "CA/NB/Chaplin Island Road"
  },
  {
    "label": "Chelmsford",
    "value": "CA/NB/Chelmsford"
  },
  {
    "label": "Collette",
    "value": "CA/NB/Collette"
  },
  {
    "label": "Curventon",
    "value": "CA/NB/Curventon"
  },
  {
    "label": "Derby",
    "value": "CA/NB/Derby"
  },
  {
    "label": "Derby Junction",
    "value": "CA/NB/Derby Junction"
  },
  {
    "label": "Doaktown",
    "value": "CA/NB/Doaktown"
  },
  {
    "label": "Doyles Brook",
    "value": "CA/NB/Doyles Brook"
  },
  {
    "label": "Eel Ground",
    "value": "CA/NB/Eel Ground"
  },
  {
    "label": "Escuminac",
    "value": "CA/NB/Escuminac"
  },
  {
    "label": "Exmoor",
    "value": "CA/NB/Exmoor"
  },
  {
    "label": "Fairisle",
    "value": "CA/NB/Fairisle"
  },
  {
    "label": "Gardiner Point",
    "value": "CA/NB/Gardiner Point"
  },
  {
    "label": "Glenwood",
    "value": "CA/NB/Glenwood"
  },
  {
    "label": "Grand Lake Road",
    "value": "CA/NB/Grand Lake Road"
  },
  {
    "label": "Gray Rapids",
    "value": "CA/NB/Gray Rapids"
  },
  {
    "label": "Halcomb",
    "value": "CA/NB/Halcomb"
  },
  {
    "label": "Hardwicke",
    "value": "CA/NB/Hardwicke"
  },
  {
    "label": "Haut-Riviere-Du-Portage",
    "value": "CA/NB/Haut-Riviere-Du-Portage"
  },
  {
    "label": "Hay Settlement",
    "value": "CA/NB/Hay Settlement"
  },
  {
    "label": "Hazelton",
    "value": "CA/NB/Hazelton"
  },
  {
    "label": "Hilltop",
    "value": "CA/NB/Hilltop"
  },
  {
    "label": "Holtville",
    "value": "CA/NB/Holtville"
  },
  {
    "label": "Howard",
    "value": "CA/NB/Howard"
  },
  {
    "label": "Keenans",
    "value": "CA/NB/Keenans"
  },
  {
    "label": "Lagaceville",
    "value": "CA/NB/Lagaceville"
  },
  {
    "label": "Lavillette",
    "value": "CA/NB/Lavillette"
  },
  {
    "label": "Little Bartibog",
    "value": "CA/NB/Little Bartibog"
  },
  {
    "label": "Lockstead",
    "value": "CA/NB/Lockstead"
  },
  {
    "label": "Lower Derby",
    "value": "CA/NB/Lower Derby"
  },
  {
    "label": "Lower Newcastle",
    "value": "CA/NB/Lower Newcastle"
  },
  {
    "label": "Ludlow",
    "value": "CA/NB/Ludlow"
  },
  {
    "label": "Lyttleton",
    "value": "CA/NB/Lyttleton"
  },
  {
    "label": "Maple Glen",
    "value": "CA/NB/Maple Glen"
  },
  {
    "label": "Matthews Settlement",
    "value": "CA/NB/Matthews Settlement"
  },
  {
    "label": "Mckinleyville",
    "value": "CA/NB/Mckinleyville"
  },
  {
    "label": "Mcnamee",
    "value": "CA/NB/Mcnamee"
  },
  {
    "label": "Millerton",
    "value": "CA/NB/Millerton"
  },
  {
    "label": "Miramichi",
    "value": "CA/NB/Miramichi"
  },
  {
    "label": "Miramichi Bay",
    "value": "CA/NB/Miramichi Bay"
  },
  {
    "label": "Murray Settlement",
    "value": "CA/NB/Murray Settlement"
  },
  {
    "label": "Napan",
    "value": "CA/NB/Napan"
  },
  {
    "label": "Neguac",
    "value": "CA/NB/Neguac"
  },
  {
    "label": "Nelson Hollow",
    "value": "CA/NB/Nelson Hollow"
  },
  {
    "label": "New Bandon Northumb Co",
    "value": "CA/NB/New Bandon Northumb Co"
  },
  {
    "label": "New Jersey",
    "value": "CA/NB/New Jersey"
  },
  {
    "label": "Oak Point",
    "value": "CA/NB/Oak Point"
  },
  {
    "label": "Parker Road",
    "value": "CA/NB/Parker Road"
  },
  {
    "label": "Pineville",
    "value": "CA/NB/Pineville"
  },
  {
    "label": "Porter Cove",
    "value": "CA/NB/Porter Cove"
  },
  {
    "label": "Priceville",
    "value": "CA/NB/Priceville"
  },
  {
    "label": "Quarryville",
    "value": "CA/NB/Quarryville"
  },
  {
    "label": "Red Bank",
    "value": "CA/NB/Red Bank"
  },
  {
    "label": "Red Bank Reserve",
    "value": "CA/NB/Red Bank Reserve"
  },
  {
    "label": "Red Rock",
    "value": "CA/NB/Red Rock"
  },
  {
    "label": "Renous",
    "value": "CA/NB/Renous"
  },
  {
    "label": "Riviere-Du-Portage",
    "value": "CA/NB/Riviere-Du-Portage"
  },
  {
    "label": "Robichaud Settlement",
    "value": "CA/NB/Robichaud Settlement"
  },
  {
    "label": "Rogersville",
    "value": "CA/NB/Rogersville"
  },
  {
    "label": "Rosaireville",
    "value": "CA/NB/Rosaireville"
  },
  {
    "label": "Russellville",
    "value": "CA/NB/Russellville"
  },
  {
    "label": "Saint-Wilfred",
    "value": "CA/NB/Saint-Wilfred"
  },
  {
    "label": "Sevogle",
    "value": "CA/NB/Sevogle"
  },
  {
    "label": "Sillikers",
    "value": "CA/NB/Sillikers"
  },
  {
    "label": "Smith Crossing",
    "value": "CA/NB/Smith Crossing"
  },
  {
    "label": "South Esk",
    "value": "CA/NB/South Esk"
  },
  {
    "label": "South Nelson",
    "value": "CA/NB/South Nelson"
  },
  {
    "label": "St Margarets",
    "value": "CA/NB/St Margarets"
  },
  {
    "label": "Storeytown",
    "value": "CA/NB/Storeytown"
  },
  {
    "label": "Strathadam",
    "value": "CA/NB/Strathadam"
  },
  {
    "label": "Stymiest",
    "value": "CA/NB/Stymiest"
  },
  {
    "label": "Sunny Corner",
    "value": "CA/NB/Sunny Corner"
  },
  {
    "label": "Tabusintac",
    "value": "CA/NB/Tabusintac"
  },
  {
    "label": "Trout Brook",
    "value": "CA/NB/Trout Brook"
  },
  {
    "label": "Upper Blackville",
    "value": "CA/NB/Upper Blackville"
  },
  {
    "label": "Upper Derby",
    "value": "CA/NB/Upper Derby"
  },
  {
    "label": "Village-Saint-Laurent",
    "value": "CA/NB/Village-Saint-Laurent"
  },
  {
    "label": "Warwick Settlement",
    "value": "CA/NB/Warwick Settlement"
  },
  {
    "label": "Wayerton",
    "value": "CA/NB/Wayerton"
  },
  {
    "label": "Weaver Siding",
    "value": "CA/NB/Weaver Siding"
  },
  {
    "label": "White Rapids",
    "value": "CA/NB/White Rapids"
  },
  {
    "label": "Whitney",
    "value": "CA/NB/Whitney"
  },
  {
    "label": "Williamstown",
    "value": "CA/NB/Williamstown"
  },
  {
    "label": "Big Cove Queens Co",
    "value": "CA/NB/Big Cove Queens Co"
  },
  {
    "label": "Briggs Corner Queens Co",
    "value": "CA/NB/Briggs Corner Queens Co"
  },
  {
    "label": "Bronson Settlement",
    "value": "CA/NB/Bronson Settlement"
  },
  {
    "label": "Cambridge-Narrows",
    "value": "CA/NB/Cambridge-Narrows"
  },
  {
    "label": "Canaan Forks",
    "value": "CA/NB/Canaan Forks"
  },
  {
    "label": "Central Hampstead",
    "value": "CA/NB/Central Hampstead"
  },
  {
    "label": "Chipman",
    "value": "CA/NB/Chipman"
  },
  {
    "label": "Clarendon",
    "value": "CA/NB/Clarendon"
  },
  {
    "label": "Clarks Corner",
    "value": "CA/NB/Clarks Corner"
  },
  {
    "label": "Coal Creek",
    "value": "CA/NB/Coal Creek"
  },
  {
    "label": "Codys",
    "value": "CA/NB/Codys"
  },
  {
    "label": "Coles Island Queens Co",
    "value": "CA/NB/Coles Island Queens Co"
  },
  {
    "label": "Cumberland Bay",
    "value": "CA/NB/Cumberland Bay"
  },
  {
    "label": "Douglas Harbour",
    "value": "CA/NB/Douglas Harbour"
  },
  {
    "label": "Dufferin Queens Co",
    "value": "CA/NB/Dufferin Queens Co"
  },
  {
    "label": "Elm Hill",
    "value": "CA/NB/Elm Hill"
  },
  {
    "label": "Evans Road",
    "value": "CA/NB/Evans Road"
  },
  {
    "label": "Flowers Cove",
    "value": "CA/NB/Flowers Cove"
  },
  {
    "label": "Gagetown",
    "value": "CA/NB/Gagetown"
  },
  {
    "label": "Gaspereau Forks",
    "value": "CA/NB/Gaspereau Forks"
  },
  {
    "label": "Hampstead",
    "value": "CA/NB/Hampstead"
  },
  {
    "label": "Henderson Settlement",
    "value": "CA/NB/Henderson Settlement"
  },
  {
    "label": "Highfield",
    "value": "CA/NB/Highfield"
  },
  {
    "label": "Hunters Home",
    "value": "CA/NB/Hunters Home"
  },
  {
    "label": "Iron Bound Cove",
    "value": "CA/NB/Iron Bound Cove"
  },
  {
    "label": "Jemseg",
    "value": "CA/NB/Jemseg"
  },
  {
    "label": "Little River Hill",
    "value": "CA/NB/Little River Hill"
  },
  {
    "label": "Long Creek",
    "value": "CA/NB/Long Creek"
  },
  {
    "label": "Lower Cambridge",
    "value": "CA/NB/Lower Cambridge"
  },
  {
    "label": "Maquapit Lake",
    "value": "CA/NB/Maquapit Lake"
  },
  {
    "label": "Midland Queens Co",
    "value": "CA/NB/Midland Queens Co"
  },
  {
    "label": "Mill Cove",
    "value": "CA/NB/Mill Cove"
  },
  {
    "label": "Minto",
    "value": "CA/NB/Minto"
  },
  {
    "label": "Newcastle Centre",
    "value": "CA/NB/Newcastle Centre"
  },
  {
    "label": "Newcastle Creek",
    "value": "CA/NB/Newcastle Creek"
  },
  {
    "label": "Old Avon",
    "value": "CA/NB/Old Avon"
  },
  {
    "label": "Picketts Cove",
    "value": "CA/NB/Picketts Cove"
  },
  {
    "label": "Pleasant Villa",
    "value": "CA/NB/Pleasant Villa"
  },
  {
    "label": "Princess Park",
    "value": "CA/NB/Princess Park"
  },
  {
    "label": "Printz Cove",
    "value": "CA/NB/Printz Cove"
  },
  {
    "label": "Queenstown",
    "value": "CA/NB/Queenstown"
  },
  {
    "label": "Red Bank Queens Co",
    "value": "CA/NB/Red Bank Queens Co"
  },
  {
    "label": "Salmon Creek",
    "value": "CA/NB/Salmon Creek"
  },
  {
    "label": "Scotchtown",
    "value": "CA/NB/Scotchtown"
  },
  {
    "label": "Shannon",
    "value": "CA/NB/Shannon"
  },
  {
    "label": "Sypher Cove",
    "value": "CA/NB/Sypher Cove"
  },
  {
    "label": "Upper Gagetown",
    "value": "CA/NB/Upper Gagetown"
  },
  {
    "label": "Upper Hampstead",
    "value": "CA/NB/Upper Hampstead"
  },
  {
    "label": "Waterborough",
    "value": "CA/NB/Waterborough"
  },
  {
    "label": "Welsford",
    "value": "CA/NB/Welsford"
  },
  {
    "label": "Whites Cove",
    "value": "CA/NB/Whites Cove"
  },
  {
    "label": "Wickham",
    "value": "CA/NB/Wickham"
  },
  {
    "label": "Wirral",
    "value": "CA/NB/Wirral"
  },
  {
    "label": "Wuhrs Beach",
    "value": "CA/NB/Wuhrs Beach"
  },
  {
    "label": "Youngs Cove",
    "value": "CA/NB/Youngs Cove"
  },
  {
    "label": "Adams Gulch",
    "value": "CA/NB/Adams Gulch"
  },
  {
    "label": "Atholville",
    "value": "CA/NB/Atholville"
  },
  {
    "label": "Balmoral",
    "value": "CA/NB/Balmoral"
  },
  {
    "label": "Balmoral Est",
    "value": "CA/NB/Balmoral Est"
  },
  {
    "label": "Balmoral Sud",
    "value": "CA/NB/Balmoral Sud"
  },
  {
    "label": "Belledune",
    "value": "CA/NB/Belledune"
  },
  {
    "label": "Benjamin River",
    "value": "CA/NB/Benjamin River"
  },
  {
    "label": "Black Point",
    "value": "CA/NB/Black Point"
  },
  {
    "label": "Blackland Restigouche Co",
    "value": "CA/NB/Blackland Restigouche Co"
  },
  {
    "label": "Blair Athol",
    "value": "CA/NB/Blair Athol"
  },
  {
    "label": "Campbellton",
    "value": "CA/NB/Campbellton"
  },
  {
    "label": "Charlo",
    "value": "CA/NB/Charlo"
  },
  {
    "label": "Charlo South",
    "value": "CA/NB/Charlo South"
  },
  {
    "label": "Dalhousie",
    "value": "CA/NB/Dalhousie"
  },
  {
    "label": "Dalhousie Junction",
    "value": "CA/NB/Dalhousie Junction"
  },
  {
    "label": "Dawsonville",
    "value": "CA/NB/Dawsonville"
  },
  {
    "label": "Dundee",
    "value": "CA/NB/Dundee"
  },
  {
    "label": "Eel River Cove",
    "value": "CA/NB/Eel River Cove"
  },
  {
    "label": "Eel River Crossing",
    "value": "CA/NB/Eel River Crossing"
  },
  {
    "label": "Flatlands",
    "value": "CA/NB/Flatlands"
  },
  {
    "label": "Glencoe",
    "value": "CA/NB/Glencoe"
  },
  {
    "label": "Glenlevit",
    "value": "CA/NB/Glenlevit"
  },
  {
    "label": "Glenvale",
    "value": "CA/NB/Glenvale"
  },
  {
    "label": "Gravel Hill",
    "value": "CA/NB/Gravel Hill"
  },
  {
    "label": "Kedgwick",
    "value": "CA/NB/Kedgwick"
  },
  {
    "label": "Kedgwick Nord",
    "value": "CA/NB/Kedgwick Nord"
  },
  {
    "label": "Kedgwick Ouest",
    "value": "CA/NB/Kedgwick Ouest"
  },
  {
    "label": "Kedgwick River",
    "value": "CA/NB/Kedgwick River"
  },
  {
    "label": "Kedgwick Sud",
    "value": "CA/NB/Kedgwick Sud"
  },
  {
    "label": "Lorne",
    "value": "CA/NB/Lorne"
  },
  {
    "label": "Mann's Mountain",
    "value": "CA/NB/Mann's Mountain"
  },
  {
    "label": "Mcleods",
    "value": "CA/NB/Mcleods"
  },
  {
    "label": "Menneval",
    "value": "CA/NB/Menneval"
  },
  {
    "label": "Nash Creek",
    "value": "CA/NB/Nash Creek"
  },
  {
    "label": "New Mills",
    "value": "CA/NB/New Mills"
  },
  {
    "label": "North Shannonvale",
    "value": "CA/NB/North Shannonvale"
  },
  {
    "label": "Point La Nim",
    "value": "CA/NB/Point La Nim"
  },
  {
    "label": "Robinsonville",
    "value": "CA/NB/Robinsonville"
  },
  {
    "label": "Saint-Arthur",
    "value": "CA/NB/Saint-Arthur"
  },
  {
    "label": "Saint-Martin-De-Restigouche",
    "value": "CA/NB/Saint-Martin-De-Restigouche"
  },
  {
    "label": "Saint-Maure",
    "value": "CA/NB/Saint-Maure"
  },
  {
    "label": "Saint-Quentin",
    "value": "CA/NB/Saint-Quentin"
  },
  {
    "label": "Sea Side",
    "value": "CA/NB/Sea Side"
  },
  {
    "label": "Squaw Cap",
    "value": "CA/NB/Squaw Cap"
  },
  {
    "label": "St-Jean-Baptiste",
    "value": "CA/NB/St-Jean-Baptiste"
  },
  {
    "label": "Sunnyside Beach",
    "value": "CA/NB/Sunnyside Beach"
  },
  {
    "label": "Tide Head",
    "value": "CA/NB/Tide Head"
  },
  {
    "label": "Upsalquitch",
    "value": "CA/NB/Upsalquitch"
  },
  {
    "label": "Val-D'amour",
    "value": "CA/NB/Val-D'amour"
  },
  {
    "label": "Whites Brook",
    "value": "CA/NB/Whites Brook"
  },
  {
    "label": "Wyers Brook",
    "value": "CA/NB/Wyers Brook"
  },
  {
    "label": "Bains Corner",
    "value": "CA/NB/Bains Corner"
  },
  {
    "label": "Baxters Corner",
    "value": "CA/NB/Baxters Corner"
  },
  {
    "label": "Bay View",
    "value": "CA/NB/Bay View"
  },
  {
    "label": "Chance Harbour",
    "value": "CA/NB/Chance Harbour"
  },
  {
    "label": "Clover Valley",
    "value": "CA/NB/Clover Valley"
  },
  {
    "label": "Dipper Harbour",
    "value": "CA/NB/Dipper Harbour"
  },
  {
    "label": "Gardner Creek",
    "value": "CA/NB/Gardner Creek"
  },
  {
    "label": "Garnett Settlement",
    "value": "CA/NB/Garnett Settlement"
  },
  {
    "label": "Grove Hill",
    "value": "CA/NB/Grove Hill"
  },
  {
    "label": "Little Lepreau",
    "value": "CA/NB/Little Lepreau"
  },
  {
    "label": "Mispec",
    "value": "CA/NB/Mispec"
  },
  {
    "label": "Musquash",
    "value": "CA/NB/Musquash"
  },
  {
    "label": "Orange Hill",
    "value": "CA/NB/Orange Hill"
  },
  {
    "label": "Pokiok",
    "value": "CA/NB/Pokiok"
  },
  {
    "label": "Prince Of Wales",
    "value": "CA/NB/Prince Of Wales"
  },
  {
    "label": "Rowley",
    "value": "CA/NB/Rowley"
  },
  {
    "label": "Saint John",
    "value": "CA/NB/Saint John"
  },
  {
    "label": "Salmon River",
    "value": "CA/NB/Salmon River"
  },
  {
    "label": "Shanklin",
    "value": "CA/NB/Shanklin"
  },
  {
    "label": "St Martins",
    "value": "CA/NB/St Martins"
  },
  {
    "label": "St Martins North",
    "value": "CA/NB/St Martins North"
  },
  {
    "label": "Tynemouth Creek",
    "value": "CA/NB/Tynemouth Creek"
  },
  {
    "label": "Upper Loch Lomond",
    "value": "CA/NB/Upper Loch Lomond"
  },
  {
    "label": "West Quaco",
    "value": "CA/NB/West Quaco"
  },
  {
    "label": "Willow Grove",
    "value": "CA/NB/Willow Grove"
  },
  {
    "label": "Albrights Corner",
    "value": "CA/NB/Albrights Corner"
  },
  {
    "label": "Burpee",
    "value": "CA/NB/Burpee"
  },
  {
    "label": "Burton",
    "value": "CA/NB/Burton"
  },
  {
    "label": "Central Blissville",
    "value": "CA/NB/Central Blissville"
  },
  {
    "label": "Fredericton Junction",
    "value": "CA/NB/Fredericton Junction"
  },
  {
    "label": "French Lake",
    "value": "CA/NB/French Lake"
  },
  {
    "label": "Geary",
    "value": "CA/NB/Geary"
  },
  {
    "label": "Haneytown",
    "value": "CA/NB/Haneytown"
  },
  {
    "label": "Hardwood Ridge",
    "value": "CA/NB/Hardwood Ridge"
  },
  {
    "label": "Harvey York Co",
    "value": "CA/NB/Harvey York Co"
  },
  {
    "label": "Hoyt",
    "value": "CA/NB/Hoyt"
  },
  {
    "label": "Immigrant Road",
    "value": "CA/NB/Immigrant Road"
  },
  {
    "label": "Lakeville Corner",
    "value": "CA/NB/Lakeville Corner"
  },
  {
    "label": "Lincoln",
    "value": "CA/NB/Lincoln"
  },
  {
    "label": "Maugerville",
    "value": "CA/NB/Maugerville"
  },
  {
    "label": "New Avon",
    "value": "CA/NB/New Avon"
  },
  {
    "label": "New England Settlement",
    "value": "CA/NB/New England Settlement"
  },
  {
    "label": "New Zion",
    "value": "CA/NB/New Zion"
  },
  {
    "label": "Noonan",
    "value": "CA/NB/Noonan"
  },
  {
    "label": "North Forks",
    "value": "CA/NB/North Forks"
  },
  {
    "label": "Oromocto",
    "value": "CA/NB/Oromocto"
  },
  {
    "label": "Peltoma Settlement",
    "value": "CA/NB/Peltoma Settlement"
  },
  {
    "label": "Pondstream",
    "value": "CA/NB/Pondstream"
  },
  {
    "label": "Ripples",
    "value": "CA/NB/Ripples"
  },
  {
    "label": "Rooth",
    "value": "CA/NB/Rooth"
  },
  {
    "label": "Rusagonis",
    "value": "CA/NB/Rusagonis"
  },
  {
    "label": "Sheffield",
    "value": "CA/NB/Sheffield"
  },
  {
    "label": "Slope",
    "value": "CA/NB/Slope"
  },
  {
    "label": "Swan Creek",
    "value": "CA/NB/Swan Creek"
  },
  {
    "label": "Three Tree Creek",
    "value": "CA/NB/Three Tree Creek"
  },
  {
    "label": "Tracy",
    "value": "CA/NB/Tracy"
  },
  {
    "label": "Tracyville",
    "value": "CA/NB/Tracyville"
  },
  {
    "label": "Upper Salmon Creek",
    "value": "CA/NB/Upper Salmon Creek"
  },
  {
    "label": "Upper Tracy",
    "value": "CA/NB/Upper Tracy"
  },
  {
    "label": "Vespra",
    "value": "CA/NB/Vespra"
  },
  {
    "label": "Waasis",
    "value": "CA/NB/Waasis"
  },
  {
    "label": "Waterville-Sunbury",
    "value": "CA/NB/Waterville-Sunbury"
  },
  {
    "label": "Anderson Road",
    "value": "CA/NB/Anderson Road"
  },
  {
    "label": "Anfield",
    "value": "CA/NB/Anfield"
  },
  {
    "label": "Aroostook",
    "value": "CA/NB/Aroostook"
  },
  {
    "label": "Aroostook Junction",
    "value": "CA/NB/Aroostook Junction"
  },
  {
    "label": "Arthurette",
    "value": "CA/NB/Arthurette"
  },
  {
    "label": "Bairdsville",
    "value": "CA/NB/Bairdsville"
  },
  {
    "label": "Beaconsfield",
    "value": "CA/NB/Beaconsfield"
  },
  {
    "label": "Blue Bell",
    "value": "CA/NB/Blue Bell"
  },
  {
    "label": "Blue Mountain Bend",
    "value": "CA/NB/Blue Mountain Bend"
  },
  {
    "label": "Bon Accord",
    "value": "CA/NB/Bon Accord"
  },
  {
    "label": "Burntland Brook",
    "value": "CA/NB/Burntland Brook"
  },
  {
    "label": "California Settlement",
    "value": "CA/NB/California Settlement"
  },
  {
    "label": "Carlingford",
    "value": "CA/NB/Carlingford"
  },
  {
    "label": "Craig Flats",
    "value": "CA/NB/Craig Flats"
  },
  {
    "label": "Crombie Settlement",
    "value": "CA/NB/Crombie Settlement"
  },
  {
    "label": "Currie Siding",
    "value": "CA/NB/Currie Siding"
  },
  {
    "label": "Drummond",
    "value": "CA/NB/Drummond"
  },
  {
    "label": "Dsl De Drummond",
    "value": "CA/NB/Dsl De Drummond"
  },
  {
    "label": "Dsl De Grand-Sault/Falls",
    "value": "CA/NB/Dsl De Grand-Sault/Falls"
  },
  {
    "label": "Dsl De Saint-Andre",
    "value": "CA/NB/Dsl De Saint-Andre"
  },
  {
    "label": "Enterprise",
    "value": "CA/NB/Enterprise"
  },
  {
    "label": "Everett",
    "value": "CA/NB/Everett"
  },
  {
    "label": "Four Falls",
    "value": "CA/NB/Four Falls"
  },
  {
    "label": "Gladwyn",
    "value": "CA/NB/Gladwyn"
  },
  {
    "label": "Grand Falls",
    "value": "CA/NB/Grand Falls"
  },
  {
    "label": "Grand-Sault/Grand Falls",
    "value": "CA/NB/Grand-Sault/Grand Falls"
  },
  {
    "label": "Hazeldean",
    "value": "CA/NB/Hazeldean"
  },
  {
    "label": "Hillandale",
    "value": "CA/NB/Hillandale"
  },
  {
    "label": "Kilburn",
    "value": "CA/NB/Kilburn"
  },
  {
    "label": "Kincardine",
    "value": "CA/NB/Kincardine"
  },
  {
    "label": "Lake Edward",
    "value": "CA/NB/Lake Edward"
  },
  {
    "label": "Leonard Colony",
    "value": "CA/NB/Leonard Colony"
  },
  {
    "label": "Linton Corner",
    "value": "CA/NB/Linton Corner"
  },
  {
    "label": "Lower Kintore",
    "value": "CA/NB/Lower Kintore"
  },
  {
    "label": "Maple View",
    "value": "CA/NB/Maple View"
  },
  {
    "label": "Mclaughlin",
    "value": "CA/NB/Mclaughlin"
  },
  {
    "label": "Medford",
    "value": "CA/NB/Medford"
  },
  {
    "label": "Morrell Siding",
    "value": "CA/NB/Morrell Siding"
  },
  {
    "label": "Muniac",
    "value": "CA/NB/Muniac"
  },
  {
    "label": "New Denmark",
    "value": "CA/NB/New Denmark"
  },
  {
    "label": "Nictau",
    "value": "CA/NB/Nictau"
  },
  {
    "label": "North View",
    "value": "CA/NB/North View"
  },
  {
    "label": "Odell",
    "value": "CA/NB/Odell"
  },
  {
    "label": "Oxbow",
    "value": "CA/NB/Oxbow"
  },
  {
    "label": "Perth-Andover",
    "value": "CA/NB/Perth-Andover"
  },
  {
    "label": "Plaster Rock",
    "value": "CA/NB/Plaster Rock"
  },
  {
    "label": "Quaker Brook",
    "value": "CA/NB/Quaker Brook"
  },
  {
    "label": "Red Rapids",
    "value": "CA/NB/Red Rapids"
  },
  {
    "label": "Riley Brook",
    "value": "CA/NB/Riley Brook"
  },
  {
    "label": "River De Chute",
    "value": "CA/NB/River De Chute"
  },
  {
    "label": "Rowena",
    "value": "CA/NB/Rowena"
  },
  {
    "label": "Sisson Brook",
    "value": "CA/NB/Sisson Brook"
  },
  {
    "label": "Sisson Ridge",
    "value": "CA/NB/Sisson Ridge"
  },
  {
    "label": "St Almo",
    "value": "CA/NB/St Almo"
  },
  {
    "label": "Three Brooks",
    "value": "CA/NB/Three Brooks"
  },
  {
    "label": "Tinker",
    "value": "CA/NB/Tinker"
  },
  {
    "label": "Tobique First Nation",
    "value": "CA/NB/Tobique First Nation"
  },
  {
    "label": "Tobique Narrows",
    "value": "CA/NB/Tobique Narrows"
  },
  {
    "label": "Two Brooks",
    "value": "CA/NB/Two Brooks"
  },
  {
    "label": "Upper Kintore",
    "value": "CA/NB/Upper Kintore"
  },
  {
    "label": "Wapske",
    "value": "CA/NB/Wapske"
  },
  {
    "label": "Weaver",
    "value": "CA/NB/Weaver"
  },
  {
    "label": "Allison ",
    "value": "CA/NB/Allison "
  },
  {
    "label": "Ammon",
    "value": "CA/NB/Ammon"
  },
  {
    "label": "Anderson Settlement",
    "value": "CA/NB/Anderson Settlement"
  },
  {
    "label": "Aulac",
    "value": "CA/NB/Aulac"
  },
  {
    "label": "Baie Verte",
    "value": "CA/NB/Baie Verte"
  },
  {
    "label": "Bas-Cap-Pele",
    "value": "CA/NB/Bas-Cap-Pele"
  },
  {
    "label": "Bayfield",
    "value": "CA/NB/Bayfield"
  },
  {
    "label": "Berry Mills",
    "value": "CA/NB/Berry Mills"
  },
  {
    "label": "Boudreau-Ouest",
    "value": "CA/NB/Boudreau-Ouest"
  },
  {
    "label": "Boundary Creek",
    "value": "CA/NB/Boundary Creek"
  },
  {
    "label": "British Settlement",
    "value": "CA/NB/British Settlement"
  },
  {
    "label": "Calhoun",
    "value": "CA/NB/Calhoun"
  },
  {
    "label": "Canaan Station",
    "value": "CA/NB/Canaan Station"
  },
  {
    "label": "Cap-Pele",
    "value": "CA/NB/Cap-Pele"
  },
  {
    "label": "Cape Spear",
    "value": "CA/NB/Cape Spear"
  },
  {
    "label": "Cape Tormentine",
    "value": "CA/NB/Cape Tormentine"
  },
  {
    "label": "Centre Village",
    "value": "CA/NB/Centre Village"
  },
  {
    "label": "Cherry Burton",
    "value": "CA/NB/Cherry Burton"
  },
  {
    "label": "Coburg",
    "value": "CA/NB/Coburg"
  },
  {
    "label": "Cookville",
    "value": "CA/NB/Cookville"
  },
  {
    "label": "Cormier-Village",
    "value": "CA/NB/Cormier-Village"
  },
  {
    "label": "Dieppe",
    "value": "CA/NB/Dieppe"
  },
  {
    "label": "Dobson Corner",
    "value": "CA/NB/Dobson Corner"
  },
  {
    "label": "Dorchester",
    "value": "CA/NB/Dorchester"
  },
  {
    "label": "Dorchester Cape",
    "value": "CA/NB/Dorchester Cape"
  },
  {
    "label": "Fairfield",
    "value": "CA/NB/Fairfield"
  },
  {
    "label": "Fairfield Westmorland Co",
    "value": "CA/NB/Fairfield Westmorland Co"
  },
  {
    "label": "Fawcett Hill",
    "value": "CA/NB/Fawcett Hill"
  },
  {
    "label": "Frosty Hollow",
    "value": "CA/NB/Frosty Hollow"
  },
  {
    "label": "Gallagher Ridge",
    "value": "CA/NB/Gallagher Ridge"
  },
  {
    "label": "Grand-Barachois",
    "value": "CA/NB/Grand-Barachois"
  },
  {
    "label": "Greater Lakeburn",
    "value": "CA/NB/Greater Lakeburn"
  },
  {
    "label": "Harewood",
    "value": "CA/NB/Harewood"
  },
  {
    "label": "Haute-Aboujagane",
    "value": "CA/NB/Haute-Aboujagane"
  },
  {
    "label": "Hicksville",
    "value": "CA/NB/Hicksville"
  },
  {
    "label": "Hillgrove",
    "value": "CA/NB/Hillgrove"
  },
  {
    "label": "Indian Mountain",
    "value": "CA/NB/Indian Mountain"
  },
  {
    "label": "Intervale",
    "value": "CA/NB/Intervale"
  },
  {
    "label": "Irishtown",
    "value": "CA/NB/Irishtown"
  },
  {
    "label": "Johnson's Mills",
    "value": "CA/NB/Johnson's Mills"
  },
  {
    "label": "Johnston Point",
    "value": "CA/NB/Johnston Point"
  },
  {
    "label": "Jolicure",
    "value": "CA/NB/Jolicure"
  },
  {
    "label": "Killams Mills",
    "value": "CA/NB/Killams Mills"
  },
  {
    "label": "Kinnear Settlement",
    "value": "CA/NB/Kinnear Settlement"
  },
  {
    "label": "Lakeville-Westmorland",
    "value": "CA/NB/Lakeville-Westmorland"
  },
  {
    "label": "Lewis Mountain",
    "value": "CA/NB/Lewis Mountain"
  },
  {
    "label": "Little Shemogue",
    "value": "CA/NB/Little Shemogue"
  },
  {
    "label": "Lutes Mountain",
    "value": "CA/NB/Lutes Mountain"
  },
  {
    "label": "Macdougall Settlement",
    "value": "CA/NB/Macdougall Settlement"
  },
  {
    "label": "Malden",
    "value": "CA/NB/Malden"
  },
  {
    "label": "Mates Corner",
    "value": "CA/NB/Mates Corner"
  },
  {
    "label": "Mcquade",
    "value": "CA/NB/Mcquade"
  },
  {
    "label": "Meadow Brook",
    "value": "CA/NB/Meadow Brook"
  },
  {
    "label": "Melrose",
    "value": "CA/NB/Melrose"
  },
  {
    "label": "Memramcook",
    "value": "CA/NB/Memramcook"
  },
  {
    "label": "Memramcook East",
    "value": "CA/NB/Memramcook East"
  },
  {
    "label": "Middle Sackville",
    "value": "CA/NB/Middle Sackville"
  },
  {
    "label": "Middleton",
    "value": "CA/NB/Middleton"
  },
  {
    "label": "Midgic",
    "value": "CA/NB/Midgic"
  },
  {
    "label": "Moncton",
    "value": "CA/NB/Moncton"
  },
  {
    "label": "Monteagle",
    "value": "CA/NB/Monteagle"
  },
  {
    "label": "Murray Corner",
    "value": "CA/NB/Murray Corner"
  },
  {
    "label": "New Scotland",
    "value": "CA/NB/New Scotland"
  },
  {
    "label": "Otter Creek",
    "value": "CA/NB/Otter Creek"
  },
  {
    "label": "Petit-Cap",
    "value": "CA/NB/Petit-Cap"
  },
  {
    "label": "Petitcodiac",
    "value": "CA/NB/Petitcodiac"
  },
  {
    "label": "Petitcodiac East",
    "value": "CA/NB/Petitcodiac East"
  },
  {
    "label": "Point De Bute",
    "value": "CA/NB/Point De Bute"
  },
  {
    "label": "Pointe-Du-Chene",
    "value": "CA/NB/Pointe-Du-Chene"
  },
  {
    "label": "Pollett River",
    "value": "CA/NB/Pollett River"
  },
  {
    "label": "Port Elgin",
    "value": "CA/NB/Port Elgin"
  },
  {
    "label": "Portage",
    "value": "CA/NB/Portage"
  },
  {
    "label": "River Glade",
    "value": "CA/NB/River Glade"
  },
  {
    "label": "Rockland",
    "value": "CA/NB/Rockland"
  },
  {
    "label": "Rockport",
    "value": "CA/NB/Rockport"
  },
  {
    "label": "Sackville",
    "value": "CA/NB/Sackville"
  },
  {
    "label": "Saint-Andre-Leblanc",
    "value": "CA/NB/Saint-Andre-Leblanc"
  },
  {
    "label": "Saint-Philippe",
    "value": "CA/NB/Saint-Philippe"
  },
  {
    "label": "Salisbury",
    "value": "CA/NB/Salisbury"
  },
  {
    "label": "Scotch Settlement",
    "value": "CA/NB/Scotch Settlement"
  },
  {
    "label": "Scoudouc",
    "value": "CA/NB/Scoudouc"
  },
  {
    "label": "Scoudouc Road",
    "value": "CA/NB/Scoudouc Road"
  },
  {
    "label": "Second North River",
    "value": "CA/NB/Second North River"
  },
  {
    "label": "Shediac",
    "value": "CA/NB/Shediac"
  },
  {
    "label": "Shediac Bridge",
    "value": "CA/NB/Shediac Bridge"
  },
  {
    "label": "Shediac Cape",
    "value": "CA/NB/Shediac Cape"
  },
  {
    "label": "Shediac River",
    "value": "CA/NB/Shediac River"
  },
  {
    "label": "Shemogue",
    "value": "CA/NB/Shemogue"
  },
  {
    "label": "South Canaan",
    "value": "CA/NB/South Canaan"
  },
  {
    "label": "Steeves Mountain",
    "value": "CA/NB/Steeves Mountain"
  },
  {
    "label": "Steeves Settlement",
    "value": "CA/NB/Steeves Settlement"
  },
  {
    "label": "Stilesville",
    "value": "CA/NB/Stilesville"
  },
  {
    "label": "Taylor Village",
    "value": "CA/NB/Taylor Village"
  },
  {
    "label": "The Glades",
    "value": "CA/NB/The Glades"
  },
  {
    "label": "Timber River",
    "value": "CA/NB/Timber River"
  },
  {
    "label": "Trois-Ruisseaux",
    "value": "CA/NB/Trois-Ruisseaux"
  },
  {
    "label": "Upper Cape",
    "value": "CA/NB/Upper Cape"
  },
  {
    "label": "Upper Dorchester",
    "value": "CA/NB/Upper Dorchester"
  },
  {
    "label": "Upper Rockport",
    "value": "CA/NB/Upper Rockport"
  },
  {
    "label": "Upper Sackville",
    "value": "CA/NB/Upper Sackville"
  },
  {
    "label": "Westcock",
    "value": "CA/NB/Westcock"
  },
  {
    "label": "Wheaton Settlement",
    "value": "CA/NB/Wheaton Settlement"
  },
  {
    "label": "Wood Point",
    "value": "CA/NB/Wood Point"
  },
  {
    "label": "Woodside",
    "value": "CA/NB/Woodside"
  },
  {
    "label": "Astle",
    "value": "CA/NB/Astle"
  },
  {
    "label": "Barony",
    "value": "CA/NB/Barony"
  },
  {
    "label": "Bear Island",
    "value": "CA/NB/Bear Island"
  },
  {
    "label": "Beaver Dam",
    "value": "CA/NB/Beaver Dam"
  },
  {
    "label": "Birdton",
    "value": "CA/NB/Birdton"
  },
  {
    "label": "Bloomfield Ridge",
    "value": "CA/NB/Bloomfield Ridge"
  },
  {
    "label": "Brewers Mill",
    "value": "CA/NB/Brewers Mill"
  },
  {
    "label": "Brockway",
    "value": "CA/NB/Brockway"
  },
  {
    "label": "Bull Lake",
    "value": "CA/NB/Bull Lake"
  },
  {
    "label": "Burtts Corner",
    "value": "CA/NB/Burtts Corner"
  },
  {
    "label": "Campbell Settlement York Co",
    "value": "CA/NB/Campbell Settlement York Co"
  },
  {
    "label": "Canterbury",
    "value": "CA/NB/Canterbury"
  },
  {
    "label": "Cardigan",
    "value": "CA/NB/Cardigan"
  },
  {
    "label": "Carrol Ridge",
    "value": "CA/NB/Carrol Ridge"
  },
  {
    "label": "Central Hainesville",
    "value": "CA/NB/Central Hainesville"
  },
  {
    "label": "Central Waterville",
    "value": "CA/NB/Central Waterville"
  },
  {
    "label": "Charlie Lake",
    "value": "CA/NB/Charlie Lake"
  },
  {
    "label": "Charters Settlement",
    "value": "CA/NB/Charters Settlement"
  },
  {
    "label": "Clarkville",
    "value": "CA/NB/Clarkville"
  },
  {
    "label": "Cross Creek",
    "value": "CA/NB/Cross Creek"
  },
  {
    "label": "Currieburg",
    "value": "CA/NB/Currieburg"
  },
  {
    "label": "Dead Creek",
    "value": "CA/NB/Dead Creek"
  },
  {
    "label": "Deersdale",
    "value": "CA/NB/Deersdale"
  },
  {
    "label": "Dorrington Hill",
    "value": "CA/NB/Dorrington Hill"
  },
  {
    "label": "Douglas",
    "value": "CA/NB/Douglas"
  },
  {
    "label": "Dow Settlement",
    "value": "CA/NB/Dow Settlement"
  },
  {
    "label": "Dumfries",
    "value": "CA/NB/Dumfries"
  },
  {
    "label": "Durham Bridge",
    "value": "CA/NB/Durham Bridge"
  },
  {
    "label": "Eel River Lake",
    "value": "CA/NB/Eel River Lake"
  },
  {
    "label": "English Settlement",
    "value": "CA/NB/English Settlement"
  },
  {
    "label": "Estey's Bridge",
    "value": "CA/NB/Estey's Bridge"
  },
  {
    "label": "Forest City",
    "value": "CA/NB/Forest City"
  },
  {
    "label": "Fosterville",
    "value": "CA/NB/Fosterville"
  },
  {
    "label": "Fredericksburg",
    "value": "CA/NB/Fredericksburg"
  },
  {
    "label": "Fredericton",
    "value": "CA/NB/Fredericton"
  },
  {
    "label": "French Village-York",
    "value": "CA/NB/French Village-York"
  },
  {
    "label": "Giants Glen",
    "value": "CA/NB/Giants Glen"
  },
  {
    "label": "Green Hill",
    "value": "CA/NB/Green Hill"
  },
  {
    "label": "Green Mountain",
    "value": "CA/NB/Green Mountain"
  },
  {
    "label": "Greenhill Lake",
    "value": "CA/NB/Greenhill Lake"
  },
  {
    "label": "Hamtown Corner",
    "value": "CA/NB/Hamtown Corner"
  },
  {
    "label": "Hanwell",
    "value": "CA/NB/Hanwell"
  },
  {
    "label": "Hartfield",
    "value": "CA/NB/Hartfield"
  },
  {
    "label": "Hartin Settlement",
    "value": "CA/NB/Hartin Settlement"
  },
  {
    "label": "Harvey Station",
    "value": "CA/NB/Harvey Station"
  },
  {
    "label": "Hawkins Corner",
    "value": "CA/NB/Hawkins Corner"
  },
  {
    "label": "Hawkshaw",
    "value": "CA/NB/Hawkshaw"
  },
  {
    "label": "Hayesville",
    "value": "CA/NB/Hayesville"
  },
  {
    "label": "Howland Ridge",
    "value": "CA/NB/Howland Ridge"
  },
  {
    "label": "Island View",
    "value": "CA/NB/Island View"
  },
  {
    "label": "Jewetts Mills",
    "value": "CA/NB/Jewetts Mills"
  },
  {
    "label": "Keswick",
    "value": "CA/NB/Keswick"
  },
  {
    "label": "Keswick Ridge",
    "value": "CA/NB/Keswick Ridge"
  },
  {
    "label": "Killarney Road",
    "value": "CA/NB/Killarney Road"
  },
  {
    "label": "Kings Landing Historical Settl",
    "value": "CA/NB/Kings Landing Historical Settl"
  },
  {
    "label": "Kingsclear First Nation",
    "value": "CA/NB/Kingsclear First Nation"
  },
  {
    "label": "Kingsley",
    "value": "CA/NB/Kingsley"
  },
  {
    "label": "Lake George",
    "value": "CA/NB/Lake George"
  },
  {
    "label": "Limekiln",
    "value": "CA/NB/Limekiln"
  },
  {
    "label": "Lower Hainesville",
    "value": "CA/NB/Lower Hainesville"
  },
  {
    "label": "Lower Kingsclear",
    "value": "CA/NB/Lower Kingsclear"
  },
  {
    "label": "Lower Queensbury",
    "value": "CA/NB/Lower Queensbury"
  },
  {
    "label": "Lower St Marys",
    "value": "CA/NB/Lower St Marys"
  },
  {
    "label": "Maclaggan Bridge",
    "value": "CA/NB/Maclaggan Bridge"
  },
  {
    "label": "Mactaquac",
    "value": "CA/NB/Mactaquac"
  },
  {
    "label": "Maple Grove",
    "value": "CA/NB/Maple Grove"
  },
  {
    "label": "Maple Ridge",
    "value": "CA/NB/Maple Ridge"
  },
  {
    "label": "Maplewood",
    "value": "CA/NB/Maplewood"
  },
  {
    "label": "Marne",
    "value": "CA/NB/Marne"
  },
  {
    "label": "Maxwell",
    "value": "CA/NB/Maxwell"
  },
  {
    "label": "Mazerolle Settlement",
    "value": "CA/NB/Mazerolle Settlement"
  },
  {
    "label": "Mcadam",
    "value": "CA/NB/Mcadam"
  },
  {
    "label": "Mcgivney",
    "value": "CA/NB/Mcgivney"
  },
  {
    "label": "Mcleod Hill",
    "value": "CA/NB/Mcleod Hill"
  },
  {
    "label": "Meductic",
    "value": "CA/NB/Meductic"
  },
  {
    "label": "Middle Hainesville",
    "value": "CA/NB/Middle Hainesville"
  },
  {
    "label": "Millville",
    "value": "CA/NB/Millville"
  },
  {
    "label": "Mount Hope",
    "value": "CA/NB/Mount Hope"
  },
  {
    "label": "Nackawic",
    "value": "CA/NB/Nackawic"
  },
  {
    "label": "Napadogan",
    "value": "CA/NB/Napadogan"
  },
  {
    "label": "Nashwaak Bridge",
    "value": "CA/NB/Nashwaak Bridge"
  },
  {
    "label": "Nashwaak Village",
    "value": "CA/NB/Nashwaak Village"
  },
  {
    "label": "Nasonworth",
    "value": "CA/NB/Nasonworth"
  },
  {
    "label": "New Market",
    "value": "CA/NB/New Market"
  },
  {
    "label": "New Maryland",
    "value": "CA/NB/New Maryland"
  },
  {
    "label": "North Lake",
    "value": "CA/NB/North Lake"
  },
  {
    "label": "North Tay",
    "value": "CA/NB/North Tay"
  },
  {
    "label": "Nortondale",
    "value": "CA/NB/Nortondale"
  },
  {
    "label": "Parker Ridge",
    "value": "CA/NB/Parker Ridge"
  },
  {
    "label": "Pemberton Ridge",
    "value": "CA/NB/Pemberton Ridge"
  },
  {
    "label": "Penniac",
    "value": "CA/NB/Penniac"
  },
  {
    "label": "Prince William",
    "value": "CA/NB/Prince William"
  },
  {
    "label": "Ritchie",
    "value": "CA/NB/Ritchie"
  },
  {
    "label": "Rossville",
    "value": "CA/NB/Rossville"
  },
  {
    "label": "Royal Road",
    "value": "CA/NB/Royal Road"
  },
  {
    "label": "Scotch Lake",
    "value": "CA/NB/Scotch Lake"
  },
  {
    "label": "Scotch Settlement York Co",
    "value": "CA/NB/Scotch Settlement York Co"
  },
  {
    "label": "Scott Siding",
    "value": "CA/NB/Scott Siding"
  },
  {
    "label": "Skiff Lake",
    "value": "CA/NB/Skiff Lake"
  },
  {
    "label": "Smithfield",
    "value": "CA/NB/Smithfield"
  },
  {
    "label": "Southampton",
    "value": "CA/NB/Southampton"
  },
  {
    "label": "Springfield York Co",
    "value": "CA/NB/Springfield York Co"
  },
  {
    "label": "St Croix",
    "value": "CA/NB/St Croix"
  },
  {
    "label": "Stanley",
    "value": "CA/NB/Stanley"
  },
  {
    "label": "Staples Settlement",
    "value": "CA/NB/Staples Settlement"
  },
  {
    "label": "Taxis River",
    "value": "CA/NB/Taxis River"
  },
  {
    "label": "Tay Creek",
    "value": "CA/NB/Tay Creek"
  },
  {
    "label": "Tay Falls",
    "value": "CA/NB/Tay Falls"
  },
  {
    "label": "Taymouth",
    "value": "CA/NB/Taymouth"
  },
  {
    "label": "Temperance Vale",
    "value": "CA/NB/Temperance Vale"
  },
  {
    "label": "Temple",
    "value": "CA/NB/Temple"
  },
  {
    "label": "Upper Caverhill",
    "value": "CA/NB/Upper Caverhill"
  },
  {
    "label": "Upper Hainesville",
    "value": "CA/NB/Upper Hainesville"
  },
  {
    "label": "Upper Keswick",
    "value": "CA/NB/Upper Keswick"
  },
  {
    "label": "Upper Kingsclear",
    "value": "CA/NB/Upper Kingsclear"
  },
  {
    "label": "Upper Queensbury",
    "value": "CA/NB/Upper Queensbury"
  },
  {
    "label": "Ward Settlement",
    "value": "CA/NB/Ward Settlement"
  },
  {
    "label": "Wiggins Mill",
    "value": "CA/NB/Wiggins Mill"
  },
  {
    "label": "Williamsburg",
    "value": "CA/NB/Williamsburg"
  },
  {
    "label": "Woodlands",
    "value": "CA/NB/Woodlands"
  },
  {
    "label": "Yoho",
    "value": "CA/NB/Yoho"
  },
  {
    "label": "Zealand",
    "value": "CA/NB/Zealand"
  },
  {
    "label": "Zionville",
    "value": "CA/NB/Zionville"
  },
  {
    "label": "Admiral's Beach",
    "value": "CA/NL/Admiral's Beach"
  },
  {
    "label": "Aquaforte",
    "value": "CA/NL/Aquaforte"
  },
  {
    "label": "Avondale",
    "value": "CA/NL/Avondale"
  },
  {
    "label": "Bauline",
    "value": "CA/NL/Bauline"
  },
  {
    "label": "Bay Bulls",
    "value": "CA/NL/Bay Bulls"
  },
  {
    "label": "Bay De Verde",
    "value": "CA/NL/Bay De Verde"
  },
  {
    "label": "Bay Roberts",
    "value": "CA/NL/Bay Roberts"
  },
  {
    "label": "Bell Island",
    "value": "CA/NL/Bell Island"
  },
  {
    "label": "Bell Island Front",
    "value": "CA/NL/Bell Island Front"
  },
  {
    "label": "Bellevue",
    "value": "CA/NL/Bellevue"
  },
  {
    "label": "Blaketown",
    "value": "CA/NL/Blaketown"
  },
  {
    "label": "Branch",
    "value": "CA/NL/Branch"
  },
  {
    "label": "Brigus",
    "value": "CA/NL/Brigus"
  },
  {
    "label": "Brigus Junction",
    "value": "CA/NL/Brigus Junction"
  },
  {
    "label": "Broad Cove Bdv",
    "value": "CA/NL/Broad Cove Bdv"
  },
  {
    "label": "Brownsdale",
    "value": "CA/NL/Brownsdale"
  },
  {
    "label": "Burnt Point Bdv",
    "value": "CA/NL/Burnt Point Bdv"
  },
  {
    "label": "Calvert",
    "value": "CA/NL/Calvert"
  },
  {
    "label": "Cape Broyle",
    "value": "CA/NL/Cape Broyle"
  },
  {
    "label": "Caplin Cove Bdv",
    "value": "CA/NL/Caplin Cove Bdv"
  },
  {
    "label": "Cappahayden",
    "value": "CA/NL/Cappahayden"
  },
  {
    "label": "Carbonear",
    "value": "CA/NL/Carbonear"
  },
  {
    "label": "Cavendish",
    "value": "CA/NL/Cavendish"
  },
  {
    "label": "Chance Cove",
    "value": "CA/NL/Chance Cove"
  },
  {
    "label": "Chapel Arm",
    "value": "CA/NL/Chapel Arm"
  },
  {
    "label": "Chapel Cove",
    "value": "CA/NL/Chapel Cove"
  },
  {
    "label": "Clarkes Beach",
    "value": "CA/NL/Clarkes Beach"
  },
  {
    "label": "Coleys Point South",
    "value": "CA/NL/Coleys Point South"
  },
  {
    "label": "Colinet",
    "value": "CA/NL/Colinet"
  },
  {
    "label": "Colliers Riverhead",
    "value": "CA/NL/Colliers Riverhead"
  },
  {
    "label": "Conception Bay South",
    "value": "CA/NL/Conception Bay South"
  },
  {
    "label": "Conception Harbour",
    "value": "CA/NL/Conception Harbour"
  },
  {
    "label": "Cupids",
    "value": "CA/NL/Cupids"
  },
  {
    "label": "Dildo",
    "value": "CA/NL/Dildo"
  },
  {
    "label": "Dunville",
    "value": "CA/NL/Dunville"
  },
  {
    "label": "Fair Haven",
    "value": "CA/NL/Fair Haven"
  },
  {
    "label": "Fermeuse",
    "value": "CA/NL/Fermeuse"
  },
  {
    "label": "Ferryland",
    "value": "CA/NL/Ferryland"
  },
  {
    "label": "Flatrock",
    "value": "CA/NL/Flatrock"
  },
  {
    "label": "Fox Harbour Pb",
    "value": "CA/NL/Fox Harbour Pb"
  },
  {
    "label": "Freshwater Pb",
    "value": "CA/NL/Freshwater Pb"
  },
  {
    "label": "Goulds",
    "value": "CA/NL/Goulds"
  },
  {
    "label": "Grates Cove",
    "value": "CA/NL/Grates Cove"
  },
  {
    "label": "Greens Harbour",
    "value": "CA/NL/Greens Harbour"
  },
  {
    "label": "Hants Harbour",
    "value": "CA/NL/Hants Harbour"
  },
  {
    "label": "Harbour Grace",
    "value": "CA/NL/Harbour Grace"
  },
  {
    "label": "Harbour Grace South",
    "value": "CA/NL/Harbour Grace South"
  },
  {
    "label": "Harbour Main",
    "value": "CA/NL/Harbour Main"
  },
  {
    "label": "Hearts Content",
    "value": "CA/NL/Hearts Content"
  },
  {
    "label": "Hearts Delight",
    "value": "CA/NL/Hearts Delight"
  },
  {
    "label": "Hearts Desire",
    "value": "CA/NL/Hearts Desire"
  },
  {
    "label": "Holyrood",
    "value": "CA/NL/Holyrood"
  },
  {
    "label": "Hopeall",
    "value": "CA/NL/Hopeall"
  },
  {
    "label": "Islington",
    "value": "CA/NL/Islington"
  },
  {
    "label": "Jerseyside",
    "value": "CA/NL/Jerseyside"
  },
  {
    "label": "Jobs Cove",
    "value": "CA/NL/Jobs Cove"
  },
  {
    "label": "Lance Cove",
    "value": "CA/NL/Lance Cove"
  },
  {
    "label": "Little Harbour East Pb",
    "value": "CA/NL/Little Harbour East Pb"
  },
  {
    "label": "Logy Bay",
    "value": "CA/NL/Logy Bay"
  },
  {
    "label": "Long Harbour",
    "value": "CA/NL/Long Harbour"
  },
  {
    "label": "Lower Island Cove",
    "value": "CA/NL/Lower Island Cove"
  },
  {
    "label": "Makinsons",
    "value": "CA/NL/Makinsons"
  },
  {
    "label": "Marysvale",
    "value": "CA/NL/Marysvale"
  },
  {
    "label": "Middle Cove",
    "value": "CA/NL/Middle Cove"
  },
  {
    "label": "Mobile",
    "value": "CA/NL/Mobile"
  },
  {
    "label": "Mount Arlington Heights",
    "value": "CA/NL/Mount Arlington Heights"
  },
  {
    "label": "Mount Carmel",
    "value": "CA/NL/Mount Carmel"
  },
  {
    "label": "Mount Pearl",
    "value": "CA/NL/Mount Pearl"
  },
  {
    "label": "New Chelsea",
    "value": "CA/NL/New Chelsea"
  },
  {
    "label": "New Harbour Tb",
    "value": "CA/NL/New Harbour Tb"
  },
  {
    "label": "New Melbourne",
    "value": "CA/NL/New Melbourne"
  },
  {
    "label": "New Perlican",
    "value": "CA/NL/New Perlican"
  },
  {
    "label": "Normans Cove",
    "value": "CA/NL/Normans Cove"
  },
  {
    "label": "North Harbour Smb",
    "value": "CA/NL/North Harbour Smb"
  },
  {
    "label": "North Valley",
    "value": "CA/NL/North Valley"
  },
  {
    "label": "Northern Bay",
    "value": "CA/NL/Northern Bay"
  },
  {
    "label": "Ochre Pit Cove",
    "value": "CA/NL/Ochre Pit Cove"
  },
  {
    "label": "Old Perlican",
    "value": "CA/NL/Old Perlican"
  },
  {
    "label": "Old Shop",
    "value": "CA/NL/Old Shop"
  },
  {
    "label": "Outer Cove",
    "value": "CA/NL/Outer Cove"
  },
  {
    "label": "Paradise",
    "value": "CA/NL/Paradise"
  },
  {
    "label": "Patrick's Cove-Angels Cove",
    "value": "CA/NL/Patrick's Cove-Angels Cove"
  },
  {
    "label": "Petty Harbour",
    "value": "CA/NL/Petty Harbour"
  },
  {
    "label": "Placentia",
    "value": "CA/NL/Placentia"
  },
  {
    "label": "Port De Grave",
    "value": "CA/NL/Port De Grave"
  },
  {
    "label": "Portugal Cove-St Philips",
    "value": "CA/NL/Portugal Cove-St Philips"
  },
  {
    "label": "Pouch Cove",
    "value": "CA/NL/Pouch Cove"
  },
  {
    "label": "Red Head Cove",
    "value": "CA/NL/Red Head Cove"
  },
  {
    "label": "Renews",
    "value": "CA/NL/Renews"
  },
  {
    "label": "Riverhead Harbour Grace",
    "value": "CA/NL/Riverhead Harbour Grace"
  },
  {
    "label": "Salmon Cove Bdv",
    "value": "CA/NL/Salmon Cove Bdv"
  },
  {
    "label": "Shea Heights",
    "value": "CA/NL/Shea Heights"
  },
  {
    "label": "Shearstown",
    "value": "CA/NL/Shearstown"
  },
  {
    "label": "Ship Harbour Pb",
    "value": "CA/NL/Ship Harbour Pb"
  },
  {
    "label": "South Dildo",
    "value": "CA/NL/South Dildo"
  },
  {
    "label": "South River",
    "value": "CA/NL/South River"
  },
  {
    "label": "Southern Harbour Pb",
    "value": "CA/NL/Southern Harbour Pb"
  },
  {
    "label": "Spaniards Bay",
    "value": "CA/NL/Spaniards Bay"
  },
  {
    "label": "St Brides",
    "value": "CA/NL/St Brides"
  },
  {
    "label": "St John's",
    "value": "CA/NL/St John's"
  },
  {
    "label": "St Josephs Sal",
    "value": "CA/NL/St Josephs Sal"
  },
  {
    "label": "St Marys",
    "value": "CA/NL/St Marys"
  },
  {
    "label": "St Shotts",
    "value": "CA/NL/St Shotts"
  },
  {
    "label": "St Vincents",
    "value": "CA/NL/St Vincents"
  },
  {
    "label": "Torbay",
    "value": "CA/NL/Torbay"
  },
  {
    "label": "Tors Cove",
    "value": "CA/NL/Tors Cove"
  },
  {
    "label": "Trepassey",
    "value": "CA/NL/Trepassey"
  },
  {
    "label": "Turks Cove",
    "value": "CA/NL/Turks Cove"
  },
  {
    "label": "Upper Island Cove",
    "value": "CA/NL/Upper Island Cove"
  },
  {
    "label": "Victoria Cb",
    "value": "CA/NL/Victoria Cb"
  },
  {
    "label": "Western Bay",
    "value": "CA/NL/Western Bay"
  },
  {
    "label": "Whitbourne",
    "value": "CA/NL/Whitbourne"
  },
  {
    "label": "Whiteway",
    "value": "CA/NL/Whiteway"
  },
  {
    "label": "Winterton",
    "value": "CA/NL/Winterton"
  },
  {
    "label": "Witless Bay",
    "value": "CA/NL/Witless Bay"
  },
  {
    "label": "Woodfords",
    "value": "CA/NL/Woodfords"
  },
  {
    "label": "Baine Harbour",
    "value": "CA/NL/Baine Harbour"
  },
  {
    "label": "Burin",
    "value": "CA/NL/Burin"
  },
  {
    "label": "Burin Bay Arm",
    "value": "CA/NL/Burin Bay Arm"
  },
  {
    "label": "Creston",
    "value": "CA/NL/Creston"
  },
  {
    "label": "Creston North",
    "value": "CA/NL/Creston North"
  },
  {
    "label": "English Harbour East",
    "value": "CA/NL/English Harbour East"
  },
  {
    "label": "Epworth",
    "value": "CA/NL/Epworth"
  },
  {
    "label": "Fortune",
    "value": "CA/NL/Fortune"
  },
  {
    "label": "Garden Cove Pb",
    "value": "CA/NL/Garden Cove Pb"
  },
  {
    "label": "Garnish",
    "value": "CA/NL/Garnish"
  },
  {
    "label": "Grand Bank",
    "value": "CA/NL/Grand Bank"
  },
  {
    "label": "Grand Beach",
    "value": "CA/NL/Grand Beach"
  },
  {
    "label": "Harbour Mille",
    "value": "CA/NL/Harbour Mille"
  },
  {
    "label": "Lamaline",
    "value": "CA/NL/Lamaline"
  },
  {
    "label": "Lawn",
    "value": "CA/NL/Lawn"
  },
  {
    "label": "Lewins Cove",
    "value": "CA/NL/Lewins Cove"
  },
  {
    "label": "Little Bay East",
    "value": "CA/NL/Little Bay East"
  },
  {
    "label": "Marystown",
    "value": "CA/NL/Marystown"
  },
  {
    "label": "Monkstown",
    "value": "CA/NL/Monkstown"
  },
  {
    "label": "Parkers Cove",
    "value": "CA/NL/Parkers Cove"
  },
  {
    "label": "Red Harbour Pb",
    "value": "CA/NL/Red Harbour Pb"
  },
  {
    "label": "Rushoon",
    "value": "CA/NL/Rushoon"
  },
  {
    "label": "South East Bight",
    "value": "CA/NL/South East Bight"
  },
  {
    "label": "St Bernards-Jacques Fontaine",
    "value": "CA/NL/St Bernards-Jacques Fontaine"
  },
  {
    "label": "St Lawrence",
    "value": "CA/NL/St Lawrence"
  },
  {
    "label": "Swift Current",
    "value": "CA/NL/Swift Current"
  },
  {
    "label": "Terrenceville",
    "value": "CA/NL/Terrenceville"
  },
  {
    "label": "Aspen Cove",
    "value": "CA/NL/Aspen Cove"
  },
  {
    "label": "Badger",
    "value": "CA/NL/Badger"
  },
  {
    "label": "Badgers Quay",
    "value": "CA/NL/Badgers Quay"
  },
  {
    "label": "Baie Verte",
    "value": "CA/NL/Baie Verte"
  },
  {
    "label": "Baytona",
    "value": "CA/NL/Baytona"
  },
  {
    "label": "Beaumont",
    "value": "CA/NL/Beaumont"
  },
  {
    "label": "Belleoram",
    "value": "CA/NL/Belleoram"
  },
  {
    "label": "Benton",
    "value": "CA/NL/Benton"
  },
  {
    "label": "Birchy Bay",
    "value": "CA/NL/Birchy Bay"
  },
  {
    "label": "Bishops Falls",
    "value": "CA/NL/Bishops Falls"
  },
  {
    "label": "Botwood",
    "value": "CA/NL/Botwood"
  },
  {
    "label": "Boyds Cove",
    "value": "CA/NL/Boyds Cove"
  },
  {
    "label": "Brents Cove",
    "value": "CA/NL/Brents Cove"
  },
  {
    "label": "Bridgeport",
    "value": "CA/NL/Bridgeport"
  },
  {
    "label": "Brighton",
    "value": "CA/NL/Brighton"
  },
  {
    "label": "Brookfield",
    "value": "CA/NL/Brookfield"
  },
  {
    "label": "Buchans",
    "value": "CA/NL/Buchans"
  },
  {
    "label": "Buchans Junction",
    "value": "CA/NL/Buchans Junction"
  },
  {
    "label": "Burlington",
    "value": "CA/NL/Burlington"
  },
  {
    "label": "Burnside",
    "value": "CA/NL/Burnside"
  },
  {
    "label": "Campbellton",
    "value": "CA/NL/Campbellton"
  },
  {
    "label": "Cape Freels North",
    "value": "CA/NL/Cape Freels North"
  },
  {
    "label": "Carmanville",
    "value": "CA/NL/Carmanville"
  },
  {
    "label": "Carters Cove",
    "value": "CA/NL/Carters Cove"
  },
  {
    "label": "Change Islands",
    "value": "CA/NL/Change Islands"
  },
  {
    "label": "Charlottetown",
    "value": "CA/NL/Charlottetown"
  },
  {
    "label": "Coachmans Cove",
    "value": "CA/NL/Coachmans Cove"
  },
  {
    "label": "Comfort Cove-Newstead",
    "value": "CA/NL/Comfort Cove-Newstead"
  },
  {
    "label": "Conne River",
    "value": "CA/NL/Conne River"
  },
  {
    "label": "Coombs Cove",
    "value": "CA/NL/Coombs Cove"
  },
  {
    "label": "Cottlesville",
    "value": "CA/NL/Cottlesville"
  },
  {
    "label": "Cottrells Cove",
    "value": "CA/NL/Cottrells Cove"
  },
  {
    "label": "Deadmans Bay",
    "value": "CA/NL/Deadmans Bay"
  },
  {
    "label": "Deep Bay",
    "value": "CA/NL/Deep Bay"
  },
  {
    "label": "Dover",
    "value": "CA/NL/Dover"
  },
  {
    "label": "Durrell",
    "value": "CA/NL/Durrell"
  },
  {
    "label": "Eastport",
    "value": "CA/NL/Eastport"
  },
  {
    "label": "Embree",
    "value": "CA/NL/Embree"
  },
  {
    "label": "English Harbour West",
    "value": "CA/NL/English Harbour West"
  },
  {
    "label": "Fleur De Lys",
    "value": "CA/NL/Fleur De Lys"
  },
  {
    "label": "Fogo",
    "value": "CA/NL/Fogo"
  },
  {
    "label": "Francois",
    "value": "CA/NL/Francois"
  },
  {
    "label": "Frederickton",
    "value": "CA/NL/Frederickton"
  },
  {
    "label": "Gambo",
    "value": "CA/NL/Gambo"
  },
  {
    "label": "Gambo South",
    "value": "CA/NL/Gambo South"
  },
  {
    "label": "Gander",
    "value": "CA/NL/Gander"
  },
  {
    "label": "Gander Bay",
    "value": "CA/NL/Gander Bay"
  },
  {
    "label": "Gander Bay South",
    "value": "CA/NL/Gander Bay South"
  },
  {
    "label": "Gaultois",
    "value": "CA/NL/Gaultois"
  },
  {
    "label": "Glenwood",
    "value": "CA/NL/Glenwood"
  },
  {
    "label": "Glovertown",
    "value": "CA/NL/Glovertown"
  },
  {
    "label": "Glovertown South",
    "value": "CA/NL/Glovertown South"
  },
  {
    "label": "Grand Falls-Windsor",
    "value": "CA/NL/Grand Falls-Windsor"
  },
  {
    "label": "Greenspond",
    "value": "CA/NL/Greenspond"
  },
  {
    "label": "Grey River",
    "value": "CA/NL/Grey River"
  },
  {
    "label": "Harbour Breton",
    "value": "CA/NL/Harbour Breton"
  },
  {
    "label": "Harbour Round",
    "value": "CA/NL/Harbour Round"
  },
  {
    "label": "Hare Bay Bb",
    "value": "CA/NL/Hare Bay Bb"
  },
  {
    "label": "Harrys Harbour",
    "value": "CA/NL/Harrys Harbour"
  },
  {
    "label": "Head Bay D'espoir",
    "value": "CA/NL/Head Bay D'espoir"
  },
  {
    "label": "Hermitage",
    "value": "CA/NL/Hermitage"
  },
  {
    "label": "Herring Neck",
    "value": "CA/NL/Herring Neck"
  },
  {
    "label": "Hillgrade",
    "value": "CA/NL/Hillgrade"
  },
  {
    "label": "Horwood",
    "value": "CA/NL/Horwood"
  },
  {
    "label": "Howley",
    "value": "CA/NL/Howley"
  },
  {
    "label": "Indian Bay Bb",
    "value": "CA/NL/Indian Bay Bb"
  },
  {
    "label": "Island Harbour",
    "value": "CA/NL/Island Harbour"
  },
  {
    "label": "Jacksons Cove",
    "value": "CA/NL/Jacksons Cove"
  },
  {
    "label": "Joe Batts Arm",
    "value": "CA/NL/Joe Batts Arm"
  },
  {
    "label": "Kings Point",
    "value": "CA/NL/Kings Point"
  },
  {
    "label": "La Scie",
    "value": "CA/NL/La Scie"
  },
  {
    "label": "Ladle Cove",
    "value": "CA/NL/Ladle Cove"
  },
  {
    "label": "Laurenceton",
    "value": "CA/NL/Laurenceton"
  },
  {
    "label": "Leading Tickles",
    "value": "CA/NL/Leading Tickles"
  },
  {
    "label": "Lewisporte",
    "value": "CA/NL/Lewisporte"
  },
  {
    "label": "Little Bay Islands",
    "value": "CA/NL/Little Bay Islands"
  },
  {
    "label": "Little Bay Ndb",
    "value": "CA/NL/Little Bay Ndb"
  },
  {
    "label": "Little Burnt Bay",
    "value": "CA/NL/Little Burnt Bay"
  },
  {
    "label": "Loon Bay",
    "value": "CA/NL/Loon Bay"
  },
  {
    "label": "Lumsden",
    "value": "CA/NL/Lumsden"
  },
  {
    "label": "Main Point",
    "value": "CA/NL/Main Point"
  },
  {
    "label": "Mccallum",
    "value": "CA/NL/Mccallum"
  },
  {
    "label": "Middle Arm Gb",
    "value": "CA/NL/Middle Arm Gb"
  },
  {
    "label": "Miles Cove",
    "value": "CA/NL/Miles Cove"
  },
  {
    "label": "Millertown",
    "value": "CA/NL/Millertown"
  },
  {
    "label": "Milltown",
    "value": "CA/NL/Milltown"
  },
  {
    "label": "Mings Bight",
    "value": "CA/NL/Mings Bight"
  },
  {
    "label": "Moretons Harbour",
    "value": "CA/NL/Moretons Harbour"
  },
  {
    "label": "Musgrave Harbour",
    "value": "CA/NL/Musgrave Harbour"
  },
  {
    "label": "Newtown",
    "value": "CA/NL/Newtown"
  },
  {
    "label": "Nippers Harbour",
    "value": "CA/NL/Nippers Harbour"
  },
  {
    "label": "Norris Arm",
    "value": "CA/NL/Norris Arm"
  },
  {
    "label": "Norris Arm Northside",
    "value": "CA/NL/Norris Arm Northside"
  },
  {
    "label": "Pacquet",
    "value": "CA/NL/Pacquet"
  },
  {
    "label": "Peterview",
    "value": "CA/NL/Peterview"
  },
  {
    "label": "Pilleys Island",
    "value": "CA/NL/Pilleys Island"
  },
  {
    "label": "Point Leamington",
    "value": "CA/NL/Point Leamington"
  },
  {
    "label": "Point Of Bay",
    "value": "CA/NL/Point Of Bay"
  },
  {
    "label": "Pools Cove",
    "value": "CA/NL/Pools Cove"
  },
  {
    "label": "Pools Island",
    "value": "CA/NL/Pools Island"
  },
  {
    "label": "Port Albert",
    "value": "CA/NL/Port Albert"
  },
  {
    "label": "Port Anson",
    "value": "CA/NL/Port Anson"
  },
  {
    "label": "Pound Cove",
    "value": "CA/NL/Pound Cove"
  },
  {
    "label": "Ramea",
    "value": "CA/NL/Ramea"
  },
  {
    "label": "Rattling Brook",
    "value": "CA/NL/Rattling Brook"
  },
  {
    "label": "Rencontre East",
    "value": "CA/NL/Rencontre East"
  },
  {
    "label": "Roberts Arm",
    "value": "CA/NL/Roberts Arm"
  },
  {
    "label": "Rodgers Cove",
    "value": "CA/NL/Rodgers Cove"
  },
  {
    "label": "Round Harbour Gb",
    "value": "CA/NL/Round Harbour Gb"
  },
  {
    "label": "Salvage",
    "value": "CA/NL/Salvage"
  },
  {
    "label": "Sandringham",
    "value": "CA/NL/Sandringham"
  },
  {
    "label": "Seal Cove Fb",
    "value": "CA/NL/Seal Cove Fb"
  },
  {
    "label": "Seal Cove Wb",
    "value": "CA/NL/Seal Cove Wb"
  },
  {
    "label": "Seldom",
    "value": "CA/NL/Seldom"
  },
  {
    "label": "Shalloway Cove",
    "value": "CA/NL/Shalloway Cove"
  },
  {
    "label": "Shoe Cove",
    "value": "CA/NL/Shoe Cove"
  },
  {
    "label": "Snooks Arm",
    "value": "CA/NL/Snooks Arm"
  },
  {
    "label": "South Brook Gb",
    "value": "CA/NL/South Brook Gb"
  },
  {
    "label": "Springdale",
    "value": "CA/NL/Springdale"
  },
  {
    "label": "St Albans",
    "value": "CA/NL/St Albans"
  },
  {
    "label": "St Brendans",
    "value": "CA/NL/St Brendans"
  },
  {
    "label": "St Chads",
    "value": "CA/NL/St Chads"
  },
  {
    "label": "Stag Harbour",
    "value": "CA/NL/Stag Harbour"
  },
  {
    "label": "Stoneville",
    "value": "CA/NL/Stoneville"
  },
  {
    "label": "Summerford",
    "value": "CA/NL/Summerford"
  },
  {
    "label": "Templeman",
    "value": "CA/NL/Templeman"
  },
  {
    "label": "Tilting",
    "value": "CA/NL/Tilting"
  },
  {
    "label": "Tizzards Harbour",
    "value": "CA/NL/Tizzards Harbour"
  },
  {
    "label": "Traytown",
    "value": "CA/NL/Traytown"
  },
  {
    "label": "Trinity Bb",
    "value": "CA/NL/Trinity Bb"
  },
  {
    "label": "Triton",
    "value": "CA/NL/Triton"
  },
  {
    "label": "Twillingate",
    "value": "CA/NL/Twillingate"
  },
  {
    "label": "Valley Pond",
    "value": "CA/NL/Valley Pond"
  },
  {
    "label": "Victoria Cove",
    "value": "CA/NL/Victoria Cove"
  },
  {
    "label": "Wareham-Centreville",
    "value": "CA/NL/Wareham-Centreville"
  },
  {
    "label": "Wesleyville",
    "value": "CA/NL/Wesleyville"
  },
  {
    "label": "Westport",
    "value": "CA/NL/Westport"
  },
  {
    "label": "Wings Point",
    "value": "CA/NL/Wings Point"
  },
  {
    "label": "Woodstock",
    "value": "CA/NL/Woodstock"
  },
  {
    "label": "Bloomfield",
    "value": "CA/NL/Bloomfield"
  },
  {
    "label": "Bonavista",
    "value": "CA/NL/Bonavista"
  },
  {
    "label": "Bunyans Cove",
    "value": "CA/NL/Bunyans Cove"
  },
  {
    "label": "Catalina",
    "value": "CA/NL/Catalina"
  },
  {
    "label": "Clarenville",
    "value": "CA/NL/Clarenville"
  },
  {
    "label": "Elliston",
    "value": "CA/NL/Elliston"
  },
  {
    "label": "Gooseberry Cove",
    "value": "CA/NL/Gooseberry Cove"
  },
  {
    "label": "Hickmans Harbour",
    "value": "CA/NL/Hickmans Harbour"
  },
  {
    "label": "Hillview",
    "value": "CA/NL/Hillview"
  },
  {
    "label": "Hodges Cove",
    "value": "CA/NL/Hodges Cove"
  },
  {
    "label": "Kings Cove",
    "value": "CA/NL/Kings Cove"
  },
  {
    "label": "Knights Cove",
    "value": "CA/NL/Knights Cove"
  },
  {
    "label": "Lethbridge",
    "value": "CA/NL/Lethbridge"
  },
  {
    "label": "Little Catalina",
    "value": "CA/NL/Little Catalina"
  },
  {
    "label": "Melrose",
    "value": "CA/NL/Melrose"
  },
  {
    "label": "Musgravetown",
    "value": "CA/NL/Musgravetown"
  },
  {
    "label": "Newmans Cove",
    "value": "CA/NL/Newmans Cove"
  },
  {
    "label": "Plate Cove East",
    "value": "CA/NL/Plate Cove East"
  },
  {
    "label": "Plate Cove West",
    "value": "CA/NL/Plate Cove West"
  },
  {
    "label": "Port Blandford",
    "value": "CA/NL/Port Blandford"
  },
  {
    "label": "Port Rexton",
    "value": "CA/NL/Port Rexton"
  },
  {
    "label": "Port Union",
    "value": "CA/NL/Port Union"
  },
  {
    "label": "Princeton",
    "value": "CA/NL/Princeton"
  },
  {
    "label": "Sandy Cove",
    "value": "CA/NL/Sandy Cove"
  },
  {
    "label": "Southern Bay",
    "value": "CA/NL/Southern Bay"
  },
  {
    "label": "Summerville",
    "value": "CA/NL/Summerville"
  },
  {
    "label": "Sweet Bay",
    "value": "CA/NL/Sweet Bay"
  },
  {
    "label": "Tickle Cove",
    "value": "CA/NL/Tickle Cove"
  },
  {
    "label": "Trinity Tb",
    "value": "CA/NL/Trinity Tb"
  },
  {
    "label": "Arnolds Cove",
    "value": "CA/NL/Arnolds Cove"
  },
  {
    "label": "Come By Chance",
    "value": "CA/NL/Come By Chance"
  },
  {
    "label": "Portugal Cove-St Philip's",
    "value": "CA/NL/Portugal Cove-St Philip's"
  },
  {
    "label": "Sunnyside",
    "value": "CA/NL/Sunnyside"
  },
  {
    "label": "Victoria",
    "value": "CA/NL/Victoria"
  },
  {
    "label": "Benoits Cove",
    "value": "CA/NL/Benoits Cove"
  },
  {
    "label": "Corner Brook",
    "value": "CA/NL/Corner Brook"
  },
  {
    "label": "Coxs Cove",
    "value": "CA/NL/Coxs Cove"
  },
  {
    "label": "Deer Lake",
    "value": "CA/NL/Deer Lake"
  },
  {
    "label": "Frenchman's Cove Boi",
    "value": "CA/NL/Frenchman's Cove Boi"
  },
  {
    "label": "Hampden",
    "value": "CA/NL/Hampden"
  },
  {
    "label": "Irishtown-Summerside",
    "value": "CA/NL/Irishtown-Summerside"
  },
  {
    "label": "Jacksons Arm",
    "value": "CA/NL/Jacksons Arm"
  },
  {
    "label": "Lark Harbour",
    "value": "CA/NL/Lark Harbour"
  },
  {
    "label": "Massey Drive",
    "value": "CA/NL/Massey Drive"
  },
  {
    "label": "Mount Moriah",
    "value": "CA/NL/Mount Moriah"
  },
  {
    "label": "Pasadena",
    "value": "CA/NL/Pasadena"
  },
  {
    "label": "Pollards Point",
    "value": "CA/NL/Pollards Point"
  },
  {
    "label": "Reidville",
    "value": "CA/NL/Reidville"
  },
  {
    "label": "Sops Arm",
    "value": "CA/NL/Sops Arm"
  },
  {
    "label": "York Harbour",
    "value": "CA/NL/York Harbour"
  },
  {
    "label": "Bay L'argent",
    "value": "CA/NL/Bay L'argent"
  },
  {
    "label": "Boat Harbour West",
    "value": "CA/NL/Boat Harbour West"
  },
  {
    "label": "Burgoynes Cove",
    "value": "CA/NL/Burgoynes Cove"
  },
  {
    "label": "Burns Cove",
    "value": "CA/NL/Burns Cove"
  },
  {
    "label": "Cannings Cove",
    "value": "CA/NL/Cannings Cove"
  },
  {
    "label": "Charleston",
    "value": "CA/NL/Charleston"
  },
  {
    "label": "Duntara",
    "value": "CA/NL/Duntara"
  },
  {
    "label": "Frenchmans Cove Fb",
    "value": "CA/NL/Frenchmans Cove Fb"
  },
  {
    "label": "Grand Le Pierre",
    "value": "CA/NL/Grand Le Pierre"
  },
  {
    "label": "Keels",
    "value": "CA/NL/Keels"
  },
  {
    "label": "Little Bay Pb",
    "value": "CA/NL/Little Bay Pb"
  },
  {
    "label": "Little Hearts Ease",
    "value": "CA/NL/Little Hearts Ease"
  },
  {
    "label": "Little St Lawrence",
    "value": "CA/NL/Little St Lawrence"
  },
  {
    "label": "North Harbour Pb",
    "value": "CA/NL/North Harbour Pb"
  },
  {
    "label": "North West Brook",
    "value": "CA/NL/North West Brook"
  },
  {
    "label": "Open Hall",
    "value": "CA/NL/Open Hall"
  },
  {
    "label": "Petit Forte",
    "value": "CA/NL/Petit Forte"
  },
  {
    "label": "Winterland",
    "value": "CA/NL/Winterland"
  },
  {
    "label": "Burgeo",
    "value": "CA/NL/Burgeo"
  },
  {
    "label": "Burnt Islands Blp",
    "value": "CA/NL/Burnt Islands Blp"
  },
  {
    "label": "Channel-Port-Aux-Basques",
    "value": "CA/NL/Channel-Port-Aux-Basques"
  },
  {
    "label": "Grand Bay East",
    "value": "CA/NL/Grand Bay East"
  },
  {
    "label": "Isle-Aux-Morts",
    "value": "CA/NL/Isle-Aux-Morts"
  },
  {
    "label": "La Poile",
    "value": "CA/NL/La Poile"
  },
  {
    "label": "Rose Blanche",
    "value": "CA/NL/Rose Blanche"
  },
  {
    "label": "Hopedale",
    "value": "CA/NL/Hopedale"
  },
  {
    "label": "Makkovik",
    "value": "CA/NL/Makkovik"
  },
  {
    "label": "Nain",
    "value": "CA/NL/Nain"
  },
  {
    "label": "Postville",
    "value": "CA/NL/Postville"
  },
  {
    "label": "Rigolet",
    "value": "CA/NL/Rigolet"
  },
  {
    "label": "Black Tickle",
    "value": "CA/NL/Black Tickle"
  },
  {
    "label": "Cartwright",
    "value": "CA/NL/Cartwright"
  },
  {
    "label": "Churchill Falls",
    "value": "CA/NL/Churchill Falls"
  },
  {
    "label": "Forteau",
    "value": "CA/NL/Forteau"
  },
  {
    "label": "Happy Valley-Goose Bay",
    "value": "CA/NL/Happy Valley-Goose Bay"
  },
  {
    "label": "Labrador City",
    "value": "CA/NL/Labrador City"
  },
  {
    "label": "L'anse Au Clair",
    "value": "CA/NL/L'anse Au Clair"
  },
  {
    "label": "L'anse Au Loup",
    "value": "CA/NL/L'anse Au Loup"
  },
  {
    "label": "Lodge Bay",
    "value": "CA/NL/Lodge Bay"
  },
  {
    "label": "Marys Harbour",
    "value": "CA/NL/Marys Harbour"
  },
  {
    "label": "Mud Lake",
    "value": "CA/NL/Mud Lake"
  },
  {
    "label": "Natuashish",
    "value": "CA/NL/Natuashish"
  },
  {
    "label": "North West River",
    "value": "CA/NL/North West River"
  },
  {
    "label": "Port Hope Simpson",
    "value": "CA/NL/Port Hope Simpson"
  },
  {
    "label": "Red Bay",
    "value": "CA/NL/Red Bay"
  },
  {
    "label": "St Lewis",
    "value": "CA/NL/St Lewis"
  },
  {
    "label": "Wabush",
    "value": "CA/NL/Wabush"
  },
  {
    "label": "West St Modeste",
    "value": "CA/NL/West St Modeste"
  },
  {
    "label": "Athlete's Village",
    "value": "CA/NL/Athlete's Village"
  },
  {
    "label": "Harrington Harbour",
    "value": "CA/NL/Harrington Harbour"
  },
  {
    "label": "Aguathuna",
    "value": "CA/NL/Aguathuna"
  },
  {
    "label": "Barachois Brook",
    "value": "CA/NL/Barachois Brook"
  },
  {
    "label": "Codroy",
    "value": "CA/NL/Codroy"
  },
  {
    "label": "Doyles",
    "value": "CA/NL/Doyles"
  },
  {
    "label": "Heatherton",
    "value": "CA/NL/Heatherton"
  },
  {
    "label": "Highlands",
    "value": "CA/NL/Highlands"
  },
  {
    "label": "Kippens",
    "value": "CA/NL/Kippens"
  },
  {
    "label": "Lourdes",
    "value": "CA/NL/Lourdes"
  },
  {
    "label": "Noels Pond",
    "value": "CA/NL/Noels Pond"
  },
  {
    "label": "Port Au Port",
    "value": "CA/NL/Port Au Port"
  },
  {
    "label": "Robinsons",
    "value": "CA/NL/Robinsons"
  },
  {
    "label": "South Branch",
    "value": "CA/NL/South Branch"
  },
  {
    "label": "St Andrews",
    "value": "CA/NL/St Andrews"
  },
  {
    "label": "St Davids",
    "value": "CA/NL/St Davids"
  },
  {
    "label": "St Fintans",
    "value": "CA/NL/St Fintans"
  },
  {
    "label": "St Georges",
    "value": "CA/NL/St Georges"
  },
  {
    "label": "Stephenville",
    "value": "CA/NL/Stephenville"
  },
  {
    "label": "Stephenville Crossing",
    "value": "CA/NL/Stephenville Crossing"
  },
  {
    "label": "West Bay Centre",
    "value": "CA/NL/West Bay Centre"
  },
  {
    "label": "Anchor Point",
    "value": "CA/NL/Anchor Point"
  },
  {
    "label": "Bartletts Harbour",
    "value": "CA/NL/Bartletts Harbour"
  },
  {
    "label": "Bellburns",
    "value": "CA/NL/Bellburns"
  },
  {
    "label": "Bide Arm",
    "value": "CA/NL/Bide Arm"
  },
  {
    "label": "Birchy Head",
    "value": "CA/NL/Birchy Head"
  },
  {
    "label": "Bird Cove",
    "value": "CA/NL/Bird Cove"
  },
  {
    "label": "Black Duck Cove",
    "value": "CA/NL/Black Duck Cove"
  },
  {
    "label": "Black Duck Siding",
    "value": "CA/NL/Black Duck Siding"
  },
  {
    "label": "Bonne Bay",
    "value": "CA/NL/Bonne Bay"
  },
  {
    "label": "Bonne Bay Pond",
    "value": "CA/NL/Bonne Bay Pond"
  },
  {
    "label": "Cape Ray",
    "value": "CA/NL/Cape Ray"
  },
  {
    "label": "Cape St George",
    "value": "CA/NL/Cape St George"
  },
  {
    "label": "Cartyville",
    "value": "CA/NL/Cartyville"
  },
  {
    "label": "Castors River",
    "value": "CA/NL/Castors River"
  },
  {
    "label": "Charlottetown Lab",
    "value": "CA/NL/Charlottetown Lab"
  },
  {
    "label": "Conche",
    "value": "CA/NL/Conche"
  },
  {
    "label": "Cooks Harbour",
    "value": "CA/NL/Cooks Harbour"
  },
  {
    "label": "Cormack",
    "value": "CA/NL/Cormack"
  },
  {
    "label": "Cow Head",
    "value": "CA/NL/Cow Head"
  },
  {
    "label": "Croque",
    "value": "CA/NL/Croque"
  },
  {
    "label": "Daniels Harbour",
    "value": "CA/NL/Daniels Harbour"
  },
  {
    "label": "Eddies Cove",
    "value": "CA/NL/Eddies Cove"
  },
  {
    "label": "Eddies Cove West",
    "value": "CA/NL/Eddies Cove West"
  },
  {
    "label": "Englee",
    "value": "CA/NL/Englee"
  },
  {
    "label": "Flowers Cove",
    "value": "CA/NL/Flowers Cove"
  },
  {
    "label": "Frenchmans Cove Boi",
    "value": "CA/NL/Frenchmans Cove Boi"
  },
  {
    "label": "Gallants",
    "value": "CA/NL/Gallants"
  },
  {
    "label": "Grand Bruit",
    "value": "CA/NL/Grand Bruit"
  },
  {
    "label": "Great Brehat",
    "value": "CA/NL/Great Brehat"
  },
  {
    "label": "Green Island Brook",
    "value": "CA/NL/Green Island Brook"
  },
  {
    "label": "Green Island Cove",
    "value": "CA/NL/Green Island Cove"
  },
  {
    "label": "Hawkes Bay",
    "value": "CA/NL/Hawkes Bay"
  },
  {
    "label": "Jeffreys",
    "value": "CA/NL/Jeffreys"
  },
  {
    "label": "Main Brook",
    "value": "CA/NL/Main Brook"
  },
  {
    "label": "Meadows",
    "value": "CA/NL/Meadows"
  },
  {
    "label": "Norris Point",
    "value": "CA/NL/Norris Point"
  },
  {
    "label": "Paradise River",
    "value": "CA/NL/Paradise River"
  },
  {
    "label": "Parsons Pond",
    "value": "CA/NL/Parsons Pond"
  },
  {
    "label": "Plum Point",
    "value": "CA/NL/Plum Point"
  },
  {
    "label": "Port Au Choix",
    "value": "CA/NL/Port Au Choix"
  },
  {
    "label": "Port Saunders",
    "value": "CA/NL/Port Saunders"
  },
  {
    "label": "Portland Creek",
    "value": "CA/NL/Portland Creek"
  },
  {
    "label": "Pynn's Brook",
    "value": "CA/NL/Pynn's Brook"
  },
  {
    "label": "Raleigh",
    "value": "CA/NL/Raleigh"
  },
  {
    "label": "Reefs Harbour",
    "value": "CA/NL/Reefs Harbour"
  },
  {
    "label": "River Of Ponds",
    "value": "CA/NL/River Of Ponds"
  },
  {
    "label": "Rocky Harbour",
    "value": "CA/NL/Rocky Harbour"
  },
  {
    "label": "Roddickton",
    "value": "CA/NL/Roddickton"
  },
  {
    "label": "Sallys Cove",
    "value": "CA/NL/Sallys Cove"
  },
  {
    "label": "St Anthony",
    "value": "CA/NL/St Anthony"
  },
  {
    "label": "St Anthony East",
    "value": "CA/NL/St Anthony East"
  },
  {
    "label": "St Judes",
    "value": "CA/NL/St Judes"
  },
  {
    "label": "St Juliens",
    "value": "CA/NL/St Juliens"
  },
  {
    "label": "St Lunaire-Griquet",
    "value": "CA/NL/St Lunaire-Griquet"
  },
  {
    "label": "St Pauls",
    "value": "CA/NL/St Pauls"
  },
  {
    "label": "Steady Brook",
    "value": "CA/NL/Steady Brook"
  },
  {
    "label": "Trout River",
    "value": "CA/NL/Trout River"
  },
  {
    "label": "Wild Cove Wb",
    "value": "CA/NL/Wild Cove Wb"
  },
  {
    "label": "Williams Harbour",
    "value": "CA/NL/Williams Harbour"
  },
  {
    "label": "Wiltondale",
    "value": "CA/NL/Wiltondale"
  },
  {
    "label": "Fort Liard",
    "value": "CA/NT/Fort Liard"
  },
  {
    "label": "Fort Simpson",
    "value": "CA/NT/Fort Simpson"
  },
  {
    "label": "Jean Marie River  ",
    "value": "CA/NT/Jean Marie River  "
  },
  {
    "label": "Nahanni Butte",
    "value": "CA/NT/Nahanni Butte"
  },
  {
    "label": "Trout Lake",
    "value": "CA/NT/Trout Lake"
  },
  {
    "label": "Wrigley",
    "value": "CA/NT/Wrigley"
  },
  {
    "label": "Fort Mcpherson",
    "value": "CA/NT/Fort Mcpherson"
  },
  {
    "label": "Inuvik",
    "value": "CA/NT/Inuvik"
  },
  {
    "label": "Paulatuk",
    "value": "CA/NT/Paulatuk"
  },
  {
    "label": "Sachs Harbour",
    "value": "CA/NT/Sachs Harbour"
  },
  {
    "label": "Tsiigehtchic",
    "value": "CA/NT/Tsiigehtchic"
  },
  {
    "label": "Tuktoyaktuk",
    "value": "CA/NT/Tuktoyaktuk"
  },
  {
    "label": "Ulukhaktok",
    "value": "CA/NT/Ulukhaktok"
  },
  {
    "label": "Behchoko",
    "value": "CA/NT/Behchoko"
  },
  {
    "label": "Gameti",
    "value": "CA/NT/Gameti"
  },
  {
    "label": "Lutselk'e",
    "value": "CA/NT/Lutselk'e"
  },
  {
    "label": "Wekweti",
    "value": "CA/NT/Wekweti"
  },
  {
    "label": "Whati",
    "value": "CA/NT/Whati"
  },
  {
    "label": "Yellowknife",
    "value": "CA/NT/Yellowknife"
  },
  {
    "label": "Deline",
    "value": "CA/NT/Deline"
  },
  {
    "label": "Fort Good Hope",
    "value": "CA/NT/Fort Good Hope"
  },
  {
    "label": "Tulita",
    "value": "CA/NT/Tulita"
  },
  {
    "label": "Fort Providence",
    "value": "CA/NT/Fort Providence"
  },
  {
    "label": "Fort Smith",
    "value": "CA/NT/Fort Smith"
  },
  {
    "label": "Fort Resolution",
    "value": "CA/NT/Fort Resolution"
  },
  {
    "label": "Hay River",
    "value": "CA/NT/Hay River"
  },
  {
    "label": "Colville Lake",
    "value": "CA/NT/Colville Lake"
  },
  {
    "label": "Norman Wells",
    "value": "CA/NT/Norman Wells"
  },
  {
    "label": "Annapolis Royal",
    "value": "CA/NS/Annapolis Royal"
  },
  {
    "label": "Bridgetown",
    "value": "CA/NS/Bridgetown"
  },
  {
    "label": "Clementsport",
    "value": "CA/NS/Clementsport"
  },
  {
    "label": "Clementsvale",
    "value": "CA/NS/Clementsvale"
  },
  {
    "label": "Cornwallis",
    "value": "CA/NS/Cornwallis"
  },
  {
    "label": "Deep Brook",
    "value": "CA/NS/Deep Brook"
  },
  {
    "label": "Granville Ferry",
    "value": "CA/NS/Granville Ferry"
  },
  {
    "label": "Hampton",
    "value": "CA/NS/Hampton"
  },
  {
    "label": "Lawrencetown",
    "value": "CA/NS/Lawrencetown"
  },
  {
    "label": "Maitland Bridge",
    "value": "CA/NS/Maitland Bridge"
  },
  {
    "label": "Margaretsville",
    "value": "CA/NS/Margaretsville"
  },
  {
    "label": "Middleton",
    "value": "CA/NS/Middleton"
  },
  {
    "label": "Paradise",
    "value": "CA/NS/Paradise"
  },
  {
    "label": "Springfield",
    "value": "CA/NS/Springfield"
  },
  {
    "label": "Wilmot Station",
    "value": "CA/NS/Wilmot Station"
  },
  {
    "label": "Afton Station",
    "value": "CA/NS/Afton Station"
  },
  {
    "label": "Antigonish",
    "value": "CA/NS/Antigonish"
  },
  {
    "label": "Frankville",
    "value": "CA/NS/Frankville"
  },
  {
    "label": "Havre Boucher",
    "value": "CA/NS/Havre Boucher"
  },
  {
    "label": "Heatherton",
    "value": "CA/NS/Heatherton"
  },
  {
    "label": "Lower South River",
    "value": "CA/NS/Lower South River"
  },
  {
    "label": "Monastery",
    "value": "CA/NS/Monastery"
  },
  {
    "label": "St Andrews",
    "value": "CA/NS/St Andrews"
  },
  {
    "label": "Albert Bridge",
    "value": "CA/NS/Albert Bridge"
  },
  {
    "label": "Alder Point",
    "value": "CA/NS/Alder Point"
  },
  {
    "label": "Balls Creek",
    "value": "CA/NS/Balls Creek"
  },
  {
    "label": "Bateston",
    "value": "CA/NS/Bateston"
  },
  {
    "label": "Beaver Cove",
    "value": "CA/NS/Beaver Cove"
  },
  {
    "label": "Beechmont",
    "value": "CA/NS/Beechmont"
  },
  {
    "label": "Ben Eoin",
    "value": "CA/NS/Ben Eoin"
  },
  {
    "label": "Benacadie",
    "value": "CA/NS/Benacadie"
  },
  {
    "label": "Big Beach",
    "value": "CA/NS/Big Beach"
  },
  {
    "label": "Big Pond",
    "value": "CA/NS/Big Pond"
  },
  {
    "label": "Big Pond Centre",
    "value": "CA/NS/Big Pond Centre"
  },
  {
    "label": "Big Ridge",
    "value": "CA/NS/Big Ridge"
  },
  {
    "label": "Birch Grove",
    "value": "CA/NS/Birch Grove"
  },
  {
    "label": "Blacketts Lake",
    "value": "CA/NS/Blacketts Lake"
  },
  {
    "label": "Boisdale",
    "value": "CA/NS/Boisdale"
  },
  {
    "label": "Bras D'or",
    "value": "CA/NS/Bras D'or"
  },
  {
    "label": "Broughton",
    "value": "CA/NS/Broughton"
  },
  {
    "label": "Caribou Marsh",
    "value": "CA/NS/Caribou Marsh"
  },
  {
    "label": "Castle Bay",
    "value": "CA/NS/Castle Bay"
  },
  {
    "label": "Catalone",
    "value": "CA/NS/Catalone"
  },
  {
    "label": "Catalone Gut",
    "value": "CA/NS/Catalone Gut"
  },
  {
    "label": "Christmas Island",
    "value": "CA/NS/Christmas Island"
  },
  {
    "label": "Coxheath",
    "value": "CA/NS/Coxheath"
  },
  {
    "label": "Dalem Lake",
    "value": "CA/NS/Dalem Lake"
  },
  {
    "label": "Dominion",
    "value": "CA/NS/Dominion"
  },
  {
    "label": "Donkin",
    "value": "CA/NS/Donkin"
  },
  {
    "label": "Dutch Brook",
    "value": "CA/NS/Dutch Brook"
  },
  {
    "label": "East Bay",
    "value": "CA/NS/East Bay"
  },
  {
    "label": "Edwardsville",
    "value": "CA/NS/Edwardsville"
  },
  {
    "label": "Enon",
    "value": "CA/NS/Enon"
  },
  {
    "label": "Eskasoni",
    "value": "CA/NS/Eskasoni"
  },
  {
    "label": "Florence",
    "value": "CA/NS/Florence"
  },
  {
    "label": "Fortress Of Louisbourg",
    "value": "CA/NS/Fortress Of Louisbourg"
  },
  {
    "label": "French Road",
    "value": "CA/NS/French Road"
  },
  {
    "label": "Frenchvale",
    "value": "CA/NS/Frenchvale"
  },
  {
    "label": "Gabarus",
    "value": "CA/NS/Gabarus"
  },
  {
    "label": "Gabarus Lake",
    "value": "CA/NS/Gabarus Lake"
  },
  {
    "label": "Gardiner Mines",
    "value": "CA/NS/Gardiner Mines"
  },
  {
    "label": "Georges River",
    "value": "CA/NS/Georges River"
  },
  {
    "label": "Gillis Lake",
    "value": "CA/NS/Gillis Lake"
  },
  {
    "label": "Glace Bay",
    "value": "CA/NS/Glace Bay"
  },
  {
    "label": "Grand Lake Road",
    "value": "CA/NS/Grand Lake Road"
  },
  {
    "label": "Grand Mira North",
    "value": "CA/NS/Grand Mira North"
  },
  {
    "label": "Grand Mira South",
    "value": "CA/NS/Grand Mira South"
  },
  {
    "label": "Grand Narrows",
    "value": "CA/NS/Grand Narrows"
  },
  {
    "label": "Groves Point",
    "value": "CA/NS/Groves Point"
  },
  {
    "label": "Hillside Boularderie",
    "value": "CA/NS/Hillside Boularderie"
  },
  {
    "label": "Homeville",
    "value": "CA/NS/Homeville"
  },
  {
    "label": "Howie Center",
    "value": "CA/NS/Howie Center"
  },
  {
    "label": "Huntington",
    "value": "CA/NS/Huntington"
  },
  {
    "label": "Irishvale",
    "value": "CA/NS/Irishvale"
  },
  {
    "label": "Ironville",
    "value": "CA/NS/Ironville"
  },
  {
    "label": "Islandview",
    "value": "CA/NS/Islandview"
  },
  {
    "label": "Juniper Mountain",
    "value": "CA/NS/Juniper Mountain"
  },
  {
    "label": "Leitches Creek",
    "value": "CA/NS/Leitches Creek"
  },
  {
    "label": "Lingan",
    "value": "CA/NS/Lingan"
  },
  {
    "label": "Lingan Road",
    "value": "CA/NS/Lingan Road"
  },
  {
    "label": "Little Bras D'or",
    "value": "CA/NS/Little Bras D'or"
  },
  {
    "label": "Little Lorraine",
    "value": "CA/NS/Little Lorraine"
  },
  {
    "label": "Little Pond",
    "value": "CA/NS/Little Pond"
  },
  {
    "label": "Long Island",
    "value": "CA/NS/Long Island"
  },
  {
    "label": "Louisbourg",
    "value": "CA/NS/Louisbourg"
  },
  {
    "label": "Macadams Lake",
    "value": "CA/NS/Macadams Lake"
  },
  {
    "label": "Main-A-Dieu",
    "value": "CA/NS/Main-A-Dieu"
  },
  {
    "label": "Marion Bridge",
    "value": "CA/NS/Marion Bridge"
  },
  {
    "label": "Membertou",
    "value": "CA/NS/Membertou"
  },
  {
    "label": "Middle Cape",
    "value": "CA/NS/Middle Cape"
  },
  {
    "label": "Mill Creek",
    "value": "CA/NS/Mill Creek"
  },
  {
    "label": "Millville",
    "value": "CA/NS/Millville"
  },
  {
    "label": "Mira Gut",
    "value": "CA/NS/Mira Gut"
  },
  {
    "label": "Mira Road",
    "value": "CA/NS/Mira Road"
  },
  {
    "label": "New Victoria",
    "value": "CA/NS/New Victoria"
  },
  {
    "label": "New Waterford",
    "value": "CA/NS/New Waterford"
  },
  {
    "label": "North Sydney",
    "value": "CA/NS/North Sydney"
  },
  {
    "label": "North West Arm",
    "value": "CA/NS/North West Arm"
  },
  {
    "label": "Northside East Bay",
    "value": "CA/NS/Northside East Bay"
  },
  {
    "label": "Oakfield",
    "value": "CA/NS/Oakfield"
  },
  {
    "label": "Pipers Cove",
    "value": "CA/NS/Pipers Cove"
  },
  {
    "label": "Point Aconi",
    "value": "CA/NS/Point Aconi"
  },
  {
    "label": "Point Edward",
    "value": "CA/NS/Point Edward"
  },
  {
    "label": "Port Caledonia",
    "value": "CA/NS/Port Caledonia"
  },
  {
    "label": "Port Morien",
    "value": "CA/NS/Port Morien"
  },
  {
    "label": "Portage",
    "value": "CA/NS/Portage"
  },
  {
    "label": "Prime Brook",
    "value": "CA/NS/Prime Brook"
  },
  {
    "label": "Reserve Mines",
    "value": "CA/NS/Reserve Mines"
  },
  {
    "label": "River Ryan",
    "value": "CA/NS/River Ryan"
  },
  {
    "label": "Rock Elm",
    "value": "CA/NS/Rock Elm"
  },
  {
    "label": "Round Island",
    "value": "CA/NS/Round Island"
  },
  {
    "label": "Sandfield",
    "value": "CA/NS/Sandfield"
  },
  {
    "label": "Scotch Lake",
    "value": "CA/NS/Scotch Lake"
  },
  {
    "label": "Scotchtown",
    "value": "CA/NS/Scotchtown"
  },
  {
    "label": "Shenacadie",
    "value": "CA/NS/Shenacadie"
  },
  {
    "label": "South Bar",
    "value": "CA/NS/South Bar"
  },
  {
    "label": "South Head",
    "value": "CA/NS/South Head"
  },
  {
    "label": "Southside Boularderie",
    "value": "CA/NS/Southside Boularderie"
  },
  {
    "label": "St Andrews Channel",
    "value": "CA/NS/St Andrews Channel"
  },
  {
    "label": "Sydney",
    "value": "CA/NS/Sydney"
  },
  {
    "label": "Sydney Forks",
    "value": "CA/NS/Sydney Forks"
  },
  {
    "label": "Sydney Mines",
    "value": "CA/NS/Sydney Mines"
  },
  {
    "label": "Sydney River",
    "value": "CA/NS/Sydney River"
  },
  {
    "label": "Tower Road",
    "value": "CA/NS/Tower Road"
  },
  {
    "label": "Upper Grand Mira",
    "value": "CA/NS/Upper Grand Mira"
  },
  {
    "label": "Upper Leitches Creek",
    "value": "CA/NS/Upper Leitches Creek"
  },
  {
    "label": "Upper North Sydney",
    "value": "CA/NS/Upper North Sydney"
  },
  {
    "label": "Victoria Mines",
    "value": "CA/NS/Victoria Mines"
  },
  {
    "label": "Westmount",
    "value": "CA/NS/Westmount"
  },
  {
    "label": "Barrachois",
    "value": "CA/NS/Barrachois"
  },
  {
    "label": "Bass River",
    "value": "CA/NS/Bass River"
  },
  {
    "label": "Beaver Brook",
    "value": "CA/NS/Beaver Brook"
  },
  {
    "label": "Belmont",
    "value": "CA/NS/Belmont"
  },
  {
    "label": "Bible Hill",
    "value": "CA/NS/Bible Hill"
  },
  {
    "label": "Brookfield",
    "value": "CA/NS/Brookfield"
  },
  {
    "label": "Brookside",
    "value": "CA/NS/Brookside"
  },
  {
    "label": "Camden",
    "value": "CA/NS/Camden"
  },
  {
    "label": "Central North River",
    "value": "CA/NS/Central North River"
  },
  {
    "label": "Central Onslow",
    "value": "CA/NS/Central Onslow"
  },
  {
    "label": "Clifton",
    "value": "CA/NS/Clifton"
  },
  {
    "label": "Crowes Mills",
    "value": "CA/NS/Crowes Mills"
  },
  {
    "label": "Debert",
    "value": "CA/NS/Debert"
  },
  {
    "label": "East Mountain",
    "value": "CA/NS/East Mountain"
  },
  {
    "label": "Economy",
    "value": "CA/NS/Economy"
  },
  {
    "label": "Five Islands",
    "value": "CA/NS/Five Islands"
  },
  {
    "label": "Grand-Barachois",
    "value": "CA/NS/Grand-Barachois"
  },
  {
    "label": "Great Village",
    "value": "CA/NS/Great Village"
  },
  {
    "label": "Green Oaks",
    "value": "CA/NS/Green Oaks"
  },
  {
    "label": "Harmony",
    "value": "CA/NS/Harmony"
  },
  {
    "label": "Kemptown",
    "value": "CA/NS/Kemptown"
  },
  {
    "label": "Londonderry",
    "value": "CA/NS/Londonderry"
  },
  {
    "label": "Lower Five Islands",
    "value": "CA/NS/Lower Five Islands"
  },
  {
    "label": "Lower Onslow",
    "value": "CA/NS/Lower Onslow"
  },
  {
    "label": "Lower Truro",
    "value": "CA/NS/Lower Truro"
  },
  {
    "label": "Main River",
    "value": "CA/NS/Main River"
  },
  {
    "label": "Manganese Mines",
    "value": "CA/NS/Manganese Mines"
  },
  {
    "label": "Mccallum Settlement",
    "value": "CA/NS/Mccallum Settlement"
  },
  {
    "label": "Murray Siding",
    "value": "CA/NS/Murray Siding"
  },
  {
    "label": "North River",
    "value": "CA/NS/North River"
  },
  {
    "label": "Nuttby",
    "value": "CA/NS/Nuttby"
  },
  {
    "label": "Old Barns",
    "value": "CA/NS/Old Barns"
  },
  {
    "label": "Onslow Mountain",
    "value": "CA/NS/Onslow Mountain"
  },
  {
    "label": "Princeport",
    "value": "CA/NS/Princeport"
  },
  {
    "label": "Riversdale",
    "value": "CA/NS/Riversdale"
  },
  {
    "label": "Salmon River",
    "value": "CA/NS/Salmon River"
  },
  {
    "label": "Stewiacke",
    "value": "CA/NS/Stewiacke"
  },
  {
    "label": "Tatamagouche",
    "value": "CA/NS/Tatamagouche"
  },
  {
    "label": "Truro",
    "value": "CA/NS/Truro"
  },
  {
    "label": "Truro Heights",
    "value": "CA/NS/Truro Heights"
  },
  {
    "label": "Upper Brookside",
    "value": "CA/NS/Upper Brookside"
  },
  {
    "label": "Upper North River",
    "value": "CA/NS/Upper North River"
  },
  {
    "label": "Upper Onslow",
    "value": "CA/NS/Upper Onslow"
  },
  {
    "label": "Upper Stewiacke",
    "value": "CA/NS/Upper Stewiacke"
  },
  {
    "label": "Valley",
    "value": "CA/NS/Valley"
  },
  {
    "label": "Advocate Harbour",
    "value": "CA/NS/Advocate Harbour"
  },
  {
    "label": "Amherst",
    "value": "CA/NS/Amherst"
  },
  {
    "label": "Collingwood Corner",
    "value": "CA/NS/Collingwood Corner"
  },
  {
    "label": "Diligent River",
    "value": "CA/NS/Diligent River"
  },
  {
    "label": "Joggins",
    "value": "CA/NS/Joggins"
  },
  {
    "label": "Maccan",
    "value": "CA/NS/Maccan"
  },
  {
    "label": "Malagash",
    "value": "CA/NS/Malagash"
  },
  {
    "label": "Nappan",
    "value": "CA/NS/Nappan"
  },
  {
    "label": "Northport",
    "value": "CA/NS/Northport"
  },
  {
    "label": "Oxford",
    "value": "CA/NS/Oxford"
  },
  {
    "label": "Oxford Junction",
    "value": "CA/NS/Oxford Junction"
  },
  {
    "label": "Parrsboro",
    "value": "CA/NS/Parrsboro"
  },
  {
    "label": "Port Greville",
    "value": "CA/NS/Port Greville"
  },
  {
    "label": "Port Howe",
    "value": "CA/NS/Port Howe"
  },
  {
    "label": "Pugwash",
    "value": "CA/NS/Pugwash"
  },
  {
    "label": "Pugwash Junction",
    "value": "CA/NS/Pugwash Junction"
  },
  {
    "label": "River Hebert",
    "value": "CA/NS/River Hebert"
  },
  {
    "label": "River Hebert East",
    "value": "CA/NS/River Hebert East"
  },
  {
    "label": "River Philip",
    "value": "CA/NS/River Philip"
  },
  {
    "label": "Southampton",
    "value": "CA/NS/Southampton"
  },
  {
    "label": "Springhill",
    "value": "CA/NS/Springhill"
  },
  {
    "label": "Wallace",
    "value": "CA/NS/Wallace"
  },
  {
    "label": "Wentworth",
    "value": "CA/NS/Wentworth"
  },
  {
    "label": "Westchester Station",
    "value": "CA/NS/Westchester Station"
  },
  {
    "label": "Barton",
    "value": "CA/NS/Barton"
  },
  {
    "label": "Bear River",
    "value": "CA/NS/Bear River"
  },
  {
    "label": "Belliveau Cove",
    "value": "CA/NS/Belliveau Cove"
  },
  {
    "label": "Church Point",
    "value": "CA/NS/Church Point"
  },
  {
    "label": "Digby",
    "value": "CA/NS/Digby"
  },
  {
    "label": "Freeport",
    "value": "CA/NS/Freeport"
  },
  {
    "label": "Little Brook",
    "value": "CA/NS/Little Brook"
  },
  {
    "label": "Little River",
    "value": "CA/NS/Little River"
  },
  {
    "label": "Mavillette",
    "value": "CA/NS/Mavillette"
  },
  {
    "label": "Meteghan",
    "value": "CA/NS/Meteghan"
  },
  {
    "label": "Meteghan Centre",
    "value": "CA/NS/Meteghan Centre"
  },
  {
    "label": "Meteghan River",
    "value": "CA/NS/Meteghan River"
  },
  {
    "label": "Plympton",
    "value": "CA/NS/Plympton"
  },
  {
    "label": "Sandy Cove",
    "value": "CA/NS/Sandy Cove"
  },
  {
    "label": "Saulnierville",
    "value": "CA/NS/Saulnierville"
  },
  {
    "label": "Smiths Cove",
    "value": "CA/NS/Smiths Cove"
  },
  {
    "label": "Tiverton",
    "value": "CA/NS/Tiverton"
  },
  {
    "label": "Westport",
    "value": "CA/NS/Westport"
  },
  {
    "label": "Weymouth",
    "value": "CA/NS/Weymouth"
  },
  {
    "label": "Aspen",
    "value": "CA/NS/Aspen"
  },
  {
    "label": "Bickerton West",
    "value": "CA/NS/Bickerton West"
  },
  {
    "label": "Boylston",
    "value": "CA/NS/Boylston"
  },
  {
    "label": "Canso",
    "value": "CA/NS/Canso"
  },
  {
    "label": "Cross Roads Country Harbour",
    "value": "CA/NS/Cross Roads Country Harbour"
  },
  {
    "label": "Ecum Secum",
    "value": "CA/NS/Ecum Secum"
  },
  {
    "label": "Fishermans Harbour",
    "value": "CA/NS/Fishermans Harbour"
  },
  {
    "label": "Goldboro",
    "value": "CA/NS/Goldboro"
  },
  {
    "label": "Guysborough",
    "value": "CA/NS/Guysborough"
  },
  {
    "label": "Isaacs Harbour",
    "value": "CA/NS/Isaacs Harbour"
  },
  {
    "label": "Larrys River",
    "value": "CA/NS/Larrys River"
  },
  {
    "label": "Liscomb",
    "value": "CA/NS/Liscomb"
  },
  {
    "label": "Little Dover",
    "value": "CA/NS/Little Dover"
  },
  {
    "label": "Marie Joseph",
    "value": "CA/NS/Marie Joseph"
  },
  {
    "label": "Moser River",
    "value": "CA/NS/Moser River"
  },
  {
    "label": "Mulgrave",
    "value": "CA/NS/Mulgrave"
  },
  {
    "label": "Sherbrooke",
    "value": "CA/NS/Sherbrooke"
  },
  {
    "label": "Bayside",
    "value": "CA/NS/Bayside"
  },
  {
    "label": "Bear Cove",
    "value": "CA/NS/Bear Cove"
  },
  {
    "label": "Beaver Bank",
    "value": "CA/NS/Beaver Bank"
  },
  {
    "label": "Bedford",
    "value": "CA/NS/Bedford"
  },
  {
    "label": "Beechville",
    "value": "CA/NS/Beechville"
  },
  {
    "label": "Big Lake",
    "value": "CA/NS/Big Lake"
  },
  {
    "label": "Black Point",
    "value": "CA/NS/Black Point"
  },
  {
    "label": "Blind Bay",
    "value": "CA/NS/Blind Bay"
  },
  {
    "label": "Boutiliers Point",
    "value": "CA/NS/Boutiliers Point"
  },
  {
    "label": "Cherry Brook",
    "value": "CA/NS/Cherry Brook"
  },
  {
    "label": "Cole Harbour",
    "value": "CA/NS/Cole Harbour"
  },
  {
    "label": "Cow Bay",
    "value": "CA/NS/Cow Bay"
  },
  {
    "label": "Dartmouth",
    "value": "CA/NS/Dartmouth"
  },
  {
    "label": "Duncans Cove",
    "value": "CA/NS/Duncans Cove"
  },
  {
    "label": "Dutch Settlement",
    "value": "CA/NS/Dutch Settlement"
  },
  {
    "label": "East Dover",
    "value": "CA/NS/East Dover"
  },
  {
    "label": "East Lawrencetown",
    "value": "CA/NS/East Lawrencetown"
  },
  {
    "label": "East Pennant",
    "value": "CA/NS/East Pennant"
  },
  {
    "label": "East Preston",
    "value": "CA/NS/East Preston"
  },
  {
    "label": "Eastern Passage",
    "value": "CA/NS/Eastern Passage"
  },
  {
    "label": "Elderbank",
    "value": "CA/NS/Elderbank"
  },
  {
    "label": "Enfield",
    "value": "CA/NS/Enfield"
  },
  {
    "label": "Fall River",
    "value": "CA/NS/Fall River"
  },
  {
    "label": "Fergusons Cove",
    "value": "CA/NS/Fergusons Cove"
  },
  {
    "label": "Fletchers Lake",
    "value": "CA/NS/Fletchers Lake"
  },
  {
    "label": "French Village",
    "value": "CA/NS/French Village"
  },
  {
    "label": "Glen Haven",
    "value": "CA/NS/Glen Haven"
  },
  {
    "label": "Glen Margaret",
    "value": "CA/NS/Glen Margaret"
  },
  {
    "label": "Goffs",
    "value": "CA/NS/Goffs"
  },
  {
    "label": "Goodwood",
    "value": "CA/NS/Goodwood"
  },
  {
    "label": "Grand Lake",
    "value": "CA/NS/Grand Lake"
  },
  {
    "label": "Hacketts Cove",
    "value": "CA/NS/Hacketts Cove"
  },
  {
    "label": "Halibut Bay",
    "value": "CA/NS/Halibut Bay"
  },
  {
    "label": "Halifax",
    "value": "CA/NS/Halifax"
  },
  {
    "label": "Hammonds Plains",
    "value": "CA/NS/Hammonds Plains"
  },
  {
    "label": "Harrietsfield",
    "value": "CA/NS/Harrietsfield"
  },
  {
    "label": "Hatchet Lake",
    "value": "CA/NS/Hatchet Lake"
  },
  {
    "label": "Head Of Jeddore",
    "value": "CA/NS/Head Of Jeddore"
  },
  {
    "label": "Head Of St Margarets Bay",
    "value": "CA/NS/Head Of St Margarets Bay"
  },
  {
    "label": "Herring Cove",
    "value": "CA/NS/Herring Cove"
  },
  {
    "label": "Hubbards",
    "value": "CA/NS/Hubbards"
  },
  {
    "label": "Hubley",
    "value": "CA/NS/Hubley"
  },
  {
    "label": "Indian Harbour",
    "value": "CA/NS/Indian Harbour"
  },
  {
    "label": "Ingramport",
    "value": "CA/NS/Ingramport"
  },
  {
    "label": "Jeddore Oyster Ponds",
    "value": "CA/NS/Jeddore Oyster Ponds"
  },
  {
    "label": "Ketch Harbour",
    "value": "CA/NS/Ketch Harbour"
  },
  {
    "label": "Kinsac",
    "value": "CA/NS/Kinsac"
  },
  {
    "label": "Lake Charlotte",
    "value": "CA/NS/Lake Charlotte"
  },
  {
    "label": "Lake Echo",
    "value": "CA/NS/Lake Echo"
  },
  {
    "label": "Lakeside",
    "value": "CA/NS/Lakeside"
  },
  {
    "label": "Lewis Lake",
    "value": "CA/NS/Lewis Lake"
  },
  {
    "label": "Lower Prospect",
    "value": "CA/NS/Lower Prospect"
  },
  {
    "label": "Lower Sackville",
    "value": "CA/NS/Lower Sackville"
  },
  {
    "label": "Lucasville",
    "value": "CA/NS/Lucasville"
  },
  {
    "label": "Mcgraths Cove",
    "value": "CA/NS/Mcgraths Cove"
  },
  {
    "label": "Meaghers Grant",
    "value": "CA/NS/Meaghers Grant"
  },
  {
    "label": "Middle Musquodoboit",
    "value": "CA/NS/Middle Musquodoboit"
  },
  {
    "label": "Middle Porters Lake",
    "value": "CA/NS/Middle Porters Lake"
  },
  {
    "label": "Middle Sackville",
    "value": "CA/NS/Middle Sackville"
  },
  {
    "label": "Mineville",
    "value": "CA/NS/Mineville"
  },
  {
    "label": "Montague Gold Mines",
    "value": "CA/NS/Montague Gold Mines"
  },
  {
    "label": "Mooseland",
    "value": "CA/NS/Mooseland"
  },
  {
    "label": "Musquodoboit Harbour",
    "value": "CA/NS/Musquodoboit Harbour"
  },
  {
    "label": "North Preston",
    "value": "CA/NS/North Preston"
  },
  {
    "label": "Oldham",
    "value": "CA/NS/Oldham"
  },
  {
    "label": "Peggys Cove",
    "value": "CA/NS/Peggys Cove"
  },
  {
    "label": "Port Dufferin",
    "value": "CA/NS/Port Dufferin"
  },
  {
    "label": "Porters Lake",
    "value": "CA/NS/Porters Lake"
  },
  {
    "label": "Portuguese Cove",
    "value": "CA/NS/Portuguese Cove"
  },
  {
    "label": "Prospect",
    "value": "CA/NS/Prospect"
  },
  {
    "label": "Prospect Bay",
    "value": "CA/NS/Prospect Bay"
  },
  {
    "label": "Prospect Village",
    "value": "CA/NS/Prospect Village"
  },
  {
    "label": "Sambro",
    "value": "CA/NS/Sambro"
  },
  {
    "label": "Sambro Creek",
    "value": "CA/NS/Sambro Creek"
  },
  {
    "label": "Sambro Head",
    "value": "CA/NS/Sambro Head"
  },
  {
    "label": "Seabright",
    "value": "CA/NS/Seabright"
  },
  {
    "label": "Shad Bay",
    "value": "CA/NS/Shad Bay"
  },
  {
    "label": "Shearwater",
    "value": "CA/NS/Shearwater"
  },
  {
    "label": "Sheet Harbour",
    "value": "CA/NS/Sheet Harbour"
  },
  {
    "label": "Stillwater Lake",
    "value": "CA/NS/Stillwater Lake"
  },
  {
    "label": "Tangier",
    "value": "CA/NS/Tangier"
  },
  {
    "label": "Tantallon",
    "value": "CA/NS/Tantallon"
  },
  {
    "label": "Terence Bay",
    "value": "CA/NS/Terence Bay"
  },
  {
    "label": "Timberlea",
    "value": "CA/NS/Timberlea"
  },
  {
    "label": "Upper Hammonds Plains",
    "value": "CA/NS/Upper Hammonds Plains"
  },
  {
    "label": "Upper Musquodoboit",
    "value": "CA/NS/Upper Musquodoboit"
  },
  {
    "label": "Upper Sackville",
    "value": "CA/NS/Upper Sackville"
  },
  {
    "label": "Upper Tantallon",
    "value": "CA/NS/Upper Tantallon"
  },
  {
    "label": "Waverley",
    "value": "CA/NS/Waverley"
  },
  {
    "label": "Wellington",
    "value": "CA/NS/Wellington"
  },
  {
    "label": "West Chezzetcook",
    "value": "CA/NS/West Chezzetcook"
  },
  {
    "label": "West Dover",
    "value": "CA/NS/West Dover"
  },
  {
    "label": "West Pennant",
    "value": "CA/NS/West Pennant"
  },
  {
    "label": "West Porters Lake",
    "value": "CA/NS/West Porters Lake"
  },
  {
    "label": "Westphal",
    "value": "CA/NS/Westphal"
  },
  {
    "label": "Whites Lake",
    "value": "CA/NS/Whites Lake"
  },
  {
    "label": "Williamswood",
    "value": "CA/NS/Williamswood"
  },
  {
    "label": "Windsor Junction",
    "value": "CA/NS/Windsor Junction"
  },
  {
    "label": "Barr Settlement",
    "value": "CA/NS/Barr Settlement"
  },
  {
    "label": "Belnan",
    "value": "CA/NS/Belnan"
  },
  {
    "label": "Centre Burlington",
    "value": "CA/NS/Centre Burlington"
  },
  {
    "label": "Cheverie",
    "value": "CA/NS/Cheverie"
  },
  {
    "label": "Currys Corner",
    "value": "CA/NS/Currys Corner"
  },
  {
    "label": "Densmores Mills",
    "value": "CA/NS/Densmores Mills"
  },
  {
    "label": "East Gore",
    "value": "CA/NS/East Gore"
  },
  {
    "label": "Ellershouse",
    "value": "CA/NS/Ellershouse"
  },
  {
    "label": "Elmsdale",
    "value": "CA/NS/Elmsdale"
  },
  {
    "label": "Falmouth",
    "value": "CA/NS/Falmouth"
  },
  {
    "label": "Goshen",
    "value": "CA/NS/Goshen"
  },
  {
    "label": "Greenfield",
    "value": "CA/NS/Greenfield"
  },
  {
    "label": "Hantsport",
    "value": "CA/NS/Hantsport"
  },
  {
    "label": "Kennetcook",
    "value": "CA/NS/Kennetcook"
  },
  {
    "label": "Lantz",
    "value": "CA/NS/Lantz"
  },
  {
    "label": "Maitland",
    "value": "CA/NS/Maitland"
  },
  {
    "label": "Milford Station",
    "value": "CA/NS/Milford Station"
  },
  {
    "label": "Mill Village",
    "value": "CA/NS/Mill Village"
  },
  {
    "label": "Mount Uniacke",
    "value": "CA/NS/Mount Uniacke"
  },
  {
    "label": "Newport",
    "value": "CA/NS/Newport"
  },
  {
    "label": "Newport Station",
    "value": "CA/NS/Newport Station"
  },
  {
    "label": "Nine Mile River",
    "value": "CA/NS/Nine Mile River"
  },
  {
    "label": "Noel",
    "value": "CA/NS/Noel"
  },
  {
    "label": "Scotch Village",
    "value": "CA/NS/Scotch Village"
  },
  {
    "label": "Shubenacadie",
    "value": "CA/NS/Shubenacadie"
  },
  {
    "label": "Ste Croix",
    "value": "CA/NS/Ste Croix"
  },
  {
    "label": "Summerville",
    "value": "CA/NS/Summerville"
  },
  {
    "label": "Upper Kennetcook",
    "value": "CA/NS/Upper Kennetcook"
  },
  {
    "label": "Upper Nine Mile River",
    "value": "CA/NS/Upper Nine Mile River"
  },
  {
    "label": "Upper Rawdon",
    "value": "CA/NS/Upper Rawdon"
  },
  {
    "label": "Walton",
    "value": "CA/NS/Walton"
  },
  {
    "label": "Windsor",
    "value": "CA/NS/Windsor"
  },
  {
    "label": "Askilton",
    "value": "CA/NS/Askilton"
  },
  {
    "label": "Belle Cote",
    "value": "CA/NS/Belle Cote"
  },
  {
    "label": "Cheticamp",
    "value": "CA/NS/Cheticamp"
  },
  {
    "label": "Craigmore",
    "value": "CA/NS/Craigmore"
  },
  {
    "label": "Crandall Road",
    "value": "CA/NS/Crandall Road"
  },
  {
    "label": "Creignish",
    "value": "CA/NS/Creignish"
  },
  {
    "label": "Glendale",
    "value": "CA/NS/Glendale"
  },
  {
    "label": "Grand Etang",
    "value": "CA/NS/Grand Etang"
  },
  {
    "label": "Inverness",
    "value": "CA/NS/Inverness"
  },
  {
    "label": "Judique",
    "value": "CA/NS/Judique"
  },
  {
    "label": "Lexington",
    "value": "CA/NS/Lexington"
  },
  {
    "label": "Long Point",
    "value": "CA/NS/Long Point"
  },
  {
    "label": "Mabou",
    "value": "CA/NS/Mabou"
  },
  {
    "label": "Mackdale",
    "value": "CA/NS/Mackdale"
  },
  {
    "label": "Margaree",
    "value": "CA/NS/Margaree"
  },
  {
    "label": "Margaree Centre",
    "value": "CA/NS/Margaree Centre"
  },
  {
    "label": "Margaree Forks",
    "value": "CA/NS/Margaree Forks"
  },
  {
    "label": "Margaree Harbour",
    "value": "CA/NS/Margaree Harbour"
  },
  {
    "label": "Margaree Valley",
    "value": "CA/NS/Margaree Valley"
  },
  {
    "label": "Newtown",
    "value": "CA/NS/Newtown"
  },
  {
    "label": "North East Margaree",
    "value": "CA/NS/North East Margaree"
  },
  {
    "label": "Orangedale",
    "value": "CA/NS/Orangedale"
  },
  {
    "label": "Petit Etang",
    "value": "CA/NS/Petit Etang"
  },
  {
    "label": "Pleasant Bay",
    "value": "CA/NS/Pleasant Bay"
  },
  {
    "label": "Pleasant Hill",
    "value": "CA/NS/Pleasant Hill"
  },
  {
    "label": "Port Hastings",
    "value": "CA/NS/Port Hastings"
  },
  {
    "label": "Port Hawkesbury",
    "value": "CA/NS/Port Hawkesbury"
  },
  {
    "label": "Port Hood",
    "value": "CA/NS/Port Hood"
  },
  {
    "label": "Queensville",
    "value": "CA/NS/Queensville"
  },
  {
    "label": "River Denys",
    "value": "CA/NS/River Denys"
  },
  {
    "label": "Scotsville",
    "value": "CA/NS/Scotsville"
  },
  {
    "label": "South West Margaree",
    "value": "CA/NS/South West Margaree"
  },
  {
    "label": "St-Joseph-Du-Moine",
    "value": "CA/NS/St-Joseph-Du-Moine"
  },
  {
    "label": "Sugar Camp",
    "value": "CA/NS/Sugar Camp"
  },
  {
    "label": "Troy",
    "value": "CA/NS/Troy"
  },
  {
    "label": "West Bay",
    "value": "CA/NS/West Bay"
  },
  {
    "label": "West Bay Road",
    "value": "CA/NS/West Bay Road"
  },
  {
    "label": "Whycocomagh",
    "value": "CA/NS/Whycocomagh"
  },
  {
    "label": "Auburn",
    "value": "CA/NS/Auburn"
  },
  {
    "label": "Avonport",
    "value": "CA/NS/Avonport"
  },
  {
    "label": "Aylesford",
    "value": "CA/NS/Aylesford"
  },
  {
    "label": "Berwick",
    "value": "CA/NS/Berwick"
  },
  {
    "label": "Cambridge Station",
    "value": "CA/NS/Cambridge Station"
  },
  {
    "label": "Canning",
    "value": "CA/NS/Canning"
  },
  {
    "label": "Centreville",
    "value": "CA/NS/Centreville"
  },
  {
    "label": "Coldbrook",
    "value": "CA/NS/Coldbrook"
  },
  {
    "label": "Grand Pre",
    "value": "CA/NS/Grand Pre"
  },
  {
    "label": "Greenwood",
    "value": "CA/NS/Greenwood"
  },
  {
    "label": "Kentville",
    "value": "CA/NS/Kentville"
  },
  {
    "label": "Kingston",
    "value": "CA/NS/Kingston"
  },
  {
    "label": "New Minas",
    "value": "CA/NS/New Minas"
  },
  {
    "label": "Port Williams",
    "value": "CA/NS/Port Williams"
  },
  {
    "label": "Waterville",
    "value": "CA/NS/Waterville"
  },
  {
    "label": "Wolfville",
    "value": "CA/NS/Wolfville"
  },
  {
    "label": "Auburndale",
    "value": "CA/NS/Auburndale"
  },
  {
    "label": "Baker Settlement",
    "value": "CA/NS/Baker Settlement"
  },
  {
    "label": "Barss Corner",
    "value": "CA/NS/Barss Corner"
  },
  {
    "label": "Blandford",
    "value": "CA/NS/Blandford"
  },
  {
    "label": "Blockhouse",
    "value": "CA/NS/Blockhouse"
  },
  {
    "label": "Branch Lahave",
    "value": "CA/NS/Branch Lahave"
  },
  {
    "label": "Bridgewater",
    "value": "CA/NS/Bridgewater"
  },
  {
    "label": "Camperdown",
    "value": "CA/NS/Camperdown"
  },
  {
    "label": "Chelsea",
    "value": "CA/NS/Chelsea"
  },
  {
    "label": "Chester",
    "value": "CA/NS/Chester"
  },
  {
    "label": "Chester Basin",
    "value": "CA/NS/Chester Basin"
  },
  {
    "label": "Conquerall Bank",
    "value": "CA/NS/Conquerall Bank"
  },
  {
    "label": "Conquerall Mills",
    "value": "CA/NS/Conquerall Mills"
  },
  {
    "label": "Cookville",
    "value": "CA/NS/Cookville"
  },
  {
    "label": "Crouses Settlement",
    "value": "CA/NS/Crouses Settlement"
  },
  {
    "label": "Crousetown",
    "value": "CA/NS/Crousetown"
  },
  {
    "label": "Danesville",
    "value": "CA/NS/Danesville"
  },
  {
    "label": "Dayspring",
    "value": "CA/NS/Dayspring"
  },
  {
    "label": "East Clifford",
    "value": "CA/NS/East Clifford"
  },
  {
    "label": "East Lahave",
    "value": "CA/NS/East Lahave"
  },
  {
    "label": "Green Bay",
    "value": "CA/NS/Green Bay"
  },
  {
    "label": "Grimms Settlement",
    "value": "CA/NS/Grimms Settlement"
  },
  {
    "label": "Hebbs Cross",
    "value": "CA/NS/Hebbs Cross"
  },
  {
    "label": "Hebbville",
    "value": "CA/NS/Hebbville"
  },
  {
    "label": "Indian Path",
    "value": "CA/NS/Indian Path"
  },
  {
    "label": "Italy Cross",
    "value": "CA/NS/Italy Cross"
  },
  {
    "label": "La Have",
    "value": "CA/NS/La Have"
  },
  {
    "label": "Laconia",
    "value": "CA/NS/Laconia"
  },
  {
    "label": "Lahave",
    "value": "CA/NS/Lahave"
  },
  {
    "label": "Lapland",
    "value": "CA/NS/Lapland"
  },
  {
    "label": "Little Tancook",
    "value": "CA/NS/Little Tancook"
  },
  {
    "label": "Lower Branch",
    "value": "CA/NS/Lower Branch"
  },
  {
    "label": "Lower Northfield",
    "value": "CA/NS/Lower Northfield"
  },
  {
    "label": "Lunenburg",
    "value": "CA/NS/Lunenburg"
  },
  {
    "label": "Mahone Bay",
    "value": "CA/NS/Mahone Bay"
  },
  {
    "label": "Middle Lahave",
    "value": "CA/NS/Middle Lahave"
  },
  {
    "label": "Middlewood",
    "value": "CA/NS/Middlewood"
  },
  {
    "label": "Midville Branch",
    "value": "CA/NS/Midville Branch"
  },
  {
    "label": "Molega Lake",
    "value": "CA/NS/Molega Lake"
  },
  {
    "label": "New Canada",
    "value": "CA/NS/New Canada"
  },
  {
    "label": "New Germany",
    "value": "CA/NS/New Germany"
  },
  {
    "label": "New Ross",
    "value": "CA/NS/New Ross"
  },
  {
    "label": "Newcombville",
    "value": "CA/NS/Newcombville"
  },
  {
    "label": "Oakhill",
    "value": "CA/NS/Oakhill"
  },
  {
    "label": "Petite Riviere",
    "value": "CA/NS/Petite Riviere"
  },
  {
    "label": "Petite-Riviere-Bridge",
    "value": "CA/NS/Petite-Riviere-Bridge"
  },
  {
    "label": "Pine Grove",
    "value": "CA/NS/Pine Grove"
  },
  {
    "label": "Pinehurst",
    "value": "CA/NS/Pinehurst"
  },
  {
    "label": "Pleasantville",
    "value": "CA/NS/Pleasantville"
  },
  {
    "label": "Rhodes Corner",
    "value": "CA/NS/Rhodes Corner"
  },
  {
    "label": "Riverport",
    "value": "CA/NS/Riverport"
  },
  {
    "label": "Rose Bay",
    "value": "CA/NS/Rose Bay"
  },
  {
    "label": "Spectacle Lakes",
    "value": "CA/NS/Spectacle Lakes"
  },
  {
    "label": "Tancook Island",
    "value": "CA/NS/Tancook Island"
  },
  {
    "label": "Upper Branch",
    "value": "CA/NS/Upper Branch"
  },
  {
    "label": "Upper Chelsea",
    "value": "CA/NS/Upper Chelsea"
  },
  {
    "label": "Upper Lahave",
    "value": "CA/NS/Upper Lahave"
  },
  {
    "label": "Upper Northfield",
    "value": "CA/NS/Upper Northfield"
  },
  {
    "label": "Waterloo",
    "value": "CA/NS/Waterloo"
  },
  {
    "label": "Wentzells Lake",
    "value": "CA/NS/Wentzells Lake"
  },
  {
    "label": "West Clifford",
    "value": "CA/NS/West Clifford"
  },
  {
    "label": "West Northfield",
    "value": "CA/NS/West Northfield"
  },
  {
    "label": "Western Shore",
    "value": "CA/NS/Western Shore"
  },
  {
    "label": "Whynotts Settlement",
    "value": "CA/NS/Whynotts Settlement"
  },
  {
    "label": "Wileville",
    "value": "CA/NS/Wileville"
  },
  {
    "label": "Barneys River Station",
    "value": "CA/NS/Barneys River Station"
  },
  {
    "label": "Black Brook",
    "value": "CA/NS/Black Brook"
  },
  {
    "label": "Eureka",
    "value": "CA/NS/Eureka"
  },
  {
    "label": "Hopewell",
    "value": "CA/NS/Hopewell"
  },
  {
    "label": "Melville",
    "value": "CA/NS/Melville"
  },
  {
    "label": "Merigomish",
    "value": "CA/NS/Merigomish"
  },
  {
    "label": "Micmac",
    "value": "CA/NS/Micmac"
  },
  {
    "label": "Millbrook",
    "value": "CA/NS/Millbrook"
  },
  {
    "label": "New Glasgow",
    "value": "CA/NS/New Glasgow"
  },
  {
    "label": "Pictou",
    "value": "CA/NS/Pictou"
  },
  {
    "label": "Pictou Island",
    "value": "CA/NS/Pictou Island"
  },
  {
    "label": "River John",
    "value": "CA/NS/River John"
  },
  {
    "label": "Salt Springs",
    "value": "CA/NS/Salt Springs"
  },
  {
    "label": "Scotsburn",
    "value": "CA/NS/Scotsburn"
  },
  {
    "label": "Stellarton",
    "value": "CA/NS/Stellarton"
  },
  {
    "label": "Sunnybrae",
    "value": "CA/NS/Sunnybrae"
  },
  {
    "label": "Thorburn",
    "value": "CA/NS/Thorburn"
  },
  {
    "label": "Trenton",
    "value": "CA/NS/Trenton"
  },
  {
    "label": "West River Station",
    "value": "CA/NS/West River Station"
  },
  {
    "label": "Westville",
    "value": "CA/NS/Westville"
  },
  {
    "label": "Brooklyn",
    "value": "CA/NS/Brooklyn"
  },
  {
    "label": "Buckfield",
    "value": "CA/NS/Buckfield"
  },
  {
    "label": "Caledonia",
    "value": "CA/NS/Caledonia"
  },
  {
    "label": "Hunts Point",
    "value": "CA/NS/Hunts Point"
  },
  {
    "label": "Labelle",
    "value": "CA/NS/Labelle"
  },
  {
    "label": "Lakeview",
    "value": "CA/NS/Lakeview"
  },
  {
    "label": "Liverpool",
    "value": "CA/NS/Liverpool"
  },
  {
    "label": "Milton",
    "value": "CA/NS/Milton"
  },
  {
    "label": "Port Joli",
    "value": "CA/NS/Port Joli"
  },
  {
    "label": "Port Medway",
    "value": "CA/NS/Port Medway"
  },
  {
    "label": "Port Mouton",
    "value": "CA/NS/Port Mouton"
  },
  {
    "label": "South Brookfield",
    "value": "CA/NS/South Brookfield"
  },
  {
    "label": "Arichat",
    "value": "CA/NS/Arichat"
  },
  {
    "label": "Cleveland",
    "value": "CA/NS/Cleveland"
  },
  {
    "label": "D'escousse",
    "value": "CA/NS/D'escousse"
  },
  {
    "label": "Dundee",
    "value": "CA/NS/Dundee"
  },
  {
    "label": "Fourchu",
    "value": "CA/NS/Fourchu"
  },
  {
    "label": "Framboise",
    "value": "CA/NS/Framboise"
  },
  {
    "label": "Framboise Intervale",
    "value": "CA/NS/Framboise Intervale"
  },
  {
    "label": "Grand River",
    "value": "CA/NS/Grand River"
  },
  {
    "label": "Irish Cove",
    "value": "CA/NS/Irish Cove"
  },
  {
    "label": "Lake Uist",
    "value": "CA/NS/Lake Uist"
  },
  {
    "label": "L'ardoise",
    "value": "CA/NS/L'ardoise"
  },
  {
    "label": "Loch Lomond",
    "value": "CA/NS/Loch Lomond"
  },
  {
    "label": "Louisdale",
    "value": "CA/NS/Louisdale"
  },
  {
    "label": "Lower L'ardoise",
    "value": "CA/NS/Lower L'ardoise"
  },
  {
    "label": "Petit De Grat",
    "value": "CA/NS/Petit De Grat"
  },
  {
    "label": "Point Tupper",
    "value": "CA/NS/Point Tupper"
  },
  {
    "label": "Port Malcolm",
    "value": "CA/NS/Port Malcolm"
  },
  {
    "label": "River Bourgeois",
    "value": "CA/NS/River Bourgeois"
  },
  {
    "label": "Sampson Cove",
    "value": "CA/NS/Sampson Cove"
  },
  {
    "label": "St Peters",
    "value": "CA/NS/St Peters"
  },
  {
    "label": "Stirling",
    "value": "CA/NS/Stirling"
  },
  {
    "label": "West Arichat",
    "value": "CA/NS/West Arichat"
  },
  {
    "label": "Baccaro",
    "value": "CA/NS/Baccaro"
  },
  {
    "label": "Barrington",
    "value": "CA/NS/Barrington"
  },
  {
    "label": "Barrington Passage",
    "value": "CA/NS/Barrington Passage"
  },
  {
    "label": "Clam Point",
    "value": "CA/NS/Clam Point"
  },
  {
    "label": "Clarks Harbour",
    "value": "CA/NS/Clarks Harbour"
  },
  {
    "label": "Clyde River",
    "value": "CA/NS/Clyde River"
  },
  {
    "label": "Crowell",
    "value": "CA/NS/Crowell"
  },
  {
    "label": "East Baccaro",
    "value": "CA/NS/East Baccaro"
  },
  {
    "label": "Eel Bay",
    "value": "CA/NS/Eel Bay"
  },
  {
    "label": "Ingomar",
    "value": "CA/NS/Ingomar"
  },
  {
    "label": "Jordan Falls",
    "value": "CA/NS/Jordan Falls"
  },
  {
    "label": "Lockeport",
    "value": "CA/NS/Lockeport"
  },
  {
    "label": "Lower Woods Harbour",
    "value": "CA/NS/Lower Woods Harbour"
  },
  {
    "label": "Lydgate",
    "value": "CA/NS/Lydgate"
  },
  {
    "label": "Mcgray",
    "value": "CA/NS/Mcgray"
  },
  {
    "label": "North East Point",
    "value": "CA/NS/North East Point"
  },
  {
    "label": "Osborne Harbour",
    "value": "CA/NS/Osborne Harbour"
  },
  {
    "label": "Port Clyde",
    "value": "CA/NS/Port Clyde"
  },
  {
    "label": "Port La Tour",
    "value": "CA/NS/Port La Tour"
  },
  {
    "label": "Sable River",
    "value": "CA/NS/Sable River"
  },
  {
    "label": "Shag Harbour",
    "value": "CA/NS/Shag Harbour"
  },
  {
    "label": "Shelburne",
    "value": "CA/NS/Shelburne"
  },
  {
    "label": "Smithsville",
    "value": "CA/NS/Smithsville"
  },
  {
    "label": "Stoney Island",
    "value": "CA/NS/Stoney Island"
  },
  {
    "label": "Thomasville",
    "value": "CA/NS/Thomasville"
  },
  {
    "label": "Upper Port La Tour",
    "value": "CA/NS/Upper Port La Tour"
  },
  {
    "label": "Baddeck",
    "value": "CA/NS/Baddeck"
  },
  {
    "label": "Barra Glen",
    "value": "CA/NS/Barra Glen"
  },
  {
    "label": "Big Bras D'or",
    "value": "CA/NS/Big Bras D'or"
  },
  {
    "label": "Black Rock",
    "value": "CA/NS/Black Rock"
  },
  {
    "label": "Boularderie Center",
    "value": "CA/NS/Boularderie Center"
  },
  {
    "label": "Boularderie East",
    "value": "CA/NS/Boularderie East"
  },
  {
    "label": "Cape Dauphin",
    "value": "CA/NS/Cape Dauphin"
  },
  {
    "label": "Cape North",
    "value": "CA/NS/Cape North"
  },
  {
    "label": "Capstick",
    "value": "CA/NS/Capstick"
  },
  {
    "label": "Dingwall",
    "value": "CA/NS/Dingwall"
  },
  {
    "label": "Englishtown",
    "value": "CA/NS/Englishtown"
  },
  {
    "label": "Gillis Point",
    "value": "CA/NS/Gillis Point"
  },
  {
    "label": "Grass Cove",
    "value": "CA/NS/Grass Cove"
  },
  {
    "label": "Highland Hill",
    "value": "CA/NS/Highland Hill"
  },
  {
    "label": "Ingonish",
    "value": "CA/NS/Ingonish"
  },
  {
    "label": "Ingonish Beach",
    "value": "CA/NS/Ingonish Beach"
  },
  {
    "label": "Iona",
    "value": "CA/NS/Iona"
  },
  {
    "label": "Jamesville",
    "value": "CA/NS/Jamesville"
  },
  {
    "label": "Kempt Head",
    "value": "CA/NS/Kempt Head"
  },
  {
    "label": "Little Narrows",
    "value": "CA/NS/Little Narrows"
  },
  {
    "label": "Lower Washabuck",
    "value": "CA/NS/Lower Washabuck"
  },
  {
    "label": "Mackinnons Harbour",
    "value": "CA/NS/Mackinnons Harbour"
  },
  {
    "label": "Neils Harbour",
    "value": "CA/NS/Neils Harbour"
  },
  {
    "label": "New Campbellton",
    "value": "CA/NS/New Campbellton"
  },
  {
    "label": "New Harris",
    "value": "CA/NS/New Harris"
  },
  {
    "label": "New Haven",
    "value": "CA/NS/New Haven"
  },
  {
    "label": "Ottawa Brook",
    "value": "CA/NS/Ottawa Brook"
  },
  {
    "label": "Red Point",
    "value": "CA/NS/Red Point"
  },
  {
    "label": "Ross Ferry",
    "value": "CA/NS/Ross Ferry"
  },
  {
    "label": "St Columba",
    "value": "CA/NS/St Columba"
  },
  {
    "label": "St Margaret Village",
    "value": "CA/NS/St Margaret Village"
  },
  {
    "label": "Upper Washabuck",
    "value": "CA/NS/Upper Washabuck"
  },
  {
    "label": "Wagmatcook",
    "value": "CA/NS/Wagmatcook"
  },
  {
    "label": "Washabuck Centre",
    "value": "CA/NS/Washabuck Centre"
  },
  {
    "label": "Alder Plains",
    "value": "CA/NS/Alder Plains"
  },
  {
    "label": "Arcadia",
    "value": "CA/NS/Arcadia"
  },
  {
    "label": "Barrio Lake",
    "value": "CA/NS/Barrio Lake"
  },
  {
    "label": "Beaver River",
    "value": "CA/NS/Beaver River"
  },
  {
    "label": "Brazil Lake",
    "value": "CA/NS/Brazil Lake"
  },
  {
    "label": "Brenton",
    "value": "CA/NS/Brenton"
  },
  {
    "label": "Canaan",
    "value": "CA/NS/Canaan"
  },
  {
    "label": "Cape Forchu",
    "value": "CA/NS/Cape Forchu"
  },
  {
    "label": "Cape St Marys",
    "value": "CA/NS/Cape St Marys"
  },
  {
    "label": "Carleton",
    "value": "CA/NS/Carleton"
  },
  {
    "label": "Cedar Lake",
    "value": "CA/NS/Cedar Lake"
  },
  {
    "label": "Central Chebogue",
    "value": "CA/NS/Central Chebogue"
  },
  {
    "label": "Chebogue Point",
    "value": "CA/NS/Chebogue Point"
  },
  {
    "label": "Darlings Lake",
    "value": "CA/NS/Darlings Lake"
  },
  {
    "label": "Dayton",
    "value": "CA/NS/Dayton"
  },
  {
    "label": "Deerfield",
    "value": "CA/NS/Deerfield"
  },
  {
    "label": "East Kemptville",
    "value": "CA/NS/East Kemptville"
  },
  {
    "label": "Forest Glen",
    "value": "CA/NS/Forest Glen"
  },
  {
    "label": "Gardners Mills",
    "value": "CA/NS/Gardners Mills"
  },
  {
    "label": "Glenwood",
    "value": "CA/NS/Glenwood"
  },
  {
    "label": "Greenville",
    "value": "CA/NS/Greenville"
  },
  {
    "label": "Hebron",
    "value": "CA/NS/Hebron"
  },
  {
    "label": "Hectanooga",
    "value": "CA/NS/Hectanooga"
  },
  {
    "label": "Hillview",
    "value": "CA/NS/Hillview"
  },
  {
    "label": "Ireton",
    "value": "CA/NS/Ireton"
  },
  {
    "label": "Kelleys Cove",
    "value": "CA/NS/Kelleys Cove"
  },
  {
    "label": "Kemptville",
    "value": "CA/NS/Kemptville"
  },
  {
    "label": "Lake Annis",
    "value": "CA/NS/Lake Annis"
  },
  {
    "label": "Lake George",
    "value": "CA/NS/Lake George"
  },
  {
    "label": "Lower East Pubnico",
    "value": "CA/NS/Lower East Pubnico"
  },
  {
    "label": "Lower Wedgeport",
    "value": "CA/NS/Lower Wedgeport"
  },
  {
    "label": "Lower West Pubnico",
    "value": "CA/NS/Lower West Pubnico"
  },
  {
    "label": "Middle West Pubnico",
    "value": "CA/NS/Middle West Pubnico"
  },
  {
    "label": "Milton Highlands",
    "value": "CA/NS/Milton Highlands"
  },
  {
    "label": "North Chegoggin",
    "value": "CA/NS/North Chegoggin"
  },
  {
    "label": "North Kemptville",
    "value": "CA/NS/North Kemptville"
  },
  {
    "label": "Norwood",
    "value": "CA/NS/Norwood"
  },
  {
    "label": "Overton",
    "value": "CA/NS/Overton"
  },
  {
    "label": "Pembroke",
    "value": "CA/NS/Pembroke"
  },
  {
    "label": "Pleasant Lake",
    "value": "CA/NS/Pleasant Lake"
  },
  {
    "label": "Pleasant Valley",
    "value": "CA/NS/Pleasant Valley"
  },
  {
    "label": "Port Maitland",
    "value": "CA/NS/Port Maitland"
  },
  {
    "label": "Pubnico",
    "value": "CA/NS/Pubnico"
  },
  {
    "label": "Richfield",
    "value": "CA/NS/Richfield"
  },
  {
    "label": "Richmond",
    "value": "CA/NS/Richmond"
  },
  {
    "label": "Rockville",
    "value": "CA/NS/Rockville"
  },
  {
    "label": "Sand Beach",
    "value": "CA/NS/Sand Beach"
  },
  {
    "label": "Sandford",
    "value": "CA/NS/Sandford"
  },
  {
    "label": "Short Beach",
    "value": "CA/NS/Short Beach"
  },
  {
    "label": "South Chegoggin",
    "value": "CA/NS/South Chegoggin"
  },
  {
    "label": "South Ohio",
    "value": "CA/NS/South Ohio"
  },
  {
    "label": "Springdale",
    "value": "CA/NS/Springdale"
  },
  {
    "label": "Ste-Anne-Du-Ruisseau",
    "value": "CA/NS/Ste-Anne-Du-Ruisseau"
  },
  {
    "label": "Tusket",
    "value": "CA/NS/Tusket"
  },
  {
    "label": "Wedgeport",
    "value": "CA/NS/Wedgeport"
  },
  {
    "label": "West Pubnico",
    "value": "CA/NS/West Pubnico"
  },
  {
    "label": "Woodstock",
    "value": "CA/NS/Woodstock"
  },
  {
    "label": "Woodvale",
    "value": "CA/NS/Woodvale"
  },
  {
    "label": "Yarmouth",
    "value": "CA/NS/Yarmouth"
  },
  {
    "label": "Cambridge Bay",
    "value": "CA/NU/Cambridge Bay"
  },
  {
    "label": "Gjoa Haven",
    "value": "CA/NU/Gjoa Haven"
  },
  {
    "label": "Kugaaruk",
    "value": "CA/NU/Kugaaruk"
  },
  {
    "label": "Kugluktuk",
    "value": "CA/NU/Kugluktuk"
  },
  {
    "label": "Taloyoak",
    "value": "CA/NU/Taloyoak"
  },
  {
    "label": "Umingmaktok",
    "value": "CA/NU/Umingmaktok"
  },
  {
    "label": "Arviat",
    "value": "CA/NU/Arviat"
  },
  {
    "label": "Baker Lake",
    "value": "CA/NU/Baker Lake"
  },
  {
    "label": "Chesterfield Inlet",
    "value": "CA/NU/Chesterfield Inlet"
  },
  {
    "label": "Coral Harbour",
    "value": "CA/NU/Coral Harbour"
  },
  {
    "label": "Naujaat",
    "value": "CA/NU/Naujaat"
  },
  {
    "label": "Rankin Inlet",
    "value": "CA/NU/Rankin Inlet"
  },
  {
    "label": "Whale Cove",
    "value": "CA/NU/Whale Cove"
  },
  {
    "label": "Arctic Bay",
    "value": "CA/NU/Arctic Bay"
  },
  {
    "label": "Cape Dorset",
    "value": "CA/NU/Cape Dorset"
  },
  {
    "label": "Clyde River",
    "value": "CA/NU/Clyde River"
  },
  {
    "label": "Eureka",
    "value": "CA/NU/Eureka"
  },
  {
    "label": "Grise Fiord",
    "value": "CA/NU/Grise Fiord"
  },
  {
    "label": "Hall Beach",
    "value": "CA/NU/Hall Beach"
  },
  {
    "label": "Igloolik",
    "value": "CA/NU/Igloolik"
  },
  {
    "label": "Iqaluit",
    "value": "CA/NU/Iqaluit"
  },
  {
    "label": "Kimmirut",
    "value": "CA/NU/Kimmirut"
  },
  {
    "label": "Nanisivik",
    "value": "CA/NU/Nanisivik"
  },
  {
    "label": "Pangnirtung",
    "value": "CA/NU/Pangnirtung"
  },
  {
    "label": "Pond Inlet",
    "value": "CA/NU/Pond Inlet"
  },
  {
    "label": "Qikiqtarjuaq",
    "value": "CA/NU/Qikiqtarjuaq"
  },
  {
    "label": "Resolute",
    "value": "CA/NU/Resolute"
  },
  {
    "label": "Sanikiluaq",
    "value": "CA/NU/Sanikiluaq"
  },
  {
    "label": "Algoma Mills",
    "value": "CA/ON/Algoma Mills"
  },
  {
    "label": "Aweres",
    "value": "CA/ON/Aweres"
  },
  {
    "label": "Batchawana Bay",
    "value": "CA/ON/Batchawana Bay"
  },
  {
    "label": "Batchewana First Nation",
    "value": "CA/ON/Batchewana First Nation"
  },
  {
    "label": "Blind River",
    "value": "CA/ON/Blind River"
  },
  {
    "label": "Bruce Mines",
    "value": "CA/ON/Bruce Mines"
  },
  {
    "label": "Cutler",
    "value": "CA/ON/Cutler"
  },
  {
    "label": "Desbarats",
    "value": "CA/ON/Desbarats"
  },
  {
    "label": "Dubreuilville",
    "value": "CA/ON/Dubreuilville"
  },
  {
    "label": "Echo Bay",
    "value": "CA/ON/Echo Bay"
  },
  {
    "label": "Elliot Lake",
    "value": "CA/ON/Elliot Lake"
  },
  {
    "label": "Garden River First Nation",
    "value": "CA/ON/Garden River First Nation"
  },
  {
    "label": "Goulais River",
    "value": "CA/ON/Goulais River"
  },
  {
    "label": "Hawk Junction",
    "value": "CA/ON/Hawk Junction"
  },
  {
    "label": "Hilton",
    "value": "CA/ON/Hilton"
  },
  {
    "label": "Hilton Beach",
    "value": "CA/ON/Hilton Beach"
  },
  {
    "label": "Hornepayne",
    "value": "CA/ON/Hornepayne"
  },
  {
    "label": "Hornpayne First Nation",
    "value": "CA/ON/Hornpayne First Nation"
  },
  {
    "label": "Iron Bridge",
    "value": "CA/ON/Iron Bridge"
  },
  {
    "label": "Jocelyn",
    "value": "CA/ON/Jocelyn"
  },
  {
    "label": "Laird",
    "value": "CA/ON/Laird"
  },
  {
    "label": "Michipicoten First Nation",
    "value": "CA/ON/Michipicoten First Nation"
  },
  {
    "label": "Missanabie",
    "value": "CA/ON/Missanabie"
  },
  {
    "label": "Missanabie Cree First Nation",
    "value": "CA/ON/Missanabie Cree First Nation"
  },
  {
    "label": "Mississauga First Nation",
    "value": "CA/ON/Mississauga First Nation"
  },
  {
    "label": "Montreal River Harbour",
    "value": "CA/ON/Montreal River Harbour"
  },
  {
    "label": "Oba",
    "value": "CA/ON/Oba"
  },
  {
    "label": "Plummer Additional",
    "value": "CA/ON/Plummer Additional"
  },
  {
    "label": "Prince",
    "value": "CA/ON/Prince"
  },
  {
    "label": "Rankin Location 15D First Nation",
    "value": "CA/ON/Rankin Location 15D First Nation"
  },
  {
    "label": "Richards Landing",
    "value": "CA/ON/Richards Landing"
  },
  {
    "label": "Sagamok First Nation",
    "value": "CA/ON/Sagamok First Nation"
  },
  {
    "label": "Sault Ste Marie",
    "value": "CA/ON/Sault Ste Marie"
  },
  {
    "label": "Searchmont",
    "value": "CA/ON/Searchmont"
  },
  {
    "label": "Serpent River",
    "value": "CA/ON/Serpent River"
  },
  {
    "label": "Serpent River First Nation",
    "value": "CA/ON/Serpent River First Nation"
  },
  {
    "label": "Spanish",
    "value": "CA/ON/Spanish"
  },
  {
    "label": "Spragge",
    "value": "CA/ON/Spragge"
  },
  {
    "label": "Tarbutt And Tarbutt Additional",
    "value": "CA/ON/Tarbutt And Tarbutt Additional"
  },
  {
    "label": "Thessalon",
    "value": "CA/ON/Thessalon"
  },
  {
    "label": "Thessalon First Nation",
    "value": "CA/ON/Thessalon First Nation"
  },
  {
    "label": "Wawa",
    "value": "CA/ON/Wawa"
  },
  {
    "label": "White River",
    "value": "CA/ON/White River"
  },
  {
    "label": "Branchton",
    "value": "CA/ON/Branchton"
  },
  {
    "label": "Brantford",
    "value": "CA/ON/Brantford"
  },
  {
    "label": "Burford",
    "value": "CA/ON/Burford"
  },
  {
    "label": "Cathcart",
    "value": "CA/ON/Cathcart"
  },
  {
    "label": "Glen Morris",
    "value": "CA/ON/Glen Morris"
  },
  {
    "label": "Harley",
    "value": "CA/ON/Harley"
  },
  {
    "label": "Mount Pleasant",
    "value": "CA/ON/Mount Pleasant"
  },
  {
    "label": "Ohsweken",
    "value": "CA/ON/Ohsweken"
  },
  {
    "label": "Paris",
    "value": "CA/ON/Paris"
  },
  {
    "label": "Scotland",
    "value": "CA/ON/Scotland"
  },
  {
    "label": "Six Nations/New Credit",
    "value": "CA/ON/Six Nations/New Credit"
  },
  {
    "label": "St George Brant",
    "value": "CA/ON/St George Brant"
  },
  {
    "label": "Allenford",
    "value": "CA/ON/Allenford"
  },
  {
    "label": "Cape Croker",
    "value": "CA/ON/Cape Croker"
  },
  {
    "label": "Cargill",
    "value": "CA/ON/Cargill"
  },
  {
    "label": "Chepstow",
    "value": "CA/ON/Chepstow"
  },
  {
    "label": "Chesley",
    "value": "CA/ON/Chesley"
  },
  {
    "label": "Dobbinton",
    "value": "CA/ON/Dobbinton"
  },
  {
    "label": "Elmwood",
    "value": "CA/ON/Elmwood"
  },
  {
    "label": "Formosa",
    "value": "CA/ON/Formosa"
  },
  {
    "label": "Hepworth",
    "value": "CA/ON/Hepworth"
  },
  {
    "label": "Holyrood",
    "value": "CA/ON/Holyrood"
  },
  {
    "label": "Kincardine",
    "value": "CA/ON/Kincardine"
  },
  {
    "label": "Lions Head",
    "value": "CA/ON/Lions Head"
  },
  {
    "label": "Lucknow",
    "value": "CA/ON/Lucknow"
  },
  {
    "label": "Mar",
    "value": "CA/ON/Mar"
  },
  {
    "label": "Mildmay",
    "value": "CA/ON/Mildmay"
  },
  {
    "label": "Miller Lake",
    "value": "CA/ON/Miller Lake"
  },
  {
    "label": "Neyaashiinigmiing",
    "value": "CA/ON/Neyaashiinigmiing"
  },
  {
    "label": "Paisley",
    "value": "CA/ON/Paisley"
  },
  {
    "label": "Port Elgin",
    "value": "CA/ON/Port Elgin"
  },
  {
    "label": "Ripley",
    "value": "CA/ON/Ripley"
  },
  {
    "label": "Sauble Beach",
    "value": "CA/ON/Sauble Beach"
  },
  {
    "label": "Southampton",
    "value": "CA/ON/Southampton"
  },
  {
    "label": "Stokes Bay",
    "value": "CA/ON/Stokes Bay"
  },
  {
    "label": "Tara",
    "value": "CA/ON/Tara"
  },
  {
    "label": "Teeswater",
    "value": "CA/ON/Teeswater"
  },
  {
    "label": "Tiverton",
    "value": "CA/ON/Tiverton"
  },
  {
    "label": "Tobermory",
    "value": "CA/ON/Tobermory"
  },
  {
    "label": "Walkerton",
    "value": "CA/ON/Walkerton"
  },
  {
    "label": "Wiarton",
    "value": "CA/ON/Wiarton"
  },
  {
    "label": "Blenheim",
    "value": "CA/ON/Blenheim"
  },
  {
    "label": "Bothwell",
    "value": "CA/ON/Bothwell"
  },
  {
    "label": "Cedar Springs",
    "value": "CA/ON/Cedar Springs"
  },
  {
    "label": "Charing Cross",
    "value": "CA/ON/Charing Cross"
  },
  {
    "label": "Chatham",
    "value": "CA/ON/Chatham"
  },
  {
    "label": "Coatsworth Station",
    "value": "CA/ON/Coatsworth Station"
  },
  {
    "label": "Dover Centre",
    "value": "CA/ON/Dover Centre"
  },
  {
    "label": "Dresden",
    "value": "CA/ON/Dresden"
  },
  {
    "label": "Duart",
    "value": "CA/ON/Duart"
  },
  {
    "label": "Erieau",
    "value": "CA/ON/Erieau"
  },
  {
    "label": "Grande Pointe",
    "value": "CA/ON/Grande Pointe"
  },
  {
    "label": "Highgate",
    "value": "CA/ON/Highgate"
  },
  {
    "label": "Kent Bridge",
    "value": "CA/ON/Kent Bridge"
  },
  {
    "label": "Merlin",
    "value": "CA/ON/Merlin"
  },
  {
    "label": "Morpeth",
    "value": "CA/ON/Morpeth"
  },
  {
    "label": "Muirkirk",
    "value": "CA/ON/Muirkirk"
  },
  {
    "label": "North Buxton",
    "value": "CA/ON/North Buxton"
  },
  {
    "label": "Pain Court",
    "value": "CA/ON/Pain Court"
  },
  {
    "label": "Port Alma",
    "value": "CA/ON/Port Alma"
  },
  {
    "label": "Ridgetown",
    "value": "CA/ON/Ridgetown"
  },
  {
    "label": "Thamesville",
    "value": "CA/ON/Thamesville"
  },
  {
    "label": "Tilbury",
    "value": "CA/ON/Tilbury"
  },
  {
    "label": "Tupperville",
    "value": "CA/ON/Tupperville"
  },
  {
    "label": "Wallaceburg",
    "value": "CA/ON/Wallaceburg"
  },
  {
    "label": "Wheatley",
    "value": "CA/ON/Wheatley"
  },
  {
    "label": "Calstock",
    "value": "CA/ON/Calstock"
  },
  {
    "label": "Cochrane",
    "value": "CA/ON/Cochrane"
  },
  {
    "label": "Connaught",
    "value": "CA/ON/Connaught"
  },
  {
    "label": "Constance Lake First Nation",
    "value": "CA/ON/Constance Lake First Nation"
  },
  {
    "label": "Driftwood",
    "value": "CA/ON/Driftwood"
  },
  {
    "label": "Fauquier",
    "value": "CA/ON/Fauquier"
  },
  {
    "label": "Fort Albany First Nation",
    "value": "CA/ON/Fort Albany First Nation"
  },
  {
    "label": "Frederickhouse",
    "value": "CA/ON/Frederickhouse"
  },
  {
    "label": "Hallebourg",
    "value": "CA/ON/Hallebourg"
  },
  {
    "label": "Harty",
    "value": "CA/ON/Harty"
  },
  {
    "label": "Hearst",
    "value": "CA/ON/Hearst"
  },
  {
    "label": "Holtyre",
    "value": "CA/ON/Holtyre"
  },
  {
    "label": "Hunta",
    "value": "CA/ON/Hunta"
  },
  {
    "label": "Iroquois Falls",
    "value": "CA/ON/Iroquois Falls"
  },
  {
    "label": "Iroquois Falls A",
    "value": "CA/ON/Iroquois Falls A"
  },
  {
    "label": "Jogues",
    "value": "CA/ON/Jogues"
  },
  {
    "label": "Kapuskasing",
    "value": "CA/ON/Kapuskasing"
  },
  {
    "label": "Kashechewan First Nation",
    "value": "CA/ON/Kashechewan First Nation"
  },
  {
    "label": "Marten Falls First Nation",
    "value": "CA/ON/Marten Falls First Nation"
  },
  {
    "label": "Matheson",
    "value": "CA/ON/Matheson"
  },
  {
    "label": "Mattice",
    "value": "CA/ON/Mattice"
  },
  {
    "label": "Monteith",
    "value": "CA/ON/Monteith"
  },
  {
    "label": "Moonbeam",
    "value": "CA/ON/Moonbeam"
  },
  {
    "label": "Moose Factory",
    "value": "CA/ON/Moose Factory"
  },
  {
    "label": "Moosonee",
    "value": "CA/ON/Moosonee"
  },
  {
    "label": "Opasatika",
    "value": "CA/ON/Opasatika"
  },
  {
    "label": "Porcupine",
    "value": "CA/ON/Porcupine"
  },
  {
    "label": "Porquis Junction",
    "value": "CA/ON/Porquis Junction"
  },
  {
    "label": "Ramore",
    "value": "CA/ON/Ramore"
  },
  {
    "label": "Schumacher",
    "value": "CA/ON/Schumacher"
  },
  {
    "label": "Smooth Rock Falls",
    "value": "CA/ON/Smooth Rock Falls"
  },
  {
    "label": "South Porcupine",
    "value": "CA/ON/South Porcupine"
  },
  {
    "label": "Strickland",
    "value": "CA/ON/Strickland"
  },
  {
    "label": "Timmins",
    "value": "CA/ON/Timmins"
  },
  {
    "label": "Tunis",
    "value": "CA/ON/Tunis"
  },
  {
    "label": "Val Cote",
    "value": "CA/ON/Val Cote"
  },
  {
    "label": "Val Gagne",
    "value": "CA/ON/Val Gagne"
  },
  {
    "label": "Val Rita",
    "value": "CA/ON/Val Rita"
  },
  {
    "label": "Amaranth",
    "value": "CA/ON/Amaranth"
  },
  {
    "label": "East Garafraxa",
    "value": "CA/ON/East Garafraxa"
  },
  {
    "label": "Grand Valley",
    "value": "CA/ON/Grand Valley"
  },
  {
    "label": "Honeywood",
    "value": "CA/ON/Honeywood"
  },
  {
    "label": "Hornings Mills",
    "value": "CA/ON/Hornings Mills"
  },
  {
    "label": "Laurel",
    "value": "CA/ON/Laurel"
  },
  {
    "label": "Mansfield",
    "value": "CA/ON/Mansfield"
  },
  {
    "label": "Melancthon",
    "value": "CA/ON/Melancthon"
  },
  {
    "label": "Mono",
    "value": "CA/ON/Mono"
  },
  {
    "label": "Mulmur",
    "value": "CA/ON/Mulmur"
  },
  {
    "label": "Orangeville",
    "value": "CA/ON/Orangeville"
  },
  {
    "label": "Orton",
    "value": "CA/ON/Orton"
  },
  {
    "label": "Shelburne",
    "value": "CA/ON/Shelburne"
  },
  {
    "label": "Ajax",
    "value": "CA/ON/Ajax"
  },
  {
    "label": "Ashburn",
    "value": "CA/ON/Ashburn"
  },
  {
    "label": "Beaverton",
    "value": "CA/ON/Beaverton"
  },
  {
    "label": "Blackstock",
    "value": "CA/ON/Blackstock"
  },
  {
    "label": "Bond Head",
    "value": "CA/ON/Bond Head"
  },
  {
    "label": "Bowmanville",
    "value": "CA/ON/Bowmanville"
  },
  {
    "label": "Brougham",
    "value": "CA/ON/Brougham"
  },
  {
    "label": "Caesarea",
    "value": "CA/ON/Caesarea"
  },
  {
    "label": "Cannington",
    "value": "CA/ON/Cannington"
  },
  {
    "label": "Claremont",
    "value": "CA/ON/Claremont"
  },
  {
    "label": "Courtice",
    "value": "CA/ON/Courtice"
  },
  {
    "label": "Goodwood",
    "value": "CA/ON/Goodwood"
  },
  {
    "label": "Greenbank",
    "value": "CA/ON/Greenbank"
  },
  {
    "label": "Greenwood",
    "value": "CA/ON/Greenwood"
  },
  {
    "label": "Hampton",
    "value": "CA/ON/Hampton"
  },
  {
    "label": "Kendal",
    "value": "CA/ON/Kendal"
  },
  {
    "label": "Leaskdale",
    "value": "CA/ON/Leaskdale"
  },
  {
    "label": "Locust Hill",
    "value": "CA/ON/Locust Hill"
  },
  {
    "label": "Nestleton Station",
    "value": "CA/ON/Nestleton Station"
  },
  {
    "label": "Newcastle",
    "value": "CA/ON/Newcastle"
  },
  {
    "label": "Newtonville",
    "value": "CA/ON/Newtonville"
  },
  {
    "label": "Orono",
    "value": "CA/ON/Orono"
  },
  {
    "label": "Oshawa",
    "value": "CA/ON/Oshawa"
  },
  {
    "label": "Pickering",
    "value": "CA/ON/Pickering"
  },
  {
    "label": "Port Perry",
    "value": "CA/ON/Port Perry"
  },
  {
    "label": "Prince Albert",
    "value": "CA/ON/Prince Albert"
  },
  {
    "label": "Sandford",
    "value": "CA/ON/Sandford"
  },
  {
    "label": "Seagrave",
    "value": "CA/ON/Seagrave"
  },
  {
    "label": "Sunderland",
    "value": "CA/ON/Sunderland"
  },
  {
    "label": "Uxbridge",
    "value": "CA/ON/Uxbridge"
  },
  {
    "label": "Whitby",
    "value": "CA/ON/Whitby"
  },
  {
    "label": "Whitevale",
    "value": "CA/ON/Whitevale"
  },
  {
    "label": "Zephyr",
    "value": "CA/ON/Zephyr"
  },
  {
    "label": "Aylmer",
    "value": "CA/ON/Aylmer"
  },
  {
    "label": "Belmont",
    "value": "CA/ON/Belmont"
  },
  {
    "label": "Dutton",
    "value": "CA/ON/Dutton"
  },
  {
    "label": "Eden",
    "value": "CA/ON/Eden"
  },
  {
    "label": "Fingal",
    "value": "CA/ON/Fingal"
  },
  {
    "label": "Iona Station",
    "value": "CA/ON/Iona Station"
  },
  {
    "label": "Port Burwell",
    "value": "CA/ON/Port Burwell"
  },
  {
    "label": "Port Stanley",
    "value": "CA/ON/Port Stanley"
  },
  {
    "label": "Richmond",
    "value": "CA/ON/Richmond"
  },
  {
    "label": "Rodney",
    "value": "CA/ON/Rodney"
  },
  {
    "label": "Shedden",
    "value": "CA/ON/Shedden"
  },
  {
    "label": "Southwold",
    "value": "CA/ON/Southwold"
  },
  {
    "label": "Sparta",
    "value": "CA/ON/Sparta"
  },
  {
    "label": "Springfield",
    "value": "CA/ON/Springfield"
  },
  {
    "label": "St Thomas",
    "value": "CA/ON/St Thomas"
  },
  {
    "label": "St.Thomas",
    "value": "CA/ON/St.Thomas"
  },
  {
    "label": "Straffordville",
    "value": "CA/ON/Straffordville"
  },
  {
    "label": "Talbotville Royal",
    "value": "CA/ON/Talbotville Royal"
  },
  {
    "label": "Union",
    "value": "CA/ON/Union"
  },
  {
    "label": "Vienna",
    "value": "CA/ON/Vienna"
  },
  {
    "label": "Wallacetown",
    "value": "CA/ON/Wallacetown"
  },
  {
    "label": "West Lorne",
    "value": "CA/ON/West Lorne"
  },
  {
    "label": "Amherstburg",
    "value": "CA/ON/Amherstburg"
  },
  {
    "label": "Belle River",
    "value": "CA/ON/Belle River"
  },
  {
    "label": "Blytheswood",
    "value": "CA/ON/Blytheswood"
  },
  {
    "label": "Comber",
    "value": "CA/ON/Comber"
  },
  {
    "label": "Cottam",
    "value": "CA/ON/Cottam"
  },
  {
    "label": "Emeryville",
    "value": "CA/ON/Emeryville"
  },
  {
    "label": "Essex",
    "value": "CA/ON/Essex"
  },
  {
    "label": "Harrow",
    "value": "CA/ON/Harrow"
  },
  {
    "label": "Kingsville",
    "value": "CA/ON/Kingsville"
  },
  {
    "label": "Lasalle",
    "value": "CA/ON/Lasalle"
  },
  {
    "label": "Leamington",
    "value": "CA/ON/Leamington"
  },
  {
    "label": "Maidstone",
    "value": "CA/ON/Maidstone"
  },
  {
    "label": "Mcgregor",
    "value": "CA/ON/Mcgregor"
  },
  {
    "label": "Oldcastle",
    "value": "CA/ON/Oldcastle"
  },
  {
    "label": "Pelee Island",
    "value": "CA/ON/Pelee Island"
  },
  {
    "label": "Pointe Aux Roches",
    "value": "CA/ON/Pointe Aux Roches"
  },
  {
    "label": "Ruscom Station",
    "value": "CA/ON/Ruscom Station"
  },
  {
    "label": "Ruthven",
    "value": "CA/ON/Ruthven"
  },
  {
    "label": "South Woodslee",
    "value": "CA/ON/South Woodslee"
  },
  {
    "label": "St Joachim",
    "value": "CA/ON/St Joachim"
  },
  {
    "label": "Staples",
    "value": "CA/ON/Staples"
  },
  {
    "label": "Tecumseh",
    "value": "CA/ON/Tecumseh"
  },
  {
    "label": "Windsor",
    "value": "CA/ON/Windsor"
  },
  {
    "label": "Arden",
    "value": "CA/ON/Arden"
  },
  {
    "label": "Ardoch",
    "value": "CA/ON/Ardoch"
  },
  {
    "label": "Battersea",
    "value": "CA/ON/Battersea"
  },
  {
    "label": "Bedford",
    "value": "CA/ON/Bedford"
  },
  {
    "label": "Central Frontenac",
    "value": "CA/ON/Central Frontenac"
  },
  {
    "label": "Clarendon",
    "value": "CA/ON/Clarendon"
  },
  {
    "label": "Cloyne",
    "value": "CA/ON/Cloyne"
  },
  {
    "label": "Elginburg",
    "value": "CA/ON/Elginburg"
  },
  {
    "label": "Forest",
    "value": "CA/ON/Forest"
  },
  {
    "label": "Frontenac Islands",
    "value": "CA/ON/Frontenac Islands"
  },
  {
    "label": "Glenburnie",
    "value": "CA/ON/Glenburnie"
  },
  {
    "label": "Godfrey",
    "value": "CA/ON/Godfrey"
  },
  {
    "label": "Harrowsmith",
    "value": "CA/ON/Harrowsmith"
  },
  {
    "label": "Hartington",
    "value": "CA/ON/Hartington"
  },
  {
    "label": "Hinchinbrooke",
    "value": "CA/ON/Hinchinbrooke"
  },
  {
    "label": "Inverary",
    "value": "CA/ON/Inverary"
  },
  {
    "label": "Joyceville",
    "value": "CA/ON/Joyceville"
  },
  {
    "label": "Kennebec",
    "value": "CA/ON/Kennebec"
  },
  {
    "label": "Kingston",
    "value": "CA/ON/Kingston"
  },
  {
    "label": "Loughborough",
    "value": "CA/ON/Loughborough"
  },
  {
    "label": "Miller",
    "value": "CA/ON/Miller"
  },
  {
    "label": "Mountain Grove",
    "value": "CA/ON/Mountain Grove"
  },
  {
    "label": "North Canonto",
    "value": "CA/ON/North Canonto"
  },
  {
    "label": "North Frontenac",
    "value": "CA/ON/North Frontenac"
  },
  {
    "label": "Ompah",
    "value": "CA/ON/Ompah"
  },
  {
    "label": "Parham",
    "value": "CA/ON/Parham"
  },
  {
    "label": "Perth Road",
    "value": "CA/ON/Perth Road"
  },
  {
    "label": "Plevna",
    "value": "CA/ON/Plevna"
  },
  {
    "label": "Seeleys Bay",
    "value": "CA/ON/Seeleys Bay"
  },
  {
    "label": "Sharbot Lake",
    "value": "CA/ON/Sharbot Lake"
  },
  {
    "label": "Snow Road Station",
    "value": "CA/ON/Snow Road Station"
  },
  {
    "label": "Sydenham",
    "value": "CA/ON/Sydenham"
  },
  {
    "label": "Tichborne",
    "value": "CA/ON/Tichborne"
  },
  {
    "label": "Verona",
    "value": "CA/ON/Verona"
  },
  {
    "label": "Westbrook",
    "value": "CA/ON/Westbrook"
  },
  {
    "label": "Wolfe Island",
    "value": "CA/ON/Wolfe Island"
  },
  {
    "label": "Annan",
    "value": "CA/ON/Annan"
  },
  {
    "label": "Ayton",
    "value": "CA/ON/Ayton"
  },
  {
    "label": "Badjeros",
    "value": "CA/ON/Badjeros"
  },
  {
    "label": "Berkeley",
    "value": "CA/ON/Berkeley"
  },
  {
    "label": "Blue Mountains",
    "value": "CA/ON/Blue Mountains"
  },
  {
    "label": "Bognor",
    "value": "CA/ON/Bognor"
  },
  {
    "label": "Chatsworth",
    "value": "CA/ON/Chatsworth"
  },
  {
    "label": "Clarksburg",
    "value": "CA/ON/Clarksburg"
  },
  {
    "label": "Desboro",
    "value": "CA/ON/Desboro"
  },
  {
    "label": "Dornoch",
    "value": "CA/ON/Dornoch"
  },
  {
    "label": "Dundalk",
    "value": "CA/ON/Dundalk"
  },
  {
    "label": "Durham",
    "value": "CA/ON/Durham"
  },
  {
    "label": "Eugenia",
    "value": "CA/ON/Eugenia"
  },
  {
    "label": "Feversham",
    "value": "CA/ON/Feversham"
  },
  {
    "label": "Flesherton",
    "value": "CA/ON/Flesherton"
  },
  {
    "label": "Hanover",
    "value": "CA/ON/Hanover"
  },
  {
    "label": "Heathcote",
    "value": "CA/ON/Heathcote"
  },
  {
    "label": "Holland Centre",
    "value": "CA/ON/Holland Centre"
  },
  {
    "label": "Holstein",
    "value": "CA/ON/Holstein"
  },
  {
    "label": "Keady",
    "value": "CA/ON/Keady"
  },
  {
    "label": "Kemble",
    "value": "CA/ON/Kemble"
  },
  {
    "label": "Kimberley",
    "value": "CA/ON/Kimberley"
  },
  {
    "label": "Leith",
    "value": "CA/ON/Leith"
  },
  {
    "label": "Markdale",
    "value": "CA/ON/Markdale"
  },
  {
    "label": "Maxwell",
    "value": "CA/ON/Maxwell"
  },
  {
    "label": "Meaford",
    "value": "CA/ON/Meaford"
  },
  {
    "label": "Mount Forest",
    "value": "CA/ON/Mount Forest"
  },
  {
    "label": "Neustadt",
    "value": "CA/ON/Neustadt"
  },
  {
    "label": "Owen Sound",
    "value": "CA/ON/Owen Sound"
  },
  {
    "label": "Priceville",
    "value": "CA/ON/Priceville"
  },
  {
    "label": "Proton Station",
    "value": "CA/ON/Proton Station"
  },
  {
    "label": "Ravenna",
    "value": "CA/ON/Ravenna"
  },
  {
    "label": "Shallow Lake",
    "value": "CA/ON/Shallow Lake"
  },
  {
    "label": "Singhampton",
    "value": "CA/ON/Singhampton"
  },
  {
    "label": "Thornbury",
    "value": "CA/ON/Thornbury"
  },
  {
    "label": "Varney",
    "value": "CA/ON/Varney"
  },
  {
    "label": "Walters Falls",
    "value": "CA/ON/Walters Falls"
  },
  {
    "label": "Williamsford",
    "value": "CA/ON/Williamsford"
  },
  {
    "label": "Caledonia",
    "value": "CA/ON/Caledonia"
  },
  {
    "label": "Canfield",
    "value": "CA/ON/Canfield"
  },
  {
    "label": "Cayuga",
    "value": "CA/ON/Cayuga"
  },
  {
    "label": "Clear Creek",
    "value": "CA/ON/Clear Creek"
  },
  {
    "label": "Courtland",
    "value": "CA/ON/Courtland"
  },
  {
    "label": "Delhi",
    "value": "CA/ON/Delhi"
  },
  {
    "label": "Dunnville",
    "value": "CA/ON/Dunnville"
  },
  {
    "label": "Fisherville",
    "value": "CA/ON/Fisherville"
  },
  {
    "label": "Hagersville",
    "value": "CA/ON/Hagersville"
  },
  {
    "label": "Jarvis",
    "value": "CA/ON/Jarvis"
  },
  {
    "label": "La Salette",
    "value": "CA/ON/La Salette"
  },
  {
    "label": "Langton",
    "value": "CA/ON/Langton"
  },
  {
    "label": "Lowbanks",
    "value": "CA/ON/Lowbanks"
  },
  {
    "label": "Nanticoke",
    "value": "CA/ON/Nanticoke"
  },
  {
    "label": "Oakland",
    "value": "CA/ON/Oakland"
  },
  {
    "label": "Port Dover",
    "value": "CA/ON/Port Dover"
  },
  {
    "label": "Port Rowan",
    "value": "CA/ON/Port Rowan"
  },
  {
    "label": "Selkirk",
    "value": "CA/ON/Selkirk"
  },
  {
    "label": "Simcoe",
    "value": "CA/ON/Simcoe"
  },
  {
    "label": "St Williams",
    "value": "CA/ON/St Williams"
  },
  {
    "label": "Teeterville",
    "value": "CA/ON/Teeterville"
  },
  {
    "label": "Townsend",
    "value": "CA/ON/Townsend"
  },
  {
    "label": "Turkey Point",
    "value": "CA/ON/Turkey Point"
  },
  {
    "label": "Vanessa",
    "value": "CA/ON/Vanessa"
  },
  {
    "label": "Vittoria",
    "value": "CA/ON/Vittoria"
  },
  {
    "label": "Walsingham",
    "value": "CA/ON/Walsingham"
  },
  {
    "label": "Waterford",
    "value": "CA/ON/Waterford"
  },
  {
    "label": "Wilsonville",
    "value": "CA/ON/Wilsonville"
  },
  {
    "label": "Windham Centre",
    "value": "CA/ON/Windham Centre"
  },
  {
    "label": "York",
    "value": "CA/ON/York"
  },
  {
    "label": "Algonquin Highlands",
    "value": "CA/ON/Algonquin Highlands"
  },
  {
    "label": "Cardiff",
    "value": "CA/ON/Cardiff"
  },
  {
    "label": "Carnarvon",
    "value": "CA/ON/Carnarvon"
  },
  {
    "label": "Eagle Lake",
    "value": "CA/ON/Eagle Lake"
  },
  {
    "label": "Fort Irwin",
    "value": "CA/ON/Fort Irwin"
  },
  {
    "label": "Gooderham",
    "value": "CA/ON/Gooderham"
  },
  {
    "label": "Haliburton",
    "value": "CA/ON/Haliburton"
  },
  {
    "label": "Harcourt",
    "value": "CA/ON/Harcourt"
  },
  {
    "label": "Highland Grove",
    "value": "CA/ON/Highland Grove"
  },
  {
    "label": "Irondale",
    "value": "CA/ON/Irondale"
  },
  {
    "label": "Lochlin",
    "value": "CA/ON/Lochlin"
  },
  {
    "label": "Minden",
    "value": "CA/ON/Minden"
  },
  {
    "label": "Oxtongue Lake",
    "value": "CA/ON/Oxtongue Lake"
  },
  {
    "label": "Tory Hill",
    "value": "CA/ON/Tory Hill"
  },
  {
    "label": "West Guilford",
    "value": "CA/ON/West Guilford"
  },
  {
    "label": "Wilberforce",
    "value": "CA/ON/Wilberforce"
  },
  {
    "label": "Acton",
    "value": "CA/ON/Acton"
  },
  {
    "label": "Ballinafad",
    "value": "CA/ON/Ballinafad"
  },
  {
    "label": "Burlington",
    "value": "CA/ON/Burlington"
  },
  {
    "label": "Campbellville",
    "value": "CA/ON/Campbellville"
  },
  {
    "label": "Georgetown",
    "value": "CA/ON/Georgetown"
  },
  {
    "label": "Glen Williams",
    "value": "CA/ON/Glen Williams"
  },
  {
    "label": "Halton Hills",
    "value": "CA/ON/Halton Hills"
  },
  {
    "label": "Hornby",
    "value": "CA/ON/Hornby"
  },
  {
    "label": "Kilbride",
    "value": "CA/ON/Kilbride"
  },
  {
    "label": "Limehouse",
    "value": "CA/ON/Limehouse"
  },
  {
    "label": "Milton",
    "value": "CA/ON/Milton"
  },
  {
    "label": "Moffat",
    "value": "CA/ON/Moffat"
  },
  {
    "label": "Norval",
    "value": "CA/ON/Norval"
  },
  {
    "label": "Oakville",
    "value": "CA/ON/Oakville"
  },
  {
    "label": "Alberton",
    "value": "CA/ON/Alberton"
  },
  {
    "label": "Ancaster",
    "value": "CA/ON/Ancaster"
  },
  {
    "label": "Binbrook",
    "value": "CA/ON/Binbrook"
  },
  {
    "label": "Carlisle",
    "value": "CA/ON/Carlisle"
  },
  {
    "label": "Copetown",
    "value": "CA/ON/Copetown"
  },
  {
    "label": "Dundas",
    "value": "CA/ON/Dundas"
  },
  {
    "label": "Flamborough",
    "value": "CA/ON/Flamborough"
  },
  {
    "label": "Freelton",
    "value": "CA/ON/Freelton"
  },
  {
    "label": "Glanbrook",
    "value": "CA/ON/Glanbrook"
  },
  {
    "label": "Hamilton",
    "value": "CA/ON/Hamilton"
  },
  {
    "label": "Hannon",
    "value": "CA/ON/Hannon"
  },
  {
    "label": "Jerseyville",
    "value": "CA/ON/Jerseyville"
  },
  {
    "label": "Lynden",
    "value": "CA/ON/Lynden"
  },
  {
    "label": "Millgrove",
    "value": "CA/ON/Millgrove"
  },
  {
    "label": "Mount Hope",
    "value": "CA/ON/Mount Hope"
  },
  {
    "label": "Rockton",
    "value": "CA/ON/Rockton"
  },
  {
    "label": "Sheffield",
    "value": "CA/ON/Sheffield"
  },
  {
    "label": "Stoney Creek",
    "value": "CA/ON/Stoney Creek"
  },
  {
    "label": "Troy",
    "value": "CA/ON/Troy"
  },
  {
    "label": "Waterdown",
    "value": "CA/ON/Waterdown"
  },
  {
    "label": "West Flamborough",
    "value": "CA/ON/West Flamborough"
  },
  {
    "label": "Astra",
    "value": "CA/ON/Astra"
  },
  {
    "label": "Bancroft",
    "value": "CA/ON/Bancroft"
  },
  {
    "label": "Batawa",
    "value": "CA/ON/Batawa"
  },
  {
    "label": "Belleville",
    "value": "CA/ON/Belleville"
  },
  {
    "label": "Boulter",
    "value": "CA/ON/Boulter"
  },
  {
    "label": "Cannifton",
    "value": "CA/ON/Cannifton"
  },
  {
    "label": "Coe Hill",
    "value": "CA/ON/Coe Hill"
  },
  {
    "label": "Combermere",
    "value": "CA/ON/Combermere"
  },
  {
    "label": "Corbyville",
    "value": "CA/ON/Corbyville"
  },
  {
    "label": "Deseronto",
    "value": "CA/ON/Deseronto"
  },
  {
    "label": "Eldorado",
    "value": "CA/ON/Eldorado"
  },
  {
    "label": "Foxboro",
    "value": "CA/ON/Foxboro"
  },
  {
    "label": "Frankford",
    "value": "CA/ON/Frankford"
  },
  {
    "label": "Gilmour",
    "value": "CA/ON/Gilmour"
  },
  {
    "label": "L'amable",
    "value": "CA/ON/L'amable"
  },
  {
    "label": "Madoc",
    "value": "CA/ON/Madoc"
  },
  {
    "label": "Maple Leaf",
    "value": "CA/ON/Maple Leaf"
  },
  {
    "label": "Marlbank",
    "value": "CA/ON/Marlbank"
  },
  {
    "label": "Marmora",
    "value": "CA/ON/Marmora"
  },
  {
    "label": "Marysville",
    "value": "CA/ON/Marysville"
  },
  {
    "label": "Maynooth",
    "value": "CA/ON/Maynooth"
  },
  {
    "label": "Plainfield",
    "value": "CA/ON/Plainfield"
  },
  {
    "label": "Roslin",
    "value": "CA/ON/Roslin"
  },
  {
    "label": "Shannonville",
    "value": "CA/ON/Shannonville"
  },
  {
    "label": "Springbrook",
    "value": "CA/ON/Springbrook"
  },
  {
    "label": "Stirling",
    "value": "CA/ON/Stirling"
  },
  {
    "label": "Thomasburg",
    "value": "CA/ON/Thomasburg"
  },
  {
    "label": "Trenton",
    "value": "CA/ON/Trenton"
  },
  {
    "label": "Tweed",
    "value": "CA/ON/Tweed"
  },
  {
    "label": "Wooler",
    "value": "CA/ON/Wooler"
  },
  {
    "label": "Auburn",
    "value": "CA/ON/Auburn"
  },
  {
    "label": "Bayfield",
    "value": "CA/ON/Bayfield"
  },
  {
    "label": "Belgrave",
    "value": "CA/ON/Belgrave"
  },
  {
    "label": "Benmiller",
    "value": "CA/ON/Benmiller"
  },
  {
    "label": "Bluevale",
    "value": "CA/ON/Bluevale"
  },
  {
    "label": "Blyth",
    "value": "CA/ON/Blyth"
  },
  {
    "label": "Brodhagen",
    "value": "CA/ON/Brodhagen"
  },
  {
    "label": "Brucefield",
    "value": "CA/ON/Brucefield"
  },
  {
    "label": "Brussels",
    "value": "CA/ON/Brussels"
  },
  {
    "label": "Centralia",
    "value": "CA/ON/Centralia"
  },
  {
    "label": "Clifford",
    "value": "CA/ON/Clifford"
  },
  {
    "label": "Clinton",
    "value": "CA/ON/Clinton"
  },
  {
    "label": "Crediton",
    "value": "CA/ON/Crediton"
  },
  {
    "label": "Dashwood",
    "value": "CA/ON/Dashwood"
  },
  {
    "label": "Dublin",
    "value": "CA/ON/Dublin"
  },
  {
    "label": "Dungannon",
    "value": "CA/ON/Dungannon"
  },
  {
    "label": "Egmondville",
    "value": "CA/ON/Egmondville"
  },
  {
    "label": "Ethel",
    "value": "CA/ON/Ethel"
  },
  {
    "label": "Exeter",
    "value": "CA/ON/Exeter"
  },
  {
    "label": "Fordwich",
    "value": "CA/ON/Fordwich"
  },
  {
    "label": "Goderich",
    "value": "CA/ON/Goderich"
  },
  {
    "label": "Gorrie",
    "value": "CA/ON/Gorrie"
  },
  {
    "label": "Hay",
    "value": "CA/ON/Hay"
  },
  {
    "label": "Hensall",
    "value": "CA/ON/Hensall"
  },
  {
    "label": "Huron Park",
    "value": "CA/ON/Huron Park"
  },
  {
    "label": "Kippen",
    "value": "CA/ON/Kippen"
  },
  {
    "label": "Kirkton",
    "value": "CA/ON/Kirkton"
  },
  {
    "label": "Londesborough",
    "value": "CA/ON/Londesborough"
  },
  {
    "label": "Seaforth",
    "value": "CA/ON/Seaforth"
  },
  {
    "label": "St Joseph",
    "value": "CA/ON/St Joseph"
  },
  {
    "label": "Varna",
    "value": "CA/ON/Varna"
  },
  {
    "label": "Walton",
    "value": "CA/ON/Walton"
  },
  {
    "label": "Wingham",
    "value": "CA/ON/Wingham"
  },
  {
    "label": "Woodham",
    "value": "CA/ON/Woodham"
  },
  {
    "label": "Wroxeter",
    "value": "CA/ON/Wroxeter"
  },
  {
    "label": "Zurich",
    "value": "CA/ON/Zurich"
  },
  {
    "label": "Dunsford",
    "value": "CA/ON/Dunsford"
  },
  {
    "label": "Rosedale",
    "value": "CA/ON/Rosedale"
  },
  {
    "label": "Bethany",
    "value": "CA/ON/Bethany"
  },
  {
    "label": "Bobcaygeon",
    "value": "CA/ON/Bobcaygeon"
  },
  {
    "label": "Bolsover",
    "value": "CA/ON/Bolsover"
  },
  {
    "label": "Burnt River",
    "value": "CA/ON/Burnt River"
  },
  {
    "label": "Cambray",
    "value": "CA/ON/Cambray"
  },
  {
    "label": "Cameron",
    "value": "CA/ON/Cameron"
  },
  {
    "label": "Coboconk",
    "value": "CA/ON/Coboconk"
  },
  {
    "label": "Fenelon Falls",
    "value": "CA/ON/Fenelon Falls"
  },
  {
    "label": "Janetville",
    "value": "CA/ON/Janetville"
  },
  {
    "label": "Kinmount",
    "value": "CA/ON/Kinmount"
  },
  {
    "label": "Kirkfield",
    "value": "CA/ON/Kirkfield"
  },
  {
    "label": "Lindsay",
    "value": "CA/ON/Lindsay"
  },
  {
    "label": "Little Britain",
    "value": "CA/ON/Little Britain"
  },
  {
    "label": "Manilla",
    "value": "CA/ON/Manilla"
  },
  {
    "label": "Norland",
    "value": "CA/ON/Norland"
  },
  {
    "label": "Oakwood",
    "value": "CA/ON/Oakwood"
  },
  {
    "label": "Omemee",
    "value": "CA/ON/Omemee"
  },
  {
    "label": "Pontypool",
    "value": "CA/ON/Pontypool"
  },
  {
    "label": "Reaboro",
    "value": "CA/ON/Reaboro"
  },
  {
    "label": "Sebright",
    "value": "CA/ON/Sebright"
  },
  {
    "label": "Woodville",
    "value": "CA/ON/Woodville"
  },
  {
    "label": "Angling Lake First Nation",
    "value": "CA/ON/Angling Lake First Nation"
  },
  {
    "label": "Attawapiskat First Nation",
    "value": "CA/ON/Attawapiskat First Nation"
  },
  {
    "label": "Balmertown",
    "value": "CA/ON/Balmertown"
  },
  {
    "label": "Bearskin Lake First Nation",
    "value": "CA/ON/Bearskin Lake First Nation"
  },
  {
    "label": "Big Trout Lake First Nation",
    "value": "CA/ON/Big Trout Lake First Nation"
  },
  {
    "label": "Cat Lake First Nation",
    "value": "CA/ON/Cat Lake First Nation"
  },
  {
    "label": "Clearwater Bay",
    "value": "CA/ON/Clearwater Bay"
  },
  {
    "label": "Cochenour",
    "value": "CA/ON/Cochenour"
  },
  {
    "label": "Dalles First Nation",
    "value": "CA/ON/Dalles First Nation"
  },
  {
    "label": "Deer Lake First Nation",
    "value": "CA/ON/Deer Lake First Nation"
  },
  {
    "label": "Dinorwic",
    "value": "CA/ON/Dinorwic"
  },
  {
    "label": "Dryden",
    "value": "CA/ON/Dryden"
  },
  {
    "label": "Eagle Lake First Nation",
    "value": "CA/ON/Eagle Lake First Nation"
  },
  {
    "label": "Eagle River",
    "value": "CA/ON/Eagle River"
  },
  {
    "label": "Ear Falls",
    "value": "CA/ON/Ear Falls"
  },
  {
    "label": "Fort Hope First Nation (Eabametoong)",
    "value": "CA/ON/Fort Hope First Nation (Eabametoong)"
  },
  {
    "label": "Fort Severn First Nation",
    "value": "CA/ON/Fort Severn First Nation"
  },
  {
    "label": "Grassy Narrows First Nation",
    "value": "CA/ON/Grassy Narrows First Nation"
  },
  {
    "label": "Hudson",
    "value": "CA/ON/Hudson"
  },
  {
    "label": "Ignace",
    "value": "CA/ON/Ignace"
  },
  {
    "label": "Ingolf",
    "value": "CA/ON/Ingolf"
  },
  {
    "label": "Kasabonika First Nation",
    "value": "CA/ON/Kasabonika First Nation"
  },
  {
    "label": "Keewatin",
    "value": "CA/ON/Keewatin"
  },
  {
    "label": "Keewaywin First Nation",
    "value": "CA/ON/Keewaywin First Nation"
  },
  {
    "label": "Kejick First Nation",
    "value": "CA/ON/Kejick First Nation"
  },
  {
    "label": "Kenora",
    "value": "CA/ON/Kenora"
  },
  {
    "label": "Kingfisher Lake First Nation",
    "value": "CA/ON/Kingfisher Lake First Nation"
  },
  {
    "label": "Lac Seul First Nation",
    "value": "CA/ON/Lac Seul First Nation"
  },
  {
    "label": "Lansdowne House First Nation",
    "value": "CA/ON/Lansdowne House First Nation"
  },
  {
    "label": "Longbow Lake",
    "value": "CA/ON/Longbow Lake"
  },
  {
    "label": "Madsen",
    "value": "CA/ON/Madsen"
  },
  {
    "label": "Mckenzie Island",
    "value": "CA/ON/Mckenzie Island"
  },
  {
    "label": "Minaki",
    "value": "CA/ON/Minaki"
  },
  {
    "label": "Minnitaki",
    "value": "CA/ON/Minnitaki"
  },
  {
    "label": "Muskrat Dam First Nation",
    "value": "CA/ON/Muskrat Dam First Nation"
  },
  {
    "label": "Nestor Falls",
    "value": "CA/ON/Nestor Falls"
  },
  {
    "label": "North Caribou Lake First Nation",
    "value": "CA/ON/North Caribou Lake First Nation"
  },
  {
    "label": "North Spirit Lake First Nation",
    "value": "CA/ON/North Spirit Lake First Nation"
  },
  {
    "label": "Osnaburgh House",
    "value": "CA/ON/Osnaburgh House"
  },
  {
    "label": "Oxdrift",
    "value": "CA/ON/Oxdrift"
  },
  {
    "label": "Pawitik",
    "value": "CA/ON/Pawitik"
  },
  {
    "label": "Peawanuck",
    "value": "CA/ON/Peawanuck"
  },
  {
    "label": "Perrault Falls",
    "value": "CA/ON/Perrault Falls"
  },
  {
    "label": "Pickle Lake",
    "value": "CA/ON/Pickle Lake"
  },
  {
    "label": "Pikangikum First Nation",
    "value": "CA/ON/Pikangikum First Nation"
  },
  {
    "label": "Poplar Hill First Nation",
    "value": "CA/ON/Poplar Hill First Nation"
  },
  {
    "label": "Red Lake",
    "value": "CA/ON/Red Lake"
  },
  {
    "label": "Redditt",
    "value": "CA/ON/Redditt"
  },
  {
    "label": "Sachigo Lake First Nation",
    "value": "CA/ON/Sachigo Lake First Nation"
  },
  {
    "label": "Sandy Lake First Nation",
    "value": "CA/ON/Sandy Lake First Nation"
  },
  {
    "label": "Sioux Lookout",
    "value": "CA/ON/Sioux Lookout"
  },
  {
    "label": "Sioux Narrows",
    "value": "CA/ON/Sioux Narrows"
  },
  {
    "label": "Slate Falls First Nation",
    "value": "CA/ON/Slate Falls First Nation"
  },
  {
    "label": "Summer Beaver First Nation",
    "value": "CA/ON/Summer Beaver First Nation"
  },
  {
    "label": "Vermilion Bay",
    "value": "CA/ON/Vermilion Bay"
  },
  {
    "label": "Wabigoon",
    "value": "CA/ON/Wabigoon"
  },
  {
    "label": "Waldhof",
    "value": "CA/ON/Waldhof"
  },
  {
    "label": "Weagamow Lake  First Nation",
    "value": "CA/ON/Weagamow Lake  First Nation"
  },
  {
    "label": "Webequie First Nation",
    "value": "CA/ON/Webequie First Nation"
  },
  {
    "label": "Whitedog First Nation (Wabaseemoong)",
    "value": "CA/ON/Whitedog First Nation (Wabaseemoong)"
  },
  {
    "label": "Wunnumin Lake First Nation",
    "value": "CA/ON/Wunnumin Lake First Nation"
  },
  {
    "label": "Alvinston",
    "value": "CA/ON/Alvinston"
  },
  {
    "label": "Arkona",
    "value": "CA/ON/Arkona"
  },
  {
    "label": "Brigden",
    "value": "CA/ON/Brigden"
  },
  {
    "label": "Bright's Grove",
    "value": "CA/ON/Bright's Grove"
  },
  {
    "label": "Camlachie",
    "value": "CA/ON/Camlachie"
  },
  {
    "label": "Corunna",
    "value": "CA/ON/Corunna"
  },
  {
    "label": "Courtright",
    "value": "CA/ON/Courtright"
  },
  {
    "label": "Croton",
    "value": "CA/ON/Croton"
  },
  {
    "label": "Florence",
    "value": "CA/ON/Florence"
  },
  {
    "label": "Grand Bend",
    "value": "CA/ON/Grand Bend"
  },
  {
    "label": "Inwood",
    "value": "CA/ON/Inwood"
  },
  {
    "label": "Kettle And Stony Point",
    "value": "CA/ON/Kettle And Stony Point"
  },
  {
    "label": "Lambton Shores",
    "value": "CA/ON/Lambton Shores"
  },
  {
    "label": "Mooretown",
    "value": "CA/ON/Mooretown"
  },
  {
    "label": "Oil City",
    "value": "CA/ON/Oil City"
  },
  {
    "label": "Oil Springs",
    "value": "CA/ON/Oil Springs"
  },
  {
    "label": "Petrolia",
    "value": "CA/ON/Petrolia"
  },
  {
    "label": "Point Edward",
    "value": "CA/ON/Point Edward"
  },
  {
    "label": "Port Franks",
    "value": "CA/ON/Port Franks"
  },
  {
    "label": "Port Lambton",
    "value": "CA/ON/Port Lambton"
  },
  {
    "label": "Sarnia",
    "value": "CA/ON/Sarnia"
  },
  {
    "label": "Sombra",
    "value": "CA/ON/Sombra"
  },
  {
    "label": "Thedford",
    "value": "CA/ON/Thedford"
  },
  {
    "label": "Town Of Plympton Wyoming",
    "value": "CA/ON/Town Of Plympton Wyoming"
  },
  {
    "label": "Warwick Township",
    "value": "CA/ON/Warwick Township"
  },
  {
    "label": "Watford",
    "value": "CA/ON/Watford"
  },
  {
    "label": "Wilkesport",
    "value": "CA/ON/Wilkesport"
  },
  {
    "label": "Wyoming",
    "value": "CA/ON/Wyoming"
  },
  {
    "label": "Almonte",
    "value": "CA/ON/Almonte"
  },
  {
    "label": "Balderson",
    "value": "CA/ON/Balderson"
  },
  {
    "label": "Carleton Place",
    "value": "CA/ON/Carleton Place"
  },
  {
    "label": "Clarendon Station",
    "value": "CA/ON/Clarendon Station"
  },
  {
    "label": "Clayton",
    "value": "CA/ON/Clayton"
  },
  {
    "label": "Lanark",
    "value": "CA/ON/Lanark"
  },
  {
    "label": "Maberly",
    "value": "CA/ON/Maberly"
  },
  {
    "label": "Mcdonalds Corners",
    "value": "CA/ON/Mcdonalds Corners"
  },
  {
    "label": "Mississippi Station",
    "value": "CA/ON/Mississippi Station"
  },
  {
    "label": "Pakenham",
    "value": "CA/ON/Pakenham"
  },
  {
    "label": "Perth",
    "value": "CA/ON/Perth"
  },
  {
    "label": "Rideau Ferry",
    "value": "CA/ON/Rideau Ferry"
  },
  {
    "label": "Smiths Falls",
    "value": "CA/ON/Smiths Falls"
  },
  {
    "label": "White Lake",
    "value": "CA/ON/White Lake"
  },
  {
    "label": "Addison",
    "value": "CA/ON/Addison"
  },
  {
    "label": "Athens",
    "value": "CA/ON/Athens"
  },
  {
    "label": "Augusta",
    "value": "CA/ON/Augusta"
  },
  {
    "label": "Brockville",
    "value": "CA/ON/Brockville"
  },
  {
    "label": "Cardinal",
    "value": "CA/ON/Cardinal"
  },
  {
    "label": "Delta",
    "value": "CA/ON/Delta"
  },
  {
    "label": "Elgin",
    "value": "CA/ON/Elgin"
  },
  {
    "label": "Elizabethtown",
    "value": "CA/ON/Elizabethtown"
  },
  {
    "label": "Frankville",
    "value": "CA/ON/Frankville"
  },
  {
    "label": "Gananoque",
    "value": "CA/ON/Gananoque"
  },
  {
    "label": "Jasper",
    "value": "CA/ON/Jasper"
  },
  {
    "label": "Johnstown",
    "value": "CA/ON/Johnstown"
  },
  {
    "label": "Kemptville",
    "value": "CA/ON/Kemptville"
  },
  {
    "label": "Lansdowne",
    "value": "CA/ON/Lansdowne"
  },
  {
    "label": "Lombardy",
    "value": "CA/ON/Lombardy"
  },
  {
    "label": "Lyn",
    "value": "CA/ON/Lyn"
  },
  {
    "label": "Lyndhurst",
    "value": "CA/ON/Lyndhurst"
  },
  {
    "label": "Maitland",
    "value": "CA/ON/Maitland"
  },
  {
    "label": "Mallorytown",
    "value": "CA/ON/Mallorytown"
  },
  {
    "label": "Merrickville",
    "value": "CA/ON/Merrickville"
  },
  {
    "label": "Newboro",
    "value": "CA/ON/Newboro"
  },
  {
    "label": "North Augusta",
    "value": "CA/ON/North Augusta"
  },
  {
    "label": "Oxford Mills",
    "value": "CA/ON/Oxford Mills"
  },
  {
    "label": "Oxford Station",
    "value": "CA/ON/Oxford Station"
  },
  {
    "label": "Portland",
    "value": "CA/ON/Portland"
  },
  {
    "label": "Prescott",
    "value": "CA/ON/Prescott"
  },
  {
    "label": "Rockport",
    "value": "CA/ON/Rockport"
  },
  {
    "label": "Spencerville",
    "value": "CA/ON/Spencerville"
  },
  {
    "label": "Toledo",
    "value": "CA/ON/Toledo"
  },
  {
    "label": "Westport",
    "value": "CA/ON/Westport"
  },
  {
    "label": "Amherstview",
    "value": "CA/ON/Amherstview"
  },
  {
    "label": "Bath",
    "value": "CA/ON/Bath"
  },
  {
    "label": "Camden East",
    "value": "CA/ON/Camden East"
  },
  {
    "label": "Centreville",
    "value": "CA/ON/Centreville"
  },
  {
    "label": "Denbigh",
    "value": "CA/ON/Denbigh"
  },
  {
    "label": "Enterprise",
    "value": "CA/ON/Enterprise"
  },
  {
    "label": "Erinsville",
    "value": "CA/ON/Erinsville"
  },
  {
    "label": "Flinton",
    "value": "CA/ON/Flinton"
  },
  {
    "label": "Kaladar",
    "value": "CA/ON/Kaladar"
  },
  {
    "label": "Mcarthurs Mills",
    "value": "CA/ON/Mcarthurs Mills"
  },
  {
    "label": "Napanee",
    "value": "CA/ON/Napanee"
  },
  {
    "label": "Newburgh",
    "value": "CA/ON/Newburgh"
  },
  {
    "label": "Northbrook",
    "value": "CA/ON/Northbrook"
  },
  {
    "label": "Odessa",
    "value": "CA/ON/Odessa"
  },
  {
    "label": "Roblin",
    "value": "CA/ON/Roblin"
  },
  {
    "label": "Selby",
    "value": "CA/ON/Selby"
  },
  {
    "label": "Stella",
    "value": "CA/ON/Stella"
  },
  {
    "label": "Tamworth",
    "value": "CA/ON/Tamworth"
  },
  {
    "label": "Yarker",
    "value": "CA/ON/Yarker"
  },
  {
    "label": "Birch Island",
    "value": "CA/ON/Birch Island"
  },
  {
    "label": "Cockburn Island",
    "value": "CA/ON/Cockburn Island"
  },
  {
    "label": "Evansville",
    "value": "CA/ON/Evansville"
  },
  {
    "label": "Gordon/Barrie Island",
    "value": "CA/ON/Gordon/Barrie Island"
  },
  {
    "label": "Gore Bay",
    "value": "CA/ON/Gore Bay"
  },
  {
    "label": "Kagawong",
    "value": "CA/ON/Kagawong"
  },
  {
    "label": "Little Current",
    "value": "CA/ON/Little Current"
  },
  {
    "label": "Manitowaning",
    "value": "CA/ON/Manitowaning"
  },
  {
    "label": "Mchigeeng First Nation",
    "value": "CA/ON/Mchigeeng First Nation"
  },
  {
    "label": "Meldrum Bay",
    "value": "CA/ON/Meldrum Bay"
  },
  {
    "label": "Mindemoya",
    "value": "CA/ON/Mindemoya"
  },
  {
    "label": "Providence Bay",
    "value": "CA/ON/Providence Bay"
  },
  {
    "label": "Sheguiandah First Nation",
    "value": "CA/ON/Sheguiandah First Nation"
  },
  {
    "label": "Sheshegwaning First Nation",
    "value": "CA/ON/Sheshegwaning First Nation"
  },
  {
    "label": "Silver Water",
    "value": "CA/ON/Silver Water"
  },
  {
    "label": "South Baymouth",
    "value": "CA/ON/South Baymouth"
  },
  {
    "label": "Spring Bay",
    "value": "CA/ON/Spring Bay"
  },
  {
    "label": "Tehkummah",
    "value": "CA/ON/Tehkummah"
  },
  {
    "label": "Wikwemikong First Nation",
    "value": "CA/ON/Wikwemikong First Nation"
  },
  {
    "label": "Ailsa Craig",
    "value": "CA/ON/Ailsa Craig"
  },
  {
    "label": "Appin",
    "value": "CA/ON/Appin"
  },
  {
    "label": "Arva",
    "value": "CA/ON/Arva"
  },
  {
    "label": "Delaware",
    "value": "CA/ON/Delaware"
  },
  {
    "label": "Denfield",
    "value": "CA/ON/Denfield"
  },
  {
    "label": "Dorchester",
    "value": "CA/ON/Dorchester"
  },
  {
    "label": "Glencoe",
    "value": "CA/ON/Glencoe"
  },
  {
    "label": "Granton",
    "value": "CA/ON/Granton"
  },
  {
    "label": "Harrietsville",
    "value": "CA/ON/Harrietsville"
  },
  {
    "label": "Ilderton",
    "value": "CA/ON/Ilderton"
  },
  {
    "label": "Kerwood",
    "value": "CA/ON/Kerwood"
  },
  {
    "label": "Komoka",
    "value": "CA/ON/Komoka"
  },
  {
    "label": "London",
    "value": "CA/ON/London"
  },
  {
    "label": "Lucan",
    "value": "CA/ON/Lucan"
  },
  {
    "label": "Melbourne",
    "value": "CA/ON/Melbourne"
  },
  {
    "label": "Mossley",
    "value": "CA/ON/Mossley"
  },
  {
    "label": "Mount Brydges",
    "value": "CA/ON/Mount Brydges"
  },
  {
    "label": "Muncey",
    "value": "CA/ON/Muncey"
  },
  {
    "label": "Newbury",
    "value": "CA/ON/Newbury"
  },
  {
    "label": "Parkhill",
    "value": "CA/ON/Parkhill"
  },
  {
    "label": "Putnam",
    "value": "CA/ON/Putnam"
  },
  {
    "label": "Sharon",
    "value": "CA/ON/Sharon"
  },
  {
    "label": "Strathroy",
    "value": "CA/ON/Strathroy"
  },
  {
    "label": "Thorndale",
    "value": "CA/ON/Thorndale"
  },
  {
    "label": "Wardsville",
    "value": "CA/ON/Wardsville"
  },
  {
    "label": "Bala",
    "value": "CA/ON/Bala"
  },
  {
    "label": "Baysville",
    "value": "CA/ON/Baysville"
  },
  {
    "label": "Beaumaris",
    "value": "CA/ON/Beaumaris"
  },
  {
    "label": "Bracebridge",
    "value": "CA/ON/Bracebridge"
  },
  {
    "label": "Dorset",
    "value": "CA/ON/Dorset"
  },
  {
    "label": "Dwight",
    "value": "CA/ON/Dwight"
  },
  {
    "label": "Gravenhurst",
    "value": "CA/ON/Gravenhurst"
  },
  {
    "label": "Honey Harbour",
    "value": "CA/ON/Honey Harbour"
  },
  {
    "label": "Huntsville",
    "value": "CA/ON/Huntsville"
  },
  {
    "label": "Kilworthy",
    "value": "CA/ON/Kilworthy"
  },
  {
    "label": "Mactier",
    "value": "CA/ON/Mactier"
  },
  {
    "label": "Milford Bay",
    "value": "CA/ON/Milford Bay"
  },
  {
    "label": "Minett",
    "value": "CA/ON/Minett"
  },
  {
    "label": "Novar",
    "value": "CA/ON/Novar"
  },
  {
    "label": "Port Carling",
    "value": "CA/ON/Port Carling"
  },
  {
    "label": "Port Sandfield",
    "value": "CA/ON/Port Sandfield"
  },
  {
    "label": "Port Severn",
    "value": "CA/ON/Port Severn"
  },
  {
    "label": "Port Sydney",
    "value": "CA/ON/Port Sydney"
  },
  {
    "label": "Rosseau",
    "value": "CA/ON/Rosseau"
  },
  {
    "label": "Torrance",
    "value": "CA/ON/Torrance"
  },
  {
    "label": "Utterson",
    "value": "CA/ON/Utterson"
  },
  {
    "label": "Windermere",
    "value": "CA/ON/Windermere"
  },
  {
    "label": "Allanburg",
    "value": "CA/ON/Allanburg"
  },
  {
    "label": "Beamsville",
    "value": "CA/ON/Beamsville"
  },
  {
    "label": "Caistor Centre",
    "value": "CA/ON/Caistor Centre"
  },
  {
    "label": "Campden",
    "value": "CA/ON/Campden"
  },
  {
    "label": "Crystal Beach",
    "value": "CA/ON/Crystal Beach"
  },
  {
    "label": "Fenwick",
    "value": "CA/ON/Fenwick"
  },
  {
    "label": "Fonthill",
    "value": "CA/ON/Fonthill"
  },
  {
    "label": "Fort Erie",
    "value": "CA/ON/Fort Erie"
  },
  {
    "label": "Grassie",
    "value": "CA/ON/Grassie"
  },
  {
    "label": "Grimsby",
    "value": "CA/ON/Grimsby"
  },
  {
    "label": "Jordan Station",
    "value": "CA/ON/Jordan Station"
  },
  {
    "label": "Lincoln",
    "value": "CA/ON/Lincoln"
  },
  {
    "label": "Niagara Falls",
    "value": "CA/ON/Niagara Falls"
  },
  {
    "label": "Niagara On The Lake",
    "value": "CA/ON/Niagara On The Lake"
  },
  {
    "label": "Pelham",
    "value": "CA/ON/Pelham"
  },
  {
    "label": "Port Colborne",
    "value": "CA/ON/Port Colborne"
  },
  {
    "label": "Port Robinson",
    "value": "CA/ON/Port Robinson"
  },
  {
    "label": "Queenston",
    "value": "CA/ON/Queenston"
  },
  {
    "label": "Ridgeville",
    "value": "CA/ON/Ridgeville"
  },
  {
    "label": "Ridgeway",
    "value": "CA/ON/Ridgeway"
  },
  {
    "label": "Sherkston",
    "value": "CA/ON/Sherkston"
  },
  {
    "label": "Smithville",
    "value": "CA/ON/Smithville"
  },
  {
    "label": "St Anns",
    "value": "CA/ON/St Anns"
  },
  {
    "label": "St Catharines",
    "value": "CA/ON/St Catharines"
  },
  {
    "label": "St Davids",
    "value": "CA/ON/St Davids"
  },
  {
    "label": "Stevensville",
    "value": "CA/ON/Stevensville"
  },
  {
    "label": "Thorold",
    "value": "CA/ON/Thorold"
  },
  {
    "label": "Vineland",
    "value": "CA/ON/Vineland"
  },
  {
    "label": "Virgil",
    "value": "CA/ON/Virgil"
  },
  {
    "label": "Wainfleet",
    "value": "CA/ON/Wainfleet"
  },
  {
    "label": "Welland",
    "value": "CA/ON/Welland"
  },
  {
    "label": "Wellandport",
    "value": "CA/ON/Wellandport"
  },
  {
    "label": "West Lincoln",
    "value": "CA/ON/West Lincoln"
  },
  {
    "label": "Astorville",
    "value": "CA/ON/Astorville"
  },
  {
    "label": "Balsam Creek",
    "value": "CA/ON/Balsam Creek"
  },
  {
    "label": "Bear Island First Nation",
    "value": "CA/ON/Bear Island First Nation"
  },
  {
    "label": "Bissett Creek",
    "value": "CA/ON/Bissett Creek"
  },
  {
    "label": "Bonfield",
    "value": "CA/ON/Bonfield"
  },
  {
    "label": "Cache Bay",
    "value": "CA/ON/Cache Bay"
  },
  {
    "label": "Calvin",
    "value": "CA/ON/Calvin"
  },
  {
    "label": "Corbeil",
    "value": "CA/ON/Corbeil"
  },
  {
    "label": "Crystal Falls",
    "value": "CA/ON/Crystal Falls"
  },
  {
    "label": "Eldee",
    "value": "CA/ON/Eldee"
  },
  {
    "label": "Field",
    "value": "CA/ON/Field"
  },
  {
    "label": "Garden Village",
    "value": "CA/ON/Garden Village"
  },
  {
    "label": "Hornell Heights",
    "value": "CA/ON/Hornell Heights"
  },
  {
    "label": "Lake St Peter",
    "value": "CA/ON/Lake St Peter"
  },
  {
    "label": "Lavigne",
    "value": "CA/ON/Lavigne"
  },
  {
    "label": "Madawaska",
    "value": "CA/ON/Madawaska"
  },
  {
    "label": "Marten River",
    "value": "CA/ON/Marten River"
  },
  {
    "label": "Mattawa",
    "value": "CA/ON/Mattawa"
  },
  {
    "label": "Mattawan",
    "value": "CA/ON/Mattawan"
  },
  {
    "label": "Monetville",
    "value": "CA/ON/Monetville"
  },
  {
    "label": "North Bay",
    "value": "CA/ON/North Bay"
  },
  {
    "label": "Papineau-Cameron",
    "value": "CA/ON/Papineau-Cameron"
  },
  {
    "label": "Redbridge",
    "value": "CA/ON/Redbridge"
  },
  {
    "label": "River Valley",
    "value": "CA/ON/River Valley"
  },
  {
    "label": "Rutherglen",
    "value": "CA/ON/Rutherglen"
  },
  {
    "label": "Songis",
    "value": "CA/ON/Songis"
  },
  {
    "label": "Sturgeon Falls",
    "value": "CA/ON/Sturgeon Falls"
  },
  {
    "label": "Temagami",
    "value": "CA/ON/Temagami"
  },
  {
    "label": "Thorne",
    "value": "CA/ON/Thorne"
  },
  {
    "label": "Tilden Lake",
    "value": "CA/ON/Tilden Lake"
  },
  {
    "label": "Verner",
    "value": "CA/ON/Verner"
  },
  {
    "label": "Whitney",
    "value": "CA/ON/Whitney"
  },
  {
    "label": "Baltimore",
    "value": "CA/ON/Baltimore"
  },
  {
    "label": "Bewdley",
    "value": "CA/ON/Bewdley"
  },
  {
    "label": "Brighton",
    "value": "CA/ON/Brighton"
  },
  {
    "label": "Campbellcroft",
    "value": "CA/ON/Campbellcroft"
  },
  {
    "label": "Campbellford",
    "value": "CA/ON/Campbellford"
  },
  {
    "label": "Castleton",
    "value": "CA/ON/Castleton"
  },
  {
    "label": "Cobourg",
    "value": "CA/ON/Cobourg"
  },
  {
    "label": "Codrington",
    "value": "CA/ON/Codrington"
  },
  {
    "label": "Colborne",
    "value": "CA/ON/Colborne"
  },
  {
    "label": "Gores Landing",
    "value": "CA/ON/Gores Landing"
  },
  {
    "label": "Grafton",
    "value": "CA/ON/Grafton"
  },
  {
    "label": "Harwood",
    "value": "CA/ON/Harwood"
  },
  {
    "label": "Hastings",
    "value": "CA/ON/Hastings"
  },
  {
    "label": "Port Hope",
    "value": "CA/ON/Port Hope"
  },
  {
    "label": "Roseneath",
    "value": "CA/ON/Roseneath"
  },
  {
    "label": "Trent River",
    "value": "CA/ON/Trent River"
  },
  {
    "label": "Warkworth",
    "value": "CA/ON/Warkworth"
  },
  {
    "label": "Ashton",
    "value": "CA/ON/Ashton"
  },
  {
    "label": "Burritts Rapids",
    "value": "CA/ON/Burritts Rapids"
  },
  {
    "label": "Carlsbad Springs",
    "value": "CA/ON/Carlsbad Springs"
  },
  {
    "label": "Carp",
    "value": "CA/ON/Carp"
  },
  {
    "label": "Cumberland",
    "value": "CA/ON/Cumberland"
  },
  {
    "label": "Dunrobin",
    "value": "CA/ON/Dunrobin"
  },
  {
    "label": "Edwards",
    "value": "CA/ON/Edwards"
  },
  {
    "label": "Fitzroy Harbour",
    "value": "CA/ON/Fitzroy Harbour"
  },
  {
    "label": "Gloucester",
    "value": "CA/ON/Gloucester"
  },
  {
    "label": "Greely",
    "value": "CA/ON/Greely"
  },
  {
    "label": "Kanata",
    "value": "CA/ON/Kanata"
  },
  {
    "label": "Kars",
    "value": "CA/ON/Kars"
  },
  {
    "label": "Kenmore",
    "value": "CA/ON/Kenmore"
  },
  {
    "label": "Kinburn",
    "value": "CA/ON/Kinburn"
  },
  {
    "label": "Manotick",
    "value": "CA/ON/Manotick"
  },
  {
    "label": "Metcalfe",
    "value": "CA/ON/Metcalfe"
  },
  {
    "label": "Munster",
    "value": "CA/ON/Munster"
  },
  {
    "label": "Navan",
    "value": "CA/ON/Navan"
  },
  {
    "label": "Nepean",
    "value": "CA/ON/Nepean"
  },
  {
    "label": "North Gower",
    "value": "CA/ON/North Gower"
  },
  {
    "label": "Orleans",
    "value": "CA/ON/Orleans"
  },
  {
    "label": "Osgoode",
    "value": "CA/ON/Osgoode"
  },
  {
    "label": "Ottawa",
    "value": "CA/ON/Ottawa"
  },
  {
    "label": "Ramsayville",
    "value": "CA/ON/Ramsayville"
  },
  {
    "label": "Rockcliffe",
    "value": "CA/ON/Rockcliffe"
  },
  {
    "label": "Saint-Pascal-Baylon",
    "value": "CA/ON/Saint-Pascal-Baylon"
  },
  {
    "label": "Sarsfield",
    "value": "CA/ON/Sarsfield"
  },
  {
    "label": "Stittsville",
    "value": "CA/ON/Stittsville"
  },
  {
    "label": "Vanier",
    "value": "CA/ON/Vanier"
  },
  {
    "label": "Vars",
    "value": "CA/ON/Vars"
  },
  {
    "label": "Vernon",
    "value": "CA/ON/Vernon"
  },
  {
    "label": "Woodlawn",
    "value": "CA/ON/Woodlawn"
  },
  {
    "label": "Beachville",
    "value": "CA/ON/Beachville"
  },
  {
    "label": "Bright",
    "value": "CA/ON/Bright"
  },
  {
    "label": "Brownsville",
    "value": "CA/ON/Brownsville"
  },
  {
    "label": "Burgessville",
    "value": "CA/ON/Burgessville"
  },
  {
    "label": "Drumbo",
    "value": "CA/ON/Drumbo"
  },
  {
    "label": "Embro",
    "value": "CA/ON/Embro"
  },
  {
    "label": "Hickson",
    "value": "CA/ON/Hickson"
  },
  {
    "label": "Ingersoll",
    "value": "CA/ON/Ingersoll"
  },
  {
    "label": "Innerkip",
    "value": "CA/ON/Innerkip"
  },
  {
    "label": "Kintore",
    "value": "CA/ON/Kintore"
  },
  {
    "label": "Lakeside",
    "value": "CA/ON/Lakeside"
  },
  {
    "label": "Mount Elgin",
    "value": "CA/ON/Mount Elgin"
  },
  {
    "label": "Norwich",
    "value": "CA/ON/Norwich"
  },
  {
    "label": "Otterville",
    "value": "CA/ON/Otterville"
  },
  {
    "label": "Plattsville",
    "value": "CA/ON/Plattsville"
  },
  {
    "label": "Princeton",
    "value": "CA/ON/Princeton"
  },
  {
    "label": "Salford",
    "value": "CA/ON/Salford"
  },
  {
    "label": "Springford",
    "value": "CA/ON/Springford"
  },
  {
    "label": "Tavistock",
    "value": "CA/ON/Tavistock"
  },
  {
    "label": "Thamesford",
    "value": "CA/ON/Thamesford"
  },
  {
    "label": "Tillsonburg",
    "value": "CA/ON/Tillsonburg"
  },
  {
    "label": "Woodstock",
    "value": "CA/ON/Woodstock"
  },
  {
    "label": "Ahmic Harbour",
    "value": "CA/ON/Ahmic Harbour"
  },
  {
    "label": "Arnstein",
    "value": "CA/ON/Arnstein"
  },
  {
    "label": "Britt",
    "value": "CA/ON/Britt"
  },
  {
    "label": "Burks Falls",
    "value": "CA/ON/Burks Falls"
  },
  {
    "label": "Byng Inlet",
    "value": "CA/ON/Byng Inlet"
  },
  {
    "label": "Callander",
    "value": "CA/ON/Callander"
  },
  {
    "label": "Commanda",
    "value": "CA/ON/Commanda"
  },
  {
    "label": "Dokis First Nation",
    "value": "CA/ON/Dokis First Nation"
  },
  {
    "label": "Dunchurch",
    "value": "CA/ON/Dunchurch"
  },
  {
    "label": "Emsdale",
    "value": "CA/ON/Emsdale"
  },
  {
    "label": "Golden Valley",
    "value": "CA/ON/Golden Valley"
  },
  {
    "label": "Katrine",
    "value": "CA/ON/Katrine"
  },
  {
    "label": "Kearney",
    "value": "CA/ON/Kearney"
  },
  {
    "label": "Loring",
    "value": "CA/ON/Loring"
  },
  {
    "label": "Magnetawan",
    "value": "CA/ON/Magnetawan"
  },
  {
    "label": "Mcdougall",
    "value": "CA/ON/Mcdougall"
  },
  {
    "label": "Mckellar",
    "value": "CA/ON/Mckellar"
  },
  {
    "label": "Nipissing",
    "value": "CA/ON/Nipissing"
  },
  {
    "label": "Nobel",
    "value": "CA/ON/Nobel"
  },
  {
    "label": "Parry Sound",
    "value": "CA/ON/Parry Sound"
  },
  {
    "label": "Pointe-Au-Baril-Station",
    "value": "CA/ON/Pointe-Au-Baril-Station"
  },
  {
    "label": "Port Loring",
    "value": "CA/ON/Port Loring"
  },
  {
    "label": "Powassan",
    "value": "CA/ON/Powassan"
  },
  {
    "label": "Restoule",
    "value": "CA/ON/Restoule"
  },
  {
    "label": "Rosseau Road",
    "value": "CA/ON/Rosseau Road"
  },
  {
    "label": "Seguin",
    "value": "CA/ON/Seguin"
  },
  {
    "label": "South River",
    "value": "CA/ON/South River"
  },
  {
    "label": "Sprucedale",
    "value": "CA/ON/Sprucedale"
  },
  {
    "label": "Sundridge",
    "value": "CA/ON/Sundridge"
  },
  {
    "label": "The Archipelago",
    "value": "CA/ON/The Archipelago"
  },
  {
    "label": "Trout Creek",
    "value": "CA/ON/Trout Creek"
  },
  {
    "label": "Alton",
    "value": "CA/ON/Alton"
  },
  {
    "label": "Belfountain",
    "value": "CA/ON/Belfountain"
  },
  {
    "label": "Bolton",
    "value": "CA/ON/Bolton"
  },
  {
    "label": "Brampton",
    "value": "CA/ON/Brampton"
  },
  {
    "label": "Caledon",
    "value": "CA/ON/Caledon"
  },
  {
    "label": "Caledon East",
    "value": "CA/ON/Caledon East"
  },
  {
    "label": "Caledon Village",
    "value": "CA/ON/Caledon Village"
  },
  {
    "label": "Cheltenham",
    "value": "CA/ON/Cheltenham"
  },
  {
    "label": "Inglewood",
    "value": "CA/ON/Inglewood"
  },
  {
    "label": "Mississauga",
    "value": "CA/ON/Mississauga"
  },
  {
    "label": "Palgrave",
    "value": "CA/ON/Palgrave"
  },
  {
    "label": "Terra Cotta",
    "value": "CA/ON/Terra Cotta"
  },
  {
    "label": "Atwood",
    "value": "CA/ON/Atwood"
  },
  {
    "label": "Bornholm",
    "value": "CA/ON/Bornholm"
  },
  {
    "label": "Brunner",
    "value": "CA/ON/Brunner"
  },
  {
    "label": "Fullarton",
    "value": "CA/ON/Fullarton"
  },
  {
    "label": "Gads Hill Station",
    "value": "CA/ON/Gads Hill Station"
  },
  {
    "label": "Gowanstown",
    "value": "CA/ON/Gowanstown"
  },
  {
    "label": "Listowel",
    "value": "CA/ON/Listowel"
  },
  {
    "label": "Milverton",
    "value": "CA/ON/Milverton"
  },
  {
    "label": "Mitchell",
    "value": "CA/ON/Mitchell"
  },
  {
    "label": "Monkton",
    "value": "CA/ON/Monkton"
  },
  {
    "label": "Newton",
    "value": "CA/ON/Newton"
  },
  {
    "label": "Poole",
    "value": "CA/ON/Poole"
  },
  {
    "label": "Rostock",
    "value": "CA/ON/Rostock"
  },
  {
    "label": "Sebringville",
    "value": "CA/ON/Sebringville"
  },
  {
    "label": "Shakespeare",
    "value": "CA/ON/Shakespeare"
  },
  {
    "label": "St Marys",
    "value": "CA/ON/St Marys"
  },
  {
    "label": "St Pauls Station",
    "value": "CA/ON/St Pauls Station"
  },
  {
    "label": "Staffa",
    "value": "CA/ON/Staffa"
  },
  {
    "label": "Stratford",
    "value": "CA/ON/Stratford"
  },
  {
    "label": "Apsley",
    "value": "CA/ON/Apsley"
  },
  {
    "label": "Bailieboro",
    "value": "CA/ON/Bailieboro"
  },
  {
    "label": "Bridgenorth",
    "value": "CA/ON/Bridgenorth"
  },
  {
    "label": "Buckhorn",
    "value": "CA/ON/Buckhorn"
  },
  {
    "label": "Burleigh Falls",
    "value": "CA/ON/Burleigh Falls"
  },
  {
    "label": "Cavan",
    "value": "CA/ON/Cavan"
  },
  {
    "label": "Cavan Monaghan",
    "value": "CA/ON/Cavan Monaghan"
  },
  {
    "label": "Curve Lake",
    "value": "CA/ON/Curve Lake"
  },
  {
    "label": "Douro",
    "value": "CA/ON/Douro"
  },
  {
    "label": "Ennismore",
    "value": "CA/ON/Ennismore"
  },
  {
    "label": "Fraserville",
    "value": "CA/ON/Fraserville"
  },
  {
    "label": "Havelock",
    "value": "CA/ON/Havelock"
  },
  {
    "label": "Hiawatha",
    "value": "CA/ON/Hiawatha"
  },
  {
    "label": "Indian River",
    "value": "CA/ON/Indian River"
  },
  {
    "label": "Juniper Island",
    "value": "CA/ON/Juniper Island"
  },
  {
    "label": "Kawartha Park",
    "value": "CA/ON/Kawartha Park"
  },
  {
    "label": "Keene",
    "value": "CA/ON/Keene"
  },
  {
    "label": "Lakefield",
    "value": "CA/ON/Lakefield"
  },
  {
    "label": "Lakehurst",
    "value": "CA/ON/Lakehurst"
  },
  {
    "label": "Millbrook",
    "value": "CA/ON/Millbrook"
  },
  {
    "label": "Norwood",
    "value": "CA/ON/Norwood"
  },
  {
    "label": "Otonabee",
    "value": "CA/ON/Otonabee"
  },
  {
    "label": "Peterborough",
    "value": "CA/ON/Peterborough"
  },
  {
    "label": "Selwyn",
    "value": "CA/ON/Selwyn"
  },
  {
    "label": "Warsaw",
    "value": "CA/ON/Warsaw"
  },
  {
    "label": "Westwood",
    "value": "CA/ON/Westwood"
  },
  {
    "label": "Woodview",
    "value": "CA/ON/Woodview"
  },
  {
    "label": "Youngs Point",
    "value": "CA/ON/Youngs Point"
  },
  {
    "label": "Alfred",
    "value": "CA/ON/Alfred"
  },
  {
    "label": "Bourget",
    "value": "CA/ON/Bourget"
  },
  {
    "label": "Casselman",
    "value": "CA/ON/Casselman"
  },
  {
    "label": "Chute A Blondeau",
    "value": "CA/ON/Chute A Blondeau"
  },
  {
    "label": "Clarence Creek",
    "value": "CA/ON/Clarence Creek"
  },
  {
    "label": "Curran",
    "value": "CA/ON/Curran"
  },
  {
    "label": "Embrun",
    "value": "CA/ON/Embrun"
  },
  {
    "label": "Fournier",
    "value": "CA/ON/Fournier"
  },
  {
    "label": "Hammond",
    "value": "CA/ON/Hammond"
  },
  {
    "label": "Hawkesbury",
    "value": "CA/ON/Hawkesbury"
  },
  {
    "label": "Lefaivre",
    "value": "CA/ON/Lefaivre"
  },
  {
    "label": "Limoges",
    "value": "CA/ON/Limoges"
  },
  {
    "label": "L'orignal",
    "value": "CA/ON/L'orignal"
  },
  {
    "label": "Plantagenet",
    "value": "CA/ON/Plantagenet"
  },
  {
    "label": "Rockland",
    "value": "CA/ON/Rockland"
  },
  {
    "label": "Russell",
    "value": "CA/ON/Russell"
  },
  {
    "label": "St Albert",
    "value": "CA/ON/St Albert"
  },
  {
    "label": "St Bernardin",
    "value": "CA/ON/St Bernardin"
  },
  {
    "label": "St Eugene",
    "value": "CA/ON/St Eugene"
  },
  {
    "label": "St Isidore",
    "value": "CA/ON/St Isidore"
  },
  {
    "label": "Vankleek Hill",
    "value": "CA/ON/Vankleek Hill"
  },
  {
    "label": "Wendover",
    "value": "CA/ON/Wendover"
  },
  {
    "label": "Ameliasburg",
    "value": "CA/ON/Ameliasburg"
  },
  {
    "label": "Bloomfield",
    "value": "CA/ON/Bloomfield"
  },
  {
    "label": "Carrying Place",
    "value": "CA/ON/Carrying Place"
  },
  {
    "label": "Cherry Valley",
    "value": "CA/ON/Cherry Valley"
  },
  {
    "label": "Consecon",
    "value": "CA/ON/Consecon"
  },
  {
    "label": "Demorestville",
    "value": "CA/ON/Demorestville"
  },
  {
    "label": "Hillier",
    "value": "CA/ON/Hillier"
  },
  {
    "label": "Milford",
    "value": "CA/ON/Milford"
  },
  {
    "label": "Picton",
    "value": "CA/ON/Picton"
  },
  {
    "label": "Wellington",
    "value": "CA/ON/Wellington"
  },
  {
    "label": "Gatineau",
    "value": "CA/ON/Gatineau"
  },
  {
    "label": "Atikokan",
    "value": "CA/ON/Atikokan"
  },
  {
    "label": "Barwick",
    "value": "CA/ON/Barwick"
  },
  {
    "label": "Devlin",
    "value": "CA/ON/Devlin"
  },
  {
    "label": "Emo",
    "value": "CA/ON/Emo"
  },
  {
    "label": "Fort Frances",
    "value": "CA/ON/Fort Frances"
  },
  {
    "label": "Kashabowie",
    "value": "CA/ON/Kashabowie"
  },
  {
    "label": "Lac La Croix First Nation",
    "value": "CA/ON/Lac La Croix First Nation"
  },
  {
    "label": "Mine Centre",
    "value": "CA/ON/Mine Centre"
  },
  {
    "label": "Morson",
    "value": "CA/ON/Morson"
  },
  {
    "label": "Pinewood",
    "value": "CA/ON/Pinewood"
  },
  {
    "label": "Rainy River",
    "value": "CA/ON/Rainy River"
  },
  {
    "label": "Sleeman",
    "value": "CA/ON/Sleeman"
  },
  {
    "label": "Stratton",
    "value": "CA/ON/Stratton"
  },
  {
    "label": "Arnprior",
    "value": "CA/ON/Arnprior"
  },
  {
    "label": "Barrys Bay",
    "value": "CA/ON/Barrys Bay"
  },
  {
    "label": "Beachburg",
    "value": "CA/ON/Beachburg"
  },
  {
    "label": "Braeside",
    "value": "CA/ON/Braeside"
  },
  {
    "label": "Burnstown",
    "value": "CA/ON/Burnstown"
  },
  {
    "label": "Calabogie",
    "value": "CA/ON/Calabogie"
  },
  {
    "label": "Chalk River",
    "value": "CA/ON/Chalk River"
  },
  {
    "label": "Cobden",
    "value": "CA/ON/Cobden"
  },
  {
    "label": "Cormac",
    "value": "CA/ON/Cormac"
  },
  {
    "label": "Dacre",
    "value": "CA/ON/Dacre"
  },
  {
    "label": "Deep River",
    "value": "CA/ON/Deep River"
  },
  {
    "label": "Deux Rivieres",
    "value": "CA/ON/Deux Rivieres"
  },
  {
    "label": "Douglas",
    "value": "CA/ON/Douglas"
  },
  {
    "label": "Eganville",
    "value": "CA/ON/Eganville"
  },
  {
    "label": "Foresters Falls",
    "value": "CA/ON/Foresters Falls"
  },
  {
    "label": "Foymount",
    "value": "CA/ON/Foymount"
  },
  {
    "label": "Golden Lake",
    "value": "CA/ON/Golden Lake"
  },
  {
    "label": "Griffith",
    "value": "CA/ON/Griffith"
  },
  {
    "label": "Haley Station",
    "value": "CA/ON/Haley Station"
  },
  {
    "label": "Horton",
    "value": "CA/ON/Horton"
  },
  {
    "label": "Killaloe",
    "value": "CA/ON/Killaloe"
  },
  {
    "label": "Mackey",
    "value": "CA/ON/Mackey"
  },
  {
    "label": "Mcnab/Braeside",
    "value": "CA/ON/Mcnab/Braeside"
  },
  {
    "label": "Palmer Rapids",
    "value": "CA/ON/Palmer Rapids"
  },
  {
    "label": "Pembroke",
    "value": "CA/ON/Pembroke"
  },
  {
    "label": "Petawawa",
    "value": "CA/ON/Petawawa"
  },
  {
    "label": "Quadeville",
    "value": "CA/ON/Quadeville"
  },
  {
    "label": "Renfrew",
    "value": "CA/ON/Renfrew"
  },
  {
    "label": "Rolphton",
    "value": "CA/ON/Rolphton"
  },
  {
    "label": "Round Lake Centre",
    "value": "CA/ON/Round Lake Centre"
  },
  {
    "label": "Stonecliffe",
    "value": "CA/ON/Stonecliffe"
  },
  {
    "label": "Township Of Laurentian Valley",
    "value": "CA/ON/Township Of Laurentian Valley"
  },
  {
    "label": "Township Of Whitewater Region",
    "value": "CA/ON/Township Of Whitewater Region"
  },
  {
    "label": "Westmeath",
    "value": "CA/ON/Westmeath"
  },
  {
    "label": "Wilno",
    "value": "CA/ON/Wilno"
  },
  {
    "label": "Alliston",
    "value": "CA/ON/Alliston"
  },
  {
    "label": "Angus",
    "value": "CA/ON/Angus"
  },
  {
    "label": "Barrie",
    "value": "CA/ON/Barrie"
  },
  {
    "label": "Beeton",
    "value": "CA/ON/Beeton"
  },
  {
    "label": "Belle Ewart",
    "value": "CA/ON/Belle Ewart"
  },
  {
    "label": "Borden",
    "value": "CA/ON/Borden"
  },
  {
    "label": "Bradford",
    "value": "CA/ON/Bradford"
  },
  {
    "label": "Brechin",
    "value": "CA/ON/Brechin"
  },
  {
    "label": "Cedar Point",
    "value": "CA/ON/Cedar Point"
  },
  {
    "label": "Christian Island",
    "value": "CA/ON/Christian Island"
  },
  {
    "label": "Churchill",
    "value": "CA/ON/Churchill"
  },
  {
    "label": "Coldwater",
    "value": "CA/ON/Coldwater"
  },
  {
    "label": "Collingwood",
    "value": "CA/ON/Collingwood"
  },
  {
    "label": "Cookstown",
    "value": "CA/ON/Cookstown"
  },
  {
    "label": "Creemore",
    "value": "CA/ON/Creemore"
  },
  {
    "label": "Cumberland Beach",
    "value": "CA/ON/Cumberland Beach"
  },
  {
    "label": "Duntroon",
    "value": "CA/ON/Duntroon"
  },
  {
    "label": "Egbert",
    "value": "CA/ON/Egbert"
  },
  {
    "label": "Elmvale",
    "value": "CA/ON/Elmvale"
  },
  {
    "label": "Essa",
    "value": "CA/ON/Essa"
  },
  {
    "label": "Everett",
    "value": "CA/ON/Everett"
  },
  {
    "label": "Gilford",
    "value": "CA/ON/Gilford"
  },
  {
    "label": "Glen Huron",
    "value": "CA/ON/Glen Huron"
  },
  {
    "label": "Glencairn",
    "value": "CA/ON/Glencairn"
  },
  {
    "label": "Hawkestone",
    "value": "CA/ON/Hawkestone"
  },
  {
    "label": "Hillsdale",
    "value": "CA/ON/Hillsdale"
  },
  {
    "label": "Innisfil",
    "value": "CA/ON/Innisfil"
  },
  {
    "label": "Lafontaine",
    "value": "CA/ON/Lafontaine"
  },
  {
    "label": "Lefroy",
    "value": "CA/ON/Lefroy"
  },
  {
    "label": "Lisle",
    "value": "CA/ON/Lisle"
  },
  {
    "label": "Longford Mills",
    "value": "CA/ON/Longford Mills"
  },
  {
    "label": "Loretto",
    "value": "CA/ON/Loretto"
  },
  {
    "label": "Midhurst",
    "value": "CA/ON/Midhurst"
  },
  {
    "label": "Midland",
    "value": "CA/ON/Midland"
  },
  {
    "label": "Minesing",
    "value": "CA/ON/Minesing"
  },
  {
    "label": "Moonstone",
    "value": "CA/ON/Moonstone"
  },
  {
    "label": "Mount Albert",
    "value": "CA/ON/Mount Albert"
  },
  {
    "label": "New Lowell",
    "value": "CA/ON/New Lowell"
  },
  {
    "label": "New Tecumseth",
    "value": "CA/ON/New Tecumseth"
  },
  {
    "label": "Nottawa",
    "value": "CA/ON/Nottawa"
  },
  {
    "label": "Orillia",
    "value": "CA/ON/Orillia"
  },
  {
    "label": "Oro",
    "value": "CA/ON/Oro"
  },
  {
    "label": "Oro Station",
    "value": "CA/ON/Oro Station"
  },
  {
    "label": "Penetanguishene",
    "value": "CA/ON/Penetanguishene"
  },
  {
    "label": "Perkinsfield",
    "value": "CA/ON/Perkinsfield"
  },
  {
    "label": "Phelpston",
    "value": "CA/ON/Phelpston"
  },
  {
    "label": "Port Mcnicoll",
    "value": "CA/ON/Port Mcnicoll"
  },
  {
    "label": "Rama",
    "value": "CA/ON/Rama"
  },
  {
    "label": "Ramara",
    "value": "CA/ON/Ramara"
  },
  {
    "label": "Rosemont",
    "value": "CA/ON/Rosemont"
  },
  {
    "label": "Severn Bridge",
    "value": "CA/ON/Severn Bridge"
  },
  {
    "label": "Shanty Bay",
    "value": "CA/ON/Shanty Bay"
  },
  {
    "label": "Stayner",
    "value": "CA/ON/Stayner"
  },
  {
    "label": "Stroud",
    "value": "CA/ON/Stroud"
  },
  {
    "label": "Thornton",
    "value": "CA/ON/Thornton"
  },
  {
    "label": "Tiny",
    "value": "CA/ON/Tiny"
  },
  {
    "label": "Tottenham",
    "value": "CA/ON/Tottenham"
  },
  {
    "label": "Utopia",
    "value": "CA/ON/Utopia"
  },
  {
    "label": "Victoria Harbour",
    "value": "CA/ON/Victoria Harbour"
  },
  {
    "label": "Warminster",
    "value": "CA/ON/Warminster"
  },
  {
    "label": "Wasaga Beach",
    "value": "CA/ON/Wasaga Beach"
  },
  {
    "label": "Washago",
    "value": "CA/ON/Washago"
  },
  {
    "label": "Waubaushene",
    "value": "CA/ON/Waubaushene"
  },
  {
    "label": "Wyebridge",
    "value": "CA/ON/Wyebridge"
  },
  {
    "label": "Wyevale",
    "value": "CA/ON/Wyevale"
  },
  {
    "label": "Akwesasne",
    "value": "CA/ON/Akwesasne"
  },
  {
    "label": "Alexandria",
    "value": "CA/ON/Alexandria"
  },
  {
    "label": "Apple Hill",
    "value": "CA/ON/Apple Hill"
  },
  {
    "label": "Avonmore",
    "value": "CA/ON/Avonmore"
  },
  {
    "label": "Bainsville",
    "value": "CA/ON/Bainsville"
  },
  {
    "label": "Berwick",
    "value": "CA/ON/Berwick"
  },
  {
    "label": "Brinston",
    "value": "CA/ON/Brinston"
  },
  {
    "label": "Chesterville",
    "value": "CA/ON/Chesterville"
  },
  {
    "label": "Cornwall",
    "value": "CA/ON/Cornwall"
  },
  {
    "label": "Crysler",
    "value": "CA/ON/Crysler"
  },
  {
    "label": "Dalkeith",
    "value": "CA/ON/Dalkeith"
  },
  {
    "label": "Dunvegan",
    "value": "CA/ON/Dunvegan"
  },
  {
    "label": "Finch",
    "value": "CA/ON/Finch"
  },
  {
    "label": "Glen Robertson",
    "value": "CA/ON/Glen Robertson"
  },
  {
    "label": "Green Valley",
    "value": "CA/ON/Green Valley"
  },
  {
    "label": "Ingleside",
    "value": "CA/ON/Ingleside"
  },
  {
    "label": "Inkerman",
    "value": "CA/ON/Inkerman"
  },
  {
    "label": "Iroquois",
    "value": "CA/ON/Iroquois"
  },
  {
    "label": "Lancaster",
    "value": "CA/ON/Lancaster"
  },
  {
    "label": "Long Sault",
    "value": "CA/ON/Long Sault"
  },
  {
    "label": "Lunenburg",
    "value": "CA/ON/Lunenburg"
  },
  {
    "label": "Martintown",
    "value": "CA/ON/Martintown"
  },
  {
    "label": "Maxville",
    "value": "CA/ON/Maxville"
  },
  {
    "label": "Monkland",
    "value": "CA/ON/Monkland"
  },
  {
    "label": "Moose Creek",
    "value": "CA/ON/Moose Creek"
  },
  {
    "label": "Morewood",
    "value": "CA/ON/Morewood"
  },
  {
    "label": "Morrisburg",
    "value": "CA/ON/Morrisburg"
  },
  {
    "label": "Mountain",
    "value": "CA/ON/Mountain"
  },
  {
    "label": "Newington",
    "value": "CA/ON/Newington"
  },
  {
    "label": "North Lancaster",
    "value": "CA/ON/North Lancaster"
  },
  {
    "label": "South Glengarry",
    "value": "CA/ON/South Glengarry"
  },
  {
    "label": "South Lancaster",
    "value": "CA/ON/South Lancaster"
  },
  {
    "label": "South Mountain",
    "value": "CA/ON/South Mountain"
  },
  {
    "label": "South Stormont",
    "value": "CA/ON/South Stormont"
  },
  {
    "label": "St Andrews West",
    "value": "CA/ON/St Andrews West"
  },
  {
    "label": "Ste Anne De Prescott",
    "value": "CA/ON/Ste Anne De Prescott"
  },
  {
    "label": "Summerstown",
    "value": "CA/ON/Summerstown"
  },
  {
    "label": "Upper Canada Village",
    "value": "CA/ON/Upper Canada Village"
  },
  {
    "label": "Williamsburg",
    "value": "CA/ON/Williamsburg"
  },
  {
    "label": "Williamstown",
    "value": "CA/ON/Williamstown"
  },
  {
    "label": "Winchester",
    "value": "CA/ON/Winchester"
  },
  {
    "label": "Winchester Springs",
    "value": "CA/ON/Winchester Springs"
  },
  {
    "label": "Alban",
    "value": "CA/ON/Alban"
  },
  {
    "label": "Azilda",
    "value": "CA/ON/Azilda"
  },
  {
    "label": "Biscotasing",
    "value": "CA/ON/Biscotasing"
  },
  {
    "label": "Blezard Valley",
    "value": "CA/ON/Blezard Valley"
  },
  {
    "label": "Capreol",
    "value": "CA/ON/Capreol"
  },
  {
    "label": "Cartier",
    "value": "CA/ON/Cartier"
  },
  {
    "label": "Chapleau",
    "value": "CA/ON/Chapleau"
  },
  {
    "label": "Chelmsford",
    "value": "CA/ON/Chelmsford"
  },
  {
    "label": "Coniston",
    "value": "CA/ON/Coniston"
  },
  {
    "label": "Copper Cliff",
    "value": "CA/ON/Copper Cliff"
  },
  {
    "label": "Dowling",
    "value": "CA/ON/Dowling"
  },
  {
    "label": "Espanola",
    "value": "CA/ON/Espanola"
  },
  {
    "label": "Falconbridge",
    "value": "CA/ON/Falconbridge"
  },
  {
    "label": "Foleyet",
    "value": "CA/ON/Foleyet"
  },
  {
    "label": "Garson",
    "value": "CA/ON/Garson"
  },
  {
    "label": "Gogama",
    "value": "CA/ON/Gogama"
  },
  {
    "label": "Hagar",
    "value": "CA/ON/Hagar"
  },
  {
    "label": "Hanmer",
    "value": "CA/ON/Hanmer"
  },
  {
    "label": "Killarney",
    "value": "CA/ON/Killarney"
  },
  {
    "label": "Levack",
    "value": "CA/ON/Levack"
  },
  {
    "label": "Lively",
    "value": "CA/ON/Lively"
  },
  {
    "label": "Markstay",
    "value": "CA/ON/Markstay"
  },
  {
    "label": "Massey",
    "value": "CA/ON/Massey"
  },
  {
    "label": "Mckerrow",
    "value": "CA/ON/Mckerrow"
  },
  {
    "label": "Nairn Centre",
    "value": "CA/ON/Nairn Centre"
  },
  {
    "label": "Naughton",
    "value": "CA/ON/Naughton"
  },
  {
    "label": "Noelville",
    "value": "CA/ON/Noelville"
  },
  {
    "label": "Onaping",
    "value": "CA/ON/Onaping"
  },
  {
    "label": "Pickerel",
    "value": "CA/ON/Pickerel"
  },
  {
    "label": "Ramsey",
    "value": "CA/ON/Ramsey"
  },
  {
    "label": "Shining Tree",
    "value": "CA/ON/Shining Tree"
  },
  {
    "label": "Skead",
    "value": "CA/ON/Skead"
  },
  {
    "label": "St Charles",
    "value": "CA/ON/St Charles"
  },
  {
    "label": "Sudbury",
    "value": "CA/ON/Sudbury"
  },
  {
    "label": "Sultan",
    "value": "CA/ON/Sultan"
  },
  {
    "label": "Val Caron",
    "value": "CA/ON/Val Caron"
  },
  {
    "label": "Val Therese",
    "value": "CA/ON/Val Therese"
  },
  {
    "label": "Wahnapitae",
    "value": "CA/ON/Wahnapitae"
  },
  {
    "label": "Walford",
    "value": "CA/ON/Walford"
  },
  {
    "label": "Warren",
    "value": "CA/ON/Warren"
  },
  {
    "label": "Webbwood",
    "value": "CA/ON/Webbwood"
  },
  {
    "label": "Whitefish",
    "value": "CA/ON/Whitefish"
  },
  {
    "label": "Whitefish Falls",
    "value": "CA/ON/Whitefish Falls"
  },
  {
    "label": "Worthington",
    "value": "CA/ON/Worthington"
  },
  {
    "label": "Armstrong",
    "value": "CA/ON/Armstrong"
  },
  {
    "label": "Armstrong Station",
    "value": "CA/ON/Armstrong Station"
  },
  {
    "label": "Aroland First Nation",
    "value": "CA/ON/Aroland First Nation"
  },
  {
    "label": "Beardmore",
    "value": "CA/ON/Beardmore"
  },
  {
    "label": "Caramat",
    "value": "CA/ON/Caramat"
  },
  {
    "label": "Collins",
    "value": "CA/ON/Collins"
  },
  {
    "label": "Conmee",
    "value": "CA/ON/Conmee"
  },
  {
    "label": "Dorion",
    "value": "CA/ON/Dorion"
  },
  {
    "label": "East Gorham",
    "value": "CA/ON/East Gorham"
  },
  {
    "label": "Fort William First Nation",
    "value": "CA/ON/Fort William First Nation"
  },
  {
    "label": "Fowler",
    "value": "CA/ON/Fowler"
  },
  {
    "label": "Geraldton",
    "value": "CA/ON/Geraldton"
  },
  {
    "label": "Gorham",
    "value": "CA/ON/Gorham"
  },
  {
    "label": "Graham",
    "value": "CA/ON/Graham"
  },
  {
    "label": "Greenstone",
    "value": "CA/ON/Greenstone"
  },
  {
    "label": "Gull Bay First Nation",
    "value": "CA/ON/Gull Bay First Nation"
  },
  {
    "label": "Heron Bay",
    "value": "CA/ON/Heron Bay"
  },
  {
    "label": "Hurkett",
    "value": "CA/ON/Hurkett"
  },
  {
    "label": "Jacques",
    "value": "CA/ON/Jacques"
  },
  {
    "label": "Jellicoe",
    "value": "CA/ON/Jellicoe"
  },
  {
    "label": "Kakabeka Falls",
    "value": "CA/ON/Kakabeka Falls"
  },
  {
    "label": "Kaministiquia",
    "value": "CA/ON/Kaministiquia"
  },
  {
    "label": "Lappe",
    "value": "CA/ON/Lappe"
  },
  {
    "label": "Longlac",
    "value": "CA/ON/Longlac"
  },
  {
    "label": "Macdiarmid",
    "value": "CA/ON/Macdiarmid"
  },
  {
    "label": "Manitouwadge",
    "value": "CA/ON/Manitouwadge"
  },
  {
    "label": "Marathon",
    "value": "CA/ON/Marathon"
  },
  {
    "label": "Mobert First Nation",
    "value": "CA/ON/Mobert First Nation"
  },
  {
    "label": "Murillo",
    "value": "CA/ON/Murillo"
  },
  {
    "label": "Nakina",
    "value": "CA/ON/Nakina"
  },
  {
    "label": "Neebing",
    "value": "CA/ON/Neebing"
  },
  {
    "label": "Nipigon",
    "value": "CA/ON/Nipigon"
  },
  {
    "label": "Nolalu",
    "value": "CA/ON/Nolalu"
  },
  {
    "label": "Oconnor",
    "value": "CA/ON/Oconnor"
  },
  {
    "label": "Pass Lake",
    "value": "CA/ON/Pass Lake"
  },
  {
    "label": "Pays Plat First Nation",
    "value": "CA/ON/Pays Plat First Nation"
  },
  {
    "label": "Raith",
    "value": "CA/ON/Raith"
  },
  {
    "label": "Red Rock",
    "value": "CA/ON/Red Rock"
  },
  {
    "label": "Rosslyn",
    "value": "CA/ON/Rosslyn"
  },
  {
    "label": "Rossport",
    "value": "CA/ON/Rossport"
  },
  {
    "label": "Savant Lake",
    "value": "CA/ON/Savant Lake"
  },
  {
    "label": "Schreiber",
    "value": "CA/ON/Schreiber"
  },
  {
    "label": "Shebandowan",
    "value": "CA/ON/Shebandowan"
  },
  {
    "label": "Shuniah",
    "value": "CA/ON/Shuniah"
  },
  {
    "label": "Slate River",
    "value": "CA/ON/Slate River"
  },
  {
    "label": "South Gillies",
    "value": "CA/ON/South Gillies"
  },
  {
    "label": "Terrace Bay",
    "value": "CA/ON/Terrace Bay"
  },
  {
    "label": "Thunder Bay",
    "value": "CA/ON/Thunder Bay"
  },
  {
    "label": "Upsala",
    "value": "CA/ON/Upsala"
  },
  {
    "label": "Belle Vallee",
    "value": "CA/ON/Belle Vallee"
  },
  {
    "label": "Brethour",
    "value": "CA/ON/Brethour"
  },
  {
    "label": "Chamberlain",
    "value": "CA/ON/Chamberlain"
  },
  {
    "label": "Chaput Hughes",
    "value": "CA/ON/Chaput Hughes"
  },
  {
    "label": "Charlton",
    "value": "CA/ON/Charlton"
  },
  {
    "label": "Cobalt",
    "value": "CA/ON/Cobalt"
  },
  {
    "label": "Coleman",
    "value": "CA/ON/Coleman"
  },
  {
    "label": "Dobie",
    "value": "CA/ON/Dobie"
  },
  {
    "label": "Dymond",
    "value": "CA/ON/Dymond"
  },
  {
    "label": "Earlton",
    "value": "CA/ON/Earlton"
  },
  {
    "label": "Elk Lake",
    "value": "CA/ON/Elk Lake"
  },
  {
    "label": "Englehart",
    "value": "CA/ON/Englehart"
  },
  {
    "label": "Evanturel",
    "value": "CA/ON/Evanturel"
  },
  {
    "label": "Gowganda",
    "value": "CA/ON/Gowganda"
  },
  {
    "label": "Haileybury",
    "value": "CA/ON/Haileybury"
  },
  {
    "label": "Harris",
    "value": "CA/ON/Harris"
  },
  {
    "label": "Hilliardton",
    "value": "CA/ON/Hilliardton"
  },
  {
    "label": "Kearns",
    "value": "CA/ON/Kearns"
  },
  {
    "label": "Kenabeek",
    "value": "CA/ON/Kenabeek"
  },
  {
    "label": "Kerns",
    "value": "CA/ON/Kerns"
  },
  {
    "label": "King Kirkland",
    "value": "CA/ON/King Kirkland"
  },
  {
    "label": "Kirkland Lake",
    "value": "CA/ON/Kirkland Lake"
  },
  {
    "label": "Larder Lake",
    "value": "CA/ON/Larder Lake"
  },
  {
    "label": "Latchford",
    "value": "CA/ON/Latchford"
  },
  {
    "label": "Marter",
    "value": "CA/ON/Marter"
  },
  {
    "label": "Matachewan",
    "value": "CA/ON/Matachewan"
  },
  {
    "label": "New Liskeard",
    "value": "CA/ON/New Liskeard"
  },
  {
    "label": "North Cobalt",
    "value": "CA/ON/North Cobalt"
  },
  {
    "label": "Sesekinika",
    "value": "CA/ON/Sesekinika"
  },
  {
    "label": "Swastika",
    "value": "CA/ON/Swastika"
  },
  {
    "label": "Tarzwell",
    "value": "CA/ON/Tarzwell"
  },
  {
    "label": "Thornloe",
    "value": "CA/ON/Thornloe"
  },
  {
    "label": "Tomstown",
    "value": "CA/ON/Tomstown"
  },
  {
    "label": "Virginiatown",
    "value": "CA/ON/Virginiatown"
  },
  {
    "label": "East York",
    "value": "CA/ON/East York"
  },
  {
    "label": "Etobicoke",
    "value": "CA/ON/Etobicoke"
  },
  {
    "label": "North York",
    "value": "CA/ON/North York"
  },
  {
    "label": "Scarborough",
    "value": "CA/ON/Scarborough"
  },
  {
    "label": "Toronto",
    "value": "CA/ON/Toronto"
  },
  {
    "label": "Ayr",
    "value": "CA/ON/Ayr"
  },
  {
    "label": "Baden",
    "value": "CA/ON/Baden"
  },
  {
    "label": "Bloomingdale",
    "value": "CA/ON/Bloomingdale"
  },
  {
    "label": "Breslau",
    "value": "CA/ON/Breslau"
  },
  {
    "label": "Cambridge",
    "value": "CA/ON/Cambridge"
  },
  {
    "label": "Conestogo",
    "value": "CA/ON/Conestogo"
  },
  {
    "label": "Elmira",
    "value": "CA/ON/Elmira"
  },
  {
    "label": "Hawkesville",
    "value": "CA/ON/Hawkesville"
  },
  {
    "label": "Heidelberg",
    "value": "CA/ON/Heidelberg"
  },
  {
    "label": "Kitchener",
    "value": "CA/ON/Kitchener"
  },
  {
    "label": "Linwood",
    "value": "CA/ON/Linwood"
  },
  {
    "label": "Maryhill",
    "value": "CA/ON/Maryhill"
  },
  {
    "label": "Millbank",
    "value": "CA/ON/Millbank"
  },
  {
    "label": "New Dundee",
    "value": "CA/ON/New Dundee"
  },
  {
    "label": "New Hamburg",
    "value": "CA/ON/New Hamburg"
  },
  {
    "label": "North Dumfries",
    "value": "CA/ON/North Dumfries"
  },
  {
    "label": "Petersburg",
    "value": "CA/ON/Petersburg"
  },
  {
    "label": "St Agatha",
    "value": "CA/ON/St Agatha"
  },
  {
    "label": "St Clements",
    "value": "CA/ON/St Clements"
  },
  {
    "label": "St Jacobs",
    "value": "CA/ON/St Jacobs"
  },
  {
    "label": "Wallenstein",
    "value": "CA/ON/Wallenstein"
  },
  {
    "label": "Waterloo",
    "value": "CA/ON/Waterloo"
  },
  {
    "label": "Wellesley",
    "value": "CA/ON/Wellesley"
  },
  {
    "label": "West Montrose",
    "value": "CA/ON/West Montrose"
  },
  {
    "label": "Woolwich Township",
    "value": "CA/ON/Woolwich Township"
  },
  {
    "label": "Alma",
    "value": "CA/ON/Alma"
  },
  {
    "label": "Ariss",
    "value": "CA/ON/Ariss"
  },
  {
    "label": "Arkell",
    "value": "CA/ON/Arkell"
  },
  {
    "label": "Arthur",
    "value": "CA/ON/Arthur"
  },
  {
    "label": "Belwood",
    "value": "CA/ON/Belwood"
  },
  {
    "label": "Centre Wellington",
    "value": "CA/ON/Centre Wellington"
  },
  {
    "label": "Conn",
    "value": "CA/ON/Conn"
  },
  {
    "label": "Drayton",
    "value": "CA/ON/Drayton"
  },
  {
    "label": "Eden Mills",
    "value": "CA/ON/Eden Mills"
  },
  {
    "label": "Elora",
    "value": "CA/ON/Elora"
  },
  {
    "label": "Erin",
    "value": "CA/ON/Erin"
  },
  {
    "label": "Fergus",
    "value": "CA/ON/Fergus"
  },
  {
    "label": "Floradale",
    "value": "CA/ON/Floradale"
  },
  {
    "label": "Guelph",
    "value": "CA/ON/Guelph"
  },
  {
    "label": "Guelph-Eramosa",
    "value": "CA/ON/Guelph-Eramosa"
  },
  {
    "label": "Harriston",
    "value": "CA/ON/Harriston"
  },
  {
    "label": "Hillsburgh",
    "value": "CA/ON/Hillsburgh"
  },
  {
    "label": "Kenilworth",
    "value": "CA/ON/Kenilworth"
  },
  {
    "label": "Mapleton",
    "value": "CA/ON/Mapleton"
  },
  {
    "label": "Minto",
    "value": "CA/ON/Minto"
  },
  {
    "label": "Moorefield",
    "value": "CA/ON/Moorefield"
  },
  {
    "label": "Morriston",
    "value": "CA/ON/Morriston"
  },
  {
    "label": "Palmerston",
    "value": "CA/ON/Palmerston"
  },
  {
    "label": "Puslinch",
    "value": "CA/ON/Puslinch"
  },
  {
    "label": "Rockwood",
    "value": "CA/ON/Rockwood"
  },
  {
    "label": "Township Of Wilmot",
    "value": "CA/ON/Township Of Wilmot"
  },
  {
    "label": "Wellington North",
    "value": "CA/ON/Wellington North"
  },
  {
    "label": "Aurora",
    "value": "CA/ON/Aurora"
  },
  {
    "label": "Baldwin",
    "value": "CA/ON/Baldwin"
  },
  {
    "label": "Cedar Valley",
    "value": "CA/ON/Cedar Valley"
  },
  {
    "label": "Concord",
    "value": "CA/ON/Concord"
  },
  {
    "label": "East Gwillimbury",
    "value": "CA/ON/East Gwillimbury"
  },
  {
    "label": "Gormley",
    "value": "CA/ON/Gormley"
  },
  {
    "label": "Holland Landing",
    "value": "CA/ON/Holland Landing"
  },
  {
    "label": "Jacksons Point",
    "value": "CA/ON/Jacksons Point"
  },
  {
    "label": "Keswick",
    "value": "CA/ON/Keswick"
  },
  {
    "label": "Kettleby",
    "value": "CA/ON/Kettleby"
  },
  {
    "label": "King",
    "value": "CA/ON/King"
  },
  {
    "label": "King City",
    "value": "CA/ON/King City"
  },
  {
    "label": "Kleinburg",
    "value": "CA/ON/Kleinburg"
  },
  {
    "label": "Maple",
    "value": "CA/ON/Maple"
  },
  {
    "label": "Markham",
    "value": "CA/ON/Markham"
  },
  {
    "label": "Newmarket",
    "value": "CA/ON/Newmarket"
  },
  {
    "label": "Nobleton",
    "value": "CA/ON/Nobleton"
  },
  {
    "label": "Pefferlaw",
    "value": "CA/ON/Pefferlaw"
  },
  {
    "label": "Queensville",
    "value": "CA/ON/Queensville"
  },
  {
    "label": "Richmond Hill",
    "value": "CA/ON/Richmond Hill"
  },
  {
    "label": "River Drive Park",
    "value": "CA/ON/River Drive Park"
  },
  {
    "label": "Roches Point",
    "value": "CA/ON/Roches Point"
  },
  {
    "label": "Schomberg",
    "value": "CA/ON/Schomberg"
  },
  {
    "label": "Stouffville",
    "value": "CA/ON/Stouffville"
  },
  {
    "label": "Sutton West",
    "value": "CA/ON/Sutton West"
  },
  {
    "label": "Thornhill",
    "value": "CA/ON/Thornhill"
  },
  {
    "label": "Udora",
    "value": "CA/ON/Udora"
  },
  {
    "label": "Unionville",
    "value": "CA/ON/Unionville"
  },
  {
    "label": "Vaughan",
    "value": "CA/ON/Vaughan"
  },
  {
    "label": "Willow Beach",
    "value": "CA/ON/Willow Beach"
  },
  {
    "label": "Woodbridge",
    "value": "CA/ON/Woodbridge"
  },
  {
    "label": "Annandale",
    "value": "CA/PE/Annandale"
  },
  {
    "label": "Bothwell",
    "value": "CA/PE/Bothwell"
  },
  {
    "label": "Brudenelle",
    "value": "CA/PE/Brudenelle"
  },
  {
    "label": "Cardigan",
    "value": "CA/PE/Cardigan"
  },
  {
    "label": "Georgetown",
    "value": "CA/PE/Georgetown"
  },
  {
    "label": "Howe Bay",
    "value": "CA/PE/Howe Bay"
  },
  {
    "label": "Little Pond",
    "value": "CA/PE/Little Pond"
  },
  {
    "label": "Lorne Valley",
    "value": "CA/PE/Lorne Valley"
  },
  {
    "label": "Lower Montague",
    "value": "CA/PE/Lower Montague"
  },
  {
    "label": "Montague",
    "value": "CA/PE/Montague"
  },
  {
    "label": "Morell",
    "value": "CA/PE/Morell"
  },
  {
    "label": "Murray Harbour",
    "value": "CA/PE/Murray Harbour"
  },
  {
    "label": "Murray River",
    "value": "CA/PE/Murray River"
  },
  {
    "label": "Souris",
    "value": "CA/PE/Souris"
  },
  {
    "label": "Souris West",
    "value": "CA/PE/Souris West"
  },
  {
    "label": "St-Peters Bay",
    "value": "CA/PE/St-Peters Bay"
  },
  {
    "label": "Valleyfield",
    "value": "CA/PE/Valleyfield"
  },
  {
    "label": "Abram-Village",
    "value": "CA/PE/Abram-Village"
  },
  {
    "label": "Albany",
    "value": "CA/PE/Albany"
  },
  {
    "label": "Alberton",
    "value": "CA/PE/Alberton"
  },
  {
    "label": "Baltic",
    "value": "CA/PE/Baltic"
  },
  {
    "label": "Bedeque",
    "value": "CA/PE/Bedeque"
  },
  {
    "label": "Bideford",
    "value": "CA/PE/Bideford"
  },
  {
    "label": "Bloomfield Station",
    "value": "CA/PE/Bloomfield Station"
  },
  {
    "label": "Borden-Carleton",
    "value": "CA/PE/Borden-Carleton"
  },
  {
    "label": "Central Bedeque",
    "value": "CA/PE/Central Bedeque"
  },
  {
    "label": "Coleman",
    "value": "CA/PE/Coleman"
  },
  {
    "label": "Conway",
    "value": "CA/PE/Conway"
  },
  {
    "label": "Darnley",
    "value": "CA/PE/Darnley"
  },
  {
    "label": "East Bideford",
    "value": "CA/PE/East Bideford"
  },
  {
    "label": "Ellerslie",
    "value": "CA/PE/Ellerslie"
  },
  {
    "label": "Elmsdale",
    "value": "CA/PE/Elmsdale"
  },
  {
    "label": "Foxley River",
    "value": "CA/PE/Foxley River"
  },
  {
    "label": "Freeland",
    "value": "CA/PE/Freeland"
  },
  {
    "label": "Greenmount",
    "value": "CA/PE/Greenmount"
  },
  {
    "label": "Hamilton",
    "value": "CA/PE/Hamilton"
  },
  {
    "label": "Indian River",
    "value": "CA/PE/Indian River"
  },
  {
    "label": "Kensington",
    "value": "CA/PE/Kensington"
  },
  {
    "label": "Kinkora",
    "value": "CA/PE/Kinkora"
  },
  {
    "label": "Lady Slipper",
    "value": "CA/PE/Lady Slipper"
  },
  {
    "label": "Linkletter",
    "value": "CA/PE/Linkletter"
  },
  {
    "label": "Malpeque",
    "value": "CA/PE/Malpeque"
  },
  {
    "label": "Miminegash",
    "value": "CA/PE/Miminegash"
  },
  {
    "label": "Miscouche",
    "value": "CA/PE/Miscouche"
  },
  {
    "label": "Montrose",
    "value": "CA/PE/Montrose"
  },
  {
    "label": "Murray Road",
    "value": "CA/PE/Murray Road"
  },
  {
    "label": "Northport",
    "value": "CA/PE/Northport"
  },
  {
    "label": "O'leary",
    "value": "CA/PE/O'leary"
  },
  {
    "label": "Poplar Grove",
    "value": "CA/PE/Poplar Grove"
  },
  {
    "label": "Richmond",
    "value": "CA/PE/Richmond"
  },
  {
    "label": "Scotchfort",
    "value": "CA/PE/Scotchfort"
  },
  {
    "label": "Sherbrooke",
    "value": "CA/PE/Sherbrooke"
  },
  {
    "label": "Slemon Park",
    "value": "CA/PE/Slemon Park"
  },
  {
    "label": "Spring Valley",
    "value": "CA/PE/Spring Valley"
  },
  {
    "label": "St-Louis",
    "value": "CA/PE/St-Louis"
  },
  {
    "label": "St. Felix",
    "value": "CA/PE/St. Felix"
  },
  {
    "label": "St. Nicholas",
    "value": "CA/PE/St. Nicholas"
  },
  {
    "label": "Summerside",
    "value": "CA/PE/Summerside"
  },
  {
    "label": "Tignish",
    "value": "CA/PE/Tignish"
  },
  {
    "label": "Tignish Shore",
    "value": "CA/PE/Tignish Shore"
  },
  {
    "label": "Tyne Valley",
    "value": "CA/PE/Tyne Valley"
  },
  {
    "label": "Wellington Station",
    "value": "CA/PE/Wellington Station"
  },
  {
    "label": "Alexandra",
    "value": "CA/PE/Alexandra"
  },
  {
    "label": "Argyle Shore",
    "value": "CA/PE/Argyle Shore"
  },
  {
    "label": "Auburn",
    "value": "CA/PE/Auburn"
  },
  {
    "label": "Belfast",
    "value": "CA/PE/Belfast"
  },
  {
    "label": "Belle River",
    "value": "CA/PE/Belle River"
  },
  {
    "label": "Bethel",
    "value": "CA/PE/Bethel"
  },
  {
    "label": "Bonshaw",
    "value": "CA/PE/Bonshaw"
  },
  {
    "label": "Brackley",
    "value": "CA/PE/Brackley"
  },
  {
    "label": "Brackley Beach",
    "value": "CA/PE/Brackley Beach"
  },
  {
    "label": "Breadalbane",
    "value": "CA/PE/Breadalbane"
  },
  {
    "label": "Bunbury",
    "value": "CA/PE/Bunbury"
  },
  {
    "label": "Canoe Cove",
    "value": "CA/PE/Canoe Cove"
  },
  {
    "label": "Charlottetown",
    "value": "CA/PE/Charlottetown"
  },
  {
    "label": "Clyde River",
    "value": "CA/PE/Clyde River"
  },
  {
    "label": "Cornwall",
    "value": "CA/PE/Cornwall"
  },
  {
    "label": "Covehead Road",
    "value": "CA/PE/Covehead Road"
  },
  {
    "label": "Crapaud",
    "value": "CA/PE/Crapaud"
  },
  {
    "label": "Cumberland",
    "value": "CA/PE/Cumberland"
  },
  {
    "label": "Darlington",
    "value": "CA/PE/Darlington"
  },
  {
    "label": "Donagh",
    "value": "CA/PE/Donagh"
  },
  {
    "label": "Dunstaffnage",
    "value": "CA/PE/Dunstaffnage"
  },
  {
    "label": "Ebenezer",
    "value": "CA/PE/Ebenezer"
  },
  {
    "label": "Emyvale",
    "value": "CA/PE/Emyvale"
  },
  {
    "label": "Fairview",
    "value": "CA/PE/Fairview"
  },
  {
    "label": "Fort Augustus",
    "value": "CA/PE/Fort Augustus"
  },
  {
    "label": "Frenchfort",
    "value": "CA/PE/Frenchfort"
  },
  {
    "label": "Glenfinnan",
    "value": "CA/PE/Glenfinnan"
  },
  {
    "label": "Grand Tracadie",
    "value": "CA/PE/Grand Tracadie"
  },
  {
    "label": "Green Gables",
    "value": "CA/PE/Green Gables"
  },
  {
    "label": "Hampshire",
    "value": "CA/PE/Hampshire"
  },
  {
    "label": "Harrington",
    "value": "CA/PE/Harrington"
  },
  {
    "label": "Hazelbrook",
    "value": "CA/PE/Hazelbrook"
  },
  {
    "label": "Hermitage",
    "value": "CA/PE/Hermitage"
  },
  {
    "label": "Hunter River",
    "value": "CA/PE/Hunter River"
  },
  {
    "label": "Johnstons River",
    "value": "CA/PE/Johnstons River"
  },
  {
    "label": "Kingston",
    "value": "CA/PE/Kingston"
  },
  {
    "label": "Lake Verde",
    "value": "CA/PE/Lake Verde"
  },
  {
    "label": "Long Creek",
    "value": "CA/PE/Long Creek"
  },
  {
    "label": "Marshfield",
    "value": "CA/PE/Marshfield"
  },
  {
    "label": "Meadowbank",
    "value": "CA/PE/Meadowbank"
  },
  {
    "label": "Mermaid",
    "value": "CA/PE/Mermaid"
  },
  {
    "label": "Milton Station",
    "value": "CA/PE/Milton Station"
  },
  {
    "label": "Mount Albion",
    "value": "CA/PE/Mount Albion"
  },
  {
    "label": "Mount Herbert",
    "value": "CA/PE/Mount Herbert"
  },
  {
    "label": "Mount Mellick",
    "value": "CA/PE/Mount Mellick"
  },
  {
    "label": "Mount Stewart",
    "value": "CA/PE/Mount Stewart"
  },
  {
    "label": "New Argyle",
    "value": "CA/PE/New Argyle"
  },
  {
    "label": "New Dominion",
    "value": "CA/PE/New Dominion"
  },
  {
    "label": "New Haven",
    "value": "CA/PE/New Haven"
  },
  {
    "label": "Nine Mile Creek",
    "value": "CA/PE/Nine Mile Creek"
  },
  {
    "label": "North Milton",
    "value": "CA/PE/North Milton"
  },
  {
    "label": "North Rustico",
    "value": "CA/PE/North Rustico"
  },
  {
    "label": "North Wiltshire",
    "value": "CA/PE/North Wiltshire"
  },
  {
    "label": "North Winsloe",
    "value": "CA/PE/North Winsloe"
  },
  {
    "label": "Oyster Bed",
    "value": "CA/PE/Oyster Bed"
  },
  {
    "label": "Pisquid West",
    "value": "CA/PE/Pisquid West"
  },
  {
    "label": "Pleasant Grove",
    "value": "CA/PE/Pleasant Grove"
  },
  {
    "label": "Pownal",
    "value": "CA/PE/Pownal"
  },
  {
    "label": "Rice Point",
    "value": "CA/PE/Rice Point"
  },
  {
    "label": "Riverdale",
    "value": "CA/PE/Riverdale"
  },
  {
    "label": "Rocky Point",
    "value": "CA/PE/Rocky Point"
  },
  {
    "label": "Sea View",
    "value": "CA/PE/Sea View"
  },
  {
    "label": "Springvale",
    "value": "CA/PE/Springvale"
  },
  {
    "label": "Stanhope",
    "value": "CA/PE/Stanhope"
  },
  {
    "label": "Stratford",
    "value": "CA/PE/Stratford"
  },
  {
    "label": "Suffolk",
    "value": "CA/PE/Suffolk"
  },
  {
    "label": "Tarantum",
    "value": "CA/PE/Tarantum"
  },
  {
    "label": "Tracadie",
    "value": "CA/PE/Tracadie"
  },
  {
    "label": "Union Road",
    "value": "CA/PE/Union Road"
  },
  {
    "label": "Vernon Bridge",
    "value": "CA/PE/Vernon Bridge"
  },
  {
    "label": "Victoria",
    "value": "CA/PE/Victoria"
  },
  {
    "label": "Village Green",
    "value": "CA/PE/Village Green"
  },
  {
    "label": "Warren Grove",
    "value": "CA/PE/Warren Grove"
  },
  {
    "label": "Waterside",
    "value": "CA/PE/Waterside"
  },
  {
    "label": "Websters Corner",
    "value": "CA/PE/Websters Corner"
  },
  {
    "label": "West Covehead",
    "value": "CA/PE/West Covehead"
  },
  {
    "label": "Wheatley River",
    "value": "CA/PE/Wheatley River"
  },
  {
    "label": "Winsloe",
    "value": "CA/PE/Winsloe"
  },
  {
    "label": "Winsloe South",
    "value": "CA/PE/Winsloe South"
  },
  {
    "label": "York",
    "value": "CA/PE/York"
  },
  {
    "label": "Amos",
    "value": "CA/QC/Amos"
  },
  {
    "label": "Angliers",
    "value": "CA/QC/Angliers"
  },
  {
    "label": "Arntfield",
    "value": "CA/QC/Arntfield"
  },
  {
    "label": "Authier",
    "value": "CA/QC/Authier"
  },
  {
    "label": "Authier-Nord",
    "value": "CA/QC/Authier-Nord"
  },
  {
    "label": "Barraute",
    "value": "CA/QC/Barraute"
  },
  {
    "label": "Béarn",
    "value": "CA/QC/Béarn"
  },
  {
    "label": "Belcourt",
    "value": "CA/QC/Belcourt"
  },
  {
    "label": "Bellecombe",
    "value": "CA/QC/Bellecombe"
  },
  {
    "label": "Belleterre",
    "value": "CA/QC/Belleterre"
  },
  {
    "label": "Berry",
    "value": "CA/QC/Berry"
  },
  {
    "label": "Cadillac",
    "value": "CA/QC/Cadillac"
  },
  {
    "label": "Champneuf",
    "value": "CA/QC/Champneuf"
  },
  {
    "label": "Chazel",
    "value": "CA/QC/Chazel"
  },
  {
    "label": "Cléricy",
    "value": "CA/QC/Cléricy"
  },
  {
    "label": "Clerval",
    "value": "CA/QC/Clerval"
  },
  {
    "label": "Cloutier",
    "value": "CA/QC/Cloutier"
  },
  {
    "label": "Desmeloizes",
    "value": "CA/QC/Desmeloizes"
  },
  {
    "label": "Duhamel-Ouest",
    "value": "CA/QC/Duhamel-Ouest"
  },
  {
    "label": "Duparquet",
    "value": "CA/QC/Duparquet"
  },
  {
    "label": "Dupuy",
    "value": "CA/QC/Dupuy"
  },
  {
    "label": "Em-1-A-Sarcelle-Rupert",
    "value": "CA/QC/Em-1-A-Sarcelle-Rupert"
  },
  {
    "label": "Évain",
    "value": "CA/QC/Évain"
  },
  {
    "label": "Fugèreville",
    "value": "CA/QC/Fugèreville"
  },
  {
    "label": "Gallichan",
    "value": "CA/QC/Gallichan"
  },
  {
    "label": "Guérin",
    "value": "CA/QC/Guérin"
  },
  {
    "label": "Guyenne",
    "value": "CA/QC/Guyenne"
  },
  {
    "label": "Hunter's Point",
    "value": "CA/QC/Hunter's Point"
  },
  {
    "label": "Kebaowek",
    "value": "CA/QC/Kebaowek"
  },
  {
    "label": "Kipawa",
    "value": "CA/QC/Kipawa"
  },
  {
    "label": "Kitcisakik",
    "value": "CA/QC/Kitcisakik"
  },
  {
    "label": "La Corne",
    "value": "CA/QC/La Corne"
  },
  {
    "label": "La Morandière",
    "value": "CA/QC/La Morandière"
  },
  {
    "label": "La Motte",
    "value": "CA/QC/La Motte"
  },
  {
    "label": "La Reine",
    "value": "CA/QC/La Reine"
  },
  {
    "label": "La Sarre",
    "value": "CA/QC/La Sarre"
  },
  {
    "label": "Lac-Simon",
    "value": "CA/QC/Lac-Simon"
  },
  {
    "label": "Laforce",
    "value": "CA/QC/Laforce"
  },
  {
    "label": "Landrienne",
    "value": "CA/QC/Landrienne"
  },
  {
    "label": "Laniel",
    "value": "CA/QC/Laniel"
  },
  {
    "label": "Latulipe",
    "value": "CA/QC/Latulipe"
  },
  {
    "label": "Latulipe-Et-Gaboury",
    "value": "CA/QC/Latulipe-Et-Gaboury"
  },
  {
    "label": "Launay",
    "value": "CA/QC/Launay"
  },
  {
    "label": "Laverlochère",
    "value": "CA/QC/Laverlochère"
  },
  {
    "label": "Lorrainville",
    "value": "CA/QC/Lorrainville"
  },
  {
    "label": "Macamic",
    "value": "CA/QC/Macamic"
  },
  {
    "label": "Malartic",
    "value": "CA/QC/Malartic"
  },
  {
    "label": "Moffet",
    "value": "CA/QC/Moffet"
  },
  {
    "label": "Mont-Brun",
    "value": "CA/QC/Mont-Brun"
  },
  {
    "label": "Montbeillard",
    "value": "CA/QC/Montbeillard"
  },
  {
    "label": "Nédélec",
    "value": "CA/QC/Nédélec"
  },
  {
    "label": "Normétal",
    "value": "CA/QC/Normétal"
  },
  {
    "label": "Notre-Dame-Du-Nord",
    "value": "CA/QC/Notre-Dame-Du-Nord"
  },
  {
    "label": "Palmarolle",
    "value": "CA/QC/Palmarolle"
  },
  {
    "label": "Pikogan",
    "value": "CA/QC/Pikogan"
  },
  {
    "label": "Poularies",
    "value": "CA/QC/Poularies"
  },
  {
    "label": "Preissac",
    "value": "CA/QC/Preissac"
  },
  {
    "label": "Rapide-Danseur",
    "value": "CA/QC/Rapide-Danseur"
  },
  {
    "label": "Rémigny",
    "value": "CA/QC/Rémigny"
  },
  {
    "label": "Rivière-Héva",
    "value": "CA/QC/Rivière-Héva"
  },
  {
    "label": "Rochebaucourt",
    "value": "CA/QC/Rochebaucourt"
  },
  {
    "label": "Rollet",
    "value": "CA/QC/Rollet"
  },
  {
    "label": "Roquemaure",
    "value": "CA/QC/Roquemaure"
  },
  {
    "label": "Rouyn-Noranda",
    "value": "CA/QC/Rouyn-Noranda"
  },
  {
    "label": "Saint-Bruno-De-Guigues",
    "value": "CA/QC/Saint-Bruno-De-Guigues"
  },
  {
    "label": "Saint-Dominique-Du-Rosaire",
    "value": "CA/QC/Saint-Dominique-Du-Rosaire"
  },
  {
    "label": "Saint-Édouard-De-Fabre",
    "value": "CA/QC/Saint-Édouard-De-Fabre"
  },
  {
    "label": "Saint-Eugène-De-Guigues",
    "value": "CA/QC/Saint-Eugène-De-Guigues"
  },
  {
    "label": "Saint-Félix-De-Dalquier",
    "value": "CA/QC/Saint-Félix-De-Dalquier"
  },
  {
    "label": "Saint-Lambert",
    "value": "CA/QC/Saint-Lambert"
  },
  {
    "label": "Saint-Marc-De-Figuery",
    "value": "CA/QC/Saint-Marc-De-Figuery"
  },
  {
    "label": "Saint-Mathieu-D'harricana",
    "value": "CA/QC/Saint-Mathieu-D'harricana"
  },
  {
    "label": "Saint-Vital-De-Clermont",
    "value": "CA/QC/Saint-Vital-De-Clermont"
  },
  {
    "label": "Sainte-Germaine-Boulé",
    "value": "CA/QC/Sainte-Germaine-Boulé"
  },
  {
    "label": "Sainte-Gertrude-De-Villeneuve",
    "value": "CA/QC/Sainte-Gertrude-De-Villeneuve"
  },
  {
    "label": "Sainte-Gertrude-Manneville",
    "value": "CA/QC/Sainte-Gertrude-Manneville"
  },
  {
    "label": "Sainte-Hélène-De-Mancebourg",
    "value": "CA/QC/Sainte-Hélène-De-Mancebourg"
  },
  {
    "label": "Senneterre",
    "value": "CA/QC/Senneterre"
  },
  {
    "label": "Sullivan",
    "value": "CA/QC/Sullivan"
  },
  {
    "label": "Taschereau",
    "value": "CA/QC/Taschereau"
  },
  {
    "label": "Témiscaming",
    "value": "CA/QC/Témiscaming"
  },
  {
    "label": "Timiskaming",
    "value": "CA/QC/Timiskaming"
  },
  {
    "label": "Trécesson",
    "value": "CA/QC/Trécesson"
  },
  {
    "label": "Val-D'or",
    "value": "CA/QC/Val-D'or"
  },
  {
    "label": "Val-Senneville",
    "value": "CA/QC/Val-Senneville"
  },
  {
    "label": "Vassan",
    "value": "CA/QC/Vassan"
  },
  {
    "label": "Ville-Marie",
    "value": "CA/QC/Ville-Marie"
  },
  {
    "label": "Villemontel",
    "value": "CA/QC/Villemontel"
  },
  {
    "label": "Winneway",
    "value": "CA/QC/Winneway"
  },
  {
    "label": "Albertville",
    "value": "CA/QC/Albertville"
  },
  {
    "label": "Amqui",
    "value": "CA/QC/Amqui"
  },
  {
    "label": "Auclair",
    "value": "CA/QC/Auclair"
  },
  {
    "label": "Baie-Des-Sables",
    "value": "CA/QC/Baie-Des-Sables"
  },
  {
    "label": "Biencourt",
    "value": "CA/QC/Biencourt"
  },
  {
    "label": "Cabano",
    "value": "CA/QC/Cabano"
  },
  {
    "label": "Cacouna",
    "value": "CA/QC/Cacouna"
  },
  {
    "label": "Causapscal",
    "value": "CA/QC/Causapscal"
  },
  {
    "label": "Dégelis",
    "value": "CA/QC/Dégelis"
  },
  {
    "label": "Esprit-Saint",
    "value": "CA/QC/Esprit-Saint"
  },
  {
    "label": "Grand-Métis",
    "value": "CA/QC/Grand-Métis"
  },
  {
    "label": "Grosses-Roches",
    "value": "CA/QC/Grosses-Roches"
  },
  {
    "label": "Kamouraska",
    "value": "CA/QC/Kamouraska"
  },
  {
    "label": "La Pocatière",
    "value": "CA/QC/La Pocatière"
  },
  {
    "label": "La Pocatière-Station",
    "value": "CA/QC/La Pocatière-Station"
  },
  {
    "label": "La Rédemption",
    "value": "CA/QC/La Rédemption"
  },
  {
    "label": "La Trinité-Des-Monts",
    "value": "CA/QC/La Trinité-Des-Monts"
  },
  {
    "label": "Lac-Au-Saumon",
    "value": "CA/QC/Lac-Au-Saumon"
  },
  {
    "label": "Lac-Des-Aigles",
    "value": "CA/QC/Lac-Des-Aigles"
  },
  {
    "label": "Le Bic",
    "value": "CA/QC/Le Bic"
  },
  {
    "label": "Lejeune",
    "value": "CA/QC/Lejeune"
  },
  {
    "label": "Les Hauteurs",
    "value": "CA/QC/Les Hauteurs"
  },
  {
    "label": "Les Méchins",
    "value": "CA/QC/Les Méchins"
  },
  {
    "label": "L'isle-Verte",
    "value": "CA/QC/L'isle-Verte"
  },
  {
    "label": "L'isle-Verte-Ouest",
    "value": "CA/QC/L'isle-Verte-Ouest"
  },
  {
    "label": "Lots-Renversés",
    "value": "CA/QC/Lots-Renversés"
  },
  {
    "label": "Matane",
    "value": "CA/QC/Matane"
  },
  {
    "label": "Matapédia",
    "value": "CA/QC/Matapédia"
  },
  {
    "label": "Métis-Sur-Mer",
    "value": "CA/QC/Métis-Sur-Mer"
  },
  {
    "label": "Mont-Carmel",
    "value": "CA/QC/Mont-Carmel"
  },
  {
    "label": "Mont-Joli",
    "value": "CA/QC/Mont-Joli"
  },
  {
    "label": "Notre-Dame-Des-Neiges",
    "value": "CA/QC/Notre-Dame-Des-Neiges"
  },
  {
    "label": "Notre-Dame-Des-Sept-Douleurs",
    "value": "CA/QC/Notre-Dame-Des-Sept-Douleurs"
  },
  {
    "label": "Notre-Dame-Du-Lac",
    "value": "CA/QC/Notre-Dame-Du-Lac"
  },
  {
    "label": "Notre-Dame-Du-Portage",
    "value": "CA/QC/Notre-Dame-Du-Portage"
  },
  {
    "label": "Packington",
    "value": "CA/QC/Packington"
  },
  {
    "label": "Padoue",
    "value": "CA/QC/Padoue"
  },
  {
    "label": "Pohénégamook",
    "value": "CA/QC/Pohénégamook"
  },
  {
    "label": "Price",
    "value": "CA/QC/Price"
  },
  {
    "label": "Rimouski",
    "value": "CA/QC/Rimouski"
  },
  {
    "label": "Rivière-Bleue",
    "value": "CA/QC/Rivière-Bleue"
  },
  {
    "label": "Rivière-Du-Loup",
    "value": "CA/QC/Rivière-Du-Loup"
  },
  {
    "label": "Rivière-Ouelle",
    "value": "CA/QC/Rivière-Ouelle"
  },
  {
    "label": "Rivière-Trois-Pistoles",
    "value": "CA/QC/Rivière-Trois-Pistoles"
  },
  {
    "label": "Routhierville",
    "value": "CA/QC/Routhierville"
  },
  {
    "label": "Saint-Adelme",
    "value": "CA/QC/Saint-Adelme"
  },
  {
    "label": "Saint-Alexandre-De-Kamouraska",
    "value": "CA/QC/Saint-Alexandre-De-Kamouraska"
  },
  {
    "label": "Saint-Alexandre-Des-Lacs",
    "value": "CA/QC/Saint-Alexandre-Des-Lacs"
  },
  {
    "label": "Saint-Anaclet-De-Lessard",
    "value": "CA/QC/Saint-Anaclet-De-Lessard"
  },
  {
    "label": "Saint-André",
    "value": "CA/QC/Saint-André"
  },
  {
    "label": "Saint-Antonin",
    "value": "CA/QC/Saint-Antonin"
  },
  {
    "label": "Saint-Arsène",
    "value": "CA/QC/Saint-Arsène"
  },
  {
    "label": "Saint-Athanase",
    "value": "CA/QC/Saint-Athanase"
  },
  {
    "label": "Saint-Bruno-De-Kamouraska",
    "value": "CA/QC/Saint-Bruno-De-Kamouraska"
  },
  {
    "label": "Saint-Charles-Garnier",
    "value": "CA/QC/Saint-Charles-Garnier"
  },
  {
    "label": "Saint-Clément",
    "value": "CA/QC/Saint-Clément"
  },
  {
    "label": "Saint-Cléophas",
    "value": "CA/QC/Saint-Cléophas"
  },
  {
    "label": "Saint-Cyprien",
    "value": "CA/QC/Saint-Cyprien"
  },
  {
    "label": "Saint-Damase",
    "value": "CA/QC/Saint-Damase"
  },
  {
    "label": "Saint-Denis-De La Bouteillerie",
    "value": "CA/QC/Saint-Denis-De La Bouteillerie"
  },
  {
    "label": "Saint-Donat",
    "value": "CA/QC/Saint-Donat"
  },
  {
    "label": "Saint-Éloi",
    "value": "CA/QC/Saint-Éloi"
  },
  {
    "label": "Saint-Elzéar-De-Témiscouata",
    "value": "CA/QC/Saint-Elzéar-De-Témiscouata"
  },
  {
    "label": "Saint-Épiphane",
    "value": "CA/QC/Saint-Épiphane"
  },
  {
    "label": "Saint-Eugène-De-Ladrière",
    "value": "CA/QC/Saint-Eugène-De-Ladrière"
  },
  {
    "label": "Saint-Eusèbe",
    "value": "CA/QC/Saint-Eusèbe"
  },
  {
    "label": "Saint-Fabien",
    "value": "CA/QC/Saint-Fabien"
  },
  {
    "label": "Saint-François-Xavier-De-Viger",
    "value": "CA/QC/Saint-François-Xavier-De-Viger"
  },
  {
    "label": "Saint-Gabriel-De-Rimouski",
    "value": "CA/QC/Saint-Gabriel-De-Rimouski"
  },
  {
    "label": "Saint-Gabriel-Lalemant",
    "value": "CA/QC/Saint-Gabriel-Lalemant"
  },
  {
    "label": "Saint-Germain",
    "value": "CA/QC/Saint-Germain"
  },
  {
    "label": "Saint-Guy",
    "value": "CA/QC/Saint-Guy"
  },
  {
    "label": "Saint-Honoré-De-Témiscouata",
    "value": "CA/QC/Saint-Honoré-De-Témiscouata"
  },
  {
    "label": "Saint-Hubert-De-Rivière-Du-Loup",
    "value": "CA/QC/Saint-Hubert-De-Rivière-Du-Loup"
  },
  {
    "label": "Saint-Jean-De-Cherbourg",
    "value": "CA/QC/Saint-Jean-De-Cherbourg"
  },
  {
    "label": "Saint-Jean-De-Dieu",
    "value": "CA/QC/Saint-Jean-De-Dieu"
  },
  {
    "label": "Saint-Jean-De-La-Lande",
    "value": "CA/QC/Saint-Jean-De-La-Lande"
  },
  {
    "label": "Saint-Joseph-De-Kamouraska",
    "value": "CA/QC/Saint-Joseph-De-Kamouraska"
  },
  {
    "label": "Saint-Joseph-De-Lepage",
    "value": "CA/QC/Saint-Joseph-De-Lepage"
  },
  {
    "label": "Saint-Juste-Du-Lac",
    "value": "CA/QC/Saint-Juste-Du-Lac"
  },
  {
    "label": "Saint-Léandre",
    "value": "CA/QC/Saint-Léandre"
  },
  {
    "label": "Saint-Léon-Le-Grand",
    "value": "CA/QC/Saint-Léon-Le-Grand"
  },
  {
    "label": "Saint-Louis-Du-Ha! Ha!",
    "value": "CA/QC/Saint-Louis-Du-Ha! Ha!"
  },
  {
    "label": "Saint-Marc-Du-Lac-Long",
    "value": "CA/QC/Saint-Marc-Du-Lac-Long"
  },
  {
    "label": "Saint-Marcellin",
    "value": "CA/QC/Saint-Marcellin"
  },
  {
    "label": "Saint-Mathieu-De-Rioux",
    "value": "CA/QC/Saint-Mathieu-De-Rioux"
  },
  {
    "label": "Saint-Médard",
    "value": "CA/QC/Saint-Médard"
  },
  {
    "label": "Saint-Michel-Du-Squatec",
    "value": "CA/QC/Saint-Michel-Du-Squatec"
  },
  {
    "label": "Saint-Modeste",
    "value": "CA/QC/Saint-Modeste"
  },
  {
    "label": "Saint-Moïse",
    "value": "CA/QC/Saint-Moïse"
  },
  {
    "label": "Saint-Narcisse",
    "value": "CA/QC/Saint-Narcisse"
  },
  {
    "label": "Saint-Narcisse-De-Rimouski",
    "value": "CA/QC/Saint-Narcisse-De-Rimouski"
  },
  {
    "label": "Saint-Noël",
    "value": "CA/QC/Saint-Noël"
  },
  {
    "label": "Saint-Octave-De-Métis",
    "value": "CA/QC/Saint-Octave-De-Métis"
  },
  {
    "label": "Saint-Onésime-D'ixworth",
    "value": "CA/QC/Saint-Onésime-D'ixworth"
  },
  {
    "label": "Saint-Pacôme",
    "value": "CA/QC/Saint-Pacôme"
  },
  {
    "label": "Saint-Pascal",
    "value": "CA/QC/Saint-Pascal"
  },
  {
    "label": "Saint-Paul-De-La-Croix",
    "value": "CA/QC/Saint-Paul-De-La-Croix"
  },
  {
    "label": "Saint-Philippe-De-Néri",
    "value": "CA/QC/Saint-Philippe-De-Néri"
  },
  {
    "label": "Saint-Pierre-De-Lamy",
    "value": "CA/QC/Saint-Pierre-De-Lamy"
  },
  {
    "label": "Saint-Simon",
    "value": "CA/QC/Saint-Simon"
  },
  {
    "label": "Saint-Tharcisius",
    "value": "CA/QC/Saint-Tharcisius"
  },
  {
    "label": "Saint-Ulric",
    "value": "CA/QC/Saint-Ulric"
  },
  {
    "label": "Saint-Valérien",
    "value": "CA/QC/Saint-Valérien"
  },
  {
    "label": "Saint-Vianney",
    "value": "CA/QC/Saint-Vianney"
  },
  {
    "label": "Saint-Zénon-Du-Lac-Humqui",
    "value": "CA/QC/Saint-Zénon-Du-Lac-Humqui"
  },
  {
    "label": "Sainte-Angèle-De-Mérici",
    "value": "CA/QC/Sainte-Angèle-De-Mérici"
  },
  {
    "label": "Sainte-Anne-De-La-Pocatière",
    "value": "CA/QC/Sainte-Anne-De-La-Pocatière"
  },
  {
    "label": "Sainte-Félicité",
    "value": "CA/QC/Sainte-Félicité"
  },
  {
    "label": "Sainte-Flavie",
    "value": "CA/QC/Sainte-Flavie"
  },
  {
    "label": "Sainte-Florence",
    "value": "CA/QC/Sainte-Florence"
  },
  {
    "label": "Sainte-Françoise",
    "value": "CA/QC/Sainte-Françoise"
  },
  {
    "label": "Sainte-Hélène-De-Kamouraska",
    "value": "CA/QC/Sainte-Hélène-De-Kamouraska"
  },
  {
    "label": "Sainte-Irène",
    "value": "CA/QC/Sainte-Irène"
  },
  {
    "label": "Sainte-Jeanne-D'arc",
    "value": "CA/QC/Sainte-Jeanne-D'arc"
  },
  {
    "label": "Sainte-Luce",
    "value": "CA/QC/Sainte-Luce"
  },
  {
    "label": "Sainte-Marguerite-Marie",
    "value": "CA/QC/Sainte-Marguerite-Marie"
  },
  {
    "label": "Sainte-Paule",
    "value": "CA/QC/Sainte-Paule"
  },
  {
    "label": "Sainte-Rita",
    "value": "CA/QC/Sainte-Rita"
  },
  {
    "label": "Sayabec",
    "value": "CA/QC/Sayabec"
  },
  {
    "label": "St-Gabriel-De-Kamouraska",
    "value": "CA/QC/St-Gabriel-De-Kamouraska"
  },
  {
    "label": "Témiscouata-Sur-Le-Lac",
    "value": "CA/QC/Témiscouata-Sur-Le-Lac"
  },
  {
    "label": "Trois-Pistoles",
    "value": "CA/QC/Trois-Pistoles"
  },
  {
    "label": "Val-Brillant",
    "value": "CA/QC/Val-Brillant"
  },
  {
    "label": "Vendée",
    "value": "CA/QC/Vendée"
  },
  {
    "label": "Whitworth",
    "value": "CA/QC/Whitworth"
  },
  {
    "label": "Baie-Saint-Paul",
    "value": "CA/QC/Baie-Saint-Paul"
  },
  {
    "label": "Baie-Sainte-Catherine",
    "value": "CA/QC/Baie-Sainte-Catherine"
  },
  {
    "label": "Beaupré",
    "value": "CA/QC/Beaupré"
  },
  {
    "label": "Boischatel",
    "value": "CA/QC/Boischatel"
  },
  {
    "label": "Cap-Santé",
    "value": "CA/QC/Cap-Santé"
  },
  {
    "label": "Château-Richer",
    "value": "CA/QC/Château-Richer"
  },
  {
    "label": "Clermont",
    "value": "CA/QC/Clermont"
  },
  {
    "label": "Courcelette",
    "value": "CA/QC/Courcelette"
  },
  {
    "label": "Deschambault",
    "value": "CA/QC/Deschambault"
  },
  {
    "label": "Deschambault-Grondines",
    "value": "CA/QC/Deschambault-Grondines"
  },
  {
    "label": "Donnacona",
    "value": "CA/QC/Donnacona"
  },
  {
    "label": "Fossambault-Sur-Le-Lac",
    "value": "CA/QC/Fossambault-Sur-Le-Lac"
  },
  {
    "label": "Grondines",
    "value": "CA/QC/Grondines"
  },
  {
    "label": "La Baleine",
    "value": "CA/QC/La Baleine"
  },
  {
    "label": "La Malbaie",
    "value": "CA/QC/La Malbaie"
  },
  {
    "label": "Lac-Beauport",
    "value": "CA/QC/Lac-Beauport"
  },
  {
    "label": "Lac-Delage",
    "value": "CA/QC/Lac-Delage"
  },
  {
    "label": "Lac-Saint-Joseph",
    "value": "CA/QC/Lac-Saint-Joseph"
  },
  {
    "label": "Lac-Sergent",
    "value": "CA/QC/Lac-Sergent"
  },
  {
    "label": "L'ancienne-Lorette",
    "value": "CA/QC/L'ancienne-Lorette"
  },
  {
    "label": "L'ange-Gardien",
    "value": "CA/QC/L'ange-Gardien"
  },
  {
    "label": "Les Éboulements",
    "value": "CA/QC/Les Éboulements"
  },
  {
    "label": "L'isle-Aux-Coudres",
    "value": "CA/QC/L'isle-Aux-Coudres"
  },
  {
    "label": "Neuville",
    "value": "CA/QC/Neuville"
  },
  {
    "label": "Notre-Dame-Des-Anges",
    "value": "CA/QC/Notre-Dame-Des-Anges"
  },
  {
    "label": "Notre-Dame-Des-Monts",
    "value": "CA/QC/Notre-Dame-Des-Monts"
  },
  {
    "label": "Petite-Rivière-Saint-François",
    "value": "CA/QC/Petite-Rivière-Saint-François"
  },
  {
    "label": "Pont-Rouge",
    "value": "CA/QC/Pont-Rouge"
  },
  {
    "label": "Portneuf",
    "value": "CA/QC/Portneuf"
  },
  {
    "label": "Portneuf-Station",
    "value": "CA/QC/Portneuf-Station"
  },
  {
    "label": "Portneuf-Sur-Mer",
    "value": "CA/QC/Portneuf-Sur-Mer"
  },
  {
    "label": "Québec",
    "value": "CA/QC/Québec"
  },
  {
    "label": "Rivière-À-Pierre",
    "value": "CA/QC/Rivière-À-Pierre"
  },
  {
    "label": "Saint-Aimé-Des-Lacs",
    "value": "CA/QC/Saint-Aimé-Des-Lacs"
  },
  {
    "label": "Saint-Alban",
    "value": "CA/QC/Saint-Alban"
  },
  {
    "label": "Saint-Augustin-De-Desmaures",
    "value": "CA/QC/Saint-Augustin-De-Desmaures"
  },
  {
    "label": "Saint-Basile",
    "value": "CA/QC/Saint-Basile"
  },
  {
    "label": "Saint-Bernard-Sur-Mer",
    "value": "CA/QC/Saint-Bernard-Sur-Mer"
  },
  {
    "label": "Saint-Casimir",
    "value": "CA/QC/Saint-Casimir"
  },
  {
    "label": "Saint-Ferréol-Les-Neiges",
    "value": "CA/QC/Saint-Ferréol-Les-Neiges"
  },
  {
    "label": "Saint-François-De-L'île-D'orléans",
    "value": "CA/QC/Saint-François-De-L'île-D'orléans"
  },
  {
    "label": "Saint-Gabriel-De-Valcartier",
    "value": "CA/QC/Saint-Gabriel-De-Valcartier"
  },
  {
    "label": "Saint-Gilbert",
    "value": "CA/QC/Saint-Gilbert"
  },
  {
    "label": "Saint-Hilarion",
    "value": "CA/QC/Saint-Hilarion"
  },
  {
    "label": "Saint-Irénée",
    "value": "CA/QC/Saint-Irénée"
  },
  {
    "label": "Saint-Jean-De-L'île-D'orléans",
    "value": "CA/QC/Saint-Jean-De-L'île-D'orléans"
  },
  {
    "label": "Saint-Joachim",
    "value": "CA/QC/Saint-Joachim"
  },
  {
    "label": "Saint-Joseph-De-La-Rive",
    "value": "CA/QC/Saint-Joseph-De-La-Rive"
  },
  {
    "label": "Saint-Léonard-De-Portneuf",
    "value": "CA/QC/Saint-Léonard-De-Portneuf"
  },
  {
    "label": "Saint-Louis-De-Gonzague-Du-Cap-Tourmente",
    "value": "CA/QC/Saint-Louis-De-Gonzague-Du-Cap-Tourmente"
  },
  {
    "label": "Saint-Marc-Des-Carrières",
    "value": "CA/QC/Saint-Marc-Des-Carrières"
  },
  {
    "label": "Saint-Nicolas",
    "value": "CA/QC/Saint-Nicolas"
  },
  {
    "label": "Saint-Pierre-De-L'île-D'orléans",
    "value": "CA/QC/Saint-Pierre-De-L'île-D'orléans"
  },
  {
    "label": "Saint-Raymond",
    "value": "CA/QC/Saint-Raymond"
  },
  {
    "label": "Saint-Siméon",
    "value": "CA/QC/Saint-Siméon"
  },
  {
    "label": "Saint-Thuribe",
    "value": "CA/QC/Saint-Thuribe"
  },
  {
    "label": "Saint-Tite-Des-Caps",
    "value": "CA/QC/Saint-Tite-Des-Caps"
  },
  {
    "label": "Saint-Ubalde",
    "value": "CA/QC/Saint-Ubalde"
  },
  {
    "label": "Saint-Urbain",
    "value": "CA/QC/Saint-Urbain"
  },
  {
    "label": "Sainte-Anne-De-Beaupré",
    "value": "CA/QC/Sainte-Anne-De-Beaupré"
  },
  {
    "label": "Sainte-Brigitte-De-Laval",
    "value": "CA/QC/Sainte-Brigitte-De-Laval"
  },
  {
    "label": "Sainte-Catherine-De-La-Jacques-Cartier",
    "value": "CA/QC/Sainte-Catherine-De-La-Jacques-Cartier"
  },
  {
    "label": "Sainte-Famille",
    "value": "CA/QC/Sainte-Famille"
  },
  {
    "label": "Sainte-Pétronille",
    "value": "CA/QC/Sainte-Pétronille"
  },
  {
    "label": "Shannon",
    "value": "CA/QC/Shannon"
  },
  {
    "label": "Ste-Catherine-De-La-J-Cartier",
    "value": "CA/QC/Ste-Catherine-De-La-J-Cartier"
  },
  {
    "label": "Stoneham",
    "value": "CA/QC/Stoneham"
  },
  {
    "label": "Stoneham-Et-Tewkesbury",
    "value": "CA/QC/Stoneham-Et-Tewkesbury"
  },
  {
    "label": "Wendake",
    "value": "CA/QC/Wendake"
  },
  {
    "label": "Aston-Jonction",
    "value": "CA/QC/Aston-Jonction"
  },
  {
    "label": "Baie-Du-Febvre",
    "value": "CA/QC/Baie-Du-Febvre"
  },
  {
    "label": "Bécancour",
    "value": "CA/QC/Bécancour"
  },
  {
    "label": "Chesterville",
    "value": "CA/QC/Chesterville"
  },
  {
    "label": "Daveluyville",
    "value": "CA/QC/Daveluyville"
  },
  {
    "label": "Deschaillons-Sur-Saint-Laurent",
    "value": "CA/QC/Deschaillons-Sur-Saint-Laurent"
  },
  {
    "label": "Drummondville",
    "value": "CA/QC/Drummondville"
  },
  {
    "label": "Durham-Sud",
    "value": "CA/QC/Durham-Sud"
  },
  {
    "label": "Fortierville",
    "value": "CA/QC/Fortierville"
  },
  {
    "label": "Foster",
    "value": "CA/QC/Foster"
  },
  {
    "label": "Grand-Saint-Esprit",
    "value": "CA/QC/Grand-Saint-Esprit"
  },
  {
    "label": "Ham-Nord",
    "value": "CA/QC/Ham-Nord"
  },
  {
    "label": "Inverness",
    "value": "CA/QC/Inverness"
  },
  {
    "label": "Kingsey Falls",
    "value": "CA/QC/Kingsey Falls"
  },
  {
    "label": "La Visitation-De-Yamaska",
    "value": "CA/QC/La Visitation-De-Yamaska"
  },
  {
    "label": "Laurierville",
    "value": "CA/QC/Laurierville"
  },
  {
    "label": "L'avenir",
    "value": "CA/QC/L'avenir"
  },
  {
    "label": "Lefebvre",
    "value": "CA/QC/Lefebvre"
  },
  {
    "label": "Lemieux",
    "value": "CA/QC/Lemieux"
  },
  {
    "label": "Lyster",
    "value": "CA/QC/Lyster"
  },
  {
    "label": "Maddington Falls",
    "value": "CA/QC/Maddington Falls"
  },
  {
    "label": "Manseau",
    "value": "CA/QC/Manseau"
  },
  {
    "label": "Nicolet",
    "value": "CA/QC/Nicolet"
  },
  {
    "label": "Norbertville",
    "value": "CA/QC/Norbertville"
  },
  {
    "label": "Notre-Dame-De-Ham",
    "value": "CA/QC/Notre-Dame-De-Ham"
  },
  {
    "label": "Notre-Dame-De-Lourdes",
    "value": "CA/QC/Notre-Dame-De-Lourdes"
  },
  {
    "label": "Notre-Dame-Du-Bon-Conseil",
    "value": "CA/QC/Notre-Dame-Du-Bon-Conseil"
  },
  {
    "label": "Odanak",
    "value": "CA/QC/Odanak"
  },
  {
    "label": "Parisville",
    "value": "CA/QC/Parisville"
  },
  {
    "label": "Pierreville",
    "value": "CA/QC/Pierreville"
  },
  {
    "label": "Plessisville",
    "value": "CA/QC/Plessisville"
  },
  {
    "label": "Princeville",
    "value": "CA/QC/Princeville"
  },
  {
    "label": "Saint-Albert",
    "value": "CA/QC/Saint-Albert"
  },
  {
    "label": "Saint-Bonaventure",
    "value": "CA/QC/Saint-Bonaventure"
  },
  {
    "label": "Saint-Célestin",
    "value": "CA/QC/Saint-Célestin"
  },
  {
    "label": "Saint-Charles-De-Drummond",
    "value": "CA/QC/Saint-Charles-De-Drummond"
  },
  {
    "label": "Saint-Christophe-D'arthabaska",
    "value": "CA/QC/Saint-Christophe-D'arthabaska"
  },
  {
    "label": "Saint-Cyrille-De-Wendover",
    "value": "CA/QC/Saint-Cyrille-De-Wendover"
  },
  {
    "label": "Saint-Edmond-De-Grantham",
    "value": "CA/QC/Saint-Edmond-De-Grantham"
  },
  {
    "label": "Saint-Elphège",
    "value": "CA/QC/Saint-Elphège"
  },
  {
    "label": "Saint-Eugène",
    "value": "CA/QC/Saint-Eugène"
  },
  {
    "label": "Saint-Félix-De-Kingsey",
    "value": "CA/QC/Saint-Félix-De-Kingsey"
  },
  {
    "label": "Saint-Ferdinand",
    "value": "CA/QC/Saint-Ferdinand"
  },
  {
    "label": "Saint-François-Du-Lac",
    "value": "CA/QC/Saint-François-Du-Lac"
  },
  {
    "label": "Saint-Germain-De-Grantham",
    "value": "CA/QC/Saint-Germain-De-Grantham"
  },
  {
    "label": "Saint-Guillaume",
    "value": "CA/QC/Saint-Guillaume"
  },
  {
    "label": "Saint-Joachim-De-Courval",
    "value": "CA/QC/Saint-Joachim-De-Courval"
  },
  {
    "label": "Saint-Léonard-D'aston",
    "value": "CA/QC/Saint-Léonard-D'aston"
  },
  {
    "label": "Saint-Louis-De-Blandford",
    "value": "CA/QC/Saint-Louis-De-Blandford"
  },
  {
    "label": "Saint-Lucien",
    "value": "CA/QC/Saint-Lucien"
  },
  {
    "label": "Saint-Majorique-De-Grantham",
    "value": "CA/QC/Saint-Majorique-De-Grantham"
  },
  {
    "label": "Saint-Nicéphore",
    "value": "CA/QC/Saint-Nicéphore"
  },
  {
    "label": "Saint-Norbert-D'arthabaska",
    "value": "CA/QC/Saint-Norbert-D'arthabaska"
  },
  {
    "label": "Saint-Pie-De-Guire",
    "value": "CA/QC/Saint-Pie-De-Guire"
  },
  {
    "label": "Saint-Pierre-Baptiste",
    "value": "CA/QC/Saint-Pierre-Baptiste"
  },
  {
    "label": "Saint-Pierre-Les-Becquets",
    "value": "CA/QC/Saint-Pierre-Les-Becquets"
  },
  {
    "label": "Saint-Rémi-De-Tingwick",
    "value": "CA/QC/Saint-Rémi-De-Tingwick"
  },
  {
    "label": "Saint-Rosaire",
    "value": "CA/QC/Saint-Rosaire"
  },
  {
    "label": "Saint-Samuel",
    "value": "CA/QC/Saint-Samuel"
  },
  {
    "label": "Saint-Sylvère",
    "value": "CA/QC/Saint-Sylvère"
  },
  {
    "label": "Saint-Valère",
    "value": "CA/QC/Saint-Valère"
  },
  {
    "label": "Saint-Wenceslas",
    "value": "CA/QC/Saint-Wenceslas"
  },
  {
    "label": "Saint-Zéphirin-De-Courval",
    "value": "CA/QC/Saint-Zéphirin-De-Courval"
  },
  {
    "label": "Sainte-Brigitte-Des-Saults",
    "value": "CA/QC/Sainte-Brigitte-Des-Saults"
  },
  {
    "label": "Sainte-Cécile-De-Lévrard",
    "value": "CA/QC/Sainte-Cécile-De-Lévrard"
  },
  {
    "label": "Sainte-Clotilde-De-Horton",
    "value": "CA/QC/Sainte-Clotilde-De-Horton"
  },
  {
    "label": "Sainte-Élizabeth-De-Warwick",
    "value": "CA/QC/Sainte-Élizabeth-De-Warwick"
  },
  {
    "label": "Sainte-Eulalie",
    "value": "CA/QC/Sainte-Eulalie"
  },
  {
    "label": "Sainte-Hélène-De-Chester",
    "value": "CA/QC/Sainte-Hélène-De-Chester"
  },
  {
    "label": "Sainte-Marie-De-Blandford",
    "value": "CA/QC/Sainte-Marie-De-Blandford"
  },
  {
    "label": "Sainte-Monique",
    "value": "CA/QC/Sainte-Monique"
  },
  {
    "label": "Sainte-Perpétue",
    "value": "CA/QC/Sainte-Perpétue"
  },
  {
    "label": "Sainte-Séraphine",
    "value": "CA/QC/Sainte-Séraphine"
  },
  {
    "label": "Sainte-Sophie-De-Lévrard",
    "value": "CA/QC/Sainte-Sophie-De-Lévrard"
  },
  {
    "label": "Sainte-Sophie-D'halifax",
    "value": "CA/QC/Sainte-Sophie-D'halifax"
  },
  {
    "label": "Saints-Martyrs-Canadiens",
    "value": "CA/QC/Saints-Martyrs-Canadiens"
  },
  {
    "label": "Tingwick",
    "value": "CA/QC/Tingwick"
  },
  {
    "label": "Victoriaville",
    "value": "CA/QC/Victoriaville"
  },
  {
    "label": "Villeroy",
    "value": "CA/QC/Villeroy"
  },
  {
    "label": "Warwick",
    "value": "CA/QC/Warwick"
  },
  {
    "label": "Wickham",
    "value": "CA/QC/Wickham"
  },
  {
    "label": "Wôlinak",
    "value": "CA/QC/Wôlinak"
  },
  {
    "label": "Adstock",
    "value": "CA/QC/Adstock"
  },
  {
    "label": "Armagh",
    "value": "CA/QC/Armagh"
  },
  {
    "label": "Aubert-Gallion",
    "value": "CA/QC/Aubert-Gallion"
  },
  {
    "label": "Beauceville",
    "value": "CA/QC/Beauceville"
  },
  {
    "label": "Beaulac-Garthby",
    "value": "CA/QC/Beaulac-Garthby"
  },
  {
    "label": "Beaumont",
    "value": "CA/QC/Beaumont"
  },
  {
    "label": "Berthier-Sur-Mer",
    "value": "CA/QC/Berthier-Sur-Mer"
  },
  {
    "label": "Cap-Saint-Ignace",
    "value": "CA/QC/Cap-Saint-Ignace"
  },
  {
    "label": "Charny",
    "value": "CA/QC/Charny"
  },
  {
    "label": "Disraeli",
    "value": "CA/QC/Disraeli"
  },
  {
    "label": "Dosquet",
    "value": "CA/QC/Dosquet"
  },
  {
    "label": "East Broughton",
    "value": "CA/QC/East Broughton"
  },
  {
    "label": "East Broughton Station",
    "value": "CA/QC/East Broughton Station"
  },
  {
    "label": "Frampton",
    "value": "CA/QC/Frampton"
  },
  {
    "label": "Honfleur",
    "value": "CA/QC/Honfleur"
  },
  {
    "label": "Irlande",
    "value": "CA/QC/Irlande"
  },
  {
    "label": "Kinnear's Mills",
    "value": "CA/QC/Kinnear's Mills"
  },
  {
    "label": "La Durantaye",
    "value": "CA/QC/La Durantaye"
  },
  {
    "label": "La Guadeloupe",
    "value": "CA/QC/La Guadeloupe"
  },
  {
    "label": "Lac-Etchemin",
    "value": "CA/QC/Lac-Etchemin"
  },
  {
    "label": "Lac-Frontière",
    "value": "CA/QC/Lac-Frontière"
  },
  {
    "label": "Lac-Poulin",
    "value": "CA/QC/Lac-Poulin"
  },
  {
    "label": "Lamartine",
    "value": "CA/QC/Lamartine"
  },
  {
    "label": "Laurier-Station",
    "value": "CA/QC/Laurier-Station"
  },
  {
    "label": "Leclercville",
    "value": "CA/QC/Leclercville"
  },
  {
    "label": "Lévis",
    "value": "CA/QC/Lévis"
  },
  {
    "label": "L'islet",
    "value": "CA/QC/L'islet"
  },
  {
    "label": "L'isletville",
    "value": "CA/QC/L'isletville"
  },
  {
    "label": "Lotbinière",
    "value": "CA/QC/Lotbinière"
  },
  {
    "label": "Montmagny",
    "value": "CA/QC/Montmagny"
  },
  {
    "label": "Notre-Dame-Auxiliatrice-De-Buckland",
    "value": "CA/QC/Notre-Dame-Auxiliatrice-De-Buckland"
  },
  {
    "label": "Notre-Dame-Des-Pins",
    "value": "CA/QC/Notre-Dame-Des-Pins"
  },
  {
    "label": "Notre-Dame-Du-Rosaire",
    "value": "CA/QC/Notre-Dame-Du-Rosaire"
  },
  {
    "label": "Notre-Dame-Du-Sacré-Coeur-D'issoudun",
    "value": "CA/QC/Notre-Dame-Du-Sacré-Coeur-D'issoudun"
  },
  {
    "label": "Pintendre",
    "value": "CA/QC/Pintendre"
  },
  {
    "label": "Ravignan",
    "value": "CA/QC/Ravignan"
  },
  {
    "label": "Sacré-Coeur-De-Jésus",
    "value": "CA/QC/Sacré-Coeur-De-Jésus"
  },
  {
    "label": "Saint-Adalbert",
    "value": "CA/QC/Saint-Adalbert"
  },
  {
    "label": "Saint-Adrien-D'irlande",
    "value": "CA/QC/Saint-Adrien-D'irlande"
  },
  {
    "label": "Saint-Agapit",
    "value": "CA/QC/Saint-Agapit"
  },
  {
    "label": "Saint-Alfred",
    "value": "CA/QC/Saint-Alfred"
  },
  {
    "label": "Saint-Anselme",
    "value": "CA/QC/Saint-Anselme"
  },
  {
    "label": "Saint-Antoine-De-L'isle-Aux-Grues",
    "value": "CA/QC/Saint-Antoine-De-L'isle-Aux-Grues"
  },
  {
    "label": "Saint-Antoine-De-Tilly",
    "value": "CA/QC/Saint-Antoine-De-Tilly"
  },
  {
    "label": "Saint-Apollinaire",
    "value": "CA/QC/Saint-Apollinaire"
  },
  {
    "label": "Saint-Aubert",
    "value": "CA/QC/Saint-Aubert"
  },
  {
    "label": "Saint-Benjamin",
    "value": "CA/QC/Saint-Benjamin"
  },
  {
    "label": "Saint-Benoît-Labre",
    "value": "CA/QC/Saint-Benoît-Labre"
  },
  {
    "label": "Saint-Bernard",
    "value": "CA/QC/Saint-Bernard"
  },
  {
    "label": "Saint-Camille-De-Lellis",
    "value": "CA/QC/Saint-Camille-De-Lellis"
  },
  {
    "label": "Saint-Charles-De-Bellechasse",
    "value": "CA/QC/Saint-Charles-De-Bellechasse"
  },
  {
    "label": "Saint-Côme-Linière",
    "value": "CA/QC/Saint-Côme-Linière"
  },
  {
    "label": "Saint-Cyrille-De-Lessard",
    "value": "CA/QC/Saint-Cyrille-De-Lessard"
  },
  {
    "label": "Saint-Damase-De-L'islet",
    "value": "CA/QC/Saint-Damase-De-L'islet"
  },
  {
    "label": "Saint-Damien-De-Buckland",
    "value": "CA/QC/Saint-Damien-De-Buckland"
  },
  {
    "label": "Saint-Édouard-De-Lotbinière",
    "value": "CA/QC/Saint-Édouard-De-Lotbinière"
  },
  {
    "label": "Saint-Elzéar",
    "value": "CA/QC/Saint-Elzéar"
  },
  {
    "label": "Saint-Éphrem-De-Beauce",
    "value": "CA/QC/Saint-Éphrem-De-Beauce"
  },
  {
    "label": "Saint-Étienne-De-Lauzon",
    "value": "CA/QC/Saint-Étienne-De-Lauzon"
  },
  {
    "label": "Saint-Évariste-De-Forsyth",
    "value": "CA/QC/Saint-Évariste-De-Forsyth"
  },
  {
    "label": "Saint-Fabien-De-Panet",
    "value": "CA/QC/Saint-Fabien-De-Panet"
  },
  {
    "label": "Saint-Flavien",
    "value": "CA/QC/Saint-Flavien"
  },
  {
    "label": "Saint-Fortunat",
    "value": "CA/QC/Saint-Fortunat"
  },
  {
    "label": "Saint-François-De-La-Rivière-Du-Sud",
    "value": "CA/QC/Saint-François-De-La-Rivière-Du-Sud"
  },
  {
    "label": "Saint-Frédéric",
    "value": "CA/QC/Saint-Frédéric"
  },
  {
    "label": "Saint-Gédéon-De-Beauce",
    "value": "CA/QC/Saint-Gédéon-De-Beauce"
  },
  {
    "label": "Saint-Georges",
    "value": "CA/QC/Saint-Georges"
  },
  {
    "label": "Saint-Georges-De-Champlain",
    "value": "CA/QC/Saint-Georges-De-Champlain"
  },
  {
    "label": "Saint-Georges-Est",
    "value": "CA/QC/Saint-Georges-Est"
  },
  {
    "label": "Saint-Gervais",
    "value": "CA/QC/Saint-Gervais"
  },
  {
    "label": "Saint-Gilles",
    "value": "CA/QC/Saint-Gilles"
  },
  {
    "label": "Saint-Henri",
    "value": "CA/QC/Saint-Henri"
  },
  {
    "label": "Saint-Hilaire-De-Dorset",
    "value": "CA/QC/Saint-Hilaire-De-Dorset"
  },
  {
    "label": "Saint-Honoré-De-Shenley",
    "value": "CA/QC/Saint-Honoré-De-Shenley"
  },
  {
    "label": "Saint-Isidore",
    "value": "CA/QC/Saint-Isidore"
  },
  {
    "label": "Saint-Jacques-De-Leeds",
    "value": "CA/QC/Saint-Jacques-De-Leeds"
  },
  {
    "label": "Saint-Jacques-Le-Majeur-De-Wolfestown",
    "value": "CA/QC/Saint-Jacques-Le-Majeur-De-Wolfestown"
  },
  {
    "label": "Saint-Janvier-De-Joly",
    "value": "CA/QC/Saint-Janvier-De-Joly"
  },
  {
    "label": "Saint-Jean-Chrysostome",
    "value": "CA/QC/Saint-Jean-Chrysostome"
  },
  {
    "label": "Saint-Jean-De-Brébeuf",
    "value": "CA/QC/Saint-Jean-De-Brébeuf"
  },
  {
    "label": "Saint-Jean-Port-Joli",
    "value": "CA/QC/Saint-Jean-Port-Joli"
  },
  {
    "label": "Saint-Joseph-De-Beauce",
    "value": "CA/QC/Saint-Joseph-De-Beauce"
  },
  {
    "label": "Saint-Joseph-De-Coleraine",
    "value": "CA/QC/Saint-Joseph-De-Coleraine"
  },
  {
    "label": "Saint-Joseph-Des-Érables",
    "value": "CA/QC/Saint-Joseph-Des-Érables"
  },
  {
    "label": "Saint-Jules",
    "value": "CA/QC/Saint-Jules"
  },
  {
    "label": "Saint-Julien",
    "value": "CA/QC/Saint-Julien"
  },
  {
    "label": "Saint-Just-De-Bretenières",
    "value": "CA/QC/Saint-Just-De-Bretenières"
  },
  {
    "label": "Saint-Lambert-De-Lauzon",
    "value": "CA/QC/Saint-Lambert-De-Lauzon"
  },
  {
    "label": "Saint-Lazare-De-Bellechasse",
    "value": "CA/QC/Saint-Lazare-De-Bellechasse"
  },
  {
    "label": "Saint-Léon-De-Standon",
    "value": "CA/QC/Saint-Léon-De-Standon"
  },
  {
    "label": "Saint-Luc-De-Bellechasse",
    "value": "CA/QC/Saint-Luc-De-Bellechasse"
  },
  {
    "label": "Saint-Magloire",
    "value": "CA/QC/Saint-Magloire"
  },
  {
    "label": "Saint-Malachie",
    "value": "CA/QC/Saint-Malachie"
  },
  {
    "label": "Saint-Marcel",
    "value": "CA/QC/Saint-Marcel"
  },
  {
    "label": "Saint-Martin",
    "value": "CA/QC/Saint-Martin"
  },
  {
    "label": "Saint-Michel-De-Bellechasse",
    "value": "CA/QC/Saint-Michel-De-Bellechasse"
  },
  {
    "label": "Saint-Narcisse-De-Beaurivage",
    "value": "CA/QC/Saint-Narcisse-De-Beaurivage"
  },
  {
    "label": "Saint-Nazaire-De-Dorchester",
    "value": "CA/QC/Saint-Nazaire-De-Dorchester"
  },
  {
    "label": "Saint-Nérée-De-Bellechasse",
    "value": "CA/QC/Saint-Nérée-De-Bellechasse"
  },
  {
    "label": "Saint-Odilon-De-Cranbourne",
    "value": "CA/QC/Saint-Odilon-De-Cranbourne"
  },
  {
    "label": "Saint-Omer",
    "value": "CA/QC/Saint-Omer"
  },
  {
    "label": "Saint-Omer-L'islet",
    "value": "CA/QC/Saint-Omer-L'islet"
  },
  {
    "label": "Saint-Pamphile",
    "value": "CA/QC/Saint-Pamphile"
  },
  {
    "label": "Saint-Patrice-De-Beaurivage",
    "value": "CA/QC/Saint-Patrice-De-Beaurivage"
  },
  {
    "label": "Saint-Paul-De-Montminy",
    "value": "CA/QC/Saint-Paul-De-Montminy"
  },
  {
    "label": "Saint-Philémon",
    "value": "CA/QC/Saint-Philémon"
  },
  {
    "label": "Saint-Philibert",
    "value": "CA/QC/Saint-Philibert"
  },
  {
    "label": "Saint-Pierre-De-Broughton",
    "value": "CA/QC/Saint-Pierre-De-Broughton"
  },
  {
    "label": "Saint-Pierre-De-La-Rivière-Du-Sud",
    "value": "CA/QC/Saint-Pierre-De-La-Rivière-Du-Sud"
  },
  {
    "label": "Saint-Prosper",
    "value": "CA/QC/Saint-Prosper"
  },
  {
    "label": "Saint-Prosper-De-Dorchester",
    "value": "CA/QC/Saint-Prosper-De-Dorchester"
  },
  {
    "label": "Saint-Raphaël",
    "value": "CA/QC/Saint-Raphaël"
  },
  {
    "label": "Saint-Rédempteur",
    "value": "CA/QC/Saint-Rédempteur"
  },
  {
    "label": "Saint-René",
    "value": "CA/QC/Saint-René"
  },
  {
    "label": "Saint-Roch-Des-Aulnaies",
    "value": "CA/QC/Saint-Roch-Des-Aulnaies"
  },
  {
    "label": "Saint-Romuald",
    "value": "CA/QC/Saint-Romuald"
  },
  {
    "label": "Saint-Séverin",
    "value": "CA/QC/Saint-Séverin"
  },
  {
    "label": "Saint-Simon-Les-Mines",
    "value": "CA/QC/Saint-Simon-Les-Mines"
  },
  {
    "label": "Saint-Sylvestre",
    "value": "CA/QC/Saint-Sylvestre"
  },
  {
    "label": "Saint-Théophile",
    "value": "CA/QC/Saint-Théophile"
  },
  {
    "label": "Saint-Vallier",
    "value": "CA/QC/Saint-Vallier"
  },
  {
    "label": "Saint-Victor",
    "value": "CA/QC/Saint-Victor"
  },
  {
    "label": "Saint-Zacharie",
    "value": "CA/QC/Saint-Zacharie"
  },
  {
    "label": "Sainte-Agathe-De-Lotbinière",
    "value": "CA/QC/Sainte-Agathe-De-Lotbinière"
  },
  {
    "label": "Sainte-Apolline-De-Patton",
    "value": "CA/QC/Sainte-Apolline-De-Patton"
  },
  {
    "label": "Sainte-Aurélie",
    "value": "CA/QC/Sainte-Aurélie"
  },
  {
    "label": "Sainte-Claire",
    "value": "CA/QC/Sainte-Claire"
  },
  {
    "label": "Sainte-Clotilde-De-Beauce",
    "value": "CA/QC/Sainte-Clotilde-De-Beauce"
  },
  {
    "label": "Sainte-Croix",
    "value": "CA/QC/Sainte-Croix"
  },
  {
    "label": "Sainte-Euphémie-Sur-Rivière-Du-Sud",
    "value": "CA/QC/Sainte-Euphémie-Sur-Rivière-Du-Sud"
  },
  {
    "label": "Sainte-Hélène-De-Breakeyville",
    "value": "CA/QC/Sainte-Hélène-De-Breakeyville"
  },
  {
    "label": "Sainte-Hénédine",
    "value": "CA/QC/Sainte-Hénédine"
  },
  {
    "label": "Sainte-Justine",
    "value": "CA/QC/Sainte-Justine"
  },
  {
    "label": "Sainte-Louise",
    "value": "CA/QC/Sainte-Louise"
  },
  {
    "label": "Sainte-Lucie-De-Beauregard",
    "value": "CA/QC/Sainte-Lucie-De-Beauregard"
  },
  {
    "label": "Sainte-Marguerite",
    "value": "CA/QC/Sainte-Marguerite"
  },
  {
    "label": "Sainte-Marie",
    "value": "CA/QC/Sainte-Marie"
  },
  {
    "label": "Sainte-Praxède",
    "value": "CA/QC/Sainte-Praxède"
  },
  {
    "label": "Sainte-Rose-De-Watford",
    "value": "CA/QC/Sainte-Rose-De-Watford"
  },
  {
    "label": "Sainte-Sabine",
    "value": "CA/QC/Sainte-Sabine"
  },
  {
    "label": "Saints-Anges",
    "value": "CA/QC/Saints-Anges"
  },
  {
    "label": "Scott",
    "value": "CA/QC/Scott"
  },
  {
    "label": "St-Jean-De-La-Lande-De-Beauce",
    "value": "CA/QC/St-Jean-De-La-Lande-De-Beauce"
  },
  {
    "label": "St-Nazaire-De-Buckland",
    "value": "CA/QC/St-Nazaire-De-Buckland"
  },
  {
    "label": "Thetford Mines",
    "value": "CA/QC/Thetford Mines"
  },
  {
    "label": "Tourville",
    "value": "CA/QC/Tourville"
  },
  {
    "label": "Tring-Jonction",
    "value": "CA/QC/Tring-Jonction"
  },
  {
    "label": "Val-Alain",
    "value": "CA/QC/Val-Alain"
  },
  {
    "label": "Vallée-Jonction",
    "value": "CA/QC/Vallée-Jonction"
  },
  {
    "label": "Aguanish",
    "value": "CA/QC/Aguanish"
  },
  {
    "label": "Baie-Comeau",
    "value": "CA/QC/Baie-Comeau"
  },
  {
    "label": "Baie-Johan-Beetz",
    "value": "CA/QC/Baie-Johan-Beetz"
  },
  {
    "label": "Baie-Trinité",
    "value": "CA/QC/Baie-Trinité"
  },
  {
    "label": "Blanc-Sablon",
    "value": "CA/QC/Blanc-Sablon"
  },
  {
    "label": "Bonne-Espérance",
    "value": "CA/QC/Bonne-Espérance"
  },
  {
    "label": "Brador",
    "value": "CA/QC/Brador"
  },
  {
    "label": "Chevery",
    "value": "CA/QC/Chevery"
  },
  {
    "label": "Chute-Aux-Outardes",
    "value": "CA/QC/Chute-Aux-Outardes"
  },
  {
    "label": "Clarke City",
    "value": "CA/QC/Clarke City"
  },
  {
    "label": "Colombier",
    "value": "CA/QC/Colombier"
  },
  {
    "label": "Essipit",
    "value": "CA/QC/Essipit"
  },
  {
    "label": "Fermont",
    "value": "CA/QC/Fermont"
  },
  {
    "label": "Forestville",
    "value": "CA/QC/Forestville"
  },
  {
    "label": "Franquelin",
    "value": "CA/QC/Franquelin"
  },
  {
    "label": "Gallix",
    "value": "CA/QC/Gallix"
  },
  {
    "label": "Godbout",
    "value": "CA/QC/Godbout"
  },
  {
    "label": "Grandes-Bergeronnes",
    "value": "CA/QC/Grandes-Bergeronnes"
  },
  {
    "label": "Gros-Mécatina",
    "value": "CA/QC/Gros-Mécatina"
  },
  {
    "label": "Harrington Harbour",
    "value": "CA/QC/Harrington Harbour"
  },
  {
    "label": "Havre-Saint-Pierre",
    "value": "CA/QC/Havre-Saint-Pierre"
  },
  {
    "label": "Kegaska",
    "value": "CA/QC/Kegaska"
  },
  {
    "label": "La Romaine",
    "value": "CA/QC/La Romaine"
  },
  {
    "label": "La Tabatière",
    "value": "CA/QC/La Tabatière"
  },
  {
    "label": "Les Bergeronnes",
    "value": "CA/QC/Les Bergeronnes"
  },
  {
    "label": "Les Buissons",
    "value": "CA/QC/Les Buissons"
  },
  {
    "label": "Les Escoumins",
    "value": "CA/QC/Les Escoumins"
  },
  {
    "label": "L'île-D'anticosti",
    "value": "CA/QC/L'île-D'anticosti"
  },
  {
    "label": "L'ile-Michon",
    "value": "CA/QC/L'ile-Michon"
  },
  {
    "label": "Longue-Pointe-De-Mingan",
    "value": "CA/QC/Longue-Pointe-De-Mingan"
  },
  {
    "label": "Longue-Rive",
    "value": "CA/QC/Longue-Rive"
  },
  {
    "label": "Lourdes-De-Blanc-Sablon",
    "value": "CA/QC/Lourdes-De-Blanc-Sablon"
  },
  {
    "label": "Magpie",
    "value": "CA/QC/Magpie"
  },
  {
    "label": "Middle Bay",
    "value": "CA/QC/Middle Bay"
  },
  {
    "label": "Mingan",
    "value": "CA/QC/Mingan"
  },
  {
    "label": "Moisie",
    "value": "CA/QC/Moisie"
  },
  {
    "label": "Mutton Bay",
    "value": "CA/QC/Mutton Bay"
  },
  {
    "label": "Natashquan",
    "value": "CA/QC/Natashquan"
  },
  {
    "label": "Old Fort Bay",
    "value": "CA/QC/Old Fort Bay"
  },
  {
    "label": "Pakuashipi",
    "value": "CA/QC/Pakuashipi"
  },
  {
    "label": "Pessamit",
    "value": "CA/QC/Pessamit"
  },
  {
    "label": "Pointe-Aux-Outardes",
    "value": "CA/QC/Pointe-Aux-Outardes"
  },
  {
    "label": "Pointe-Lebel",
    "value": "CA/QC/Pointe-Lebel"
  },
  {
    "label": "Port-Cartier",
    "value": "CA/QC/Port-Cartier"
  },
  {
    "label": "Port-Menier",
    "value": "CA/QC/Port-Menier"
  },
  {
    "label": "Ragueneau",
    "value": "CA/QC/Ragueneau"
  },
  {
    "label": "Rivière-Au-Tonnerre",
    "value": "CA/QC/Rivière-Au-Tonnerre"
  },
  {
    "label": "Rivière-Pentecôte",
    "value": "CA/QC/Rivière-Pentecôte"
  },
  {
    "label": "Rivière-Saint-Jean",
    "value": "CA/QC/Rivière-Saint-Jean"
  },
  {
    "label": "Rivière-Saint-Paul",
    "value": "CA/QC/Rivière-Saint-Paul"
  },
  {
    "label": "Sacré-Coeur",
    "value": "CA/QC/Sacré-Coeur"
  },
  {
    "label": "Saint-Augustin",
    "value": "CA/QC/Saint-Augustin"
  },
  {
    "label": "Schefferville",
    "value": "CA/QC/Schefferville"
  },
  {
    "label": "Sept-Îles",
    "value": "CA/QC/Sept-Îles"
  },
  {
    "label": "Tadoussac",
    "value": "CA/QC/Tadoussac"
  },
  {
    "label": "Tête-À-La-Baleine",
    "value": "CA/QC/Tête-À-La-Baleine"
  },
  {
    "label": "Uashat-Maliotenam",
    "value": "CA/QC/Uashat-Maliotenam"
  },
  {
    "label": "Abercorn",
    "value": "CA/QC/Abercorn"
  },
  {
    "label": "Asbestos",
    "value": "CA/QC/Asbestos"
  },
  {
    "label": "Ascot Corner",
    "value": "CA/QC/Ascot Corner"
  },
  {
    "label": "Audet",
    "value": "CA/QC/Audet"
  },
  {
    "label": "Austin",
    "value": "CA/QC/Austin"
  },
  {
    "label": "Ayer's Cliff",
    "value": "CA/QC/Ayer's Cliff"
  },
  {
    "label": "Barnston-Ouest",
    "value": "CA/QC/Barnston-Ouest"
  },
  {
    "label": "Bedford",
    "value": "CA/QC/Bedford"
  },
  {
    "label": "Bishopton",
    "value": "CA/QC/Bishopton"
  },
  {
    "label": "Bolton-Est",
    "value": "CA/QC/Bolton-Est"
  },
  {
    "label": "Bolton-Ouest",
    "value": "CA/QC/Bolton-Ouest"
  },
  {
    "label": "Bonsecours",
    "value": "CA/QC/Bonsecours"
  },
  {
    "label": "Brigham",
    "value": "CA/QC/Brigham"
  },
  {
    "label": "Brome",
    "value": "CA/QC/Brome"
  },
  {
    "label": "Bromont",
    "value": "CA/QC/Bromont"
  },
  {
    "label": "Bury",
    "value": "CA/QC/Bury"
  },
  {
    "label": "Canton Magog",
    "value": "CA/QC/Canton Magog"
  },
  {
    "label": "Chartierville",
    "value": "CA/QC/Chartierville"
  },
  {
    "label": "Cleveland",
    "value": "CA/QC/Cleveland"
  },
  {
    "label": "Coaticook",
    "value": "CA/QC/Coaticook"
  },
  {
    "label": "Compton",
    "value": "CA/QC/Compton"
  },
  {
    "label": "Cookshire",
    "value": "CA/QC/Cookshire"
  },
  {
    "label": "Cookshire-Eaton",
    "value": "CA/QC/Cookshire-Eaton"
  },
  {
    "label": "Courcelles",
    "value": "CA/QC/Courcelles"
  },
  {
    "label": "Cowansville",
    "value": "CA/QC/Cowansville"
  },
  {
    "label": "Danville",
    "value": "CA/QC/Danville"
  },
  {
    "label": "Dixville",
    "value": "CA/QC/Dixville"
  },
  {
    "label": "Dudswell",
    "value": "CA/QC/Dudswell"
  },
  {
    "label": "Dunham",
    "value": "CA/QC/Dunham"
  },
  {
    "label": "East Angus",
    "value": "CA/QC/East Angus"
  },
  {
    "label": "East Farnham",
    "value": "CA/QC/East Farnham"
  },
  {
    "label": "East Hereford",
    "value": "CA/QC/East Hereford"
  },
  {
    "label": "Eastman",
    "value": "CA/QC/Eastman"
  },
  {
    "label": "Farnham",
    "value": "CA/QC/Farnham"
  },
  {
    "label": "Frelighsburg",
    "value": "CA/QC/Frelighsburg"
  },
  {
    "label": "Frontenac",
    "value": "CA/QC/Frontenac"
  },
  {
    "label": "Georgeville",
    "value": "CA/QC/Georgeville"
  },
  {
    "label": "Granby",
    "value": "CA/QC/Granby"
  },
  {
    "label": "Ham-Sud",
    "value": "CA/QC/Ham-Sud"
  },
  {
    "label": "Hampden",
    "value": "CA/QC/Hampden"
  },
  {
    "label": "Hatley",
    "value": "CA/QC/Hatley"
  },
  {
    "label": "Kingsbury",
    "value": "CA/QC/Kingsbury"
  },
  {
    "label": "La Patrie",
    "value": "CA/QC/La Patrie"
  },
  {
    "label": "Lac-Brome",
    "value": "CA/QC/Lac-Brome"
  },
  {
    "label": "Lac-Drolet",
    "value": "CA/QC/Lac-Drolet"
  },
  {
    "label": "Lac-Mégantic",
    "value": "CA/QC/Lac-Mégantic"
  },
  {
    "label": "Lambton",
    "value": "CA/QC/Lambton"
  },
  {
    "label": "Lawrenceville",
    "value": "CA/QC/Lawrenceville"
  },
  {
    "label": "Lingwick",
    "value": "CA/QC/Lingwick"
  },
  {
    "label": "Magog",
    "value": "CA/QC/Magog"
  },
  {
    "label": "Mansonville",
    "value": "CA/QC/Mansonville"
  },
  {
    "label": "Marbleton",
    "value": "CA/QC/Marbleton"
  },
  {
    "label": "Maricourt",
    "value": "CA/QC/Maricourt"
  },
  {
    "label": "Marston",
    "value": "CA/QC/Marston"
  },
  {
    "label": "Martinville",
    "value": "CA/QC/Martinville"
  },
  {
    "label": "Melbourne",
    "value": "CA/QC/Melbourne"
  },
  {
    "label": "Milan",
    "value": "CA/QC/Milan"
  },
  {
    "label": "Nantes",
    "value": "CA/QC/Nantes"
  },
  {
    "label": "Newport",
    "value": "CA/QC/Newport"
  },
  {
    "label": "North Hatley",
    "value": "CA/QC/North Hatley"
  },
  {
    "label": "Notre-Dame-De-Stanbridge",
    "value": "CA/QC/Notre-Dame-De-Stanbridge"
  },
  {
    "label": "Notre-Dame-Des-Bois",
    "value": "CA/QC/Notre-Dame-Des-Bois"
  },
  {
    "label": "Ogden",
    "value": "CA/QC/Ogden"
  },
  {
    "label": "Omerville",
    "value": "CA/QC/Omerville"
  },
  {
    "label": "Orford",
    "value": "CA/QC/Orford"
  },
  {
    "label": "Pike River",
    "value": "CA/QC/Pike River"
  },
  {
    "label": "Piopolis",
    "value": "CA/QC/Piopolis"
  },
  {
    "label": "Potton",
    "value": "CA/QC/Potton"
  },
  {
    "label": "Racine",
    "value": "CA/QC/Racine"
  },
  {
    "label": "Richmond",
    "value": "CA/QC/Richmond"
  },
  {
    "label": "Roxton Pond",
    "value": "CA/QC/Roxton Pond"
  },
  {
    "label": "Saint-Adrien",
    "value": "CA/QC/Saint-Adrien"
  },
  {
    "label": "Saint-Alphonse-De-Granby",
    "value": "CA/QC/Saint-Alphonse-De-Granby"
  },
  {
    "label": "Saint-Armand",
    "value": "CA/QC/Saint-Armand"
  },
  {
    "label": "Saint-Augustin-De-Woburn",
    "value": "CA/QC/Saint-Augustin-De-Woburn"
  },
  {
    "label": "Saint-Benoît-Du-Lac",
    "value": "CA/QC/Saint-Benoît-Du-Lac"
  },
  {
    "label": "Saint-Camille",
    "value": "CA/QC/Saint-Camille"
  },
  {
    "label": "Saint-Claude",
    "value": "CA/QC/Saint-Claude"
  },
  {
    "label": "Saint-Denis-De-Brompton",
    "value": "CA/QC/Saint-Denis-De-Brompton"
  },
  {
    "label": "Saint-Étienne-De-Bolton",
    "value": "CA/QC/Saint-Étienne-De-Bolton"
  },
  {
    "label": "Saint-François-Xavier-Brompton",
    "value": "CA/QC/Saint-François-Xavier-Brompton"
  },
  {
    "label": "Saint-Georges-De-Windsor",
    "value": "CA/QC/Saint-Georges-De-Windsor"
  },
  {
    "label": "Saint-Herménégilde",
    "value": "CA/QC/Saint-Herménégilde"
  },
  {
    "label": "Saint-Ignace-De-Stanbridge",
    "value": "CA/QC/Saint-Ignace-De-Stanbridge"
  },
  {
    "label": "Saint-Isidore-De-Clifton",
    "value": "CA/QC/Saint-Isidore-De-Clifton"
  },
  {
    "label": "Saint-Joachim-De-Shefford",
    "value": "CA/QC/Saint-Joachim-De-Shefford"
  },
  {
    "label": "Saint-Ludger",
    "value": "CA/QC/Saint-Ludger"
  },
  {
    "label": "Saint-Malo",
    "value": "CA/QC/Saint-Malo"
  },
  {
    "label": "Saint-Robert-Bellarmin",
    "value": "CA/QC/Saint-Robert-Bellarmin"
  },
  {
    "label": "Saint-Romain",
    "value": "CA/QC/Saint-Romain"
  },
  {
    "label": "Saint-Sébastien",
    "value": "CA/QC/Saint-Sébastien"
  },
  {
    "label": "Saint-Venant-De-Paquette",
    "value": "CA/QC/Saint-Venant-De-Paquette"
  },
  {
    "label": "Sainte-Anne-De-La-Rochelle",
    "value": "CA/QC/Sainte-Anne-De-La-Rochelle"
  },
  {
    "label": "Sainte-Catherine-De-Hatley",
    "value": "CA/QC/Sainte-Catherine-De-Hatley"
  },
  {
    "label": "Sainte-Cécile-De-Milton",
    "value": "CA/QC/Sainte-Cécile-De-Milton"
  },
  {
    "label": "Sainte-Cécile-De-Whitton",
    "value": "CA/QC/Sainte-Cécile-De-Whitton"
  },
  {
    "label": "Sainte-Edwidge-De-Clifton",
    "value": "CA/QC/Sainte-Edwidge-De-Clifton"
  },
  {
    "label": "Sawyerville",
    "value": "CA/QC/Sawyerville"
  },
  {
    "label": "Scotstown",
    "value": "CA/QC/Scotstown"
  },
  {
    "label": "Shefford",
    "value": "CA/QC/Shefford"
  },
  {
    "label": "Sherbrooke",
    "value": "CA/QC/Sherbrooke"
  },
  {
    "label": "Stanbridge East",
    "value": "CA/QC/Stanbridge East"
  },
  {
    "label": "Stanbridge Station",
    "value": "CA/QC/Stanbridge Station"
  },
  {
    "label": "Stanhope",
    "value": "CA/QC/Stanhope"
  },
  {
    "label": "Stanstead",
    "value": "CA/QC/Stanstead"
  },
  {
    "label": "Stanstead-Est",
    "value": "CA/QC/Stanstead-Est"
  },
  {
    "label": "Stoke",
    "value": "CA/QC/Stoke"
  },
  {
    "label": "Stornoway",
    "value": "CA/QC/Stornoway"
  },
  {
    "label": "Stratford",
    "value": "CA/QC/Stratford"
  },
  {
    "label": "Stukely-Sud",
    "value": "CA/QC/Stukely-Sud"
  },
  {
    "label": "Sutton",
    "value": "CA/QC/Sutton"
  },
  {
    "label": "Ulverton",
    "value": "CA/QC/Ulverton"
  },
  {
    "label": "Val-Joli",
    "value": "CA/QC/Val-Joli"
  },
  {
    "label": "Val-Racine",
    "value": "CA/QC/Val-Racine"
  },
  {
    "label": "Valcourt",
    "value": "CA/QC/Valcourt"
  },
  {
    "label": "Warden",
    "value": "CA/QC/Warden"
  },
  {
    "label": "Waterloo",
    "value": "CA/QC/Waterloo"
  },
  {
    "label": "Waterville",
    "value": "CA/QC/Waterville"
  },
  {
    "label": "Weedon",
    "value": "CA/QC/Weedon"
  },
  {
    "label": "Westbury",
    "value": "CA/QC/Westbury"
  },
  {
    "label": "Windsor",
    "value": "CA/QC/Windsor"
  },
  {
    "label": "Wotton",
    "value": "CA/QC/Wotton"
  },
  {
    "label": "Barachois",
    "value": "CA/QC/Barachois"
  },
  {
    "label": "Bassin",
    "value": "CA/QC/Bassin"
  },
  {
    "label": "Bonaventure",
    "value": "CA/QC/Bonaventure"
  },
  {
    "label": "Cap-Au-Renard",
    "value": "CA/QC/Cap-Au-Renard"
  },
  {
    "label": "Cap-Aux-Meules",
    "value": "CA/QC/Cap-Aux-Meules"
  },
  {
    "label": "Cap-Chat",
    "value": "CA/QC/Cap-Chat"
  },
  {
    "label": "Cap-Chat-Est",
    "value": "CA/QC/Cap-Chat-Est"
  },
  {
    "label": "Cap-D'espoir",
    "value": "CA/QC/Cap-D'espoir"
  },
  {
    "label": "Caplan",
    "value": "CA/QC/Caplan"
  },
  {
    "label": "Capucins",
    "value": "CA/QC/Capucins"
  },
  {
    "label": "Carleton",
    "value": "CA/QC/Carleton"
  },
  {
    "label": "Carleton-Sur-Mer",
    "value": "CA/QC/Carleton-Sur-Mer"
  },
  {
    "label": "Cascapédia-Saint-Jules",
    "value": "CA/QC/Cascapédia-Saint-Jules"
  },
  {
    "label": "Chandler",
    "value": "CA/QC/Chandler"
  },
  {
    "label": "Cloridorme",
    "value": "CA/QC/Cloridorme"
  },
  {
    "label": "Escuminac",
    "value": "CA/QC/Escuminac"
  },
  {
    "label": "Fatima",
    "value": "CA/QC/Fatima"
  },
  {
    "label": "Gascons",
    "value": "CA/QC/Gascons"
  },
  {
    "label": "Gaspé",
    "value": "CA/QC/Gaspé"
  },
  {
    "label": "Gesgapegiag",
    "value": "CA/QC/Gesgapegiag"
  },
  {
    "label": "Gespeg",
    "value": "CA/QC/Gespeg"
  },
  {
    "label": "Grande-Entrée",
    "value": "CA/QC/Grande-Entrée"
  },
  {
    "label": "Grande-Rivière",
    "value": "CA/QC/Grande-Rivière"
  },
  {
    "label": "Grande-Rivière-Ouest",
    "value": "CA/QC/Grande-Rivière-Ouest"
  },
  {
    "label": "Grande-Vallée",
    "value": "CA/QC/Grande-Vallée"
  },
  {
    "label": "Gros-Morne",
    "value": "CA/QC/Gros-Morne"
  },
  {
    "label": "Grosse-Île",
    "value": "CA/QC/Grosse-Île"
  },
  {
    "label": "Havre-Aubert",
    "value": "CA/QC/Havre-Aubert"
  },
  {
    "label": "Havre-Aux-Maisons",
    "value": "CA/QC/Havre-Aux-Maisons"
  },
  {
    "label": "Hope",
    "value": "CA/QC/Hope"
  },
  {
    "label": "Hope Town",
    "value": "CA/QC/Hope Town"
  },
  {
    "label": "La Martre",
    "value": "CA/QC/La Martre"
  },
  {
    "label": "L'alverne",
    "value": "CA/QC/L'alverne"
  },
  {
    "label": "L'anse-Pleureuse",
    "value": "CA/QC/L'anse-Pleureuse"
  },
  {
    "label": "L'ascension-De-Patapédia",
    "value": "CA/QC/L'ascension-De-Patapédia"
  },
  {
    "label": "Les Îles-De-La-Madeleine",
    "value": "CA/QC/Les Îles-De-La-Madeleine"
  },
  {
    "label": "L'etang-Du-Nord",
    "value": "CA/QC/L'etang-Du-Nord"
  },
  {
    "label": "L'ile-D'entree",
    "value": "CA/QC/L'ile-D'entree"
  },
  {
    "label": "Listuguj",
    "value": "CA/QC/Listuguj"
  },
  {
    "label": "Madeleine-Centre",
    "value": "CA/QC/Madeleine-Centre"
  },
  {
    "label": "Manche-D'epee",
    "value": "CA/QC/Manche-D'epee"
  },
  {
    "label": "Maria",
    "value": "CA/QC/Maria"
  },
  {
    "label": "Marsoui",
    "value": "CA/QC/Marsoui"
  },
  {
    "label": "Mont-Louis",
    "value": "CA/QC/Mont-Louis"
  },
  {
    "label": "Mont-Saint-Pierre",
    "value": "CA/QC/Mont-Saint-Pierre"
  },
  {
    "label": "Murdochville",
    "value": "CA/QC/Murdochville"
  },
  {
    "label": "New Carlisle",
    "value": "CA/QC/New Carlisle"
  },
  {
    "label": "New Richmond",
    "value": "CA/QC/New Richmond"
  },
  {
    "label": "Nouvelle",
    "value": "CA/QC/Nouvelle"
  },
  {
    "label": "Nouvelle-Ouest",
    "value": "CA/QC/Nouvelle-Ouest"
  },
  {
    "label": "Pabos",
    "value": "CA/QC/Pabos"
  },
  {
    "label": "Pabos Mills",
    "value": "CA/QC/Pabos Mills"
  },
  {
    "label": "Paspébiac",
    "value": "CA/QC/Paspébiac"
  },
  {
    "label": "Percé",
    "value": "CA/QC/Percé"
  },
  {
    "label": "Petite-Vallée",
    "value": "CA/QC/Petite-Vallée"
  },
  {
    "label": "Pointe-À-La-Croix",
    "value": "CA/QC/Pointe-À-La-Croix"
  },
  {
    "label": "Pointe-À-La-Garde",
    "value": "CA/QC/Pointe-À-La-Garde"
  },
  {
    "label": "Pointe-Aux-Loups",
    "value": "CA/QC/Pointe-Aux-Loups"
  },
  {
    "label": "Port-Daniel",
    "value": "CA/QC/Port-Daniel"
  },
  {
    "label": "Port-Daniel-Gascons",
    "value": "CA/QC/Port-Daniel-Gascons"
  },
  {
    "label": "Ristigouche-Partie-Sud-Est",
    "value": "CA/QC/Ristigouche-Partie-Sud-Est"
  },
  {
    "label": "Rivière-À-Claude",
    "value": "CA/QC/Rivière-À-Claude"
  },
  {
    "label": "Rivière-Madeleine",
    "value": "CA/QC/Rivière-Madeleine"
  },
  {
    "label": "Rivière-Paspébiac",
    "value": "CA/QC/Rivière-Paspébiac"
  },
  {
    "label": "Ruisseau-À-Rebours",
    "value": "CA/QC/Ruisseau-À-Rebours"
  },
  {
    "label": "Saint-Alexis-De-Matapédia",
    "value": "CA/QC/Saint-Alexis-De-Matapédia"
  },
  {
    "label": "Saint-Alphonse",
    "value": "CA/QC/Saint-Alphonse"
  },
  {
    "label": "Saint-André-De-Restigouche",
    "value": "CA/QC/Saint-André-De-Restigouche"
  },
  {
    "label": "Saint-François-D'assise",
    "value": "CA/QC/Saint-François-D'assise"
  },
  {
    "label": "Saint-Georges-De-Malbaie",
    "value": "CA/QC/Saint-Georges-De-Malbaie"
  },
  {
    "label": "Saint-Godefroi",
    "value": "CA/QC/Saint-Godefroi"
  },
  {
    "label": "Saint-Jean-De-Matapédia",
    "value": "CA/QC/Saint-Jean-De-Matapédia"
  },
  {
    "label": "Saint-Jogues",
    "value": "CA/QC/Saint-Jogues"
  },
  {
    "label": "Saint-Maxime-Du-Mont-Louis",
    "value": "CA/QC/Saint-Maxime-Du-Mont-Louis"
  },
  {
    "label": "Saint-René-De-Matane",
    "value": "CA/QC/Saint-René-De-Matane"
  },
  {
    "label": "Sainte-Anne-Des-Monts",
    "value": "CA/QC/Sainte-Anne-Des-Monts"
  },
  {
    "label": "Sainte-Madeleine-De-La-Rivière-Madeleine",
    "value": "CA/QC/Sainte-Madeleine-De-La-Rivière-Madeleine"
  },
  {
    "label": "Sainte-Thérèse-De-Gaspé",
    "value": "CA/QC/Sainte-Thérèse-De-Gaspé"
  },
  {
    "label": "Shigawake",
    "value": "CA/QC/Shigawake"
  },
  {
    "label": "Val-D'espoir",
    "value": "CA/QC/Val-D'espoir"
  },
  {
    "label": "Berthierville",
    "value": "CA/QC/Berthierville"
  },
  {
    "label": "Charlemagne",
    "value": "CA/QC/Charlemagne"
  },
  {
    "label": "Chertsey",
    "value": "CA/QC/Chertsey"
  },
  {
    "label": "Crabtree",
    "value": "CA/QC/Crabtree"
  },
  {
    "label": "Entrelacs",
    "value": "CA/QC/Entrelacs"
  },
  {
    "label": "Joliette",
    "value": "CA/QC/Joliette"
  },
  {
    "label": "La Visitation-De-L'île-Dupas",
    "value": "CA/QC/La Visitation-De-L'île-Dupas"
  },
  {
    "label": "Lanoraie",
    "value": "CA/QC/Lanoraie"
  },
  {
    "label": "L'assomption",
    "value": "CA/QC/L'assomption"
  },
  {
    "label": "Lavaltrie",
    "value": "CA/QC/Lavaltrie"
  },
  {
    "label": "L'épiphanie",
    "value": "CA/QC/L'épiphanie"
  },
  {
    "label": "Manawan",
    "value": "CA/QC/Manawan"
  },
  {
    "label": "Mandeville",
    "value": "CA/QC/Mandeville"
  },
  {
    "label": "Mascouche",
    "value": "CA/QC/Mascouche"
  },
  {
    "label": "Notre-Dame-De-La-Merci",
    "value": "CA/QC/Notre-Dame-De-La-Merci"
  },
  {
    "label": "Notre-Dame-Des-Prairies",
    "value": "CA/QC/Notre-Dame-Des-Prairies"
  },
  {
    "label": "Rawdon",
    "value": "CA/QC/Rawdon"
  },
  {
    "label": "Repentigny",
    "value": "CA/QC/Repentigny"
  },
  {
    "label": "Saint-Alexis",
    "value": "CA/QC/Saint-Alexis"
  },
  {
    "label": "Saint-Alphonse-Rodriguez",
    "value": "CA/QC/Saint-Alphonse-Rodriguez"
  },
  {
    "label": "Saint-Ambroise-De-Kildare",
    "value": "CA/QC/Saint-Ambroise-De-Kildare"
  },
  {
    "label": "Saint-Barthélemy",
    "value": "CA/QC/Saint-Barthélemy"
  },
  {
    "label": "Saint-Calixte",
    "value": "CA/QC/Saint-Calixte"
  },
  {
    "label": "Saint-Charles-Borromée",
    "value": "CA/QC/Saint-Charles-Borromée"
  },
  {
    "label": "Saint-Cléophas-De-Brandon",
    "value": "CA/QC/Saint-Cléophas-De-Brandon"
  },
  {
    "label": "Saint-Côme",
    "value": "CA/QC/Saint-Côme"
  },
  {
    "label": "Saint-Cuthbert",
    "value": "CA/QC/Saint-Cuthbert"
  },
  {
    "label": "Saint-Damien",
    "value": "CA/QC/Saint-Damien"
  },
  {
    "label": "Saint-Didace",
    "value": "CA/QC/Saint-Didace"
  },
  {
    "label": "Saint-Esprit",
    "value": "CA/QC/Saint-Esprit"
  },
  {
    "label": "Saint-Félix-De-Valois",
    "value": "CA/QC/Saint-Félix-De-Valois"
  },
  {
    "label": "Saint-Gabriel",
    "value": "CA/QC/Saint-Gabriel"
  },
  {
    "label": "Saint-Gabriel-De-Brandon",
    "value": "CA/QC/Saint-Gabriel-De-Brandon"
  },
  {
    "label": "Saint-Ignace-De-Loyola",
    "value": "CA/QC/Saint-Ignace-De-Loyola"
  },
  {
    "label": "Saint-Jacques",
    "value": "CA/QC/Saint-Jacques"
  },
  {
    "label": "Saint-Jean-De-Matha",
    "value": "CA/QC/Saint-Jean-De-Matha"
  },
  {
    "label": "Saint-Liguori",
    "value": "CA/QC/Saint-Liguori"
  },
  {
    "label": "Saint-Lin-Laurentides",
    "value": "CA/QC/Saint-Lin-Laurentides"
  },
  {
    "label": "Saint-Michel-Des-Saints",
    "value": "CA/QC/Saint-Michel-Des-Saints"
  },
  {
    "label": "Saint-Norbert",
    "value": "CA/QC/Saint-Norbert"
  },
  {
    "label": "Saint-Paul",
    "value": "CA/QC/Saint-Paul"
  },
  {
    "label": "Saint-Pierre",
    "value": "CA/QC/Saint-Pierre"
  },
  {
    "label": "Saint-Roch-De-L'achigan",
    "value": "CA/QC/Saint-Roch-De-L'achigan"
  },
  {
    "label": "Saint-Roch-Ouest",
    "value": "CA/QC/Saint-Roch-Ouest"
  },
  {
    "label": "Saint-Sulpice",
    "value": "CA/QC/Saint-Sulpice"
  },
  {
    "label": "Saint-Thomas",
    "value": "CA/QC/Saint-Thomas"
  },
  {
    "label": "Saint-Zénon",
    "value": "CA/QC/Saint-Zénon"
  },
  {
    "label": "Sainte-Béatrix",
    "value": "CA/QC/Sainte-Béatrix"
  },
  {
    "label": "Sainte-Élisabeth",
    "value": "CA/QC/Sainte-Élisabeth"
  },
  {
    "label": "Sainte-Émélie-De-L'énergie",
    "value": "CA/QC/Sainte-Émélie-De-L'énergie"
  },
  {
    "label": "Sainte-Geneviève-De-Berthier",
    "value": "CA/QC/Sainte-Geneviève-De-Berthier"
  },
  {
    "label": "Sainte-Julienne",
    "value": "CA/QC/Sainte-Julienne"
  },
  {
    "label": "Sainte-Marcelline-De-Kildare",
    "value": "CA/QC/Sainte-Marcelline-De-Kildare"
  },
  {
    "label": "Sainte-Marie-Salomé",
    "value": "CA/QC/Sainte-Marie-Salomé"
  },
  {
    "label": "Sainte-Mélanie",
    "value": "CA/QC/Sainte-Mélanie"
  },
  {
    "label": "Terrebonne",
    "value": "CA/QC/Terrebonne"
  },
  {
    "label": "Amherst",
    "value": "CA/QC/Amherst"
  },
  {
    "label": "Arundel",
    "value": "CA/QC/Arundel"
  },
  {
    "label": "Barkmere",
    "value": "CA/QC/Barkmere"
  },
  {
    "label": "Blainville",
    "value": "CA/QC/Blainville"
  },
  {
    "label": "Bois-Des-Filion",
    "value": "CA/QC/Bois-Des-Filion"
  },
  {
    "label": "Boisbriand",
    "value": "CA/QC/Boisbriand"
  },
  {
    "label": "Brébeuf",
    "value": "CA/QC/Brébeuf"
  },
  {
    "label": "Brownsburg-Chatham",
    "value": "CA/QC/Brownsburg-Chatham"
  },
  {
    "label": "Chute-Saint-Philippe",
    "value": "CA/QC/Chute-Saint-Philippe"
  },
  {
    "label": "Deux-Montagnes",
    "value": "CA/QC/Deux-Montagnes"
  },
  {
    "label": "Estérel",
    "value": "CA/QC/Estérel"
  },
  {
    "label": "Ferme-Neuve",
    "value": "CA/QC/Ferme-Neuve"
  },
  {
    "label": "Gore",
    "value": "CA/QC/Gore"
  },
  {
    "label": "Grenville",
    "value": "CA/QC/Grenville"
  },
  {
    "label": "Grenville-Sur-La-Rouge",
    "value": "CA/QC/Grenville-Sur-La-Rouge"
  },
  {
    "label": "Harrington",
    "value": "CA/QC/Harrington"
  },
  {
    "label": "Huberdeau",
    "value": "CA/QC/Huberdeau"
  },
  {
    "label": "Ivry-Sur-Le-Lac",
    "value": "CA/QC/Ivry-Sur-Le-Lac"
  },
  {
    "label": "Kanesatake",
    "value": "CA/QC/Kanesatake"
  },
  {
    "label": "Kiamika",
    "value": "CA/QC/Kiamika"
  },
  {
    "label": "La Conception",
    "value": "CA/QC/La Conception"
  },
  {
    "label": "La Macaza",
    "value": "CA/QC/La Macaza"
  },
  {
    "label": "La Minerve",
    "value": "CA/QC/La Minerve"
  },
  {
    "label": "Labelle",
    "value": "CA/QC/Labelle"
  },
  {
    "label": "Lac-Des-Écorces",
    "value": "CA/QC/Lac-Des-Écorces"
  },
  {
    "label": "Lac-Des-Seize-Îles",
    "value": "CA/QC/Lac-Des-Seize-Îles"
  },
  {
    "label": "Lac-Du-Cerf",
    "value": "CA/QC/Lac-Du-Cerf"
  },
  {
    "label": "Lac-Saguay",
    "value": "CA/QC/Lac-Saguay"
  },
  {
    "label": "Lac-Saint-Paul",
    "value": "CA/QC/Lac-Saint-Paul"
  },
  {
    "label": "Lac-Supérieur",
    "value": "CA/QC/Lac-Supérieur"
  },
  {
    "label": "Lac-Tremblant-Nord",
    "value": "CA/QC/Lac-Tremblant-Nord"
  },
  {
    "label": "Lachute",
    "value": "CA/QC/Lachute"
  },
  {
    "label": "Lantier",
    "value": "CA/QC/Lantier"
  },
  {
    "label": "L'ascension",
    "value": "CA/QC/L'ascension"
  },
  {
    "label": "Lorraine",
    "value": "CA/QC/Lorraine"
  },
  {
    "label": "Mille-Isles",
    "value": "CA/QC/Mille-Isles"
  },
  {
    "label": "Mirabel",
    "value": "CA/QC/Mirabel"
  },
  {
    "label": "Mont-Laurier",
    "value": "CA/QC/Mont-Laurier"
  },
  {
    "label": "Mont-Saint-Michel",
    "value": "CA/QC/Mont-Saint-Michel"
  },
  {
    "label": "Mont-Tremblant",
    "value": "CA/QC/Mont-Tremblant"
  },
  {
    "label": "Montcalm",
    "value": "CA/QC/Montcalm"
  },
  {
    "label": "Morin-Heights",
    "value": "CA/QC/Morin-Heights"
  },
  {
    "label": "Nominingue",
    "value": "CA/QC/Nominingue"
  },
  {
    "label": "Notre-Dame-De-Pontmain",
    "value": "CA/QC/Notre-Dame-De-Pontmain"
  },
  {
    "label": "Notre-Dame-Du-Laus",
    "value": "CA/QC/Notre-Dame-Du-Laus"
  },
  {
    "label": "Oka",
    "value": "CA/QC/Oka"
  },
  {
    "label": "Piedmont",
    "value": "CA/QC/Piedmont"
  },
  {
    "label": "Pointe-Calumet",
    "value": "CA/QC/Pointe-Calumet"
  },
  {
    "label": "Prévost",
    "value": "CA/QC/Prévost"
  },
  {
    "label": "Rivière-Rouge",
    "value": "CA/QC/Rivière-Rouge"
  },
  {
    "label": "Rosemère",
    "value": "CA/QC/Rosemère"
  },
  {
    "label": "Saint-Adolphe-D'howard",
    "value": "CA/QC/Saint-Adolphe-D'howard"
  },
  {
    "label": "Saint-Aimé-Du-Lac-Des-Îles",
    "value": "CA/QC/Saint-Aimé-Du-Lac-Des-Îles"
  },
  {
    "label": "Saint-André-D'argenteuil",
    "value": "CA/QC/Saint-André-D'argenteuil"
  },
  {
    "label": "Saint-Colomban",
    "value": "CA/QC/Saint-Colomban"
  },
  {
    "label": "Saint-Eustache",
    "value": "CA/QC/Saint-Eustache"
  },
  {
    "label": "Saint-Faustin-Lac-Carré",
    "value": "CA/QC/Saint-Faustin-Lac-Carré"
  },
  {
    "label": "Saint-Hippolyte",
    "value": "CA/QC/Saint-Hippolyte"
  },
  {
    "label": "Saint-Jérôme",
    "value": "CA/QC/Saint-Jérôme"
  },
  {
    "label": "Saint-Joseph-Du-Lac",
    "value": "CA/QC/Saint-Joseph-Du-Lac"
  },
  {
    "label": "Saint-Placide",
    "value": "CA/QC/Saint-Placide"
  },
  {
    "label": "Saint-Sauveur",
    "value": "CA/QC/Saint-Sauveur"
  },
  {
    "label": "Sainte-Adèle",
    "value": "CA/QC/Sainte-Adèle"
  },
  {
    "label": "Sainte-Agathe-Des-Monts",
    "value": "CA/QC/Sainte-Agathe-Des-Monts"
  },
  {
    "label": "Sainte-Anne-Des-Lacs",
    "value": "CA/QC/Sainte-Anne-Des-Lacs"
  },
  {
    "label": "Sainte-Anne-Des-Plaines",
    "value": "CA/QC/Sainte-Anne-Des-Plaines"
  },
  {
    "label": "Sainte-Anne-Des-Plaintes",
    "value": "CA/QC/Sainte-Anne-Des-Plaintes"
  },
  {
    "label": "Sainte-Anne-Du-Lac",
    "value": "CA/QC/Sainte-Anne-Du-Lac"
  },
  {
    "label": "Sainte-Lucie-Des-Laurentides",
    "value": "CA/QC/Sainte-Lucie-Des-Laurentides"
  },
  {
    "label": "Sainte-Marguerite-Du-Lac-Masson",
    "value": "CA/QC/Sainte-Marguerite-Du-Lac-Masson"
  },
  {
    "label": "Sainte-Marthe-Sur-Le-Lac",
    "value": "CA/QC/Sainte-Marthe-Sur-Le-Lac"
  },
  {
    "label": "Sainte-Sophie",
    "value": "CA/QC/Sainte-Sophie"
  },
  {
    "label": "Sainte-Thérèse",
    "value": "CA/QC/Sainte-Thérèse"
  },
  {
    "label": "Ste-Adèle",
    "value": "CA/QC/Ste-Adèle"
  },
  {
    "label": "Val-David",
    "value": "CA/QC/Val-David"
  },
  {
    "label": "Val-Des-Lacs",
    "value": "CA/QC/Val-Des-Lacs"
  },
  {
    "label": "Val-Morin",
    "value": "CA/QC/Val-Morin"
  },
  {
    "label": "Wentworth",
    "value": "CA/QC/Wentworth"
  },
  {
    "label": "Wentworth-Nord",
    "value": "CA/QC/Wentworth-Nord"
  },
  {
    "label": "Auteuil",
    "value": "CA/QC/Auteuil"
  },
  {
    "label": "Chomedey",
    "value": "CA/QC/Chomedey"
  },
  {
    "label": "Duvernay",
    "value": "CA/QC/Duvernay"
  },
  {
    "label": "Fabreville",
    "value": "CA/QC/Fabreville"
  },
  {
    "label": "Îles-Laval",
    "value": "CA/QC/Îles-Laval"
  },
  {
    "label": "Laval",
    "value": "CA/QC/Laval"
  },
  {
    "label": "Laval-Des-Rapides",
    "value": "CA/QC/Laval-Des-Rapides"
  },
  {
    "label": "Laval-Ouest",
    "value": "CA/QC/Laval-Ouest"
  },
  {
    "label": "Laval-Sur-Le-Lac",
    "value": "CA/QC/Laval-Sur-Le-Lac"
  },
  {
    "label": "Pont-Viau",
    "value": "CA/QC/Pont-Viau"
  },
  {
    "label": "Saint-François",
    "value": "CA/QC/Saint-François"
  },
  {
    "label": "Saint-Vincent-De-Paul",
    "value": "CA/QC/Saint-Vincent-De-Paul"
  },
  {
    "label": "Sainte-Dorothée",
    "value": "CA/QC/Sainte-Dorothée"
  },
  {
    "label": "Sainte-Rose",
    "value": "CA/QC/Sainte-Rose"
  },
  {
    "label": "Vimont",
    "value": "CA/QC/Vimont"
  },
  {
    "label": "Saint-Hubert",
    "value": "CA/QC/Saint-Hubert"
  },
  {
    "label": "Batiscan",
    "value": "CA/QC/Batiscan"
  },
  {
    "label": "Champlain",
    "value": "CA/QC/Champlain"
  },
  {
    "label": "Charette",
    "value": "CA/QC/Charette"
  },
  {
    "label": "Clova",
    "value": "CA/QC/Clova"
  },
  {
    "label": "Grand-Mère",
    "value": "CA/QC/Grand-Mère"
  },
  {
    "label": "Grandes-Piles",
    "value": "CA/QC/Grandes-Piles"
  },
  {
    "label": "Hérouxville",
    "value": "CA/QC/Hérouxville"
  },
  {
    "label": "La Bostonnais",
    "value": "CA/QC/La Bostonnais"
  },
  {
    "label": "La Croche",
    "value": "CA/QC/La Croche"
  },
  {
    "label": "La Tuque",
    "value": "CA/QC/La Tuque"
  },
  {
    "label": "Lac-À-La-Tortue",
    "value": "CA/QC/Lac-À-La-Tortue"
  },
  {
    "label": "Lac-Aux-Sables",
    "value": "CA/QC/Lac-Aux-Sables"
  },
  {
    "label": "Lac-Édouard",
    "value": "CA/QC/Lac-Édouard"
  },
  {
    "label": "Louiseville",
    "value": "CA/QC/Louiseville"
  },
  {
    "label": "Maskinongé",
    "value": "CA/QC/Maskinongé"
  },
  {
    "label": "Notre-Dame-De-Montauban",
    "value": "CA/QC/Notre-Dame-De-Montauban"
  },
  {
    "label": "Notre-Dame-Du-Mont-Carmel",
    "value": "CA/QC/Notre-Dame-Du-Mont-Carmel"
  },
  {
    "label": "Obedjiwan",
    "value": "CA/QC/Obedjiwan"
  },
  {
    "label": "Parent",
    "value": "CA/QC/Parent"
  },
  {
    "label": "Proulxville",
    "value": "CA/QC/Proulxville"
  },
  {
    "label": "Rivière-Mékinac",
    "value": "CA/QC/Rivière-Mékinac"
  },
  {
    "label": "Saint-Adelphe",
    "value": "CA/QC/Saint-Adelphe"
  },
  {
    "label": "Saint-Alexis-Des-Monts",
    "value": "CA/QC/Saint-Alexis-Des-Monts"
  },
  {
    "label": "Saint-Barnabé",
    "value": "CA/QC/Saint-Barnabé"
  },
  {
    "label": "Saint-Boniface",
    "value": "CA/QC/Saint-Boniface"
  },
  {
    "label": "Saint-Édouard-De-Maskinongé",
    "value": "CA/QC/Saint-Édouard-De-Maskinongé"
  },
  {
    "label": "Saint-Élie-De-Caxton",
    "value": "CA/QC/Saint-Élie-De-Caxton"
  },
  {
    "label": "Saint-Étienne-Des-Grès",
    "value": "CA/QC/Saint-Étienne-Des-Grès"
  },
  {
    "label": "Saint-Gérard-Des-Laurentides",
    "value": "CA/QC/Saint-Gérard-Des-Laurentides"
  },
  {
    "label": "Saint-Jean-Des-Piles",
    "value": "CA/QC/Saint-Jean-Des-Piles"
  },
  {
    "label": "Saint-Justin",
    "value": "CA/QC/Saint-Justin"
  },
  {
    "label": "Saint-Luc-De-Vincennes",
    "value": "CA/QC/Saint-Luc-De-Vincennes"
  },
  {
    "label": "Saint-Mathieu-Du-Parc",
    "value": "CA/QC/Saint-Mathieu-Du-Parc"
  },
  {
    "label": "Saint-Maurice",
    "value": "CA/QC/Saint-Maurice"
  },
  {
    "label": "Saint-Paulin",
    "value": "CA/QC/Saint-Paulin"
  },
  {
    "label": "Saint-Prosper-De-Champlain",
    "value": "CA/QC/Saint-Prosper-De-Champlain"
  },
  {
    "label": "Saint-Roch-De-Mékinac",
    "value": "CA/QC/Saint-Roch-De-Mékinac"
  },
  {
    "label": "Saint-Sévère",
    "value": "CA/QC/Saint-Sévère"
  },
  {
    "label": "Saint-Stanislas",
    "value": "CA/QC/Saint-Stanislas"
  },
  {
    "label": "Saint-Tite",
    "value": "CA/QC/Saint-Tite"
  },
  {
    "label": "Sainte-Angèle-De-Prémont",
    "value": "CA/QC/Sainte-Angèle-De-Prémont"
  },
  {
    "label": "Sainte-Anne-De-La-Pérade",
    "value": "CA/QC/Sainte-Anne-De-La-Pérade"
  },
  {
    "label": "Sainte-Geneviève-De-Batiscan",
    "value": "CA/QC/Sainte-Geneviève-De-Batiscan"
  },
  {
    "label": "Sainte-Thècle",
    "value": "CA/QC/Sainte-Thècle"
  },
  {
    "label": "Sainte-Ursule",
    "value": "CA/QC/Sainte-Ursule"
  },
  {
    "label": "Shawinigan",
    "value": "CA/QC/Shawinigan"
  },
  {
    "label": "Shawinigan-Sud",
    "value": "CA/QC/Shawinigan-Sud"
  },
  {
    "label": "Trois-Rives",
    "value": "CA/QC/Trois-Rives"
  },
  {
    "label": "Trois-Rivières",
    "value": "CA/QC/Trois-Rivières"
  },
  {
    "label": "Valcartier Bpm 210",
    "value": "CA/QC/Valcartier Bpm 210"
  },
  {
    "label": "Wemotaci",
    "value": "CA/QC/Wemotaci"
  },
  {
    "label": "Yamachiche",
    "value": "CA/QC/Yamachiche"
  },
  {
    "label": "Acton Vale",
    "value": "CA/QC/Acton Vale"
  },
  {
    "label": "Akwesasne",
    "value": "CA/QC/Akwesasne"
  },
  {
    "label": "Ange-Gardien",
    "value": "CA/QC/Ange-Gardien"
  },
  {
    "label": "Beauharnois",
    "value": "CA/QC/Beauharnois"
  },
  {
    "label": "Beloeil",
    "value": "CA/QC/Beloeil"
  },
  {
    "label": "Béthanie",
    "value": "CA/QC/Béthanie"
  },
  {
    "label": "Boucherville",
    "value": "CA/QC/Boucherville"
  },
  {
    "label": "Brossard",
    "value": "CA/QC/Brossard"
  },
  {
    "label": "Calixa-Lavallée",
    "value": "CA/QC/Calixa-Lavallée"
  },
  {
    "label": "Candiac",
    "value": "CA/QC/Candiac"
  },
  {
    "label": "Carignan",
    "value": "CA/QC/Carignan"
  },
  {
    "label": "Chambly",
    "value": "CA/QC/Chambly"
  },
  {
    "label": "Châteauguay",
    "value": "CA/QC/Châteauguay"
  },
  {
    "label": "Contrecoeur",
    "value": "CA/QC/Contrecoeur"
  },
  {
    "label": "Coteau-Du-Lac",
    "value": "CA/QC/Coteau-Du-Lac"
  },
  {
    "label": "Delson",
    "value": "CA/QC/Delson"
  },
  {
    "label": "Dundee",
    "value": "CA/QC/Dundee"
  },
  {
    "label": "Elgin",
    "value": "CA/QC/Elgin"
  },
  {
    "label": "Franklin",
    "value": "CA/QC/Franklin"
  },
  {
    "label": "Godmanchester",
    "value": "CA/QC/Godmanchester"
  },
  {
    "label": "Havelock",
    "value": "CA/QC/Havelock"
  },
  {
    "label": "Hemmingford",
    "value": "CA/QC/Hemmingford"
  },
  {
    "label": "Henryville",
    "value": "CA/QC/Henryville"
  },
  {
    "label": "Hinchinbrooke",
    "value": "CA/QC/Hinchinbrooke"
  },
  {
    "label": "Howick",
    "value": "CA/QC/Howick"
  },
  {
    "label": "Hudson",
    "value": "CA/QC/Hudson"
  },
  {
    "label": "Huntingdon",
    "value": "CA/QC/Huntingdon"
  },
  {
    "label": "Kahnawake",
    "value": "CA/QC/Kahnawake"
  },
  {
    "label": "La Prairie",
    "value": "CA/QC/La Prairie"
  },
  {
    "label": "La Présentation",
    "value": "CA/QC/La Présentation"
  },
  {
    "label": "Lacolle",
    "value": "CA/QC/Lacolle"
  },
  {
    "label": "Léry",
    "value": "CA/QC/Léry"
  },
  {
    "label": "Les Cèdres",
    "value": "CA/QC/Les Cèdres"
  },
  {
    "label": "Les Coteaux",
    "value": "CA/QC/Les Coteaux"
  },
  {
    "label": "L'île-Cadieux",
    "value": "CA/QC/L'île-Cadieux"
  },
  {
    "label": "L'île-Perrot",
    "value": "CA/QC/L'île-Perrot"
  },
  {
    "label": "Longueuil",
    "value": "CA/QC/Longueuil"
  },
  {
    "label": "Marieville",
    "value": "CA/QC/Marieville"
  },
  {
    "label": "Massueville",
    "value": "CA/QC/Massueville"
  },
  {
    "label": "Mcmasterville",
    "value": "CA/QC/Mcmasterville"
  },
  {
    "label": "Mercier",
    "value": "CA/QC/Mercier"
  },
  {
    "label": "Mont-Saint-Grégoire",
    "value": "CA/QC/Mont-Saint-Grégoire"
  },
  {
    "label": "Mont-Saint-Hilaire",
    "value": "CA/QC/Mont-Saint-Hilaire"
  },
  {
    "label": "Napierville",
    "value": "CA/QC/Napierville"
  },
  {
    "label": "Notre-Dame-De-L'île-Perrot",
    "value": "CA/QC/Notre-Dame-De-L'île-Perrot"
  },
  {
    "label": "Noyan",
    "value": "CA/QC/Noyan"
  },
  {
    "label": "Ormstown",
    "value": "CA/QC/Ormstown"
  },
  {
    "label": "Otterburn Park",
    "value": "CA/QC/Otterburn Park"
  },
  {
    "label": "Pincourt",
    "value": "CA/QC/Pincourt"
  },
  {
    "label": "Pointe-Des-Cascades",
    "value": "CA/QC/Pointe-Des-Cascades"
  },
  {
    "label": "Pointe-Fortune",
    "value": "CA/QC/Pointe-Fortune"
  },
  {
    "label": "Richelieu",
    "value": "CA/QC/Richelieu"
  },
  {
    "label": "Rigaud",
    "value": "CA/QC/Rigaud"
  },
  {
    "label": "Rivière-Beaudette",
    "value": "CA/QC/Rivière-Beaudette"
  },
  {
    "label": "Rougemont",
    "value": "CA/QC/Rougemont"
  },
  {
    "label": "Roxton",
    "value": "CA/QC/Roxton"
  },
  {
    "label": "Roxton Falls",
    "value": "CA/QC/Roxton Falls"
  },
  {
    "label": "Saint-Aimé",
    "value": "CA/QC/Saint-Aimé"
  },
  {
    "label": "Saint-Alexandre",
    "value": "CA/QC/Saint-Alexandre"
  },
  {
    "label": "Saint-Amable",
    "value": "CA/QC/Saint-Amable"
  },
  {
    "label": "Saint-Anicet",
    "value": "CA/QC/Saint-Anicet"
  },
  {
    "label": "Saint-Antoine-Sur-Richelieu",
    "value": "CA/QC/Saint-Antoine-Sur-Richelieu"
  },
  {
    "label": "Saint-Barnabé-Sud",
    "value": "CA/QC/Saint-Barnabé-Sud"
  },
  {
    "label": "Saint-Basile-Le-Grand",
    "value": "CA/QC/Saint-Basile-Le-Grand"
  },
  {
    "label": "Saint-Bernard-De-Lacolle",
    "value": "CA/QC/Saint-Bernard-De-Lacolle"
  },
  {
    "label": "Saint-Bernard-De-Michaudville",
    "value": "CA/QC/Saint-Bernard-De-Michaudville"
  },
  {
    "label": "Saint-Blaise-Sur-Richelieu",
    "value": "CA/QC/Saint-Blaise-Sur-Richelieu"
  },
  {
    "label": "Saint-Bruno-De-Montarville",
    "value": "CA/QC/Saint-Bruno-De-Montarville"
  },
  {
    "label": "Saint-Césaire",
    "value": "CA/QC/Saint-Césaire"
  },
  {
    "label": "Saint-Charles-Sur-Richelieu",
    "value": "CA/QC/Saint-Charles-Sur-Richelieu"
  },
  {
    "label": "Saint-Chrysostome",
    "value": "CA/QC/Saint-Chrysostome"
  },
  {
    "label": "Saint-Clet",
    "value": "CA/QC/Saint-Clet"
  },
  {
    "label": "Saint-Constant",
    "value": "CA/QC/Saint-Constant"
  },
  {
    "label": "Saint-Cyprien-De-Napierville",
    "value": "CA/QC/Saint-Cyprien-De-Napierville"
  },
  {
    "label": "Saint-David",
    "value": "CA/QC/Saint-David"
  },
  {
    "label": "Saint-Denis-Sur-Richelieu",
    "value": "CA/QC/Saint-Denis-Sur-Richelieu"
  },
  {
    "label": "Saint-Dominique",
    "value": "CA/QC/Saint-Dominique"
  },
  {
    "label": "Saint-Édouard",
    "value": "CA/QC/Saint-Édouard"
  },
  {
    "label": "Saint-Étienne-De-Beauharnois",
    "value": "CA/QC/Saint-Étienne-De-Beauharnois"
  },
  {
    "label": "Saint-Georges-De-Clarenceville",
    "value": "CA/QC/Saint-Georges-De-Clarenceville"
  },
  {
    "label": "Saint-Gérard-Majella",
    "value": "CA/QC/Saint-Gérard-Majella"
  },
  {
    "label": "Saint-Hugues",
    "value": "CA/QC/Saint-Hugues"
  },
  {
    "label": "Saint-Hyacinthe",
    "value": "CA/QC/Saint-Hyacinthe"
  },
  {
    "label": "Saint-Jacques-Le-Mineur",
    "value": "CA/QC/Saint-Jacques-Le-Mineur"
  },
  {
    "label": "Saint-Jean-Baptiste",
    "value": "CA/QC/Saint-Jean-Baptiste"
  },
  {
    "label": "Saint-Jean-Sur-Richelieu",
    "value": "CA/QC/Saint-Jean-Sur-Richelieu"
  },
  {
    "label": "Saint-Joseph-De-Sorel",
    "value": "CA/QC/Saint-Joseph-De-Sorel"
  },
  {
    "label": "Saint-Jude",
    "value": "CA/QC/Saint-Jude"
  },
  {
    "label": "Saint-Lazare",
    "value": "CA/QC/Saint-Lazare"
  },
  {
    "label": "Saint-Liboire",
    "value": "CA/QC/Saint-Liboire"
  },
  {
    "label": "Saint-Louis",
    "value": "CA/QC/Saint-Louis"
  },
  {
    "label": "Saint-Louis-De-Gonzague",
    "value": "CA/QC/Saint-Louis-De-Gonzague"
  },
  {
    "label": "Saint-Marc-Sur-Richelieu",
    "value": "CA/QC/Saint-Marc-Sur-Richelieu"
  },
  {
    "label": "Saint-Marcel-De-Richelieu",
    "value": "CA/QC/Saint-Marcel-De-Richelieu"
  },
  {
    "label": "Saint-Mathias-Sur-Richelieu",
    "value": "CA/QC/Saint-Mathias-Sur-Richelieu"
  },
  {
    "label": "Saint-Mathieu",
    "value": "CA/QC/Saint-Mathieu"
  },
  {
    "label": "Saint-Mathieu-De-Beloeil",
    "value": "CA/QC/Saint-Mathieu-De-Beloeil"
  },
  {
    "label": "Saint-Michel",
    "value": "CA/QC/Saint-Michel"
  },
  {
    "label": "Saint-Nazaire-D'acton",
    "value": "CA/QC/Saint-Nazaire-D'acton"
  },
  {
    "label": "Saint-Ours",
    "value": "CA/QC/Saint-Ours"
  },
  {
    "label": "Saint-Patrice-De-Sherrington",
    "value": "CA/QC/Saint-Patrice-De-Sherrington"
  },
  {
    "label": "Saint-Paul-D'abbotsford",
    "value": "CA/QC/Saint-Paul-D'abbotsford"
  },
  {
    "label": "Saint-Paul-De-L'île-Aux-Noix",
    "value": "CA/QC/Saint-Paul-De-L'île-Aux-Noix"
  },
  {
    "label": "Saint-Philippe",
    "value": "CA/QC/Saint-Philippe"
  },
  {
    "label": "Saint-Pie",
    "value": "CA/QC/Saint-Pie"
  },
  {
    "label": "Saint-Polycarpe",
    "value": "CA/QC/Saint-Polycarpe"
  },
  {
    "label": "Saint-Rémi",
    "value": "CA/QC/Saint-Rémi"
  },
  {
    "label": "Saint-Robert",
    "value": "CA/QC/Saint-Robert"
  },
  {
    "label": "Saint-Roch-De-Richelieu",
    "value": "CA/QC/Saint-Roch-De-Richelieu"
  },
  {
    "label": "Saint-Stanislas-De-Kostka",
    "value": "CA/QC/Saint-Stanislas-De-Kostka"
  },
  {
    "label": "Saint-Télesphore",
    "value": "CA/QC/Saint-Télesphore"
  },
  {
    "label": "Saint-Théodore-D'acton",
    "value": "CA/QC/Saint-Théodore-D'acton"
  },
  {
    "label": "Saint-Urbain-Premier",
    "value": "CA/QC/Saint-Urbain-Premier"
  },
  {
    "label": "Saint-Valentin",
    "value": "CA/QC/Saint-Valentin"
  },
  {
    "label": "Saint-Valérien-De-Milton",
    "value": "CA/QC/Saint-Valérien-De-Milton"
  },
  {
    "label": "Saint-Zotique",
    "value": "CA/QC/Saint-Zotique"
  },
  {
    "label": "Sainte-Angèle-De-Monnoir",
    "value": "CA/QC/Sainte-Angèle-De-Monnoir"
  },
  {
    "label": "Sainte-Anne-De-Sabrevois",
    "value": "CA/QC/Sainte-Anne-De-Sabrevois"
  },
  {
    "label": "Sainte-Anne-De-Sorel",
    "value": "CA/QC/Sainte-Anne-De-Sorel"
  },
  {
    "label": "Sainte-Barbe",
    "value": "CA/QC/Sainte-Barbe"
  },
  {
    "label": "Sainte-Brigide-D'iberville",
    "value": "CA/QC/Sainte-Brigide-D'iberville"
  },
  {
    "label": "Sainte-Catherine",
    "value": "CA/QC/Sainte-Catherine"
  },
  {
    "label": "Sainte-Christine",
    "value": "CA/QC/Sainte-Christine"
  },
  {
    "label": "Sainte-Clotilde",
    "value": "CA/QC/Sainte-Clotilde"
  },
  {
    "label": "Sainte-Hélène-De-Bagot",
    "value": "CA/QC/Sainte-Hélène-De-Bagot"
  },
  {
    "label": "Sainte-Julie",
    "value": "CA/QC/Sainte-Julie"
  },
  {
    "label": "Sainte-Justine-De-Newton",
    "value": "CA/QC/Sainte-Justine-De-Newton"
  },
  {
    "label": "Sainte-Madeleine",
    "value": "CA/QC/Sainte-Madeleine"
  },
  {
    "label": "Sainte-Marie-Madeleine",
    "value": "CA/QC/Sainte-Marie-Madeleine"
  },
  {
    "label": "Sainte-Marthe",
    "value": "CA/QC/Sainte-Marthe"
  },
  {
    "label": "Sainte-Martine",
    "value": "CA/QC/Sainte-Martine"
  },
  {
    "label": "Sainte-Victoire-De-Sorel",
    "value": "CA/QC/Sainte-Victoire-De-Sorel"
  },
  {
    "label": "Salaberry-De-Valleyfield",
    "value": "CA/QC/Salaberry-De-Valleyfield"
  },
  {
    "label": "Sorel-Tracy",
    "value": "CA/QC/Sorel-Tracy"
  },
  {
    "label": "Terrasse-Vaudreuil",
    "value": "CA/QC/Terrasse-Vaudreuil"
  },
  {
    "label": "Très-Saint-Rédempteur",
    "value": "CA/QC/Très-Saint-Rédempteur"
  },
  {
    "label": "Très-Saint-Sacrement",
    "value": "CA/QC/Très-Saint-Sacrement"
  },
  {
    "label": "Upton",
    "value": "CA/QC/Upton"
  },
  {
    "label": "Varennes",
    "value": "CA/QC/Varennes"
  },
  {
    "label": "Vaudreuil-Dorion",
    "value": "CA/QC/Vaudreuil-Dorion"
  },
  {
    "label": "Vaudreuil-Sur-Le-Lac",
    "value": "CA/QC/Vaudreuil-Sur-Le-Lac"
  },
  {
    "label": "Venise-En-Québec",
    "value": "CA/QC/Venise-En-Québec"
  },
  {
    "label": "Verchères",
    "value": "CA/QC/Verchères"
  },
  {
    "label": "Yamaska",
    "value": "CA/QC/Yamaska"
  },
  {
    "label": "Ahunstic-Cartierville",
    "value": "CA/QC/Ahunstic-Cartierville"
  },
  {
    "label": "Anjou",
    "value": "CA/QC/Anjou"
  },
  {
    "label": "Baie-D'urfé",
    "value": "CA/QC/Baie-D'urfé"
  },
  {
    "label": "Beaconsfield",
    "value": "CA/QC/Beaconsfield"
  },
  {
    "label": "Côte-Des-Neiges-Notre-Dame-De-Grâce",
    "value": "CA/QC/Côte-Des-Neiges-Notre-Dame-De-Grâce"
  },
  {
    "label": "Côte-Des-Neiges–Notre-Dame-De-Grâce",
    "value": "CA/QC/Côte-Des-Neiges–Notre-Dame-De-Grâce"
  },
  {
    "label": "Côte-Saint-Luc",
    "value": "CA/QC/Côte-Saint-Luc"
  },
  {
    "label": "Ahunstic-Des Ormeaux",
    "value": "CA/QC/Ahunstic-Des Ormeaux"
  },
  {
    "label": "Dorval",
    "value": "CA/QC/Dorval"
  },
  {
    "label": "Hampstead",
    "value": "CA/QC/Hampstead"
  },
  {
    "label": "Kirkland",
    "value": "CA/QC/Kirkland"
  },
  {
    "label": "Ahunstic-Patrie",
    "value": "CA/QC/Ahunstic-Patrie"
  },
  {
    "label": "Lachine",
    "value": "CA/QC/Lachine"
  },
  {
    "label": "Lasalle",
    "value": "CA/QC/Lasalle"
  },
  {
    "label": "Le Plateau-Mont-Royal",
    "value": "CA/QC/Le Plateau-Mont-Royal"
  },
  {
    "label": "Ahunstic-Oues",
    "value": "CA/QC/Ahunstic-Oues"
  },
  {
    "label": "Ahunstic-Ouest",
    "value": "CA/QC/Ahunstic-Ouest"
  },
  {
    "label": "L'île-Bizard-Sainte-Geneviève",
    "value": "CA/QC/L'île-Bizard-Sainte-Geneviève"
  },
  {
    "label": "L'île-Dorval",
    "value": "CA/QC/L'île-Dorval"
  },
  {
    "label": "Mercier-Hochelaga-Maisonneuve",
    "value": "CA/QC/Mercier-Hochelaga-Maisonneuve"
  },
  {
    "label": "Ahunstic-Maisonneuve",
    "value": "CA/QC/Ahunstic-Maisonneuve"
  },
  {
    "label": "Ahunstic-Royal",
    "value": "CA/QC/Ahunstic-Royal"
  },
  {
    "label": "Montréal",
    "value": "CA/QC/Montréal"
  },
  {
    "label": "Ahunstic-Est",
    "value": "CA/QC/Ahunstic-Est"
  },
  {
    "label": "Ahunstic-Nord",
    "value": "CA/QC/Ahunstic-Nord"
  },
  {
    "label": "Outremont",
    "value": "CA/QC/Outremont"
  },
  {
    "label": "Ahunstic-Roxboro",
    "value": "CA/QC/Ahunstic-Roxboro"
  },
  {
    "label": "Ahunstic-Claire",
    "value": "CA/QC/Ahunstic-Claire"
  },
  {
    "label": "Rivière-Des-Prairies-Pointe-Aux-Trembles",
    "value": "CA/QC/Rivière-Des-Prairies-Pointe-Aux-Trembles"
  },
  {
    "label": "Rosemont-La Petite-Patrie",
    "value": "CA/QC/Rosemont-La Petite-Patrie"
  },
  {
    "label": "Ahunstic-Laurent",
    "value": "CA/QC/Ahunstic-Laurent"
  },
  {
    "label": "Ahunstic-Léonard",
    "value": "CA/QC/Ahunstic-Léonard"
  },
  {
    "label": "Sainte-Anne-De-Bellevue",
    "value": "CA/QC/Sainte-Anne-De-Bellevue"
  },
  {
    "label": "Senneville",
    "value": "CA/QC/Senneville"
  },
  {
    "label": "Verdun",
    "value": "CA/QC/Verdun"
  },
  {
    "label": "Ahunstic-Marie",
    "value": "CA/QC/Ahunstic-Marie"
  },
  {
    "label": "Villeray-Saint-Michel-Parc-Extension",
    "value": "CA/QC/Villeray-Saint-Michel-Parc-Extension"
  },
  {
    "label": "Westmount",
    "value": "CA/QC/Westmount"
  },
  {
    "label": "Akulivik",
    "value": "CA/QC/Akulivik"
  },
  {
    "label": "Aupaluk",
    "value": "CA/QC/Aupaluk"
  },
  {
    "label": "Beaucanton",
    "value": "CA/QC/Beaucanton"
  },
  {
    "label": "Chapais",
    "value": "CA/QC/Chapais"
  },
  {
    "label": "Chibougamau",
    "value": "CA/QC/Chibougamau"
  },
  {
    "label": "Chisasibi",
    "value": "CA/QC/Chisasibi"
  },
  {
    "label": "Desmaraisville",
    "value": "CA/QC/Desmaraisville"
  },
  {
    "label": "Eastmain",
    "value": "CA/QC/Eastmain"
  },
  {
    "label": "Eastmain 2",
    "value": "CA/QC/Eastmain 2"
  },
  {
    "label": "Inukjuak",
    "value": "CA/QC/Inukjuak"
  },
  {
    "label": "Ivujivik",
    "value": "CA/QC/Ivujivik"
  },
  {
    "label": "Kangiqsualujjuaq",
    "value": "CA/QC/Kangiqsualujjuaq"
  },
  {
    "label": "Kangiqsujuaq",
    "value": "CA/QC/Kangiqsujuaq"
  },
  {
    "label": "Kangirsuk",
    "value": "CA/QC/Kangirsuk"
  },
  {
    "label": "Kawawachikamach",
    "value": "CA/QC/Kawawachikamach"
  },
  {
    "label": "Kuujjuaq",
    "value": "CA/QC/Kuujjuaq"
  },
  {
    "label": "Kuujjuarapik",
    "value": "CA/QC/Kuujjuarapik"
  },
  {
    "label": "Lebel-Sur-Quévillon",
    "value": "CA/QC/Lebel-Sur-Quévillon"
  },
  {
    "label": "Matagami",
    "value": "CA/QC/Matagami"
  },
  {
    "label": "Matimekosh Lac-John",
    "value": "CA/QC/Matimekosh Lac-John"
  },
  {
    "label": "Miquelon",
    "value": "CA/QC/Miquelon"
  },
  {
    "label": "Mistissini",
    "value": "CA/QC/Mistissini"
  },
  {
    "label": "Nemaska",
    "value": "CA/QC/Nemaska"
  },
  {
    "label": "Oujé-Bougoumou",
    "value": "CA/QC/Oujé-Bougoumou"
  },
  {
    "label": "Puvirnituq",
    "value": "CA/QC/Puvirnituq"
  },
  {
    "label": "Quaqtaq",
    "value": "CA/QC/Quaqtaq"
  },
  {
    "label": "Radisson",
    "value": "CA/QC/Radisson"
  },
  {
    "label": "Salluit",
    "value": "CA/QC/Salluit"
  },
  {
    "label": "Tasiujaq",
    "value": "CA/QC/Tasiujaq"
  },
  {
    "label": "Umiujaq",
    "value": "CA/QC/Umiujaq"
  },
  {
    "label": "Val-Paradis",
    "value": "CA/QC/Val-Paradis"
  },
  {
    "label": "Val-Saint-Gilles",
    "value": "CA/QC/Val-Saint-Gilles"
  },
  {
    "label": "Villebois",
    "value": "CA/QC/Villebois"
  },
  {
    "label": "Waskaganish",
    "value": "CA/QC/Waskaganish"
  },
  {
    "label": "Waswanipi",
    "value": "CA/QC/Waswanipi"
  },
  {
    "label": "Wemindji",
    "value": "CA/QC/Wemindji"
  },
  {
    "label": "Whapmagoostui",
    "value": "CA/QC/Whapmagoostui"
  },
  {
    "label": "Alcove",
    "value": "CA/QC/Alcove"
  },
  {
    "label": "Alleyn-Et-Cawood",
    "value": "CA/QC/Alleyn-Et-Cawood"
  },
  {
    "label": "Aumond",
    "value": "CA/QC/Aumond"
  },
  {
    "label": "Blue Sea",
    "value": "CA/QC/Blue Sea"
  },
  {
    "label": "Boileau",
    "value": "CA/QC/Boileau"
  },
  {
    "label": "Bois-Franc",
    "value": "CA/QC/Bois-Franc"
  },
  {
    "label": "Bouchette",
    "value": "CA/QC/Bouchette"
  },
  {
    "label": "Bowman",
    "value": "CA/QC/Bowman"
  },
  {
    "label": "Bristol",
    "value": "CA/QC/Bristol"
  },
  {
    "label": "Bryson",
    "value": "CA/QC/Bryson"
  },
  {
    "label": "Campbell's Bay",
    "value": "CA/QC/Campbell's Bay"
  },
  {
    "label": "Cantley",
    "value": "CA/QC/Cantley"
  },
  {
    "label": "Cayamant",
    "value": "CA/QC/Cayamant"
  },
  {
    "label": "Chapeau",
    "value": "CA/QC/Chapeau"
  },
  {
    "label": "Chelsea",
    "value": "CA/QC/Chelsea"
  },
  {
    "label": "Chénéville",
    "value": "CA/QC/Chénéville"
  },
  {
    "label": "Chichester",
    "value": "CA/QC/Chichester"
  },
  {
    "label": "Clarendon",
    "value": "CA/QC/Clarendon"
  },
  {
    "label": "Danford Lake",
    "value": "CA/QC/Danford Lake"
  },
  {
    "label": "Davidson",
    "value": "CA/QC/Davidson"
  },
  {
    "label": "Déléage",
    "value": "CA/QC/Déléage"
  },
  {
    "label": "Denholm",
    "value": "CA/QC/Denholm"
  },
  {
    "label": "Duclos",
    "value": "CA/QC/Duclos"
  },
  {
    "label": "Duhamel",
    "value": "CA/QC/Duhamel"
  },
  {
    "label": "Egan-Sud",
    "value": "CA/QC/Egan-Sud"
  },
  {
    "label": "Farrellton",
    "value": "CA/QC/Farrellton"
  },
  {
    "label": "Fassett",
    "value": "CA/QC/Fassett"
  },
  {
    "label": "Fort-Coulonge",
    "value": "CA/QC/Fort-Coulonge"
  },
  {
    "label": "Gatineau",
    "value": "CA/QC/Gatineau"
  },
  {
    "label": "Gracefield",
    "value": "CA/QC/Gracefield"
  },
  {
    "label": "Grand-Remous",
    "value": "CA/QC/Grand-Remous"
  },
  {
    "label": "Kazabazua",
    "value": "CA/QC/Kazabazua"
  },
  {
    "label": "Kitigan Zibi",
    "value": "CA/QC/Kitigan Zibi"
  },
  {
    "label": "La Pêche",
    "value": "CA/QC/La Pêche"
  },
  {
    "label": "Lac Des Loups",
    "value": "CA/QC/Lac Des Loups"
  },
  {
    "label": "Lac-Des-Plages",
    "value": "CA/QC/Lac-Des-Plages"
  },
  {
    "label": "Lac-Rapide",
    "value": "CA/QC/Lac-Rapide"
  },
  {
    "label": "Lac-Sainte-Marie",
    "value": "CA/QC/Lac-Sainte-Marie"
  },
  {
    "label": "Ladysmith",
    "value": "CA/QC/Ladysmith"
  },
  {
    "label": "L'île-Du-Grand-Calumet",
    "value": "CA/QC/L'île-Du-Grand-Calumet"
  },
  {
    "label": "L'isle-Aux-Allumettes",
    "value": "CA/QC/L'isle-Aux-Allumettes"
  },
  {
    "label": "Litchfield",
    "value": "CA/QC/Litchfield"
  },
  {
    "label": "Lochaber",
    "value": "CA/QC/Lochaber"
  },
  {
    "label": "Lochaber-Partie-Ouest",
    "value": "CA/QC/Lochaber-Partie-Ouest"
  },
  {
    "label": "Low",
    "value": "CA/QC/Low"
  },
  {
    "label": "Luskville",
    "value": "CA/QC/Luskville"
  },
  {
    "label": "Maniwaki",
    "value": "CA/QC/Maniwaki"
  },
  {
    "label": "Mansfield-Et-Pontefract",
    "value": "CA/QC/Mansfield-Et-Pontefract"
  },
  {
    "label": "Mayo",
    "value": "CA/QC/Mayo"
  },
  {
    "label": "Messines",
    "value": "CA/QC/Messines"
  },
  {
    "label": "Montcerf-Lytton",
    "value": "CA/QC/Montcerf-Lytton"
  },
  {
    "label": "Montebello",
    "value": "CA/QC/Montebello"
  },
  {
    "label": "Montpellier",
    "value": "CA/QC/Montpellier"
  },
  {
    "label": "Mulgrave-Et-Derry",
    "value": "CA/QC/Mulgrave-Et-Derry"
  },
  {
    "label": "Namur",
    "value": "CA/QC/Namur"
  },
  {
    "label": "Notre-Dame-De-Bonsecours",
    "value": "CA/QC/Notre-Dame-De-Bonsecours"
  },
  {
    "label": "Notre-Dame-De-La-Paix",
    "value": "CA/QC/Notre-Dame-De-La-Paix"
  },
  {
    "label": "Notre-Dame-De-La-Salette",
    "value": "CA/QC/Notre-Dame-De-La-Salette"
  },
  {
    "label": "Otter Lake",
    "value": "CA/QC/Otter Lake"
  },
  {
    "label": "Papineauville",
    "value": "CA/QC/Papineauville"
  },
  {
    "label": "Plaisance",
    "value": "CA/QC/Plaisance"
  },
  {
    "label": "Pontiac",
    "value": "CA/QC/Pontiac"
  },
  {
    "label": "Portage-Du-Fort",
    "value": "CA/QC/Portage-Du-Fort"
  },
  {
    "label": "Quyon",
    "value": "CA/QC/Quyon"
  },
  {
    "label": "Rapides-Des-Joachims",
    "value": "CA/QC/Rapides-Des-Joachims"
  },
  {
    "label": "Ripon",
    "value": "CA/QC/Ripon"
  },
  {
    "label": "Saint-André-Avellin",
    "value": "CA/QC/Saint-André-Avellin"
  },
  {
    "label": "Saint-Émile-De-Suffolk",
    "value": "CA/QC/Saint-Émile-De-Suffolk"
  },
  {
    "label": "Saint-Sixte",
    "value": "CA/QC/Saint-Sixte"
  },
  {
    "label": "Sainte-Cécile-De-Masham",
    "value": "CA/QC/Sainte-Cécile-De-Masham"
  },
  {
    "label": "Sainte-Thérèse-De-La-Gatineau",
    "value": "CA/QC/Sainte-Thérèse-De-La-Gatineau"
  },
  {
    "label": "Shawville",
    "value": "CA/QC/Shawville"
  },
  {
    "label": "Sheenboro",
    "value": "CA/QC/Sheenboro"
  },
  {
    "label": "Thorne",
    "value": "CA/QC/Thorne"
  },
  {
    "label": "Thurso",
    "value": "CA/QC/Thurso"
  },
  {
    "label": "Val-Des-Bois",
    "value": "CA/QC/Val-Des-Bois"
  },
  {
    "label": "Val-Des-Monts",
    "value": "CA/QC/Val-Des-Monts"
  },
  {
    "label": "Venosta",
    "value": "CA/QC/Venosta"
  },
  {
    "label": "Wakefield",
    "value": "CA/QC/Wakefield"
  },
  {
    "label": "Waltham",
    "value": "CA/QC/Waltham"
  },
  {
    "label": "Albanel",
    "value": "CA/QC/Albanel"
  },
  {
    "label": "Alma",
    "value": "CA/QC/Alma"
  },
  {
    "label": "Alouette",
    "value": "CA/QC/Alouette"
  },
  {
    "label": "Bégin",
    "value": "CA/QC/Bégin"
  },
  {
    "label": "Boulanger",
    "value": "CA/QC/Boulanger"
  },
  {
    "label": "Canton Tremblay",
    "value": "CA/QC/Canton Tremblay"
  },
  {
    "label": "Chambord",
    "value": "CA/QC/Chambord"
  },
  {
    "label": "Chicoutimi",
    "value": "CA/QC/Chicoutimi"
  },
  {
    "label": "Dalmas",
    "value": "CA/QC/Dalmas"
  },
  {
    "label": "Desbiens",
    "value": "CA/QC/Desbiens"
  },
  {
    "label": "Dolbeau-Mistassini",
    "value": "CA/QC/Dolbeau-Mistassini"
  },
  {
    "label": "Ferland-Et-Boilleau",
    "value": "CA/QC/Ferland-Et-Boilleau"
  },
  {
    "label": "Girardville",
    "value": "CA/QC/Girardville"
  },
  {
    "label": "Hébertville",
    "value": "CA/QC/Hébertville"
  },
  {
    "label": "Hébertville-Station",
    "value": "CA/QC/Hébertville-Station"
  },
  {
    "label": "Jonquière",
    "value": "CA/QC/Jonquière"
  },
  {
    "label": "La Baie",
    "value": "CA/QC/La Baie"
  },
  {
    "label": "La Doré",
    "value": "CA/QC/La Doré"
  },
  {
    "label": "Labrecque",
    "value": "CA/QC/Labrecque"
  },
  {
    "label": "Lac-Bouchette",
    "value": "CA/QC/Lac-Bouchette"
  },
  {
    "label": "Lac-Kénogami",
    "value": "CA/QC/Lac-Kénogami"
  },
  {
    "label": "Lamarche",
    "value": "CA/QC/Lamarche"
  },
  {
    "label": "L'anse-Saint-Jean",
    "value": "CA/QC/L'anse-Saint-Jean"
  },
  {
    "label": "Larouche",
    "value": "CA/QC/Larouche"
  },
  {
    "label": "L'ascension-De-Notre-Seigneur",
    "value": "CA/QC/L'ascension-De-Notre-Seigneur"
  },
  {
    "label": "Laterrière",
    "value": "CA/QC/Laterrière"
  },
  {
    "label": "Mashteuiatsh",
    "value": "CA/QC/Mashteuiatsh"
  },
  {
    "label": "Métabetchouan-Lac-À-La-Croix",
    "value": "CA/QC/Métabetchouan-Lac-À-La-Croix"
  },
  {
    "label": "Normandin",
    "value": "CA/QC/Normandin"
  },
  {
    "label": "Notre-Dame-De-Lorette",
    "value": "CA/QC/Notre-Dame-De-Lorette"
  },
  {
    "label": "Passes-Dangereuses",
    "value": "CA/QC/Passes-Dangereuses"
  },
  {
    "label": "Péribonka",
    "value": "CA/QC/Péribonka"
  },
  {
    "label": "Petit-Saguenay",
    "value": "CA/QC/Petit-Saguenay"
  },
  {
    "label": "Rivière-Éternité",
    "value": "CA/QC/Rivière-Éternité"
  },
  {
    "label": "Roberval",
    "value": "CA/QC/Roberval"
  },
  {
    "label": "Saint-Ambroise",
    "value": "CA/QC/Saint-Ambroise"
  },
  {
    "label": "Saint-André-Du-Lac-Saint-Jean",
    "value": "CA/QC/Saint-André-Du-Lac-Saint-Jean"
  },
  {
    "label": "Saint-Bruno",
    "value": "CA/QC/Saint-Bruno"
  },
  {
    "label": "Saint-Charles-De-Bourget",
    "value": "CA/QC/Saint-Charles-De-Bourget"
  },
  {
    "label": "Saint-David-De-Falardeau",
    "value": "CA/QC/Saint-David-De-Falardeau"
  },
  {
    "label": "Saint-Edmond-Les-Plaines",
    "value": "CA/QC/Saint-Edmond-Les-Plaines"
  },
  {
    "label": "Saint-Eugène-D'argentenay",
    "value": "CA/QC/Saint-Eugène-D'argentenay"
  },
  {
    "label": "Saint-Félicien",
    "value": "CA/QC/Saint-Félicien"
  },
  {
    "label": "Saint-Félix-D'otis",
    "value": "CA/QC/Saint-Félix-D'otis"
  },
  {
    "label": "Saint-François-De-Sales",
    "value": "CA/QC/Saint-François-De-Sales"
  },
  {
    "label": "Saint-Fulgence",
    "value": "CA/QC/Saint-Fulgence"
  },
  {
    "label": "Saint-Gédéon",
    "value": "CA/QC/Saint-Gédéon"
  },
  {
    "label": "Saint-Henri-De-Taillon",
    "value": "CA/QC/Saint-Henri-De-Taillon"
  },
  {
    "label": "Saint-Honoré",
    "value": "CA/QC/Saint-Honoré"
  },
  {
    "label": "Saint-Ludger-De-Milot",
    "value": "CA/QC/Saint-Ludger-De-Milot"
  },
  {
    "label": "Saint-Nazaire",
    "value": "CA/QC/Saint-Nazaire"
  },
  {
    "label": "Saint-Prime",
    "value": "CA/QC/Saint-Prime"
  },
  {
    "label": "Saint-Thomas-Didyme",
    "value": "CA/QC/Saint-Thomas-Didyme"
  },
  {
    "label": "Sainte-Élisabeth-De-Proulx",
    "value": "CA/QC/Sainte-Élisabeth-De-Proulx"
  },
  {
    "label": "Sainte-Hedwidge",
    "value": "CA/QC/Sainte-Hedwidge"
  },
  {
    "label": "Sainte-Rose-Du-Nord",
    "value": "CA/QC/Sainte-Rose-Du-Nord"
  },
  {
    "label": "Shipshaw",
    "value": "CA/QC/Shipshaw"
  },
  {
    "label": "Aneroid",
    "value": "CA/SK/Aneroid"
  },
  {
    "label": "Assiniboia",
    "value": "CA/SK/Assiniboia"
  },
  {
    "label": "Coronach",
    "value": "CA/SK/Coronach"
  },
  {
    "label": "Crane Valley",
    "value": "CA/SK/Crane Valley"
  },
  {
    "label": "Fir Mountain",
    "value": "CA/SK/Fir Mountain"
  },
  {
    "label": "Glenbain",
    "value": "CA/SK/Glenbain"
  },
  {
    "label": "Glentworth",
    "value": "CA/SK/Glentworth"
  },
  {
    "label": "Gravelbourg",
    "value": "CA/SK/Gravelbourg"
  },
  {
    "label": "Hazenmore",
    "value": "CA/SK/Hazenmore"
  },
  {
    "label": "Lafleche",
    "value": "CA/SK/Lafleche"
  },
  {
    "label": "Limerick",
    "value": "CA/SK/Limerick"
  },
  {
    "label": "Mankota",
    "value": "CA/SK/Mankota"
  },
  {
    "label": "Mazenod",
    "value": "CA/SK/Mazenod"
  },
  {
    "label": "Mccord",
    "value": "CA/SK/Mccord"
  },
  {
    "label": "Mossbank",
    "value": "CA/SK/Mossbank"
  },
  {
    "label": "Neville",
    "value": "CA/SK/Neville"
  },
  {
    "label": "Ponteix",
    "value": "CA/SK/Ponteix"
  },
  {
    "label": "Rockglen",
    "value": "CA/SK/Rockglen"
  },
  {
    "label": "Willow Bunch",
    "value": "CA/SK/Willow Bunch"
  },
  {
    "label": "Wood Mountain",
    "value": "CA/SK/Wood Mountain"
  },
  {
    "label": "Woodrow",
    "value": "CA/SK/Woodrow"
  },
  {
    "label": "Alticane",
    "value": "CA/SK/Alticane"
  },
  {
    "label": "Big River",
    "value": "CA/SK/Big River"
  },
  {
    "label": "Blaine Lake",
    "value": "CA/SK/Blaine Lake"
  },
  {
    "label": "Borden",
    "value": "CA/SK/Borden"
  },
  {
    "label": "Canwood",
    "value": "CA/SK/Canwood"
  },
  {
    "label": "Debden",
    "value": "CA/SK/Debden"
  },
  {
    "label": "Denholm",
    "value": "CA/SK/Denholm"
  },
  {
    "label": "Hafford",
    "value": "CA/SK/Hafford"
  },
  {
    "label": "Holbein",
    "value": "CA/SK/Holbein"
  },
  {
    "label": "Leask",
    "value": "CA/SK/Leask"
  },
  {
    "label": "Leoville",
    "value": "CA/SK/Leoville"
  },
  {
    "label": "Marcelin",
    "value": "CA/SK/Marcelin"
  },
  {
    "label": "Maymont",
    "value": "CA/SK/Maymont"
  },
  {
    "label": "Mayview",
    "value": "CA/SK/Mayview"
  },
  {
    "label": "Medstead",
    "value": "CA/SK/Medstead"
  },
  {
    "label": "Mildred",
    "value": "CA/SK/Mildred"
  },
  {
    "label": "Mont Nebo",
    "value": "CA/SK/Mont Nebo"
  },
  {
    "label": "North Battleford",
    "value": "CA/SK/North Battleford"
  },
  {
    "label": "Parkside",
    "value": "CA/SK/Parkside"
  },
  {
    "label": "Radisson",
    "value": "CA/SK/Radisson"
  },
  {
    "label": "Richard",
    "value": "CA/SK/Richard"
  },
  {
    "label": "Shell Lake",
    "value": "CA/SK/Shell Lake"
  },
  {
    "label": "Speers",
    "value": "CA/SK/Speers"
  },
  {
    "label": "Spiritwood",
    "value": "CA/SK/Spiritwood"
  },
  {
    "label": "Victoire",
    "value": "CA/SK/Victoire"
  },
  {
    "label": "Waskesiu Lake",
    "value": "CA/SK/Waskesiu Lake"
  },
  {
    "label": "Bracken",
    "value": "CA/SK/Bracken"
  },
  {
    "label": "Claydon",
    "value": "CA/SK/Claydon"
  },
  {
    "label": "Climax",
    "value": "CA/SK/Climax"
  },
  {
    "label": "Consul",
    "value": "CA/SK/Consul"
  },
  {
    "label": "Eastend",
    "value": "CA/SK/Eastend"
  },
  {
    "label": "Frontier",
    "value": "CA/SK/Frontier"
  },
  {
    "label": "Maple Creek",
    "value": "CA/SK/Maple Creek"
  },
  {
    "label": "Piapot",
    "value": "CA/SK/Piapot"
  },
  {
    "label": "Shaunavon",
    "value": "CA/SK/Shaunavon"
  },
  {
    "label": "Val Marie",
    "value": "CA/SK/Val Marie"
  },
  {
    "label": "Annaheim",
    "value": "CA/SK/Annaheim"
  },
  {
    "label": "Arborfield",
    "value": "CA/SK/Arborfield"
  },
  {
    "label": "Archerwill",
    "value": "CA/SK/Archerwill"
  },
  {
    "label": "Arran",
    "value": "CA/SK/Arran"
  },
  {
    "label": "Aylsham",
    "value": "CA/SK/Aylsham"
  },
  {
    "label": "Bankend",
    "value": "CA/SK/Bankend"
  },
  {
    "label": "Beatty",
    "value": "CA/SK/Beatty"
  },
  {
    "label": "Bjorkdale",
    "value": "CA/SK/Bjorkdale"
  },
  {
    "label": "Brockington",
    "value": "CA/SK/Brockington"
  },
  {
    "label": "Brooksby",
    "value": "CA/SK/Brooksby"
  },
  {
    "label": "Buchanan",
    "value": "CA/SK/Buchanan"
  },
  {
    "label": "Burr",
    "value": "CA/SK/Burr"
  },
  {
    "label": "Canora",
    "value": "CA/SK/Canora"
  },
  {
    "label": "Carmel",
    "value": "CA/SK/Carmel"
  },
  {
    "label": "Carragana",
    "value": "CA/SK/Carragana"
  },
  {
    "label": "Carrot River",
    "value": "CA/SK/Carrot River"
  },
  {
    "label": "Chorney Beach",
    "value": "CA/SK/Chorney Beach"
  },
  {
    "label": "Cote First Nation",
    "value": "CA/SK/Cote First Nation"
  },
  {
    "label": "Crooked River",
    "value": "CA/SK/Crooked River"
  },
  {
    "label": "Crystal Springs",
    "value": "CA/SK/Crystal Springs"
  },
  {
    "label": "Dafoe",
    "value": "CA/SK/Dafoe"
  },
  {
    "label": "Danbury",
    "value": "CA/SK/Danbury"
  },
  {
    "label": "Day Star First Nation",
    "value": "CA/SK/Day Star First Nation"
  },
  {
    "label": "Drake",
    "value": "CA/SK/Drake"
  },
  {
    "label": "Duval",
    "value": "CA/SK/Duval"
  },
  {
    "label": "Elfros",
    "value": "CA/SK/Elfros"
  },
  {
    "label": "Endeavour",
    "value": "CA/SK/Endeavour"
  },
  {
    "label": "Englefeld",
    "value": "CA/SK/Englefeld"
  },
  {
    "label": "Etters Beach",
    "value": "CA/SK/Etters Beach"
  },
  {
    "label": "Fairy Glen",
    "value": "CA/SK/Fairy Glen"
  },
  {
    "label": "Fenwood",
    "value": "CA/SK/Fenwood"
  },
  {
    "label": "Foam Lake",
    "value": "CA/SK/Foam Lake"
  },
  {
    "label": "Fosston",
    "value": "CA/SK/Fosston"
  },
  {
    "label": "Fulda",
    "value": "CA/SK/Fulda"
  },
  {
    "label": "Govan",
    "value": "CA/SK/Govan"
  },
  {
    "label": "Gronlid",
    "value": "CA/SK/Gronlid"
  },
  {
    "label": "Guernsey",
    "value": "CA/SK/Guernsey"
  },
  {
    "label": "Hagen",
    "value": "CA/SK/Hagen"
  },
  {
    "label": "Hazel Dell",
    "value": "CA/SK/Hazel Dell"
  },
  {
    "label": "Hendon",
    "value": "CA/SK/Hendon"
  },
  {
    "label": "Homefield",
    "value": "CA/SK/Homefield"
  },
  {
    "label": "Hubbard",
    "value": "CA/SK/Hubbard"
  },
  {
    "label": "Hudson Bay",
    "value": "CA/SK/Hudson Bay"
  },
  {
    "label": "Humboldt",
    "value": "CA/SK/Humboldt"
  },
  {
    "label": "Hyas",
    "value": "CA/SK/Hyas"
  },
  {
    "label": "Imperial",
    "value": "CA/SK/Imperial"
  },
  {
    "label": "Invermay",
    "value": "CA/SK/Invermay"
  },
  {
    "label": "Ituna",
    "value": "CA/SK/Ituna"
  },
  {
    "label": "James Smith First Nation",
    "value": "CA/SK/James Smith First Nation"
  },
  {
    "label": "Jansen",
    "value": "CA/SK/Jansen"
  },
  {
    "label": "Jedburgh",
    "value": "CA/SK/Jedburgh"
  },
  {
    "label": "Kamsack",
    "value": "CA/SK/Kamsack"
  },
  {
    "label": "Keeseekoose First Nation",
    "value": "CA/SK/Keeseekoose First Nation"
  },
  {
    "label": "Kelliher",
    "value": "CA/SK/Kelliher"
  },
  {
    "label": "Kelvington",
    "value": "CA/SK/Kelvington"
  },
  {
    "label": "Key First Nation",
    "value": "CA/SK/Key First Nation"
  },
  {
    "label": "Kinistin Saulteaux First Nation",
    "value": "CA/SK/Kinistin Saulteaux First Nation"
  },
  {
    "label": "Kinistino",
    "value": "CA/SK/Kinistino"
  },
  {
    "label": "Kuroki",
    "value": "CA/SK/Kuroki"
  },
  {
    "label": "Kylemore",
    "value": "CA/SK/Kylemore"
  },
  {
    "label": "Lac Vert",
    "value": "CA/SK/Lac Vert"
  },
  {
    "label": "Lake Lenore",
    "value": "CA/SK/Lake Lenore"
  },
  {
    "label": "Leross",
    "value": "CA/SK/Leross"
  },
  {
    "label": "Leroy",
    "value": "CA/SK/Leroy"
  },
  {
    "label": "Leslie",
    "value": "CA/SK/Leslie"
  },
  {
    "label": "Leslie Beach",
    "value": "CA/SK/Leslie Beach"
  },
  {
    "label": "Lestock",
    "value": "CA/SK/Lestock"
  },
  {
    "label": "Liberty",
    "value": "CA/SK/Liberty"
  },
  {
    "label": "Lintlaw",
    "value": "CA/SK/Lintlaw"
  },
  {
    "label": "Lockwood",
    "value": "CA/SK/Lockwood"
  },
  {
    "label": "Macnutt",
    "value": "CA/SK/Macnutt"
  },
  {
    "label": "Manitou Beach",
    "value": "CA/SK/Manitou Beach"
  },
  {
    "label": "Margo",
    "value": "CA/SK/Margo"
  },
  {
    "label": "Melfort",
    "value": "CA/SK/Melfort"
  },
  {
    "label": "Meskanaw",
    "value": "CA/SK/Meskanaw"
  },
  {
    "label": "Middle Lake",
    "value": "CA/SK/Middle Lake"
  },
  {
    "label": "Mikado",
    "value": "CA/SK/Mikado"
  },
  {
    "label": "Mistatim",
    "value": "CA/SK/Mistatim"
  },
  {
    "label": "Mozart",
    "value": "CA/SK/Mozart"
  },
  {
    "label": "Muenster",
    "value": "CA/SK/Muenster"
  },
  {
    "label": "Muskoday",
    "value": "CA/SK/Muskoday"
  },
  {
    "label": "Muskoday First Nation",
    "value": "CA/SK/Muskoday First Nation"
  },
  {
    "label": "Naicam",
    "value": "CA/SK/Naicam"
  },
  {
    "label": "Nipawin",
    "value": "CA/SK/Nipawin"
  },
  {
    "label": "Nokomis",
    "value": "CA/SK/Nokomis"
  },
  {
    "label": "Norquay",
    "value": "CA/SK/Norquay"
  },
  {
    "label": "Nut Mountain",
    "value": "CA/SK/Nut Mountain"
  },
  {
    "label": "Okla",
    "value": "CA/SK/Okla"
  },
  {
    "label": "Parkerview",
    "value": "CA/SK/Parkerview"
  },
  {
    "label": "Pathlow",
    "value": "CA/SK/Pathlow"
  },
  {
    "label": "Pelly",
    "value": "CA/SK/Pelly"
  },
  {
    "label": "Penzance",
    "value": "CA/SK/Penzance"
  },
  {
    "label": "Pilger",
    "value": "CA/SK/Pilger"
  },
  {
    "label": "Pleasantdale",
    "value": "CA/SK/Pleasantdale"
  },
  {
    "label": "Plunkett",
    "value": "CA/SK/Plunkett"
  },
  {
    "label": "Porcupine Plain",
    "value": "CA/SK/Porcupine Plain"
  },
  {
    "label": "Preeceville",
    "value": "CA/SK/Preeceville"
  },
  {
    "label": "Punnichy",
    "value": "CA/SK/Punnichy"
  },
  {
    "label": "Quill Lake",
    "value": "CA/SK/Quill Lake"
  },
  {
    "label": "Quinton",
    "value": "CA/SK/Quinton"
  },
  {
    "label": "Rama",
    "value": "CA/SK/Rama"
  },
  {
    "label": "Raymore",
    "value": "CA/SK/Raymore"
  },
  {
    "label": "Red Earth",
    "value": "CA/SK/Red Earth"
  },
  {
    "label": "Red Earth First Nation",
    "value": "CA/SK/Red Earth First Nation"
  },
  {
    "label": "Rhein",
    "value": "CA/SK/Rhein"
  },
  {
    "label": "Ridgedale",
    "value": "CA/SK/Ridgedale"
  },
  {
    "label": "Rokeby",
    "value": "CA/SK/Rokeby"
  },
  {
    "label": "Rose Valley",
    "value": "CA/SK/Rose Valley"
  },
  {
    "label": "Runnymede",
    "value": "CA/SK/Runnymede"
  },
  {
    "label": "Saltcoats",
    "value": "CA/SK/Saltcoats"
  },
  {
    "label": "Semans",
    "value": "CA/SK/Semans"
  },
  {
    "label": "Sheho",
    "value": "CA/SK/Sheho"
  },
  {
    "label": "Shoal Lake Cree First Nation",
    "value": "CA/SK/Shoal Lake Cree First Nation"
  },
  {
    "label": "Simpson",
    "value": "CA/SK/Simpson"
  },
  {
    "label": "Spalding",
    "value": "CA/SK/Spalding"
  },
  {
    "label": "Springside",
    "value": "CA/SK/Springside"
  },
  {
    "label": "St Benedict",
    "value": "CA/SK/St Benedict"
  },
  {
    "label": "St Brieux",
    "value": "CA/SK/St Brieux"
  },
  {
    "label": "St Gregor",
    "value": "CA/SK/St Gregor"
  },
  {
    "label": "Stalwart",
    "value": "CA/SK/Stalwart"
  },
  {
    "label": "Star City",
    "value": "CA/SK/Star City"
  },
  {
    "label": "Stenen",
    "value": "CA/SK/Stenen"
  },
  {
    "label": "Stornoway",
    "value": "CA/SK/Stornoway"
  },
  {
    "label": "Strasbourg",
    "value": "CA/SK/Strasbourg"
  },
  {
    "label": "Sturgis",
    "value": "CA/SK/Sturgis"
  },
  {
    "label": "Sylvania",
    "value": "CA/SK/Sylvania"
  },
  {
    "label": "Theodore",
    "value": "CA/SK/Theodore"
  },
  {
    "label": "Tisdale",
    "value": "CA/SK/Tisdale"
  },
  {
    "label": "Tobin Lake",
    "value": "CA/SK/Tobin Lake"
  },
  {
    "label": "Togo",
    "value": "CA/SK/Togo"
  },
  {
    "label": "Tway",
    "value": "CA/SK/Tway"
  },
  {
    "label": "Valparaiso",
    "value": "CA/SK/Valparaiso"
  },
  {
    "label": "Wadena",
    "value": "CA/SK/Wadena"
  },
  {
    "label": "Watson",
    "value": "CA/SK/Watson"
  },
  {
    "label": "Weekes",
    "value": "CA/SK/Weekes"
  },
  {
    "label": "Weldon",
    "value": "CA/SK/Weldon"
  },
  {
    "label": "White Fox",
    "value": "CA/SK/White Fox"
  },
  {
    "label": "Willowbrook",
    "value": "CA/SK/Willowbrook"
  },
  {
    "label": "Wishart",
    "value": "CA/SK/Wishart"
  },
  {
    "label": "Wroxton",
    "value": "CA/SK/Wroxton"
  },
  {
    "label": "Wynyard",
    "value": "CA/SK/Wynyard"
  },
  {
    "label": "Yellow Creek",
    "value": "CA/SK/Yellow Creek"
  },
  {
    "label": "Yellow Quill First Nation",
    "value": "CA/SK/Yellow Quill First Nation"
  },
  {
    "label": "Yorkton",
    "value": "CA/SK/Yorkton"
  },
  {
    "label": "Zenon Park",
    "value": "CA/SK/Zenon Park"
  },
  {
    "label": "Aberdeen",
    "value": "CA/SK/Aberdeen"
  },
  {
    "label": "Allan",
    "value": "CA/SK/Allan"
  },
  {
    "label": "Alvena",
    "value": "CA/SK/Alvena"
  },
  {
    "label": "Aquadeo",
    "value": "CA/SK/Aquadeo"
  },
  {
    "label": "Ardath",
    "value": "CA/SK/Ardath"
  },
  {
    "label": "Arelee",
    "value": "CA/SK/Arelee"
  },
  {
    "label": "Asquith",
    "value": "CA/SK/Asquith"
  },
  {
    "label": "Baldwinton",
    "value": "CA/SK/Baldwinton"
  },
  {
    "label": "Battleford",
    "value": "CA/SK/Battleford"
  },
  {
    "label": "Beardys And Okemasis First Nation",
    "value": "CA/SK/Beardys And Okemasis First Nation"
  },
  {
    "label": "Big Shell",
    "value": "CA/SK/Big Shell"
  },
  {
    "label": "Biggar",
    "value": "CA/SK/Biggar"
  },
  {
    "label": "Birch Hills",
    "value": "CA/SK/Birch Hills"
  },
  {
    "label": "Birsay",
    "value": "CA/SK/Birsay"
  },
  {
    "label": "Bladworth",
    "value": "CA/SK/Bladworth"
  },
  {
    "label": "Bradwell",
    "value": "CA/SK/Bradwell"
  },
  {
    "label": "Brock",
    "value": "CA/SK/Brock"
  },
  {
    "label": "Broderick",
    "value": "CA/SK/Broderick"
  },
  {
    "label": "Bruno",
    "value": "CA/SK/Bruno"
  },
  {
    "label": "Cactus Lake",
    "value": "CA/SK/Cactus Lake"
  },
  {
    "label": "Cando",
    "value": "CA/SK/Cando"
  },
  {
    "label": "Carlton",
    "value": "CA/SK/Carlton"
  },
  {
    "label": "Casa Rio",
    "value": "CA/SK/Casa Rio"
  },
  {
    "label": "Clavet",
    "value": "CA/SK/Clavet"
  },
  {
    "label": "Cochin",
    "value": "CA/SK/Cochin"
  },
  {
    "label": "Coleville",
    "value": "CA/SK/Coleville"
  },
  {
    "label": "Colonsay",
    "value": "CA/SK/Colonsay"
  },
  {
    "label": "Conquest",
    "value": "CA/SK/Conquest"
  },
  {
    "label": "Corman Park",
    "value": "CA/SK/Corman Park"
  },
  {
    "label": "Coteau Beach",
    "value": "CA/SK/Coteau Beach"
  },
  {
    "label": "Craik",
    "value": "CA/SK/Craik"
  },
  {
    "label": "Cudworth",
    "value": "CA/SK/Cudworth"
  },
  {
    "label": "Cut Knife",
    "value": "CA/SK/Cut Knife"
  },
  {
    "label": "Dalmeny",
    "value": "CA/SK/Dalmeny"
  },
  {
    "label": "Davidson",
    "value": "CA/SK/Davidson"
  },
  {
    "label": "Delisle",
    "value": "CA/SK/Delisle"
  },
  {
    "label": "Delmas",
    "value": "CA/SK/Delmas"
  },
  {
    "label": "Denzil",
    "value": "CA/SK/Denzil"
  },
  {
    "label": "Dinsmore",
    "value": "CA/SK/Dinsmore"
  },
  {
    "label": "Dodsland",
    "value": "CA/SK/Dodsland"
  },
  {
    "label": "Domremy",
    "value": "CA/SK/Domremy"
  },
  {
    "label": "Duck Lake",
    "value": "CA/SK/Duck Lake"
  },
  {
    "label": "Dundurn",
    "value": "CA/SK/Dundurn"
  },
  {
    "label": "Duperow",
    "value": "CA/SK/Duperow"
  },
  {
    "label": "Eatonia",
    "value": "CA/SK/Eatonia"
  },
  {
    "label": "Echo Bay",
    "value": "CA/SK/Echo Bay"
  },
  {
    "label": "Edam",
    "value": "CA/SK/Edam"
  },
  {
    "label": "Elbow",
    "value": "CA/SK/Elbow"
  },
  {
    "label": "Elrose",
    "value": "CA/SK/Elrose"
  },
  {
    "label": "Elstow",
    "value": "CA/SK/Elstow"
  },
  {
    "label": "Eston",
    "value": "CA/SK/Eston"
  },
  {
    "label": "Evesham",
    "value": "CA/SK/Evesham"
  },
  {
    "label": "Fishing Lake First Nation",
    "value": "CA/SK/Fishing Lake First Nation"
  },
  {
    "label": "Fiske",
    "value": "CA/SK/Fiske"
  },
  {
    "label": "Flaxcombe",
    "value": "CA/SK/Flaxcombe"
  },
  {
    "label": "Furdale",
    "value": "CA/SK/Furdale"
  },
  {
    "label": "Gallivan",
    "value": "CA/SK/Gallivan"
  },
  {
    "label": "Glasnevin",
    "value": "CA/SK/Glasnevin"
  },
  {
    "label": "Glenbush",
    "value": "CA/SK/Glenbush"
  },
  {
    "label": "Glenside",
    "value": "CA/SK/Glenside"
  },
  {
    "label": "Glidden",
    "value": "CA/SK/Glidden"
  },
  {
    "label": "Gordon First Nation",
    "value": "CA/SK/Gordon First Nation"
  },
  {
    "label": "Grandora",
    "value": "CA/SK/Grandora"
  },
  {
    "label": "Grasswood",
    "value": "CA/SK/Grasswood"
  },
  {
    "label": "Hague",
    "value": "CA/SK/Hague"
  },
  {
    "label": "Handel",
    "value": "CA/SK/Handel"
  },
  {
    "label": "Hanley",
    "value": "CA/SK/Hanley"
  },
  {
    "label": "Harris",
    "value": "CA/SK/Harris"
  },
  {
    "label": "Hawarden",
    "value": "CA/SK/Hawarden"
  },
  {
    "label": "Hepburn",
    "value": "CA/SK/Hepburn"
  },
  {
    "label": "Herschel",
    "value": "CA/SK/Herschel"
  },
  {
    "label": "Hoey",
    "value": "CA/SK/Hoey"
  },
  {
    "label": "Hoosier",
    "value": "CA/SK/Hoosier"
  },
  {
    "label": "Insinger",
    "value": "CA/SK/Insinger"
  },
  {
    "label": "Island Lake",
    "value": "CA/SK/Island Lake"
  },
  {
    "label": "Jackfish Lake",
    "value": "CA/SK/Jackfish Lake"
  },
  {
    "label": "Kawacatoose First Nation",
    "value": "CA/SK/Kawacatoose First Nation"
  },
  {
    "label": "Kelfield",
    "value": "CA/SK/Kelfield"
  },
  {
    "label": "Kenaston",
    "value": "CA/SK/Kenaston"
  },
  {
    "label": "Kerrobert",
    "value": "CA/SK/Kerrobert"
  },
  {
    "label": "Kindersley",
    "value": "CA/SK/Kindersley"
  },
  {
    "label": "Kinley",
    "value": "CA/SK/Kinley"
  },
  {
    "label": "Krydor",
    "value": "CA/SK/Krydor"
  },
  {
    "label": "Laird",
    "value": "CA/SK/Laird"
  },
  {
    "label": "Landis",
    "value": "CA/SK/Landis"
  },
  {
    "label": "Langham",
    "value": "CA/SK/Langham"
  },
  {
    "label": "Laporte",
    "value": "CA/SK/Laporte"
  },
  {
    "label": "Lashburn",
    "value": "CA/SK/Lashburn"
  },
  {
    "label": "Little Pine First Nation",
    "value": "CA/SK/Little Pine First Nation"
  },
  {
    "label": "Lloydminster",
    "value": "CA/SK/Lloydminster"
  },
  {
    "label": "Lone Rock",
    "value": "CA/SK/Lone Rock"
  },
  {
    "label": "Loreburn",
    "value": "CA/SK/Loreburn"
  },
  {
    "label": "Loverna",
    "value": "CA/SK/Loverna"
  },
  {
    "label": "Lucky Man First Nation",
    "value": "CA/SK/Lucky Man First Nation"
  },
  {
    "label": "Luseland",
    "value": "CA/SK/Luseland"
  },
  {
    "label": "Macklin",
    "value": "CA/SK/Macklin"
  },
  {
    "label": "Macrorie",
    "value": "CA/SK/Macrorie"
  },
  {
    "label": "Madison",
    "value": "CA/SK/Madison"
  },
  {
    "label": "Maidstone",
    "value": "CA/SK/Maidstone"
  },
  {
    "label": "Major",
    "value": "CA/SK/Major"
  },
  {
    "label": "Mantario",
    "value": "CA/SK/Mantario"
  },
  {
    "label": "Marengo",
    "value": "CA/SK/Marengo"
  },
  {
    "label": "Marsden",
    "value": "CA/SK/Marsden"
  },
  {
    "label": "Marshall",
    "value": "CA/SK/Marshall"
  },
  {
    "label": "Martensville",
    "value": "CA/SK/Martensville"
  },
  {
    "label": "Mayfair",
    "value": "CA/SK/Mayfair"
  },
  {
    "label": "Meacham",
    "value": "CA/SK/Meacham"
  },
  {
    "label": "Meota",
    "value": "CA/SK/Meota"
  },
  {
    "label": "Mervin",
    "value": "CA/SK/Mervin"
  },
  {
    "label": "Metinota",
    "value": "CA/SK/Metinota"
  },
  {
    "label": "Milden",
    "value": "CA/SK/Milden"
  },
  {
    "label": "Mistawasis First Nation",
    "value": "CA/SK/Mistawasis First Nation"
  },
  {
    "label": "Mistusinne",
    "value": "CA/SK/Mistusinne"
  },
  {
    "label": "Moosomin First Nation",
    "value": "CA/SK/Moosomin First Nation"
  },
  {
    "label": "Mosquito Grizzly Bears Head First Nation",
    "value": "CA/SK/Mosquito Grizzly Bears Head First Nation"
  },
  {
    "label": "Mullingar",
    "value": "CA/SK/Mullingar"
  },
  {
    "label": "Muskeg Lake First Nation",
    "value": "CA/SK/Muskeg Lake First Nation"
  },
  {
    "label": "Muskowekwan First Nation",
    "value": "CA/SK/Muskowekwan First Nation"
  },
  {
    "label": "Neilburg",
    "value": "CA/SK/Neilburg"
  },
  {
    "label": "Netherhill",
    "value": "CA/SK/Netherhill"
  },
  {
    "label": "One Arrow First Nation",
    "value": "CA/SK/One Arrow First Nation"
  },
  {
    "label": "Osler",
    "value": "CA/SK/Osler"
  },
  {
    "label": "Outlook",
    "value": "CA/SK/Outlook"
  },
  {
    "label": "Pakwaw Lake",
    "value": "CA/SK/Pakwaw Lake"
  },
  {
    "label": "Paradise Hill",
    "value": "CA/SK/Paradise Hill"
  },
  {
    "label": "Paynton",
    "value": "CA/SK/Paynton"
  },
  {
    "label": "Pebble Baye",
    "value": "CA/SK/Pebble Baye"
  },
  {
    "label": "Perdue",
    "value": "CA/SK/Perdue"
  },
  {
    "label": "Phippen",
    "value": "CA/SK/Phippen"
  },
  {
    "label": "Plato",
    "value": "CA/SK/Plato"
  },
  {
    "label": "Plenty",
    "value": "CA/SK/Plenty"
  },
  {
    "label": "Poundmaker First Nation",
    "value": "CA/SK/Poundmaker First Nation"
  },
  {
    "label": "Preston Park Ii Retirement Residence",
    "value": "CA/SK/Preston Park Ii Retirement Residence"
  },
  {
    "label": "Preston Park Retirement Residence",
    "value": "CA/SK/Preston Park Retirement Residence"
  },
  {
    "label": "Primate",
    "value": "CA/SK/Primate"
  },
  {
    "label": "Rabbit Lake",
    "value": "CA/SK/Rabbit Lake"
  },
  {
    "label": "Red Pheasant First Nation",
    "value": "CA/SK/Red Pheasant First Nation"
  },
  {
    "label": "Reward",
    "value": "CA/SK/Reward"
  },
  {
    "label": "Richlea",
    "value": "CA/SK/Richlea"
  },
  {
    "label": "Riverside Estates",
    "value": "CA/SK/Riverside Estates"
  },
  {
    "label": "Rockhaven",
    "value": "CA/SK/Rockhaven"
  },
  {
    "label": "Rosetown",
    "value": "CA/SK/Rosetown"
  },
  {
    "label": "Rosthern",
    "value": "CA/SK/Rosthern"
  },
  {
    "label": "Ruddell",
    "value": "CA/SK/Ruddell"
  },
  {
    "label": "Ruthilda",
    "value": "CA/SK/Ruthilda"
  },
  {
    "label": "Salvador",
    "value": "CA/SK/Salvador"
  },
  {
    "label": "Saskatoon",
    "value": "CA/SK/Saskatoon"
  },
  {
    "label": "Saulteaux First Nation",
    "value": "CA/SK/Saulteaux First Nation"
  },
  {
    "label": "Scott",
    "value": "CA/SK/Scott"
  },
  {
    "label": "Senlac",
    "value": "CA/SK/Senlac"
  },
  {
    "label": "Shields",
    "value": "CA/SK/Shields"
  },
  {
    "label": "Smiley",
    "value": "CA/SK/Smiley"
  },
  {
    "label": "Sonningdale",
    "value": "CA/SK/Sonningdale"
  },
  {
    "label": "Sovereign",
    "value": "CA/SK/Sovereign"
  },
  {
    "label": "Springwater",
    "value": "CA/SK/Springwater"
  },
  {
    "label": "St Denis",
    "value": "CA/SK/St Denis"
  },
  {
    "label": "St Isidore De Bellevue",
    "value": "CA/SK/St Isidore De Bellevue"
  },
  {
    "label": "St Louis",
    "value": "CA/SK/St Louis"
  },
  {
    "label": "Stranraer",
    "value": "CA/SK/Stranraer"
  },
  {
    "label": "Strongfield",
    "value": "CA/SK/Strongfield"
  },
  {
    "label": "Sweetgrass First Nation",
    "value": "CA/SK/Sweetgrass First Nation"
  },
  {
    "label": "Tessier",
    "value": "CA/SK/Tessier"
  },
  {
    "label": "Thode",
    "value": "CA/SK/Thode"
  },
  {
    "label": "Tramping Lake",
    "value": "CA/SK/Tramping Lake"
  },
  {
    "label": "Tuffnell",
    "value": "CA/SK/Tuffnell"
  },
  {
    "label": "Turtleford",
    "value": "CA/SK/Turtleford"
  },
  {
    "label": "Tyner",
    "value": "CA/SK/Tyner"
  },
  {
    "label": "Unity",
    "value": "CA/SK/Unity"
  },
  {
    "label": "Vanscoy",
    "value": "CA/SK/Vanscoy"
  },
  {
    "label": "Vawn",
    "value": "CA/SK/Vawn"
  },
  {
    "label": "Viscount",
    "value": "CA/SK/Viscount"
  },
  {
    "label": "Vonda",
    "value": "CA/SK/Vonda"
  },
  {
    "label": "Wakaw",
    "value": "CA/SK/Wakaw"
  },
  {
    "label": "Wakaw Lake",
    "value": "CA/SK/Wakaw Lake"
  },
  {
    "label": "Waldheim",
    "value": "CA/SK/Waldheim"
  },
  {
    "label": "Warman",
    "value": "CA/SK/Warman"
  },
  {
    "label": "Waseca",
    "value": "CA/SK/Waseca"
  },
  {
    "label": "Watrous",
    "value": "CA/SK/Watrous"
  },
  {
    "label": "Whitecap Dakota First Nation",
    "value": "CA/SK/Whitecap Dakota First Nation"
  },
  {
    "label": "Wilkie",
    "value": "CA/SK/Wilkie"
  },
  {
    "label": "Wiseton",
    "value": "CA/SK/Wiseton"
  },
  {
    "label": "Young",
    "value": "CA/SK/Young"
  },
  {
    "label": "Zealandia",
    "value": "CA/SK/Zealandia"
  },
  {
    "label": "Zelma",
    "value": "CA/SK/Zelma"
  },
  {
    "label": "Alida",
    "value": "CA/SK/Alida"
  },
  {
    "label": "Antler",
    "value": "CA/SK/Antler"
  },
  {
    "label": "Arcola",
    "value": "CA/SK/Arcola"
  },
  {
    "label": "Bellegarde",
    "value": "CA/SK/Bellegarde"
  },
  {
    "label": "Bienfait",
    "value": "CA/SK/Bienfait"
  },
  {
    "label": "Carievale",
    "value": "CA/SK/Carievale"
  },
  {
    "label": "Carlyle",
    "value": "CA/SK/Carlyle"
  },
  {
    "label": "Carnduff",
    "value": "CA/SK/Carnduff"
  },
  {
    "label": "Corning",
    "value": "CA/SK/Corning"
  },
  {
    "label": "Emerald Park",
    "value": "CA/SK/Emerald Park"
  },
  {
    "label": "Estevan",
    "value": "CA/SK/Estevan"
  },
  {
    "label": "Frobisher",
    "value": "CA/SK/Frobisher"
  },
  {
    "label": "Gainsborough",
    "value": "CA/SK/Gainsborough"
  },
  {
    "label": "Glen Ewen",
    "value": "CA/SK/Glen Ewen"
  },
  {
    "label": "Kennedy",
    "value": "CA/SK/Kennedy"
  },
  {
    "label": "Kisbey",
    "value": "CA/SK/Kisbey"
  },
  {
    "label": "Lampman",
    "value": "CA/SK/Lampman"
  },
  {
    "label": "Manor",
    "value": "CA/SK/Manor"
  },
  {
    "label": "Maryfield",
    "value": "CA/SK/Maryfield"
  },
  {
    "label": "North Portal",
    "value": "CA/SK/North Portal"
  },
  {
    "label": "Oxbow",
    "value": "CA/SK/Oxbow"
  },
  {
    "label": "Redvers",
    "value": "CA/SK/Redvers"
  },
  {
    "label": "Stoughton",
    "value": "CA/SK/Stoughton"
  },
  {
    "label": "Wawota",
    "value": "CA/SK/Wawota"
  },
  {
    "label": "Alsask",
    "value": "CA/SK/Alsask"
  },
  {
    "label": "D'arcy Station",
    "value": "CA/SK/D'arcy Station"
  },
  {
    "label": "Bright Sand",
    "value": "CA/SK/Bright Sand"
  },
  {
    "label": "Dorintosh",
    "value": "CA/SK/Dorintosh"
  },
  {
    "label": "Frenchman Butte",
    "value": "CA/SK/Frenchman Butte"
  },
  {
    "label": "Glaslyn",
    "value": "CA/SK/Glaslyn"
  },
  {
    "label": "Goodsoil",
    "value": "CA/SK/Goodsoil"
  },
  {
    "label": "Greig Lake",
    "value": "CA/SK/Greig Lake"
  },
  {
    "label": "Kivimaa-Moonlight Bay",
    "value": "CA/SK/Kivimaa-Moonlight Bay"
  },
  {
    "label": "Livelong",
    "value": "CA/SK/Livelong"
  },
  {
    "label": "Loon Lake",
    "value": "CA/SK/Loon Lake"
  },
  {
    "label": "Makwa",
    "value": "CA/SK/Makwa"
  },
  {
    "label": "Meadow Lake",
    "value": "CA/SK/Meadow Lake"
  },
  {
    "label": "Onion Lake",
    "value": "CA/SK/Onion Lake"
  },
  {
    "label": "Pierceland",
    "value": "CA/SK/Pierceland"
  },
  {
    "label": "St Walburg",
    "value": "CA/SK/St Walburg"
  },
  {
    "label": "Waterhen Lake",
    "value": "CA/SK/Waterhen Lake"
  },
  {
    "label": "Whelan",
    "value": "CA/SK/Whelan"
  },
  {
    "label": "Bredenbury",
    "value": "CA/SK/Bredenbury"
  },
  {
    "label": "Broadview",
    "value": "CA/SK/Broadview"
  },
  {
    "label": "Churchbridge",
    "value": "CA/SK/Churchbridge"
  },
  {
    "label": "Duff",
    "value": "CA/SK/Duff"
  },
  {
    "label": "Esterhazy",
    "value": "CA/SK/Esterhazy"
  },
  {
    "label": "Fleming",
    "value": "CA/SK/Fleming"
  },
  {
    "label": "Glenavon",
    "value": "CA/SK/Glenavon"
  },
  {
    "label": "Goodeve",
    "value": "CA/SK/Goodeve"
  },
  {
    "label": "Grayson",
    "value": "CA/SK/Grayson"
  },
  {
    "label": "Grenfell",
    "value": "CA/SK/Grenfell"
  },
  {
    "label": "Killaly",
    "value": "CA/SK/Killaly"
  },
  {
    "label": "Kipling",
    "value": "CA/SK/Kipling"
  },
  {
    "label": "Langbank",
    "value": "CA/SK/Langbank"
  },
  {
    "label": "Langenburg",
    "value": "CA/SK/Langenburg"
  },
  {
    "label": "Lemberg",
    "value": "CA/SK/Lemberg"
  },
  {
    "label": "Moosomin",
    "value": "CA/SK/Moosomin"
  },
  {
    "label": "Neudorf",
    "value": "CA/SK/Neudorf"
  },
  {
    "label": "Rocanville",
    "value": "CA/SK/Rocanville"
  },
  {
    "label": "Spy Hill",
    "value": "CA/SK/Spy Hill"
  },
  {
    "label": "Stockholm",
    "value": "CA/SK/Stockholm"
  },
  {
    "label": "Tantallon",
    "value": "CA/SK/Tantallon"
  },
  {
    "label": "Wapella",
    "value": "CA/SK/Wapella"
  },
  {
    "label": "Welwyn",
    "value": "CA/SK/Welwyn"
  },
  {
    "label": "Whitewood",
    "value": "CA/SK/Whitewood"
  },
  {
    "label": "Wolseley",
    "value": "CA/SK/Wolseley"
  },
  {
    "label": "Beechy",
    "value": "CA/SK/Beechy"
  },
  {
    "label": "Bushell Park",
    "value": "CA/SK/Bushell Park"
  },
  {
    "label": "Caronport",
    "value": "CA/SK/Caronport"
  },
  {
    "label": "Central Butte",
    "value": "CA/SK/Central Butte"
  },
  {
    "label": "Chaplin",
    "value": "CA/SK/Chaplin"
  },
  {
    "label": "Coderre",
    "value": "CA/SK/Coderre"
  },
  {
    "label": "Courval",
    "value": "CA/SK/Courval"
  },
  {
    "label": "Eyebrow",
    "value": "CA/SK/Eyebrow"
  },
  {
    "label": "Herbert",
    "value": "CA/SK/Herbert"
  },
  {
    "label": "Hodgeville",
    "value": "CA/SK/Hodgeville"
  },
  {
    "label": "Lucky Lake",
    "value": "CA/SK/Lucky Lake"
  },
  {
    "label": "Marquis",
    "value": "CA/SK/Marquis"
  },
  {
    "label": "Moose Jaw",
    "value": "CA/SK/Moose Jaw"
  },
  {
    "label": "Morse",
    "value": "CA/SK/Morse"
  },
  {
    "label": "Mortlach",
    "value": "CA/SK/Mortlach"
  },
  {
    "label": "Parkbeg",
    "value": "CA/SK/Parkbeg"
  },
  {
    "label": "Riverhurst",
    "value": "CA/SK/Riverhurst"
  },
  {
    "label": "Tugaske",
    "value": "CA/SK/Tugaske"
  },
  {
    "label": "Waldeck",
    "value": "CA/SK/Waldeck"
  },
  {
    "label": "Chelan",
    "value": "CA/SK/Chelan"
  },
  {
    "label": "Choiceland",
    "value": "CA/SK/Choiceland"
  },
  {
    "label": "Codette",
    "value": "CA/SK/Codette"
  },
  {
    "label": "Love",
    "value": "CA/SK/Love"
  },
  {
    "label": "Prairie River",
    "value": "CA/SK/Prairie River"
  },
  {
    "label": "Smeaton",
    "value": "CA/SK/Smeaton"
  },
  {
    "label": "Snowden",
    "value": "CA/SK/Snowden"
  },
  {
    "label": "Ahtahkakoop First Nation",
    "value": "CA/SK/Ahtahkakoop First Nation"
  },
  {
    "label": "Air Ronge",
    "value": "CA/SK/Air Ronge"
  },
  {
    "label": "Albertville",
    "value": "CA/SK/Albertville"
  },
  {
    "label": "Barthel",
    "value": "CA/SK/Barthel"
  },
  {
    "label": "Bear Creek",
    "value": "CA/SK/Bear Creek"
  },
  {
    "label": "Beauval",
    "value": "CA/SK/Beauval"
  },
  {
    "label": "Big Island Lake Cree First Nation",
    "value": "CA/SK/Big Island Lake Cree First Nation"
  },
  {
    "label": "Big River First Nation",
    "value": "CA/SK/Big River First Nation"
  },
  {
    "label": "Birch Narrows First Nation",
    "value": "CA/SK/Birch Narrows First Nation"
  },
  {
    "label": "Black Lake",
    "value": "CA/SK/Black Lake"
  },
  {
    "label": "Black Lake First Nation",
    "value": "CA/SK/Black Lake First Nation"
  },
  {
    "label": "Black Point",
    "value": "CA/SK/Black Point"
  },
  {
    "label": "Brabant Lake",
    "value": "CA/SK/Brabant Lake"
  },
  {
    "label": "Buffalo Narrows",
    "value": "CA/SK/Buffalo Narrows"
  },
  {
    "label": "Buffalo River Dene First Nation",
    "value": "CA/SK/Buffalo River Dene First Nation"
  },
  {
    "label": "Camsell Portage",
    "value": "CA/SK/Camsell Portage"
  },
  {
    "label": "Candle Lake",
    "value": "CA/SK/Candle Lake"
  },
  {
    "label": "Canoe Lake Cree First Nation",
    "value": "CA/SK/Canoe Lake Cree First Nation"
  },
  {
    "label": "Canoe Narrows",
    "value": "CA/SK/Canoe Narrows"
  },
  {
    "label": "Carry The Kettle First Nation",
    "value": "CA/SK/Carry The Kettle First Nation"
  },
  {
    "label": "Chitek Lake",
    "value": "CA/SK/Chitek Lake"
  },
  {
    "label": "Christopher Lake",
    "value": "CA/SK/Christopher Lake"
  },
  {
    "label": "Clearwater River",
    "value": "CA/SK/Clearwater River"
  },
  {
    "label": "Clearwater River Dene First Nation",
    "value": "CA/SK/Clearwater River Dene First Nation"
  },
  {
    "label": "Cole Bay",
    "value": "CA/SK/Cole Bay"
  },
  {
    "label": "Creighton",
    "value": "CA/SK/Creighton"
  },
  {
    "label": "Cumberland House",
    "value": "CA/SK/Cumberland House"
  },
  {
    "label": "Cumberland House Cree First Nation",
    "value": "CA/SK/Cumberland House Cree First Nation"
  },
  {
    "label": "Denare Beach",
    "value": "CA/SK/Denare Beach"
  },
  {
    "label": "Deschambault Lake",
    "value": "CA/SK/Deschambault Lake"
  },
  {
    "label": "Descharme Lake",
    "value": "CA/SK/Descharme Lake"
  },
  {
    "label": "Dillon",
    "value": "CA/SK/Dillon"
  },
  {
    "label": "Dore Lake",
    "value": "CA/SK/Dore Lake"
  },
  {
    "label": "English River First Nation",
    "value": "CA/SK/English River First Nation"
  },
  {
    "label": "Flying Dust First Nation",
    "value": "CA/SK/Flying Dust First Nation"
  },
  {
    "label": "Fond Du Lac",
    "value": "CA/SK/Fond Du Lac"
  },
  {
    "label": "Fond Du Lac First Nation",
    "value": "CA/SK/Fond Du Lac First Nation"
  },
  {
    "label": "Foxford",
    "value": "CA/SK/Foxford"
  },
  {
    "label": "Garrick",
    "value": "CA/SK/Garrick"
  },
  {
    "label": "Garson Lake",
    "value": "CA/SK/Garson Lake"
  },
  {
    "label": "Green Lake",
    "value": "CA/SK/Green Lake"
  },
  {
    "label": "Hatchet Lake First Nation",
    "value": "CA/SK/Hatchet Lake First Nation"
  },
  {
    "label": "Henribourg",
    "value": "CA/SK/Henribourg"
  },
  {
    "label": "Ile-A-La-Crosse",
    "value": "CA/SK/Ile-A-La-Crosse"
  },
  {
    "label": "Island Lake First Nation",
    "value": "CA/SK/Island Lake First Nation"
  },
  {
    "label": "Jans Bay",
    "value": "CA/SK/Jans Bay"
  },
  {
    "label": "Kinoosao",
    "value": "CA/SK/Kinoosao"
  },
  {
    "label": "La Loche",
    "value": "CA/SK/La Loche"
  },
  {
    "label": "La Ronge",
    "value": "CA/SK/La Ronge"
  },
  {
    "label": "Lac La Ronge First Nation",
    "value": "CA/SK/Lac La Ronge First Nation"
  },
  {
    "label": "Makwa Sahgaiehcan First Nation",
    "value": "CA/SK/Makwa Sahgaiehcan First Nation"
  },
  {
    "label": "Meath Park",
    "value": "CA/SK/Meath Park"
  },
  {
    "label": "Michel Village",
    "value": "CA/SK/Michel Village"
  },
  {
    "label": "Missinipe",
    "value": "CA/SK/Missinipe"
  },
  {
    "label": "Montreal Lake",
    "value": "CA/SK/Montreal Lake"
  },
  {
    "label": "Montreal Lake First Nation",
    "value": "CA/SK/Montreal Lake First Nation"
  },
  {
    "label": "Northside",
    "value": "CA/SK/Northside"
  },
  {
    "label": "Onion Lake First Nation",
    "value": "CA/SK/Onion Lake First Nation"
  },
  {
    "label": "Paddockwood",
    "value": "CA/SK/Paddockwood"
  },
  {
    "label": "Patuanak",
    "value": "CA/SK/Patuanak"
  },
  {
    "label": "Pelican Lake First Nation",
    "value": "CA/SK/Pelican Lake First Nation"
  },
  {
    "label": "Pelican Narrows",
    "value": "CA/SK/Pelican Narrows"
  },
  {
    "label": "Peter Ballantyne Cree First Nation",
    "value": "CA/SK/Peter Ballantyne Cree First Nation"
  },
  {
    "label": "Pinehouse Lake",
    "value": "CA/SK/Pinehouse Lake"
  },
  {
    "label": "Prince Albert",
    "value": "CA/SK/Prince Albert"
  },
  {
    "label": "Rapid View",
    "value": "CA/SK/Rapid View"
  },
  {
    "label": "Sandy Bay",
    "value": "CA/SK/Sandy Bay"
  },
  {
    "label": "Shellbrook",
    "value": "CA/SK/Shellbrook"
  },
  {
    "label": "Shipman",
    "value": "CA/SK/Shipman"
  },
  {
    "label": "Sled Lake",
    "value": "CA/SK/Sled Lake"
  },
  {
    "label": "Southend",
    "value": "CA/SK/Southend"
  },
  {
    "label": "Spruce Home",
    "value": "CA/SK/Spruce Home"
  },
  {
    "label": "Spruce Lake",
    "value": "CA/SK/Spruce Lake"
  },
  {
    "label": "St Georges Hill",
    "value": "CA/SK/St Georges Hill"
  },
  {
    "label": "Stanley Mission",
    "value": "CA/SK/Stanley Mission"
  },
  {
    "label": "Stony Rapids",
    "value": "CA/SK/Stony Rapids"
  },
  {
    "label": "Stump Lake",
    "value": "CA/SK/Stump Lake"
  },
  {
    "label": "Sturgeon Lake First Nation",
    "value": "CA/SK/Sturgeon Lake First Nation"
  },
  {
    "label": "Sturgeon Landing",
    "value": "CA/SK/Sturgeon Landing"
  },
  {
    "label": "Thunderchild First Nation",
    "value": "CA/SK/Thunderchild First Nation"
  },
  {
    "label": "Timber Bay",
    "value": "CA/SK/Timber Bay"
  },
  {
    "label": "Turnor Lake",
    "value": "CA/SK/Turnor Lake"
  },
  {
    "label": "Uranium City",
    "value": "CA/SK/Uranium City"
  },
  {
    "label": "Wahpeton Dakota First Nation",
    "value": "CA/SK/Wahpeton Dakota First Nation"
  },
  {
    "label": "Weyakwin",
    "value": "CA/SK/Weyakwin"
  },
  {
    "label": "Witchekan Lake First Nation",
    "value": "CA/SK/Witchekan Lake First Nation"
  },
  {
    "label": "Wollaston Lake",
    "value": "CA/SK/Wollaston Lake"
  },
  {
    "label": "Macdowall",
    "value": "CA/SK/Macdowall"
  },
  {
    "label": "Prud'homme",
    "value": "CA/SK/Prud'homme"
  },
  {
    "label": "Weirdale",
    "value": "CA/SK/Weirdale"
  },
  {
    "label": "Abernethy",
    "value": "CA/SK/Abernethy"
  },
  {
    "label": "Balcarres",
    "value": "CA/SK/Balcarres"
  },
  {
    "label": "Balgonie",
    "value": "CA/SK/Balgonie"
  },
  {
    "label": "Bethune",
    "value": "CA/SK/Bethune"
  },
  {
    "label": "Buena Vista",
    "value": "CA/SK/Buena Vista"
  },
  {
    "label": "Bulyea",
    "value": "CA/SK/Bulyea"
  },
  {
    "label": "Chamberlain",
    "value": "CA/SK/Chamberlain"
  },
  {
    "label": "Coppersands",
    "value": "CA/SK/Coppersands"
  },
  {
    "label": "Craven",
    "value": "CA/SK/Craven"
  },
  {
    "label": "Cupar",
    "value": "CA/SK/Cupar"
  },
  {
    "label": "Davin",
    "value": "CA/SK/Davin"
  },
  {
    "label": "Dilke",
    "value": "CA/SK/Dilke"
  },
  {
    "label": "Dysart",
    "value": "CA/SK/Dysart"
  },
  {
    "label": "Earl Grey",
    "value": "CA/SK/Earl Grey"
  },
  {
    "label": "Edenwold",
    "value": "CA/SK/Edenwold"
  },
  {
    "label": "Fort Qu'appelle",
    "value": "CA/SK/Fort Qu'appelle"
  },
  {
    "label": "Francis",
    "value": "CA/SK/Francis"
  },
  {
    "label": "Holdfast",
    "value": "CA/SK/Holdfast"
  },
  {
    "label": "Indian Head",
    "value": "CA/SK/Indian Head"
  },
  {
    "label": "Kronau",
    "value": "CA/SK/Kronau"
  },
  {
    "label": "Lebret",
    "value": "CA/SK/Lebret"
  },
  {
    "label": "Lipton",
    "value": "CA/SK/Lipton"
  },
  {
    "label": "Lumsden",
    "value": "CA/SK/Lumsden"
  },
  {
    "label": "Montmartre",
    "value": "CA/SK/Montmartre"
  },
  {
    "label": "Pense",
    "value": "CA/SK/Pense"
  },
  {
    "label": "Pilot Butte",
    "value": "CA/SK/Pilot Butte"
  },
  {
    "label": "Qu'appelle",
    "value": "CA/SK/Qu'appelle"
  },
  {
    "label": "Regina",
    "value": "CA/SK/Regina"
  },
  {
    "label": "Richardson",
    "value": "CA/SK/Richardson"
  },
  {
    "label": "Rouleau",
    "value": "CA/SK/Rouleau"
  },
  {
    "label": "Southey",
    "value": "CA/SK/Southey"
  },
  {
    "label": "Stony Beach",
    "value": "CA/SK/Stony Beach"
  },
  {
    "label": "Vibank",
    "value": "CA/SK/Vibank"
  },
  {
    "label": "White City",
    "value": "CA/SK/White City"
  },
  {
    "label": "Wilcox",
    "value": "CA/SK/Wilcox"
  },
  {
    "label": "Zehner",
    "value": "CA/SK/Zehner"
  },
  {
    "label": "Beaver Creek",
    "value": "CA/SK/Beaver Creek"
  },
  {
    "label": "Cymric",
    "value": "CA/SK/Cymric"
  },
  {
    "label": "Eagle Ridge",
    "value": "CA/SK/Eagle Ridge"
  },
  {
    "label": "Lanigan",
    "value": "CA/SK/Lanigan"
  },
  {
    "label": "Abbey",
    "value": "CA/SK/Abbey"
  },
  {
    "label": "Alameda",
    "value": "CA/SK/Alameda"
  },
  {
    "label": "Alice Beach",
    "value": "CA/SK/Alice Beach"
  },
  {
    "label": "Atwater",
    "value": "CA/SK/Atwater"
  },
  {
    "label": "Avonhurst",
    "value": "CA/SK/Avonhurst"
  },
  {
    "label": "Avonlea",
    "value": "CA/SK/Avonlea"
  },
  {
    "label": "B-Say-Tah",
    "value": "CA/SK/B-Say-Tah"
  },
  {
    "label": "Bangor",
    "value": "CA/SK/Bangor"
  },
  {
    "label": "Beaubier",
    "value": "CA/SK/Beaubier"
  },
  {
    "label": "Belle Plaine",
    "value": "CA/SK/Belle Plaine"
  },
  {
    "label": "Bengough",
    "value": "CA/SK/Bengough"
  },
  {
    "label": "Benson",
    "value": "CA/SK/Benson"
  },
  {
    "label": "Big Beaver",
    "value": "CA/SK/Big Beaver"
  },
  {
    "label": "Birds Point",
    "value": "CA/SK/Birds Point"
  },
  {
    "label": "Briercrest",
    "value": "CA/SK/Briercrest"
  },
  {
    "label": "Broadview And District Centennial Lodge",
    "value": "CA/SK/Broadview And District Centennial Lodge"
  },
  {
    "label": "Bromhead",
    "value": "CA/SK/Bromhead"
  },
  {
    "label": "Candiac",
    "value": "CA/SK/Candiac"
  },
  {
    "label": "Ceylon",
    "value": "CA/SK/Ceylon"
  },
  {
    "label": "Claybank",
    "value": "CA/SK/Claybank"
  },
  {
    "label": "Colfax",
    "value": "CA/SK/Colfax"
  },
  {
    "label": "Colgate",
    "value": "CA/SK/Colgate"
  },
  {
    "label": "College Park Retirement Centre",
    "value": "CA/SK/College Park Retirement Centre"
  },
  {
    "label": "Cowessess",
    "value": "CA/SK/Cowessess"
  },
  {
    "label": "Cowessess First Nation",
    "value": "CA/SK/Cowessess First Nation"
  },
  {
    "label": "Creelman",
    "value": "CA/SK/Creelman"
  },
  {
    "label": "Deer Valley",
    "value": "CA/SK/Deer Valley"
  },
  {
    "label": "Disley",
    "value": "CA/SK/Disley"
  },
  {
    "label": "District Of Katepwa",
    "value": "CA/SK/District Of Katepwa"
  },
  {
    "label": "Drinkwater",
    "value": "CA/SK/Drinkwater"
  },
  {
    "label": "Dubuc",
    "value": "CA/SK/Dubuc"
  },
  {
    "label": "Dummer",
    "value": "CA/SK/Dummer"
  },
  {
    "label": "Edgeley",
    "value": "CA/SK/Edgeley"
  },
  {
    "label": "Fairlight",
    "value": "CA/SK/Fairlight"
  },
  {
    "label": "Fertile",
    "value": "CA/SK/Fertile"
  },
  {
    "label": "Fillmore",
    "value": "CA/SK/Fillmore"
  },
  {
    "label": "Findlater",
    "value": "CA/SK/Findlater"
  },
  {
    "label": "Forget",
    "value": "CA/SK/Forget"
  },
  {
    "label": "Fort San",
    "value": "CA/SK/Fort San"
  },
  {
    "label": "Gerald",
    "value": "CA/SK/Gerald"
  },
  {
    "label": "Gladmar",
    "value": "CA/SK/Gladmar"
  },
  {
    "label": "Glen Harbour",
    "value": "CA/SK/Glen Harbour"
  },
  {
    "label": "Goodwater",
    "value": "CA/SK/Goodwater"
  },
  {
    "label": "Grand Coulee",
    "value": "CA/SK/Grand Coulee"
  },
  {
    "label": "Grandview Beach",
    "value": "CA/SK/Grandview Beach"
  },
  {
    "label": "Gray",
    "value": "CA/SK/Gray"
  },
  {
    "label": "Griffin",
    "value": "CA/SK/Griffin"
  },
  {
    "label": "Halbrite",
    "value": "CA/SK/Halbrite"
  },
  {
    "label": "Hardy",
    "value": "CA/SK/Hardy"
  },
  {
    "label": "Hearne",
    "value": "CA/SK/Hearne"
  },
  {
    "label": "Heward",
    "value": "CA/SK/Heward"
  },
  {
    "label": "Island View",
    "value": "CA/SK/Island View"
  },
  {
    "label": "Kahkewistahaw First Nation",
    "value": "CA/SK/Kahkewistahaw First Nation"
  },
  {
    "label": "Kannata Valley",
    "value": "CA/SK/Kannata Valley"
  },
  {
    "label": "Kayville",
    "value": "CA/SK/Kayville"
  },
  {
    "label": "Kelso",
    "value": "CA/SK/Kelso"
  },
  {
    "label": "Kendal",
    "value": "CA/SK/Kendal"
  },
  {
    "label": "Kenosee Lake",
    "value": "CA/SK/Kenosee Lake"
  },
  {
    "label": "Khedive",
    "value": "CA/SK/Khedive"
  },
  {
    "label": "Lajord",
    "value": "CA/SK/Lajord"
  },
  {
    "label": "Lake Alma",
    "value": "CA/SK/Lake Alma"
  },
  {
    "label": "Lang",
    "value": "CA/SK/Lang"
  },
  {
    "label": "Lewvan",
    "value": "CA/SK/Lewvan"
  },
  {
    "label": "Little Black Bear First Nation",
    "value": "CA/SK/Little Black Bear First Nation"
  },
  {
    "label": "Lumsden Beach",
    "value": "CA/SK/Lumsden Beach"
  },
  {
    "label": "Macoun",
    "value": "CA/SK/Macoun"
  },
  {
    "label": "Marchwell",
    "value": "CA/SK/Marchwell"
  },
  {
    "label": "Markinch",
    "value": "CA/SK/Markinch"
  },
  {
    "label": "Mclean",
    "value": "CA/SK/Mclean"
  },
  {
    "label": "Mctaggart",
    "value": "CA/SK/Mctaggart"
  },
  {
    "label": "Melville",
    "value": "CA/SK/Melville"
  },
  {
    "label": "Melville Beach",
    "value": "CA/SK/Melville Beach"
  },
  {
    "label": "Midale",
    "value": "CA/SK/Midale"
  },
  {
    "label": "Minton",
    "value": "CA/SK/Minton"
  },
  {
    "label": "Muscowpetung First Nation",
    "value": "CA/SK/Muscowpetung First Nation"
  },
  {
    "label": "North Weyburn",
    "value": "CA/SK/North Weyburn"
  },
  {
    "label": "Northgate",
    "value": "CA/SK/Northgate"
  },
  {
    "label": "Ocean Man First Nation",
    "value": "CA/SK/Ocean Man First Nation"
  },
  {
    "label": "Ochapowace First Nation",
    "value": "CA/SK/Ochapowace First Nation"
  },
  {
    "label": "Odessa",
    "value": "CA/SK/Odessa"
  },
  {
    "label": "Ogema",
    "value": "CA/SK/Ogema"
  },
  {
    "label": "Okanese First Nation",
    "value": "CA/SK/Okanese First Nation"
  },
  {
    "label": "Ormiston",
    "value": "CA/SK/Ormiston"
  },
  {
    "label": "Osage",
    "value": "CA/SK/Osage"
  },
  {
    "label": "Oungre",
    "value": "CA/SK/Oungre"
  },
  {
    "label": "Pangman",
    "value": "CA/SK/Pangman"
  },
  {
    "label": "Parkman",
    "value": "CA/SK/Parkman"
  },
  {
    "label": "Parry",
    "value": "CA/SK/Parry"
  },
  {
    "label": "Pasqua",
    "value": "CA/SK/Pasqua"
  },
  {
    "label": "Pasqua First Nation",
    "value": "CA/SK/Pasqua First Nation"
  },
  {
    "label": "Peebles",
    "value": "CA/SK/Peebles"
  },
  {
    "label": "Peepeekisis First Nation",
    "value": "CA/SK/Peepeekisis First Nation"
  },
  {
    "label": "Pelican Pointe",
    "value": "CA/SK/Pelican Pointe"
  },
  {
    "label": "Pheasant Rump Nakota First Nation",
    "value": "CA/SK/Pheasant Rump Nakota First Nation"
  },
  {
    "label": "Piapot First Nation",
    "value": "CA/SK/Piapot First Nation"
  },
  {
    "label": "Radville",
    "value": "CA/SK/Radville"
  },
  {
    "label": "Regina Beach",
    "value": "CA/SK/Regina Beach"
  },
  {
    "label": "Riceton",
    "value": "CA/SK/Riceton"
  },
  {
    "label": "Roche Percee",
    "value": "CA/SK/Roche Percee"
  },
  {
    "label": "Sakimay First Nations",
    "value": "CA/SK/Sakimay First Nations"
  },
  {
    "label": "Saskatchewan Beach",
    "value": "CA/SK/Saskatchewan Beach"
  },
  {
    "label": "Sedley",
    "value": "CA/SK/Sedley"
  },
  {
    "label": "Silton",
    "value": "CA/SK/Silton"
  },
  {
    "label": "Sintaluta",
    "value": "CA/SK/Sintaluta"
  },
  {
    "label": "Spring Valley",
    "value": "CA/SK/Spring Valley"
  },
  {
    "label": "Standing Buffalo First Nation",
    "value": "CA/SK/Standing Buffalo First Nation"
  },
  {
    "label": "Star Blanket First Nation",
    "value": "CA/SK/Star Blanket First Nation"
  },
  {
    "label": "Steelman",
    "value": "CA/SK/Steelman"
  },
  {
    "label": "Storthoaks",
    "value": "CA/SK/Storthoaks"
  },
  {
    "label": "Summerberry",
    "value": "CA/SK/Summerberry"
  },
  {
    "label": "Sunset Cove",
    "value": "CA/SK/Sunset Cove"
  },
  {
    "label": "Tompkins",
    "value": "CA/SK/Tompkins"
  },
  {
    "label": "Torquay",
    "value": "CA/SK/Torquay"
  },
  {
    "label": "Tribune",
    "value": "CA/SK/Tribune"
  },
  {
    "label": "Trossachs",
    "value": "CA/SK/Trossachs"
  },
  {
    "label": "Truax",
    "value": "CA/SK/Truax"
  },
  {
    "label": "Tyvan",
    "value": "CA/SK/Tyvan"
  },
  {
    "label": "Viceroy",
    "value": "CA/SK/Viceroy"
  },
  {
    "label": "Waldron",
    "value": "CA/SK/Waldron"
  },
  {
    "label": "Waterhen Lake First Nation",
    "value": "CA/SK/Waterhen Lake First Nation"
  },
  {
    "label": "Wauchope",
    "value": "CA/SK/Wauchope"
  },
  {
    "label": "Wee Too Beach",
    "value": "CA/SK/Wee Too Beach"
  },
  {
    "label": "West End",
    "value": "CA/SK/West End"
  },
  {
    "label": "Weyburn",
    "value": "CA/SK/Weyburn"
  },
  {
    "label": "White Bear",
    "value": "CA/SK/White Bear"
  },
  {
    "label": "White Bear First Nation",
    "value": "CA/SK/White Bear First Nation"
  },
  {
    "label": "Windthorst",
    "value": "CA/SK/Windthorst"
  },
  {
    "label": "Yarbo",
    "value": "CA/SK/Yarbo"
  },
  {
    "label": "Yellow Grass",
    "value": "CA/SK/Yellow Grass"
  },
  {
    "label": "Admiral",
    "value": "CA/SK/Admiral"
  },
  {
    "label": "Ardill",
    "value": "CA/SK/Ardill"
  },
  {
    "label": "Aylesbury",
    "value": "CA/SK/Aylesbury"
  },
  {
    "label": "Bateman",
    "value": "CA/SK/Bateman"
  },
  {
    "label": "Beaver Flat",
    "value": "CA/SK/Beaver Flat"
  },
  {
    "label": "Blumenhof",
    "value": "CA/SK/Blumenhof"
  },
  {
    "label": "Brownlee",
    "value": "CA/SK/Brownlee"
  },
  {
    "label": "Burstall",
    "value": "CA/SK/Burstall"
  },
  {
    "label": "Cabri",
    "value": "CA/SK/Cabri"
  },
  {
    "label": "Cadillac",
    "value": "CA/SK/Cadillac"
  },
  {
    "label": "Cardross",
    "value": "CA/SK/Cardross"
  },
  {
    "label": "Carmichael",
    "value": "CA/SK/Carmichael"
  },
  {
    "label": "Caron",
    "value": "CA/SK/Caron"
  },
  {
    "label": "Congress",
    "value": "CA/SK/Congress"
  },
  {
    "label": "Demaine",
    "value": "CA/SK/Demaine"
  },
  {
    "label": "Dollard",
    "value": "CA/SK/Dollard"
  },
  {
    "label": "Ernfold",
    "value": "CA/SK/Ernfold"
  },
  {
    "label": "Ferland",
    "value": "CA/SK/Ferland"
  },
  {
    "label": "Fife Lake",
    "value": "CA/SK/Fife Lake"
  },
  {
    "label": "Flintoft",
    "value": "CA/SK/Flintoft"
  },
  {
    "label": "Fox Valley",
    "value": "CA/SK/Fox Valley"
  },
  {
    "label": "Golden Prairie",
    "value": "CA/SK/Golden Prairie"
  },
  {
    "label": "Gouldtown",
    "value": "CA/SK/Gouldtown"
  },
  {
    "label": "Gull Lake",
    "value": "CA/SK/Gull Lake"
  },
  {
    "label": "Hazlet",
    "value": "CA/SK/Hazlet"
  },
  {
    "label": "Keeler",
    "value": "CA/SK/Keeler"
  },
  {
    "label": "Kincaid",
    "value": "CA/SK/Kincaid"
  },
  {
    "label": "Kyle",
    "value": "CA/SK/Kyle"
  },
  {
    "label": "Lacadena",
    "value": "CA/SK/Lacadena"
  },
  {
    "label": "Lancer",
    "value": "CA/SK/Lancer"
  },
  {
    "label": "Leader",
    "value": "CA/SK/Leader"
  },
  {
    "label": "Liebenthal",
    "value": "CA/SK/Liebenthal"
  },
  {
    "label": "Lisieux",
    "value": "CA/SK/Lisieux"
  },
  {
    "label": "Main Centre",
    "value": "CA/SK/Main Centre"
  },
  {
    "label": "Mcmahon",
    "value": "CA/SK/Mcmahon"
  },
  {
    "label": "Melaval",
    "value": "CA/SK/Melaval"
  },
  {
    "label": "Mendham",
    "value": "CA/SK/Mendham"
  },
  {
    "label": "Meyronne",
    "value": "CA/SK/Meyronne"
  },
  {
    "label": "Neidpath",
    "value": "CA/SK/Neidpath"
  },
  {
    "label": "Nekaneet First Nation",
    "value": "CA/SK/Nekaneet First Nation"
  },
  {
    "label": "North Grove",
    "value": "CA/SK/North Grove"
  },
  {
    "label": "Orkney",
    "value": "CA/SK/Orkney"
  },
  {
    "label": "Palmer",
    "value": "CA/SK/Palmer"
  },
  {
    "label": "Pambrun",
    "value": "CA/SK/Pambrun"
  },
  {
    "label": "Portreeve",
    "value": "CA/SK/Portreeve"
  },
  {
    "label": "Prairie View",
    "value": "CA/SK/Prairie View"
  },
  {
    "label": "Prelate",
    "value": "CA/SK/Prelate"
  },
  {
    "label": "Richmound",
    "value": "CA/SK/Richmound"
  },
  {
    "label": "Robsart",
    "value": "CA/SK/Robsart"
  },
  {
    "label": "Rush Lake",
    "value": "CA/SK/Rush Lake"
  },
  {
    "label": "Sceptre",
    "value": "CA/SK/Sceptre"
  },
  {
    "label": "Scout Lake",
    "value": "CA/SK/Scout Lake"
  },
  {
    "label": "Shackleton",
    "value": "CA/SK/Shackleton"
  },
  {
    "label": "Shamrock",
    "value": "CA/SK/Shamrock"
  },
  {
    "label": "Simmie",
    "value": "CA/SK/Simmie"
  },
  {
    "label": "South Lake",
    "value": "CA/SK/South Lake"
  },
  {
    "label": "St Victor",
    "value": "CA/SK/St Victor"
  },
  {
    "label": "Stewart Valley",
    "value": "CA/SK/Stewart Valley"
  },
  {
    "label": "Success",
    "value": "CA/SK/Success"
  },
  {
    "label": "Sun Valley",
    "value": "CA/SK/Sun Valley"
  },
  {
    "label": "Swift Current",
    "value": "CA/SK/Swift Current"
  },
  {
    "label": "Tuxford",
    "value": "CA/SK/Tuxford"
  },
  {
    "label": "Vanguard",
    "value": "CA/SK/Vanguard"
  },
  {
    "label": "Verwood",
    "value": "CA/SK/Verwood"
  },
  {
    "label": "Vidora",
    "value": "CA/SK/Vidora"
  },
  {
    "label": "Webb",
    "value": "CA/SK/Webb"
  },
  {
    "label": "Wood Mountain First Nation",
    "value": "CA/SK/Wood Mountain First Nation"
  },
  {
    "label": "Wymark",
    "value": "CA/SK/Wymark"
  },
  {
    "label": "Pennant Station",
    "value": "CA/SK/Pennant Station"
  },
  {
    "label": "Clair",
    "value": "CA/SK/Clair"
  },
  {
    "label": "West Bend",
    "value": "CA/SK/West Bend"
  },
  {
    "label": "Milestone",
    "value": "CA/SK/Milestone"
  },
  {
    "label": "Calder",
    "value": "CA/SK/Calder"
  },
  {
    "label": "Ebenezer",
    "value": "CA/SK/Ebenezer"
  },
  {
    "label": "Good Spirit Acres",
    "value": "CA/SK/Good Spirit Acres"
  },
  {
    "label": "Veregin",
    "value": "CA/SK/Veregin"
  },
  {
    "label": "Yellow Quill",
    "value": "CA/SK/Yellow Quill"
  },
  {
    "label": "Beaver Creek",
    "value": "CA/YT/Beaver Creek"
  },
  {
    "label": "Burwash Landing",
    "value": "CA/YT/Burwash Landing"
  },
  {
    "label": "Destruction Bay",
    "value": "CA/YT/Destruction Bay"
  },
  {
    "label": "Haines Junction",
    "value": "CA/YT/Haines Junction"
  },
  {
    "label": "Faro",
    "value": "CA/YT/Faro"
  },
  {
    "label": "Ross River",
    "value": "CA/YT/Ross River"
  },
  {
    "label": "Watson Lake",
    "value": "CA/YT/Watson Lake"
  },
  {
    "label": "Dawson",
    "value": "CA/YT/Dawson"
  },
  {
    "label": "Old Crow",
    "value": "CA/YT/Old Crow"
  },
  {
    "label": "Carmacks",
    "value": "CA/YT/Carmacks"
  },
  {
    "label": "Elsa",
    "value": "CA/YT/Elsa"
  },
  {
    "label": "Mayo",
    "value": "CA/YT/Mayo"
  },
  {
    "label": "Pelly Crossing",
    "value": "CA/YT/Pelly Crossing"
  },
  {
    "label": "Carcross",
    "value": "CA/YT/Carcross"
  },
  {
    "label": "Marsh Lake",
    "value": "CA/YT/Marsh Lake"
  },
  {
    "label": "Tagish",
    "value": "CA/YT/Tagish"
  },
  {
    "label": "Whitehorse",
    "value": "CA/YT/Whitehorse"
  },
  {
    "label": "Teslin",
    "value": "CA/YT/Teslin"
  }
].sort((a, b) => a.label.localeCompare(b.label));
