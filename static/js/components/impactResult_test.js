const html = require('choo/html');
const impactResult = require('./impactResult.js');
const chai = require('chai');
const expect = chai.expect;

describe('impactResult component', () => {

  it('should display count for every call result', () => {
    let userStats = {
      contacted: 2,
      vm: 2,
      unavailable: 2
    }
    let contactedCalls = userStats.contacted;
    let vmCalls = userStats.vm;
    let unavailableCalls = userStats.unavailable;
    let state = {userStats};
    let result = impactResult(state);
    expect(result.textContent).to.contain('Made Contact: '+contactedCalls+' times');
    expect(result.textContent).to.contain('Left Voicemail: '+vmCalls+' times');
    expect(result.textContent).to.contain('Unavailable: '+unavailableCalls+' times');
  });

  it('should have correct singular and pluralization', () => {
    let userStats = {
      contacted: 2,
      vm: 1,
      unavailable: 0
    }
    let contactedCalls = userStats.contacted;
    let vmCalls = userStats.vm;
    let unavailableCalls = userStats.unavailable;
    let state = {userStats};
    let result = impactResult(state);
    expect(result.textContent).to.contain('Made Contact: '+contactedCalls+' times');
    expect(result.textContent).to.contain('Left Voicemail: '+vmCalls+' time');
    expect(result.textContent).to.contain('Unavailable: '+unavailableCalls+' times');
  });
});