///////////
// STATE //
///////////

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { cutListSchema } from 'StimulusControllers/normalizeData'
import { Cut } from '../types'
import { normalize } from 'normalizr'

export type CutId = string

export type CutsState = {
    byId: Record<CutId, Cut>
}

export const initialState: CutsState = {
    byId: {},
}

/////////////
// REDUCER //
/////////////

export const cuttingSlice = createSlice({
    name: 'cuts',
    initialState,
    reducers: {
        init: (state, action: PayloadAction<CutsState>) => {
            return {
                ...state,
                ...action.payload,
            }
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
        append: (state: CutsState, action: PayloadAction<Cut>): CutsState => {
            const newCut = action.payload
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [newCut.id]: newCut,
                },
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
            }
        },
    },
})

///////////////
// SELECTORS //
///////////////

type CutsSlice = { videoEditor: { data: { cuts: CutsState } } }

const selectById = (state: CutsSlice) => state.videoEditor.data.cuts.byId
const selectCutById = (state: CutsSlice, props: { cutId: CutId }) => state.videoEditor.data.cuts.byId[props.cutId]

export const selectors = {
    selectById,
    selectCutById,
}
