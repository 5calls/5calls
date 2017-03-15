const about = require('./about.js');
const chai = require('chai');
const expect = chai.expect;

describe('about component', () => {
  it('should return "About 5 Calls"', () => {
    let expectSubstr = 'About 5 Calls';
    let location = {params: {issueid: undefined}};
    let issues = [];
    let state = {issues, location};
    let result = about(state);
    expect(result.querySelector('h2.about__title').textContent).to.contain(expectSubstr);
  });
});