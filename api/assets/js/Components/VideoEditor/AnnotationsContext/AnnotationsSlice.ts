///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { annotationSchema } from 'StimulusControllers/normalizeData'
import { Annotation } from '../types'
import { normalize } from 'normalizr'

export type AnnotationId = string

export type AnnotationsState = {
    byId: Record<AnnotationId, Annotation>
    current: AnnotationId[]
    previous: AnnotationId[]
}

export const initialState: AnnotationsState = {
    byId: {},
    current: [],
    previous: [],
}

/////////////
// REDUCER //
/////////////

export const AnnotationsSlice = createSlice({
    name: 'annotations',
    initialState,
    reducers: {
        init: (state, action: PayloadAction<AnnotationsState>) => {
            return {
                ...state,
                ...action.payload,
            }
        },
        set: (state, action: PayloadAction<Annotation[]>) => {
            const normalized = normalize(action.payload, [annotationSchema])

            return {
                ...state,
                byId: {
                    ...state.byId,
                    ...normalized.entities.annotations,
                },
            }
        },
        append: (state: AnnotationsState, action: PayloadAction<Annotation>): AnnotationsState => {
            const newAnnotation = action.payload
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [newAnnotation.id]: newAnnotation,
                },
                current: [...state.current, newAnnotation.id],
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

type AnnotationsSlice = { videoEditor: { data: { annotations: AnnotationsState } } }

const selectById = (state: AnnotationsSlice) => state.videoEditor.data.annotations.byId
const selectCurrentIds = (state: AnnotationsSlice) => state.videoEditor.data.annotations.current
const selectAnnotationById = (state: AnnotationsSlice, props: { annotationId: AnnotationId }) =>
    state.videoEditor.data.annotations.byId[props.annotationId]

const selectDenormalizedCurrent = (state: AnnotationsSlice) =>
    state.videoEditor.data.annotations.current.map((id) => state.videoEditor.data.annotations.byId[id])

const selectCurrentAnnotationsByStartTime = createSelector([selectById, selectCurrentIds], (byId, ids) => {
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
    [selectCurrentAnnotationsByStartTime],
    (annotationsByStartTime) => annotationsByStartTime.map((annotation) => annotation.id)
)

export const selectors = {
    selectById,
    selectCurrentIds,
    selectAnnotationById,
    selectCurrentAnnotationsByStartTime,
    selectCurrentIdsSortedByStartTime,
    selectDenormalizedCurrent,
}
