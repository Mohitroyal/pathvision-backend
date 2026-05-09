const express = require('express');
const router = express.Router();
const pinnedController = require('../controllers/pinnedController');

router.get('/', pinnedController.getPinnedItems);

module.exports = router;
