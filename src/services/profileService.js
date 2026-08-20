import { dataBackend } from '../backend'
import { PLAYER_SLOTS } from '../constants'
import { randomAvatarConfig } from '../avatar/parts'

/** Profiles for the two seats, with defaults filled in for missing docs. */
export const profileService = {
  subscribe(cb, onError) {
    return dataBackend.subscribeProfiles((docs) => {
      const byId = Object.fromEntries(docs.map((d) => [d.id, d]))
      cb(
        PLAYER_SLOTS.map((slot) => ({
          id: slot.id,
          name: byId[slot.id]?.name || slot.defaultName,
          avatar: byId[slot.id]?.avatar || null,
          claimedUid: byId[slot.id]?.claimedUid || null,
          createdAt: byId[slot.id]?.createdAt || null,
          exists: Boolean(byId[slot.id]),
        })),
      )
    }, onError)
  },

  getUid() {
    return dataBackend.getUid()
  },

  claim(playerId, opts) {
    return dataBackend.claimSeat(playerId, opts)
  },

  release(playerId) {
    return dataBackend.releaseSeat(playerId)
  },

  save(playerId, patch) {
    return dataBackend.saveProfile(playerId, patch)
  },

  /** Creates a profile doc with a random avatar if the seat is still empty. */
  async ensureExists(profile) {
    if (profile.exists) return
    await dataBackend.saveProfile(profile.id, {
      name: profile.name,
      avatar: profile.avatar || randomAvatarConfig(profile.id),
      createdAt: new Date().toISOString(),
    })
  },
}
