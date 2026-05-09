const express = require('express');
const router = express.Router();
const brainDumpController = require('../controllers/brainDump.controller');

router.get('/', brainDumpController.getBrainDumps);
router.post('/', brainDumpController.createBrainDump);

module.exports = router;
