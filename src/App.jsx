import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { ThemeProvider, AppBar, Toolbar, Typography, Button, Container, Box, Card, CardContent, CardActions } from '@mui/material'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import getStripe from './utils/get-stripe'
import SignInPage from './pages/SignIn'
import SignUpPage from './pages/SignUp'
import GeneratePage from './pages/Generate'
import FlashcardsPage from './pages/Flashcards'
import StudySet from './pages/StudySet'
import theme from './theme'

const MotionBox = motion(Box)
const MotionCard = motion(Card)
const MotionTypography = motion(Typography)

const features = [
  {
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "AI-Powered Learning",
    description: "Our advanced AI analyzes your learning patterns and creates personalized flashcards that adapt to your progress and learning style."
  },
  {
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Smart Generation",
    description: "Simply paste your study material and watch as our AI creates comprehensive flashcard sets optimized for retention and understanding."
  },
  {
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "Progress Tracking", 
    description: "Track your learning journey with detailed analytics and insights to optimize your study sessions and improve retention."
  }
]

function FeatureCard({ icon: Icon, title, description, delay }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        backgroundColor: 'background.paper',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: 'background.paper',
          '& .feature-gradient': {
            opacity: 1,
          },
          '& .feature-content': {
            transform: 'translateY(-5px)',
          },
        },
      }}>
        <Box
          className="feature-gradient"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 2,
            border: '2px solid transparent',
            borderImage: 'linear-gradient(45deg, #2563eb40, #7c3aed40) 1',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        />
        <CardContent 
          className="feature-content"
          sx={{ 
            p: 4, 
            flex: 1, 
            zIndex: 1,
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <Box 
            sx={{ 
              mb: 3,
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(45deg, #2563eb20, #7c3aed20)',
            }}
          >
            <Icon className="h-8 w-8" style={{ color: '#2563eb' }} />
          </Box>
          <Typography 
            variant="h5" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              transition: 'color 0.3s ease',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.7,
              transition: 'color 0.3s ease',
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function FadeInWhenVisible({ children, delay = 0, y = 50 }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_session', {
      method: 'POST',
      headers: {
        origin: window.location.origin,
      },
    })

    const checkoutSessionJson = await checkoutSession.json()

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message)
      return
    }

    const stripe = await getStripe()
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })

    if (error) {
      console.warn(error.message)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="fixed" color="transparent" elevation={0}>
          <Toolbar>
            <Typography
              component={Link}
              to="/"
              variant="h6"
              sx={{
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                textDecoration: 'none',
                fontSize: '1.5rem',
              }}
            >
              FlashPass
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <SignedOut>
              <Button 
                component={Link} 
                to="/sign-in" 
                variant="text" 
                color="primary"
                sx={{ 
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  }
                }}
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/sign-up" 
                variant="contained" 
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  }
                }}
              >
                Sign Up
              </Button>
            </SignedOut>
            <SignedIn>
              <Button 
                component={Link} 
                to="/generate" 
                variant="text" 
                color="primary"
                sx={{ 
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  }
                }}
              >
                Generate
              </Button>
              <Button 
                component={Link} 
                to="/flashcards" 
                variant="outlined" 
                sx={{ 
                  ml: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  }
                }}
              >
                Collection
              </Button>
              <Box sx={{ ml: 2 }}>
                <UserButton afterSignOutUrl="/" />
              </Box>
            </SignedIn>
          </Toolbar>
        </AppBar>

        <Toolbar />

        <Routes>
          <Route path="/" element={
            <Container maxWidth="lg">
              <MotionBox
                component="section"
                sx={{
                  py: { xs: 12, md: 20 },
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  my: 4,
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Box
                  component={motion.div}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  sx={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0) 70%)',
                    filter: 'blur(40px)',
                    zIndex: 0,
                  }}
                />
                <Box
                  component={motion.div}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: '-30%',
                    right: '-20%',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, rgba(124, 58, 237, 0) 70%)',
                    filter: 'blur(40px)',
                    zIndex: 0,
                  }}
                />

                <Box
                  component={motion.div}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.3), rgba(124, 58, 237, 0.3))',
                    borderRadius: '24px',
                    transform: 'rotate(45deg)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    zIndex: 1,
                  }}
                />
                <Box
                  component={motion.div}
                  animate={{
                    y: [0, 20, 0],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5,
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '15%',
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.3), rgba(37, 99, 235, 0.3))',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    zIndex: 1,
                  }}
                />

                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <Typography variant="h1" gutterBottom>
                      Master Any Subject with
                      <br />
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        style={{
                          background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          display: 'inline-block',
                        }}
                      >
                        AI-Powered Flashcards
                      </motion.span>
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 6, 
                          color: 'text.primary',
                          maxWidth: '600px',
                          lineHeight: 1.6,
                        }}
                      >
                        Transform your learning experience with intelligent flashcards that adapt to your needs.
                        Powered by AI, designed for efficiency.
                      </Typography>
                    </Box>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <Button
                        component={Link}
                        to="/generate"
                        variant="contained"
                        size="large"
                        sx={{
                          py: 2,
                          px: 6,
                          fontSize: '1.25rem',
                          background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                          },
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        Start Learning Now
                      </Button>
                    </motion.div>
                  </motion.div>
                </Box>
              </MotionBox>

              <Box component="section" sx={{ py: { xs: 12, md: 16 } }}>
                <FadeInWhenVisible>
                  <Typography 
                    variant="h2" 
                    align="center" 
                    gutterBottom
                    sx={{
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 8,
                    }}
                  >
                    Supercharge Your Learning
                  </Typography>
                </FadeInWhenVisible>
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 4,
                    mt: 6,
                  }}
                >
                  {features.map((feature, index) => (
                    <FeatureCard
                      key={feature.title}
                      {...feature}
                      delay={index * 0.2}
                    />
                  ))}
                </Box>
              </Box>

              <Box component="section" sx={{ py: { xs: 12, md: 16 } }}>
                <FadeInWhenVisible>
                  <Typography 
                    variant="h2" 
                    align="center" 
                    gutterBottom
                    sx={{
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 8,
                    }}
                  >
                    Choose Your Plan
                  </Typography>
                </FadeInWhenVisible>
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 4,
                    mt: 6,
                    maxWidth: '1200px',
                    mx: 'auto',
                  }}
                >
                  <FadeInWhenVisible delay={0.2}>
                    <MotionCard
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" component="h3" gutterBottom color="primary">
                          Free
                        </Typography>
                        <Typography variant="h3" component="p" gutterBottom>
                          $0
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                          Perfect for trying out the basics
                        </Typography>
                        <Box component="ul" sx={{ mb: 4, pl: 2 }}>
                          <li>10 flashcard sets</li>
                          <li>Basic AI generation</li>
                          <li>Standard support</li>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 4, pt: 0 }}>
                        <Button 
                          component={Link} 
                          to="/sign-up" 
                          variant="outlined" 
                          fullWidth
                          sx={{
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                            },
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          Get Started
                        </Button>
                      </CardActions>
                    </MotionCard>
                  </FadeInWhenVisible>

                  <FadeInWhenVisible delay={0.4}>
                    <MotionCard
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                      sx={{
                        border: '2px solid',
                        borderColor: 'primary.main',
                        transform: 'scale(1.05)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          background: 'linear-gradient(45deg, #2563eb20, #7c3aed20)',
                          borderRadius: '18px',
                          zIndex: -1,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" component="h3" gutterBottom color="primary">
                          Pro
                        </Typography>
                        <Typography variant="h3" component="p" gutterBottom>
                          $9.99
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                          For serious learners
                        </Typography>
                        <Box component="ul" sx={{ mb: 4, pl: 2 }}>
                          <li>Unlimited flashcard sets</li>
                          <li>Advanced AI generation</li>
                          <li>Priority support</li>
                          <li>Progress analytics</li>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 4, pt: 0 }}>
                        <Button 
                          onClick={handleSubmit} 
                          variant="contained" 
                          fullWidth
                          sx={{
                            background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                            },
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          Upgrade Now
                        </Button>
                      </CardActions>
                    </MotionCard>
                  </FadeInWhenVisible>

                  <FadeInWhenVisible delay={0.6}>
                    <MotionCard
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" component="h3" gutterBottom color="primary">
                          Enterprise
                        </Typography>
                        <Typography variant="h3" component="p" gutterBottom>
                          Custom
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                          For teams and organizations
                        </Typography>
                        <Box component="ul" sx={{ mb: 4, pl: 2 }}>
                          <li>Custom integration</li>
                          <li>Team management</li>
                          <li>24/7 support</li>
                          <li>Advanced analytics</li>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 4, pt: 0 }}>
                        <Button 
                          variant="outlined" 
                          fullWidth
                          sx={{
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                            },
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          Contact Sales
                        </Button>
                      </CardActions>
                    </MotionCard>
                  </FadeInWhenVisible>
                </Box>
              </Box>
                
              <Box 
                component="section" 
                sx={{ 
                  py: 4,
                  mt: 4,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center'
                }}
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    maxWidth: '800px',
                    mx: 'auto',
                    px: 2,
                    fontSize: '1.075rem',
                    opacity: 0.8
                  }}
                >
                  This is a demo site made by Safwan Haque. While the core features like account creation and flashcard management are fully functional,
                  the subscription plans cannot be purchased. Feel free to create an account and explore the flashcard generation capabilities!
                </Typography>
              </Box>
            </Container>
          } />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/flashcards/:setId" element={<StudySet />} />
        </Routes>
      </Box>
    </ThemeProvider>
  )
}

export default App