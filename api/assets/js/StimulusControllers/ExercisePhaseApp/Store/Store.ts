import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import toolbarReducer from '../Components/Toolbar/ToolbarSlice';
import modalReducer from '../Components/Modal/ModalSlice';
import configReducer from '../Components/Config/ConfigSlice';
import videoPlayerWrapperReducer from '../Components/VideoPlayer/VideoPlayerWrapperSlice';

export const store = configureStore({
  reducer: {
    toolbar: toolbarReducer,
    modal: modalReducer,
    config: configReducer,
    videoPlayerWrapper: videoPlayerWrapperReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
