
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

// Icons
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
  </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
);

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSave, currentSettings, onInitializeHost }) => {
    const [settings, setSettings] = useState<GameSettings>(currentSettings);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setSettings(currentSettings);
        if (!isOpen) {
          setInviteLink('');
          setCopied(false);
          setIsGenerating(false);
        }
    }, [currentSettings, isOpen]);

    if (!isOpen) return null;

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
        if (navigator.share) {
            navigator.share({
                title: 'Join my Ludo Game',
                text: 'Come play Ludo with me on Ludo World!',
                url: inviteLink,
            }).catch((error) => console.log('Error sharing', error));
        } else {
             const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
             if (isMobile) {
                  window.location.href = `fb-messenger://share/?link=${encodeURIComponent(inviteLink)}`;
             } else {
                  copyLink();
                  alert("Link copied! Paste it into your Messenger chat.");
             }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-scale-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform transition-transform">
                {/* Modern Navigation Bar Header */}
                <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
                    <div className="w-10"></div> {/* Spacer to balance title */}
                    <div className="text-center">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Settings</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none active:scale-95"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                    {/* Player Names */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Player Profiles</h3>
                        <div className="grid gap-3">
                            {PLAYER_COLORS.map(color => (
                                <div key={color} className="relative group">
                                    <div className="flex items-center shadow-sm rounded-xl bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
                                        <div 
                                            className="w-12 h-12 flex items-center justify-center"
                                            style={{ backgroundColor: PLAYER_CONFIG[color].primary }}
                                        >
                                            <div className="text-white/90">
                                                <UserIcon />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.playerNames[color]}
                                            onChange={(e) => handleNameChange(color, e.target.value)}
                                            placeholder={`Enter ${color} name`}
                                            className="flex-1 bg-transparent border-none px-4 py-3 text-slate-700 font-bold focus:ring-0 placeholder:font-normal placeholder:text-slate-400 text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Online Multiplayer */}
                    <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <LinkIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Play Online</h3>
                                <p className="text-xs text-slate-500 font-medium">Create a room & invite friends</p>
                            </div>
                        </div>
                        
                        {!inviteLink ? (
                            <button 
                                onClick={generateInviteLink} 
                                disabled={isGenerating}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200/50 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Invite Link'
                                )}
                            </button>
                        ) : (
                            <div className="space-y-4 animate-scale-in">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon />
                                    </div>
                                    <input 
                                        readOnly 
                                        value={inviteLink}
                                        className="w-full bg-slate-50 border border-blue-200 text-slate-600 text-xs font-mono rounded-xl py-3 pl-10 pr-20 focus:outline-none focus:border-blue-400"
                                    />
                                    <button 
                                        onClick={copyLink}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-white text-blue-600 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors flex items-center gap-1 shadow-sm"
                                    >
                                        {copied ? 'Copied!' : <><CopyIcon /> Copy</>}
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={shareOnFacebook} className="flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white text-sm font-bold rounded-xl hover:bg-[#166fe5] transition-colors shadow-md shadow-blue-900/10 active:scale-[0.98]">
                                        Facebook
                                    </button>
                                    <button onClick={shareOnMessenger} className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#00B2FF] to-[#006AFF] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20 active:scale-[0.98]">
                                        Messenger
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-slate-100 flex gap-3 flex-shrink-0">
                     <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-400/20 transition-all active:scale-[0.98] text-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
