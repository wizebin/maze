import React from 'react';
import type { GameScore } from '../types/maze';

interface SettingsScreenProps {
  scoreHistory: GameScore[];
  onClearScores: () => void;
  onBackToMenu: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  scoreHistory,
  onClearScores,
  onBackToMenu,
}) => {
  const totalGames = scoreHistory.length;
  const totalTime = scoreHistory.reduce((sum, score) => sum + score.time, 0);
  const averageScore = totalGames > 0 
    ? scoreHistory.reduce((sum, score) => sum + score.score, 0) / totalGames 
    : 0;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleClearScores = () => {
    if (window.confirm('Are you sure you want to clear all high scores? This action cannot be undone.')) {
      onClearScores();
    }
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
      <h1
        style={{
          color: '#9B7AA8',
          marginBottom: '40px',
          fontSize: '48px',
          fontWeight: '300',
          letterSpacing: '3px',
          textAlign: 'center',
        }}
      >
        Settings
      </h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          maxWidth: '600px',
          width: '100%',
          marginBottom: '40px',
        }}
      >
        {/* Statistics Card */}
        <div
          style={{
            backgroundColor: '#FFF5E6',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #D4B5FF',
          }}
        >
          <h2
            style={{
              color: '#9B7AA8',
              marginBottom: '24px',
              fontSize: '24px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            📊 Game Statistics
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '16px',
              color: '#666',
            }}
          >
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9B7AA8', marginBottom: '8px' }}>
                {totalGames}
              </div>
              <div>Games Played</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9B7AA8', marginBottom: '8px' }}>
                {formatTotalTime(totalTime)}
              </div>
              <div>Total Time</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9B7AA8', marginBottom: '8px' }}>
                {Math.round(averageScore).toLocaleString()}
              </div>
              <div>Average Score</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9B7AA8', marginBottom: '8px' }}>
                {new Set(scoreHistory.map(s => s.level)).size}
              </div>
              <div>Levels Completed</div>
            </div>
          </div>
        </div>

        {/* Data Management Card */}
        <div
          style={{
            backgroundColor: '#F5E6FF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #D4B5FF',
          }}
        >
          <h2
            style={{
              color: '#9B7AA8',
              marginBottom: '24px',
              fontSize: '24px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            🗂️ Data Management
          </h2>

          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                color: '#666',
                marginBottom: '24px',
                lineHeight: '1.5',
              }}
            >
              Your high scores are automatically saved to your browser's local storage. 
              You can clear all scores if you want to start fresh.
            </p>

            <button
              onClick={handleClearScores}
              disabled={totalGames === 0}
              style={{
                padding: '12px 24px',
                backgroundColor: totalGames === 0 ? '#ccc' : '#FF6B7A',
                color: totalGames === 0 ? '#999' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: totalGames === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (totalGames > 0) {
                  e.currentTarget.style.backgroundColor = '#FF5566';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (totalGames > 0) {
                  e.currentTarget.style.backgroundColor = '#FF6B7A';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {totalGames === 0 ? 'No Scores to Clear' : 'Clear All High Scores'}
            </button>

            {totalGames > 0 && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#999',
                  marginTop: '12px',
                  fontStyle: 'italic',
                }}
              >
                This will permanently delete all {totalGames} recorded scores
              </p>
            )}
          </div>
        </div>

        {/* About Card */}
        <div
          style={{
            backgroundColor: '#E6F7FF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #B3D9FF',
          }}
        >
          <h2
            style={{
              color: '#5B8DB8',
              marginBottom: '24px',
              fontSize: '24px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            🎮 About Maze Runner
          </h2>

          <div
            style={{
              color: '#666',
              lineHeight: '1.6',
              textAlign: 'center',
            }}
          >
            <p style={{ marginBottom: '16px' }}>
              Navigate through procedurally generated mazes using arrow keys. 
              Move from intersection to intersection to reach the goal as efficiently as possible.
            </p>
            <p style={{ marginBottom: '16px' }}>
              <strong>Scoring:</strong> Higher scores reward speed and efficiency. 
              Try to match the optimal path while minimizing time.
            </p>
            <p>
              <strong>Controls:</strong> Arrow keys to move, R to restart, Escape for menu
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={onBackToMenu}
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
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};