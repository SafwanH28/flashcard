'use client'

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import getStripe from '../utils/get-stripe'

export default function Home() {
  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_session', {
      method: 'POST',
      headers: {
        origin: 'https://flashpass.vercel.app/',
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
    <main className="min-h-screen bg-background">
      <nav className="border-b bg-primary text-primary-foreground">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-xl">FlashPass</Link>
          <div className="ml-auto flex items-center space-x-4">
            <SignedOut>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" asChild>
                <Link href="/generate">Generate</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/flashcards">Collection</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      <div className="container px-4 md:px-6">
        <div className="py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary">
            Welcome to FlashPass
          </h1>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground text-lg">
            The easiest way to create flashcards from your text.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/generate">Check it Out</Link>
            </Button>
          </div>
        </div>

        <section className="py-20">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">Features</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-xl mb-2">Personalized Learning Experience</h3>
                <p className="text-muted-foreground">
                  The AI analyzes user performance and adapts the flashcard content based on individual learning progress, ensuring efficient and effective learning.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-xl mb-2">Automated Content Generation</h3>
                <p className="text-muted-foreground">
                  Save time by generating flashcards automatically from documents, notes, or web content. The AI extracts key concepts, creating comprehensive flashcards effortlessly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-xl mb-2">Interactive Review Sessions</h3>
                <p className="text-muted-foreground">
                  Enjoy interactive features like spaced repetition algorithms, gamified quizzes, and progress tracking, ensuring better retention and an enjoyable learning experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">Pricing</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-xl mb-2">Free</h3>
                <p className="text-muted-foreground">
                  Access basic features with a limited number of flashcards and basic AI assistance. Ideal for casual learners.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-xl mb-2">Pro</h3>
                <p className="text-muted-foreground">
                  Unlock advanced features with unlimited flashcards, personalized learning paths, and priority access to our support team.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="secondary" onClick={handleSubmit}>
                  Upgrade Now
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-xl mb-2">Enterprise</h3>
                <p className="text-muted-foreground">
                  Tailored solutions for organizations, including team collaboration, advanced analytics, and custom integrations.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Contact Us
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}