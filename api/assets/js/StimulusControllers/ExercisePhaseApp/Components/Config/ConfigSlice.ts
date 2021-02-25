import { createSlice, PayloadAction, createSelector, Action } from '@reduxjs/toolkit'
import { Video } from '../../../../Components/VideoPlayer/VideoPlayerWrapper'
import { Material } from '../MaterialViewer/MaterialViewer'
import { ComponentTypesEnum, TabsTypesEnum } from 'types'
import { ExercisePhaseTypesEnum } from '../../Store/ExercisePhaseTypesEnum'
import { VideoCodePrototype, VideoListsState } from 'Components/VideoEditor/types'

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
    userName: string
    isGroupPhase: boolean
    dependsOnPreviousPhase: boolean
    previousSolutions: Array<{ id: string; userId: string; userName: string; solution: VideoListsState }>
    readOnly: boolean
    components: Array<ComponentId>
    material: Array<Material>
    videos: Array<Video>
    videoCodesPool: Array<VideoCodePrototype>
    apiEndpoints: ApiEndpoints
    isSolutionView: boolean
}

const initialState: ConfigState = {
    title: '',
    description: '',
    type: ExercisePhaseTypesEnum.VIDEO_ANALYSIS,
    userId: '',
    userName: '',
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
    isSolutionView: false,
}

export const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        hydrateConfig: (state, action: PayloadAction<ConfigState>): ConfigState => ({
            ...state,
            ...action.payload,
        }),
        setIsSolutionView: (state, _: Action) => ({
            ...state,
            isSolutionView: true,
        }),
    },
})

export const { hydrateConfig } = configSlice.actions
export const { actions } = configSlice

export type ConfigStateSlice = { config: ConfigState }

const selectConfig = (state: ConfigStateSlice) => state.config
const selectPhaseType = (state: ConfigStateSlice) => state.config.type
const selectUserId = (state: ConfigStateSlice) => state.config.userId
const selectUserName = (state: ConfigStateSlice) => state.config.userName
const selectReadOnly = (state: ConfigStateSlice) => state.config.readOnly
const selectVideos = (state: ConfigStateSlice) => state.config.videos
const selectVideoCodesPool = (state: ConfigStateSlice) => state.config.videoCodesPool
const selectComponents = (state: ConfigStateSlice) => state.config.components
const selectPreviousSolutions = (state: ConfigStateSlice) => state.config.previousSolutions
const selectIsGroupPhase = (state: ConfigStateSlice) => state.config.isGroupPhase
const selectTitle = (state: ConfigStateSlice) => state.config.title
const selectDescription = (state: ConfigStateSlice) => state.config.description
const selectIsSolutionView = (state: ConfigStateSlice) => state.config.isSolutionView

const selectAnnotationsAreActive = (state: ConfigStateSlice) =>
    state.config.components.findIndex((c) => c === TabsTypesEnum.VIDEO_ANNOTATIONS) > -1
const selectVideoCodesAreActive = (state: ConfigStateSlice) =>
    state.config.components.findIndex((c) => c === TabsTypesEnum.VIDEO_CODES) > -1
const selectCutsAreActive = (state: ConfigStateSlice) =>
    state.config.components.findIndex((c) => c === TabsTypesEnum.VIDEO_CUTTING) > -1

export const selectors = {
    selectConfig,
    selectPhaseType,
    selectUserId,
    selectUserName,
    selectReadOnly,
    selectIsSolutionView,
    selectVideos,
    selectVideoCodesPool,
    selectAnnotationsAreActive,
    selectVideoCodesAreActive,
    selectCutsAreActive,
    selectComponents,
    selectPreviousSolutions,
    selectIsGroupPhase,
    selectTitle,
    selectDescription,
}

export default configSlice.reducer
