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

import { Translations, Configuration, MapHelplineLanguage, ContactType } from '../types';
import { PreEngagementFormDefinition, EMAIL_PATTERN } from '../src/pre-engagement-form';

const accountSid = 'AC6ca34b61e7bf2d7cf8b8ca24e7efe65f';
const flexFlowSid = 'FO005120845e65f5d54a17b8ab6d0bf3f3';
const defaultLanguage = 'es-CL';
const captureIp = true;
const checkOpenHours = false;
const contactType: ContactType = 'email';

const closedHours: PreEngagementFormDefinition = {
  description:
    'Hola, bienvenid@ a Línea Libre. Gracias por escribirnos. Recibimos tu mensaje exitosamente. En estos comentos nos encontramos fuera del horario de atención. Te recordamos que éste es de lunes a viernes entre las 10:00 y las 22:00 hrs. Nuestr@s psicólog@s estarán disponibles para ti una vez iniciada la jornada. En caso de tener alguna emergencia, te sugerimos llamar a: Salud Responde 600 360 7777 - Fono niñ@s 147 - Fono familia 149.',
  fields: [],
};

const holidayHours: PreEngagementFormDefinition = {
  description:
    'Hola, bienvenid@ a Línea Libre. Gracias por escribirnos. Recibimos tu mensaje exitosamente. Por ser feriado legal, nuestros psicólog@s no se encuentran atendiendo, pero estarán disponibles para ti una vez que retomemos el horario habitual. Te recordamos que éste es de lunes a viernes entre las 10:00 y las 22:00 hrs. En caso de tener alguna emergencia, te sugerimos llamar a: Salud Responde 600 360 7777 - Fono niñ@s 147 - Fono familia 149.',
  fields: [],
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'WelcomeMessage',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'input-text',
      name: 'friendlyName',
      label: 'Nickname',
      placeholder: 'Nickname',
      required: true,
    },
    {
      type: 'input-text',
      name: 'contactIdentifier',
      label: 'Email',
      required: true,
      placeholder: 'Email',
      pattern: {
        value: EMAIL_PATTERN,
        message: 'FieldValidationInvalidEmail',
      },
    },
    {
      label: 'Edad',
      type: 'select',
      name: 'age',
      required: true,
      defaultValue: '',
      options: [
        {
          value: '',
          label: '',
        },
        {
          value: '<5',
          label: '<5',
        },
        {
          value: '05',
          label: '5',
        },
        {
          value: '06',
          label: '6',
        },
        {
          value: '07',
          label: '7',
        },
        {
          value: '08',
          label: '8',
        },
        {
          value: '09',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
        {
          value: '17',
          label: '17',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '19',
          label: '19',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '22',
          label: '22',
        },
        {
          value: '23',
          label: '23',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '26',
          label: '26',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '28',
          label: '28',
        },
        {
          value: '29',
          label: '29',
        },
        {
          value: '>29',
          label: '>29',
        },
      ],
    },
    {
      type: 'select',
      name: 'gender',
      label: 'Gender',
      defaultValue: '',
      required: true,
      options: [
        { value: '', label: '' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Femenino', label: 'Femenino' },
        { value: 'Otro', label: 'Otro' },
        { value: 'Prefiero no decir', label: 'PrefieroNoDecir' },
      ],
    },
    {
      type: 'select',
      name: 'province',
      label: 'Región',
      required: true,
      defaultValue: '',
      options: [
        {
          value: '',
          label: '',
        },
        {
          value: 'Arica y Parinacota',
          label: 'Arica y Parinacota',
        },
        {
          value: 'Tarapacá',
          label: 'Tarapacá',
        },
        {
          value: 'Antofagasta',
          label: 'Antofagasta',
        },
        {
          value: 'Atacama',
          label: 'Atacama',
        },
        {
          value: 'Coquimbo',
          label: 'Coquimbo',
        },
        {
          value: 'Valparaíso',
          label: 'Valparaíso',
        },
        {
          value: "Lib. Gral. Bernardo O'Higgins",
          label: "Lib. Gral. Bernardo O'Higgins",
        },
        {
          value: 'Maule',
          label: 'Maule',
        },
        {
          value: 'Ñuble',
          label: 'Ñuble',
        },
        {
          value: 'Biobío',
          label: 'Biobío',
        },
        {
          value: 'La Araucanía',
          label: 'La Araucanía',
        },
        {
          value: 'Los Ríos',
          label: 'Los Ríos',
        },
        {
          value: 'Los Lagos',
          label: 'Los Lagos',
        },
        {
          value: 'Aysén',
          label: 'Aysén',
        },
        {
          value: 'Magallanes y Antártica Chilena',
          label: 'Magallanes y Antártica Chilena',
        },
        {
          value: 'Metropolitana de Santiago',
          label: 'Metropolitana de Santiago',
        },
      ],
    },
    {
      name: 'district',
      label: 'Comuna',
      type: 'dependent-select',
      dependsOn: 'province',
      required: true,
      options: {
        'Arica y Parinacota': [
          {
            value: '',
            label: '',
          },
          {
            value: 'Arica',
            label: 'Arica',
          },
          {
            value: 'Camarones',
            label: 'Camarones',
          },
          {
            value: 'Putre',
            label: 'Putre',
          },
          {
            value: 'General Lagos',
            label: 'General Lagos',
          },
        ],
        Tarapacá: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Iquique',
            label: 'Iquique',
          },
          {
            value: 'Alto Hospicio',
            label: 'Alto Hospicio',
          },
          {
            value: 'Pozo Almonte',
            label: 'Pozo Almonte',
          },
          {
            value: 'Camiña',
            label: 'Camiña',
          },
          {
            value: 'Colchane',
            label: 'Colchane',
          },
          {
            value: 'Huara',
            label: 'Huara',
          },
          {
            value: 'Pica',
            label: 'Pica',
          },
        ],
        Antofagasta: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Antofagasta',
            label: 'Antofagasta',
          },
          {
            value: 'Mejillones',
            label: 'Mejillones',
          },
          {
            value: 'Sierra Gorda',
            label: 'Sierra Gorda',
          },
          {
            value: 'Taltal',
            label: 'Taltal',
          },
          {
            value: 'Calama',
            label: 'Calama',
          },
          {
            value: 'Ollagüe',
            label: 'Ollagüe',
          },
          {
            value: 'San Pedro de Atacama',
            label: 'San Pedro de Atacama',
          },
          {
            value: 'Tocopilla',
            label: 'Tocopilla',
          },
          {
            value: 'María Elena',
            label: 'María Elena',
          },
        ],
        Atacama: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Copiapó',
            label: 'Copiapó',
          },
          {
            value: 'Caldera',
            label: 'Caldera',
          },
          {
            value: 'Tierra Amarilla',
            label: 'Tierra Amarilla',
          },
          {
            value: 'Chañaral',
            label: 'Chañaral',
          },
          {
            value: 'Diego de Almagro',
            label: 'Diego de Almagro',
          },
          {
            value: 'Vallenar',
            label: 'Vallenar',
          },
          {
            value: 'Alto del Carmen',
            label: 'Alto del Carmen',
          },
          {
            value: 'Freirina',
            label: 'Freirina',
          },
          {
            value: 'Huasco',
            label: 'Huasco',
          },
        ],
        Coquimbo: [
          {
            value: '',
            label: '',
          },
          {
            value: 'La Serena',
            label: 'La Serena',
          },
          {
            value: 'Coquimbo',
            label: 'Coquimbo',
          },
          {
            value: 'Andacollo',
            label: 'Andacollo',
          },
          {
            value: 'La Higuera',
            label: 'La Higuera',
          },
          {
            value: 'Paihuano',
            label: 'Paihuano',
          },
          {
            value: 'Vicuña',
            label: 'Vicuña',
          },
          {
            value: 'Illapel',
            label: 'Illapel',
          },
          {
            value: 'Canela',
            label: 'Canela',
          },
          {
            value: 'Los Vilos',
            label: 'Los Vilos',
          },
          {
            value: 'Salamanca',
            label: 'Salamanca',
          },
          {
            value: 'Ovalle',
            label: 'Ovalle',
          },
          {
            value: 'Combarbalá',
            label: 'Combarbalá',
          },
          {
            value: 'Monte Patria',
            label: 'Monte Patria',
          },
          {
            value: 'Punitaqui',
            label: 'Punitaqui',
          },
          {
            value: 'Río Hurtado',
            label: 'Río Hurtado',
          },
        ],
        Valparaíso: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Valparaíso',
            label: 'Valparaíso',
          },
          {
            value: 'Casablanca',
            label: 'Casablanca',
          },
          {
            value: 'Concón',
            label: 'Concón',
          },
          {
            value: 'Juan Fernández',
            label: 'Juan Fernández',
          },
          {
            value: 'Puchuncaví',
            label: 'Puchuncaví',
          },
          {
            value: 'Quintero',
            label: 'Quintero',
          },
          {
            value: 'Viña del Mar',
            label: 'Viña del Mar',
          },
          {
            value: 'Isla de Pascua',
            label: 'Isla de Pascua',
          },
          {
            value: 'Los Andes',
            label: 'Los Andes',
          },
          {
            value: 'Calle Larga',
            label: 'Calle Larga',
          },
          {
            value: 'Rinconada',
            label: 'Rinconada',
          },
          {
            value: 'San Esteban',
            label: 'San Esteban',
          },
          {
            value: 'La Ligua',
            label: 'La Ligua',
          },
          {
            value: 'Cabildo',
            label: 'Cabildo',
          },
          {
            value: 'Papudo',
            label: 'Papudo',
          },
          {
            value: 'Petorca',
            label: 'Petorca',
          },
          {
            value: 'Zapallar',
            label: 'Zapallar',
          },
          {
            value: 'Quillota',
            label: 'Quillota',
          },
          {
            value: 'La Calera',
            label: 'La Calera',
          },
          {
            value: 'Hijuelas',
            label: 'Hijuelas',
          },
          {
            value: 'La Cruz',
            label: 'La Cruz',
          },
          {
            value: 'Nogales',
            label: 'Nogales',
          },
          {
            value: 'San Antonio',
            label: 'San Antonio',
          },
          {
            value: 'Algarrobo',
            label: 'Algarrobo',
          },
          {
            value: 'Cartagena',
            label: 'Cartagena',
          },
          {
            value: 'El Quisco',
            label: 'El Quisco',
          },
          {
            value: 'El Tabo',
            label: 'El Tabo',
          },
          {
            value: 'Santo Domingo',
            label: 'Santo Domingo',
          },
          {
            value: 'San Felipe',
            label: 'San Felipe',
          },
          {
            value: 'Catemu',
            label: 'Catemu',
          },
          {
            value: 'Llay-Llay',
            label: 'Llay-Llay',
          },
          {
            value: 'Panquehue',
            label: 'Panquehue',
          },
          {
            value: 'Putaendo',
            label: 'Putaendo',
          },
          {
            value: 'Santa María',
            label: 'Santa María',
          },
          {
            value: 'Quilpué',
            label: 'Quilpué',
          },
          {
            value: 'Limache',
            label: 'Limache',
          },
          {
            value: 'Olmué',
            label: 'Olmué',
          },
          {
            value: 'Villa Alemana',
            label: 'Villa Alemana',
          },
        ],
        "Lib. Gral. Bernardo O'Higgins": [
          {
            value: '',
            label: '',
          },
          {
            value: 'Rancagua',
            label: 'Rancagua',
          },
          {
            value: 'Codegua',
            label: 'Codegua',
          },
          {
            value: 'Coinco',
            label: 'Coinco',
          },
          {
            value: 'Coltauco',
            label: 'Coltauco',
          },
          {
            value: 'Doñihue',
            label: 'Doñihue',
          },
          {
            value: 'Graneros',
            label: 'Graneros',
          },
          {
            value: 'Las Cabras',
            label: 'Las Cabras',
          },
          {
            value: 'Machalí',
            label: 'Machalí',
          },
          {
            value: 'Malloa',
            label: 'Malloa',
          },
          {
            value: 'Mostazal',
            label: 'Mostazal',
          },
          {
            value: 'Olivar',
            label: 'Olivar',
          },
          {
            value: 'Peumo',
            label: 'Peumo',
          },
          {
            value: 'Pichidegua',
            label: 'Pichidegua',
          },
          {
            value: 'Quinta de Tilcoco',
            label: 'Quinta de Tilcoco',
          },
          {
            value: 'Rengo',
            label: 'Rengo',
          },
          {
            value: 'Requínoa',
            label: 'Requínoa',
          },
          {
            value: 'San Vicente',
            label: 'San Vicente',
          },
          {
            value: 'Pichilemu',
            label: 'Pichilemu',
          },
          {
            value: 'La Estrella',
            label: 'La Estrella',
          },
          {
            value: 'Litueche',
            label: 'Litueche',
          },
          {
            value: 'Marchihue',
            label: 'Marchihue',
          },
          {
            value: 'Navidad',
            label: 'Navidad',
          },
          {
            value: 'Paredones',
            label: 'Paredones',
          },
          {
            value: 'San Fernando',
            label: 'San Fernando',
          },
          {
            value: 'Chépica',
            label: 'Chépica',
          },
          {
            value: 'Chimbarongo',
            label: 'Chimbarongo',
          },
          {
            value: 'Lolol',
            label: 'Lolol',
          },
          {
            value: 'Nancagua',
            label: 'Nancagua',
          },
          {
            value: 'Palmilla',
            label: 'Palmilla',
          },
          {
            value: 'Peralillo',
            label: 'Peralillo',
          },
          {
            value: 'Placilla',
            label: 'Placilla',
          },
          {
            value: 'Pumanque',
            label: 'Pumanque',
          },
          {
            value: 'Santa Cruz',
            label: 'Santa Cruz',
          },
        ],
        Maule: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Talca',
            label: 'Talca',
          },
          {
            value: 'Constitución',
            label: 'Constitución',
          },
          {
            value: 'Curepto',
            label: 'Curepto',
          },
          {
            value: 'Empedrado',
            label: 'Empedrado',
          },
          {
            value: 'Maule',
            label: 'Maule',
          },
          {
            value: 'Pelarco',
            label: 'Pelarco',
          },
          {
            value: 'Pencahue',
            label: 'Pencahue',
          },
          {
            value: 'Río Claro',
            label: 'Río Claro',
          },
          {
            value: 'San Clemente',
            label: 'San Clemente',
          },
          {
            value: 'San Rafael',
            label: 'San Rafael',
          },
          {
            value: 'Cauquenes',
            label: 'Cauquenes',
          },
          {
            value: 'Chanco',
            label: 'Chanco',
          },
          {
            value: 'Pelluhue',
            label: 'Pelluhue',
          },
          {
            value: 'Curicó',
            label: 'Curicó',
          },
          {
            value: 'Hualañé',
            label: 'Hualañé',
          },
          {
            value: 'Licantén',
            label: 'Licantén',
          },
          {
            value: 'Molina',
            label: 'Molina',
          },
          {
            value: 'Rauco',
            label: 'Rauco',
          },
          {
            value: 'Romeral',
            label: 'Romeral',
          },
          {
            value: 'Sagrada Familia',
            label: 'Sagrada Familia',
          },
          {
            value: 'Teno',
            label: 'Teno',
          },
          {
            value: 'Vichuquén',
            label: 'Vichuquén',
          },
          {
            value: 'Linares',
            label: 'Linares',
          },
          {
            value: 'Colbún',
            label: 'Colbún',
          },
          {
            value: 'Longaví',
            label: 'Longaví',
          },
          {
            value: 'Parral',
            label: 'Parral',
          },
          {
            value: 'Retiro',
            label: 'Retiro',
          },
          {
            value: 'San Javier',
            label: 'San Javier',
          },
          {
            value: 'Villa Alegre',
            label: 'Villa Alegre',
          },
          {
            value: 'Yerbas Buenas',
            label: 'Yerbas Buenas',
          },
        ],
        Ñuble: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Chillán',
            label: 'Chillán',
          },
          {
            value: 'Bulnes',
            label: 'Bulnes',
          },
          {
            value: 'Chillán Viejo',
            label: 'Chillán Viejo',
          },
          {
            value: 'El Carmen',
            label: 'El Carmen',
          },
          {
            value: 'Pemuco',
            label: 'Pemuco',
          },
          {
            value: 'Pinto',
            label: 'Pinto',
          },
          {
            value: 'Quillón',
            label: 'Quillón',
          },
          {
            value: 'San Ignacio',
            label: 'San Ignacio',
          },
          {
            value: 'Yungay',
            label: 'Yungay',
          },
          {
            value: 'Quirihue',
            label: 'Quirihue',
          },
          {
            value: 'Cobquecura',
            label: 'Cobquecura',
          },
          {
            value: 'Coelemu',
            label: 'Coelemu',
          },
          {
            value: 'Ninhue',
            label: 'Ninhue',
          },
          {
            value: 'Portezuelo',
            label: 'Portezuelo',
          },
          {
            value: 'Ránquil',
            label: 'Ránquil',
          },
          {
            value: 'Treguaco',
            label: 'Treguaco',
          },
          {
            value: 'San Carlos',
            label: 'San Carlos',
          },
          {
            value: 'Coihueco',
            label: 'Coihueco',
          },
          {
            value: 'Ñiquén',
            label: 'Ñiquén',
          },
          {
            value: 'San Fabián',
            label: 'San Fabián',
          },
          {
            value: 'San Nicolás',
            label: 'San Nicolás',
          },
        ],
        Biobío: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Concepción',
            label: 'Concepción',
          },
          {
            value: 'Coronel',
            label: 'Coronel',
          },
          {
            value: 'Chiguayante',
            label: 'Chiguayante',
          },
          {
            value: 'Florida',
            label: 'Florida',
          },
          {
            value: 'Hualqui',
            label: 'Hualqui',
          },
          {
            value: 'Lota',
            label: 'Lota',
          },
          {
            value: 'Penco',
            label: 'Penco',
          },
          {
            value: 'San Pedro de La Paz',
            label: 'San Pedro de La Paz',
          },
          {
            value: 'Santa Juana',
            label: 'Santa Juana',
          },
          {
            value: 'Talcahuano',
            label: 'Talcahuano',
          },
          {
            value: 'Tomé',
            label: 'Tomé',
          },
          {
            value: 'Hualpén',
            label: 'Hualpén',
          },
          {
            value: 'Lebu',
            label: 'Lebu',
          },
          {
            value: 'Arauco',
            label: 'Arauco',
          },
          {
            value: 'Cañete',
            label: 'Cañete',
          },
          {
            value: 'Contulmo',
            label: 'Contulmo',
          },
          {
            value: 'Curanilahue',
            label: 'Curanilahue',
          },
          {
            value: 'Los Álamos',
            label: 'Los Álamos',
          },
          {
            value: 'Tirúa',
            label: 'Tirúa',
          },
          {
            value: 'Los Ángeles',
            label: 'Los Ángeles',
          },
          {
            value: 'Antuco',
            label: 'Antuco',
          },
          {
            value: 'Cabrero',
            label: 'Cabrero',
          },
          {
            value: 'Laja',
            label: 'Laja',
          },
          {
            value: 'Mulchén',
            label: 'Mulchén',
          },
          {
            value: 'Nacimiento',
            label: 'Nacimiento',
          },
          {
            value: 'Negrete',
            label: 'Negrete',
          },
          {
            value: 'Quilaco',
            label: 'Quilaco',
          },
          {
            value: 'Quilleco',
            label: 'Quilleco',
          },
          {
            value: 'San Rosendo',
            label: 'San Rosendo',
          },
          {
            value: 'Santa Bárbara',
            label: 'Santa Bárbara',
          },
          {
            value: 'Tucapel',
            label: 'Tucapel',
          },
          {
            value: 'Yumbel',
            label: 'Yumbel',
          },
          {
            value: 'Alto Biobío',
            label: 'Alto Biobío',
          },
        ],
        'La Araucanía': [
          {
            value: '',
            label: '',
          },
          {
            value: 'Temuco',
            label: 'Temuco',
          },
          {
            value: 'Carahue',
            label: 'Carahue',
          },
          {
            value: 'Cunco',
            label: 'Cunco',
          },
          {
            value: 'Curarrehue',
            label: 'Curarrehue',
          },
          {
            value: 'Freire',
            label: 'Freire',
          },
          {
            value: 'Galvarino',
            label: 'Galvarino',
          },
          {
            value: 'Gorbea',
            label: 'Gorbea',
          },
          {
            value: 'Lautaro',
            label: 'Lautaro',
          },
          {
            value: 'Loncoche',
            label: 'Loncoche',
          },
          {
            value: 'Melipeuco',
            label: 'Melipeuco',
          },
          {
            value: 'Nueva Imperial',
            label: 'Nueva Imperial',
          },
          {
            value: 'Padre Las Casas',
            label: 'Padre Las Casas',
          },
          {
            value: 'Perquenco',
            label: 'Perquenco',
          },
          {
            value: 'Pitrufquén',
            label: 'Pitrufquén',
          },
          {
            value: 'Pucón',
            label: 'Pucón',
          },
          {
            value: 'Saavedra',
            label: 'Saavedra',
          },
          {
            value: 'Teodoro Schmidt',
            label: 'Teodoro Schmidt',
          },
          {
            value: 'Toltén',
            label: 'Toltén',
          },
          {
            value: 'Vilcún',
            label: 'Vilcún',
          },
          {
            value: 'Villarrica',
            label: 'Villarrica',
          },
          {
            value: 'Cholchol',
            label: 'Cholchol',
          },
          {
            value: 'Angol',
            label: 'Angol',
          },
          {
            value: 'Collipulli',
            label: 'Collipulli',
          },
          {
            value: 'Curacautín',
            label: 'Curacautín',
          },
          {
            value: 'Ercilla',
            label: 'Ercilla',
          },
          {
            value: 'Lonquimay',
            label: 'Lonquimay',
          },
          {
            value: 'Los Sauces',
            label: 'Los Sauces',
          },
          {
            value: 'Lumaco',
            label: 'Lumaco',
          },
          {
            value: 'Purén',
            label: 'Purén',
          },
          {
            value: 'Renaico',
            label: 'Renaico',
          },
          {
            value: 'Traiguén',
            label: 'Traiguén',
          },
          {
            value: 'Victoria',
            label: 'Victoria',
          },
        ],
        'Los Ríos': [
          {
            value: '',
            label: '',
          },
          {
            value: 'Valdivia',
            label: 'Valdivia',
          },
          {
            value: 'Corral',
            label: 'Corral',
          },
          {
            value: 'Lanco',
            label: 'Lanco',
          },
          {
            value: 'Los Lagos',
            label: 'Los Lagos',
          },
          {
            value: 'Máfil',
            label: 'Máfil',
          },
          {
            value: 'Mariquina',
            label: 'Mariquina',
          },
          {
            value: 'Paillaco',
            label: 'Paillaco',
          },
          {
            value: 'Panguipulli',
            label: 'Panguipulli',
          },
          {
            value: 'La Unión',
            label: 'La Unión',
          },
          {
            value: 'Futrono',
            label: 'Futrono',
          },
          {
            value: 'Lago Ranco',
            label: 'Lago Ranco',
          },
          {
            value: 'Río Bueno',
            label: 'Río Bueno',
          },
        ],
        'Los Lagos': [
          {
            value: '',
            label: '',
          },
          {
            value: 'Puerto Montt',
            label: 'Puerto Montt',
          },
          {
            value: 'Calbuco',
            label: 'Calbuco',
          },
          {
            value: 'Cochamó',
            label: 'Cochamó',
          },
          {
            value: 'Fresia',
            label: 'Fresia',
          },
          {
            value: 'Frutillar',
            label: 'Frutillar',
          },
          {
            value: 'Los Muermos',
            label: 'Los Muermos',
          },
          {
            value: 'Llanquihue',
            label: 'Llanquihue',
          },
          {
            value: 'Maullín',
            label: 'Maullín',
          },
          {
            value: 'Puerto Varas',
            label: 'Puerto Varas',
          },
          {
            value: 'Castro',
            label: 'Castro',
          },
          {
            value: 'Ancud',
            label: 'Ancud',
          },
          {
            value: 'Chonchi',
            label: 'Chonchi',
          },
          {
            value: 'Curaco de Vélez',
            label: 'Curaco de Vélez',
          },
          {
            value: 'Dalcahue',
            label: 'Dalcahue',
          },
          {
            value: 'Puqueldón',
            label: 'Puqueldón',
          },
          {
            value: 'Queilén',
            label: 'Queilén',
          },
          {
            value: 'Quellón',
            label: 'Quellón',
          },
          {
            value: 'Quemchi',
            label: 'Quemchi',
          },
          {
            value: 'Quinchao',
            label: 'Quinchao',
          },
          {
            value: 'Osorno',
            label: 'Osorno',
          },
          {
            value: 'Puerto Octay',
            label: 'Puerto Octay',
          },
          {
            value: 'Purranque',
            label: 'Purranque',
          },
          {
            value: 'Puyehue',
            label: 'Puyehue',
          },
          {
            value: 'Río Negro',
            label: 'Río Negro',
          },
          {
            value: 'San Juan de la Costa',
            label: 'San Juan de la Costa',
          },
          {
            value: 'San Pablo',
            label: 'San Pablo',
          },
          {
            value: 'Chaitén',
            label: 'Chaitén',
          },
          {
            value: 'Futaleufú',
            label: 'Futaleufú',
          },
          {
            value: 'Hualaihué',
            label: 'Hualaihué',
          },
          {
            value: 'Palena',
            label: 'Palena',
          },
        ],
        Aysén: [
          {
            value: '',
            label: '',
          },
          {
            value: 'Coyhaique',
            label: 'Coyhaique',
          },
          {
            value: 'Lago Verde',
            label: 'Lago Verde',
          },
          {
            value: 'Aysén',
            label: 'Aysén',
          },
          {
            value: 'Cisnes',
            label: 'Cisnes',
          },
          {
            value: 'Guaitecas',
            label: 'Guaitecas',
          },
          {
            value: 'Cochrane',
            label: 'Cochrane',
          },
          {
            value: "O'Higgins",
            label: "O'Higgins",
          },
          {
            value: 'Tortel',
            label: 'Tortel',
          },
          {
            value: 'Chile Chico',
            label: 'Chile Chico',
          },
          {
            value: 'Río Ibáñez',
            label: 'Río Ibáñez',
          },
        ],
        'Magallanes y Antártica Chilena': [
          {
            value: '',
            label: '',
          },
          {
            value: 'Punta Arenas',
            label: 'Punta Arenas',
          },
          {
            value: 'Laguna Blanca',
            label: 'Laguna Blanca',
          },
          {
            value: 'Río Verde',
            label: 'Río Verde',
          },
          {
            value: 'San Gregorio',
            label: 'San Gregorio',
          },
          {
            value: 'Cabo de Hornos',
            label: 'Cabo de Hornos',
          },
          {
            value: 'Antártica',
            label: 'Antártica',
          },
          {
            value: 'Porvenir',
            label: 'Porvenir',
          },
          {
            value: 'Primavera',
            label: 'Primavera',
          },
          {
            value: 'Timaukel',
            label: 'Timaukel',
          },
          {
            value: 'Natales',
            label: 'Natales',
          },
          {
            value: 'Torres del Paine',
            label: 'Torres del Paine',
          },
        ],
        'Metropolitana de Santiago': [
          {
            value: '',
            label: '',
          },
          {
            value: 'Santiago',
            label: 'Santiago',
          },
          {
            value: 'Cerrillos',
            label: 'Cerrillos',
          },
          {
            value: 'Cerro Navia',
            label: 'Cerro Navia',
          },
          {
            value: 'Conchalí',
            label: 'Conchalí',
          },
          {
            value: 'El Bosque',
            label: 'El Bosque',
          },
          {
            value: 'Estación Central',
            label: 'Estación Central',
          },
          {
            value: 'Huechuraba',
            label: 'Huechuraba',
          },
          {
            value: 'Independencia',
            label: 'Independencia',
          },
          {
            value: 'La Cisterna',
            label: 'La Cisterna',
          },
          {
            value: 'La Florida',
            label: 'La Florida',
          },
          {
            value: 'La Granja',
            label: 'La Granja',
          },
          {
            value: 'La Pintana',
            label: 'La Pintana',
          },
          {
            value: 'La Reina',
            label: 'La Reina',
          },
          {
            value: 'Las Condes',
            label: 'Las Condes',
          },
          {
            value: 'Lo Barnechea',
            label: 'Lo Barnechea',
          },
          {
            value: 'Lo Espejo',
            label: 'Lo Espejo',
          },
          {
            value: 'Lo Prado',
            label: 'Lo Prado',
          },
          {
            value: 'Macul',
            label: 'Macul',
          },
          {
            value: 'Maipú',
            label: 'Maipú',
          },
          {
            value: 'Ñuñoa',
            label: 'Ñuñoa',
          },
          {
            value: 'Pedro Aguirre Cerda',
            label: 'Pedro Aguirre Cerda',
          },
          {
            value: 'Peñalolén',
            label: 'Peñalolén',
          },
          {
            value: 'Providencia',
            label: 'Providencia',
          },
          {
            value: 'Pudahuel',
            label: 'Pudahuel',
          },
          {
            value: 'Quilicura',
            label: 'Quilicura',
          },
          {
            value: 'Quinta Normal',
            label: 'Quinta Normal',
          },
          {
            value: 'Recoleta',
            label: 'Recoleta',
          },
          {
            value: 'Renca',
            label: 'Renca',
          },
          {
            value: 'San Joaquín',
            label: 'San Joaquín',
          },
          {
            value: 'San Miguel',
            label: 'San Miguel',
          },
          {
            value: 'San Ramón',
            label: 'San Ramón',
          },
          {
            value: 'Vitacura',
            label: 'Vitacura',
          },
          {
            value: 'Puente Alto',
            label: 'Puente Alto',
          },
          {
            value: 'Pirque',
            label: 'Pirque',
          },
          {
            value: 'San José de Maipo',
            label: 'San José de Maipo',
          },
          {
            value: 'Colina',
            label: 'Colina',
          },
          {
            value: 'Lampa',
            label: 'Lampa',
          },
          {
            value: 'Til Til',
            label: 'Til Til',
          },
          {
            value: 'San Bernardo',
            label: 'San Bernardo',
          },
          {
            value: 'Buin',
            label: 'Buin',
          },
          {
            value: 'Calera de Tango',
            label: 'Calera de Tango',
          },
          {
            value: 'Paine',
            label: 'Paine',
          },
          {
            value: 'Melipilla',
            label: 'Melipilla',
          },
          {
            value: 'Alhué',
            label: 'Alhué',
          },
          {
            value: 'Curacaví',
            label: 'Curacaví',
          },
          {
            value: 'María Pinto',
            label: 'María Pinto',
          },
          {
            value: 'San Pedro',
            label: 'San Pedro',
          },
          {
            value: 'Talagante',
            label: 'Talagante',
          },
          {
            value: 'El Monte',
            label: 'El Monte',
          },
          {
            value: 'Isla de Maipo',
            label: 'Isla de Maipo',
          },
          {
            value: 'Padre Hurtado',
            label: 'Padre Hurtado',
          },
          {
            value: 'Peñaflor',
            label: 'Peñaflor',
          },
        ],
      },
    },
    {
      type: 'select',
      name: 'reason',
      label: '¿Qué tipo de ayuda estás buscando?',
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "emergency",
          label: "Necesito ayuda urgente"
        },
        {
          value: "counselling",
          label: "Quiero recibir orientación"
        },
        {
          value: "Unknown",
          label: "Otro"
        }
      ],
    },
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label:
        'He leído y acepto los <a href="https://www.linealibre.cl/wp-content/uploads/2020/11/TERMINOS-Y-CONDICIONES-DE-USO-Y-POLITICA-DE-PRIVACIDAD-LL.pdf">términos y condiciones</a>',
      required: {
        value: true,
        message: 'Tienes que approbar los términos y condiciones para poder iniciar un chat.',
      },
    },
  ],
};

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to  Línea Libre',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a practitioner.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'Counselor is typing',
    StartChat: 'Start Chat!',
    MessageCanvasTrayButton: 'Start New Chat',
    Email: 'Email',
    Edad: 'Age',
    Gender: 'What is your gender',
    Masculino: 'Male',
    Femenino: 'Female',
    Otro: 'Other',
    PrefieroNoDecir: 'Prefer not to say',
    Nickname: 'Nickname',
  },
  'es-CL': {
    WelcomeMessage: '¡Bienvenid@ a Línea Libre!',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      'Muchas gracias por la información. Lo transferiremos ahora. Por favor espere for un agente.',
    AutoFirstMessage: 'Nuevo contacto del webchat de',
    TypingIndicator: '{0} está escribiendo ... ',
    StartChat: 'Comenzar Nuevo Chat!',
    MessageCanvasTrayButton: 'Comenzar Nuevo Chat',
    EntryPointTagline: 'Chatea con nosotros',
    InvalidPreEngagementMessage:
      'Los formularios previos al compromiso no se han establecido y son necesarios para iniciar el chat web. Por favor configúrelos ahora en la configuración.',
    InvalidPreEngagementButton: 'Aprende más',
    PredefinedChatMessageAuthorName: 'Bot',
    PredefinedChatMessageBody: '¡Hola! ¿Cómo podemos ayudarte hoy?',
    InputPlaceHolder: 'Escribe un mensaje',
    Read: 'Visto',
    MessageSendingDisabled: 'El envío de mensajes ha sido desactivado',
    Today: 'HOY',
    Yesterday: 'AYER',
    Save: 'GUARDAR',
    Reset: 'RESETEAR',
    MessageCharacterCountStatus: '{{currentCharCount}} / {{maxCharCount}}',
    SendMessageTooltip: 'Enviar Mensaje',
    FieldValidationRequiredField: 'Campo requerido',
    FieldValidationInvalidEmail: 'Por favor provea una dirección válida de email',
    PreEngagementDescription: 'Comencemos',
    BotGreeting: '¿Cómo puedo ayudar?',
    Gender: '¿Cuál es tu género?',
    Masculino: 'Masculino',
    Femenino: 'Femenino',
    Otro: 'Otro',
    PrefieroNoDecir: 'Prefiero no decir',
    Email: 'Email',
    Edad: 'Edad',
    Nickname: 'Nickname',
  },
};

const memberDisplayOptions = {
  yourDefaultName: 'Usted',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Psicólog@',
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  switch (helpline) {
    default:
      return defaultLanguage;
  }
};

export const config: Configuration = {
  accountSid,
  flexFlowSid,
  defaultLanguage,
  translations,
  preEngagementConfig,
  closedHours,
  holidayHours,
  checkOpenHours,
  mapHelplineLanguage,
  memberDisplayOptions,
  captureIp,
  contactType,
};
