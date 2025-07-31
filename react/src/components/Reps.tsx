import React, { createRef } from 'react';

import { toast } from 'react-toastify';
import { Contact, Party } from '../common/models/contact';
import { OutcomeData } from '../common/models/contactEvent';
import { ContactArea, ContactList } from '../common/models/contactList';
import { WithCompletedProps } from '../state/completedState';
import { WithLocationProps } from '../state/locationState';
import { withCompleted, withLocation } from '../state/stateProvider';
import { getContacts, postOutcomeData } from '../utils/api';
import ContactUtils from '../utils/contactUtils';
import { useSettings } from '../utils/useSettings';
import ActiveContact from './ActiveContact';
import stateNameFromAbbr from '../utils/stateNames';

interface Props {
  callingGroup?: string;
}

interface State {
  areas: string[];
  issueId: string;
  requiredState: string;
  contactList: ContactList | undefined;
  activeContactIndex: number;
}

const TOAST_SETTINGS = {
  autoClose: 2500,
  position: 'bottom-center'
};

const TOAST_DELAY = 750;

type Outcome = 'contact' | 'voicemail' | 'skip' | 'unavailable';

const createAndSendToast = ({
  outcome,
  currentContact,
  nextContact
}: {
  outcome: Outcome;
  currentContact: Contact | undefined;
  nextContact: Contact | undefined;
}) => {
  let outcomeMessage = '';
  if (outcome === 'contact') {
    outcomeMessage = `Contacted ${currentContact?.name}!`;
  } else if (outcome === 'voicemail') {
    outcomeMessage = `Left a voicemail for ${currentContact?.name}!`;
  } else if (outcome === 'skip') {
    outcomeMessage = `Skipped ${currentContact?.name}.`;
  } else if (outcome === 'unavailable') {
    outcomeMessage = `${currentContact?.name} was unavailable.`;
  }

  const finalMessage = (
    <div style={{ marginLeft: '.5rem' }}>
      <div>{outcomeMessage}</div>
      {nextContact?.name && (
        <div style={{ marginTop: '.2rem' }}>
          Next up: call <b>{nextContact?.name}</b>.
        </div>
      )}
    </div>
  );

  if (outcome === 'contact' || outcome === 'voicemail') {
    toast.success(finalMessage, TOAST_SETTINGS);
  } else {
    toast.info(finalMessage, TOAST_SETTINGS);
  }
};

const RepsWithSettings = (
  props: Props & WithLocationProps & WithCompletedProps
) => {
  const { callingGroup } = useSettings();
  return <Reps {...props} callingGroup={callingGroup} />;
};

class Reps extends React.Component<
  Props & WithLocationProps & WithCompletedProps,
  State
