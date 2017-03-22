const issuesList = require('./issuesList.js');
const chai = require('chai');
const expect = chai.expect;

describe('issuesList component', () => {
  it('should display no issues if none exist', () => {
    let state = {issues: []};
    let results = issuesList(state);
    let lis = results.getElementsByTagName('li');
    expect(lis.length).to.equal(0);
  });

  it('should display issues if they exist', () => {
    let issue1 = {id: 98, inactive: false, contacts:[{id:88,name:'mccain'}], name: 'Trump'};
    let issue2 = {id: 99, inactive: false, contacts:[{id:88,name:'ryan'}], name: 'DeVos'};
    let location = {params:[{issueId:undefined}]};
    let state = {
      completedIssues: [],
      location,
      issues: [issue1, issue2]
    };
    let send = () =>  'stub';
    let results = issuesList(state, null, send);
    let lis = results.getElementsByTagName('li');
    // two issues should display
    expect(lis.length).to.equal(2);
  });

});
