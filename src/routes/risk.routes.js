const express = require('express');
const router = express.Router();
const riskController = require('../controllers/risk.controller');

router.get('/', riskController.getAllRisks);
router.post('/', riskController.createRisk);

module.exports = router;
