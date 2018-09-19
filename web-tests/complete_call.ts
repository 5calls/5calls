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
    await t
      .click(firstButton);
    clicks = clicks + 1;
    windowLocation = await getWindowLocation();
    await t.expect(clicks).lt(5, 'Number of contacts have exceeded before reaching the done page');
  }

  await waitForReact();
  const Done = await ReactSelector('Done');
  const doneComponent = await Done.getReact();
  await t.expect(doneComponent.exists).ok('Did not navigate to done page');
});
