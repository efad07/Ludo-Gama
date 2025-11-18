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
}

const GameMenu: React.FC<GameMenuProps> = ({ onOpenRules, onOpenSettings, onResetGame, isAssistantVisible, onToggleAssistant }) => {
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
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-black/20 transition-all duration-200"
                aria-label="Game Menu"
            >
                <GearIcon />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#fefce8] rounded-lg shadow-2xl border border-amber-800/20 py-2 origin-top-right animate-scale-in">
                    <button
                        onClick={() => handleMenuItemClick(onOpenRules)}
                        className="w-full text-left px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                    >
                        Game Rules
                    </button>
                    <button
                        onClick={() => handleMenuItemClick(onOpenSettings)}
                        className="w-full text-left px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                    >
                        Settings
                    </button>
                    <button
                        onClick={() => handleMenuItemClick(onToggleAssistant)}
                        className="w-full text-left px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                    >
                        {isAssistantVisible ? 'Hide Assistant' : 'Show Assistant'}
                    </button>
                    <div className="border-t border-amber-800/20 my-1"></div>
                    <button
                        onClick={() => handleMenuItemClick(onResetGame)}
                        className="w-full text-left px-4 py-2 text-red-600 font-semibold hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                        Reset Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameMenu;