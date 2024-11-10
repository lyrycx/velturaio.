export default function BoostInterface({ user, boostStats, onBoostPurchase }) {
    return (
      <div className="boost-interface">
        <div className="boost-cards">
          <div className="boost-card">
            <h3>Mining Power</h3>
            <div className="boost-stat">
              <span className="boost-value">x{boostStats.multiplier}</span>
              <button onClick={() => onBoostPurchase('power')} className="boost-button">
                Upgrade ({boostStats.cost} VLT)
              </button>
            </div>
          </div>
          
          <div className="boost-card">
            <h3>Auto Miner</h3>
            <div className="boost-stat">
              <span className="boost-value">Level {user?.autoMinerLevel || 0}</span>
              <button onClick={() => onBoostPurchase('auto')} className="boost-button">
                Upgrade ({boostStats.cost * 2} VLT)
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  