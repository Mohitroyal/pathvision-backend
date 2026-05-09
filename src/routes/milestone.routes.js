const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestone.controller');

router.get('/', milestoneController.getAllMilestones);
router.post('/', milestoneController.createMilestone);

module.exports = router;
