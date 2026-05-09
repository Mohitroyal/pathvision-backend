const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

router.get('/', translationController.getAllTranslations);
router.post('/', translationController.createTranslation);
router.put('/:id', translationController.updateTranslation);
router.delete('/:id', translationController.deleteTranslation);

module.exports = router;
