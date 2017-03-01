const html = require('choo/html');
const contact = require('./contact');
const chai = require('chai');
const expect = chai.expect;

describe('contact component', () => {
  it('should render contact name', () => {
    let field_offices = [];
    let contactData = {
      name: 'Big Whig',
      state: 'NZ',
      phone: '202-123-1234',
      party: 'Dem',
      photoURL: '',
      reason: '',
      field_offices: field_offices
    };
    let state = {
      showFieldOfficeNumbers: false
    };
    let result = contact(contactData, state);
    expect(result.querySelector('.call__contact__name').textContent).to.contain(contactData.name);
  });

  it('should render party first initial and state abbrev', () => {
    let expected = 'R';
    let field_offices = [];
    let contactData = {
      name: 'Big Whig',
      state: 'QZ',
      phone: '202-123-1234',
      party: expected + 'ep',
      photoURL: '',
      reason: '',
      field_offices: field_offices
    };
    let state = {
      showFieldOfficeNumbers: false
    };
    let result = contact(contactData, state);
    expect(result.querySelector('.call__contact__name').textContent).to.contain(expected + '-' + contactData.state);
  });

  it('should not render state abbrev if party is missing', () => {
    let field_offices = [];
    let contactData = {
      name: 'Big Whig',
      state: 'PZ',
      phone: '202-123-1234',
      party: '',
      photoURL: '',
      reason: '',
      field_offices: field_offices
    };
    let state = {
      showFieldOfficeNumbers: false
    };
    let result = contact(contactData, state);
    expect(result.querySelector('.call__contact__name').textContent).to.not.contain(contactData.state);
  });

  it('should display field office data if present', () => {
    let field_offices = [
      {phone: '212-123-1234', city: 'Whigville'}
    ];
    let contactData = {
      name: 'Big Whig',
      state: 'PZ',
      phone: '202-123-1234',
      party: '',
      photoURL: '',
      reason: '',
      field_offices: field_offices
    };
    let state = {
      showFieldOfficeNumbers: true
    };
    let result = contact(contactData, state);
    let content = result.querySelectorAll('ul.call__contact__field-office-list li')[0].textContent;
    expect(content).to.contain(field_offices[0].phone);
    expect(content).to.contain(field_offices[0].city);
    expect(content).to.contain(contactData.state);
  });

  it('should display field office data without city if present', () => {
    let field_offices = [
      {phone: '212-123-1234', city: ''}
    ];
    let contactData = {
      name: 'Big Whig',
      state: 'PZ',
      phone: '202-123-1234',
      party: '',
      photoURL: '',
      reason: '',
      field_offices: field_offices
    };
    let state = {
      showFieldOfficeNumbers: true
    };
    let result = contact(contactData, state);
    let content = result.querySelectorAll('ul.call__contact__field-office-list li')[0].textContent;
    expect(content).to.contain(field_offices[0].phone);
    expect(content).to.not.contain(contactData.state);
  });
});