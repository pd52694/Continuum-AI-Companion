import express from 'express';
import geminiService from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/chat/message
 * Send a message to the AI companion
 */
router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory, sessionContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      });
    }

    console.log(`💬 Chat message received: "${message.substring(0, 50)}..."`);

    // Get response from Gemini
    const response = await geminiService.chat(
      message,
      conversationHistory || [],
      sessionContext || {}
    );

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process chat message',
      success: false,
    });
  }
});

/**
 * POST /api/chat/focus-check
 * Generate a focus check-in prompt
 */
router.post('/focus-check', async (req, res) => {
  try {
    const { sessionContext } = req.body;

    console.log('🎯 Generating focus check-in...');

    const prompt = await geminiService.generateFocusCheckIn(sessionContext || {});

    res.json({
      success: true,
      prompt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Focus check error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate focus check-in',
      success: false,
    });
  }
});

/**
 * POST /api/chat/motivation
 * Generate a motivational message
 */
router.post('/motivation', async (req, res) => {
  try {
    const { context } = req.body;

    console.log('⭐ Generating motivational message...');

    const message = await geminiService.generateMotivation(context || '');

    res.json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Motivation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate motivation',
      success: false,
    });
  }
});

export default router;
