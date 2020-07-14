import { fork, cancel, put, select, take, takeLatest, cancelled, call } from 'redux-saga/effects'
import { eventChannel, EventChannel } from 'redux-saga'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import { ConnectionState, presenceActions, PresenceState } from './PresenceSlice'
import { selectLiveSyncConfig } from '../LiveSyncConfig/LiveSyncConfigSlice'

export const initPresenceAction = createAction('Presence/init')
export const disconnectPresenceAction = createAction('Presence/disconnect')

export default function* presenceSaga() {
    yield takeLatest(initPresenceAction.type, presenceListener)
}

// presenceListenerLifeCycle
function* presenceListener() {
    const lifeSyncConfig = selectLiveSyncConfig(yield select())
    yield put(presenceActions.setIsConnecting(true))

    try {
        // WHY: we need to subscribe to the solution - we do it here until there the solution connection is build
        // TODO remove once solution connection is build
        const solutionEventSource = yield* connectSolution()

        // setup SSE for presence topic
        const mercureUrl = new URL(lifeSyncConfig.mercureEndpoint, document.location.toString())
        mercureUrl.searchParams.append('topic', lifeSyncConfig.topics.presence)
        const eventSource = new EventSource(mercureUrl.toString())
        const eventChannel = yield call(connect, eventSource)
        yield put(presenceActions.setIsConnecting(false))

        const messageHandler = yield fork(handleMessages, eventChannel)

        // wait for disconnect by user
        yield take(disconnectPresenceAction)
        yield cancel(messageHandler)
    } catch (e) {
        yield put(presenceActions.setError(e.message ?? e))
        yield put(presenceActions.setIsConnecting(false))
    }
}

function* connectSolution() {
    const lifeSyncConfig = selectLiveSyncConfig(yield select())
    const mercureUrl = new URL(lifeSyncConfig.mercureEndpoint, document.location.toString())

    mercureUrl.searchParams.append('topic', lifeSyncConfig.topics.solution)

    return new EventSource(mercureUrl.toString())
}

function connect(eventSource: EventSource) {
    return eventChannel((emit) => {
        eventSource.onmessage = (ev) => {
            emit('message') // the payload is irrelevant because we call the subscription api anyways
        }

        eventSource.onopen = () => {
            emit('message') // the payload is irrelevant because we call the subscription api anyways
        }

        return () => {
            eventSource.close()
        }
    })
}

// Type of subscription in mercure subscription payload
type Subscription = {
    id: string // "/.well-known/mercure/subscriptions/exercisePhaseTeam-3b3b41a9-68e5-41d7-a080-58f537d429d6/urn%3Auuid%3A8d5cab9a-97e1-40f8-8406-c234b4549688",
    type: string // "Subscription",
    subscriber: string // "urn:uuid:8d5cab9a-97e1-40f8-8406-c234b4549688",
    topic: string // "exercisePhaseTeam-3b3b41a9-68e5-41d7-a080-58f537d429d6",
    active: boolean
    payload: {
        user: {
            id: string // "8607ec0e-debe-44de-82ed-ae6095f55835",
            name: string // "admin@sandstorm.de"
        }
    }
}

// Transform Subscription[] to TeamMember record & connection states
const retrieveTeamMembersAndConnectionStates = (
    subscriptions: Array<Subscription>
): {
    teamMembers: PresenceState['teamMembersById']
    teamMemberConnectionStates: PresenceState['teamMemberConnectionState']
} => ({
    teamMembers: subscriptions.reduce(
        (teamMembers: PresenceState['teamMembersById'], subscription) => ({
            ...teamMembers,
            [subscription.payload.user.id]: {
                id: subscription.payload.user.id,
                name: subscription.payload.user.name,
            },
        }),
        {}
    ),
    teamMemberConnectionStates: subscriptions.reduce(
        (teamMembersConnectionState: PresenceState['teamMemberConnectionState'], subscription) => ({
            ...teamMembersConnectionState,
            // TODO this will cause a short change from 'connected' to 'disconnected' and back again when the EventSource of this user refreshes
            [subscription.payload.user.id]: subscription.active
                ? ConnectionState.CONNECTED
                : ConnectionState.DISCONNECTED,
        }),
        {}
    ),
})

function* handleMessages(channel: EventChannel<unknown>) {
    const lifeSyncConfig = selectLiveSyncConfig(yield select())

    try {
        while (true) {
            // TODO: For now we get too many messages and onOpens'
            // Every time the EventSource renews itself we get an onopen
            // Same with messages
            yield take(channel)

            console.log('fetch subscriptions')
            const subscriptions: Array<Subscription> = (yield Axios.get(lifeSyncConfig.subscriptionsEndpoint, {
                headers: {
                    'Content-Type': 'application/ld+json',
                },
            })).data.subscriptions

            const { teamMembers, teamMemberConnectionStates } = retrieveTeamMembersAndConnectionStates(subscriptions)
            // WHY: it's possible that while a team phase session is open, that other members join the team - so we need to update those
            yield put(presenceActions.setTeamMembers(teamMembers))
            yield put(presenceActions.setTeamMemberConnectionState(teamMemberConnectionStates))
        }
    } finally {
        if (yield cancelled()) {
            console.log('>>>>> Presence Saga: message channel closed by cancellation')
        }
        channel.close()
    }
}
