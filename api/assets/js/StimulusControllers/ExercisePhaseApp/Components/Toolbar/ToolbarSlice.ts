import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';

interface ToolbarState {
    activeToolbarItem: string;
}

const initialState: ToolbarState = {
    activeToolbarItem: null,
};

export const toolbarSlice = createSlice({
    name: 'toolbar',
    initialState,
    reducers: {
        toggleComponent: (state, action: PayloadAction<string>) => {
            if (state.activeToolbarItem === action.payload) {
                state.activeToolbarItem = null;
            } else {
                state.activeToolbarItem = action.payload;
            }

        },
    },
});

export const { toggleComponent } = toolbarSlice.actions;

export const selectActiveToolbarItem = (state: RootState) => state.toolbar.activeToolbarItem;

export default toolbarSlice.reducer;
