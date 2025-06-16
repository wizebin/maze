import type { Maze, Position } from '../types/maze';

interface PathNode {
  position: Position;
  distance: number;
  parent?: PathNode;
}

/**
 * Finds the shortest path between two points in a maze using BFS
 * Returns the number of moves required (intersection to intersection)
 */
export function findOptimalMoves(
  maze: Maze, 
  start: Position, 
  end: Position
): number {
  if (start.x === end.x && start.y === end.y) {
    return 0;
  }

  const visited = new Set<string>();
  const queue: PathNode[] = [{ position: start, distance: 0 }];
  
  const getKey = (pos: Position) => `${pos.x},${pos.y}`;
  visited.add(getKey(start));

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Get all possible moves from current position to next intersection
    const nextPositions = getNextIntersections(maze, current.position);
    
    for (const nextPos of nextPositions) {
      const key = getKey(nextPos);
      
      if (visited.has(key)) {
        continue;
      }
      
      visited.add(key);
      
      if (nextPos.x === end.x && nextPos.y === end.y) {
        return current.distance + 1;
      }
      
      queue.push({
        position: nextPos,
        distance: current.distance + 1,
        parent: current,
      });
    }
  }
  
  return -1; // No path found
}

/**
 * Gets all possible intersection positions reachable from the current position
 * This matches the game's movement logic where you move to the next intersection
 */
export function getNextIntersections(maze: Maze, from: Position): Position[] {
  const directions = [
    { dx: 0, dy: -1, wall: 'top' },    // up
    { dx: 1, dy: 0, wall: 'right' },   // right
    { dx: 0, dy: 1, wall: 'bottom' },  // down
    { dx: -1, dy: 0, wall: 'left' },   // left
  ] as const;

  const nextPositions: Position[] = [];

  for (const direction of directions) {
    const nextIntersection = findNextIntersectionInDirection(maze, from, direction);
    if (nextIntersection && 
        (nextIntersection.x !== from.x || nextIntersection.y !== from.y)) {
      nextPositions.push(nextIntersection);
    }
  }

  return nextPositions;
}

/**
 * Finds the next intersection in a specific direction
 * This replicates the game's movement logic
 */
function findNextIntersectionInDirection(
  maze: Maze, 
  start: Position, 
  direction: { dx: number; dy: number; wall: 'top' | 'right' | 'bottom' | 'left' }
): Position | null {
  let currentX = start.x;
  let currentY = start.y;
  
  while (true) {
    const currentCell = maze.cells[currentY]?.[currentX];
    if (!currentCell) {
      break;
    }

    // Check if we can move in the requested direction
    let canMove = false;
    let nextX = currentX;
    let nextY = currentY;
    
    switch (direction.wall) {
      case 'top':
        if (!currentCell.walls.top && currentY > 0) {
          nextY = currentY - 1;
          canMove = true;
        }
        break;
      case 'right':
        if (!currentCell.walls.right && currentX < maze.width - 1) {
          nextX = currentX + 1;
          canMove = true;
        }
        break;
      case 'bottom':
        if (!currentCell.walls.bottom && currentY < maze.height - 1) {
          nextY = currentY + 1;
          canMove = true;
        }
        break;
      case 'left':
        if (!currentCell.walls.left && currentX > 0) {
          nextX = currentX - 1;
          canMove = true;
        }
        break;
    }
    
    if (!canMove) {
      break;
    }
    
    currentX = nextX;
    currentY = nextY;
    
    // Check if we've reached an intersection or dead end
    const cell = maze.cells[currentY][currentX];
    const openPaths = [
      !cell.walls.top && currentY > 0,
      !cell.walls.right && currentX < maze.width - 1,
      !cell.walls.bottom && currentY < maze.height - 1,
      !cell.walls.left && currentX > 0
    ].filter(Boolean).length;
    
    // Stop at intersections (3+ paths) or dead ends (1 path), 
    // but continue through corridors (2 paths)
    if (openPaths !== 2) {
      break;
    }
  }
  
  return { x: currentX, y: currentY };
}

/**
 * Reconstructs the full path from BFS result
 * Useful for debugging and visualization
 */
export function findOptimalPath(
  maze: Maze, 
  start: Position, 
  end: Position
): Position[] {
  if (start.x === end.x && start.y === end.y) {
    return [start];
  }

  const visited = new Set<string>();
  const queue: PathNode[] = [{ position: start, distance: 0 }];
  
  const getKey = (pos: Position) => `${pos.x},${pos.y}`;
  visited.add(getKey(start));

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    const nextPositions = getNextIntersections(maze, current.position);
    
    for (const nextPos of nextPositions) {
      const key = getKey(nextPos);
      
      if (visited.has(key)) {
        continue;
      }
      
      visited.add(key);
      
      const newNode: PathNode = {
        position: nextPos,
        distance: current.distance + 1,
        parent: current,
      };
      
      if (nextPos.x === end.x && nextPos.y === end.y) {
        // Reconstruct path
        const path: Position[] = [];
        let node: PathNode | undefined = newNode;
        while (node) {
          path.unshift(node.position);
          node = node.parent;
        }
        return path;
      }
      
      queue.push(newNode);
    }
  }
  
  return []; // No path found
}