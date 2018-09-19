import {
  ClientFunction,
  t,
  Selector,
} from 'testcafe';
import {
  waitForReact,
  ReactSelector,
} from 'testcafe-react-selectors';

const getWindowLocation = ClientFunction(() => window.location.href);

fixture`IssuePage`
  .page`http://localhost:3000`
  .beforeEach(async () => {
    await waitForReact(5000);
  });

// tslint:disable-next-line:no-shadowed-variable
test('Link on sidebar navigates to issue page', async t => {
  const Sidebar = await ReactSelector('Sidebar');

  const IssueItems = await Sidebar.findReact('li');
  const firstIssue = IssueItems.nth(0);
  const link = await firstIssue.findReact('a').getAttribute('href');
  await t
    .click(firstIssue)
    .navigateTo(link);

  await t.expect(getWindowLocation()).eql('http://localhost:3000' + link);

  // ensure selectors are no longer on the page
  const extras = await Selector('.extras');
  await t.expect(extras.exists).notOk('Extras div appears on page when it should not');

  // ensure the header and title exists
  const header = await Selector('.call__header');
  await t.expect(header.exists).ok('The call header is missing from the page');

  const headerText = await header.find('.call__title');
  await t.expect(headerText.exists).ok('The call header text is missing from the page');

  // ensure the call body exists and is below the header
  const callBody = await headerText.nextSibling('.call__reason');
  await t.expect(callBody.exists).ok('The call body text is missing from the page');
});

// tslint:disable-next-line:no-shadowed-variable
test('Contacts are visible in an issue', async t => {
  const Sidebar = await ReactSelector('Sidebar');

  // get the second issue and navigate to it
  // necessary since this was written during the midterm challenge
  const IssueItems = await Sidebar.findReact('li');
  const firstIssue = IssueItems.nth(1);
  const link = await firstIssue.findReact('a').getAttribute('href');
  await t
    .click(firstIssue)
    .navigateTo(link);

  await t.expect(getWindowLocation()).eql('http://localhost:3000' + link);

  // ensure the contact element exists
  const contact = await Selector('.call__contact');
  await t.expect(contact.exists).ok('The ContactDetails element is missing');

  const image = await contact.child('.call__contact__image');
  await t.expect(image.exists).ok('The contact image element is missing');
  const contactType = await contact.child('.call__contact__type');
  await t.expect(contactType.exists).ok('The call contact type is missing');
  const contactName = await contact.child('.call__contact__name');
  await t.expect(contactName.exists).ok('The call contact name is missing');
  const contactPhone = await contact.child('.call__contact__phone');
  await t.expect(contactPhone.exists).ok('The call contact phone element is missing');

  // these copmponents are hid in a div component, and require the Selector
  // instead of child pattern
  const reasonHeader = await Selector('.call__contact__reason__header');
  await t.expect(reasonHeader.exists).ok('The call contact reason header is missing');
  const reasonBody = await Selector('.call__contact__reason');
  await t.expect(reasonBody.exists).ok('The call contact reason is missing');

  const contactOffice = await Selector('.call__contact__show-field-offices');
  await t.expect(contactOffice.exists).ok('The ContactOffice component is missint');
});

// tslint:disable-next-line:no-shadowed-variable
test('Call Script is visible with their issue', async t => {
  const Sidebar = await ReactSelector('Sidebar');

  // get a further child issue and navigate to it
  // necessary since this was written during the midterm challenge
  const IssueItems = await Sidebar.findReact('li');
  const firstIssue = IssueItems.nth(2);
  const link = await firstIssue.findReact('a').getAttribute('href');
  await t
    .click(firstIssue)
    .navigateTo(link);

  await t.expect(getWindowLocation()).eql('http://localhost:3000' + link);

  const script = await Selector('.call__script');
  await t.expect(script.exists).ok('The call script is missing from the page');

  const scriptHeader = script.child('.call__script__header');
  await t.expect(scriptHeader.exists).ok('The call script header is missing');
  await t.expect(scriptHeader.innerText).eql('Your script:');

  const scriptBody = script.child('.call__script__body');
  await t.expect(scriptBody.exists).ok('The call script body is missing');
});

// tslint:disable-next-line:no-shadowed-variable
test('Results buttons are visible with their issue', async t => {
  const Sidebar = await ReactSelector('Sidebar');

  // get a further child issue and navigate to it
  // necessary since this was written during the midterm challenge
  const IssueItems = await Sidebar.findReact('li');
  const firstIssue = IssueItems.nth(2);
  const link = await firstIssue.findReact('a').getAttribute('href');
  await t
    .click(firstIssue)
    .navigateTo(link);
  await waitForReact(5000);

  await t.expect(getWindowLocation()).eql('http://localhost:3000' + link);

  /*
  const Outcomes = await ReactSelector('Outcomes');
  const outcomesComponent = await Outcomes.getReact();
  await t.expect(outcomesComponent.exists).ok('Outcomes component is missing from the page');
  const callsLeft = parseInt(outcomesComponent.props.numberOfContactsLeft, 10);
  await t.expect(isNaN(callsLeft)).notOk();
  */
  const buttonLabels = [
    'UNAVAILABLE',
    'LEFT VOICEMAIL',
    'MADE CONTACT',
    'SKIP',
  ];

  const callOutcomes = await Selector('.call__outcomes');
  await t.expect(callOutcomes.exists).ok('Call outcomes is missing');
  const callHeader = await callOutcomes.child('.call__outcomes__header');
  await t.expect(callHeader.innerText)
    .eql('Enter your call result to get the next call:');
  const callButtons = await callOutcomes.child('.call__outcomes__items');
  const buttons = await callOutcomes.find('button');
  const count = await buttons.count;
  await t.expect(count).eql(4);

  for (let i = 0; i < count; i++) {
    const button = await buttons.nth(i);
    await t.expect(button.innerText).eql(buttonLabels[i]);
  }
});
