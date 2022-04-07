import { createAction } from '@reduxjs/toolkit'
import { actions, selectors } from '../../VideoEditorSlice'
import { selectState } from '../../../../StimulusControllers/ExerciseAndSolutionStore/Store'
import { put, takeLatest } from 'redux-saga/effects'
import { playShortCutSuccessSoundAction, playShortCutTriggerSoundAction } from '../shortCutSoundsSaga'

export const togglePlayShortCutAction = createAction('SAGA/SHORT_CUT/TOGGLE_PLAY')

export function* togglePlayShortCutSaga() {
    yield takeLatest(togglePlayShortCutAction, togglePlayShortCut)
}

function* togglePlayShortCut() {
    const isPaused = selectors.player.selectIsPaused(yield selectState())

    yield put(actions.player.togglePlay())

    const newIsPaused = selectors.player.selectIsPaused(yield selectState())

    if (isPaused != newIsPaused) {
        yield put(playShortCutSuccessSoundAction())
    } else {
        yield put(playShortCutTriggerSoundAction())
    }
}
