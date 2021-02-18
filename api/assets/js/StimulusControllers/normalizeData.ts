import { schema, normalize, NormalizedSchema } from 'normalizr'
import { VideoCodePrototype, Annotation, Cut, SolutionId, Solution, VideoCode } from 'Components/VideoEditor/types'
import { generate } from 'shortid'
import { AnnotationId } from 'Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import { VideoCodeId } from 'Components/VideoEditor/VideoCodesContext/VideoCodesSlice'
import { CutId } from 'Components/VideoEditor/CuttingContext/CuttingSlice'
import { VideoCodePrototypeId } from 'Components/VideoEditor/VideoCodesContext/VideoCodePrototypesSlice'
import { ConfigState } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import {
    videoComponents,
    ActiveComponent,
    FilterState,
    VideoComponentId,
    ActivePreviousSolution,
} from 'Components/VideoEditor/FilterContext/FilterSlice'
import { TabsTypesEnum } from 'types'
import { setIn } from 'immutable'
import { SolutionByTeam } from './SolutionsController'
import hash from 'object-hash'

export const addIdsToEntities = <E extends { id?: string }>(entities: Array<E>) =>
    entities.map((e) => ({ ...e, id: e?.id ?? generate() }))

export const ANNOTATIONS_API_PROPERTY = 'annotations'
export const VIDEO_CODES_API_PROPERTY = 'videoCodes'
export const CUTLIST_API_PROPERTY = 'cutList'
export const VIDEO_CODE_PROTOTYPE_API_PROPERTY = 'customVideoCodesPool'

// FIXME
// in the long run we should try to make annotations, videoCodes etc. proper entities
// inside the model and add real unique ids. Ofcourse that would also mean that we would
// need to migrate existing mediaItems. However this should be trivial, as currently only
// access their ids inside the frontend.

// FIXME
// narrow down types wherey possible

// Small hack to create a somewhat unique id from an object hash which is not random
// but reproducable
const idFromHash = (value: any) => hash.sha1(value)

// Hacky strategy, because we didn't make annotations etc. proper entities with ids
// when we started out with the project.
// If we encounter an item when normalizing, which does not yet have an id we
// add one to it by creating a sha1 hash from the object as identifier.
const addMissingIdProcessStrategy = (value: any) => {
    if (!value.id) {
        return { ...value, id: idFromHash(value) }
    }
    return { ...value }
}

// Takes a regular normalizr process strategy, applies our custom addMissingIdProcessStrategy and
// pipes the result back into the given strategy.
const mergeProcessStrategyWithIdStrategy = (processStrategy: (value: any, parent: any, key: any) => any) => (
    value: any,
    parent: any,
    key: any
) => {
    const withId = addMissingIdProcessStrategy(value)
    return processStrategy(withId, parent, key)
}

// Adds the parent solution.id to the given value (e.g. an annotation)
const addParentSolutionIdStrategy = (value: any, parent: any) => {
    return { ...value, solutionId: parent.id }
}

// Takes a regular normalizr options object and makes sure,
// that our addMissingdProcessStrategy will always be part of the resulting
// options object.
// This also completely overwrites the 'idAttribute' of the options object
// and sets it to a function which will generate the same id-hash for any
// media item that will be generated in our addMissingIdProcessStrategy.
// The hash will then be set as key of the resulting entity after normalization.
//
// So when being normalized an annotation looking like this:
// { name: 'something', text: 'something' }
// will eventually appear like the following inside the normalized entities:
//
// { entities: { annotations: {
//    <generatedHashIDForAnnotation>: { id: <generatedHashIDForAnnotation>, name: 'something', ... }
// }}}
const entityOptionsWithIdCreation = (options: any) => {
    const processStrategy = options?.processStrategy
        ? mergeProcessStrategyWithIdStrategy(options.processStrategy)
        : addMissingIdProcessStrategy

    const idAttribute = (value: any) => value?.id ?? idFromHash(value)

    return {
        ...options,
        processStrategy,
        idAttribute,
    }
}

export const annotationSchema = new schema.Entity(
    ANNOTATIONS_API_PROPERTY,
    {},
    entityOptionsWithIdCreation({ processStrategy: addParentSolutionIdStrategy })
)

export const videoCodesSchema = new schema.Entity(
    VIDEO_CODES_API_PROPERTY,
    {},
    entityOptionsWithIdCreation({ processStrategy: addParentSolutionIdStrategy })
)

export const cutListSchema = new schema.Entity(
    CUTLIST_API_PROPERTY,
    {},
    entityOptionsWithIdCreation({ processStrategy: addParentSolutionIdStrategy })
)

const videoCodePrototypeChildren = new schema.Entity(
    VIDEO_CODE_PROTOTYPE_API_PROPERTY,
    {},
    entityOptionsWithIdCreation({})
)

export const videoCodePrototypeSchema = new schema.Entity(VIDEO_CODE_PROTOTYPE_API_PROPERTY, {
    videoCodes: [videoCodePrototypeChildren],
})

