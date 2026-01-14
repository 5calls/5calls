import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Script from './Script';
import { Contact } from '../common/models/contact';
import { LocationState } from '../state/locationState';

// Mock react-markdown to avoid rendering complexity in tests
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  };
});

// Mock the state provider
jest.mock('../state/stateProvider', () => ({
  withLocation: (component: any) => component
}));

// Mock the API module
jest.mock('../utils/api', () => ({
  getCustomizedScripts: jest.fn()
}));

// Create a test wrapper that allows us to access the scriptFormat method
const ScriptTestWrapper = React.forwardRef<Script>((props: any, ref) => {
  return <Script ref={ref} {...props} />;
});

describe('Script Component', () => {
  // Test data
  const mockLocationState: LocationState = {
    address: '123 Main St, Springfield, IL 62701',
    state: 'IL',
    cachedCity: 'Springfield, IL'
  };

  const mockContact: Contact = {
    id: '1',
    name: 'John Smith',
    phone: '202-555-0100',
    party: 'democrat',
    state: 'IL',
    reason: 'Test reason',
    area: 'US House'
  };

  const mockSenatorContact: Contact = {
    id: '2',
    name: 'Jane Doe',
    phone: '202-555-0200',
    party: 'republican',
    state: 'IL',
    reason: 'Test reason',
    area: 'US Senate'
  };

  const mockGovernorContact: Contact = {
    id: '3',
    name: 'Bob Johnson',
    phone: '217-555-0300',
    party: 'independent',
    state: 'IL',
    reason: 'Test reason',
    area: 'Governor'
  };

  let scriptInstance: Script | null = null;

  const renderScriptComponent = (locationState?: LocationState) => {
    return render(
      <ScriptTestWrapper
        ref={(instance: Script) => {
          scriptInstance = instance;
        }}
        locationState={locationState}
        setLocationAddress={() => {}}
      />
    );
  };

  describe('scriptFormat function', () => {
    beforeEach(() => {
      renderScriptComponent(mockLocationState);
    });

    describe('with undefined locationState', () => {
      it('should not replace location placeholders when locationState is undefined', () => {
        const script =
          'Hello [REP/SEN NAME], I am calling from [CITY, ZIP] to discuss this issue.';
        const result = scriptInstance!.scriptFormat(
          script,
          undefined,
          mockContact
        );

        expect(result).toBe(
          'Hello Rep. John Smith, I am calling from [CITY, ZIP] to discuss this issue.'
        );
        expect(result).toContain('[CITY, ZIP]'); // Location placeholder should remain
      });

      it('should not replace location placeholders when locationState has no cachedCity', () => {
        const locationStateWithoutCity = {
          ...mockLocationState,
          cachedCity: ''
        };
        const script =
          'Hello [REP/SEN NAME], I am calling from [CITY, STATE] to discuss this issue.';
        const result = scriptInstance!.scriptFormat(
          script,
          locationStateWithoutCity,
          mockContact
        );

        expect(result).toBe(
          'Hello Rep. John Smith, I am calling from [CITY, STATE] to discuss this issue.'
        );
        expect(result).toContain('[CITY, STATE]'); // Location placeholder should remain
      });

      it('should handle both location placeholder formats with undefined locationState', () => {
        const script =
          'I live in [CITY, ZIP] and work in [CITY, STATE]. Please help [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          undefined,
          mockContact
        );

        expect(result).toBe(
          'I live in [CITY, ZIP] and work in [CITY, STATE]. Please help Rep. John Smith.'
        );
        expect(result).toContain('[CITY, ZIP]');
        expect(result).toContain('[CITY, STATE]');
      });
    });

    describe('with undefined contact', () => {
      it('should not replace contact name placeholders when contact is undefined', () => {
        const script =
          'Hello [REP/SEN NAME], I am calling from [CITY, ZIP] to discuss this issue.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          undefined
        );

        expect(result).toBe(
          'Hello [REP/SEN NAME], I am calling from Springfield, IL to discuss this issue.'
        );
        expect(result).toContain('[REP/SEN NAME]'); // Contact placeholder should remain
      });

      it('should handle both contact placeholder formats with undefined contact', () => {
        const script =
          'Dear [REP/SEN NAME], also known as [SENATOR/REP NAME], I need your help.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          undefined
        );

        expect(result).toBe(
          'Dear [REP/SEN NAME], also known as [SENATOR/REP NAME], I need your help.'
        );
        expect(result).toContain('[REP/SEN NAME]');
        expect(result).toContain('[SENATOR/REP NAME]');
      });

      it('should still replace location placeholders when contact is undefined', () => {
        const script =
          'I am calling from [CITY, ZIP] to ask [REP/SEN NAME] about this issue.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          undefined
        );

        expect(result).toBe(
          'I am calling from Springfield, IL to ask [REP/SEN NAME] about this issue.'
        );
        expect(result).not.toContain('[CITY, ZIP]'); // Location should be replaced
        expect(result).toContain('[REP/SEN NAME]'); // Contact should remain
      });
    });

    describe('with both undefined', () => {
      it('should not replace any placeholders when both locationState and contact are undefined', () => {
        const script =
          'Hello [REP/SEN NAME], I am calling from [CITY, ZIP] to discuss this issue.';
        const result = scriptInstance!.scriptFormat(
          script,
          undefined,
          undefined
        );

        expect(result).toBe(
          'Hello [REP/SEN NAME], I am calling from [CITY, ZIP] to discuss this issue.'
        );
        expect(result).toContain('[REP/SEN NAME]');
        expect(result).toContain('[CITY, ZIP]');
      });

      it('should return the original script unchanged when no replacements are possible', () => {
        const script =
          'This is a script with [REP/SEN NAME] and [CITY, STATE] and [SENATOR/REP NAME] and [CITY, ZIP].';
        const result = scriptInstance!.scriptFormat(
          script,
          undefined,
          undefined
        );

        expect(result).toBe(script); // Should be exactly the same
      });
    });

    describe('with valid inputs', () => {
      it('should replace both location and contact placeholders correctly', () => {
        const script =
          'Hello [REP/SEN NAME], I am calling from [CITY, ZIP] to discuss this issue.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe(
          'Hello Rep. John Smith, I am calling from Springfield, IL to discuss this issue.'
        );
        expect(result).not.toContain('[REP/SEN NAME]');
        expect(result).not.toContain('[CITY, ZIP]');
      });

      it('should handle case-insensitive replacement for contact placeholders', () => {
        const script =
          'Hello [rep/sen name], please help [REP/SEN NAME] and [Senator/Rep Name].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe(
          'Hello Rep. John Smith, please help Rep. John Smith and Rep. John Smith.'
        );
      });

      it('should handle case-insensitive replacement for location placeholders', () => {
        const script = 'I live in [city, zip] and work in [CITY, STATE].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe(
          'I live in Springfield, IL and work in Springfield, IL.'
        );
      });

      it('should handle multiple instances of the same placeholder', () => {
        const script =
          '[REP/SEN NAME] please help. Thank you [REP/SEN NAME]. From [CITY, ZIP] to [CITY, ZIP].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe(
          'Rep. John Smith please help. Thank you Rep. John Smith. From Springfield, IL to Springfield, IL.'
        );
      });
    });

    describe('contact title formatting', () => {
      it('should format House representative correctly', () => {
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe('Hello Rep. John Smith.');
      });

      it('should format Senate representative correctly', () => {
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockSenatorContact
        );

        expect(result).toBe('Hello Senator Jane Doe.');
      });

      it('should format Governor correctly', () => {
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockGovernorContact
        );

        expect(result).toBe('Hello Governor Bob Johnson.');
      });

      it('should handle StateLower area', () => {
        const stateLowerContact = { ...mockContact, area: 'StateLower' };
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          stateLowerContact
        );

        expect(result).toBe('Hello Legislator John Smith.');
      });

      it('should handle StateUpper area', () => {
        const stateUpperContact = { ...mockContact, area: 'StateUpper' };
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          stateUpperContact
        );

        expect(result).toBe('Hello Legislator John Smith.');
      });

      it('should handle AttorneysGeneral area', () => {
        const agContact = { ...mockContact, area: 'AttorneysGeneral' };
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          agContact
        );

        expect(result).toBe('Hello Attorney General John Smith.');
      });

      it('should handle SecretaryOfState area', () => {
        const sosContact = { ...mockContact, area: 'SecretaryOfState' };
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          sosContact
        );

        expect(result).toBe('Hello Secretary of State John Smith.');
      });

      it('should handle unknown area with no title', () => {
        const unknownContact = { ...mockContact, area: 'Unknown' };
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          unknownContact
        );

        expect(result).toBe('Hello John Smith.');
      });

      it('should handle contact with no area', () => {
        const noAreaContact = { ...mockContact, area: undefined };
        const script = 'Hello [REP/SEN NAME].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          noAreaContact
        );

        expect(result).toBe('Hello John Smith.');
      });

      it('should handle alternative area names', () => {
        const houseContact = { ...mockContact, area: 'House' };
        const senateContact = { ...mockContact, area: 'Senate' };

        const script = 'Hello [REP/SEN NAME].';

        const houseResult = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          houseContact
        );
        const senateResult = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          senateContact
        );

        expect(houseResult).toBe('Hello Rep. John Smith.');
        expect(senateResult).toBe('Hello Senator John Smith.');
      });
    });

    describe('edge cases', () => {
      it('should handle empty script', () => {
        const script = '';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe('');
      });

      it('should handle script with no placeholders', () => {
        const script = 'This is a regular script with no special placeholders.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe(
          'This is a regular script with no special placeholders.'
        );
      });

      it('should handle script with only location placeholders', () => {
        const script = 'I am calling from [CITY, ZIP].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe('I am calling from Springfield, IL.');
      });

      it('should handle script with only contact placeholders', () => {
        const script = 'Hello [REP/SEN NAME], please help.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe('Hello Rep. John Smith, please help.');
      });

      it('should handle malformed placeholders', () => {
        const script =
          'Hello [REP/SEN] and [CITY] and [NAME] - these should not be replaced.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        expect(result).toBe(
          'Hello [REP/SEN] and [CITY] and [NAME] - these should not be replaced.'
        );
      });

      it('should handle placeholders with optional whitespace', () => {
        const script =
          'Hello [REP/SEN NAME] and from [CITY,ZIP] and [CITY, STATE].';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        // The regex handles 0 or 1 whitespace after comma
        expect(result).toBe(
          'Hello Rep. John Smith and from Springfield, IL and Springfield, IL.'
        );
      });

      it('should not replace placeholders with extra whitespace beyond what regex supports', () => {
        const script =
          'Hello [REP/SEN NAME] and from [CITY,  ZIP] with 2 spaces.';
        const result = scriptInstance!.scriptFormat(
          script,
          mockLocationState,
          mockContact
        );

        // The regex only handles 0 or 1 whitespace, so 2 spaces won't match
        expect(result).toBe(
          'Hello Rep. John Smith and from [CITY,  ZIP] with 2 spaces.'
        );
        expect(result).toContain('[CITY,  ZIP]'); // Should remain unreplaced
      });
    });
  });

  describe('fetchCustomizedScripts function', () => {
    let getCustomizedScriptsMock: jest.Mock;

    beforeEach(() => {
      // Reset the mock before each test
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      getCustomizedScriptsMock = require('../utils/api')
        .getCustomizedScripts as jest.Mock;
      getCustomizedScriptsMock.mockClear();
      getCustomizedScriptsMock.mockResolvedValue({
        contact1: 'Custom script for contact 1',
        contact2: 'Custom script for contact 2'
      });
    });

    it('should not fetch customized scripts when issueId is missing', async () => {
      render(
        <div data-issue-id="" data-script-markdown="Test script">
          <ScriptTestWrapper
            ref={(instance: Script) => {
              scriptInstance = instance;
            }}
            locationState={mockLocationState}
            setLocationAddress={() => {}}
          />
        </div>
      );

      // Wait for componentDidMount to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Call fetchCustomizedScripts without issueId
      await scriptInstance!.fetchCustomizedScripts(['contact1', 'contact2']);

      // Should not call the API
      expect(getCustomizedScriptsMock).not.toHaveBeenCalled();
    });

    it('should not fetch customized scripts when cachedCity is missing', async () => {
      const locationStateWithoutCity = {
        ...mockLocationState,
        cachedCity: ''
      };

      render(
        <div data-issue-id="123" data-script-markdown="Test script">
          <ScriptTestWrapper
            ref={(instance: Script) => {
              scriptInstance = instance;
            }}
            locationState={locationStateWithoutCity}
            setLocationAddress={() => {}}
          />
        </div>
      );

      // Wait for componentDidMount to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Call fetchCustomizedScripts
      await scriptInstance!.fetchCustomizedScripts(['contact1', 'contact2']);

      // Should not call the API
      expect(getCustomizedScriptsMock).not.toHaveBeenCalled();
    });

    it('should not fetch customized scripts when contactIds is empty', async () => {
      render(
        <div data-issue-id="123" data-script-markdown="Test script">
          <ScriptTestWrapper
            ref={(instance: Script) => {
              scriptInstance = instance;
            }}
            locationState={mockLocationState}
            setLocationAddress={() => {}}
          />
        </div>
      );

      // Wait for componentDidMount to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Call fetchCustomizedScripts with empty array
      await scriptInstance!.fetchCustomizedScripts([]);

      // Should not call the API
      expect(getCustomizedScriptsMock).not.toHaveBeenCalled();
    });

    it('should fetch customized scripts when all required data is present', async () => {
      render(
        <div data-issue-id="123" data-script-markdown="Test script">
          <ScriptTestWrapper
            ref={(instance: Script) => {
              scriptInstance = instance;
            }}
            locationState={mockLocationState}
            setLocationAddress={() => {}}
          />
        </div>
      );

      // Wait for componentDidMount to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Call fetchCustomizedScripts
      await scriptInstance!.fetchCustomizedScripts(['contact1', 'contact2']);

      // Should call the API with correct parameters
      expect(getCustomizedScriptsMock).toHaveBeenCalledWith(
        '123',
        ['contact1', 'contact2'],
        'Springfield, IL'
      );
    });

    it('should update state with customized scripts on successful fetch', async () => {
      const customScripts = {
        contact1: 'Custom script 1',
        contact2: 'Custom script 2'
      };
      getCustomizedScriptsMock.mockResolvedValue(customScripts);

      render(
        <div data-issue-id="123" data-script-markdown="Test script">
          <ScriptTestWrapper
            ref={(instance: Script) => {
              scriptInstance = instance;
            }}
            locationState={mockLocationState}
            setLocationAddress={() => {}}
          />
        </div>
      );

      // Wait for componentDidMount to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Call fetchCustomizedScripts
      await scriptInstance!.fetchCustomizedScripts(['contact1', 'contact2']);

      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should update state with customized scripts
      expect(scriptInstance!.state.customizedScripts).toEqual(customScripts);
    });

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      getCustomizedScriptsMock.mockRejectedValue(new Error('API error'));

      render(
        <div data-issue-id="123" data-script-markdown="Test script">
          <ScriptTestWrapper
            ref={(instance: Script) => {
              scriptInstance = instance;
            }}
            locationState={mockLocationState}
            setLocationAddress={() => {}}
          />
        </div>
      );

      // Wait for componentDidMount to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Call fetchCustomizedScripts
      await scriptInstance!.fetchCustomizedScripts(['contact1', 'contact2']);

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching customized scripts:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
