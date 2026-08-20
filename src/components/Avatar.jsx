import AvatarSvg from '../avatar/AvatarSvg'

/** Avatar + name chip used across leaderboard, arcade and game screens. */
export default function Avatar({ profile, size = 64, showName = false, subtitle = null, ring = null }) {
  return (
    <div className="avatar" title={profile?.name}>
      <AvatarSvg config={profile?.avatar} size={size} ring={ring} />
      {showName && (
        <div className="avatar-meta">
          <span className="avatar-name">{profile?.name || '—'}</span>
          {subtitle && <span className="avatar-sub">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
