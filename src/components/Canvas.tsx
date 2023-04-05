import { useEffect, useRef } from 'react';
import GameController from '../controllers/GameController';
import { GAME_WIDTH } from '../constants';
import { useMinesweeperStateSelectors } from '../store/store';

const Canvas = () => {
  const state = useMinesweeperStateSelectors();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const gameController = new GameController(ref.current);
    gameController.init();

    return () => {
      gameController.dispose();
    };
  }, []);

  return (
    <canvas ref={ref} height={GAME_WIDTH + 'px'} width={GAME_WIDTH + 'px'} />
  );
};

export default Canvas;