> {
  _defaultAreas: string[] = [];
  _defaultContactList: ContactList | undefined = undefined;

  private componentRef = createRef<HTMLDivElement>();
  state = {
    areas: this._defaultAreas,
    issueId: '0000',
    requiredState: '',
    contactList: this._defaultContactList,
    activeContactIndex: 0
  };

  componentDidMount() {
    let areaString = '';
    let requiredState = '';

    const thisComponent = this.componentRef.current;
    if (thisComponent && thisComponent.parentElement) {
      areaString = thisComponent.parentElement.dataset.repAreas ?? '';
      requiredState = thisComponent.parentElement.dataset.requiredState ?? '';
      const areas = areaString.split(',');
      const issueId = thisComponent.parentElement.dataset.issueId ?? '';
      this.setState({ areas, issueId, requiredState });
    }

    if (!this.state.contactList) {
      // if we don't have contacts, fetch the contacts
      this.updateContacts(areaString.split(','));
    }

    document.addEventListener('nextContact', (e) => {
      const outcome: string = (e as CustomEvent).detail;

      const contacts = this.contactsForArea(
        this.state.areas,
        this.state.contactList ?? ({} as ContactList)
      );

      let currentContact: Contact | undefined;
      if (contacts.length >= this.state.activeContactIndex) {
        currentContact = contacts[this.state.activeContactIndex];
      }

      if (outcome !== 'skip') {
        const viaParameter =
          window.location.host === '5calls.org' ? 'web' : 'test';

        gtag('event', 'conversion', {
          send_to: 'AW-16875388196/mI3GCNKZurMaEKT65-4-'
        });

        const outcomeData: OutcomeData = {
          outcome: outcome,
          issueId: this.state.issueId,
          contactId: currentContact?.id ?? 'no-contact-id',
          via: viaParameter,
          group: this.props.callingGroup
        };
        postOutcomeData(outcomeData);
      }

      const isFinished = this.state.activeContactIndex >= contacts.length - 1;

      if (!isFinished) {
        const activeContactIndex = this.state.activeContactIndex + 1;
        this.setState({ activeContactIndex });
        this.reportUpdatedActiveContact(contacts[activeContactIndex]);

        document.getElementById('rep-contact')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });

        setTimeout(() => {
          createAndSendToast({
            outcome: outcome as Outcome,
            currentContact,
            nextContact: contacts[activeContactIndex]
          });
        }, TOAST_DELAY);
      } else {
        this.props.setCompletedIssueMap({
          [this.state.issueId]: Date.now()
        });

        // if we load the next page too soon, the previous outcome is sometimes skipped
        // 300ms is something arbitrary I picked
        setTimeout(() => {
          window.location.pathname = window.location.pathname + '/done/';
        }, 300);
      }
    });
  }

  componentDidUpdate(prevProps: Props & WithLocationProps) {
    if (
      prevProps.locationState?.address !== this.props.locationState?.address
    ) {
      this.updateContacts(this.state.areas);
    }
  }

  reportUpdatedActiveContact(contact: Contact) {
    // yuck, I don't have a good way to sync state across different-root components yet
    // so script component just listens to this
    const activeContactEvent = new CustomEvent('activeContact', {
      detail: contact
    });
    document.dispatchEvent(activeContactEvent);
  }

  addAlwaysAvailableAreas(areas: string[]) {
    const irrelevantVisibleAreas = [];
    const houseOrSenateAreas = [ContactArea.USHouse, ContactArea.USSenate];
    const hasHouseOrSenate =
      areas.includes(ContactArea.USHouse) ||
      areas.includes(ContactArea.USSenate);

    if (hasHouseOrSenate) {
      // Show both house and senate if at least one is relevant
      for (const area of houseOrSenateAreas) {
        if (!areas.includes(area)) irrelevantVisibleAreas.push(area);
      }
      return [...areas, ...irrelevantVisibleAreas];
    } else {
      // Don't show house and senate if neither is relevant
      return areas;
    }
  }

  updateContacts(areas: string[] = []) {
    // Make sure we're fetching all reps even if irrelevant
    const completeAreas = this.addAlwaysAvailableAreas(areas);
    const completeAreasString = completeAreas.join(',');

    if (this.props.locationState) {
      getContacts(this.props.locationState.address, completeAreasString)
        .then((contactList) => {
          this.setState({ activeContactIndex: 0, contactList });
          const contacts = this.contactsForArea(this.state.areas, contactList);
          if (contacts.length > 0) {
            // start our script component with an active contact
            this.reportUpdatedActiveContact(contacts[0]);
            // report that reps loaded for outcomes to load
            const loadedRepsEvent = new CustomEvent('loadedReps');
            document.dispatchEvent(loadedRepsEvent);
          }
        })
        .catch((error) => {
          console.log('error getting reps:', error);
        });
    }
  }

  contactsForArea(areas: string[], contactList: ContactList): Contact[] {
    let contacts: Contact[] = [];

    contacts = ContactUtils.allContacts(contactList).filter((contact) => {
      for (const area of areas) {
        if (area === contact.area) {
          return true;
        }
      }
      return false;
    });

    return contacts;
  }

  visibleIrrelevantContacts(
    areas: string[],
    contactList: ContactList
  ): Contact[] {
    let contacts: Contact[] = [];

    // filter out the relevant contacts
    contacts = ContactUtils.allContacts(contactList)
      .filter((contact) => {
        for (const area of areas) {
          if (area === contact.area) {
            return false;
          }
        }
        return true;
      })
      .map((contact) => {
        return {
          ...contact,
          reason: `${contact.area === ContactArea.USHouse ? 'House reps' : 'Senators'} are not currently relevant to this issue.`
        };
      });

    return contacts;
  }

  vacantHouseSenateSeats(areas: string[], contactList: ContactList): Contact[] {
    const missingSeats: Contact[] = [];
    if (
      !areas.includes(ContactArea.USHouse) &&
      !areas.includes(ContactArea.USSenate)
    ) {
      return missingSeats;
    }

    const party: Party = '';
    const commonVacantSeatProps = {
      name: 'Vacant Seat',
      phone: '',
      party,
      state: contactList.state
    };

    // Handle missing Senate seat(s)
    const senateReps = contactList.senateReps();
    if (senateReps.length < 2) {
      // Assuming Senate seat(s) is vacant if there's < 2
      const numVacancies = 2 - senateReps.length; // handle multiple vacancies
      for (let i = 0; i < numVacancies; i++) {
        missingSeats.push({
          id: `vacant-senate-seat-${i + 1}`,
          reason: `This ${ContactArea.USSenate} seat is currently vacant${
            areas.includes(ContactArea.USSenate)
              ? ''
              : ' and not relevant to this issue'
          }.`,
          area: ContactArea.USSenate,
          ...commonVacantSeatProps
        });
      }
    }

    // Handle missing House seat
    const houseReps = contactList.houseRep();
    // Assuming House seat is vacant if there's not at least one
    if (houseReps.length < 1) {
      missingSeats.push({
        id: 'vacant-house-seat',
        reason: `This ${ContactArea.USHouse} seat is currently vacant${
          areas.includes(ContactArea.USHouse)
            ? ''
            : ' and not relevant to this issue'
        }.`,
        area: ContactArea.USHouse,
        ...commonVacantSeatProps
      });
    }

    return missingSeats;
  }

  contactComponent(
    contact: Contact,
    index: number,
    activeIndex: number,
    type: 'targeted' | 'irrelevant' | 'vacant'
  ): JSX.Element {
    let photoURL = '/images/no-rep.png';
    if (contact.photoURL && contact.photoURL !== '') {
      photoURL = contact.photoURL ?? '/images/no-rep.png';
    }

    return (
      <li className={index === activeIndex ? 'active' : ''} key={contact.id}>
        <div className={`rep-info ${type}`}>
          <img
            alt={contact.name}
            src={photoURL}
            onError={(e) => {
              e.currentTarget.src = '/images/no-rep.png';
            }}
          />
          <div className="rep-info-content">
            <h4>
              {contact.name}{' '}
              {type !== 'vacant' && `(${ContactUtils.partyAndState(contact)})`}
            </h4>
            <p>{contact.reason}</p>
          </div>
        </div>
      </li>
    );
  }

  render() {
    if (!this.state.contactList || !this.props.locationState?.address) {
      return (
        <div ref={this.componentRef}>
          <ul>
            <li>
              <img alt="No representative found" src="/images/no-rep.png" />
              <h4>No reps available</h4>
              <p>Please set your location to find your representatives</p>
            </li>
          </ul>
        </div>
      );
    }

    if (this.state.requiredState !== '' && (this.state.requiredState !== this.props.locationState.state)) {
      const stateName = stateNameFromAbbr(this.state.requiredState);
      return (
        <div ref={this.componentRef}>
          <ul>
            <li>
              <img alt="No representative found" src="/images/no-rep.png" />
              <h4>Not available</h4>
              <p>This topic is only available in {stateName}</p>
            </li>
          </ul>
        </div>
      );
    }

    const targetedContacts = this.contactsForArea(
      this.state.areas,
      this.state.contactList
    );

    const irrelevantContacts = this.visibleIrrelevantContacts(
      this.state.areas,
      this.state.contactList
    );

    const vacantSeats = this.vacantHouseSenateSeats(
      this.state.areas,
      this.state.contactList
    );

    let activeContact: Contact | undefined;
    if (targetedContacts.length > 0) {
      activeContact = targetedContacts[this.state.activeContactIndex];
    }

    let contactWarning = "";
    const hasStateReps = this.state.areas.includes("StateUpper") || this.state.areas.includes("StateLower");
    // only show this contact warning for issues with state reps, but maybe extend to the split zip thing too
    if (hasStateReps && this.state.contactList.lowAccuracy) {
      contactWarning = "Warning: your location is set to a zip code or other approximate location, please enter an address or zip+4 for accurate state level reps.";
    }

    return (
      <div ref={this.componentRef}>
        <ul>
          {targetedContacts.map((contact, index) =>
            this.contactComponent(
              contact,
              index,
              this.state.activeContactIndex,
              'targeted'
            )
          )}
          {vacantSeats.map((contact) =>
            this.contactComponent(
              contact,
              -1,
              this.state.activeContactIndex,
              'vacant'
            )
          )}
          {irrelevantContacts.map((contact) =>
            this.contactComponent(
              contact,
              -1,
              this.state.activeContactIndex,
              'irrelevant'
            )
          )}
        </ul>
        {contactWarning && 
          <p className='contact-warning'>
            <i className='fa-solid fa-triangle-exclamation'></i>
            {contactWarning}
          </p>
        }
        {activeContact && <ActiveContact contact={activeContact} />}
      </div>
    );
  }
}

export default withLocation(withCompleted(RepsWithSettings));
