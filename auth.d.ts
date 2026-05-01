import type { AuthUser } from '~/models/user'

declare module '#auth-utils' {
  interface User extends AuthUser {}
}

export {}
