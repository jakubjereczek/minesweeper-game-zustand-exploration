import { useEffect, useRef } from 'react';
import Game from '../controllers/Game';
import { GAME_WIDTH } from '../constants';
import { useMinesweeperStateSelectors } from '../store/store';

const Canvas = () => {
  const state = useMinesweeperStateSelectors();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const game = new Game(ref.current);
    game.init();

    return () => {
      game.dispose();
    };
  }, []);

  return (
    <canvas ref={ref} height={GAME_WIDTH + 'px'} width={GAME_WIDTH + 'px'} />
  );
};

export default Canvas;
