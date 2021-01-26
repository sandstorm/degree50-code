///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { normalizeData } from 'StimulusControllers/normalizeData'
import { VideoCodePrototype } from './VideoListsSlice'

export type VideoCodePrototypeId = string

export type VideoCodePoolState = {
    byId: Record<VideoCodePrototypeId, VideoCodePrototype>
    ids: VideoCodePrototypeId[]
}

export const initialState: VideoCodePoolState = {
    byId: {},
    ids: [],
}

/////////////
// REDUCER //
/////////////

export const VideoCodePoolSlice = createSlice({
    name: 'customVideoCodePool',
    initialState,
    reducers: {
        init: (_, action: PayloadAction<VideoCodePoolState>) => {
            return action.payload
        },
        set: (_, action: PayloadAction<VideoCodePrototype[]>) => {
            return normalizeData(action.payload)
        },
        append: (state: VideoCodePoolState, action: PayloadAction<VideoCodePrototype>): VideoCodePoolState => {
            const newVideoCode = action.payload
            return {
                byId: {
                    ...state.byId,
                    [newVideoCode.id]: newVideoCode,
                },
                ids: [...state.ids, newVideoCode.id],
            }
        },
        update: (
            state: VideoCodePoolState,
            action: PayloadAction<{ transientVideoCode: VideoCodePrototype }>
        ): VideoCodePoolState => {
            const { transientVideoCode } = action.payload

            return {
                ...state,
                byId: set(state.byId, transientVideoCode.id, transientVideoCode),
            }
        },
        remove: (state: VideoCodePoolState, action: PayloadAction<string>): VideoCodePoolState => {
            const elementId = action.payload
            const allElements = state.ids.map((id) => state.byId[id])

            const updatedPrototypes = allElements.filter((e) => e.id !== elementId && e.parentId !== elementId)

            return normalizeData(updatedPrototypes)
        },
    },
})

///////////////
// SELECTORS //
///////////////

export type VideoCodePoolStateSlice = { videoEditor: { data: { videoCodePool: VideoCodePoolState } } }

const selectVideoCodesById = (state: VideoCodePoolStateSlice) => state.videoEditor.data.videoCodePool.byId
const selectVideoCodeIds = (state: VideoCodePoolStateSlice) => state.videoEditor.data.videoCodePool.ids
const selectVideoCodeById = (state: VideoCodePoolStateSlice, props: { videoCodeId: VideoCodePrototypeId }) =>
    state.videoEditor.data.videoCodePool.byId[props.videoCodeId]
const selectDenormalizedVideoCodes = (state: VideoCodePoolStateSlice) =>
    state.videoEditor.data.videoCodePool.ids.map((id) => state.videoEditor.data.videoCodePool.byId[id])

const selectVideoCodePoolList = createSelector([selectDenormalizedVideoCodes], (codes) => {
    return codes.reduce((acc: VideoCodePrototype[], code) => {
        if (code.parentId) {
            return acc
        }

        const childCodes = codes.filter((c) => c.parentId === code.id)

        return [...acc, { ...code, videoCodes: childCodes }]
    }, [])
})

export const selectors = {
    selectVideoCodesById,
    selectVideoCodeIds,
    selectVideoCodeById,
    selectDenormalizedVideoCodes,
    selectVideoCodePoolList,
}
