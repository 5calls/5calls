import React from "react";

import { Contact, FieldOffice } from "../common/models/contact";
import { ContactList } from "../common/models/contactList";

const partyAndState = (contact: Contact): string => {
  if (contact.party && contact.state !== "") {
    const partyLetter = contact.party.substring(0, 1);
    return partyLetter.toUpperCase() + "-" + contact.state.toUpperCase();
  }

  return "";
};

const allContacts = (contactList: ContactList): Contact[] => {
  let contacts: Contact[] = [];

  // sometimes we pass back multiple house reps, the first is most likely
  const houseReps = contactList.houseRep();
  if (houseReps.length > 0) {
    contacts.push(houseReps[0]);
  }
  contacts.push(...contactList.senateReps());

  return contacts;
};

const makePhoneLink = (phoneNumber: string): JSX.Element => {
  if (phoneNumber) {
    return <a href={`tel:${phoneNumber.replace(/-| /g, "")}`}>{phoneNumber.replace(/^\+1 /, "")}</a>;
  } else {
    return <></>;
  }
};

const cityFormat = (office: FieldOffice, contact: Contact): JSX.Element => {
  if (office.city) {
    return <span>{` - ${office.city}, ${contact.state}`}</span>;
  } else {
    return <span />;
  }
};

interface ContactUtils {
  partyAndState(contact: Contact): string;
  allContacts(contactList: ContactList): Contact[];
  makePhoneLink(phoneNumber: string): JSX.Element;
  cityFormat(office: FieldOffice, contact: Contact): JSX.Element;
}

export default { partyAndState, allContacts, makePhoneLink, cityFormat } as ContactUtils;
