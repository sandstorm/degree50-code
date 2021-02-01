import { configureStore, ThunkAction, Action, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit'
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { select } from 'redux-saga/effects'
import { all, spawn, call } from 'redux-saga/effects'
import { subtitlesAppSlice } from '../SubtitlesAppSlice'
import subtitleEditSaga from '../SubtitlesSaga'
import { SubtitlesSlice } from 'Components/SubtitleEditor/SubtitlesSlice'
import MediaLaneRenderConfigSlice from 'Components/VideoEditor/MediaLaneRenderConfigSlice'
import PlayerSlice from 'Components/VideoEditor/PlayerSlice'

const sagaMiddleWare = createSagaMiddleware()

export const store = configureStore({
    reducer: {
        videoEditor: combineReducers({
            player: PlayerSlice,
            mediaLaneRenderConfig: MediaLaneRenderConfigSlice,
        }),
        subtitles: SubtitlesSlice.reducer,
        subtitlesApp: subtitlesAppSlice.reducer,
    },
    middleware: [...getDefaultMiddleware(), sagaMiddleWare],
    devTools: {
        name: 'SubtitleApp',
    },
})

const sagas = [subtitleEditSaga]
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
