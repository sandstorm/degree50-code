import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, AppState } from '../../Store/Store'
import Axios from 'axios'

export enum ConnectionState {
    CONNECTED,
    NOT_CONNECTED,
}

export type TeamMemberId = string
export type TeamMember = {
    id: TeamMemberId
    name: string
    connectionState: ConnectionState
}

type PresenceState = {
    teamMemberIds: Array<TeamMemberId>
    teamMembersById: Record<TeamMemberId, TeamMember>
}

const initialState: PresenceState = {
    teamMemberIds: [],
    teamMembersById: {},
}

const PresenceSlice = createSlice({
    name: 'Presence',
    initialState,
    reducers: {
        setPresenceState: (state: PresenceState, action: PayloadAction<PresenceState>): PresenceState => ({
            ...state,
            ...action.payload,
        }),
    },
})

export const { setPresenceState } = PresenceSlice.actions
export default PresenceSlice.reducer

// Selectors

export const selectTeamMemberIds = (state: AppState) => state.presence.teamMemberIds
export const selectTeamMemberById = (id: TeamMemberId, state: AppState) => state.presence.teamMembersById[id]

// Thunks

export const fetchPresence = (): AppThunk => async (dispatch, getState) => {
    const presenceEndpoint = getState().config.apiEndpoints.presence
    const response = await Axios.get<PresenceState>(presenceEndpoint)

    dispatch(setPresenceState(response.data))
}

export const listenForPresenceChange = (): AppThunk => async (dispatch, getState) => {
    // setup SSE for presence topic
    const mercureUrl = new URL(getState().liveSyncConfig.mercureEndpoint, document.location.toString())
    mercureUrl.searchParams.append('topic', getState().liveSyncConfig.topics.presence)

    const eventSource = new EventSource(mercureUrl.toString())

    // if we get any message here -> fetch new presence state from API
    eventSource.onmessage = () => {
        dispatch(fetchPresence())
    }
}
