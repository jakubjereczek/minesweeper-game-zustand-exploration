import { GAME_WIDTH } from '../constants';
import { Cell } from '../store/store';
import CanvasController from './CanvasController';

const CELL_BORDER_SIZE = 1;

interface DrawTextArgs {
  x: number;
  y: number;
  fontSize: number;
  text: string;
}

interface ICanvasRenderer {
  drawBoard(): void;
  drawCell(cell: Cell & { size: number; color: string }): void;
  drawText({ x, y, fontSize }: DrawTextArgs): void;
}

class CanvasRenderer implements ICanvasRenderer {
  constructor(private canvasController: CanvasController) {}

  drawBoard(): void {
    this.canvasController.draw({
      x: 0,
      y: 0,
      width: GAME_WIDTH,
      height: GAME_WIDTH,
      color: 'black',
    });
  }

  drawCell({
    x,
    y,
    size,
    color,
  }: Cell & { size: number; color: string }): void {
    this.canvasController.draw({
      x: x + CELL_BORDER_SIZE,
      y: y + CELL_BORDER_SIZE,
      width: size - CELL_BORDER_SIZE,
      height: size - CELL_BORDER_SIZE,
      color,
    });
  }

  drawText({ x, y, fontSize, text }: DrawTextArgs): void {
    this.canvasController.fill({
      x,
      y,
      text,
      color: 'black',
      font: `${fontSize}px Arial`,
    });
  }
}

export default CanvasRenderer;
