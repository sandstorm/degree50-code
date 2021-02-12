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
} from 'Components/VideoEditor/components/MultiLane/Filter/FilterSlice'
import { TabsTypesEnum } from 'types'
import { setIn } from 'immutable'

export const addIdsToEntities = <E extends { id?: string }>(entities: Array<E>) =>
    entities.map((e) => ({ ...e, id: e?.id ?? generate() }))

export const ANNOTATIONS_API_PROPERTY = 'annotations'
export const VIDEO_CODES_API_PROPERTY = 'videoCodes'
export const CUTLIST_API_PROPERTY = 'cutList'
export const VIDEO_CODE_PROTOTYPE_API_PROPERTY = 'customVideoCodesPool'

const addMissingIdProcessStrategy = (value: any) => {
    if (!value.id) {
        return { ...value, id: generate() }
    }
    return { ...value }
}

const addParentSolutionIdStrategy = (value: any, parent: any) => {
    return { ...value, solutionId: parent.id }
}

const mediaItemProcessStrategy = (value: any, parent: any) => {
    const withId = addMissingIdProcessStrategy(value)
    const withParentSolutioId = addParentSolutionIdStrategy(withId, parent)

    return withParentSolutioId
}

export const annotationSchema = new schema.Entity(
    ANNOTATIONS_API_PROPERTY,
    {},
    { processStrategy: mediaItemProcessStrategy }
)
export const videoCodesSchema = new schema.Entity(
    VIDEO_CODES_API_PROPERTY,
    {},
    { processStrategy: mediaItemProcessStrategy }
)
export const cutListSchema = new schema.Entity(CUTLIST_API_PROPERTY, {}, { processStrategy: mediaItemProcessStrategy })

const videoCodePrototypeChildren = new schema.Entity(VIDEO_CODE_PROTOTYPE_API_PROPERTY, {
    processStrategy: addMissingIdProcessStrategy,
})
export const videoCodePrototypeSchema = new schema.Entity(VIDEO_CODE_PROTOTYPE_API_PROPERTY, {
    videoCodes: [videoCodePrototypeChildren],
})

const solutionSchema = new schema.Entity(
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
    // with our mediaItemProcessStrategy
    { processStrategy: (value) => setIn(value, ['solution', 'id'], value.id) }
)

export const preparedAPIResponseSchema = {
    currentSolution: solutionSchema,
    previousSolutions: [solutionSchema],
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
export const normalizeAPIResponse = (
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
