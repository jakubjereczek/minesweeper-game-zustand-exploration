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
    const subscription = this.store.subscribe(
      (state) => state.actions,
      (actions) => {
        if (actions[actions.length - 1]) {
          const cell =
            this.store.getState().cells[actions[actions.length - 1][1]];
          if (cell) {
            switch (actions[actions.length - 1][0]) {
              case Action.Click:
                this.gameManager.onCellClick(cell);
                break;
              case Action.Flag:
                this.gameManager.onFlag(cell);
                break;
            }
          }
        }
      },
    );
    this.unsubscribes.push(subscription);
    this.gameManager.start();
  }

  dispose() {
    this.unsubscribes?.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribes = [];
    this.gameManager.finish();
  }
}

export default Game;
