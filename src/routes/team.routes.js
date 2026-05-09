const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');

router.get('/', teamController.getAllUsers);
router.post('/', teamController.createUser);
router.put('/:id', teamController.updateUser);
router.delete('/:id', teamController.deleteUser);

module.exports = router;
