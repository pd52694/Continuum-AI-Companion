# API Setup Guide

## Getting Your Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google Account**
   - Use any Google account

3. **Create API Key**
   - Click "Create API Key"
   - Choose "Create API key in new project" or select an existing project
   - Copy your API key

4. **Add to .env file**
   - Open the `.env` file in the root of the project
   - Paste your key: `GEMINI_API_KEY=your_actual_key_here`

## Getting Your ElevenLabs API Key (Optional - for Step 7)

1. **Visit ElevenLabs**
   - Go to: https://elevenlabs.io/

2. **Sign Up / Sign In**
   - Create a free account

3. **Get API Key**
   - Go to your profile settings
   - Find "API Keys" section
   - Copy your API key

4. **Add to .env file**
   - Open the `.env` file
   - Paste your key: `ELEVENLABS_API_KEY=your_actual_key_here`

## Testing Your Setup

After adding your Gemini API key, restart the backend server:

```bash
# Stop the server (Ctrl+C)
npm run server
```

You should see:
```
✅ Gemini API: Configured
```

If you see:
```
❌ Gemini API: Not configured
```

Double-check:
- Your `.env` file has the correct key
- No extra spaces or quotes around the key
- The key starts with the correct prefix
- You restarted the server after adding the key

## API Endpoints Available

Once configured, your backend provides these endpoints:

### Chat Endpoints
- `POST /api/chat/message` - Send messages to AI
- `POST /api/chat/focus-check` - Generate focus prompts
- `POST /api/chat/motivation` - Get motivational messages

### Session Endpoints
- `POST /api/session/start` - Start a new session
- `GET /api/session/:sessionId` - Get session data
- `PUT /api/session/:sessionId` - Update session
- `POST /api/session/:sessionId/extract-entities` - Extract concepts
- `POST /api/session/:sessionId/end` - End session with summary
- `GET /api/session/stats/all` - Get all session stats

### Health Check
- `GET /health` - Check if API is running
