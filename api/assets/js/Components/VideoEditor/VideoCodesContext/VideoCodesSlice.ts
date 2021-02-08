///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { videoCodesSchema } from 'StimulusControllers/normalizeData'
import { VideoCode } from '../types'
import { normalize } from 'normalizr'

export type VideoCodeId = string

export type VideoCodesState = {
    byId: Record<VideoCodeId, VideoCode>
}

export const initialState: VideoCodesState = {
    byId: {},
}

/////////////
// REDUCER //
/////////////

export const videoCodesSlice = createSlice({
    name: 'videoCodes',
    initialState,
    reducers: {
        init: (state: VideoCodesState, action: PayloadAction<VideoCodesState>) => {
            return {
                ...state,
                ...action.payload,
            }
        },
        set: (state: VideoCodesState, action: PayloadAction<VideoCode[]>) => {
            const normalized = normalize(action.payload, [videoCodesSchema])

            return {
                ...state,
                byId: {
                    ...state.byId,
                    ...normalized.entities.videoCodes,
                },
            }
        },
        append: (state: VideoCodesState, action: PayloadAction<VideoCode>): VideoCodesState => {
            const newVideoCode = action.payload
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [newVideoCode.id]: newVideoCode,
                },
            }
        },
        update: (state: VideoCodesState, action: PayloadAction<{ transientVideoCode: VideoCode }>): VideoCodesState => {
            const { transientVideoCode } = action.payload

            return {
                ...state,
                byId: set(state.byId, transientVideoCode.id, transientVideoCode),
            }
        },
        remove: (state: VideoCodesState, action: PayloadAction<string>): VideoCodesState => {
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

export type VideoCodesStateSlice = { videoEditor: { data: { videoCodes: VideoCodesState } } }

const selectById = (state: VideoCodesStateSlice) => state.videoEditor.data.videoCodes.byId
const selectVideoCodeById = (state: VideoCodesStateSlice, props: { videoCodeId: VideoCodeId }) =>
    state.videoEditor.data.videoCodes.byId[props.videoCodeId]

export const selectors = {
    selectById,
    selectVideoCodeById,
}
