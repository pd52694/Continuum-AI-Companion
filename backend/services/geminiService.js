import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;

    // System context for the AI companion
    this.systemContext = `You are Continuum, an AI-powered focus companion designed to help students and employees stay productive and focused. Your role is to:

1. Help users maintain focus on their current task
2. Provide contextual assistance based on their work
3. Offer motivational support and encouragement
4. Detect when users might be distracted and gently guide them back
5. Summarize their work and learning progress
6. Extract key concepts and relationships from their activities

Be friendly, supportive, and concise. Use an encouraging tone. Keep responses brief (2-3 sentences) unless the user asks for detailed information.`;
  }

  /**
   * Initialize the Gemini model (lazy loading)
   */
  initializeModel() {
    if (this.initialized) return;

    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
      throw new Error('Gemini API is not configured. Please add GEMINI_API_KEY to your .env file.');
    }

    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Try gemini-3-pro-preview for free tier API
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro' });
      this.initialized = true;
      console.log('✅ Gemini AI service initialized with gemini-3-pro');
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw new Error('Failed to initialize Gemini API');
    }
  }

  /**
   * Send a chat message to Gemini and get a response
   */
  async chat(userMessage, conversationHistory = [], sessionContext = {}) {
    this.initializeModel();

    try {
      // Build the conversation context
      let prompt = this.systemContext + '\n\n';

      // Add session context if available
      if (sessionContext.currentTask) {
        prompt += `Current user task: ${sessionContext.currentTask}\n`;
      }
      if (sessionContext.recentActivity && sessionContext.recentActivity.length > 0) {
        prompt += `Recent activity: ${sessionContext.recentActivity.join(', ')}\n`;
      }
      if (sessionContext.knowledgeGraph && sessionContext.knowledgeGraph.entities) {
        prompt += `Known concepts: ${sessionContext.knowledgeGraph.entities.slice(0, 5).join(', ')}\n`;
      }

      // Add conversation history (last 5 messages for context)
      if (conversationHistory.length > 0) {
        prompt += '\nRecent conversation:\n';
        conversationHistory.slice(-5).forEach(msg => {
          prompt += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
        });
      }

      // Add current user message
      prompt += `\nUser: ${userMessage}\nAssistant:`;

      console.log('📤 Sending to Gemini...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('📥 Received from Gemini');

      return {
        success: true,
        message: text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Gemini API Error:', error);

      // Handle specific error cases
      if (error.message?.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.');
      }

      throw new Error(`Failed to get response from Gemini: ${error.message}`);
    }
  }

  /**
   * Generate a focus check-in prompt
   */
  async generateFocusCheckIn(sessionContext = {}) {
    try {
      this.initializeModel();
    } catch (error) {
      // Fallback prompts if API not configured
      const fallbackPrompts = [
        "Are you still working on your task?",
        "How's your progress going?",
        "Need any help staying focused?",
        "What's your next step?",
      ];
      return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
    }

    try {
      let prompt = `Generate a brief, friendly focus check-in message for a user. `;

      if (sessionContext.currentTask) {
        prompt += `They are working on: ${sessionContext.currentTask}. `;
      }

      prompt += `Keep it short (1 sentence), supportive, and ask if they need help or are still on track.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating focus check-in:', error);
      return "Are you still focused on your task? Let me know if you need any help!";
    }
  }

  /**
   * Extract entities and concepts from text
   */
  async extractEntities(text, existingEntities = []) {
    this.initializeModel();

    try {
      const prompt = `Extract key concepts, entities, and important information from the following text. Return only a comma-separated list of the most important terms and concepts (maximum 10):

Text: ${text}

Return format: concept1, concept2, concept3`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();

      // Parse the comma-separated entities
      const entities = text_response
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)
        .slice(0, 10);

      return entities;
    } catch (error) {
      console.error('Error extracting entities:', error);
      return [];
    }
  }

  /**
   * Generate a summary of the session
   */
  async summarizeSession(sessionData) {
    this.initializeModel();

    try {
      let prompt = `Summarize this work session in 2-3 sentences. Focus on what was accomplished and key learnings:\n\n`;

      if (sessionData.currentTask) {
        prompt += `Task: ${sessionData.currentTask}\n`;
      }
      if (sessionData.activities && sessionData.activities.length > 0) {
        prompt += `Activities: ${sessionData.activities.join(', ')}\n`;
      }
      if (sessionData.entities && sessionData.entities.length > 0) {
        prompt += `Key concepts: ${sessionData.entities.join(', ')}\n`;
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Session completed. Great work staying focused!';
    }
  }

  /**
   * Generate a motivational message
   */
  async generateMotivation(context = '') {
    try {
      this.initializeModel();
    } catch (error) {
      const fallbackMessages = [
        "You're doing great! Keep up the excellent work! 🌟",
        "Stay focused - you've got this! 💪",
        "Every step forward is progress. Keep going! 🚀",
        "Your dedication is impressive. Keep pushing! ⭐",
      ];
      return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }

    try {
      const prompt = `Generate a short (1-2 sentences), encouraging motivational message for someone working hard. ${context ? `Context: ${context}` : ''} Be uplifting and supportive.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating motivation:', error);
      return "You're doing amazing! Keep up the great work! 🌟";
    }
  }
}

// Export singleton instance
export default new GeminiService();
