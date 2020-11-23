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

  // public contactDisplay(): string {
  //   if (this.partyStateAbbr() !== "") {
  //     return this.name + " (" + this.partyStateAbbr() + ")";
  //   }

  //   return this.name;
  // }

  // public partyStateAbbr(): string {
  //   if (this.party && this.state !== "") {
  //     const partyLetter = this.party.substring(0, 1);
  //     return partyLetter.toUpperCase() + "-" + this.state.toUpperCase();
  //   }

  //   return "";
  // }
}

export type Party = "democrat" | "republican" | "independent" | "";

export interface FieldOffice {
  city: string;
  phone: string;
}
