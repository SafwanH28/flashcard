'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { doc, collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function GeneratePage() {
  const { user } = useUser()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [flashcards, setFlashcards] = useState<Array<{ front: string; back: string }>>([])
  const [loading, setLoading] = useState(false)

  const generateFlashcards = async () => {
    setLoading(true)
    try {
      // Here you would typically call your AI service to generate flashcards
      // For now, we'll create a simple example
      const cards = text.split('\n').map(line => {
        const [front, back] = line.split(':')
        return { front: front?.trim() || '', back: back?.trim() || '' }
      })
      setFlashcards(cards)
    } catch (error) {
      console.error('Error generating flashcards:', error)
    }
    setLoading(false)
  }

  const saveFlashcards = async () => {
    if (!user) return
    try {
      const docRef = await addDoc(collection(db, `users/${user.id}/flashcardSets`), {
        title,
        createdAt: new Date(),
        cards: flashcards
      })
      console.log('Flashcards saved with ID:', docRef.id)
      setTitle('')
      setText('')
      setFlashcards([])
    } catch (error) {
      console.error('Error saving flashcards:', error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b bg-primary text-primary-foreground">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-xl">FlashPass</Link>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/flashcards">My Flashcards</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Generate Flashcards</h1>
        
        <div className="space-y-6">
          <div>
            <Input
              placeholder="Set Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Enter your text here. Format: Term: Definition"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="mb-4"
            />
            <Button onClick={generateFlashcards} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Flashcards'}
            </Button>
          </div>

          {flashcards.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Preview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {flashcards.map((card, index) => (
                  <Card key={index} className="p-4">
                    <div className="font-bold mb-2">{card.front}</div>
                    <div className="text-muted-foreground">{card.back}</div>
                  </Card>
                ))}
              </div>
              <Button onClick={saveFlashcards}>Save Flashcards</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}