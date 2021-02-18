import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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
            return {
                ...state,
                activeMaterial: action.payload,
            }
        },
    },
})

export const { setActiveMaterial } = materialViewerSlice.actions

export type MaterialViewerStateSlice = { materialViewer: MaterialViewerState }

export const selectActiveMaterial = (state: MaterialViewerStateSlice) => state.materialViewer.activeMaterial

export default materialViewerSlice.reducer
