///////////
// STATE //
///////////

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { remove, set, setIn } from 'immutable'
import { TabsTypesEnum } from 'types'

export const videoComponents = [
    TabsTypesEnum.VIDEO_CODES,
    TabsTypesEnum.VIDEO_CUTTING,
    TabsTypesEnum.VIDEO_ANNOTATIONS,
] as const
export type VideoComponentId = typeof videoComponents[number]

export type ActiveComponent = { id: VideoComponentId; isVisible: boolean }
export type ActivePreviousSolution = { id: string; isVisible: boolean }

export type FilterState = {
    components: Record<VideoComponentId, ActiveComponent>
    componentIds: VideoComponentId[]
    previousSolutions: Record<string, ActivePreviousSolution>
    previousSolutionIds: string[]
}

export const initialState: FilterState = {
    components: {} as Record<VideoComponentId, ActiveComponent>,
    componentIds: [],
    previousSolutions: {},
    previousSolutionIds: [],
}

/////////////
// REDUCER //
/////////////

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        init: (state, action: PayloadAction<FilterState>) => {
            return {
                ...state,
                ...action.payload,
            }
        },
        toggleComponent: (state, action: PayloadAction<string>) => {
            const id = action.payload as VideoComponentId
            const component = state.components[id]

            return setIn(state, ['components', id], { ...component, isVisible: !component.isVisible })
        },
        togglePreviousSolution: (state, action: PayloadAction<string>) => {
            const id = action.payload
            const previousSolution = state.previousSolutions[id]

            return setIn(state, ['previousSolutions', id], {
                ...previousSolution,
                isVisible: !previousSolution.isVisible,
            })
        },
    },
})

///////////////
// SELECTORS //
///////////////

export type FilterStateSlice = { videoEditor: { filter: FilterState } }

const selectComponentsById = (state: FilterStateSlice) => state.videoEditor.filter.components
const selectComponentIds = (state: FilterStateSlice) => state.videoEditor.filter.componentIds
const selectPreviousSolutionsById = (state: FilterStateSlice) => state.videoEditor.filter.previousSolutions
const selectPreviousSolutionIds = (state: FilterStateSlice) => state.videoEditor.filter.previousSolutionIds

const selectComponents = createSelector([selectComponentsById, selectComponentIds], (byId, ids) =>
    ids
        .map((id) => byId[id])
        .sort((component) => {
            // WHY:
            // currently cutting should alway come first, because we only show previous
            // components inside the cutting phase to reference while cutting.
            // If we at some point plan to change this to the component for the current phase coming first
            // this would need to be implemented.
            if (component.id === TabsTypesEnum.VIDEO_CUTTING) {
                return -1
            } else {
                return 1
            }
        })
)

const selectPreviousSolutions = createSelector([selectPreviousSolutionsById, selectPreviousSolutionIds], (byId, ids) =>
    ids.map((id) => byId[id])
)

const selectVisiblePreviousSolutions = createSelector([selectPreviousSolutions], (solutions) =>
    solutions.filter((s) => s.isVisible)
)

export const selectors = {
    selectComponentsById,
    selectComponentIds,
    selectComponents,

    selectPreviousSolutionsById,
    selectPreviousSolutionIds,
    selectPreviousSolutions,
    selectVisiblePreviousSolutions,
}
