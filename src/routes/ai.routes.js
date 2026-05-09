const express = require('express');
const router = express.Router();
const AiService = require('../services/ai.service');

router.post('/command', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Command text is required' });
    }
    const result = await AiService.processCommand(text);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
