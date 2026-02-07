import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Cannot connect to server. Make sure backend is running on port 5000.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

/**
 * Chat API
 */
export const chatAPI = {
  /**
   * Send a message to the AI companion
   */
  sendMessage: async (message, conversationHistory = [], sessionContext = {}) => {
    try {
      const response = await apiClient.post('/chat/message', {
        message,
        conversationHistory,
        sessionContext,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Get a focus check-in prompt
   */
  getFocusCheckIn: async (sessionContext = {}) => {
    try {
      const response = await apiClient.post('/chat/focus-check', {
        sessionContext,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting focus check-in:', error);
      throw error;
    }
  },

  /**
   * Get a motivational message
   */
  getMotivation: async (context = '') => {
    try {
      const response = await apiClient.post('/chat/motivation', {
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting motivation:', error);
      throw error;
    }
  },
};

/**
 * Session API
 */
export const sessionAPI = {
  /**
   * Start a new session
   */
  startSession: async (currentTask = '', userId = 'default') => {
    try {
      const response = await apiClient.post('/session/start', {
        currentTask,
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  /**
   * Get session data
   */
  getSession: async (sessionId) => {
    try {
      const response = await apiClient.get(`/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  },

  /**
   * Update session data
   */
  updateSession: async (sessionId, updates) => {
    try {
      const response = await apiClient.put(`/session/${sessionId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  /**
   * Extract entities from text
   */
  extractEntities: async (sessionId, text) => {
    try {
      const response = await apiClient.post(`/session/${sessionId}/extract-entities`, {
        text,
      });
      return response.data;
    } catch (error) {
      console.error('Error extracting entities:', error);
      throw error;
    }
  },

  /**
   * End a session
   */
  endSession: async (sessionId) => {
    try {
      const response = await apiClient.post(`/session/${sessionId}/end`);
      return response.data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  /**
   * Get all session stats
   */
  getAllStats: async () => {
    try {
      const response = await apiClient.get('/session/stats/all');
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default {
  chat: chatAPI,
  session: sessionAPI,
  healthCheck,
};
