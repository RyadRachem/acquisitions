import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined',{stream: {write: (message)=> logger.info(message.trim())}}));
app.use(securityMiddleware);

app.get('/', (req, res) => {

  logger.info('Hello from the acquisitions API!');

  res.status(200).send('sewrouk bel galaxy fouq tabla trogsi');

});

app.get('/api/health', (req, res) => {
  res.status(200).json({status: 'ok', timestamp: new Date().toISOString(),uptime: process.uptime()});
});

app.get('/api', (req, res) => {
  res.status(200).json({message: 'acquisitions api is running'});
});

app.use('/api/auth', authRoutes);

export default app;
