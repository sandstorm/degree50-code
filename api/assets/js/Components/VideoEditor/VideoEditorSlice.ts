import PlayerSlice, { PlayerState, actions as playerActions, selectors as playerSelectors } from './PlayerSlice'
import { combineReducers, createSelector } from '@reduxjs/toolkit'
import MediaLaneRenderConfigSlice, {
    actions as mediaLaneRenderConfigActions,
    selectors as mediaLaneRenderConfigSelectors,
} from './MediaLaneRenderConfigSlice'
import { RenderConfig } from './components/MediaLane/MediaTrack'
import DataSlice from './DataSlice'
import { actions as dataActions, selectors as dataSelectors, DataState } from './DataSlice'
import OverlaySlice, {
    actions as overlayActions,
    OverlayState,
    selectors as overlaySelectors,
} from './components/OverlayContainer/OverlaySlice'
import { timeToSecond, sortByStartTime } from './utils/time'
import { filterSlice, FilterState, selectors as filterSelectors } from './FilterContext/FilterSlice'
import { Annotation, VideoCode, Cut } from './types'

export default combineReducers({
    filter: filterSlice.reducer,
    data: DataSlice,
    player: PlayerSlice,
    mediaLaneRenderConfig: MediaLaneRenderConfigSlice,
    overlay: OverlaySlice,
})

export type VideoEditorState = {
    videoEditor: {
        filter: FilterState
        data: DataState
        player: PlayerState
        mediaLaneRenderConfig: RenderConfig
        overlay: OverlayState
    }
}

export const actions = {
    filter: filterSlice.actions,
    data: dataActions,
    player: playerActions,
    mediaLaneRenderConfig: mediaLaneRenderConfigActions,
    overlay: overlayActions,
}

const isAtCursor = (entity: { start: string; end: string }, currentPlayPosition: number) =>
    timeToSecond(entity.start) <= currentPlayPosition && timeToSecond(entity.end) >= currentPlayPosition

const selectCurrentAnnotationIdsAtCursor = createSelector(
    [dataSelectors.selectCurrentAnnotationsByStartTime, playerSelectors.selectSyncPlayPosition],
    (annotations, currentPlayPosition) => {
        return annotations
            .filter((annotation) => isAtCursor(annotation, currentPlayPosition))
            .map((annotation) => annotation.id)
    }
)

const selectCurrentVideoCodeIdsAtCursor = createSelector(
    [dataSelectors.selectCurrentVideoCodesByStartTime, playerSelectors.selectSyncPlayPosition],
    (videoCodes, currentPlayPosition) => {
        return videoCodes
            .filter((videoCode) => isAtCursor(videoCode, currentPlayPosition))
            .map((videoCode) => videoCode.id)
    }
)

const selectCurrentCutIdsAtCursor = createSelector(
    [dataSelectors.selectCurrentCutListByStartTime, playerSelectors.selectSyncPlayPosition],
    (cuts, currentPlayPosition) => {
        return cuts.filter((videoCode) => isAtCursor(videoCode, currentPlayPosition)).map((cut) => cut.id)
    }
)

const selectSolution = createSelector(
    [
        dataSelectors.selectDenormalizedCurrentAnnotations,
        dataSelectors.selectDenormalizedCurrentVideoCodes,
        dataSelectors.selectDenormalizedCurrentCutList,
        dataSelectors.selectPrototypesList,
    ],
    (annotations, videoCodes, cuts, videoCodePool) => ({
        annotations,
        videoCodes,
        cutList: cuts,
        customVideoCodesPool: videoCodePool,
    })
)

const selectActiveSolutionsWithAnnotations = createSelector(
    [
        filterSelectors.selectVisiblePreviousSolutions,
        dataSelectors.solutions.selectById,
        dataSelectors.annotations.selectById,
    ],
    (visibleSolutions, solutionsById, annotationsById) => {
        return visibleSolutions.map((visibleSolution) => {
            const solution = solutionsById[visibleSolution.id]
            const annotations = solution.solution.annotations.map((id) => annotationsById[id])

            return {
                ...solution,
                annotations,
            }
        })
    }
)

const selectActiveSolutionsWithVideoCodes = createSelector(
    [
        filterSelectors.selectVisiblePreviousSolutions,
        dataSelectors.solutions.selectById,
        dataSelectors.videoCodes.selectById,
    ],
    (visibleSolutions, solutionsById, videoCodesById) => {
        return visibleSolutions.map((visibleSolution) => {
            const solution = solutionsById[visibleSolution.id]
            const videoCodes = solution.solution.videoCodes.map((id) => videoCodesById[id])

            return {
                ...solution,
                videoCodes,
            }
        })
    }
)

