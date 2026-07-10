import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('sewrouk bel galaxy fouq tabla trogsi');
});

export default app;
