import { combineReducers } from '@reduxjs/toolkit'
import {
    AnnotationsState,
    AnnotationsSlice,
    selectors as annotationSelectors,
} from './AnnotationsContext/AnnotationsSlice'
import { CutsSlice, CutsState, selectors as cutsSelectors } from './CuttingContext/CuttingSlice'
import {
    VideoCodePoolSlice,
    VideoCodePoolState,
    selectors as videoCodePoolSelectors,
} from './VideoCodesContext/VideoCodePoolSlice'
import { VideoCodesSlice, VideoCodesState, selectors as videoCodeSelectors } from './VideoCodesContext/VideoCodesSlice'

export type DataState = {
    annotations: AnnotationsState
    videoCodes: VideoCodesState
    videoCodePool: VideoCodePoolState
    cuts: CutsState
}

export default combineReducers({
    annotations: AnnotationsSlice.reducer,
    videoCodes: VideoCodesSlice.reducer,
    videoCodePool: VideoCodePoolSlice.reducer,
    cuts: CutsSlice.reducer,
})

export const actions = {
    annotations: AnnotationsSlice.actions,
    videoCodes: VideoCodesSlice.actions,
    videoCodePool: VideoCodePoolSlice.actions,
    cuts: CutsSlice.actions,
}

export const selectors = {
    annotations: annotationSelectors,
    videoCodes: videoCodeSelectors,
    videoCodePool: videoCodePoolSelectors,
    cuts: cutsSelectors,
}
