import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';
import {overlaySizesEnum} from "./Overlay";

interface OverlayState {
    isVisible: boolean
    component: string,
    size: string,
}

const initialState: OverlayState = {
    isVisible: false,
    component: '',
    size: overlaySizesEnum.DEFAULT,
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
        setOverlaySize: (state, action: PayloadAction<string>) => {
            state.size = action.payload
        },
    },
});

export const { toggleOverlayVisibility, setOverlayComponent, setOverlaySize } = overlaySlice.actions;

export const selectIsVisible = (state: RootState) => state.overlay.isVisible;
export const selectComponent = (state: RootState) => state.overlay.component;
export const selectSize = (state: RootState) => state.overlay.size;

export default overlaySlice.reducer;
