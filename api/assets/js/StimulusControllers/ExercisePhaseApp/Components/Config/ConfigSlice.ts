import { Action, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Video } from '../../../../Components/VideoPlayer/VideoPlayerWrapper'
import { Material } from '../MaterialViewer/MaterialViewer'
import { ComponentTypesEnum, TabsTypesEnum } from 'types'
import { ExercisePhaseTypesEnum } from '../../../ExerciseAndSolutionStore/ExercisePhaseTypesEnum'

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
    readOnly: boolean
    components: Array<ComponentId>
    material: Array<Material>
    videos: Array<Video>
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
    readOnly: false,
    components: [],
    material: [],
    videos: [],
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
export const selectComponents = (state: ConfigStateSlice) => state.config.components
const selectIsGroupPhase = (state: ConfigStateSlice) => state.config.isGroupPhase
const selectTitle = (state: ConfigStateSlice) => state.config.title
const selectDescription = (state: ConfigStateSlice) => state.config.description
const selectIsSolutionView = (state: ConfigStateSlice) => state.config.isSolutionView
const selectDependsOnPreviousPhase = (state: ConfigStateSlice) => state.config.dependsOnPreviousPhase

const selectAnnotationsAreActive = (state: ConfigStateSlice) =>
    state.config.components.includes(TabsTypesEnum.VIDEO_ANNOTATIONS)
const selectVideoCodesAreActive = (state: ConfigStateSlice) =>
    state.config.components.includes(TabsTypesEnum.VIDEO_CODES)
const selectCutsAreActive = (state: ConfigStateSlice) => state.config.components.includes(TabsTypesEnum.VIDEO_CUTTING)

export const selectors = {
    selectConfig,
    selectPhaseType,
    selectUserId,
    selectUserName,
    selectReadOnly,
    selectIsSolutionView,
    selectVideos,
    selectAnnotationsAreActive,
    selectVideoCodesAreActive,
    selectCutsAreActive,
    selectComponents,
    selectIsGroupPhase,
    selectTitle,
    selectDescription,
    selectDependsOnPreviousPhase,
}

export default configSlice.reducer
