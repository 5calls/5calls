const html = require('choo/html');
const issuesListItem = require('./issuesListItem.js');
const chai = require('chai');
const expect = chai.expect;

describe('issuesListItem component', () => {
  const issue = {
    id: 99,
    name: 'Impeach Trump',
    contacts: [{id:88,name:'mccain'}]
  };
  const location = {params:[{issueId:100}]};

  it('should display issue name and number of calls to make', () => {
    const state = {completedIssues: [], location};
    const results = issuesListItem(issue, state);
    const spans = results.querySelectorAll('span');

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
    const state = {completedIssues: [99], location};
    const results = issuesListItem(issue, state);
    const span = results.querySelector('span.visually-hidden');
    expect(span.textContent).to.contain("Done");
  });

  it("should send 'activateIssue' event when clicked", () => {
    const state = {completedIssues: [], location};
    let sendCalled = false;
    let sentId = undefined;
    let send = (name, objWithId) =>  {
      sendCalled = true;
      sentId = objWithId;
    };
    const results = issuesListItem(issue, state, null, send);
    expect(sendCalled).to.be.false;
    results.click();
    expect(sendCalled).to.be.true;
    expect(sentId).to.deep.equal({id: issue.id});
  });
});
