import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PlayerState {
    // The position which the player emits to other components
    // like the mediaLane.
    // This should only be set by the player component!
    syncPlayPosition: number

    // The actual play position of the player.
    // When this is set the player changes its position.
    playPosition: number
    isPaused: boolean
}

const initialState: PlayerState = {
    syncPlayPosition: 0,
    playPosition: 0,
    isPaused: true,
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
            state.isPaused = !state.isPaused
        },
        setPause: (state, action: PayloadAction<boolean>) => {
            state.isPaused = action.payload
        },
    },
})

export const { actions } = playerSlice

// Selectors

const selectPlayPosition = (state: { player: PlayerState }) => state.player.playPosition
const selectSyncPlayPosition = (state: { player: PlayerState }) => state.player.syncPlayPosition
const selectIsPaused = (state: { player: PlayerState }) => state.player.isPaused

export const selectors = {
    selectSyncPlayPosition,
    selectIsPaused,
    selectPlayPosition,
}

export default playerSlice.reducer
