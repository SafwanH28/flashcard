import { SignIn } from '@clerk/clerk-react'
import { Container, Box, Typography } from '@mui/material'

export default function SignInPage() {
  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ 
          textAlign: 'center', 
          my: 8,
          '& .cl-card': {
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="h5" component="p" sx={{ mb: 4, color: 'primary.light' }}>
          Sign in to begin flashcard generation
        </Typography>

        <SignIn />
      </Box>
    </Container>
  )
}