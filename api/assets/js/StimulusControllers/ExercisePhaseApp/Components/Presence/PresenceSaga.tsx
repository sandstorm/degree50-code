import { call, put, select, take, takeLatest } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import { ConnectionState, presenceActions, PresencePayload } from './PresenceSlice'
import { selectMercureEndpoint } from '../LiveSyncConfig/LiveSyncConfigSlice'

export const initPresenceAction = createAction('Presence/init', (topic: string) => ({ payload: topic }))
export const disconnectPresenceAction = createAction('Presence/disconnect')

export default function* presenceSaga() {
    yield takeLatest(initPresenceAction.type, flow)
}

// TODO must be streamlined and cleaned up.. WIP

/** flow:
 *
 *           +----------+         +-------------+         +---------+
 * Start --->+   Init   +-------->+   Connect   +-------->+  Error  +---> End
 *           +----------+         +-------------+         +---------+
 *                                       |
 *                                       v
 *                                +-------------+         +--------------+
 *                          +---->+  connected  +-------->+  Disconnect  +---> End
 *                          |     +-------------+         +--------------+
 *                          |            | (onMessage)
 *                 +-----------------+   |
 *                 |  FetchPresence  +<--+
 *                 +-----------------+
 *
 */
function* flow(action: ReturnType<typeof initPresenceAction>) {
    yield put(presenceActions.setConnectionState(ConnectionState.CONNECTING))

    try {
        const eventSource: EventSource = yield call(connect, action.payload)
        yield put(presenceActions.setConnectionState(ConnectionState.CONNECTED))

        // @ts-ignore -- Why: typescript thinks it's "possibly null"
        eventSource.onopen = () => {
            const subscriptions = Axios.get(
                '/.well-known/mercure/subscriptions/exercisePhaseTeam-2191372a-9a5f-4515-ac0b-7fc62ebe8f22',
                {
                    headers: {
                        'Content-Type': 'application/ld+json',
                    },
                }
            )
            console.log(subscriptions)
        }

        yield take(disconnectPresenceAction)
        eventSource.close()
        yield put(presenceActions.setConnectionState(ConnectionState.NOT_CONNECTED))
    } catch (e) {
        yield put(presenceActions.setError(e.message ?? e))
        yield put(presenceActions.setConnectionState(ConnectionState.NOT_CONNECTED))
    }
}

function* connect(topic: string) {
    try {
        // setup SSE for presence topic
        const mercureEndpoint: string = yield select(selectMercureEndpoint)

        const mercureUrl = new URL(mercureEndpoint, document.location.toString())
        mercureUrl.searchParams.append('topic', topic)

        return new EventSource(mercureUrl.toString())
    } catch (e) {
        throw new Error(e)
    }
}

function* handleIO(eventSource: EventSource) {
    while (true) {
        eventSource.onmessage = () => {
            // TODO if we get any message here -> fetch new presence state from API if we cannot put all relevant info into payload
        }

        eventSource.onerror = (event) => {
            throw new Error('error in eventSource!')
        }
    }
}

/*
function* fetchPresence() {
    yield put(presenceActions.setConnectionState(ConnectionState.CONNECTING))

    try {
        const presenceEndpoint: string = yield select(selectPresenceEndpoint)
        const presence = yield Axios.get<PresencePayload>(presenceEndpoint)
        yield put(presenceActions.setPresenceState(presence))
        yield put(presenceActions.setConnectionState(ConnectionState.CONNECTED))
    } catch (e) {
        yield put(presenceActions.setError(e.message))
        yield put(presenceActions.setConnectionState(ConnectionState.NOT_CONNECTED))
    }
}
*/
