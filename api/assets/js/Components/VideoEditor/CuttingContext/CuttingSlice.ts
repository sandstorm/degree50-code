///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { normalizeData } from 'StimulusControllers/normalizeData'
import { Cut } from '../types'

export type CutId = string

export type CutsState = {
    byId: Record<CutId, Cut>
    ids: CutId[]
}

export const initialState: CutsState = {
    byId: {},
    ids: [],
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
        set: (_, action: PayloadAction<Cut[]>) => {
            return normalizeData(action.payload)
        },
        // Cut position inside the cutlist is determined by the index of its id
        moveUp: (state, action: PayloadAction<CutId>) => {
            const currentIndex = state.ids.indexOf(action.payload)
            const newIndex = currentIndex - 1

            if (newIndex <= 0) return state

            const newIds = state.ids.map((cut, index, all) => {
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
                ids: newIds,
            }
        },
        moveDown: (state, action: PayloadAction<CutId>) => {
            const currentIndex = state.ids.indexOf(action.payload)
            const newIndex = currentIndex + 1

            if (newIndex === state.ids.length) return state

            const newIds = state.ids.map((cut, index, all) => {
                if (index === newIndex) {
                    return all[currentIndex]
                } else if (index === currentIndex) {
                    return all[newIndex]
                } else {
                    return cut
                }
            })

            console.log({
                before: state.ids,
                after: newIds,
                currentIndex,
                id: action.payload,
            })

            return {
                ...state,
                ids: newIds,
            }
        },
        append: (state: CutsState, action: PayloadAction<Cut>): CutsState => {
            const newCut = action.payload
            return {
                byId: {
                    ...state.byId,
                    [newCut.id]: newCut,
                },
                ids: [...state.ids, newCut.id],
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
                byId: remove(state.byId, elementId),
                ids: state.ids.filter((id) => id !== elementId),
            }
        },
    },
})

///////////////
// SELECTORS //
///////////////

type CutsSlice = { videoEditor: { data: { cuts: CutsState } } }

const selectCutsById = (state: CutsSlice) => state.videoEditor.data.cuts.byId
const selectCutIds = (state: CutsSlice) => state.videoEditor.data.cuts.ids
const selectCutById = (state: CutsSlice, props: { cutId: CutId }) => state.videoEditor.data.cuts.byId[props.cutId]
const selectDenormalizedCuts = (state: CutsSlice) =>
    state.videoEditor.data.cuts.ids.map((id) => state.videoEditor.data.cuts.byId[id])

const selectCutsByStartTime = createSelector([selectCutsById, selectCutIds], (byId, ids) => {
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

const selectIdsSortedByStartTime = createSelector([selectCutsByStartTime], (cutsByStartTime) =>
    cutsByStartTime.map((cut) => cut.id)
)

export const selectors = {
    selectCutsById,
    selectCutIds,
    selectCutById,
    selectCutsByStartTime,
    selectIdsSortedByStartTime,
    selectDenormalizedCuts,
}
