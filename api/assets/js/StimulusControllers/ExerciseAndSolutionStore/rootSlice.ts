import { combineReducers } from '@reduxjs/toolkit'
import toolbarReducer from '../ExercisePhaseApp/Components/Toolbar/ToolbarSlice'
import configReducer from '../ExercisePhaseApp/Components/Config/ConfigSlice'
import liveSyncConfigReducer, {
    actions as liveSyncConfigActions,
    selectors as liveSyncConfigSelectors,
} from '../ExercisePhaseApp/Components/LiveSyncConfig/LiveSyncConfigSlice'
import overlayReducer from '../ExercisePhaseApp/Components/Overlay/OverlaySlice'
import attachmentViewerReducer from '../ExercisePhaseApp/Components/AttachmentViewer/AttachmentViewerSlice'
import presenceReducer, {
    actions as presenceActions,
    selectors as presenceSelectors,
} from '../ExercisePhaseApp/Components/Presence/PresenceSlice'
import currentEditorReducer, {
    selectors as currentEditorSelectors,
    actions as currentEditorActions,
} from '../ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import VideoEditorSlice from 'Components/VideoEditor/VideoEditorSlice'
import shortCutsReducer from '../../Components/VideoEditor/ShortCutsContext/ShortCutsSlice'
import shortCutSoundOptionsReducer from '../../Components/VideoEditor/ShortCutsContext/ShortCutSoundsSlice'
import DataSlice, {
    selectors as dataSelectors,
    actions as dataActions,
} from 'StimulusControllers/ExerciseAndSolutionStore/DataSlice'
import {
    selectors as configSelectors,
    actions as configActions,
} from '../ExercisePhaseApp/Components/Config/ConfigSlice'
import {
    selectors as videoEditorSelectors,
    actions as videoEditorActions,
} from 'Components/VideoEditor/VideoEditorSlice'
import { createSelector } from '@reduxjs/toolkit'
import { sortByStartTime, timeToSecond } from 'Components/VideoEditor/utils/time'
import { Annotation, Cut, MediaItemTypeEnum, VideoCode } from 'Components/VideoEditor/types'

export default combineReducers({
    toolbar: toolbarReducer,
    videoEditor: VideoEditorSlice,
    data: DataSlice,
    config: configReducer,
    liveSyncConfig: liveSyncConfigReducer,
    overlay: overlayReducer,
    attachmentViewer: attachmentViewerReducer,
    presence: presenceReducer,
    currentEditor: currentEditorReducer,
    shortCuts: shortCutsReducer,
    shortCutSoundOptions: shortCutSoundOptionsReducer,
})

export const actions = {
    videoEditor: videoEditorActions,
    data: dataActions,
    config: configActions,
    liveSyncConfig: liveSyncConfigActions,
    currentEditor: currentEditorActions,
    presence: presenceActions,
}

/*************
 * Selectors *
 *************/

export const selectUserIsCurrentEditor = createSelector(
    [configSelectors.selectUserId, currentEditorSelectors.selectCurrentEditorId],
    (userId, editorId) => editorId && userId === editorId
)

export const selectUserCanEditSolution = createSelector(
    [configSelectors.selectReadOnly, selectUserIsCurrentEditor, dataSelectors.solutions.selectIsCurrentSolution],
    (isReadonly, userIsCurrentEditor, isCurrentSolution) => {
        if (isReadonly) {
            return false
        }

        return userIsCurrentEditor && isCurrentSolution
    }
)

const isAtCursor = (entity: { start: string; end: string }, currentPlayPosition: number) =>
    timeToSecond(entity.start) <= currentPlayPosition && timeToSecond(entity.end) >= currentPlayPosition

const selectCurrentAnnotationIdsAtCursor = createSelector(
    [dataSelectors.selectCurrentAnnotationsByStartTime, videoEditorSelectors.player.selectSyncPlayPosition],
    (annotations, currentPlayPosition) => {
        return annotations
            .filter((annotation) => isAtCursor(annotation, currentPlayPosition))
            .map((annotation) => annotation.id)
    }
)

const selectCurrentVideoCodeIdsAtCursor = createSelector(
    [dataSelectors.selectCurrentVideoCodesByStartTime, videoEditorSelectors.player.selectSyncPlayPosition],
    (videoCodes, currentPlayPosition) => {
        return videoCodes
            .filter((videoCode) => isAtCursor(videoCode, currentPlayPosition))
            .map((videoCode) => videoCode.id)
    }
)

