import AvatarStudio from '../avatar/AvatarStudio'
import Avatar from '../components/Avatar'
import { useApp } from '../context/AppContext'

export default function Profile() {
  const { profiles, currentUser, saveProfile } = useApp()
  if (!currentUser) return <p className="muted">No seat claimed on this device.</p>

  const partner = profiles.find((p) => p.id !== currentUser.id)

  return (
    <div className="page">
      <h1>Avatar Studio</h1>
      <p className="muted">You edit your own face only. {partner?.name} builds theirs on their device.</p>

      <AvatarStudio profile={currentUser} onSave={(patch) => saveProfile(currentUser.id, patch)} />

      {partner && (
        <section className="card partner-card">
          <Avatar profile={partner} size={56} showName subtitle={partner.claimedUid ? 'claimed' : 'seat still open'} />
          <span className="muted small">Their avatar, live from their device.</span>
        </section>
      )}
    </div>
  )
}
