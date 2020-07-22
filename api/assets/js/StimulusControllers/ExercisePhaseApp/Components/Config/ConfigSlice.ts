import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { Video } from '../VideoPlayer/VideoPlayerWrapper'
import { Material } from '../MaterialViewer/MaterialViewer'
import { ComponentTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ComponentTypesEnum'
import { ExercisePhaseTypesEnum } from '../../Store/ExercisePhaseTypesEnum'

export type ComponentId = ComponentTypesEnum

export type ApiEndpoints = {
    updateSolution: string
    updateCurrentEditor: string
}

export type VideoCode = {
    id: string
    name: string
    description: string
    color: string
}

export type Config = {
    title: string
    description: string
    type: ExercisePhaseTypesEnum
    userId: string
    isGroupPhase: boolean
    readOnly: boolean
    components: Array<ComponentId>
    material: Array<Material>
    videos: Array<Video>
    videoCodes: Array<VideoCode>
    apiEndpoints: ApiEndpoints
}

const initialState: Config = {
    title: '',
    description: '',
    type: ExercisePhaseTypesEnum.VIDEO_ANALYSIS,
    userId: '',
    isGroupPhase: false,
    readOnly: false,
    components: [],
    material: [],
    videos: [],
    videoCodes: [],
    apiEndpoints: {
        updateSolution: '',
        updateCurrentEditor: '',
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
export const selectUserId = (state: AppState) => state.config.userId

export default configSlice.reducer
