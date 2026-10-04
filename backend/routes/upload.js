const express = require('express');
const { upload, uploadImage } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/image', auth, upload.single('image'), (req, res) => uploadImage(req, res));

module.exports = router;
