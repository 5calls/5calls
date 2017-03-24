const impactTotal = require('./impactTotal.js');
const chai = require('chai');
const expect = chai.expect;

describe('impactTotal component', () => {
  it('should display singular total', () => {
    let all = [{
      contactid: 123,
      issueid: 456,
      result: 'contacted'
    }];
    let userStats = {all: all}
    let userCalls = userStats.all.length;
    let state = {userStats};
    let result = impactTotal(state);
    expect(result.textContent).to.contain('You have made '+userCalls+' call!');
  });

  it('should display pluralized total', () => {
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
    let result = impactTotal(state);
    expect(result.textContent).to.contain('You have made '+userCalls+' calls!');
  });
});