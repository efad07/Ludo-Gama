
import React, { useState, useEffect, useRef } from 'react';

// Icons
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const RulesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
        <div className="absolute top-4 right-4 z-40" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 pl-3 pr-4 py-2 rounded-full 
                    backdrop-blur-xl border transition-all duration-300 shadow-lg
                    hover:shadow-xl hover:scale-105 active:scale-95
                    ${isOpen ? 'bg-white text-slate-900 border-white' : 'bg-slate-900/40 text-white border-white/10'}
                `}
            >
                <div className="relative">
                    <MenuIcon />
                    {isOnline && (
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-slate-900 rounded-full ${onlineStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                    )}
                </div>
                <span className="text-xs font-bold tracking-widest uppercase">Menu</span>
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in origin-top-right">
                    {/* Online Status Banner */}
                    {isOnline && (
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-col gap-0.5">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online Session</span>
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded select-all">
                                    {roomId}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${onlineStatus === 'connected' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {onlineStatus}
                                </span>
                             </div>
                        </div>
                    )}

                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => handleMenuItemClick(onOpenRules)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors group"
                        >
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <RulesIcon />
                            </div>
                            <span className="text-sm font-bold">Game Rules</span>
                        </button>
                        
                        <button
                            onClick={() => handleMenuItemClick(onOpenSettings)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors group"
                        >
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <SettingsIcon />
                            </div>
                            <span className="text-sm font-bold">Settings</span>
                        </button>

                        <button
                            onClick={() => handleMenuItemClick(onToggleAssistant)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors group"
                        >
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <RobotIcon />
                            </div>
                            <span className="text-sm font-bold">
                                {isAssistantVisible ? 'Hide Assistant' : 'Show Assistant'}
                            </span>
                        </button>
                    </div>
                    
                    <div className="border-t border-slate-100 p-2">
                        <button
                            onClick={() => handleMenuItemClick(onResetGame)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
                        >
                            <div className="p-2 bg-red-100 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <ResetIcon />
                            </div>
                            <span className="text-sm font-bold">Reset Game</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameMenu;
