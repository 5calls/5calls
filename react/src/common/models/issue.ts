import { Outcome } from './contactEvent';

export interface Issue {
  id: number;
  name: string;
  contactType: string;
  contactAreas: string[];
  reason: string;
  script: string;
  categories: Category[];
  active: boolean;
  hidden: boolean;
  createdAt: string;
  slug: string;
  outcomeModels: Outcome[];
  link: string;
  linkTitle: string;
  stats: IssueStats;

  // public slugOrID(): string {
  //   if (this.slug !== "") {
  //     return this.slug;
  //   }

  //   return this.id.toString();
  // }

  // public numberOfContacts(contactList: ContactList): number {
  //   return this.filteredContacts(contactList).length;
  // }

  // public numberOfCompletedContacts(contactList: ContactList, userEvents: UserContactEvent[]): number {
  //   return this.filteredContacts(contactList).filter((contact) => this.isContactComplete(contact, userEvents)).length;
  // }

  // public currentContact(contactList: ContactList, contactIndex: number): Contact | undefined {
  //   const contacts = this.filteredContacts(contactList);

  //   if (contactIndex <= contacts.length) {
  //     return contacts[contactIndex];
  //   }

  //   return undefined;
  // }

  // // why do we need filtered contacts if we already have an array of contacts?
  // // a) ensuring consistent ordering
  // // b) sometimes we get back multiple house reps in split areas
  // public filteredContacts(contactList: ContactList): Contact[] {
  //   const contacts: Contact[] = [];

  //   for (const contactArea of this.contactAreas) {
  //     if (contactArea === "US Senate") {
  //       contacts.push(...contactList.senateReps());
  //     } else if (contactArea === "US House") {
  //       contacts.push(...contactList.houseRep());
  //     } else if (contactArea === "Governor") {
  //       contacts.push(...contactList.governor());
  //     } else if (contactArea === "StateUpper") {
  //       contacts.push(...contactList.stateUpper());
  //     } else if (contactArea === "StateLower") {
  //       contacts.push(...contactList.stateLower());
  //     } else if (contactArea === "SecretaryOfState") {
  //       contacts.push(...contactList.secState());
  //     } else if (contactArea === "AttorneyGeneral") {
  //       contacts.push(...contactList.attyGeneral());
  //     }
  //   }

  //   return contacts;
  // }

  // public isContactComplete(contact: Contact, userEvents: UserContactEvent[]): boolean {
  //   return userEvents.findIndex((event) => event.issueid === this.id.toString() && event.contactid === contact.id) > -1;
  // }

  // public listItemLabel(): string {
  //   switch (this.contactType) {
  //     case "REPS":
  //       return "Call reps" + this.countLabel();
  //     case "ACTION":
  //       return "Take action" + this.countLabel();
  //     default:
  //       return "???";
  //   }
  // }

  // public countLabel(): string {
  //   if (this.stats.calls < 10) {
  //     return "";
  //   }

  //   switch (this.contactType) {
  //     case "REPS":
  //       return " ⋆ " + this.stats.calls + " calls made";
  //     case "ACTION":
  //       return " ⋆ " + this.stats.calls + " actions taken";
  //     default:
  //       return "???";
  //   }
  // }
}

export interface IssueStats {
  completion: number;
  calls: number;
}

export interface Category {
  name: string;
}
