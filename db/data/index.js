const ENV = process.env.NODE_ENV || 'development';

const data = {
  development: require('./development-data'),
  test: require('./test-data'),
  production: require('./production-data'),
};

module.exports = data[ENV];
