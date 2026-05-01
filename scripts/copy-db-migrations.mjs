#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'server/db/migrations')
const dest = join(root, '.output/server/db/migrations')

if (!existsSync(join(src, 'meta', '_journal.json')))
  process.exit(0)

mkdirSync(dirname(dest), { recursive: true })
cpSync(src, dest, { recursive: true })
