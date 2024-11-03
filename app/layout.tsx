'use client'

import React, { useState, useEffect } from "react";
import { WebApp } from '@twa-dev/types'

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

interface User {
  telegramId: string;
  firstName: string;
  points: number;
}

const translations = {
  en: {
    home: "Home",
    earn: "Earn", 
    friends: "Friends",
    startFarming: "Start Farming",
    farming: "Farming...",
    inviteFriends: "Invite Friends",
    shareLink: "Share Link",
    share: "Share",
    rewardText: "Earn 50.00 VLT for each friend who joins!",
    settings: "Settings",
    language: "Language",
    invitedFriends: "Invited Friends",
    watchYoutube: "Subscribe YouTube",
    joinTelegram: "Join Telegram",
    followTwitter: "Follow on Twitter",
    close: "Close",
    claimed: "Claimed",
    remainingTime: "",
    boost: "Boost",
    clicksRemaining: "",
    cost: "",
    maxLevel: "Max Level Reached",
    level: "Level"
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [isFarming, setIsFarming] = useState(false);
  const [clicksRemaining, setClicksRemaining] = useState(600);
  const [clickPower, setClickPower] = useState(1);
  const [isClicking, setIsClicking] = useState(false);
  const [language, setLanguage] = useState<keyof typeof translations>("en");
  const [currentView, setCurrentView] = useState("home");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const initDataUnsafe = tg.initDataUnsafe || {};

      if (initDataUnsafe.user) {
        fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initDataUnsafe.user),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              setUser(data);
            }
          })
          .catch((err) => {
            setError('Failed to fetch user data');
          });
      } else {
        setError('No user data available');
      }
    } else {
      setError('This app should be opened in Telegram');
    }
  }, []);

  const handleTokenClick = async () => {
    if (!user || clicksRemaining <= 0) return;

    setIsClicking(true);
    const pointsToAdd = clickPower;
    const newPoints = user.points + pointsToAdd;
    
    setUser(prev => ({
      ...prev!,
      points: newPoints
    }));
    setClicksRemaining(prev => prev - 1);

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: user.telegramId,
          points: pointsToAdd
        }),
      });
       
      const data = await res.json();
      if (data.success) {
        showRewardAnimation(pointsToAdd);
      } else {
        setUser(prev => ({
          ...prev!,
          points: prev!.points - pointsToAdd
        }));
        setClicksRemaining(prev => prev + 1);
      }
    } catch (err) {
      setError('Failed to update points');
      setUser(prev => ({
        ...prev!,
        points: prev!.points - pointsToAdd
      }));
      setClicksRemaining(prev => prev + 1);
    }

    setTimeout(() => {
      setIsClicking(false);
    }, 300);
  };

  const showRewardAnimation = (amount: number) => {
    const rewardElement = document.createElement('div');
    rewardElement.className = 'click-reward';
    rewardElement.textContent = `+${amount}`;

    const tokenContainer = document.querySelector('.token-container');
    if (tokenContainer) {
      tokenContainer.appendChild(rewardElement);
      setTimeout(() => {
        rewardElement.remove();
      }, 1000);
    }
  };

  const upgradeClickPower = async () => {
    if (!user) return;

    const upgradeCosts = [100, 500, 2500, 10000, 50000, 250000];
    const currentLevel = clickPower - 1;

    if (currentLevel < upgradeCosts.length) {
      const upgradeCost = upgradeCosts[currentLevel];
      if (user.points >= upgradeCost) {
        const newPoints = user.points - upgradeCost;
        
        setUser(prev => ({
          ...prev!,
          points: newPoints
        }));
        setClickPower(prev => prev + 1);

        try {
          await fetch('/api/upgrade-power', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: user.telegramId,
              newPower: clickPower + 1,
              newPoints: newPoints
            }),
          });
        } catch (err) {
          setError('Failed to upgrade power');
        }
      }
    }
  };

  const t = translations[language];

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="app" style={{ userSelect: 'none' }}>
      <div className="background-animation"></div>
      <header className="app-header">
        <div className="vlt-balance-container">
          <div className="vlt-balance">
            <span className="vlt-icon"></span>
            <span className="vlt-amount">VLT {user?.points.toFixed(1) || '0.0'}</span>
          </div>
          <div className="clicks-remaining">
            {clicksRemaining > 0 ? `🧊${clicksRemaining}` : ''}
          </div>
        </div>
        <div className="header-buttons">
          <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="token-container">
          <div
            className={`token ${isClicking ? "clicking" : ""}`}
            onClick={handleTokenClick}
          >
            <span className="vlt-text"></span>
          </div>
        </div>

        {showSettings && (
          <div className="settings-view">
            <h2>{t.settings}</h2>
            <div className="language-selector">
              {Object.keys(translations).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as keyof typeof translations)}
                  className={language === lang ? "active" : ""}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="menu-buttons">
          <button
            className={`menu-button ${currentView === "home" ? "glow-button" : ""}`}
            onClick={() => setCurrentView("home")}
          >
            <i className="fas fa-home"></i>
            {t.home}
          </button>
          <button
            className={`menu-button ${currentView === "boost" ? "glow-button" : ""}`}
            onClick={() => setCurrentView("boost")}
          >
            <i className="fas fa-bolt"></i>
            {t.boost}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
