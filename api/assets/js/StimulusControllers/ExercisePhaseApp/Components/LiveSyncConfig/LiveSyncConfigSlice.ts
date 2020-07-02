import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type LiveSyncConfigState = {
    topics: {
        solution: string
        presence: string
    }
    mercureEndpoint: string
}

const initialState: LiveSyncConfigState = {
    topics: {
        solution: '',
        presence: '',
    },
    mercureEndpoint: '',
}

const LiveSyncConfigSlice = createSlice({
    name: 'LiveSyncConfig',
    initialState,
    reducers: {
        hydrateLiveSyncConfig: (
            state: LiveSyncConfigState,
            action: PayloadAction<LiveSyncConfigState>
        ): LiveSyncConfigState => action.payload,
    },
})

export const { hydrateLiveSyncConfig } = LiveSyncConfigSlice.actions
export default LiveSyncConfigSlice.reducer
