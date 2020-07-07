import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'

type LiveSyncConfigState = {
    topic: string
    exercisePhaseLiveSyncSubmitUrl: string
    mercureEndpoint: string
}

const initialState: LiveSyncConfigState = {
    topic: '',
    exercisePhaseLiveSyncSubmitUrl: '',
    mercureEndpoint: '',
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

export const selectMercureEndpoint = (state: AppState) => state.liveSyncConfig.mercureEndpoint
export const selectTopic = (state: AppState) => state.liveSyncConfig.topic
