import {
  detectCell,
  getCellMapCount,
  getNeighborsCellsIds,
} from './CanvasController.utils';
import { GAME_WIDTH } from './constants';
import useMinesweeperState, {
  Action,
  Cell,
  CellState,
  MinesweeperStore,
} from './store/store';
import { getRandomNumbers } from './utils/number';

const CANVAS_CELL_BORDER = 1;

class CanvasController {
  private store: typeof useMinesweeperState;
  private state: MinesweeperStore;
  private unsubscribe: (() => void) | null = null;

  constructor(private canvas: HTMLCanvasElement | null) {
    this.store = useMinesweeperState;
    this.state = this.store.getState();
  }

  public dispose() {
    this.unsubscribe?.();
  }

  public draw() {
    if (this.canvas) {
      this.canvas.style.backgroundColor = 'black';
      this.canvas.onclick = this.handleClick.bind(this);
      this.state?.init();
      this.setCells();
      this.setMines();
      this.subscribeActions();
    }
  }

  private subscribeActions() {
    this.unsubscribe = this.store.subscribe(
      (state) => state.actions,
      (actions) => this.onAction(actions[actions.length - 1]),
    );
  }

  private onAction([action, id]: [Action, number]) {
    const cell = this.getCellById(id);
    switch (action) {
      case Action.Click:
        this.onClickAction(cell);
        break;
      case Action.Flag:
        this.onFlagAction(cell);
        break;
      default:
        return;
    }
  }

  private getCellById(id: number): Cell {
    return this.state.cells[id];
  }

  private onClickAction(cell: Cell) {
    if (cell.state === CellState.Undiscovered) {
      if (cell.mine) {
        this.drawCell(cell, 'black');
      } else {
        this.state.modifyCell({
          ...cell,
          state: CellState.Discovered,
        });
        this.drawCell(cell, 'yellow');
        this.drawCellNeighborsMines(cell);
      }
    }
  }

  private onFlagAction(cell: Cell) {
    this.drawCell(cell, 'black');
  }

  private setCells() {
    let cellId = 0;
    const cellSize = GAME_WIDTH / this.state.cellsCount;
    for (let x = 0; x < this.state.cellsCount; x++) {
      for (let y = 0; y < this.state.cellsCount; y++) {
        const cell: Cell = this.constructCell(cellId, x, y, cellSize);
        this.setCell(cell);
        cellId++;
      }
    }
  }

  private constructCell(id: number, x: number, y: number, size: number): Cell {
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

  private drawCell(cell: Cell, color = 'gray'): void | Error {
    const context = this.canvas?.getContext('2d');
    if (!context) {
      return new Error('An error occurred when tried to getContext.');
    }
    const cellSize = GAME_WIDTH / this.state.cellsCount;
    context.fillStyle = color;
    context.fillRect(
      cell.x + CANVAS_CELL_BORDER,
      cell.y + CANVAS_CELL_BORDER,
      cellSize - CANVAS_CELL_BORDER,
      cellSize - CANVAS_CELL_BORDER,
    );
  }

  private drawCellNeighborsMines(cell: Cell) {
    const context = this.canvas?.getContext('2d');
    if (!context) {
      return new Error('An error occurred when tried to getContext.');
    }
    context.fillStyle = 'tomato';
    context.font = '14px Arial';
    context.fillText(String(cell.neighborsMines), cell.x + 4, cell.y + 16);
  }

  private setCell(cell: Cell, color = 'gray') {
    this.drawCell(cell, color);
    this.state.pushCell(cell);
  }

  private setMines() {
    const range = [0, getCellMapCount()] as [number, number];
    const ids = getRandomNumbers(this.state.minesCount, range);
    this.setMinesCells(ids);
    this.calculateMinesDensity(ids);
  }

  private setMinesCells(ids: number[]) {
    ids.forEach((id) => {
      this.state.modifyCell({
        id,
        mine: true,
      });
    });
  }

  private calculateMinesDensity(ids: number[]) {
    const tempCells = Array.from(this.state.cells);
    if (tempCells.length) {
      ids.forEach((id) => {
        const neighborsIds = getNeighborsCellsIds(id);
        neighborsIds.forEach((neighborId) => {
          console.log(neighborId);
          tempCells[neighborId] = {
            ...tempCells[neighborId],
            neighborsMines: tempCells[neighborId].neighborsMines + 1,
          };
        });
      });
      this.state.updateCells(tempCells);
    }
  }

  private handleClick(ev: MouseEvent) {
    const cell = detectCell(this.state.cells, ev.offsetX, ev.offsetY);
    if (!cell) {
      throw new Error('An issue occurred. Cannot detect cell.');
    }
    this.state.pushAction(Action.Click, cell.id);
  }
}

export default CanvasController;
