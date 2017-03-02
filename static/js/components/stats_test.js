const html = require('choo/html');
const stats = require('./stats.js');
const chai = require('chai');
const expect = chai.expect;

describe('stats component', () => {
  it('should display stats when total calls greater than 0', () => {
    let userStats = {all: []}
    userStats['all'].push({
      contactid: 123,
      issueid: 456,
      result: 'contacted'   // not sure if necessary
    });
    let state = {userStats};
    let result = stats(state);
    expect(result).to.be.defined;
  });

  it('should NOT display stats when total calls equals 0', () => {
    let userStats = {all: []}
    let state = {userStats};
    let result = stats(state);
    expect(result).to.be.undefined;
  });

  it('should NOT display stats when undefined', () => {
    let state = {};
    let result = stats(state);
    expect(result).to.be.undefined;
  });
});