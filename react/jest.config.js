process.env.TZ = 'America/New_York';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^d3$': '<rootDir>/node_modules/d3/dist/d3.min.js',
  },
};
