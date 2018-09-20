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

fixture`Complete Call`
  .page`http://localhost:3000`
  .beforeEach(async () => {
    await waitForReact(7000);
  });

// tslint:disable-next-line:no-shadowed-variable
test('Call buttons navigate to done page wwhen clicked trhough', async t => {
  const Sidebar = await ReactSelector('Sidebar');

  const IssueItems = await Sidebar.findReact('li');
  const firstIssue = IssueItems.nth(1);
  const linkComponent = await firstIssue.findReact('a');
  const link = await linkComponent.getAttribute('href');
  await t
    .click(firstIssue)
    .navigateTo(link);
  let windowLocation = await getWindowLocation();

  await t.expect(windowLocation).eql('http://localhost:3000' + link);

  const callButtons = await Selector('.call__outcomes__items');
  const buttons = await callButtons.find('button');
  const firstButton = buttons.nth(0);

  let clicks = 0;
  while (!windowLocation.includes('/done/')) {
    await t.expect(clicks).lt(5, 'Number of contacts have exceeded before reaching the done page');
    await t
      .click(firstButton);
    clicks = clicks + 1;
    windowLocation = await getWindowLocation();
  }

  await waitForReact();
  const Done = await ReactSelector('Done');
  const doneComponent = await Done.getReact();
  const totalCount: number = await doneComponent.props.totalCount;
  await t.expect(totalCount).gt(0, 'The completed call count did not load on the done page');

  // ensure call total is listed on the page
  const callTitle = await Selector('.call__title');
  await t.expect(callTitle.innerText).eql('GREAT WORK!');
  const callText = await Selector('.call__text');
  await t.expect(callText.innerText)
    .eql('Pick another issue to keep calling, or spread the word by sharing your work with friends:');
  const totalText = await Selector('.totaltext');
  await t.expect(totalText.innerText)
    .eql('Together we\'ve made ' + totalCount.toLocaleString() + ' Calls!');

  const donationComponent = await Selector('.call__complete__donate');
  await t.expect(donationComponent.exists).ok('The donation component is missing');

  const reminderComponent  = await Selector('.call__complete__remind');
  await t.expect(reminderComponent.exists).ok('The reminder component is missing');

  const shareComponent = await Selector('.call__complete__share');
  await t.expect(shareComponent.exists).ok('The share component is missing');
});
