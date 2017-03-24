const done = require('./done');
const chai = require('chai');
const expect = chai.expect;

describe('done component', () => {

  describe('promote include', () => {

    it('should display tweet link when issue is found', () => {
      let issue = {id: 88, name: 'impeach trump'};
      let issues = [issue];
      let totalCalls = 123;
      let userStats = {all: []}
      let location = {params: {issueid: 88}};
      let state = {totalCalls, location, issues, userStats};
      let result = done(state);
      let a = result.querySelector('div.promote a');
      expect(a).to.be.defined;
    });

  });

  describe('callcount include', () => {

    it('should display call count total', () => {
      let totalCalls = 123;
      let userStats = {all: []}
      let location = {params: {issueId: 88}};
      let state = {totalCalls, location, userStats};
      let result = done(state);
      // call total value will be displated in callcount component
      let h2 = result.querySelector('.callcount');
      expect(h2).to.be.defined;
      // "Together we've made..."
      expect(h2.textContent).to.contain(totalCalls);
    });
  });

  describe('impactTotal include', () => {

    it('should display impact preview if more than 0 calls', () => {
      let totalCalls = 123;
      let all = [{
        contactid: 123,
        issueid: 456,
        result: 'contacted'
      }];
      let userStats = {all: all}
      let userCalls = userStats.all.length;
      let location = {params: {issueId: 88}};
      let state = {totalCalls, location, userStats};
      let result = done(state);
      expect(result.textContent).to.contain('You have made '+userCalls+' call!');
      expect(result.textContent).to.contain('See more stats on your impact');
    });

    it('should not display impact preview if 0 calls', () => {
      let totalCalls = 123;
      let all = [];
      let userStats = {all: all}
      let userCalls = userStats.all.length;
      let location = {params: {issueId: 88}};
      let state = {totalCalls, location, userStats};
      let result = done(state);
      expect(result.textContent).to.not.contain('You have made '+userCalls+' call!');
      expect(result.textContent).to.not.contain('See more stats on your impact');
    });
  });
});