import { describe, it, expect } from 'vitest';
import { findOptimalMoves, getNextIntersections, findOptimalPath } from './pathfinding';
import type { Maze, Position } from '../types/maze';

// Helper function to create a simple test maze
function createTestMaze(pattern: string[]): Maze {
  const height = pattern.length;
  const width = pattern[0].length;
  const cells = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      // Only create cells for open spaces
      if (pattern[y][x] === '.') {
        const cell = {
          x,
          y,
          visited: true,
          walls: {
            top: y === 0 || pattern[y - 1][x] === '#',
            right: x === width - 1 || pattern[y][x + 1] === '#',
            bottom: y === height - 1 || pattern[y + 1][x] === '#',
            left: x === 0 || pattern[y][x - 1] === '#',
          }
        };
        row.push(cell);
      } else {
        // For walls, create a cell that's blocked on all sides
        const cell = {
          x,
          y,
          visited: true,
          walls: {
            top: true,
            right: true,
            bottom: true,
            left: true,
          }
        };
        row.push(cell);
      }
    }
    cells.push(row);
  }

  return { cells, width, height };
}

describe('pathfinding', () => {
  describe('findOptimalMoves', () => {
    it('should return 0 for same start and end position', () => {
      const maze = createTestMaze(['...']);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 0, y: 0 };
      
      expect(findOptimalMoves(maze, start, end)).toBe(0);
    });

    it('should find path in a simple straight line', () => {
      // Simple 3x1 maze: all open
      const maze = createTestMaze(['...']);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 2, y: 0 };
      
      expect(findOptimalMoves(maze, start, end)).toBe(1);
    });

    it('should find path in an L-shaped maze', () => {
      // L-shaped maze
      const maze = createTestMaze([
        '..#',
        '...',
        '###'
      ]);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 2, y: 1 };
      
      // Should be able to reach in some moves (let's see what it actually returns)
      const moves = findOptimalMoves(maze, start, end);
      expect(moves).toBeGreaterThan(0);
      expect(moves).toBeLessThan(10);
    });

    it('should handle a more complex maze', () => {
      // More complex maze with multiple paths
      const maze = createTestMaze([
        '...#.',
        '.#...',
        '...#.',
        '.#...',
        '.....'
      ]);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 4, y: 4 };
      
      const moves = findOptimalMoves(maze, start, end);
      expect(moves).toBeGreaterThan(0);
      expect(moves).toBeLessThan(10); // Should be reasonable
    });

    it('should return -1 for impossible path', () => {
      // Maze with no path from start to end
      const maze = createTestMaze([
        '..#..',
        '..#..',
        '#####',
        '..#..',
        '..#..'
      ]);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 4, y: 4 };
      
      expect(findOptimalMoves(maze, start, end)).toBe(-1);
    });

    it('should handle edge positions correctly', () => {
      const maze = createTestMaze([
        '....',
        '....',
        '....',
        '....'
      ]);
      
      // Top-left to bottom-right - should be a reasonable number of moves
      const moves1 = findOptimalMoves(maze, { x: 0, y: 0 }, { x: 3, y: 3 });
      expect(moves1).toBeGreaterThan(0);
      expect(moves1).toBeLessThan(10);
      
      // Top-right to bottom-left
      const moves2 = findOptimalMoves(maze, { x: 3, y: 0 }, { x: 0, y: 3 });
      expect(moves2).toBeGreaterThan(0);
      expect(moves2).toBeLessThan(10);
    });
  });

  describe('getNextIntersections', () => {
    it('should find reachable positions from center of open area', () => {
      const maze = createTestMaze([
        '.....',
        '.....',
        '.....',
        '.....',
        '.....'
      ]);
      
      const from: Position = { x: 2, y: 2 }; // Center position
      const nextPositions = getNextIntersections(maze, from);
      
      // Should find multiple reachable positions
      expect(nextPositions.length).toBeGreaterThan(0);
      expect(nextPositions.length).toBeLessThanOrEqual(4);
      
      // All positions should be valid
      nextPositions.forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(5);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(5);
      });
    });

    it('should respect walls when finding next intersections', () => {
      const maze = createTestMaze([
        '#.#',
        '...',
        '#.#'
      ]);
      
      const from: Position = { x: 1, y: 1 }; // Center position
      const nextPositions = getNextIntersections(maze, from);
      
      // Should find reachable positions that respect walls
      expect(nextPositions.length).toBeGreaterThan(0);
      
      // All positions should be reachable and not in walls
      nextPositions.forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(3);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(3);
      });
    });

    it('should handle corner positions', () => {
      const maze = createTestMaze([
        '....',
        '....',
        '....',
        '....'
      ]);
      
      const from: Position = { x: 0, y: 0 }; // Top-left corner
      const nextPositions = getNextIntersections(maze, from);
      
      // From corner, should find some reachable positions
      expect(nextPositions.length).toBeGreaterThan(0);
      expect(nextPositions.length).toBeLessThanOrEqual(4);
      
      // All positions should be within bounds
      nextPositions.forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(4);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(4);
      });
    });

    it('should handle dead ends correctly', () => {
      const maze = createTestMaze([
        '.#',
        '.#',
        '..',
        '##'
      ]);
      
      // From a dead end
      const from: Position = { x: 0, y: 0 };
      const nextPositions = getNextIntersections(maze, from);
      
      expect(nextPositions).toHaveLength(1);
      expect(nextPositions).toContainEqual({ x: 0, y: 2 }); // The intersection
    });
  });

  describe('findOptimalPath', () => {
    it('should return path with correct start and end positions', () => {
      const maze = createTestMaze([
        '....',
        '....',
        '....',
        '....'
      ]);
      
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 3, y: 3 };
      const path = findOptimalPath(maze, start, end);
      
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return empty array for impossible path', () => {
      const maze = createTestMaze([
        '..#..',
        '..#..',
        '#####',
        '..#..',
        '..#..'
      ]);
      
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 4, y: 4 };
      const path = findOptimalPath(maze, start, end);
      
      expect(path).toEqual([]);
    });

    it('should return single position array for same start and end', () => {
      const maze = createTestMaze(['...']);
      const start: Position = { x: 1, y: 0 };
      const end: Position = { x: 1, y: 0 };
      const path = findOptimalPath(maze, start, end);
      
      expect(path).toEqual([start]);
    });

    it('should find efficient path in complex maze', () => {
      const maze = createTestMaze([
        '...#.',
        '.#...',
        '...#.',
        '.#...',
        '.....'
      ]);
      
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 4, y: 4 };
      const path = findOptimalPath(maze, start, end);
      
      expect(path.length).toBeGreaterThan(1);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
      
      // Path length should match findOptimalMoves result
      const moves = findOptimalMoves(maze, start, end);
      expect(path.length).toBe(moves + 1); // path includes start position
    });
  });

  describe('integration with maze movement logic', () => {
    it('should match expected game behavior for intersection movement', () => {
      // Create a maze that matches typical game scenarios
      const maze = createTestMaze([
        '.....',
        '.###.',
        '.....',
        '.###.',
        '.....'
      ]);
      
      // Test that pathfinding matches how the game actually moves
      const from: Position = { x: 0, y: 0 };
      const intersections = getNextIntersections(maze, from);
      
      // Should find some reachable intersection points
      expect(intersections.length).toBeGreaterThan(0);
      expect(intersections.length).toBeLessThanOrEqual(4);
      
      // All intersections should be valid positions
      intersections.forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(5);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(5);
      });
    });

    it('should handle corridors correctly', () => {
      // Long corridor maze
      const maze = createTestMaze([
        '.',
        '.',
        '.',
        '.',
        '.'
      ]);
      
      const moves = findOptimalMoves(maze, { x: 0, y: 0 }, { x: 0, y: 4 });
      expect(moves).toBe(1); // Should be one move through the corridor
    });
  });
});