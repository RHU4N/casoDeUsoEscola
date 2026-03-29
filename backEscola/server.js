require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { sequelize } = require('./models');
const { ensureDatabaseExists } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
};

const parseAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ORIGINS || 'http://localhost:5173';

  return configuredOrigins
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);
};

const allowedOrigins = new Set(parseAllowedOrigins());
const allowLocalhostInDev = process.env.CORS_ALLOW_LOCALHOST === 'true' || process.env.NODE_ENV !== 'production';

const isAllowedLocalDevOrigin = (origin) => {
  const parsed = new URL(origin);
  return parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
};

const isOriginAllowed = (origin) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) {
    return false;
  }

  if (allowedOrigins.has(normalized)) {
    return true;
  }

  return allowLocalhostInDev && isAllowedLocalDevOrigin(normalized);
};

const globalRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisicoes. Tente novamente em alguns minutos.' }
});

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      return callback(null, true);
    }

    const corsError = new Error('Origem nao permitida por CORS.');
    corsError.statusCode = 403;
    return callback(corsError);
  }
}));
app.use(globalRateLimiter);
app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API sistema escolar online.' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();

    const shouldSync = process.env.DB_SYNC !== 'false';
    if (shouldSync) {
      await sequelize.sync();
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer
};
