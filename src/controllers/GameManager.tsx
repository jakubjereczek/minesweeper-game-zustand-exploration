import { Action, Cell, CellState, Status } from '../store/store';
import { generateRandomNumbersInRange } from '../utils/number';
import CanvasController from './CanvasController';
import CanvasRenderer from './CanvasRenderer';
import CellUtils from './CellEvent';
import CellStructure from './CellStructure';
import { MinesweeperStore } from './Game';

const CELL_TEXT_OFFSET_X = 4;
const CELL_TEXT_OFFSET_Y = 16;

interface IGameManager {
  start(): void;
  onClick(ev: MouseEvent): void;
  onCellClick(cell: Cell): void;
  onFlag(cell: Cell): void;
}

class GameManager implements IGameManager {
  public canvasRenderer: CanvasRenderer;
  private cellStructure: CellStructure;
  private cellUtils: CellUtils;

  constructor(
    private store: MinesweeperStore,
    private canvasController: CanvasController,
  ) {
    this.canvasRenderer = new CanvasRenderer(this.canvasController);
    this.cellStructure = new CellStructure(this.store);
    this.cellUtils = new CellUtils(this.store);

    const canvasElement = this.canvasController.getCanvas();
    if (canvasElement) {
      canvasElement.onmousedown = this.onClick.bind(this);
      canvasElement.oncontextmenu = (ev) => {
        ev.preventDefault();
      };
    }
  }

  start() {
    this.store.getState().idle();
    this.canvasRenderer.drawBoard();
    this.prepareCells();
    this.store.getState().updateStatus(Status.Init);
  }

  finish() {
    this.store.getState().reset();
  }

  checkWin() {
    // TODO: To implement.
  }

  onClick(ev: MouseEvent) {
    console.log('onClick');
    ev.preventDefault();
    const gameStatus = this.store.getState().gameStatus;
    switch (gameStatus) {
      case Status.Init:
        const cell = this.cellUtils.detectCell(ev.offsetX, ev.offsetY);
        if (cell) {
          this.store
            .getState()
            .pushAction(ev.button === 0 ? Action.Click : Action.Flag, cell.id);
        }
        break;
      case Status.Failed:
        this.start();
        break;
    }
  }

  showMine(cell: Cell) {
    this.store.getState().modifyCell(cell);
    this.drawCell(cell);
    this.drawCellTextMine(cell);
  }

  showMinesAround(cell: Cell) {
    const tempCells: Cell[] = Array.from(this.store.getState().cells);
    this.cellStructure.exploreCells([], cell.id).forEach((cellId) => {
      if (tempCells[cellId].state === CellState.Undiscovered) {
        tempCells[cellId] = {
          ...tempCells[cellId],
          state: CellState.Discovered,
        };
        this.drawCell(tempCells[cellId]);
        if (tempCells[cellId].minesAround) {
          this.drawCellTextMine(tempCells[cellId]);
        }
      }
    });
    this.store.getState().updateCells(tempCells);
  }

  showMinesCells() {
    this.store
      .getState()
      .cells.filter((cell) => cell.mine)
      .forEach((cell) => this.drawCell(cell));
    this.store.getState().updateStatus(Status.Failed);
  }

  onCellClick(cell: Cell) {
    if (this.store.getState().gameStatus === Status.Init) {
      if (cell.state === CellState.Undiscovered) {
        if (cell.mine) {
          this.showMinesCells();
        } else {
          if (cell.minesAround) {
            this.showMine({
              ...cell,
              state: CellState.Discovered,
            });
          } else {
            this.showMinesAround(cell);
          }
        }
      }
    }
  }

  onFlag(cell: Cell) {
    if (cell.state === CellState.Flagged) {
      const newCell = {
        ...cell,
        state: CellState.Undiscovered,
      };
      this.store.getState().modifyCell(newCell);
      this.drawCell({ ...newCell, mine: false });
    } else if (cell.state === CellState.Undiscovered) {
      const newCell = {
        ...cell,
        state: CellState.Flagged,
      };
      this.store.getState().modifyCell(newCell);
      this.drawCell({ ...newCell, mine: false });
      this.drawCellFlag(newCell);
    }
  }

  private prepareCells() {
    this.createCells();
    this.createMines();
    this.calculateMinesAround();
  }

  private createCells() {
    const tempCells = this.shapeCells();
    for (let i = 0; i < tempCells.length; i++) {
      this.drawCell(tempCells[i]);
    }
    this.store.getState().updateCells(tempCells);
  }

  private shapeCells() {
    const tempCells: Cell[] = [];
    for (let x = 0; x < this.cellUtils.getSize(); x++) {
      for (let y = 0; y < this.cellUtils.getSize(); y++) {
        const cell = this.cellStructure.shapeCell(
          tempCells.length,
          y,
          x,
          this.cellStructure.getSize(),
        );
        tempCells.push(cell);
      }
    }
    return tempCells;
  }

  private createMines() {
    const tempCells = this.cellUtils.copyCells();
    const cellsCount = this.store.getState().cellsCount;
    const minesCount = this.store.getState().minesCount;

    const randomCellsIds = generateRandomNumbersInRange(minesCount, [
      0,
      cellsCount ** 2 - 1,
    ]);

    randomCellsIds.forEach((cellId) => {
      tempCells[cellId] = {
        ...tempCells[cellId],
        mine: true,
      };
    });
    this.store.getState().updateCells(tempCells);
  }

  private calculateMinesAround() {
    const tempCells = this.cellUtils.copyCells();
    const minesCells = tempCells
      .filter((cell) => cell.mine)
      .map((cell) => cell.id);

    minesCells.forEach((mineCellId) => {
      const cellAroundIds = this.cellStructure.getAroundCells(mineCellId);
      const aroundCellsIds = [mineCellId, ...cellAroundIds];

      aroundCellsIds.forEach((cellId) => {
        if (!tempCells[cellId].mine) {
          tempCells[cellId] = {
            ...tempCells[cellId],
            minesAround: tempCells[cellId].minesAround + 1,
          };
        }
      });
    });
    this.store.getState().updateCells(tempCells);
  }

  private drawCell(cell: Cell): void {
    this.canvasRenderer.drawCell({
      ...cell,
      size: this.cellStructure.getSize(),
      color: this.cellStructure.getFillStyleByCell(cell.state, cell.mine),
    });
  }

  private drawCellTextMine({ x, y, minesAround }: Cell) {
    this.canvasRenderer.drawText({
      x: x + CELL_TEXT_OFFSET_X,
      y: y + CELL_TEXT_OFFSET_Y,
      text: `${minesAround}`,
      fontSize: 14,
    });
  }

  private drawCellFlag({ x, y }: Cell) {
    this.canvasRenderer.drawText({
      x: x + CELL_TEXT_OFFSET_X,
      y: y + CELL_TEXT_OFFSET_Y,
      text: `FLAG`,
      fontSize: 14,
    });
  }
}

export default GameManager;
