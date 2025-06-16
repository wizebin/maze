import React from 'react';
import type { ChallengeLevel, GameScore } from '../types/maze';

interface StartScreenProps {
  challengeLevels: ChallengeLevel[];
  scoreHistory: GameScore[];
  onStartGame: (level: ChallengeLevel) => void;
  onOpenSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  challengeLevels,
  scoreHistory,
  onStartGame,
  onOpenSettings,
}) => {
  const getBestScore = (levelId: string) => {
    const levelScores = scoreHistory.filter(score => score.level === levelId);
    return levelScores.length > 0 
      ? Math.max(...levelScores.map(score => score.score))
      : null;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFE5F1',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ width: '60px' }}></div> {/* Spacer for centering */}
        <h1
          style={{
            color: '#9B7AA8',
            fontSize: '48px',
            fontWeight: '300',
            letterSpacing: '3px',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Maze Runner
        </h1>
        <button
          onClick={onOpenSettings}
          style={{
            padding: '12px 16px',
            backgroundColor: '#E6F7FF',
            color: '#5B8DB8',
            border: '2px solid #B3D9FF',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#D1ECFF';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#E6F7FF';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ⚙️ Settings
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          maxWidth: '1400px',
          width: '100%',
          marginBottom: '60px',
        }}
      >
        {challengeLevels.map((level) => {
          const bestScore = getBestScore(level.id);
          const bestScoreData = scoreHistory
            .filter(score => score.level === level.id)
            .find(score => score.score === bestScore);

          return (
            <div
              key={level.id}
              style={{
                backgroundColor: '#FFF5E6',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '2px solid #D4B5FF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => onStartGame(level)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h3
                style={{
                  color: '#9B7AA8',
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                }}
              >
                {level.name}
              </h3>
              
              <p
                style={{
                  color: '#666',
                  fontSize: '14px',
                  marginBottom: '16px',
                  lineHeight: '1.4',
                }}
              >
                {level.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#9B7AA8',
                }}
              >
                <span>Size: {level.width}×{level.height}</span>
                <span>Target: {level.optimalMoves} moves</span>
              </div>

              {bestScore && bestScoreData && (
                <div
                  style={{
                    backgroundColor: '#BAFFC9',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#4A7C59',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    Best Score: {Math.round(bestScore).toLocaleString()}
                  </div>
                  <div>
                    Time: {formatTime(bestScoreData.time)} • Moves: {bestScoreData.moves}
                  </div>
                </div>
              )}

              {!bestScore && (
                <div
                  style={{
                    backgroundColor: '#FFE5B3',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#B8860B',
                    textAlign: 'center',
                  }}
                >
                  Not completed yet!
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '20px',
          marginBottom: '40px',
          textAlign: 'center',
          color: '#9B7AA8',
          fontSize: '14px',
          paddingBottom: '20px',
        }}
      >
        <p>Score = (Optimal Moves ÷ (Your Moves × Time in seconds)) × 10,000</p>
        <p>Higher scores are better!</p>
      </div>
    </div>
  );
};