const pino = require('pino');

const TEST_ENV = process.env.NODE_ENV === 'test';

module.exports = pino({
  name: 'nodejs-recruitment-task',
  enabled: !TEST_ENV,
  level: TEST_ENV ? 'silent' : process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.LOG_PRETTY ? true : process.env.NODE_ENV === 'development',
});
