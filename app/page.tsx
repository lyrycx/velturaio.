'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { Header, HomeView, BoostView, FriendsView, EarnView, Navigation, SettingsModal } from './components/GameComponents'

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
}

// Memo ile optimize edilmiş bileşenler
const MemoizedHeader = memo(Header)
const MemoizedHomeView = memo(HomeView)
const MemoizedBoostView = memo(BoostView)
const MemoizedFriendsView = memo(FriendsView)
const MemoizedEarnView = memo(EarnView)
const MemoizedNavigation = memo(Navigation)
const MemoizedSettingsModal = memo(SettingsModal)

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState('home')
  const [showSettings, setShowSettings] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [miningStreak, setMiningStreak] = useState(0)
  const [autoBoostLevel, setAutoBoostLevel] = useState(1)
  const [lastMiningTime, setLastMiningTime] = useState(0)
  const [isMining, setIsMining] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = useCallback(async () => {
    const telegram = window.Telegram.WebApp
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegram.initDataUnsafe.user)
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setAutoBoostLevel(userData.autoBoostLevel)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const telegram = window.Telegram.WebApp
    telegram.ready()
    telegram.expand()
    fetchUserData()

    const keepAlive = setInterval(fetchUserData, 30000)
    return () => clearInterval(keepAlive)
  }, [fetchUserData])

  const handleMining = useCallback(async () => {
    if (!user?.telegramId || isMining) return

    const currentTime = Date.now()
    if (currentTime - lastMiningTime < 200) return
    
    setIsMining(true)
    setLastMiningTime(currentTime)
    setIsRotating(true)

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
      console.error('Mining error:', error)
    } finally {
      setTimeout(() => {
        setIsRotating(false)
        setIsMining(false)
      }, 100)
    }
  }, [user?.telegramId, isMining, lastMiningTime, autoBoostLevel])

  const handleBoostUpgrade = useCallback(async (level: number, cost: number) => {
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
        await fetchUserData()
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    }
  }, [user?.telegramId, user?.points, autoBoostLevel, fetchUserData])

  const handleShare = useCallback(() => {
    const telegram = window.Telegram.WebApp
    telegram.switchInlineQuery(`Join Veltura Mining! Use my referral link: https://t.me/VelturaMiningBot?start=${user?.telegramId}`)
  }, [user?.telegramId])

  if (isLoading) return null

  return (
    <main className="game-container">
      <MemoizedHeader 
        user={user} 
        showSettings={showSettings} 
        setShowSettings={setShowSettings} 
      />
      {currentView === 'home' && (
        <MemoizedHomeView
          user={user}
          handleMining={handleMining}
          isRotating={isRotating}
          miningStreak={miningStreak}
          autoBoostLevel={autoBoostLevel}
        />
      )}
      {currentView === 'boost' && (
        <MemoizedBoostView
          user={user}
          autoBoostLevel={autoBoostLevel}
          handleBoostUpgrade={handleBoostUpgrade}
        />
      )}
      {currentView === 'friends' && (
        <MemoizedFriendsView 
          user={user} 
          handleShare={handleShare} 
        />
      )}
      {currentView === 'earn' && (
        <MemoizedEarnView 
          user={user} 
          onRewardClaimed={fetchUserData} 
        />
      )}
      <MemoizedNavigation 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
      {showSettings && (
        <MemoizedSettingsModal 
          onClose={() => setShowSettings(false)} 
          user={user} 
        />
      )}
    </main>
  )
}
