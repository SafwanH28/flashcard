'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardSet {
  id: string
  title: string
  createdAt: Date
  cards: Flashcard[]
}

export default function FlashcardsPage() {
  const { user } = useUser()
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!user) return
      try {
        const q = query(collection(db, `users/${user.id}/flashcardSets`))
        const querySnapshot = await getDocs(q)
        const sets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FlashcardSet[]
        setFlashcardSets(sets)
      } catch (error) {
        console.error('Error fetching flashcards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcards()
  }, [user])

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b bg-primary text-primary-foreground">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-xl">FlashPass</Link>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/generate">Generate New</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Flashcards</h1>

        {loading ? (
          <div>Loading...</div>
        ) : flashcardSets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No flashcard sets yet</p>
            <Button asChild>
              <Link href="/generate">Create Your First Set</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardSets.map((set) => (
              <Card key={set.id} className="p-6">
                <h2 className="text-xl font-bold mb-2">{set.title}</h2>
                <p className="text-muted-foreground mb-4">
                  {set.cards.length} cards • Created {new Date(set.createdAt).toLocaleDateString()}
                </p>
                <Button className="w-full" asChild>
                  <Link href={`/flashcards/${set.id}`}>Study Now</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}