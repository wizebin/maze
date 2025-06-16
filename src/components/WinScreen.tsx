import React, { useEffect, useState } from 'react';
import type { ChallengeLevel, GameScore } from '../types/maze';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
  shape: 'square' | 'circle' | 'triangle';
}

interface WinScreenProps {
  level: ChallengeLevel;
  time: number;
  moves: number;
  currentScore: number;
  scoreHistory: GameScore[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const CONFETTI_COLORS = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', 
  '#BAE1FF', '#D4B5FF', '#FFB3E6', '#FFC9DE'
];

const FIREWORK_COLORS = [
  '#FF6B7A', '#FFE066', '#66FF66', '#66B3FF', 
  '#B366FF', '#FF66E6'
];

export const WinScreen: React.FC<WinScreenProps> = ({
  level,
  time,
  moves,
  currentScore,
  scoreHistory,
  onPlayAgain,
  onBackToMenu,
}) => {
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [fireworks, setFireworks] = useState<Array<{id: number, x: number, y: number, particles: ConfettiParticle[]}>>([]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLevelScores = () => {
    return scoreHistory
      .filter(score => score.level === level.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const isNewBestScore = () => {
    const levelScores = getLevelScores();
    return levelScores.length === 0 || currentScore > levelScores[0].score;
  };

  const createConfettiParticle = (id: number, x?: number, y?: number): ConfettiParticle => {
    const shapes: Array<'square' | 'circle' | 'triangle'> = ['square', 'circle', 'triangle'];
    return {
      id,
      x: x ?? Math.random() * window.innerWidth,
      y: y ?? -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 2 + 1,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      size: Math.random() * 8 + 4,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  };

  const createFirework = (id: number, x: number, y: number) => {
    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const velocity = Math.random() * 3 + 2;
      particles.push({
        id: i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        rotation: 0,
        rotationSpeed: 0,
        size: Math.random() * 4 + 2,
        shape: 'circle',
      });
    }
    return { id, x, y, particles };
  };

  // Initialize confetti and fireworks
  useEffect(() => {
    // Create initial confetti burst
    const initialConfetti: ConfettiParticle[] = [];
    for (let i = 0; i < 50; i++) {
      initialConfetti.push(createConfettiParticle(i));
    }
    setConfetti(initialConfetti);

    // Create fireworks
    const fireworksArray = [];
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.3) + 100;
        setFireworks(prev => [...prev, createFirework(Date.now() + i, x, y)]);
      }, i * 300);
    }

    // Continue dropping confetti
    const confettiInterval = setInterval(() => {
      setConfetti(prev => {
        const newConfetti = [...prev];
        // Add new particles
        for (let i = 0; i < 3; i++) {
          newConfetti.push(createConfettiParticle(Date.now() + i));
        }
        return newConfetti.slice(-100); // Keep last 100 particles
      });
    }, 200);

    return () => {
      clearInterval(confettiInterval);
    };
  }, []);

  // Animate particles
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setConfetti(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            rotation: particle.rotation + particle.rotationSpeed,
          }))
          .filter(particle => particle.y < window.innerHeight + 50)
      );

      setFireworks(prev => 
        prev
          .map(firework => ({
            ...firework,
            particles: firework.particles
              .map(particle => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                vy: particle.vy + 0.05,
                vx: particle.vx * 0.99,
                size: particle.size * 0.98,
              }))
              .filter(particle => particle.size > 0.5 && particle.y < window.innerHeight + 50)
          }))
          .filter(firework => firework.particles.length > 0)
      );
    }, 16);

    return () => clearInterval(animationFrame);
  }, []);

  const renderParticle = (particle: ConfettiParticle) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.color,
      transform: `rotate(${particle.rotation}deg)`,
      pointerEvents: 'none',
    };

    switch (particle.shape) {
      case 'circle':
        style.borderRadius = '50%';
        break;
      case 'triangle':
        style.width = 0;
        style.height = 0;
        style.backgroundColor = 'transparent';
        style.borderLeft = `${particle.size / 2}px solid transparent`;
        style.borderRight = `${particle.size / 2}px solid transparent`;
        style.borderBottom = `${particle.size}px solid ${particle.color}`;
        break;
      default: // square
        break;
    }

    return <div key={particle.id} style={style} />;
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#FFE5F1',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Confetti and Fireworks */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {confetti.map(renderParticle)}
        {fireworks.flatMap(firework => firework.particles.map(renderParticle))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1
          style={{
            color: '#9B7AA8',
            marginBottom: '40px',
            fontSize: '48px',
            fontWeight: '300',
            letterSpacing: '3px',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          🎉 {isNewBestScore() ? 'NEW BEST SCORE!' : 'Level Complete!'}
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            maxWidth: '800px',
            width: '100%',
          }}
        >
          {/* Current Score Card */}
          <div
            style={{
              backgroundColor: '#FFF5E6',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              border: isNewBestScore() ? '3px solid #FFD700' : '2px solid #D4B5FF',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#9B7AA8', marginBottom: '24px', fontSize: '24px' }}>
              {level.name}
            </h2>
            
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Time:</strong> {formatTime(time)}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Moves:</strong> {moves}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Target:</strong> {level.optimalMoves} moves
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Efficiency:</strong> {((level.optimalMoves / moves) * 100).toFixed(1)}%
              </div>
            </div>

            <div
              style={{
                fontSize: '32px',
                color: isNewBestScore() ? '#FFD700' : '#4A7C59',
                fontWeight: 'bold',
                backgroundColor: isNewBestScore() ? '#FFF9C4' : '#BAFFC9',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                textShadow: isNewBestScore() ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {Math.round(currentScore).toLocaleString()}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={onPlayAgain}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#9B7AA8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#8A6B97';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#9B7AA8';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Play Again
              </button>
              <button
                onClick={onBackToMenu}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#FFB3BA',
                  color: '#8B0000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFA0A9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFB3BA';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Main Menu
              </button>
            </div>
          </div>

          {/* High Scores Card */}
          <div
            style={{
              backgroundColor: '#F5E6FF',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              border: '2px solid #D4B5FF',
            }}
          >
            <h3 style={{ color: '#9B7AA8', marginBottom: '24px', fontSize: '20px', textAlign: 'center' }}>
              High Scores
            </h3>

            {getLevelScores().length > 0 ? (
              <div style={{ fontSize: '14px' }}>
                {getLevelScores().map((score, index) => {
                  const isCurrentScore = Math.abs(score.score - currentScore) < 0.001 && 
                                        Math.abs(score.time - time) < 1000;
                  return (
                    <div
                      key={score.timestamp}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: isCurrentScore ? '#BAFFC9' : 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '8px',
                        border: isCurrentScore ? '2px solid #4A7C59' : '1px solid rgba(155, 122, 168, 0.2)',
                        fontWeight: isCurrentScore ? 'bold' : 'normal',
                        color: isCurrentScore ? '#4A7C59' : '#666',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '18px',
                          color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#9B7AA8'
                        }}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span>{Math.round(score.score).toLocaleString()}</span>
                        {isCurrentScore && <span style={{ fontSize: '12px' }}>← NEW!</span>}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '12px', opacity: 0.8 }}>
                        <div>{formatTime(score.time)}</div>
                        <div>{score.moves} moves</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                This is your first completion!
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            color: '#9B7AA8',
            fontSize: '14px',
          }}
        >
          <p>Score = (Optimal Moves ÷ (Your Moves × Time in seconds)) × 10,000</p>
          <p>Press Escape to return to menu</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .new-best {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};