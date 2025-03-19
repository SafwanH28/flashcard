import { SignUp } from '@clerk/clerk-react'
import { Container, Box, Typography } from '@mui/material'

export default function SignUpPage() {
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
          Join FlashPass
        </Typography>
        <Typography variant="h5" component="p" sx={{ mb: 4, color: 'primary.light' }}>
          Create and manage flashcards effortlessly
        </Typography>

        <SignUp />
      </Box>
    </Container>
  )
}