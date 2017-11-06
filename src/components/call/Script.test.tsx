import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { shallow } from 'enzyme';
import i18n from '../../services/i18n';
import { Script } from './';
import { Contact, Issue, DefaultIssue, LocationUiState, LocationFetchType } from '../../common/model';
import { LocationState } from '../../redux/location';

test('Script component should be rendered if passed a valid object', () => {
    const issue: Issue = Object.assign({}, DefaultIssue, { id: '1', name: 'testName' });
    const locationState: LocationState = {
        address: '1234',
        cachedCity: 'Anytown',
        splitDistrict: false,
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
        const contacts: Contact[] = [{
            id: '293',
            area: 'House',
            name: 'Googly Moogly',
            phone: '',
            state: '',
            party: 'Independent',
            reason: ''
        }];
        const issue: Issue = Object.assign(
            {},
            DefaultIssue,
            { id: '1', name: 'testName', contacts: contacts, script: 'script_text' }
        );
        const locationState: LocationState = {
            address: '1234',
            cachedCity: 'Anytown',
            splitDistrict: false,
            uiState: LocationUiState.LOCATION_FOUND,
            locationFetchType: LocationFetchType.BROWSER_GEOLOCATION
        };

        const wrapper = shallow(
            <Script issue={issue} contactIndex={0} locationState={locationState} t={t} />
        );
        expect(wrapper.contains(<ReactMarkdown source="script_text" />)).toBe(true);
    });
});
