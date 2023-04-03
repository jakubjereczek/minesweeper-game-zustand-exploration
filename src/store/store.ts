import { create } from 'zustand';
import createSelectors from './createSelectors';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const DEFAULT_GAME_MINES = 8;

const DEFAULT_GAME_SIZE = 8;

export enum Status {
  Idle = 'idle',
  Init = 'init',
  Playing = 'playing',
  Failed = 'failed',
  Succeeded = 'succeeded',
}

export enum CellState {
  Undiscovered,
  Discovered,
  Flagged,
}

export type Cell = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  mine: boolean;
  state: CellState;
};

interface GameState {
  actions: [Action, number][]; // Action cellId
  gameStatus: Status;
  minesCount: number;
  cellsCount: number;
  cells: Cell[];
}

interface GameActions {
  init: () => void;
  start: () => void;
  pushCell: (cell: Cell) => void;
  modifyCell: (cell: Partial<Cell> & { id: number; action?: Action }) => void;
  pushAction: (action: Action, cellId: number) => void;
  reset: () => void;
}

export enum Action {
  Click,
  Flag,
}

const initialState: GameState = {
  actions: [],
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
        start: () => set((state) => ({ ...state, gameStatus: Status.Playing })),
        pushCell: (cell: Cell) =>
          set((state) => ({ cells: [...state.cells, cell] })),
        modifyCell: (cell: Partial<Cell> & { id: number; action?: Action }) => {
          set((state) => {
            state.cells[cell.id] = { ...state.cells[cell.id], ...cell };
            if (cell.action) {
              state.actions.push([cell.action, cell.id]);
            }
          });
        },
        pushAction: (action: Action, cellId: number) =>
          set((state) => {
            state.actions.push([action, cellId]);
          }),
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
