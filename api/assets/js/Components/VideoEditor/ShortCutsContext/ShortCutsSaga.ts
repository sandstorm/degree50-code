import { put, takeLatest } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'
import { merge } from 'lodash'
import { selectState } from '../../../StimulusControllers/ExerciseAndSolutionStore/Store'
import { selectShortCutsState, setShortCutsState, ShortCutsState } from './ShortCutsSlice'

export const initializeShortCuts = createAction('SAGA/SHORT_CUTS/INITIALIZE')
export const persistShortCuts = createAction('SAGA/SHORT_CUTS/PERSIST')

export function* shortCutsSaga() {
    yield takeLatest(initializeShortCuts, initializeShortCutsSaga)
    yield takeLatest(persistShortCuts, persistShortCutsSaga)
}

const STORAGE_KEY = 'degree-short-cuts'

function* initializeShortCutsSaga() {
    const persistedShortCuts = localStorage.getItem(STORAGE_KEY)

    if (persistedShortCuts) {
        debugger

        const shortCutsStateFromStore = selectShortCutsState(yield selectState())
        const shortCutsStateFromLocalStorage = JSON.parse(persistedShortCuts) as ShortCutsState

        // set new state as combination
        const combinedShortCuts = merge({}, shortCutsStateFromStore, shortCutsStateFromLocalStorage)

        yield put(setShortCutsState(combinedShortCuts))
    }
}

function* persistShortCutsSaga() {
    const shortCuts = selectShortCutsState(yield selectState())

    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortCuts))
}
