///////////
// STATE //
///////////

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { setIn, set } from 'immutable'
import { TabsTypesEnum } from 'types'

export const videoComponents = [
    TabsTypesEnum.VIDEO_CODES,
    TabsTypesEnum.VIDEO_CUTTING,
    TabsTypesEnum.VIDEO_ANNOTATIONS,
] as const
export type VideoComponentId = typeof videoComponents[number]

export type ActiveComponent = { id: VideoComponentId; isVisible: boolean }
export type ActivePreviousSolution = { id: string; isVisible: boolean }
export enum GlobalSolutionFilter {
    ALL = 'all',
    NONE = 'none',
    MIXED = 'mixed',
}

export type FilterState = {
    components: Record<VideoComponentId, ActiveComponent>
    componentIds: VideoComponentId[]
    previousSolutions: Record<string, ActivePreviousSolution>
    previousSolutionIds: string[]
    globalSolutionFilter: GlobalSolutionFilter
}

export const initialState: FilterState = {
    components: {} as Record<VideoComponentId, ActiveComponent>,
    componentIds: [],
    previousSolutions: {},
    previousSolutionIds: [],
    globalSolutionFilter: GlobalSolutionFilter.ALL,
}

/////////////
// REDUCER //
/////////////

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        init: (state: FilterState, action: PayloadAction<FilterState>) => {
            return {
                ...state,
                ...action.payload,
            }
        },
        toggleComponent: (state: FilterState, action: PayloadAction<string>) => {
            const id = action.payload as VideoComponentId
            const component = state.components[id]

            return setIn(state, ['components', id], { ...component, isVisible: !component.isVisible })
        },
        togglePreviousSolution: (state: FilterState, action: PayloadAction<string>) => {
            const id = action.payload
            const previousSolution = state.previousSolutions[id]

            const updatedState = setIn(state, ['previousSolutions', id], {
                ...previousSolution,
                isVisible: !previousSolution.isVisible,
            })

            const updatedSolutions = updatedState.previousSolutionIds.map((id) => updatedState.previousSolutions[id])

            if (updatedSolutions.every((solution) => solution.isVisible)) {
                // all are visible
                return set(updatedState, 'globalSolutionFilter', GlobalSolutionFilter.ALL)
            } else if (updatedSolutions.every((solution) => !solution.isVisible)) {
                // all are invisible
                return set(updatedState, 'globalSolutionFilter', GlobalSolutionFilter.NONE)
            } else {
                // mixed
                return set(updatedState, 'globalSolutionFilter', GlobalSolutionFilter.MIXED)
            }
        },
        setGlobalSolutionFilter: (state: FilterState, action: PayloadAction<GlobalSolutionFilter>) => {
            switch (action.payload) {
                case GlobalSolutionFilter.ALL:
                    return {
                        ...state,
                        globalSolutionFilter: GlobalSolutionFilter.ALL,
                        previousSolutions: state.previousSolutionIds.reduce<FilterState['previousSolutions']>(
                            (acc, id) => ({
                                ...acc,
                                [id]: set(state.previousSolutions[id], 'isVisible', true),
                            }),
                            {}
                        ),
                    }
                case GlobalSolutionFilter.NONE:
                    return {
                        ...state,
                        globalSolutionFilter: GlobalSolutionFilter.NONE,
                        previousSolutions: state.previousSolutionIds.reduce<FilterState['previousSolutions']>(
                            (acc, id) => ({
                                ...acc,
                                [id]: set(state.previousSolutions[id], 'isVisible', false),
                            }),
                            {}
                        ),
                    }
                case GlobalSolutionFilter.MIXED:
                    return {
                        ...state,
                        globalSolutionFilter: GlobalSolutionFilter.MIXED,
                    }
            }
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
const selectGlobalSolutionFilter = (state: FilterStateSlice) => state.videoEditor.filter.globalSolutionFilter

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

    selectGlobalSolutionFilter,
}
