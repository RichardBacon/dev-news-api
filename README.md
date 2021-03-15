# Dev News API

The hosted API: [Dev News API](https://dev-news-api.herokuapp.com/api)

This repo is for the backend API.

The repo for the frontend web app can be found here: [Dev News](https://github.com/RichardBacon/dev-news).

## Description

An API to serve a mock news and discussion site for developers, inspired by [Reddit](https://www.reddit.com/) and [DEV Community](https://dev.to/).

## Getting Started

```bash
git clone https://github.com/RichardBacon/dev-news-api.git
```

### Prerequisites

```
node v12
postgresql v12.2
```

### Installing

```
npm install
```

### Database Setup

Add a knexfile.js in the root directory

- user and password should be your postgres credentials (not required for mac users)

```js
// knexfile.js

const ENV = process.env.NODE_ENV || 'development';

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations',
  },
  seeds: {
    directory: './db/seeds',
  },
};

const customConfig = {
  development: {
    connection: {
      database: 'dev_news',
      // user,
      // password
    },
  },
  test: {
    connection: {
      database: 'dev_news_test',
      // user,
      // password
    },
  },
};

module.exports = { ...customConfig[ENV], ...baseConfig };
```

Create databases

```
npm run setup-dbs
```

Seed databases

```
npm run seed:test
npm run seed:dev
```

### Starting The Server

```
npm run dev-server
```

## Running Tests

```
npm test
```

## Built With

- [Express](https://expressjs.com/)
- [Jest](https://jestjs.io/)
- [Knex](http://knexjs.org/)
- [Node](https://nodejs.org/en/)
- [Node Postgres](https://node-postgres.com/)
- [Supertest](https://github.com/visionmedia/supertest)

## Authors

- **Richard Bacon** - [RichardBacon](https://github.com/RichardBacon)

## License

This project is licensed under the MIT License, see the [LICENSE](LICENSE) file for details.
