import { createReadStream } from 'node:fs'
import { mkdir, open, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createError, type H3Event } from 'h3'

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024

const SAFE_USER_ID = /^[a-zA-Z0-9_-]{1,64}$/

export function sniffImageContentType(buf: Uint8Array): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return 'image/jpeg'
  if (
    buf.length >= 8
    && buf[0] === 0x89
    && buf[1] === 0x50
    && buf[2] === 0x4e
    && buf[3] === 0x47
    && buf[4] === 0x0d
    && buf[5] === 0x0a
    && buf[6] === 0x1a
    && buf[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    buf.length >= 12
    && buf[0] === 0x52
    && buf[1] === 0x49
    && buf[2] === 0x46
    && buf[3] === 0x46
    && buf[8] === 0x57
    && buf[9] === 0x45
    && buf[10] === 0x42
    && buf[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

export function sanitizeAvatarUserId(userId: string): string {
  const t = userId.trim()
  if (!SAFE_USER_ID.test(t)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id for avatar storage',
    })
  }
  return t
}

export function resolveAvatarUploadRoot(event?: H3Event): string {
  const conf = useRuntimeConfig(event)
  const raw = String((conf as { avatarUploadDir?: string }).avatarUploadDir ?? '').trim()
  const relative = raw || './data/avatars'
  return resolve(process.cwd(), relative.replace(/^file:/, ''))
}

export function avatarDiskPath(uploadRoot: string, userId: string): string {
  const safe = sanitizeAvatarUserId(userId)
  return join(uploadRoot, `${safe}.avatar`)
}

export async function saveAvatarFile(uploadRoot: string, userId: string, data: Buffer): Promise<void> {
  await mkdir(uploadRoot, { recursive: true })
  const dest = avatarDiskPath(uploadRoot, userId)
  const tmp = `${dest}.${process.pid}.tmp`
  await writeFile(tmp, data)
  await rename(tmp, dest)
}

export async function deleteAvatarFile(uploadRoot: string, userId: string): Promise<void> {
  try {
    const dest = avatarDiskPath(uploadRoot, userId)
    await unlink(dest)
  }
  catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code !== 'ENOENT')
      throw e
  }
}

export async function statAvatarFile(uploadRoot: string, userId: string) {
  const dest = avatarDiskPath(uploadRoot, userId)
  return stat(dest)
}

export function createAvatarReadStream(uploadRoot: string, userId: string) {
  return createReadStream(avatarDiskPath(uploadRoot, userId))
}

export async function readAvatarContentType(uploadRoot: string, userId: string): Promise<string | null> {
  const path = avatarDiskPath(uploadRoot, userId)
  const fh = await open(path, 'r')
  try {
    const buf = new Uint8Array(64)
    const { bytesRead } = await fh.read(buf, 0, 64, 0)
    return sniffImageContentType(buf.subarray(0, bytesRead))
  }
  finally {
    await fh.close()
  }
}
