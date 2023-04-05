import { GAME_WIDTH } from '../constants';
import { Cell, CellState } from '../store/store';
import { MinesweeperStore } from './Game';

interface ICellController {
  getFillStyleByCell(state: CellState, mine: boolean): string;
  getColorByCellState(state: CellState): string;
  getNeighborsCellsIds(id: number): number[];
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

  getNeighborsCellsIds(id: number) {
    const { cellsCount } = this.store.getState();
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

  shapeCell(id: number, x: number, y: number, size: number): Cell {
    return {
      id,
      x: x * size,
      y: y * size,
      width: size,
      height: size,
      mine: false,
      state: CellState.Undiscovered,
      neighborsMines: 0,
    };
  }

  getSize() {
    return GAME_WIDTH / this.store.getState().cellsCount;
  }
}

export default CellController;
