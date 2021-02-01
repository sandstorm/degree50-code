///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { normalizeData } from 'StimulusControllers/normalizeData'
import { VideoCode } from '../types'

export type VideoCodeId = string

export type VideoCodesState = {
    byId: Record<VideoCodeId, VideoCode>
    ids: VideoCodeId[]
}

export const initialState: VideoCodesState = {
    byId: {},
    ids: [],
}

/////////////
// REDUCER //
/////////////

// TODO implement videoCode specific logic

export const VideoCodesSlice = createSlice({
    name: 'videoCodes',
    initialState,
    reducers: {
        init: (_, action: PayloadAction<VideoCodesState>) => {
            return action.payload
        },
        set: (_, action: PayloadAction<VideoCode[]>) => {
            return normalizeData(action.payload)
        },
        append: (state: VideoCodesState, action: PayloadAction<VideoCode>): VideoCodesState => {
            const newVideoCode = action.payload
            return {
                byId: {
                    ...state.byId,
                    [newVideoCode.id]: newVideoCode,
                },
                ids: [...state.ids, newVideoCode.id],
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
                byId: remove(state.byId, elementId),
                ids: state.ids.filter((id) => id !== elementId),
            }
        },
    },
})

///////////////
// SELECTORS //
///////////////

export type VideoCodesSlice = { videoEditor: { data: { videoCodes: VideoCodesState } } }

const selectVideoCodesById = (state: VideoCodesSlice) => state.videoEditor.data.videoCodes.byId
const selectVideoCodeIds = (state: VideoCodesSlice) => state.videoEditor.data.videoCodes.ids
const selectVideoCodeById = (state: VideoCodesSlice, props: { videoCodeId: VideoCodeId }) =>
    state.videoEditor.data.videoCodes.byId[props.videoCodeId]
const selectDenormalizedVideoCodes = (state: VideoCodesSlice) =>
    state.videoEditor.data.videoCodes.ids.map((id) => state.videoEditor.data.videoCodes.byId[id])

const selectVideoCodesByStartTime = createSelector([selectVideoCodesById, selectVideoCodeIds], (byId, ids) => {
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

const selectIdsSortedByStartTime = createSelector([selectVideoCodesByStartTime], (videoCodesByStartTime) =>
    videoCodesByStartTime.map((videoCode) => videoCode.id)
)

export const selectors = {
    selectVideoCodesById,
    selectVideoCodeIds,
    selectVideoCodeById,
    selectVideoCodesByStartTime,
    selectIdsSortedByStartTime,
    selectDenormalizedVideoCodes,
}
