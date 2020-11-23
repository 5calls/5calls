import { Contact } from "./contact";

export class ContactList {
  public location: string;
  public representatives: Contact[];

  constructor() {
    this.location = "";
    this.representatives = [];
  }

  public senateReps(): Contact[] {
    return this.representatives.filter((contact) => contact.area === "US Senate");
  }

  // there may be multiple house reps returned here, only return one for now
  public houseRep(): Contact[] {
    const contacts: Contact[] = [];
    const houseRep = this.representatives.find((contact) => contact.area === "US House");
    if (houseRep) {
      contacts.push(houseRep);
    }
    return contacts;
  }

  public governor(): Contact[] {
    return this.representatives.filter((contact) => contact.area === "Governor");
  }

  public stateUpper(): Contact[] {
    return this.representatives.filter((contact) => contact.area === "StateUpper");
  }

  public stateLower(): Contact[] {
    return this.representatives.filter((contact) => contact.area === "StateLower");
  }

  public secState(): Contact[] {
    return this.representatives.filter((contact) => contact.area === "SecretaryOfState");
  }
  public attyGeneral(): Contact[] {
    return this.representatives.filter((contact) => contact.area === "AttorneyGeneral");
  }
}
