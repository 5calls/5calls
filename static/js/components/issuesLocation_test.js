const html = require('choo/html');
const issuesLocation = require('./issuesLocation');
const chai = require('chai');
const expect = chai.expect;

describe('issuesLocation component', () => {
  describe('"focusLocation" action behavior', () => {
    const testCases = [
      {state: {askingLocation: true, fetchingLocation: false}, shouldSend: true},
      {state: {askingLocation: true, fetchingLocation: true}, shouldSend: false},
      {state: {askingLocation: false, fetchingLocation: false}, shouldSend: false}
    ];
    testCases.forEach(({state, shouldSend}) => {
      it('should' + (shouldSend ? '' : ' not') + ' send "focusLocation" when ' +
         'askingLocation is ' + state.askingLocation + ' and ' +
         'fetchingLocation is ' + state.fetchingLocation, () => {
           let didSend = false;
           // mock impl to test that it is being called in component
           let send = (msg) => {
             if (msg == 'focusLocation') didSend = true;
           };
           issuesLocation(state, null, send);
           expect(didSend).to.equal(shouldSend);
         });
    });
  });
  describe('html content', () => {
    it('should always include the addressForm', () => {
      let result = issuesLocation({}, null, () => {});
      let formElement = result.querySelector('form');
      expect(formElement).to.be.defined;
    });
    it('should tell user when fetching location and hide addressForm', () => {
      const expected = 'Getting your location';
      const state = {fetchingLocation: true};
      let result = issuesLocation(state, null, () => {});
      expect(result.innerText).to.contain(expected);
      let formElement = result.querySelector('form');
      expect(formElement.classList.contains('hidden')).to.be.true;
    });
    it('should prompt user for address when askingLocation', () => {
      const state = {fetchingLocation: false, askingLocation:true};
      let result = issuesLocation(state, null, () => {});
      expect(result.querySelectorAll("p")).to.have.length(1);
      let formElement = result.querySelector('form');
      expect(formElement.classList.contains('hidden')).to.be.false;
    });
    it('should tell the user about an invalid address', () => {
      const expected = 'address is invalid';
      const state = {fetchingLocation: false, askingLocation:false,
                     invalidAddress: true};
      let result = issuesLocation(state, null, () => {});
      expect(result.innerText).to.contain(expected);
      let formElement = result.querySelector('form');
      expect(formElement.classList.contains('hidden')).to.be.true;
    });
    it('should reflect the current address if available', () => {
      const address = '123 Main St. 12345';
      const state = {fetchingLocation: false, askingLocation:false,
                     invalidAddress: false, address};
      let result = issuesLocation(state, null, () => {});
      expect(result.innerText).to.contain(address);
      let formElement = result.querySelector('form');
      expect(formElement.classList.contains('hidden')).to.be.true;
    });
    it('should reflect the current cached city if available', () => {
      const cachedCity = 'Munroe';
      const state = {fetchingLocation: false, askingLocation:false,
                     invalidAddress: false, cachedCity};
      let result = issuesLocation(state, null, () => {});
      expect(result.innerText).to.contain(cachedCity);
      let formElement = result.querySelector('form');
      expect(formElement.classList.contains('hidden')).to.be.true;
    });
    it('should prompt for an address if nothing else', () => {
      const expected = 'Choose a location';
      const state = {};
      let result = issuesLocation(state, null, () => {});
      expect(result.innerText).to.contain(expected);
      let formElement = result.querySelector('form');
      expect(formElement.classList.contains('hidden')).to.be.true;
    });
  });
});
