import { configureStore, ThunkAction, Action, getDefaultMiddleware } from '@reduxjs/toolkit'
import toolbarReducer from '../Components/Toolbar/ToolbarSlice'
import modalReducer from '../Components/Modal/ModalSlice'
import configReducer from '../Components/Config/ConfigSlice'
import liveSyncConfigReducer from '../Components/LiveSyncConfig/LiveSyncConfigSlice'
import solutionReducer from '../Components/Solution/SolutionSlice'
import overlayReducer from '../Components/Overlay/OverlaySlice'
import materialViewerReducer from '../Components/MaterialViewer/MaterialViewerSlice'
import presenceReducer from '../Components/Presence/PresenceSlice'
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { select } from 'redux-saga/effects'
import { all, spawn, call } from 'redux-saga/effects'
import presenceSaga from '../Components/Presence/PresenceSaga'
import solutionSaga from '../Components/Solution/SolutionSaga'
import currentEditorReducer from '../Components/Presence/CurrentEditorSlice'

const sagaMiddleWare = createSagaMiddleware()

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
        currentEditor: currentEditorReducer,
    },
    middleware: [...getDefaultMiddleware(), sagaMiddleWare],
})

const sagas = [presenceSaga, solutionSaga]
sagaMiddleWare.run(function* rootSaga() {
    yield all(
        sagas.map((saga) =>
            spawn(function* () {
                while (true) {
                    try {
                        yield call(saga)
                        break
                    } catch (e) {
                        console.error(e)
                    }
                }
            })
        )
    )
})

export type AppState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>

export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * WHY: yield select() returns any so we wrap this to get type safety
 *
 * @example
 *  const state = yield* selectState() // state: AppState
 *
 * @example with redux selector
 *  const mercureEndpoint = selectMercureEndpoint(yield* selectState()) // mercureEndpoint: string
 */
export function* selectState() {
    const state: AppState = yield select()
    return state
}
