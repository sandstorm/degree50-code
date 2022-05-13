import { createSelector } from '@reduxjs/toolkit'
import { selectors as cutsSelectors } from '../CuttingContext/CuttingSlice'
import { selectors as solutionSelectors } from '../SolutionSlice'
import { sortByStartTime } from '../utils/time'

const selectDenormalizedCurrentCutList = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
)

const selectCurrentCuts = createSelector(
    [solutionSelectors.selectCurrentCutIds, cutsSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id])
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
