const express = require('express');
const cors = require('cors');
const { apiRouter } = require('./routes/api.router');
const {
  send404,
  handlePSQLErrors,
  handleCustomErrors,
  handleInternalErrors,
} = require('./controllers/errors.controller');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);
app.use(send404);

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handleInternalErrors);

module.exports = app;
