const {
  DATABASE_HOST: host = 'localhost',
  DATABASE_PORT: port = '3306',
  DATABASE_USERNAME: username = 'root',
  DATABASE_PASSWORD: password = '',
  DEVELOPMENT_DATABASE: devDB = 'dev',
  PRODUCTION_DATABASE: prodDB = 'prod',
} = process.env;

module.exports = [
  {
    name: 'development',
    type: 'mysql',
    host,
    port,
    username,
    password,
    database: devDB,
    synchronize: true,
  },
  {
    name: 'production',
    type: 'mysql',
    host,
    port,
    username,
    password,
    database: prodDB,
    synchronize: true,
  },
  {
    name: 'default',
    type: 'mysql',
    host,
    port,
    username,
    password,
    database: devDB,
    synchronize: true,
  },
];
