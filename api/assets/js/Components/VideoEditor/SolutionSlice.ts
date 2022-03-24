///////////
// STATE //
///////////

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { SolutionId, Solution, Annotation, VideoCode, Cut, VideoCodePrototype } from './types'
import { annotationsSlice, AnnotationId } from './AnnotationsContext/AnnotationsSlice'
import { setIn } from 'immutable'
import { videoCodesSlice, VideoCodeId } from './VideoCodesContext/VideoCodesSlice'
import {
    ANNOTATIONS_API_PROPERTY,
    VIDEO_CODES_API_PROPERTY,
    CUTLIST_API_PROPERTY,
    VIDEO_CODE_PROTOTYPE_API_PROPERTY,
} from 'StimulusControllers/normalizeData'
import { CutId, cuttingSlice } from './CuttingContext/CuttingSlice'
import { videoCodePrototypesSlice, VideoCodePrototypeId } from './VideoCodesContext/VideoCodePrototypesSlice'
import { initData } from './initData'

export type SolutionState = {
    byId: Record<SolutionId, Solution>
    current?: SolutionId
    previous: SolutionId[]
}

export const initialState: SolutionState = {
    byId: {},
    current: undefined,
    previous: [],
}

/////////////
// REDUCER //
/////////////

export const SolutionSlice = createSlice({
    name: 'solutions',
    initialState,
    reducers: {
        // Cut position inside the cutlist is determined by the index of its id
        moveCutUp: (state, action: PayloadAction<CutId>) => {
            if (!state.current) {
                return state
            }

            const currentCutList = state.byId[state.current].solutionLists.cutList
            const currentIndex = currentCutList.indexOf(action.payload)
            const newIndex = currentIndex - 1

            if (newIndex < 0) return state

            const newIds = currentCutList.map((cut, index, all) => {
                if (index === newIndex) {
                    return all[currentIndex]
                } else if (index === currentIndex) {
                    return all[newIndex]
                } else {
                    return cut
                }
            })

            return setIn(state, ['byId', state.current, 'solutionLists', 'cutList'], newIds)
        },
        moveCutDown: (state, action: PayloadAction<CutId>) => {
            if (!state.current) {
                return state
            }

            const currentCutList = state.byId[state.current].solutionLists.cutList
            const currentIndex = currentCutList.indexOf(action.payload)
            const newIndex = currentIndex + 1

            if (newIndex === currentCutList.length) return state

            const newIds = currentCutList.map((cut, index, all) => {
                if (index === newIndex) {
                    return all[currentIndex]
                } else if (index === currentIndex) {
                    return all[newIndex]
                } else {
                    return cut
                }
            })

            return setIn(state, ['byId', state.current, 'solutionLists', 'cutList'], newIds)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initData, (_, action) => {
                return action.payload.solutions
            })
            .addCase(annotationsSlice.actions.append, (state, action: PayloadAction<Annotation>) => {
                if (!state.current) {
                    return state
                }

                const currentAnnotationIds = state.byId[state.current].solutionLists.annotations
                const updatedAnnotations = [...currentAnnotationIds, action.payload.id]

                return setIn(
                    state,
                    ['byId', state.current, 'solutionLists', ANNOTATIONS_API_PROPERTY],
                    updatedAnnotations
                )
            })
            .addCase(annotationsSlice.actions.remove, (state, action: PayloadAction<AnnotationId>) => {
                if (!state.current) {
                    return state
                }

                const currentAnnotationIds = state.byId[state.current].solutionLists.annotations
                const updatedAnnotations = currentAnnotationIds.filter((id) => id !== action.payload)

                return setIn(
                    state,
                    ['byId', state.current, 'solutionLists', ANNOTATIONS_API_PROPERTY],
                    updatedAnnotations
                )
            })
            .addCase(videoCodesSlice.actions.append, (state, action: PayloadAction<VideoCode>) => {
                if (!state.current) {
                    return state
                }

                const currentVideoCodeIds = state.byId[state.current].solutionLists.videoCodes
                const updatedVideoCodes = [...currentVideoCodeIds, action.payload.id]

                return setIn(
                    state,
                    ['byId', state.current, 'solutionLists', VIDEO_CODES_API_PROPERTY],
                    updatedVideoCodes
                )
            })
            .addCase(videoCodesSlice.actions.remove, (state, action: PayloadAction<VideoCodeId>) => {
                if (!state.current) {
                    return state
                }

                const currentVideoCodeIds = state.byId[state.current].solutionLists.videoCodes
                const updatedVideoCodes = currentVideoCodeIds.filter((id) => id !== action.payload)

                return setIn(
                    state,
                    ['byId', state.current, 'solutionLists', VIDEO_CODES_API_PROPERTY],
                    updatedVideoCodes
                )
            })
            .addCase(cuttingSlice.actions.append, (state, action: PayloadAction<Cut>) => {
                if (!state.current) {
                    return state
                }

                const currentCutIds = state.byId[state.current].solutionLists.cutList
                const updatedCuts = [...currentCutIds, action.payload.id]

                return setIn(state, ['byId', state.current, 'solutionLists', CUTLIST_API_PROPERTY], updatedCuts)
            })
            .addCase(cuttingSlice.actions.remove, (state, action: PayloadAction<CutId>) => {
                if (!state.current) {
                    return state
                }

                const currentCutIds = state.byId[state.current].solutionLists.cutList
                const updatedCuts = currentCutIds.filter((id) => id !== action.payload)

                return setIn(state, ['byId', state.current, 'solutionLists', CUTLIST_API_PROPERTY], updatedCuts)
            })
            .addCase(videoCodePrototypesSlice.actions.append, (state, action: PayloadAction<VideoCodePrototype>) => {
                if (!state.current) {
                    return state
                }

                const currentIds = state.byId[state.current].solutionLists.videoCodePrototypes
                const updatedPrototypes = [...currentIds, action.payload.id]

                return setIn(
                    state,
                    ['byId', state.current, 'solutionLists', VIDEO_CODE_PROTOTYPE_API_PROPERTY],
                    updatedPrototypes
                )
            })
            .addCase(
                videoCodePrototypesSlice.actions.remove,
                (
                    state,
                    action: PayloadAction<{
                        prototypeId: VideoCodePrototypeId
                        prototypeState: Record<VideoCodePrototypeId, VideoCodePrototype>
                    }>
                ) => {
                    if (!state.current) {
                        return state
                    }

                    const { prototypeId, prototypeState } = action.payload
                    const childIds = prototypeState[prototypeId].videoCodes
                    const allIdsToRemove = [prototypeId, ...childIds]

                    const currentIds = state.byId[state.current].solutionLists.videoCodePrototypes
                    const updated = currentIds.filter((id) => !allIdsToRemove.includes(id))

                    return setIn(
                        state,
                        ['byId', state.current, 'solutionLists', VIDEO_CODE_PROTOTYPE_API_PROPERTY],
                        updated
                    )
                }
            )
    },
})

