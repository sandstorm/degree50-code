import { put, takeLatest } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'
import {
    internalShortCutToActionCreatorMap,
    selectShortCutMapping,
    setShortCuts,
    ShortCutsState,
} from './ShortCutsSlice'
import { selectState } from './StimulusControllers/ExerciseAndSolutionStore/Store'

export const initializeShortCuts = createAction('SAGA/SHORT_CUTS/INITIALIZE')
export const persistShortCuts = createAction('SAGA/SHORT_CUTS/PERSIST')
export const triggerShortCut = createAction(
    'SAGA/SHORT_CUTS/TRIGGER_SHORT_CUT',
    (shortCut: keyof typeof internalShortCutToActionCreatorMap) => ({ payload: { shortCut } })
)

export function* shortCutsSaga() {
    yield takeLatest(initializeShortCuts, initializeShortCutsSaga)
    yield takeLatest(persistShortCuts, persistShortCutsSaga)
    yield takeLatest(triggerShortCut, triggerShortCutSaga)
}

const STORAGE_KEY = 'degree-short-cuts'

function* initializeShortCutsSaga() {
    const persistedShortCuts = localStorage.getItem(STORAGE_KEY)

    if (persistedShortCuts) {
        debugger

        const shortCutsFromStore = selectShortCutMapping(yield selectState())
        const shortCutsFromLocalStorage = JSON.parse(persistedShortCuts) as ShortCutsState

        // set new state as combination
        const combinedShortCuts = {
            ...shortCutsFromStore,
            ...shortCutsFromLocalStorage,
        }

        yield put(setShortCuts(combinedShortCuts))
    }
}

function* persistShortCutsSaga() {
    const shortCuts = selectShortCutMapping(yield selectState())

    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortCuts))
}

function* triggerShortCutSaga(action: ReturnType<typeof triggerShortCut>) {
    const actionCreator = internalShortCutToActionCreatorMap[action.payload.shortCut]

    yield put(actionCreator())
}