const selectActiveSolutionsWithCuts = createSelector(
    [filterSelectors.selectVisiblePreviousSolutions, dataSelectors.solutions.selectById, dataSelectors.cuts.selectById],
    (visibleSolutions, solutionsById, cutsById) => {
        return visibleSolutions.map((visibleSolution) => {
            const solution = solutionsById[visibleSolution.id]
            const cutList = solution.solution.cutList.map((id) => cutsById[id])

            return {
                ...solution,
                cutList,
            }
        })
    }
)

const selectActiveAnnotationsFromPreviousSolutions = createSelector(
    [selectActiveSolutionsWithAnnotations],
    (solutions) =>
        solutions.reduce((acc: Annotation[], s) => {
            return [...acc, ...s.annotations]
        }, [])
)

const selectActiveVideoCodesFromPreviousSolutions = createSelector([selectActiveSolutionsWithVideoCodes], (solutions) =>
    solutions.reduce((acc: VideoCode[], s) => {
        return [...acc, ...s.videoCodes]
    }, [])
)

const selectActiveCutListFromPreviousSolutions = createSelector([selectActiveSolutionsWithCuts], (solutions) =>
    solutions.reduce((acc: Cut[], s) => {
        return [...acc, ...s.cutList]
    }, [])
)

const selectAllAnnotations = createSelector(
    [selectActiveAnnotationsFromPreviousSolutions, dataSelectors.selectCurrentAnnotations],
    (previousAnnotations, currentAnnotations) => [...previousAnnotations, ...currentAnnotations]
)

const selectAllVideoCodes = createSelector(
    [selectActiveVideoCodesFromPreviousSolutions, dataSelectors.selectCurrentVideoCodes],
    (previousVideoCodes, currentVideoCodes) => [...previousVideoCodes, ...currentVideoCodes]
)

const selectAllCuts = createSelector(
    [selectActiveCutListFromPreviousSolutions, dataSelectors.selectCurrentCuts],
    (previousCuts, currentCuts) => [...previousCuts, ...currentCuts]
)

const selectAllAnnotationsByStartTime = createSelector([selectAllAnnotations], sortByStartTime)
const selectAllVideoCodesByStartTime = createSelector([selectAllVideoCodes], sortByStartTime)
const selectAllCutsByStartTime = createSelector([selectAllCuts], sortByStartTime)

const selectAllAnnotationIdsByStartTime = createSelector([selectAllAnnotationsByStartTime], (annotations) =>
    annotations.map((a) => a.id)
)

const selectAllVideoCodeIdsByStartTime = createSelector([selectAllVideoCodesByStartTime], (videoCodes) =>
    videoCodes.map((vc) => vc.id)
)

const selectAllCutIdsByStartTime = createSelector([selectAllCutsByStartTime], (cuts) => cuts.map((c) => c.id))

const selectAllActiveAnnotationIdsAtCursor = createSelector(
    [selectAllAnnotationsByStartTime, playerSelectors.selectSyncPlayPosition],
    (annotations, currentPlayPosition) => {
        return annotations
            .filter((annotation) => isAtCursor(annotation, currentPlayPosition))
            .map((annotation) => annotation.id)
    }
)

const selectAllActiveVideoCodeIdsAtCursor = createSelector(
    [selectAllVideoCodesByStartTime, playerSelectors.selectSyncPlayPosition],
    (videoCodes, currentPlayPosition) => {
        return videoCodes.filter((vc) => isAtCursor(vc, currentPlayPosition)).map((vc) => vc.id)
    }
)

const selectAllActiveCutIdsAtCursor = createSelector(
    [selectAllCutsByStartTime, playerSelectors.selectSyncPlayPosition],
    (cuts, currentPlayPosition) => {
        return cuts.filter((cut) => isAtCursor(cut, currentPlayPosition)).map((cut) => cut.id)
    }
)

export const selectors = {
    filter: filterSelectors,
    data: dataSelectors,
    player: playerSelectors,
    mediaLaneRenderConfig: mediaLaneRenderConfigSelectors,
    overlay: overlaySelectors,

    selectSolution,

    selectVideoCodeIdsAtCursor: selectCurrentVideoCodeIdsAtCursor,
    selectAllVideoCodesByStartTime,
    selectAllVideoCodeIdsByStartTime,
    selectAllActiveVideoCodeIdsAtCursor,
    selectActiveSolutionsWithVideoCodes,

    selectCurrentAnnotationIdsAtCursor,
    selectAllAnnotationsByStartTime,
    selectAllAnnotationIdsByStartTime,
    selectAllActiveAnnotationIdsAtCursor,
    selectActiveSolutionsWithAnnotations,

    selectCurrentCutIdsAtCursor,
    selectAllCutsByStartTime,
    selectAllCutIdsByStartTime,
    selectAllActiveCutIdsAtCursor,
    selectActiveSolutionsWithCuts,
}
