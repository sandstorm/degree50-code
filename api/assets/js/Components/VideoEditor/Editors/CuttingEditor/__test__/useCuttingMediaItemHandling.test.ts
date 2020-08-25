/**
 * @jest-environment jsdom
 */

// import for the jest.mock below
import { renderHook, act } from '@testing-library/react-hooks'

// import for the jest.mock below
import { useMediaItemHandling as useMediaItemHandlingMock } from '../../utils/hooks'

import { useCuttingMediaItemHandling } from '../util'

import { MediaItem } from '../../components/types'

const { useMediaItemHandling } = jest.requireActual('../../utils/hooks')

const originalUpdateMediaItemsSpy = jest.fn()

jest.mock('../../utils/hooks', () => {
    return {
        useMediaItemHandling: jest.fn((value) => {
            return {
                ...useMediaItemHandling(value),
                updateMediaItems: originalUpdateMediaItemsSpy,
            }
        }),
    }
})

describe('useCuttingMediaItemHandling()', () => {
    const setMediaItemsSpy = jest.fn()
    const updateCallbackSpy = jest.fn()
    const setPlayPositionSpy = jest.fn()

    const itemA = new MediaItem({
        start: '00:00:00.000',
        end: '00:00:05.000',
        text: 'Test',
        memo: 'Some test memo...',
        color: null,
        originalData: {
            start: '00:00:00.000',
            end: '00:00:05.000',
            color: null,
            text: 'Test',
            memo: 'Some test memo...',
            lane: 0,
            offset: 0,
            playbackRate: 1,
            url: '/some.mp4',
        },
        lane: 0,
    })

    const itemB = new MediaItem({
        start: '00:00:03.000',
        end: '00:00:05.000',
        text: 'Test',
        memo: 'Some test memo...',
        color: null,
        originalData: {
            start: '00:00:03.000',
            end: '00:00:05.000',
            color: null,
            text: 'Test',
            memo: 'Some test memo...',
            lane: 0,
            offset: 0,
            playbackRate: 1,
            url: '/some.mp4',
        },
        lane: 0,
    })

    const baseConfig = {
        userId: 'testUser',
        currentEditorId: 'testUser',
        mediaItems: [itemA],
        readOnly: false,
        setCutList: setMediaItemsSpy,
        updateCallback: updateCallbackSpy,
        playerSyncPlayPosition: 0,
        setPlayPosition: setPlayPositionSpy,
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('updateMediatems()', () => {
        it('should call originalUpdateCallback() with correct args', () => {
            // @ts-ignore
            const { result } = renderHook(() => useCuttingMediaItemHandling(baseConfig))

            act(() => {
                result.current.updateMediaItems([itemA, itemB])
            })

            expect(originalUpdateMediaItemsSpy).toHaveBeenCalledWith(
                [
                    new MediaItem({
                        start: '00:00:00.000',
                        end: '00:00:05.000',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            offset: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                    new MediaItem({
                        start: '00:00:05.010',
                        end: '00:00:07.010',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:03.000',
                            end: '00:00:05.000',
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            offset: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                ],
                true,
                false
            )
        })
    })

    describe('updateMediaItem()', () => {
        it('should do nothing, if item is not part of mediaItems', () => {
            // @ts-ignore
            const { result } = renderHook(() => useCuttingMediaItemHandling(baseConfig))

            act(() => {
                result.current.updateMediaItem(itemB, { start: '00:00:03.000' })
            })

            expect(originalUpdateMediaItemsSpy).not.toHaveBeenCalled()
        })

        it('it should update offset', () => {
            // @ts-ignore
            const { result } = renderHook(() => useCuttingMediaItemHandling(baseConfig))

            act(() => {
                result.current.updateMediaItem(itemA, { start: '00:00:03.000' })
            })

            expect(originalUpdateMediaItemsSpy).toHaveBeenCalledWith(
                [
                    new MediaItem({
                        start: '00:00:03.000',
                        end: '00:00:05.010',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            offset: 3,
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                ],
                true,
                false
            )
        })

        it('should adjust end with rounded duration < 1', () => {
            // @ts-ignore
            const { result } = renderHook(() => useCuttingMediaItemHandling(baseConfig))

            act(() => {
                result.current.updateMediaItem(itemA, { end: '00:00:00.000' })
            })

            expect(originalUpdateMediaItemsSpy).toHaveBeenCalledWith(
                [
                    new MediaItem({
                        start: '00:00:00.000',
                        end: '00:00:01.000',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            offset: 0,
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                ],
                true,
                false
            )
        })

        it('should adjust end with rounded duration > 1', () => {
            // @ts-ignore
            const { result } = renderHook(() => useCuttingMediaItemHandling(baseConfig))

            act(() => {
                result.current.updateMediaItem(itemA, { end: '00:00:03.056' })
            })

            expect(originalUpdateMediaItemsSpy).toHaveBeenCalledWith(
                [
                    new MediaItem({
                        start: '00:00:00.000',
                        end: '00:00:03.000',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            offset: 0,
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                ],
                true,
                false
            )

            act(() => {
                result.current.updateMediaItem(itemA, { end: '00:00:03.556' })
            })

            expect(originalUpdateMediaItemsSpy).toHaveBeenCalledWith(
                [
                    new MediaItem({
                        start: '00:00:00.000',
                        end: '00:00:04.000',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            offset: 0,
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                ],
                true,
                false
            )
        })
    })

    describe('handleSplitAtCursor()', () => {
        it('should correctly split item', () => {
            const { result } = renderHook(() =>
                // @ts-ignore
                useCuttingMediaItemHandling({
                    ...baseConfig,
                    playerSyncPlayPosition: 2,
                })
            )

            act(() => {
                result.current.handleSplitAtCursor()
            })

            expect(originalUpdateMediaItemsSpy).toHaveBeenCalledWith(
                [
                    new MediaItem({
                        start: '00:00:00.000',
                        end: '00:00:02.000',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            offset: 0,
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                    new MediaItem({
                        start: '00:00:02.010',
                        end: '00:00:05.000',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            offset: 2,
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                ],
                true,
                false
            )
        })
    })

    describe('duplicateCut()', () => {
        it('should correctly append copy of item at index', () => {
            // @ts-ignore
            const { result } = renderHook(() => useCuttingMediaItemHandling(baseConfig))

            act(() => {
                result.current.duplicateCut(0)
            })

            expect(originalUpdateMediaItemsSpy).toHaveBeenCalledWith(
                [
                    itemA,
                    new MediaItem({
                        start: '00:00:05.010',
                        end: '00:00:10.000',
                        text: 'Test',
                        memo: 'Some test memo...',
                        color: null,
                        originalData: {
                            start: '00:00:00.000',
                            end: '00:00:05.000',
                            color: null,
                            text: 'Test',
                            memo: 'Some test memo...',
                            lane: 0,
                            offset: 0,
                            playbackRate: 1,
                            url: '/some.mp4',
                        },
                        lane: 0,
                    }),
                ],
                true,
                false
            )
        })
    })
})
