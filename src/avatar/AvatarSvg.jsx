import {
  ACCESSORIES,
  BACKGROUND_COLORS,
  DEFAULT_AVATAR,
  EYE_STYLES,
  HAIR_COLORS,
  HAIR_STYLES,
  MOUTH_STYLES,
  SKIN_TONES,
  optionValue,
} from './parts'

/**
 * Layered SVG avatar. Layer order is fixed here; part shapes come from parts.jsx.
 */
export default function AvatarSvg({ config, size = 96, ring = null, className = '' }) {
  const cfg = { ...DEFAULT_AVATAR, ...(config || {}) }
  const bg = optionValue(BACKGROUND_COLORS, cfg.bg).value
  const skin = optionValue(SKIN_TONES, cfg.skin).value
  const hairColor = optionValue(HAIR_COLORS, cfg.hairColor).value
  const hair = optionValue(HAIR_STYLES, cfg.hairStyle)
  const eyes = optionValue(EYE_STYLES, cfg.eyes)
  const mouth = optionValue(MOUTH_STYLES, cfg.mouth)
  const accessory = optionValue(ACCESSORIES, cfg.accessory)

  return (
    <svg
      className={`avatar-svg ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="player avatar"
      style={ring ? { boxShadow: `0 0 0 3px ${ring}` } : undefined}
    >
      <circle cx="50" cy="50" r="50" fill={bg} />
      {/* neck + head */}
      <rect x="42" y="74" width="16" height="14" rx="7" fill={skin} />
      <ellipse cx="50" cy="56" rx="24" ry="26" fill={skin} />
      <ellipse cx="24" cy="58" rx="4" ry="6" fill={skin} />
      <ellipse cx="76" cy="58" rx="4" ry="6" fill={skin} />
      {eyes.render({})}
      {mouth.render({})}
      {hair.render({ color: hairColor })}
      {accessory.render({})}
    </svg>
  )
}
