const issuesListItem = require('./issuesListItem.js');
const chai = require('chai');
const expect = chai.expect;

describe('issuesListItem component', () => {

  it('should display issue name and number of calls to make', () => {
    let issue = {
      id: 99,
      name: 'Impeach Trump',
      contacts: [{id:88,name:'mccain'}],
    };
    let location = {params:[{issueId:100}]};
    let state = {completedIssues: [], location};
    let send = () =>  true;
    let results = issuesListItem(issue, state, null, send);
    let spans = results.querySelectorAll('span');

    expect(spans.length).to.not.equal(0);
    // nothing
    expect(spans[0].textContent).to.contain('');
    // no statusText since no completed issues
    expect(spans[1].textContent).to.contain('');
    expect(spans[2].textContent).to.contain(issue.name);
    expect(spans[3].textContent).to.contain(issue.contacts.length);
    expect(spans[3].textContent).to.contain('call');
  });

  it('should display statusText of "Done" since there are completed issues', () => {
    let issue = {
      id: 99,
      name: 'Impeach Trump',
      contacts: [{id:88,name:'mccain'}],
    };
    let location = {params:[{issueId:100}]};
    let state = {completedIssues: [99], location};
    let send = () =>  true;
    let results = issuesListItem(issue, state, null, send);
    let span = results.querySelector('span.visually-hidden');
    expect(span.textContent).to.contain("Done");
  });

});