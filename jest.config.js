module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/app.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};
