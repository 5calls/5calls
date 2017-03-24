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
    expect(result.textContent).to.contain('You have made contact '+contactedCalls+' times');
    expect(result.textContent).to.contain('and left '+vmCalls+' voicemails');
    expect(result.textContent).to.contain('Your representatives have been unavailable '+unavailableCalls+' times');
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
    expect(result.textContent).to.contain('You have made contact '+contactedCalls+' times');
    expect(result.textContent).to.contain('and left '+vmCalls+' voicemail');
    expect(result.textContent).to.contain('Your representatives have been unavailable '+unavailableCalls+' times');
  });
});