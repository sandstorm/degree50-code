import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import toolbarReducer from '../Components/Toolbar/ToolbarSlice'
import modalReducer from '../Components/Modal/ModalSlice'
import configReducer from '../Components/Config/ConfigSlice'
import liveSyncConfigReducer from '../Components/LiveSyncConfig/LiveSyncConfigSlice'
import solutionReducer from '../Components/Solution/SolutionSlice'
import overlayReducer from '../Components/Overlay/OverlaySlice'
import materialViewerReducer from '../Components/MaterialViewer/MaterialViewerSlice'
import presenceReducer from '../Components/Presence/PresenceSlice'
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'

export const store = configureStore({
    reducer: {
        toolbar: toolbarReducer,
        modal: modalReducer,
        config: configReducer,
        liveSyncConfig: liveSyncConfigReducer,
        solution: solutionReducer,
        overlay: overlayReducer,
        materialViewer: materialViewerReducer,
        presence: presenceReducer,
    },
})

export type AppState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>

export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
