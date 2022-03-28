import { createSelector } from '@reduxjs/toolkit'
import { selectors as annotationSelectors } from '../AnnotationsContext/AnnotationsSlice'
import { selectors as solutionSelectors } from '../SolutionSlice'
import { sortByStartTime } from '../utils/time'

const selectDenormalizedCurrentAnnotations = createSelector(
    [solutionSelectors.selectCurrentAnnotationIds, annotationSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentAnnotations = createSelector(
    [solutionSelectors.selectCurrentAnnotationIds, annotationSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentAnnotationsByStartTime = createSelector([selectCurrentAnnotations], sortByStartTime)

const selectCurrentAnnotationIdsSortedByStartTime = createSelector(
    [selectCurrentAnnotationsByStartTime],
    (annotationsByStartTime) => annotationsByStartTime.map((annotation) => annotation.id)
)

const selectAnnotationIsFromCurrentSolution = createSelector(
    [solutionSelectors.selectCurrentId, annotationSelectors.selectAnnotationById],
    (currentSolutionId, annotation) => currentSolutionId && annotation && currentSolutionId === annotation.solutionId
)

const selectCreatorNameForAnnotation = createSelector(
    [solutionSelectors.selectById, annotationSelectors.selectAnnotationById],
    (solutionsById, annotation) => {
        const solution = annotation.solutionId ? solutionsById[annotation.solutionId] : undefined

        return solution?.userName ?? '<Unbekannter Ersteller>'
    }
)

export const composedAnnotationSelectors = {
    selectDenormalizedCurrentAnnotations,
    selectCurrentAnnotationsByStartTime,
    selectCurrentAnnotationIdsSortedByStartTime,
    selectCurrentAnnotations,
    selectAnnotationIsFromCurrentSolution,
    selectCreatorNameForAnnotation,
}
