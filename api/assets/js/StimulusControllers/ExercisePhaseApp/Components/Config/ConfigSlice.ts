import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { Video } from '../VideoPlayer/VideoPlayerWrapper'
import { Material } from '../MaterialViewer/MaterialViewer'
import { ComponentTypesEnum, TabsTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ComponentTypesEnum'
import { ExercisePhaseTypesEnum } from '../../Store/ExercisePhaseTypesEnum'

export type ComponentId = ComponentTypesEnum | TabsTypesEnum

export type ApiEndpoints = {
    updateSolution: string
    updateCurrentEditor: string
}

export type VideoCodePrototype = {
    id: string
    name: string
    description: string
    color: string
    userCreated: boolean
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
    videoCodesPool: Array<VideoCodePrototype>
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
    videoCodesPool: [],
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
export const selectReadOnly = (state: AppState) => state.config.readOnly

export default configSlice.reducer
