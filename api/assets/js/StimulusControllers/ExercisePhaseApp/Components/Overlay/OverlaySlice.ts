import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';

interface OverlayState {
    isVisible: boolean
    component: string,
}

const initialState: OverlayState = {
    isVisible: false,
    component: '',
};

export const overlaySlice = createSlice({
    name: 'overlay',
    initialState,
    reducers: {
        toggleOverlayVisibility: (state, action: PayloadAction<boolean>) => {
            state.isVisible = action.payload
        },
        setOverlayComponent: (state, action: PayloadAction<string>) => {
            state.component = action.payload
        },
    },
});

export const { toggleOverlayVisibility, setOverlayComponent } = overlaySlice.actions;

export const selectIsVisible = (state: RootState) => state.overlay.isVisible;
export const selectComponent = (state: RootState) => state.overlay.component;

export default overlaySlice.reducer;
