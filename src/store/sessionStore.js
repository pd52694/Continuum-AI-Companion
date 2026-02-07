import { create } from 'zustand';
import { sessionAPI } from '../services/api';

const useSessionStore = create((set, get) => ({
  // Session state
  session: null,
  isSessionActive: false,
  sessionStartTime: null,
  sessionDuration: 0,
  currentTask: '',

  // Session data
  activities: [],
  knowledgeGraph: {
    entities: [],
    relationships: [],
    summaries: [],
  },

  // Stats
  tasksCompleted: 0,
  messagesExchanged: 0,

  // Loading states
  isStarting: false,
  isEnding: false,
  error: null,

  /**
   * Start a new session
   */
  startSession: async (taskDescription) => {
    set({ isStarting: true, error: null });

    try {
      const response = await sessionAPI.startSession(taskDescription);

      if (response.success) {
        set({
          session: response.session,
          isSessionActive: true,
          sessionStartTime: new Date(response.session.startTime),
          currentTask: taskDescription,
          activities: [],
          knowledgeGraph: {
            entities: [],
            relationships: [],
            summaries: [],
          },
          tasksCompleted: 0,
          messagesExchanged: 0,
          isStarting: false,
        });

        // Start duration counter
        const interval = setInterval(() => {
          const state = get();
          if (state.isSessionActive && state.sessionStartTime) {
            const now = new Date();
            const duration = Math.floor((now - state.sessionStartTime) / 1000);
            set({ sessionDuration: duration });
          }
        }, 1000);

        // Store interval ID for cleanup
        set({ durationInterval: interval });

        return { success: true };
      }
    } catch (error) {
      console.error('Error starting session:', error);
      set({
        isStarting: false,
        error: error.message || 'Failed to start session'
      });
      return { success: false, error: error.message };
    }
  },

  /**
   * End the current session
   */
  endSession: async () => {
    const state = get();

    if (!state.session?.id) {
      return { success: false, error: 'No active session' };
    }

    set({ isEnding: true, error: null });

    try {
      // Clear duration interval
      if (state.durationInterval) {
        clearInterval(state.durationInterval);
      }

      const response = await sessionAPI.endSession(state.session.id);

      if (response.success) {
        set({
          session: null,
          isSessionActive: false,
          sessionStartTime: null,
          sessionDuration: 0,
          currentTask: '',
          isEnding: false,
        });

        return {
          success: true,
          summary: response.sessionSummary
        };
      }
    } catch (error) {
      console.error('Error ending session:', error);
      set({
        isEnding: false,
        error: error.message || 'Failed to end session'
      });
      return { success: false, error: error.message };
    }
  },

  /**
   * Update current task
   */
  updateTask: async (newTask) => {
    const state = get();

    if (!state.session?.id) return;

    try {
      await sessionAPI.updateSession(state.session.id, {
        currentTask: newTask,
      });

      set({ currentTask: newTask });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  },

  /**
   * Log an activity
   */
  logActivity: async (activity) => {
    const state = get();

    if (!state.session?.id) return;

    const newActivities = [...state.activities, {
      activity,
      timestamp: new Date().toISOString(),
    }];

    set({ activities: newActivities });

    try {
      await sessionAPI.updateSession(state.session.id, {
        activities: [activity],
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  /**
   * Extract entities from text
   */
  extractEntities: async (text) => {
    const state = get();

    if (!state.session?.id) return;

    try {
      const response = await sessionAPI.extractEntities(state.session.id, text);

      if (response.success && response.entities) {
        const updatedEntities = [...new Set([...state.knowledgeGraph.entities, ...response.entities])];

        set({
          knowledgeGraph: {
            ...state.knowledgeGraph,
            entities: updatedEntities,
          },
        });

        return response.entities;
      }
    } catch (error) {
      console.error('Error extracting entities:', error);
    }
  },

  /**
   * Increment message counter
   */
  incrementMessages: () => {
    set(state => ({ messagesExchanged: state.messagesExchanged + 1 }));
  },

  /**
   * Increment tasks completed
   */
  completeTask: () => {
    set(state => ({ tasksCompleted: state.tasksCompleted + 1 }));
  },

  /**
   * Get session context for AI
   */
  getSessionContext: () => {
    const state = get();

    return {
      currentTask: state.currentTask,
      activities: state.activities.map(a => a.activity),
      knowledgeGraph: state.knowledgeGraph,
      sessionDuration: state.sessionDuration,
      tasksCompleted: state.tasksCompleted,
    };
  },

  /**
   * Format session duration
   */
  getFormattedDuration: () => {
    const duration = get().sessionDuration;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),
}));

export default useSessionStore;
