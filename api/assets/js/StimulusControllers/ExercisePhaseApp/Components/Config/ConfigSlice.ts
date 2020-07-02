import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { Video } from '../VideoPlayer/VideoPlayerWrapper'
import { Material } from '../MaterialViewer/MaterialViewer'
import { ComponentTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ComponentTypesEnum'

export type ComponentId = ComponentTypesEnum

export type ApiEndpoints = {
    updateSolution: string
    presence: string
}

export type Config = {
    title: string
    description: string
    type: string
    components: Array<ComponentId>
    material: Array<Material>
    videos: Array<Video>
    apiEndpoints: ApiEndpoints
}

const initialState: Config = {
    title: '',
    description: '',
    type: '',
    components: [],
    material: [],
    videos: [],
    apiEndpoints: {
        updateSolution: '',
        presence: '',
    },
}

export const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        hydrateConfig: (state, action: PayloadAction<Config>): Config => ({
            ...state,
            ...action.payload,
        }),
    },
})

export const { hydrateConfig } = configSlice.actions

export const selectConfig = (state: AppState) => state.config

export default configSlice.reducer
