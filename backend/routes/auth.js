const express = require('express');
const { register, login, refresh, me, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => register(req, res));
router.post('/login', (req, res) => login(req, res));
router.post('/refresh', (req, res) => refresh(req, res));
router.get('/me', auth, (req, res) => me(req, res));
router.post('/logout', auth, (req, res) => logout(req, res));

module.exports = router;
