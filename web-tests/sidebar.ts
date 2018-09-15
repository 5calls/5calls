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

fixture`Sidebar`
  .page`http://localhost:3000`
  .beforeEach(async () => {
    await waitForReact(5000);
  });

// tslint:disable-next-line:no-shadowed-variable
test('Sidebar Header exists and user may set location', async t => {
  const SidebarHeader = await ReactSelector('SidebarHeader');
  await t.expect(SidebarHeader).ok('Sidebar header is displayed');

  const Location = await ReactSelector('Location');
  await t.expect(Location).ok();

  const locationMessage = await Selector('#locationMessage');
  await t.expect(locationMessage).ok();

  let locationSetMessage = await Selector('#locationMessage').withText('Your location: ');

  if (await locationSetMessage.exists) {
    const locationButton = await Location.findReact('button');
    await t.expect(locationButton.innerText).eql('CHANGE LOCATION');
    await t.click(locationButton);

    const addressField = Selector('#address');
    await t.expect(addressField.getAttribute('placeholder'))
      .eql('Enter an address or zip code');
    const submitButton = Location.findReact('button');
    await t.expect(submitButton.innerText).eql('GO');

    await t.typeText(addressField, '80123')
      .expect(addressField.value).eql('80123');
    await t.click(submitButton);

    locationSetMessage = await Selector('#locationMessage').withText('Your location: ');
    await t.expect(locationSetMessage.innerText).eql('Your location: Littleton');
  }
});

// tslint:disable-next-line:no-shadowed-variable
test('Sidebar body contains a list of 10 issues and the footer', async t => {
  const Sidebar = await ReactSelector('Sidebar');
  await t.expect(Sidebar).ok('Sidebar is displayed on the page');

  const IssueItems = await Sidebar.findReact('li');
  const count = await IssueItems.count;
  // There will be 11 items, the 10 issues and the footer
  await t.expect(count).eql(11, 'There are 10 issues in the sidebar');

  for (let i = 0; i < count; i++) {
    const Issue = IssueItems.nth(i);
    const Link = await Issue.findReact('a');
    const url = await Link.getAttribute('href');

    // ensure footer is correct
    if (i === 10) {
      await t.expect(url).eql('/more');
      const footerText = await Link.findReact('span');
      await t.expect(footerText.innerText).eql('View all active issues');
    }
  }
});
