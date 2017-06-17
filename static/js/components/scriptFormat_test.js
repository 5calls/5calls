const scriptFormat = require('./scriptFormat.js');
const chai = require('chai');
const expect = chai.expect;

describe('scriptFormatter', () => {
  let id = 1;
  let location = {params: {issueid: 1}};
  let contactIndices = {};
  contactIndices[id] = 0;
  let stateDefault = {
    location,
    contactIndices
  };
  let issueDefault = {
    id: id,
    name: 'Call Bozo Blowhart',
    reason: 'Bozo is bad',
  };

  describe('title replacement', () => {
    it('should replace with senator title', () => {
      let contact = {
        name: 'Bozo B. Blowhart',
        area: 'Senate',
        party: 'Dem'
      };
      let script = 'Please vote against [REP/SEN NAME]. It will be bad if you dont vote against [Senator/Rep Name].';
      let issue = issueDefault;
      let state = stateDefault;
      issue['contacts'] = [contact];
      issue['script'] = script;
      state['issues'] = [issue];
      let result = scriptFormat(state);
      expect(result.textContent).to.contain('Please vote against Senator Bozo B. Blowhart. It will be bad if you dont vote against Senator Bozo B. Blowhart.');
    });
    it('should replace with rep title', () => {
      let contact = {
        name: 'Bozo B. Blowhart',
        area: 'House',
        party: 'Dem'
      };
      let script = 'Please vote against [REP/SEN NAME]. It will be bad if you dont vote against [Senator/Rep Name].';
      let issue = issueDefault;
      let state = stateDefault;
      issue['contacts'] = [contact];
      issue['script'] = script;
      state['issues'] = [issue];
      let result = scriptFormat(state);
      expect(result.textContent).to.contain('Please vote against Rep. Bozo B. Blowhart. It will be bad if you dont vote against Rep. Bozo B. Blowhart.');
    });
    it('should not replace title when not house or senate', () => {
      let contact = {
        name: 'Bozo B. Blowhart',
        area: '',
        party: 'Dem'
      };
      let script = 'Please vote against REP/SEN NAME. It will be bad if you dont vote against [Senator Name].';
      let issue = issueDefault;
      let state = stateDefault;
      issue['contacts'] = [contact];
      issue['script'] = script;
      state['issues'] = [issue];
      let result = scriptFormat(state);
      expect(result.textContent).to.contain(script);
    }); 
    it('should not replace when no valid replacement string', () => {
      let contact = {
        name: 'Bozo B. Blowhart',
        area: 'Senates',
        party: 'Dem'
      };
      let script = 'Please vote against [REP/SEN NAME]. It will be bad if you dont vote against [Senator/Rep Name].';
      let issue = issueDefault;
      let state = stateDefault;
      issue['contacts'] = [contact];
      issue['script'] = script;
      state['issues'] = [issue];
      let result = scriptFormat(state);
      expect(result.textContent).to.contain(script);
    }); 
  });
  describe('location replacement', () => {
    it('should replace with location', () => {
      let contact = {
        name: 'Bozo B. Blowhart',
        area: 'Senate',
        party: 'Dem'
      };
      let script = 'I am from [CITY, ZIP]. I love [City,State].';
      let issue = issueDefault;
      let state = stateDefault;
      issue['contacts'] = [contact];
      issue['script'] = script;
      state['issues'] = [issue];
      state['cachedCity'] = 'Oakland';
      let result = scriptFormat(state);
      expect(result.textContent).to.contain('I am from Oakland. I love Oakland.');
    });
    it('should not replace with invalid location replacement string', () => {
      let contact = {
        name: 'Bozo B. Blowhart',
        area: 'Senate',
        party: 'Dem'
      };
      let script = 'I am from [CITY,ZIP. I love State.';
      let issue = issueDefault;
      let state = stateDefault;
      issue['contacts'] = [contact];
      issue['script'] = script;
      state['issues'] = [issue];
      state['cachedCity'] = 'Oakland';
      let result = scriptFormat(state);
      expect(result.textContent).to.contain(script);
    });    
    it('should not replace if no cached city', () => {
      let contact = {
        name: 'Bozo B. Blowhart',
        area: 'Senate',
        party: 'Dem'
      };
      let script = 'I am from [CITY,ZIP. I love State.';
      let issue = issueDefault;
      let state = stateDefault;
      issue['contacts'] = [contact];
      issue['script'] = script;
      state['issues'] = [issue];
      state['cachedCity'] = '';
      let result = scriptFormat(state);
      expect(result.textContent).to.contain(script);
    });
  });
});