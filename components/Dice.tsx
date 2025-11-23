
import React from 'react';

interface DiceProps {
    value: number | null;
    isRolling: boolean;
    size?: number;
}

const DiceFace: React.FC<{ face: number; dotSize: number }> = ({ face, dotSize }) => {
    const dotStyle: React.CSSProperties = {
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        borderRadius: '50%',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.5)', // Deep inset look
    };
    
    const blackDot = { ...dotStyle, backgroundColor: '#0f172a' }; // Deep Slate
    const redDot = { ...dotStyle, backgroundColor: '#dc2626', width: dotSize * 1.3, height: dotSize * 1.3 }; // Vibrant Red

    const renderDots = () => {
        switch (face) {
            case 1: return <span style={redDot} className="col-start-2 row-start-2"></span>;
            case 2: return <><span style={blackDot} className="col-start-1 row-start-1"></span><span style={blackDot} className="col-start-3 row-start-3"></span></>;
            case 3: return <><span style={blackDot} className="col-start-1 row-start-1"></span><span style={blackDot} className="col-start-2 row-start-2"></span><span style={blackDot} className="col-start-3 row-start-3"></span></>;
            case 4: return <><span style={blackDot} className="col-start-1 row-start-1"></span><span style={blackDot} className="col-start-3 row-start-1"></span><span style={blackDot} className="col-start-1 row-start-3"></span><span style={blackDot} className="col-start-3 row-start-3"></span></>;
            case 5: return <><span style={blackDot} className="col-start-1 row-start-1"></span><span style={blackDot} className="col-start-3 row-start-1"></span><span style={blackDot} className="col-start-2 row-start-2"></span><span style={blackDot} className="col-start-1 row-start-3"></span><span style={blackDot} className="col-start-3 row-start-3"></span></>;
            case 6: return <><span style={blackDot} className="col-start-1 row-start-1"></span><span style={blackDot} className="col-start-3 row-start-1"></span><span style={blackDot} className="col-start-1 row-start-2"></span><span style={blackDot} className="col-start-3 row-start-2"></span><span style={blackDot} className="col-start-1 row-start-3"></span><span style={blackDot} className="col-start-3 row-start-3"></span></>;
            default: return null;
        }
    };

    return (
        <div className="w-full h-full p-1.5 grid grid-cols-3 grid-rows-3 place-items-center">
            {renderDots()}
        </div>
    );
};

const Dice: React.FC<DiceProps> = ({ value, isRolling, size = 50 }) => {
    const translateZ = size / 2;
    const dotSize = size / 5.5;

    const correctedRotations: Record<number, string> = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateX(90deg) rotateY(0deg)', 
        3: 'rotateX(0deg) rotateY(90deg)', 
        4: 'rotateX(0deg) rotateY(-90deg)', 
        5: 'rotateX(-90deg) rotateY(0deg)', 
        6: 'rotateX(0deg) rotateY(180deg)',
    };

    const transform = value && !isRolling ? correctedRotations[value] : 'rotateX(-25deg) rotateY(-25deg)';
    
    // Realistic Plastic Look
    const faceBaseStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)', // Subtle gradient
        borderRadius: '16%', // Smooth rounded corners
        boxShadow: 'inset 0 0 12px rgba(0,0,0,0.15)', // Inner shadow for depth
        border: '1px solid #cbd5e1',
    };
    
    const faceTransforms: Record<string, React.CSSProperties> = {
        front:  { transform: `translateZ(${translateZ}px)` },
        back:   { transform: `rotateY(180deg) translateZ(${translateZ}px)` },
        right:  { transform: `rotateY(90deg) translateZ(${translateZ}px)` },
        left:   { transform: `rotateY(-90deg) translateZ(${translateZ}px)` },
        top:    { transform: `rotateX(90deg) translateZ(${translateZ}px)` },
        bottom: { transform: `rotateX(-90deg) translateZ(${translateZ}px)` }
    };

    return (
        <div style={{ width: size, height: size, perspective: '800px' }} className="flex items-center justify-center">
            <div
                className={`relative ${isRolling ? 'dice-rolling' : ''}`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy transition
                    transform: transform,
                }}
            >
                <div style={{...faceBaseStyle, ...faceTransforms.front}}><DiceFace face={1} dotSize={dotSize}/></div>
                <div style={{...faceBaseStyle, ...faceTransforms.bottom}}><DiceFace face={2} dotSize={dotSize}/></div>
                <div style={{...faceBaseStyle, ...faceTransforms.left}}><DiceFace face={3} dotSize={dotSize}/></div>
                <div style={{...faceBaseStyle, ...faceTransforms.right}}><DiceFace face={4} dotSize={dotSize}/></div>
                <div style={{...faceBaseStyle, ...faceTransforms.top}}><DiceFace face={5} dotSize={dotSize}/></div>
                <div style={{...faceBaseStyle, ...faceTransforms.back}}><DiceFace face={6} dotSize={dotSize}/></div>
            </div>
             {/* Shadow below dice */}
             <div className="absolute -bottom-4 w-[80%] h-2 bg-black/20 blur-md rounded-full transform scale-x-75 transition-all duration-300"></div>
        </div>
    );
};

export default Dice;
