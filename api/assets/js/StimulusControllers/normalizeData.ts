import { generate } from 'shortid'

/**
 * Normalizes a list of entities into an object with a 'byId'-lookup property of the entities,
 * and an 'ids' property with all string ids of the entities.
 *
 * If an entity does not have an id we generate a new unique id with shortid.
 */
export const normalizeData = <E extends { id?: string }>(entities: Array<E>) =>
    // Note: the omit is currently necessary, because we did not have ids in our data types before.
    // Therefore we do not know if our input entites already contain an id and the type has to be defined as optional.
    // However our normalized output always will contain a proper id, so we intersect the accumulator type with a required id.
    entities.reduce(
        (acc: { byId: { [id: string]: Omit<E, 'id'> & { id: string } }; ids: string[] }, entity: E) => {
            const id = entity?.id ?? generate()

            return {
                byId: {
                    ...acc.byId,
                    [id]: {
                        id,
                        ...entity,
                    },
                },
                ids: [...acc.ids, id],
            }
        },
        { byId: {}, ids: [] }
    )
