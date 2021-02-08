import { SubtitleFromAPI } from 'Components/SubtitleEditor/SubtitlesSlice'
import { schema, normalize, Schema, NormalizedSchema } from 'normalizr'
import { VideoCodePrototype, Annotation, Cut, SolutionId, Solution, VideoCode } from 'Components/VideoEditor/types'
import { generate } from 'shortid'
import { ConfigState } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import { AnnotationId } from 'Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import { VideoCodeId } from 'Components/VideoEditor/VideoCodesContext/VideoCodesSlice'
import { CutId } from 'Components/VideoEditor/CuttingContext/CuttingSlice'

const addIdsToEntities = <E extends { id?: string }>(entities: Array<E>) =>
    entities.map((e) => ({ ...e, id: e?.id ?? generate() }))

export const ANNOTATIONS_API_PROPERTY = 'annotations'
export const VIDEO_CODES_API_PROPERTY = 'videoCodes'
export const CUTLIST_API_PROPERTY = 'cutList'

const addMissingIdProcessStrategy = (value: any) => {
    if (!value.id) {
        return { ...value, id: generate() }
    }
    return { ...value }
}

export const annotationSchema = new schema.Entity(
    ANNOTATIONS_API_PROPERTY,
    {},
    { processStrategy: addMissingIdProcessStrategy }
)
export const videoCodesSchema = new schema.Entity(
    VIDEO_CODES_API_PROPERTY,
    {},
    { processStrategy: addMissingIdProcessStrategy }
)
export const cutListSchema = new schema.Entity(
    CUTLIST_API_PROPERTY,
    {},
    { processStrategy: addMissingIdProcessStrategy }
)

// TODO probably add prototypes as well
const solutionSchema = new schema.Entity('solutions', {
    solution: {
        annotations: [annotationSchema],
        videoCodes: [videoCodesSchema],
        cutList: [cutListSchema],
    },
})

export const preparedAPIResponseSchema = {
    currentSolution: solutionSchema,
    previousSolutions: [solutionSchema],
}

type NormalizedEntities = {
    annotations: Record<AnnotationId, Annotation>
    videoCodes: Record<VideoCodeId, VideoCode>
    cutList: Record<CutId, Cut>
    solutions: Record<SolutionId, Solution>
}

type NormalizedResult = {
    currentSolution: SolutionId | undefined
    previousSolutions: SolutionId[]
}

export const normalizeAPIResponse = (
    solution: any,
    config: any
): NormalizedSchema<NormalizedEntities, NormalizedResult> => {
    const preparedData = {
        previousSolutions: config.previousSolutions,
        currentSolution: solution,
    }

    return normalize(preparedData, preparedAPIResponseSchema)
}

// TODO
// Old code using a custom normalize function - might be useful to refactor this
// in the future to also use the normalizr variant. (however it is currently not super important)

/**
 * Normalizes a list of entities into an object with a 'byId'-lookup property of the entities,
 * and an 'ids' property with all string ids of the entities.
 *
 * If an entity does not have an id we generate a new unique id with shortid.
 */
export const normalizeDataOld = <E extends { id: string }>(entities: Array<E>) =>
    entities.reduce(
        (acc: { byId: { [id: string]: E }; allIds: string[] }, entity: E) => {
            return {
                byId: {
                    ...acc.byId,
                    [entity.id]: {
                        ...entity,
                    },
                },
                allIds: [...acc.allIds, entity.id],
            }
        },
        { byId: {}, allIds: [] }
    )

export const prepareVideoCodePoolFromSolution = (solution: any, config?: ConfigState) => {
    const customVideoCodePool: VideoCodePrototype[] = (() => {
        if (solution.customVideoCodesPool && solution.customVideoCodesPool.length > 0) {
            return solution.customVideoCodesPool
        } else if (config?.videoCodesPool) {
            return config.videoCodesPool
        } else {
            return []
        }
    })()

    const flattenedVideoCodePool: VideoCodePrototype[] = customVideoCodePool.reduce(
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
    return normalizeDataOld(addIdsToEntities(flattenedVideoCodePool))
}

export const prepareSubtitlesFromSolution = (solution: any) => {
    const subtitles: SubtitleFromAPI[] = solution?.subtitles ?? []
    return normalizeDataOld(addIdsToEntities(subtitles))
}
