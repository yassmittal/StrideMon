import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { ApiError } from '../../../lib/api-client'
import { fetchActivitySession } from '../api/activity-sessions-api'
import type { LocalDatabase } from '../location-tracking/activity-session-database'
import { createInMemoryActivitySessionDatabase } from '../location-tracking/in-memory-database.test-support'
import {
  findLocalActiveActivitySession,
  saveLocalActiveActivitySession,
} from '../location-tracking/local-active-activity-session'
import { readConfirmedLocalActiveActivitySession } from './useLocalActiveActivitySession'

let mockDatabase: LocalDatabase

jest.mock('../location-tracking/activity-session-database', () => ({
  ...jest.requireActual('../location-tracking/activity-session-database'),
  openActivitySessionDatabase: () => Promise.resolve(mockDatabase),
}))
jest.mock('../api/activity-sessions-api', () => ({ fetchActivitySession: jest.fn() }))

const LOCAL_ACTIVE_ACTIVITY_SESSION = {
  activitySessionId: '66f9c0ffee00000000000001',
  sneakerTokenId: 7n,
  startedAt: '2026-09-29T06:00:00.000Z',
  energyAtStart: 10,
  efficiency: 10,
}

function buildServerSession(status: ActivitySession['status']): ActivitySession {
  return {
    activitySessionId: LOCAL_ACTIVE_ACTIVITY_SESSION.activitySessionId,
    sneakerTokenId: '7',
    status,
    startedAt: LOCAL_ACTIVE_ACTIVITY_SESSION.startedAt,
    finishedAt: null,
    energyAtStart: 10,
    validationResult: null,
    rejectionReason: null,
  }
}

beforeEach(async () => {
  mockDatabase = await createInMemoryActivitySessionDatabase()
  jest.mocked(fetchActivitySession).mockReset()
})

describe('readConfirmedLocalActiveActivitySession', () => {
  it('is null when no run was started on this phone', async () => {
    expect(await readConfirmedLocalActiveActivitySession()).toBeNull()
    expect(fetchActivitySession).not.toHaveBeenCalled()
  })

  it('offers the run when the API says it is still active', async () => {
    await saveLocalActiveActivitySession(mockDatabase, LOCAL_ACTIVE_ACTIVITY_SESSION)
    jest.mocked(fetchActivitySession).mockResolvedValue(buildServerSession('active'))

    expect(await readConfirmedLocalActiveActivitySession()).toEqual(LOCAL_ACTIVE_ACTIVITY_SESSION)
  })

  it('keeps the run while the API can’t be reached, so it can be resumed offline', async () => {
    await saveLocalActiveActivitySession(mockDatabase, LOCAL_ACTIVE_ACTIVITY_SESSION)
    jest
      .mocked(fetchActivitySession)
      .mockRejectedValue(
        new ApiError({ code: 'NETWORK_UNREACHABLE', message: 'offline', statusCode: null }),
      )

    expect(await readConfirmedLocalActiveActivitySession()).toEqual(LOCAL_ACTIVE_ACTIVITY_SESSION)
  })

  it('forgets a run the API has already closed', async () => {
    await saveLocalActiveActivitySession(mockDatabase, LOCAL_ACTIVE_ACTIVITY_SESSION)
    jest.mocked(fetchActivitySession).mockResolvedValue(buildServerSession('abandoned'))

    expect(await readConfirmedLocalActiveActivitySession()).toBeNull()
    expect(await findLocalActiveActivitySession(mockDatabase)).toBeNull()
  })

  it('forgets a run that isn’t this player’s (another wallet signed in since)', async () => {
    await saveLocalActiveActivitySession(mockDatabase, LOCAL_ACTIVE_ACTIVITY_SESSION)
    jest
      .mocked(fetchActivitySession)
      .mockRejectedValue(new ApiError({ code: 'NOT_FOUND', message: 'missing', statusCode: 404 }))

    expect(await readConfirmedLocalActiveActivitySession()).toBeNull()
    expect(await findLocalActiveActivitySession(mockDatabase)).toBeNull()
  })
})
