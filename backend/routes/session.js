import express from 'express';
import geminiService from '../services/geminiService.js';

const router = express.Router();

// In-memory session storage (will reset when server restarts)
// This simulates the temporary nature of sessions
const sessions = new Map();

/**
 * POST /api/session/start
 * Start a new focus session
 */
router.post('/start', (req, res) => {
  try {
    const { userId = 'default', currentTask } = req.body;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session = {
      id: sessionId,
      userId,
      currentTask: currentTask || '',
      startTime: new Date().toISOString(),
      knowledgeGraph: {
        entities: [],
        relationships: [],
        summaries: [],
      },
      activities: [],
      conversationHistory: [],
    };

    sessions.set(sessionId, session);

    console.log(`🚀 Session started: ${sessionId}`);

    res.json({
      success: true,
      session: {
        id: sessionId,
        startTime: session.startTime,
        currentTask: session.currentTask,
      },
    });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({
      error: error.message || 'Failed to start session',
      success: false,
    });
  }
});

/**
 * GET /api/session/:sessionId
 * Get session data
 */
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        error: 'Session not found',
        success: false,
      });
    }

    const session = sessions.get(sessionId);

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Session get error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get session',
      success: false,
    });
  }
});

/**
 * PUT /api/session/:sessionId
 * Update session data
 */
router.put('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        error: 'Session not found',
        success: false,
      });
    }

    const session = sessions.get(sessionId);

    // Update allowed fields
    if (updates.currentTask !== undefined) {
      session.currentTask = updates.currentTask;
    }
    if (updates.activities) {
      session.activities = [...session.activities, ...updates.activities];
    }
    if (updates.conversationHistory) {
      session.conversationHistory = updates.conversationHistory;
    }
    if (updates.knowledgeGraph) {
      session.knowledgeGraph = {
        ...session.knowledgeGraph,
        ...updates.knowledgeGraph,
      };
    }

    sessions.set(sessionId, session);

    console.log(`📝 Session updated: ${sessionId}`);

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update session',
      success: false,
    });
  }
});

/**
 * POST /api/session/:sessionId/extract-entities
 * Extract entities from text and add to knowledge graph
 */
router.post('/:sessionId/extract-entities', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        error: 'Session not found',
        success: false,
      });
    }

    const session = sessions.get(sessionId);

    console.log(`🧠 Extracting entities from text...`);

    // Extract entities using Gemini
    const newEntities = await geminiService.extractEntities(
      text,
      session.knowledgeGraph.entities
    );

    // Add new unique entities
    const uniqueEntities = [...new Set([...session.knowledgeGraph.entities, ...newEntities])];
    session.knowledgeGraph.entities = uniqueEntities;

    sessions.set(sessionId, session);

    console.log(`✅ Extracted ${newEntities.length} new entities`);

    res.json({
      success: true,
      entities: newEntities,
      totalEntities: uniqueEntities.length,
    });
  } catch (error) {
    console.error('Entity extraction error:', error);
    res.status(500).json({
      error: error.message || 'Failed to extract entities',
      success: false,
    });
  }
});

/**
 * POST /api/session/:sessionId/end
 * End a session and generate summary
 */
router.post('/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        error: 'Session not found',
        success: false,
      });
    }

    const session = sessions.get(sessionId);
    session.endTime = new Date().toISOString();

    console.log(`🏁 Ending session: ${sessionId}`);

    // Generate summary
    let summary = 'Session completed. Great work!';
    try {
      summary = await geminiService.summarizeSession({
        currentTask: session.currentTask,
        activities: session.activities,
        entities: session.knowledgeGraph.entities,
      });
    } catch (error) {
      console.error('Error generating summary:', error);
    }

    // Calculate session duration
    const duration = new Date(session.endTime) - new Date(session.startTime);
    const minutes = Math.floor(duration / 60000);

    const sessionSummary = {
      id: sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: `${minutes} minutes`,
      currentTask: session.currentTask,
      entitiesLearned: session.knowledgeGraph.entities.length,
      activitiesCompleted: session.activities.length,
      messagesExchanged: session.conversationHistory.length,
      summary,
    };

    // Delete session from memory
    sessions.delete(sessionId);

    console.log(`✅ Session ended and cleaned up: ${sessionId}`);

    res.json({
      success: true,
      sessionSummary,
    });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({
      error: error.message || 'Failed to end session',
      success: false,
    });
  }
});

/**
 * GET /api/session/stats
 * Get overall session statistics
 */
router.get('/stats/all', (req, res) => {
  res.json({
    success: true,
    activeSessions: sessions.size,
    sessions: Array.from(sessions.values()).map(s => ({
      id: s.id,
      startTime: s.startTime,
      currentTask: s.currentTask,
      entities: s.knowledgeGraph.entities.length,
    })),
  });
});

export default router;