const exerciseAppSolutionSchema = new schema.Entity(
    'solutions',
    {
        solution: {
            annotations: [annotationSchema],
            videoCodes: [videoCodesSchema],
            cutList: [cutListSchema],
            customVideoCodesPool: [videoCodePrototypeSchema],
        },
    },
    // WHY:
    // We need the solution id inside the 'subSolution' to further process it
    // with our addParentSolutionIdStrategy
    // Our solutions are nested objects which look like this:
    // { id: '<solutionID>', solution: { annotations: [], videoCode: [], ... }
    // We need the solutionId also inside the solution.solution property for proper
    // normalization. This strategy processes the subsolution and adds the parent solution.
    { processStrategy: (value) => setIn(value, ['solution', 'id'], value.id) }
)

export const preparedAPIResponseSchema = {
    currentSolution: exerciseAppSolutionSchema,
    previousSolutions: [exerciseAppSolutionSchema],
}

type NormalizedEntities = {
    annotations: Record<AnnotationId, Annotation>
    videoCodes: Record<VideoCodeId, VideoCode>
    cutList: Record<CutId, Cut>
    solutions: Record<SolutionId, Solution>
    customVideoCodesPool: Record<VideoCodePrototypeId, VideoCodePrototype>
}

type NormalizedResult = {
    currentSolution: SolutionId | undefined
    previousSolutions: SolutionId[]
}

// TODO add solution typing
export const normalizeAPIResponseForExercisePhaseApp = (
    solution: any,
    config: ConfigState
): NormalizedSchema<NormalizedEntities, NormalizedResult> => {
    const videoCodePrototypesFromConfig = config.videoCodesPool

    const hasProperCustomCodes =
        solution.solution.customVideoCodesPool &&
        solution.solution.customVideoCodesPool.length >= videoCodePrototypesFromConfig.length

    const customVideoCodesPool: VideoCodePrototype[] = hasProperCustomCodes
        ? solution.solution.customVideoCodesPool
        : videoCodePrototypesFromConfig

    // Flatten so that children are also listed
    const flattenedVideoCodePool: VideoCodePrototype[] = customVideoCodesPool.reduce(
        (acc: VideoCodePrototype[], code) => {
            const children = code.videoCodes
            const childrenWithParentId = children.map((c) => ({
                ...c,
                parentId: c.parentId ?? code.id,
            }))

            return [...acc, code, ...childrenWithParentId]
        },
        []
    )

    const preparedData = {
        previousSolutions: config.previousSolutions,
        currentSolution: {
            ...solution,
            solution: {
                ...solution.solution,
                customVideoCodesPool: flattenedVideoCodePool,
            },
        },
    }

    return normalize(preparedData, preparedAPIResponseSchema)
}

export const normalizeAPIResponseForSolutionsApp = (
    solutions: SolutionByTeam[]
): NormalizedSchema<NormalizedEntities, NormalizedResult> => {
    const preparedData = {
        previousSolutions: solutions,
        currentSolution: {},
    }

    return normalize(preparedData, preparedAPIResponseSchema)
}

/**
 * Determines which videoComponents (cuts, codes, annotations) should be available
 * by checking the config components as well as components from previous solutions.
 */
export const initializeComponentFilter = (config: ConfigState): Pick<FilterState, 'components' | 'componentIds'> => {
    const idsFromPreviousSolutions = config.previousSolutions.reduce((acc: TabsTypesEnum[], solution) => {
        const hasCodes = solution.solution.videoCodes.length > 0
        const hasAnnotations = solution.solution.annotations.length > 0
        const hasCuts = solution.solution.cutList.length > 0

        return [
            ...acc,
            ...(hasCodes ? [TabsTypesEnum.VIDEO_CODES] : []),
            ...(hasAnnotations ? [TabsTypesEnum.VIDEO_ANNOTATIONS] : []),
            ...(hasCuts ? [TabsTypesEnum.VIDEO_CUTTING] : []),
        ]
    }, [])

    const uniqueIds = new Set([...config.components, ...idsFromPreviousSolutions])

    const allComponentIds = videoComponents.filter((c) => [...uniqueIds].includes(c))
    const components = allComponentIds.reduce((acc: Record<VideoComponentId, ActiveComponent>, id) => {
        return {
            ...acc,
            [id]: { id, isVisible: true },
        }
    }, {} as Record<VideoComponentId, ActiveComponent>)

    return {
        componentIds: allComponentIds,
        components,
    }
}

export const initializePreviousSolutionsFilter = (
    previousSolutions: { id: string }[]
): Pick<FilterState, 'previousSolutions' | 'previousSolutionIds'> => {
    const activePreviousSolutions = previousSolutions.reduce((acc: Record<string, ActivePreviousSolution>, s) => {
        return {
            ...acc,
            [s.id]: { id: s.id, isVisible: true },
        }
    }, {} as Record<string, ActivePreviousSolution>)

    const previousSolutionIds = previousSolutions.map((s) => s.id)

    return {
        previousSolutions: activePreviousSolutions,
        previousSolutionIds,
    }
}
