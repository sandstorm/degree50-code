import { combineReducers, createSelector } from '@reduxjs/toolkit'
import {
    AnnotationsState,
    annotationsSlice,
    selectors as annotationSelectors,
} from './AnnotationsContext/AnnotationsSlice'
import { cuttingSlice, CutsState, selectors as cutsSelectors } from './CuttingContext/CuttingSlice'
import {
    videoCodePrototypesSlice,
    VideoCodePrototypesState,
    selectors as videoCodePrototypeSelectors,
} from './VideoCodesContext/VideoCodePrototypesSlice'
import { videoCodesSlice, VideoCodesState, selectors as videoCodeSelectors } from './VideoCodesContext/VideoCodesSlice'
import { SolutionSlice, selectors as solutionSelectors, SolutionState } from './SolutionSlice'
import { VideoCodePrototype } from './types'

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
    videoCodePrototypes: videoCodePrototypesSlice.reducer,
    cuts: cuttingSlice.reducer,
})

export const actions = {
    solutions: SolutionSlice.actions,
    annotations: annotationsSlice.actions,
    videoCodes: videoCodesSlice.actions,
    videoCodePrototypes: videoCodePrototypesSlice.actions,
    cuts: cuttingSlice.actions,
}

const selectDenormalizedCurrentAnnotations = createSelector(
    [solutionSelectors.selectCurrentAnnotationIds, annotationSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectDenormalizedCurrentVideoCodes = createSelector(
    [solutionSelectors.selectCurrentVideoCodeIds, videoCodeSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectDenormalizedCurrentCutList = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectDenormalizedPrototypes = createSelector(
    [solutionSelectors.selectCurrentPrototypeIds, videoCodePrototypeSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
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

const selectPrototypesList = createSelector([selectDenormalizedPrototypes], (codes) => {
    return codes.reduce((acc: VideoCodePrototype[], code) => {
        if (code.parentId) {
            return acc
        }

        const childCodes = codes.filter((c) => c.parentId === code.id)

        return [...acc, { ...code, videoCodes: childCodes }]
    }, [])
})

export const selectors = {
    solutions: solutionSelectors,
    annotations: annotationSelectors,
    videoCodes: videoCodeSelectors,
    videoCodePrototypes: videoCodePrototypeSelectors,
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

    selectDenormalizedPrototypes,
    selectPrototypesList,
}
