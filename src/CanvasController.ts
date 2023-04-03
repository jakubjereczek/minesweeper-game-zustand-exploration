import { GAME_WIDTH } from './constants';
import useMinesweeperState, { MinesweeperStore } from './store/store';
import { getRandomNumbers } from './utils/number';

class CanvasController {
  private store: MinesweeperStore | null;

  constructor(private canvas: HTMLCanvasElement) {
    this.store = useMinesweeperState.getState();
  }

  public draw() {
    this.canvas.style.backgroundColor = 'black';
    this.canvas.onclick = this.handleClick.bind(this);
    this.store?.init();
    this.drawCells();
    this.setRandomMines();
  }

  private drawCells() {
    for (let i = 0; i < this.store!.cellsCount; i++) {
      for (let j = 0; j < this.store!.cellsCount; j++) {
        const cellSize = GAME_WIDTH / this.store!.cellsCount;
        this.drawCell(i * cellSize, j * cellSize);
      }
    }
  }

  private drawCell(x: number, y: number, color = 'gray') {
    if (!this.store) {
      return new Error(
        'Store is not defined. Check CanvasController constructor.',
      );
    }
    const context = this.canvas.getContext('2d');
    if (!context) {
      return new Error('An error occurred when tried to getContext.');
    }
    const cellSize = GAME_WIDTH / this.store.cellsCount;
    const cellBorder = 1;
    context.fillStyle = color;
    context.fillRect(
      x + cellBorder,
      y + cellBorder,
      cellSize - cellBorder,
      cellSize - cellBorder,
    );
    this.store.pushCell({
      x,
      y,
      width: cellSize,
      height: cellSize,
      mine: false,
      state: 'undiscovered',
    });
  }

  private setRandomMines() {
    if (!this.store) {
      return new Error(
        'Store is not defined. Check CanvasController constructor.',
      );
    }
    const ids = getRandomNumbers(this.store.minesCount, [
      0,
      this.store.cellsCount * this.store.cellsCount,
    ]);
    ids.forEach((id) => {
      this.store!.modifyCell({
        id,
        mine: true,
      });
    });
  }

  private handleClick({ offsetX: x, offsetY: y }: MouseEvent) {
    if (!this.store) {
      return new Error(
        'Store is not defined. Check CanvasController constructor.',
      );
    }
    const cell = this.store.cells.find(
      (cell) =>
        x >= cell.x &&
        x <= cell.x + cell.width &&
        y >= cell.y &&
        y <= cell.y + cell.height,
    );
    if (!cell) {
      throw new Error('There was a problem with cell detection on the map.');
    }
    this.drawCell(cell.x, cell.y, 'blue');
  }
}

export default CanvasController;
