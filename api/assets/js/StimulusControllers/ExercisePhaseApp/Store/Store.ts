import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../Components/Counter/CounterSlice';
import toolbarReducer from '../Components/Toolbar/ToolbarSlice';
import modalReducer from '../Components/Modal/ModalSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    toolbar: toolbarReducer,
    modal: modalReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
