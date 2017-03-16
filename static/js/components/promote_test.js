const html = require('choo/html');
const promote = require('./promote');
const chai = require('chai');
const expect = chai.expect;

describe('promote component', () => {
  it('should display generic tweet link if issue does not exist', () => {
    let issue = undefined;
    let state = {location: {params: {issueid: null}}};
    let result = promote(state, null, null);
    let element = result.querySelector('a');
    expect(element.textContent).to.contain('Share on Twitter');
  });

  it('should display tweet link if issue is defined', () => {
    let issue = {id: 1, name: 'Save ACA'};
    let state = {issues: [issue], location: {params: {issueid: 1}}};
    let result = promote(state, null, null);
    let element = result.querySelector('a');
    expect(element.textContent).to.contain('Tweet this issue');
  });
});