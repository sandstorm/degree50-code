import {
    Action,
    combineReducers,
    configureStore,
    createSelector,
    getDefaultMiddleware,
    ThunkAction,
} from '@reduxjs/toolkit'
import toolbarReducer from '../ExercisePhaseApp/Components/Toolbar/ToolbarSlice'
import configReducer, { selectors as configSelectors } from '../ExercisePhaseApp/Components/Config/ConfigSlice'
import liveSyncConfigReducer from '../ExercisePhaseApp/Components/LiveSyncConfig/LiveSyncConfigSlice'
import overlayReducer from '../ExercisePhaseApp/Components/Overlay/OverlaySlice'
import materialViewerReducer from '../ExercisePhaseApp/Components/MaterialViewer/MaterialViewerSlice'
import presenceReducer from '../ExercisePhaseApp/Components/Presence/PresenceSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { all, call, select, spawn } from 'redux-saga/effects'
import presenceSaga from '../ExercisePhaseApp/Components/Presence/PresenceSaga'
import solutionSaga from '../ExercisePhaseApp/Components/Solution/SolutionSaga'
import currentEditorReducer, { selectCurrentEditorId } from '../ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import VideoEditorSlice, { selectors as videoEditorSelectors } from 'Components/VideoEditor/VideoEditorSlice'
import shortCutsReducer from '../../Components/VideoEditor/ShortCutsContext/ShortCutsSlice'
import { shortCutsSaga } from '../../Components/VideoEditor/ShortCutsContext/ShortCutsSaga'
import shortCutSoundOptionsReducer from '../../Components/VideoEditor/ShortCutsContext/ShortCutSoundsSlice'
import { shortCutSoundsSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSoundsSaga'
import { setCurrentTimeAsValueShortCutSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSagas/SetCurrentTimeAsValueShortCutSaga'
import { togglePlayShortCutSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSagas/togglePlayShortCutSaga'
import { openOverlayShortCutSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSagas/openOverlayShortCutSaga'

const sagaMiddleWare = createSagaMiddleware()

export const store = configureStore({
    reducer: combineReducers({
        toolbar: toolbarReducer,
        videoEditor: VideoEditorSlice,
        config: configReducer,
        liveSyncConfig: liveSyncConfigReducer,
        overlay: overlayReducer,
        materialViewer: materialViewerReducer,
        presence: presenceReducer,
        currentEditor: currentEditorReducer,
        shortCuts: shortCutsReducer,
        shortCutSoundOptions: shortCutSoundOptionsReducer,
    }),
    middleware: [...getDefaultMiddleware(), sagaMiddleWare],
    devTools: {
        name: 'ExercisePhaseApp',
    },
})

const sagas = [
    presenceSaga,
    solutionSaga,
    shortCutsSaga,
    setCurrentTimeAsValueShortCutSaga,
    shortCutSoundsSaga,
    togglePlayShortCutSaga,
    openOverlayShortCutSaga,
]
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
 * WHY: yield select() returns any, so we wrap this to get type safety
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

export const selectUserIsCurrentEditor = createSelector(
    [configSelectors.selectUserId, selectCurrentEditorId],
    (userId, editorId) => editorId && userId === editorId
)

export const selectUserCanEditSolution = createSelector(
    [
        configSelectors.selectReadOnly,
        selectUserIsCurrentEditor,
        videoEditorSelectors.data.solutions.selectIsCurrentSolution,
    ],
    (isReadonly, userIsCurrentEditor, isCurrentSolution) => {
        if (isReadonly) {
            return false
        }

        return userIsCurrentEditor && isCurrentSolution
    }
)
