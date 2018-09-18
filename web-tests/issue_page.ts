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

fixture`Footer`
  .page`http://localhost:3000`
  .beforeEach(async () => {
    await waitForReact(5000);
  });

// tslint:disable-next-line:no-shadowed-variable
test('Link on sidebar navigates to issue page', async t => {
  const Sidebar = await ReactSelector('Sidebar');
  await t.expect(Sidebar).ok('Sidebar is displayed on the page');

  const IssueItems = await Sidebar.findReact('li');
  const firstIssue = IssueItems.nth(0);
  const link = await firstIssue.findReact('a').getAttribute('href');
});
