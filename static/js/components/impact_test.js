const html = require('choo/html');
const impact = require('./impact.js');
const chai = require('chai');
const expect = chai.expect;

let all = [{
  contactid: 123,
  issueid: 456,
  result: 'contacted'
}];
let userStats = {
  all: all,
  contacted: 4,
  vm: 1,
  unavailable: 0
}

describe('impact component', () => {
  describe('impactTotal include', () => {
    it('should display user calls count', () => {
      let userCalls = userStats.all.length;
      let state = {userStats};
      let result = impact(state);
      expect(result.textContent).to.contain('Your impact is '+userCalls+' call!');
    });
  });

  describe('impactResult include', () => {
    it('should display count for each call result', () => {
      let contactedCalls = userStats.contacted;
      let vmCalls = userStats.vm;
      let unavailableCalls = userStats.unavailable;
      let location = {params: {issueId: 88}};
      let state = {userStats};
      let result = impact(state);
      expect(result.textContent).to.contain('Made Contact: '+contactedCalls+' times');
      expect(result.textContent).to.contain('Left Voicemail: '+vmCalls+' time');
      expect(result.textContent).to.contain('Unavailable: '+unavailableCalls+' times');
    });
  });

  describe('callcount include', () => {
    it('should display call count total', () => {
      let totalCalls = 123;
      let state = {totalCalls, userStats};
      let result = impact(state);
      let h2 = result.querySelector('.callcount');
      expect(h2).to.be.defined;
      expect(h2.textContent).to.contain(totalCalls);
    });
  });
});