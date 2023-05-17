import { Action, Cell, CellState, Status } from '../store/store';
import { getRandomNumbers } from '../utils/number';
import CanvasController from './CanvasController';
import CanvasRenderer from './CanvasRenderer';
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
    const readyCells = this.calculateMines(ids);
    this.store.getState().updateCells(readyCells);
    this.store.getState().updateStatus(Status.Init);
  }

  finish() {
    this.store.getState().reset();
  }

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
    const { gameStatus, updateStatus, updateCells, modifyCell, cells } =
      this.store.getState();

    if (gameStatus === Status.Init && cell.state === CellState.Undiscovered) {
      if (cell.mine) {
        cells
          .filter((cell) => cell.mine)
          .forEach((cell) => this.drawCell(cell));
        updateStatus(Status.Failed);
      } else {
        if (cell.minesAround) {
          const discoveredCell = {
            ...cell,
            state: CellState.Discovered,
          };
          modifyCell(discoveredCell);
          this.drawCell(discoveredCell);
          this.drawCellTextMinesCount(discoveredCell);
        } else {
          const tempCells: Cell[] = Array.from(cells);
          const cellsIds = this.cellStructure.exploreCells([], cell.id);

          cellsIds.forEach((cellId) => {
            if (tempCells[cellId].state === CellState.Undiscovered) {
              tempCells[cellId] = {
                ...tempCells[cellId],
                state: CellState.Discovered,
              };
              this.drawCell(tempCells[cellId]);
              if (tempCells[cellId].minesAround) {
                this.drawCellTextMinesCount(tempCells[cellId]);
              }
            }
          });
          updateCells(tempCells);
        }
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
          y,
          x,
          this.cellStructure.getSize(),
        );
        tempCells.push(cell);
        this.drawCell(cell);
      }
    }
    return tempCells;
  }

  private createMineCells() {
    const tempCells = Array.from(this.store.getState().cells);
    const ids = getRandomNumbers(
      this.store.getState().minesCount,
      this.getCellsRange(),
    );

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

  private calculateMines(minesCells: number[]) {
    const tempCells = Array.from(this.store.getState().cells);
    minesCells.forEach((cellId) => {
      const cellAroundIds = this.cellStructure.getAroundCells(cellId);
      [cellId, ...cellAroundIds].forEach((cellId) => {
        if (!tempCells[cellId].mine) {
          tempCells[cellId] = {
            ...tempCells[cellId],
            minesAround: tempCells[cellId].minesAround + 1,
          };
        }
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

  private drawCellTextMinesCount({ x, y, minesAround }: Cell) {
    this.canvasRenderer.drawText({
      x: x + CELL_TEXT_OFFSET_X,
      y: y + CELL_TEXT_OFFSET_Y,
      text: `${minesAround}`,
      fontSize: 14,
    });
  }

  private getCellsRange(): [number, number] {
    return [0, Math.pow(this.store.getState().cellsCount, 2) - 1];
  }

  private detectCell(x: number, y: number) {
    return this.store
      .getState()
      .cells.find(
        (c) =>
          x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height,
      );
  }
}

export default GameManager;
