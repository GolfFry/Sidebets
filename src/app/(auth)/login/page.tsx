'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMagicLink } from '@/lib/auth/config'
import { Screen, Header } from '@/components/layout'
import { Input, Button, Card } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!email.trim()) {
        throw new Error('Please enter an email address')
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address')
      }

      await sendMagicLink(email)
      setSuccess(true)
      setEmail('')

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push('/auth/callback')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Screen>
        <Header title="Check your email" />
        <div className="p-4 space-y-4">
          <Card variant="elevated" className="bg-green-50 border border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-lg font-semibold text-green-900 mb-2">Magic link sent!</h2>
              <p className="text-green-700 mb-4">Check your email and click the link to sign in.</p>
              <p className="text-sm text-green-600">Redirecting to sign in page...</p>
            </div>
          </Card>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <Header title="Sign In" />

      <div className="p-4 max-w-md mx-auto pt-6">
        <Card variant="elevated" className="space-y-6">
          {/* Title */}
          <div className="text-center">
            <div className="text-4xl mb-3">⛳</div>
            <h1 className="text-2xl font-bold text-gray-900">GolfSettled</h1>
            <p className="text-gray-500 mt-1">Track golf bets with friends</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                We&apos;ll send you a magic link to sign in. No password needed.
              </p>
            </div>

            <Button type="submit" fullWidth loading={loading} size="md">
              Send Magic Link
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>No account? Sign in to create one.</p>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
