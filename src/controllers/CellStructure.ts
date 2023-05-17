import { GAME_WIDTH } from '../constants';
import { Cell, CellState } from '../store/store';
import { MinesweeperStore } from './Game';

interface ICellController {
  getFillStyleByCell(state: CellState, mine: boolean): string;
  getColorByCellState(state: CellState): string;
  getAroundCells(id: number): number[];
  exploreCells(cellsIds: number[], id: number): number[];
  shapeCell(id: number, x: number, y: number, size: number): void;
  getSize(): void;
}

class CellController implements ICellController {
  constructor(private store: MinesweeperStore) {}

  getFillStyleByCell(state: CellState, mine: boolean): string {
    if (mine) {
      return 'black';
    }
    return this.getColorByCellState(state);
  }

  getColorByCellState(state: CellState) {
    switch (state) {
      case CellState.Undiscovered:
        return 'gray';
      case CellState.Discovered:
        return 'orange';
      case CellState.Flagged:
        return 'yellow';
    }
  }

  exploreCells(cellsIds: number[], id: number) {
    const { cells } = this.store.getState();
    const cellsAround = this.getAroundCells(id);

    if (!cellsIds.includes(id)) {
      cellsIds.push(id);
      if (!cellsAround.filter((cellId) => cells[cellId].mine).length) {
        cellsAround.forEach((cellId) => {
          this.exploreCells(cellsIds, cellId);
        });
      }
    }
    return cellsIds;
  }

  getAroundCells(id: number) {
    const { cellsCount } = this.store.getState();
    const aroundCells = [];
    const row = Math.floor(id / cellsCount);
    const col = id % cellsCount;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        const newId = newRow * cellsCount + newCol;

        if (
          (i !== 0 || j !== 0) &&
          newRow >= 0 &&
          newRow < cellsCount &&
          newCol >= 0 &&
          newCol < cellsCount &&
          newId >= 0 &&
          newId < cellsCount ** 2
        ) {
          aroundCells.push(newId);
        }
      }
    }

    return aroundCells;
  }

  shapeCell(id: number, x: number, y: number, size: number): Cell {
    return {
      id,
      x: x * size,
      y: y * size,
      width: size,
      height: size,
      mine: false,
      state: CellState.Undiscovered,
      minesAround: 0,
    };
  }

  getSize() {
    return GAME_WIDTH / this.store.getState().cellsCount;
  }
}

export default CellController;
