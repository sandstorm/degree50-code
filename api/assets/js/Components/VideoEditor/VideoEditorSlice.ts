import PlayerSlice, { PlayerState, actions as playerActions, selectors as playerSelectors } from './PlayerSlice'
import { combineReducers, createSelector } from '@reduxjs/toolkit'

import MediaLaneRenderConfigSlice, {
    actions as mediaLaneRenderConfigActions,
    selectors as mediaLaneRenderConfigSelectors,
} from './MediaLaneRenderConfigSlice'
import { RenderConfig } from './components/MediaLane/MediaTrack'
import DataSlice, { actions as dataActions, selectors as dataSelectors } from './DataSlice'

import OverlaySlice, {
    actions as overlayActions,
    OverlayState,
    selectors as overlaySelectors,
} from './components/OverlayContainer/OverlaySlice'
import { DataState } from './DataSlice'
import { timeToSecond, sortByStartTime } from './utils'
import { filterSlice, FilterState, selectors as filterSelectors } from './components/MultiLane/Filter/FilterSlice'
import { Annotation, VideoCode } from './types'

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

const selectVideoCodeIdsAtCursor = createSelector(
    [dataSelectors.selectCurrentVideoCodesByStartTime, playerSelectors.selectSyncPlayPosition],
    (videoCodes, currentPlayPosition) => {
        return videoCodes
            .filter((videoCode) => isAtCursor(videoCode, currentPlayPosition))
            .map((videoCode) => videoCode.id)
    }
)

const selectCutIdsAtCursor = createSelector(
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

const selectAllAnnotations = createSelector(
    [selectActiveAnnotationsFromPreviousSolutions, dataSelectors.selectCurrentAnnotations],
    (previousAnnotations, currentAnnotations) => [...previousAnnotations, ...currentAnnotations]
)

const selectAllVideoCodes = createSelector(
    [selectActiveVideoCodesFromPreviousSolutions, dataSelectors.selectCurrentVideoCodes],
    (previousVideoCodes, currentVideoCodes) => [...previousVideoCodes, ...currentVideoCodes]
)

const selectAllAnnotationsByStartTime = createSelector([selectAllAnnotations], sortByStartTime)
const selectAllVideoCodesByStartTime = createSelector([selectAllVideoCodes], sortByStartTime)

const selectAllAnnotationIdsByStartTime = createSelector([selectAllAnnotationsByStartTime], (annotations) =>
    annotations.map((a) => a.id)
)

const selectAllVideoCodeIdsByStartTime = createSelector([selectAllVideoCodesByStartTime], (videoCodes) =>
    videoCodes.map((vc) => vc.id)
)

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
    (annotations, currentPlayPosition) => {
        return annotations
            .filter((annotation) => isAtCursor(annotation, currentPlayPosition))
            .map((annotation) => annotation.id)
    }
)

export const selectors = {
    filter: filterSelectors,
    data: dataSelectors,
    player: playerSelectors,
    mediaLaneRenderConfig: mediaLaneRenderConfigSelectors,
    overlay: overlaySelectors,

    selectSolution,

    selectVideoCodeIdsAtCursor,
    selectAllVideoCodesByStartTime,
    selectAllVideoCodeIdsByStartTime,
    selectAllActiveVideoCodeIdsAtCursor,
    selectActiveSolutionsWithVideoCodes,

    selectCurrentAnnotationIdsAtCursor,
    selectAllAnnotationsByStartTime,
    selectAllAnnotationIdsByStartTime,
    selectAllActiveAnnotationIdsAtCursor,
    selectActiveSolutionsWithAnnotations,

    selectCutIdsAtCursor,
}
