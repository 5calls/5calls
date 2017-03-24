const callcount = require('./callcount.js');
const chai = require('chai');
const expect = chai.expect;

describe('callcount component', () => {
  it('should properly format call total >=1000 with commas', () => {
    let state = {totalCalls: '123456789'};
    let result = callcount(state);
    expect(result.textContent).to.contain('123,456,789');
  });

  it('should properly format call total < 1000 without commas', () => {
    const totals = '123';
    let state = {totalCalls: totals};
    let result = callcount(state);
    expect(result.textContent).to.contain(totals);
    expect(result.textContent).to.not.contain(',');
  });

  it('should not format zero call total', () => {
    const totals = '0';
    let state = {totalCalls: totals};
    let result = callcount(state);
    expect(result.textContent).to.contain(totals);
    expect(result.textContent).to.not.contain(',');
  });

  it('should properly handle undefined state', () => {
    let state = {totalCalls: undefined};
    let result = callcount(state);
    expect(result.textContent).to.contain('0');
    expect(result.textContent).not.to.not.contain('NaN');
  });

  it('should properly handle empty state', () => {
    let state = {totalCalls: ""};
    let result = callcount(state);
    expect(result.textContent).to.contain('0');
    expect(result.textContent).not.to.not.contain('NaN');
  });
});
