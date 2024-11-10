'use client'

export default function Header({ user, showSettings, setShowSettings }) {
  return (
    <header className="game-header">
      <div className="user-info">
        <div className="avatar">
          {user?.firstName?.[0] || '❄'}
        </div>
        <div className="user-details">
          <h2>{user?.firstName || 'Winter Farmer'}</h2>
          <p>CEO</p>
        </div>
      </div>
      <button onClick={() => setShowSettings(!showSettings)} className="settings-button">
        ⚙️
      </button>
    </header>
  )
}
