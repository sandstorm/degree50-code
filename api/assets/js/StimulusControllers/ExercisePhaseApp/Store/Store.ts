import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import toolbarReducer from '../Components/Toolbar/ToolbarSlice';
import modalReducer from '../Components/Modal/ModalSlice';
import configReducer from '../Components/Config/ConfigSlice';

export const store = configureStore({
  reducer: {
    toolbar: toolbarReducer,
    modal: modalReducer,
    config: configReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
