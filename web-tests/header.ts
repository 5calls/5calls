import {
  ClientFunction,
  t,
} from 'testcafe';
import {
  waitForReact,
  ReactSelector,
} from 'testcafe-react-selectors';

const getWindowLocation = ClientFunction(() => window.location.href);

fixture`Home page`
  .page`http://localhost:3000`
  .beforeEach(async () => {
    await waitForReact();
  });

// tslint:disable-next-line:no-shadowed-variable
test('The home page link is displayed', async t => {
  const HomeLink = await ReactSelector('Link').withProps({ to: '/'});
  const img = await HomeLink.find('img').withAttribute('src');
  const expectedImage = '/img/5calls-logo-small.png';
  const expectedAlt = '5 Calls';

  await t.expect(img.getAttribute('src')).eql(expectedImage);
  await t.expect(img.getAttribute('alt')).eql(expectedAlt);
});
