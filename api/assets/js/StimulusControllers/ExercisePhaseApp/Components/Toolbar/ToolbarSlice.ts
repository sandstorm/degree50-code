import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../../ExerciseAndSolutionStore/Store'

interface ToolbarState {
    activeToolbarItem: string
    isVisible: boolean
}

const initialState: ToolbarState = {
    activeToolbarItem: '',
    isVisible: false,
}

export const toolbarSlice = createSlice({
    name: 'toolbar',
    initialState,
    reducers: {
        toggleComponent: (state, action: PayloadAction<string>) => {
            const toggledItem = state.activeToolbarItem === action.payload ? '' : action.payload

            return {
                ...state,
                activeToolbarItem: toggledItem,
            }
        },
        toggleToolbarVisibility: (state) => {
            return {
                ...state,
                isVisible: !state.isVisible,
            }
        },
    },
})

export const { toggleComponent, toggleToolbarVisibility } = toolbarSlice.actions

export const selectActiveToolbarItem = (state: AppState) => state.toolbar.activeToolbarItem
export const selectIsVisible = (state: AppState) => state.toolbar.isVisible

export default toolbarSlice.reducer
