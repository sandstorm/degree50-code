import { createSelector } from '@reduxjs/toolkit'
import { selectors as videoCodeSelectors } from '../VideoCodesContext/VideoCodesSlice'
import { selectors as solutionSelectors } from '../SolutionSlice'
import { sortByStartTime } from '../utils/time'

const selectDenormalizedCurrentVideoCodes = createSelector(
    [solutionSelectors.selectCurrentVideoCodeIds, videoCodeSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentVideoCodes = createSelector(
    [solutionSelectors.selectCurrentVideoCodeIds, videoCodeSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentVideoCodesByStartTime = createSelector([selectCurrentVideoCodes], sortByStartTime)

const selectCurrentVideoCodeIdsSortedByStartTime = createSelector(
    [selectCurrentVideoCodesByStartTime],
    (videoCodesByStartTime) => videoCodesByStartTime.map((videoCode) => videoCode.id)
)

const selectVideoCodeIsFromCurrentSolution = createSelector(
    [solutionSelectors.selectCurrentId, videoCodeSelectors.selectVideoCodeById],
    (currentSolutionId, videoCode) => currentSolutionId && videoCode && currentSolutionId === videoCode.solutionId
)

const selectCreatorNameForVideoCode = createSelector(
    [solutionSelectors.selectById, videoCodeSelectors.selectVideoCodeById],
    (solutionsById, videoCode) => {
        const solution = videoCode.solutionId ? solutionsById[videoCode.solutionId] : undefined

        return solution?.userName ?? '<Unbekannter Ersteller>'
    }
)

export const composedVideoCodeSelectors = {
    selectDenormalizedCurrentVideoCodes,
    selectCurrentVideoCodesByStartTime,
    selectCurrentVideoCodeIdsSortedByStartTime,
    selectCurrentVideoCodes,
    selectVideoCodeIsFromCurrentSolution,
    selectCreatorNameForVideoCode,
}
