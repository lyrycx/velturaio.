'use client'

import { useState, useEffect } from 'react'

const Header = ({ user, showSettings, setShowSettings }) => {
  return (
    <header className="game-header">
      <div className="user-info">
        <div className="avatar">{user?.firstName?.[0] || '👤'}</div>
        <div className="user-details">
          <h2>{user?.firstName || 'Crypto Miner'}</h2>
        </div>
      </div>
      <button onClick={() => setShowSettings(!showSettings)} className="settings-button">⚙️</button>
    </header>
  )
}

const HomeView = ({ user, handleMining, isRotating, miningStreak, autoBoostLevel }) => {
  const [miningPoints, setMiningPoints] = useState([])
  const miningIconUrl = "https://r.resimlink.com/vXD2MproiNHm.png"

  const handleMiningClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const points = autoBoostLevel * 2
    setMiningPoints(prev => [...prev, {
      x,
      y,
      points: `+${points}`,
      id: Date.now()
    }])

    setTimeout(() => {
      setMiningPoints(prev => prev.slice(1))
    }, 1000)

    handleMining()
  }

  return (
    <div className="home-view">
      <div className="mining-stats">
        <div className="stat-item">
          <span className="stat-label">Mining Power</span>
          <span className="stat-value">x{autoBoostLevel * 2}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Mined</span>
          <span className="stat-value">{user?.totalMined?.toLocaleString() || '0'}</span>
        </div>
      </div>
      <div className="crystal-container">
        <button 
          onClick={handleMiningClick} 
          className={`mining-button ${isRotating ? 'pulse' : ''}`}
          style={{ touchAction: 'manipulation' }}
        >
          <div className="mining-circle">
            <img src={miningIconUrl} alt="Veltura" className="mining-image" />
            {miningPoints.map(point => (
              <div
                key={point.id}
                className="floating-points"
                style={{
                  left: point.x,
                  top: point.y,
                }}
              >
                {point.points}
              </div>
            ))}
          </div>
        </button>
      </div>
    </div>
  )
}

const BoostView = ({ user, autoBoostLevel, handleBoostUpgrade }) => {
  const boosts = [
    { level: 1, cost: 1000, multiplier: 2 },
    { level: 2, cost: 5000, multiplier: 5 },
    { level: 3, cost: 25000, multiplier: 10 },
    { level: 4, cost: 100000, multiplier: 25 },
    { level: 5, cost: 500000, multiplier: 50 }
  ]

  return (
    <div className="boost-view">
      <h2>Mining Upgrades</h2>
      <div className="boost-grid">
        {boosts.map((boost) => (
          <div key={boost.level} className={`boost-card ${autoBoostLevel >= boost.level ? 'owned' : ''}`}>
            <div className="boost-header">Level {boost.level}</div>
            <div className="boost-content">
              <span className="multiplier">×{boost.multiplier}</span>
              <button
                onClick={() => handleBoostUpgrade(boost.level, boost.cost)}
                disabled={autoBoostLevel >= boost.level || (user?.points || 0) < boost.cost}
                className="upgrade-button"
              >
                {autoBoostLevel >= boost.level ? 'Owned' : `${boost.cost.toLocaleString()} VLT`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FriendsView = ({ user, handleShare }) => {
  return (
    <div className="friends-view">
      <div className="referral-stats">
        <div className="stat-box">
          <span className="stat-value">{user?.referralCount || 0}</span>
          <span className="stat-label">Total Referrals</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">50,000</span>
          <span className="stat-label">VLT Per Referral</span>
        </div>
      </div>
      <div className="referral-card">
        <h3>Invite Friends</h3>
        <p>Share your link and earn 50,000 VLT for each friend!</p>
        <button onClick={handleShare} className="share-button">
          <span>Share on Telegram</span>
          <span className="share-icon">📤</span>
        </button>
      </div>
    </div>
  )
}

const EarnView = ({ user }) => {
  const [claimedRewards, setClaimedRewards] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`claimedRewards_${user?.telegramId}`)
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  const socialMedia = [
    {
      name: 'YouTube',
      icon: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
      url: 'https://youtube.com/@NikandrSurkov',
      reward: 5000
    },
    {
      name: 'Twitter',
      icon: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
      url: 'https://twitter.com/VelturaCrypto',
      reward: 5000
    },
    {
      name: 'Telegram',
      icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
      url: 'https://t.me/VelturaCrypto',
      reward: 5000
    }
  ]

  const handleSocialClick = async (platform) => {
    const newClaimedRewards = {
      ...claimedRewards,
      [platform.name]: true
    }
    
    setClaimedRewards(newClaimedRewards)
    localStorage.setItem(`claimedRewards_${user?.telegramId}`, JSON.stringify(newClaimedRewards))

    window.open(platform.url, '_blank')

    try {
      await fetch('/api/claim-social-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.telegramId,
          platform: platform.name,
          reward: platform.reward
        })
      })
    } catch (error) {
      console.error('Failed to claim reward:', error)
    }
  }

  return (
    <div className="earn-view">
      <h2>Earn VLT</h2>
      <div className="social-grid">
        {socialMedia.map((platform) => (
          <div key={platform.name} className="social-card">
            <img src={platform.icon} alt={platform.name} className="social-icon" />
            <h3>{platform.name}</h3>
            <p>{platform.reward.toLocaleString()} VLT</p>
            <button
              onClick={() => handleSocialClick(platform)}
              className={`social-button ${claimedRewards[platform.name] ? 'claimed' : ''}`}
              disabled={claimedRewards[platform.name]}
              style={{
                backgroundColor: claimedRewards[platform.name] ? '#2c3e50' : '',
                cursor: claimedRewards[platform.name] ? 'not-allowed' : 'pointer'
              }}
            >
              {claimedRewards[platform.name] ? 'Claimed' : 'Follow & Earn'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const Navigation = ({ currentView, setCurrentView }) => {
  return (
    <nav className="navigation">
      <button
        onClick={() => setCurrentView('home')}
        className={`nav-button ${currentView === 'home' ? 'active' : ''}`}
      >
        <span className="nav-icon">💎</span>
        <span className="nav-text">Mine</span>
      </button>
      <button
        onClick={() => setCurrentView('boost')}
        className={`nav-button ${currentView === 'boost' ? 'active' : ''}`}
      >
        <span className="nav-icon">⚡</span>
        <span className="nav-text">Boost</span>
      </button>
      <button
        onClick={() => setCurrentView('friends')}
        className={`nav-button ${currentView === 'friends' ? 'active' : ''}`}
      >
        <span className="nav-icon">👥</span>
        <span className="nav-text">Friends</span>
      </button>
      <button
        onClick={() => setCurrentView('earn')}
        className={`nav-button ${currentView === 'earn' ? 'active' : ''}`}
      >
        <span className="nav-icon">🎁</span>
        <span className="nav-text">Earn</span>
      </button>
    </nav>
  )
}

const SettingsModal = ({ onClose, user }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Settings</h2>
        <div className="settings-list">
          <div className="setting-item">
            <span>Language</span>
            <select defaultValue="en">
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
          <div className="setting-item">
            <span>Animations</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  )
}

export {
  Header,
  HomeView,
  BoostView,
  FriendsView,
  EarnView,
  Navigation,
  SettingsModal
}
