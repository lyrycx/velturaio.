'use client'

export default function SettingsModal({ onClose, user }) {
  return (
    <div className="settings-modal">
      <div className="settings-content">
        <h2>Settings</h2>
        <div className="settings-options">
          <div className="setting-item">
            <label>Sound Effects</label>
            <input type="checkbox" />
          </div>
          <div className="setting-item">
            <label>Music</label>
            <input type="checkbox" />
          </div>
        </div>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  )
}
