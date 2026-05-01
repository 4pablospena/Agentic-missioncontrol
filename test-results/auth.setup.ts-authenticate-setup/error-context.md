# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate
- Location: e2e/auth.setup.ts:13:1

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
    1) <input id="v-0-2" type="password" name="password" data-slot="password" aria-invalid="false" autocomplete="current-password" class="w-full rounded-md border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors px-2.5 py-1.5 text-base/5 gap-1.5 text-highlighted bg-default ring ring-inset ring-accented focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary pe-9 md:text-sm"/> aka getByRole('textbox', { name: 'Password*' })
    2) <button type="button" data-slot="base" aria-pressed="false" aria-controls="v-0-2" aria-label="Show password" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors text-xs gap-1.5 text-muted hover:text-default active:text-default disabled:text-muted aria-disabled:text-muted focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-inverted p-1.5">…</button> aka getByRole('button', { name: 'Show password' })

Call log:
  - waiting for getByLabel('Password')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e10]: Login
      - generic [ref=e11]: Enter your credentials to access your account.
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e17]: Email*
        - textbox "Email*" [active] [ref=e20]:
          - /placeholder: operator@example.com
          - text: e2e@test.local
      - generic [ref=e21]:
        - generic [ref=e24]: Password*
        - generic [ref=e26]:
          - textbox "Password*" [ref=e27]
          - button "Show password" [ref=e29]
      - button "Submit" [ref=e31]:
        - generic [ref=e32]: Submit
    - paragraph [ref=e34]: OpenClaw Mission Control — operator session
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  1  | import { mkdirSync } from 'node:fs'
  2  | import path from 'node:path'
  3  | import { fileURLToPath } from 'node:url'
  4  | import { test as setup, expect } from '@playwright/test'
  5  | 
  6  | const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  7  | 
  8  | const email = process.env.PLAYWRIGHT_MC_EMAIL ?? 'e2e@test.local'
  9  | const password = process.env.PLAYWRIGHT_MC_PASSWORD ?? 'e2epassword12345'
  10 | 
  11 | const authFile = path.join(repoRoot, 'e2e', '.auth', 'user.json')
  12 | 
  13 | setup('authenticate', async ({ page }) => {
  14 |   mkdirSync(path.dirname(authFile), { recursive: true })
  15 | 
  16 |   await page.goto('/login')
  17 |   await page.getByLabel('Email').fill(email)
> 18 |   await page.getByLabel('Password').fill(password)
     |                                     ^ Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
  19 |   await page.getByRole('button', { name: 'Submit' }).click()
  20 |   await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })
  21 | 
  22 |   await page.context().storageState({ path: authFile })
  23 | })
  24 | 
```