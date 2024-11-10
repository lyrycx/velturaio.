export default function FriendsInterface({ user, referralCode, referralCount }) {
    const copyReferralCode = () => {
      navigator.clipboard.writeText(referralCode)
    }
  
    return (
      <div className="friends-interface">
        <div className="referral-card">
          <h3>Your Referral Link</h3>
          <div className="referral-code">
            <input 
              type="text" 
              value={referralCode} 
              readOnly 
              className="code-input"
            />
            <button onClick={copyReferralCode} className="copy-button">
              Copy
            </button>
          </div>
          <div className="referral-stats">
            <p>Friends Invited: {referralCount}</p>
            <p>Bonus Earnings: {referralCount * 10}%</p>
          </div>
        </div>
      </div>
    )
  }
  