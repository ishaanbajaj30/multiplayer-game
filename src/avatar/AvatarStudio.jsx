import { useEffect, useState } from 'react'
import AvatarSvg from './AvatarSvg'
import { AVATAR_PART_GROUPS, DEFAULT_AVATAR, randomAvatarConfig } from './parts'

/**
 * Picker UI generated entirely from AVATAR_PART_GROUPS — add a part option in
 * parts.jsx and it shows up here with no changes to this file.
 */
export default function AvatarStudio({ profile, onSave }) {
  const [name, setName] = useState(profile.name)
  const [config, setConfig] = useState({ ...DEFAULT_AVATAR, ...(profile.avatar || {}) })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    setName(profile.name)
    setConfig({ ...DEFAULT_AVATAR, ...(profile.avatar || {}) })
    setStatus('idle')
  }, [profile.id, profile.name, profile.avatar])

  const set = (key, value) => {
    setConfig((c) => ({ ...c, [key]: value }))
    setStatus('dirty')
  }

  async function save() {
    setStatus('saving')
    try {
      await onSave({ name: name.trim() || profile.name, avatar: config })
      setStatus('saved')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="studio">
      <div className="studio-preview card">
        <AvatarSvg config={config} size={180} />
        <input
          className="studio-name"
          value={name}
          maxLength={24}
          onChange={(e) => {
            setName(e.target.value)
            setStatus('dirty')
          }}
          aria-label="display name"
        />
        <div className="studio-actions">
          <button className="btn btn-primary" onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save avatar'}
          </button>
          <button
            className="btn"
            onClick={() => {
              setConfig(randomAvatarConfig(`${profile.id}-${Math.random()}`))
              setStatus('dirty')
            }}
          >
            🎲 Surprise me
          </button>
        </div>
        <p className="studio-status muted small">
          {status === 'saved' && 'Saved — it syncs everywhere.'}
          {status === 'dirty' && 'Unsaved changes.'}
          {status === 'error' && 'Save failed. Check your connection.'}
        </p>
      </div>

      <div className="studio-groups">
        {AVATAR_PART_GROUPS.map((group) => (
          <fieldset key={group.key} className="card studio-group">
            <legend>{group.label}</legend>
            <div className={group.kind === 'color' ? 'swatch-row' : 'chip-row'}>
              {group.options.map((opt) =>
                group.kind === 'color' ? (
                  <button
                    key={opt.id}
                    className={`swatch ${config[group.key] === opt.id ? 'is-on' : ''}`}
                    style={{ background: opt.value }}
                    onClick={() => set(group.key, opt.id)}
                    aria-label={`${group.label} ${opt.id}`}
                  />
                ) : (
                  <button
                    key={opt.id}
                    className={`chip ${config[group.key] === opt.id ? 'is-on' : ''}`}
                    onClick={() => set(group.key, opt.id)}
                  >
                    {opt.label || opt.id}
                  </button>
                ),
              )}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  )
}
