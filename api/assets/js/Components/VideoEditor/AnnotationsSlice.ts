///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { normalizeData } from 'StimulusControllers/normalizeData'
import { Annotation } from './VideoListsSlice'

export type AnnotationId = string

export type AnnotationsState = {
    byId: Record<AnnotationId, Annotation>
    ids: AnnotationId[]
}

export const initialState: AnnotationsState = {
    byId: {},
    ids: [],
}

/////////////
// REDUCER //
/////////////

export const AnnotationsSlice = createSlice({
    name: 'annotations',
    initialState,
    reducers: {
        init: (_, action: PayloadAction<AnnotationsState>) => {
            return action.payload
        },
        set: (_, action: PayloadAction<Annotation[]>) => {
            return normalizeData(action.payload)
        },
        append: (state: AnnotationsState, action: PayloadAction<Annotation>): AnnotationsState => {
            const newAnnotation = action.payload
            return {
                byId: {
                    ...state.byId,
                    [newAnnotation.id]: newAnnotation,
                },
                ids: [...state.ids, newAnnotation.id],
            }
        },
        update: (
            state: AnnotationsState,
            action: PayloadAction<{ transientAnnotation: Annotation }>
        ): AnnotationsState => {
            const { transientAnnotation } = action.payload

            return {
                ...state,
                byId: set(state.byId, transientAnnotation.id, transientAnnotation),
            }
        },
        remove: (state: AnnotationsState, action: PayloadAction<string>): AnnotationsState => {
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

type AnnotationsSlice = { videoEditor: { data: { annotations: AnnotationsState } } }

const selectAnnotationsById = (state: AnnotationsSlice) => state.videoEditor.data.annotations.byId
const selectAnnotationIds = (state: AnnotationsSlice) => state.videoEditor.data.annotations.ids
const selectAnnotationById = (state: AnnotationsSlice, props: { annotationId: AnnotationId }) =>
    state.videoEditor.data.annotations.byId[props.annotationId]
const selectDenormalizedAnnotations = (state: AnnotationsSlice) =>
    state.videoEditor.data.annotations.ids.map((id) => state.videoEditor.data.annotations.byId[id])

// TODO add sorted annoations id list (by start date)

const selectAnnotationsByStartTime = createSelector([selectAnnotationsById, selectAnnotationIds], (byId, ids) => {
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

const selectIdsSortedByStartTime = createSelector([selectAnnotationsByStartTime], (annotationsByStartTime) =>
    annotationsByStartTime.map((annotation) => annotation.id)
)

export const selectors = {
    selectAnnotationsById,
    selectAnnotationIds,
    selectAnnotationById,
    selectAnnotationsByStartTime,
    selectIdsSortedByStartTime,
    selectDenormalizedAnnotations,
}
