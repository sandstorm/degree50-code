import { combineReducers } from '@reduxjs/toolkit'
import {
    AnnotationsState,
    AnnotationsSlice,
    selectors as annotationSelectors,
} from './AnnotationsContext/AnnotationsSlice'
import { CutsSlice, CutsState, selectors as cutsSelectors } from './CuttingContext/CuttingSlice'
import {
    VideoCodePrototypesSlice,
    VideoCodePrototypesState,
    selectors as videoCodePoolSelectors,
} from './VideoCodesContext/VideoCodePrototypesSlice'
import { VideoCodesSlice, VideoCodesState, selectors as videoCodeSelectors } from './VideoCodesContext/VideoCodesSlice'

export type DataState = {
    annotations: AnnotationsState
    videoCodes: VideoCodesState
    videoCodePrototypes: VideoCodePrototypesState
    cuts: CutsState
}

export default combineReducers({
    annotations: AnnotationsSlice.reducer,
    videoCodes: VideoCodesSlice.reducer,
    videoCodePrototypes: VideoCodePrototypesSlice.reducer,
    cuts: CutsSlice.reducer,
})

export const actions = {
    annotations: AnnotationsSlice.actions,
    videoCodes: VideoCodesSlice.actions,
    videoCodePrototypes: VideoCodePrototypesSlice.actions,
    cuts: CutsSlice.actions,
}

export const selectors = {
    annotations: annotationSelectors,
    videoCodes: videoCodeSelectors,
    videoCodePrototypes: videoCodePoolSelectors,
    cuts: cutsSelectors,
}
