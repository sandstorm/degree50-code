///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { cutListSchema } from 'StimulusControllers/normalizeData'
import { Cut } from '../types'
import { normalize } from 'normalizr'

export type CutId = string

export type CutsState = {
    byId: Record<CutId, Cut>
    current: CutId[]
    previous: CutId[]
}

export const initialState: CutsState = {
    byId: {},
    current: [],
    previous: [],
}

/////////////
// REDUCER //
/////////////

export const CutsSlice = createSlice({
    name: 'cuts',
    initialState,
    reducers: {
        init: (_, action: PayloadAction<CutsState>) => {
            return action.payload
        },
        set: (state, action: PayloadAction<Cut[]>) => {
            const normalized = normalize(action.payload, [cutListSchema])

            return {
                ...state,
                byId: {
                    ...state.byId,
                    ...normalized.entities.cutList,
                },
            }
        },
        // Cut position inside the cutlist is determined by the index of its id
        moveUp: (state, action: PayloadAction<CutId>) => {
            const currentIndex = state.current.indexOf(action.payload)
            const newIndex = currentIndex - 1

            if (newIndex < 0) return state

            const newIds = state.current.map((cut, index, all) => {
                if (index === newIndex) {
                    return all[currentIndex]
                } else if (index === currentIndex) {
                    return all[newIndex]
                } else {
                    return cut
                }
            })

            return {
                ...state,
                current: newIds,
            }
        },
        moveDown: (state, action: PayloadAction<CutId>) => {
            const currentIndex = state.current.indexOf(action.payload)
            const newIndex = currentIndex + 1

            if (newIndex === state.current.length) return state

            const newIds = state.current.map((cut, index, all) => {
                if (index === newIndex) {
                    return all[currentIndex]
                } else if (index === currentIndex) {
                    return all[newIndex]
                } else {
                    return cut
                }
            })

            return {
                ...state,
                current: newIds,
            }
        },
        append: (state: CutsState, action: PayloadAction<Cut>): CutsState => {
            const newCut = action.payload
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [newCut.id]: newCut,
                },
                current: [...state.current, newCut.id],
            }
        },
        update: (state: CutsState, action: PayloadAction<{ transientCut: Cut }>): CutsState => {
            const { transientCut } = action.payload

            return {
                ...state,
                byId: set(state.byId, transientCut.id, transientCut),
            }
        },
        remove: (state: CutsState, action: PayloadAction<string>): CutsState => {
            const elementId = action.payload

            return {
                ...state,
                byId: remove(state.byId, elementId),
                current: state.current.filter((id) => id !== elementId),
            }
        },
    },
})

///////////////
// SELECTORS //
///////////////

type CutsSlice = { videoEditor: { data: { cuts: CutsState } } }

const selectById = (state: CutsSlice) => state.videoEditor.data.cuts.byId
const selectCurrentIds = (state: CutsSlice) => state.videoEditor.data.cuts.current
const selectCutById = (state: CutsSlice, props: { cutId: CutId }) => state.videoEditor.data.cuts.byId[props.cutId]
const selectDenormalizedCurrent = (state: CutsSlice) =>
    state.videoEditor.data.cuts.current.map((id) => state.videoEditor.data.cuts.byId[id])

const selectCurrentByStartTime = createSelector([selectById, selectCurrentIds], (byId, ids) => {
    return ids
        .map((id) => byId[id])
        .sort((a, b) => {
            if (a.start < b.start) {
                return -1
            } else if (a.start > b.start) {
                return 1
            } else {
                return 0
            }
        })
})

const selectCurrentIdsSortedByStartTime = createSelector([selectCurrentByStartTime], (cutsByStartTime) =>
    cutsByStartTime.map((cut) => cut.id)
)

export const selectors = {
    selectById,
    selectCurrentIds,
    selectCutById,
    selectCurrentByStartTime,
    selectCurrentIdsSortedByStartTime,
    selectDenormalizedCurrent,
}
