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
  referralCount: number
  autoBoostLevel: number
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

const videoBackground = "https://cdn.pixabay.com/vimeo/414800870/abstract-41161.mp4"

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

    // Periodic user data refresh
    const interval = setInterval(() => {
      if (user?.telegramId) {
        refreshUserData(user.telegramId)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user?.telegramId])

  const refreshUserData = async (telegramId: number) => {
    try {
      const response = await fetch(`/api/user/${telegramId}`)
      const data = await response.json()
      if (data) {
        setUser(data)
        setAutoBoostLevel(data.autoBoostLevel || 1)
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

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
      setAutoBoostLevel(data.autoBoostLevel || 1)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const handleMining = async () => {
    if (!user) return
    const currentTime = Date.now()
    if (currentTime - lastClickTime < 300) return

    setIsRotating(true)
    setTimeout(() => setIsRotating(false), 300)

    try {
      const pointsToAdd = autoBoostLevel * 2 * (miningStreak + 1)
      
      const response = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          points: pointsToAdd,
          miningStreak: miningStreak,
          autoBoostLevel: autoBoostLevel
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setMiningStreak(prev => Math.min(prev + 1, 5))
        refreshUserData(user.telegramId)
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
        const updatedUser = await response.json()
        setUser(updatedUser)
        setAutoBoostLevel(updatedUser.autoBoostLevel)
        refreshUserData(user.telegramId)
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const shareUrl = `https://t.me/share/url?url=https://t.me/VelturaMiningBot?start=ref_${user?.telegramId}&text=Join%20Veltura%20Mining%20and%20earn%2050,000%20Points%20bonus!%20Use%20my%20referral%20link%20to%20start%20mining%20together!`
      window.Telegram.WebApp.openTelegramLink(shareUrl)
    }
  }

  if (!mounted) return null

  return (
    <div className="game-container">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="video-background"
        src={videoBackground}
      />
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
            autoBoostLevel={autoBoostLevel}
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
