
import React, { useState, useEffect, useRef } from 'react';

const GearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

interface GameMenuProps {
    onOpenRules: () => void;
    onOpenSettings: () => void;
    onResetGame: () => void;
    isAssistantVisible: boolean;
    onToggleAssistant: () => void;
    isOnline?: boolean;
    roomId?: string | null;
    onlineStatus?: 'connecting' | 'connected' | 'offline' | 'error';
}

const GameMenu: React.FC<GameMenuProps> = ({ onOpenRules, onOpenSettings, onResetGame, isAssistantVisible, onToggleAssistant, isOnline, roomId, onlineStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuItemClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="absolute top-4 right-4 z-40 flex gap-2 items-center" ref={menuRef}>
            {isOnline && (
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm animate-scale-in">
                    <div className={`w-2 h-2 rounded-full ${onlineStatus === 'connected' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-yellow-400 animate-pulse'}`}></div>
                    <span className="text-xs font-mono text-white/80">
                        Room: {roomId}
                    </span>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-full text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 transition-all duration-200 shadow-lg"
                aria-label="Game Menu"
            >
                <GearIcon />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-60 glass-panel rounded-2xl py-2 origin-top-right animate-scale-in overflow-hidden z-50">
                    <button
                        onClick={() => handleMenuItemClick(onOpenRules)}
                        className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        Game Rules
                    </button>
                    <button
                        onClick={() => handleMenuItemClick(onOpenSettings)}
                        className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        Settings
                    </button>
                    <button
                        onClick={() => handleMenuItemClick(onToggleAssistant)}
                        className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        {isAssistantVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
                    </button>
                    
                    {isOnline && (
                         <div className="px-5 py-3 bg-white/5 text-xs font-mono text-white/60 break-all border-t border-white/5">
                             ID: {roomId}
                             <br/>
                             Status: <span className={onlineStatus === 'connected' ? 'text-green-400' : 'text-yellow-400'}>{onlineStatus}</span>
                         </div>
                    )}

                    <div className="border-t border-white/10 my-1"></div>
                    <button
                        onClick={() => handleMenuItemClick(onResetGame)}
                        className="w-full text-left px-5 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-bold"
                    >
                        Reset Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameMenu;
