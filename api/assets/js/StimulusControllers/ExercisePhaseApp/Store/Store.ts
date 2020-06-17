import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import toolbarReducer from '../Components/Toolbar/ToolbarSlice';
import modalReducer from '../Components/Modal/ModalSlice';

export const store = configureStore({
  reducer: {
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
