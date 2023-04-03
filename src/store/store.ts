import { create } from 'zustand';
import createSelectors from './createSelectors';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const DEFAULT_GAME_MINES = 8;

const DEFAULT_GAME_SIZE = 8;

export enum Status {
  Idle = 'idle',
  Init = 'init',
  Failed = 'failed',
  Succeeded = 'succeeded',
}

type CellState = 'undiscovered' | 'discovered' | 'flagged';

type Cell = {
  x: number;
  y: number;
  width: number;
  height: number;
  mine: boolean;
  state: CellState;
};

interface GameState {
  gameStatus: Status;
  minesCount: number;
  cellsCount: number;
  cells: Cell[];
}

interface GameActions {
  init: () => void;
  pushCell: (cell: Cell) => void;
  modifyCell: (cell: Partial<Cell> & { id: number }) => void;
  reset: () => void;
}

const initialState: GameState = {
  gameStatus: Status.Idle,
  minesCount: DEFAULT_GAME_MINES,
  cellsCount: DEFAULT_GAME_SIZE,
  cells: [],
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
        pushCell: (cell: Cell) =>
          set((state) => ({ cells: [...state.cells, cell] })),
        modifyCell: (cell: Partial<Cell> & { id: number }) => {
          set((state) => {
            state.cells[cell.id] = { ...state.cells[cell.id], ...cell };
          });
        },
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
