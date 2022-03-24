import { actions as VideoEditorActions } from './Components/VideoEditor/PlayerSlice'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const internalShortCutToActionCreatorMap = {
    togglePlay: VideoEditorActions.togglePlay,
}

export type ShortCutsState = Record<string, keyof typeof internalShortCutToActionCreatorMap>

const initialState: ShortCutsState = {
    'ctrl+option+shift+p': 'togglePlay',
}

const ShortCutsSlice = createSlice({
    name: 'ShortCuts',
    initialState,
    reducers: {
        setShortCuts: (state: ShortCutsState, action: PayloadAction<ShortCutsState>): ShortCutsState => {
            return action.payload
        },
    },
})

export default ShortCutsSlice.reducer
export const { setShortCuts } = ShortCutsSlice.actions

export const selectShortCutMapping = (state: { shortCuts: ShortCutsState }) => state.shortCuts
