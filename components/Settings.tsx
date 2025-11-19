
import React, { useState, useEffect } from 'react';
import type { GameSettings, PlayerColor } from '../types';
import { PLAYER_COLORS, PLAYER_CONFIG } from '../constants';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: GameSettings) => void;
    currentSettings: GameSettings;
    onInitializeHost: () => Promise<string>;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSave, currentSettings, onInitializeHost }) => {
    const [settings, setSettings] = useState<GameSettings>(currentSettings);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setSettings(currentSettings);
        if (!isOpen) {
          // Reset invite link state when modal is closed
          setInviteLink('');
          setCopied(false);
          setIsGenerating(false);
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

    const generateInviteLink = async () => {
        setIsGenerating(true);
        try {
            const roomId = await onInitializeHost();
            // Use the actual current URL of the application
            const baseUrl = window.location.origin + window.location.pathname;
            const newLink = `${baseUrl}?room=${roomId}`;
            
            setInviteLink(newLink);
            setCopied(false);
        } catch (error) {
            console.error("Failed to generate link", error);
            alert("Could not start online session. Please try again.");
        } finally {
            setIsGenerating(false);
        }
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

    const shareOnMessenger = () => {
        if (!inviteLink) return;

        // 1. Try Web Share API (Best for Mobile - Native Share Sheet)
        if (navigator.share) {
            navigator.share({
                title: 'Join my Ludo Game',
                text: 'Come play Ludo with me on Ludo World!',
                url: inviteLink,
            }).catch((error) => console.log('Error sharing', error));
        } else {
             // 2. Fallback for Mobile Devices (Deep Link to Messenger App)
             const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
             if (isMobile) {
                  // This deep link attempts to open the Messenger app directly with the link
                  window.location.href = `fb-messenger://share/?link=${encodeURIComponent(inviteLink)}`;
             } else {
                  // 3. Desktop Fallback
                  copyLink();
                  alert("Link copied! Paste it into your Messenger chat.");
             }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 backdrop-blur-xl">
                <h2 className="text-3xl font-bold mb-8 text-center text-white tracking-tight">Game Settings</h2>
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-400 border-b border-white/10 pb-2">Player Names</h3>
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
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-slate-400 mb-4">Play with Friends</h3>
                    {!inviteLink ? (
                         <button 
                            onClick={generateInviteLink} 
                            disabled={isGenerating}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/30 border-b-4 border-blue-800 active:scale-95 disabled:opacity-70"
                         >
                            {isGenerating ? 'Creating Room...' : 'Start Online Game & Invite'}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <input
                                type="text"
                                readOnly
                                value={inviteLink}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-slate-300 text-center font-mono text-sm"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={copyLink} className="col-span-2 px-4 py-2 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-600/50 border-b-4 border-slate-900 active:scale-95 disabled:opacity-70" disabled={copied}>
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                                <button onClick={shareOnFacebook} className="px-3 py-2 bg-[#1877F2] text-white font-bold rounded-lg hover:bg-[#166fe5] transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/50 border-b-4 border-[#0e5cad] active:scale-95 text-sm">
                                    Facebook
                                </button>
                                <button onClick={shareOnMessenger} className="px-3 py-2 bg-gradient-to-r from-[#00B2FF] to-[#006AFF] text-white font-bold rounded-lg hover:brightness-110 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-500/50 border-b-4 border-[#004CBE] active:scale-95 text-sm">
                                    Messenger
                                </button>
                            </div>
                            <p className="text-xs text-center text-slate-500">You are now hosting an online session.</p>
                        </div>
                    )}
                </div>

                <div className="mt-10 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-600/50 border-b-4 border-slate-900 active:scale-95"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/50 border-b-4 border-emerald-800 active:scale-95"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;