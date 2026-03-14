module.exports = {
  secret: process.env.JWT_SECRET || 'troque-este-segredo-em-producao',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d'
};
