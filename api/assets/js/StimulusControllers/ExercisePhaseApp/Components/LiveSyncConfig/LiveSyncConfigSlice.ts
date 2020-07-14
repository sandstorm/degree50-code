import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'

type LiveSyncConfigState = {
    topics: {
        solution: string
        presence: string
    }
    mercureEndpoint: string
    subscriptionsEndpoint: string
}

const initialState: LiveSyncConfigState = {
    topics: {
        solution: '',
        presence: '',
    },
    mercureEndpoint: '',
    subscriptionsEndpoint: '',
}

const LiveSyncConfigSlice = createSlice({
    name: 'LiveSyncConfig',
    initialState,
    reducers: {
        hydrateLiveSyncConfig: (
            state: LiveSyncConfigState,
            action: PayloadAction<LiveSyncConfigState>
        ): LiveSyncConfigState => ({
            ...state,
            ...action.payload,
        }),
    },
})

export const { hydrateLiveSyncConfig } = LiveSyncConfigSlice.actions
export default LiveSyncConfigSlice.reducer

export const selectLiveSyncConfig = (state: AppState) => state.liveSyncConfig
