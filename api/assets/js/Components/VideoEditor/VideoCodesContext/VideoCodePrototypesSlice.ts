///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { set } from 'immutable'
import { normalizeData } from 'StimulusControllers/normalizeData'
import { VideoCodePrototype } from '../types'

export type VideoCodePrototypeId = string

export type VideoCodePrototypesState = {
    byId: Record<VideoCodePrototypeId, VideoCodePrototype>
    allIds: VideoCodePrototypeId[]
}

export const initialState: VideoCodePrototypesState = {
    byId: {},
    allIds: [],
}

/////////////
// REDUCER //
/////////////

export const VideoCodePrototypesSlice = createSlice({
    name: 'videoCodePrototypes',
    initialState,
    reducers: {
        init: (_, action: PayloadAction<VideoCodePrototypesState>) => {
            return action.payload
        },
        set: (_, action: PayloadAction<VideoCodePrototype[]>) => {
            return normalizeData(action.payload)
        },
        append: (
            state: VideoCodePrototypesState,
            action: PayloadAction<VideoCodePrototype>
        ): VideoCodePrototypesState => {
            const newPrototype = action.payload
            return {
                byId: {
                    ...state.byId,
                    [newPrototype.id]: newPrototype,
                },
                allIds: [...state.allIds, newPrototype.id],
            }
        },
        update: (
            state: VideoCodePrototypesState,
            action: PayloadAction<{ transientVideoCodePrototype: VideoCodePrototype }>
        ): VideoCodePrototypesState => {
            const { transientVideoCodePrototype } = action.payload

            return {
                ...state,
                byId: set(state.byId, transientVideoCodePrototype.id, transientVideoCodePrototype),
            }
        },
        remove: (state: VideoCodePrototypesState, action: PayloadAction<string>): VideoCodePrototypesState => {
            const elementId = action.payload
            const allElements = state.allIds.map((id) => state.byId[id])

            const updatedPrototypes = allElements.filter((e) => e.id !== elementId && e.parentId !== elementId)

            return normalizeData(updatedPrototypes)
        },
    },
})

///////////////
// SELECTORS //
///////////////

export type VideoCodePoolStateSlice = { videoEditor: { data: { videoCodePrototypes: VideoCodePrototypesState } } }

const selectById = (state: VideoCodePoolStateSlice) => state.videoEditor.data.videoCodePrototypes.byId
const selectAllIds = (state: VideoCodePoolStateSlice) => state.videoEditor.data.videoCodePrototypes.allIds
const selectPrototypeById = (state: VideoCodePoolStateSlice, props: { videoCodeId: VideoCodePrototypeId }) =>
    state.videoEditor.data.videoCodePrototypes.byId[props.videoCodeId]
const selectDenormalizedPrototypes = (state: VideoCodePoolStateSlice) =>
    state.videoEditor.data.videoCodePrototypes.allIds.map((id) => state.videoEditor.data.videoCodePrototypes.byId[id])

const selectPrototypesList = createSelector([selectDenormalizedPrototypes], (codes) => {
    return codes.reduce((acc: VideoCodePrototype[], code) => {
        if (code.parentId) {
            return acc
        }

        const childCodes = codes.filter((c) => c.parentId === code.id)

        return [...acc, { ...code, videoCodes: childCodes }]
    }, [])
})

export const selectors = {
    selectById,
    selectAllIds,
    selectPrototypeById,
    selectDenormalizedVideoCodes: selectDenormalizedPrototypes,
    selectVideoCodePoolList: selectPrototypesList,
}
