import { useState, useRef, useEffect } from 'react'
import { Send, X, Minimize2, Sparkles, User, Bot, AlertCircle, Target, CheckCircle } from 'lucide-react'
import { chatAPI } from '../services/api'
import useSessionStore from '../store/sessionStore'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const {
    isSessionActive,
    currentTask,
    getSessionContext,
    incrementMessages,
    extractEntities,
    completeTask,
  } = useSessionStore()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hi! I'm your AI Focus Companion powered by Google Gemini. I'm here to help you stay focused and productive. What are you working on today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessageText = inputMessage

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    setError(null)

    try {
      // Get session context if active
      const sessionContext = isSessionActive ? getSessionContext() : {}

      // Send message to Gemini API via backend with session context
      const response = await chatAPI.sendMessage(
        userMessageText,
        messages, // Send conversation history for context
        sessionContext // Include current session context
      )

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])

      // Increment message counter
      if (isSessionActive) {
        incrementMessages()

        // Extract entities from user message for knowledge graph
        if (userMessageText.length > 20) {
          extractEntities(userMessageText)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: `Sorry, I encountered an error: ${error.message}. Please make sure the backend server is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 w-16 h-16 rounded-full glass-effect shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 group"
      >
        <Sparkles className="w-6 h-6 text-primary-300 group-hover:text-primary-200 transition-colors" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full animate-pulse"></div>
      </button>
    )
  }

  return (
    <div className="fixed right-6 top-6 bottom-6 w-96 glass-effect rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary-500/20 to-accent-500/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center animate-pulse-slow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          </div>
          <div>
            <h2 className="font-bold text-lg">Continuum</h2>
            <p className="text-xs text-gray-300">
              {isSessionActive ? 'In Session' : 'Your AI Focus Companion'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Session Context Banner */}
      {isSessionActive && currentTask && (
        <div className="mx-4 mt-4 space-y-2">
          <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-start gap-2">
            <Target className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary-300 mb-0.5">Current Focus</p>
              <p className="text-xs text-gray-300 line-clamp-2">{currentTask}</p>
            </div>
          </div>
          <button
            onClick={completeTask}
            className="w-full px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-xs text-green-300 hover:text-green-200 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark Task Complete
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'ai'
                ? 'bg-gradient-to-br from-primary-400 to-accent-500'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              {message.type === 'ai' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message bubble */}
            <div className={`flex-1 ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                message.type === 'ai'
                  ? message.isError
                    ? 'bg-red-500/20 border border-red-500/50'
                    : 'bg-white/10 backdrop-blur-sm'
                  : 'bg-gradient-to-r from-primary-500 to-accent-500'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 px-2">{message.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows="1"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default Sidebar
