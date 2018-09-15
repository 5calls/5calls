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

fixture`Header`
  .page`http://localhost:3000`
  .beforeEach(async () => {
    await waitForReact(5000);
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

// tslint:disable-next-line:no-shadowed-variable
test('Donation bar is displayed', async t => {
  const DonationBar = await ReactSelector('Donation');
  await t.expect(DonationBar).ok();

  const donateText = await Selector('.logo__header__donatetext');
  const donateLinks = await Selector('.logo__header__donatebutton');
  const count = await donateLinks.count;

  const donateLinkExpected = [
    {
      url: 'https://airtable.com/shrSFvr3AlMKRRssx',
      linkText: 'Contact Us',
      labelText: 'Get Your Own 5 Calls Page',
    },
    {
      url: 'https://github.com/5calls/5calls/wiki/Getting-Involved-with-5-Calls-Development',
      linkText: 'Projects',
      labelText: 'Contribute Design or Code',
    },
    {
      url: 'https://secure.actblue.com/donate/5calls-donate?amount=25',
      linkText: 'Donate',
      labelText: 'Be a 5 Calls Supporter',
    },
  ];

  await t.expect(donateText.innerText).eql('Get Involved:');

  for (let i = 0; i < count; i++) {
    const link = donateLinks.nth(i);
    const expected = donateLinkExpected[i];
    const linkElement = await link.find('a');
    const linkUrl = await linkElement.getAttribute('href');
    const linkLabel = await link.find('p');

    await t.expect(linkUrl).eql(expected.url);
    await t.expect(linkElement.innerText).eql(expected.linkText);
    await t.expect(linkLabel.innerText).eql(expected.labelText);
  }
});