///////////////
// SELECTORS //
///////////////

export type SolutionStateSlice = { videoEditor: { data: { solutions: SolutionState } } }

const selectById = (state: SolutionStateSlice) => state.videoEditor.data.solutions.byId
const selectSolutionById = (state: SolutionStateSlice, props: { solutionId: string }) =>
    state.videoEditor.data.solutions.byId[props.solutionId]
const selectCurrentId = (state: SolutionStateSlice) => state.videoEditor.data.solutions.current
const selectPreviousIds = (state: SolutionStateSlice) => state.videoEditor.data.solutions.previous

const selectIsCurrentSolution = (state: SolutionStateSlice, props: { solutionId?: string }) =>
    !!(props.solutionId && state.videoEditor.data.solutions.current === props.solutionId)

const selectPreviousSolutions = createSelector([selectById, selectPreviousIds], (byId, ids) =>
    ids.map((id) => byId[id])
)

const selectCurrentAnnotationIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solutionLists.annotations : []
)

const selectCurrentVideoCodeIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solutionLists.videoCodes : []
)

const selectCurrentCutIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solutionLists.cutList : []
)

const selectCurrentPrototypeIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solutionLists.videoCodePrototypes : []
)

const selectCurrentSolutionOwner = createSelector([selectById, selectCurrentId], (byId, currentId) => {
    if (!currentId) return {}

    const solution = byId[currentId]
    return {
        userId: solution.userId,
        userName: solution.userName,
    }
})

const selectCurrentSolutionFromGroupPhase = createSelector([selectById, selectCurrentId], (byId, currentId) => {
    if (!currentId) return false

    const solution = byId[currentId]
    return solution.fromGroupPhase
})

export const selectors = {
    selectById,
    selectSolutionById,
    selectCurrentId,
    selectPreviousIds,
    selectIsCurrentSolution,
    selectPreviousSolutions,
    selectCurrentAnnotationIds,
    selectCurrentVideoCodeIds,
    selectCurrentCutIds,
    selectCurrentPrototypeIds,
    selectCurrentSolutionOwner,
    selectCurrentSolutionFromGroupPhase,
}
