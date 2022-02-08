import { call, cancel, debounce, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { eventChannel, EventChannel, Task } from 'redux-saga'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import { selectLiveSyncConfig } from '../LiveSyncConfig/LiveSyncConfigSlice'
import { selectors as configSelectors } from '../Config/ConfigSlice'
import { selectCurrentEditorId, setCurrentEditorId } from '../Presence/CurrentEditorSlice'
import { initPresenceAction } from '../Presence/PresenceSaga'
import { selectors } from 'Components/VideoEditor/VideoEditorSlice'
import { initData } from 'Components/VideoEditor/initData'

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
        const eventChannel: EventChannel<EventSource> = yield call(connect, eventSource)

        yield put(initPresenceAction())

        const messageHandler: Task = yield fork(handleMessages, eventChannel)

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
            // FIXME any typing
            const action: { payload: any } = yield take(channel)

            // FIXME any typings
            // set currentEditor
            const eventData: { currentEditor: any; data: any } = yield JSON.parse(action.payload)
            const currentEditor: string = eventData.currentEditor
            yield put(setCurrentEditorId(currentEditor))

            const { data } = eventData

            yield put(initData(data))
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
        const solutionLists = selectors.selectSolutionLists(yield select())
        const updateSolutionEndpoint = configSelectors.selectConfig(yield select()).apiEndpoints.updateSolution

        try {
            yield Axios.post(updateSolutionEndpoint, solutionLists)
        } catch (e) {
            console.warn('>>>>> updateSolution', e)
        }
    }
}
