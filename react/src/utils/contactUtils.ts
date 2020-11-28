import { Contact } from "../common/models/contact";

const partyAndState = (contact: Contact): string => {
  if (contact.party && contact.state !== "") {
    const partyLetter = contact.party.substring(0, 1);
    return partyLetter.toUpperCase() + "-" + contact.state.toUpperCase();
  }

  return "";
};

export default { partyAndState };
