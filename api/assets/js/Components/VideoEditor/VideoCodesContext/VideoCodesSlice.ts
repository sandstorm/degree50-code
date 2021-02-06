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
    current: VideoCodeId[]
    previous: VideoCodeId[]
}

export const initialState: VideoCodesState = {
    byId: {},
    current: [],
    previous: [],
}

/////////////
// REDUCER //
/////////////

// TODO implement videoCode specific logic

export const VideoCodesSlice = createSlice({
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
                current: [...state.current, newVideoCode.id],
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
                current: state.current.filter((id) => id !== elementId),
            }
        },
    },
})

///////////////
// SELECTORS //
///////////////

export type VideoCodesSlice = { videoEditor: { data: { videoCodes: VideoCodesState } } }

const selectById = (state: VideoCodesSlice) => state.videoEditor.data.videoCodes.byId
const selectCurrentIds = (state: VideoCodesSlice) => state.videoEditor.data.videoCodes.current
const selectVideoCodeById = (state: VideoCodesSlice, props: { videoCodeId: VideoCodeId }) =>
    state.videoEditor.data.videoCodes.byId[props.videoCodeId]
const selectDenormalizedCurrent = (state: VideoCodesSlice) =>
    state.videoEditor.data.videoCodes.current.map((id) => state.videoEditor.data.videoCodes.byId[id])

const selectCurrentVideoCodesByStartTime = createSelector([selectById, selectCurrentIds], (byId, ids) => {
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

const selectCurrentIdsSortedByStartTime = createSelector(
    [selectCurrentVideoCodesByStartTime],
    (videoCodesByStartTime) => videoCodesByStartTime.map((videoCode) => videoCode.id)
)

export const selectors = {
    selectById,
    selectCurrentIds,
    selectVideoCodeById,
    selectCurrentVideoCodesByStartTime,
    selectCurrentIdsSortedByStartTime,
    selectDenormalizedCurrent,
}
