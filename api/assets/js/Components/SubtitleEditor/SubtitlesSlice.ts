///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MediaItemType } from 'Components/VideoEditor/types'
import { remove, set } from 'immutable'
import { normalizeData } from 'StimulusControllers/normalizeData'

export type SubtitleFromAPI = MediaItemType & { id?: string }
export type Subtitle = Omit<SubtitleFromAPI, 'id'> & { id: string }

export type SubtitleId = string

export type SubtitlesState = {
    byId: Record<SubtitleId, Subtitle>
    ids: SubtitleId[]
}

export const initialState: SubtitlesState = {
    byId: {},
    ids: [],
}

/////////////
// REDUCER //
/////////////

export const SubtitlesSlice = createSlice({
    name: 'subtitles',
    initialState,
    reducers: {
        init: (_, action: PayloadAction<SubtitlesState>) => {
            return action.payload
        },
        set: (_, action: PayloadAction<Subtitle[]>) => {
            // FIXME use the code below to update subtitles
            // WHY:
            // New items are always placed at the current cursor position.
            // This might lead to a situation, where it is placed before another item, which
            // is considered to be an illegal state. Therefore we reorder items in that case.
            // const sortedByStarttime = [...action.payload].sort((a, b) => {
            // const startA = timeToSecond(a.start)
            // const startB = timeToSecond(b.start)

            // if (startA < startB) {
            // return -1
            // } else if (startA > startB) {
            // return 1
            // } else {
            // return 0
            // }
            // })

            return normalizeData(action.payload)
        },
        append: (state: SubtitlesState, action: PayloadAction<Subtitle>): SubtitlesState => {
            const newSubtitle = action.payload
            return {
                byId: {
                    ...state.byId,
                    [newSubtitle.id]: newSubtitle,
                },
                ids: [...state.ids, newSubtitle.id],
            }
        },
        update: (state: SubtitlesState, action: PayloadAction<{ transientSubtitle: Subtitle }>): SubtitlesState => {
            const { transientSubtitle } = action.payload

            return {
                ...state,
                byId: set(state.byId, transientSubtitle.id, transientSubtitle),
            }
        },
        remove: (state: SubtitlesState, action: PayloadAction<string>): SubtitlesState => {
            const elementId = action.payload

            return {
                byId: remove(state.byId, elementId),
                ids: state.ids.filter((id) => id !== elementId),
            }
        },
    },
})

export const { actions } = SubtitlesSlice

///////////////
// SELECTORS //
///////////////

export type SubtitlesStateSlice = { subtitles: SubtitlesState }

const selectSubtitlesById = (state: SubtitlesStateSlice) => state.subtitles.byId
const selectSubtitleIds = (state: SubtitlesStateSlice) => state.subtitles.ids
const selectSubtitleById = (state: SubtitlesStateSlice, props: { subtitleId: SubtitleId }) =>
    state.subtitles.byId[props.subtitleId]
const selectDenormalizedSubtitles = (state: SubtitlesStateSlice) =>
    state.subtitles.ids.map((id) => state.subtitles.byId[id])

// TODO add sorted annoations id list (by start date)

const selectSubtitlesByStartTime = createSelector([selectSubtitlesById, selectSubtitleIds], (byId, ids) => {
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

const selectIdsSortedByStartTime = createSelector([selectSubtitlesByStartTime], (subtitlesByStartTime) =>
    subtitlesByStartTime.map((subtitle) => subtitle.id)
)

export const selectors = {
    selectSubtitlesById,
    selectSubtitleIds,
    selectSubtitleById,
    selectSubtitlesByStartTime,
    selectIdsSortedByStartTime,
    selectDenormalizedSubtitles,
}
