import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import configureStore from './configureStore';
import initialState from '../reducers/initialState';

const { store } = configureStore(initialState);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<
  Record<string, unknown>,
  Record<string, unknown>,
  AnyAction
>;

export default store as RootState;
