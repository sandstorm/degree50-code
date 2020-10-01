import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Video } from '../../../../Components/VideoPlayer/VideoPlayerWrapper'
import { Material } from '../MaterialViewer/MaterialViewer'
import { ComponentTypesEnum, TabsTypesEnum } from 'types'
import { ExercisePhaseTypesEnum } from '../../Store/ExercisePhaseTypesEnum'
import { VideoCodePrototype } from 'Components/VideoEditor/Editors/VideoCodeEditor/types'
import { VideoListsState } from '../../../../Components/VideoEditor/VideoListsSlice'

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

export const selectConfig = (state: { config: ConfigState }) => state.config
export const selectUserId = (state: { config: ConfigState }) => state.config.userId
export const selectReadOnly = (state: { config: ConfigState }) => state.config.readOnly

export const selectors = {
    selectConfig,
    selectUserId,
    selectReadOnly,
}

export default configSlice.reducer
