import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { shallow } from 'enzyme';
import i18n from '../../services/i18n';
import { Script } from './';
import { getContactNameWithTitle } from './Script';
import {
  Contact,
  Issue,
  LocationUiState,
  LocationFetchType
} from '../../common/model';
import { LocationState } from '../../redux/location';
import { linkRefRenderer } from '../shared/markdown-utils';

test('Script component should be rendered if passed a valid object', () => {
  const issue: Issue = Object.assign({}, new Issue(), {
    id: '1',
    name: 'testName'
  });
  const locationState: LocationState = {
    address: '1234',
    cachedCity: 'Anytown',
    splitDistrict: false,
    invalidAddress: false,
    uiState: LocationUiState.LOCATION_FOUND,
    locationFetchType: LocationFetchType.BROWSER_GEOLOCATION
  };
  const component = shallow(
    <Script
      issue={issue}
      contactIndex={0}
      locationState={locationState}
      t={i18n.t}
    />
  );
  expect(component).toMatchSnapshot();
});

describe('when the script text is shown', () => {
  test('it uses ReactMarkdown for display formatting', () => {
    const t = jest.fn().mockReturnValue('');
    const contacts: Contact[] = [
      {
        id: '293',
        area: 'House',
        name: 'Googly Moogly',
        phone: '',
        state: '',
        party: 'Independent',
        reason: ''
      }
    ];
    const issue: Issue = Object.assign({}, new Issue(), {
      id: '1',
      name: 'testName',
      contacts: contacts,
      script: 'script_text'
    });
    const locationState: LocationState = {
      address: '1234',
      cachedCity: 'Anytown',
      splitDistrict: false,
      invalidAddress: false,
      uiState: LocationUiState.LOCATION_FOUND,
      locationFetchType: LocationFetchType.BROWSER_GEOLOCATION
    };

    const wrapper = shallow(
      <Script
        issue={issue}
        contactIndex={0}
        locationState={locationState}
        t={t}
      />
    );
    expect(
      wrapper.contains(
        <ReactMarkdown
          source="script_text"
          linkTarget="_blank"
          renderers={{ linkReference: linkRefRenderer }}
        />
      )
    ).toBe(true);
  });
});

describe('getContactNameWithTitle', () => {
  const contacts: Contact[] = [
    {
      id: '293',
      area: 'House',
      name: 'Googly Moogly',
      phone: '',
      state: '',
      party: '',
      reason: ''
    },
    {
      id: '666',
      area: 'Senate',
      name: 'Damian Longhoof',
      phone: '',
      state: '',
      party: '',
      reason: ''
    },
    {
      id: '123',
      area: 'AttorneyGeneral',
      name: 'Betty White',
      phone: '',
      state: '',
      party: '',
      reason: ''
    },
    {
      id: '789',
      area: 'StateLower',
      name: 'Luna Lovegood',
      phone: '',
      state: '',
      party: '',
      reason: ''
    },
    {
      id: '739',
      area: 'Underground',
      name: 'Lisbeth Salander',
      phone: '',
      state: '',
      party: '',
      reason: ''
    }
  ];
  it('returns the name of the contact with their title', () => {
    const repTitle = getContactNameWithTitle(contacts, 0);
    expect(repTitle).toBe('Rep. Googly Moogly');
    const senateTitle = getContactNameWithTitle(contacts, 1);
    expect(senateTitle).toBe('Senator Damian Longhoof');
    const agTitle = getContactNameWithTitle(contacts, 2);
    expect(agTitle).toBe('Attorney General Betty White');
    const legTitle = getContactNameWithTitle(contacts, 3);
    expect(legTitle).toBe('Legislator Luna Lovegood');
  });
  it('returns just the name of the contact when the title is unknown', () => {
    const unknownTitle = getContactNameWithTitle(contacts, 4);
    expect(unknownTitle).toBe('Lisbeth Salander');
  });
});
