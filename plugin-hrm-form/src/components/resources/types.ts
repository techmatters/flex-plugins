export type KhpUiResource = {
  resourceSid: string;
  name: string;
  attributes: {
    status: string;
    taxonomyCode: string;
    description: string;
    mainContact: {
      name: string;
      title: string;
      phoneNumber: string;
      email: string;
      isPrivate: boolean;
    };
    website: string;
    available247: string;
    ageRange: string;
    targetPopulation: string;
    interpretationTranslationServicesAvailable: string;
    feeStructureSource: string | null;
    howToAccessSupport: string;
    applicationProcess: string;
    howIsServiceOffered: string;
    accessibility: string;
    documentsRequired: string[];
    primaryLocationIsPrivate: boolean;
    primaryLocation: string;
    operations: {
      day: string;
      hoursOfOperation: string | null;
      descriptionOfHours: string | null;
    }[];
    site: {
      siteId: string;
      name: string;
      location: {
        address1: string;
        address2: string | null;
        city: string;
        county: string;
        postalCode: string;
        province: string;
        country: string;
      };
      phoneNumbers: {
        [key: string]: string;
      };
      email: string;
      operations: {
        day: string;
        hoursOfOperation: string | null;
        descriptionOfHours: string | null;
      }[];
      isActive: boolean;
      details: string;
      isLocationPrivate: boolean;
    }[];
  };
};

export type Language = 'en' | 'fr' | '';
