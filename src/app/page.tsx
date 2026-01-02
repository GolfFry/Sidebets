'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Screen, Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { MatchCard } from '@/components/match'
import { getUserMatches } from '@/lib/firestore/matches'
import type { Match } from '@/types'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchMatches = async () => {
      try {
        setLoading(true)
        const data = await getUserMatches(user.id)
        setMatches(data)
      } catch (err) {
        console.error('Failed to fetch matches:', err)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user])

  if (authLoading) {
    return (
      <Screen className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">⛳</div>
          <p className="text-gray-600">Loading GolfSettled...</p>
        </div>
      </Screen>
    )
  }

  if (!user) {
    return (
      <Screen className="flex flex-col items-center justify-center">
        <div className="p-4 max-w-md w-full text-center space-y-6">
          {/* Brand */}
          <div>
            <div className="text-5xl mb-3">⛳</div>
            <h1 className="text-3xl font-bold text-fairway-700">GolfSettled</h1>
            <p className="text-gray-500 mt-2">Track golf bets with friends</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 py-6">
            <div className="space-y-2">
              <div className="text-2xl">🏆</div>
              <p className="text-xs text-gray-600">Nassau</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">💰</div>
              <p className="text-xs text-gray-600">Skins</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📊</div>
              <p className="text-xs text-gray-600">Ledger</p>
            </div>
          </div>

          {/* CTA */}
          <Link href="/login">
            <Button size="lg" fullWidth>
              Get Started
            </Button>
          </Link>

          {/* Footer */}
          <div className="text-xs text-gray-500 space-y-1 pt-4">
            <p>No real money is handled by this app</p>
            <p>Settle up offline via Venmo, Zelle, or cash</p>
          </div>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <Header title="GolfSettled" subtitle={`Hey, ${user.displayName || 'Golfer'}!`} />

      <div className="p-4 space-y-6">
        {/* Quick Action */}
        <Link href="/match/new">
          <Card variant="elevated" className="bg-gradient-to-r from-fairway-600 to-fairway-700 text-white cursor-pointer hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Start a Match</h2>
                <p className="text-sm opacity-90">Set up bets with your group</p>
              </div>
              <div className="text-3xl">⛳</div>
            </div>
          </Card>
        </Link>

        {/* Matches Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Matches</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block text-2xl mb-2">⛳</div>
              <p className="text-gray-500">Loading matches...</p>
            </div>
          ) : error ? (
            <Card variant="outlined" className="bg-red-50 border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </Card>
          ) : matches.length === 0 ? (
            <Card variant="outlined" className="text-center py-8">
              <div className="text-4xl mb-2">🏌️</div>
              <p className="text-gray-500">No matches yet</p>
              <p className="text-sm text-gray-400">Create one to get started!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Screen>
  )
}
