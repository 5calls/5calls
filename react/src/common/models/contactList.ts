import { Contact } from "./contact";

export enum ContactArea {
  USSenate = "US Senate",
  USHouse = "US House",
  Governor = "Governor",
  AttorneyGeneral = "AttorneyGeneral",
  SecretaryOfState = "SecretaryOfState",
  StateUpper = "StateUpper",
  StateLower = "StateLower",
}

export class ContactList {
  public location: string;
  public lowAccuracy: boolean;
  public state: string;
  public district: string;
  public representatives: Contact[];

  constructor() {
    this.location = "";
    this.lowAccuracy = false;
    this.state = "";
    this.district = "";
    this.representatives = [];
  }

  public senateReps(): Contact[] {
    return this.representatives.filter((contact) => contact.area === ContactArea.USSenate);
  }

  // there may be multiple house reps returned here, only return one for now
  public houseRep(): Contact[] {
    const contacts: Contact[] = [];
    const houseRep = this.representatives.find((contact) => contact.area === ContactArea.USHouse);
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

  public generalizedLocationID(): string {
    return `${this.state}-${this.district}`
  }
}
