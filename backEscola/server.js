require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./routes');
const { sequelize } = require('./models');
const { ensureDatabaseExists } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
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
