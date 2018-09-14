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
  await t.expect(SidebarHeader).ok();

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
