/**
 * Level 3: completely honest. Its only job is to make level 4 land harder.
 */
export default function TrustFall({ progress, level, onHit, fx }) {
  return (
    <div className="gt-arena gt-arena-center">
      <p className="gt-note gt-note-kind">no tricks here 💚</p>
      <button
        className="gt-btn gt-btn-green gt-btn-big"
        onClick={(e) => {
          fx.pop()
          onHit(e)
        }}
      >
        CLICK ({progress}/{level.goal})
      </button>
    </div>
  )
}
