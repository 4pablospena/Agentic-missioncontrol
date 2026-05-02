import type { AuthUser } from '~/models/user'

declare module '#auth-utils' {
  interface User extends AuthUser {}
  interface UserSession {
    /**
     * ISO-8601 timestamp set on `setUserSession` at login. Surfaced to the client
     * via `useUserSession().session.value?.loggedInAt` so the account page and
     * user dropdown can render a "Last login" line without an extra fetch.
     */
    loggedInAt?: string
  }
}

export {}
