'use client'

export default function Navigation({ currentView, setCurrentView }) {
  return (
    <nav className="bottom-navigation">
      <button onClick={() => setCurrentView('home')} className={`nav-button ${currentView === 'home' ? 'active' : ''}`}>
        🏠
      </button>
      <button onClick={() => setCurrentView('boost')} className={`nav-button ${currentView === 'boost' ? 'active' : ''}`}>
        ⚡
      </button>
      <button onClick={() => setCurrentView('friends')} className={`nav-button ${currentView === 'friends' ? 'active' : ''}`}>
        👥
      </button>
    </nav>
  )
}
