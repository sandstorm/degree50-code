import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'

interface PlayerState {
    // The position which the player emits to other components
    // like the mediaLane.
    // This should only be set by the player component!
    syncPlayPosition: number

    // The actual play position of the player.
    // When this is set the player changes its position.
    playPosition: number
    isPlaying: boolean
    isPaused: boolean
}

const initialState: PlayerState = {
    syncPlayPosition: 0,
    playPosition: 0,
    isPlaying: false,
    isPaused: false,
}

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setSyncPlayPosition: (state, action: PayloadAction<number>) => {
            state.syncPlayPosition = action.payload
        },
        setPlayPosition: (state, action: PayloadAction<number>) => {
            state.playPosition = action.payload
        },
        togglePlay: (state) => {
            state.isPlaying = !state.isPlaying
        },
        setPause: (state, action: PayloadAction<boolean>) => {
            state.isPaused = action.payload
        },
    },
})

export const { actions } = playerSlice

// Selectors

const selectPlayPosition = (state: AppState) => state.player.playPosition
const selectSyncPlayPosition = (state: AppState) => state.player.syncPlayPosition
const selectIsPlaying = (state: AppState) => state.player.isPlaying
const selectIsPaused = (state: AppState) => state.player.isPaused

export const selectors = {
    selectSyncPlayPosition,
    selectIsPaused,
    selectIsPlaying,
    selectPlayPosition,
}

export default playerSlice.reducer
