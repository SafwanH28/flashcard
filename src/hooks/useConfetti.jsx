import { useState, useCallback } from 'react'
import Confetti from 'react-confetti'

export default function useConfetti() {
  const [isActive, setIsActive] = useState(false)

  const triggerConfetti = useCallback(() => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), 3000)
  }, [])

  const ConfettiComponent = () => (
    isActive && (
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
      />
    )
  )

  return { triggerConfetti, ConfettiComponent }
}