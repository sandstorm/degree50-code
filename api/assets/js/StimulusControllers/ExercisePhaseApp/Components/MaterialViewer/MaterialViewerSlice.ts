import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { Material } from './MaterialViewer'

interface MaterialViewerState {
    activeMaterial?: Material
}

const initialState: MaterialViewerState = {
    activeMaterial: undefined,
}

export const materialViewerSlice = createSlice({
    name: 'materialViewer',
    initialState,
    reducers: {
        setActiveMaterial: (state, action: PayloadAction<Material | undefined>) => {
            state.activeMaterial = action.payload
        },
    },
})

export const { setActiveMaterial } = materialViewerSlice.actions

export const selectActiveMaterial = (state: AppState) => state.materialViewer.activeMaterial

export default materialViewerSlice.reducer
