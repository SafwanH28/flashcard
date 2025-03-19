import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore'
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
  Grid,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const MotionCard = motion(Card)

export default function FlashcardsPage() {
  const { user } = useUser()
  const [flashcardSets, setFlashcardSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { triggerConfetti } = useConfetti()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!user) return
      try {
        const userDocRef = doc(collection(db, 'users'), user.id)
        const setsQuery = query(collection(userDocRef, 'flashcardSets'))
        const querySnapshot = await getDocs(setsQuery)
        
        const sets = []
        for (const doc of querySnapshot.docs) {
          const setData = doc.data()
          const cardsQuery = query(collection(userDocRef, doc.id))
          const cardsSnapshot = await getDocs(cardsQuery)
          const cards = cardsSnapshot.docs.map(cardDoc => ({
            id: cardDoc.id,
            ...cardDoc.data()
          }))
          
          sets.push({
            id: doc.id,
            ...setData,
            cards,
            progress: cards.reduce((acc, card) => acc + (card.progress || 0), 0) / (cards.length || 1)
          })
        }
        
        setFlashcardSets(sets)
      } catch (error) {
        console.error('Error fetching flashcards:', error)
        setError('Failed to load flashcard sets')
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcards()
  }, [user])

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success.main'
    if (progress >= 50) return 'warning.main'
    return 'error.main'
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          My Flashcard Sets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and practice your saved flashcard sets
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      ) : flashcardSets.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 8,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="h5" gutterBottom>
            No flashcard sets yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Create your first set to start learning
          </Typography>
          <Button
            component={Link}
            to="/generate"
            variant="contained"
            size="large"
            startIcon={<BookmarkIcon className="h-5 w-5" />}
          >
            Create Flashcards
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {flashcardSets.map((set) => (
            <Grid item xs={12} sm={6} md={4} key={set.id}>
              <MotionCard
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate(`/flashcards/${set.id}`)}
              >
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {set.title}
                  </Typography>
                  
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClockIcon className="h-5 w-5" />
                    <Typography variant="body2" color="text.secondary">
                      Created {new Date(set.createdAt?.seconds * 1000).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={set.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getProgressColor(set.progress),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {set.cards.length} cards
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getProgressColor(set.progress),
                        fontWeight: 600
                      }}
                    >
                      {Math.round(set.progress)}% Mastered
                    </Typography>
                  </Box>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}