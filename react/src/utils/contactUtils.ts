import { contact } from "../common/constants";
import { Contact } from "../common/models/contact";
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

interface ContactUtils {
  partyAndState(contact: Contact): string;
  allContacts(contactList: ContactList): Contact[];
}

export default { partyAndState, allContacts } as ContactUtils;
