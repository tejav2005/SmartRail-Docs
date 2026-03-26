const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { env } = require('./config/env');
const routes = require('./routes');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// __dirname = .../backend/src — go up one level to reach the backend root
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KMRL backend is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
