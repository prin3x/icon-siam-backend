import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import type { User } from '../payload-types'
import { getServerSideURL } from './getURL'

type Args = {
  nullUserRedirect?: string
  validUserRedirect?: string
  cookieStore?: NextRequest['cookies']
}

export const getMeUser = async (
  args?: Args,
): Promise<{
  token: string
  user: User
}> => {
  const { nullUserRedirect, validUserRedirect, cookieStore: providedCookieStore } = args || {}
  const cookieStore = providedCookieStore || (await cookies())
  const token = cookieStore.get('payload-token')?.value

  const meUserReq = await fetch(`${getServerSideURL()}/api/users/me`, {
    headers: {
      Authorization: `JWT ${token}`,
    },
  })

  const body = meUserReq.ok ? await meUserReq.json() : null
  const user = body?.user || null

  if (validUserRedirect && meUserReq.ok && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && (!meUserReq.ok || !user)) {
    redirect(nullUserRedirect)
  }

  // Token will exist here because if it doesn't the user will be redirected
  return {
    token: token!,
    user,
  }
}
