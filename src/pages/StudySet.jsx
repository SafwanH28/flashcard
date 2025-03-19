import { useUser } from '@clerk/clerk-react'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { motion, AnimatePresence } from 'framer-motion'
import useConfetti from '../hooks/useConfetti'
import {
  Container,
  Typography,
  Box,
  Card,
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  BookmarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

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

export default function StudySet() {
  const { setId } = useParams()
  const { user } = useUser()
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState([])
  const { triggerConfetti, ConfettiComponent } = useConfetti()
  const navigate = useNavigate()
  const cardRef = useRef(null)

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!user || !setId) return
      try {
        const userDocRef = doc(collection(db, 'users'), user.id)
        const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setId)
        const setDoc = await getDoc(setDocRef)
        
        if (!setDoc.exists()) {
          throw new Error('Flashcard set not found')
        }

        const cardsQuery = collection(setDocRef, 'cards')
        const cardsSnapshot = await getDocs(cardsQuery)
        const cards = cardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setFlashcards(cards)
        setProgress(cards.map(card => card.progress || 0))
      } catch (error) {
        console.error('Error fetching flashcards:', error)
        setError('Failed to load flashcards')
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcards()
  }, [user, setId])

  const handleKeyPress = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      setIsFlipped(!isFlipped)
    } else if (e.key === 'ArrowLeft') {
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFlipped, currentIndex])

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
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

  const handleProgress = async (value) => {
    const newProgress = [...progress]
    newProgress[currentIndex] = value
    setProgress(newProgress)

    if (value === 100) {
      triggerConfetti()
    }

    try {
      const userDocRef = doc(collection(db, 'users'), user.id)
      const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setId)
      const cardDocRef = doc(collection(setDocRef, 'cards'), flashcards[currentIndex].id)
      
      await updateDoc(cardDocRef, {
        progress: value
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      setError('Failed to update progress')
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <LinearProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <ConfettiComponent />

      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Study Session
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography color="text.secondary">
            Card {currentIndex + 1} of {flashcards.length}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(currentIndex + 1) / flashcards.length * 100}
            sx={{ width: 100 }}
          />
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
          front={flashcards[currentIndex]?.front}
          back={flashcards[currentIndex]?.back}
          isFlipped={isFlipped}
          onClick={() => setIsFlipped(!isFlipped)}
        />

        <Button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
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
        <Button
          variant="outlined"
          onClick={() => navigate('/flashcards')}
          startIcon={<ChevronLeftIcon className="h-5 w-5" />}
        >
          Back to Sets
        </Button>
      </Box>
    </Container>
  )
}