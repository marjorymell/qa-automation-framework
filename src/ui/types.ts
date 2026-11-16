export type Title = 'Mr' | 'Mrs';

/** Countries offered by the Automation Exercise signup form. */
export const COUNTRIES = [
  'India',
  'United States',
  'Canada',
  'Australia',
  'Israel',
  'New Zealand',
  'Singapore',
] as const;

export type Country = (typeof COUNTRIES)[number];

export interface Account {
  title: Title;
  name: string;
  email: string;
  password: string;
  birthDate: { day: number; month: number; year: number };
  newsletter: boolean;
  specialOffers: boolean;
  address: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    country: Country;
    state: string;
    city: string;
    zipcode: string;
    mobileNumber: string;
  };
}