const selectCurrentCutIdsAtCursor = createSelector(
    [dataSelectors.selectCurrentCutListByStartTime, videoEditorSelectors.player.selectSyncPlayPosition],
    (cuts, currentPlayPosition) => {
        return cuts.filter((videoCode) => isAtCursor(videoCode, currentPlayPosition)).map((cut) => cut.id)
    }
)

const selectSolutionLists = createSelector(
    [
        dataSelectors.selectDenormalizedCurrentAnnotations,
        dataSelectors.selectDenormalizedCurrentVideoCodes,
        dataSelectors.selectDenormalizedCurrentCutList,
        dataSelectors.selectCurrentPrototypesList,
    ],
    (annotations, videoCodes, cutList, videoCodePrototypes) => ({
        annotations,
        videoCodes,
        cutList,
        videoCodePrototypes,
    })
)

const selectActiveSolutionsWithAnnotations = createSelector(
    [
        videoEditorSelectors.filter.selectVisiblePreviousSolutions,
        dataSelectors.solutions.selectById,
        dataSelectors.annotations.selectById,
    ],
    (visibleSolutions, solutionsById, annotationsById) => {
        return visibleSolutions.map((visibleSolution) => {
            const solution = solutionsById[visibleSolution.id]
            const annotations = solution.solutionLists.annotations.map((id) => annotationsById[id])

            return {
                ...solution,
                annotations,
            }
        })
    }
)

const selectActiveSolutionsWithVideoCodes = createSelector(
    [
        videoEditorSelectors.filter.selectVisiblePreviousSolutions,
        dataSelectors.solutions.selectById,
        dataSelectors.videoCodes.selectById,
    ],
    (visibleSolutions, solutionsById, videoCodesById) => {
        return visibleSolutions.map((visibleSolution) => {
            const solution = solutionsById[visibleSolution.id]
            const videoCodes = solution.solutionLists.videoCodes.map((id) => videoCodesById[id])

            return {
                ...solution,
                videoCodes,
            }
        })
    }
)

const selectActiveSolutionsWithCuts = createSelector(
    [
        videoEditorSelectors.filter.selectVisiblePreviousSolutions,
        dataSelectors.solutions.selectById,
        dataSelectors.cuts.selectById,
    ],
    (visibleSolutions, solutionsById, cutsById) => {
        return visibleSolutions.map((visibleSolution) => {
            const solution = solutionsById[visibleSolution.id]
            const cutList = solution.solutionLists.cutList.map((id) => cutsById[id])

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

const selectAllMediaItemsByStartTime = createSelector(
    [selectAllAnnotations, selectAllVideoCodes, selectAllCuts],
    (annotations, videoCodes, cuts) => {
        return sortByStartTime([
            ...annotations.map((a) => ({ ...a, type: MediaItemTypeEnum.annotation })),
            ...videoCodes.map((vc) => ({ ...vc, type: MediaItemTypeEnum.videoCode })),
            ...cuts.map((c) => ({ ...c, type: MediaItemTypeEnum.cut })),
        ])
    }
)

const selectAllCutIdsByStartTime = createSelector([selectAllCutsByStartTime], (cuts) => cuts.map((c) => c.id))

const selectAllActiveAnnotationIdsAtCursor = createSelector(
    [selectAllAnnotationsByStartTime, videoEditorSelectors.player.selectSyncPlayPosition],
    (annotations, currentPlayPosition) => {
        return annotations
            .filter((annotation) => isAtCursor(annotation, currentPlayPosition))
            .map((annotation) => annotation.id)
    }
)

const selectAllActiveVideoCodeIdsAtCursor = createSelector(
    [selectAllVideoCodesByStartTime, videoEditorSelectors.player.selectSyncPlayPosition],
    (videoCodes, currentPlayPosition) => {
        return videoCodes.filter((vc) => isAtCursor(vc, currentPlayPosition)).map((vc) => vc.id)
    }
)

const selectAllActiveCutIdsAtCursor = createSelector(
    [selectAllCutsByStartTime, videoEditorSelectors.player.selectSyncPlayPosition],
    (cuts, currentPlayPosition) => {
        return cuts.filter((cut) => isAtCursor(cut, currentPlayPosition)).map((cut) => cut.id)
    }
)

export const selectors = {
    videoEditor: videoEditorSelectors,
    data: dataSelectors,
    config: configSelectors,
    liveSyncConfig: liveSyncConfigSelectors,
    currentEditor: currentEditorSelectors,
    presence: presenceSelectors,

    selectUserIsCurrentEditor,
    selectUserCanEditSolution,
    selectSolutionLists,

    selectAllMediaItemsByStartTime,

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
