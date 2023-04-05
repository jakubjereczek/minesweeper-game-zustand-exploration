interface ContextBaseArgs {
  x: number;
  y: number;
  color: string;
}

type DrawContextArgs = ContextBaseArgs & {
  width: number;
  height: number;
};

type FillContextArgs = ContextBaseArgs & {
  text: string;
  font: string;
};

interface ICanvasController {
  draw: (args: DrawContextArgs) => void;
  fill: (args: FillContextArgs) => void;
  getCanvas: () => void;
}

class CanvasController implements ICanvasController {
  constructor(private canvas: HTMLCanvasElement | null) {}

  draw({ x, y, width, height, color }: DrawContextArgs) {
    const context = this.getContext();
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }

  fill({ x, y, color, font, text }: FillContextArgs) {
    const context = this.getContext();
    context.fillStyle = color;
    context.font = font;
    context.fillText(text, x, y);
  }

  public getCanvas() {
    return this.canvas;
  }

  private getContext() {
    const context = this.canvas?.getContext('2d');
    if (!context) {
      throw new Error(
        'An error occurred when tried to get CanvasRenderingContext2D.',
      );
    }
    return context;
  }
}

export default CanvasController;
