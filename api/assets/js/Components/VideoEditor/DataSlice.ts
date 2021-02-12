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
import { sortByStartTime } from './utils'

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

const selectCurrentAnnotations = createSelector(
    [solutionSelectors.selectCurrentAnnotationIds, annotationSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentAnnotationsByStartTime = createSelector([selectCurrentAnnotations], sortByStartTime)

const selectCurrentVideoCodes = createSelector(
    [solutionSelectors.selectCurrentVideoCodeIds, videoCodeSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentVideoCodesByStartTime = createSelector([selectCurrentVideoCodes], sortByStartTime)

const selectCurrentCuts = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentCutListByStartTime = createSelector([selectCurrentCuts], sortByStartTime)

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

const selectAnnotationIsFromCurrentSolution = createSelector(
    [solutionSelectors.selectCurrentId, annotationSelectors.selectAnnotationById],
    (currentSolutionId, annotation) => currentSolutionId && annotation && currentSolutionId === annotation.solutionId
)

const selectVideoCodeIsFromCurrentSolution = createSelector(
    [solutionSelectors.selectCurrentId, videoCodeSelectors.selectVideoCodeById],
    (currentSolutionId, videoCode) => currentSolutionId && videoCode && currentSolutionId === videoCode.solutionId
)

const selectCreatorNameForAnnotation = createSelector(
    [solutionSelectors.selectById, annotationSelectors.selectAnnotationById],
    (solutionsById, annotation) => {
        const solution = annotation.solutionId ? solutionsById[annotation.solutionId] : undefined

        return solution?.userName ?? '<Unbekannter Ersteller>'
    }
)

const selectCreatorNameForVideoCode = createSelector(
    [solutionSelectors.selectById, videoCodeSelectors.selectVideoCodeById],
    (solutionsById, videoCode) => {
        const solution = videoCode.solutionId ? solutionsById[videoCode.solutionId] : undefined

        return solution?.userName ?? '<Unbekannter Ersteller>'
    }
)

export const selectors = {
    solutions: solutionSelectors,
    annotations: annotationSelectors,
    videoCodes: videoCodeSelectors,
    videoCodePrototypes: videoCodePrototypeSelectors,
    cuts: cutsSelectors,

    selectDenormalizedCurrentAnnotations,
    selectCurrentAnnotationsByStartTime,
    selectCurrentAnnotationIdsSortedByStartTime,
    selectCurrentAnnotations,
    selectAnnotationIsFromCurrentSolution,
    selectCreatorNameForAnnotation,

    selectDenormalizedCurrentVideoCodes,
    selectCurrentVideoCodesByStartTime,
    selectCurrentVideoCodeIdsSortedByStartTime,
    selectCurrentVideoCodes,
    selectVideoCodeIsFromCurrentSolution,
    selectCreatorNameForVideoCode,

    selectDenormalizedCurrentCutList,
    selectCurrentCutListByStartTime,
    selectCurrentCutIdsByStartTime,
    selectCurrentCuts,

    selectDenormalizedPrototypes,
    selectPrototypesList,
}
