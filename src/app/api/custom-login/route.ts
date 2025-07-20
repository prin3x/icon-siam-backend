import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const { user, token } = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (!token) {
      return NextResponse.json({ error: 'Login failed, no token received.' }, { status: 500 })
    }

    const response = NextResponse.json({ user, message: 'Login successful' }, { status: 200 })
    response.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.'
    let statusCode = 500

    if (error.message.includes('Authentication Failed')) {
      errorMessage = 'Invalid email or password.'
      statusCode = 401
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
