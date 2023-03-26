import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import createSelectors from './createSelectors';

const DEFAULT_GAME_MINES = 8;

const DEFAULT_GAME_ROW = 8;
const DEFAULT_GAME_COLUMNS = 8;

export enum Status {
  Idle = 'idle',
  Init = 'init',
  Failed = 'failed',
  Succeeded = 'succeeded',
}

type Cell = {
  x: number;
  y: number;
};

interface GameState {
  gameStatus: Status;
  bombsCount: number;
  rowsCount: number;
  columnsCount: number;
  minesCells: Cell[];
  flaggedCells: Cell[];
  revealedCells: Cell[];
}

interface GameActions {
  init: () => void;
  reset: () => void;
}

const initialState: GameState = {
  gameStatus: Status.Idle,
  bombsCount: DEFAULT_GAME_MINES,
  rowsCount: DEFAULT_GAME_ROW,
  columnsCount: DEFAULT_GAME_COLUMNS,
  minesCells: [],
  flaggedCells: [],
  revealedCells: [],
};

export type MinesweeperStore = GameState & GameActions;

type MiddlewareDefinitions = [
  ['zustand/subscribeWithSelector', never],
  ['zustand/devtools', never],
  ['zustand/immer', never],
];

const useMinesweeperState = create<MinesweeperStore, MiddlewareDefinitions>(
  subscribeWithSelector(
    devtools(
      immer((set) => ({
        ...initialState,
        init: () => set({ ...initialState, gameStatus: Status.Init }),
        reset: () => {
          set(initialState);
        },
      })),
    ),
  ),
);

export default useMinesweeperState;

export const useMinesweeperStateSelectors =
  createSelectors(useMinesweeperState);
