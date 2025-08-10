import { useRouter } from 'next/navigation'

/**
 * Utility function to navigate to admin routes while preserving the current locale
 * @param router - Next.js router instance
 * @param path - The path to navigate to (without locale parameter)
 * @param locale - The current locale
 */
export function navigateWithLocale(
  router: ReturnType<typeof useRouter>,
  path: string,
  locale: string,
) {
  const url = new URL(path, window.location.origin)
  url.searchParams.set('locale', locale)
  router.push(url.pathname + url.search)
}

/**
 * Hook that provides navigation functions with locale preservation
 */
export function useNavigationWithLocale() {
  const router = useRouter()

  return {
    push: (path: string, locale: string) => navigateWithLocale(router, path, locale),
    pushWithoutLocale: (path: string) => router.push(path),
  }
}
