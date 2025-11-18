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
        backgroundColor: '#382e2e', // Dark wood color
        borderRadius: '50%',
        boxShadow: 'inset 0 0 2px rgba(0,0,0,0.3)',
    };
    
    const renderDots = () => {
        switch (face) {
            case 1:
                return <span style={dotStyle} className="col-start-2 row-start-2"></span>;
            case 2:
                return (
                    <>
                        <span style={dotStyle} className="col-start-1 row-start-1"></span>
                        <span style={dotStyle} className="col-start-3 row-start-3"></span>
                    </>
                );
            case 3:
                return (
                    <>
                        <span style={dotStyle} className="col-start-1 row-start-1"></span>
                        <span style={dotStyle} className="col-start-2 row-start-2"></span>
                        <span style={dotStyle} className="col-start-3 row-start-3"></span>
                    </>
                );
            case 4:
                return (
                    <>
                        <span style={dotStyle} className="col-start-1 row-start-1"></span>
                        <span style={dotStyle} className="col-start-3 row-start-1"></span>
                        <span style={dotStyle} className="col-start-1 row-start-3"></span>
                        <span style={dotStyle} className="col-start-3 row-start-3"></span>
                    </>
                );
            case 5:
                return (
                    <>
                        <span style={dotStyle} className="col-start-1 row-start-1"></span>
                        <span style={dotStyle} className="col-start-3 row-start-1"></span>
                        <span style={dotStyle} className="col-start-2 row-start-2"></span>
                        <span style={dotStyle} className="col-start-1 row-start-3"></span>
                        <span style={dotStyle} className="col-start-3 row-start-3"></span>
                    </>
                );
            case 6:
                return (
                    <>
                        <span style={dotStyle} className="col-start-1 row-start-1"></span>
                        <span style={dotStyle} className="col-start-3 row-start-1"></span>
                        <span style={dotStyle} className="col-start-1 row-start-2"></span>
                        <span style={dotStyle} className="col-start-3 row-start-2"></span>
                        <span style={dotStyle} className="col-start-1 row-start-3"></span>
                        <span style={dotStyle} className="col-start-3 row-start-3"></span>
                    </>
                );
            default:
                return null;
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
    const dotSize = size / 6.5;

    // Corrected rotations to ensure the rolled number faces the camera.
    // Based on standard CSS cube transforms:
    // 1 (Front) -> 0,0
    // 2 (Bottom, X -90) -> needs X +90 to face front
    // 3 (Left, Y -90) -> needs Y +90 to face front
    // 4 (Right, Y 90) -> needs Y -90 to face front
    // 5 (Top, X 90) -> needs X -90 to face front
    // 6 (Back, Y 180) -> needs Y 180 to face front
    const correctedRotations: Record<number, string> = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateX(90deg) rotateY(0deg)', 
        3: 'rotateX(0deg) rotateY(90deg)', 
        4: 'rotateX(0deg) rotateY(-90deg)', 
        5: 'rotateX(-90deg) rotateY(0deg)', 
        6: 'rotateX(0deg) rotateY(180deg)',
    };
    

    const transform = value && !isRolling ? correctedRotations[value] : undefined;
    
    const faceBaseStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        backgroundColor: '#fefce8', // Ivory
        borderRadius: '15%',
        border: '1px solid rgba(0, 0, 0, 0.1)',
    };
    
    const faceTransforms: Record<string, React.CSSProperties> = {
        front:  { transform: `translateZ(${translateZ}px)` }, // 1
        back:   { transform: `rotateY(180deg) translateZ(${translateZ}px)` }, // 6
        right:  { transform: `rotateY(90deg) translateZ(${translateZ}px)` }, // 4
        left:   { transform: `rotateY(-90deg) translateZ(${translateZ}px)` }, // 3
        top:    { transform: `rotateX(90deg) translateZ(${translateZ}px)` }, // 5
        bottom: { transform: `rotateX(-90deg) translateZ(${translateZ}px)` } // 2
    };

    return (
        <div style={{ width: size, height: size, perspective: '1000px' }} className="flex items-center justify-center">
            <div
                className={`relative ${isRolling ? 'dice-rolling' : ''}`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 1s cubic-bezier(.45, .05, .55, .95)',
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