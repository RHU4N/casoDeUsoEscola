const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET nao configurado. Defina a variavel de ambiente antes de iniciar a API.');
}

module.exports = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '1d'
};
