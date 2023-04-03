import useMinesweeperState, { Cell } from './store/store';

export function getCellMapCount() {
  const state = useMinesweeperState.getState();

  return state.cellsCount * state.cellsCount;
}

export function detectCell(cells: Cell[], x: number, y: number) {
  return cells.find(
    (c) => x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height,
  );
}
