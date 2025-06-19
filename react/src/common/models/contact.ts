export interface Contact {
  id: string;
  name: string;
  phone: string;
  photoURL?: string;
  party: Party;
  state: string;
  reason: string;
  area?: string;
  field_offices?: FieldOffice[];
}

export type Party = 'democrat' | 'republican' | 'independent' | '';

export interface FieldOffice {
  city: string;
  phone: string;
}

export interface MissingSeat {
  id: string;
  reason: string;
  area?: string;
}
