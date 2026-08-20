// Data-driven avatar catalog. To add a new option, append an entry to the
// relevant array — the picker UI and renderer both read from this file only.

export const SKIN_TONES = [
  { id: 'porcelain', value: '#f8dfd0' },
  { id: 'sand', value: '#f0c9a4' },
  { id: 'honey', value: '#dda578' },
  { id: 'caramel', value: '#c2814f' },
  { id: 'cocoa', value: '#8d5524' },
  { id: 'espresso', value: '#5b3117' },
  { id: 'mint', value: '#bfe8cf' },
]

export const HAIR_COLORS = [
  { id: 'noir', value: '#1c1a22' },
  { id: 'chestnut', value: '#5b3a1e' },
  { id: 'sunflower', value: '#e0ac3f' },
  { id: 'ginger', value: '#c05a26' },
  { id: 'ash', value: '#9aa1ab' },
  { id: 'bubblegum', value: '#f06fa5' },
  { id: 'ocean', value: '#3d8ec9' },
  { id: 'lavender', value: '#a97be0' },
]

export const BACKGROUND_COLORS = [
  { id: 'peach', value: '#ffd8c2' },
  { id: 'sky', value: '#c5e4ff' },
  { id: 'sage', value: '#cdeacb' },
  { id: 'butter', value: '#ffeeb0' },
  { id: 'lilac', value: '#e0d1ff' },
  { id: 'rose', value: '#ffc9dd' },
  { id: 'slate', value: '#cfd6e2' },
]

// --- hair -------------------------------------------------------------------
export const HAIR_STYLES = [
  { id: 'none', label: 'Bald', render: () => null },
  {
    id: 'buzz',
    label: 'Buzz',
    render: ({ color }) => <path d="M28 44c0-14 10-22 22-22s22 8 22 22c-6-8-14-11-22-11s-16 3-22 11z" fill={color} />,
  },
  {
    id: 'swoop',
    label: 'Swoop',
    render: ({ color }) => (
      <path d="M26 46c-1-16 11-26 24-26 12 0 22 7 24 19-9-9-24-8-31-1-4 4-5 9-5 14-4 0-8-3-12-6z" fill={color} />
    ),
  },
  {
    id: 'bob',
    label: 'Bob',
    render: ({ color }) => (
      <path d="M24 52c0-19 11-30 26-30s26 11 26 30v10h-9V44c-4 5-11 8-17 8s-13-3-17-8v18h-9z" fill={color} />
    ),
  },
  {
    id: 'long',
    label: 'Long',
    render: ({ color }) => (
      <path d="M22 56c0-22 12-34 28-34s28 12 28 34v22h-11V46c-5 6-10 8-17 8s-12-2-17-8v32H22z" fill={color} />
    ),
  },
  {
    id: 'bun',
    label: 'Top bun',
    render: ({ color }) => (
      <g fill={color}>
        <circle cx="50" cy="16" r="9" />
        <path d="M26 46c0-15 11-24 24-24s24 9 24 24c-6-9-14-13-24-13s-18 4-24 13z" />
      </g>
    ),
  },
  {
    id: 'curly',
    label: 'Curls',
    render: ({ color }) => (
      <g fill={color}>
        <circle cx="34" cy="30" r="11" />
        <circle cx="50" cy="22" r="12" />
        <circle cx="66" cy="30" r="11" />
        <circle cx="28" cy="44" r="8" />
        <circle cx="72" cy="44" r="8" />
      </g>
    ),
  },
  {
    id: 'ponytail',
    label: 'Ponytail',
    render: ({ color }) => (
      <g fill={color}>
        <path d="M26 46c0-15 11-24 24-24s24 9 24 24c-6-9-14-13-24-13s-18 4-24 13z" />
        <path d="M72 40c9 4 12 14 10 24-1 6-5 10-9 11 4-9 3-19-4-27z" />
      </g>
    ),
  },
]

// --- eyes -------------------------------------------------------------------
export const EYE_STYLES = [
  {
    id: 'dots',
    label: 'Dots',
    render: () => (
      <g fill="#2b2430">
        <circle cx="40" cy="54" r="4" />
        <circle cx="60" cy="54" r="4" />
      </g>
    ),
  },
  {
    id: 'happy',
    label: 'Happy',
    render: () => (
      <g stroke="#2b2430" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M35 56c2-5 8-5 10 0" />
        <path d="M55 56c2-5 8-5 10 0" />
      </g>
    ),
  },
  {
    id: 'wink',
    label: 'Wink',
    render: () => (
      <g stroke="#2b2430" strokeWidth="3" fill="#2b2430" strokeLinecap="round">
        <circle cx="40" cy="54" r="4" stroke="none" />
        <path d="M55 55c3-4 8-4 10 0" fill="none" />
      </g>
    ),
  },
  {
    id: 'sleepy',
    label: 'Sleepy',
    render: () => (
      <g stroke="#2b2430" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M35 54h10" />
        <path d="M55 54h10" />
      </g>
    ),
  },
  {
    id: 'sparkle',
    label: 'Sparkle',
    render: () => (
      <g fill="#2b2430">
        <circle cx="40" cy="54" r="5" />
        <circle cx="60" cy="54" r="5" />
        <circle cx="38" cy="52" r="1.8" fill="#fff" />
        <circle cx="58" cy="52" r="1.8" fill="#fff" />
      </g>
    ),
  },
]

