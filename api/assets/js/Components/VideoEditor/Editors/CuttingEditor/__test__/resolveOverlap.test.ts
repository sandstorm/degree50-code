/**
 * @jest-environment jsdom
 */
import { resolveOverlapAndSnapItems } from '../util'
import { MediaItem } from '../../components/types'

describe('resolveOverlap()', () => {
    const itemA = new MediaItem<any>({
        start: '00:00:00.001',
        end: '00:00:05.000',
        text: '',
        color: null,
        lane: 0,
        memo: '',
        // we don't actually need this for our tests
        // @ts-ignore disable-line
        originalData: {},
        idFromPrototype: null,
    })
    const itemB = new MediaItem<any>({
        start: '00:00:04.000',
        end: '00:00:10.000',
        text: '',
        color: null,
        lane: 0,
        memo: '',
        // we don't actually need this for our tests
        // @ts-ignore disable-line
        originalData: {},
        idFromPrototype: null,
    })
    const itemC = new MediaItem<any>({
        start: '00:00:06.000',
        end: '00:00:15.000',
        text: '',
        color: null,
        lane: 0,
        memo: '',
        // we don't actually need this for our tests
        // @ts-ignore disable-line
        originalData: {},
        idFromPrototype: null,
    })
    const itemD = new MediaItem<any>({
        start: '00:00:01.000',
        end: '00:00:03.000',
        text: '',
        color: null,
        lane: 0,
        memo: '',
        // we don't actually need this for our tests
        // @ts-ignore disable-line
        originalData: {},
        idFromPrototype: null,
    })

    test.each([
        [
            [itemA, itemC, itemD],
            [
                new MediaItem<any>({
                    // former itemD
                    start: itemA.start,
                    end: '00:00:02.001',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemA
                    start: '00:00:02.011',
                    end: '00:00:07.010',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:07.020',
                    end: '00:00:16.020',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
            ],
        ],
        [
            [itemA, itemB],
            [
                itemA,
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:05.010',
                    end: '00:00:11.010',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
            ],
        ],
        [
            [itemA, itemC],
            [
                itemA,
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:05.010',
                    end: '00:00:14.010',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
            ],
        ],
        [
            [itemA, itemB, itemC, itemD],
            [
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:00.001',
                    end: '00:00:02.001',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:02.011',
                    end: '00:00:07.010',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:07.020',
                    end: '00:00:13.020',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:13.030',
                    end: '00:00:22.030',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
            ],
        ],
        [
            [itemB, itemD, itemC, itemA],
            [
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:00.001',
                    end: '00:00:02.001',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:02.011',
                    end: '00:00:07.010',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:07.020',
                    end: '00:00:13.020',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
                new MediaItem<any>({
                    // former itemC
                    start: '00:00:13.030',
                    end: '00:00:22.030',
                    text: '',
                    color: null,
                    lane: 0,
                    memo: '',
                    // we don't actually need this for our tests
                    // @ts-ignore disable-line
                    originalData: {},
                    idFromPrototype: null,
                }),
            ],
        ],
    ])('resolveOverlap(%p)', (items, expected) => {
        expect(resolveOverlapAndSnapItems(items)).toEqual(expected)
    })
})
