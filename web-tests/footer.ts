import { ClientFunction, t, Selector } from 'testcafe';
import { waitForReact, ReactSelector } from 'testcafe-react-selectors';

const getWindowLocation = ClientFunction(() => window.location.href);

fixture`Footer`.page`http://localhost:3000`.beforeEach(async () => {
  waitForReact(15000);
});

// tslint:disable-next-line:no-shadowed-variable
test('Footer displays left links', async t => {
  const Footer = await ReactSelector('Footer');
  await t.expect(Footer).ok('Footer is displayed');
  const colophon = await Selector('.colophon');
  const leftContainer = await colophon.find('.colophon__left');
  const leftLinks = await leftContainer.find('li');

  const count = await leftLinks.count;
  await t.expect(count).eql(4);

  const about = leftLinks.nth(0);
  const aboutLink = about.find('a');
  await t.expect(aboutLink.getAttribute('href')).eql('/about');
  await t.expect(aboutLink.innerText).eql('About');
  const aboutLabel = await aboutLink.find('.fa fa-heart');
  await t.expect(aboutLabel).ok();

  const faq = leftLinks.nth(1);
  const faqLink = faq.find('a');
  await t.expect(faqLink.getAttribute('href')).eql('/faq');
  await t.expect(faqLink.innerText).eql('FAQ / Contact');
  const faqLabel = await faqLink.find('.fa fa-question-circle');
  await t.expect(faqLabel).ok();

  const opensource = leftLinks.nth(2);
  const osLink = opensource.find('a');
  await t
    .expect(osLink.getAttribute('href'))
    .eql('https://github.com/5calls/5calls');
  await t.expect(osLink.innerText).eql('Open Source');
  const osLabel = await osLink.find('.fa fa-github');
  await t.expect(osLabel).ok();

  const privacy = leftLinks.nth(3);
  const privacyLink = privacy.find('a');
  await t.expect(privacyLink.getAttribute('href')).eql('/privacy');
  await t.expect(privacyLink.innerText).eql('Privacy');
  const privacyLabel = await privacyLink.find('.fa fa-shield');
  await t.expect(privacyLabel).ok();
});

// tslint:disable-next-line:no-shadowed-variable
test('Footer displays right links', async t => {
  const Footer = await ReactSelector('Footer');
  await t.expect(Footer).ok('Footer is displayed');
  const colophon = await Selector('.colophon');
  const rightContainer = await colophon.find('.colophon__right');
  const rightLinks = await rightContainer.find('li');

  const count = await rightLinks.count;
  await t.expect(count).eql(3);

  const impact = rightLinks.nth(0);
  const impactLink = impact.find('a');
  await t.expect(impactLink.getAttribute('href')).eql('/impact');
  await t.expect(impactLink.innerText).eql('Your Impact');

  const support = rightLinks.nth(2);
  const supportLink = support.find('a');
  await t
    .expect(supportLink.getAttribute('href'))
    .eql('https://secure.actblue.com/contribute/page/5calls?refcode=web');
  await t.expect(supportLink.innerText).eql('Be a Supporter');
  const supportLabel = await supportLink.find('.fa fa-money');
  await t.expect(supportLabel).ok();
});
