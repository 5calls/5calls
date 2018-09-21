const axios = require('axios');
const createTestCafe = require('testcafe');
let testcafe = null;

const browsers = [
  //  ['browserstack:edge@17.0:Windows 10'],
  ['browserstack:chrome@69.0:Windows 10', 'browserstack:firefox@61.0:Windows 10'],
  ['browserstack:firefox@61.0:OS X High Sierra', 'browserstack:chrome@69.0:OS X High Sierra'],
  ['browserstack:safari@11.1:OS X High Sierra'],
];

const runTest = async browser => {
  console.log('starting tests');
  await createTestCafe('localhost', 1337, 1338)
    .then(tc => {
      testcafe = tc;
      const runner = testcafe.createRunner();

      return runner
        .src(['web-tests/*.ts'])
        .browsers(browser)
        .run();
    })
    .then(async failedCount => {
      console.log('Tests failed: ' + failedCount);
      await testcafe.close();
      return;
    });
}

const runAllBrowsers = async () => {
  for (const browser of browsers) {
    await runTest(browser);
  }
}

const runE2ETests = () => {
  axios.get('http://localhost:3000')
    .then(resp => {
      runAllBrowsers();
    })
    .catch(err => {
      console.log('Please start the site locally before running tests by running "yarn start"');
      return;
    });
}

runE2ETests();
