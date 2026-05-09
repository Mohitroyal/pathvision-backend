const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/planner.controller');

router.get('/', plannerController.getPlannerBlocks);
router.post('/', plannerController.createPlannerBlock);

module.exports = router;
