const call = require('./call.js');
const chai = require('chai');
const expect = chai.expect;

describe('call component', () => {
  it('should return "No calls to make" if issue cannot be found', () => {
    let expectSubstr = 'No calls to make';
    let location = {params: {issueid: undefined}};
    let issues = [];
    let state = {issues, location};
    let result = call(state);
    expect(result.querySelector('h2.call__title').textContent).to.contain(expectSubstr);
  });

  describe('contactArea section', () => {

    it('should display contact if contact data is present in state', () => {
      let cname = 'Senator Blowhart';
      let id = 1;
      let location = {params: {issueid: id}};
      let issue = {
        id: id,
        name: 'Bozo the nominee',
        reason: 'crazy',
        script: 'Please vote against everything'
      };
      let contact = {name: cname, party: 'Dem'};
      let contactIndices = {};
      contactIndices[id] = 0;
      issue.contacts = [contact];
      let issues = [issue];
      let state = {issues, location, contactIndices, showFieldOfficeNumbers: false};
      let result = call(state);
      let element = result.querySelector('.call__contact__name');
      expect(element.textContent).to.contain(cname);
    });

    it('should display "Set your location" link if contact data is NOT present in state', () => {
      const expected = 'Set your location';
      let id = 1;
      let location = {params: {issueid: id}};
      let issue = {
        id: id,
        name: 'Bozo the nominee',
        reason: 'crazy',
        script: 'Please vote against ...'
      };
      issue.contacts = [null];
      let issues = [issue];
      let contactIndices = {};
      contactIndices[id] = 0;
      let state = {issues, location, contactIndices};
      let result = call(state);
      let element = result.querySelector('h2 a');
      // Anchor should contain 'Set your location' text content
      expect(element.textContent).to.contain(expected);
    });
  });
});