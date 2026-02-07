import { CheckCircle, X, Clock, Target, Brain, MessageCircle } from 'lucide-react'

const SessionSummaryModal = ({ isOpen, onClose, summary }) => {
  if (!isOpen || !summary) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-effect rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Session Complete! 🎉</h2>
              <p className="text-sm text-gray-400">Great work staying focused</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-effect-dark rounded-xl p-4">
            <Clock className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-lg font-bold">{summary.duration}</p>
          </div>
          <div className="glass-effect-dark rounded-xl p-4">
            <Target className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-xs text-gray-400">Tasks</p>
            <p className="text-lg font-bold">{summary.activitiesCompleted}</p>
          </div>
          <div className="glass-effect-dark rounded-xl p-4">
            <Brain className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-xs text-gray-400">Concepts</p>
            <p className="text-lg font-bold">{summary.entitiesLearned}</p>
          </div>
          <div className="glass-effect-dark rounded-xl p-4">
            <MessageCircle className="w-5 h-5 text-orange-400 mb-2" />
            <p className="text-xs text-gray-400">Messages</p>
            <p className="text-lg font-bold">{summary.messagesExchanged}</p>
          </div>
        </div>

        {/* Task */}
        {summary.currentTask && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Your Focus</h3>
            <div className="glass-effect-dark rounded-xl p-3">
              <p className="text-sm">{summary.currentTask}</p>
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Session Summary</h3>
          <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl p-4">
            <p className="text-sm leading-relaxed">{summary.summary}</p>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default SessionSummaryModal
