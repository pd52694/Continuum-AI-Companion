import { useState } from 'react'
import { X, Target, Loader2 } from 'lucide-react'

const SessionModal = ({ isOpen, onClose, onStart, isLoading }) => {
  const [taskDescription, setTaskDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (taskDescription.trim()) {
      onStart(taskDescription)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-effect rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Start Focus Session</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              What are you working on?
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="e.g., Writing a research paper on AI, Building a React app, Studying for exams..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="4"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-300">
              💡 <strong>Tip:</strong> Be specific about your goal. This helps me provide better focus assistance throughout your session.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 glass-effect-dark rounded-xl hover:bg-white/10 transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskDescription.trim() || isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <span>Start Session</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SessionModal
