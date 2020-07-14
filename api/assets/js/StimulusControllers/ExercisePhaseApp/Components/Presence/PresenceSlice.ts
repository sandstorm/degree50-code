import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'

export enum ConnectionState {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    UNKNOWN = 'UNKNOWN',
}

export type TeamMemberId = string
export type TeamMember = {
    id: TeamMemberId
    name: string
}

export type PresenceState = {
    teamMemberIds: Array<TeamMemberId>
    teamMembersById: Record<TeamMemberId, TeamMember>
    teamMemberConnectionState: Record<TeamMemberId, ConnectionState>
    error?: string
    isConnecting: boolean
}

const initialState: PresenceState = {
    teamMemberIds: [],
    teamMembersById: {},
    teamMemberConnectionState: {},
    error: undefined,
    isConnecting: false,
}

const PresenceSlice = createSlice({
    name: 'Presence',
    initialState,
    reducers: {
        setTeamMembers: (
            state: PresenceState,
            action: PayloadAction<PresenceState['teamMembersById']>
        ): PresenceState => ({
            ...state,
            teamMemberIds: Object.keys(action.payload).reduce(
                (teamMemberIds, id) => (teamMemberIds.includes(id) ? teamMemberIds : [...teamMemberIds, id]),
                state.teamMemberIds
            ),
            teamMembersById: {
                ...state.teamMembersById,
                ...action.payload,
            },
        }),
        setTeamMemberConnectionState: (
            state: PresenceState,
            action: PayloadAction<PresenceState['teamMemberConnectionState']>
        ): PresenceState => ({
            ...state,
            teamMemberConnectionState: action.payload,
        }),
        setIsConnecting: (state: PresenceState, action: PayloadAction<boolean>): PresenceState => ({
            ...state,
            isConnecting: action.payload,
        }),
        setError: (state: PresenceState, action: PayloadAction<PresenceState['error']>): PresenceState => ({
            ...state,
            error: action.payload,
        }),
    },
})

export const presenceActions = PresenceSlice.actions
export default PresenceSlice.reducer

// Selectors

export const selectTeamMemberIds = (state: AppState) => state.presence.teamMemberIds
export const selectTeamMemberById = (id: TeamMemberId, state: AppState) => state.presence.teamMembersById[id]
export const selectTeamMemberConnectionStateById = (id: TeamMemberId, state: AppState) =>
    state.presence.teamMemberConnectionState[id]
export const selectIsConnecting = (state: AppState) => state.presence.isConnecting
