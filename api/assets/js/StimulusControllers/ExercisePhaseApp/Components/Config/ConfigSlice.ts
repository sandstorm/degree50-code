import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Video } from '../../../../Components/VideoPlayer/VideoPlayerWrapper'
import { Material } from '../MaterialViewer/MaterialViewer'
import { ComponentTypesEnum, TabsTypesEnum } from 'types'
import { ExercisePhaseTypesEnum } from '../../Store/ExercisePhaseTypesEnum'
import { VideoListsState, VideoCodePrototype } from '../../../../Components/VideoEditor/VideoListsSlice'

export type ComponentId = ComponentTypesEnum | TabsTypesEnum

export type ApiEndpoints = {
    updateSolution: string
    updateCurrentEditor: string
}

export interface ConfigState {
    title: string
    description: string
    type: ExercisePhaseTypesEnum
    userId: string
    isGroupPhase: boolean
    dependsOnPreviousPhase: boolean
    previousSolutions: Array<{ userId: string; userName: string; solution: VideoListsState }>
    readOnly: boolean
    components: Array<ComponentId>
    material: Array<Material>
    videos: Array<Video>
    videoCodesPool: Array<VideoCodePrototype>
    apiEndpoints: ApiEndpoints
}

const initialState: ConfigState = {
    title: '',
    description: '',
    type: ExercisePhaseTypesEnum.VIDEO_ANALYSIS,
    userId: '',
    isGroupPhase: false,
    dependsOnPreviousPhase: false,
    previousSolutions: [],
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
        hydrateConfig: (state, action: PayloadAction<ConfigState>): ConfigState => ({
            ...state,
            ...action.payload,
        }),
    },
})

export const { hydrateConfig } = configSlice.actions
export const { actions } = configSlice

export type ConfigStateSlice = { config: ConfigState }

export const selectConfig = (state: ConfigStateSlice) => state.config
export const selectUserId = (state: ConfigStateSlice) => state.config.userId
export const selectReadOnly = (state: ConfigStateSlice) => state.config.readOnly
export const selectVideos = (state: ConfigStateSlice) => state.config.videos
export const selectVideoCodesPool = (state: ConfigStateSlice) => state.config.videoCodesPool

export const selectAnnotationsAreActive = (state: ConfigStateSlice) =>
    state.config.components.findIndex((c) => c === TabsTypesEnum.VIDEO_ANNOTATIONS) > -1
export const selectVideoCodesAreActive = (state: ConfigStateSlice) =>
    state.config.components.findIndex((c) => c === TabsTypesEnum.VIDEO_CODES) > -1
export const selectCutsAreActive = (state: ConfigStateSlice) =>
    state.config.components.findIndex((c) => c === TabsTypesEnum.VIDEO_CUTTING) > -1

export const selectors = {
    selectConfig,
    selectUserId,
    selectReadOnly,
    selectVideos,
    selectVideoCodesPool,
    selectAnnotationsAreActive,
    selectVideoCodesAreActive,
    selectCutsAreActive,
}

export default configSlice.reducer
