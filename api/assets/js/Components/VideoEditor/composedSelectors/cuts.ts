import { createSelector } from '@reduxjs/toolkit'
import { selectors as cutsSelectors } from '../CuttingContext/CuttingSlice'
import { selectors as solutionSelectors } from '../SolutionSlice'
import { MediaItemTypeEnum } from '../types'
import { sortByStartTime } from '../utils/time'

/**
 * Denormalized cuts to be used when sending cuts to the backend server
 */
const selectDenormalizedCurrentCutList = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

/**
 * Denormalized cut which cuts contain a type property, to easier identify them as media item
 * of type [MediaItemTypeEnum.cut] for further processing
 */
const selectCurrentCuts = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => ({ ...byId[id], type: MediaItemTypeEnum.cut }))
)

const selectCurrentCutListByStartTime = createSelector([selectCurrentCuts], sortByStartTime)

const selectCurrentCutIdsByStartTime = createSelector([selectCurrentCutListByStartTime], (cutList) =>
    cutList.map((cut) => cut.id)
)

const selectCutIsFromCurrentSolution = createSelector(
    [solutionSelectors.selectCurrentId, cutsSelectors.selectCutById],
    (currentSolutionId, cut) => currentSolutionId && cut && currentSolutionId === cut.solutionId
)

const selectCreatorNameForCut = createSelector(
    [solutionSelectors.selectById, cutsSelectors.selectCutById],
    (solutionsById, cut) => {
        const solution = cut.solutionId ? solutionsById[cut.solutionId] : undefined

        return solution?.userName ?? '<Unbekannter Ersteller>'
    }
)

export const composedCutSelectors = {
    selectDenormalizedCurrentCutList,
    selectCurrentCutListByStartTime,
    selectCurrentCutIdsByStartTime,
    selectCutIsFromCurrentSolution,
    selectCurrentCuts,
    selectCreatorNameForCut,
}
