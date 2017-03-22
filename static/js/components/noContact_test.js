const noContact = require('./noContact');
const chai = require('chai');
const expect = chai.expect;

describe('noContact component', () => {
  it('should display enter "Enter your address" link if ' +
    'splitDistrict is true and address is defined', () => {
    let state = {
      splitDistrict: true,
      address: '123 Main St, NY,NY',
      cachedCity: undefined
    };
    let result = noContact(state);
    let link = result.querySelector('p a');
    expect(link.textContent).to.contain('Enter your address');
  });

  it('should display enter "Enter your address" link if ' +
    'splitDistrict is true and cachedCity is defined', () => {
    let state = {
      splitDistrict: true,
      address: undefined,
      cachedCity: 'Casablanca'
    };
    let result = noContact(state);
    let link = result.querySelector('p a');
    expect(link.textContent).to.contain('Enter your address');
  });

  it('should display "Set your location" link if ' +
    'splitDistrict is false', () => {
    let state = {
      splitDistrict: false,
      address: '123 Main St, NY,NY',
      cachedCity: undefined
    };
    let result = noContact(state);
    let link = result.querySelector('h2 a');
    expect(link.textContent).to.contain('Set your location');
  });
});