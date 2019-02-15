import { Party, FieldOffice } from './model';

export class Contact {
  id: string;
  name: string;
  phone: string;
  photoURL?: string;
  party: Party;
  state: string;
  reason: string;
  area?: string;
  // tslint:disable-next-line:variable-name
  field_offices?: FieldOffice[];

  public contactDisplay(): string {
    if (this.partyStateAbbr() !== '') {
      return this.name + ' (' + this.partyStateAbbr() + ')';
    }

    return this.name;
  }

  public partyStateAbbr(): string {
    if (this.party && this.state !== '') {
      const partyLetter = this.party.substring(0, 1);
      return partyLetter.toUpperCase() + '-' + this.state.toUpperCase();
    }

    return '';
  }
}

export const mockContact = Object.assign(new Contact(), {
  id: 123,
  name: 'Mock Contact III',
  phone: '4155551212',
  photoURL: undefined,
  party: 'Democrat',
  state: 'CA',
  reason: 'This is your mock representative',
  area: undefined,
  field_offices: []
});
