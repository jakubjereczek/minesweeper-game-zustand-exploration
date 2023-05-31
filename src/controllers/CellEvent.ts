import { Cell } from '../store/store';
import { MinesweeperStore } from './Game';

interface ICellUtils {
  detectCell(x: number, y: number): void;
  copyCells(): Cell[];
}

class CellUtils implements ICellUtils {
  constructor(private store: MinesweeperStore) {}

  detectCell(x: number, y: number) {
    return this.store
      .getState()
      .cells.find(
        (c) =>
          x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height,
      );
  }

  copyCells() {
    return Array.from(this.store.getState().cells);
  }

  getSize() {
    return this.store.getState().cellsCount;
  }
}

export default CellUtils;
