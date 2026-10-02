import { ObjectId } from 'mongodb'

export type ActivitySessionCursor = { createdAt: Date; activitySessionId: ObjectId }

const CURSOR_SEPARATOR = '.'

/** Opaque to clients: the last session of a page, as `<createdAt ms>.<id>` in base64url. */
export function encodeActivitySessionCursor({
  createdAt,
  activitySessionId,
}: ActivitySessionCursor): string {
  const cursorText = `${createdAt.getTime()}${CURSOR_SEPARATOR}${activitySessionId.toHexString()}`
  return Buffer.from(cursorText).toString('base64url')
}

/** `null` for anything this API didn't produce. */
export function decodeActivitySessionCursor(cursor: string): ActivitySessionCursor | null {
  const [createdAtMilliseconds, activitySessionIdHex] = Buffer.from(cursor, 'base64url')
    .toString()
    .split(CURSOR_SEPARATOR)
  if (createdAtMilliseconds === undefined || !/^\d+$/.test(createdAtMilliseconds)) return null
  if (activitySessionIdHex === undefined || !/^[0-9a-f]{24}$/.test(activitySessionIdHex)) {
    return null
  }
  return {
    createdAt: new Date(Number(createdAtMilliseconds)),
    activitySessionId: new ObjectId(activitySessionIdHex),
  }
}
