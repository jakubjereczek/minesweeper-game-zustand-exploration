import { GAME_WIDTH } from '../constants';
import useMinesweeperState, {
  Action,
  Cell,
  CellState,
  Status,
} from '../store/store';
import { getRandomNumbers } from '../utils/number';
import CanvasController from './CanvasController';
import {
  detectCell,
  getFillStyleByCell,
  getNeighborsCellsIds,
} from './GameController.utils';

const CELL_BORDER_SIZE = 1;

type MinesweeperStore = typeof useMinesweeperState;

interface IGameController {
  init: () => void;
  dispose: () => void;
}

class GameController implements IGameController {
  private canvasController: CanvasController;
  private store: MinesweeperStore;

  private unsubscribes: Array<() => void>;

  constructor(canvas: HTMLCanvasElement | null) {
    this.canvasController = new CanvasController(canvas);
    this.store = useMinesweeperState;
    this.unsubscribes = [];
  }

  init() {
    const canvas = this.canvasController.getCanvas();
    if (!canvas) {
      return new Error('An error occurred when tried to get context.');
    }
    canvas.onclick = this.onCanvasClick.bind(this);
    this.subscribe();
    this.getState().init();
    this.draw();
  }

  private onCanvasClick(ev: MouseEvent) {
    const { cells, gameStatus, pushAction, init } = this.getState();

    switch (gameStatus) {
      case Status.Init:
        const cell = detectCell(cells, ev.offsetX, ev.offsetY);
        if (cell) {
          pushAction(Action.Click, cell.id);
        }
        break;
      case Status.Failed:
        init();
        this.draw();
        break;
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
    if (!cell) {
      throw new Error('An error occurred when tried to find cell.');
    }
    this.handleStateActionByActionType(action, cell);
  }

  private handleStateActionByActionType(action: Action, cell: Cell) {
    switch (action) {
      case Action.Click:
        this.onStateActionClick(cell);
        break;
      case Action.Flag:
        this.onStateActionFlag(cell);
        break;
      default:
        throw new Error('Action not supported.');
    }
  }

  private onStateActionClick(cell: Cell) {
    const { gameStatus, updateStatus, modifyCell } = this.getState();

    if (gameStatus === Status.Init) {
      if (cell.state === CellState.Undiscovered) {
        if (cell.mine) {
          this.drawCell(cell);
          updateStatus(Status.Failed);
        } else {
          const discoveredCell = { ...cell, state: CellState.Discovered };
          modifyCell(discoveredCell);
          this.drawCell(discoveredCell);
          this.drawCellTextMinesCount(discoveredCell);
        }
      }
    }
  }

  private onStateActionFlag(cell: Cell) {}

  private draw() {
    this.canvasController.draw({
      x: 0,
      y: 0,
      width: GAME_WIDTH,
      height: GAME_WIDTH,
      color: 'black',
    });
    this.setAndDrawCells();
    this.setAndDrawMinesCells();
  }

  private setAndDrawCells() {
    let cellId = 0;
    const cellSize = this.getCellSize();
    const { cellsCount } = this.getState();
    for (let x = 0; x < cellsCount; x++) {
      for (let y = 0; y < cellsCount; y++) {
        const cell = this.shapeCell(cellId++, x, y, cellSize);
        this.setCell(cell);
      }
    }
  }

  private setCell(cell: Cell) {
    this.drawCell(cell);
    this.getState().pushCell(cell);
  }

  private setAndDrawMinesCells() {
    const { minesCount, cellsCount } = this.getState();
    const ids = getRandomNumbers(minesCount, [0, Math.pow(cellsCount, 2)]);
    this.setMineCellsIds(ids);
    this.setNeighborsMineCounts(ids);
  }

  private setMineCellsIds(ids: number[]) {
    ids.forEach((id) => {
      this.getState().modifyCell({
        id,
        mine: true,
      });
    });
  }

  private setNeighborsMineCounts(ids: number[]) {
    const tempCells = Array.from(this.getState().cells);
    ids.forEach((id) => {
      const nIds = getNeighborsCellsIds(id);
      nIds.forEach((id) => {
        tempCells[id] = {
          ...tempCells[id],
          neighborsMines: tempCells[id].neighborsMines + 1,
        };
      });
    });
    this.getState().updateCells(tempCells);
  }

  dispose() {
    this.unsubscribes?.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribes = [];
    this.getState().reset();
  }

  private drawCell({ state, x, y, mine }: Cell): void {
    const cellSize = this.getCellSize();
    this.canvasController.draw({
      x: x + CELL_BORDER_SIZE,
      y: y + CELL_BORDER_SIZE,
      width: cellSize - CELL_BORDER_SIZE,
      height: cellSize - CELL_BORDER_SIZE,
      color: getFillStyleByCell(state, mine),
    });
  }

  private drawCellTextMinesCount({ x, y, neighborsMines }: Cell) {
    this.canvasController.fill({
      x: x + 4,
      y: y + 16,
      text: String(neighborsMines),
      color: 'black',
      font: '14px Arial',
    });
  }

  private shapeCell(id: number, x: number, y: number, size: number): Cell {
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

  private getCellSize() {
    return GAME_WIDTH / this.getState().cellsCount;
  }

  private getCellById(id: number): Cell | undefined {
    return this.getState().cells[id];
  }

  private getState() {
    return this.store.getState();
  }
}

export default GameController;
