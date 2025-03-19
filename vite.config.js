import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import OpenAI from 'openai'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

// Create Express app outside of Vite config
const app = express()
app.use(cors())
app.use(bodyParser.text())

app.post('/api/generate', async (req, res) => {
  try {
    if (!process.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    const openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY
    })

    const systemPrompt = `You are a flashcard creator. Create flashcards from the given text.
    Each flashcard should have a front (question) and back (answer).
    Create exactly 10 flashcards.
    Return them in this exact JSON format:
    {
      "flashcards": [
        {
          "front": "Question goes here?",
          "back": "Answer goes here"
        }
      ]
    }`

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: req.body }
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: "json_object" }
    })

    const content = completion.choices[0].message.content
    const parsedContent = JSON.parse(content)
    
    if (!Array.isArray(parsedContent.flashcards)) {
      throw new Error('Invalid response format from OpenAI')
    }

    res.setHeader('Content-Type', 'application/json')
    res.json(parsedContent.flashcards)
  } catch (error) {
    console.error('Error generating flashcards:', error)
    res.setHeader('Content-Type', 'application/json')
    res.status(500).json({ 
      error: 'Failed to generate flashcards',
      details: error.message 
    })
  }
})

// Start Express server before Vite config
const server = app.listen(3001, () => {
  console.log('API server running on port 3001')
})

// Ensure server closes when Vite exits
process.on('SIGTERM', () => {
  server.close()
})

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js,tsx,ts}',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY),
    'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY),
    'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY),
    'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
    'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
    'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
    'process.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(process.env.VITE_FIREBASE_MEASUREMENT_ID)
  }
})