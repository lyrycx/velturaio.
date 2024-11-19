'use client'

import { useEffect, useState } from 'react'
import { Header, HomeView, BoostView, FriendsView, EarnView, Navigation, SettingsModal } from './components/GameComponents'

interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

interface User {
  id: string
  telegramId: number
  username: string
  firstName: string
  lastName: string
  points: number
  referralCount: number
  autoBoostLevel: number
  lastSeen: Date
  referrerId?: number
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        initDataUnsafe: {
          user: TelegramUser
          start_param?: string
        }
        switchInlineQuery: (query: string) => void
        MainButton: {
          show: () => void
          hide: () => void
          setText: (text: string) => void
          onClick: (fn: () => void) => void
        }
      }
    }
  }
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'home' | 'boost' | 'friends' | 'earn'>('home')
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [isRotating, setIsRotating] = useState<boolean>(false)
  const [miningStreak, setMiningStreak] = useState<number>(0)
  const [autoBoostLevel, setAutoBoostLevel] = useState<number>(1)
  const [lastMiningTime, setLastMiningTime] = useState<number>(0)

  useEffect(() => {
    const telegram = window.Telegram.WebApp
    telegram.ready()
    telegram.expand()

    const fetchUser = async () => {
      try {
        const userData = {
          ...telegram.initDataUnsafe.user,
          referrerId: telegram.initDataUnsafe.start_param 
            ? parseInt(telegram.initDataUnsafe.start_param) 
            : undefined
        }

        const response = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })

        if (response.ok) {
          const userData: User = await response.json()
          setUser(userData)
          setAutoBoostLevel(userData.autoBoostLevel || 1)

          // Referral ödülü
          if (telegram.initDataUnsafe.start_param && userData.referrerId) {
            await fetch('/api/claim-referral', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: userData.telegramId,
                referrerId: userData.referrerId
              })
            })
          }
        }
      } catch (error) {
        console.error('Kullanıcı yüklenemedi:', error)
      }
    }

    fetchUser()

    const keepAlive = setInterval(async () => {
      if (user?.telegramId) {
        try {
          await fetch('/api/keep-alive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: user.telegramId })
          })
        } catch (error) {
          console.error('Keep-alive başarısız:', error)
        }
      }
    }, 30000)

    return () => clearInterval(keepAlive)
  }, [])

  const handleMining = async () => {
    if (!user?.telegramId) return

    const currentTime = Date.now()
    if (currentTime - lastMiningTime < 100) return // Anti-spam
    setLastMiningTime(currentTime)

    setIsRotating(true)
    setTimeout(() => setIsRotating(false), 100)

    try {
      const points = autoBoostLevel * 2
      const response = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          points: points
        })
      })
      
      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setMiningStreak(prev => (prev + 1) % 5)
      }
    } catch (error) {
      console.error('Mining başarısız:', error)
    }
  }

  const handleBoostUpgrade = async (level: number, cost: number) => {
    if (!user?.telegramId || user.points < cost || autoBoostLevel >= level) return

    try {
      const response = await fetch('/api/upgrade-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          level: level,
          cost: cost
        })
      })
      
      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setAutoBoostLevel(level)
      }
    } catch (error) {
      console.error('Yükseltme başarısız:', error)
    }
  }

  const handleShare = () => {
    const telegram = window.Telegram.WebApp
    telegram.switchInlineQuery(`Veltura Mining'e katıl! Referans linkimi kullan: https://t.me/VelturaMiningBot?start=${user?.telegramId}`)
  }

  return (
    <main className="game-container">
      <Header user={user} showSettings={showSettings} setShowSettings={setShowSettings} />
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
      {currentView === 'friends' && <FriendsView user={user} handleShare={handleShare} />}
      {currentView === 'earn' && <EarnView user={user} />}
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} user={user} />}
    </main>
  )
}
