import Image from 'next/image'

interface HeaderProps {
    user: any
    showSettings: boolean
    setShowSettings: (show: boolean) => void
}

export function Header({ user, showSettings, setShowSettings }: HeaderProps) {
    const defaultAvatar = "/veltura-avatar.png" // Havalı default avatar

    return (
        <header className="game-header">
            <div className="user-info">
                <div className="avatar">
                    <Image 
                        src={defaultAvatar}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                </div>
                <div className="user-details">
                    <h2>{user?.firstName || 'Player'}</h2>
                    <p>{user?.points || 0} Points</p>
                </div>
            </div>
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className="settings-button"
            >
                ⚙️
            </button>
        </header>
    )
}
