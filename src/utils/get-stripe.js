import { loadStripe } from '@stripe/stripe-js'

let stripePromise = null

export default function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}