/**
 * @jest-environment jsdom
 */

import { sortItemsByStartTime, adjustItemTimelinePositionInList, snapItems } from '../util'
import { MediaItem } from '../../components/types'

const itemA = new MediaItem({
    start: '00:00:00.000',
    end: '00:00:05.000',
    text: 'Test',
    memo: 'Some test memo...',
    originalData: {},
    lane: 0,
    idFromPrototype: null,
})

const itemB = new MediaItem({
    start: '00:00:03.000',
    end: '00:00:07.000',
    text: 'Test',
    memo: 'Some test memo...',
    originalData: {},
    lane: 0,
    idFromPrototype: null,
})

const itemC = new MediaItem({
    start: '00:00:08.000',
    end: '00:00:15.000',
    text: 'Test',
    memo: 'Some test memo...',
    originalData: {},
    lane: 0,
    idFromPrototype: null,
})

describe('sortItemsByStartTime()', () => {
    test.each([
        [
            [itemA, itemB, itemC],
            [itemA, itemB, itemC],
        ],
        [
            [itemB, itemA, itemC],
            [itemA, itemB, itemC],
        ],
        [
            [itemC, itemA, itemB],
            [itemA, itemB, itemC],
        ],
        [
            [itemB, itemA, itemC],
            [itemA, itemB, itemC],
        ],
        [
            [itemB, itemC, itemA],
            [itemA, itemB, itemC],
        ],
        [
            [itemC, itemB, itemA],
            [itemA, itemB, itemC],
        ],
    ])('sortItemsByStartTime(%p)', (items, expected) => {
        expect(sortItemsByStartTime(items)).toEqual(expected)
    })
})

describe('adjustItemTimelinePositionInList()', () => {
    it('should correctly adjust startTime and endtime of item', () => {
        const index = 1
        const result = adjustItemTimelinePositionInList([itemA, itemB, itemC], itemB, index, '00:00:05.000')

        expect(result).toEqual([itemA, expect.any(MediaItem), itemC])

        expect(result[index].start).toBe('00:00:05.000')
        expect(result[index].end).toBe('00:00:09.000')
    })
})

describe('snapItems()', () => {
    test.each([
        [
            [itemA, itemB, itemC],
            '00:00:02.000',
            [
                new MediaItem({
                    start: '00:00:02.000',
                    end: '00:00:07.000',
                    text: 'Test',
                    memo: 'Some test memo...',
                    originalData: {},
                    lane: 0,
                    idFromPrototype: null,
                }),
                new MediaItem({
                    start: '00:00:07.010',
                    end: '00:00:11.010',
                    text: 'Test',
                    memo: 'Some test memo...',
                    originalData: {},
                    lane: 0,
                    idFromPrototype: null,
                }),
                new MediaItem({
                    start: '00:00:11.020',
                    end: '00:00:18.020',
                    text: 'Test',
                    memo: 'Some test memo...',
                    originalData: {},
                    lane: 0,
                    idFromPrototype: null,
                }),
            ],
        ],
        [
            [
                itemA,
                itemB,
                new MediaItem({
                    start: '00:00:12.000',
                    end: '00:00:20.000',
                    text: 'Test',
                    memo: 'Some test memo...',
                    originalData: {},
                    lane: 0,
                    idFromPrototype: null,
                }),
            ],
            '00:00:02.000',
            [
                new MediaItem({
                    start: '00:00:02.000',
                    end: '00:00:07.000',
                    text: 'Test',
                    memo: 'Some test memo...',
                    originalData: {},
                    lane: 0,
                    idFromPrototype: null,
                }),
                new MediaItem({
                    start: '00:00:07.010',
                    end: '00:00:11.010',
                    text: 'Test',
                    memo: 'Some test memo...',
                    originalData: {},
                    lane: 0,
                    idFromPrototype: null,
                }),
                new MediaItem({
                    start: '00:00:11.020',
                    end: '00:00:19.020',
                    text: 'Test',
                    memo: 'Some test memo...',
                    originalData: {},
                    lane: 0,
                    idFromPrototype: null,
                }),
            ],
        ],
    ])('firstItemStartTime(%p, %s)', (items, firstItemStartTime, expected) => {
        expect(snapItems(items, firstItemStartTime)).toEqual(expected)
    })
})
