const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/authController');
const handleValidationErrors = require('../middleware/validationMiddleware');
const { registerValidation, loginValidation } = require('../middleware/userValidation');

const router = express.Router();
const loginRateLimiter = rateLimit({
	windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
	max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 5,
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true,
	keyGenerator: (req) => {
		const email = String(req.body?.email || '').trim().toLowerCase();
		const ipKey = rateLimit.ipKeyGenerator(req.ip);
		return `${ipKey}:${email}`;
	},
	handler: (req, res) => {
		const resetTime = req.rateLimit?.resetTime ? new Date(req.rateLimit.resetTime).getTime() : null;
		const retryInSeconds = resetTime ? Math.max(1, Math.ceil((resetTime - Date.now()) / 1000)) : null;

		return res.status(429).json({
			message: retryInSeconds
				? `Muitas tentativas de login. Tente novamente em ${retryInSeconds}s.`
				: 'Muitas tentativas de login. Aguarde e tente novamente.'
		});
	}
});

router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginRateLimiter, loginValidation, handleValidationErrors, login);

module.exports = router;
