import type { Cell, Maze } from '../types/maze';

export function generateMaze(width: number, height: number): Maze {
  const cells: Cell[][] = [];

  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      cells[y][x] = {
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      };
    }
  }

  const stack: Cell[] = [];
  const startCell = cells[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, cells, width, height);

    if (neighbors.length > 0) {
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, randomNeighbor);
      randomNeighbor.visited = true;
      stack.push(randomNeighbor);
    } else {
      stack.pop();
    }
  }

  return { cells, width, height };
}

function getUnvisitedNeighbors(cell: Cell, cells: Cell[][], width: number, height: number): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  if (y > 0 && !cells[y - 1][x].visited) neighbors.push(cells[y - 1][x]);
  if (x < width - 1 && !cells[y][x + 1].visited) neighbors.push(cells[y][x + 1]);
  if (y < height - 1 && !cells[y + 1][x].visited) neighbors.push(cells[y + 1][x]);
  if (x > 0 && !cells[y][x - 1].visited) neighbors.push(cells[y][x - 1]);

  return neighbors;
}

function removeWalls(cellA: Cell, cellB: Cell): void {
  const dx = cellA.x - cellB.x;
  const dy = cellA.y - cellB.y;

  if (dx === 1) {
    cellA.walls.left = false;
    cellB.walls.right = false;
  } else if (dx === -1) {
    cellA.walls.right = false;
    cellB.walls.left = false;
  }

  if (dy === 1) {
    cellA.walls.top = false;
    cellB.walls.bottom = false;
  } else if (dy === -1) {
    cellA.walls.bottom = false;
    cellB.walls.top = false;
  }
}