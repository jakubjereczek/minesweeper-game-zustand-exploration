import { useEffect, useRef } from 'react';
import CanvasController from '../CanvasController';
import { Status, useMinesweeperStateSelectors } from '../store/store';

const Canvas = () => {
  const state = useMinesweeperStateSelectors();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) {
      const canvasController = new CanvasController(ref.current);
      canvasController.draw();
    }
  }, []);

  return (
    <>
      <canvas ref={ref} />
      {state.gameStatus === Status.Idle
        ? 'The game is initializing. please wait.'
        : 'Lets play'}
    </>
  );
};

export default Canvas;
