'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeMagicLink } from '@/lib/auth/config'
import { Screen } from '@/components/layout'
import { Card } from '@/components/ui'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await completeMagicLink()

        if (!result) {
          throw new Error('Invalid magic link or link already used')
        }

        // Success! Redirect to home
        setTimeout(() => {
          router.push('/')
        }, 500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to sign in')
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [router])

  if (isProcessing) {
    return (
      <Screen className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">⛳</div>
          <p className="text-gray-600 font-medium">Signing you in...</p>
          <p className="text-sm text-gray-500">Please wait while we verify your email</p>
        </div>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen>
        <div className="p-4 max-w-md mx-auto pt-12">
          <Card variant="elevated" className="bg-red-50 border border-red-200">
            <div className="text-center space-y-4">
              <div className="text-4xl">❌</div>
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-2">Sign In Failed</h2>
                <p className="text-sm text-red-700 mb-4">{error}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The link may have expired or been used already.
                </p>
                <a
                  href="/login"
                  className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                >
                  Try Again
                </a>
              </div>
            </div>
          </Card>
        </div>
      </Screen>
    )
  }

  return null
}
