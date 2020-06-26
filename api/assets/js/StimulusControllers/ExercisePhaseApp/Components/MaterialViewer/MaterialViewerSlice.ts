import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';
import {Material} from "./MaterialViewer";

interface MaterialViewerState {
    activeMaterial: Material
}

const initialState: MaterialViewerState = {
    activeMaterial: null,
};

export const materialViewerSlice = createSlice({
    name: 'materialViewer',
    initialState,
    reducers: {
        setActiveMaterial: (state, action: PayloadAction<Material>) => {
            state.activeMaterial = action.payload
        },
    },
});

export const { setActiveMaterial } = materialViewerSlice.actions;

export const selectActiveMaterial = (state: RootState) => state.materialViewer.activeMaterial;

export default materialViewerSlice.reducer;
