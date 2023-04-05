import {
  detectCell,
  getCellMapCount,
  getFillStyleByCell,
  getNeighborsCellsIds,
} from './CanvasController.utils';
import { GAME_WIDTH } from './constants';
import useMinesweeperState, {
  Action,
  Cell,
  CellState,
  Status,
} from './store/store';
import { getRandomNumbers } from './utils/number';

class CanvasController {
  private store: typeof useMinesweeperState;
  private unsubscribes: Array<() => void>;

  constructor(private canvas: HTMLCanvasElement | null) {
    this.store = useMinesweeperState;
    this.unsubscribes = [];
  }

  public dispose() {
    this.unsubscribes?.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribes = [];
    this.getState().reset();
  }

  public draw() {
    if (this.canvas) {
      this.canvas.onclick = this.handleCanvasClick.bind(this);
      this.subscribe();
      this.getState().init();
      this.drawMap();
    }
  }

  private subscribe() {
    this.unsubscribes.push(
      this.store.subscribe(
        (state) => state.actions,
        (actions) => this.onAction(actions[actions.length - 1]),
      ),
    );
  }

  private drawMap() {
    this.clearCanvas();
    this.drawAndSetCells();
    this.draAndSetMines();
  }

  private clearCanvas() {
    const context = this.canvas?.getContext('2d');
    if (context) {
      context.fillStyle = 'black';
      context.fillRect(0, 0, GAME_WIDTH, GAME_WIDTH);
    }
  }

  private onAction(action: [Action, number] | undefined) {
    switch (action?.[0]) {
      case Action.Click:
        this.handleClickAction(action[1]);
        break;
      case Action.Flag:
        this.handleFlagAction(action[1]);
        break;
      default:
        return;
    }
  }

  private handleClickAction(id: number) {
    const cell = this.getCellById(id);
    const { gameStatus, updateStatus, modifyCell } = this.getState();
    if (cell.state === CellState.Undiscovered && gameStatus === Status.Init) {
      if (cell.mine) {
        this.drawCell(cell);
        updateStatus(Status.Failed);
      } else {
        const modifiedCell = { ...cell, state: CellState.Discovered };
        modifyCell(modifiedCell);
        this.drawCell(modifiedCell);
        this.drawCellMinesCount(modifiedCell);
      }
    }
  }

  private handleFlagAction(id: number) {}

  private drawAndSetCells() {
    let cellId = 0;
    const cellSize = this.getCellSize();
    for (let x = 0; x < this.getState().cellsCount; x++) {
      for (let y = 0; y < this.getState().cellsCount; y++) {
        this.setCell(this.shapeCell(cellId++, x, y, cellSize));
      }
    }
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

  private drawCell({ state, x, y, mine }: Cell): void {
    const bd = 1;
    const context = this.canvas?.getContext('2d');
    if (context) {
      const cellSize = this.getCellSize();
      context.fillStyle = getFillStyleByCell(state, mine);
      context.fillRect(x + bd, y + bd, cellSize - bd, cellSize - bd);
    }
  }

  private drawCellMinesCount(cell: Cell) {
    const context = this.canvas?.getContext('2d');
    if (context) {
      context.fillStyle = 'black';
      context.font = '14px Arial';
      context.fillText(`${cell.neighborsMines}`, cell.x + 4, cell.y + 16);
    }
  }

  private setCell(cell: Cell) {
    this.drawCell(cell);
    this.getState().pushCell(cell);
  }

  private draAndSetMines() {
    const ids = getRandomNumbers(
      this.getState().minesCount,
      this.getCellsRange(),
    );
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
      const neighborsIds = getNeighborsCellsIds(id);
      neighborsIds.forEach((id) => {
        tempCells[id] = {
          ...tempCells[id],
          neighborsMines: tempCells[id].neighborsMines + 1,
        };
      });
    });
    this.getState().updateCells(tempCells);
  }

  private handleCanvasClick(ev: MouseEvent) {
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
        this.drawMap();
        break;
    }
  }

  private getCellsRange() {
    return [0, getCellMapCount()] as [number, number];
  }

  private getCellSize() {
    return GAME_WIDTH / this.getState().cellsCount;
  }

  private getCellById(id: number): Cell {
    return this.getState().cells[id];
  }

  private getState() {
    return this.store.getState();
  }
}

export default CanvasController;
