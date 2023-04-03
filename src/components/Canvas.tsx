import { useEffect, useRef } from 'react';
import CanvasController from '../CanvasController';
import { GAME_WIDTH } from '../constants';
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
    <div>
      <canvas ref={ref} height={GAME_WIDTH + 'px'} width={GAME_WIDTH + 'px'} />
      {state.gameStatus === Status.Idle
        ? 'The game is initializing. please wait.'
        : 'Lets play'}
    </div>
  );
};

export default Canvas;
