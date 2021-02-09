import { combineReducers, createSelector } from '@reduxjs/toolkit'
import {
    AnnotationsState,
    annotationsSlice,
    selectors as annotationSelectors,
} from './AnnotationsContext/AnnotationsSlice'
import { cuttingSlice, CutsState, selectors as cutsSelectors } from './CuttingContext/CuttingSlice'
import {
    VideoCodePrototypesSlice,
    VideoCodePrototypesState,
    selectors as videoCodePoolSelectors,
} from './VideoCodesContext/VideoCodePrototypesSlice'
import { videoCodesSlice, VideoCodesState, selectors as videoCodeSelectors } from './VideoCodesContext/VideoCodesSlice'
import { SolutionSlice, selectors as solutionSelectors, SolutionState } from './SolutionSlice'
import { VideoCode, Annotation, Cut } from './types'

export type DataState = {
    solutions: SolutionState
    annotations: AnnotationsState
    videoCodes: VideoCodesState
    videoCodePrototypes: VideoCodePrototypesState
    cuts: CutsState
}

export default combineReducers({
    solutions: SolutionSlice.reducer,
    annotations: annotationsSlice.reducer,
    videoCodes: videoCodesSlice.reducer,
    videoCodePrototypes: VideoCodePrototypesSlice.reducer,
    cuts: cuttingSlice.reducer,
})

export const actions = {
    solutions: SolutionSlice.actions,
    annotations: annotationsSlice.actions,
    videoCodes: videoCodesSlice.actions,
    videoCodePrototypes: VideoCodePrototypesSlice.actions,
    cuts: cuttingSlice.actions,
}

const selectDenormalizedCurrentAnnotations = createSelector(
    [solutionSelectors.selectCurrentAnnotationIds, annotationSelectors.selectById],
    (currentAnnotionIds, annotationsById) => currentAnnotionIds.map((id) => annotationsById[id])
)

const selectDenormalizedCurrentVideoCodes = createSelector(
    [solutionSelectors.selectCurrentVideoCodeIds, videoCodeSelectors.selectById],
    (currentVideoCodeIds, videoCodesById) => currentVideoCodeIds.map((id) => videoCodesById[id])
)

const selectDenormalizedCurrentCutList = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    (currentCutIds, cutsById) => currentCutIds.map((id) => cutsById[id])
)

const getEntitiesByStartTime = <T extends { id: string; start: string }>(
    currentIds: string[],
    entitiesById: Record<string, T>
): T[] => {
    return currentIds
        .map((id) => entitiesById[id])
        .sort((a, b) => {
            if (a.start < b.start) {
                return -1
            } else if (a.start > b.start) {
                return 1
            } else {
                return 0
            }
        })
}

const selectCurrentAnnotationsByStartTime = createSelector(
    [solutionSelectors.selectCurrentAnnotationIds, annotationSelectors.selectById],
    getEntitiesByStartTime
)

const selectCurrentVideoCodesByStartTime = createSelector(
    [solutionSelectors.selectCurrentVideoCodeIds, videoCodeSelectors.selectById],
    getEntitiesByStartTime
)

const selectCurrentCutListByStartTime = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    getEntitiesByStartTime
)

const selectCurrentAnnotationIdsSortedByStartTime = createSelector(
    [selectCurrentAnnotationsByStartTime],
    (annotationsByStartTime) => annotationsByStartTime.map((annotation) => annotation.id)
)

const selectCurrentVideoCodeIdsSortedByStartTime = createSelector(
    [selectCurrentVideoCodesByStartTime],
    (videoCodesByStartTime) => videoCodesByStartTime.map((videoCode) => videoCode.id)
)

const selectCurrentCutIdsByStartTime = createSelector([selectCurrentCutListByStartTime], (cutList) =>
    cutList.map((cut) => cut.id)
)

export const selectors = {
    solutions: solutionSelectors,
    annotations: annotationSelectors,
    videoCodes: videoCodeSelectors,
    videoCodePrototypes: videoCodePoolSelectors,
    cuts: cutsSelectors,

    selectDenormalizedCurrentAnnotations,
    selectCurrentAnnotationsByStartTime,
    selectCurrentAnnotationIdsSortedByStartTime,

    selectDenormalizedCurrentVideoCodes,
    selectCurrentVideoCodesByStartTime,
    selectCurrentVideoCodeIdsSortedByStartTime,

    selectDenormalizedCurrentCutList,
    selectCurrentCutListByStartTime,
    selectCurrentCutIdsByStartTime,
}
