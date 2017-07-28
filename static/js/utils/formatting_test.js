const chai = require('chai');
const expect = chai.expect;
const f = require('./formatting');

describe('numberCasting', () => {
  it('should return 0 for non numbers', () => {
    let number = f.asNumber(NaN);
    expect(number).to.equal(0);
  });

  it('should return 0 for strings', () => {
    let number = f.asNumber("hello");
    expect(number).to.equal(0);
  });

  it('should return numbers for stringy numbers', () => {
    let number = f.asNumber("5");
    expect(number).to.equal(5);
  });

  it('should return numbers for numbers', () => {
    let number = f.asNumber(5);
    expect(number).to.equal(5);
  });
});

describe('numberFormatting', () => {
  it('should return nice commas for thousands', () => {
    let string = f.prettyCount(5000);
    expect(string).to.equal("5,000");
  });

  it('should return nice commas for millions', () => {
    let string = f.prettyCount(5000000);
    expect(string).to.equal("5,000,000");
  });
});