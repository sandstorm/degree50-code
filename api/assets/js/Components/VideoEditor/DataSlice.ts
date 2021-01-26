import { combineReducers } from '@reduxjs/toolkit'
import { AnnotationsState, AnnotationsSlice, selectors as annotationSelectors } from './AnnotationsSlice'
import { VideoCodePoolSlice, VideoCodePoolState, selectors as videoCodePoolSelectors } from './VideoCodePoolSlice'
import { VideoCodesSlice, VideoCodesState, selectors as videoCodeSelectors } from './VideoCodesSlice'

export type DataState = {
    annotations: AnnotationsState
    videoCodes: VideoCodesState
    customVideoCodePool: VideoCodePoolState
}

export default combineReducers({
    annotations: AnnotationsSlice.reducer,
    videoCodes: VideoCodesSlice.reducer,
    videoCodePool: VideoCodePoolSlice.reducer,
})

export const actions = {
    annotations: AnnotationsSlice.actions,
    videoCodes: VideoCodesSlice.actions,
    videoCodePool: VideoCodePoolSlice.actions,
}

export const selectors = {
    annotations: annotationSelectors,
    videoCodes: videoCodeSelectors,
    videoCodePool: videoCodePoolSelectors,
}
