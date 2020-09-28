import { call, cancel, cancelled, debounce, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { eventChannel, EventChannel } from 'redux-saga'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import {
    ConnectionState,
    presenceActions,
    selectTeamMemberIds,
    selectTeamMembersById,
    TeamMember,
} from './PresenceSlice'
import { selectLiveSyncConfig } from '../LiveSyncConfig/LiveSyncConfigSlice'
import { selectCurrentEditorId } from './CurrentEditorSlice'
import { selectConfig, selectUserId } from '../Config/ConfigSlice'

export const initPresenceAction = createAction('Presence/Saga/init')
export const disconnectPresenceAction = createAction('Presence/Saga/disconnect')
const eventStreamOpenedAction = createAction('Presence/Saga/eventStreamOpened')
const eventStreamMessageAction = createAction('Presence/Saga/eventStreamMessage')
export const promoteUserToCurrentEditorAction = createAction(
    'Presence/Saga/promoteUserToCurrentEditor',
    (userId: string) => ({
        payload: { userId },
    })
)

/**
 * TODO:
 * This is just a first draft value - check if we can lower the value and can still prevent false positive
 * presence state updated
 */
const PRESENCE_DEBOUNCE_MS = 5000

export default function* presenceSaga() {
    yield takeLatest(initPresenceAction, presenceListener)
    yield takeLatest(eventStreamOpenedAction, fetchSubscriptions)
    yield debounce(PRESENCE_DEBOUNCE_MS, eventStreamMessageAction, fetchSubscriptions)
    yield takeLatest(promoteUserToCurrentEditorAction, promoteUserToCurrentEditor)
}

// presenceListenerLifeCycle
function* presenceListener() {
    const lifeSyncConfig = selectLiveSyncConfig(yield select())
    yield put(presenceActions.setIsConnecting(true))

    try {
        // setup SSE for presence topic
        const mercureUrl = new URL(lifeSyncConfig.mercureEndpoint, document.location.toString())
        mercureUrl.searchParams.append('topic', lifeSyncConfig.topics.presence)
        const eventSource = new EventSource(mercureUrl.toString())
        const eventChannel = yield call(connect, eventSource)
        yield put(presenceActions.setIsConnecting(false))

        const messageHandler = yield fork(handleMessages, eventChannel)
        // TODO maybe remove as we do listen for open now
        yield* fetchSubscriptions()

        // wait for disconnect by user
        yield take(disconnectPresenceAction)
        yield cancel(messageHandler)
    } catch (e) {
        yield put(presenceActions.setError(e.message ?? e))
        yield put(presenceActions.setIsConnecting(false))
    }
}

function connect(eventSource: EventSource) {
    return eventChannel((emit) => {
        eventSource.onmessage = (ev) => {
            emit(eventStreamMessageAction()) // the payload is irrelevant because we call the subscription api anyways
        }

        eventSource.onopen = () => {
            emit(eventStreamOpenedAction()) // the payload is irrelevant because we call the subscription api anyways
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
const transformSubscriptionsToTeamMembers = (subscriptions: Array<Subscription>): Record<string, TeamMember> =>
    subscriptions.reduce(
        (acc, subscription) => ({
            ...acc,
            [subscription.payload.user.id]: {
                id: subscription.payload.user.id,
                name: subscription.payload.user.name,
                // TODO: we ignore subscription.active for now because the subscription will vanish if the user really quit
                connectionState: ConnectionState.CONNECTED,
            },
        }),
        {}
    )

/**
 * Get the Id of the first online team member sorted alphabetically by id
 */
const getNewEditorId = (teamMembers: Record<string, TeamMember>) =>
    Object.keys(teamMembers)
        .filter((memberId) => teamMembers[memberId].connectionState === ConnectionState.CONNECTED)
        .sort()
        .shift()

/**
 * Push actions emitted from custom channel to root saga
 */
function* handleMessages(channel: EventChannel<unknown>) {
    try {
        while (true) {
            const action = yield take(channel)

            switch (action.type) {
                case eventStreamOpenedAction.type:
                    yield put(eventStreamOpenedAction())
                    break
                case eventStreamMessageAction.type:
                    yield put(eventStreamMessageAction())
                    break
            }
        }
    } finally {
        channel.close()
    }
}

function* fetchSubscriptions() {
    const lifeSyncConfig = selectLiveSyncConfig(yield select())
    const subscriptions: Array<Subscription> = (yield Axios.get(lifeSyncConfig.subscriptionsEndpoint, {
        headers: {
            'Content-Type': 'application/ld+json',
        },
    })).data.subscriptions

    // merge existing teamMembers with Members in Subscription
    // possibly adding new members
    // setting the connection state of members that are not subscribed to DISCONNECTED
    const teamMembersFromState = selectTeamMembersById(yield select())

    // set all members as DISCONNECTED - only members with active subscription will be set as CONNECTED again
    const teamMembersFromStateDisconnected: Record<string, TeamMember> = selectTeamMemberIds(yield select()).reduce(
        (acc, teamMemberId) => ({
            ...acc,
            [teamMemberId]: {
                ...teamMembersFromState[teamMemberId],
                connectionState: ConnectionState.DISCONNECTED,
            },
        }),
        {}
    )
    const teamMembersInSubscription = transformSubscriptionsToTeamMembers(subscriptions)
    const updatedTeamMembers = Object.keys(teamMembersInSubscription).reduce(
        (acc, teamMemberId) => ({
            ...acc,
            [teamMemberId]: {
                ...teamMembersInSubscription[teamMemberId],
            },
        }),
        teamMembersFromStateDisconnected
    )

    // WHY: it's possible that while a team phase session is open, that other members join the team - so we need to update those
    yield put(presenceActions.setTeamMembers(updatedTeamMembers))

    // if the currentEditor leaves the next teamMember automatically becomes the currentEditor
    const currentEditorId = selectCurrentEditorId(yield select())
    const userId = selectUserId(yield select())

    if (currentEditorId && updatedTeamMembers[currentEditorId].connectionState !== ConnectionState.CONNECTED) {
        const newEditorId = getNewEditorId(updatedTeamMembers)
        // Why: only the new currentEditor needs to send the update request
        if (userId === newEditorId) {
            try {
                Axios.post(selectConfig(yield select()).apiEndpoints.updateCurrentEditor, {
                    currentEditorCandidateId: newEditorId,
                })
            } catch (e) {
                console.warn('>>>>> updateCurrentEditor', e)
            }
        }
    }
}

function* promoteUserToCurrentEditor(action: ReturnType<typeof promoteUserToCurrentEditorAction>) {
    const userId = selectUserId(yield select())
    const currentEditorId = selectCurrentEditorId(yield select())

    const { userId: userIdToPromote } = action.payload

    if (userId === currentEditorId) {
        try {
            Axios.post(selectConfig(yield select()).apiEndpoints.updateCurrentEditor, {
                currentEditorCandidateId: userIdToPromote,
            })
        } catch (e) {
            console.warn('>>>>> updateCurrentEditor', e)
        }
    }
}
