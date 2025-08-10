'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/custom-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to log in.')
      }

      // Redirect to admin dashboard on successful login
      router.push('/custom-admin')
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-sm text-slate-600 mt-1">Sign in to continue</p>
        </div>

        <div className="admin-card gold-card relative p-8">
          <div className="gold-plus">★</div>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3 text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="admin-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="admin-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="admin-button-gold w-full py-3" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500 mt-4">
          © {new Date().getFullYear()} Admin
        </div>
      </div>
    </div>
  )
}
