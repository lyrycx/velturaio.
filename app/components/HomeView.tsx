'use client'
import Image from 'next/image'

export default function HomeView({ user, handleMining, isRotating, miningStreak, animations }) {
  return (
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
}
