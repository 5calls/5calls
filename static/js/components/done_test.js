const done = require('./done');
const chai = require('chai');
const expect = chai.expect;

describe('done component', () => {

  describe('promote include', () => {

    it('should display tweet link when issue is found', () => {
      let issue = {id: 88, name: 'impeach trump'};
      let issues = [issue];
      let totalCalls = 123;
      let location = {params: {issueid: 88}};
      let state = {totalCalls, location, issues};
      let result = done(state);
      let a = result.querySelector('div.promote a');
      expect(a).to.be.defined;
    });

  });

  describe('callcount include', () => {

    it('should display call count total', () => {
      let totalCalls = 123;
      let location = {params: {issueId: 88}};
      let state = {totalCalls, location};
      let result = done(state);
      // call total value will be displated in callcount component
      let h2 = result.querySelector('.callcount');
      expect(h2).to.be.defined;
      // "Together we've made..."
      expect(h2.textContent).to.contain(totalCalls);
    });
  });
});