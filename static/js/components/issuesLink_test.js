const issuesLink = require('./issuesLink.js');
const chai = require('chai');
const expect = chai.expect;

describe('issuesLink component', () => {
  it('should display link if present in state', () => {
    let linkName = 'Go Here';
    let id = 1;
    let location = {params: {issueid: id}};
    let issue = {
      id: id,
      name: 'Bozo the nominee',
      reason: 'crazy',
      script: 'Please vote against everything',
      link: 'https://www.google.com',
      linkTitle: linkName
    };
    let contact = {name: 'Senator Blowhart', party: 'Dem'};
    let contactIndices = {};
    contactIndices[id] = 0;
    issue.contacts = [contact];
    let issues = [issue];
    let state = {issues, location, contactIndices, showFieldOfficeNumbers: false};
    let result = issuesLink(state);
    let element = result.querySelector('.call__script__link a');
    expect(element.textContent).to.contain(linkName);
  });

  it('should display link without title if present in state', () => {
    let linkURL = 'https://www.google.com';
    let id = 1;
    let location = {params: {issueid: id}};
    let issue = {
      id: id,
      name: 'Bozo the nominee',
      reason: 'crazy',
      script: 'Please vote against everything',
      link: linkURL
    };
    let contact = {name: 'Senator Blowhart', party: 'Dem'};
    let contactIndices = {};
    contactIndices[id] = 0;
    issue.contacts = [contact];
    let issues = [issue];
    let state = {issues, location, contactIndices, showFieldOfficeNumbers: false};
    let result = issuesLink(state);
    let element = result.querySelector('.call__script__link a');
    expect(element.textContent).to.contain(linkURL);
  });

  it('should not display link if not present in state', () => {
    let id = 1;
    let location = {params: {issueid: id}};
    let issue = {
      id: id,
      name: 'Bozo the nominee',
      reason: 'crazy',
      script: 'Please vote against everything'
    };
    let contact = {name: 'Senator Blowhart', party: 'Dem'};
    let contactIndices = {};
    contactIndices[id] = 0;
    issue.contacts = [contact];
    let issues = [issue];
    let state = {issues, location, contactIndices, showFieldOfficeNumbers: false};
    let result = issuesLink(state);
    expect(result).not.to.exist;
  });
});
