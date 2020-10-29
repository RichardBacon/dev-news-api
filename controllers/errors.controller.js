const send404 = (req, res) => {
  res.status(404).send({ msg: 'resource not found' });
};

const send405 = (req, res) => {
  res.status(405).send({ msg: 'method not allowed' });
};

const handlePSQLErrors = (err, req, res, next) => {
  const codes = {
    '22P02': { status: 400, msg: 'bad request' },
    23503: { status: 400, msg: 'bad request' },
    23505: { status: 400, msg: 'bad request' },
    42703: { status: 400, msg: 'bad request' },
  };

  if (err.code in codes) {
    const { status, msg } = codes[err.code];

    res.status(status).send({ msg });
  } else next(err);
};

const handleCustomErrors = (err, req, res, next) => {
  const { status, msg } = err;

  if (status) {
    res.status(status).send({ msg });
  } else next(err);
};

const handleInternalErrors = (err, req, res, next) => {
  console.log('unhandled error:', err);
  res.status(500).send({ msg: 'internal server error' });
};

module.exports = {
  send404,
  send405,
  handlePSQLErrors,
  handleCustomErrors,
  handleInternalErrors,
};
