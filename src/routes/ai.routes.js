const express = require('express');
const router = express.Router();
const AiService = require('../services/ai.service');

router.post('/command', async (req, res, next) => {
  try {
    const { text, userId } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Command text is required' });
    }
    console.log(`[AI ROUTE] POST /api/ai/command | userId: ${userId || 'anonymous'}`);
    const result = await AiService.processCommand(text, userId);
    res.json(result);
  } catch (err) {
    console.error('[AI ROUTE] Unhandled error:', err.message);
    next(err);
  }
});

module.exports = router;
