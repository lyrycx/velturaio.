'use client'

export default function FriendsView({ user, handleShare }) {
  return (
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
}
