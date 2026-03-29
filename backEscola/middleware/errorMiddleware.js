const multer = require('multer');
const { UniqueConstraintError } = require('sequelize');

const notFound = (req, res, next) => {
  const error = new Error('Rota nao encontrada.');
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  if (error instanceof UniqueConstraintError) {
    const field = error.errors?.[0]?.path || 'campo';
    return res.status(409).json({
      message: `${field} ja cadastrado.`
    });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Arquivo muito grande. O tamanho maximo permitido e 5MB.'
      });
    }

    return res.status(400).json({
      message: error.message || 'Erro no upload do arquivo.'
    });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500
    ? 'Erro interno do servidor.'
    : (error.message || 'Erro na requisicao.');

  return res.status(statusCode).json({
    message
  });
};

module.exports = {
  notFound,
  errorHandler
};
