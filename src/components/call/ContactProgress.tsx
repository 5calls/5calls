import * as React from 'react';

import { Contact, ContactList, Issue } from '../../common/models';
import { CallState } from '../../redux/callState';
import { UserStatsState } from '../../redux/userStats';
import {
  HELP_SET_LOCATION,
  HELP_OTHER_REPRESENTATIVES
} from '../../common/constants';

interface Props {
  readonly currentIssue: Issue;
  readonly callState: CallState;
  readonly userStatsState: UserStatsState;
  readonly contactList: ContactList;
  readonly currentContact?: Contact;
  readonly selectContact: (index: number) => void;
}

export const ContactProgress: React.StatelessComponent<Props> = ({
  currentIssue,
  callState,
  userStatsState,
  contactList,
  currentContact,
  selectContact
}: Props) => {
  const contactCalled = (contact: Contact): Boolean => {
    if (userStatsState.all) {
      let completed = userStatsState.all.filter(result => {
        return (
          result.contactid === contact.id &&
          result.issueid === currentIssue.id.toString()
        );
      });
      if (completed.length > 0) {
        return true;
      }
    }

    return false;
  };

  const repPhoto = (contact: Contact | undefined): string => {
    if (contact) {
      // contact has been called for this issue
      if (contactCalled(contact)) {
        return '/img/contacted.png';
      } else if (contact.photoURL) {
        return contact.photoURL;
      }
    }

    return '/img/no-rep.png';
  };

  const listItem = (
    area: string,
    areaContact: Contact | undefined,
    active: boolean,
    index: number
  ) => {
    return (
      <li key={index} className={active ? 'active' : ''}>
        {areaContact ? (
          <>
            <img
              alt={areaContact.name}
              src={repPhoto(areaContact)}
              onError={e => {
                e.currentTarget.src = '/img/no-rep.png';
              }}
            />
            <h4>{areaContact.contactDisplay()}</h4>
          </>
        ) : (
          <>
            <img alt="No contact available" src="/img/no-rep.png" />
            <h4>{area}</h4>
          </>
        )}
        <p>
          {areaContact ? (
            areaContact.reason
          ) : (
            <>
              Location not accurate enough to find this representative.{' '}
              <a href={HELP_SET_LOCATION} target="_blank">
                Set your location
              </a>
            </>
          )}
        </p>
      </li>
    );
  };

  // each string is a area identifier, plus a contact if we have one
  const contactsForArea = (areas: string[]): [string, Contact?][] => {
    let contactsWanted: [string, Contact?][] = [];

    for (let area of currentIssue.contactAreas) {
      switch (area) {
        case 'US Senate':
          contactsWanted.push([
            area,
            contactList.senateReps().length > 0
              ? contactList.senateReps()[0]
              : undefined
          ]);
          contactsWanted.push([
            area,
            contactList.senateReps().length > 1
              ? contactList.senateReps()[1]
              : undefined
          ]);
          break;
        case 'US House':
          // deal with this: multiple house reps might return if we don't know which district
          contactsWanted.push([
            area,
            contactList.houseRep().length > 0
              ? contactList.houseRep()[0]
              : undefined
          ]);
          break;
        case 'Governor':
          contactsWanted.push([
            area,
            contactList.governor().length > 0
              ? contactList.governor()[0]
              : undefined
          ]);
          break;
        case 'StateUpper':
          contactsWanted.push([
            area,
            contactList.stateUpper().length > 0
              ? contactList.stateUpper()[0]
              : undefined
          ]);
          break;
        case 'StateLower':
          contactsWanted.push([
            area,
            contactList.stateLower().length > 0
              ? contactList.stateLower()[0]
              : undefined
          ]);
          break;
        case 'SecretaryOfState':
          contactsWanted.push([
            area,
            contactList.secState().length > 0
              ? contactList.secState()[0]
              : undefined
          ]);
          break;
        case 'AttorneyGeneral':
          contactsWanted.push([
            area,
            contactList.attyGeneral().length > 0
              ? contactList.attyGeneral()[0]
              : undefined
          ]);
          break;
        default:
          break;
      }
    }

    return contactsWanted;
  };

  if (currentIssue.contactAreas.length === 0) {
    return <span />;
  }

  return (
    <div className="contact-progress">
      <h3>Contacts for this topic:</h3>
      <ul>
        {contactsForArea(currentIssue.contactAreas).map((areaMap, index) => {
          const isActiveContact = areaMap[1] === currentContact;
          return listItem(areaMap[0], areaMap[1], isActiveContact, index);
        })}
      </ul>
      {contactList.representatives.length > 0 && (
        <p className="help">
          <a href={HELP_OTHER_REPRESENTATIVES} target="_blank">
            Where are the rest of my representatives?
          </a>
        </p>
      )}
    </div>
  );
};
