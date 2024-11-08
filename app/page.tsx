'use client'

import { useState, useEffect } from "react"
import Image from 'next/image'
import './globals.css'

interface User {
  id: string
  telegramId: number
  username?: string
  firstName?: string
  lastName?: string
  points: number
  createdAt: Date
  updatedAt: Date
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        initDataUnsafe: {
          user?: {
            id: number
            first_name?: string
            username?: string
            last_name?: string
          }
        }
        openTelegramLink: (url: string) => void
      }
    }
  }
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(Date.now())
  const [currentView, setCurrentView] = useState('home')
  const [farmingPoints, setFarmingPoints] = useState(0)
  const [autoBoostLevel, setAutoBoostLevel] = useState(1)
  const [language, setLanguage] = useState('en')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setMounted(true)
    initializeTelegram()
  }, [])

  const initializeTelegram = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      const initData = tg.initDataUnsafe.user
      if (initData) {
        fetchUserData({
          id: initData.id,
          first_name: initData.first_name,
          username: initData.username,
          last_name: initData.last_name
        })
      }
    }
  }

  const fetchUserData = async (telegramUser: any) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramUser),
      })
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const handleMining = async () => {
    if (!user) return
    const currentTime = Date.now()
    if (currentTime - lastClickTime < 1000) return

    setIsRotating(true)
    setTimeout(() => setIsRotating(false), 1000)

    try {
      const response = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          telegramId: user.telegramId,
          boostLevel: autoBoostLevel 
        }),
      })

      if (response.ok) {
        const { points } = await response.json()
        setUser(prev => prev ? { ...prev, points } : null)
        setFarmingPoints(prev => prev + autoBoostLevel)
        showPointsAnimation(autoBoostLevel)
      }
    } catch (error) {
      console.error('Mining failed:', error)
    }
    setLastClickTime(currentTime)
  }

  const handleBoostUpgrade = async (level: number, cost: number) => {
    if (!user || user.points < cost || autoBoostLevel >= level) return

    try {
      const response = await fetch('/api/upgrade-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          cost,
          level
        }),
      })

      if (response.ok) {
        const { points } = await response.json()
        setUser(prev => prev ? { ...prev, points } : null)
        setAutoBoostLevel(level)
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const shareUrl = `https://t.me/share/url?url=https://t.me/VelturaMiningBot?start=${user?.telegramId}`
      window.Telegram.WebApp.openTelegramLink(shareUrl)
    }
  }

  const showPointsAnimation = (points: number) => {
    const element = document.createElement('div')
    element.className = 'points-animation'
    element.textContent = `+${points} VLT`
    document.body.appendChild(element)
    setTimeout(() => element.remove(), 1000)
  }

  const renderHome = () => (
    <div className="home-view">
      <div className="points-display">
        <Image src="/veltura.png" alt="VLT" width={24} height={24} className="vlt-icon" />
        <span>{user?.points?.toLocaleString() || '0'} VLT</span>
      </div>
      <div className="crystal-container">
        <button onClick={handleMining} className={`crystal-button ${isRotating ? 'rotate' : ''}`}>
          <Image
            src="/veltura.png"
            alt="Veltura Crystal"
            width={200}
            height={200}
            className="crystal-image"
            priority
          />
        </button>
      </div>
    </div>
  )

  const renderBoost = () => (
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

  const renderFriends = () => (
    <div className="friends-view">
      <div className="referral-box">
        <h2>Invite Friends</h2>
        <p>Share your referral link and earn 10% from friends' mining!</p>
        <div className="referral-link">
          <div className="link-display">
            https://t.me/VelturaMiningBot?start={user?.telegramId}
          </div>
          <button onClick={handleShare} className="share-button">
            Share on Telegram
          </button>
        </div>
      </div>
    </div>
  )

  if (!mounted) return null

  return (
    <div className="game-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      
      <div className="snow-overlay"></div>

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

      <main className="game-content">
        {currentView === 'home' && renderHome()}
        {currentView === 'boost' && renderBoost()}
        {currentView === 'friends' && renderFriends()}
      </main>

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
    </div>
  )
}
