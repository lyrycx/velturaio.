'use client'

export default function BoostView({ user, autoBoostLevel, handleBoostUpgrade }) {
  return (
    <div className="boost-view">
      <h2>Auto Mining Boost</h2>
      <div className="boost-levels">
        {[...Array(10)].map((_, index) => {
          const level = index + 1
          const cost = Math.pow(level, 2) * 1000
          return (
            <div key={level} className={`boost-card ${autoBoostLevel >= level ? 'active' : ''}`}>
              <div className="boost-level">Level {level}</div>
              <div className="boost-multiplier">{level}x</div>
              <button
                onClick={() => handleBoostUpgrade(level, cost)}
                disabled={autoBoostLevel >= level || (user?.points || 0) < cost}
                className="boost-button"
              >
                {cost.toLocaleString()} VLT
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
