'use client'

import { useState, useEffect } from "react"
import { Header, Navigation, HomeView, BoostView, FriendsView, EarnView, SettingsModal } from './components/GameComponents'

interface User {
  id: string
  telegramId: number
  username?: string
  firstName?: string
  lastName?: string
  points: number
  createdAt: Date
  updatedAt: Date
  level: number
  totalMined: number
  referralCount: number
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
  const [autoBoostLevel, setAutoBoostLevel] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [miningStreak, setMiningStreak] = useState(0)

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
      const comboMultiplier = Math.min(miningStreak + 1, 5)
      const pointsToAdd = autoBoostLevel * comboMultiplier

      const response = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          points: pointsToAdd
        }),
      })

      if (response.ok) {
        const { points } = await response.json()
        setUser(prev => prev ? { ...prev, points } : null)
        setMiningStreak(prev => prev + 1)
      }
    } catch (error) {
      console.error('Mining failed:', error)
      setMiningStreak(0)
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

  if (!mounted) return null

  return (
    <div className="game-container">
      <div className="snow-overlay"></div>

      <Header
        user={user}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      <main className="game-content">
        {currentView === 'home' && (
          <HomeView
            user={user}
            handleMining={handleMining}
            isRotating={isRotating}
            miningStreak={miningStreak}
          />
        )}
        {currentView === 'boost' && (
          <BoostView
            user={user}
            autoBoostLevel={autoBoostLevel}
            handleBoostUpgrade={handleBoostUpgrade}
          />
        )}
        {currentView === 'friends' && (
          <FriendsView
            user={user}
            handleShare={handleShare}
          />
        )}
        {currentView === 'earn' && (
          <EarnView
            user={user}
          />
        )}
      </main>

      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          user={user}
        />
      )}
    </div>
  )
}
