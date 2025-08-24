import { type NextAuthOptions } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      authorization: { params: { scope: 'openid profile email offline_access' } },
    }),
  ],
  debug: process.env.NODE_ENV !== 'production',
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) (token as any).accessToken = (account as any).access_token
      if (profile) {
        ;(token as any).azureId = (profile as any).sub
        token.email =
          (profile as any).email || (profile as any).preferred_username || token.email || null
        token.name = (profile as any).name || token.name
        ;(token as any).picture = (profile as any).picture || (token as any).picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (token.sub as string) || (token as any).azureId
        session.user.email = token.email as string
        session.user.name = token.name as string
        ;(session.user as any).image = (token as any).picture as string
        ;(session as any).azureId = (token as any).azureId
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
}
