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
        <div className="stat-card">
          <h3>VLT Balance</h3>
          <p>{user?.points || 0} VLT</p>
        </div>
        <div className="stat-card">
          <h3>Mining Streak</h3>
          <p>{miningStreak}x</p>
        </div>
        <div className="stat-card">
          <h3>Boost Level</h3>
          <p>{autoBoostLevel}x</p>
        </div>
      </div>

      <button 
        onClick={handleMining} 
        className={`mining-button ${isRotating ? 'rotating' : ''}`}
      >
        <img 
          src="/veltura-icon.png" 
          alt="Mine VLT" 
          className="veltura-icon"
        />
      </button>
    </div>
  )
}
