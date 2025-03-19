import { useUser } from '@clerk/clerk-react'
import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { doc, collection, addDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { motion, AnimatePresence } from 'framer-motion'
import useConfetti from '../hooks/useConfetti'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Card,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LightBulbIcon,
  BookmarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const MotionCard = motion(Card)

const FlashCard = ({ front, back, isFlipped, onClick }) => (
  <div 
    style={{
      width: '100%',
      maxWidth: '600px',
      height: '400px',
      perspective: '2000px',
      margin: '0 auto',
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transformOrigin: 'center center',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {/* Front side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <Typography variant="h5" gutterBottom color="text.secondary">
          Question
        </Typography>
        <Typography variant="h4" align="center">
          {front}
        </Typography>
      </div>

      {/* Back side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          transform: 'rotateY(180deg)',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Answer
        </Typography>
        <Typography variant="h4" align="center">
          {back}
        </Typography>
      </div>
    </div>
  </div>
)

export default function Generate() {
  const { user } = useUser()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState([])
  const navigate = useNavigate()
  const { triggerConfetti } = useConfetti()
  const cardRef = useRef(null)

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate flashcards')
      return
    }

    setLoading(true)
    setError('')
    setShowAnswers(false)
    setQuestions([])
    setAnswers([])
    setCurrentIndex(0)
    setProgress([])
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        body: text,
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server responded with non-JSON content')
      }

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const data = await response.json()
      setQuestions(data.map(card => card.front))
      setAnswers(data.map(card => card.back))
      setProgress(new Array(data.length).fill(0))
    } catch (error) {
      console.error('Error generating flashcards:', error)
      setError(error.message || 'Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setIsFlipped(false)
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleProgress = (value) => {
    const newProgress = [...progress]
    newProgress[currentIndex] = value
    setProgress(newProgress)

    if (value === 100) {
      triggerConfetti()
    }
  }

  const saveFlashcards = async () => {
    if (!name) {
      setError('Please enter a name for your flashcard set')
      return
    }

    try {
      // Create a new flashcard set document
      const setRef = await addDoc(collection(db, `users/${user.id}/flashcardSets`), {
        title: name,
        createdAt: new Date(),
        cardCount: questions.length
      })

      // Add all cards to the set
      const cards = questions.map((question, index) => ({
        front: question,
        back: answers[index],
        progress: progress[index] || 0,
        createdAt: new Date()
      }))

      // Create a subcollection for the cards
      const cardsCollectionRef = collection(setRef, 'cards')
      
      // Add all cards in parallel
      await Promise.all(
        cards.map(card => addDoc(cardsCollectionRef, card))
      )

      triggerConfetti()
      setOpen(false)
      navigate('/flashcards')
    } catch (error) {
      console.error('Error saving flashcards:', error)
      setError('Failed to save flashcards')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Generate Flashcards
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Enter your text below and watch as AI creates the perfect study cards for you
        </Typography>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter your text"
            placeholder="Paste your study material here..."
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Generating...</span>
              </Box>
            ) : 'Generate Flashcards'}
          </Button>
        </Box>
      </Box>

      {questions.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Typography variant="h4">
              Study Mode
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography color="text.secondary">
                {currentIndex + 1} of {questions.length}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            minHeight: '400px',
            mb: 12,
          }}>
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outlined"
              startIcon={<ChevronLeftIcon className="h-5 w-5" />}
              sx={{ minWidth: '120px' }}
            >
              Previous
            </Button>

            <FlashCard
              front={questions[currentIndex]}
              back={answers[currentIndex]}
              isFlipped={isFlipped}
              onClick={() => setIsFlipped(!isFlipped)}
            />

            <Button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              variant="outlined"
              endIcon={<ChevronRightIcon className="h-5 w-5" />}
              sx={{ minWidth: '120px' }}
            >
              Next
            </Button>
          </Box>

          <Box sx={{ 
            maxWidth: '600px', 
            mx: 'auto',
            mt: 8,
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              How well did you know this?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {[0, 25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant={progress[currentIndex] === value ? "contained" : "outlined"}
                  onClick={() => handleProgress(value)}
                  sx={{ flex: 1 }}
                >
                  {value === 0 ? '😅' : 
                   value === 25 ? '🤔' :
                   value === 50 ? '😊' :
                   value === 75 ? '👍' : '🎉'}
                </Button>
              ))}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress[currentIndex]} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <SignedOut>
              <Button 
                variant="contained" 
                color="secondary" 
                component={Link} 
                to="/sign-up"
                size="large"
                startIcon={<BookmarkIcon className="h-5 w-5" />}
              >
                Create an Account to Save!
              </Button>
            </SignedOut>
            <SignedIn>
              <Button 
                variant="contained" 
                color="secondary"
                onClick={() => setOpen(true)}
                size="large"
                startIcon={<BookmarkIcon className="h-5 w-5" />}
              >
                Save Flashcard Set
              </Button>
            </SignedIn>
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Give your flashcard set a memorable name
          </DialogContentText>
          <TextField 
            autoFocus
            margin="dense"
            label="Set Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveFlashcards} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircleIcon className="h-5 w-5" />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}