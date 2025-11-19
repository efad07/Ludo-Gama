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
        backgroundColor: '#00f0ff', // Cyan neon dots
        borderRadius: '50%',
        boxShadow: '0 0 5px #00f0ff, 0 0 10px #00f0ff', // Glowing dots
    };
    
    const renderDots = () => {
        switch (face) {
            case 1: return <span style={dotStyle} className="col-start-2 row-start-2"></span>;
            case 2: return <><span style={dotStyle} className="col-start-1 row-start-1"></span><span style={dotStyle} className="col-start-3 row-start-3"></span></>;
            case 3: return <><span style={dotStyle} className="col-start-1 row-start-1"></span><span style={dotStyle} className="col-start-2 row-start-2"></span><span style={dotStyle} className="col-start-3 row-start-3"></span></>;
            case 4: return <><span style={dotStyle} className="col-start-1 row-start-1"></span><span style={dotStyle} className="col-start-3 row-start-1"></span><span style={dotStyle} className="col-start-1 row-start-3"></span><span style={dotStyle} className="col-start-3 row-start-3"></span></>;
            case 5: return <><span style={dotStyle} className="col-start-1 row-start-1"></span><span style={dotStyle} className="col-start-3 row-start-1"></span><span style={dotStyle} className="col-start-2 row-start-2"></span><span style={dotStyle} className="col-start-1 row-start-3"></span><span style={dotStyle} className="col-start-3 row-start-3"></span></>;
            case 6: return <><span style={dotStyle} className="col-start-1 row-start-1"></span><span style={dotStyle} className="col-start-3 row-start-1"></span><span style={dotStyle} className="col-start-1 row-start-2"></span><span style={dotStyle} className="col-start-3 row-start-2"></span><span style={dotStyle} className="col-start-1 row-start-3"></span><span style={dotStyle} className="col-start-3 row-start-3"></span></>;
            default: return null;
        }
    };

    return (
        <div className="w-full h-full p-1 grid grid-cols-3 grid-rows-3 place-items-center">
            {renderDots()}
        </div>
    );
};

const Dice: React.FC<DiceProps> = ({ value, isRolling, size = 50 }) => {
    const translateZ = size / 2;
    const dotSize = size / 6;

    const correctedRotations: Record<number, string> = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateX(90deg) rotateY(0deg)', 
        3: 'rotateX(0deg) rotateY(90deg)', 
        4: 'rotateX(0deg) rotateY(-90deg)', 
        5: 'rotateX(-90deg) rotateY(0deg)', 
        6: 'rotateX(0deg) rotateY(180deg)',
    };

    const transform = value && !isRolling ? correctedRotations[value] : undefined;
    
    // Solid Cyberpunk look - No Transparency
    const faceBaseStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden', // Hides the back of the face for a solid look
        backgroundColor: '#0f172a', // Solid Dark Slate (matches app theme)
        borderRadius: '8px',
        border: '2px solid #00f0ff', // Solid neon border
        boxShadow: '0 0 15px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1)', // Outer and inner glow
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
                    transition: 'transform 0.6s cubic-bezier(.34,1.56,.64,1)',
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
        </div>
    );
};

export default Dice;