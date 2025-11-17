import React from 'react';

interface RulesProps {
    isOpen: boolean;
    onClose: () => void;
}

const Rules: React.FC<RulesProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#fefce8] text-amber-900/90 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-amber-800/20">
                <h2 className="text-3xl font-bold mb-6 text-center text-amber-900">Ludo Game Rules</h2>
                
                <div className="space-y-6 pr-2">
                    <div>
                        <h3 className="text-xl font-semibold text-amber-700 mb-2">The Goal</h3>
                        <p>The goal is to get all four of your pieces from your starting base, around the entire board, and into your home triangle before anyone else.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-amber-700 mb-2">1. Getting Started</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Roll a 6 to Start:</strong> You must roll a 6 to move a piece from your base onto your starting square on the main track.</li>
                            <li><strong>Extra Turn on 6:</strong> Rolling a 6 gives you an extra roll.</li>
                            <li><strong>Three 6s Penalty:</strong> If you roll three 6s in a row, your turn is skipped.</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold text-amber-700 mb-2">2. Moving Your Pieces</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Clockwise Movement:</strong> Pieces move clockwise around the board.</li>
                            <li><strong>Choose a Piece:</strong> After rolling, you can move any one of your active pieces the number of spaces shown on the die.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-amber-700 mb-2">3. Capturing and Safety</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Capturing:</strong> If you land on a square occupied by an opponent's piece, their piece is sent back to their base. They must roll a 6 to bring it back out.</li>
                            <li><strong>Capture Bonus:</strong> Capturing an opponent's piece gives you an extra roll.</li>
                            <li><strong>Safe Squares:</strong> Squares marked with a star (⭐️) are safe zones. Pieces on these squares cannot be captured.</li>
                            <li><strong>Blocks:</strong> If two of your own pieces occupy the same square, they form a block. Opponents cannot land on or pass over a block.</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold text-amber-700 mb-2">4. Winning the Game</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Home Column:</strong> After a full lap, your piece enters its colored home column. Opponents cannot enter your home column.</li>
                            <li><strong>Exact Roll Needed:</strong> To get a piece into the final home triangle, you must roll the exact number of spaces required. If the roll is too high, you cannot move that piece.</li>
                            <li><strong>Winner:</strong> The first player to get all four pieces into their home triangle wins!</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-amber-600 text-white font-bold rounded-lg transition-colors hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50 border-b-4 border-amber-800 active:scale-95"
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Rules;
