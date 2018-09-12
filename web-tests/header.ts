import {
  ClientFunction,
  t,
  Selector,
} from 'testcafe';
import {
  waitForReact,
  ReactSelector,
} from 'testcafe-react-selectors';
import axios from 'axios';

const getWindowLocation = ClientFunction(() => window.location.href);

fixture`Home page`
  .page`http://localhost:3000`
  .beforeEach(async () => {
    await waitForReact();
  });

// tslint:disable-next-line:no-shadowed-variable
test('All images on front page have loaded', async t => {
  const images = Selector('img');
  const count = await images.count;
  const location = await getWindowLocation();

  let requestPromises = [];

  for (let i = 0; i < count; i++) {
    let url = await images.nth(i).getAttribute('src');

    if (!url.startsWith('data')) {
      requestPromises.push(new Promise((resolve, reject) => {
        // tslint:disable-next-line:no-any
        return axios.get(location + url)
          .then(resp => resolve(resp ? resp.status : 0))
          .catch(e => reject(e));
      }));
    }

    let statuses = await Promise.all(requestPromises);

    for (const stat of statuses) {
      await t.expect(stat).eql(200);
    }
  }
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

// tslint:disable-next-line:no-shadowed-variable
test('The login link is displayed when no users are logged in', async t => {
  const img = await Selector('.stars');
  const link = await Selector('p');

  const expectedSrc = '/img/5calls-stars.png';
  const expectedAlt = 'Make your voice heard';
  const expectedText = 'Log in';

  await t.expect(img.getAttribute('src')).eql(expectedSrc);
  await t.expect(img.getAttribute('alt')).eql(expectedAlt);
  await t.expect(link.innerText).eql(expectedText);
});
