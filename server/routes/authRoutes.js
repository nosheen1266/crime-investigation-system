const express = require('express');
const router = express.Router();
const { citizenRegister, citizenLogin, officerLogin, forensicLogin, adminLogin, refreshToken, adminRefreshToken, logout } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/citizen/register', citizenRegister);
router.post('/citizen/login', loginLimiter, citizenLogin);
router.post('/officer/login', loginLimiter, officerLogin);
router.post('/forensic/login', loginLimiter, forensicLogin);
router.post('/admin/login', loginLimiter, adminLogin);
router.post('/refresh-token', refreshToken);
router.post('/admin/refresh-token', adminRefreshToken);
router.post('/logout', logout);

module.exports = router;