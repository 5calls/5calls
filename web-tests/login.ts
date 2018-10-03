import {
  ClientFunction,
  t,
  Selector,
} from 'testcafe';
const users = require( './accounts.json');

const getWindowLocation = ClientFunction(() => window.location.href);

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// tslint:disable-next-line:no-unused-expression
fixture`Login`
  .page`http://localhost:3000`;

// tslint:disable-next-line:no-shadowed-variable
test.skip('User may login with twitter', async t => {
  const loginComponent = await Selector('.userHeader');
  await t.expect(loginComponent.exists).ok('The user component is missing');
  let userText = await loginComponent.find('p').innerText;

  // Check if currently logged in and log out
  if (userText !== 'Log in') {
    await t.click(loginComponent);
    const userMenu = await Selector('.userHeader__menu');
    const logout = await userMenu.find('li').nth(1);
    await t.click(logout);
    userText = await loginComponent.find('p').innerText;
    await t.expect(userText).eql('Log In');
  }

  await t.click(loginComponent);
  const loginModal = Selector('.login-modal');
  await t.expect(loginModal.exists).ok('Login modal does not show up when clicked');
  const header = loginModal.find('.login-header');
  await t.expect(header.exists).ok('Login header is missing from modal');
  const logo = loginModal.find('.login-header-logo');
  await t.expect(logo.exists).ok('Login logo is missing from modal');
  const twitterLogin = loginModal.find('#btn-twitter');
  await t.expect(twitterLogin.exists).ok('The twitter login button is missing from modal');
  await t.click(twitterLogin);

  let windowLocation = await getWindowLocation();
  const isTwitterLogin = windowLocation.includes('api.twitter.com/oauth/authenticate');
  await t.expect(isTwitterLogin).ok('Did not redirect to twitter login');
  const username = await Selector('#username_or_email');
  const password = await Selector('#password');
  const submit = await Selector('#allow');
  await t.typeText(username, users.twitterLogin.user);
  await t.typeText(password, users.twitterLogin.pass);
  await t.click(submit);

  await sleep(5000);
  windowLocation = await getWindowLocation();
  await t.expect(windowLocation).contains('http://localhost:3000');
  userText = await loginComponent.find('p').innerText;
  await t.expect(userText).eql('fivecalls_test');
});

// tslint:disable-next-line:no-shadowed-variable
test.skip('User may login with facebook', async t => {
  const loginComponent = await Selector('.userHeader');
  await t.expect(loginComponent.exists).ok('The login component is missing');

  let userText = await loginComponent.find('p').innerText;

  // Check if currently logged in and log out
  if (userText !== 'Log in') {
    await t.click(loginComponent);
    const userMenu = await Selector('.userHeader__menu');
    const logout = await userMenu.find('li').nth(1);
    await t.click(logout);
    userText = await loginComponent.find('p').innerText;
    await t.expect(userText).eql('Log In');
  }

  await t.click(loginComponent);
  const loginModal = Selector('.login-modal');
  await t.expect(loginModal.exists).ok('Login modal does not show up when clicked');
  const header = loginModal.find('.login-header');
  await t.expect(header.exists).ok('Login header is missing from modal');
  const logo = loginModal.find('.login-header-logo');
  await t.expect(logo.exists).ok('Login logo is missing from modal');
  const facebookLogin = loginModal.find('#btn-facebook');
  await t.expect(facebookLogin.exists).ok('The facebook login button is missing from modal');
  await t.click(facebookLogin);

  await sleep(5000);
  let windowLocation = await getWindowLocation();
  const isFacebookLogin = windowLocation.includes('facebook.com/login.php');
  await t.expect(isFacebookLogin).ok('Did not redirect to facebook login');

  const username = await Selector('#email');
  const password = await Selector('#pass');
  const submit = await Selector('#loginbutton');
  await t.typeText(username, users.facebookLogin.user);
  await t.typeText(password, users.facebookLogin.pass);
  await t.click(submit);

  windowLocation = await getWindowLocation();
  await t.expect(windowLocation).contains('http://localhost:3000');
  userText = await loginComponent.find('p').innerText;
  await t.expect(userText).eql('Noah Abe');
});
