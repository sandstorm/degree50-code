import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';

interface ToolbarState {
    activeToolbarItem: string
    isVisible: boolean
}

const initialState: ToolbarState = {
    activeToolbarItem: null,
    isVisible: false,
};

export const toolbarSlice = createSlice({
    name: 'toolbar',
    initialState,
    reducers: {
        toggleComponent: (state, action: PayloadAction<string>) => {
            if (state.activeToolbarItem === action.payload) {
                state.activeToolbarItem = null
            } else {
                state.activeToolbarItem = action.payload
            }
        },
        toggleToolbarVisibility: (state) => {
            state.isVisible = !state.isVisible
        }
    },
});

export const { toggleComponent, toggleToolbarVisibility } = toolbarSlice.actions;

export const selectActiveToolbarItem = (state: RootState) => state.toolbar.activeToolbarItem;
export const selectIsVisible = (state: RootState) => state.toolbar.isVisible;

export default toolbarSlice.reducer;
