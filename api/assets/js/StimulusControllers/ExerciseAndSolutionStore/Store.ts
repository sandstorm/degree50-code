import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { all, call, select, spawn } from 'redux-saga/effects'
import presenceSaga from '../ExercisePhaseApp/Components/Presence/PresenceSaga'
import solutionSaga from '../ExercisePhaseApp/Components/Solution/SolutionSaga'
import { shortCutsSaga } from '../../Components/VideoEditor/ShortCutsContext/ShortCutsSaga'
import { shortCutSoundsSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSoundsSaga'
import { setCurrentTimeAsValueShortCutSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSagas/SetCurrentTimeAsValueShortCutSaga'
import { togglePlayShortCutSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSagas/togglePlayShortCutSaga'
import { openOverlayShortCutSaga } from '../../Components/VideoEditor/ShortCutsContext/shortCutSagas/openOverlayShortCutSaga'
import { setPlayerTimeControlSaga } from '../../Components/VideoEditor/SetVideoPlayerTimeContext/SetPlayerTimeControlSaga'
import RootReducer from './rootSlice'

const sagaMiddleWare = createSagaMiddleware()

export const store = configureStore({
    reducer: RootReducer,
    middleware: (getDefaultMiddleware) => [...getDefaultMiddleware(), sagaMiddleWare],
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
    setPlayerTimeControlSaga,
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
