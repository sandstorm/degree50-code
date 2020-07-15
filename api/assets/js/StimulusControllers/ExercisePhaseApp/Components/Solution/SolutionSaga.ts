import { call, cancel, cancelled, debounce, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { eventChannel, EventChannel } from 'redux-saga'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import { selectLiveSyncConfig } from '../LiveSyncConfig/LiveSyncConfigSlice'
import { Solution, setSolution, selectSolution } from './SolutionSlice'
import { selectConfig } from '../Config/ConfigSlice'

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

        // TODO if is leader -> do not listen
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
        eventSource.onmessage = (ev) => {
            emit(updateSolutionAction(ev.data)) // the payload is irrelevant because we call the subscription api anyways
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
            const solution: Solution = yield JSON.parse(action.payload).solution
            yield put(setSolution(solution))
        }
    } finally {
        if (yield cancelled()) {
            console.log('>>>>> Presence Saga: message channel closed by cancellation')
        }
        channel.close()
    }
}

function* syncSolution() {
    const solution = selectSolution(yield select())
    const updateSolutionEndpoint = selectConfig(yield select()).apiEndpoints.updateSolution

    yield Axios.post(updateSolutionEndpoint, {
        solution: solution,
    })
}
