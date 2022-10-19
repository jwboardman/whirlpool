import {
  legacy_createStore as createStore,
  applyMiddleware,
  Store,
} from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';

// Thunk middleware allows actions to be chained and waited on by returning
// a function from that action
// https://github.com/gaearon/redux-thunk
import thunk from 'redux-thunk';

// Reducers
import InitialState from '../types/InitialState';
import rootReducer from '../reducers/rootReducer';

export default function configureStore(
  initialState: InitialState | undefined
): { store: Store } {
  const store = createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunk))
  );

  return { store };
}
