import { SubtitleFromAPI } from 'Components/SubtitleEditor/SubtitlesSlice'
import { schema, normalize, Schema } from 'normalizr'
import { VideoCodePrototype } from 'Components/VideoEditor/types'
import { generate } from 'shortid'
import { ConfigState } from './ExercisePhaseApp/Components/Config/ConfigSlice'

const addIdsToEntities = <E extends { id?: string }>(entities: Array<E>) =>
    entities.map((e) => ({ ...e, id: e?.id ?? generate() }))

export const ANNOTATIONS_API_PROPERTY = 'annotations'
export const VIDEO_CODES_API_PROPERTY = 'videoCodes'
export const CUTLIST_API_PROPERTY = 'cutList'

export const annotationSchema = new schema.Entity(ANNOTATIONS_API_PROPERTY)
export const videoCodesSchema = new schema.Entity(VIDEO_CODES_API_PROPERTY)
export const cutListSchema = new schema.Entity(CUTLIST_API_PROPERTY)

export const preparedAnnotationsSchema = {
    current: [annotationSchema],
    previous: [annotationSchema],
}

export const preparedVideoCodesSchema = {
    current: [videoCodesSchema],
    previous: [videoCodesSchema],
}

export const preparedCutsSchema = {
    current: [cutListSchema],
    previous: [cutListSchema],
}

const getNormalizedDataSlice = (solution: any, config: any, key: string, schema: Schema) => {
    const entitiesFromSolution = solution[key] ?? []

    const hasPreviousSolutions = !!config?.previousSolutions
    const previousEntities = hasPreviousSolutions
        ? config.previousSolutions.reduce((acc: unknown[], p: { solution: { [key: string]: unknown[] } }) => {
              const entities = p?.solution[key] ?? []

              return [...acc, ...entities]
          }, [])
        : []

    const current = addIdsToEntities(entitiesFromSolution)
    const previous = addIdsToEntities(previousEntities)

    const prepared = {
        current,
        previous,
    }

    const result = normalize(prepared, schema)

    return {
        byId: result.entities[key],
        ...result.result,
    }
}

export const normalizeAnnotations = (solution: any, config: any) =>
    getNormalizedDataSlice(solution, config, ANNOTATIONS_API_PROPERTY, preparedAnnotationsSchema)

export const normalizeVideoCodes = (solution: any, config: any) =>
    getNormalizedDataSlice(solution, config, VIDEO_CODES_API_PROPERTY, preparedVideoCodesSchema)

export const normalizeCuts = (solution: any, config: any) =>
    getNormalizedDataSlice(solution, config, CUTLIST_API_PROPERTY, preparedCutsSchema)

// TODO
// Old code using a custom normalize function - might be useful to refactor this
// in the future to also use the normalizr variant. (however it is currently not super important)

/**
 * Normalizes a list of entities into an object with a 'byId'-lookup property of the entities,
 * and an 'ids' property with all string ids of the entities.
 *
 * If an entity does not have an id we generate a new unique id with shortid.
 */
export const normalizeData = <E extends { id: string }>(entities: Array<E>) =>
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
    return normalizeData(addIdsToEntities(flattenedVideoCodePool))
}

export const prepareSubtitlesFromSolution = (solution: any) => {
    const subtitles: SubtitleFromAPI[] = solution?.subtitles ?? []
    return normalizeData(addIdsToEntities(subtitles))
}
