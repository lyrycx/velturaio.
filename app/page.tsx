'use client'

import React, { useState, useEffect } from "react";
import { WebApp } from '@twa-dev/types'

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

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const initData = tg.initDataUnsafe.user;
      if (initData) {
        fetchUserData(initData);
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

  if (!mounted) {
    return null;
  }

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
          <div className="w-10 h-10 rounded-full bg-purple-600" />
          <div>
            <h2 className="font-bold">{user?.firstName || 'User'}</h2>
            <p className="text-sm text-purple-300">@{user?.username || 'anonymous'}</p>
          </div>
        </div>
        <div className="bg-purple-800 px-4 py-2 rounded-full flex items-center">
          <span className="text-yellow-400 mr-2">⚡</span>
          <span>{user?.points?.toLocaleString() || '0'} VLT</span>
        </div>
      </header>

      <main className="p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-purple-800/30 p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Power Level {powerLevel}</h3>
              <p className="text-sm text-purple-300">Click to earn VLT tokens</p>
            </div>
            
            <button 
              onClick={() => setPowerLevel(prev => prev + 1)}
              className="w-full h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                         flex items-center justify-center text-2xl font-bold
                         transform transition hover:scale-105 active:scale-95"
            >
              FARM VLT
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-800/30 p-4 rounded-xl backdrop-blur-sm">
              <h4 className="text-purple-300">Daily Earnings</h4>
              <p className="text-2xl font-bold">{((user?.points || 0) * 0.1).toFixed(1)} VLT</p>
            </div>
            <div className="bg-purple-800/30 p-4 rounded-xl backdrop-blur-sm">
              <h4 className="text-purple-300">Power Multiplier</h4>
              <p className="text-2xl font-bold">x{powerLevel}</p>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-purple-900/80 backdrop-blur-md border-t border-purple-700">
        <div className="flex justify-around p-4">
          {['farm', 'upgrade', 'profile', 'shop'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center ${
                activeTab === tab ? 'text-purple-400' : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">
                {tab === 'farm' ? '🌾' : tab === 'upgrade' ? '⚡' : tab === 'profile' ? '👤' : '🛍️'}
              </span>
              <span className="text-xs capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
