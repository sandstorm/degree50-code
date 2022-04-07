import { createAction } from '@reduxjs/toolkit'
import { put, takeLatest } from 'redux-saga/effects'
import { actions as OverlayActions } from '../../components/OverlayContainer/OverlaySlice'
import { playShortCutSuccessSoundAction } from '../shortCutSoundsSaga'
import { actions as PlayerActions } from '../../PlayerSlice'

export const openOverlayAction = createAction('SAGA/SHORT_CUT/OPEN_OVERLAY', (overlayId: string) => ({
    payload: { overlayId },
}))

export function* openOverlayShortCutSaga() {
    yield takeLatest(openOverlayAction, openOverlay)
}

function* openOverlay(action: ReturnType<typeof openOverlayAction>) {
    yield put(PlayerActions.setPause(true))
    yield put(OverlayActions.setOverlay({ overlayId: action.payload.overlayId, closeOthers: true }))

    yield put(playShortCutSuccessSoundAction())
}
