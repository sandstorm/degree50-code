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

export type Config = {
    title: string
    description: string
    type: ExercisePhaseTypesEnum
    userId: string
    isGroupPhase: boolean
    dependsOnPreviousPhase: boolean
    previousSolutions: Array<{ userId: string; solution: VideoListsState }>
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
        hydrateConfig: (state, action: PayloadAction<Config>): Config => ({
            ...state,
            ...action.payload,
        }),
    },
})

export const { hydrateConfig } = configSlice.actions

export const selectConfig = (state: { config: Config }) => state.config
export const selectUserId = (state: { config: Config }) => state.config.userId
export const selectReadOnly = (state: { config: Config }) => state.config.readOnly

export default configSlice.reducer
