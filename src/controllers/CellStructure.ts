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
    const cellsAround = this.getAroundCells(id);

    if (!cellsIds.includes(id)) {
      cellsIds.push(id);
      if (
        !cellsAround.filter(
          (cellId) => this.store.getState().cells[cellId].mine,
        ).length
      ) {
        cellsAround.forEach((cellId) => {
          this.exploreCells(cellsIds, cellId);
        });
      }
    }
    return cellsIds;
  }

  getAroundCells(id: number) {
    const size = this.store.getState().cellsCount;
    const aroundCells = [];
    const row = Math.floor(id / size);
    const col = id % size;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        const newId = newRow * size + newCol;

        if (
          (i !== 0 || j !== 0) &&
          newRow >= 0 &&
          newRow < size &&
          newCol >= 0 &&
          newCol < size &&
          newId >= 0 &&
          newId < size ** 2
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
