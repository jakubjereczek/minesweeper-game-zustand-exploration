import useMinesweeperState, { MinesweeperStore } from './store/store';

type Cell = {
  x: number;
  y: number;
  width: number;
  height: number;
};

class CanvasController {
  private store: MinesweeperStore | null;
  private cells: Cell[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.store = useMinesweeperState.getState();
  }

  public draw() {
    this.canvas.style.backgroundColor = 'black';
    this.canvas.onclick = this.handleClick;
    this.store?.init();
    this.drawCells();
  }

  private drawCells() {
    for (let i = 0; i < this.store!.cellsCount; i++) {
      for (let j = 0; j < this.store!.cellsCount; j++) {
        const cellSize = 500 / this.store!.cellsCount;
        this.drawCell(i * cellSize, j * cellSize);
      }
    }
  }

  private drawCell(x: number, y: number) {
    if (!this.store) {
      return new Error(
        'Store is not defined. Check CanvasController constructor.',
      );
    }
    const context = this.canvas.getContext('2d');
    if (!context) {
      return new Error('An error occurred when tried to getContext.');
    }
    const cellSize = 500 / this.store.cellsCount;
    context.fillStyle = 'gray';
    context.fillRect(x + 1, y + 1, cellSize - 1, cellSize - 1);
    this.cells.push({
      x,
      y,
      width: cellSize,
      height: cellSize,
    });
  }

  private handleClick(this: GlobalEventHandlers, ev: MouseEvent) {
    // TODO: Detect cell click.
  }
}

export default CanvasController;
