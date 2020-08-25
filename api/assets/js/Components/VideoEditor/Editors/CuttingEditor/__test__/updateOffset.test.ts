/**
 * @jest-environment jsdom
 */
import { MediaItem } from '../../components/types'
import { updateOffset } from '../util'

describe('updateOffset()', () => {
    const itemA = new MediaItem({
        start: '00:00:00.000',
        end: '00:00:05.000',
        text: 'Test',
        memo: 'Some test memo...',
        color: null,
        originalData: {
            color: null,
            offset: 10,
            start: '00:00:00.000',
            end: '00:00:05.000',
            text: 'Test',
            memo: 'Some test memo...',
            url: '/some/test.mp4',
            playbackRate: 1,
        },
        lane: 0,
    })

    it('should return original offset, if it was neither dragged on right or left handle', () => {
        const result = updateOffset(itemA, '00:00:03.000', '00:00:08.000')

        expect(result).toBe(itemA.originalData.offset)
    })

    it('should return 0, if left handle was dragged and new offset would be below 0', () => {
        const result = updateOffset(
            Object.assign(itemA.clone, {
                ...itemA,
                start: '00:00:04.000',
                originalData: { ...itemA.originalData, offset: 0 },
            }),
            '00:00:03.000',
            undefined
        )

        expect(result).toBe(0)
    })

    it('should return correct new offset, if left handle was dragged left', () => {
        const result = updateOffset(itemA, '00:00:03.000', undefined)

        expect(result).toBe(13)
    })

    it('should return correct new offset, if left handle was dragged right', () => {
        const result = updateOffset(
            Object.assign(itemA.clone, { ...itemA, start: '00:00:04.000' }),
            '00:00:03.000',
            undefined
        )

        expect(result).toBe(9)
    })
})
