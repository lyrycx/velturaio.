'use client'

import React, { useState, useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            username?: string;
            last_name?: string;
          };
        };
      };
    };
  }
}

interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('farm');
  const [powerLevel, setPowerLevel] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [farmingPoints, setFarmingPoints] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const initData = tg.initDataUnsafe.user;
      if (initData) {
        fetchUserData({
          id: initData.id,
          first_name: initData.first_name,
          username: initData.username,
          last_name: initData.last_name
        });
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserData = async (telegramUser: any) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramUser),
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleFarming = async () => {
    if (!user) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 1000) return; // Prevent rapid clicking

    const pointsToAdd = powerLevel * 1;
    
    try {
      const response = await fetch('/api/farm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          points: pointsToAdd
        }),
      });

      if (response.ok) {
        setUser(prev => prev ? {
          ...prev,
          points: prev.points + pointsToAdd
        } : null);
        setFarmingPoints(prev => prev + pointsToAdd);
        showFarmingAnimation(pointsToAdd);
      }
    } catch (error) {
      console.error('Farming failed:', error);
    }

    setLastClickTime(currentTime);
  };

  const showFarmingAnimation = (points: number) => {
    const element = document.createElement('div');
    element.className = 'farming-animation';
    element.textContent = `+${points}`;
    document.body.appendChild(element);
    
    setTimeout(() => element.remove(), 1000);
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <header className="p-4 flex justify-between items-center border-b border-purple-700">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            {user?.firstName?.[0] || '?'}
          </div>
          <div>
            <h2 className="font-bold">{user?.firstName || 'User'}</h2>
            <p className="text-sm text-purple-300">@{user?.username || 'anonymous'}</p>
          </div>
        </div>
        <div className="bg-purple-800/50 px-4 py-2 rounded-full flex items-center backdrop-blur-sm">
          <span className="text-yellow-400 mr-2">⚡</span>
          <span>{user?.points?.toLocaleString() || '0'} VLT</span>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="space-y-6">
          <div className="bg-purple-800/30 p-6 rounded-2xl backdrop-blur-sm border border-purple-700/50">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Power Level {powerLevel}</h3>
              <p className="text-sm text-purple-300">Farm VLT tokens by tapping</p>
            </div>
            
            <button 
              onClick={handleFarming}
              className="w-full h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                       flex items-center justify-center text-2xl font-bold
                       transform transition hover:scale-105 active:scale-95
                       border border-white/10 shadow-lg"
            >
              TAP TO FARM
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-800/30 p-4 rounded-xl backdrop-blur-sm border border-purple-700/50">
              <h4 className="text-purple-300 text-sm">Session Earnings</h4>
              <p className="text-2xl font-bold">{farmingPoints.toFixed(1)} VLT</p>
            </div>
            <div className="bg-purple-800/30 p-4 rounded-xl backdrop-blur-sm border border-purple-700/50">
              <h4 className="text-purple-300 text-sm">Power Multiplier</h4>
              <p className="text-2xl font-bold">x{powerLevel}</p>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-purple-900/80 backdrop-blur-md border-t border-purple-700">
        <div className="flex justify-around p-4 max-w-md mx-auto">
          {[
            { id: 'farm', icon: '🌾', label: 'Farm' },
            { id: 'upgrade', icon: '⚡', label: 'Upgrade' },
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'shop', icon: '🛍️', label: 'Shop' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center transition-colors ${
                activeTab === tab.id ? 'text-purple-400' : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <style jsx global>{`
        .farming-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: floatUp 1s ease-out forwards;
          color: #a855f7;
          font-weight: bold;
          font-size: 24px;
          pointer-events: none;
        }

        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
