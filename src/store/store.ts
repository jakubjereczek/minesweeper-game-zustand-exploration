import { create } from 'zustand';
import createSelectors from './createSelectors';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const DEFAULT_GAME_MINES = 12;
const DEFAULT_GAME_SIZE = 10;

export enum Status {
  Idle = 'idle',
  Init = 'init',
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
  minesAround: number;
};

interface GameState {
  actions: [Action, number][]; // Action cellId
  gameStatus: Status;
  minesCount: number;
  cellsCount: number;
  cells: Cell[];
}

interface GameActions {
  idle: () => void;
  updateStatus: (status: Status) => void;
  pushCell: (cell: Cell) => void;
  modifyCell: (cell: Partial<Cell> & { id: number; action?: Action }) => void;
  updateCells: (cell: Cell[]) => void;
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
        idle: () =>
          set(
            { ...initialState, gameStatus: Status.Idle },
            false,
            'minesweeper/init',
          ),
        updateStatus: (status: Status) =>
          set(
            (state) => ({ ...state, gameStatus: status }),
            false,
            'minesweeper/updateStatus',
          ),
        pushCell: (cell: Cell) =>
          set(
            (state) => ({ cells: [...state.cells, cell] }),
            false,
            'minesweeper/pushCell',
          ),
        modifyCell: (cell: Partial<Cell> & { id: number; action?: Action }) => {
          set(
            (state) => {
              state.cells[cell.id] = { ...state.cells[cell.id], ...cell };
              if (cell.action) {
                state.actions.push([cell.action, cell.id]);
              }
            },
            false,
            'minesweeper/modifyCell',
          );
        },
        updateCells: (cells: Cell[]) =>
          set(() => ({ cells }), false, 'minesweeper/updateCells'),
        pushAction: (action: Action, cellId: number) =>
          set(
            (state) => {
              state.actions.push([action, cellId]);
            },
            false,
            'minesweeper/pushCells',
          ),
        reset: () => {
          set(initialState, false, 'minesweeper/reset');
        },
      })),
    ),
  ),
);

export default useMinesweeperState;

export const useMinesweeperStateSelectors =
  createSelectors(useMinesweeperState);

// fetch: async () => {
//   set(() => ({ loading: true }));
//   try {
//     const response = await axios.get(
//       'https://jsonplaceholder.typicode.com/users/1',
//     );
//     set((state) => ({
//       data: (state.data = response.data),
//       loading: false,
//     }));
//   } catch (err) {
//     set(() => ({ hasErrors: true, loading: false }));
//   }
// },

/*

const a = useBearStore.use.revealedCells(); // get property
const b = useBearStore.use.increment(); // get action

// * For more control over re-rendering, you may provide an alternative equality function on the second argument.

// const treats = useStore(
//   (state) => state.treats,
//   (oldTreats, newTreats) => compare(oldTreats, newTreats),
// );

// *  if you want to construct a single object with multiple state-picks inside, similar to Redux's mapStateToProps, you can tell Zustand that you want the object to be diffed shallowly by passing the shallow equality function.// Object pick, re-renders the component when either state.nuts or state.honey change
// const { nuts, honey } = useStore(
//   (state) => ({ nuts: state.nuts, honey: state.honey }),
//   shallow
// )
// Array pick, re-renders the component when either state.nuts or state.honey change
// const [nuts, honey] = useStore((state) => [state.nuts, state.honey], shallow)

// Mapped picks, re-renders the component when state.treats changes in order, count or keys
// const treats = useStore((state) => Object.keys(state.treats), shallow)

// * It is generally recommended to memoize selectors with useCallback
// const fruit = useStore(useCallback((state) => state.fruits[id], [id]));

// * Async actions - Just call set when you're ready, zustand doesn't care if your actions are async or not.
const useStore = create((set) => ({
  fishies: {},
  fetch: async (pond) => {
    const response = await fetch(pond);
    set({ fishies: await response.json() });
  },
}));

// * Read from state in actions
const useStore2 = create((set, get) => ({
  sound: 'grunt',
  action: () => {
    const sound = get().sound;
    // ...
  },
}));

// * writing state and reacting to changes outside of components
// Sometimes you need to access state in a non-reactive way, or act upon the store. For these cases the resulting hook has utility functions attached to its prototype.
// Getting non-reactive fresh state
const paw = useStore.getState().paw;

// Listening to all changes, fires on every change
const unsub1 = useStore.subscribe(console.log);

// Listening to selected changes, in this case when "paw" changes
const unsub2 = useStore.subscribe((state) => state.paw, console.log);

const unsub3 = useStore.subscribe(
  (state) => [state.paw, state.fur],
  console.log,
  { equalityFn: shallow },
);
// Subscribe also exposes the previous value
const unsub4 = useStore.subscribe(
  (state) => state.paw,
  (paw, previousPaw) => console.log(paw, previousPaw),
);

// Updating state, will trigger listeners
useStore.setState({ paw: false });
useStore.setState({ snout: false });
// Unsubscribe listeners
unsub1();
unsub2();
unsub3();
unsub4();

// You can of course use the hook as you always would
function Component() {
  const paw = useStore((state) => state.paw);
  // ...
}


*/
