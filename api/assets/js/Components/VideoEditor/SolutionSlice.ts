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
        init: (state, action: PayloadAction<SolutionState>) => {
            return {
                ...state,
                ...action.payload,
            }
        },
        // Cut position inside the cutlist is determined by the index of its id
        moveCutUp: (state, action: PayloadAction<CutId>) => {
            if (!state.current) {
                return state
            }

            const currentCutList = state.byId[state.current].solution.cutList
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

            return setIn(state, ['byId', state.current, 'solution', 'cutList'], newIds)
        },
        moveCutDown: (state, action: PayloadAction<CutId>) => {
            if (!state.current) {
                return state
            }

            const currentCutList = state.byId[state.current].solution.cutList
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

            return setIn(state, ['byId', state.current, 'solution', 'cutList'], newIds)
        },
    },
    extraReducers: {
        [annotationsSlice.actions.append.type]: (state, action: PayloadAction<Annotation>) => {
            if (!state.current) {
                return state
            }

            const currentAnnotationIds = state.byId[state.current].solution.annotations
            const updatedAnnotations = [...currentAnnotationIds, action.payload.id]

            return setIn(state, ['byId', state.current, 'solution', ANNOTATIONS_API_PROPERTY], updatedAnnotations)
        },
        [annotationsSlice.actions.remove.type]: (state, action: PayloadAction<AnnotationId>) => {
            if (!state.current) {
                return state
            }

            const currentAnnotationIds = state.byId[state.current].solution.annotations
            const updatedAnnotations = currentAnnotationIds.filter((id) => id !== action.payload)

            return setIn(state, ['byId', state.current, 'solution', ANNOTATIONS_API_PROPERTY], updatedAnnotations)
        },
        [videoCodesSlice.actions.append.type]: (state, action: PayloadAction<VideoCode>) => {
            if (!state.current) {
                return state
            }

            const currentVideoCodeIds = state.byId[state.current].solution.videoCodes
            const updatedVideoCodes = [...currentVideoCodeIds, action.payload.id]

            return setIn(state, ['byId', state.current, 'solution', VIDEO_CODES_API_PROPERTY], updatedVideoCodes)
        },
        [videoCodesSlice.actions.remove.type]: (state, action: PayloadAction<VideoCodeId>) => {
            if (!state.current) {
                return state
            }

            const currentVideoCodeIds = state.byId[state.current].solution.videoCodes
            const updatedVideoCodes = currentVideoCodeIds.filter((id) => id !== action.payload)

            return setIn(state, ['byId', state.current, 'solution', VIDEO_CODES_API_PROPERTY], updatedVideoCodes)
        },
        // TODO see prototypes
        [cuttingSlice.actions.append.type]: (state, action: PayloadAction<Cut>) => {
            if (!state.current) {
                return state
            }

            const currentCutIds = state.byId[state.current].solution.cutList
            const updatedCuts = [...currentCutIds, action.payload.id]

            return setIn(state, ['byId', state.current, 'solution', CUTLIST_API_PROPERTY], updatedCuts)
        },
        [cuttingSlice.actions.remove.type]: (state, action: PayloadAction<CutId>) => {
            if (!state.current) {
                return state
            }

            const currentCutIds = state.byId[state.current].solution.cutList
            const updatedCuts = currentCutIds.filter((id) => id !== action.payload)

            return setIn(state, ['byId', state.current, 'solution', CUTLIST_API_PROPERTY], updatedCuts)
        },
        [videoCodePrototypesSlice.actions.append.type]: (state, action: PayloadAction<VideoCodePrototype>) => {
            if (!state.current) {
                return state
            }

            const currentIds = state.byId[state.current].solution.customVideoCodesPool
            const updatedPrototypes = [...currentIds, action.payload.id]

            return setIn(
                state,
                ['byId', state.current, 'solution', VIDEO_CODE_PROTOTYPE_API_PROPERTY],
                updatedPrototypes
            )
        },
        [videoCodePrototypesSlice.actions.remove.type]: (
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

            const currentIds = state.byId[state.current].solution.customVideoCodesPool
            const updated = currentIds.filter((id) => !allIdsToRemove.includes(id))

            return setIn(state, ['byId', state.current, 'solution', VIDEO_CODE_PROTOTYPE_API_PROPERTY], updated)
        },
    },
})

///////////////
// SELECTORS //
///////////////

type SolutionStateSlice = { videoEditor: { data: { solutions: SolutionState } } }

const selectById = (state: SolutionStateSlice) => state.videoEditor.data.solutions.byId
const selectCurrentId = (state: SolutionStateSlice) => state.videoEditor.data.solutions.current
const selectPreviousIds = (state: SolutionStateSlice) => state.videoEditor.data.solutions.previous

const selectPreviousSolutions = createSelector([selectById, selectPreviousIds], (byId, ids) =>
    ids.map((id) => byId[id])
)

const selectCurrentAnnotationIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solution.annotations : []
)

const selectCurrentVideoCodeIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solution.videoCodes : []
)

const selectCurrentCutIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solution.cutList : []
)

const selectCurrentPrototypeIds = createSelector([selectById, selectCurrentId], (byId, currentId) =>
    currentId ? byId[currentId].solution.customVideoCodesPool : []
)

export const selectors = {
    selectById,
    selectCurrentIds: selectCurrentId,
    selectPreviousIds,
    selectPreviousSolutions,
    selectCurrentAnnotationIds,
    selectCurrentVideoCodeIds,
    selectCurrentCutIds,
    selectCurrentPrototypeIds,
}
