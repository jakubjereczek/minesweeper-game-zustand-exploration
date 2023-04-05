import { Action, Cell, CellState, Status } from '../store/store';
import { getRandomNumbers } from '../utils/number';
import CanvasController from './CanvasController';
import CanvasRenderer from './CanvasRenderer';
import CellStructure from './CellStructure';
import { MinesweeperStore } from './Game';

interface IGameManager {
  start(): void;
  onClick(ev: MouseEvent): void;
  onCellClick(cell: Cell): void;
  onFlag(cell: Cell): void;
}

class GameManager implements IGameManager {
  public canvasRenderer: CanvasRenderer;
  private cellStructure: CellStructure;

  constructor(
    private store: MinesweeperStore,
    private canvasController: CanvasController,
  ) {
    this.canvasRenderer = new CanvasRenderer(this.canvasController);
    this.cellStructure = new CellStructure(this.store);
    this.canvasController.getCanvas()!.onclick = this.onClick.bind(this);
  }

  start() {
    this.store.getState().idle();
    this.canvasRenderer.drawBoard();
    const cells = this.createCells();
    this.store.getState().updateCells(cells);
    const { cells: mineCells, ids } = this.createMineCells();
    this.store.getState().updateCells(mineCells);
    const readyCells = this.calculateNeighborsMinesCount(ids);
    this.store.getState().updateCells(readyCells);
    this.store.getState().updateStatus(Status.Init);
  }

  finish() {}

  onClick(ev: MouseEvent) {
    const { gameStatus, pushAction } = this.store.getState();

    switch (gameStatus) {
      case Status.Init:
        const cell = this.detectCell(ev.offsetX, ev.offsetY);
        if (cell) {
          pushAction(Action.Click, cell.id);
        }
        break;
      case Status.Failed:
        this.start();
        break;
    }
  }

  onCellClick(cell: Cell) {
    const { gameStatus, updateStatus, modifyCell } = this.store.getState();

    if (gameStatus === Status.Init) {
      if (cell.mine) {
        this.drawCell(cell);
        updateStatus(Status.Failed);
      } else {
        const discoveredCell = {
          ...cell,
          state: CellState.Discovered,
        };
        modifyCell(discoveredCell);
        this.drawCell(discoveredCell);
        this.drawCellTextMinesCount(discoveredCell);
      }
    }
  }

  onFlag(cell: Cell) {}

  private createCells() {
    const { cellsCount } = this.store.getState();
    const tempCells: Cell[] = [];
    for (let x = 0; x < cellsCount; x++) {
      for (let y = 0; y < cellsCount; y++) {
        const cell = this.cellStructure.shapeCell(
          tempCells.length,
          x,
          y,
          this.cellStructure.getSize(),
        );
        tempCells.push(cell);
        this.drawCell(cell);
      }
    }
    return tempCells;
  }

  private createMineCells() {
    const { cellsCount, minesCount, cells } = this.store.getState();
    const tempCells = Array.from(cells);
    const ids = getRandomNumbers(minesCount, [0, Math.pow(cellsCount, 2)]);
    ids.forEach((id) => {
      tempCells[id] = {
        ...tempCells[id],
        mine: true,
      };
    });

    return {
      cells: tempCells,
      ids,
    };
  }

  private calculateNeighborsMinesCount(ids: number[]) {
    const { cells } = this.store.getState();
    const tempCells = Array.from(cells);
    ids.forEach((id) => {
      const nIds = this.cellStructure.getNeighborsCellsIds(id);
      nIds.forEach((id) => {
        tempCells[id] = {
          ...tempCells[id],
          neighborsMines: tempCells[id].neighborsMines + 1,
        };
      });
    });
    return tempCells;
  }

  private drawCell(cell: Cell): void {
    this.canvasRenderer.drawCell({
      ...cell,
      size: this.cellStructure.getSize(),
      color: this.cellStructure.getFillStyleByCell(cell.state, cell.mine),
    });
  }

  private drawCellTextMinesCount({ x, y, neighborsMines }: Cell) {
    this.canvasRenderer.drawText({
      x: x + 4,
      y: y + 16,
      text: `${neighborsMines}`,
      fontSize: 14,
    });
  }

  private detectCell(x: number, y: number) {
    const { cells } = this.store.getState();
    return cells.find(
      (c) => x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height,
    );
  }
}

export default GameManager;
