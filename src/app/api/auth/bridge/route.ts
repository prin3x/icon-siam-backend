import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../options'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SERVER_URL))
    }

    const payload = await getPayload({ config: configPromise })
    const azureId = (session as any).azureId || (session.user as any).id
    const email = session.user.email || undefined
    const name = session.user.name || undefined

    const existing = await payload.find({
      collection: 'users',
      where: { or: [{ azureId: { equals: azureId } }, { email: { equals: email } }] },
      limit: 1,
      overrideAccess: true,
    })

    const tempPassword = `${randomUUID()}!Aa0`
    const ensuredEmail = email || `${azureId}@no-email.local`

    if (existing.docs[0]) {
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: { azureId, email: ensuredEmail, name, password: tempPassword },
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'users',
        data: {
          azureId,
          email: ensuredEmail,
          name,
          roles: ['user'],
          password: tempPassword,
        },
        overrideAccess: true,
      })
    }

    if (!process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const login = await payload.login({
      collection: 'users',
      data: { email: ensuredEmail, password: tempPassword },
    })

    if (!login.token) {
      return NextResponse.json({ error: 'Login failed' }, { status: 500 })
    }

    const token = login.token

    const redirectURL = new URL('/custom-admin', process.env.NEXT_PUBLIC_SERVER_URL)
    const res = NextResponse.redirect(redirectURL)
    res.cookies.set('payload-token', token as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.COOKIE_DOMAIN,
    })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: 'Auth bridge failed' }, { status: 500 })
  }
}
