import React, { useState, useEffect } from 'react';
import type { GameSettings, PlayerColor } from '../types';
import { PLAYER_COLORS, PLAYER_CONFIG } from '../constants';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: GameSettings) => void;
    currentSettings: GameSettings;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
    const [settings, setSettings] = useState<GameSettings>(currentSettings);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setSettings(currentSettings);
        if (!isOpen) {
          // Reset invite link state when modal is closed
          setInviteLink('');
          setCopied(false);
        }
    }, [currentSettings, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleNameChange = (color: PlayerColor, name: string) => {
        setSettings(prev => ({
            ...prev,
            playerNames: {
                ...prev.playerNames,
                [color]: name,
            },
        }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    const generateInviteLink = () => {
        const newLink = `https://ludo-world.game/invite/${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setInviteLink(newLink);
        setCopied(false);
    };

    const copyLink = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };
    
    const shareOnFacebook = () => {
        if (!inviteLink) return;
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}&quote=${encodeURIComponent("Come play Ludo with me on Ludo World!")}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#fefce8] rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 border border-amber-800/20">
                <h2 className="text-3xl font-bold mb-8 text-center text-amber-900">Game Settings</h2>
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-800/80 border-b border-amber-800/20 pb-2">Player Names</h3>
                    {PLAYER_COLORS.map(color => (
                        <div key={color} className="flex items-center gap-4">
                            <label htmlFor={`player-name-${color}`} className="w-24 text-right font-semibold text-lg" style={{ color: PLAYER_CONFIG[color].primary }}>
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                            </label>
                            <input
                                id={`player-name-${color}`}
                                type="text"
                                value={settings.playerNames[color]}
                                onChange={(e) => handleNameChange(color, e.target.value)}
                                className="flex-1 bg-white border-2 border-amber-800/20 rounded-lg px-4 py-2 text-gray-800 focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none transition"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-amber-800/20">
                    <h3 className="text-lg font-semibold text-amber-800/80 mb-4">Play with Friends</h3>
                    {!inviteLink ? (
                         <button onClick={generateInviteLink} className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/50 border-b-4 border-blue-800 active:scale-95">
                            Invite Friends
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <input
                                type="text"
                                readOnly
                                value={inviteLink}
                                className="w-full bg-white border-2 border-amber-800/20 rounded-lg px-4 py-2 text-gray-600 text-center font-mono"
                            />
                            <div className="flex gap-3 justify-center">
                                <button onClick={copyLink} className="flex-1 px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500/50 border-b-4 border-gray-700 active:scale-95 disabled:opacity-70" disabled={copied}>
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                                 <button onClick={shareOnFacebook} className="flex-1 px-4 py-2 bg-[#1877F2] text-white font-bold rounded-lg hover:bg-[#166fe5] transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/50 border-b-4 border-[#0e5cad] active:scale-95">
                                    Share on Facebook
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500/50 border-b-4 border-gray-700 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/50 border-b-4 border-amber-800 active:scale-95"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;