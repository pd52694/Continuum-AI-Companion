# Continuum - AI Focus Companion

An AI-powered focus companion web application that helps students and employees stay on task, maintain context, and improve productivity.

## 🚀 Features

- **AI Companion Sidebar**: Interactive chat interface powered by Google Gemini
- **Knowledge Graph**: Visual representation of concepts learned during your session
- **Focus Check-ins**: Periodic reminders to stay on track
- **Voice Support**: Motivational feedback via ElevenLabs text-to-speech
- **Session Management**: Start/stop sessions with automatic cleanup

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Lucide React (icons)
- Zustand (state management)

### Backend
- Node.js
- Express
- Google Gemini API
- ElevenLabs API

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key
- ElevenLabs API key

## 🏃 Getting Started

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run the Frontend

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Step 3: Run the Backend (Coming in Step 2)

```bash
npm run server
```

The backend will start on `http://localhost:5000`

## 📁 Project Structure

```
continuum-ai-companion/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # AI companion chat interface
│   │   └── Dashboard.jsx        # Main dashboard
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── backend/
│   └── server.js                # Express backend (Coming soon)
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 UI Features

- **Modern Glassmorphism Design**: Beautiful frosted glass effects
- **Animated Gradients**: Dynamic background animations
- **Floating Orbs**: Ambient visual elements
- **Responsive Layout**: Works on all screen sizes
- **Smooth Transitions**: Polished micro-interactions

## 🔄 Implementation Progress

- [x] Step 1: Basic React frontend with sidebar
- [ ] Step 2: Node.js backend with Gemini integration
- [ ] Step 3: Connect frontend chat to Gemini backend
- [ ] Step 4: Implement session state system
- [ ] Step 5: Implement knowledge graph extraction and visualization
- [ ] Step 6: Add focus check-ins
- [ ] Step 7: Add ElevenLabs voice output
- [ ] Step 8: Add session start/end controls

## 🤝 Hackathon Requirements

This project fulfills the following requirements:

- ✅ **Google Gemini API**: Primary AI intelligence engine
- ✅ **ElevenLabs API**: Voice feedback system
- ✅ **Reach Capital Challenge**: Supports students, employees, and knowledge workers
- ✅ **Community Impact**: Reduces distraction and improves productivity

## 📝 License

MIT

## 🙏 Acknowledgments

Built for the hackathon with focus on education, productivity, and community impact.
