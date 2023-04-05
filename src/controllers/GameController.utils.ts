import useMinesweeperState, { Cell, CellState } from '../store/store';

export function detectCell(cells: Cell[], x: number, y: number) {
  return cells.find(
    (c) => x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height,
  );
}

export function getNeighborsCellsIds(id: number) {
  const { cellsCount } = useMinesweeperState.getState();
  const cellsAround = [];
  for (let j = id - cellsCount - 1; j <= id + cellsCount; j += cellsCount) {
    for (let i = 0; i <= 2; i++) {
      cellsAround.push(i + j);
    }
  }
  return cellsAround.filter((neighborId) => {
    if (neighborId < 0) {
      return false;
    }
    if (neighborId >= Math.pow(cellsCount, 2)) {
      return false;
    }
    if (neighborId === id) {
      return false;
    }
    return true;
  });
}

function getColorByCellState(state: CellState) {
  switch (state) {
    case CellState.Undiscovered:
      return 'gray';
    case CellState.Discovered:
      return 'orange';
    case CellState.Flagged:
      return 'yellow';
  }
}

export function getFillStyleByCell(state: CellState, mine: boolean): string {
  if (mine) {
    return 'black';
  }
  return getColorByCellState(state);
}
