import { call, cancel, debounce, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { eventChannel, EventChannel } from 'redux-saga'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import { selectLiveSyncConfig } from '../LiveSyncConfig/LiveSyncConfigSlice'
import { selectors as configSelectors } from '../Config/ConfigSlice'
import { selectCurrentEditorId, setCurrentEditorId } from '../Presence/CurrentEditorSlice'
import { initPresenceAction } from '../Presence/PresenceSaga'
import { actions, selectors } from 'Components/VideoEditor/VideoEditorSlice'
import { normalizeAPIResponseForExercisePhaseApp } from 'StimulusControllers/normalizeData'

export const initSolutionSyncAction = createAction('Solution/Saga/init')
export const disconnectSolutionSyncAction = createAction('Solution/Saga/disconnect')
export const updateSolutionAction = createAction('Solution/Saga/updateSolution', (data) => ({ payload: data }))
export const syncSolutionAction = createAction('Solution/Saga/SyncSolution')

export default function* solutionSaga() {
    yield takeLatest(initSolutionSyncAction.type, solutionSyncListener)
    yield debounce(1000, syncSolutionAction.type, syncSolution)
}

function* solutionSyncListener() {
    const lifeSyncConfig = selectLiveSyncConfig(yield select())

    try {
        // setup SSE for presence topic
        const mercureUrl = new URL(lifeSyncConfig.mercureEndpoint, document.location.toString())
        mercureUrl.searchParams.append('topic', lifeSyncConfig.topics.solution)
        const eventSource = new EventSource(mercureUrl.toString())
        const eventChannel = yield call(connect, eventSource)

        yield put(initPresenceAction())

        const messageHandler = yield fork(handleMessages, eventChannel)

        // wait for disconnect by user
        yield take(disconnectSolutionSyncAction)
        yield cancel(messageHandler)
    } catch (e) {
        console.error(e)
    }
}

function connect(eventSource: EventSource) {
    return eventChannel((emit) => {
        // eslint-disable-next-line
        eventSource.onmessage = (ev) => {
            emit(updateSolutionAction(ev.data))
        }

        return () => {
            eventSource.close()
        }
    })
}

function* handleMessages(channel: EventChannel<unknown>) {
    try {
        while (true) {
            const action = yield take(channel)

            // set currentEditor
            const eventData = yield JSON.parse(action.payload)
            const currentEditor: string = eventData.currentEditor
            yield put(setCurrentEditorId(currentEditor))

            // set solution
            const solution = eventData.solution

            const currentConfig = configSelectors.selectConfig(yield select())

            const normalizedAPIResponse = normalizeAPIResponseForExercisePhaseApp(solution, currentConfig)

            yield put(actions.data.annotations.init({ byId: normalizedAPIResponse.entities.annotations }))
            yield put(actions.data.videoCodes.init({ byId: normalizedAPIResponse.entities.videoCodes }))
            yield put(
                actions.data.videoCodePrototypes.init({ byId: normalizedAPIResponse.entities.customVideoCodesPool })
            )
            yield put(actions.data.cuts.init({ byId: normalizedAPIResponse.entities.cutList }))
        }
    } finally {
        channel.close()
    }
}

/**
 * Upload solution if user is currentEditor
 */
function* syncSolution() {
    const config = configSelectors.selectConfig(yield select())

    if (!config.readOnly && config.userId === selectCurrentEditorId(yield select())) {
        const solution = selectors.selectSolution(yield select())
        const updateSolutionEndpoint = configSelectors.selectConfig(yield select()).apiEndpoints.updateSolution

        try {
            yield Axios.post(updateSolutionEndpoint, {
                solution,
            })
        } catch (e) {
            console.warn('>>>>> updateSolution', e)
        }
    }
}
