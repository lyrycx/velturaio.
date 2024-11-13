interface HomeViewProps {
    user: any
    handleMining: () => void
    isRotating: boolean
    miningStreak: number
    autoBoostLevel: number
  }
  
  export function HomeView({ user, handleMining, isRotating, miningStreak, autoBoostLevel }: HomeViewProps) {
    return (
      <div className="mining-area">
        <div className="stats-display">
          <div className="stat-card glow-effect">
            <h3>Points Balance</h3>
            <p className="text-2xl font-bold text-green-400">
              {user?.points || 0} Points
            </p>
          </div>
          <div className="stat-card">
            <h3>Mining Power</h3>
            <p>{autoBoostLevel}x</p>
          </div>
          <div className="stat-card">
            <h3>Combo</h3>
            <p>{miningStreak}x</p>
          </div>
        </div>
  
        <button
          onClick={handleMining}
          className={`mining-button ${isRotating ? 'rotating' : ''}`}
        >
          <img
            src="/veltura-icon.png"
            alt="Mine Points"
            className="veltura-icon"
          />
        </button>
      </div>
    )
  }
  