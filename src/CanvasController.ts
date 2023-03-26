import useMinesweeperState, { MinesweeperStore } from './store/store';

class CanvasController {
  private store: MinesweeperStore | null;
  constructor(private canvas: HTMLCanvasElement) {
    this.store = useMinesweeperState.getState();
  }

  public draw() {
    this.canvas.style.width = `${window.screen.width / 3}px`;
    this.canvas.style.height = `${window.screen.width / 2}px`;
    this.canvas.style.backgroundColor = 'red';
    this.store?.init();
  }
}

export default CanvasController;
