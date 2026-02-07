import { useState } from 'react'
import { Brain, Target, Clock, TrendingUp, Sparkles, Play, Square, MessageCircle } from 'lucide-react'
import useSessionStore from '../store/sessionStore'
import SessionModal from './SessionModal'
import SessionSummaryModal from './SessionSummaryModal'

const Dashboard = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [sessionSummary, setSessionSummary] = useState(null)

  const {
    isSessionActive,
    currentTask,
    sessionDuration,
    tasksCompleted,
    knowledgeGraph,
    messagesExchanged,
    isStarting,
    isEnding,
    startSession,
    endSession,
    getFormattedDuration,
  } = useSessionStore()

  const handleStartSession = async (taskDescription) => {
    const result = await startSession(taskDescription)
    if (result.success) {
      setIsSessionModalOpen(false)
    }
  }

  const handleEndSession = async () => {
    const result = await endSession()
    if (result.success && result.summary) {
      setSessionSummary(result.summary)
      setIsSummaryModalOpen(true)
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isSidebarOpen ? 'mr-[28rem]' : 'mr-0'} p-8`}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent mb-2">
              Welcome to Continuum
            </h1>
            <p className="text-gray-300">Your AI-powered focus companion for maximum productivity</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-6 py-3 glass-effect rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-primary-300" />
            <span>Open Companion</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Session Time"
          value={isSessionActive ? getFormattedDuration() : '0:00'}
          subtitle="Active time"
          gradient="from-blue-500 to-cyan-500"
          isActive={isSessionActive}
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          title="Tasks Completed"
          value={tasksCompleted.toString()}
          subtitle="This session"
          gradient="from-purple-500 to-pink-500"
          isActive={isSessionActive}
        />
        <StatCard
          icon={<Brain className="w-6 h-6" />}
          title="Concepts Learned"
          value={knowledgeGraph.entities.length.toString()}
          subtitle="This session"
          gradient="from-green-500 to-emerald-500"
          isActive={isSessionActive}
        />
        <StatCard
          icon={<MessageCircle className="w-6 h-6" />}
          title="AI Messages"
          value={messagesExchanged.toString()}
          subtitle="Exchanged"
          gradient="from-orange-500 to-red-500"
          isActive={isSessionActive}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Task */}
        <div className="glass-effect rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            Current Focus
          </h2>

          {isSessionActive ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300 mb-1">Active Session</p>
                    <p className="text-sm leading-relaxed">{currentTask}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Duration: {getFormattedDuration()}</span>
                  <span>{knowledgeGraph.entities.length} concepts</span>
                </div>
              </div>

              <button
                onClick={handleEndSession}
                disabled={isEnding}
                className="w-full px-4 py-3 glass-effect-dark rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                <Square className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                <span>{isEnding ? 'Ending...' : 'End Session'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-black/20 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-4">No active session</p>
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4" />
                <span>Start Focus Session</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-effect rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-400" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <ActionButton
              title="Start Focus Session"
              description="Begin tracking your work"
              onClick={() => setIsSessionModalOpen(true)}
              disabled={isSessionActive}
            />
            <ActionButton
              title="Open AI Companion"
              description="Chat with your focus assistant"
              onClick={() => setIsSidebarOpen(true)}
            />
            <ActionButton
              title="View Knowledge Graph"
              description="See what you've learned"
              disabled={!isSessionActive || knowledgeGraph.entities.length === 0}
            />
            <ActionButton
              title="End Current Session"
              description="Save progress and get summary"
              onClick={handleEndSession}
              disabled={!isSessionActive || isEnding}
            />
          </div>
        </div>

        {/* Session Info */}
        <div className="glass-effect rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-400" />
            How Continuum Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              title="Context Awareness"
              description="I maintain awareness of your current task and build a knowledge graph from your session."
              icon="🧠"
            />
            <FeatureCard
              title="Smart Assistance"
              description="Ask me anything about your work. I use Gemini AI to provide contextual help."
              icon="💬"
            />
            <FeatureCard
              title="Focus Support"
              description="I detect distractions and offer encouragement to help you stay on track."
              icon="🎯"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onStart={handleStartSession}
        isLoading={isStarting}
      />

      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={sessionSummary}
      />
    </div>
  )
}

const StatCard = ({ icon, title, value, subtitle, gradient, isActive }) => (
  <div className={`glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300 ${isActive ? 'ring-2 ring-primary-500/50' : ''}`}>
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-gray-300 text-sm mb-1">{title}</h3>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-gray-400 text-xs">{subtitle}</p>
  </div>
)

const ActionButton = ({ title, description, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full glass-effect-dark rounded-xl p-4 hover:bg-white/10 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  >
    <h3 className="font-semibold mb-1 group-hover:text-primary-300 transition-colors">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </button>
)

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-black/20 rounded-xl p-6 text-center">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-bold mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
)

export default Dashboard
