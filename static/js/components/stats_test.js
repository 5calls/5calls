const html = require('choo/html');
const stats = require('./stats.js');
const chai = require('chai');
const expect = chai.expect;

describe('stats component', () => {
  it('should display singular stats', () => {
    let all = [{
      contactid: 123,
      issueid: 456,
      result: 'contacted'
    }];
    let userStats = {all: all}
    let userCalls = userStats.all.length;
    let state = {userStats};
    let result = stats(state);
    expect(result.textContent).to.contain('Your impact is '+userCalls+' call!');
  });

  it('should display pluralized stats', () => {
   let all = [{
      contactid: 123,
      issueid: 456,
      result: 'contacted'
    },{
      contactid: 345,
      issueid: 678,
      result: 'vm'
    }];
    let userStats = {all: all}
    let userCalls = userStats.all.length;
    let state = {userStats};
    let result = stats(state);
    expect(result.textContent).to.contain('Your impact is '+userCalls+' calls!');
  });

  it('should NOT display stats when total calls equals 0', () => {
    let userStats = {all: []}
    let state = {userStats};
    let result = stats(state);
    expect(result).to.be.undefined;
  });
});