// --- mouth ------------------------------------------------------------------
export const MOUTH_STYLES = [
  {
    id: 'smile',
    label: 'Smile',
    render: () => <path d="M42 68c3 4 13 4 16 0" stroke="#2b2430" strokeWidth="3" fill="none" strokeLinecap="round" />,
  },
  {
    id: 'grin',
    label: 'Grin',
    render: () => (
      <g>
        <path d="M40 66h20c0 7-5 11-10 11s-10-4-10-11z" fill="#2b2430" />
        <path d="M43 66h14v3H43z" fill="#fff" />
      </g>
    ),
  },
  {
    id: 'smirk',
    label: 'Smirk',
    render: () => <path d="M42 69c5 3 11 1 14-3" stroke="#2b2430" strokeWidth="3" fill="none" strokeLinecap="round" />,
  },
  {
    id: 'ooh',
    label: 'Ooh',
    render: () => <ellipse cx="50" cy="70" rx="5" ry="6" fill="#2b2430" />,
  },
  {
    id: 'flat',
    label: 'Flat',
    render: () => <path d="M43 70h14" stroke="#2b2430" strokeWidth="3" fill="none" strokeLinecap="round" />,
  },
]

// --- accessories ------------------------------------------------------------
export const ACCESSORIES = [
  { id: 'none', label: 'None', render: () => null },
  {
    id: 'glasses',
    label: 'Glasses',
    render: () => (
      <g stroke="#2b2430" strokeWidth="2.5" fill="none">
        <circle cx="40" cy="54" r="9" />
        <circle cx="60" cy="54" r="9" />
        <path d="M49 54h2" />
      </g>
    ),
  },
  {
    id: 'shades',
    label: 'Shades',
    render: () => (
      <g fill="#2b2430">
        <rect x="30" y="48" width="18" height="11" rx="4" />
        <rect x="52" y="48" width="18" height="11" rx="4" />
        <rect x="47" y="52" width="6" height="2.5" />
      </g>
    ),
  },
  {
    id: 'blush',
    label: 'Blush',
    render: () => (
      <g fill="#ff8fa8" opacity="0.55">
        <ellipse cx="33" cy="63" rx="6" ry="4" />
        <ellipse cx="67" cy="63" rx="6" ry="4" />
      </g>
    ),
  },
  {
    id: 'earrings',
    label: 'Earrings',
    render: () => (
      <g fill="#f3c53f">
        <circle cx="24" cy="60" r="3.5" />
        <circle cx="76" cy="60" r="3.5" />
      </g>
    ),
  },
  {
    id: 'headphones',
    label: 'Headphones',
    render: () => (
      <g fill="#4b4459">
        <path d="M25 56v-8c0-14 11-24 25-24s25 10 25 24v8h-6v-8c0-11-8-18-19-18s-19 7-19 18v8z" />
        <rect x="19" y="53" width="10" height="16" rx="5" />
        <rect x="71" y="53" width="10" height="16" rx="5" />
      </g>
    ),
  },
]

// Picker metadata: the Avatar Studio renders itself from this list.
export const AVATAR_PART_GROUPS = [
  { key: 'bg', label: 'Backdrop', kind: 'color', options: BACKGROUND_COLORS },
  { key: 'skin', label: 'Skin', kind: 'color', options: SKIN_TONES },
  { key: 'hairStyle', label: 'Hair', kind: 'shape', options: HAIR_STYLES },
  { key: 'hairColor', label: 'Hair color', kind: 'color', options: HAIR_COLORS },
  { key: 'eyes', label: 'Eyes', kind: 'shape', options: EYE_STYLES },
  { key: 'mouth', label: 'Mouth', kind: 'shape', options: MOUTH_STYLES },
  { key: 'accessory', label: 'Extras', kind: 'shape', options: ACCESSORIES },
]

export const DEFAULT_AVATAR = {
  bg: 'peach',
  skin: 'sand',
  hairStyle: 'bob',
  hairColor: 'chestnut',
  eyes: 'dots',
  mouth: 'smile',
  accessory: 'none',
}

export function optionValue(options, id, fallbackIndex = 0) {
  return options.find((o) => o.id === id) || options[fallbackIndex]
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Deterministic per-seed avatar, so a fresh seat still looks like someone. */
export function randomAvatarConfig(seed = 'seed') {
  const pick = (arr, salt) => arr[hash(seed + salt) % arr.length].id
  return {
    bg: pick(BACKGROUND_COLORS, 'bg'),
    skin: pick(SKIN_TONES, 'skin'),
    hairStyle: pick(HAIR_STYLES.slice(1), 'hair'),
    hairColor: pick(HAIR_COLORS, 'haircolor'),
    eyes: pick(EYE_STYLES, 'eyes'),
    mouth: pick(MOUTH_STYLES, 'mouth'),
    accessory: pick(ACCESSORIES, 'acc'),
  }
}
