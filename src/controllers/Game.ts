import useMinesweeperState, { Action, Cell } from '../store/store';
import CanvasController from './CanvasController';
import GameManager from './GameManager';

export type MinesweeperStore = typeof useMinesweeperState;

interface IGame {
  init: () => void;
  dispose: () => void;
}

class Game implements IGame {
  private canvasController: CanvasController;
  private gameManager: GameManager;
  private store: MinesweeperStore;

  private unsubscribes: Array<() => void>;

  constructor(canvas: HTMLCanvasElement | null) {
    this.canvasController = new CanvasController(canvas);
    this.store = useMinesweeperState;
    this.gameManager = new GameManager(this.store, this.canvasController);
    this.unsubscribes = [];
  }

  init() {
    const canvas = this.canvasController.getCanvas();
    if (canvas) {
      this.subscribe();
      this.gameManager.start();
    }
  }

  private subscribe() {
    this.unsubscribes.push(
      this.store.subscribe(
        (state) => state.actions,
        (actions) => {
          if (actions[actions.length - 1]) {
            this.onStateAction(actions[actions.length - 1]);
          }
        },
      ),
    );
  }

  private onStateAction([action, id]: [Action, number]) {
    const cell = this.getCellById(id);
    if (cell) {
      if (action === Action.Click) {
        this.gameManager.onCellClick(cell);
        return;
      }
      if (action === Action.Flag) {
        this.gameManager.onCellClick(cell);
        return;
      }
    }
  }

  dispose() {
    this.unsubscribes?.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribes = [];
    this.getState().reset();
  }

  private getCellById(id: number): Cell | undefined {
    return this.getState().cells[id];
  }

  private getState() {
    return this.store.getState();
  }
}

export default Game;
